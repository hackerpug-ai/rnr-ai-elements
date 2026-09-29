---
flow_id: FLOW-DOCS-06-release-missing-sections
service: docs-site
feature: UC-DOCS-06
priority: P2
type: error_handling
tier: holdout
scope: task
---

# Every release page carries a date and all three lists

A release entry is authored hastily: /changelog/0.2.1 ships with a date but no fixed list, or no date at all. Expected output: the collection schema or build check requires date, added, changed, and fixed on every release entry; an entry missing any of the four fails naming the entry and the missing field. Empty lists are fine (rendered as an explicit 'none' or empty section) but absent fields are not.
