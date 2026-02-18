# BUILD
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
COPY setup.sh .

RUN chmod +x setup.sh && \
    ./setup.sh


# RUNTIME
FROM python:3.12-slim

RUN useradd -m -u 1000 appuser

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv

COPY --chown=appuser:appuser . .

ENV PATH="/opt/venv/bin:$PATH"

USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]