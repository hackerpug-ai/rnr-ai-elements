---
flow_id: FLOW-DELIV-02-expired-api-token
service: docs-site
feature: UC-DELIV-02
priority: P0
type: error_handling
tier: holdout
scope: task
---

# Expired CLOUDFLARE_API_TOKEN fails the deploy loudly

A rotated-away or expired deploy token must produce a red, visible failure — never a silently skipped or half-completed deploy.

**Test inputs**: rotate the GitHub secret to a revoked token value (or run from a fork where the secret is absent, yielding an invalid token).

**Expected outputs**:
- The deploy job goes red with a Cloudflare authentication error (e.g. code 8000007, `Authentication error`), visible in the job summary.
- No `continue-on-error` swallows it; no partial deploy occurs.
- Production is untouched: `curl -sI https://rnraielements.com/` still returns `200` from the last good deploy.
- Restoring a valid token and re-running the workflow succeeds end to end.
