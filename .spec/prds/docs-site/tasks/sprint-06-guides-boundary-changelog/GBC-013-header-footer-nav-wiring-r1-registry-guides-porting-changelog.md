================================================================================
TASK: GBC-013 - Header/footer nav wiring — R1: Registry Guides Porting Changelog
================================================================================

TASK_TYPE:  CHORE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     2
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- extend Header.astro NAV_LINKS and the <details> drawer map to the five-section set (Components, Registry, Guides, Porting, Changelog)
- extend Footer.astro nav to the same section links
- keep zero-JS plain anchors (no island changes)
NEVER:
- introduce a dead nav href
- touch the SearchDialog/ThemeToggle island mounts
- change visual treatment (design lens owns styles)
STRICTLY:
- nav order = Components, Registry, Guides, Porting, Changelog
- each nav href resolves 200 in the emitted build
- STRICTLY begin the header test title in header-nav.spec.ts with the literal GBC-013-header-section-links and the drawer test title with the literal GBC-013-drawer-section-links, so each exact --grep selects exactly one test.
- NEVER name a journey id in header-nav.spec.ts: GBC-014 replays the rendered header claim inside journeys/docs-integrator-arc from its own spec.
- MUST capture RED first: run both exact commands before editing Header.astro and Footer.astro, and record that both fail on the 2-link header.

## Specification
Objective: Wire the three new sections (Guides, Porting, Changelog) into the header and footer nav so a visitor can reach them site-wide.
Success state: On any page, the header shows the five section links, each resolving 200.

## Acceptance Criteria
### AC-1: Header shows the five section links, each resolving 200
  GIVEN: the built site with /guides, /porting and /changelog routed, served by the Playwright-owned preview at http://localhost:4321
  WHEN:  a visitor on chromium-desktop opens /, /docs/installation and /guides
  THEN:  each page's header nav shows exactly Components, Registry, Guides, Porting, Changelog in that order, each href answers 200, and the footer nav carries the same five hrefs
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop (chromium-desktop project)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts
  TEST_FUNCTION: GBC-013-header-section-links
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep GBC-013-header-section-links --project=chromium-desktop
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['NAV_LINKS still holds only the 2 pre-sprint entries (Components, Registry)', 'a section entry is omitted, or its route is removed so its href answers 404', 'the footer keeps a hardcoded 2-link list']
        EVIDENCE: screenshot
        - START_REF: integrated_site_five_sections
          ACTION: ['In the chromium-desktop project, navigateLocalhost to /, then /docs/installation, then /guides, and record each response status', 'On each page, read the text and href of every anchor in .site-header__nav', 'Call page.request.get on http://localhost:4321 plus each of the 5 header hrefs and record each status', 'On /, read the href of every anchor in footer nav[aria-label="Footer"]', 'Capture a screenshot of the header on /guides']
          MUST_OBSERVE: ["HTTP 200 for each of the 3 pages '/', '/docs/installation' and '/guides'", "exactly 5 anchors in .site-header__nav on each of the 3 pages, text in order 'Components', 'Registry', 'Guides', 'Porting', 'Changelog'", "the 5 header hrefs in order '/components', '/registry', '/guides', '/porting', '/changelog'", 'page.request.get returns status 200 for 5 of 5 header hrefs', 'exactly 5 anchors in footer nav[aria-label="Footer"] with the same 5 hrefs in the same order']
          MUST_NOT_OBSERVE: ["only 2 header anchors, the pre-sprint '/components' and '/registry' start state", "any header or footer href that is empty, '#', or answers 404", 'a header link order other than Components, Registry, Guides, Porting, Changelog']

