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
agentskills/            Autonomous agent rules and MCP capability configuration
mcp-server/             Stdio MCP diagnostics and release manager
native/local-inference/ Offline C++17/CUDA bridge stub and build contract
agentskills/            Agent roles, sentinel policy, and MCP capability rules
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

## MCP Agent Manager

The repository includes a scoped MCP server for repeatable RyanAI diagnostics and release operations. It does not run arbitrary shell input; tools invoke the repository's allowlisted npm, Cargo, Docker Compose, and Git commands.

```bash
npm run mcp:check
npm run mcp:start
```

The server communicates over stdio for MCP clients. Available tools are `diagnose_and_patch`, `repository_status`, and `sync_repository`. Deployment and Git synchronization remain explicit tool actions, and `.env` is excluded from staging.

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

## Local-First Closure Layers

- **Dual-brain routing:** `src/config/models.ts` selects the configured Nemotron and Qwen profiles. Provider credentials remain server-side and are never bundled into the browser.
- **Offline inference bridge:** `native/local-inference/` contains a C++17 stdin/stdout stub with an optional CUDA build switch. Signed model weights and kernels must be supplied separately before production CUDA inference.
- **Sentinel policy:** `agentskills/sentinel-policy.json` is audit-only by default. Kernel-level eBPF enforcement requires a reviewed, signed Linux attachment; Windows does not silently install or block with a kernel driver.
- **Air-gap vector cache:** `src/lib/airGapCache.ts` stores AES-GCM encrypted vector records in IndexedDB for browser-local persistence. A native deployment should move the key into OS-backed secure storage before treating it as a hardware security boundary.
- **Installer:** `packaging/installer/ryan-ai-setup.iss` packages the actual Tauri executable. PostgreSQL, Redis, CUDA weights, and kernel programs are intentionally not bundled because no verified artifacts exist in this repository.

To configure the dual-brain browser routing, copy `.env.example` to `.env.local` and set the `VITE_PRIMARY_REASONING_MODEL`, `VITE_SECONDARY_REASONING_MODEL`, and endpoint values. Keep API keys in a server-side secret store.

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
