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
- STRICTLY begin every test title in boundary-tables.spec.ts with the literal FLOW-DOCS-04-boundary-ownership-tables so the locked --grep selects all five ACs.
- STRICTLY keep AC-4 independent of /porting: the /porting no-second-copy check is proven by GBC-006's unit reconciliation, because /porting does not exist when this spec is written.
- STRICTLY treat the boundary page rename as a move: create apps/docs/src/content/docs/owns-vs-does-not-own.mdx (NEW) and delete the existing owns-vs-does-not-own.md (listed MODIFY because it is removed by the rename). Exactly one of the two files may exist at task close, so the route /docs/owns-vs-does-not-own has a single source.

## Specification
Objective: Convert the boundary page from prose into scannable ownership tables with a ships/does-not-ship table, an ownership-split table, an honest gaps list, and a resolving example-app link.
Success state: A stranger opens /docs/owns-vs-does-not-own and reads, in tables: no transport, no streaming client, no tool executor, consumer wires useChat, primitives belong to react-native-reusables, AI compositions belong here, gaps listed honestly, with a resolving example-app link.

## Acceptance Criteria
### AC-1: boundary renders as tables with ships/does-not-ship facts [PRIMARY]
  GIVEN: GIVEN the rewritten boundary manuscript and the real built preview
  WHEN:  a visitor opens /docs/owns-vs-does-not-own
  THEN:  the page renders >=2 tables and 'transport', 'streaming client', 'tool executor', and 'useChat' each sit inside a table cell
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the boundary page renders prose paragraphs instead of tables', "'useChat' sits in a <p> outside every table cell", 'the tables are empty shells with no body rows']
        EVIDENCE: file_artifact
        - START_REF: authored_boundary_tables_candidate
          ACTION: ['goto /docs/owns-vs-does-not-own and record the response status', 'count <table> elements in the article body', "for each of the 4 terms 'transport', 'streaming client', 'tool executor' and 'useChat', find the enclosing td or th", 'recount tables under the chromium-nojs project']
          MUST_OBSERVE: ['HTTP status 200 at /docs/owns-vs-does-not-own', 'at least 2 <table> elements, each with at least 1 <tbody> row', "4 of 4 terms ('transport', 'streaming client', 'tool executor', 'useChat') appear inside a td or th", 'the nojs recount is also at least 2 tables']
          MUST_NOT_OBSERVE: ['0 tables (prose-only start state)', 'any of the 4 terms appearing only inside a <p> outside a table']

### AC-2: ownership-split table and honest gaps list
  GIVEN: GIVEN the rewritten boundary manuscript built into the real preview
  WHEN:  a visitor reads the ownership-split table and the gaps section
  THEN:  the page states primitives belong to react-native-reusables and AI compositions belong here, with >=1 honestly listed gap
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the page omits the ownership split or never names react-native-reusables', 'the gaps table has 0 body rows', 'primitives are assigned to this library']
        EVIDENCE: file_artifact
        - START_REF: authored_boundary_tables_candidate
          ACTION: ['goto /docs/owns-vs-does-not-own', "find the table row whose first cell contains 'primitives' and read its owner cell", "find the table row whose first cell contains 'AI compositions' and read its owner cell", "count <tbody> rows in the table under the heading with id 'gaps'"]
          MUST_OBSERVE: ["the 'primitives' row owner cell contains the literal 'react-native-reusables'", "the 'AI compositions' row owner cell contains the literal 'this library'", "at least 1 <tbody> row in the table under the heading with id 'gaps'", '0 gap rows whose text names an item present in the 56-item registry ledger']
          MUST_NOT_OBSERVE: ['a gaps table with 0 rows', "the 'primitives' row owner cell reading 'this library'"]

### AC-3: example-app link resolves
  GIVEN: GIVEN the rewritten boundary manuscript built into the real preview
  WHEN:  a visitor follows the example-app link
  THEN:  the link resolves non-404
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["the example-app anchor href is '#' or empty", 'the anchor targets a path that returns 404']
        EVIDENCE: file_artifact
        - START_REF: authored_boundary_tables_candidate
          ACTION: ['goto /docs/owns-vs-does-not-own', 'locate anchors whose text matches /example app/i', 'read the href and request.get it (relative hrefs resolved against http://localhost:4321)']
          MUST_OBSERVE: ['exactly 1 anchor whose text matches /example app/i', "that anchor's href is non-empty and not '#'", 'request.get on that href returns a status below 400']
          MUST_NOT_OBSERVE: ["href '#'", 'an HTTP 404 status on the example-app href']

