================================================================================
TASK: GBC-008 - /changelog section-index and /changelog/[version] release pages
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: c0917f33e2f5f2f5e99b110cb7dd78afaa3276cf
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
- MUST make changelog-release-pages.spec.ts carry one test per other-task claim bound to FLOW-DOCS-06. There are exactly 9: GBC-005/AC-1, GBC-005/AC-2, GBC-005/AC-3, GBC-005/AC-4, GBC-007/AC-1, GBC-015/AC-2, GBC-015/AC-4, GBC-016/AC-2, GBC-016/AC-5. Each test title starts with `FLOW-DOCS-06-changelog-release-pages` and asserts that AC's must_observe as written in its task file. GBC-008 cannot close until all 9 and its own AC-1..AC-3 pass. The run_cmd runs every test under chromium-desktop, chromium-mobile and chromium-nojs, which covers the no-JS repeats the claims ask for.
- GBC-005's 4 claims, as the spec asserts them. AC-1: /changelog returns 200, and its 3 title anchors `[data-index-list] a[data-index-list-title]` have hrefs /changelog/0.2.1, /changelog/0.2.0, /changelog/0.1.0 in DOM order, the first text containing '0.2.1' and the last '0.1.0'. AC-2: /changelog/0.2.1 returns 200, '2026-09-08' appears inside its article, and the article's h2 texts are exactly ['Added', 'Changed', 'Fixed']. AC-3: the real prebuild exits 0 printing `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological`, /changelog has exactly 3 title anchors, and /changelog/0.3.0 and /changelog/v0.2.1 both return 404. AC-4: every `a[href^='/components/']` in the articles of all 3 release pages returns 200 with a slug among the 56 names in apps/docs/src/data/registry-items.json, at least 1 of them on /changelog/0.2.1.
- GBC-005/AC-1 and AC-3 are worded 'exactly 3 anchors inside [data-index-list]', but GBC-015/AC-4 puts touched-component anchors inside the same rows, so a literal anchor count would exceed 3. The spec therefore counts title anchors (`a[data-index-list-title]`, exactly 3) and asserts the `/components/` anchors separately under GBC-015/AC-4.
- GBC-007/AC-1 and GBC-005/AC-3 share one prebuild run per test: spawn it with execFileSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'run', 'prebuild']) from the repo root (an argument array, never a shell string), assert exit 0 and the literal success line, and check the line's tag count against `git tag --list 'v*'` read at run time.
- GBC-015's 2 claims and GBC-016's 2 claims, as the spec asserts them. GBC-015/AC-2: exactly 3 `[data-index-list-row]` with title hrefs in the order above, title texts containing '0.2.1', '0.2.0', '0.1.0', and exactly 1 `.chip` per row reading '2026-09-08', '2026-09-08', '2026-09-07'. GBC-015/AC-4: at least 1 `a[href^='/components/']` inside `[data-index-list-row]`, each matching `^/components/[a-z0-9-]+$`, returning 200, with `closest('a[data-index-list-title]')` null. GBC-016/AC-2: exactly 1 `h1.page-header__title` reading 'Changelog', exactly 1 `.section-header h2` reading 'Releases', exactly 1 `[data-section-index]` holding the 3 rows in order, and 0 `nav[aria-label='On this page']`. GBC-016/AC-5: exactly 1 `nav[data-docs-nav][aria-label='Documentation']` whose `.docs-nav__section-title` texts are 'Getting started', 'Guides', 'Porting', each group holding at least 1 link.
- MUST render what those claims read: /changelog composed from GBC-016's SectionIndexLayout with PageHeader 'Changelog', SectionHeader 'Releases', no ToC, and its one DocsNav; one IndexList row per release whose single `.chip` is the release date; and each release page's date and entry body inside exactly one `<article>` whose only h2 headings are the body's Added, Changed and Fixed (the ToC and nav stay outside it).
- MUST give each /changelog row its entry's touched-component links as sibling anchors of the title (never inside `a[data-index-list-title]`, never styled `.chip`). Derive them from the `/components/{slug}` links in the entry's markdown body (`entry.body`), unique and in first-seen order, so the row and the release page link the same slugs. Add no frontmatter field for them: TR-03 fixes changelog frontmatter to version and date.
- MUST build /changelog/[version] params and every release href from `entry.data.version`, never `entry.id`: the glob loader's default id for `0.2.1.md` is `021` (checked against the installed astro 7.3.2 and its github-slugger).
- MUST derive the spec's expected release order and dates at run time from `git tag --list 'v*'` and the entry frontmatter, never from the rendered page or a literal list in the spec. Read the entry frontmatter with Astro's own parser: resolve `astro/package.json` from apps/docs/package.json with createRequire, then resolve `@astrojs/internal-helpers/frontmatter` from there and call its `parseFrontmatter(text)`. Checked on the installed tree: this resolves under the isolated pnpm linker with no new dependency, returns arrays intact, and returns an unquoted `date` as a JS Date. Format the Date as the UTC day.
- MUST sort with the comparator GBC-007 exports from apps/docs/src/lib/changelog-schema.ts (import it; do not re-implement the tiebreak) and format every release date as the UTC calendar day (`toISOString().slice(0, 10)`). The same string feeds the row's date `.chip` and the release article, so /changelog/0.2.1 reads `2026-09-08` in any local time zone.

