---
flow_id: FLOW-GEND-39-copy-affordance-always-visible
service: docs-site
feature: UC-GEND-06
priority: P2
type: edge_case
tier: holdout
scope: task
---

# Copy affordances are always visible with a success state

Audit every code block (Code view files, usage snippets, install commands) across the built pages, on mobile and desktop widths.

**Expected**: each code block's copy button is visible without hover (hover-revealed buttons do not exist on touch), is reachable by keyboard with a focus-visible state, and after activation shows a perceptible success state (label/icon change) that reverts. With JavaScript disabled, the code text itself remains fully selectable so manual copy still works. Polish-tier: no block may ship without the affordance, but no other behavior depends on it.
