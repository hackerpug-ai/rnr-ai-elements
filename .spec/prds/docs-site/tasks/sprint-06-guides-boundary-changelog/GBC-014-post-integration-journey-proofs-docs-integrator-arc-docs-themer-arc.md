================================================================================
TASK: GBC-014 - Post-integration journey proofs (docs-integrator-arc + docs-themer-arc)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     5
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- drive the integrator arc: /docs/installation engine-once -> quickstart -> /registry copy -> boundary -> example app useChat
- drive the themer arc: /docs/theming token map -> live toggle -> token-customize guide -> seam pages
- assert engine choice never leaks into a URL and never resets mid-journey
- assert no short-name or relative install command appears
- follow the sprint-05 convention (navigateLocalhost over the built preview, per-test evidence JSON capture)
NEVER:
- mock the backend or stub guide/boundary/changelog content
- substitute a mock renderer
- report a journey as passing without evidence files
STRICTLY:
- navigate only via the localhost preview origin (navigateLocalhost)
- evidence written to tests/sprint-06-guides-boundary-changelog/evidence/**

## Specification
Objective: Prove the two cross-UC journeys end-to-end over the integrated site so the sprint can sign off on the full surface.
Success state: pnpm e2e:docs exits 0 with both journey specs passing and evidence files written.

## Acceptance Criteria
### AC-1: docs-integrator-arc completes end to end [PRIMARY]
  GIVEN: the fully integrated site
  WHEN:  a visitor runs the integrator arc (installation engine-once -> quickstart -> registry copy -> boundary -> example useChat)
  THEN:  every step returns 200 and no copied command is short-name or relative
  FLOW_REF: journeys/docs-integrator-arc
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts
  TEST_FUNCTION: journeys/docs-integrator-arc: install and wire a chat screen end to end
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc
  SCENARIO:
        MUST_OBSERVE: ['/docs/installation 200', '/docs/quickstart 200', '/registry 200 with 56 rows', '/docs/owns-vs-does-not-own 200', 'absolute-URL install command only']
        MUST_NOT_OBSERVE: ['engine choice in the URL', 'engine reset mid-journey', 'a short-name or relative install command']

### AC-2: Engine choice never leaks into a URL and never resets
  GIVEN: the integrator arc with an engine selected
  WHEN:  the visitor navigates across >=3 pages
  THEN:  no engine query param or path segment appears and the selection persists
  FLOW_REF: journeys/docs-integrator-arc
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts
  TEST_FUNCTION: journeys/docs-integrator-arc: engine choice never leaks or resets
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc
  SCENARIO:
        MUST_OBSERVE: ['engine persisted across >=3 pages', 'no engine in URL across >=5 pages']
        MUST_NOT_OBSERVE: ['an engine query param or path segment', 'a mid-journey engine reset']

### AC-3: docs-themer-arc completes end to end [PRIMARY]
  GIVEN: the fully integrated site
  WHEN:  a visitor runs the themer arc (theming token map -> live toggle -> token-customize guide -> seam pages)
  THEN:  the TokenTable flips live with the theme toggle and the seam links resolve 200
  FLOW_REF: journeys/docs-themer-arc
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts
  TEST_FUNCTION: journeys/docs-themer-arc: re-theme the suite through the documented token seam
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc
  SCENARIO:
        MUST_OBSERVE: ['/docs/theming 200 with token map', 'token-customize guide 200', 'seam links on seam-using pages 200', 'no tailwind.config.js statement']
        MUST_NOT_OBSERVE: ['stale token swatches after toggle', 'a flash on theme flip', 'dead seam links']

### AC-4: Seam links resolve on seam-using pages
  GIVEN: component pages using renderMarkdown / TextClassContext
  WHEN:  a visitor follows the seam links
  THEN:  they resolve 200 to the guides that document the seams
  FLOW_REF: journeys/docs-themer-arc
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts
  TEST_FUNCTION: journeys/docs-themer-arc: seam links resolve to the guides
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc
  SCENARIO:
        MUST_OBSERVE: ['renderMarkdown seam link 200', 'TextClassContext seam link 200']
        MUST_NOT_OBSERVE: ['a dead seam link']

## Test Criteria
- TC-1: integrator arc completes with absolute-URL-only commands  (maps_to: AC-1)
- TC-2: engine never leaks into URL nor resets  (maps_to: AC-2)
- TC-3: themer arc completes with live swatches  (maps_to: AC-3)
- TC-4: seam links resolve  (maps_to: AC-4)

## Reading List
- tests/sprint-05-orient-search/boundary-content.spec.ts
- tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts
- tests/sprint-05-orient-search/registry-ledger-controls.spec.ts
- tests/harness/docs-preview.ts
- playwright.config.ts

## Guardrails
WRITE-ALLOWED:
- tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts (NEW)
WRITE-PROHIBITED:
- apps/docs/src/** (specs assert the built site; they never edit it)
- tests/sprint-01..05/** (prior lanes are frozen)

## Design
References: ['tests/sprint-05-orient-search/boundary-content.spec.ts (evidence capture convention)', 'tests/harness/docs-preview.ts (navigateLocalhost + waitForAstroPageLoad)']
Interaction notes: Both journeys are post-integration: they only pass once the full surface (UC-DOCS-01..06, GEND-03/04/07, SHELL-01/03) is present. They follow the sprint-05 evidence-capture convention (per-test JSON under evidence/).
Pattern: Cross-UC journey spec over the real built dist with per-test evidence capture (tests/sprint-05-orient-search/boundary-content.spec.ts)
Anti-pattern: Mock renderer or stubbed content standing in for the integrated site

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc

## Dependencies
Depends on: ['GBC-008', 'GBC-009', 'GBC-010', 'GBC-013']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-014",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "integrator_arc": "engine-once -> quickstart -> registry copy -> boundary -> example useChat",
    "themer_arc": "theming token map -> live toggle -> token guide -> seam pages"
  },
  "requirements": [
    {
      "id": "GBC-014-R1",
      "source": "AC-1",
      "type": "behavioral",
      "statement": "integrator arc completes end to end with absolute-URL commands",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc"
    },
    {
      "id": "GBC-014-R2",
      "source": "AC-2",
      "type": "behavioral",
      "statement": "engine never leaks into URL nor resets",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc"
    },
    {
      "id": "GBC-014-R3",
      "source": "AC-3",
      "type": "behavioral",
      "statement": "themer arc completes with live swatches",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc"
    },
    {
      "id": "GBC-014-R4",
      "source": "AC-4",
      "type": "behavioral",
      "statement": "seam links resolve",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc"
    },
    {
      "id": "GBC-014-R5",
      "source": "TC-1",
      "type": "boolean-check",
      "statement": "integrator arc",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc"
    },
    {
      "id": "GBC-014-R6",
      "source": "TC-3",
      "type": "boolean-check",
      "statement": "themer arc",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc"
    }
  ]
}
-->
