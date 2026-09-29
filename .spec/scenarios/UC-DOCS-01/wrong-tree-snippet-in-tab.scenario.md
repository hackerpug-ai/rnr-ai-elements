---
flow_id: FLOW-DOCS-01-wrong-tree-snippet-in-tab
service: docs-site
feature: UC-DOCS-01
priority: P0
type: error_handling
tier: holdout
scope: task
---

# An engine tab rendering the other tree's snippet is caught

A refactor of the tab component accidentally binds both panels to the same snippet source. Fetch the built /docs/installation HTML and inspect the panel labeled nativewind: every command inside it must point at https://rnraielements.com/r/nativewind/..., and the panel labeled uniwind must contain only /r/uniwind/... URLs. Deliberately swap the two panels in a scratch build. Expected output: the healthy build has zero cross-tree URLs per panel; the swapped build fails the panel-consistency check, listing each offending command and the panel it appeared in.
