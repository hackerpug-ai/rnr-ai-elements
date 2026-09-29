---
flow_id: FLOW-DOCS-05-not-ported-complement
service: docs-site
feature: UC-DOCS-05
priority: P1
type: edge_case
tier: holdout
scope: task
---

# The not-ported list is the exact complement of the map

An element gets ported but its name stays on the not-ported list; or a new upstream element is tracked in neither list. The consistency check computes set(upstream elements) minus set(mapped) and compares it to set(not-ported). Expected output: the two sets match exactly in the healthy build. When they drift, the check fails naming the element and both lists involved (for example 'Conversation is mapped but still listed as not-ported').
