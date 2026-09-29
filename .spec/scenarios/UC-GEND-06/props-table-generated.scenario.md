---
flow_id: FLOW-GEND-34-props-table-generated
service: docs-site
feature: UC-GEND-06
priority: P1
type: happy_path
tier: visible
scope: task
---

# Every component page carries a ts-morph-generated props table

Open `/components/conversation` and spot-check across all 39 component pages.

**Expected**: each page renders a props table with columns name, type, default, description, populated by the build-time ts-morph extraction from the item's shipped `.tsx` source. Every `registry:component` page HAS a table (an item with genuinely zero external props may show an empty-but-present table; a MISSING table fails). Types render as resolved type text, not `any` or `unknown` placeholders.
