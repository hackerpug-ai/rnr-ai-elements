---
flow_id: FLOW-SHELL-19-nojs-ledger-and-tabs-readable
service: docs-site
feature: UC-SHELL-04
priority: P0
type: happy_path
tier: visible
scope: task
---

# Full site readability with JavaScript disabled

Load the built site with `javaScriptEnabled: false`. On `/registry`: the complete ledger renders unfiltered — all 56 rows (39 component / 11 ui / 6 lib) with install commands, category badges, Expo Go verdict badges, doc-page links, both engine base URLs (`https://rnraielements.com/r/nativewind/` and `.../uniwind/`), and the generated-at-build note. On `/docs/installation` and `/components/message`: both engine panels render stacked and labeled. Theme follows prefers-color-scheme (no toggle, no flash — pages render correctly under both emulated schemes). The search trigger either does not render or degrades to a link to `/components`; navigation remains complete either way. Nothing interactive gates content.
