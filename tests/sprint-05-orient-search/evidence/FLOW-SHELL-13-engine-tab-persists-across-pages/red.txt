
Running 3 tests using 1 worker
FFF

  1) [chromium-desktop] › tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:183:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 

    Error: the integrated candidate must serve /docs/installation with HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      196 |     installation?.status(),
      197 |     'the integrated candidate must serve /docs/installation with HTTP 200',
    > 198 |   ).toBe(200);
          |     ^
      199 |   await awaitTabIsland(page);
      200 |   await waitForAstroPageLoad(page);
      201 |   // The documented default is nativewind: the served pre-paint contract itself
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:198:5

    Error Context: test-results/sprint-05-orient-search-en-4c791-e-tab-persists-across-pages-chromium-desktop/error-context.md

    Error Context: test-results/sprint-05-orient-search-en-4c791-e-tab-persists-across-pages-chromium-desktop/error-context.md

  2) [chromium-mobile] › tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:183:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 

    Error: the integrated candidate must serve /docs/installation with HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      196 |     installation?.status(),
      197 |     'the integrated candidate must serve /docs/installation with HTTP 200',
    > 198 |   ).toBe(200);
          |     ^
      199 |   await awaitTabIsland(page);
      200 |   await waitForAstroPageLoad(page);
      201 |   // The documented default is nativewind: the served pre-paint contract itself
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:198:5

    Error Context: test-results/sprint-05-orient-search-en-4c791-e-tab-persists-across-pages-chromium-mobile/error-context.md

    Error Context: test-results/sprint-05-orient-search-en-4c791-e-tab-persists-across-pages-chromium-mobile/error-context.md

  3) [chromium-nojs] › tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:183:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 

    Error: the integrated candidate must serve /docs/installation with HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      196 |     installation?.status(),
      197 |     'the integrated candidate must serve /docs/installation with HTTP 200',
    > 198 |   ).toBe(200);
          |     ^
      199 |   await awaitTabIsland(page);
      200 |   await waitForAstroPageLoad(page);
      201 |   // The documented default is nativewind: the served pre-paint contract itself
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:198:5

    Error Context: test-results/sprint-05-orient-search-en-4c791-e-tab-persists-across-pages-chromium-nojs/error-context.md

    Error Context: test-results/sprint-05-orient-search-en-4c791-e-tab-persists-across-pages-chromium-nojs/error-context.md

  3 failed
    [chromium-desktop] › tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:183:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 
    [chromium-mobile] › tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:183:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 
    [chromium-nojs] › tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts:183:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 
