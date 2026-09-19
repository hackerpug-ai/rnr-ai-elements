================================================================================
TASK: GBC-015 - IndexList component (NEW) — the section-index linked entry-row primitive
================================================================================

TASK_TYPE:  DESIGN
STATUS:     Backlog
PRIORITY:   P0
POINTS:     3
AGENT:      planner=frontend-designer | implementer=frontend-designer | reviewer=react-native-reusables-reviewer

PROPOSED BY: frontend-designer
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- style every row through var(--*) tokens only (no hex literals)
- render zero-JS static anchors (no <script>, no island)
- give each row a >=44px min-height touch target
- define the Props/slot surface in the Design section (rows via the default slot or a typed rows prop — ONE composition model, no baked per-page variants) and expose data-index-list-row on every row as the test hook
- assert the 44px target via boundingBox in specs (a screenshot cannot measure)
- match the SectionHeader / Chip / ComponentCard visual language
NEVER:
- never emit a per-variant sibling file (IndexListGuides.astro / IndexListChangelog.astro)
- never imitate ComponentCard's imagery-specific card chrome
- never hardcode hex/rgb color values
- never require client JavaScript to render a row
STRICTLY:
- one row markup: an li whose title <a> is stretched over the row via ::after (the >=44px target); count Chip and touched-component links render as siblings inside the li — never an <a> inside an <a> (invalid HTML; browsers close the outer anchor and every row assertion then tests broken markup)
- token provenance (var(--*) use, no hex literals) is verified by a source grep TC, not by computed styles — the DOM resolves vars and cannot distinguish a token from a literal
- scroll-margin-block-start calc(var(--layout-header-h) + 1rem) on any anchorable row
- title color var(--foreground), description var(--muted-foreground), divider var(--border), hover fill var(--accent), radius var(--radius-md)

## Specification
Objective: Author IndexList.astro, the linked non-registry entry-row primitive for the section-index page type (TR-07 NEW 3/4, section-index wireframe R5), with two prop-driven forms sharing one markup/stylesheet.
Success state: The built /guides and /changelog pages each render IndexList rows that are token-governed, zero-JS, keyboard/touch operable, and visually continuous with SectionHeader.

## Acceptance Criteria
### AC-1: five-guides-index [PRIMARY]
  GIVEN: the built site is served over astro preview and the five guides are present
  WHEN:  a visitor opens /guides
  THEN:  exactly 5 IndexList rows render, each a linked guide title plus a one-line description
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the IndexList renders 0 rows or prose paragraphs instead of linked rows']
        EVIDENCE: screenshot
        - ACTION: ['Open /guides']
          MUST_OBSERVE: ['exactly 5 IndexList rows', 'each row links a guide page', 'each row shows a one-line description']
          MUST_NOT_OBSERVE: ['0 rows', 'rows without links']

### AC-2: changelog-reverse-chrono [PRIMARY]
  GIVEN: the built site is served and the changelog entries (0.2.1, 0.2.0, 0.1.0) are present
  WHEN:  a visitor opens /changelog
  THEN:  IndexList rows appear in strictly descending date order, each carrying a version title and a date meta Chip
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['changelog rows sort ascending or unsorted, or omit the date meta']
        EVIDENCE: screenshot
        - ACTION: ['Open /changelog']
          MUST_OBSERVE: ['rows strictly descending by date top-to-bottom', 'each row shows a version title', 'each row shows a date meta Chip']
          MUST_NOT_OBSERVE: ['ascending or unsorted order', 'rows missing the date meta']

### AC-3: row-anatomy
  GIVEN: a guide entry row renders on /guides
  WHEN:  the row is inspected
  THEN:  it is an li row whose linked title anchor is stretched over the row (::after) with a >=44px min-height touch target, description and meta as siblings
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the row lacks a stretched title anchor, is shorter than 44px, nests an <a> inside an <a>, or lacks a link target']
        EVIDENCE: file_artifact (boundingBox measurement + DOM query)
        - ACTION: ['Inspect a guide row on /guides']
          MUST_OBSERVE: ['row is an li with a stretched title <a> covering it', 'row boundingBox height >= 44px', 'data-index-list-row present', 'title and description both present', 'zero <a> descendants of an <a>']
          MUST_NOT_OBSERVE: ['row min-height < 44px', 'row with no link target', 'an anchor nested inside an anchor']

### AC-4: touched-component-links
  GIVEN: a changelog entry lists touched components (message, conversation, reasoning)
  WHEN:  its IndexList row renders on /changelog
  THEN:  links to /components/[item] resolve to 200 pages
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['touched-component links 404 or render as plain text without href']
        EVIDENCE: file_artifact
        - ACTION: ['Follow a touched-component link on /changelog']
          MUST_OBSERVE: ['touched-component links resolve to /components/[item]', 'resolved pages return 200']
          MUST_NOT_OBSERVE: ['touched-component links that 404']

### AC-5: token-and-zero-js
  GIVEN: IndexList.astro styles are authored
  WHEN:  the component source is inspected
  THEN:  only var(--*) tokens are used (no hex literals) and no <script> island is emitted
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: unit
  VERIFICATION_SERVICE: rg source scan over apps/docs/src/components/IndexList.astro
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: sh -c 'rg -n "#[0-9a-fA-F]{3,8}|<script" apps/docs/src/components/IndexList.astro; test $? -eq 1'
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['IndexList.astro contains hex/rgb literals or a <script> island']
        EVIDENCE: file_artifact
        - ACTION: ['Inspect IndexList.astro source']
          MUST_OBSERVE: ['all colors resolve through var(--*) custom properties', 'rows render without a client-side script tag']
          MUST_NOT_OBSERVE: ['hex/rgb literals', 'a <script> island']

