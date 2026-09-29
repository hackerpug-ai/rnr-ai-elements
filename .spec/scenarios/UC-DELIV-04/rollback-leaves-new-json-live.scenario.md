---
flow_id: FLOW-DELIV-04-rollback-leaves-new-json-live
service: docs-site
feature: UC-DELIV-04
priority: P0
type: error_handling
tier: holdout
scope: task
---

# Rollback must restore the full old asset set, including /r/ JSONs

Failure mode: rollback restores the old HTML but the bad deploy's new `/r/` JSONs stay live — agents then install items the rolled-back docs no longer document.

**Test inputs**: deploy a bad version that adds a broken new item JSON (e.g. `/r/nativewind/broken-item.json`); then run `wrangler rollback`.

**Expected outputs**:
- `/r/nativewind/broken-item.json` returns `404` after rollback (for a changed file, the body's sha256 matches the pre-deploy version).
- Docs pages match the pre-deploy version.
- Any new-in-bad-deploy `/r/` URL still serving `200` after rollback fails this scenario.
