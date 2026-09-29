================================================================================
TASK: GBC-004 - Author the /porting mapping, deviations, and not-ported list
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
- Author apps/docs/src/content/docs/porting.md (section: porting) as the single /porting page.
- Provide an upstream-to-port mapping table with an explicit deviations column and >=5 rows, every mapped slug resolving to one of the 56 shipped items.
- Provide a not-ported list naming exactly the missing upstream elements such that mapping + not-ported equals the upstream total and none matches a shipped item.
- Credit prior art: elements.ai-sdk.dev and muratcakmak/expo-ai-elements with a why-differs statement.
- Emit `mapping`, `notPorted`, and `upstream` as structured frontmatter arrays in porting.md — the machine-readable source GBC-012's gate diffs.
- Pin the upstream enumeration to the vercel/ai-elements registry listing at a recorded URL/commit; note that dated snapshot in the page intro.
NEVER:
- Never invent an upstream element or a mapping row not grounded in the upstream registry and packages/registry/registry.json.
- Never name a shipped registry item on the not-ported list.
- Never copy the boundary tables from GBC-003 onto /porting (single-canonical rule).
- Never hand-type a mapping slug that does not resolve to a real registry item.
- Never change routing, content.config.ts, the registry source, or generated data.
STRICTLY:
- Strictly use section: porting frontmatter so the astro route serves it at /porting.
- Strictly make the deviations column explicit and present in the rendered table.
- Strictly keep mapping + not-ported equal to the upstream total.
- UNIT_TEST_JUSTIFIED: AC-2, AC-4 and AC-5 are pure set arithmetic and string scans over local markdown and one JSON file with zero I/O beyond reading files, so unit tests are justified.
- NEVER edit tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts: GBC-009 writes it, and AC-1 and AC-3 are proven when GBC-009 closes, not at this task's close.
- STRICTLY link each mapping row's port cell to /components/{slug} so the rendered table exposes one resolvable anchor per row.
- STRICTLY give the prior-art section the heading id 'prior-art' and the why-differs paragraph the heading id 'why-differs', and the mapping table the heading id 'mapping'.
- STRICTLY keep porting-content.test.ts read-only over the authored files (no build, no network, no browser).

## Specification
Objective: A single /porting page carrying the upstream-to-port mapping table with a deviations column, an exact not-ported list, and prior-art context.
Success state: A contributor opens /porting and reads a >=5-row mapping table with a deviations column, a not-ported list naming exactly the missing upstream elements, and prior-art context crediting elements.ai-sdk.dev and muratcakmak/expo-ai-elements.

## Acceptance Criteria
### AC-1: mapping table with deviations column
  GIVEN: GIVEN GBC-009's porting-map spec has landed, and the authored porting manuscript is built into the real preview
  WHEN:  a contributor opens /porting
  THEN:  the page renders an upstream-to-port mapping table with an explicit Deviations column and at least 5 rows, and the page is served at /porting only
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['/porting renders no mapping table, or the table has no Deviations header', 'the mapping table has fewer than 5 body rows', 'a mapping row links a slug that is absent from the 56-item ledger', 'the page is served at /docs/porting instead of /porting']
        EVIDENCE: file_artifact
        - START_REF: authored_porting_candidate
          ACTION: ['request.get /porting and /docs/porting and record both statuses', "goto /porting and select the table under the heading with id 'mapping'", "read the thead cells, count the tbody rows, and read each row's Deviations cell", "collect the anchors whose href starts with '/components/' in each row and compare each slug with the 56 names in apps/docs/src/data/registry-items.json", 'recount the mapping tbody rows under the chromium-nojs project']
          MUST_OBSERVE: ['HTTP status 200 at /porting and HTTP status 404 at /docs/porting', "exactly 1 table under the heading with id 'mapping', with exactly 1 th whose text is 'Deviations'", 'at least 5 tbody rows in that table', '0 rows with an empty Deviations cell', "exactly 1 anchor with href '/components/{slug}' per row, and 0 slugs missing from the 56-item ledger", "under chromium-nojs, the table under the heading with id 'mapping' still has at least 5 tbody rows and exactly 1 th with text 'Deviations'"]
          MUST_NOT_OBSERVE: ["a table under 'mapping' with no 'Deviations' th (start state)", 'fewer than 5 tbody rows', 'a row whose slug is not one of the 56 ledger names', 'HTTP status 200 at /docs/porting']

### AC-2: not-ported list is the exact complement
  GIVEN: GIVEN the authored porting.md frontmatter and the tracked packages/registry/registry.json
  WHEN:  a vitest source scan reads the mapping, notPorted and upstream arrays
  THEN:  mapping plus notPorted equals the upstream total, the two lists do not overlap, and no notPorted name matches a shipped item
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Set arithmetic over three frontmatter arrays and the 56 names in one JSON file is a pure computation with no I/O beyond reading two local files.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-content.test.ts
  TEST_FUNCTION: notPorted is the exact complement of mapping over upstream
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts

