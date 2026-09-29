================================================================================
TASK: GBC-016 - section-index page layout — the shared /guides + /changelog visual shell
================================================================================

TASK_TYPE:  DESIGN
STATUS:     Completed

Commit: 4022ddf1e8c4204b1fba73994e497f3912ce5e13
PRIORITY:   P1
POINTS:     2
AGENT:      planner=frontend-designer | implementer=frontend-designer | reviewer=react-native-reusables-reviewer

PROPOSED BY: frontend-designer
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- compose PageHeader (title + one-line description)
- compose a SectionHeader (anchored h2 + count Chip) reusing SectionHeader.astro
- render the IndexList rows via the default slot
- supply the docs-section nav (getting-started / guides / porting) since DocsLayout renders no sidebar — by extracting DocsNav.astro from MarkdownLayout's inline nav (Rule of 2: two consumers) and having MarkdownLayout consume the extraction; composing MarkdownLayout directly is NOT the path (it hard-renders a mandatory Edit-this-page link)
- collapse to a single column below lg
NEVER:
- never render a ToC rail on a section-index page
- never duplicate the docs-nav CSS
- never author the route getStaticPaths or the changelog collection schema
- never emit a second sidebar implementation
STRICTLY:
- no ToC rail (short page)
- page padding 1.5rem, max-width 96rem matching /components and /registry
- token-only styling, zero JS
- Expose data-section-index on the SectionIndexLayout root grid element. It is the selector the bound specs and this task's unit scan key on.
- NEVER edit tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts (GBC-010 writes it) or tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts (GBC-008 writes it). They are listed in write_allowed only so the non-primary AC-1 to AC-5 bindings resolve. Those ACs are proven when their writers close, not at this task's close.
- UNIT_TEST_JUSTIFIED: AC-6 is a pure source-contract scan that only reads SectionIndexLayout.astro, DocsNav.astro and MarkdownLayout.astro from the real working tree (no runtime, no service). It is this early task's only proof that can pass at its own close, because every rendered claim runs in a spec that GBC-010 or GBC-008 writes later.

## Specification
Objective: Author SectionIndexLayout.astro, the shared section-index page shell (TR-07 section-index wireframe) reused by /guides and /changelog.
Success state: Both /guides and /changelog render the identical shell (PageHeader + SectionHeader + slotted IndexList, no ToC) with only derived data differing, and both are single-column below lg.

## Acceptance Criteria
### AC-1: guides-section-index-shell
  GIVEN: GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview, and the five guides are present
  WHEN:  a visitor opens /guides
  THEN:  a PageHeader titled 'Guides', a SectionHeader whose h2 reads 'All guides' with a sibling count Chip of 5, and exactly 5 IndexList rows render, with no ToC rail (SectionHeader renders h2 + separate Chip — a literal 'All guides (5)' string never exists in the DOM)
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the layout is a static shell with 0 IndexList rows in its slot, or the count Chip is omitted or hardcoded apart from the row count', 'the Toc rail is composed back into the layout']
        EVIDENCE: file_artifact
        - START_REF: five_guides_built
          ACTION: ['open http://localhost:4321/guides', "read the 'h1.page-header__title' text, the '.section-header h2' text and its sibling '.chip' text", 'count \'[data-section-index] [data-index-list-row]\' and \'nav[aria-label="On this page"]\'']
          MUST_OBSERVE: ['GET /guides returns HTTP 200', "exactly 1 'h1.page-header__title' with text 'Guides'", "exactly 1 '.section-header h2' with text 'All guides' and a sibling '.chip' whose text '5' equals the row count", "exactly 5 '[data-index-list-row]' elements inside '[data-section-index]'", '0 \'nav[aria-label="On this page"]\' elements']
          MUST_NOT_OBSERVE: ["0 '[data-index-list-row]' elements (an empty slot)", "a '.section-header' with 0 '.chip' children", "the literal text 'All guides (5)'", '1 or more \'nav[aria-label="On this page"]\'']