## Specification
Objective: Publish the changelog section-index and one page per release from the changelog collection, newest-first, with per-release Added/Changed/Fixed sections and touched-component links.
Success state: Over the built preview, /changelog lists 0.2.1 above 0.2.0 above 0.1.0 and /changelog/0.2.1 returns 200 with a date, Added/Changed/Fixed headings, and touched-component links that resolve 200.

## Acceptance Criteria
### AC-1: Changelog reads newest-first with per-release pages [PRIMARY]
  GIVEN: a real ordered docs build over git tags v0.1.0, v0.2.0, v0.2.1 and GBC-005's three changelog entries 0.1.0, 0.2.0, 0.2.1
  WHEN:  a visitor opens /changelog and then /changelog/0.2.1
  THEN:  the index lists 0.2.1 above 0.2.0 above 0.1.0, and the detail page returns 200 with the date 2026-09-08, Added/Changed/Fixed headings, and touched-component links that each resolve 200
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the index is unsorted or sorted ascending (collection order never re-sorted): DOM order diverges from the git-tag-derived order', 'the [version] route is absent: `/changelog/0.2.1` returns 404', 'an empty list omits its heading: `Added` is absent on 0.2.1']
        EVIDENCE: screenshot
        - START_REF: release_tags_and_entries
          ACTION: ['run the locked FLOW-DOCS-06 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-06-changelog-release-pages` against the Playwright-owned preview at http://localhost:4321', "in the spec, derive the expected order at run time from `git tag --list 'v*'`, stripped of `v`, sorted by date DESC then semver DESC", 'open `/changelog` and collect the title hrefs of every `[data-index-list-row]` in DOM order', "open `/changelog/0.2.1`; read the h1, the release date text, every h2, and every `a[href^='/components/']`; request each component href"]
          MUST_OBSERVE: ['`/changelog` returns HTTP `200` with h1 `Changelog`', 'exactly `3` `[data-index-list-row]` rows whose title hrefs in DOM order are `/changelog/0.2.1`, `/changelog/0.2.0`, `/changelog/0.1.0`, equal to the git-tag-derived order', '`/changelog/0.2.1` returns HTTP `200` and shows the literal date `2026-09-08`', '`/changelog/0.2.1` h2 texts include `Added`, `Changed`, `Fixed` in that order', "at least `1` `a[href^='/components/']` on `/changelog/0.2.1`, each returning HTTP `200`"]
          MUST_NOT_OBSERVE: ['`0` index rows (an empty /changelog)', '`/changelog/0.1.0` listed above `/changelog/0.2.0` (ascending order)', '`/changelog/0.2.1` missing any of `Added`, `Changed`, `Fixed`', 'a component link returning HTTP `404`']

