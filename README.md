```markdown
# RyanAI: Autonomous Reasoning Platform

RyanAI is a high-performance autonomous reasoning agent system designed for desktop and web execution. It pairs a responsive React/TypeScript frontend with a secure Rust Tauri shell, optional Supabase authentication and persistence, and a local reasoning fallback for development.

---

## **Architecture & Tech Stack**

* **Desktop Shell:** Tauri v2 (Rust backend & native webview)
* **Frontend:** React, TypeScript, Vite
* **Authentication & Persistence:** Supabase Auth, PostgreSQL, and row-level security
* **Orchestration & AI:** Local reasoning workflow with modular provider integration points
* **Packaging & Distribution:** Native Windows NSIS and MSI installers via Tauri bundler

---

## **Project Structure**

```text
├── src/                  # React frontend application (Vite + TypeScript)
├── src-tauri/            # Tauri v2 Rust core, configurations, and native bindings
│   └── src/              # Rust application code and native bindings
├── supabase/migrations/  # Auth, profiles, conversations, messages, and memory schema
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

### **Supabase Authentication**

1. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Apply the migration in `supabase/migrations/` to your Supabase project.
3. Enable Email and Google providers in Supabase Authentication.
4. Add `http://localhost:5173`, `http://localhost:4173`, and your deployed origin to the Supabase redirect URL allowlist.
5. Create Google OAuth credentials and use the Supabase callback URL shown in the Google provider settings.

Without Supabase variables, RyanAI starts in local mode and stores conversations in the browser. Email/password accounts and Google sign-in become available automatically when the variables are configured.

### **Building Native Installers**

Execute the automated PowerShell build script to install dependencies, validate the frontend, compile the Tauri binary, and generate native release packages:

```powershell
.\build-installer.ps1

```

Generated installation bundles are output to:

* **NSIS Setup Installer:** `src-tauri/target/release/bundle/nsis/RyanAI_0.1.0_x64-setup.exe`
* **MSI Package:** `src-tauri/target/release/bundle/msi/RyanAI_0.1.0_x64_en-US.msi`
* **Standalone Executable:** `src-tauri/target/release/ryan-app.exe`

```

```