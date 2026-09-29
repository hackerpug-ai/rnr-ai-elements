---
flow_id: FLOW-SHELL-10-focus-trapped-in-closed-dialog
service: docs-site
feature: UC-SHELL-02
priority: P1
type: error_handling
tier: holdout
scope: task
---

# Closed search dialog never holds or recaptures focus

On `/registry`, press Cmd+K, type `spinner`, then press Escape. Assert: the `<dialog>` is closed (not open, effectively inert), and `document.activeElement` is the header search trigger button — focus returned, not dumped on `<body>`. Press Tab 10 times: focus cycles through page chrome (header nav, theme toggle) and never enters the closed dialog's input or results. Repeat the open/close cycle 3 times: behavior is identical on the third close (no listener accumulation double-handling Escape, no focus sticking). FAIL if focus lands inside the closed dialog, is lost to `<body>`, or Tab ever moves into closed-dialog content.
