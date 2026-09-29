---
flow_id: FLOW-SHELL-11-dialog-keyboard-trap-escape-arrows
service: docs-site
feature: UC-SHELL-02
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Keyboard operation inside the open search dialog

On `/registry`, press Cmd+K and type `message` (results render). Press Tab 10 times: focus stays inside the dialog (input, result options, footer links) and never reaches the page header. Shift+Tab reverses the cycle in the same boundary. Press ArrowDown / ArrowUp: the active option moves (tracked via `aria-activedescendant` on the input or roving tabindex in the listbox) and wraps at the ends. Press Enter on an active result: navigates to the item page. Reopen and press Escape from the input, from a middle option, and after ArrowDown twice: Escape closes the dialog from every position. Every focusable control inside the dialog shows a `:focus-visible` 2px ring with 2px offset when reached by keyboard.
