# RyanAI: Autonomous Reasoning Platform

RyanAI is a desktop and web autonomous reasoning platform. It combines a React/TypeScript interface, a Tauri v2 desktop shell, optional Supabase authentication and persistence, and a local reasoning fallback that works without external credentials.

## Architecture

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Desktop:** Tauri v2 with Rust
- **Authentication and persistence:** Supabase Auth, PostgreSQL, and row-level security
- **Reasoning:** Local streaming reasoning workflow with model and tool trace interfaces
- **Web runtime:** Multi-stage Docker image served by Nginx
- **Distribution:** Windows MSI and NSIS installers

## Project Structure

```text
src/                    React application and UI components
src-tauri/              Tauri Rust shell and desktop configuration
supabase/migrations/    Auth, profiles, conversations, messages, and memory schema
Dockerfile              Production web image
docker-compose.yml      Local web deployment on port 9090
build-installer.ps1     Windows release build and packaging script
requirements.txt        Python dependency declaration; currently none required
```

## Prerequisites

- Node.js 20+ and npm
- Rust toolchain (`rustc`, `cargo`)
- Docker Desktop for web deployment
- PowerShell for Windows installers

## Install and Develop

```bash
npm install --no-fund --no-audit
npm run rust:fetch
npm run dev
```

Open the Vite URL printed in the terminal. Port `5173` is preferred; if it is busy, Vite automatically selects the next available port.

For the Tauri desktop shell:

```bash
npm run tauri dev
```

## Validate and Build

```bash
npm run check       # typecheck, lint, and frontend production build
npm run build       # frontend production build only
npm run rust:check  # Rust backend check
npm run rust:build  # all Rust targets
```

## Supabase Authentication

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Apply the SQL migration in `supabase/migrations/`.
4. Enable Email and Google providers in Supabase Authentication.
5. Add `http://localhost:5173`, `http://localhost:4173`, and the deployed origin to the Supabase redirect URL allowlist.
6. Configure Google OAuth credentials using the Supabase callback URL shown in the provider settings.

When Supabase variables are absent, RyanAI runs in local mode and stores conversations in browser storage. Authentication activates automatically when valid values are configured.

## Web Deployment

```bash
npm run docker:up
```

Open `http://localhost:9090`. The container serves the SPA through Nginx and exposes `http://localhost:9090/health` for health checks.

Stop the deployment with:

```bash
npm run docker:down
```

## Windows Installers

Run the complete release pipeline:

```powershell
.\build-installer.ps1
```

The script installs dependencies, fetches Rust crates, runs typecheck/lint/build, and creates:

- `src-tauri/target/release/bundle/nsis/RyanAI_0.1.0_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/RyanAI_0.1.0_x64_en-US.msi`
- `src-tauri/target/release/ryan-app.exe`

The equivalent npm command is:

```bash
npm run release
```

## Dependency Manifests

- Node dependencies: `package.json` and `package-lock.json`
- Rust dependencies: `src-tauri/Cargo.toml` and `src-tauri/Cargo.lock`
- Python dependencies: none; `requirements.txt` documents that Python is not part of the runtime