### AC-3: prior-art context with why-differs
  GIVEN: GIVEN GBC-009's porting-map spec has landed, and the authored porting manuscript is built into the real preview
  WHEN:  a contributor reads the prior-art section of /porting
  THEN:  the page credits elements.ai-sdk.dev and muratcakmak/expo-ai-elements and states why this port differs
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['either prior-art name is absent from the rendered page', 'the why-differs statement is missing or names only one engine', 'the prior-art links are plain text with no anchor']
        EVIDENCE: file_artifact
        - START_REF: authored_porting_candidate
          ACTION: ["goto /porting and select the section under the heading with id 'prior-art'", 'read the anchors and the section text', "select the paragraph under the heading with id 'why-differs'", 'repeat the read under the chromium-nojs project']
          MUST_OBSERVE: ["exactly 1 anchor with href 'https://elements.ai-sdk.dev' whose text contains 'elements.ai-sdk.dev'", "exactly 1 anchor with href 'https://github.com/muratcakmak/expo-ai-elements' whose text contains 'muratcakmak/expo-ai-elements'", "exactly 1 heading with id 'why-differs'", "the why-differs paragraph contains the literals 'nativewind' and 'uniwind' at least 1 time each", 'the same 2 anchors are present under chromium-nojs']
          MUST_NOT_OBSERVE: ["0 anchors under 'prior-art' (start state)", "a why-differs paragraph with 0 occurrences of 'uniwind'"]

### AC-4: prior-art links absolute https
  GIVEN: GIVEN the authored porting.md source
  WHEN:  a vitest source scan reads its prior-art hrefs
  THEN:  both prior-art links are absolute https URLs; the 200 or 301 resolution stays with the recorded check-dist-links lane in the docs build gate
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Matching two href strings against an https prefix is a pure text check over one local markdown file with no network.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-content.test.ts
  TEST_FUNCTION: prior-art hrefs are absolute https
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts

### AC-5: no boundary-table copy in the porting source
  GIVEN: GIVEN the authored porting.md and the boundary manuscript on disk
  WHEN:  a vitest source scan compares their tables
  THEN:  porting.md holds only the mapping table and the not-ported list, with no copy of a boundary ships/does-not-ship table
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Comparing the table header rows of two local markdown files is a pure text check with no I/O beyond reading them.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-content.test.ts
  TEST_FUNCTION: porting source carries no boundary table copy
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts

## Test Criteria
- TC-1: /porting returns 200, /docs/porting returns 404, and the table under 'mapping' has a 'Deviations' th, at least 5 tbody rows and 0 slugs outside the 56-item ledger.  (maps_to: AC-1)
- TC-2: mapping.length + notPorted.length equals upstream.length, mapping and notPorted share 0 names, and 0 notPorted names appear in the 56 registry names.  (maps_to: AC-2)
- TC-3: /porting has anchors to https://elements.ai-sdk.dev and https://github.com/muratcakmak/expo-ai-elements and a 'why-differs' paragraph naming nativewind and uniwind.  (maps_to: AC-3)
- TC-4: Both prior-art hrefs in porting.md start with 'https://'.  (maps_to: AC-4)
- TC-5: porting.md contains 0 tables whose header row matches a table in the boundary manuscript.  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — terminology lock and link gates
- packages/registry/registry.json — the 56 real slugs for the mapping and not-ported complement
- apps/docs/src/data/registry-items.json — the built ledger
- .spec/prds/docs-site/04-uc-docs.md — UC-DOCS-05 acceptance criteria
- AGENTS.md — prior art (elements.ai-sdk.dev, muratcakmak/expo-ai-elements) and porting context

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/porting.md (NEW)
- tests/sprint-06-guides-boundary-changelog/porting-content.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/content.config.ts
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md', '.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: Astro routes section: porting to the top-level /porting page (not /docs/porting) and integrates it into the link check. The not-ported list is the second input to the human-gate cross-check.
Pattern: porting notes as a mapping table with deviations + exact complement not-ported list + prior-art context (.spec/prds/docs-site/11-technical-requirements/12-content-standards.md)
Anti-pattern: a mapping row naming a non-existent slug; a not-ported entry that is a shipped item; duplicating the boundary tables

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts

