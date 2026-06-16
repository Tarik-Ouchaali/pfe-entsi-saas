# ============================================================
#  ENTSI — AI Service main.py
#  Path: ai-service/main.py
# ============================================================

import os
import json
import hmac
import hashlib
import asyncio
import httpx
import re
from pathlib import Path
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ------------------------------------------------------------
# Config
# ------------------------------------------------------------
SHARED_STORAGE_PATH = os.getenv("SHARED_STORAGE_PATH", "/var/shared-storage")
WEBHOOK_SECRET      = os.getenv("WEBHOOK_SECRET", "change_me_strong_secret_key")
GEMINI_API_KEY      = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL        = "deepseek/deepseek-chat"

# إيلا بغيتي خيار احتياطي د Google متاح 100% دبا:
# GEMINI_MODEL        = "google/gemma-2-9b-it:free"

GEMINI_API_URL      = "https://openrouter.ai/api/v1/chat/completions"

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
    projet_id: int
    file_path: str
    entreprise_id: int
    webhook_url: str

class ConformiteRequest(BaseModel):
    projet_id: int
    entreprise_id: int
    exigences: list[dict]   # [{ id, type, description, est_obligatoire }]
    documents: list[dict]   # [{ id, titre, categorie, chemin_fichier, date_expiration }]
    webhook_url: str

class MemoireRequest(BaseModel):
    projet_id: int
    entreprise_id: int
    contexte: dict   # { titre_projet, resume_dao, raison_sociale, ice, exigences, documents_disponibles }
    webhook_url: str

class WebhookAnalysePayload(BaseModel):
    projet_id: int
    entreprise_id: int
    statut: str             # "success" | "error"
    result: dict | None = None
    error: str | None = None

class WebhookConformitePayload(BaseModel):
    projet_id: int
    entreprise_id: int
    statut: str
    score_global: float | None = None
    resume_conformite: str | None = None
    matchings: list[dict] | None = None
    error: str | None = None

class WebhookMemoirePayload(BaseModel):
    projet_id: int
    entreprise_id: int
    statut: str
    contenu: str | None = None
    chemin_export: str | None = None
    error: str | None = None

# ------------------------------------------------------------
# HMAC Helper
# ------------------------------------------------------------
def generate_hmac_signature(payload: str) -> str:
    """Génère signature HMAC SHA256 pour webhook Laravel."""
    return hmac.new(
        WEBHOOK_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

# ------------------------------------------------------------
# Webhook Helper — DRY
# ------------------------------------------------------------
async def send_webhook(webhook_url: str, payload_json: str) -> None:
    """Envoie webhook HMAC-signé vers Laravel."""
    signature = generate_hmac_signature(payload_json)
    async with httpx.AsyncClient() as client:
        await client.post(
            webhook_url,
            content=payload_json,
            headers={
                "Content-Type": "application/json",
                "X-Webhook-Signature": signature,
            },
            timeout=30.0,
        )

# ------------------------------------------------------------
# PDF Text Extraction Helper
# ------------------------------------------------------------
def extract_text_from_pdf(file_path: Path) -> str:
    """Extrait le texte d'un PDF via PyMuPDF."""
    import fitz
    doc = fitz.open(str(file_path))
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

# ------------------------------------------------------------
# Gemini API Helper
# ------------------------------------------------------------
# ------------------------------------------------------------
# Gemini API Helper — Avec Retry & Fallback automatique
# ------------------------------------------------------------
# ------------------------------------------------------------
# Gemini API Helper — Avec Retry Intelligent
# ------------------------------------------------------------
async def call_gemini(prompt: str) -> str:
    """
    Appelle Gemini via OpenRouter avec des headers complets.
    """
    max_retries = 3
    delay = 2.0 
    
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY.strip()}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",  # إجبارية ف بعض الحسابات ف OpenRouter
        "X-Title": "ENTSI PFE Application",
    }
    
    payload = {
        "model": GEMINI_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }
    
    for attempt in range(max_retries):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    GEMINI_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=120.0,
                )
                
                if response.status_code != 200:
                    print(f"❌ [OpenRouter Error Detail] Status {response.status_code}: {response.text}")
                
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        await asyncio.sleep(delay)
                        delay *= 2
                        continue
                        
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
                
            except httpx.HTTPStatusError as e:
                if response.status_code != 429 or attempt == max_retries - 1:
                    raise e
                    
    raise Exception("OpenRouter API error persistant.")
