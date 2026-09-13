@@RUN-FLOW flow=FLOW-GEND-34-props-table-generated sprint=sprint-04-generated-reference expect=red cmd_sha=dd59ed7edcfd41876546c47ce09d92d52e007b0446cb6e38babec8a26afd00a7 head=58e92c5824f2ae020a50e642be702504b88da3b6+dirty at=2026-09-13T22:34:02Z@@
+ pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated

Running 3 tests using 1 worker
FFF

  1) [chromium-desktop] › tests/sprint-04-generated-reference/props-table-generated.spec.ts:144:1 › FLOW-GEND-34-props-table-generated 

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

    Error: shimmer: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: shimmer: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: shimmer: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: checkpoint: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: checkpoint: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: checkpoint: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: image: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: image: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: image: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: persona: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: persona: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: persona: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: speech-input: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: speech-input: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: speech-input: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: conversation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: conversation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: conversation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: message: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: message: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: message: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: prompt-input: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: prompt-input: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: prompt-input: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: suggestion: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: suggestion: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: suggestion: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: tool: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: tool: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: tool: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: reasoning: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: reasoning: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: reasoning: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: task: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: task: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: task: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: question: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: question: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: question: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: agent: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: agent: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: agent: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: chain-of-thought: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: chain-of-thought: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: chain-of-thought: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: plan: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: plan: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: plan: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: confirmation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: confirmation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: confirmation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: queue: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: queue: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: queue: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: sources: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: sources: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: sources: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: inline-citation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: inline-citation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: inline-citation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: artifact: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: artifact: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: artifact: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: snippet: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: snippet: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: snippet: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: commit: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: commit: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: commit: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: attachments: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: attachments: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: attachments: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: context: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: context: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: context: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: open-in-chat: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: open-in-chat: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: open-in-chat: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: model-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: model-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: model-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: mic-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: mic-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: mic-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: voice-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: voice-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: voice-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 15
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: audio-player: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: audio-player: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: audio-player: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 12
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: transcription: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: transcription: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: transcription: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: terminal: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: terminal: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: terminal: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: file-tree: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: file-tree: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: file-tree: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: environment-variables: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: environment-variables: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: environment-variables: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: package-info: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: package-info: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: package-info: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: stack-trace: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: stack-trace: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: stack-trace: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: schema-display: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: schema-display: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: schema-display: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: test-results: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: test-results: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: test-results: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: web-preview: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: web-preview: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: web-preview: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: props_tables: rendered props tables across the 39 enumerated pages (expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      207 |     propsTables,
      208 |     `props_tables: rendered props tables across the ${components.length} enumerated pages (expected ${components.length})`,
    > 209 |   ).toBe(components.length);
          |     ^
      210 |   tablesOk &&= propsTables === components.length;
      211 |
      212 |   if (anatomyOk && tablesOk) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:209:5

    Error Context: test-results/sprint-04-generated-refere-7b7d0-ND-34-props-table-generated-chromium-desktop/error-context.md

  2) [chromium-mobile] › tests/sprint-04-generated-reference/props-table-generated.spec.ts:144:1 › FLOW-GEND-34-props-table-generated 

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

    Error: shimmer: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: shimmer: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: shimmer: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: checkpoint: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: checkpoint: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: checkpoint: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: image: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: image: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: image: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: persona: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: persona: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: persona: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: speech-input: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: speech-input: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: speech-input: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: conversation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: conversation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: conversation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: message: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: message: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: message: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: prompt-input: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: prompt-input: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: prompt-input: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: suggestion: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: suggestion: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: suggestion: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: tool: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: tool: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: tool: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: reasoning: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: reasoning: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: reasoning: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: task: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: task: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: task: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: question: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: question: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: question: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: agent: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: agent: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: agent: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: chain-of-thought: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: chain-of-thought: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: chain-of-thought: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: plan: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: plan: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: plan: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: confirmation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: confirmation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: confirmation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: queue: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: queue: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: queue: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: sources: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: sources: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: sources: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: inline-citation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: inline-citation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: inline-citation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: artifact: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: artifact: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: artifact: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: snippet: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: snippet: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: snippet: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: commit: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: commit: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: commit: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: attachments: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: attachments: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: attachments: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: context: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: context: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: context: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: open-in-chat: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: open-in-chat: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: open-in-chat: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: model-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: model-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: model-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: mic-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: mic-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: mic-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: voice-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: voice-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: voice-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 15
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: audio-player: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: audio-player: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: audio-player: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 12
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: transcription: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: transcription: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: transcription: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: terminal: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: terminal: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: terminal: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: file-tree: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: file-tree: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: file-tree: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: environment-variables: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: environment-variables: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: environment-variables: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: package-info: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: package-info: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: package-info: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: stack-trace: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: stack-trace: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: stack-trace: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: schema-display: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: schema-display: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: schema-display: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: test-results: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: test-results: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: test-results: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: web-preview: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: web-preview: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: web-preview: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: props_tables: rendered props tables across the 39 enumerated pages (expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      207 |     propsTables,
      208 |     `props_tables: rendered props tables across the ${components.length} enumerated pages (expected ${components.length})`,
    > 209 |   ).toBe(components.length);
          |     ^
      210 |   tablesOk &&= propsTables === components.length;
      211 |
      212 |   if (anatomyOk && tablesOk) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:209:5

    Error Context: test-results/sprint-04-generated-refere-7b7d0-ND-34-props-table-generated-chromium-mobile/error-context.md

  3) [chromium-nojs] › tests/sprint-04-generated-reference/props-table-generated.spec.ts:144:1 › FLOW-GEND-34-props-table-generated 

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

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

      93 |         EXPECTED_SECTIONS,
      94 |       )}`,
    > 95 |     ).toEqual(EXPECTED_SECTIONS);
         |       ^
      96 |     ok =
      97 |       ok &&
      98 |       sections.length === EXPECTED_SECTIONS.length &&
        at sprint04AnatomyPreamble (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:95:7)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:148:21

    Error: shimmer: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: shimmer: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: shimmer: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: checkpoint: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: checkpoint: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: checkpoint: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: image: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: image: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: image: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: persona: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: persona: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: persona: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: speech-input: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: speech-input: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: speech-input: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: conversation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: conversation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: conversation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: message: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: message: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: message: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: prompt-input: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: prompt-input: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: prompt-input: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: suggestion: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: suggestion: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: suggestion: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: tool: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: tool: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: tool: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: reasoning: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: reasoning: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: reasoning: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: task: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: task: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: task: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: question: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: question: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: question: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: agent: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: agent: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: agent: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: chain-of-thought: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: chain-of-thought: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: chain-of-thought: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: plan: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: plan: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: plan: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: confirmation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: confirmation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: confirmation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: queue: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: queue: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: queue: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: sources: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: sources: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: sources: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: inline-citation: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: inline-citation: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: inline-citation: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: artifact: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: artifact: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: artifact: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: snippet: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: snippet: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: snippet: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: commit: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: commit: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: commit: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: attachments: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: attachments: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: attachments: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: context: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: context: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: context: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: open-in-chat: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: open-in-chat: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: open-in-chat: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: model-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: model-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: model-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: mic-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: mic-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: mic-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 11
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: voice-selector: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: voice-selector: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: voice-selector: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 15
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: audio-player: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: audio-player: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: audio-player: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 12
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: transcription: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: transcription: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: transcription: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: terminal: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: terminal: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: terminal: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: file-tree: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: file-tree: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: file-tree: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: environment-variables: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: environment-variables: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: environment-variables: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: package-info: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: package-info: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: package-info: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: stack-trace: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: stack-trace: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: stack-trace: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 6
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: schema-display: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: schema-display: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: schema-display: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: test-results: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: test-results: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: test-results: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 2
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: web-preview: exactly one props table

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      163 |     const tables = await section.locator('table').count();
      164 |     propsTables += tables;
    > 165 |     soft(tables, `${item.name}: exactly one props table`).toBe(1);
          |                                                           ^
      166 |     tablesOk &&= tables === 1;
      167 |
      168 |     const headers = (await section.locator('thead th').allTextContents()).map((text) =>
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:165:59

    Error: web-preview: props table headers

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 1

    - Array [
    -   "Name",
    -   "Type",
    -   "Default",
    -   "Description",
    - ]
    + Array []

      169 |       text.trim(),
      170 |     );
    > 171 |     soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
          |                                                        ^
      172 |     tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);
      173 |
      174 |     const rows = section.locator('tbody tr');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:171:56

    Error: web-preview: one row per dataset prop

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      174 |     const rows = section.locator('tbody tr');
      175 |     const rowCount = await rows.count();
    > 176 |     soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
          |                                                              ^
      177 |     tablesOk &&= rowCount === item.props.length;
      178 |
      179 |     for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:176:62

    Error: props_tables: rendered props tables across the 39 enumerated pages (expected 39)

    expect(received).toBe(expected) // Object.is equality

    Expected: 39
    Received: 0

      207 |     propsTables,
      208 |     `props_tables: rendered props tables across the ${components.length} enumerated pages (expected ${components.length})`,
    > 209 |   ).toBe(components.length);
          |     ^
      210 |   tablesOk &&= propsTables === components.length;
      211 |
      212 |   if (anatomyOk && tablesOk) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-04-generated-reference/REF-001/tests/sprint-04-generated-reference/props-table-generated.spec.ts:209:5

    Error Context: test-results/sprint-04-generated-refere-7b7d0-ND-34-props-table-generated-chromium-nojs/error-context.md

  3 failed
    [chromium-desktop] › tests/sprint-04-generated-reference/props-table-generated.spec.ts:144:1 › FLOW-GEND-34-props-table-generated 
    [chromium-mobile] › tests/sprint-04-generated-reference/props-table-generated.spec.ts:144:1 › FLOW-GEND-34-props-table-generated 
    [chromium-nojs] › tests/sprint-04-generated-reference/props-table-generated.spec.ts:144:1 › FLOW-GEND-34-props-table-generated 
@@GATE-EXIT=1@@
