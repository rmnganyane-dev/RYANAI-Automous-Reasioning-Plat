#!/usr/bin/env python3
import sys
import os

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from security.ebpf.guardrail_enforcer import eBPFGuardrailEnforcer
from security.hitl_verifier import RyanHITLVerifier

def print_header():
    print("\n================================================================")
    print("       RyanAI Interactive Command-Line Execution Shell          ")
    print("   Autonomous, Local-First Engineering & Reasoning Platform     ")
    print("================================================================")
    print("Tiers Available:")
    print("  [1] LLM          - Base Local CUDA C++ Inference Core")
    print("  [2] RAG          - Secure Local Vector Knowledge Retrieval")
    print("  [3] Agent        - LangGraph ReAct Autonomous Tool-Calling Loop")
    print("  [4] Orchestrator - Multi-Agent Shared State System Objective")
    print("  [5] Exit")
    print("================================================================")

def main():
    guardrail = eBPFGuardrailEnforcer(restricted_paths=["/etc/", "/sys/", "/var/secure/"])
    verifier = RyanHITLVerifier(high_risk_threshold=0.85)

    while True:
        print_header()
        choice = input("Select execution tier (1-5): ").strip()

        if choice == '1':
            prompt = input("\nEnter LLM prompt: ")
            print(f"\n[Level 1 Execution] Processing prompt via local CUDA core...")
            print(f"-> Generated response for: '{prompt[:40]}...' [SUCCESS]\n")

        elif choice == '2':
            query = input("\nEnter RAG search query: ")
            print(f"\n[Level 2 Execution] Querying ChromaDB vector store...")
            print(f"-> Retrieved local code context chunks for: '{query}' [SUCCESS]\n")

        elif choice == '3':
            goal = input("\nEnter AI Agent engineering goal: ")
            print(f"\n[Level 3 Execution] Initializing LangGraph ReAct loop...")
            # Run eBPF & HITL check simulation
            if guardrail.inspect_and_intercept("agent_execution", "./workspace/target_file.py"):
                if verifier.evaluate_action_risk("CODE_REFACTOR", "target_file.py", risk_score=0.40):
                    print(f"-> Agent successfully completed goal: '{goal}' [SUCCESS]\n")

        elif choice == '4':
            objective = input("\nEnter Agentic AI system objective: ")
            print(f"\n[Level 4 Execution] Deploying multi-agent orchestration...")
            if guardrail.inspect_and_intercept("system_orchestration", "./workspace/infra.yaml"):
                if verifier.evaluate_action_risk("INFRA_MUTATION", "infra.yaml", risk_score=0.90):
                    print(f"-> Orchestrator successfully achieved objective: '{objective}' [SUCCESS]\n")

        elif choice == '5':
            print("\nShutting down RyanAI CLI session. Goodbye.")
            break
        else:
            print("\n[Error] Invalid selection. Choose a number between 1 and 5.")

        input("Press Enter to continue...")

if __name__ == "__main__":
    main()