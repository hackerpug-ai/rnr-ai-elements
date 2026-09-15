@@RUN-FLOW flow=FLOW-GEND-07-registry-ledger-controls sprint=sprint-05-orient-search expect=red cmd_sha=a51ac13a11013e42adc731169e29700201c0fde1b2053faf80f2c35e24d815dd head=4e1b2093044ee1d296f7ac5c29c6fdfae56d90e2+dirty at=2026-09-15T16:56:28Z@@
+ pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls

Running 12 tests using 1 worker
FFTFFFFFFFTF

  1) [chromium-desktop] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:126:1 › FLOW-GEND-07-registry-ledger-controls AC-1: category totals, category/text filtering, recovery of ledger and grid 

    Error: the ledger exposes All/component/ui/lib category controls

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      139 |     await page.locator('[data-category-filter]').count(),
      140 |     'the ledger exposes All/component/ui/lib category controls',
    > 141 |   ).toBe(4);
          |     ^
      142 |
      143 |   await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');
      144 |
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:141:5

    Error Context: test-results/sprint-05-orient-search-re-73bb7-recovery-of-ledger-and-grid-chromium-desktop/error-context.md

  2) [chromium-desktop] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:228:1 › FLOW-GEND-07-registry-ledger-controls AC-2: displayed engine command equals the real clipboard, shared state survives navigation 

    Error: the ledger exposes nativewind + uniwind engine tabs

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      242 |     await page.locator('rnr-ledger-filter rnr-tab-group [role="tab"]').count(),
      243 |     'the ledger exposes nativewind + uniwind engine tabs',
    > 244 |   ).toBe(2);
          |     ^
      245 |
      246 |   await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');
      247 |
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:244:5

    Error Context: test-results/sprint-05-orient-search-re-ed2d2-d-state-survives-navigation-chromium-desktop/error-context.md

  3) [chromium-desktop] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:335:1 › FLOW-GEND-07-registry-ledger-controls AC-3: conversation, item and stack-trace-parser Docs links reach real references 

    Test timeout of 240000ms exceeded.

    Error: locator.getAttribute: Test ended.
    Call log:
      - waiting for locator('tr[id="row-item"] a[data-docs-link]')


      346 |   // Primary gate: ui/lib Docs links point at real reference destinations
      347 |   // (the pre-implementation ledger self-anchors them at #row-{name}).
    > 348 |   const itemHref = await page.locator(`${ROW('item')} a[data-docs-link]`).getAttribute('href');
          |                                                                           ^
      349 |   expect(itemHref, 'item Docs link is a real destination, not a self-anchor').toBe(
      350 |     '/components/item',
      351 |   );
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:348:75

    Error Context: test-results/sprint-05-orient-search-re-9e229-links-reach-real-references-chromium-desktop/error-context.md

  4) [chromium-desktop] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:407:1 › FLOW-GEND-07-registry-ledger-controls AC-4: 56 rows, both labeled commands, no inert controls, working Docs links without JavaScript 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/registry
    Call log:
      - navigating to "http://localhost:4321/registry", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:416:9

    Error Context: test-results/sprint-05-orient-search-re-d0000-cs-links-without-JavaScript-chromium-desktop/error-context.md

  5) [chromium-mobile] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:126:1 › FLOW-GEND-07-registry-ledger-controls AC-1: category totals, category/text filtering, recovery of ledger and grid 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/registry
    Call log:
      - navigating to "http://localhost:4321/registry", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:135:9

    Error Context: test-results/sprint-05-orient-search-re-73bb7-recovery-of-ledger-and-grid-chromium-mobile/error-context.md

  6) [chromium-mobile] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:228:1 › FLOW-GEND-07-registry-ledger-controls AC-2: displayed engine command equals the real clipboard, shared state survives navigation 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/registry
    Call log:
      - navigating to "http://localhost:4321/registry", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:238:9

    Error Context: test-results/sprint-05-orient-search-re-ed2d2-d-state-survives-navigation-chromium-mobile/error-context.md

  7) [chromium-mobile] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:335:1 › FLOW-GEND-07-registry-ledger-controls AC-3: conversation, item and stack-trace-parser Docs links reach real references 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/registry
    Call log:
      - navigating to "http://localhost:4321/registry", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:344:9

    Error Context: test-results/sprint-05-orient-search-re-9e229-links-reach-real-references-chromium-mobile/error-context.md

  8) [chromium-mobile] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:407:1 › FLOW-GEND-07-registry-ledger-controls AC-4: 56 rows, both labeled commands, no inert controls, working Docs links without JavaScript 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/registry
    Call log:
      - navigating to "http://localhost:4321/registry", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:416:9

    Error Context: test-results/sprint-05-orient-search-re-d0000-cs-links-without-JavaScript-chromium-mobile/error-context.md

  9) [chromium-nojs] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:126:1 › FLOW-GEND-07-registry-ledger-controls AC-1: category totals, category/text filtering, recovery of ledger and grid 

    Error: the ledger exposes All/component/ui/lib category controls

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      139 |     await page.locator('[data-category-filter]').count(),
      140 |     'the ledger exposes All/component/ui/lib category controls',
    > 141 |   ).toBe(4);
          |     ^
      142 |
      143 |   await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');
      144 |
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:141:5

    Error Context: test-results/sprint-05-orient-search-re-73bb7-recovery-of-ledger-and-grid-chromium-nojs/error-context.md

  10) [chromium-nojs] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:228:1 › FLOW-GEND-07-registry-ledger-controls AC-2: displayed engine command equals the real clipboard, shared state survives navigation 

    Error: the ledger exposes nativewind + uniwind engine tabs

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      242 |     await page.locator('rnr-ledger-filter rnr-tab-group [role="tab"]').count(),
      243 |     'the ledger exposes nativewind + uniwind engine tabs',
    > 244 |   ).toBe(2);
          |     ^
      245 |
      246 |   await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');
      247 |
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:244:5

    Error Context: test-results/sprint-05-orient-search-re-ed2d2-d-state-survives-navigation-chromium-nojs/error-context.md

  11) [chromium-nojs] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:335:1 › FLOW-GEND-07-registry-ledger-controls AC-3: conversation, item and stack-trace-parser Docs links reach real references 

    Test timeout of 240000ms exceeded.

    Error: locator.getAttribute: Test ended.
    Call log:
      - waiting for locator('tr[id="row-item"] a[data-docs-link]')


      346 |   // Primary gate: ui/lib Docs links point at real reference destinations
      347 |   // (the pre-implementation ledger self-anchors them at #row-{name}).
    > 348 |   const itemHref = await page.locator(`${ROW('item')} a[data-docs-link]`).getAttribute('href');
          |                                                                           ^
      349 |   expect(itemHref, 'item Docs link is a real destination, not a self-anchor').toBe(
      350 |     '/components/item',
      351 |   );
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:348:75

    Error Context: test-results/sprint-05-orient-search-re-9e229-links-reach-real-references-chromium-nojs/error-context.md

  12) [chromium-nojs] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:407:1 › FLOW-GEND-07-registry-ledger-controls AC-4: 56 rows, both labeled commands, no inert controls, working Docs links without JavaScript 

    Error: the no-JS table contains exactly 56 item rows

    expect(received).toBe(expected) // Object.is equality

    Expected: 56
    Received: 0

      420 |     await nojsPage.locator('tr[data-filter-text]').count(),
      421 |     'the no-JS table contains exactly 56 item rows',
    > 422 |   ).toBe(TOTALS.all);
          |     ^
      423 |
      424 |   // Every row carries both labeled engine commands.
      425 |   let missingNativewind = 0;
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-007/tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:422:5

    Error Context: test-results/sprint-05-orient-search-re-d0000-cs-links-without-JavaScript-chromium-nojs/error-context.md

  12 failed
    [chromium-desktop] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:126:1 › FLOW-GEND-07-registry-ledger-controls AC-1: category totals, category/text filtering, recovery of ledger and grid 
    [chromium-desktop] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:228:1 › FLOW-GEND-07-registry-ledger-controls AC-2: displayed engine command equals the real clipboard, shared state survives navigation 
    [chromium-desktop] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:335:1 › FLOW-GEND-07-registry-ledger-controls AC-3: conversation, item and stack-trace-parser Docs links reach real references 
    [chromium-desktop] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:407:1 › FLOW-GEND-07-registry-ledger-controls AC-4: 56 rows, both labeled commands, no inert controls, working Docs links without JavaScript 
    [chromium-mobile] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:126:1 › FLOW-GEND-07-registry-ledger-controls AC-1: category totals, category/text filtering, recovery of ledger and grid 
    [chromium-mobile] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:228:1 › FLOW-GEND-07-registry-ledger-controls AC-2: displayed engine command equals the real clipboard, shared state survives navigation 
    [chromium-mobile] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:335:1 › FLOW-GEND-07-registry-ledger-controls AC-3: conversation, item and stack-trace-parser Docs links reach real references 
    [chromium-mobile] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:407:1 › FLOW-GEND-07-registry-ledger-controls AC-4: 56 rows, both labeled commands, no inert controls, working Docs links without JavaScript 
    [chromium-nojs] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:126:1 › FLOW-GEND-07-registry-ledger-controls AC-1: category totals, category/text filtering, recovery of ledger and grid 
    [chromium-nojs] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:228:1 › FLOW-GEND-07-registry-ledger-controls AC-2: displayed engine command equals the real clipboard, shared state survives navigation 
    [chromium-nojs] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:335:1 › FLOW-GEND-07-registry-ledger-controls AC-3: conversation, item and stack-trace-parser Docs links reach real references 
    [chromium-nojs] › tests/sprint-05-orient-search/registry-ledger-controls.spec.ts:407:1 › FLOW-GEND-07-registry-ledger-controls AC-4: 56 rows, both labeled commands, no inert controls, working Docs links without JavaScript 
@@GATE-EXIT=1@@
