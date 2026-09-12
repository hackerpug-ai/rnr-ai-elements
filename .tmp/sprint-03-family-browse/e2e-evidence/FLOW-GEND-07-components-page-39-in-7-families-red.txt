@@RUN-FLOW flow=FLOW-GEND-07-components-page-39-in-7-families sprint=sprint-03-family-browse expect=red cmd_sha=18fcc21ac91e46daa294cc8a0db99c14d2b24a2274ff3d1398b11ee41be65220 head=fdbc02a5aa7fcb2dde8e2ed573d63d375ad3f69f at=2026-09-12T21:36:54Z@@
+ pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families

Running 3 tests using 1 worker

[1/3] [chromium-desktop] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families
  1) [chromium-desktop] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families 

    Error: exactly 7 family sections (lean-list start renders 9)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 9

      91 |     sectionCount,
      92 |     `exactly ${componentFamilies.length} family sections (lean-list start renders ${families.length})`,
    > 93 |   ).toBe(componentFamilies.length);
         |     ^
      94 |   const sectionIds: string[] = [];
      95 |   for (let index = 0; index < sectionCount; index++) {
      96 |     sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:93:5

    Error: sections render in committed families.json order

    expect(received).toEqual(expected) // deep equality

    - Expected  - 0
    + Received  + 2

    @@ -4,6 +4,8 @@
        "prompt-input",
        "reasoning",
        "sources",
        "suggestion",
        "tool",
    +   "ui",
    +   "lib",
      ]

       96 |     sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
       97 |   }
    >  98 |   soft(sectionIds, 'sections render in committed families.json order').toEqual(
          |                                                                        ^
       99 |     componentFamilies.map((family) => family.id),
      100 |   );
      101 |
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:98:72

    Error: family conversation renders 3 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family conversation count chip reads 3

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family message renders 7 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family message count chip reads 7

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family prompt-input renders 6 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family prompt-input count chip reads 6

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family reasoning renders 7 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family reasoning count chip reads 7

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family sources renders 4 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family sources count chip reads 4

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family suggestion renders 1 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family suggestion count chip reads 1

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family tool renders 11 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family tool count chip reads 11

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: total cards (lean-list start: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      133 |   // duplicated, nothing outside the dataset.
      134 |   const slugs = hrefs.map((href) => href.replace('/components/', ''));
    > 135 |   soft(cardCount, `total cards (lean-list start: 0)`).toBe(components.length);
          |                                                       ^
      136 |   soft(
      137 |     [...slugs].sort(),
      138 |     'card names equal the registry:component names, each exactly once',
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:135:55

    Error: card names equal the registry:component names, each exactly once

    expect(received).toEqual(expected) // deep equality

    - Expected  - 41
    + Received  +  1

    - Array [
    -   "agent",
    -   "artifact",
    -   "attachments",
    -   "audio-player",
    -   "chain-of-thought",
    -   "checkpoint",
    -   "commit",
    -   "confirmation",
    -   "context",
    -   "conversation",
    -   "environment-variables",
    -   "file-tree",
    -   "image",
    -   "inline-citation",
    -   "message",
    -   "mic-selector",
    -   "model-selector",
    -   "open-in-chat",
    -   "package-info",
    -   "persona",
    -   "plan",
    -   "prompt-input",
    -   "question",
    -   "queue",
    -   "reasoning",
    -   "schema-display",
    -   "shimmer",
    -   "snippet",
    -   "sources",
    -   "speech-input",
    -   "stack-trace",
    -   "suggestion",
    -   "task",
    -   "terminal",
    -   "test-results",
    -   "tool",
    -   "transcription",
    -   "voice-selector",
    -   "web-preview",
    - ]
    + Array []

      137 |     [...slugs].sort(),
      138 |     'card names equal the registry:component names, each exactly once',
    > 139 |   ).toEqual(components.map((item) => item.name).sort());
          |     ^
      140 |
      141 |   // Every card href resolves to a real page (root-relative only — a foreign
      142 |   // href is a test bug, not a navigation).
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:139:5

    Error: every card href probed

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      149 |     statuses.push((await request.get(new URL(href, PREVIEW_URL).href)).status());
      150 |   }
    > 151 |   soft(statuses.length, 'every card href probed').toBe(components.length);
          |                                                   ^
      152 |   soft(statuses.filter((status) => status !== 200).length, 'card hrefs NOT returning 200').toBe(0);
      153 |
      154 |   // The writer fires on a genuine full pass only — never a partial state.
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:151:51

    Error Context: test-results/sprint-03-family-browse-co-7e1fb-nents-page-39-in-7-families-chromium-desktop/error-context.md


