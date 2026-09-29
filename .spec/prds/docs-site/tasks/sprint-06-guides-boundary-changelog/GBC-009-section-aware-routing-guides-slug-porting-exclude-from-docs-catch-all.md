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
- NEVER edit tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts: GBC-010 writes it. AC-1 is an early binding proven when GBC-010 closes, and GBC-010's spec must carry a `FLOW-DOCS-03-five-guides-index` test for it.
- MUST make porting-map.spec.ts carry one test per other-task claim bound to FLOW-DOCS-05. There are exactly 5: GBC-004/AC-1, GBC-004/AC-3, GBC-006/AC-3, GBC-012/AC-1, GBC-017/AC-2. Each test title starts with `FLOW-DOCS-05-porting-map-and-prior-art` and asserts that AC's must_observe as written in its task file. GBC-009 cannot close until all 5 and its own AC-2 pass. GBC-006, GBC-012 and GBC-017 land after GBC-009, so the spec must already observe their claims at GBC-009's close from content on the trunk by then (GBC-003's boundary page and GBC-004's porting.md). The run_cmd runs every test under chromium-desktop, chromium-mobile and chromium-nojs, which covers GBC-004's no-JS repeats.
- GBC-004's 2 claims, as the spec asserts them. AC-1: /porting returns 200 and /docs/porting 404; exactly 1 table under the heading with id 'mapping', with exactly 1 th reading 'Deviations'; at least 5 tbody rows, 0 of them with an empty Deviations cell; exactly 1 `a[href^='/components/']` per row, every slug among the 56 names in apps/docs/src/data/registry-items.json. AC-3: under the heading with id 'prior-art', exactly 1 anchor with href 'https://elements.ai-sdk.dev' and exactly 1 with href 'https://github.com/muratcakmak/expo-ai-elements'; exactly 1 heading with id 'why-differs', whose paragraph contains 'nativewind' and 'uniwind' at least once each.
- GBC-006/AC-3, as the spec asserts it: at least 1 table containing 'tool executor' on /docs/owns-vs-does-not-own; 0 tables on /porting containing 'tool executor', 'streaming client' or 'useChat'; exactly 1 table on /porting with a 'Deviations' th; HTTP 404 at /boundary and at /docs/boundary.
- GBC-012/AC-1 and GBC-017/AC-2, as the spec asserts them. GBC-012/AC-1: the run_cmd's build segment exits 0; /porting returns 200 and /docs/porting 404; the mapping table has a th matching /deviation/i and at least 5 body rows; 0 mapping slugs outside the 56 `name` values in packages/registry/registry.json; mapping row count plus not-ported entry count equals the length of porting.md's `upstream` array; 0 not-ported entries equal to a registry name. GBC-017/AC-2: exactly 1 `.prose table` with a thead th matching /deviation/i and at least 5 tbody rows; at least 1 item in the list or table after the heading matching /not ported/i; at least 1 anchor whose href contains 'elements.ai-sdk.dev' and at least 1 whose href contains 'muratcakmak/expo-ai-elements'.
- MUST render /porting through MarkdownLayout: it already wraps the body in `<div class='prose'>`, which GBC-017/AC-2's `.prose table` selector reads.
- MUST read porting.md's `upstream` array in the spec with Astro's own frontmatter parser, never a hand-rolled YAML reader: resolve `astro/package.json` from apps/docs/package.json with createRequire, then resolve `@astrojs/internal-helpers/frontmatter` from there and call its `parseFrontmatter(text)`. Checked on the installed tree: this resolves under the isolated pnpm linker with no new dependency, returns arrays intact, and returns an unquoted `date` as a JS Date.
- MUST export the porting-entry guard from apps/docs/src/lib/docs-navigation.ts and call it from porting.astro, so the Vitest drill tests the same guard the build runs.
- UNIT_TEST_JUSTIFIED: AC-3 tests the pure porting-entry guard over literal entry arrays (0, 1 and 2 porting entries) plus one static read of porting.astro, with zero network or build I/O; the rendered /porting proof is AC-2's primary FLOW-DOCS-05 spec.

