---
flow_id: FLOW-DOCS-01-duplicated-engine-question
service: docs-site
feature: UC-DOCS-01
priority: P1
type: edge_case
tier: holdout
scope: task
---

# The engine question is never asked twice

A content edit adds an un-tabbed 'Nativewind or uniwind?' heading to /docs/installation with loose commands under it, in addition to the existing tab group. Scan the built page. Expected output: exactly one engine tab group exists, and the string `npx @react-native-reusables/cli@latest add` occurs zero times outside a labeled tab panel. When the duplicated heading is planted, the check fails and reports the offending heading text and the command found outside a tab panel.
