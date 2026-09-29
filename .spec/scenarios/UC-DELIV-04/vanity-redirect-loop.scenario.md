---
flow_id: FLOW-DELIV-04-vanity-redirect-loop
service: docs-site
feature: UC-DELIV-04
priority: P1
type: error_handling
tier: holdout
scope: task
---

# Vanity redirects must terminate in one hop, never loop

A redirect edited to point at another redirect (or itself) makes the short URL unusable in every browser and agent fetcher.

**Test inputs**: edit `_redirects` so `/docs/introduction` redirects back to `/docs` (and separately, `/docs` to itself); then run `curl -sIL https://rnraielements.com/docs` and `curl -sIL --max-redirs 5 https://rnraielements.com/docs`.

**Expected outputs**:
- The chain terminates in exactly one hop at `/docs/introduction` with a final `200`.
- curl never reports `Maximum redirections exceeded`.
- Every redirect target is a real built page (no redirect-to-redirect chains), and trailing-slash variants resolve without looping.
