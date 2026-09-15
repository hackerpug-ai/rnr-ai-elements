@@RUN-FLOW flow=FLOW-SHELL-01-theme-toggle-persisted-flash-free sprint=sprint-05-orient-search expect=red cmd_sha=659572521fe644465d065c53525a9d85afd960b698bb6e5bb7f602f9fa5e136f head=4e1b2093044ee1d296f7ac5c29c6fdfae56d90e2+dirty at=2026-09-15T17:10:02Z@@
+ pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free

Running 3 tests using 1 worker

[1/3] [chromium-desktop] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free
  1) [chromium-desktop] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free 

    Error: the TokenTable renders at least ten semantic rows

    expect(received).toBeGreaterThanOrEqual(expected)

    Expected: >= 10
    Received:    0

      126 |       await page.locator('tr[data-token]').count(),
      127 |       'the TokenTable renders at least ten semantic rows',
    > 128 |     ).toBeGreaterThanOrEqual(10);
          |       ^
      129 |
      130 |     // Fresh light: complementary classes + scheme + canvas + storage.
      131 |     let state = await readTheme(page);
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-003/tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:128:7

    Error Context: test-results/sprint-05-orient-search-th-4aff1-toggle-persisted-flash-free-chromium-desktop/error-context.md


[2/3] [chromium-mobile] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free
  2) [chromium-mobile] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free 

    Error: the TokenTable renders at least ten semantic rows

    expect(received).toBeGreaterThanOrEqual(expected)

    Expected: >= 10
    Received:    0

      126 |       await page.locator('tr[data-token]').count(),
      127 |       'the TokenTable renders at least ten semantic rows',
    > 128 |     ).toBeGreaterThanOrEqual(10);
          |       ^
      129 |
      130 |     // Fresh light: complementary classes + scheme + canvas + storage.
      131 |     let state = await readTheme(page);
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-003/tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:128:7

    Error Context: test-results/sprint-05-orient-search-th-4aff1-toggle-persisted-flash-free-chromium-mobile/error-context.md


[3/3] [chromium-nojs] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free
  3) [chromium-nojs] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free 

    Error: the TokenTable renders at least ten semantic rows

    expect(received).toBeGreaterThanOrEqual(expected)

    Expected: >= 10
    Received:    0

      126 |       await page.locator('tr[data-token]').count(),
      127 |       'the TokenTable renders at least ten semantic rows',
    > 128 |     ).toBeGreaterThanOrEqual(10);
          |       ^
      129 |
      130 |     // Fresh light: complementary classes + scheme + canvas + storage.
      131 |     let state = await readTheme(page);
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-003/tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:128:7

    Error Context: test-results/sprint-05-orient-search-th-4aff1-toggle-persisted-flash-free-chromium-nojs/error-context.md


  3 failed
    [chromium-desktop] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free 
    [chromium-mobile] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free 
    [chromium-nojs] › tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:107:1 › FLOW-SHELL-01-theme-toggle-persisted-flash-free 
@@GATE-EXIT=1@@
