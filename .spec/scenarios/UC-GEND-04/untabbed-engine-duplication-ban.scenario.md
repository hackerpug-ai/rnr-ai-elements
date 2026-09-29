---
flow_id: FLOW-GEND-24-untabbed-engine-duplication-ban
service: docs-site
feature: UC-GEND-04
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Both engine commands stacked un-tabbed fails the never-duplicate rule

Inject the regression: an install block renders the nativewind and uniwind commands as two stacked code blocks instead of a tab pair. Run the page-structure assertion over all 39 component pages and the installation docs.

**Expected**: failure. The contract is a single engine-tabbed block whose panels are server-rendered — never un-tabbed duplicates, which force the reader to guess which command applies to their project and reintroduce the exact wrong-tree install the tabs exist to prevent. The assertion requires: exactly one TabGroup per install block, both engine panels present in the server HTML, and no page containing both engine variants as simultaneously-visible sibling code blocks.
