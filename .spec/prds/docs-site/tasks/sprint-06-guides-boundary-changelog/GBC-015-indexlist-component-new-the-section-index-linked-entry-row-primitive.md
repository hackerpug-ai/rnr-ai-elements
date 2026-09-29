================================================================================
TASK: GBC-015 - IndexList component (NEW) — the section-index linked entry-row primitive
================================================================================

TASK_TYPE:  DESIGN
STATUS:     Completed

Commit: 7902caaeec7cefc72c62b119bf9f13d02279465a
PRIORITY:   P0
POINTS:     3
AGENT:      planner=frontend-designer | implementer=frontend-designer | reviewer=react-native-reusables-reviewer

PROPOSED BY: frontend-designer
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- style every row through var(--*) tokens only (no hex literals)
- render zero-JS static anchors (no <script>, no island)
- give each row a >=44px min-height touch target
- define the Props/slot surface in the Design section (rows via the default slot or a typed rows prop — ONE composition model, no baked per-page variants) and expose data-index-list-row on every row as the test hook
- assert the 44px target via boundingBox in specs (a screenshot cannot measure)
- match the SectionHeader / Chip / ComponentCard visual language
NEVER:
- never emit a per-variant sibling file (IndexListGuides.astro / IndexListChangelog.astro)
- never imitate ComponentCard's imagery-specific card chrome
- never hardcode hex/rgb color values
- never require client JavaScript to render a row
STRICTLY:
- one row markup: an li whose title <a> is stretched over the row via ::after (the >=44px target); count Chip and touched-component links render as siblings inside the li — never an <a> inside an <a> (invalid HTML; browsers close the outer anchor and every row assertion then tests broken markup)
- token provenance (var(--*) use, no hex literals) is verified by a source grep TC, not by computed styles — the DOM resolves vars and cannot distinguish a token from a literal
- scroll-margin-block-start calc(var(--layout-header-h) + 1rem) on any anchorable row
- title color var(--foreground), description var(--muted-foreground), divider var(--border), hover fill var(--accent), radius var(--radius-md)
- Expose data-index-list on the list root <ul>, and data-index-list-title and data-index-list-description on each row's title <a> and description element, alongside data-index-list-row. These are the selectors GBC-010's and GBC-008's specs and this task's unit scan key on.
- NEVER edit tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts (GBC-010 writes it) or tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts (GBC-008 writes it). They are listed in write_allowed only so the non-primary AC-1 to AC-4 bindings resolve. Those ACs are proven when their writers close, not at this task's close.
- UNIT_TEST_JUSTIFIED: AC-5 is a pure source-contract scan that only reads IndexList.astro and its directory listing from the real working tree (no runtime, no service). It is this early task's only proof that can pass at its own close, because every rendered claim runs in a spec that GBC-010 or GBC-008 writes later.

## Specification
Objective: Author IndexList.astro, the linked non-registry entry-row primitive for the section-index page type (TR-07 NEW 3/4, section-index wireframe R5), with two prop-driven forms sharing one markup/stylesheet.
Success state: The built /guides and /changelog pages each render IndexList rows that are token-governed, zero-JS, keyboard/touch operable, and visually continuous with SectionHeader.

## Acceptance Criteria
### AC-1: five-guides-index
  GIVEN: GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview
  WHEN:  a visitor opens /guides
  THEN:  exactly 5 IndexList rows render, each a linked guide title plus a one-line description
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["IndexList is a static shell that emits 0 '[data-index-list-row]' rows, or prose paragraphs replace the linked rows", "a row title href is hardcoded to a path outside the 5 built guide pages, or its description is omitted (an empty '[data-index-list-description]')"]
        EVIDENCE: file_artifact
        - START_REF: five_guides_built
          ACTION: ['GET http://localhost:4321/guides and record the status', "query '[data-index-list] [data-index-list-row]' and read each row's 'a[data-index-list-title]' href and '[data-index-list-description]' text", 'open each title href and read the destination \'meta[name="description"]\' content']
          MUST_OBSERVE: ['GET /guides returns HTTP 200', "exactly 1 '[data-index-list]' holding exactly 5 '[data-index-list-row]' elements", "the 5 'a[data-index-list-title]' hrefs are exactly the set '/guides/re-theme', '/guides/update-installed-items', '/guides/preview-on-device', '/guides/customize-rendering', '/guides/troubleshooting'", 'each of the 5 \'[data-index-list-description]\' texts has length >= 1 and equals its destination page\'s \'meta[name="description"]\' content']
          MUST_NOT_OBSERVE: ["0 '[data-index-list-row]' elements (an empty list)", '4 or 6 rows', "a row with an empty '[data-index-list-description]'", "a title href outside the 5 listed '/guides/' paths"]

