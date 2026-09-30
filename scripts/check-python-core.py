#!/usr/bin/env python3
"""
scripts/check-python-core.py - Validate Python core modules
"""
import sys
import subprocess

def check_module(module_name, package_name=None):
    """Check if Python module exists"""
    pkg = package_name or module_name
    try:
        __import__(module_name)
        print(f"✓ {pkg}")
        return True
    except ImportError:
        print(f"✗ {pkg}")
        return False

def main():
    print("🐍 Checking Python dependencies...\n")
    
    modules = [
        ('langgraph', 'LangGraph'),
        ('chromadb', 'ChromaDB'),
        ('fastapi', 'FastAPI'),
        ('prisma', 'Prisma'),
        ('pydantic', 'Pydantic'),
        ('openai', 'OpenAI'),
    ]
    
    passed = sum(check_module(m, p) for m, p in modules)
    total = len(modules)
    
    print(f"\n{passed}/{total} Python packages installed")
    
    if passed < total:
        print("\n📦 Install missing packages:")
        print("pip install langgraph chromadb fastapi prisma pydantic openai")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
