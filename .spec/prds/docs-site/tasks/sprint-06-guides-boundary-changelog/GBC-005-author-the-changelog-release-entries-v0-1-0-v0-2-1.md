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
- Cite the deriving commit range in each entry (a footnote or HTML comment naming the range) so GBC-006's review can reconcile every body line against git log.
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
- UNIT_TEST_JUSTIFIED: AC-5 and AC-6 are pure heading, frontmatter and string scans over three local markdown files and one JSON file with zero I/O beyond reading files, so unit tests are justified.
- NEVER edit tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts: GBC-008 writes it, and AC-1 to AC-4 are proven when GBC-008 closes, not at this task's close.
- STRICTLY keep changelog-content.test.ts read-only over the authored files (no build, no network, no git, no browser).

## Specification
Objective: Three changelog entry files, one per git tag through v0.2.1, each with version, date, and Added/Changed/Fixed headings derived from real history, with resolving touched-component links.
Success state: A visitor opens /changelog and reads entries reverse-chronologically (v0.2.1, v0.2.0, v0.1.0), and /changelog/0.2.1 shows the literal date 2026-09-08 with Added/Changed/Fixed headings and a resolving touched-component link.

## Acceptance Criteria
### AC-1: changelog renders reverse-chronological
  GIVEN: GIVEN GBC-008's changelog-release-pages spec has landed, and the authored entries are built into the real preview
  WHEN:  a visitor opens /changelog
  THEN:  the entries render with 0.2.1 above 0.2.0 above 0.1.0
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['an adjacent pair of entries is out of order', 'the index omits a release or lists an empty collection']
        EVIDENCE: file_artifact
        - START_REF: authored_changelog_candidate
          ACTION: ['goto /changelog and record the response status', 'list the a[data-index-list-title] anchors inside [data-index-list] in DOM order and read each href and text', 'repeat the read under the chromium-nojs project']
          MUST_OBSERVE: ['HTTP status 200 at /changelog', 'exactly 3 a[data-index-list-title] inside [data-index-list]', 'hrefs of the a[data-index-list-title] anchors in DOM order: /changelog/0.2.1, /changelog/0.2.0, /changelog/0.1.0', "the first a[data-index-list-title] text contains the literal '0.2.1' and the last contains '0.1.0'", 'under chromium-nojs, the same 3 a[data-index-list-title] hrefs appear in the same order']
          MUST_NOT_OBSERVE: ['0 a[data-index-list-title] inside [data-index-list] (empty index)', 'href /changelog/0.1.0 above /changelog/0.2.0']

### AC-2: per-release page carries date and three headings
  GIVEN: GIVEN GBC-008's changelog-release-pages spec has landed, and the authored entries are built into the real preview
  WHEN:  a visitor opens /changelog/0.2.1
  THEN:  the page shows the literal date 2026-09-08 and the Added, Changed and Fixed headings
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the release page omits the date', 'any of the Added, Changed or Fixed headings is absent']
        EVIDENCE: file_artifact
        - START_REF: authored_changelog_candidate
          ACTION: ['goto /changelog/0.2.1 and record the response status', 'search the article text for the date literal', 'list the level-2 headings in the article body in DOM order']
          MUST_OBSERVE: ['HTTP status 200 at /changelog/0.2.1', "the literal '2026-09-08' appears at least 1 time in the article", "exactly 1 level-2 heading each with text 'Added', 'Changed' and 'Fixed'", "the level-2 heading texts in the article body, in DOM order, are exactly ['Added','Changed','Fixed']"]
          MUST_NOT_OBSERVE: ["0 occurrences of '2026-09-08'", "fewer than 3 of the headings 'Added', 'Changed', 'Fixed'"]