### AC-2: changelog-section-index-shell
  GIVEN: GBC-008's changelog-release-pages spec has landed. This is an early task, so the AC is proven when GBC-008 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview, and the changelog collection is present
  WHEN:  a visitor opens /changelog
  THEN:  a PageHeader titled 'Changelog', a SectionHeader 'Releases', and newest-first IndexList rows (0.2.1, 0.2.0, 0.1.0) render inside the same section-index shell, with no ToC rail
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["/changelog uses a different static page shell with no '[data-section-index]', or its rows are hardcoded in an order that ignores the collection", 'the Toc rail renders on /changelog']
        EVIDENCE: file_artifact
        - START_REF: changelog_built
          ACTION: ['open http://localhost:4321/changelog', "read the 'h1.page-header__title' text and the '.section-header h2' text", 'read the \'[data-section-index] [data-index-list-row]\' title hrefs in DOM order and count \'nav[aria-label="On this page"]\'']
          MUST_OBSERVE: ['GET /changelog returns HTTP 200', "exactly 1 'h1.page-header__title' with text 'Changelog'", "exactly 1 '.section-header h2' with text 'Releases'", "exactly 1 '[data-section-index]' holding 3 '[data-index-list-row]' elements whose title hrefs in DOM order are '/changelog/0.2.1', '/changelog/0.2.0', '/changelog/0.1.0'", '0 \'nav[aria-label="On this page"]\' elements']
          MUST_NOT_OBSERVE: ["0 '[data-index-list-row]' elements (an empty changelog)", "'/changelog/0.1.0' above '/changelog/0.2.1' (ascending order)", '1 or more \'nav[aria-label="On this page"]\' on /changelog']

### AC-3: no-toc-rail
  GIVEN: GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview
  WHEN:  /guides is inspected
  THEN:  no 'On this page' ToC rail is present, while the section-index content still renders
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the Toc component is composed into SectionIndexLayout', 'a static empty page passes only because it has no rail (guarded by requiring the 5 rows)']
        EVIDENCE: file_artifact
        - START_REF: five_guides_built
          ACTION: ['open http://localhost:4321/guides', 'count \'nav[aria-label="On this page"]\', \'.toc__nav\' and \'[data-index-list-row]\'']
          MUST_OBSERVE: ["GET /guides returns HTTP 200 with exactly 5 '[data-index-list-row]' elements", '0 \'nav[aria-label="On this page"]\' and 0 \'.toc__nav\' elements on /guides']
          MUST_NOT_OBSERVE: ['1 or more \'nav[aria-label="On this page"]\'', "a blank body with 0 '[data-index-list-row]' rows (a rail absent only because nothing rendered)"]

### AC-4: single-column-mobile
  GIVEN: GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview. The chromium-mobile project (Pixel 5, 393px wide) sits below the 64rem lg breakpoint
  WHEN:  /guides is opened
  THEN:  the section-index shell lays out in a single column with the docs-section nav still reachable and no horizontal page overflow
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the lg media query is removed and a static two-column grid persists at 393px', 'the docs-section nav is omitted or hidden (display: none) below lg']
        EVIDENCE: file_artifact
        - START_REF: five_guides_built
          ACTION: ['open http://localhost:4321/guides on the chromium-mobile project (asserted whenever the viewport width is < 1024)', "read getComputedStyle('[data-section-index]').gridTemplateColumns, the boundingBox of 'nav[data-docs-nav]' and of its first link, and documentElement.scrollWidth - clientWidth"]
          MUST_OBSERVE: ["'[data-section-index]' computed 'grid-template-columns' is exactly 1 track (a single px length) at viewport width 393", "'nav[data-docs-nav]' has a boundingBox width > 0 and holds >= 1 link with a boundingBox height >= 44", 'documentElement.scrollWidth - clientWidth equals 0']
          MUST_NOT_OBSERVE: ["2 or more tracks in 'grid-template-columns' at 393px", "a 'nav[data-docs-nav]' with 0 links or a boundingBox width of 0 (hidden)"]

