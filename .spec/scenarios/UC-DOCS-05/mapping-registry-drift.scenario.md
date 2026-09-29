---
flow_id: FLOW-DOCS-05-mapping-registry-drift
service: docs-site
feature: UC-DOCS-05
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Mapping rows must name real registry items

A mapping row is hand-edited and references a registry slug that does not exist: Conversation is mapped to chat-conversation when the real slug is conversation. Expected output: the build-time cross-check fails, naming the row and the unknown slug chat-conversation. On the healthy build, every slug in the mapping column resolves to one of the 56 shipped registry items (39 component / 11 ui / 6 lib), with zero unknown slugs.
