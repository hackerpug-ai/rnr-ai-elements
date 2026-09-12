@@RUN-FLOW flow=FLOW-GEND-08-family-card-anatomy sprint=sprint-03-family-browse expect=red cmd_sha=3aeffdbac20b3b8be70a914d39d90f8d2bb22d7259d43be8f9628f414e131224 head=fdbc02a5aa7fcb2dde8e2ed573d63d375ad3f69f+dirty at=2026-09-12T21:37:08Z@@
+ pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy

Running 3 tests using 1 worker

[1/3] [chromium-desktop] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy
  1) [chromium-desktop] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy 

    Error: cards_with_all_fields — total cards (lean-list start: 0, expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

       98 |     totalCards,
       99 |     `cards_with_all_fields — total cards (lean-list start: 0, expected ${components.length})`,
    > 100 |   ).toBe(components.length);
          |     ^
      101 |
      102 |   const seen = new Set<string>();
      103 |   let cardsWithAllFields = 0;
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:100:5

    Error: every registry:component renders exactly one card

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      146 |   }
      147 |
    > 148 |   soft(seen.size, 'every registry:component renders exactly one card').toBe(components.length);
          |                                                                        ^
      149 |   soft(
      150 |     cardsWithAllFields,
      151 |     `cards_with_all_fields (lean-list start: 0, expected ${components.length})`,
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:148:72

    Error: cards_with_all_fields (lean-list start: 0, expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      150 |     cardsWithAllFields,
      151 |     `cards_with_all_fields (lean-list start: 0, expected ${components.length})`,
    > 152 |   ).toBe(components.length);
          |     ^
      153 |
      154 |   // The writer fires on a genuine full pass only — never a partial state.
      155 |   if (
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:152:5

    Error Context: test-results/sprint-03-family-browse-ca-3c97c-GEND-08-family-card-anatomy-chromium-desktop/error-context.md


[2/3] [chromium-mobile] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy
  2) [chromium-mobile] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy 

    Error: cards_with_all_fields — total cards (lean-list start: 0, expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

       98 |     totalCards,
       99 |     `cards_with_all_fields — total cards (lean-list start: 0, expected ${components.length})`,
    > 100 |   ).toBe(components.length);
          |     ^
      101 |
      102 |   const seen = new Set<string>();
      103 |   let cardsWithAllFields = 0;
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:100:5

    Error: every registry:component renders exactly one card

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      146 |   }
      147 |
    > 148 |   soft(seen.size, 'every registry:component renders exactly one card').toBe(components.length);
          |                                                                        ^
      149 |   soft(
      150 |     cardsWithAllFields,
      151 |     `cards_with_all_fields (lean-list start: 0, expected ${components.length})`,
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:148:72

    Error: cards_with_all_fields (lean-list start: 0, expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      150 |     cardsWithAllFields,
      151 |     `cards_with_all_fields (lean-list start: 0, expected ${components.length})`,
    > 152 |   ).toBe(components.length);
          |     ^
      153 |
      154 |   // The writer fires on a genuine full pass only — never a partial state.
      155 |   if (
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:152:5

    Error Context: test-results/sprint-03-family-browse-ca-3c97c-GEND-08-family-card-anatomy-chromium-mobile/error-context.md


[3/3] [chromium-nojs] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy
  3) [chromium-nojs] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy 

    Error: cards_with_all_fields — total cards (lean-list start: 0, expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

       98 |     totalCards,
       99 |     `cards_with_all_fields — total cards (lean-list start: 0, expected ${components.length})`,
    > 100 |   ).toBe(components.length);
          |     ^
      101 |
      102 |   const seen = new Set<string>();
      103 |   let cardsWithAllFields = 0;
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:100:5

    Error: every registry:component renders exactly one card

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      146 |   }
      147 |
    > 148 |   soft(seen.size, 'every registry:component renders exactly one card').toBe(components.length);
          |                                                                        ^
      149 |   soft(
      150 |     cardsWithAllFields,
      151 |     `cards_with_all_fields (lean-list start: 0, expected ${components.length})`,
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:148:72

    Error: cards_with_all_fields (lean-list start: 0, expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      150 |     cardsWithAllFields,
      151 |     `cards_with_all_fields (lean-list start: 0, expected ${components.length})`,
    > 152 |   ).toBe(components.length);
          |     ^
      153 |
      154 |   // The writer fires on a genuine full pass only — never a partial state.
      155 |   if (
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/card-anatomy.spec.ts:152:5

    Error Context: test-results/sprint-03-family-browse-ca-3c97c-GEND-08-family-card-anatomy-chromium-nojs/error-context.md


  3 failed
    [chromium-desktop] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy 
    [chromium-mobile] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy 
    [chromium-nojs] › tests/sprint-03-family-browse/card-anatomy.spec.ts:90:1 › FLOW-GEND-08-family-card-anatomy 
@@GATE-EXIT=1@@
