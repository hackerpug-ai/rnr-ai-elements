---
flow_id: FLOW-DOCS-04-boundary-ownership-tables
service: docs-site
feature: UC-DOCS-04
priority: P1
type: happy_path
tier: visible
scope: task
---

# Boundary page renders ownership as scannable tables

Open /docs/owns-vs-does-not-own. The page states in tables that the library ships no transport, no streaming client, and no tool executor; that the consumer wires AI SDK v7 useChat; and the ownership split (primitives belong to react-native-reusables core, AI compositions belong here, gaps listed honestly). A link to the worked example app is present. Expected output: the page returns 200, the boundary content renders as at least two HTML tables, the literal string `useChat` appears inside a table cell, and a link to the worked example exists.
