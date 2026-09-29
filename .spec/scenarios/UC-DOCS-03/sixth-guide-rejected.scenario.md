---
flow_id: FLOW-DOCS-03-sixth-guide-rejected
service: docs-site
feature: UC-DOCS-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# A sixth guide is rejected at the five-page cap

Add guides/migrating-from-v0.md to the guides collection. Expected output: the build fails, naming guides/migrating-from-v0.md and stating the five-page launch cap. Remove the file and the build passes with /guides listing exactly 5 entries. At no point does the index render 6 cards.
