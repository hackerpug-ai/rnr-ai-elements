================================================================================
TASK: GBC-017 - boundary + porting scannable-table and callout presentation
================================================================================

TASK_TYPE:  DESIGN
STATUS:     Backlog
PRIORITY:   P1
POINTS:     3
AGENT:      planner=frontend-designer | implementer=frontend-designer | reviewer=react-native-reusables-reviewer

PROPOSED BY: frontend-designer
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- style markdown tables in Prose so every claim string lands inside td/th
- match DataTable's visual language (var(--muted) zebra, var(--border) dividers, sticky thead offset top calc(var(--layout-header-h) + 0.25rem) so it pins below the site header, muted caption) — declared a known twin of DataTable.astro's table chrome: keep in lockstep, comment says so
- render th with scope="col" on every Prose table plus a muted caption (accessibility floor)
- set td{overflow-wrap:anywhere} and a first-column max-width below 48rem so sentence-length deviation cells wrap instead of blowing the layout
- render the boundary owns/doesn't-own split and the gaps section as tables, never prose
- render the porting mapping table with a 'Deviation' column and the not-ported list
- keep the boundary tables canonical to /docs/owns-vs-does-not-own
NEVER:
- never render boundary claims as prose paragraphs
- never duplicate the boundary tables on /porting
- never author the table cell content (techwriting owns content)
- never change the markdown-doc page kind (GBC-003 re-authors the boundary page as .mdx, which is what makes the info Callout composable; this task consumes, never converts)
STRICTLY:
- >=2 tables on /docs/owns-vs-does-not-own (T-DOCS-019)
- horizontal scroll via the native pattern :global(.prose table){display:block;overflow-x:auto} in Prose.astro scoped styles — reachable from the one write-allowed file, no wrapper element or rehype plugin needed; NO pinned first column (cut: the mapping table is ~5 rows and the boundary tables ~7 claims — DataTable needed pinning for 56 mono-key rows, these do not)
- token-only styling, zero JS

## Specification
Objective: Extend Prose.astro so markdown tables render scannably (DataTable language), every boundary/porting claim string lands in td/th, the gaps section is a table, and the example-app cross-link is an info Callout, enforcing the single-canonical rule.
Success state: The built /docs/owns-vs-does-not-own and /porting render boundary/porting claims inside styled scannable tables, a gaps section lists >=1 honest gap, the example-app anchor resolves non-404, and /porting carries no second copy of the boundary tables.

## Acceptance Criteria
### AC-1: boundary-tables-not-prose [PRIMARY]
  GIVEN: the built site is served
  WHEN:  a visitor opens /docs/owns-vs-does-not-own
  THEN:  the page renders >=2 tables and every boundary claim string (transport, streaming client, tool executor, useChat, transcript state, provider calls, tool execution) sits inside a td/th — never a prose paragraph
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['boundary claim strings render in prose paragraphs, or fewer than 2 tables']
        EVIDENCE: screenshot
        - ACTION: ['Open /docs/owns-vs-does-not-own']
          MUST_OBSERVE: ['>=2 tables', 'each boundary claim string inside a <td>/<th>']
          MUST_NOT_OBSERVE: ['boundary claim strings in prose paragraphs', 'fewer than 2 tables']

### AC-2: porting-mapping-deviations [PRIMARY]
  GIVEN: the built site is served
  WHEN:  a visitor opens /porting
  THEN:  a mapping table with a 'Deviation' column and >=5 rows renders, alongside a not-ported list with >=1 entry and prior-art text naming elements.ai-sdk.dev and muratcakmak/expo-ai-elements
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a mapping table without a Deviation column, an empty not-ported list, or missing prior-art text']
        EVIDENCE: screenshot
        - ACTION: ['Open /porting']
          MUST_OBSERVE: ["a mapping table with a 'Deviation' column", '>=5 mapping rows', 'a not-ported list with >=1 entry', 'prior-art text naming elements.ai-sdk.dev and muratcakmak/expo-ai-elements']
          MUST_NOT_OBSERVE: ['a mapping table without a Deviation column', 'an empty not-ported list']

### AC-3: boundary-gaps-section
  GIVEN: the boundary page renders
  WHEN:  the page is inspected
  THEN:  a 'gaps' section lists >=1 honest gap, and the ownership split names 'react-native-reusables'
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['no gaps section or an empty gaps list']
        EVIDENCE: screenshot
        - ACTION: ['Inspect the boundary page']
          MUST_OBSERVE: ['a gaps section with >=1 listed item', "the string 'react-native-reusables'"]
          MUST_NOT_OBSERVE: ['no gaps section', 'an empty gaps list']

