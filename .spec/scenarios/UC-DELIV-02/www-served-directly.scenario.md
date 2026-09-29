---
flow_id: FLOW-DELIV-02-www-served-directly
service: docs-site
feature: UC-DELIV-02
priority: P0
type: error_handling
tier: holdout
scope: task
---

# www must 301 to the apex, never serve content directly

The zone-level Redirect Rule (`www.rnraielements.com/*` -> `rnraielements.com/$1`, 301) must hold for every path, including the registry JSON URLs that install commands embed.

**Test inputs**: `curl -sI https://www.rnraielements.com/`, `.../r/nativewind/conversation.json`, `.../docs/introduction`; then `curl -sIL` through each chain.

**Expected outputs**:
- Each returns exactly one `301` preserving path and query to the rnraielements.com counterpart; the chain terminates in `200`.
- Never: a `200` served at www, a third host in the chain, a TLS certificate error, or curl error 47 (too many redirects).
- Regression triggers: the Redirect Rule deleted or typo'd, or HSTS with `includeSubDomains` enabled before the redirect is verified working.
