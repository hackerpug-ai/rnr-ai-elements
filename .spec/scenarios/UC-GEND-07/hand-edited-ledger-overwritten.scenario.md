---
flow_id: FLOW-GEND-44-hand-edited-ledger-overwritten
service: docs-site
feature: UC-GEND-07
priority: P0
type: happy_path
tier: holdout
scope: task
---

# A hand edit to ledger content cannot survive a rebuild

Hand-edit the generated surface: tweak a row's description in `apps/docs/src/data/registry-items.json` (or inject a fabricated 57th row) without touching `packages/registry/registry.json`, then rebuild.

**Expected**: the prebuild regenerates `registry-items.json` from the registry source and the hand edit is gone; if the edit introduced an inconsistency (the fabricated row), the 56-item or coverage gate fails the build naming it. Additionally, `apps/docs/public/r` stays generated-only and gitignored, so there is no checked-in artifact to hand-edit. The maintainer-facing contract: the ONLY way to change the ledger is to change the registry — every build path through the repo proves it.