## Specification
Objective: Route guides-section entries at /guides/{slug}, the single porting-section entry at /porting, and getting-started entries at /docs/{id}, with no duplicate destinations.
Success state: Over the built preview, /guides/{any-slug} and /porting each return 200 with no /docs/ alias also resolving; a duplicate destination fails the build.

## Acceptance Criteria
### AC-1: Guides publish at /guides/{slug}, not /docs/{slug}
  GIVEN: GBC-010's guides-index spec has landed (GBC-010 writes it; this early AC is proven when GBC-010 closes) and GBC-001/GBC-002 have committed the five guides-section manuscripts
  WHEN:  a visitor opens /guides/{slug}, /docs/{slug} and /docs/guides/{slug} for each of the five guides
  THEN:  each /guides/{slug} returns 200 and neither /docs/{slug} nor /docs/guides/{slug} exists (no duplicate destination)
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the /docs catch-all still generates guides entries (filter removed): `/docs/guides/re-theme` returns 200', 'href derivation keeps the `guides/` prefix: pages publish at `/guides/guides/re-theme` and `/guides/re-theme` returns 404', '/guides/[slug].astro is absent or a static shell: the h1-equals-frontmatter-title check fails']
        EVIDENCE: screenshot
        - START_REF: five_guides_entries
          ACTION: ['run the locked FLOW-DOCS-03 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-03-five-guides-index` against http://localhost:4321', 'request `/guides/{slug}`, `/docs/{slug}` and `/docs/guides/{slug}` for each of the 5 slugs; read each status', 'on each `/guides/{slug}` page, read the h1 and every sidebar href']
          MUST_OBSERVE: ['HTTP `200` for exactly 5 URLs: `/guides/re-theme`, `/guides/update-installed-items`, `/guides/preview-on-device`, `/guides/customize-rendering`, `/guides/troubleshooting`', 'HTTP `404` for each of the 5 flat aliases, e.g. `/docs/re-theme` and `/docs/troubleshooting`', 'HTTP `404` for each of the 5 nested aliases, e.g. `/docs/guides/re-theme`', '5 of 5 `/guides/{slug}` h1 texts equal the `title` frontmatter of apps/docs/src/content/docs/guides/{slug}.md']
          MUST_NOT_OBSERVE: ['HTTP `200` on any `/docs/{slug}` or `/docs/guides/{slug}` alias', 'any href containing `/guides/guides/` on the 5 guide pages', '`0` of the 5 guide URLs returning 200 (an empty guides section)']

### AC-2: Porting publishes at /porting (exactly one entry) [PRIMARY]
  GIVEN: GBC-004's single porting-section entry (porting.md) is committed
  WHEN:  a visitor opens /porting and /docs/porting
  THEN:  /porting returns 200 and renders the manuscript's mapping table with a Deviation column and at least 5 rows, and /docs/porting returns 404 (no alias)
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['porting.astro is absent or a static shell that never renders the porting entry: the h1 and table anchors are missing', 'the /docs catch-all is not narrowed to getting-started: `/docs/porting` still returns 200', 'the porting manuscript is removed or its mapping table is empty: fewer than 5 rows']
        EVIDENCE: screenshot
        - START_REF: single_porting_entry
          ACTION: ['run the locked FLOW-DOCS-05 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-05-porting-map-and-prior-art` against http://localhost:4321', 'request `/porting` and `/docs/porting`; read each status', "on `/porting`, read the h1, the mapping table's th texts and its tbody row count"]
          MUST_OBSERVE: ['`/porting` returns HTTP `200`', '`/docs/porting` returns HTTP `404`', 'the `/porting` h1 text equals the `title` frontmatter of apps/docs/src/content/docs/porting.md, read at run time', 'the mapping table has a th whose text matches `/^Deviations?$/i`', 'that table has at least `5` tbody rows']
          MUST_NOT_OBSERVE: ['`/docs/porting` returning HTTP `200` (a duplicate destination)', 'a mapping table with `0` tbody rows (an empty table)', 'a `/porting` page with no table (a static shell)']