# ------------------------------------------------------------
# Background Task — analyse PDF
# ------------------------------------------------------------
async def process_analyse(
    projet_id: int,
    file_path: str,
    entreprise_id: int,
    webhook_url: str,
):
    """
    1. Lire le PDF depuis shared-storage
    2. Extraire le texte (PyMuPDF)
    3. Envoyer au Gemini pour analyse DAO
    4. Notifier Laravel via Webhook (HMAC)
    """
    try:
        full_path = Path(SHARED_STORAGE_PATH) / file_path

        if not full_path.exists():
            raise FileNotFoundError(f"Fichier introuvable: {full_path}")

        text = extract_text_from_pdf(full_path)

        prompt = (
            "Tu es un expert en marchés publics marocains.\n"
            "Analyse ce document DAO et extrais toutes les exigences administratives et techniques.\n\n"
            f"Texte du DAO (premiers 50000 caractères):\n{text[:50000]}\n\n"
            "Retourne UNIQUEMENT un JSON valide avec la structure suivante :\n"
            "Format attendu :\n"
            "{\n"
            '  "resume_global": "résumé en 2-3 phrases",\n'
            '  "exigences": [\n'
            "    {\n"
            '      "type": "administratif" ou "technique",\n'
            '      "description": "description de l\'exigence",\n'
            '      "est_obligatoire": true ou false\n'
            "    }\n"
            "  ]\n"
            "}"
        )
        gemini_response = await call_gemini(prompt)
        
        # --- التعديل هنا: تنقية الجواب قبل الـ Loading ---
        cleaned_response = gemini_response.strip()
        
        # إزالة علامات الماركداون إذا كانت موجودة (مثلا ```json ... ```)
        if cleaned_response.startswith("```"):
            # إزالة السطر الأول (```json) وإزالة السطور الأخيرة (```)
            lines = cleaned_response.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned_response = "\n".join(lines).strip()

        try:
            parsed = json.loads(cleaned_response)
        except json.JSONDecodeError:
            # إذا فشل الـ parsing، غادي نلوحو Error مخصص باش الـ Webhook يوصل للارافيل
            # بلا ما يوقف الخدمة كاع
            raise ValueError(f"Impossible de parser la réponse de l'IA. Réponse reçue: {gemini_response[:100]}...")

        payload = WebhookAnalysePayload(
            projet_id=projet_id,
            entreprise_id=entreprise_id,
            statut="success",
            result=parsed,
        )
        await send_webhook(webhook_url, payload.model_dump_json())

    except Exception as e:
        payload = WebhookAnalysePayload(
            projet_id=projet_id,
            entreprise_id=entreprise_id,
            statut="error",
            error=str(e),
        )
        await send_webhook(webhook_url, payload.model_dump_json())

