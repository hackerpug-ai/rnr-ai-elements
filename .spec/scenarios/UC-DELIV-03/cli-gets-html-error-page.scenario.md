---
flow_id: FLOW-DELIV-03-cli-gets-html-error-page
service: docs-site
feature: UC-DELIV-03
priority: P0
type: error_handling
tier: holdout
scope: task
---

# CLI add against an HTML error response must fail loudly, not write HTML into the project

Failure mode: a misroute or soft-404 makes an `/r/` URL return the styled HTML 404 page (or any HTML error body) where the CLI expects JSON.

**Test inputs**: run the CLI against `https://rnraielements.com/r/nativewind/definitely-not-an-item.json` while that route serves the styled 404 HTML page.

**Expected outputs**:
- The CLI exits non-zero with a JSON parse error naming the fetched URL.
- The CLI does NOT write any HTML file into the consumer project.
- Control: the correctly spelled URL `https://rnraielements.com/r/nativewind/conversation.json` returns parseable `application/json`.
- Site-side assertion: no `/r/*` URL ever returns `content-type: text/html`.
