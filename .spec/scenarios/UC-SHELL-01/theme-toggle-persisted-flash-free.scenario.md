---
flow_id: FLOW-SHELL-01-theme-toggle-persisted-flash-free
service: docs-site
feature: UC-SHELL-01
priority: P0
type: happy_path
tier: visible
scope: task
---

# Theme toggle persists and never flashes

Fresh browser context, prefers-color-scheme: light, empty localStorage. Load `/docs/theming`, click the header ThemeToggle (`rnr-theme-toggle`). Expect: `<html>` gains the `.dark` class, `document.documentElement.style.colorScheme` (or the `color-scheme` computed value) flips to `dark`, and `localStorage.getItem('rnr-theme')` returns `"dark"`. Body background resolves to the dark token `oklch(0.145 0 0)` (vs light `oklch(1 0 0)`). Hard-reload the page: theme is still dark and the first painted frame is already dark — no light flash. Toggle back to light: `.dark` removed, storage rewritten to `"light"`. On `/docs/theming` the TokenTable swatches re-sample live, so the `--background` swatch flips with the toggle.
