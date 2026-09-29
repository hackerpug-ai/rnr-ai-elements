---
flow_id: FLOW-DOCS-03-five-guides-index
service: docs-site
feature: UC-DOCS-03
priority: P1
type: happy_path
tier: visible
scope: task
---

# Guides index shows exactly the five launch guides

Open /guides and count the entries: customizing oklch tokens, updating installed items, previewing via Expo Go, customizing rendering (renderMarkdown + TextClassContext), and troubleshooting. Open each linked /guides/{slug} page. Expected output: the index lists exactly 5 guides (not 4, not 6), every guide page returns 200 with a complete how-to (goal, prerequisites, steps with expected results, verification), and none is a stub. The rendering guide documents BOTH seams (renderMarkdown and TextClassContext) and is linked from component pages that use them; the troubleshooting guide carries symptom-to-cause-to-fix entries for the short-name collision, wrong-engine symptoms, the Expo Go cliff, and the markdown streaming crash. Each guide's title matches its index card.
