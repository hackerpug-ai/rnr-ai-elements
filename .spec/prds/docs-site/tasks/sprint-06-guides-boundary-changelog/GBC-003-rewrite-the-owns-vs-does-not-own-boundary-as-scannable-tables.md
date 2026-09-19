================================================================================
TASK: GBC-003 - Rewrite the owns-vs-does-not-own boundary as scannable tables
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     5
AGENT:      planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

PROPOSED BY: techwriting-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- Rewrite apps/docs/src/content/docs/owns-vs-does-not-own.mdx in place (renamed from .md), keeping section: getting-started so it stays at /docs/owns-vs-does-not-own.
- Render the ownership split and ships/does-not-ship facts as scannable tables, never prose paragraphs.
- State in a table cell that the library ships no transport, no streaming client, and no tool executor, and that the consumer wires AI SDK v7 useChat.
- List the ownership-split gaps honestly (>=1 listed gap), naming primitives as react-native-reusables and AI compositions as this library.
- Link the worked example app (apps/example) with a resolving non-404 href.
- Author the gaps list as a structured frontmatter array (`gaps`) enumerated from exactly two inputs: the consumer-owned responsibilities already stated on the page and the /porting not-ported list — any gap outside those two inputs is an invention.
- Re-author the page as owns-vs-does-not-own.mdx (rename from .md) so it can host the info Callout; the reserved slug keeps /docs/owns-vs-does-not-own.
NEVER:
- Never invent a shipped capability, a verdict, or a live useChat claim not grounded in the named real sources.
- Never render boundary claims as flowing paragraphs — every claim string must sit inside td/th.
- Never create a second boundary page; home and Introduction carry only one-line teasers plus a link.
- Never name a shipped registry item as a gap (a gap naming a shipped item is a defect).
- Never change routing, content.config.ts, the registry source, or generated data.
STRICTLY:
- Strictly keep section: getting-started frontmatter so the catch-all route is unchanged.
- Strictly use markdown (GFM) tables so every boundary claim lands inside td/th.
- Strictly keep the gaps list reconcilable against the 56-item ledger and the /porting not-ported list.

## Specification
Objective: Convert the boundary page from prose into scannable ownership tables with a ships/does-not-ship table, an ownership-split table, an honest gaps list, and a resolving example-app link.
Success state: A stranger opens /docs/owns-vs-does-not-own and reads, in tables: no transport, no streaming client, no tool executor, consumer wires useChat, primitives belong to react-native-reusables, AI compositions belong here, gaps listed honestly, with a resolving example-app link.

## Acceptance Criteria
### AC-1: boundary renders as tables with ships/does-not-ship facts [PRIMARY]
  GIVEN: the rewritten boundary manuscript and the real built preview
  WHEN:  a visitor opens /docs/owns-vs-does-not-own
  THEN:  the page renders >=2 tables and 'transport', 'streaming client', 'tool executor', and 'useChat' each sit inside a table cell
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["the boundary page renders prose paragraphs instead of tables, or 'useChat' sits outside a table cell"]
        EVIDENCE: screenshot
        - ACTION: ['Open /docs/owns-vs-does-not-own through the real preview', 'Count the rendered tables and inspect the ships/does-not-ship cells']
          MUST_OBSERVE: ['>=2 tables', "the literal 'useChat' inside a table cell", "'transport', 'streaming client', 'tool executor' in does-not-ship cells"]
          MUST_NOT_OBSERVE: ['ownership claims rendered only as prose paragraphs', 'empty table shells']

### AC-2: ownership-split table and honest gaps list
  GIVEN: the rewritten boundary manuscript
  WHEN:  a visitor reads the ownership-split table and gaps section
  THEN:  the page states primitives belong to react-native-reusables and AI compositions belong here, with >=1 honestly listed gap
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the page omits the ownership split, omits react-native-reusables, or lists zero gaps']
        EVIDENCE: file_artifact
        - ACTION: ['Read the ownership-split table and the gaps section']
          MUST_OBSERVE: ["'react-native-reusables' for primitives", 'AI compositions assigned to this library', '>=1 honestly listed gap']
          MUST_NOT_OBSERVE: ['zero gaps', 'primitives assigned to this library']

### AC-3: example-app link resolves
  GIVEN: the rewritten boundary manuscript and the real example app
  WHEN:  a visitor follows the example-app link
  THEN:  the link resolves non-404
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the example-app anchor is a placeholder href or targets an absent path']
        EVIDENCE: file_artifact
        - ACTION: ['Locate the example-app anchor on the boundary page', 'Follow it through the real browser']
          MUST_OBSERVE: ['the example-app anchor resolves non-404']
          MUST_NOT_OBSERVE: ["placeholder href '#'", 'a 404 target']

