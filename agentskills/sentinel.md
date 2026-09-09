# RyanAI Sentinel Boundary

## Purpose

The sentinel records host and container health events and exposes policy decisions to the RyanAI MCP manager. It is audit-first on Windows: it does not install kernel drivers, attach eBPF programs, or silently block network traffic.

## Linux eBPF Integration Point

Production Linux deployments may attach a reviewed eBPF socket/cgroup program outside this repository. The program must emit structured events to the MCP manager and use an operator-approved deny policy. A kernel-level block must never be inferred from a browser or JavaScript event.

## Safe Defaults

- Observe and report unauthorized ingress candidates.
- Do not mutate firewall rules automatically.
- Require explicit deployment of a signed, platform-specific policy.
- Keep a timestamped audit trail for every allow/deny decision.

Policy configuration lives in `agentskills/sentinel-policy.json`.