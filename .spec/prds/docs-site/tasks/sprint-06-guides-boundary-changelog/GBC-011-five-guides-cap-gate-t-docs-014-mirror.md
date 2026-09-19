================================================================================
TASK: GBC-011 - Five-guides cap gate (T-DOCS-014 mirror)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     3
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- fail the build when the non-reserved guides-section entry count differs from 5 in either direction (a sixth guide or a 4-guide tree), naming the file (e.g. guides/migrating-from-v0.md) and the five-page launch cap; the reserved `theming` slug (re-sectioned to getting-started by GBC-001) never counts toward the cap
- pass with exactly 5 non-reserved guides-section entries and print `[docs-data] guides: 5 guides — cap satisfied` (the success line asserts count === 5 exactly — the floor is enforced, not just the ceiling)
- wire the assertion into the /guides/[slug] route getStaticPaths so every static build enforces it
- write a RED-first vitest drill that builds the real site, writes a sixth guide, asserts failure, restores, asserts green
NEVER:
- warn-only on a sixth guide
- count non-guides-section entries toward the cap
- derive the cap count from the dataset (5 is pinned)
STRICTLY:
- cap = 5 (pinned constant, never self-derived)
- the offending file is named in the failure

## Specification
Objective: Enforce the five-page guides cap as a build-time gate so a sixth guide can never ship.
Success state: A sixth guides/migrating-from-v0.md fixture (and separately a 4-guide tree) fails the build naming the file and the cap; the five-guide set builds green with /guides listing exactly 5.

## Acceptance Criteria
### AC-1: A sixth guide is rejected at the five-page cap
  GIVEN: a tree with five guides-section entries plus guides/migrating-from-v0.md
  WHEN:  the docs build runs
  THEN:  it exits non-zero naming guides/migrating-from-v0.md and the five-page launch cap
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index: sixth guide rejected naming the file and the cap
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names `guides/migrating-from-v0.md`', 'states the five-page launch cap']
        MUST_NOT_OBSERVE: ['exit 0', 'an index rendering 6 cards']

### AC-2: The five-guide set passes and the index lists exactly 5
  GIVEN: the five launch guides and no sixth
  WHEN:  the docs build runs and the index is read
  THEN:  the build exits 0, prints `[docs-data] guides: 5 guides — cap satisfied`, and /guides lists exactly 5
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index: five-guide set passes with cap-satisfied line
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts
  SCENARIO:
        MUST_OBSERVE: ['exit 0', '`[docs-data] guides: 5 guides — cap satisfied` on stdout']
        MUST_NOT_OBSERVE: ['a cap violation', 'a sixth card']

## Test Criteria
- TC-1: a sixth guide fails the build naming the file and the cap  (maps_to: AC-1)
- TC-2: five guides pass with the cap-satisfied line  (maps_to: AC-2)
- TC-3: the cap assertion is wired into the guides route getStaticPaths  (maps_to: AC-1)

## Reading List
- apps/docs/src/lib/docs-navigation.ts
- apps/docs/src/pages/guides/[slug].astro
- scripts/docs-data/gates.ts
- tests/sprint-05-orient-search/dist-link-gate.test.ts

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/lib/docs-navigation.ts (MODIFY — add assertGuidesCap)
- apps/docs/src/pages/guides/[slug].astro (MODIFY — invoke assertGuidesCap in getStaticPaths)
- tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts (NEW vitest fixture drill)
WRITE-PROHIBITED:
- apps/docs/src/content/docs/guides/** (techwriting authors the five guides)
- apps/docs/src/components/** (design lens owns primitives)

## Design
References: ['scripts/docs-data/gates.ts (pinned-constant gate)', 'tests/sprint-05-orient-search/dist-link-gate.test.ts (real-build fixture drill)']
Interaction notes: The five guides themselves are authored by the techwriting-planner; this gate only counts and rejects overflow. The cap count (5) and the naming of the offending file must match the techwriting content exactly.
Pattern: Pinned-constant build gate over collection entries + real-build fixture drill (scripts/docs-data/gates.ts)
Anti-pattern: Deriving the cap count from the dataset under test

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts

## Dependencies
Depends on: ['GBC-009']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-011",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "sixth_guide": "add guides/migrating-from-v0.md -> build fails naming it + the five-page launch cap",
    "five_guide_set": "the five launch guides -> build green, /guides lists exactly 5"
  },
  "requirements": [
    {
      "id": "GBC-011-R1",
      "source": "AC-1",
      "type": "behavioral",
      "statement": "a sixth guide fails the build naming the file and cap",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts"
    },
    {
      "id": "GBC-011-R2",
      "source": "AC-2",
      "type": "behavioral",
      "statement": "five guides pass with the cap-satisfied line",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts"
    },
    {
      "id": "GBC-011-R3",
      "source": "TC-1",
      "type": "boolean-check",
      "statement": "sixth-guide rejection",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts"
    },
    {
      "id": "GBC-011-R4",
      "source": "TC-2",
      "type": "boolean-check",
      "statement": "five-guide green",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts"
    },
    {
      "id": "GBC-011-R5",
      "source": "TC-3",
      "type": "boolean-check",
      "statement": "cap wired into getStaticPaths",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts"
    }
  ]
}
-->
