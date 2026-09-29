================================================================================
TASK: GBC-006 - Content review: TR-12 conformance and boundary/porting/ledger cross-check
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     3
AGENT:      planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

PROPOSED BY: techwriting-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- Reconcile the boundary page's gaps list, the 56-item ledger, and the /porting not-ported list so the cross-check yields zero contradictions and zero known omissions.
- Enforce TR-12: active voice, second person, the terminology lock (engine, engine tree, registry item, family, verdict, peers, dev client), the Guide and Troubleshooting templates, and the single-canonical-page rule.
- Fix any contradiction or omission by editing the owning file in write_allowed.
- Record the per-entry git-log reconciliation for GBC-005 (each entry's body lines checked against its cited commit range) as review evidence.
- Leave the tree green for the stranger's cross-check.
NEVER:
- Never ship a gap that names a shipped registry item or omits a known missing element.
- Never introduce a second boundary page or a boundary-table copy on /porting.
- Never edit packages/registry/**, pages/**, components/**, content.config.ts, or generated data.
- Never substitute a mock or canned answer for the real built-preview cross-check.
- Never author the automated e2e specs (route-owning tasks and GBC-014 own them per the locked flows).
STRICTLY:
- Strictly read the ledger from the rendered /registry page or the tracked packages/registry/registry.json (read-only — never depend on gitignored generated files existing before a build).
- Strictly keep the cross-check a reconciliation over real rendered content.
- Strictly confirm every gap is a consumer-owned responsibility or a named not-ported element.
- UNIT_TEST_JUSTIFIED: AC-1, AC-2, AC-4 and AC-5 are pure set logic and string scans over local markdown, one JSON file and in-memory fixtures with zero network or database I/O, so unit tests are justified.
- NEVER edit tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts: GBC-009 writes it, and AC-3 must keep passing after this task's edits.
- STRICTLY implement the AC-1 checker as one pure function inside content-reconciliation.test.ts and call it on the real files (AC-1) and on the planted fixture (AC-4).
- STRICTLY record the per-page TR-12 verdicts in tests/sprint-06-guides-boundary-changelog/evidence/tr12-verdicts.md with one row per authored page.

## Specification
Objective: A reconciliation pass enforcing TR-12 content standards and the human-gate cross-check invariant so the boundary gaps list, the 56-item ledger, and the /porting not-ported list show zero contradictions and zero known omissions.
Success state: The stranger's gate cross-check passes: boundary gaps list, 56 ledger rows, and not-ported list reconcile with 0 contradictions and 0 omissions.

## Acceptance Criteria
### AC-1: gaps vs ledger vs not-ported reconcile with zero contradictions and omissions
  GIVEN: GIVEN the reconciled boundary manuscript, porting.md and the tracked packages/registry/registry.json
  WHEN:  a vitest source scan cross-checks the gaps array against the 56 ledger names and the notPorted array
  THEN:  0 gaps name a shipped item, every gap is a consumer-owned responsibility stated on the page or a notPorted name, every notPorted name is either a gap or absent from the ledger, and 0 contradictions or omissions remain
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Set comparison of two frontmatter arrays against the 56 names in one JSON file is a pure computation with no I/O beyond reading three local files.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts
  TEST_FUNCTION: gaps, ledger and not-ported reconcile with zero contradictions and omissions
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts

### AC-2: TR-12 terminology and voice conformance
  GIVEN: GIVEN all sprint-06 authored content (guides, boundary, porting, changelog entries) and the per-page verdict file
  WHEN:  a vitest source scan applies the terminology lock and reads the verdict file
  THEN:  0 forbidden terms appear in authored prose, the canonical terms engine, engine tree, registry item and dev client are used where their concepts appear, and the verdict file holds one checklist row per authored page
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Matching a fixed forbidden-term list ('styling engine', 'flavor', 'registry variant', 'support level', 'dev build') and counting verdict rows are pure text checks over local files with no I/O beyond reading them.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts
  TEST_FUNCTION: terminology lock holds and every authored page has a verdict row
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts

### AC-3: single-canonical boundary holds after reconciliation
  GIVEN: GIVEN GBC-009's porting-map spec has landed, and the reconciled content is built into the real preview
  WHEN:  a reviewer opens /docs/owns-vs-does-not-own and /porting after reconciliation
  THEN:  the boundary tables render only on /docs/owns-vs-does-not-own and /porting holds no copy of them
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['reconciliation copied a boundary table onto /porting', 'a second boundary route returns 200']
        EVIDENCE: file_artifact
        - START_REF: reconciled_content_candidate
          ACTION: ["goto /docs/owns-vs-does-not-own and count tables whose cells contain 'tool executor'", "goto /porting and count tables whose cells contain 'tool executor', 'streaming client' or 'useChat'", "count the tables on /porting that have a th with text 'Deviations'", 'request.get /boundary and /docs/boundary and record both statuses']
          MUST_OBSERVE: ["at least 1 table containing 'tool executor' on /docs/owns-vs-does-not-own", "0 tables on /porting containing 'tool executor', 'streaming client' or 'useChat'", "exactly 1 table on /porting with a 'Deviations' th (the mapping table)", 'HTTP status 404 at /boundary and at /docs/boundary']
          MUST_NOT_OBSERVE: ["a table containing 'streaming client' on /porting", 'HTTP status 200 at /boundary or /docs/boundary']

### AC-4: a planted contradiction is caught
  GIVEN: GIVEN the reconciliation checker from AC-1 and a fixture gaps array that names a shipped item (for example 'button')
  WHEN:  a vitest run feeds the fixture to the checker
  THEN:  the checker throws an error naming the offending gap, and the real files from AC-1 still pass, recorded as the test run's red and green output
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (in-memory fixture over pure logic)
  UNIT_TEST_JUSTIFIED: The checker is pure set logic, so a fixture array with one planted shipped-item gap proves it rejects the contradiction with no I/O.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts
  TEST_FUNCTION: planted gap naming a shipped item is rejected by name
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts

### AC-5: porting source holds no second copy of the boundary tables
  GIVEN: GIVEN the reconciled porting.md and boundary manuscript on disk
  WHEN:  a vitest source scan compares the tables in the two files
  THEN:  porting.md contains no table whose header row equals a boundary table header row and no table cell containing 'tool executor', 'streaming client' or 'useChat'
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Comparing table header rows and cell text between two local markdown files is a pure text check with no I/O beyond reading them.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts
  TEST_FUNCTION: porting source has no boundary table copy
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts

## Test Criteria
- TC-1: 0 gaps name one of the 56 registry names, every gap is a stated consumer responsibility or a notPorted name, and the checker reports 0 contradictions and 0 omissions.  (maps_to: AC-1)
- TC-2: The authored prose contains 0 occurrences of 'styling engine', 'flavor', 'registry variant', 'support level' or 'dev build', and the verdict file has 1 row per authored page.  (maps_to: AC-2)
- TC-3: /porting has 0 tables containing 'tool executor', 'streaming client' or 'useChat', and /boundary and /docs/boundary return 404.  (maps_to: AC-3)
- TC-4: A fixture gap naming 'button' makes the checker throw with the gap name in the message.  (maps_to: AC-4)
- TC-5: porting.md has 0 table header rows equal to a boundary table header row and 0 cells containing 'tool executor', 'streaming client' or 'useChat'.  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — terminology lock and content gates
- apps/docs/src/content/docs/owns-vs-does-not-own.mdx — the reconciled gaps list
- apps/docs/src/content/docs/porting.md — the exact not-ported list
- apps/docs/src/data/registry-items.json — the 56-item ledger (read-only)
- .spec/prds/docs-site/12-e2e-testing-criteria.md — T-DOCS-018 (the human gate)

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/guides/**
- apps/docs/src/content/docs/owns-vs-does-not-own.mdx
- apps/docs/src/content/docs/porting.md
- apps/docs/src/content/changelog/**
- tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/evidence/tr12-verdicts.md (NEW)
- tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/content.config.ts
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md', '.spec/prds/docs-site/12-e2e-testing-criteria.md']
Interaction notes: This is the content half of human-gate T-DOCS-018. The automated e2e specs (GBC-014) are the astro lens's deliverable; this task only reconciles content and leaves the tree green.
Pattern: content reconciliation against the cross-check invariant + TR-12 conformance (.spec/prds/docs-site/11-technical-requirements/12-content-standards.md)
Anti-pattern: a gap naming a shipped item; a known missing element absent from the not-ported list; a boundary-table copy on /porting

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts

## Dependencies
Depends on: ['GBC-001', 'GBC-002', 'GBC-003', 'GBC-004', 'GBC-005', 'GBC-009']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-006",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "reconciled_content_candidate": {
      "description": "The reconciled boundary page, the porting page, the guides and the changelog entries enter the real docs content build. The ordered docs build produces the dist that the Playwright-owned astro preview serves at http://localhost:4321. Each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/owns-vs-does-not-own.mdx carries a structured gaps frontmatter array and its boundary tables.",
        "apps/docs/src/content/docs/porting.md carries the mapping and notPorted frontmatter arrays and the mapping table.",
        "packages/registry/registry.json supplies the 56 shipped item names.",
        "GBC-009's porting-map spec and the /porting and /docs/owns-vs-does-not-own routes are built from the same candidate."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the reconciled boundary manuscript, porting.md and the tracked packages/registry/registry.json WHEN a vitest source scan cross-checks the gaps array against the 56 ledger names and the notPorted array THEN 0 gaps name a shipped item, every gap is a consumer-owned responsibility stated on the page or a notPorted name, every notPorted name is either a gap or absent from the ledger, and 0 contradictions or omissions remain",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_function": "gaps, ledger and not-ported reconcile with zero contradictions and omissions",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Set comparison of two frontmatter arrays against the 56 names in one JSON file is a pure computation with no I/O beyond reading three local files.",
      "maps_to_ac": null
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN all sprint-06 authored content (guides, boundary, porting, changelog entries) and the per-page verdict file WHEN a vitest source scan applies the terminology lock and reads the verdict file THEN 0 forbidden terms appear in authored prose, the canonical terms engine, engine tree, registry item and dev client are used where their concepts appear, and the verdict file holds one checklist row per authored page",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_function": "terminology lock holds and every authored page has a verdict row",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Matching a fixed forbidden-term list ('styling engine', 'flavor', 'registry variant', 'support level', 'dev build') and counting verdict rows are pure text checks over local files with no I/O beyond reading them.",
      "maps_to_ac": null
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-009's porting-map spec has landed, and the reconciled content is built into the real preview WHEN a reviewer opens /docs/owns-vs-does-not-own and /porting after reconciliation THEN the boundary tables render only on /docs/owns-vs-does-not-own and /porting holds no copy of them",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium (3 projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "reconciliation copied a boundary table onto /porting",
            "a second boundary route returns 200"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "reconciled_content_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /docs/owns-vs-does-not-own and count tables whose cells contain 'tool executor'",
                "goto /porting and count tables whose cells contain 'tool executor', 'streaming client' or 'useChat'",
                "count the tables on /porting that have a th with text 'Deviations'",
                "request.get /boundary and /docs/boundary and record both statuses"
              ]
            },
            "end_state": {
              "must_observe": [
                "at least 1 table containing 'tool executor' on /docs/owns-vs-does-not-own",
                "0 tables on /porting containing 'tool executor', 'streaming client' or 'useChat'",
                "exactly 1 table on /porting with a 'Deviations' th (the mapping table)",
                "HTTP status 404 at /boundary and at /docs/boundary"
              ],
              "must_not_observe": [
                "a table containing 'streaming client' on /porting",
                "HTTP status 200 at /boundary or /docs/boundary"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the reconciliation checker from AC-1 and a fixture gaps array that names a shipped item (for example 'button') WHEN a vitest run feeds the fixture to the checker THEN the checker throws an error naming the offending gap, and the real files from AC-1 still pass, recorded as the test run's red and green output",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_function": "planted gap naming a shipped item is rejected by name",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_tier": "unit",
      "verification_service": "none (in-memory fixture over pure logic)",
      "surface_policy": null,
      "unit_test_justified": "The checker is pure set logic, so a fixture array with one planted shipped-item gap proves it rejects the contradiction with no I/O.",
      "maps_to_ac": null
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the reconciled porting.md and boundary manuscript on disk WHEN a vitest source scan compares the tables in the two files THEN porting.md contains no table whose header row equals a boundary table header row and no table cell containing 'tool executor', 'streaming client' or 'useChat'",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_function": "porting source has no boundary table copy",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Comparing table header rows and cell text between two local markdown files is a pure text check with no I/O beyond reading them.",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "0 gaps name one of the 56 registry names, every gap is a stated consumer responsibility or a notPorted name, and the checker reports 0 contradictions and 0 omissions.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_function": "gaps, ledger and not-ported reconcile with zero contradictions and omissions",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "The authored prose contains 0 occurrences of 'styling engine', 'flavor', 'registry variant', 'support level' or 'dev build', and the verdict file has 1 row per authored page.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_function": "terminology lock holds and every authored page has a verdict row",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "/porting has 0 tables containing 'tool executor', 'streaming client' or 'useChat', and /boundary and /docs/boundary return 404.",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "A fixture gap naming 'button' makes the checker throw with the gap name in the message.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_function": "planted gap naming a shipped item is rejected by name",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_tier": "unit",
      "verification_service": "none (in-memory fixture over pure logic)",
      "surface_policy": null,
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "porting.md has 0 table header rows equal to a boundary table header row and 0 cells containing 'tool executor', 'streaming client' or 'useChat'.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_function": "porting source has no boundary table copy",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-5"
    }
  ]
}
-->
