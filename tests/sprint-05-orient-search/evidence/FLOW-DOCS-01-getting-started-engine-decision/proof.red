@@RUN-FLOW flow=FLOW-DOCS-01-getting-started-engine-decision sprint=sprint-05-orient-search expect=red cmd_sha=2bf73cbb245302f1ca4226300199253f1846e042e458802dd643c6c5dcab5d9a head=38034e972490945b684f5bd5a706bca0479dc659+dirty at=2026-09-25T23:42:29Z@@
+ pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision

Running 12 tests using 1 worker

[1/12] [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence
  1) [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence 

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      216 |   // Step 1: Introduction opens with the product identity.
      217 |   const introduction = await navigateLocalhost(page, '/docs/introduction');
    > 218 |   expect(introduction?.status()).toBe(200);
          |                                  ^
      219 |   await settle(page, testInfo);
      220 |   const introText = await bodyText(page);
      221 |   expect(introText).toContain('universal AI chat and agent UI components for React Native');
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:218:34

    Error Context: test-results/sprint-05-orient-search-ge-e34e7-sion-locked-6-step-sequence-chromium-desktop/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-e34e7-sion-locked-6-step-sequence-chromium-desktop/error-context.md


[2/12] [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport
  2) [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport 

    Test timeout of 120000ms exceeded.

    Error: locator.click: Test timeout of 120000ms exceeded.
    Call log:
      - waiting for locator('[data-search-slot] button')


      259 |   await navigateLocalhost(page, '/docs/introduction');
      260 |   await settle(page, testInfo);
    > 261 |   await page.locator(HEADER_SEARCH_TRIGGER).click();
          |                                             ^
      262 |   await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
      263 |
      264 |   await page.locator(SEARCH_INPUT).fill('transport');
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:261:45

    Error Context: test-results/sprint-05-orient-search-ge-5284d-ry-search-answers-transport-chromium-desktop/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-5284d-ry-search-answers-transport-chromium-desktop/error-context.md


[3/12] [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery
  3) [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery 

    Error: ENOENT: no such file or directory, open '/Users/justinrich/.cache/ori-cont-004-red-38034e97/apps/docs/src/content/system/not-found.md'

      315 |
      316 |   // The served copy is the authored manuscript.
    > 317 |   const manuscript = readFileSync(join(process.cwd(), MANUSCRIPT_PATH), 'utf8');
          |                      ^
      318 |   expect(manuscript).toContain('# Page not found');
      319 |   await expect(page.locator('main h1')).toHaveText('Page not found');
      320 |   const recoveryText = await bodyText(page);
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:317:22

    Error Context: test-results/sprint-05-orient-search-ge-05303-AC-4-unknown-route-recovery-chromium-desktop/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-05303-AC-4-unknown-route-recovery-chromium-desktop/error-context.md


[4/12] [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates
  4) [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates 

    Error: content-verification.md must exist

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      346 |   // The claim ledger exists and covers every authored surface.
      347 |   const ledgerPath = join(repoRoot, LEDGER_PATH);
    > 348 |   expect(existsSync(ledgerPath), 'content-verification.md must exist').toBe(true);
          |                                                                        ^
      349 |   const ledger = readFileSync(ledgerPath, 'utf8');
      350 |   for (const surface of [
      351 |     'introduction.md',
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:348:72

    Error Context: test-results/sprint-05-orient-search-ge-d268e-im-ledger-and-content-gates-chromium-desktop/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-d268e-im-ledger-and-content-gates-chromium-desktop/error-context.md


[5/12] [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence
  5) [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence 

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      216 |   // Step 1: Introduction opens with the product identity.
      217 |   const introduction = await navigateLocalhost(page, '/docs/introduction');
    > 218 |   expect(introduction?.status()).toBe(200);
          |                                  ^
      219 |   await settle(page, testInfo);
      220 |   const introText = await bodyText(page);
      221 |   expect(introText).toContain('universal AI chat and agent UI components for React Native');
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:218:34

    Error Context: test-results/sprint-05-orient-search-ge-e34e7-sion-locked-6-step-sequence-chromium-mobile/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-e34e7-sion-locked-6-step-sequence-chromium-mobile/error-context.md


[6/12] [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport
  6) [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport 

    Test timeout of 120000ms exceeded.

    Error: locator.click: Test timeout of 120000ms exceeded.
    Call log:
      - waiting for locator('[data-search-slot] button')


      259 |   await navigateLocalhost(page, '/docs/introduction');
      260 |   await settle(page, testInfo);
    > 261 |   await page.locator(HEADER_SEARCH_TRIGGER).click();
          |                                             ^
      262 |   await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
      263 |
      264 |   await page.locator(SEARCH_INPUT).fill('transport');
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:261:45

    Error Context: test-results/sprint-05-orient-search-ge-5284d-ry-search-answers-transport-chromium-mobile/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-5284d-ry-search-answers-transport-chromium-mobile/error-context.md


[7/12] [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery
  7) [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery 

    Error: ENOENT: no such file or directory, open '/Users/justinrich/.cache/ori-cont-004-red-38034e97/apps/docs/src/content/system/not-found.md'

      315 |
      316 |   // The served copy is the authored manuscript.
    > 317 |   const manuscript = readFileSync(join(process.cwd(), MANUSCRIPT_PATH), 'utf8');
          |                      ^
      318 |   expect(manuscript).toContain('# Page not found');
      319 |   await expect(page.locator('main h1')).toHaveText('Page not found');
      320 |   const recoveryText = await bodyText(page);
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:317:22

    Error Context: test-results/sprint-05-orient-search-ge-05303-AC-4-unknown-route-recovery-chromium-mobile/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-05303-AC-4-unknown-route-recovery-chromium-mobile/error-context.md


[8/12] [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates
  8) [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates 

    Error: content-verification.md must exist

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      346 |   // The claim ledger exists and covers every authored surface.
      347 |   const ledgerPath = join(repoRoot, LEDGER_PATH);
    > 348 |   expect(existsSync(ledgerPath), 'content-verification.md must exist').toBe(true);
          |                                                                        ^
      349 |   const ledger = readFileSync(ledgerPath, 'utf8');
      350 |   for (const surface of [
      351 |     'introduction.md',
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:348:72

    Error Context: test-results/sprint-05-orient-search-ge-d268e-im-ledger-and-content-gates-chromium-mobile/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-d268e-im-ledger-and-content-gates-chromium-mobile/error-context.md


[9/12] [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence
  9) [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence 

    Error: /docs/introduction must return 200 without JavaScript

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      182 |   for (const route of GETTING_STARTED_ROUTES) {
      183 |     const response = await navigateLocalhost(page, route.path);
    > 184 |     expect(response?.status(), `${route.path} must return 200 without JavaScript`).toBe(200);
          |                                                                                    ^
      185 |     await expect(page.locator('main h1')).toHaveText(route.h1);
      186 |     const text = await bodyText(page);
      187 |     expect(text.length, `${route.path} must stay readable without JavaScript`).toBeGreaterThan(
        at assertNoJsReadingFloor (/Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:184:84)
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:211:5

    Error Context: test-results/sprint-05-orient-search-ge-e34e7-sion-locked-6-step-sequence-chromium-nojs/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-e34e7-sion-locked-6-step-sequence-chromium-nojs/error-context.md


[10/12] [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport
  10) [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport 

    Test timeout of 120000ms exceeded.

    Error: locator.click: Test timeout of 120000ms exceeded.
    Call log:
      - waiting for locator('main a[href="/docs/owns-vs-does-not-own"]').first()


      247 |     // The no-JavaScript floor follows Introduction's boundary link instead.
      248 |     await navigateLocalhost(page, '/docs/introduction');
    > 249 |     await page.locator('main a[href="/docs/owns-vs-does-not-own"]').first().click();
          |                                                                             ^
      250 |     await page.waitForLoadState('load');
      251 |     const text = await bodyText(page);
      252 |     for (const owned of ['transcript state', 'transport', 'streaming client', 'tool execution']) {
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:249:77

    Error Context: test-results/sprint-05-orient-search-ge-5284d-ry-search-answers-transport-chromium-nojs/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-5284d-ry-search-answers-transport-chromium-nojs/error-context.md


[11/12] [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery
  11) [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery 

    Error: ENOENT: no such file or directory, open '/Users/justinrich/.cache/ori-cont-004-red-38034e97/apps/docs/src/content/system/not-found.md'

      315 |
      316 |   // The served copy is the authored manuscript.
    > 317 |   const manuscript = readFileSync(join(process.cwd(), MANUSCRIPT_PATH), 'utf8');
          |                      ^
      318 |   expect(manuscript).toContain('# Page not found');
      319 |   await expect(page.locator('main h1')).toHaveText('Page not found');
      320 |   const recoveryText = await bodyText(page);
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:317:22

    Error Context: test-results/sprint-05-orient-search-ge-05303-AC-4-unknown-route-recovery-chromium-nojs/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-05303-AC-4-unknown-route-recovery-chromium-nojs/error-context.md


[12/12] [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates
  12) [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates 

    Error: content-verification.md must exist

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      346 |   // The claim ledger exists and covers every authored surface.
      347 |   const ledgerPath = join(repoRoot, LEDGER_PATH);
    > 348 |   expect(existsSync(ledgerPath), 'content-verification.md must exist').toBe(true);
          |                                                                        ^
      349 |   const ledger = readFileSync(ledgerPath, 'utf8');
      350 |   for (const surface of [
      351 |     'introduction.md',
        at /Users/justinrich/.cache/ori-cont-004-red-38034e97/tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:348:72

    Error Context: test-results/sprint-05-orient-search-ge-d268e-im-ledger-and-content-gates-chromium-nojs/error-context.md

    Error Context: test-results/sprint-05-orient-search-ge-d268e-im-ledger-and-content-gates-chromium-nojs/error-context.md


  12 failed
    [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence 
    [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport 
    [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery 
    [chromium-desktop] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates 
    [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence 
    [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport 
    [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery 
    [chromium-mobile] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates 
    [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:208:1 › FLOW-DOCS-01-getting-started-engine-decision: locked 6-step sequence 
    [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:244:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 boundary search answers transport 
    [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:310:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 unknown-route recovery 
    [chromium-nojs] › tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:342:1 › FLOW-DOCS-01-getting-started-engine-decision: AC-4 claim ledger and content gates 
@@GATE-EXIT=1@@