### AC-4: single-canonical
  GIVEN: the built site is served
  WHEN:  the site is crawled
  THEN:  the boundary tables render only on /docs/owns-vs-does-not-own, home and Introduction carry one-line teasers plus links, and /porting contains no second copy
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a second copy of the boundary tables on /porting']
        EVIDENCE: file_artifact
        - ACTION: ['Crawl /docs/owns-vs-does-not-own, home, Introduction, /porting']
          MUST_OBSERVE: ['boundary tables present only on /docs/owns-vs-does-not-own', 'home + Introduction carry one-line boundary teasers with links']
          MUST_NOT_OBSERVE: ['a second copy of the boundary tables on /porting', 'boundary tables rendered on home or Introduction']

### AC-5: example-app-link
  GIVEN: the boundary page renders
  WHEN:  the example-app anchor is followed
  THEN:  it resolves non-404
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a missing or broken example-app link']
        EVIDENCE: file_artifact
        - ACTION: ['Follow the example-app anchor on the boundary page']
          MUST_OBSERVE: ['an example-app anchor (or info Callout with a link)', 'the example-app link resolves non-404']
          MUST_NOT_OBSERVE: ['a missing or broken example-app link']

### AC-6: scannable-table-styling
  GIVEN: a markdown table renders inside the Prose article wrapper
  WHEN:  the table is inspected
  THEN:  it shows zebra striping, var(--border) row dividers, a sticky header row offset below the site header, th scope=col, a muted caption, and horizontal scroll via the table's own display:block/overflow-x:auto
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['unstyled default browser tables', 'a table wider than its container without scroll', 'a missing caption or th scope']
        EVIDENCE: file_artifact (computed-style assertions)
        - ACTION: ['Inspect a markdown table in Prose via computed styles']
          MUST_OBSERVE: ['computed background on even rows (zebra)', 'computed border on row dividers', 'computed position:sticky on thead with a top offset', 'computed overflow-x:auto/display:block on the table', 'th scope=col present', 'caption present']
          MUST_NOT_OBSERVE: ['unstyled default browser tables', 'a screenshot standing in for a computed-style check']

## Test Criteria
- TC-1: /docs/owns-vs-does-not-own renders >=2 tables with claims in td/th  (maps_to: AC-1)
- TC-2: /porting renders a Deviation-column mapping table, a not-ported list, and prior-art text  (maps_to: AC-2)
- TC-3: boundary page has a gaps section with >=1 item and names react-native-reusables  (maps_to: AC-3)
- TC-4: boundary tables render only on /docs/owns-vs-does-not-own  (maps_to: AC-4)
- TC-5: example-app anchor resolves non-404  (maps_to: AC-5)
- TC-6: markdown tables in Prose render with computed zebra/border/sticky(scroll-offset)/scroll styling, th scope=col, and captions; hex-literal absence is a source grep over Prose.astro (not observable via computed styles)  (maps_to: AC-6)

