@@RUN-FLOW flow=FLOW-SHELL-16-not-found-search-recovery sprint=sprint-05-orient-search expect=red cmd_sha=bb838d1aca0f9418cc364d3f71c7ea051daf28265fb37bea366a7f96e622d8b6 head=21862449c5da5659c9a25fceed1ced1cee4d7c49+dirty at=2026-09-25T17:48:03Z@@
+ pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery

Running 15 tests using 1 worker
FFFTFFFFTFFFFFF

  1) [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:363:1 › FLOW-SHELL-16-not-found-search-recovery: locked 8-step sequence 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:397:9

    Error Context: test-results/sprint-05-orient-search-no-ad2d8-very-locked-8-step-sequence-chromium-desktop/error-context.md

  2) [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:538:1 › FLOW-SHELL-16-not-found-search-recovery: AC-1 recover to Message through shared search 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:553:9

    Error Context: test-results/sprint-05-orient-search-no-c9ba5-ssage-through-shared-search-chromium-desktop/error-context.md

  3) [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:589:1 › FLOW-SHELL-16-not-found-search-recovery: AC-2 manuscript-backed recovery document and retained shell 

    Error: the build must emit apps/docs/dist/404.html

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      598 |   // the real build output and the real docs collection sources.
      599 |   const distPath = join(process.cwd(), DIST_404_PATH);
    > 600 |   expect(existsSync(distPath), 'the build must emit apps/docs/dist/404.html').toBe(true);
          |                                                                               ^
      601 |   const emitted = readFileSync(distPath, 'utf8');
      602 |   expect(emitted).toContain(parts.title);
      603 |   expect(emitted).toContain(parts.explanation);
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:600:79

    Error Context: test-results/sprint-05-orient-search-no-f2af4-document-and-retained-shell-chromium-desktop/error-context.md

  4) [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:654:1 › FLOW-SHELL-16-not-found-search-recovery: AC-3 focus restoration and index exclusion 

    Test timeout of 150000ms exceeded.

    Error: locator.click: Test timeout of 150000ms exceeded.
    Call log:
      - waiting for locator('[data-recovery-search]')


      245 | /** Open the dialog through the recovery page's Search the site control. */
      246 | async function openRecoverySearch(page: Page): Promise<void> {
    > 247 |   await page.locator(RECOVERY_SEARCH_TRIGGER).click();
          |                                               ^
      248 |   await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
      249 | }
      250 |
        at openRecoverySearch (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:247:47)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:668:9

    Error Context: test-results/sprint-05-orient-search-no-f8d1b-oration-and-index-exclusion-chromium-desktop/error-context.md

  5) [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:734:1 › FLOW-SHELL-16-not-found-search-recovery: AC-4 recover through ordinary links without JavaScript 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:745:9

    Error Context: test-results/sprint-05-orient-search-no-78bba-ry-links-without-JavaScript-chromium-desktop/error-context.md

  6) [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:363:1 › FLOW-SHELL-16-not-found-search-recovery: locked 8-step sequence 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:397:9

    Error Context: test-results/sprint-05-orient-search-no-ad2d8-very-locked-8-step-sequence-chromium-mobile/error-context.md

  7) [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:538:1 › FLOW-SHELL-16-not-found-search-recovery: AC-1 recover to Message through shared search 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:553:9

    Error Context: test-results/sprint-05-orient-search-no-c9ba5-ssage-through-shared-search-chromium-mobile/error-context.md

  8) [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:589:1 › FLOW-SHELL-16-not-found-search-recovery: AC-2 manuscript-backed recovery document and retained shell 

    Error: the build must emit apps/docs/dist/404.html

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      598 |   // the real build output and the real docs collection sources.
      599 |   const distPath = join(process.cwd(), DIST_404_PATH);
    > 600 |   expect(existsSync(distPath), 'the build must emit apps/docs/dist/404.html').toBe(true);
          |                                                                               ^
      601 |   const emitted = readFileSync(distPath, 'utf8');
      602 |   expect(emitted).toContain(parts.title);
      603 |   expect(emitted).toContain(parts.explanation);
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:600:79

    Error Context: test-results/sprint-05-orient-search-no-f2af4-document-and-retained-shell-chromium-mobile/error-context.md

  9) [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:654:1 › FLOW-SHELL-16-not-found-search-recovery: AC-3 focus restoration and index exclusion 

    Test timeout of 150000ms exceeded.

    Error: locator.click: Test timeout of 150000ms exceeded.
    Call log:
      - waiting for locator('[data-recovery-search]')


      245 | /** Open the dialog through the recovery page's Search the site control. */
      246 | async function openRecoverySearch(page: Page): Promise<void> {
    > 247 |   await page.locator(RECOVERY_SEARCH_TRIGGER).click();
          |                                               ^
      248 |   await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
      249 | }
      250 |
        at openRecoverySearch (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:247:47)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:668:9

    Error Context: test-results/sprint-05-orient-search-no-f8d1b-oration-and-index-exclusion-chromium-mobile/error-context.md

  10) [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:734:1 › FLOW-SHELL-16-not-found-search-recovery: AC-4 recover through ordinary links without JavaScript 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:745:9

    Error Context: test-results/sprint-05-orient-search-no-78bba-ry-links-without-JavaScript-chromium-mobile/error-context.md

  11) [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:363:1 › FLOW-SHELL-16-not-found-search-recovery: locked 8-step sequence 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at expectNoJsRecoverySurface (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:179:9)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:371:5

    Error Context: test-results/sprint-05-orient-search-no-ad2d8-very-locked-8-step-sequence-chromium-nojs/error-context.md

  12) [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:538:1 › FLOW-SHELL-16-not-found-search-recovery: AC-1 recover to Message through shared search 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at expectNoJsRecoverySurface (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:179:9)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:545:5

    Error Context: test-results/sprint-05-orient-search-no-c9ba5-ssage-through-shared-search-chromium-nojs/error-context.md

  13) [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:589:1 › FLOW-SHELL-16-not-found-search-recovery: AC-2 manuscript-backed recovery document and retained shell 

    Error: the build must emit apps/docs/dist/404.html

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      598 |   // the real build output and the real docs collection sources.
      599 |   const distPath = join(process.cwd(), DIST_404_PATH);
    > 600 |   expect(existsSync(distPath), 'the build must emit apps/docs/dist/404.html').toBe(true);
          |                                                                               ^
      601 |   const emitted = readFileSync(distPath, 'utf8');
      602 |   expect(emitted).toContain(parts.title);
      603 |   expect(emitted).toContain(parts.explanation);
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:600:79

    Error Context: test-results/sprint-05-orient-search-no-f2af4-document-and-retained-shell-chromium-nojs/error-context.md

  14) [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:654:1 › FLOW-SHELL-16-not-found-search-recovery: AC-3 focus restoration and index exclusion 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at expectNoJsRecoverySurface (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:179:9)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:661:5

    Error Context: test-results/sprint-05-orient-search-no-f8d1b-oration-and-index-exclusion-chromium-nojs/error-context.md

  15) [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:734:1 › FLOW-SHELL-16-not-found-search-recovery: AC-4 recover through ordinary links without JavaScript 

    Error: the served title must equal the manuscript title

    expect(locator).toHaveText(expected) failed

    Locator:  getByRole('heading', { level: 1 })
    Expected: "Page not found"
    Received: "404:  Not Found"
    Timeout:  5000ms

    Call log:
      - the served title must equal the manuscript title getByRole('heading', { level: 1 }) with timeout 5000ms
      - waiting for getByRole('heading', { level: 1 })
        14 × locator resolved to <h1>…</h1>
           - unexpected value "404:  Not Found"


      145 |     page.getByRole('heading', { level: 1 }),
      146 |     'the served title must equal the manuscript title',
    > 147 |   ).toHaveText(parts.title, { timeout: 5_000 });
          |     ^
      148 |   const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      149 |   expect(bodyText, 'the manuscript explanation must be served').toContain(parts.explanation);
      150 |   expect(bodyText, 'the manuscript search hint must be served').toContain(parts.hint);
        at expectRecoveryContent (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:147:5)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009/tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:745:9

    Error Context: test-results/sprint-05-orient-search-no-78bba-ry-links-without-JavaScript-chromium-nojs/error-context.md

  15 failed
    [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:363:1 › FLOW-SHELL-16-not-found-search-recovery: locked 8-step sequence 
    [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:538:1 › FLOW-SHELL-16-not-found-search-recovery: AC-1 recover to Message through shared search 
    [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:589:1 › FLOW-SHELL-16-not-found-search-recovery: AC-2 manuscript-backed recovery document and retained shell 
    [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:654:1 › FLOW-SHELL-16-not-found-search-recovery: AC-3 focus restoration and index exclusion 
    [chromium-desktop] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:734:1 › FLOW-SHELL-16-not-found-search-recovery: AC-4 recover through ordinary links without JavaScript 
    [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:363:1 › FLOW-SHELL-16-not-found-search-recovery: locked 8-step sequence 
    [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:538:1 › FLOW-SHELL-16-not-found-search-recovery: AC-1 recover to Message through shared search 
    [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:589:1 › FLOW-SHELL-16-not-found-search-recovery: AC-2 manuscript-backed recovery document and retained shell 
    [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:654:1 › FLOW-SHELL-16-not-found-search-recovery: AC-3 focus restoration and index exclusion 
    [chromium-mobile] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:734:1 › FLOW-SHELL-16-not-found-search-recovery: AC-4 recover through ordinary links without JavaScript 
    [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:363:1 › FLOW-SHELL-16-not-found-search-recovery: locked 8-step sequence 
    [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:538:1 › FLOW-SHELL-16-not-found-search-recovery: AC-1 recover to Message through shared search 
    [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:589:1 › FLOW-SHELL-16-not-found-search-recovery: AC-2 manuscript-backed recovery document and retained shell 
    [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:654:1 › FLOW-SHELL-16-not-found-search-recovery: AC-3 focus restoration and index exclusion 
    [chromium-nojs] › tests/sprint-05-orient-search/not-found-search-recovery.spec.ts:734:1 › FLOW-SHELL-16-not-found-search-recovery: AC-4 recover through ordinary links without JavaScript 
@@GATE-EXIT=1@@
