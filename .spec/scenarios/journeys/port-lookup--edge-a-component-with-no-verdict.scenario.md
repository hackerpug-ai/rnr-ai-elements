---
service: rnr-ai-elements
feature: journey-port-lookup
covers_ucs: [UC-REG-03]
priority: P0
type: boundary
tier: visible
test_tier: e2e
---
# A component the table forgot

Diff the published verdict table against the live file list in `vercel/ai-elements@main/packages/elements/src/`. Any component present upstream and absent from the table is a failure, and so is any out-of-scope verdict with no named alternative. Then repeat after an upstream release adds a component: the table must be shown to go stale, because a verdict table that silently omits things is worse than none — a porter trusts it and builds around a component that does not exist.

**Covers:** `UC-REG-03`
