# ============================================================
#  ENTSI — AI Service main.py
#  Path: ai-service/main.py
# ============================================================

import os
import hmac
import hashlib
import httpx
from pathlib import Path
from fastapi import FastAPI, BackgroundTasks, HTTPException, Header
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ------------------------------------------------------------
# Config
# ------------------------------------------------------------
SHARED_STORAGE_PATH = os.getenv("SHARED_STORAGE_PATH", "/var/shared-storage")
LARAVEL_WEBHOOK_URL = os.getenv("LARAVEL_WEBHOOK_URL", "http://laravel/api/webhook/analysis-done")
WEBHOOK_SECRET      = os.getenv("WEBHOOK_SECRET", "change_me_strong_secret_key")

# ------------------------------------------------------------
# App
# ------------------------------------------------------------
app = FastAPI(
    title="ENTSI AI Service",
    description="Microservice IA — Analyse PDF dossiers AO",
    version="1.0.0",
)

# ------------------------------------------------------------
# Schemas
# ------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    dossier_id: int
    file_path: str        # Chemin dans shared-storage (pas le PDF complet)
    company_id: int
    callback_url: str | None = None

class WebhookPayload(BaseModel):
    dossier_id: int
    company_id: int
    status: str           # "completed" | "failed"
    result: dict | None = None
    error: str | None = None

# ------------------------------------------------------------
# HMAC Helper — sécuriser webhook vers Laravel
# ------------------------------------------------------------
def generate_hmac_signature(payload: str) -> str:
    return hmac.new(
        WEBHOOK_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

# ------------------------------------------------------------
# Background Task — analyse PDF
# ------------------------------------------------------------
async def process_dossier(dossier_id: int, file_path: str, company_id: int):
    """
    1. Lire le PDF depuis shared-storage
    2. Extraire le texte (PyMuPDF / pdfplumber)
    3. Envoyer au LLM pour analyse conformité
    4. Notifier Laravel via Webhook (HMAC)
    """
    try:
        full_path = Path(SHARED_STORAGE_PATH) / file_path

        # Vérifier que le fichier existe
        if not full_path.exists():
            raise FileNotFoundError(f"Fichier introuvable: {full_path}")

        # --- Étape 1 : Extraction texte PDF ---
        import fitz  # PyMuPDF
        doc = fitz.open(str(full_path))
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        # --- Étape 2 : Analyse conformité (placeholder LLM) ---
        # TODO: remplacer par appel OpenAI / Mistral
        result = {
            "dossier_id": dossier_id,
            "pages": len(doc),
            "text_length": len(text),
            "conformite": "en_attente_llm",   # placeholder
            "sections_detectees": [],
        }

        # --- Étape 3 : Webhook → Laravel ---
        payload = WebhookPayload(
            dossier_id=dossier_id,
            company_id=company_id,
            status="completed",
            result=result,
        )
        payload_json = payload.model_dump_json()
        signature = generate_hmac_signature(payload_json)

        async with httpx.AsyncClient() as client:
            await client.post(
                LARAVEL_WEBHOOK_URL,
                content=payload_json,
                headers={
                    "Content-Type": "application/json",
                    "X-ENTSI-Signature": signature,
                },
                timeout=30.0,
            )

    except Exception as e:
        # Notifier Laravel de l'échec
        payload = WebhookPayload(
            dossier_id=dossier_id,
            company_id=company_id,
            status="failed",
            error=str(e),
        )
        payload_json = payload.model_dump_json()
        signature = generate_hmac_signature(payload_json)

        async with httpx.AsyncClient() as client:
            await client.post(
                LARAVEL_WEBHOOK_URL,
                content=payload_json,
                headers={
                    "Content-Type": "application/json",
                    "X-ENTSI-Signature": signature,
                },
                timeout=30.0,
            )

# ------------------------------------------------------------
# Routes
# ------------------------------------------------------------

@app.get("/health")
async def health_check():
    """Health check — utilisé par Docker + docker-compose"""
    return {"status": "ok", "service": "entsi-ai-service"}


@app.post("/analyze", status_code=202)
async def analyze_dossier(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
):
    """
    Reçoit file_path depuis Laravel (pas le PDF complet).
    Lance l'analyse en arrière-plan (async).
    Répond immédiatement 202 Accepted.
    """
    background_tasks.add_task(
        process_dossier,
        dossier_id=request.dossier_id,
        file_path=request.file_path,
        company_id=request.company_id,
    )
    return {
        "message": "Analyse lancée",
        "dossier_id": request.dossier_id,
        "status": "processing",
    }