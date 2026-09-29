# Multi-stage Dockerfile for BioCopilot
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and data
COPY backend ./backend
COPY config ./config
COPY data ./data

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Initialize benchmark data and train ML models
RUN python backend/app/utils/generate_benchmark_data.py && \
    python backend/app/utils/process_and_audit_data.py && \
    python backend/app/ml/trainer.py

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