### AC-3: Zero or multiple porting entries fail the build
  GIVEN: the porting-entry guard exported from apps/docs/src/lib/docs-navigation.ts and entry arrays holding 0, 1 and 2 porting-section entries
  WHEN:  the Vitest drill calls the guard with each array and reads apps/docs/src/pages/porting.astro
  THEN:  the guard throws for 0 and for 2 with messages containing `porting` and the count (`0`, `2`), returns the one entry with href `/porting` for exactly 1, and porting.astro imports and calls that guard
  TEST_TIER: unit
  VERIFICATION_SERVICE: Vitest over the pure porting-entry guard with literal entry arrays, plus a static read of porting.astro (no build, no network)
  UNIT_TEST_JUSTIFIED: Pure logic over literal inputs: the guard takes entry arrays as arguments, so the 0/1/2 cases are exact without a build; the rendered /porting proof is AC-2 on FLOW-DOCS-05.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts
  TEST_FUNCTION: GBC-009-porting-entry-count
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts -t GBC-009-porting-entry-count

## Test Criteria
- TC-1: publishedDocs emits /docs/{id} for getting-started, /guides/{basename(id)} for guides, and /porting for porting  (maps_to: AC-1)
- TC-2: the /docs catch-all generates no page for a guides-section entry  (maps_to: AC-1)
- TC-3: the porting-entry guard throws naming the count for 0 or 2 porting entries  (maps_to: AC-3)

## Reading List
- apps/docs/src/lib/docs-navigation.ts
- apps/docs/src/pages/docs/[...id].astro
- apps/docs/src/pages/docs/theming.astro
- apps/docs/src/layouts/MarkdownLayout.astro

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/pages/guides/[slug].astro (NEW)
- apps/docs/src/pages/porting.astro (NEW)
- apps/docs/src/lib/docs-navigation.ts (MODIFY)
- apps/docs/src/pages/docs/[...id].astro (MODIFY)
- tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
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
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts

## Dependencies
Depends on: ['GBC-003', 'GBC-004']
Blocks:     ['GBC-001', 'GBC-006', 'GBC-008', 'GBC-010', 'GBC-011', 'GBC-012', 'GBC-013', 'GBC-014', 'GBC-017']

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
    "five_guides_entries": {
      "description": "GBC-001's four and GBC-002's one committed guides-section manuscripts, built by the real docs build.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/guides/re-theme.md with `section: guides`",
        "apps/docs/src/content/docs/guides/update-installed-items.md with `section: guides`",
        "apps/docs/src/content/docs/guides/preview-on-device.md with `section: guides`",
        "apps/docs/src/content/docs/guides/customize-rendering.md with `section: guides`",
        "apps/docs/src/content/docs/guides/troubleshooting.md with `section: guides`"
      ]
    },
    "single_porting_entry": {
      "description": "GBC-004's committed porting manuscript, built by the real docs build.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/porting.md with `section: porting` and a `title`",
        "its mapping table carries a Deviation column and at least 5 body rows",
        "exactly 1 porting-section entry in apps/docs/src/content/docs/"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GBC-010's guides-index spec has landed (GBC-010 writes it; this early AC is proven when GBC-010 closes) and GBC-001/GBC-002 have committed the five guides-section manuscripts WHEN a visitor opens /guides/{slug}, /docs/{slug} and /docs/guides/{slug} for each of the five guides THEN each /guides/{slug} returns 200 and neither /docs/{slug} nor /docs/guides/{slug} exists (no duplicate destination)",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "topology": "single-node",
        "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
        "negative_control": {
          "would_fail_if": [
            "the /docs catch-all still generates guides entries (filter removed): `/docs/guides/re-theme` returns 200",
            "href derivation keeps the `guides/` prefix: pages publish at `/guides/guides/re-theme` and `/guides/re-theme` returns 404",
            "/guides/[slug].astro is absent or a static shell: the h1-equals-frontmatter-title check fails"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "five_guides_entries",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "run the locked FLOW-DOCS-03 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-03-five-guides-index` against http://localhost:4321",
                "request `/guides/{slug}`, `/docs/{slug}` and `/docs/guides/{slug}` for each of the 5 slugs; read each status",
                "on each `/guides/{slug}` page, read the h1 and every sidebar href"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP `200` for exactly 5 URLs: `/guides/re-theme`, `/guides/update-installed-items`, `/guides/preview-on-device`, `/guides/customize-rendering`, `/guides/troubleshooting`",
                "HTTP `404` for each of the 5 flat aliases, e.g. `/docs/re-theme` and `/docs/troubleshooting`",
                "HTTP `404` for each of the 5 nested aliases, e.g. `/docs/guides/re-theme`",
                "5 of 5 `/guides/{slug}` h1 texts equal the `title` frontmatter of apps/docs/src/content/docs/guides/{slug}.md"
              ],
              "must_not_observe": [
                "HTTP `200` on any `/docs/{slug}` or `/docs/guides/{slug}` alias",
                "any href containing `/guides/guides/` on the 5 guide pages",
                "`0` of the 5 guide URLs returning 200 (an empty guides section)"
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
      "primary": true,
      "description": "GIVEN GBC-004's single porting-section entry (porting.md) is committed WHEN a visitor opens /porting and /docs/porting THEN /porting returns 200 and renders the manuscript's mapping table with a Deviation column and at least 5 rows, and /docs/porting returns 404 (no alias)",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "topology": "single-node",
        "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
        "negative_control": {
          "would_fail_if": [
            "porting.astro is absent or a static shell that never renders the porting entry: the h1 and table anchors are missing",
            "the /docs catch-all is not narrowed to getting-started: `/docs/porting` still returns 200",
            "the porting manuscript is removed or its mapping table is empty: fewer than 5 rows"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "single_porting_entry",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "run the locked FLOW-DOCS-05 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-05-porting-map-and-prior-art` against http://localhost:4321",
                "request `/porting` and `/docs/porting`; read each status",
                "on `/porting`, read the h1, the mapping table's th texts and its tbody row count"
              ]
            },
            "end_state": {
              "must_observe": [
                "`/porting` returns HTTP `200`",
                "`/docs/porting` returns HTTP `404`",
                "the `/porting` h1 text equals the `title` frontmatter of apps/docs/src/content/docs/porting.md, read at run time",
                "the mapping table has a th whose text matches `/^Deviations?$/i`",
                "that table has at least `5` tbody rows"
              ],
              "must_not_observe": [
                "`/docs/porting` returning HTTP `200` (a duplicate destination)",
                "a mapping table with `0` tbody rows (an empty table)",
                "a `/porting` page with no table (a static shell)"
              ]
            }
          }
        ],
        "primary": true
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the porting-entry guard exported from apps/docs/src/lib/docs-navigation.ts and entry arrays holding 0, 1 and 2 porting-section entries WHEN the Vitest drill calls the guard with each array and reads apps/docs/src/pages/porting.astro THEN the guard throws for 0 and for 2 with messages containing `porting` and the count (`0`, `2`), returns the one entry with href `/porting` for exactly 1, and porting.astro imports and calls that guard",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts",
      "test_function": "GBC-009-porting-entry-count",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts -t GBC-009-porting-entry-count",
      "test_tier": "unit",
      "verification_service": "Vitest over the pure porting-entry guard with literal entry arrays, plus a static read of porting.astro (no build, no network)",
      "surface_policy": null,
      "unit_test_justified": "Pure logic over literal inputs: the guard takes entry arrays as arguments, so the 0/1/2 cases are exact without a build; the rendered /porting proof is AC-2 on FLOW-DOCS-05.",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "publishedDocs emits /docs/{id} for getting-started, /guides/{basename(id)} for guides, and /porting for porting",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "the /docs catch-all generates no page for a guides-section entry",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "the porting-entry guard throws naming the count for 0 or 2 porting entries",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts",
      "test_function": "GBC-009-porting-entry-count",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-routing.test.ts -t GBC-009-porting-entry-count",
      "test_tier": "unit",
      "verification_service": "Vitest over the pure porting-entry guard with literal entry arrays, plus a static read of porting.astro (no build, no network)",
      "surface_policy": null,
      "maps_to_ac": "AC-3"
    }
  ]
}
-->