### AC-2: changelog-newest-first
  GIVEN: GBC-008's changelog-release-pages spec has landed. This is an early task, so the AC is proven when GBC-008 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview with the 3 changelog entries
  WHEN:  a visitor opens /changelog
  THEN:  IndexList rows appear newest-first (0.2.1, 0.2.0, 0.1.0: date descending, then semver descending on the shared 2026-09-08 date), each carrying a version title and a date meta Chip
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['rows are sorted ascending, left unsorted, or hardcoded in a static order that ignores the collection', 'the date meta Chip is omitted from a row']
        EVIDENCE: file_artifact
        - START_REF: changelog_built
          ACTION: ['GET http://localhost:4321/changelog and record the status', "read, in DOM order, each '[data-index-list-row]' title href, title text and '.chip' text"]
          MUST_OBSERVE: ['GET /changelog returns HTTP 200', "exactly 3 '[data-index-list-row]' elements", "title hrefs in DOM order are exactly '/changelog/0.2.1', '/changelog/0.2.0', '/changelog/0.1.0'", "title texts contain '0.2.1', '0.2.0' and '0.1.0' respectively", "each row holds exactly 1 '.chip' date meta, with texts in DOM order '2026-09-08', '2026-09-08', '2026-09-07'"]
          MUST_NOT_OBSERVE: ["0 '[data-index-list-row]' elements (an empty changelog)", "'/changelog/0.1.0' above '/changelog/0.2.0' (ascending order)", "'/changelog/0.2.0' above '/changelog/0.2.1' (the equal-date semver tiebreak inverted)", "a row with 0 '.chip' elements"]

### AC-3: row-anatomy
  GIVEN: GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview, and /guides lists 5 IndexList rows
  WHEN:  a guide row on /guides is inspected in the DOM, in the raw HTML and by boundingBox
  THEN:  each row is an li whose single title anchor is stretched over the row via ::after, with a boundingBox height >= 44px, the description as a sibling, and no anchor nested inside the title anchor
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the row is a static non-link element with 0 title anchors, or the ::after stretch is removed so only the title text is clickable', 'the min-height is removed and a row measures under 44px', 'a touched-component <a> is hardcoded inside the title <a> (nested anchors the HTML parser splits)']
        EVIDENCE: file_artifact
        - START_REF: five_guides_built
          ACTION: ['GET http://localhost:4321/guides through the request fixture and keep the raw HTML body', "open /guides in the page and, for each '[data-index-list-row]', read tagName, computed position, boundingBox, the 'a[data-index-list-title]' count and getComputedStyle(titleAnchor, '::after').position"]
          MUST_OBSERVE: ["each of the 5 '[data-index-list-row]' elements has tagName 'LI' and computed 'position' 'relative'", "each row holds exactly 1 'a[data-index-list-title]' and exactly 1 '[data-index-list-description]'", "getComputedStyle(title anchor, '::after').position is 'absolute' on all 5 rows", "each row's boundingBox height is >= 44", "the raw HTML of GET /guides (status 200) has 0 '<a' tokens between any opening tag carrying 'data-index-list-title' and its next '</a>'"]
          MUST_NOT_OBSERVE: ["a row with 0 'a[data-index-list-title]' (no link target)", 'a row boundingBox height below 44', "an '<a' opening tag inside a title anchor in the raw HTML"]

