---
flow_id: FLOW-GEND-46-ledger-readable-without-js
service: docs-site
feature: UC-GEND-07
priority: P1
type: edge_case
tier: holdout
scope: task
---

# The full ledger stays readable with JavaScript disabled

Load `/registry` with JavaScript disabled (or inspect the server HTML directly).

**Expected**: the full 56-row table renders server-side and is fully readable — all names, categories, verdicts, engine URLs, and docs links present in the static HTML. The LedgerFilter island enhances (tabs/toggle) but is not load-bearing: category counts are also available without JS (rows are marked up by category so they remain scannable), and per-row install commands are visible as selectable text even where the copy button is inert. No content-fencing where rows load or reveal only via script.
