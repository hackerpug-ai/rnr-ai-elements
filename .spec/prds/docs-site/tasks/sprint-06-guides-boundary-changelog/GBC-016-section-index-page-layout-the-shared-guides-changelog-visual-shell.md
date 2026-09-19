================================================================================
TASK: GBC-016 - section-index page layout — the shared /guides + /changelog visual shell
================================================================================

TASK_TYPE:  DESIGN
STATUS:     Backlog
PRIORITY:   P1
POINTS:     2
AGENT:      planner=frontend-designer | implementer=frontend-designer | reviewer=react-native-reusables-reviewer

PROPOSED BY: frontend-designer
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- compose PageHeader (title + one-line description)
- compose a SectionHeader (anchored h2 + count Chip) reusing SectionHeader.astro
- render the IndexList rows via the default slot
- supply the docs-section nav (getting-started / guides / porting) since DocsLayout renders no sidebar — by extracting DocsNav.astro from MarkdownLayout's inline nav (Rule of 2: two consumers) and having MarkdownLayout consume the extraction; composing MarkdownLayout directly is NOT the path (it hard-renders a mandatory Edit-this-page link)
- collapse to a single column below lg
NEVER:
- never render a ToC rail on a section-index page
- never duplicate the docs-nav CSS
- never author the route getStaticPaths or the changelog collection schema
- never emit a second sidebar implementation
STRICTLY:
- no ToC rail (short page)
- page padding 1.5rem, max-width 96rem matching /components and /registry
- token-only styling, zero JS

## Specification
Objective: Author SectionIndexLayout.astro, the shared section-index page shell (TR-07 section-index wireframe) reused by /guides and /changelog.
Success state: Both /guides and /changelog render the identical shell (PageHeader + SectionHeader + slotted IndexList, no ToC) with only derived data differing, and both are single-column below lg.

## Acceptance Criteria
### AC-1: guides-section-index-shell [PRIMARY]
  GIVEN: the built site is served and the five guides are present
  WHEN:  a visitor opens /guides
  THEN:  a PageHeader titled 'Guides', a SectionHeader whose h2 reads 'All guides' with a sibling count Chip of 5, and exactly 5 IndexList rows render, with no ToC rail (SectionHeader renders h2 + separate Chip — a literal 'All guides (5)' string never exists in the DOM)
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the ToC rail renders or the SectionHeader count chip is missing']
        EVIDENCE: file_artifact (DOM query)
        - ACTION: ['Open /guides']
          MUST_OBSERVE: ["PageHeader title 'Guides'", "SectionHeader h2 text 'All guides'", 'sibling count Chip with value 5', 'exactly 5 IndexList rows']
          MUST_NOT_OBSERVE: ["an 'On this page' ToC rail", 'a guides SectionHeader missing its count Chip']

### AC-2: changelog-section-index-shell [PRIMARY]
  GIVEN: the built site is served and the changelog collection is present
  WHEN:  a visitor opens /changelog
  THEN:  a PageHeader titled 'Changelog', a SectionHeader 'Releases', and descending IndexList rows render, with no ToC rail
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the ToC rail renders or changelog rows are unsorted']
        EVIDENCE: screenshot
        - ACTION: ['Open /changelog']
          MUST_OBSERVE: ["PageHeader title 'Changelog'", "SectionHeader 'Releases'", 'rows strictly descending by date']
          MUST_NOT_OBSERVE: ["an 'On this page' ToC rail on /changelog"]

### AC-3: no-toc-rail
  GIVEN: either section-index page renders
  WHEN:  the page is inspected
  THEN:  no 'On this page' ToC rail is present
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a ToC rail element renders on /guides or /changelog']
        EVIDENCE: screenshot
        - ACTION: ['Inspect /guides']
          MUST_OBSERVE: ["absence of a nav with aria-label 'On this page'"]
          MUST_NOT_OBSERVE: ['a ToC rail element']

### AC-4: single-column-mobile
  GIVEN: a viewport below the lg breakpoint (64rem)
  WHEN:  /guides is opened
  THEN:  the section-index shell lays out in a single column with the docs-section nav still reachable
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a multi-column grid at a narrow viewport']
        EVIDENCE: screenshot
        - ACTION: ['Open /guides below 64rem']
          MUST_OBSERVE: ['single-column body below 64rem', 'docs-section nav present']
          MUST_NOT_OBSERVE: ['a multi-column grid at a narrow viewport']

### AC-5: docs-section-nav
  GIVEN: a section-index page renders
  WHEN:  the sidebar region is inspected
  THEN:  the docs-section nav groups (getting-started / guides / porting) are present via the MarkdownLayout docs-nav pattern
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a section-index page with no docs nav']
        EVIDENCE: screenshot
        - ACTION: ['Inspect the sidebar on /changelog']
          MUST_OBSERVE: ['docs-section nav with getting-started / guides / porting groups']
          MUST_NOT_OBSERVE: ['a section-index page with no docs nav']