[2/3] [chromium-mobile] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families
  2) [chromium-mobile] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families 

    Error: exactly 7 family sections (lean-list start renders 9)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 9

      91 |     sectionCount,
      92 |     `exactly ${componentFamilies.length} family sections (lean-list start renders ${families.length})`,
    > 93 |   ).toBe(componentFamilies.length);
         |     ^
      94 |   const sectionIds: string[] = [];
      95 |   for (let index = 0; index < sectionCount; index++) {
      96 |     sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:93:5

    Error: sections render in committed families.json order

    expect(received).toEqual(expected) // deep equality

    - Expected  - 0
    + Received  + 2

    @@ -4,6 +4,8 @@
        "prompt-input",
        "reasoning",
        "sources",
        "suggestion",
        "tool",
    +   "ui",
    +   "lib",
      ]

       96 |     sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
       97 |   }
    >  98 |   soft(sectionIds, 'sections render in committed families.json order').toEqual(
          |                                                                        ^
       99 |     componentFamilies.map((family) => family.id),
      100 |   );
      101 |
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:98:72

    Error: family conversation renders 3 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family conversation count chip reads 3

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family message renders 7 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family message count chip reads 7

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family prompt-input renders 6 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family prompt-input count chip reads 6

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family reasoning renders 7 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family reasoning count chip reads 7

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family sources renders 4 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family sources count chip reads 4

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family suggestion renders 1 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family suggestion count chip reads 1

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family tool renders 11 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family tool count chip reads 11

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: total cards (lean-list start: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      133 |   // duplicated, nothing outside the dataset.
      134 |   const slugs = hrefs.map((href) => href.replace('/components/', ''));
    > 135 |   soft(cardCount, `total cards (lean-list start: 0)`).toBe(components.length);
          |                                                       ^
      136 |   soft(
      137 |     [...slugs].sort(),
      138 |     'card names equal the registry:component names, each exactly once',
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:135:55

    Error: card names equal the registry:component names, each exactly once

    expect(received).toEqual(expected) // deep equality

    - Expected  - 41
    + Received  +  1

    - Array [
    -   "agent",
    -   "artifact",
    -   "attachments",
    -   "audio-player",
    -   "chain-of-thought",
    -   "checkpoint",
    -   "commit",
    -   "confirmation",
    -   "context",
    -   "conversation",
    -   "environment-variables",
    -   "file-tree",
    -   "image",
    -   "inline-citation",
    -   "message",
    -   "mic-selector",
    -   "model-selector",
    -   "open-in-chat",
    -   "package-info",
    -   "persona",
    -   "plan",
    -   "prompt-input",
    -   "question",
    -   "queue",
    -   "reasoning",
    -   "schema-display",
    -   "shimmer",
    -   "snippet",
    -   "sources",
    -   "speech-input",
    -   "stack-trace",
    -   "suggestion",
    -   "task",
    -   "terminal",
    -   "test-results",
    -   "tool",
    -   "transcription",
    -   "voice-selector",
    -   "web-preview",
    - ]
    + Array []

      137 |     [...slugs].sort(),
      138 |     'card names equal the registry:component names, each exactly once',
    > 139 |   ).toEqual(components.map((item) => item.name).sort());
          |     ^
      140 |
      141 |   // Every card href resolves to a real page (root-relative only — a foreign
      142 |   // href is a test bug, not a navigation).
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:139:5

    Error: every card href probed

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      149 |     statuses.push((await request.get(new URL(href, PREVIEW_URL).href)).status());
      150 |   }
    > 151 |   soft(statuses.length, 'every card href probed').toBe(components.length);
          |                                                   ^
      152 |   soft(statuses.filter((status) => status !== 200).length, 'card hrefs NOT returning 200').toBe(0);
      153 |
      154 |   // The writer fires on a genuine full pass only — never a partial state.
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:151:51

    Error Context: test-results/sprint-03-family-browse-co-7e1fb-nents-page-39-in-7-families-chromium-mobile/error-context.md


