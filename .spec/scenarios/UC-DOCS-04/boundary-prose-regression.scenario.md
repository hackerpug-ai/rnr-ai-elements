---
flow_id: FLOW-DOCS-04-boundary-prose-regression
service: docs-site
feature: UC-DOCS-04
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Replacing the boundary tables with prose fails

A rewrite of /docs/owns-vs-does-not-own lands the boundary as flowing paragraphs instead of tables. Expected output: the build-time structure check fails when the three boundary statements (transport, streaming client, tool executor) do not each appear inside a table-cell context. On the healthy build, all three terms sit in table cells and the ownership split renders as table rows.
