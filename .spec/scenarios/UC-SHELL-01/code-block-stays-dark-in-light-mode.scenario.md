---
flow_id: FLOW-SHELL-04-code-block-stays-dark-in-light-mode
service: docs-site
feature: UC-SHELL-01
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Expressive Code frames follow the .dark class, not the OS media query

The regression this catches is the EC default `useDarkModeMediaQuery: true` failure (GitHub discussion #410): OS prefers dark + site toggled to light, and code blocks stay dark. On `/docs/installation` run both adversarial combos: (a) OS dark + site light (`.dark` absent): every `.expressive-code` frame background must resolve to the light `--code-background` `oklch(0.97 0 0)`; (b) OS light + site dark (`.dark` present on `<html>`): frame background must resolve to `oklch(0.235 0 0)`. Inspect the built CSS: the dark theme selector must key on `.dark` (via `themeCssSelector`), not `@media (prefers-color-scheme: dark)`. FAIL if frame theme tracks the OS instead of the `.dark` class in either combo.