## Reading List
- apps/docs/src/components/DataTable.astro
- apps/docs/src/components/Callout.astro
- apps/docs/src/components/Prose.astro
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/components/Prose.astro
WRITE-PROHIBITED:
- apps/docs/src/pages/**
- apps/docs/src/content/**
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: Tables scroll horizontally below 48rem with pinned first column; sticky thead; example-app cross-link is an info Callout. Zero JS.
Pattern: Scannable markdown tables styled to DataTable's language; claims live in td/th, never prose. (DataTable.astro (zebra/sticky/pin), Callout.astro (info aside))
Anti-pattern: Do not render boundary claims as prose; do not author table content; do not duplicate boundary tables on /porting.

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables

## Dependencies
Depends on: ['GBC-003', 'GBC-004', 'GBC-009']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-017",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {},
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN the built site WHEN a visitor opens /docs/owns-vs-does-not-own THEN >=2 tables render with every boundary claim string inside a td/th, never prose",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": true,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview",
        "negative_control": {
          "would_fail_if": [
            "boundary claim strings render in prose paragraphs, or fewer than 2 tables"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "boundary_claims",
            "action": {
              "actor": "user",
              "steps": [
                "Open /docs/owns-vs-does-not-own"
              ]
            },
            "end_state": {
              "must_observe": [
                ">=2 tables",
                "each boundary claim string inside a <td>/<th>"
              ],
              "must_not_observe": [
                "boundary claim strings in prose paragraphs",
                "fewer than 2 tables"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN the built site WHEN a visitor opens /porting THEN a Deviation-column mapping table (>=5 rows), a not-ported list (>=1), and prior-art text render",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": true,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview",
        "negative_control": {
          "would_fail_if": [
            "a mapping table without a Deviation column, an empty not-ported list, or missing prior-art text"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "porting_prior_art",
            "action": {
              "actor": "user",
              "steps": [
                "Open /porting"
              ]
            },
            "end_state": {
              "must_observe": [
                "a mapping table with a 'Deviation' column",
                ">=5 mapping rows",
                "a not-ported list with >=1 entry",
                "prior-art text naming elements.ai-sdk.dev and muratcakmak/expo-ai-elements"
              ],
              "must_not_observe": [
                "a mapping table without a Deviation column",
                "an empty not-ported list"
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
      "description": "GIVEN the boundary page WHEN inspected THEN a 'gaps' section lists >=1 honest gap and the ownership split names 'react-native-reusables'",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview",
        "negative_control": {
          "would_fail_if": [
            "no gaps section or an empty gaps list"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "boundary_claims",
            "action": {
              "actor": "user",
              "steps": [
                "Inspect the boundary page"
              ]
            },
            "end_state": {
              "must_observe": [
                "a gaps section with >=1 listed item",
                "the string 'react-native-reusables'"
              ],
              "must_not_observe": [
                "no gaps section",
                "an empty gaps list"
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
      "description": "GIVEN the built site WHEN crawled THEN boundary tables render only on /docs/owns-vs-does-not-own, home/Introduction carry teasers, and /porting has no second copy",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview",
        "negative_control": {
          "would_fail_if": [
            "a second copy of the boundary tables on /porting"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "boundary_claims",
            "action": {
              "actor": "user",
              "steps": [
                "Crawl /docs/owns-vs-does-not-own, home, Introduction, /porting"
              ]
            },
            "end_state": {
              "must_observe": [
                "boundary tables present only on /docs/owns-vs-does-not-own",
                "home + Introduction carry one-line boundary teasers with links"
              ],
              "must_not_observe": [
                "a second copy of the boundary tables on /porting",
                "boundary tables rendered on home or Introduction"
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
      "description": "GIVEN the boundary page WHEN the example-app anchor is followed THEN it resolves non-404",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview",
        "negative_control": {
          "would_fail_if": [
            "a missing or broken example-app link"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "boundary_claims",
            "action": {
              "actor": "user",
              "steps": [
                "Follow the example-app anchor on the boundary page"
              ]
            },
            "end_state": {
              "must_observe": [
                "an example-app anchor (or info Callout with a link)",
                "the example-app link resolves non-404"
              ],
              "must_not_observe": [
                "a missing or broken example-app link"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-6",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN a markdown table in Prose WHEN inspected via computed styles THEN it shows zebra/border/sticky(offset) styling, th scope=col, caption, and horizontal scroll via the table's own display:block/overflow-x:auto",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview",
        "negative_control": {
          "would_fail_if": [
            "unstyled default browser tables", "a table wider than its container without scroll", "a missing caption or th scope"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "porting_prior_art",
            "action": {
              "actor": "user",
              "steps": [
                "Inspect a markdown table in Prose"
              ]
            },
            "end_state": {
              "must_observe": [
                "zebra striping on even rows (var(--muted))",
                "row dividers via var(--border)",
                "sticky thead"
              ],
              "must_not_observe": [
                "unstyled default browser tables",
                "hex color literals in the table styles"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "description": "/docs/owns-vs-does-not-own renders >=2 tables with claims in td/th",
      "maps_to_ac": "AC-1",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "description": "/porting renders a Deviation-column mapping table, a not-ported list, and prior-art text",
      "maps_to_ac": "AC-2",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "description": "boundary page has a gaps section with >=1 item and names react-native-reusables",
      "maps_to_ac": "AC-3",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "description": "boundary tables render only on /docs/owns-vs-does-not-own",
      "maps_to_ac": "AC-4",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "description": "example-app anchor resolves non-404",
      "maps_to_ac": "AC-5",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables"
    },
    {
      "id": "TC-6",
      "type": "test_criterion",
      "description": "markdown tables in Prose render with zebra/border/sticky styling and no hex literals",
      "maps_to_ac": "AC-6",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art"
    }
  ]
}
-->