### AC-4: touched-component-links
  GIVEN: GBC-008's changelog-release-pages spec has landed. This is an early task, so the AC is proven when GBC-008 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview, and a changelog entry names touched components from the 56-item registry
  WHEN:  its IndexList row renders on /changelog and a visitor follows each touched-component link
  THEN:  every touched-component link is a sibling anchor inside the row, never inside the title anchor, and resolves to a 200 /components/[item] page
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["the touched components are omitted or rendered as plain text with no 'href'", 'a touched-component href is hardcoded to an item that has no built page (404)']
        EVIDENCE: file_artifact
        - START_REF: changelog_built
          ACTION: ['open http://localhost:4321/changelog', 'collect every \'a[href^="/components/"]\' inside \'[data-index-list-row]\'', 'GET each href and record the status']
          MUST_OBSERVE: ['>= 1 \'a[href^="/components/"]\' inside \'[data-index-list-row]\' on /changelog', "every such href matches '^/components/[a-z0-9-]+$' and its GET returns HTTP 200", "each such anchor's closest('a[data-index-list-title]') is null (a sibling of the title, not nested)"]
          MUST_NOT_OBSERVE: ['0 touched-component links on /changelog', 'a touched-component href returning HTTP 404', "a touched-component name rendered as text with no 'href'"]

### AC-5: token-zero-js-and-row-markup-source-contract
  GIVEN: IndexList.astro is authored by this task in the real working tree
  WHEN:  the vitest source-contract test reads IndexList.astro and lists apps/docs/src/components/
  THEN:  the component styles only through var(--*) tokens (no hex, rgb, hsl or raw oklch literal), emits no <script>, uses one li row markup carrying the data-index-list hooks with a 44px min-height and a ::after-stretched title, reuses Chip, and has no per-variant sibling file
  TEST_TIER: unit
  VERIFICATION_SERVICE: Real filesystem read of apps/docs/src/components/IndexList.astro and the apps/docs/src/components/ listing by vitest (no build, no server)
  UNIT_TEST_JUSTIFIED: Pure source-contract scan that only reads IndexList.astro and its directory listing from the real working tree (no runtime, no service), and it is this early task's only proof that can pass at its own close.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts
  TEST_FUNCTION: GBC-015-index-list-source-contract
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts -t GBC-015-index-list-source-contract
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["IndexList.astro is an empty stub or a static shell with 0 '<li' row markup", 'colors are hardcoded as hex, rgb or oklch literals instead of var(--*) tokens', "a '<script>' island is added, or per-variant sibling files (IndexListGuides.astro / IndexListChangelog.astro) fork the markup"]
        EVIDENCE: stdout
        - START_REF: index_list_source
          ACTION: ['read apps/docs/src/components/IndexList.astro from the real working tree', 'split the frontmatter, the template and the <style> block', 'list apps/docs/src/components/']
          MUST_OBSERVE: ["the template holds exactly 1 '<li' tag, carrying 'data-index-list-row', inside a '<ul' carrying 'data-index-list'", "the template carries 'data-index-list-title' on the title '<a' and 'data-index-list-description' on the description element", "the <style> block declares 'min-height: 44px', a '::after' rule with 'inset: 0', and 'scroll-margin-block-start: calc(var(--layout-header-h) + 1rem)'", "the <style> block references each of 'var(--foreground)', 'var(--muted-foreground)', 'var(--border)', 'var(--accent)' and 'var(--radius-md)' at least 1 time", "the frontmatter imports Chip from './Chip.astro'"]
          MUST_NOT_OBSERVE: ["a hex literal matching '#[0-9a-fA-F]{3,8}' in the <style> block", "a raw 'rgb(', 'hsl(' or 'oklch(' color function in the file", "a '<script' tag (0 allowed)", "'IndexListGuides.astro' or 'IndexListChangelog.astro' in apps/docs/src/components/", "an empty file with 0 '<li' tags"]

