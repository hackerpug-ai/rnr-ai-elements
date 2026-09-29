---
flow_id: FLOW-GEND-18-install-block-first-section
service: docs-site
feature: UC-GEND-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# A regression that demotes the install block below other content fails

Inject the regression: move the theming note (or the preview/code TabGroup) above the install block in the page template, rebuild, and run the section-order assertion across all 39 pages.

**Expected**: the assertion fails. The contract is that the engine-tabbed install block is the first content section on EVERY component page — a copy-paste user must reach the command before any prose. The check compares the DOM index of the install block against every other top-level content section and requires index 0 for all 39 pages.
