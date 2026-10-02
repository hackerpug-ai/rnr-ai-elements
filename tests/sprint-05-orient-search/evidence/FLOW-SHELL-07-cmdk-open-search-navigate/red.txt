
Running 3 tests using 1 worker
FFF

  1) [chromium-desktop] › tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:177:1 › FLOW-SHELL-07-cmdk-open-search-navigate 

    Error: the integrated candidate must serve /docs/introduction with HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      273 |     intro?.status(),
      274 |     'the integrated candidate must serve /docs/introduction with HTTP 200',
    > 275 |   ).toBe(200);
          |     ^
      276 |   await waitForAstroPageLoad(page);
      277 |   await page.keyboard.press(shortcut);
      278 |   await page.locator(`${OPEN_SEARCH_DIALOG}`).waitFor({ state: 'visible', timeout: 5_000 });
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:275:5

    Error Context: test-results/sprint-05-orient-search-cm-383c0-7-cmdk-open-search-navigate-chromium-desktop/error-context.md

    Error Context: test-results/sprint-05-orient-search-cm-383c0-7-cmdk-open-search-navigate-chromium-desktop/error-context.md

  2) [chromium-mobile] › tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:177:1 › FLOW-SHELL-07-cmdk-open-search-navigate 

    Error: the integrated candidate must serve /docs/introduction with HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      273 |     intro?.status(),
      274 |     'the integrated candidate must serve /docs/introduction with HTTP 200',
    > 275 |   ).toBe(200);
          |     ^
      276 |   await waitForAstroPageLoad(page);
      277 |   await page.keyboard.press(shortcut);
      278 |   await page.locator(`${OPEN_SEARCH_DIALOG}`).waitFor({ state: 'visible', timeout: 5_000 });
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:275:5

    Error Context: test-results/sprint-05-orient-search-cm-383c0-7-cmdk-open-search-navigate-chromium-mobile/error-context.md

    Error Context: test-results/sprint-05-orient-search-cm-383c0-7-cmdk-open-search-navigate-chromium-mobile/error-context.md

  3) [chromium-nojs] › tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:177:1 › FLOW-SHELL-07-cmdk-open-search-navigate 

    Error: no-JS /docs/introduction responds 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      185 |     // -- JavaScript-disabled journey: links and real 404 recovery only -------
      186 |     const intro = await navigateLocalhost(page, '/docs/introduction');
    > 187 |     soft(intro?.status(), 'no-JS /docs/introduction responds 200').toBe(200);
          |                                                                    ^
      188 |     const introText = (
      189 |       await page.locator('[data-pagefind-body]').innerText({ timeout: 10_000 })
      190 |     ).replace(/\s+/g, ' ');
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:187:68

    TimeoutError: locator.innerText: Timeout 10000ms exceeded.
    Call log:
      - waiting for locator('[data-pagefind-body]')


      187 |     soft(intro?.status(), 'no-JS /docs/introduction responds 200').toBe(200);
      188 |     const introText = (
    > 189 |       await page.locator('[data-pagefind-body]').innerText({ timeout: 10_000 })
          |                                                  ^
      190 |     ).replace(/\s+/g, ' ');
      191 |     soft(introText.length, 'no-JS introduction renders readable content').toBeGreaterThan(200);
      192 |
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:189:50

    Error Context: test-results/sprint-05-orient-search-cm-383c0-7-cmdk-open-search-navigate-chromium-nojs/error-context.md

    Error Context: test-results/sprint-05-orient-search-cm-383c0-7-cmdk-open-search-navigate-chromium-nojs/error-context.md

  3 failed
    [chromium-desktop] › tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:177:1 › FLOW-SHELL-07-cmdk-open-search-navigate 
    [chromium-mobile] › tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:177:1 › FLOW-SHELL-07-cmdk-open-search-navigate 
    [chromium-nojs] › tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts:177:1 › FLOW-SHELL-07-cmdk-open-search-navigate 
