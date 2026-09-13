@@RUN-FLOW flow=FLOW-SHELL-13-engine-tab-persists-across-pages sprint=sprint-04-generated-reference expect=red cmd_sha=785e36535c8ea4ec3535df3ea868e79a85a352b92de58f802ba055eb14ec4339 head=58e92c5824f2ae020a50e642be702504b88da3b6+dirty at=2026-09-13T22:34:16Z@@
+ pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages

Running 3 tests using 1 worker
FFF

  1) [chromium-desktop] › tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:159:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 

    Error: shimmer: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: checkpoint: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: image: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: persona: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: speech-input: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: conversation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: message: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: prompt-input: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: suggestion: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: tool: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: reasoning: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: task: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: question: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: agent: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: chain-of-thought: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: plan: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: confirmation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: queue: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: sources: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: inline-citation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: artifact: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: snippet: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: commit: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: attachments: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: context: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: open-in-chat: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: model-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: mic-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: voice-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: audio-player: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: transcription: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: terminal: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: file-tree: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: environment-variables: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: package-info: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: stack-trace: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: schema-display: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: test-results: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: web-preview: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error Context: test-results/sprint-04-generated-refere-d8bd1-e-tab-persists-across-pages-chromium-desktop/error-context.md

  2) [chromium-mobile] › tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:159:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 

    Error: shimmer: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: checkpoint: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: image: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: persona: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: speech-input: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: conversation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: message: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: prompt-input: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: suggestion: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: tool: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: reasoning: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: task: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: question: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: agent: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: chain-of-thought: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: plan: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: confirmation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: queue: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: sources: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: inline-citation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: artifact: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: snippet: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: commit: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: attachments: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: context: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: open-in-chat: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: model-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: mic-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: voice-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: audio-player: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: transcription: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: terminal: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: file-tree: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: environment-variables: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: package-info: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: stack-trace: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: schema-display: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: test-results: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: web-preview: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error Context: test-results/sprint-04-generated-refere-d8bd1-e-tab-persists-across-pages-chromium-mobile/error-context.md

  3) [chromium-nojs] › tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:159:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 

    Error: shimmer: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: checkpoint: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: image: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: persona: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: speech-input: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: conversation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: message: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: prompt-input: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: suggestion: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: tool: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: reasoning: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: task: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: question: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: agent: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: chain-of-thought: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: plan: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: confirmation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: queue: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: sources: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: inline-citation: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: artifact: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: snippet: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: commit: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: attachments: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: context: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: open-in-chat: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: model-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: mic-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: voice-selector: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: audio-player: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: transcription: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: terminal: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: file-tree: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: environment-variables: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: package-info: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: stack-trace: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: schema-display: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: test-results: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error: web-preview: top-level section[data-section] order — expected ["install","source","props","theming","usage"]

    expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 1

      Array [
        "install",
    +   "dependencies",
        "source",
    -   "props",
    -   "theming",
    -   "usage",
      ]

      84 |         EXPECTED_SECTIONS,
      85 |       )}`,
    > 86 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      87 |     ok =
      88 |       ok &&
      89 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:86:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:163:21

    Error Context: test-results/sprint-04-generated-refere-d8bd1-e-tab-persists-across-pages-chromium-nojs/error-context.md

  3 failed
    [chromium-desktop] › tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:159:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 
    [chromium-mobile] › tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:159:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 
    [chromium-nojs] › tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts:159:1 › FLOW-SHELL-13-engine-tab-persists-across-pages 
@@GATE-EXIT=1@@
