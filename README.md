```markdown
# RyanAI: Autonomous Reasoning Platform

RyanAI is a high-performance autonomous reasoning agent system designed for desktop and multi-interface execution. Engineered with a modular architecture, it pairs a responsive React/TypeScript frontend with a secure Rust Tauri shell and an integrated Fastify gateway sidecar.

---

## **Architecture & Tech Stack**

* **Desktop Shell:** Tauri v2 (Rust backend & native webview)
* **Frontend:** React, TypeScript, Vite
* **Backend Gateway:** Node.js, Fastify microservice sidecar (`ryan-gateway`)
* **Orchestration & AI:** LangGraph ReAct reasoning workflows, modular inference integrations
* **Packaging & Distribution:** Native Windows NSIS and MSI installers via Tauri bundler

---

## **Project Structure**

```text
├── src/                  # React frontend application (Vite + TypeScript)
├── src-tauri/            # Tauri v2 Rust core, configurations, and native bindings
│   ├── binaries/         # Compiled Fastify gateway sidecar executables
│   └── src/              # Rust application code & sidecar lifecycle hooks
├── gateway/              # Fastify backend gateway & agent communication service
└── build-installer.ps1   # Automated PowerShell release build & packaging script

```

---

## **Getting Started & Development**

### **Prerequisites**

* Node.js (v18+) & npm
* Rust toolchain (`rustc`, `cargo`)

### **Local Development**

Launch the development environment with hot-reloading:

```bash
npm install
npm run tauri dev

```

### **Building Native Installers**

Execute the automated PowerShell build script to compile the frontend, verify or build the Fastify gateway sidecar, compile the Tauri binary, and generate native release packages:

```powershell
.\build-installer.ps1

```

Generated installation bundles are output to:

* **NSIS Setup Installer:** `src-tauri/target/release/bundle/nsis/RyanAI_0.1.0_x64-setup.exe`
* **MSI Package:** `src-tauri/target/release/bundle/msi/RyanAI_0.1.0_x64_en-US.msi`
* **Standalone Executable:** `src-tauri/target/release/app.exe`

```

```