---
flow_id: FLOW-DELIV-04-instant-rollback
service: docs-site
feature: UC-DELIV-04
priority: P0
type: happy_path
tier: visible
scope: task
---

# One-command rollback restores the previous deploy within seconds

Rollback is the maintainer's emergency brake; it must work in one command with no binding cleanup.

**Test inputs**: deploy a version whose hero contains a unique marker string; then run `wrangler rollback` (or `wrangler rollback <version-id>`) from a machine with the token.

**Expected outputs**:
- Within seconds, `curl -s https://rnraielements.com/` no longer contains the marker and matches the previous deploy's content.
- The command completes without a binding-mutation error, because the Worker declares no KV, D1, R2, or Durable Object bindings.
