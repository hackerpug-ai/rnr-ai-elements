---
flow_id: FLOW-GEND-43-stale-public-r-tree-fails-chain
service: docs-site
feature: UC-GEND-07
priority: P0
type: error_handling
tier: holdout
scope: task
---

# A stale public/r tree versus packages/registry fails before the ledger renders

Simulate a skipped step: add fixture item #57 to `packages/registry/registry.json` but do NOT run `pnpm registry:build`, so `public/r/{nativewind,uniwind}/` still holds 56 items. Run the CI chain the docs job uses.

**Expected**: the chain fails — the registry-freshness gate (git diff over the generated `public/r/` tree) rejects the stale output before the docs build emits a ledger that disagrees with what would actually ship. If freshness is bypassed, the docs prebuild's 56-item gate fails instead, naming the mismatching item. Either way: non-zero exit, no deploy, no ledger claiming 57 items over a 56-item served tree (or vice versa). Revert the fixture afterwards.
