---
flow_id: FLOW-SHELL-24-focus-visible-ring-missing
service: docs-site
feature: UC-SHELL-04
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Every interactive element shows a keyboard focus ring

The regression this catches: an interactive element added without the `:focus-visible` treatment (2px solid ring + 2px offset using the ring token). Keyboard-only sweep on `/`, `/docs/installation`, and `/registry`: press Tab repeatedly and traverse header nav, engine tabs, ledger filter input, category tabs, engine toggle, ledger row copy buttons, theme toggle, and pager/footer links. At every stop, `document.activeElement` shows a computed focus indicator (outline or box-shadow resolving to a 2px solid ring with 2px offset in the ring token color) — no stop lands on an element with no indicator. Contrast with pointer: click the same controls with a mouse and assert the ring does NOT appear (`:focus-visible` only, not `:focus`-everywhere). FAIL on any keyboard focus landing invisible.
