---
flow_id: FLOW-GEND-12-family-assignment-exactly-once
service: docs-site
feature: UC-GEND-02
priority: P0
type: error_handling
tier: holdout
scope: task
---

# An item listed under two families fails the exactly-once gate

Corrupt the fixture: add `shimmer` to a second family's `itemNames[]` (it already belongs to one family), then build.

**Expected**: the gate asserts every registry item appears exactly once across the families map and fails the build naming the duplicated item (`[docs-data] family coverage: item "shimmer" mapped more than once`). Without this gate the duplicated item would render two cards whose hrefs collide and whose within-family pager counts double-count — both silent corruptions of the browse path.