### AC-4: single-canonical boundary page
  GIVEN: GIVEN the boundary page built into the real preview alongside home and Introduction
  WHEN:  a visitor reads /, /docs/introduction and /docs/owns-vs-does-not-own
  THEN:  boundary tables render only on /docs/owns-vs-does-not-own, and home and Introduction carry one-line teasers plus a link
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['home or Introduction carries a boundary table instead of a teaser', 'a second boundary route returns 200']
        EVIDENCE: file_artifact
        - START_REF: authored_boundary_tables_candidate
          ACTION: ['goto /, /docs/introduction and /docs/owns-vs-does-not-own', "count tables whose cells contain 'tool executor' on each route", "count anchors with href '/docs/owns-vs-does-not-own' on / and /docs/introduction", 'request.get /boundary, /docs/boundary and /docs/ownership and record the statuses']
          MUST_OBSERVE: ["at least 1 table containing 'tool executor' on /docs/owns-vs-does-not-own", "0 tables containing 'tool executor' on / and 0 on /docs/introduction", "exactly 1 anchor with href '/docs/owns-vs-does-not-own' on / and exactly 1 on /docs/introduction", 'HTTP 404 on each of /boundary, /docs/boundary and /docs/ownership']
          MUST_NOT_OBSERVE: ['a boundary table on / or /docs/introduction', 'HTTP 200 on any second boundary route']

### AC-5: no ownership overclaim
  GIVEN: GIVEN the rewritten boundary manuscript built into the real preview
  WHEN:  a reviewer scans the rendered page for ownership-claiming language
  THEN:  zero occurrences of built-in streaming client, runs tool calls, or manages transport
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the page claims a built-in streaming client', 'the page claims the library runs tool calls or manages transport']
        EVIDENCE: file_artifact
        - START_REF: authored_boundary_tables_candidate
          ACTION: ['goto /docs/owns-vs-does-not-own', 'read the full article text', 'count matches of /built-in streaming client|runs tool calls for you|handles tool execution|manages transport/i', "count td cells containing 'no streaming client'"]
          MUST_OBSERVE: ['0 matches of /built-in streaming client|runs tool calls for you|handles tool execution|manages transport/i in the article text', 'at least 1 td cell stating the library ships no streaming client']
          MUST_NOT_OBSERVE: ["the phrase 'built-in streaming client'", "the phrase 'handles tool execution'", "the phrase 'manages transport'"]

## Test Criteria
- TC-1: /docs/owns-vs-does-not-own has at least 2 tables and 'transport', 'streaming client', 'tool executor' and 'useChat' each sit inside a td or th.  (maps_to: AC-1)
- TC-2: The 'primitives' row names 'react-native-reusables', the 'AI compositions' row names 'this library', and the gaps table has at least 1 row naming no shipped registry item.  (maps_to: AC-2)
- TC-3: The example-app anchor has an href other than '#' and request.get returns a status below 400.  (maps_to: AC-3)
- TC-4: Only /docs/owns-vs-does-not-own holds boundary tables, / and /docs/introduction each hold exactly 1 teaser link to it, and /boundary, /docs/boundary and /docs/ownership return 404.  (maps_to: AC-4)
- TC-5: The rendered boundary page has 0 matches for built-in streaming client, runs tool calls for you, handles tool execution and manages transport.  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — terminology lock and single-canonical-page rule
- apps/docs/src/content/docs/owns-vs-does-not-own.md — the current prose manuscript to rewrite in place
- apps/docs/src/data/registry-items.json — the 56-item ledger for the gaps reconciliation
- .spec/prds/docs-site/04-uc-docs.md — UC-DOCS-04 acceptance criteria
- AGENTS.md — 'What this library owns, and what it does not' ownership split

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/owns-vs-does-not-own.mdx (NEW)
- apps/docs/src/content/docs/owns-vs-does-not-own.md (MODIFY)
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
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables

