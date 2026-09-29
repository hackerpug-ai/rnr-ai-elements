---
flow_id: FLOW-GEND-26-family-command-coverage
service: docs-site
feature: UC-GEND-04
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Family surfaces expose copyable absolute-URL commands for every member

Check every place commands are offered at family granularity: the seven family sections on `/components`, the install docs, and the `/registry` bulk-add instructions.

**Expected**: the union of copyable commands across the site covers all 56 items x 2 engines, and every family-level or bulk-add composition is built from the same absolute-URL per-item commands (`https://rnraielements.com/r/{engine}/{item}.json`) — never a short-name loop like `for i in conversation message prompt-input; do npx ... add $i; done`. The audit extracts commands from these surfaces too and requires 100% pattern conformance; a bulk-add snippet that degrades to short names fails.
