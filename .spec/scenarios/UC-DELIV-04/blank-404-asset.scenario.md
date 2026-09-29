---
flow_id: FLOW-DELIV-04-blank-404-asset
service: docs-site
feature: UC-DELIV-04
priority: P1
type: error_handling
tier: holdout
scope: task
---

# Unknown URLs must return a non-empty styled 404, never a blank body

Failure mode: `404.html` is missing from `dist/` or `not_found_handling` is misconfigured (e.g. `none` instead of `404-page`), so unknown URLs return an empty body.

**Test inputs**: `curl -s -w '%{http_code} %{size_download}\n' https://rnraielements.com/definitely-not-a-page`.

**Expected outputs**:
- Status `404` with `size_download` greater than 0.
- Body is real styled HTML (`content-type: text/html`) containing the search-recovery affordance.
- Never an empty body, and never a blank `200`.
