---
flow_id: FLOW-GEND-14-reference-page-anatomy
service: docs-site
feature: UC-GEND-03
priority: P1
type: happy_path
tier: visible
scope: task
---

# A generated reference page carries the full anatomy with the install block first

Open `/components/conversation` (representative for all 39: assert the same checks across every generated page).

**Expected**: the page renders the item title (`Conversation`), its one-line registry description, and a status chip row showing version `0.2.1`, category `component`, both engines (nativewind and uniwind), and an Expo Go verdict. The FIRST content section after the header is the engine-tabbed install block — the DOM order of top-level sections is install block before preview/code views, props table, theming note, and usage snippets.