### AC-3: one file per release, one-to-one with git tags
  GIVEN: GIVEN GBC-008's changelog-release-pages spec has landed, and the real prebuild runs against the three authored entries and the repository's v* git tags
  WHEN:  a maintainer runs the docs prebuild and opens /changelog
  THEN:  three entries map one-to-one to the tags v0.1.0, v0.2.0 and v0.2.1, and no fourth release route exists
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a tag has no entry or an entry has no tag, so the prebuild line differs or the build exits non-zero', 'a fourth entry is added beyond v0.2.1']
        EVIDENCE: file_artifact
        - START_REF: authored_changelog_candidate
          ACTION: ['run the real docs prebuild and capture its stdout and exit code', 'goto /changelog and count the a[data-index-list-title] anchors inside [data-index-list]', 'request.get /changelog/0.3.0 and /changelog/v0.2.1 and record both statuses']
          MUST_OBSERVE: ['prebuild exit code 0', "the literal stdout line '[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological'", 'exactly 3 a[data-index-list-title] inside [data-index-list] on /changelog', 'HTTP status 404 at /changelog/0.3.0 and HTTP status 404 at /changelog/v0.2.1']
          MUST_NOT_OBSERVE: ['a prebuild line reporting a tag or entry count other than 3', 'a fourth a[data-index-list-title] inside [data-index-list]', 'HTTP status 200 at /changelog/v0.2.1']

### AC-4: touched-component links resolve
  GIVEN: GIVEN GBC-008's changelog-release-pages spec has landed, and the authored entries and item pages are built into the real preview
  WHEN:  a visitor follows the touched-component links from the release pages
  THEN:  every touched-component link resolves to a /components/{slug} page with HTTP 200
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a touched-component anchor targets a slug that is not one of the 56 items', 'a touched-component anchor returns 404']
        EVIDENCE: file_artifact
        - START_REF: authored_changelog_candidate
          ACTION: ['goto /changelog/0.2.1, /changelog/0.2.0 and /changelog/0.1.0', "collect the anchors whose href starts with '/components/' in each article", 'request.get every collected href and record its status', 'compare each slug with the 56 names in apps/docs/src/data/registry-items.json']
          MUST_OBSERVE: ["at least 1 anchor with href '/components/{slug}' on /changelog/0.2.1", 'HTTP status 200 for every collected /components/ href across the 3 pages', '0 collected slugs missing from the 56-item ledger']
          MUST_NOT_OBSERVE: ['any /components/ href returning 404', '0 touched-component anchors on /changelog/0.2.1']

### AC-5: empty list renders explicit none
  GIVEN: GIVEN the authored changelog entries, where 0.2.1's Added list is empty (author verifies against git log v0.2.0..v0.2.1 before relying on it)
  WHEN:  a vitest source scan reads each entry's headings and list bodies
  THEN:  each entry has exactly one Added, one Changed and one Fixed heading, and every empty list holds the literal 'none' instead of an absent or blank heading
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Counting headings and checking the text between them is a pure parse of three local markdown files with no I/O beyond reading them.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts
  TEST_FUNCTION: every entry has three headings and empty lists read none
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts

### AC-6: entry sources carry version, date, commit range and resolving slugs
  GIVEN: GIVEN the three authored entries and the tracked packages/registry/registry.json
  WHEN:  a vitest source scan reads their frontmatter and links
  THEN:  the files are exactly 0.1.0.md, 0.2.0.md and 0.2.1.md, each version equals its file name without a 'v' prefix, the dates are 2026-09-07, 2026-09-08 and 2026-09-08, each entry cites a git-log commit range, and every /components/{slug} link names one of the 56 registry items
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Frontmatter equality, one range-citation pattern and set membership of link slugs in one JSON file are pure string checks with no I/O beyond reading local files.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts
  TEST_FUNCTION: entry frontmatter, commit range citation and slug links
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts

