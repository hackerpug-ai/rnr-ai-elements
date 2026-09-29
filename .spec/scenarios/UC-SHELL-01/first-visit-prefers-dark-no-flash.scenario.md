---
flow_id: FLOW-SHELL-02-first-visit-prefers-dark-no-flash
service: docs-site
feature: UC-SHELL-01
priority: P0
type: happy_path
tier: visible
scope: task
---

# First visit with dark OS preference renders dark from the first frame

Fresh context with `prefers-color-scheme: dark` emulated and no localStorage keys. Cold-navigate (no bfcache) to `/docs/theming`. Assert the moment `<body>` becomes parseable, `<html>` already carries `.dark` and `color-scheme: dark`. Capture every frame from navigation start to load complete: the first non-blank painted frame has the dark page background `oklch(0.145 0 0)`, never white. TokenTable shows the dark oklch values (e.g. `--code-background` = `oklch(0.235 0 0)`). Repeat on `/` and `/components/message` — same result on every route.