### AC-5: docs-section-nav
  GIVEN: GBC-008's changelog-release-pages spec has landed. This is an early task, so the AC is proven when GBC-008 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview
  WHEN:  the sidebar region of /changelog is inspected
  THEN:  the docs-section nav from DocsNav.astro (extracted from MarkdownLayout) carries the getting-started / guides / porting groups
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["/changelog renders with the docs nav omitted (0 'nav[data-docs-nav]')", 'a second, hardcoded static sidebar replaces the shared DocsNav groups']
        EVIDENCE: file_artifact
        - START_REF: changelog_built
          ACTION: ['open http://localhost:4321/changelog', "read 'nav[data-docs-nav]', its '.docs-nav__section-title' texts in order, and the link count of each '.docs-nav__list'"]
          MUST_OBSERVE: ['exactly 1 \'nav[data-docs-nav][aria-label="Documentation"]\' on /changelog', "its '.docs-nav__section-title' texts in order are exactly 'Getting started', 'Guides', 'Porting'", "each of the 3 groups holds >= 1 '<a>' in its '.docs-nav__list'"]
          MUST_NOT_OBSERVE: ["0 'nav[data-docs-nav]' on /changelog", "2 or more 'nav[data-docs-nav]' (a second sidebar)", 'a group with 0 links']

### AC-6: layout-and-docsnav-source-contract
  GIVEN: SectionIndexLayout.astro and DocsNav.astro are created and MarkdownLayout.astro is modified by this task in the real working tree
  WHEN:  the vitest source-contract test reads the three files
  THEN:  SectionIndexLayout composes DocsLayout, PageHeader, SectionHeader, DocsNav and one default slot with no Toc, uses a single-column-below-lg grid at max-width 96rem and padding 1.5rem, and MarkdownLayout consumes DocsNav instead of its own inline nav markup and CSS
  TEST_TIER: unit
  VERIFICATION_SERVICE: Real filesystem read of apps/docs/src/layouts/SectionIndexLayout.astro, apps/docs/src/components/DocsNav.astro and apps/docs/src/layouts/MarkdownLayout.astro by vitest (no build, no server)
  UNIT_TEST_JUSTIFIED: Pure source-contract scan that only reads three .astro files from the real working tree (no runtime, no service), and it is this early task's only proof that can pass at its own close.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts
  TEST_FUNCTION: GBC-016-section-index-layout-source-contract
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts -t GBC-016-section-index-layout-source-contract
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['SectionIndexLayout.astro is an empty stub, or a static page shell that never composes PageHeader, SectionHeader or DocsNav', 'MarkdownLayout keeps its inline docs-nav markup and CSS, leaving 2 copies of the nav', 'the Toc import is added back to the section-index layout']
        EVIDENCE: stdout
        - START_REF: section_index_source
          ACTION: ['read the three files from the real working tree', 'match their imports, template tags and <style> declarations']
          MUST_OBSERVE: ["SectionIndexLayout.astro imports 'DocsLayout', 'PageHeader', 'SectionHeader' and 'DocsNav', and its template holds exactly 1 '<slot' (the default slot)", "SectionIndexLayout.astro's root element carries 'data-section-index' and its <style> declares 'grid-template-columns: 1fr', 'max-width: 96rem' and 'padding: 1.5rem'", "SectionIndexLayout.astro sets a 2-track 'grid-template-columns' only inside '@media (min-width: 64rem)'", 'DocsNav.astro contains \'data-docs-nav\', \'aria-label="Documentation"\' and the \'.docs-nav__list\' styles', "MarkdownLayout.astro imports DocsNav from '../components/DocsNav.astro' and contains 0 'docs-nav__list' literals"]
          MUST_NOT_OBSERVE: ["an import of 'Toc.astro' in SectionIndexLayout.astro", "a '<script' tag in SectionIndexLayout.astro or DocsNav.astro", "a hex literal matching '#[0-9a-fA-F]{3,8}' or a raw 'rgb(' / 'oklch(' color in either new file", "an empty SectionIndexLayout.astro with 0 '<slot' tags"]

## Test Criteria
- TC-1: /guides has h1 'Guides', '.section-header h2' 'All guides' with a sibling '.chip' '5', exactly 5 rows inside '[data-section-index]', and 0 'On this page' navs  (maps_to: AC-1)
- TC-2: /changelog has h1 'Changelog', h2 'Releases', rows '/changelog/0.2.1', '/changelog/0.2.0', '/changelog/0.1.0' in DOM order inside '[data-section-index]', and 0 'On this page' navs  (maps_to: AC-2)
- TC-3: /guides has 0 'On this page' navs and 0 '.toc__nav' elements while holding exactly 5 rows  (maps_to: AC-3)
- TC-4: at 393px wide, '[data-section-index]' has exactly 1 grid track, the docs nav holds a link >= 44px tall, and the page has 0px horizontal overflow  (maps_to: AC-4)
- TC-5: /changelog has exactly 1 docs nav whose group titles are 'Getting started', 'Guides', 'Porting' in order, each with >= 1 link  (maps_to: AC-5)
- TC-6: SectionIndexLayout.astro composes DocsLayout, PageHeader, SectionHeader and DocsNav plus 1 slot with no Toc import, and MarkdownLayout.astro consumes DocsNav with 0 inline 'docs-nav__list' literals  (maps_to: AC-6)

