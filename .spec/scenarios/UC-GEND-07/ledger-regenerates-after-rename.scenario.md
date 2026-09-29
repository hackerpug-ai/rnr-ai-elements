---
flow_id: FLOW-GEND-42-ledger-regenerates-after-rename
service: docs-site
feature: UC-GEND-07
priority: P0
type: edge_case
tier: holdout
scope: task
---

# An item rename regenerates the ledger — no stale rows or dead links survive

Rename a fixture item `agent` -> `agent-session` in `packages/registry/registry.json`, run the full chain (`pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build`), and inspect the new `/registry` plus the old artifacts.

**Expected**: the rebuilt ledger contains `agent-session` and zero references to `agent`; every docs-page link in the ledger resolves in the fresh `dist/`; the shipped tree contains `public/r/{nativewind,uniwind}/agent-session.json` and no `agent.json`. **Failure mode under test**: a stale ledger row (old name, dead `/components/agent` link) or a stale served `/r/nativewind/agent.json` surviving the rename — either proves the ledger was cached or hand-maintained rather than regenerated, and fails. Revert the fixture afterwards.