## Test Criteria
- TC-1: /changelog has exactly 3 a[data-index-list-title] inside [data-index-list], with hrefs /changelog/0.2.1, /changelog/0.2.0, /changelog/0.1.0 in that DOM order.  (maps_to: AC-1)
- TC-2: /changelog/0.2.1 returns 200, contains the literal '2026-09-08' and has exactly 1 each of the level-2 headings Added, Changed and Fixed.  (maps_to: AC-2)
- TC-3: The prebuild prints '[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological', /changelog has exactly 3 a[data-index-list-title] inside [data-index-list], and /changelog/0.3.0 and /changelog/v0.2.1 return 404.  (maps_to: AC-3)
- TC-4: Every /components/{slug} anchor on the three release pages returns 200 and names a slug in the 56-item ledger.  (maps_to: AC-4)
- TC-5: Each entry has exactly 1 Added, 1 Changed and 1 Fixed heading and no heading has a blank body; an empty list reads 'none'.  (maps_to: AC-5)
- TC-6: The three files' frontmatter versions match their names without 'v', the dates match, each cites a commit range, and every linked slug is in registry.json.  (maps_to: AC-6)

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
- tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
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
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts

## Dependencies
Depends on: none
Blocks:     ['GBC-006', 'GBC-007', 'GBC-008']

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
      "description": "The three authored changelog entries enter the real docs content build. The ordered docs build runs the prebuild gates and produces the dist that the Playwright-owned astro preview serves at http://localhost:4321. Each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/changelog/0.1.0.md (2026-09-07), 0.2.0.md (2026-09-08) and 0.2.1.md (2026-09-08) are authored, one per git tag v0.1.0, v0.2.0 and v0.2.1.",
        "Each entry carries Added, Changed and Fixed headings, a deriving git-log commit range, and touched-component links to /components/{slug}.",
        "GBC-007's collection and prebuild gate and GBC-008's /changelog routes are built from the same candidate."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-008's changelog-release-pages spec has landed, and the authored entries are built into the real preview WHEN a visitor opens /changelog THEN the entries render with 0.2.1 above 0.2.0 above 0.1.0",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium (3 projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "an adjacent pair of entries is out of order",
            "the index omits a release or lists an empty collection"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_changelog_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /changelog and record the response status",
                "list the a[data-index-list-title] anchors inside [data-index-list] in DOM order and read each href and text",
                "repeat the read under the chromium-nojs project"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /changelog",
                "exactly 3 a[data-index-list-title] inside [data-index-list]",
                "hrefs of the a[data-index-list-title] anchors in DOM order: /changelog/0.2.1, /changelog/0.2.0, /changelog/0.1.0",
                "the first a[data-index-list-title] text contains the literal '0.2.1' and the last contains '0.1.0'",
                "under chromium-nojs, the same 3 a[data-index-list-title] hrefs appear in the same order"
              ],
              "must_not_observe": [
                "0 a[data-index-list-title] inside [data-index-list] (empty index)",
                "href /changelog/0.1.0 above /changelog/0.2.0"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-008's changelog-release-pages spec has landed, and the authored entries are built into the real preview WHEN a visitor opens /changelog/0.2.1 THEN the page shows the literal date 2026-09-08 and the Added, Changed and Fixed headings",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium (3 projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the release page omits the date",
            "any of the Added, Changed or Fixed headings is absent"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_changelog_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /changelog/0.2.1 and record the response status",
                "search the article text for the date literal",
                "list the level-2 headings in the article body in DOM order"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /changelog/0.2.1",
                "the literal '2026-09-08' appears at least 1 time in the article",
                "exactly 1 level-2 heading each with text 'Added', 'Changed' and 'Fixed'",
                "the level-2 heading texts in the article body, in DOM order, are exactly ['Added','Changed','Fixed']"
              ],
              "must_not_observe": [
                "0 occurrences of '2026-09-08'",
                "fewer than 3 of the headings 'Added', 'Changed', 'Fixed'"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-008's changelog-release-pages spec has landed, and the real prebuild runs against the three authored entries and the repository's v* git tags WHEN a maintainer runs the docs prebuild and opens /changelog THEN three entries map one-to-one to the tags v0.1.0, v0.2.0 and v0.2.1, and no fourth release route exists",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium (3 projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "a tag has no entry or an entry has no tag, so the prebuild line differs or the build exits non-zero",
            "a fourth entry is added beyond v0.2.1"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_changelog_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "run the real docs prebuild and capture its stdout and exit code",
                "goto /changelog and count the a[data-index-list-title] anchors inside [data-index-list]",
                "request.get /changelog/0.3.0 and /changelog/v0.2.1 and record both statuses"
              ]
            },
            "end_state": {
              "must_observe": [
                "prebuild exit code 0",
                "the literal stdout line '[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological'",
                "exactly 3 a[data-index-list-title] inside [data-index-list] on /changelog",
                "HTTP status 404 at /changelog/0.3.0 and HTTP status 404 at /changelog/v0.2.1"
              ],
              "must_not_observe": [
                "a prebuild line reporting a tag or entry count other than 3",
                "a fourth a[data-index-list-title] inside [data-index-list]",
                "HTTP status 200 at /changelog/v0.2.1"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-008's changelog-release-pages spec has landed, and the authored entries and item pages are built into the real preview WHEN a visitor follows the touched-component links from the release pages THEN every touched-component link resolves to a /components/{slug} page with HTTP 200",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium (3 projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "a touched-component anchor targets a slug that is not one of the 56 items",
            "a touched-component anchor returns 404"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_changelog_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /changelog/0.2.1, /changelog/0.2.0 and /changelog/0.1.0",
                "collect the anchors whose href starts with '/components/' in each article",
                "request.get every collected href and record its status",
                "compare each slug with the 56 names in apps/docs/src/data/registry-items.json"
              ]
            },
            "end_state": {
              "must_observe": [
                "at least 1 anchor with href '/components/{slug}' on /changelog/0.2.1",
                "HTTP status 200 for every collected /components/ href across the 3 pages",
                "0 collected slugs missing from the 56-item ledger"
              ],
              "must_not_observe": [
                "any /components/ href returning 404",
                "0 touched-component anchors on /changelog/0.2.1"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the authored changelog entries, where 0.2.1's Added list is empty (author verifies against git log v0.2.0..v0.2.1 before relying on it) WHEN a vitest source scan reads each entry's headings and list bodies THEN each entry has exactly one Added, one Changed and one Fixed heading, and every empty list holds the literal 'none' instead of an absent or blank heading",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts",
      "test_function": "every entry has three headings and empty lists read none",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Counting headings and checking the text between them is a pure parse of three local markdown files with no I/O beyond reading them.",
      "maps_to_ac": null
    },
    {
      "id": "AC-6",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the three authored entries and the tracked packages/registry/registry.json WHEN a vitest source scan reads their frontmatter and links THEN the files are exactly 0.1.0.md, 0.2.0.md and 0.2.1.md, each version equals its file name without a 'v' prefix, the dates are 2026-09-07, 2026-09-08 and 2026-09-08, each entry cites a git-log commit range, and every /components/{slug} link names one of the 56 registry items",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts",
      "test_function": "entry frontmatter, commit range citation and slug links",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Frontmatter equality, one range-citation pattern and set membership of link slugs in one JSON file are pure string checks with no I/O beyond reading local files.",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "/changelog has exactly 3 a[data-index-list-title] inside [data-index-list], with hrefs /changelog/0.2.1, /changelog/0.2.0, /changelog/0.1.0 in that DOM order.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "/changelog/0.2.1 returns 200, contains the literal '2026-09-08' and has exactly 1 each of the level-2 headings Added, Changed and Fixed.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "The prebuild prints '[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological', /changelog has exactly 3 a[data-index-list-title] inside [data-index-list], and /changelog/0.3.0 and /changelog/v0.2.1 return 404.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "Every /components/{slug} anchor on the three release pages returns 200 and names a slug in the 56-item ledger.",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "Each entry has exactly 1 Added, 1 Changed and 1 Fixed heading and no heading has a blank body; an empty list reads 'none'.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts",
      "test_function": "every entry has three headings and empty lists read none",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-5"
    },
    {
      "id": "TC-6",
      "type": "test_criterion",
      "primary": false,
      "description": "The three files' frontmatter versions match their names without 'v', the dates match, each cites a commit range, and every linked slug is in registry.json.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts",
      "test_function": "entry frontmatter, commit range citation and slug links",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-6"
    }
  ]
}
-->
