## Cycle 2 remediation evidence (2026-09-10)

- red/e2e-docs-before-fix.out — full lane `pnpm e2e:docs` BEFORE the fix: exit 1, 3 failed / 2 skipped / 10 passed. All 3 failures are the FUSE-09 specs running unguarded under the [chromium-nojs] project (TC-1 clipboard, TC-2 data-state stays idle, FLOW-GEND-02 clipboard).
- green/e2e-docs-full-lane.out — same full lane AFTER the fix: exit 0, 16 passed / 5 skipped / 0 failed (5 skipped = 3 FUSE-09 JS-dependent tests skipped under chromium-nojs by the javaScriptEnabled project guard + 2 pre-existing deliv skips).
- green/label-restore-check.out — real-browser check of the setState idle fix: click → data-state "copied" + text "Copied"; 2.3s later → data-state "idle" + text "Copy" (original server-rendered label restored).
- green/sprint-vitest-full.out — full sprint vitest dir: 8 files / 16 tests pass (island-budget still exactly 1 define, 0 framework imports).
