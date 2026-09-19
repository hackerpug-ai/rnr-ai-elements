================================================================================
TASK: GBC-008 - /changelog section-index and /changelog/[version] release pages
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
- render /changelog as a section-index page with entries in strict reverse-chronological order
- render /changelog/[version] with the literal release date and Added/Changed/Fixed headings
- link each touched component to its /components/[item] page
- derive hrefs and sort order from apps/docs/src/lib/changelog.ts (single source both routes read), implementing the same date-DESC-then-semver-DESC tiebreak as GBC-007's gate
NEVER:
- hardcode the changelog entries or their order in a page (derive from the collection)
- render a changelog page without the three Added/Changed/Fixed sections
- link a touched component to a non-existent route
STRICTLY:
- reverse-chronological = newest first (0.2.1 above 0.2.0 above 0.1.0); on equal dates order by semver DESC — mirrors GBC-007's tiebreak (v0.2.0 and v0.2.1 share 2026-09-08)
- version route param matches the entry version (no `v` prefix)

## Specification
Objective: Publish the changelog section-index and one page per release from the changelog collection, newest-first, with per-release Added/Changed/Fixed sections and touched-component links.
Success state: Over the built preview, /changelog lists 0.2.1 above 0.2.0 above 0.1.0 and /changelog/0.2.1 returns 200 with a date, Added/Changed/Fixed headings, and touched-component links that resolve 200.

## Acceptance Criteria
### AC-1: Changelog reads newest-first with per-release pages [PRIMARY]
  GIVEN: a built dist with three changelog entries 0.1.0, 0.2.0, 0.2.1
  WHEN:  a visitor opens /changelog and then /changelog/0.2.1
  THEN:  the index lists 0.2.1 above 0.2.0 above 0.1.0 and the detail page returns 200 with a date plus Added/Changed/Fixed headings and touched-component links that resolve 200
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages: newest-first with per-release pages
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        MUST_OBSERVE: ['/changelog 200', '/changelog/0.2.1 200', '0.2.1 appears above 0.2.0', '0.2.0 appears above 0.1.0', 'Added/Changed/Fixed headings on /changelog/0.2.1', 'a touched-component link resolves 200']
        MUST_NOT_OBSERVE: ['any non-200 release link', 'a release page without the three headings', 'reverse order (0.1.0 above 0.2.0)']

### AC-2: Every entry links a 200 page with date + Added/Changed/Fixed
  GIVEN: the changelog index with all entries
  WHEN:  a visitor opens each linked /changelog/{version} page
  THEN:  every page returns 200 with a date and Added/Changed/Fixed headings
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages: every entry links a 200 page with date + three headings
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        MUST_OBSERVE: ['3 release links', 'each link 200', 'each page carries a date', 'each page carries Added/Changed/Fixed headings']
        MUST_NOT_OBSERVE: ['a release page missing any of the three headings']

### AC-3: Release-to-component links resolve
  GIVEN: a release entry (0.2.1) linking touched components
  WHEN:  a visitor follows a touched-component link
  THEN:  it resolves 200 to a page titled per the registry item name
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages: touched-component links resolve 200
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        MUST_OBSERVE: ['>=1 touched-component link on /changelog/0.2.1', 'each link 200', 'destination h1 equals the item name']
        MUST_NOT_OBSERVE: ['a dead component link']

## Test Criteria
- TC-1: /changelog serves a section-index with entries in reverse-chronological order  (maps_to: AC-1)
- TC-2: every entry links a 200 page with date + Added/Changed/Fixed  (maps_to: AC-2)
- TC-3: touched-component links resolve to item pages  (maps_to: AC-3)

## Reading List
- apps/docs/src/pages/docs/[...id].astro
- apps/docs/src/layouts/MarkdownLayout.astro
- apps/docs/src/lib/docs-navigation.ts
- apps/docs/src/components/PageHeader.astro
- tests/sprint-05-orient-search/boundary-content.spec.ts

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/pages/changelog/index.astro (NEW)
- apps/docs/src/pages/changelog/[version].astro (NEW)
- apps/docs/src/lib/changelog.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts (NEW locked-flow spec)
WRITE-PROHIBITED:
- apps/docs/src/content/changelog/** (GBC-007/GBC-005 own entries)
- apps/docs/src/components/IndexList.astro (design lens owns the primitive)
- apps/docs/src/components/** (design lens owns primitives)

## Design
References: ['apps/docs/src/pages/docs/[...id].astro (getStaticPaths + render pattern)', 'apps/docs/src/layouts/MarkdownLayout.astro']
Interaction notes: The index and [version] pages reuse DocsLayout/PageHeader; IndexList and the section-index layout come from the frontend-designer lens (cross-lens contract) — this task composes, not authors IndexList.
Pattern: Generated section-index + getStaticPaths detail pages over a content collection (apps/docs/src/pages/components/[item].astro + apps/docs/src/pages/components/index.astro)
Anti-pattern: Hardcoding release entries or order in the page template

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages

## Dependencies
Depends on: ['GBC-007']
Blocks:     ['GBC-013', 'GBC-014']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-008",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "three_tags_v010_v020_v021": "the three real changelog entries render as three index rows + three detail pages"
  },
  "requirements": [
    {
      "id": "GBC-008-R1",
      "source": "AC-1",
      "type": "behavioral",
      "statement": "changelog reads newest-first with per-release pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages"
    },
    {
      "id": "GBC-008-R2",
      "source": "AC-2",
      "type": "behavioral",
      "statement": "every entry links a 200 page with date + Added/Changed/Fixed",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages"
    },
    {
      "id": "GBC-008-R3",
      "source": "AC-3",
      "type": "behavioral",
      "statement": "touched-component links resolve",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages"
    },
    {
      "id": "GBC-008-R4",
      "source": "TC-1",
      "type": "boolean-check",
      "statement": "reverse-chronological index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages"
    },
    {
      "id": "GBC-008-R5",
      "source": "TC-2",
      "type": "boolean-check",
      "statement": "per-release 200 pages with three headings",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages"
    },
    {
      "id": "GBC-008-R6",
      "source": "TC-3",
      "type": "boolean-check",
      "statement": "touched-component links 200",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages"
    }
  ]
}
-->
