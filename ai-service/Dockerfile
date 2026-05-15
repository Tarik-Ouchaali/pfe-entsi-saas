# ============================================================
#  ENTSI — Dockerfile FastAPI (Python 3.11)
#  Path: ai-service/Dockerfile
# ============================================================

FROM python:3.11-slim

# ------------------------------------------------------------
# System dependencies (PDF processing)
# ------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    # PDF tools
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-ara \
    tesseract-ocr-fra \
    libjpeg-dev \
    libpng-dev \
    libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------
# Working directory
# ------------------------------------------------------------
WORKDIR /app

# ------------------------------------------------------------
# Python dependencies (cache layer)
# ------------------------------------------------------------
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ------------------------------------------------------------
# Copy application source
# ------------------------------------------------------------
COPY . .

# ------------------------------------------------------------
# Shared storage (volume Laravel ↔ FastAPI)
# ------------------------------------------------------------
RUN mkdir -p /var/shared-storage/uploads \
             /var/shared-storage/outputs

# ------------------------------------------------------------
# Non-root user (sécurité)
# ------------------------------------------------------------
RUN addgroup --system entsi && \
    adduser --system --ingroup entsi entsi && \
    chown -R entsi:entsi /app

USER entsi

# ------------------------------------------------------------
# Port
# ------------------------------------------------------------
EXPOSE 8000

# ------------------------------------------------------------
# Health check
# ------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# ------------------------------------------------------------
# Start FastAPI with Uvicorn
# ------------------------------------------------------------
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]