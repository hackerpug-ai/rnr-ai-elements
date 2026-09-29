---
flow_id: FLOW-SHELL-17-corrupt-engine-localstorage-falls-back
service: docs-site
feature: UC-SHELL-03
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Corrupt or missing engine storage falls back to nativewind without breaking the page

For each of three stored values in `localStorage['rnr-engine']` — the string `garbage-engine`, the empty string `""`, and the literal string `null` — hard-load `/docs/installation`. The page renders fully (the pre-paint engine script never throws; check the console is free of uncaught errors), `document.documentElement.dataset.engine === "nativewind"`, and the nativewind tab is `aria-selected="true"`. Then click the uniwind tab: storage is rewritten to a valid `"uniwind"` and a hard reload keeps uniwind — recovery works after corruption. Also run the missing-key case (storage cleared entirely): identical nativewind fallback, no errors.
