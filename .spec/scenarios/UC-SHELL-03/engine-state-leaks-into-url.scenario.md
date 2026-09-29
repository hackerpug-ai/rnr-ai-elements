---
flow_id: FLOW-SHELL-16-engine-state-leaks-into-url
service: docs-site
feature: UC-SHELL-03
priority: P0
type: edge_case
tier: holdout
scope: task
---

# No client state ever leaks into the URL

Exercise every stateful control and watch `location` after each action: click engine tabs (nativewind->uniwind) on `/docs/installation`; type in the ledger filter, click category tabs, and flip the engine toggle on `/registry`; open and close the Cmd+K dialog; toggle the theme; open and close the mobile drawer. After every single action assert `location.search === ''` and `location.hash === ''` (hash routes for state — content anchors like `#conversation` on `/components` are allowed, state hashes are not). Copy the URL at any point and open it in a clean profile: the page renders with the default engine (nativewind), proving nothing was pinned. Traverse back/forward with history: entries are pages only. Instrumenting `history.pushState`/`replaceState` must show zero calls carrying an engine param. FAIL on any leak.
