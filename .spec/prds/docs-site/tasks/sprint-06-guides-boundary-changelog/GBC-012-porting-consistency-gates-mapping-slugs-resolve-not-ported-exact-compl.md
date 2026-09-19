================================================================================
TASK: GBC-012 - Porting consistency gates (mapping slugs resolve; not-ported exact complement)
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
- cross-check every mapping-column slug against the 56 registry items and fail naming the row + unknown slug
- compute set(upstream) - set(mapped) and compare to set(not-ported), failing naming any drift and both lists
- cross-check the boundary `gaps` frontmatter array (owns-vs-does-not-own.mdx, GBC-003): every gap ∈ consumer-owned ∪ not-ported, and no gap names one of the 56 slugs — fail naming the gap
- wire into prebuild.ts (or the /porting route getStaticPaths) so drift fails the build
- write a RED-first vitest drill for unknown slug, mapped-but-still-not-ported, new-upstream-in-neither, and a planted gaps-list contradiction (a gap naming a ledger slug)
NEVER:
- author the /porting mapping or not-ported list (techwriting owns the structured source)
- hardcode the 56-item list inside this gate (read the tracked packages/registry/registry.json — never the gitignored generated registry-items.json)
- warn-only on a mapping slug that does not resolve
STRICTLY:
- the 56-item source is the tracked packages/registry/registry.json (registry-items.json is gitignored prebuild output — absent on fresh worktrees)
- the upstream element set is the `upstream` frontmatter array from porting.md (GBC-004 authors it from the dated upstream snapshot) — never derived from the mapping source itself
- parse content frontmatter with the same YAML stack Astro's glob loader uses (gray-matter/js-yaml) — one parse authority, no drift between the gate's view and Astro's

## Specification
Objective: Fail the build when the /porting mapping references a non-existent registry slug or the not-ported list is not the exact complement of the mapping against the upstream total.
Success state: A healthy build has every mapping slug resolving to one of the 56 items and not-ported == set(upstream) - set(mapped); an unknown slug, a mapped-but-still-not-ported element, or a new-upstream-in-neither element each fails naming the offender.

## Acceptance Criteria
### AC-1: Healthy build: mapping resolves and not-ported is the exact complement [PRIMARY]
  GIVEN: the structured /porting mapping, not-ported list, and the 56-item registry dataset
  WHEN:  the porting consistency gate runs
  THEN:  the build is green: every mapping slug resolves to one of the 56 items and not-ported == set(upstream) - set(mapped)
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + packages/registry/registry.json
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art: healthy mapping resolves and not-ported is the exact complement
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  SCENARIO:
        MUST_OBSERVE: ['exit 0', 'every mapping slug resolves to one of 56 items', 'not-ported == set(upstream) - set(mapped)']
        MUST_NOT_OBSERVE: ['a mapping slug not in the 56 items', 'a not-ported item that is also mapped', 'an upstream element in neither list']

### AC-2: Unknown mapping slug fails the build
  GIVEN: a mapping row maps Conversation to chat-conversation (real slug conversation)
  WHEN:  the gate runs
  THEN:  it fails naming the row and the unknown slug chat-conversation
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + packages/registry/registry.json
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art: unknown slug chat-conversation fails naming the row
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names the row', 'names `chat-conversation`']
        MUST_NOT_OBSERVE: ['exit 0']

### AC-3: Mapped-but-still-not-ported fails the build
  GIVEN: Conversation is mapped and also listed as not-ported
  WHEN:  the gate runs
  THEN:  it fails naming the element and both lists involved
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + packages/registry/registry.json
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art: mapped-but-still-not-ported element fails naming both lists
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names the element (e.g. Conversation)', 'states both mapping and not-ported']
        MUST_NOT_OBSERVE: ['exit 0']

### AC-4: New upstream element in neither list fails the build
  GIVEN: a new upstream element tracked in neither mapping nor not-ported
  WHEN:  the gate runs
  THEN:  it fails naming the element
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + packages/registry/registry.json
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art: new upstream element in neither list fails
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names the untracked upstream element']
        MUST_NOT_OBSERVE: ['exit 0']

## Test Criteria
- TC-1: healthy mapping + not-ported complement passes  (maps_to: AC-1)
- TC-2: unknown mapping slug fails  (maps_to: AC-2)
- TC-3: mapped-but-not-ported fails  (maps_to: AC-3)
- TC-4: new-upstream-in-neither fails  (maps_to: AC-4)

## Reading List
- packages/registry/registry.json (tracked 56-item source)
- scripts/docs-data/prebuild.ts
- scripts/docs-data/gates.ts
- scripts/docs-data/check-dist-links.ts
- tests/sprint-05-orient-search/dist-link-gate.test.ts

## Guardrails
WRITE-ALLOWED:
- scripts/docs-data/porting-consistency.ts (NEW)
- scripts/docs-data/prebuild.ts (MODIFY — invoke the porting consistency check)
- tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts (NEW vitest fixture drill)
WRITE-PROHIBITED:
- apps/docs/src/content/docs/** (techwriting authors /porting prose + the structured mapping/not-ported source)
- apps/docs/src/pages/porting.astro (GBC-009 owns the route)

## Design
References: ['scripts/docs-data/gates.ts (cross-check vs pinned dataset)', 'scripts/docs-data/check-dist-links.ts (DEFAULT_REQUIRED_REFERENCES already covers prior-art liveness)']
Interaction notes: Depends on GBC-004 producing mapping/notPorted/upstream as porting.md frontmatter arrays plus a pinned upstream element set; this task validates that source against registry-items.json. Prior-art link liveness is already covered by check-dist-links.ts DEFAULT_REQUIRED_REFERENCES.
Pattern: Cross-dataset consistency gate (porting.md frontmatter vs packages/registry/registry.json + boundary gaps array) + RED-first fixture drill (scripts/docs-data/gates.ts)
Anti-pattern: Hardcoding the 56-item list inside the gate, or reading the gitignored registry-items.json instead of the tracked registry.json

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts

## Dependencies
Depends on: ['GBC-004']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-012",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "unknown_slug": "a mapping row maps Conversation to chat-conversation (real slug is conversation) -> fails naming the row + unknown slug",
    "mapped_still_not_ported": "Conversation is mapped but also listed as not-ported -> fails naming it and both lists",
    "new_upstream_in_neither": "a new upstream element appears in neither mapping nor not-ported -> fails naming the element"
  },
  "requirements": [
    {
      "id": "GBC-012-R1",
      "source": "AC-1",
      "type": "behavioral",
      "statement": "healthy mapping resolves and not-ported is the exact complement",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts"
    },
    {
      "id": "GBC-012-R2",
      "source": "AC-2",
      "type": "behavioral",
      "statement": "unknown mapping slug fails naming the row",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts"
    },
    {
      "id": "GBC-012-R3",
      "source": "AC-3",
      "type": "behavioral",
      "statement": "mapped-but-still-not-ported fails naming both lists",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts"
    },
    {
      "id": "GBC-012-R4",
      "source": "AC-4",
      "type": "behavioral",
      "statement": "new upstream element in neither list fails",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts"
    },
    {
      "id": "GBC-012-R5",
      "source": "TC-1",
      "type": "boolean-check",
      "statement": "healthy complement",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts"
    },
    {
      "id": "GBC-012-R6",
      "source": "TC-2",
      "type": "boolean-check",
      "statement": "unknown slug rejection",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts"
    }
  ]
}
-->
