---
flow_id: FLOW-GEND-17-chip-row-matches-ledger-verdict
service: docs-site
feature: UC-GEND-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# The chip-row verdict on a page equals the same item's ledger-row verdict

For all 39 component pages, extract the Expo Go verdict from the status chip row; for the same 39 names, extract the verdict badge from the `/registry` ledger row; diff pairwise.

**Expected**: zero disagreements — both surfaces render the same `expoGo` boolean from the single enriched dataset. Any pair like the page saying `runs in Expo Go` while the ledger row says `requires a dev client` (the classic two-sources-of-truth drift when a template reads a different field) fails the diff. The assertion is `mismatches == 0` across all rows.