## Test Criteria
- TC-1: /guides renders PageHeader + SectionHeader h2 'All guides' + Chip 5 + 5 rows  (maps_to: AC-1)
- TC-2: /changelog renders PageHeader 'Changelog' + SectionHeader 'Releases' + descending rows  (maps_to: AC-2)
- TC-3: no ToC rail on either section-index page  (maps_to: AC-3)
- TC-4: single-column below 64rem with docs nav present  (maps_to: AC-4)
- TC-5: docs-section nav groups present on /changelog  (maps_to: AC-5)

## Reading List
- apps/docs/src/components/SectionHeader.astro
- apps/docs/src/components/PageHeader.astro
- apps/docs/src/layouts/MarkdownLayout.astro
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/layouts/SectionIndexLayout.astro (NEW)
- apps/docs/src/components/DocsNav.astro (NEW — extracted from MarkdownLayout's inline nav)
- apps/docs/src/layouts/MarkdownLayout.astro (MODIFY — consume DocsNav, byte-identical rendered nav)
WRITE-PROHIBITED:
- apps/docs/src/pages/guides.astro
- apps/docs/src/pages/changelog/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: No ToC rail; sidebar is the MarkdownLayout docs-nav pattern; single-column below lg.
Pattern: Layout composes PageHeader + SectionHeader + a slotted IndexList region, reusing the docs-section nav from MarkdownLayout. (MarkdownLayout.astro (docs-nav sidebar), components/index.astro (SectionHeader composition))
Anti-pattern: Do not duplicate the docs-nav CSS; do not add the ToC rail back; do not author route getStaticPaths.

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index

## Dependencies
Depends on: ['GBC-015']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-016",
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
      "description": "GIVEN the built site and five guides WHEN a visitor opens /guides THEN PageHeader 'Guides' + SectionHeader h2 'All guides' with count Chip 5 + 5 IndexList rows render with no ToC",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index",
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
            "the ToC rail renders or the SectionHeader count chip is missing"
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
                "PageHeader title 'Guides'",
                "SectionHeader h2 'All guides' + count Chip 5",
                "exactly 5 IndexList rows"
              ],
              "must_not_observe": [
                "an 'On this page' ToC rail",
                "a guides SectionHeader missing its count Chip"
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
      "description": "GIVEN the built site and changelog collection WHEN a visitor opens /changelog THEN PageHeader 'Changelog' + SectionHeader 'Releases' + descending rows render with no ToC",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-06-changelog-release-pages",
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
            "the ToC rail renders or changelog rows are unsorted"
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
                "PageHeader title 'Changelog'",
                "SectionHeader 'Releases'",
                "rows strictly descending by date"
              ],
              "must_not_observe": [
                "an 'On this page' ToC rail on /changelog"
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
      "description": "GIVEN either section-index page WHEN inspected THEN no 'On this page' ToC rail is present",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index",
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
            "a ToC rail element renders on /guides or /changelog"
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
                "Inspect /guides"
              ]
            },
            "end_state": {
              "must_observe": [
                "absence of a nav with aria-label 'On this page'"
              ],
              "must_not_observe": [
                "a ToC rail element"
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
      "description": "GIVEN a viewport below 64rem WHEN /guides is opened THEN the shell lays out in a single column with the docs-section nav reachable",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index",
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
            "a multi-column grid at a narrow viewport"
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
                "Open /guides below 64rem"
              ]
            },
            "end_state": {
              "must_observe": [
                "single-column body below 64rem",
                "docs-section nav present"
              ],
              "must_not_observe": [
                "a multi-column grid at a narrow viewport"
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
      "description": "GIVEN a section-index page WHEN the sidebar is inspected THEN the docs-section nav groups are present via the MarkdownLayout pattern",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-06-changelog-release-pages",
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
            "a section-index page with no docs nav"
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
                "Inspect the sidebar on /changelog"
              ]
            },
            "end_state": {
              "must_observe": [
                "docs-section nav with getting-started / guides / porting groups"
              ],
              "must_not_observe": [
                "a section-index page with no docs nav"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "description": "/guides renders PageHeader + SectionHeader h2 'All guides' + Chip 5 + 5 rows",
      "maps_to_ac": "AC-1",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "description": "/changelog renders PageHeader 'Changelog' + SectionHeader 'Releases' + descending rows",
      "maps_to_ac": "AC-2",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-06-changelog-release-pages"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "description": "no ToC rail on either section-index page",
      "maps_to_ac": "AC-3",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "description": "single-column below 64rem with docs nav present",
      "maps_to_ac": "AC-4",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "description": "docs-section nav groups present on /changelog",
      "maps_to_ac": "AC-5",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-06-changelog-release-pages"
    }
  ]
}
-->
