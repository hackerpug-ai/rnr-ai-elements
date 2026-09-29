---
flow_id: FLOW-GEND-04-home-counter-sum-consistency
service: docs-site
feature: UC-GEND-01
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Hero counters are internally consistent (categories sum to the total)

Parse the rendered hero counters from the built `/` HTML.

**Expected**: the three category counts (39 component, 11 ui, 6 lib) sum exactly to the displayed total (56), and each category count equals the number of `src/data/registry-items.json` entries with the matching `type`. A layout that shows `56 items` next to `39 / 11 / 5`, or any counter disagreeing with the artifact's per-type tally, fails. This guards against a future copy edit or partial-enrichment regression where one chip is computed from a different source than its siblings.
