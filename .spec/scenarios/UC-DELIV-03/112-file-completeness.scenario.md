---
flow_id: FLOW-DELIV-03-112-file-completeness
service: docs-site
feature: UC-DELIV-03
priority: P0
type: happy_path
tier: visible
scope: task
---

# All 112 engine-item JSON files are served with the correct type

Serving completeness is per engine: 56 items x 2 engines (nativewind, uniwind) = 112 files from the same CI chain that proves registry freshness.

**Test inputs**: loop `engine` in {nativewind, uniwind} x the 56 item names from `packages/registry/registry.json`, running `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://rnraielements.com/r/$engine/$item.json`.

**Expected outputs**:
- Every one of the 112 lines reads `200 application/json`.
- Zero `404`s and zero `text/html` responses across the sweep.
