---
service: docs-site
feature: journey-docs-delivery-arc
covers_ucs: [UC-DELIV-03, UC-DELIV-04]
priority: P0
type: error_handling
tier: visible
test_tier: e2e
---
# A rollback that strands the bad deploy's registry JSONs

A bad deploy ships broken new `/r/` item JSONs alongside broken HTML. `wrangler rollback` restores the old HTML — the failure under test is the new `/r/` URLs staying live (or changed files keeping their new bytes), leaving agents installing items the rolled-back docs no longer document. Assert the full old asset set returns: new-in-bad-deploy `/r/` URLs 404, changed files match pre-deploy digests, and no binding exists that would have blocked the rollback.

**Covers:** `UC-DELIV-03`, `UC-DELIV-04`
