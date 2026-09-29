---
flow_id: FLOW-SHELL-21-nojs-filter-hides-ledger-rows
service: docs-site
feature: UC-SHELL-04
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Catch a no-JS ledger that hides non-default rows

The regression this catches: build-time CSS marking non-default engine rows or non-component categories `display: none`, so the no-JS ledger silently shows fewer than 56 rows. With JavaScript disabled, load `/registry`. Assert: exactly 56 `tr` rows exist in the ledger table; every row has non-zero rendered height (no visibility:hidden / display:none rows); visible text includes an item from each non-default slice — `streamdown` (a dev-client lib item), `speech recognition`, a ui item, and a lib item. The category tabs and engine toggle render but are inert without JS (clicking them does nothing harmful — no rows disappear). FAIL if any of the 56 rows is invisible or missing without JS.