### AC-2: Every entry links a 200 page with date + Added/Changed/Fixed
  GIVEN: the /changelog index built from the three entries
  WHEN:  a visitor opens each linked /changelog/{version} page
  THEN:  all 3 pages return 200, each with its release date and Added/Changed/Fixed headings
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a release page drops a heading when its list is empty (heading omitted instead of rendering `none`)', 'dates are formatted in local time: 0.2.1 renders `2026-09-07` in America/Denver', 'the [version] route is absent or v-prefixed: `/changelog/0.2.0` returns 404']
        EVIDENCE: screenshot
        - START_REF: release_tags_and_entries
          ACTION: ['run the locked FLOW-DOCS-06 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-06-changelog-release-pages` against the Playwright-owned preview at http://localhost:4321', 'open `/changelog` and collect every release href', 'open each of the 3 release pages; read its HTTP status, date text and h2 texts']
          MUST_OBSERVE: ['exactly `3` release hrefs on `/changelog`: `/changelog/0.2.1`, `/changelog/0.2.0`, `/changelog/0.1.0`', 'each of the `3` release pages returns HTTP `200`', "release dates `2026-09-08` (0.2.1), `2026-09-08` (0.2.0), `2026-09-07` (0.1.0), each equal to the entry's frontmatter date as a UTC calendar day", 'each of the `3` pages carries h2 `Added`, `Changed`, `Fixed` in that order']
          MUST_NOT_OBSERVE: ['a release page with `0` of the three headings, or missing any one', 'HTTP `404` on any `/changelog/{version}`', '`/changelog/v0.2.1` (v-prefixed route) returning HTTP `200`', '`2026-09-07` shown on `/changelog/0.2.1` (local-time drift)']

### AC-3: Release-to-component links resolve
  GIVEN: release 0.2.1's entry body linking the components it touched, and the 56 built item pages
  WHEN:  a visitor follows each touched-component link in the 0.2.1 row on /changelog and on /changelog/0.2.1
  THEN:  every link resolves 200 to a /components/{slug} page whose h1 equals that item's registry title; on /changelog the links sit inside the release's IndexList row as siblings of the title anchor, never inside it
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['touched components render as plain text with the links omitted: 0 links found', 'the index rows omit the touched links and only the release page carries them: 0 anchors inside `[data-index-list-row]`', 'a link targets a hardcoded or invented slug: the destination 404s, or the row and article slug sets differ']
        EVIDENCE: screenshot
        - START_REF: built_item_pages
          ACTION: ['run the locked FLOW-DOCS-06 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-06-changelog-release-pages` against the Playwright-owned preview at http://localhost:4321', "open `/changelog`; collect every `a[href^='/components/']` inside `[data-index-list-row]` and read `closest('a[data-index-list-title]')` for each", "open `/changelog/0.2.1` and collect every `a[href^='/components/']` inside its article", 'load apps/docs/src/data/registry-items.json; request each href and read the destination h1']
          MUST_OBSERVE: ["at least `1` `a[href^='/components/']` inside `[data-index-list-row]` on `/changelog`, each with `closest('a[data-index-list-title]')` equal to `null`", "at least `1` `a[href^='/components/']` in the `/changelog/0.2.1` article, every href on both pages matching `^/components/[a-z0-9-]+$`", 'the slug set linked in the `0.2.1` row equals the slug set linked in the `/changelog/0.2.1` article', 'every linked slug is one of the `56` `name` values in apps/docs/src/data/registry-items.json', "every destination returns HTTP `200` and its h1 text equals that item's `title` in registry-items.json"]
          MUST_NOT_OBSERVE: ['`0` touched-component links on `/changelog` or on `/changelog/0.2.1`', 'a component anchor nested inside `a[data-index-list-title]` (an `<a>` inside an `<a>`)', 'a component link returning HTTP `404`, or a slug absent from the 56 registry names']

## Test Criteria
- TC-1: /changelog lists exactly 3 rows in the order /changelog/0.2.1, /changelog/0.2.0, /changelog/0.1.0  (maps_to: AC-1)
- TC-2: each of the 3 release pages returns 200 with its date and Added/Changed/Fixed headings  (maps_to: AC-2)
- TC-3: every touched-component link on /changelog/0.2.1 returns 200 at a /components/{slug} page whose h1 equals the item title  (maps_to: AC-3)
- TC-4: each /changelog index row carries its entry's touched-component links as sibling anchors of the row title, each resolving 200  (maps_to: AC-3)

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
- tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts (NEW)
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
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages

## Dependencies
Depends on: ['GBC-001', 'GBC-004', 'GBC-005', 'GBC-007', 'GBC-009', 'GBC-015', 'GBC-016']
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
    "release_tags_and_entries": {
      "description": "The real repository state FLOW-DOCS-06 runs against: three git tags made with the git CLI and GBC-005's three committed changelog entries, read at run time and never injected.",
      "seed_method": "cli",
      "records": [
        "git tag v0.1.0 (created 2026-09-07)",
        "git tag v0.2.0 (created 2026-09-08)",
        "git tag v0.2.1 (created 2026-09-08)",
        "apps/docs/src/content/changelog/0.1.0.md: version 0.1.0, date 2026-09-07",
        "apps/docs/src/content/changelog/0.2.0.md: version 0.2.0, date 2026-09-08",
        "apps/docs/src/content/changelog/0.2.1.md: version 0.2.1, date 2026-09-08"
      ]
    },
    "built_item_pages": {
      "description": "The 56 item pages and generated item data written by the real docs build in the run_cmd's first segment, plus the touched-component links GBC-005 authored in 0.2.1.md.",
      "seed_method": "cli",
      "records": [
        "pnpm --filter @rnr-ai-elements/docs build writes apps/docs/dist/components/{name}/index.html for each of the 56 registry items",
        "apps/docs/src/data/registry-items.json holds 56 items, each with `name` and `title`",
        "apps/docs/src/content/changelog/0.2.1.md links at least 1 touched item by its registry slug"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN a real ordered docs build over git tags v0.1.0, v0.2.0, v0.2.1 and GBC-005's three changelog entries 0.1.0, 0.2.0, 0.2.1 WHEN a visitor opens /changelog and then /changelog/0.2.1 THEN the index lists 0.2.1 above 0.2.0 above 0.1.0, and the detail page returns 200 with the date 2026-09-08, Added/Changed/Fixed headings, and touched-component links that each resolve 200",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
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
            "the index is unsorted or sorted ascending (collection order never re-sorted): DOM order diverges from the git-tag-derived order",
            "the [version] route is absent: `/changelog/0.2.1` returns 404",
            "an empty list omits its heading: `Added` is absent on 0.2.1"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "release_tags_and_entries",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "run the locked FLOW-DOCS-06 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-06-changelog-release-pages` against the Playwright-owned preview at http://localhost:4321",
                "in the spec, derive the expected order at run time from `git tag --list 'v*'`, stripped of `v`, sorted by date DESC then semver DESC",
                "open `/changelog` and collect the title hrefs of every `[data-index-list-row]` in DOM order",
                "open `/changelog/0.2.1`; read the h1, the release date text, every h2, and every `a[href^='/components/']`; request each component href"
              ]
            },
            "end_state": {
              "must_observe": [
                "`/changelog` returns HTTP `200` with h1 `Changelog`",
                "exactly `3` `[data-index-list-row]` rows whose title hrefs in DOM order are `/changelog/0.2.1`, `/changelog/0.2.0`, `/changelog/0.1.0`, equal to the git-tag-derived order",
                "`/changelog/0.2.1` returns HTTP `200` and shows the literal date `2026-09-08`",
                "`/changelog/0.2.1` h2 texts include `Added`, `Changed`, `Fixed` in that order",
                "at least `1` `a[href^='/components/']` on `/changelog/0.2.1`, each returning HTTP `200`"
              ],
              "must_not_observe": [
                "`0` index rows (an empty /changelog)",
                "`/changelog/0.1.0` listed above `/changelog/0.2.0` (ascending order)",
                "`/changelog/0.2.1` missing any of `Added`, `Changed`, `Fixed`",
                "a component link returning HTTP `404`"
              ]
            }
          }
        ],
        "primary": true
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the /changelog index built from the three entries WHEN a visitor opens each linked /changelog/{version} page THEN all 3 pages return 200, each with its release date and Added/Changed/Fixed headings",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
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
            "a release page drops a heading when its list is empty (heading omitted instead of rendering `none`)",
            "dates are formatted in local time: 0.2.1 renders `2026-09-07` in America/Denver",
            "the [version] route is absent or v-prefixed: `/changelog/0.2.0` returns 404"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "release_tags_and_entries",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "run the locked FLOW-DOCS-06 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-06-changelog-release-pages` against the Playwright-owned preview at http://localhost:4321",
                "open `/changelog` and collect every release href",
                "open each of the 3 release pages; read its HTTP status, date text and h2 texts"
              ]
            },
            "end_state": {
              "must_observe": [
                "exactly `3` release hrefs on `/changelog`: `/changelog/0.2.1`, `/changelog/0.2.0`, `/changelog/0.1.0`",
                "each of the `3` release pages returns HTTP `200`",
                "release dates `2026-09-08` (0.2.1), `2026-09-08` (0.2.0), `2026-09-07` (0.1.0), each equal to the entry's frontmatter date as a UTC calendar day",
                "each of the `3` pages carries h2 `Added`, `Changed`, `Fixed` in that order"
              ],
              "must_not_observe": [
                "a release page with `0` of the three headings, or missing any one",
                "HTTP `404` on any `/changelog/{version}`",
                "`/changelog/v0.2.1` (v-prefixed route) returning HTTP `200`",
                "`2026-09-07` shown on `/changelog/0.2.1` (local-time drift)"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN release 0.2.1's entry body linking the components it touched, and the 56 built item pages WHEN a visitor follows each touched-component link in the 0.2.1 row on /changelog and on /changelog/0.2.1 THEN every link resolves 200 to a /components/{slug} page whose h1 equals that item's registry title; on /changelog the links sit inside the release's IndexList row as siblings of the title anchor, never inside it",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
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
            "touched components render as plain text with the links omitted: 0 links found",
            "the index rows omit the touched links and only the release page carries them: 0 anchors inside `[data-index-list-row]`",
            "a link targets a hardcoded or invented slug: the destination 404s, or the row and article slug sets differ"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "built_item_pages",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "run the locked FLOW-DOCS-06 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-06-changelog-release-pages` against the Playwright-owned preview at http://localhost:4321",
                "open `/changelog`; collect every `a[href^='/components/']` inside `[data-index-list-row]` and read `closest('a[data-index-list-title]')` for each",
                "open `/changelog/0.2.1` and collect every `a[href^='/components/']` inside its article",
                "load apps/docs/src/data/registry-items.json; request each href and read the destination h1"
              ]
            },
            "end_state": {
              "must_observe": [
                "at least `1` `a[href^='/components/']` inside `[data-index-list-row]` on `/changelog`, each with `closest('a[data-index-list-title]')` equal to `null`",
                "at least `1` `a[href^='/components/']` in the `/changelog/0.2.1` article, every href on both pages matching `^/components/[a-z0-9-]+$`",
                "the slug set linked in the `0.2.1` row equals the slug set linked in the `/changelog/0.2.1` article",
                "every linked slug is one of the `56` `name` values in apps/docs/src/data/registry-items.json",
                "every destination returns HTTP `200` and its h1 text equals that item's `title` in registry-items.json"
              ],
              "must_not_observe": [
                "`0` touched-component links on `/changelog` or on `/changelog/0.2.1`",
                "a component anchor nested inside `a[data-index-list-title]` (an `<a>` inside an `<a>`)",
                "a component link returning HTTP `404`, or a slug absent from the 56 registry names"
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
      "description": "/changelog lists exactly 3 rows in the order /changelog/0.2.1, /changelog/0.2.0, /changelog/0.1.0",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "each of the 3 release pages returns 200 with its date and Added/Changed/Fixed headings",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "every touched-component link on /changelog/0.2.1 returns 200 at a /components/{slug} page whose h1 equals the item title",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "each /changelog index row carries its entry's touched-component links as sibling anchors of the row title, each resolving 200",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (pnpm --filter @rnr-ai-elements/docs build) served by the Playwright-owned astro preview at http://localhost:4321 (CI=1, strict port), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    }
  ]
}
-->