## Test Criteria
- TC-1: /guides renders exactly 5 IndexList rows  (maps_to: AC-1)
- TC-2: /changelog rows are strictly descending by date  (maps_to: AC-2)
- TC-3: each row is an li with a stretched title anchor, min-height >= 44px via boundingBox, no nested anchors  (maps_to: AC-3)
- TC-4: changelog touched-component links resolve to 200 pages  (maps_to: AC-4)
- TC-5: IndexList.astro contains no hex literal and no script tag  (maps_to: AC-5)

## Reading List
- apps/docs/src/components/SectionHeader.astro
- apps/docs/src/components/Chip.astro
- apps/docs/src/components/DataTable.astro
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/components/IndexList.astro (NEW)
WRITE-PROHIBITED:
- apps/docs/src/pages/**
- apps/docs/src/content/**
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: Zero-JS anchor rows; hover fill via var(--accent); destination headings keep scroll-margin.
Pattern: Prop-driven entry-row list with two forms (guide row, changelog row) sharing one markup and one stylesheet; changelog meta reuses the counter-less Chip pill. (SectionHeader.astro (h2 + count Chip), Chip.astro (counter-less pill form))
Anti-pattern: Do not fork per-variant sibling files; do not inline hex colors; do not replicate ComponentCard's card chrome.

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index

## Dependencies
Depends on: none
Blocks:     ['GBC-016']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-015",
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
      "description": "GIVEN the built site and five guides WHEN a visitor opens /guides THEN exactly 5 IndexList rows render, each a linked guide title plus a one-line description",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
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
            "the IndexList renders 0 rows or prose paragraphs instead of linked rows"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "five_guides",
            "action": {
              "actor": "user",
              "steps": [
                "Open /guides"
              ]
            },
            "end_state": {
              "must_observe": [
                "exactly 5 IndexList rows",
                "each row links a guide page",
                "each row shows a one-line description"
              ],
              "must_not_observe": [
                "0 rows",
                "rows without links"
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
      "description": "GIVEN the built site and changelog entries WHEN a visitor opens /changelog THEN IndexList rows appear in strictly descending date order, each carrying a version title and a date meta Chip",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
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
            "changelog rows sort ascending or unsorted, or omit the date meta"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "changelog_entries",
            "action": {
              "actor": "user",
              "steps": [
                "Open /changelog"
              ]
            },
            "end_state": {
              "must_observe": [
                "rows strictly descending by date top-to-bottom",
                "each row shows a version title",
                "each row shows a date meta Chip"
              ],
              "must_not_observe": [
                "ascending or unsorted order",
                "rows missing the date meta"
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
      "description": "GIVEN a guide entry row on /guides WHEN inspected THEN it is an anchor composed of a linked title and a description with a >=44px min-height touch target",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
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
            "the row is not an anchor, is shorter than 44px, or lacks a link target"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "five_guides",
            "action": {
              "actor": "user",
              "steps": [
                "Inspect a guide row on /guides"
              ]
            },
            "end_state": {
              "must_observe": [
                "row is an <a> anchor",
                "row min-height >= 44px",
                "title and description both present"
              ],
              "must_not_observe": [
                "row min-height < 44px",
                "row with no link target"
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
      "description": "GIVEN a changelog entry listing touched components WHEN its row renders THEN links to /components/[item] resolve to 200 pages",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
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
            "touched-component links 404 or render as plain text without href"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "changelog_entries",
            "action": {
              "actor": "user",
              "steps": [
                "Follow a touched-component link on /changelog"
              ]
            },
            "end_state": {
              "must_observe": [
                "touched-component links resolve to /components/[item]",
                "resolved pages return 200"
              ],
              "must_not_observe": [
                "touched-component links that 404"
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
      "description": "GIVEN IndexList.astro WHEN inspected THEN only var(--*) tokens are used and no <script> island is emitted",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
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
            "IndexList.astro contains hex/rgb literals or a <script> island"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "five_guides",
            "action": {
              "actor": "user",
              "steps": [
                "Inspect IndexList.astro source"
              ]
            },
            "end_state": {
              "must_observe": [
                "all colors resolve through var(--*) custom properties",
                "rows render without a client-side script tag"
              ],
              "must_not_observe": [
                "hex/rgb literals",
                "a <script> island"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "description": "/guides renders exactly 5 IndexList rows",
      "maps_to_ac": "AC-1",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "description": "/changelog rows are strictly descending by date",
      "maps_to_ac": "AC-2",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "description": "each row is an anchor with min-height >= 44px",
      "maps_to_ac": "AC-3",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "description": "changelog touched-component links resolve to 200 pages",
      "maps_to_ac": "AC-4",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "description": "IndexList.astro contains no hex literal and no script tag",
      "maps_to_ac": "AC-5",
      "verify": "rg -n '#[0-9a-fA-F]{3,8}|<script' apps/docs/src/components/IndexList.astro"
    }
  ]
}
-->
