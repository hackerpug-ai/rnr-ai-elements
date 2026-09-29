---
flow_id: FLOW-GEND-30-null-imagery-omits-preview-panel
service: docs-site
feature: UC-GEND-05
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Null imagery omits the preview panel entirely — no placeholder box anywhere

With the Playwright capture sprint not yet landed (all items carry `imagery: null`), audit all 39 component pages plus `/components` cards.

**Expected**: no page renders an empty preview frame, gray placeholder box, broken image icon, `img` with an empty/undefined src, or "preview coming soon" text. The preview panel is omitted from the DOM entirely; the Code view (full source) remains available, and the QR path is unaffected. Grep the built HTML for placeholder-marker classes and empty-figure elements: `occurrences == 0`. This is the phase-1 contract — omission, never decoration.
