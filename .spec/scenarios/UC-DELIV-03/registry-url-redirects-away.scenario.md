---
flow_id: FLOW-DELIV-03-registry-url-redirects-away
service: docs-site
feature: UC-DELIV-03
priority: P0
type: boundary
tier: holdout
scope: task
---

# Registry URLs must serve same-origin, never redirect

Failure mode: a `_redirects` rule or zone Redirect Rule sends `/r/*` to another origin (e.g. a CDN bucket), breaking the same-deploy guarantee that install commands and docs never diverge.

**Test inputs**: `curl -sI` each `/r/*.json`; then `curl -sIL` and inspect the final resolved URL.

**Expected outputs**:
- Every `/r/*.json` returns `200` directly — no 301, 302, 307, or 308.
- The final URL host after following any redirects is `rnraielements.com`.
- The `_redirects` file contains no rule whose source path starts with `/r/`.