## Dependencies
Depends on: none
Blocks:     ['GBC-006', 'GBC-008', 'GBC-009', 'GBC-012', 'GBC-017']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-004",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "authored_porting_candidate": {
      "description": "The authored porting manuscript enters the real docs content build. The ordered docs build produces the dist that the Playwright-owned astro preview serves at http://localhost:4321. Each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/porting.md is authored with section: porting and the structured frontmatter arrays mapping, notPorted and upstream.",
        "packages/registry/registry.json supplies the 56 shipped item names used to check every mapped slug.",
        "GBC-009's section-aware route serves the page at /porting (and never at /docs/porting) from the same candidate."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-009's porting-map spec has landed, and the authored porting manuscript is built into the real preview WHEN a contributor opens /porting THEN the page renders an upstream-to-port mapping table with an explicit Deviations column and at least 5 rows, and the page is served at /porting only",
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
            "/porting renders no mapping table, or the table has no Deviations header",
            "the mapping table has fewer than 5 body rows",
            "a mapping row links a slug that is absent from the 56-item ledger",
            "the page is served at /docs/porting instead of /porting"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_porting_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "request.get /porting and /docs/porting and record both statuses",
                "goto /porting and select the table under the heading with id 'mapping'",
                "read the thead cells, count the tbody rows, and read each row's Deviations cell",
                "collect the anchors whose href starts with '/components/' in each row and compare each slug with the 56 names in apps/docs/src/data/registry-items.json",
                "recount the mapping tbody rows under the chromium-nojs project"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /porting and HTTP status 404 at /docs/porting",
                "exactly 1 table under the heading with id 'mapping', with exactly 1 th whose text is 'Deviations'",
                "at least 5 tbody rows in that table",
                "0 rows with an empty Deviations cell",
                "exactly 1 anchor with href '/components/{slug}' per row, and 0 slugs missing from the 56-item ledger",
                "under chromium-nojs, the table under the heading with id 'mapping' still has at least 5 tbody rows and exactly 1 th with text 'Deviations'"
              ],
              "must_not_observe": [
                "a table under 'mapping' with no 'Deviations' th (start state)",
                "fewer than 5 tbody rows",
                "a row whose slug is not one of the 56 ledger names",
                "HTTP status 200 at /docs/porting"
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
      "description": "GIVEN GIVEN the authored porting.md frontmatter and the tracked packages/registry/registry.json WHEN a vitest source scan reads the mapping, notPorted and upstream arrays THEN mapping plus notPorted equals the upstream total, the two lists do not overlap, and no notPorted name matches a shipped item",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_function": "notPorted is the exact complement of mapping over upstream",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Set arithmetic over three frontmatter arrays and the 56 names in one JSON file is a pure computation with no I/O beyond reading two local files.",
      "maps_to_ac": null
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-009's porting-map spec has landed, and the authored porting manuscript is built into the real preview WHEN a contributor reads the prior-art section of /porting THEN the page credits elements.ai-sdk.dev and muratcakmak/expo-ai-elements and states why this port differs",
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
            "either prior-art name is absent from the rendered page",
            "the why-differs statement is missing or names only one engine",
            "the prior-art links are plain text with no anchor"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_porting_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /porting and select the section under the heading with id 'prior-art'",
                "read the anchors and the section text",
                "select the paragraph under the heading with id 'why-differs'",
                "repeat the read under the chromium-nojs project"
              ]
            },
            "end_state": {
              "must_observe": [
                "exactly 1 anchor with href 'https://elements.ai-sdk.dev' whose text contains 'elements.ai-sdk.dev'",
                "exactly 1 anchor with href 'https://github.com/muratcakmak/expo-ai-elements' whose text contains 'muratcakmak/expo-ai-elements'",
                "exactly 1 heading with id 'why-differs'",
                "the why-differs paragraph contains the literals 'nativewind' and 'uniwind' at least 1 time each",
                "the same 2 anchors are present under chromium-nojs"
              ],
              "must_not_observe": [
                "0 anchors under 'prior-art' (start state)",
                "a why-differs paragraph with 0 occurrences of 'uniwind'"
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
      "description": "GIVEN GIVEN the authored porting.md source WHEN a vitest source scan reads its prior-art hrefs THEN both prior-art links are absolute https URLs; the 200 or 301 resolution stays with the recorded check-dist-links lane in the docs build gate",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_function": "prior-art hrefs are absolute https",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Matching two href strings against an https prefix is a pure text check over one local markdown file with no network.",
      "maps_to_ac": null
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the authored porting.md and the boundary manuscript on disk WHEN a vitest source scan compares their tables THEN porting.md holds only the mapping table and the not-ported list, with no copy of a boundary ships/does-not-ship table",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_function": "porting source carries no boundary table copy",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Comparing the table header rows of two local markdown files is a pure text check with no I/O beyond reading them.",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "/porting returns 200, /docs/porting returns 404, and the table under 'mapping' has a 'Deviations' th, at least 5 tbody rows and 0 slugs outside the 56-item ledger.",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "mapping.length + notPorted.length equals upstream.length, mapping and notPorted share 0 names, and 0 notPorted names appear in the 56 registry names.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_function": "notPorted is the exact complement of mapping over upstream",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "/porting has anchors to https://elements.ai-sdk.dev and https://github.com/muratcakmak/expo-ai-elements and a 'why-differs' paragraph naming nativewind and uniwind.",
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
      "description": "Both prior-art hrefs in porting.md start with 'https://'.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_function": "prior-art hrefs are absolute https",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "porting.md contains 0 tables whose header row matches a table in the boundary manuscript.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_function": "porting source carries no boundary table copy",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-5"
    }
  ]
}
-->
