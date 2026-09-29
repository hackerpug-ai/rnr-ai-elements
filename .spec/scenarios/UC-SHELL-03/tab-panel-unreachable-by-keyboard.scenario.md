---
flow_id: FLOW-SHELL-18-tab-panel-unreachable-by-keyboard
service: docs-site
feature: UC-SHELL-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Both engine panels are reachable and operable by keyboard alone

The regression this catches: click-only divs replacing the WAI-ARIA tabs pattern, leaving one engine's instructions unreachable without a mouse. On `/docs/installation`, focus the tablist (`role="tablist"`) via keyboard. Assert wiring: tabs carry `role="tab"`, panels `role="tabpanel"` labelled by their tabs. Press ArrowRight: selection moves to uniwind and focus follows (selection follows focus); ArrowLeft returns to nativewind; Home and End jump to first and last tab. Each selected tab shows a `:focus-visible` 2px ring with 2px offset. The keyboard-only user can read BOTH panels: select uniwind by arrows only, read the `r/uniwind/` command; arrow back, read `r/nativewind/`. FAIL if any panel is unreachable without a pointer.