# ------------------------------------------------------------
# Background Task — conformité
# ------------------------------------------------------------
async def process_conformite(
    projet_id: int,
    entreprise_id: int,
    exigences: list[dict],
    documents: list[dict],
    webhook_url: str,
):
    """
    Pour chaque exigence → matching IA avec documents.
    CV: extraction texte. Autres: metadata kafi (titre + categorie + date_expiration).
    """
    try:
        # 1. Extraction dial l-text ghir l-documents dial l-CV
        for doc in documents:
            if doc.get("categorie") == "cv":
                full_path = Path(SHARED_STORAGE_PATH) / doc["chemin_fichier"]
                if full_path.exists():
                    doc["contenu"] = extract_text_from_pdf(full_path)[:10000]
                else:
                    doc["contenu"] = None
            else:
                doc["contenu"] = None  # metadata kafi: titre + categorie + date_expiration

        # 2. Preparation dial l-Prompt l-AI
        prompt = f"""
Tu es un expert en marchés publics marocains.
Analyse la conformité entre ces exigences et ces documents disponibles.

Exigences du DAO:
{json.dumps(exigences, ensure_ascii=False)}

Documents disponibles de l'entreprise:
{json.dumps(documents, ensure_ascii=False)}

Règles:
- "conforme": document trouvé, correspondant, et non expiré
- "expire": document trouvé mais date_expiration dépassée
- "manquant": aucun document correspondant trouvé
- Pour les CV: analyse le contenu pour vérifier les compétences requises

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{{
  "score_global": 75.0,
  "resume_conformite": "X exigences conformes sur Y",
  "matchings": [
    {{
      "exigence_id": 1,
      "document_id": 10,
      "statut": "conforme" | "expire" | "manquant",
      "justification": "explication courte"
    }}
  ]
}}
"""
        # 3. Appeler Gemini API
        gemini_response = await call_gemini(prompt)

        # --- HNA FIN GHADIN NZIDO L-CLEANING DIAL L-JSON ---
        match = re.search(r'\{.*\}', gemini_response, re.DOTALL)
        
        if match:
            clean_response = match.group(0)
        else:
            raise ValueError("No JSON object found in Gemini response")
        
        try:
            parsed = json.loads(clean_response)
        except json.JSONDecodeError as je:
            # Ila b9a chi mouchkil, n-loggiw l-reponse nichen bach t-choufha f `docker logs`
            print(f"FAILED TO PARSE GEMINI RESPONSE: {clean_response}")
            raise RuntimeError(f"Gemini output non-valide JSON: {str(je)}")

        # 4. Preparation dial l-Payload dict
        webhook_data = {
            "projet_id": projet_id,
            "entreprise_id": entreprise_id,
            "statut": "success",
            "score_global": parsed["score_global"],
            "resume_conformite": parsed["resume_conformite"],
            "matchings": parsed["matchings"],
            "error": None
        }
        
        # 5. Serialization strict dial l-JSON (Bla spaces + sort keys)
        clean_json_payload = json.dumps(webhook_data, separators=(',', ':'), sort_keys=True)
        
        # 6. l-7isab dial l-HMAC Signature bach t-matchi 100% m3a Laravel Middleware
        custom_signature = hmac.new(
            WEBHOOK_SECRET.encode('utf-8'),
            clean_json_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # 7. Envoi dial l-Webhook nichen b httpx
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "X-Webhook-Signature": custom_signature
        }

        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, content=clean_json_payload, headers=headers)

    except Exception as e:
        # 8. Gestion dial l-Erreur: Envoi payload dial l-error m9add 7ta houwa b t-Signature
        webhook_data = {
            "projet_id": projet_id,
            "entreprise_id": entreprise_id,
            "statut": "error",
            "score_global": 0,
            "resume_conformite": "Erreur lors de l'analyse de conformite",
            "matchings": [],
            "error": str(e)
        }
        
        clean_json_payload = json.dumps(webhook_data, separators=(',', ':'), sort_keys=True)
        
        custom_signature = hmac.new(
            WEBHOOK_SECRET.encode('utf-8'),
            clean_json_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "X-Webhook-Signature": custom_signature
        }
        
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, content=clean_json_payload, headers=headers)

    except Exception as e:
        # 8. Gestion dial l-Erreur: Envoi payload dial l-error m9add 7ta houwa b t-Signature
        webhook_data = {
            "projet_id": projet_id,
            "entreprise_id": entreprise_id,
            "statut": "error",
            "score_global": 0,
            "resume_conformite": "Erreur lors de l'analyse de conformite",
            "matchings": [],
            "error": str(e)
        }
        
        clean_json_payload = json.dumps(webhook_data, separators=(',', ':'), sort_keys=True)
        
        custom_signature = hmac.new(
            WEBHOOK_SECRET.encode('utf-8'),
            clean_json_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "X-Webhook-Signature": custom_signature
        }
        
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, content=clean_json_payload, headers=headers)

