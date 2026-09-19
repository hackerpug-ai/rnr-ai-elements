================================================================================
TASK: GBC-005 - Author the changelog release entries (v0.1.0–v0.2.1)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     3
AGENT:      planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

PROPOSED BY: techwriting-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- Author three entry files under apps/docs/src/content/changelog/ — 0.1.0.md (2026-09-07), 0.2.0.md (2026-09-08), 0.2.1.md (2026-09-08) — one per git tag through v0.2.1.
- Give each entry a version, a date, and a body with Added / Changed / Fixed headings (empty lists render 'none', headings never absent).
- Derive the added/changed/fixed content from the real tag history (git log v0.1.0, v0.1.0..v0.2.0, v0.2.0..v0.2.1), never invented.
- Link each touched component to its /components/[item] page by its real registry slug so every release link resolves.
NEVER:
- Never invent a release note, a touched component, or a date not present in git history.
- Never omit the date or any of the Added/Changed/Fixed headings (absent fields fail).
- Never name a touched component whose slug is not in the 56-item ledger.
- Never add a fourth entry beyond the existing git tags through v0.2.1.
- Never change content.config.ts (collection registration is astro's), routes, or the registry source.
STRICTLY:
- Strictly name the version slug without the 'v' prefix (route /changelog/0.2.1).
- Strictly keep one file per release, one-to-one with git tags.
- Strictly render reverse-chronological order (0.2.1 above 0.2.0 above 0.1.0).

## Specification
Objective: Three changelog entry files, one per git tag through v0.2.1, each with version, date, and Added/Changed/Fixed headings derived from real history, with resolving touched-component links.
Success state: A visitor opens /changelog and reads entries reverse-chronologically (v0.2.1, v0.2.0, v0.1.0), and /changelog/0.2.1 shows the literal date 2026-09-08 with Added/Changed/Fixed headings and a resolving touched-component link.

## Acceptance Criteria
### AC-1: changelog renders reverse-chronological [PRIMARY]
  GIVEN: the authored changelog entries and the real built preview
  WHEN:  a visitor opens /changelog
  THEN:  entries render reverse-chronological with v0.2.1 above v0.2.0 above v0.1.0
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['/changelog is empty, out of order, or omits a release']
        EVIDENCE: file_artifact
        - ACTION: ['Open /changelog through the real preview', 'Read the entry order']
          MUST_OBSERVE: ['v0.2.1 above v0.2.0 above v0.1.0', '3 entries']
          MUST_NOT_OBSERVE: ['an out-of-order adjacent pair', 'an empty index']

### AC-2: per-release page carries date and three lists
  GIVEN: the authored changelog entries
  WHEN:  a visitor opens /changelog/0.2.1
  THEN:  the page shows the literal date 2026-09-08 and Added/Changed/Fixed headings
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the page omits the date or any of the Added/Changed/Fixed headings']
        EVIDENCE: file_artifact
        - ACTION: ['Open /changelog/0.2.1', 'Read the date and headings']
          MUST_OBSERVE: ['the literal date 2026-09-08', 'Added heading', 'Changed heading', 'Fixed heading']
          MUST_NOT_OBSERVE: ['a missing date', 'a missing Added/Changed/Fixed heading']

### AC-3: one file per release, one-to-one with git tags
  GIVEN: the changelog collection and the real git tags
  WHEN:  a maintainer compares entries to tags
  THEN:  three entries map one-to-one to v0.1.0, v0.2.0, v0.2.1
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a tag lacks an entry or an entry lacks a tag']
        EVIDENCE: file_artifact
        - ACTION: ["Compare `git tag --list 'v*'` against the changelog entries"]
          MUST_OBSERVE: ['3 entries', 'one entry per tag v0.1.0, v0.2.0, v0.2.1']
          MUST_NOT_OBSERVE: ['a tag with no entry', 'an entry with no tag']

### AC-4: touched-component links resolve
  GIVEN: the authored changelog entries and the built item pages
  WHEN:  a visitor follows a touched-component link from a release page
  THEN:  the link resolves to a /components/[item] page with HTTP 200
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a touched-component link is dead or targets a non-existent item slug']
        EVIDENCE: file_artifact
        - ACTION: ['Open /changelog/0.2.1', 'Follow a touched-component link']
          MUST_OBSERVE: ['the touched-component link resolves HTTP 200 at a /components/[item] page']
          MUST_NOT_OBSERVE: ['a dead link', 'a target slug absent from the 56 items']

### AC-5: empty list renders explicit none, absent field fails
  GIVEN: a changelog entry whose Changed list is empty
  WHEN:  the page renders
  THEN:  the empty list renders an explicit 'none' rather than an absent heading
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a heading is absent rather than rendered with an explicit none']
        EVIDENCE: file_artifact
        - ACTION: ['Inspect a release page whose Changed list is empty']
          MUST_OBSERVE: ["an explicit 'none' or empty section under the heading"]
          MUST_NOT_OBSERVE: ['an absent heading']

## Test Criteria
- TC-1: /changelog renders reverse-chronological (v0.2.1, v0.2.0, v0.1.0) with 3 entries.  (maps_to: AC-1)
- TC-2: /changelog/0.2.1 shows the literal date 2026-09-08 and Added/Changed/Fixed headings.  (maps_to: AC-2)
- TC-3: Three entries map one-to-one to git tags v0.1.0, v0.2.0, v0.2.1.  (maps_to: AC-3)
- TC-4: A touched-component link from /changelog/0.2.1 resolves to a /components/[item] page.  (maps_to: AC-4)
- TC-5: Empty Added/Changed/Fixed lists render an explicit none; no heading is absent.  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — changelog entry template
- .spec/prds/docs-site/11-technical-requirements/03-data-schema.md — changelog_entry contract (version, date, body, one-to-one with git tags)
- packages/registry/registry.json — real touched-component slugs
- apps/docs/src/data/registry-items.json — the built ledger
- .spec/prds/docs-site/04-uc-docs.md — UC-DOCS-06 acceptance criteria

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/changelog/0.1.0.md (NEW)
- apps/docs/src/content/changelog/0.2.0.md (NEW)
- apps/docs/src/content/changelog/0.2.1.md (NEW)
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/content.config.ts (changelog collection registration is astro's)
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md', '.spec/prds/docs-site/11-technical-requirements/03-data-schema.md']
Interaction notes: Astro registers the changelog_entry collection and builds /changelog + /changelog/[version] routes plus the one-to-one git-tag sync gate. frontend-designer renders the /changelog index via IndexList. The version slug omits the 'v' prefix.
Pattern: changelog entry: version + date + Added/Changed/Fixed headings, one file per release (.spec/prds/docs-site/11-technical-requirements/03-data-schema.md)
Anti-pattern: invented release notes; an absent Added/Changed/Fixed heading; a fourth entry beyond the git tags

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages

## Dependencies
Depends on: none
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-005",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "authored_changelog_candidate": {
      "description": "The three changelog entry files under apps/docs/src/content/changelog/ enter the real changelog collection build; the registry build and gallery manifest produce the dist served by an owned localhost:4321 preview; each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/changelog/0.1.0.md (2026-09-07), 0.2.0.md (2026-09-08), 0.2.1.md (2026-09-08) are authored.",
        "git tags v0.1.0, v0.2.0, v0.2.1 supply the one-to-one mapping.",
        "packages/registry/registry.json supplies the real touched-component slugs.",
        "/changelog and /changelog/0.2.1 are built from the candidate's real sources."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN the authored changelog entries and the real built preview WHEN a visitor opens /changelog THEN entries render reverse-chronological with v0.2.1 above v0.2.0 above v0.1.0",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored changelog entries WHEN a visitor opens /changelog/0.2.1 THEN the page shows the literal date 2026-09-08 and Added/Changed/Fixed headings",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the changelog collection and the real git tags WHEN a maintainer compares entries to tags THEN three entries map one-to-one to v0.1.0, v0.2.0, v0.2.1",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored changelog entries and the built item pages WHEN a visitor follows a touched-component link from a release page THEN the link resolves to a /components/[item] page with HTTP 200",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN a changelog entry whose Changed list is empty WHEN the page renders THEN the empty list renders an explicit 'none' rather than an absent heading",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "/changelog renders reverse-chronological (v0.2.1, v0.2.0, v0.1.0) with 3 entries.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "/changelog/0.2.1 shows the literal date 2026-09-08 and Added/Changed/Fixed headings.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "Three entries map one-to-one to git tags v0.1.0, v0.2.0, v0.2.1.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "A touched-component link from /changelog/0.2.1 resolves to a /components/[item] page.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "Empty Added/Changed/Fixed lists render an explicit none; no heading is absent.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-5"
    }
  ]
}
-->
