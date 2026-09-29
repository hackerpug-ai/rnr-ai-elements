---
flow_id: FLOW-DOCS-06-changelog-tag-drift
service: docs-site
feature: UC-DOCS-06
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Changelog entries and git tags never drift apart

A maintainer cuts tag v0.2.2 but forgets the changelog entry. The sync check compares `git tag --list 'v*'` against the changelog collection. Expected output: the check fails naming v0.2.2 as having no /changelog/0.2.2 page. The reverse direction (an entry with no tag) also fails. The healthy build has a strict one-to-one match between tags and entries.