# ------------------------------------------------------------
# Background Task — mémoire technique
# ------------------------------------------------------------
async def process_memoire(
    projet_id: int,
    entreprise_id: int,
    contexte: dict,
    webhook_url: str,
):
    """
    Génère mémoire technique via Gemini + export PDF reportlab.
    """
    try:
        prompt = f"""
Tu es un expert en marchés publics marocains.
Génère un mémoire technique professionnel et complet pour répondre à cet appel d'offres.

Informations:
- Projet: {contexte['titre_projet']}
- Entreprise: {contexte['raison_sociale']} (ICE: {contexte['ice']})
- Résumé DAO: {contexte['resume_dao']}
- Exigences extraites du DAO: {json.dumps(contexte['exigences'], ensure_ascii=False)}
- Documents réels de l'entreprise disponibles: {json.dumps(contexte['documents_disponibles'], ensure_ascii=False)}

CONSIGNE MVP IMPORTANTE (Si les documents de l'entreprise sont vides ou insuffisants):
Si l'array 'documents_disponibles' est vide, NE CRASH PAS et ne refuse pas la tâche. 
Génère quand même TOUTES les sections demandées ci-dessous en utilisant des données fictives réalistes de test ou des balises textuelles comme "[À compléter: Insérer les CV de l'équipe technique ici]" pour que le document reste structurellement parfait.

Structure requise du mémoire:
1. Présentation de l'entreprise
2. Compréhension du projet
3. Méthodologie d'exécution
4. Références similaires
5. Moyens humains et techniques
6. Planning d'exécution

Retourne UNIQUEMENT un JSON valide avec cette structure exacte, sans markdown additionnel ni texte hors du JSON:
{{
  "contenu": "texte complet du mémoire avec toutes les sections",
  "sections": [
    {{
      "titre": "1. Présentation de l'entreprise",
      "contenu": "..."
    }}
  ]
}}
"""
        gemini_response = await call_gemini(prompt)
        
        # ---- 1. CLEANING CODE BLOCK (Anti-Crash Markdown) ----
        cleaned_response = gemini_response.strip()
        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        # ------------------------------------------------------

        # Daba ghadi ndiro loads l cleaned_response machi gemini_response direct
        parsed = json.loads(cleaned_response)

        # Generate PDF with reportlab
        import uuid as uuid_module
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.enums import TA_JUSTIFY

        pdf_dir = Path(SHARED_STORAGE_PATH) / "memoires" / str(entreprise_id)
        pdf_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = f"{uuid_module.uuid4()}.pdf"
        pdf_path = pdf_dir / pdf_filename
        chemin_export = f"memoires/{entreprise_id}/{pdf_filename}"

        doc_pdf = SimpleDocTemplate(
            str(pdf_path),
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            "Title", parent=styles["Title"], fontSize=16, spaceAfter=20,
        )
        story.append(Paragraph(f"Mémoire Technique — {contexte['titre_projet']}", title_style))
        story.append(Spacer(1, 0.5 * cm))

        # Sections
        for section in parsed.get("sections", []):
            story.append(Paragraph(section["titre"], styles["Heading2"]))
            story.append(Spacer(1, 0.3 * cm))
            body_style = ParagraphStyle(
                "Body", parent=styles["Normal"],
                fontSize=11, leading=16, alignment=TA_JUSTIFY,
            )
            story.append(Paragraph(section["contenu"].replace("\n", "<br/>"), body_style))
            story.append(Spacer(1, 0.5 * cm))

        doc_pdf.build(story)

        payload = WebhookMemoirePayload(
            projet_id=projet_id,
            entreprise_id=entreprise_id,
            statut="success",
            contenu=parsed["contenu"],
            chemin_export=chemin_export,
        )
        await send_webhook(webhook_url, payload.model_dump_json())

    except Exception as e:
        payload = WebhookMemoirePayload(
            projet_id=projet_id,
            entreprise_id=entreprise_id,
            statut="error",
            error=str(e),
        )
        await send_webhook(webhook_url, payload.model_dump_json())

# ------------------------------------------------------------
# Routes
# ------------------------------------------------------------

@app.get("/health")
async def health_check():
    """Health check — Docker + docker-compose."""
    return {"status": "ok", "service": "entsi-ai-service"}


@app.post("/analyse", status_code=202)
async def analyze_dossier(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
):
    """Reçoit file_path → analyse PDF → webhook résultats."""
    background_tasks.add_task(
        process_analyse,
        projet_id=request.projet_id,
        file_path=request.file_path,
        entreprise_id=request.entreprise_id,
        webhook_url=request.webhook_url,
    )
    return {
        "message": "Analyse lancée",
        "projet_id": request.projet_id,
        "statut": "processing",
    }


@app.post("/conformite", status_code=202)
async def verifier_conformite(
    request: ConformiteRequest,
    background_tasks: BackgroundTasks,
):
    """Reçoit exigences + documents → matching IA → webhook résultats."""
    background_tasks.add_task(
        process_conformite,
        projet_id=request.projet_id,
        entreprise_id=request.entreprise_id,
        exigences=request.exigences,
        documents=request.documents,
        webhook_url=request.webhook_url,
    )
    return {
        "message": "Conformité lancée",
        "projet_id": request.projet_id,
        "statut": "processing",
    }


@app.post("/memoire", status_code=202)
async def generer_memoire(
    request: MemoireRequest,
    background_tasks: BackgroundTasks,
):
    """Reçoit contexte → génère mémoire technique + PDF → webhook résultats."""
    background_tasks.add_task(
        process_memoire,
        projet_id=request.projet_id,
        entreprise_id=request.entreprise_id,
        contexte=request.contexte,
        webhook_url=request.webhook_url,
    )
    return {
        "message": "Génération lancée",
        "projet_id": request.projet_id,
        "statut": "processing",
    }