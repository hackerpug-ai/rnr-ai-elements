---
flow_id: FLOW-GEND-07-components-page-39-in-7-families
service: docs-site
feature: UC-GEND-02
priority: P0
type: happy_path
tier: visible
scope: task
---

# Components page shows all 39 components under exactly the 7 AI families

Open `/components` in the built site and count cards per family heading.

**Expected**: exactly 7 family sections render in a stable order — conversation, message, prompt-input, reasoning, sources, suggestion, tool — and their card counts sum to exactly 39. Every `registry:component` name in `src/data/registry-items.json` (e.g. `conversation`, `shimmer`, `persona`, `sources`) appears on exactly one card, and no card links anywhere except to a real `/components/{item}` page that exists in `dist/`.
