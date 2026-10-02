
Running 3 tests using 1 worker
FFF

  1) [chromium-desktop] › tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:112:1 › FLOW-SHELL-14-tab-panels-in-initial-html 

    Error: the integrated candidate must serve /docs/installation with HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      120 |     installation.status,
      121 |     'the integrated candidate must serve /docs/installation with HTTP 200',
    > 122 |   ).toBe(200);
          |     ^
      123 |   soft(
      124 |     installation.groups,
      125 |     'the installation body renders a complete engine tab group',
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:122:5

    Error Context: test-results/sprint-05-orient-search-ta-d6502--tab-panels-in-initial-html-chromium-desktop/error-context.md

    Error Context: test-results/sprint-05-orient-search-ta-d6502--tab-panels-in-initial-html-chromium-desktop/error-context.md

  2) [chromium-mobile] › tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:112:1 › FLOW-SHELL-14-tab-panels-in-initial-html 

    Error: the integrated candidate must serve /docs/installation with HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      120 |     installation.status,
      121 |     'the integrated candidate must serve /docs/installation with HTTP 200',
    > 122 |   ).toBe(200);
          |     ^
      123 |   soft(
      124 |     installation.groups,
      125 |     'the installation body renders a complete engine tab group',
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:122:5

    Error Context: test-results/sprint-05-orient-search-ta-d6502--tab-panels-in-initial-html-chromium-mobile/error-context.md

    Error Context: test-results/sprint-05-orient-search-ta-d6502--tab-panels-in-initial-html-chromium-mobile/error-context.md

  3) [chromium-nojs] › tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:112:1 › FLOW-SHELL-14-tab-panels-in-initial-html 

    Error: the integrated candidate must serve /docs/installation with HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      120 |     installation.status,
      121 |     'the integrated candidate must serve /docs/installation with HTTP 200',
    > 122 |   ).toBe(200);
          |     ^
      123 |   soft(
      124 |     installation.groups,
      125 |     'the installation body renders a complete engine tab group',
        at /Users/justinrich/Projects/rnr-ai-elements/.tmp/ORI-AST-010/red-candidate/tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:122:5

    Error Context: test-results/sprint-05-orient-search-ta-d6502--tab-panels-in-initial-html-chromium-nojs/error-context.md

    Error Context: test-results/sprint-05-orient-search-ta-d6502--tab-panels-in-initial-html-chromium-nojs/error-context.md

  3 failed
    [chromium-desktop] › tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:112:1 › FLOW-SHELL-14-tab-panels-in-initial-html 
    [chromium-mobile] › tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:112:1 › FLOW-SHELL-14-tab-panels-in-initial-html 
    [chromium-nojs] › tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts:112:1 › FLOW-SHELL-14-tab-panels-in-initial-html 
