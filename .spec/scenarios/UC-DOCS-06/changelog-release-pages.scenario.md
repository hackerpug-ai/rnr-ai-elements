---
flow_id: FLOW-DOCS-06-changelog-release-pages
service: docs-site
feature: UC-DOCS-06
priority: P1
type: happy_path
tier: visible
scope: task
---

# Changelog reads newest-first with per-release pages

Browse /changelog. Entries appear in reverse chronological order (0.2.1 above 0.2.0, older releases below). Open /changelog/0.2.1. Expected output: the page shows the literal release date plus added, changed, and fixed lists, and the component names it touched link to their component pages. Both /changelog and /changelog/0.2.1 return 200.
