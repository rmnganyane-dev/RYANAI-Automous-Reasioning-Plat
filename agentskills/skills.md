# RyanAI Autonomous Agent Skills Specification

## 1. System Self-Inspection and Diagnostics

- **Capabilities:** Inspect source health, TypeScript compiler output, Rust checks, Docker configuration, container health, and production build output.
- **Execution vector:** Run the repository's existing validation commands and return structured diagnostics before deployment.
- **Primary checks:** `npm run check`, `npm run rust:check`, `docker compose config`, and the `/health` endpoint when the web service is running.

## 2. Automated Patching and Git Operations

- **Capabilities:** Identify failing validation commands, report actionable patches, stage intentional changes, create descriptive commits, and push only when explicitly requested by the operator or an approved automation policy.
- **Guardrails:** Never execute arbitrary shell input, never interpolate commit messages into shell commands, and never overwrite unrelated user changes.
- **Execution vector:** Use allowlisted npm, Cargo, Docker Compose, and Git operations through the MCP manager.

## 3. Multi-Agent Reasoning and ReAct Routing

- **Capabilities:** Route diagnostics to the frontend, Rust, deployment, or repository workflow; preserve command output as an operational trace; and expose a single health summary to agent clients.
- **Execution vector:** MCP tools provide deterministic checks and deployment actions that can be composed by a reasoning agent.

## 4. Deployment Readiness

- **Capabilities:** Build the frontend, validate the native shell, build the Docker image, start the web service, and verify `/health`.
- **Exit criteria:** All requested checks return exit code zero and the web health endpoint returns HTTP 200.