## Handoff

```json
{
  "task": "GBC-008",
  "commit_sha": "c0917f33e2f5f2f5e99b110cb7dd78afaa3276cf",
  "done": "Landed /changelog (apps/docs/src/pages/changelog/index.astro) composing SectionIndexLayout+IndexList, /changelog/[version] (apps/docs/src/pages/changelog/[version].astro) with exactly one article per release whose only h2s are the body's Added/Changed/Fixed, and the single derivation both routes read (apps/docs/src/lib/changelog.ts:43 regex extraction, compareReleaseDesc sort, UTC-day formatting); the FLOW-DOCS-06 spec (tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts) carries 12 tests covering GBC-008 AC-1..3 plus all 9 bound claims, RED-proven at 33/36 failed and GREEN 36/36 across chromium-desktop, chromium-mobile and chromium-nojs, merged to main as fdac4bae.",
  "deviations": [],
  "concerns": [
    "The tracked evidence run.json is overwritten by every green Playwright run (afterAll in changelog-release-pages.spec.ts:305); proof.red is the only durable red artifact, so future re-runs must not be expected to preserve the original run.json.",
    "Every full FLOW-DOCS-06 run spawns the real prebuild 6 times (GBC-005/AC-3 and GBC-007/AC-1 each run unguarded in all 3 projects), which is most of the lane's wall time; if the sprint grows more claims in this spec, consider gating CLI tests to the desktop project only \u2014 that would require a task-file change to the claims' UNGUARDED wording.",
    "The per-test status directory (.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/FLOW-DOCS-06-changelog-release-pages-statuses/) accumulates across runs and must be cleared before a run whose run.json should reflect only that run; a stale file counts as a failure in afterAll by design.",
    "pnpm exec biome ci . OOMs the linter at the repo root in this worktree; the direct binary ./node_modules/.bin/biome ci . passes with exit 0."
  ],
  "findings": [
    "MarkdownLayout cannot host the release pages as-is: its Props require section: DocsSection (apps/docs/src/layouts/MarkdownLayout.astro:27) and changelog is none of the three, so a page composed through it would write a false data-pagefind-meta and release pages currently stay out of the pagefind index \u2014 widening the type to accept a changelog section is the seam if search coverage of releases is ever wanted.",
    "DocsNav renders .docs-nav__section-title with text-transform: uppercase (apps/docs/src/components/DocsNav.astro:59), so innerText returns 'GETTING STARTED' while the claim text is the source label \u2014 any future spec asserting DocsNav titles must read textContent, as GBC-016/AC-5 in the landed spec now does.",
    "/changelog now holds two chip populations (the SectionHeader count chip and one date chip per row), so page-wide '.chip' locators over-count; assertions must scope to [data-index-list-row] exactly as GBC-015/AC-2's test does.",
    "The touched-component extraction matches only markdown inline links `](/components/slug)` (apps/docs/src/lib/changelog.ts:43); an entry linking via HTML or reference-style markdown would silently produce no row links \u2014 the regex is the single place to extend (ponytail ceiling, documented in the module).",
    "Playwright has no `-t` flag (that is vitest); a targeted rerun of this lane must use --grep, and the rtk wrapper can swallow playwright output entirely \u2014 reading run.json or redirecting to a file is the reliable result channel."
  ],
  "scope_impact": [
    {
      "target": "GBC-005",
      "found": "AC-1..AC-4 are worded 'proven when GBC-008 closes'",
      "change": "Mark the four e2e ACs proven by FLOW-DOCS-06 green at c0917f33 (36/36); their assertions passed verbatim with no task-file-driven test edits."
    },
    {
      "target": "GBC-007",
      "found": "AC-1 is worded 'this early AC is proven when GBC-008 closes'",
      "change": "Mark AC-1 proven: the spawned prebuild printed exactly '[docs-data] changelog: 3 tags, 3 entries \u2014 one-to-one, reverse-chronological' and the tag figure matched run-time git tag --list 'v*'."
    },
    {
      "target": "GBC-015",
      "found": "AC-2 and AC-4 are worded 'proven when GBC-008 closes'",
      "change": "Mark both proven; note for future authors that AC-2's 'exactly 1 .chip per row' holds while the page-wide chip count is 4 (SectionHeader count + 3 date chips), which is why the spec scopes to rows."
    },
    {
      "target": "GBC-016",
      "found": "AC-2 and AC-5 are worded 'proven when GBC-008 closes'",
      "change": "Mark both proven; AC-5's spec test needed textContent (not innerText) because of DocsNav's uppercase transform \u2014 worth a line in the task file if more nav-title assertions are planned."
    }
  ],
  "feedback": []
}
```
