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

## Specification
Objective: Wire the three new sections (Guides, Porting, Changelog) into the header and footer nav so a visitor can reach them site-wide.
Success state: On any page, the header shows the five section links, each resolving 200.

## Acceptance Criteria
### AC-1: Header shows the five section links, each resolving 200
  GIVEN: the built site with all three sections routed
  WHEN:  a visitor opens any page
  THEN:  the header shows Components, Registry, Guides, Porting, Changelog and each resolves 200
  FLOW_REF: journeys/docs-integrator-arc
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts
  TEST_FUNCTION: journeys/docs-integrator-arc: header shows the five section links resolving 200
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep journeys/docs-integrator-arc
  SCENARIO:
        MUST_OBSERVE: ['header links for Components, Registry, Guides, Porting, Changelog', 'each resolves 200']
        MUST_NOT_OBSERVE: ['a dead nav href', 'Guides/Porting/Changelog missing from the header']

### AC-2: Mobile drawer carries the same five links
  GIVEN: the <details> drawer at <lg
  WHEN:  a visitor opens the drawer
  THEN:  the same five links are present and resolve 200
  FLOW_REF: journeys/docs-themer-arc
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts
  TEST_FUNCTION: journeys/docs-themer-arc: drawer carries the five section links
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep journeys/docs-themer-arc
  SCENARIO:
        MUST_OBSERVE: ['drawer links for the five sections']
        MUST_NOT_OBSERVE: ['drawer missing a section link']

## Test Criteria
- TC-1: header nav carries the five section links resolving 200  (maps_to: AC-1)
- TC-2: drawer nav carries the five section links  (maps_to: AC-2)

## Reading List
- apps/docs/src/components/Header.astro
- apps/docs/src/components/Footer.astro
- apps/docs/src/lib/docs-navigation.ts

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/components/Header.astro (MODIFY — NAV_LINKS + drawer links)
- apps/docs/src/components/Footer.astro (MODIFY — section links)
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
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep journeys/docs-integrator-arc

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
    "five_section_links": "NAV_LINKS + drawer + footer carry Components, Registry, Guides, Porting, Changelog"
  },
  "requirements": [
    {
      "id": "GBC-013-R1",
      "source": "AC-1",
      "type": "behavioral",
      "statement": "header shows the five section links resolving 200",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep journeys/docs-integrator-arc"
    },
    {
      "id": "GBC-013-R2",
      "source": "AC-2",
      "type": "behavioral",
      "statement": "drawer carries the five section links",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep journeys/docs-themer-arc"
    },
    {
      "id": "GBC-013-R3",
      "source": "TC-1",
      "type": "boolean-check",
      "statement": "header nav 200",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep journeys/docs-integrator-arc"
    },
    {
      "id": "GBC-013-R4",
      "source": "TC-2",
      "type": "boolean-check",
      "statement": "drawer nav present",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/header-nav.spec.ts --grep journeys/docs-themer-arc"
    }
  ]
}
-->
