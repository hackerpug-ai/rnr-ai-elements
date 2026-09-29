---
flow_id: FLOW-SHELL-06-theme-lost-after-clientrouter-swap
service: docs-site
feature: UC-SHELL-01
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Explicit light choice survives ClientRouter soft navigations

The regression this catches: `swapRootAttributes` overwrites root attributes from the incoming document, so a stored light choice under a dark OS flips back to dark after a soft navigation. Set `localStorage['rnr-theme'] = "light"` with prefers-color-scheme: dark. Hard-load `/docs/installation` (light, `.dark` absent). Soft-navigate via header links to `/components`, then `/docs/theming`, then `/registry`. After each `astro:page-load`: `<html>` still has no `.dark` class, page background still `oklch(1 0 0)`, and no transient dark flash between swaps. Finish with a hard load of `/docs/theming`: still light. FAIL if any soft navigation reverts to dark or flashes.