## Reading List
- apps/docs/src/components/SectionHeader.astro
- apps/docs/src/components/PageHeader.astro
- apps/docs/src/layouts/MarkdownLayout.astro
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/layouts/SectionIndexLayout.astro (NEW)
- apps/docs/src/components/DocsNav.astro (NEW)
- apps/docs/src/layouts/MarkdownLayout.astro (MODIFY)
- tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
- tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
WRITE-PROHIBITED:
- apps/docs/src/pages/guides.astro
- apps/docs/src/pages/changelog/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: No ToC rail; sidebar is the MarkdownLayout docs-nav pattern; single-column below lg.
Pattern: Layout composes PageHeader + SectionHeader + a slotted IndexList region, reusing the docs-section nav from MarkdownLayout. (MarkdownLayout.astro (docs-nav sidebar), components/index.astro (SectionHeader composition))
Anti-pattern: Do not duplicate the docs-nav CSS; do not add the ToC rail back; do not author route getStaticPaths.

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts -t GBC-016-section-index-layout-source-contract

## Dependencies
Depends on: ['GBC-015']
Blocks:     ['GBC-008', 'GBC-010']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-016",
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
    "section_index_source": {
      "description": "SectionIndexLayout.astro and DocsNav.astro as created by this task, and MarkdownLayout.astro as modified by it, read from the real working tree by vitest. RED at task start: the two new files do not exist and MarkdownLayout.astro still holds the inline docs-nav markup and CSS.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/layouts/SectionIndexLayout.astro exists",
        "apps/docs/src/components/DocsNav.astro exists",
        "apps/docs/src/layouts/MarkdownLayout.astro imports DocsNav",
        "`pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts -t GBC-016-section-index-layout-source-contract` reads all 3"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview, and the five guides are present WHEN a visitor opens /guides THEN a PageHeader titled 'Guides', a SectionHeader whose h2 reads 'All guides' with a sibling count Chip of 5, and exactly 5 IndexList rows render, with no ToC rail (SectionHeader renders h2 + separate Chip — a literal 'All guides (5)' string never exists in the DOM)",
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
            "the layout is a static shell with 0 IndexList rows in its slot, or the count Chip is omitted or hardcoded apart from the row count",
            "the Toc rail is composed back into the layout"
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
                "open http://localhost:4321/guides",
                "read the 'h1.page-header__title' text, the '.section-header h2' text and its sibling '.chip' text",
                "count '[data-section-index] [data-index-list-row]' and 'nav[aria-label=\"On this page\"]'"
              ]
            },
            "end_state": {
              "must_observe": [
                "GET /guides returns HTTP 200",
                "exactly 1 'h1.page-header__title' with text 'Guides'",
                "exactly 1 '.section-header h2' with text 'All guides' and a sibling '.chip' whose text '5' equals the row count",
                "exactly 5 '[data-index-list-row]' elements inside '[data-section-index]'",
                "0 'nav[aria-label=\"On this page\"]' elements"
              ],
              "must_not_observe": [
                "0 '[data-index-list-row]' elements (an empty slot)",
                "a '.section-header' with 0 '.chip' children",
                "the literal text 'All guides (5)'",
                "1 or more 'nav[aria-label=\"On this page\"]'"
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
      "description": "GIVEN GBC-008's changelog-release-pages spec has landed. This is an early task, so the AC is proven when GBC-008 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview, and the changelog collection is present WHEN a visitor opens /changelog THEN a PageHeader titled 'Changelog', a SectionHeader 'Releases', and newest-first IndexList rows (0.2.1, 0.2.0, 0.1.0) render inside the same section-index shell, with no ToC rail",
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
            "/changelog uses a different static page shell with no '[data-section-index]', or its rows are hardcoded in an order that ignores the collection",
            "the Toc rail renders on /changelog"
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
                "read the 'h1.page-header__title' text and the '.section-header h2' text",
                "read the '[data-section-index] [data-index-list-row]' title hrefs in DOM order and count 'nav[aria-label=\"On this page\"]'"
              ]
            },
            "end_state": {
              "must_observe": [
                "GET /changelog returns HTTP 200",
                "exactly 1 'h1.page-header__title' with text 'Changelog'",
                "exactly 1 '.section-header h2' with text 'Releases'",
                "exactly 1 '[data-section-index]' holding 3 '[data-index-list-row]' elements whose title hrefs in DOM order are '/changelog/0.2.1', '/changelog/0.2.0', '/changelog/0.1.0'",
                "0 'nav[aria-label=\"On this page\"]' elements"
              ],
              "must_not_observe": [
                "0 '[data-index-list-row]' elements (an empty changelog)",
                "'/changelog/0.1.0' above '/changelog/0.2.1' (ascending order)",
                "1 or more 'nav[aria-label=\"On this page\"]' on /changelog"
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
      "description": "GIVEN GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview WHEN /guides is inspected THEN no 'On this page' ToC rail is present, while the section-index content still renders",
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
            "the Toc component is composed into SectionIndexLayout",
            "a static empty page passes only because it has no rail (guarded by requiring the 5 rows)"
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
                "open http://localhost:4321/guides",
                "count 'nav[aria-label=\"On this page\"]', '.toc__nav' and '[data-index-list-row]'"
              ]
            },
            "end_state": {
              "must_observe": [
                "GET /guides returns HTTP 200 with exactly 5 '[data-index-list-row]' elements",
                "0 'nav[aria-label=\"On this page\"]' and 0 '.toc__nav' elements on /guides"
              ],
              "must_not_observe": [
                "1 or more 'nav[aria-label=\"On this page\"]'",
                "a blank body with 0 '[data-index-list-row]' rows (a rail absent only because nothing rendered)"
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
      "description": "GIVEN GBC-010's guides-index spec has landed. This is an early task, so the AC is proven when GBC-010 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview. The chromium-mobile project (Pixel 5, 393px wide) sits below the 64rem lg breakpoint WHEN /guides is opened THEN the section-index shell lays out in a single column with the docs-section nav still reachable and no horizontal page overflow",
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
            "the lg media query is removed and a static two-column grid persists at 393px",
            "the docs-section nav is omitted or hidden (display: none) below lg"
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
                "open http://localhost:4321/guides on the chromium-mobile project (asserted whenever the viewport width is < 1024)",
                "read getComputedStyle('[data-section-index]').gridTemplateColumns, the boundingBox of 'nav[data-docs-nav]' and of its first link, and documentElement.scrollWidth - clientWidth"
              ]
            },
            "end_state": {
              "must_observe": [
                "'[data-section-index]' computed 'grid-template-columns' is exactly 1 track (a single px length) at viewport width 393",
                "'nav[data-docs-nav]' has a boundingBox width > 0 and holds >= 1 link with a boundingBox height >= 44",
                "documentElement.scrollWidth - clientWidth equals 0"
              ],
              "must_not_observe": [
                "2 or more tracks in 'grid-template-columns' at 393px",
                "a 'nav[data-docs-nav]' with 0 links or a boundingBox width of 0 (hidden)"
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
      "description": "GIVEN GBC-008's changelog-release-pages spec has landed. This is an early task, so the AC is proven when GBC-008 closes, not at this task's close. The ordered docs build is served by the Playwright-owned astro preview WHEN the sidebar region of /changelog is inspected THEN the docs-section nav from DocsNav.astro (extracted from MarkdownLayout) carries the getting-started / guides / porting groups",
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
            "/changelog renders with the docs nav omitted (0 'nav[data-docs-nav]')",
            "a second, hardcoded static sidebar replaces the shared DocsNav groups"
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
                "read 'nav[data-docs-nav]', its '.docs-nav__section-title' texts in order, and the link count of each '.docs-nav__list'"
              ]
            },
            "end_state": {
              "must_observe": [
                "exactly 1 'nav[data-docs-nav][aria-label=\"Documentation\"]' on /changelog",
                "its '.docs-nav__section-title' texts in order are exactly 'Getting started', 'Guides', 'Porting'",
                "each of the 3 groups holds >= 1 '<a>' in its '.docs-nav__list'"
              ],
              "must_not_observe": [
                "0 'nav[data-docs-nav]' on /changelog",
                "2 or more 'nav[data-docs-nav]' (a second sidebar)",
                "a group with 0 links"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-6",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN SectionIndexLayout.astro and DocsNav.astro are created and MarkdownLayout.astro is modified by this task in the real working tree WHEN the vitest source-contract test reads the three files THEN SectionIndexLayout composes DocsLayout, PageHeader, SectionHeader, DocsNav and one default slot with no Toc, uses a single-column-below-lg grid at max-width 96rem and padding 1.5rem, and MarkdownLayout consumes DocsNav instead of its own inline nav markup and CSS",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts",
      "test_function": "GBC-016-section-index-layout-source-contract",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts -t GBC-016-section-index-layout-source-contract",
      "test_tier": "unit",
      "verification_service": "Real filesystem read of apps/docs/src/layouts/SectionIndexLayout.astro, apps/docs/src/components/DocsNav.astro and apps/docs/src/layouts/MarkdownLayout.astro by vitest (no build, no server)",
      "surface_policy": null,
      "unit_test_justified": "Pure source-contract scan that only reads three .astro files from the real working tree (no runtime, no service), and it is this early task's only proof that can pass at its own close.",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "unit",
        "unit_test_justified": "Pure source-contract scan that only reads three .astro files from the real working tree (no runtime, no service), and it is this early task's only proof that can pass at its own close.",
        "verification_service": "Real filesystem read of apps/docs/src/layouts/SectionIndexLayout.astro, apps/docs/src/components/DocsNav.astro and apps/docs/src/layouts/MarkdownLayout.astro by vitest (no build, no server)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "SectionIndexLayout.astro is an empty stub, or a static page shell that never composes PageHeader, SectionHeader or DocsNav",
            "MarkdownLayout keeps its inline docs-nav markup and CSS, leaving 2 copies of the nav",
            "the Toc import is added back to the section-index layout"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "section_index_source",
            "action": {
              "actor": "test_runner",
              "steps": [
                "read the three files from the real working tree",
                "match their imports, template tags and <style> declarations"
              ]
            },
            "end_state": {
              "must_observe": [
                "SectionIndexLayout.astro imports 'DocsLayout', 'PageHeader', 'SectionHeader' and 'DocsNav', and its template holds exactly 1 '<slot' (the default slot)",
                "SectionIndexLayout.astro's root element carries 'data-section-index' and its <style> declares 'grid-template-columns: 1fr', 'max-width: 96rem' and 'padding: 1.5rem'",
                "SectionIndexLayout.astro sets a 2-track 'grid-template-columns' only inside '@media (min-width: 64rem)'",
                "DocsNav.astro contains 'data-docs-nav', 'aria-label=\"Documentation\"' and the '.docs-nav__list' styles",
                "MarkdownLayout.astro imports DocsNav from '../components/DocsNav.astro' and contains 0 'docs-nav__list' literals"
              ],
              "must_not_observe": [
                "an import of 'Toc.astro' in SectionIndexLayout.astro",
                "a '<script' tag in SectionIndexLayout.astro or DocsNav.astro",
                "a hex literal matching '#[0-9a-fA-F]{3,8}' or a raw 'rgb(' / 'oklch(' color in either new file",
                "an empty SectionIndexLayout.astro with 0 '<slot' tags"
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
      "description": "/guides has h1 'Guides', '.section-header h2' 'All guides' with a sibling '.chip' '5', exactly 5 rows inside '[data-section-index]', and 0 'On this page' navs",
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
      "description": "/changelog has h1 'Changelog', h2 'Releases', rows '/changelog/0.2.1', '/changelog/0.2.0', '/changelog/0.1.0' in DOM order inside '[data-section-index]', and 0 'On this page' navs",
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
      "description": "/guides has 0 'On this page' navs and 0 '.toc__nav' elements while holding exactly 5 rows",
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
      "description": "at 393px wide, '[data-section-index]' has exactly 1 grid track, the docs nav holds a link >= 44px tall, and the page has 0px horizontal overflow",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "/changelog has exactly 1 docs nav whose group titles are 'Getting started', 'Guides', 'Porting' in order, each with >= 1 link",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-5"
    },
    {
      "id": "TC-6",
      "type": "test_criterion",
      "primary": false,
      "description": "SectionIndexLayout.astro composes DocsLayout, PageHeader, SectionHeader and DocsNav plus 1 slot with no Toc import, and MarkdownLayout.astro consumes DocsNav with 0 inline 'docs-nav__list' literals",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts",
      "test_function": "GBC-016-section-index-layout-source-contract",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts -t GBC-016-section-index-layout-source-contract",
      "test_tier": "unit",
      "verification_service": "Real filesystem read of apps/docs/src/layouts/SectionIndexLayout.astro, apps/docs/src/components/DocsNav.astro and apps/docs/src/layouts/MarkdownLayout.astro by vitest (no build, no server)",
      "surface_policy": null,
      "maps_to_ac": "AC-6"
    }
  ]
}
-->

## Handoff

```json
{
  "task": "GBC-016",
  "commit_sha": "4022ddf1e8c4204b1fba73994e497f3912ce5e13",
  "done": "Landed the shared section-index visual shell: apps/docs/src/layouts/SectionIndexLayout.astro (DocsLayout > data-section-index grid with a DocsNav aside and a main holding PageHeader, SectionHeader with count Chip, and exactly one default slot for the consuming page's <IndexList rows={...} />; 1fr single-column below lg, 2-track sidebar only inside @media (min-width: 64rem), max-width 96rem / padding 1.5rem, no Toc, zero JS, tokens only), apps/docs/src/components/DocsNav.astro (the docs-section nav extracted from MarkdownLayout verbatim \u2014 markup, SECTION_LABELS, and all .docs-nav__* CSS including the 44px targets), MarkdownLayout.astro rewritten to compose <DocsNav nav={nav} currentId={id} /> (net -58 lines, 0 docs-nav__ literals left), and tests/sprint-06-guides-boundary-changelog/section-index-layout-source.test.ts (AC-6, RED captured first); proven at close by the source contract, a real-render harness through the real Astro compiler + SSR with the real IndexList slotted in, and the real docs build with the extraction verified in dist HTML and bundled CSS.",
  "deviations": [
    "No fallow exemption commit was made: the pre-authorized remediation was conditional, and pnpm check:fallow passes clean because fallow treats apps/docs/src/layouts/ as an entry surface (only components/ files orphan \u2014 which is why IndexList.astro alone needed seeding), so .fallowrc.json is untouched.",
    "SectionIndexLayout renders no <meta name=\"description\"> head slot: the contract's \"exactly 1 '<slot'\" MUST_OBSERVE forbids the Fragment slot=\"head\" pattern MarkdownLayout uses, so the description reaches the visitor only through PageHeader's visible <p>.",
    "The prop surface was invented, not pinned by the task file: title / description / sectionTitle / anchor (required, SectionHeader demands one) / count (optional \u2014 AC-2's changelog SectionHeader asserts no Chip) / nav, with DocsNav's currentId omitted because a section index is not a docs entry."
  ],
  "concerns": [
    "Five vitest failures exist on main at 15f1236e independent of this work (stash proof committed at .tmp/GBC-016/cycle-1/green/fail-repro-3-stashed.txt): ORI-AST-001 x3 in tests/sprint-05-orient-search/docs-collection.test.ts, SHELL-002 in tests/sprint-02-shell-hero/shell-layout.test.ts, and REF-006 in tests/sprint-04-generated-reference/data-table-contract.test.ts \u2014 GBC-008/GBC-010 reviewers must not attribute these to the section-index shell.",
    "Running the full vitest suite in one bounded window is hazardous: it exceeds 30 minutes (docs-build drills) and a kill mid-drill leaves tracked data files deleted (apps/docs/src/data/dev-client-matrix.json, token-usage.json) and generated ones gone until git checkout -- apps/docs/src/data/ plus a prebuild regen \u2014 I hit and repaired exactly this.",
    "The Astro dev client transform modernizes '@media (min-width: 64rem)' to '(width >= 64rem)' in compiled CSS, so any future source-level check that greps rendered CSS for the authored literal will false-fail (the GBC-008/GBC-010 Playwright specs are safe \u2014 they assert computed gridTemplateColumns).",
    "Vitest 4 swallows console.log from passing tests in non-TTY runs, so contract tests whose evidence type is stdout need --disableConsoleIntercept on the command, not just the task file's bare VERIFY line.",
    "DocsNav's CSS now ships as a shared chunk (_astro/docs-navigation.*.css) linked from built pages rather than inline, which is fine for every current spec but changes what 'the nav's styles are on the page' means for future dist-grepping assertions."
  ],
  "findings": [
    "Fallow's orphan window only exists for apps/docs/src/components/, not layouts/ or pages/ \u2014 GBC-008 and GBC-010 will compose SectionIndexLayout from real pages, so they have no orphan problem at all and should not touch .fallowrc.json.",
    "AstroContainer.renderToString(Component, { props, slots: { default: html } }) accepts pre-rendered HTML as slot content, so future orphan render-proofs can compose two real components with no scratch wrapper file (technique captured in .tmp/GBC-016/cycle-1/green/render-harness.mjs).",
    "theming-nav-inclusion-proof.test.ts asserts on the built dist's nav[data-docs-nav] region, not on MarkdownLayout's source, so the DocsNav extraction is invisible to it by construction.",
    "The docs build's 8 external link-check warnings (edit-source links 404ing against the stale GitHub main) are pre-existing and non-fatal \u2014 0 errors \u2014 and untouched by this change.",
    "MarkdownLayout still imports the DocsSection type only for its Props.section pagefind metadata, a residual coupling worth knowing if anyone later 'simplifies' that import block."
  ],
  "scope_impact": [
    {
      "target": "GBC-010",
      "found": "SectionIndexLayout's concrete interface was invented by GBC-016, not pinned by any plan artifact",
      "change": "guides.astro should compose <SectionIndexLayout title=\"Guides\" description=\"...\" sectionTitle=\"All guides\" anchor=\"all-guides\" count={rows.length} nav={sectionNavigation(...)}> with <IndexList rows={...} /> as the child \u2014 count must be derived from the rows array because the spec asserts the Chip text equals the row count, and the h2 text must stay separate from it (no literal 'All guides (5)')"
    },
    {
      "target": "GBC-008",
      "found": "Same invented interface plus the layout renders the slot verbatim \u2014 ordering and the absent count Chip are the page's choices",
      "change": "changelog.astro should sort its collection newest-first before building rows (the layout never re-sorts) and omit count to match AC-2's Chip-free SectionHeader; /changelog/[version] pages stay on MarkdownLayout, which still renders exactly one nav[data-docs-nav] via the shared extraction"
    },
    {
      "target": "GATE:FLOW-DOCS-03-five-guides-index",
      "found": "AC-4's mobile claims depend on DocsNav's 44px min-height links and the 1fr-below-lg grid, both of which moved into the new files and are pinned by the AC-6 source contract",
      "change": "nothing in the gate itself \u2014 it will pass as written; only note that '[data-section-index]' is the div.section-index grid root and the slot content sits inside it, which is what the row-count selector keys on"
    },
    {
      "target": "ROADMAP",
      "found": "Five pre-existing vitest failures on main (proven by stash at .tmp/GBC-016/cycle-1/green/fail-repro-3-stashed.txt): ORI-AST-001 x3, SHELL-002, REF-006",
      "change": "they need an owner and a fix task before any sprint gate that runs the full suite, and until then gates should scope vitest to their own spec files rather than inheriting these reds"
    }
  ],
  "feedback": [
    "The MUST_OBSERVE \"exactly 1 '<slot'\" silently forbids the meta-description head slot that the MarkdownLayout pattern (and the task's own Pattern note pointing at it) would suggest \u2014 the task file should have stated 'no head slot' explicitly so the implementer is not choosing between an implied SEO convention and a literal contract reading.",
    "The task file never specifies SectionIndexLayout's prop surface even though two downstream tasks (GBC-008, GBC-010) must program against it \u2014 pinning the interface in the task (or in a shared design note) would remove a silent cross-task dependency on one implementer's naming choices.",
    "For unit-contract tasks whose evidence type is stdout, the VERIFY line should include vitest's --disableConsoleIntercept, because the bare command exits 0 while printing no evidence in non-TTY environments (vitest 4 behavior).",
    "The pre-authorized fallow remediation was unnecessary and the handoff's framing ('will be orphans until composed') was wrong for layouts \u2014 future handoffs should distinguish components/ (orphans, may need seeding) from layouts/ and pages/ (entry surfaces, never orphan) so implementers do not seed preemptively."
  ]
}
```
