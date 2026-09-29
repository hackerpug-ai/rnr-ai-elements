---
flow_id: FLOW-GEND-31-missing-imagery-fails-build-when-live
service: docs-site
feature: UC-GEND-05
priority: P1
type: error_handling
tier: holdout
scope: task
---

# Once the capture pipeline is live, missing imagery fails the build naming the item

Simulate the phased flip: set the capture pipeline flag live, delete the captured assets for one item (e.g. `persona`), and run the docs build chain.

**Expected**: the prebuild fails with a non-zero exit and an error naming the item, in the shape `[docs-data] imagery: item "persona" missing captured matrix/dark-strip assets`. The site never publishes a page that silently regresses to the omitted-panel look once imagery is the norm — the fail-closed gate that turns "phased" into "enforced". Revert the fixture afterwards.
