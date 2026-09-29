---
flow_id: FLOW-GEND-10-ui-lib-excluded-from-components
service: docs-site
feature: UC-GEND-02
priority: P1
type: edge_case
tier: holdout
scope: task
---

# ui and lib items never leak into the components family grid

Compare the set of card hrefs on `/components` against all 56 item names.

**Expected**: the grid contains exactly the 39 `registry:component` items. The 11 `registry:ui` and 6 `registry:lib` names (e.g. the `markdown` lib item, ui primitives like `button-group`) appear nowhere on `/components` — they are reachable only via the `/registry` ledger and cross-links. This is the boundary test for the page-generation filter: a generation loop that feeds all 56 entries into the family grid would produce 56 cards and this scenario catches it by exact set difference.
