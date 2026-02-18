#!/bin/bash
set -e

apt-get update
apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3-dev \
    libffi-dev

rm -rf /var/lib/apt/lists/*

python -m venv /opt/venv

# Ativa o ambiente virtual
. /opt/venv/bin/activate

pip install --no-cache-dir --upgrade pip setuptools wheel

pip install --no-cache-dir -r /app/requirements.txt