### AC-2: Mobile drawer carries the same five links
  GIVEN: the same built site on the chromium-mobile project, whose Pixel 5 viewport is below the 64rem breakpoint where the desktop nav is hidden
  WHEN:  a visitor opens the <details> drawer on /, /docs/installation and /guides
  THEN:  the drawer shows exactly the same five links in the same order, each href answers 200, and tapping Porting loads /porting
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium at the Pixel 5 viewport (chromium-mobile project)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts
  TEST_FUNCTION: GBC-013-drawer-section-links
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep GBC-013-drawer-section-links --project=chromium-mobile
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the drawer maps a separate hardcoded list that omits Guides, Porting or Changelog', 'NAV_LINKS still holds only the 2 pre-sprint entries', 'the /porting route is removed, so the tapped link answers 404']
        EVIDENCE: screenshot
        - START_REF: integrated_site_five_sections
          ACTION: ['In the chromium-mobile project, navigateLocalhost to /, then /docs/installation, then /guides', 'On each page, assert .site-header__nav is hidden, then click summary.site-drawer__toggle once', 'Read the open attribute of details.site-drawer and the text and href of every visible anchor in .site-drawer__nav', 'Call page.request.get on each of the 5 drawer hrefs and record each status', "On /guides, tap the drawer anchor with text 'Porting' and record the resulting pathname and status", 'Capture a screenshot of the open drawer on /guides']
          MUST_OBSERVE: ["details.site-drawer carries the 'open' attribute after 1 click on summary.site-drawer__toggle on each of the 3 pages", "exactly 5 visible anchors in .site-drawer__nav, text in order 'Components', 'Registry', 'Guides', 'Porting', 'Changelog'", "drawer hrefs in order '/components', '/registry', '/guides', '/porting', '/changelog', identical to the desktop header list", 'page.request.get returns status 200 for 5 of 5 drawer hrefs', "tapping 'Porting' lands on pathname '/porting' with status 200"]
          MUST_NOT_OBSERVE: ['only 2 drawer anchors, the pre-sprint start state', 'a drawer that stays closed or shows an empty nav after the click', 'any drawer href answering 404']

## Test Criteria
- TC-1: On chromium-desktop, /, /docs/installation and /guides each show exactly 5 header anchors with hrefs '/components', '/registry', '/guides', '/porting', '/changelog' in that order, each answering 200, and the footer nav carries the same 5 hrefs.  (maps_to: AC-1)
- TC-2: On chromium-mobile, the opened drawer on each of the 3 pages shows exactly the same 5 hrefs in the same order, each answering 200, and tapping 'Porting' lands on /porting with status 200.  (maps_to: AC-2)