[3/3] [chromium-nojs] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families
  3) [chromium-nojs] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families 

    Error: exactly 7 family sections (lean-list start renders 9)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 9

      91 |     sectionCount,
      92 |     `exactly ${componentFamilies.length} family sections (lean-list start renders ${families.length})`,
    > 93 |   ).toBe(componentFamilies.length);
         |     ^
      94 |   const sectionIds: string[] = [];
      95 |   for (let index = 0; index < sectionCount; index++) {
      96 |     sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:93:5

    Error: sections render in committed families.json order

    expect(received).toEqual(expected) // deep equality

    - Expected  - 0
    + Received  + 2

    @@ -4,6 +4,8 @@
        "prompt-input",
        "reasoning",
        "sources",
        "suggestion",
        "tool",
    +   "ui",
    +   "lib",
      ]

       96 |     sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
       97 |   }
    >  98 |   soft(sectionIds, 'sections render in committed families.json order').toEqual(
          |                                                                        ^
       99 |     componentFamilies.map((family) => family.id),
      100 |   );
      101 |
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:98:72

    Error: family conversation renders 3 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family conversation count chip reads 3

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family message renders 7 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family message count chip reads 7

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family prompt-input renders 6 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family prompt-input count chip reads 6

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family reasoning renders 7 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family reasoning count chip reads 7

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family sources renders 4 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family sources count chip reads 4

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family suggestion renders 1 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family suggestion count chip reads 1

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: family tool renders 11 cards (lean list: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      115 |     const observed = await cards.count();
      116 |     cardCount += observed;
    > 117 |     soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);
          |                                                                                    ^
      118 |
      119 |     const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      120 |       (text) => text.trim(),
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:117:84

    Error: family tool count chip reads 11

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      121 |     );
      122 |     const countChips = chipValues.filter((value) => value === String(expected)).length;
    > 123 |     soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
          |                                                                          ^
      124 |     familiesOk &&= observed === expected && countChips === 1;
      125 |
      126 |     for (const card of await cards.all()) {
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:123:74

    Error: total cards (lean-list start: 0)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      133 |   // duplicated, nothing outside the dataset.
      134 |   const slugs = hrefs.map((href) => href.replace('/components/', ''));
    > 135 |   soft(cardCount, `total cards (lean-list start: 0)`).toBe(components.length);
          |                                                       ^
      136 |   soft(
      137 |     [...slugs].sort(),
      138 |     'card names equal the registry:component names, each exactly once',
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:135:55

    Error: card names equal the registry:component names, each exactly once

    expect(received).toEqual(expected) // deep equality

    - Expected  - 41
    + Received  +  1

    - Array [
    -   "agent",
    -   "artifact",
    -   "attachments",
    -   "audio-player",
    -   "chain-of-thought",
    -   "checkpoint",
    -   "commit",
    -   "confirmation",
    -   "context",
    -   "conversation",
    -   "environment-variables",
    -   "file-tree",
    -   "image",
    -   "inline-citation",
    -   "message",
    -   "mic-selector",
    -   "model-selector",
    -   "open-in-chat",
    -   "package-info",
    -   "persona",
    -   "plan",
    -   "prompt-input",
    -   "question",
    -   "queue",
    -   "reasoning",
    -   "schema-display",
    -   "shimmer",
    -   "snippet",
    -   "sources",
    -   "speech-input",
    -   "stack-trace",
    -   "suggestion",
    -   "task",
    -   "terminal",
    -   "test-results",
    -   "tool",
    -   "transcription",
    -   "voice-selector",
    -   "web-preview",
    - ]
    + Array []

      137 |     [...slugs].sort(),
      138 |     'card names equal the registry:component names, each exactly once',
    > 139 |   ).toEqual(components.map((item) => item.name).sort());
          |     ^
      140 |
      141 |   // Every card href resolves to a real page (root-relative only — a foreign
      142 |   // href is a test bug, not a navigation).
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:139:5

    Error: every card href probed

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      149 |     statuses.push((await request.get(new URL(href, PREVIEW_URL).href)).status());
      150 |   }
    > 151 |   soft(statuses.length, 'every card href probed').toBe(components.length);
          |                                                   ^
      152 |   soft(statuses.filter((status) => status !== 200).length, 'card hrefs NOT returning 200').toBe(0);
      153 |
      154 |   // The writer fires on a genuine full pass only — never a partial state.
        at /private/tmp/gate-red-fam03/tests/sprint-03-family-browse/components-family-grid.spec.ts:151:51

    Error Context: test-results/sprint-03-family-browse-co-7e1fb-nents-page-39-in-7-families-chromium-nojs/error-context.md


  3 failed
    [chromium-desktop] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families 
    [chromium-mobile] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families 
    [chromium-nojs] › tests/sprint-03-family-browse/components-family-grid.spec.ts:82:1 › FLOW-GEND-07-components-page-39-in-7-families 
@@GATE-EXIT=1@@