## Test Criteria
- TC-1: /guides has exactly 5 '[data-index-list-row]' rows whose title hrefs are the 5 listed '/guides/' paths, each with a non-empty description equal to its destination meta description  (maps_to: AC-1)
- TC-2: /changelog rows read '/changelog/0.2.1', '/changelog/0.2.0', '/changelog/0.1.0' in DOM order, each with exactly 1 date '.chip' reading '2026-09-08', '2026-09-08', '2026-09-07'  (maps_to: AC-2)
- TC-3: every /guides row is an LI with 1 title anchor whose ::after is absolutely positioned, a boundingBox height >= 44, and 0 anchors nested in a title anchor in the raw HTML  (maps_to: AC-3)
- TC-4: every '/components/' link inside a /changelog row returns HTTP 200 and sits outside the title anchor  (maps_to: AC-4)
- TC-5: IndexList.astro has 1 li row markup with the data-index-list hooks, a 44px min-height and token-only styles, 0 script tags, 0 color literals, and no per-variant sibling file  (maps_to: AC-5)

## Reading List
- apps/docs/src/components/SectionHeader.astro
- apps/docs/src/components/Chip.astro
- apps/docs/src/components/DataTable.astro
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/components/IndexList.astro (NEW)
- tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
- tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
WRITE-PROHIBITED:
- apps/docs/src/pages/**
- apps/docs/src/content/**
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: Zero-JS anchor rows; hover fill via var(--accent); destination headings keep scroll-margin.
Pattern: Prop-driven entry-row list with two forms (guide row, changelog row) sharing one markup and one stylesheet; changelog meta reuses the counter-less Chip pill. (SectionHeader.astro (h2 + count Chip), Chip.astro (counter-less pill form))
Anti-pattern: Do not fork per-variant sibling files; do not inline hex colors; do not replicate ComponentCard's card chrome.

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts -t GBC-015-index-list-source-contract

## Dependencies
Depends on: none
Blocks:     ['GBC-008', 'GBC-010', 'GBC-016']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-015",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "five_guides_built": {
      "description": "The five guides-section entries authored by GBC-001 (re-theme, update-installed-items, preview-on-device, customize-rendering; order 1..4) and GBC-002 (troubleshooting; order 5), routed to /guides/{slug} by GBC-009 and listed on /guides by GBC-010's page composing SectionIndexLayout and IndexList, produced by the ordered docs build and served by the Playwright-owned astro preview at http://localhost:4321.",
      "seed_method": "cli",
      "records": [
        "`pnpm --filter @rnr-ai-elements/docs build` (the run_cmd's first segment) exits 0",
        "apps/docs/dist/guides/index.html exists",
        "5 guide pages exist: apps/docs/dist/guides/{re-theme,update-installed-items,preview-on-device,customize-rendering,troubleshooting}/index.html"
      ]
    },
    "changelog_built": {
      "description": "The three changelog entries authored by GBC-005 under GBC-007's schema, one per git tag: 0.1.0 dated 2026-09-07, 0.2.0 dated 2026-09-08, 0.2.1 dated 2026-09-08. GBC-008 publishes them on the /changelog index (composing SectionIndexLayout and IndexList) and on /changelog/[version] pages, built by the ordered docs build and served by the Playwright-owned astro preview at http://localhost:4321.",
      "seed_method": "cli",
      "records": [
        "`git tag -l 'v*'` lists exactly v0.1.0, v0.2.0, v0.2.1",
        "the docs prebuild prints '[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological'",
        "apps/docs/dist/changelog/index.html and apps/docs/dist/changelog/{0.2.1,0.2.0,0.1.0}/index.html exist"
      ]
    },
    "index_list_source": {
      "description": "IndexList.astro as committed by this task, plus the apps/docs/src/components/ directory listing, read from the real working tree by vitest. RED at task start: the file does not exist, so the read fails.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/components/IndexList.astro exists",
        "`pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts -t GBC-015-index-list-source-contract` reads it"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview WHEN a visitor opens /guides THEN exactly 5 IndexList rows render, each a linked guide title plus a one-line description",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "IndexList is a static shell that emits 0 '[data-index-list-row]' rows, or prose paragraphs replace the linked rows",
            "a row title href is hardcoded to a path outside the 5 built guide pages, or its description is omitted (an empty '[data-index-list-description]')"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-03-five-guides-index/run.json"
        },
        "cases": [
          {
            "start_ref": "five_guides_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "GET http://localhost:4321/guides and record the status",
                "query '[data-index-list] [data-index-list-row]' and read each row's 'a[data-index-list-title]' href and '[data-index-list-description]' text",
                "open each title href and read the destination 'meta[name=\"description\"]' content"
              ]
            },
            "end_state": {
              "must_observe": [
                "GET /guides returns HTTP 200",
                "exactly 1 '[data-index-list]' holding exactly 5 '[data-index-list-row]' elements",
                "the 5 'a[data-index-list-title]' hrefs are exactly the set '/guides/re-theme', '/guides/update-installed-items', '/guides/preview-on-device', '/guides/customize-rendering', '/guides/troubleshooting'",
                "each of the 5 '[data-index-list-description]' texts has length >= 1 and equals its destination page's 'meta[name=\"description\"]' content"
              ],
              "must_not_observe": [
                "0 '[data-index-list-row]' elements (an empty list)",
                "4 or 6 rows",
                "a row with an empty '[data-index-list-description]'",
                "a title href outside the 5 listed '/guides/' paths"
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
      "primary": false,
      "description": "GIVEN GBC-008's changelog-release-pages spec has landed. This is an early task, so the AC is proven when GBC-008 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview with the 3 changelog entries WHEN a visitor opens /changelog THEN IndexList rows appear newest-first (0.2.1, 0.2.0, 0.1.0: date descending, then semver descending on the shared 2026-09-08 date), each carrying a version title and a date meta Chip",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "rows are sorted ascending, left unsorted, or hardcoded in a static order that ignores the collection",
            "the date meta Chip is omitted from a row"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-06-changelog-release-pages/run.json"
        },
        "cases": [
          {
            "start_ref": "changelog_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "GET http://localhost:4321/changelog and record the status",
                "read, in DOM order, each '[data-index-list-row]' title href, title text and '.chip' text"
              ]
            },
            "end_state": {
              "must_observe": [
                "GET /changelog returns HTTP 200",
                "exactly 3 '[data-index-list-row]' elements",
                "title hrefs in DOM order are exactly '/changelog/0.2.1', '/changelog/0.2.0', '/changelog/0.1.0'",
                "title texts contain '0.2.1', '0.2.0' and '0.1.0' respectively",
                "each row holds exactly 1 '.chip' date meta, with texts in DOM order '2026-09-08', '2026-09-08', '2026-09-07'"
              ],
              "must_not_observe": [
                "0 '[data-index-list-row]' elements (an empty changelog)",
                "'/changelog/0.1.0' above '/changelog/0.2.0' (ascending order)",
                "'/changelog/0.2.0' above '/changelog/0.2.1' (the equal-date semver tiebreak inverted)",
                "a row with 0 '.chip' elements"
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
      "description": "GIVEN GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview, and /guides lists 5 IndexList rows WHEN a guide row on /guides is inspected in the DOM, in the raw HTML and by boundingBox THEN each row is an li whose single title anchor is stretched over the row via ::after, with a boundingBox height >= 44px, the description as a sibling, and no anchor nested inside the title anchor",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the row is a static non-link element with 0 title anchors, or the ::after stretch is removed so only the title text is clickable",
            "the min-height is removed and a row measures under 44px",
            "a touched-component <a> is hardcoded inside the title <a> (nested anchors the HTML parser splits)"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-03-five-guides-index/run.json"
        },
        "cases": [
          {
            "start_ref": "five_guides_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "GET http://localhost:4321/guides through the request fixture and keep the raw HTML body",
                "open /guides in the page and, for each '[data-index-list-row]', read tagName, computed position, boundingBox, the 'a[data-index-list-title]' count and getComputedStyle(titleAnchor, '::after').position"
              ]
            },
            "end_state": {
              "must_observe": [
                "each of the 5 '[data-index-list-row]' elements has tagName 'LI' and computed 'position' 'relative'",
                "each row holds exactly 1 'a[data-index-list-title]' and exactly 1 '[data-index-list-description]'",
                "getComputedStyle(title anchor, '::after').position is 'absolute' on all 5 rows",
                "each row's boundingBox height is >= 44",
                "the raw HTML of GET /guides (status 200) has 0 '<a' tokens between any opening tag carrying 'data-index-list-title' and its next '</a>'"
              ],
              "must_not_observe": [
                "a row with 0 'a[data-index-list-title]' (no link target)",
                "a row boundingBox height below 44",
                "an '<a' opening tag inside a title anchor in the raw HTML"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GBC-008's changelog-release-pages spec has landed. This is an early task, so the AC is proven when GBC-008 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview, and a changelog entry names touched components from the 56-item registry WHEN its IndexList row renders on /changelog and a visitor follows each touched-component link THEN every touched-component link is a sibling anchor inside the row, never inside the title anchor, and resolves to a 200 /components/[item] page",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the touched components are omitted or rendered as plain text with no 'href'",
            "a touched-component href is hardcoded to an item that has no built page (404)"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-06-changelog-release-pages/run.json"
        },
        "cases": [
          {
            "start_ref": "changelog_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "open http://localhost:4321/changelog",
                "collect every 'a[href^=\"/components/\"]' inside '[data-index-list-row]'",
                "GET each href and record the status"
              ]
            },
            "end_state": {
              "must_observe": [
                ">= 1 'a[href^=\"/components/\"]' inside '[data-index-list-row]' on /changelog",
                "every such href matches '^/components/[a-z0-9-]+$' and its GET returns HTTP 200",
                "each such anchor's closest('a[data-index-list-title]') is null (a sibling of the title, not nested)"
              ],
              "must_not_observe": [
                "0 touched-component links on /changelog",
                "a touched-component href returning HTTP 404",
                "a touched-component name rendered as text with no 'href'"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN IndexList.astro is authored by this task in the real working tree WHEN the vitest source-contract test reads IndexList.astro and lists apps/docs/src/components/ THEN the component styles only through var(--*) tokens (no hex, rgb, hsl or raw oklch literal), emits no <script>, uses one li row markup carrying the data-index-list hooks with a 44px min-height and a ::after-stretched title, reuses Chip, and has no per-variant sibling file",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts",
      "test_function": "GBC-015-index-list-source-contract",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts -t GBC-015-index-list-source-contract",
      "test_tier": "unit",
      "verification_service": "Real filesystem read of apps/docs/src/components/IndexList.astro and the apps/docs/src/components/ listing by vitest (no build, no server)",
      "surface_policy": null,
      "unit_test_justified": "Pure source-contract scan that only reads IndexList.astro and its directory listing from the real working tree (no runtime, no service), and it is this early task's only proof that can pass at its own close.",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "unit",
        "unit_test_justified": "Pure source-contract scan that only reads IndexList.astro and its directory listing from the real working tree (no runtime, no service), and it is this early task's only proof that can pass at its own close.",
        "verification_service": "Real filesystem read of apps/docs/src/components/IndexList.astro and the apps/docs/src/components/ listing by vitest (no build, no server)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "IndexList.astro is an empty stub or a static shell with 0 '<li' row markup",
            "colors are hardcoded as hex, rgb or oklch literals instead of var(--*) tokens",
            "a '<script>' island is added, or per-variant sibling files (IndexListGuides.astro / IndexListChangelog.astro) fork the markup"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "index_list_source",
            "action": {
              "actor": "test_runner",
              "steps": [
                "read apps/docs/src/components/IndexList.astro from the real working tree",
                "split the frontmatter, the template and the <style> block",
                "list apps/docs/src/components/"
              ]
            },
            "end_state": {
              "must_observe": [
                "the template holds exactly 1 '<li' tag, carrying 'data-index-list-row', inside a '<ul' carrying 'data-index-list'",
                "the template carries 'data-index-list-title' on the title '<a' and 'data-index-list-description' on the description element",
                "the <style> block declares 'min-height: 44px', a '::after' rule with 'inset: 0', and 'scroll-margin-block-start: calc(var(--layout-header-h) + 1rem)'",
                "the <style> block references each of 'var(--foreground)', 'var(--muted-foreground)', 'var(--border)', 'var(--accent)' and 'var(--radius-md)' at least 1 time",
                "the frontmatter imports Chip from './Chip.astro'"
              ],
              "must_not_observe": [
                "a hex literal matching '#[0-9a-fA-F]{3,8}' in the <style> block",
                "a raw 'rgb(', 'hsl(' or 'oklch(' color function in the file",
                "a '<script' tag (0 allowed)",
                "'IndexListGuides.astro' or 'IndexListChangelog.astro' in apps/docs/src/components/",
                "an empty file with 0 '<li' tags"
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
      "description": "/guides has exactly 5 '[data-index-list-row]' rows whose title hrefs are the 5 listed '/guides/' paths, each with a non-empty description equal to its destination meta description",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "/changelog rows read '/changelog/0.2.1', '/changelog/0.2.0', '/changelog/0.1.0' in DOM order, each with exactly 1 date '.chip' reading '2026-09-08', '2026-09-08', '2026-09-07'",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "every /guides row is an LI with 1 title anchor whose ::after is absolutely positioned, a boundingBox height >= 44, and 0 anchors nested in a title anchor in the raw HTML",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "every '/components/' link inside a /changelog row returns HTTP 200 and sits outside the title anchor",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "IndexList.astro has 1 li row markup with the data-index-list hooks, a 44px min-height and token-only styles, 0 script tags, 0 color literals, and no per-variant sibling file",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts",
      "test_function": "GBC-015-index-list-source-contract",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts -t GBC-015-index-list-source-contract",
      "test_tier": "unit",
      "verification_service": "Real filesystem read of apps/docs/src/components/IndexList.astro and the apps/docs/src/components/ listing by vitest (no build, no server)",
      "surface_policy": null,
      "maps_to_ac": "AC-5"
    }
  ]
}
-->

## Handoff

```json
{
  "task": "GBC-015",
  "commit_sha": "7902caaeec7cefc72c62b119bf9f13d02279465a",
  "done": "IndexList.astro, the section-index linked entry-row primitive, landed at 7902caae (merged to main as 370fb9f7) together with its AC-5 source-contract test tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts and RED/GREEN plus render-harness evidence under .tmp/GBC-015/. The component exposes one composition model — a typed rows prop (href, title, optional description, meta, links, id) at apps/docs/src/components/IndexList.astro:47 driving one li row markup (IndexList.astro:58) for both forms (guide row: title + one-liner; changelog row: version title + date meta Chip at IndexList.astro:71 + touched-component sibling links) — with the title anchor stretched over the >=44px row via an absolutely-positioned ::after (IndexList.astro:123), Chip and sibling links stacked above the stretch, token-only styling, zero JS, scroll-margin clearing the sticky Header, and all four data-index-list* hooks. All four task gates verified green (vitest source contract, tsc, biome via direct binary, ordered docs build) plus a scratch Astro-container render harness that rendered both row forms through the real Astro compiler + SSR; the commit is preceded on the branch by the sanctioned fallow remediation eb404029.",
  "deviations": [
    "Commit eb404029aa819188bd8dedd63feb40c256b8887c added one out-of-scope key to .fallowrc.json:5 — \"dynamicallyLoaded\": [\"apps/docs/src/components/IndexList.astro\"] — sanctioned by the coordinator with precedent 75e5cc9e, because the pre-commit fallow gate fails any commit introducing an import-graph-orphan file and IndexList's importers (GBC-008, GBC-010, GBC-016) land later in the sprint."
  ],
  "concerns": [
    "Touched-component link clickability rests entirely on .index-list__link { position: relative; z-index: 1; } (IndexList.astro:146): the GBC-008 spec GETs hrefs but never clicks, so dropping the z-index in a future refactor would pass every spec while making the links unclickable under the stretched ::after — the source-contract test pins it only as a string match (tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts:114).",
    "The .fallowrc.json dynamicallyLoaded entry is a temporary seed that must be removed once GBC-008/GBC-010 import IndexList, or it permanently masks real dead-code findings for that file.",
    "The committed render harness (.tmp/GBC-015/cycle-1/green/render-harness.mjs) hardcodes absolute worktree paths, so it is evidence of this run only and will not execute as-is from main after the merge."
  ],
  "findings": [
    "Astro 7's container API renders partials with no <style> tags and vite's SSR pipeline discards CSS, so asserting rendered styles requires fetching the client transform of the '?astro&type=style' module (the technique is captured in .tmp/GBC-015/cycle-1/green/render-harness.mjs) — any future component-level render test hits the same wall.",
    "GBC-016's MUST 'render the IndexList rows via the default slot' refers to SectionIndexLayout's OWN default slot, not IndexList's surface: IndexList ships a typed rows prop and deliberately no slot (pinned by the source-contract test), so GBC-016/GBC-008/GBC-010 pages must pass <IndexList rows={...} /> into the layout's slot.",
    "The pre-commit fallow gate (righthook.yml) structurally fails every commit that introduces a file unreachable from the import graph, so GBC-016 will hit the identical wall for SectionIndexLayout.astro and DocsNav.astro and needs its own .fallowrc.json dynamicallyLoaded entries until its consumers land.",
    "The docs build never compiles an orphan component — a syntactically broken .astro passes 'pnpm --filter @rnr-ai-elements/docs build' as long as no page imports it (verified: the build was green before the component was ever rendered), so primitive tasks need a render/compile proof of their own.",
    "The orchestrator's recorded session_id values (e.g. a0a3a474d568c5e1a) are 16-hex dispatch handles, not Claude Code session UUIDs — no dispatched agent in this sprint can self-match them against its harness session id (verified for GBC-003/004/005 and the reviewer), so provenance checks can only rely on routing into the original conversation, plus content match of the recorded responses.",
    "A fresh kb-run-sprint worktree shows 8 phantom tsc errors in tests/sprint-04-generated-reference/code-primitives-contract.test.ts until the gitignored generation chain runs — run the docs build (which runs the chain) before judging typecheck, or 'pnpm registry:build && pnpm gallery:manifest && pnpm exec tsx scripts/docs-data/prebuild.ts' directly."
  ],
  "scope_impact": [
    {
      "target": "GBC-016",
      "found": "Its MUST says 'render the IndexList rows via the default slot' while the landed IndexList has a typed rows prop and no slot (GBC-015's AC-5 pins the single li inside the component), and its own new files SectionIndexLayout.astro + DocsNav.astro will be import-graph orphans that fail the pre-commit fallow gate until GBC-008/GBC-010 compose them.",
      "change": "Reword the MUST to 'render the IndexList (composed with its rows prop) via SectionIndexLayout's default slot', and either pre-seed or dispatch .fallowrc.json dynamicallyLoaded entries for SectionIndexLayout.astro and DocsNav.astro alongside the task."
    },
    {
      "target": "ROADMAP",
      "found": "Any task split that lands a primitive before its consumers structurally fails the repo's pre-commit fallow gate on the orphan-file finding, discovered only at commit time (this task required a sanctioned out-of-scope one-liner to clear it).",
      "change": "The sprint template should pair primitive-before-consumer tasks with a .fallowrc.json dynamicallyLoaded dispatch (as done here per precedent 75e5cc9e) or sequence primitives to land with their first consumer, and list the righthook pre-commit gates (typecheck, biome, fallow) among every task's verification gates."
    }
  ],
  "feedback": [
    "The task's Verification Gates list (tsc, biome, docs build, vitest) omits the repo's pre-commit righthook gates, so the fallow orphan-file failure was only discovered at commit time after all listed gates were green — include the pre-commit gates in the gate list for tasks that land files no one imports yet.",
    "The Props/slot instruction 'rows via the default slot or a typed rows prop — ONE composition model' is resolvable only by noticing that AC-5 pins exactly one '<li' tag inside IndexList.astro — name the typed rows prop as the required surface outright, since a default-slot form silently contradicts the AC-5 source scan.",
    "The AC-5 verify command passes but vitest 4 intercepts console.log in non-TTY runs, hiding the seeded EVIDENCE:stdout record that 'requires_seeded_evidence: true' asks for — append --disable-console-intercept to the verify command (or accept exit 0 plus the file artifact as the record)."
  ]
}
```