## Reading List
- apps/docs/src/components/Header.astro
- apps/docs/src/components/Footer.astro
- apps/docs/src/lib/docs-navigation.ts

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/components/Header.astro (MODIFY)
- apps/docs/src/components/Footer.astro (MODIFY)
- tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts (NEW)
WRITE-PROHIBITED:
- apps/docs/src/components/islands/** (SearchDialog/ThemeToggle islands are separate concerns)
- apps/docs/src/styles/global.css (design lens owns visual treatment)

## Design
References: ['apps/docs/src/components/Header.astro (NAV_LINKS + drawer map)']
Interaction notes: Zero-JS by construction (plain anchors), no island changes. Footer nav is a co-located update for consistency.
Pattern: Section-nav array consumed by both the desktop nav and the <details> drawer (apps/docs/src/components/Header.astro)
Anti-pattern: Hand-authoring two divergent link lists (desktop vs drawer)

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep GBC-013-header-section-links --project=chromium-desktop
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep GBC-013-drawer-section-links --project=chromium-mobile

## Dependencies
Depends on: ['GBC-008', 'GBC-009', 'GBC-010']
Blocks:     ['GBC-014']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-013",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "integrated_site_five_sections": {
      "description": "The candidate after GBC-008, GBC-009 and GBC-010 have routed /changelog, /porting and /guides, plus this task's Header.astro and Footer.astro edits. The real ordered docs build (pnpm --filter @rnr-ai-elements/docs build, which ends in check:links) produces apps/docs/dist, and the Playwright-owned astro preview serves it at http://localhost:4321. Each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "Header.astro NAV_LINKS holds 5 entries in this order: Components /components, Registry /registry, Guides /guides, Porting /porting, Changelog /changelog. The desktop nav and the <details> drawer both map that one array.",
        "Footer.astro's nav[aria-label=\"Footer\"] holds the same 5 hrefs in the same order.",
        "/components, /registry, /guides, /porting and /changelog are emitted into apps/docs/dist from the candidate's own sources."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the built site with /guides, /porting and /changelog routed, served by the Playwright-owned preview at http://localhost:4321 WHEN a visitor on chromium-desktop opens /, /docs/installation and /guides THEN each page's header nav shows exactly Components, Registry, Guides, Porting, Changelog in that order, each href answers 200, and the footer nav carries the same five hrefs",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts",
      "test_function": "GBC-013-header-section-links",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep GBC-013-header-section-links --project=chromium-desktop",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop (chromium-desktop project)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop (chromium-desktop project)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "NAV_LINKS still holds only the 2 pre-sprint entries (Components, Registry)",
            "a section entry is omitted, or its route is removed so its href answers 404",
            "the footer keeps a hardcoded 2-link list"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "integrated_site_five_sections",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "In the chromium-desktop project, navigateLocalhost to /, then /docs/installation, then /guides, and record each response status",
                "On each page, read the text and href of every anchor in .site-header__nav",
                "Call page.request.get on http://localhost:4321 plus each of the 5 header hrefs and record each status",
                "On /, read the href of every anchor in footer nav[aria-label=\"Footer\"]",
                "Capture a screenshot of the header on /guides"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP 200 for each of the 3 pages '/', '/docs/installation' and '/guides'",
                "exactly 5 anchors in .site-header__nav on each of the 3 pages, text in order 'Components', 'Registry', 'Guides', 'Porting', 'Changelog'",
                "the 5 header hrefs in order '/components', '/registry', '/guides', '/porting', '/changelog'",
                "page.request.get returns status 200 for 5 of 5 header hrefs",
                "exactly 5 anchors in footer nav[aria-label=\"Footer\"] with the same 5 hrefs in the same order"
              ],
              "must_not_observe": [
                "only 2 header anchors, the pre-sprint '/components' and '/registry' start state",
                "any header or footer href that is empty, '#', or answers 404",
                "a header link order other than Components, Registry, Guides, Porting, Changelog"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the same built site on the chromium-mobile project, whose Pixel 5 viewport is below the 64rem breakpoint where the desktop nav is hidden WHEN a visitor opens the <details> drawer on /, /docs/installation and /guides THEN the drawer shows exactly the same five links in the same order, each href answers 200, and tapping Porting loads /porting",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts",
      "test_function": "GBC-013-drawer-section-links",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep GBC-013-drawer-section-links --project=chromium-mobile",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium at the Pixel 5 viewport (chromium-mobile project)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium at the Pixel 5 viewport (chromium-mobile project)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the drawer maps a separate hardcoded list that omits Guides, Porting or Changelog",
            "NAV_LINKS still holds only the 2 pre-sprint entries",
            "the /porting route is removed, so the tapped link answers 404"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "integrated_site_five_sections",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "In the chromium-mobile project, navigateLocalhost to /, then /docs/installation, then /guides",
                "On each page, assert .site-header__nav is hidden, then click summary.site-drawer__toggle once",
                "Read the open attribute of details.site-drawer and the text and href of every visible anchor in .site-drawer__nav",
                "Call page.request.get on each of the 5 drawer hrefs and record each status",
                "On /guides, tap the drawer anchor with text 'Porting' and record the resulting pathname and status",
                "Capture a screenshot of the open drawer on /guides"
              ]
            },
            "end_state": {
              "must_observe": [
                "details.site-drawer carries the 'open' attribute after 1 click on summary.site-drawer__toggle on each of the 3 pages",
                "exactly 5 visible anchors in .site-drawer__nav, text in order 'Components', 'Registry', 'Guides', 'Porting', 'Changelog'",
                "drawer hrefs in order '/components', '/registry', '/guides', '/porting', '/changelog', identical to the desktop header list",
                "page.request.get returns status 200 for 5 of 5 drawer hrefs",
                "tapping 'Porting' lands on pathname '/porting' with status 200"
              ],
              "must_not_observe": [
                "only 2 drawer anchors, the pre-sprint start state",
                "a drawer that stays closed or shows an empty nav after the click",
                "any drawer href answering 404"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "On chromium-desktop, /, /docs/installation and /guides each show exactly 5 header anchors with hrefs '/components', '/registry', '/guides', '/porting', '/changelog' in that order, each answering 200, and the footer nav carries the same 5 hrefs.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts",
      "test_function": "GBC-013-header-section-links",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep GBC-013-header-section-links --project=chromium-desktop",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop (chromium-desktop project)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "On chromium-mobile, the opened drawer on each of the 3 pages shows exactly the same 5 hrefs in the same order, each answering 200, and tapping 'Porting' lands on /porting with status 200.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts",
      "test_function": "GBC-013-drawer-section-links",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep GBC-013-drawer-section-links --project=chromium-mobile",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium at the Pixel 5 viewport (chromium-mobile project)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    }
  ]
}
-->