## Dependencies
Depends on: none
Blocks:     ['GBC-006', 'GBC-009', 'GBC-014', 'GBC-017']

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
      "description": "The rewritten owns-vs-does-not-own.mdx enters the real docs content build. The ordered docs build produces the dist that the Playwright-owned astro preview serves at http://localhost:4321. Each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/owns-vs-does-not-own.mdx is rewritten as GFM tables with section: getting-started and a structured gaps frontmatter array.",
        "apps/docs/src/data/registry-items.json supplies the 56-item ledger used to check that no gap names a shipped item.",
        "/docs/owns-vs-does-not-own is built from the candidate's real source, and / and /docs/introduction carry only one-line teasers."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN GIVEN the rewritten boundary manuscript and the real built preview WHEN a visitor opens /docs/owns-vs-does-not-own THEN the page renders >=2 tables and 'transport', 'streaming client', 'tool executor', and 'useChat' each sit inside a table cell",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": true,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium (3 projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the boundary page renders prose paragraphs instead of tables",
            "'useChat' sits in a <p> outside every table cell",
            "the tables are empty shells with no body rows"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_boundary_tables_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /docs/owns-vs-does-not-own and record the response status",
                "count <table> elements in the article body",
                "for each of the 4 terms 'transport', 'streaming client', 'tool executor' and 'useChat', find the enclosing td or th",
                "recount tables under the chromium-nojs project"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /docs/owns-vs-does-not-own",
                "at least 2 <table> elements, each with at least 1 <tbody> row",
                "4 of 4 terms ('transport', 'streaming client', 'tool executor', 'useChat') appear inside a td or th",
                "the nojs recount is also at least 2 tables"
              ],
              "must_not_observe": [
                "0 tables (prose-only start state)",
                "any of the 4 terms appearing only inside a <p> outside a table"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the rewritten boundary manuscript built into the real preview WHEN a visitor reads the ownership-split table and the gaps section THEN the page states primitives belong to react-native-reusables and AI compositions belong here, with >=1 honestly listed gap",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
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
            "the page omits the ownership split or never names react-native-reusables",
            "the gaps table has 0 body rows",
            "primitives are assigned to this library"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_boundary_tables_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /docs/owns-vs-does-not-own",
                "find the table row whose first cell contains 'primitives' and read its owner cell",
                "find the table row whose first cell contains 'AI compositions' and read its owner cell",
                "count <tbody> rows in the table under the heading with id 'gaps'"
              ]
            },
            "end_state": {
              "must_observe": [
                "the 'primitives' row owner cell contains the literal 'react-native-reusables'",
                "the 'AI compositions' row owner cell contains the literal 'this library'",
                "at least 1 <tbody> row in the table under the heading with id 'gaps'",
                "0 gap rows whose text names an item present in the 56-item registry ledger"
              ],
              "must_not_observe": [
                "a gaps table with 0 rows",
                "the 'primitives' row owner cell reading 'this library'"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the rewritten boundary manuscript built into the real preview WHEN a visitor follows the example-app link THEN the link resolves non-404",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
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
            "the example-app anchor href is '#' or empty",
            "the anchor targets a path that returns 404"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_boundary_tables_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /docs/owns-vs-does-not-own",
                "locate anchors whose text matches /example app/i",
                "read the href and request.get it (relative hrefs resolved against http://localhost:4321)"
              ]
            },
            "end_state": {
              "must_observe": [
                "exactly 1 anchor whose text matches /example app/i",
                "that anchor's href is non-empty and not '#'",
                "request.get on that href returns a status below 400"
              ],
              "must_not_observe": [
                "href '#'",
                "an HTTP 404 status on the example-app href"
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
      "description": "GIVEN GIVEN the boundary page built into the real preview alongside home and Introduction WHEN a visitor reads /, /docs/introduction and /docs/owns-vs-does-not-own THEN boundary tables render only on /docs/owns-vs-does-not-own, and home and Introduction carry one-line teasers plus a link",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
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
            "home or Introduction carries a boundary table instead of a teaser",
            "a second boundary route returns 200"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_boundary_tables_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /, /docs/introduction and /docs/owns-vs-does-not-own",
                "count tables whose cells contain 'tool executor' on each route",
                "count anchors with href '/docs/owns-vs-does-not-own' on / and /docs/introduction",
                "request.get /boundary, /docs/boundary and /docs/ownership and record the statuses"
              ]
            },
            "end_state": {
              "must_observe": [
                "at least 1 table containing 'tool executor' on /docs/owns-vs-does-not-own",
                "0 tables containing 'tool executor' on / and 0 on /docs/introduction",
                "exactly 1 anchor with href '/docs/owns-vs-does-not-own' on / and exactly 1 on /docs/introduction",
                "HTTP 404 on each of /boundary, /docs/boundary and /docs/ownership"
              ],
              "must_not_observe": [
                "a boundary table on / or /docs/introduction",
                "HTTP 200 on any second boundary route"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the rewritten boundary manuscript built into the real preview WHEN a reviewer scans the rendered page for ownership-claiming language THEN zero occurrences of built-in streaming client, runs tool calls, or manages transport",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
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
            "the page claims a built-in streaming client",
            "the page claims the library runs tool calls or manages transport"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_boundary_tables_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /docs/owns-vs-does-not-own",
                "read the full article text",
                "count matches of /built-in streaming client|runs tool calls for you|handles tool execution|manages transport/i",
                "count td cells containing 'no streaming client'"
              ]
            },
            "end_state": {
              "must_observe": [
                "0 matches of /built-in streaming client|runs tool calls for you|handles tool execution|manages transport/i in the article text",
                "at least 1 td cell stating the library ships no streaming client"
              ],
              "must_not_observe": [
                "the phrase 'built-in streaming client'",
                "the phrase 'handles tool execution'",
                "the phrase 'manages transport'"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "/docs/owns-vs-does-not-own has at least 2 tables and 'transport', 'streaming client', 'tool executor' and 'useChat' each sit inside a td or th.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "The 'primitives' row names 'react-native-reusables', the 'AI compositions' row names 'this library', and the gaps table has at least 1 row naming no shipped registry item.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "The example-app anchor has an href other than '#' and request.get returns a status below 400.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "Only /docs/owns-vs-does-not-own holds boundary tables, / and /docs/introduction each hold exactly 1 teaser link to it, and /boundary, /docs/boundary and /docs/ownership return 404.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "The rendered boundary page has 0 matches for built-in streaming client, runs tool calls for you, handles tool execution and manages transport.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-5"
    }
  ]
}
-->
