---
flow_id: FLOW-GEND-19-seam-links-only-where-used
service: docs-site
feature: UC-GEND-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Extension-seam links appear exactly on pages whose items use those seams

Classify the 39 items by whether their inlined source references `renderMarkdown` or `TextClassContext` (grep the enriched source text at build time), then check each generated page for links to the corresponding extension-seam docs.

**Expected**: pages whose item source uses a seam carry a working link to that seam's documentation page (200 in `dist/`), and pages that use neither seam carry no such link. Both error directions fail: a dead/missing link on a seam-using page (e.g. the markdown-rendering message items) robs the themer of the override point, and a seam link on a non-using page is a lie about the item's extension surface.
