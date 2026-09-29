---
flow_id: FLOW-GEND-37-props-table-contradicts-source-drift
service: docs-site
feature: UC-GEND-06
priority: P0
type: edge_case
tier: holdout
scope: task
---

# A props table that contradicts the shipped source fails the drift check

Inject the drift: add a `variant` prop to `packages/registry/src/components/ai/shimmer.tsx` and hand-edit the enriched `src/data/registry-items.json` (or a cached extraction) so the shimmer props table still lists the old prop set. Rebuild and run the derivation check: for every component page, re-extract props from the source inlined in the shipped registry JSON and diff against the rendered table.

**Expected**: the check fails naming the item and the differing prop (`shimmer: table missing "variant"`). The whole point of generated tables is that the reference cannot contradict the artifact — a hand-patched or stale-cached extraction is silent documentation drift, which this scenario treats as a build-blocking defect, not a cosmetic one.
