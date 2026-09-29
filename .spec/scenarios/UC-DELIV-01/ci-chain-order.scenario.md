---
flow_id: FLOW-DELIV-01-ci-chain-order
service: docs-site
feature: UC-DELIV-01
priority: P0
type: happy_path
tier: visible
scope: task
---

# Ordered CI chain builds docs over registry artifacts in sync

The docs job in `.github/workflows/ci.yml` must run the ordered chain exactly: `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build`. The `&&` chaining is the contract — each step runs only if the previous one succeeded, so docs always build over artifacts provably in sync with the registry.

**Test inputs**: push a commit to main touching any file under `packages/registry/`, then watch the docs job.

**Expected outputs**:
- `pnpm registry:build` regenerates `public/r/nativewind/` and `public/r/uniwind/` from `packages/registry/registry.json`.
- `pnpm gallery:manifest` emits `apps/docs/src/data/gallery-manifest.json` with an `expoGo` boolean per item.
- The docs prebuild writes `apps/docs/src/data/registry-items.json`, passes all fail-closed gates, and `astro build` exits 0.
- `find apps/docs/dist/r -name '*.json' | wc -l` prints exactly `112`.
