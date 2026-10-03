---
id: FIX-ORI-CI-004-1
title: Server main() runs at import and rejects the minimal env before serve() configures it
sprint: sprint-05-orient-search
created_by: orchestrator (disposition: ORI-CI-004 cycle-1 routed blocker, 2026-10-03)
implementer: aisdk-implementer
reviewer: aisdk-reviewer
points: 2
depends_on: []
status: open
---

## Problem

`apps/example/server/index.ts` ends with a bare top-level `main();` — the server starts (and validates its environment) at **import time**. The live-example proof drivers (`live-example-proof.ts` et al.) import the module to control its lifecycle and call `serve()` with a minimal test env, but the import itself fires `main()`, which rejects the minimal env and exits before `serve()` ever configures it.

Observed twice (both ORI-CI-004 dispatches, 2026-10-02/03): live-example uniwind matrix exit 2 at `live-example-proof.ts:3211`. WRITE-PROHIBITED for ORI-CI-004 (outside its write_allowed); owned here.

## Remedy

Make the import controllable without changing CLI behavior:

- Running the file directly (`node server/index.ts` / `tsx apps/example/server/index.ts`) must still start the server exactly as today — the example app's documented run command depends on it.
- Importing the module must NOT auto-start; drivers call `serve()` explicitly.

Candidate patterns (implementer's judgment): direct-execution guard (`require.main === module` for CJS; `import.meta.url` vs `process.argv[1]` realpath for ESM), or an explicit opt-out env (e.g. `RNR_EXAMPLE_SERVER_AUTORUN=0`) — pick the one matching the file's module system and the repo's existing server patterns, and document it in the file header.

## write_allowed

- `apps/example/server/index.ts (MODIFY)`
- The proof driver(s) that import it, ONLY if the import call-site needs a matching signature change — document each in the report.

## Acceptance criteria

- **AC-1**: Importing `apps/example/server/index.ts` in a scratch process with the minimal test env does not start the server and does not exit non-zero. Proof: a real node/tsx one-liner receipt.
- **AC-2**: Running the file directly still boots and prints the LISTENING line (real run receipt with the port bound).
- **AC-3**: The previously failing path is green: the live-example proof driver's minimal-env leg that failed at `live-example-proof.ts:3211` now passes against the real backend (scoped run acceptable; full matrix belongs to ORI-CI-004's rerun).

## Critical constraints

- No stubbed servers, no mocked env validation — the real validation logic stays; only WHEN it runs changes.
- Do not weaken the server's env checks to make tests pass.
- Pre-commit needs generated registry-items.json in a fresh worktree (`pnpm registry:build && pnpm gallery:manifest && pnpm exec tsx scripts/docs-data/prebuild.ts`).
- Biome OOM flake → `./node_modules/.bin/biome` + retry once.
