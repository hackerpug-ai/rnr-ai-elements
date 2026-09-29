---
flow_id: FLOW-GEND-11-family-map-orphan-after-rename
service: docs-site
feature: UC-GEND-02
priority: P0
type: error_handling
tier: holdout
scope: task
---

# A families-map entry orphaned by an item rename fails the coverage gate

Rename a fixture item `suggestion` -> `suggestion-actions` in `packages/registry/registry.json` while leaving the old name in the docs families map, then run the build chain.

**Expected**: the family-coverage gate fails in BOTH directions — the renamed item has no mapping AND the map references a nonexistent item — with an error naming both (e.g. `[docs-data] family coverage: orphan map entry "suggestion"`). A hand-maintained map that drifts after renames is the exact decay this gate exists to stop; the build must never emit a family grid built from stale names.
