---
flow_id: FLOW-DELIV-04-rollback-blocked-by-bindings
service: docs-site
feature: UC-DELIV-04
priority: P0
type: error_handling
tier: holdout
scope: task
---

# No bindings may sneak in and block instant rollback

The one-command rollback promise depends on the Worker staying assets-only. Adding one KV binding for analytics re-introduces the documented binding-mutation rollback blocker.

**Test inputs**: inspect `wrangler.jsonc`; as a drill, run `wrangler rollback` against the current deploy.

**Expected outputs**:
- `wrangler.jsonc` declares no `kv_namespaces`, `d1_databases`, `r2_buckets`, or `durable_objects` bindings.
- The rollback drill completes without a binding-mutation error.
- Any binding appearing in the config is the failure condition — the change must be rejected or the rollback plan re-verified before merge.
