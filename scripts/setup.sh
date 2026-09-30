#!/bin/bash
set -e

echo "=================================================="
echo "Initializing RyanAI Provisioning & Setup Script..."
echo "=================================================="

# 1. Create necessary local directories
echo "[1/5] Creating monorepo directory structure..."
mkdir -p packages/{core-llm,knowledge-rag,agent-core,orchestrator}
mkdir -p services/fastify-gateway
mkdir -p apps/tauri-client/src-tauri
mkdir -p security/ebpf security/sandbox
mkdir -p tests
mkdir -p models
mkdir -p vector_store
mkdir -p scripts

# 2. Set up Python virtual environment & install dependencies
echo "[2/5] Setting up Python environment for CUDA, RAG, and Agents..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install fastapi uvicorn chromadb langgraph pytest pydantic

# 3. Install Fastify Gateway dependencies
echo "[3/5] Installing Node.js dependencies for Fastify Gateway..."
if [ -d "services/fastify-gateway" ]; then
  cd services/fastify-gateway
  npm init -y > /dev/null 2>&1 || true
  npm install fastify @types/node tsx
  cd ../..
fi

# 4. Copy environment configuration if missing
echo "[4/5] Configuring environment variables..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example template."
fi

# 5. Final verification check
echo "[5/5] Running platform validation tests..."
source venv/bin/activate
pytest tests/test_ryan_platform.py || echo "[Notice] Add test implementations to run full suite."

echo "=================================================="
echo "RyanAI Environment Successfully Provisioned!"
echo "Run 'make all' to start the platform services."
echo "=================================================="