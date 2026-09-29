---
flow_id: FLOW-SHELL-20-print-preserves-code-and-tables
service: docs-site
feature: UC-SHELL-04
priority: P2
type: happy_path
tier: visible
scope: task
---

# Print styles preserve code blocks and tables

On `/components/message`, emulate print media (`page.emulateMedia({ media: 'print' })` or a real print preview) in both site themes. Expected: the print stylesheet forces the light palette regardless of the on-screen theme; sidebar, TOC, header actions, theme toggle, and mobile drawer are hidden; both engine panels print expanded and labeled (nativewind and uniwind variants both visible); the props table prints in full. Assert `break-inside: avoid` on cards, table rows, and code frames (no row or code frame split across pages); install URLs print in full after their links (not just underlined anchor text); no max-height or overflow clipping truncates code text in print rendering.