### AC-4: single-canonical boundary page
  GIVEN: the built preview across home, Introduction, and /porting
  WHEN:  a visitor reads those surfaces
  THEN:  boundary tables render only on /docs/owns-vs-does-not-own; home and Introduction carry teasers; /porting has no second copy
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['boundary tables are duplicated on /porting or the home/Introduction carry full tables rather than teasers']
        EVIDENCE: file_artifact
        - ACTION: ['Open /docs/owns-vs-does-not-own, /porting, /, and /docs/introduction', 'Compare the boundary content across them']
          MUST_OBSERVE: ['boundary tables only on /docs/owns-vs-does-not-own', 'home and Introduction carry one-line teasers plus a link', 'no second copy of the tables on /porting']
          MUST_NOT_OBSERVE: ['full boundary tables on /porting', 'a duplicate boundary page']

### AC-5: no ownership overclaim
  GIVEN: the rewritten boundary manuscript
  WHEN:  a reviewer scans for ownership-claiming language
  THEN:  zero occurrences of built-in streaming client, runs tool calls, or manages transport
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the page claims a built-in streaming client, tool execution, or transport management']
        EVIDENCE: file_artifact
        - ACTION: ['Scan the rendered page for ownership-claiming phrases']
          MUST_OBSERVE: ["zero occurrences of 'ships with a built-in streaming client'", "zero occurrences of 'runs tool calls for you'"]
          MUST_NOT_OBSERVE: ["'built-in streaming client'", "'handles tool execution'", "'manages transport'"]

## Test Criteria
- TC-1: The boundary page renders >=2 tables with transport, streaming client, tool executor, and useChat in table cells.  (maps_to: AC-1)
- TC-2: The ownership-split table names react-native-reusables primitives and this library's AI compositions with >=1 honest gap.  (maps_to: AC-2)
- TC-3: The example-app link resolves non-404.  (maps_to: AC-3)
- TC-4: Boundary tables render only on /docs/owns-vs-does-not-own; home and Introduction carry teasers; /porting has no copy.  (maps_to: AC-4)
- TC-5: Zero ownership-claiming phrases (built-in streaming client, runs tool calls, manages transport).  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — terminology lock and single-canonical-page rule
- apps/docs/src/content/docs/owns-vs-does-not-own.md — the current prose manuscript to rewrite in place
- apps/docs/src/data/registry-items.json — the 56-item ledger for the gaps reconciliation
- .spec/prds/docs-site/04-uc-docs.md — UC-DOCS-04 acceptance criteria
- AGENTS.md — 'What this library owns, and what it does not' ownership split

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/owns-vs-does-not-own.mdx (rewrite in place; rename from .md to host the info Callout)
- tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts (NEW)
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/content.config.ts
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md', '.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: The boundary page stays reachable via the existing /docs/[...id].astro catch-all (no new route). DataTable chrome is an optional frontend binding; content does not depend on it.
Pattern: explanation quadrant as scannable markdown (GFM) tables, single canonical page (.spec/prds/docs-site/11-technical-requirements/12-content-standards.md)
Anti-pattern: prose ownership claims; a second boundary page; a gap naming a shipped registry item

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables

## Dependencies
Depends on: none
Blocks:     ['GBC-006']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-003",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "authored_boundary_tables_candidate": {
      "description": "The rewritten owns-vs-does-not-own.md enters the real docs content build; the registry build and gallery manifest produce the dist served by an owned localhost:4321 preview; each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/owns-vs-does-not-own.md is rewritten as markdown tables with section: getting-started.",
        "apps/docs/src/data/registry-items.json supplies the 56-item ledger for the gaps reconciliation.",
        "apps/docs/src/content/docs/porting.md (GBC-004) supplies the not-ported list for the cross-check.",
        "/docs/owns-vs-does-not-own is built from the candidate's real source."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN the rewritten boundary manuscript and the real built preview WHEN a visitor opens /docs/owns-vs-does-not-own THEN the page renders >=2 tables and transport, streaming client, tool executor, and useChat each sit inside a table cell",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the rewritten boundary manuscript WHEN a visitor reads the ownership-split table and gaps section THEN the page states primitives belong to react-native-reusables and AI compositions belong here, with >=1 honestly listed gap",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the rewritten boundary manuscript and the real example app WHEN a visitor follows the example-app link THEN the link resolves non-404",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the built preview across home, Introduction, and /porting WHEN a visitor reads those surfaces THEN boundary tables render only on /docs/owns-vs-does-not-own; home and Introduction carry teasers; /porting has no second copy",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the rewritten boundary manuscript WHEN a reviewer scans for ownership-claiming language THEN zero occurrences of built-in streaming client, runs tool calls, or manages transport",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "The boundary page renders >=2 tables with transport, streaming client, tool executor, and useChat in table cells.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "The ownership-split table names react-native-reusables primitives and this library's AI compositions with >=1 honest gap.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "The example-app link resolves non-404.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "Boundary tables render only on /docs/owns-vs-does-not-own; home and Introduction carry teasers; /porting has no copy.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "Zero ownership-claiming phrases (built-in streaming client, runs tool calls, manages transport).",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-5"
    }
  ]
}
-->
