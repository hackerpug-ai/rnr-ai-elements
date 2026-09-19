================================================================================
TASK: GBC-009 - Section-aware routing: /guides/[slug] + /porting, exclude from /docs catch-all
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     5
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- make publishedDocs section-aware (the one href derivation the catch-all, guides route, porting route, and sidebar nav all read)
- make assertUniqueDestinations derive section-aware destinations (id -> href per section) so cross-section same-id entries are legal while same-destination still fails
- keep RESERVED_DOC_SLUGS dropping before section grouping (current behavior in docs-navigation.ts) and keep guide files flat (single-segment filenames) — the single-segment [slug] route never matches a param containing /
- scope the docs/[...id].astro catch-all to getting-started entries only
- add /guides/[slug].astro rendering guides-section entries through MarkdownLayout with section='guides'
- add /porting.astro rendering exactly one porting-section entry through MarkdownLayout with section='porting'
- keep the reserved `theming` slug exclusion intact
NEVER:
- publish a guides or porting entry at /docs/{slug} (no duplicate destination)
- render a guides-section entry at /docs/{slug} via the catch-all
- allow 0 or >1 porting entries to build silently
STRICTLY:
- getting-started -> /docs/{id}, guides -> /guides/{basename(id)} (strip the `guides/` directory prefix — idFromFile joins path segments, so `guides/re-theme` must publish at /guides/re-theme, never /guides/guides/re-theme), porting -> /porting
- a zero- or multi-porting count fails the build naming the count

## Specification
Objective: Route guides-section entries at /guides/{slug}, the single porting-section entry at /porting, and getting-started entries at /docs/{id}, with no duplicate destinations.
Success state: Over the built preview, /guides/{any-slug} and /porting each return 200 with no /docs/ alias also resolving; a duplicate destination fails the build.

## Acceptance Criteria
### AC-1: Guides publish at /guides/{slug}, not /docs/{slug}
  GIVEN: guides-section docs entries in the collection
  WHEN:  a visitor opens /guides/{slug} and /docs/{slug} for the same guide
  THEN:  /guides/{slug} returns 200 and /docs/{slug} does not exist (no duplicate destination)
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index: guides publish at /guides/{slug} with no /docs alias
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        MUST_OBSERVE: ['/guides/{slug} 200 for each guide', '/docs/{guide-slug} 404 (no alias)', '/docs/guides/{slug} 404 (no nested alias)']
        MUST_NOT_OBSERVE: ['a guide reachable at /docs/{slug}', 'a guide reachable at /docs/guides/{slug}', 'a doubled /guides/guides/{slug} segment']

### AC-2: Porting publishes at /porting (exactly one entry)
  GIVEN: the single porting-section entry (porting.md)
  WHEN:  a visitor opens /porting
  THEN:  /porting returns 200 with no /docs/porting alias
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art: /porting serves the single porting entry
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        MUST_OBSERVE: ['/porting 200', '/docs/porting 404 (no alias)']
        MUST_NOT_OBSERVE: ['/porting resolving to a /docs alias']

### AC-3: Zero or multiple porting entries fail the build
  GIVEN: a tree with zero or more-than-one porting-section entries
  WHEN:  the build runs
  THEN:  it fails naming the porting-entry count
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art: zero-or-multiple porting entries fail naming the count
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names the porting-entry count']
        MUST_NOT_OBSERVE: ['exit 0 with 0 or 2+ porting entries']

## Test Criteria
- TC-1: publishedDocs emits section-aware hrefs (getting-started /docs/{id}, guides /guides/{basename(id)}, porting /porting)  (maps_to: AC-1)
- TC-2: the docs catch-all no longer generates /docs/{id} for guides or porting sections  (maps_to: AC-1)
- TC-3: porting is exactly one entry, enforced at build  (maps_to: AC-3)

## Reading List
- apps/docs/src/lib/docs-navigation.ts
- apps/docs/src/pages/docs/[...id].astro
- apps/docs/src/pages/docs/theming.astro
- apps/docs/src/layouts/MarkdownLayout.astro

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/pages/guides/[slug].astro (NEW)
- apps/docs/src/pages/porting.astro (NEW)
- apps/docs/src/lib/docs-navigation.ts (MODIFY — section-aware href + per-section publishers)
- apps/docs/src/pages/docs/[...id].astro (MODIFY — filter to getting-started section)
- tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts (NEW)
WRITE-PROHIBITED:
- apps/docs/src/content/docs/** (techwriting authors guides/porting prose)
- apps/docs/src/components/** (design lens owns primitives)

## Design
References: ['apps/docs/src/lib/docs-navigation.ts (publishedDocs + assertUniqueDestinations)', 'apps/docs/src/pages/docs/[...id].astro']
Interaction notes: The routing contract (getting-started -> /docs/{slug}, guides -> /guides/{slug}, porting -> /porting) is authoritative here; the content lens (techwriting) authors against it.
Pattern: Section-aware publication contract: one href derivation consumed by every route + nav (apps/docs/src/lib/docs-navigation.ts)
Anti-pattern: Per-route hardcoded href prefixes that can disagree with the sidebar nav

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts

## Dependencies
Depends on: none
Blocks:     ['GBC-010', 'GBC-011', 'GBC-013', 'GBC-014']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-009",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "guides_section_entries": "five guides-section docs entries (authored by techwriting) publish at /guides/{slug}",
    "single_porting_entry": "one porting-section entry publishes at /porting",
    "duplicate_destination": "a guides entry also reachable at /docs/{slug} fails the build via the publishedDocs section filter + assertUniqueDestinations (the real guards in docs-navigation.ts — there is no prerenderConflictBehavior in a fully static build)"
  },
  "requirements": [
    {
      "id": "GBC-009-R1",
      "source": "AC-1",
      "type": "behavioral",
      "statement": "guides publish at /guides/{slug} with no /docs alias",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "GBC-009-R2",
      "source": "AC-2",
      "type": "behavioral",
      "statement": "porting publishes at /porting with no /docs alias",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art"
    },
    {
      "id": "GBC-009-R3",
      "source": "AC-3",
      "type": "behavioral",
      "statement": "zero or multiple porting entries fail the build naming the count",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts"
    },
    {
      "id": "GBC-009-R4",
      "source": "TC-1",
      "type": "boolean-check",
      "statement": "section-aware hrefs in publishedDocs",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "GBC-009-R5",
      "source": "TC-2",
      "type": "boolean-check",
      "statement": "catch-all scoped to getting-started",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "GBC-009-R6",
      "source": "TC-3",
      "type": "boolean-check",
      "statement": "porting exactly-one enforced",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts"
    }
  ]
}
-->
