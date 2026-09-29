---
flow_id: FLOW-DOCS-06-changelog-ordering
service: docs-site
feature: UC-DOCS-06
priority: P2
type: edge_case
tier: holdout
scope: task
---

# Order stays reverse chronological after late edits

A maintainer edits an old entry and its date shifts (or a backdated release is added with an older date above a newer one). Expected output: the rendered /changelog lists dates in strictly descending order top to bottom (0.2.1 before 0.2.0 before 0.1.x); any adjacent pair out of order fails the ordering check naming the two entries.
