================================================================================
TASK: GBC-010 - /guides section-index page (capped at five)
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
- render a section-index with SectionHeader carrying count 5
- render IndexList rows linking the five guide destinations
- derive the guide list from the guides-section collection entries (never hardcode titles)
- omit the ToC (short page)
NEVER:
- hardcode the five guide titles or hrefs in the page
- render 4 or 6 cards
- author the IndexList primitive (design lens owns it)
STRICTLY:
- exactly five cards
- each card title matches its destination page H1
- WRITER OBLIGATION (FLOW-DOCS-03 primary, early-task policy): besides this task's own AC-1..AC-3 tests, guides-index.spec.ts contains exactly 12 other-task tests, one per final early AC bound to FLOW-DOCS-03: GBC-001/AC-1, AC-2, AC-3, AC-4; GBC-002/AC-1, AC-2; GBC-009/AC-1; GBC-015/AC-1, AC-3; GBC-016/AC-1, AC-3, AC-4. Each is titled `FLOW-DOCS-03-five-guides-index GBC-00N/AC-M <claim>` and asserts that AC's must_observe and must_not_observe as written in its own task file; the EARLY CLAIMS lines below summarize them, and the task file wins on any difference. GBC-010 cannot close until the FLOW-DOCS-03 run_cmd passes all 15 tests with 0 failed and 0 skipped on all 3 projects.
- Do NOT add tests here for GBC-001/AC-5, GBC-001/AC-6 or GBC-002/AC-3..AC-5: they are UNIT in their own tasks' vitest files, and a second copy here would give one claim two owners.
- EARLY CLAIMS, GBC-001 (4 tests): AC-1 `/guides/re-theme` responds 200; its body contains `oklch` and `@theme` at least once each, exactly 1 sentence starting `This guide shows you how to`, at least 1 anchor to `/docs/theming`, and 0 `coming soon` or `TODO`; /guides has exactly 1 `/guides/re-theme` anchor inside `[data-index-list]`. AC-2 `/guides/update-installed-items` responds 200; at least 1 `<pre><code>` line contains `npx @react-native-reusables/cli@latest add` followed by a URL matching `https://rnraielements.com/r/{nativewind|uniwind}/{item}.json`, including in the chromium-nojs run; exactly 1 goal sentence; 0 short-name adds (such as `add button`) and 0 add URLs starting `/` or `./`. AC-3 `/guides/customize-rendering` responds 200 with exactly 1 element id `rendermarkdown`, exactly 1 element id `textclasscontext`, `message` and `reasoning` both named as the renderMarkdown call sites, and exactly 1 goal sentence; `/components/message` has at least 1 anchor to `/guides/customize-rendering#rendermarkdown` and 0 anchors to `/docs/theming#rendermarkdown` or `/docs/theming#textclasscontext`. AC-4 clicking the `/guides/preview-on-device` anchor inside `[data-index-list]` on /guides lands on a 200 page whose body has `Expo Go` at least 2 times, each of `react-native-enriched-markdown`, `react-native-streamdown`, `expo-speech-recognition` and `expo-audio` at least once (or 1 anchor to the DevClientMatrix), exactly 1 goal sentence, and no sentence presenting `react-native-enriched-markdown` as supported in Expo Go.
- EARLY CLAIMS, GBC-002 (2 tests): AC-1 `/guides/troubleshooting` responds 200 with exactly 4 level-2 entry headings, exactly 4 `Symptom`, 4 `Cause` and 4 `Fix` labels, and 0 `coming soon` or `TODO`; /guides has exactly 1 `/guides/troubleshooting` anchor inside `[data-index-list]`. AC-2 the dependency-panel footer Callout on `/components/message` has exactly 1 anchor to `/guides/troubleshooting` and still exactly 1 anchor to `/registry`; `/docs/installation` has at least 1 anchor to `/guides/troubleshooting`; GET `/guides/troubleshooting` responds 200.
- EARLY CLAIMS, GBC-009/AC-1 (1 test): `/guides/re-theme`, `/guides/update-installed-items`, `/guides/preview-on-device`, `/guides/customize-rendering` and `/guides/troubleshooting` each respond 200; the 5 flat aliases `/docs/<slug>` and the 5 nested aliases `/docs/guides/<slug>` each respond 404; 5 of 5 guide-page h1 texts equal the `title` frontmatter of that guide's manuscript under `apps/docs/src/content/docs/guides/`; 0 hrefs on the 5 guide pages contain `/guides/guides/`.
- EARLY CLAIMS, GBC-015 (2 tests): AC-1 GET /guides responds 200 with exactly 1 `[data-index-list]` holding exactly 5 `[data-index-list-row]`; the 5 `a[data-index-list-title]` hrefs are exactly the five `/guides/` paths above; each `[data-index-list-description]` is non-empty and equals its destination page's `meta[name='description']` content. AC-3 each of the 5 rows has tagName `LI` and computed position `relative`, holds exactly 1 `a[data-index-list-title]` and exactly 1 `[data-index-list-description]`, has `getComputedStyle(titleAnchor, '::after').position` equal to `absolute`, and has a boundingBox height >= 44; the raw HTML of GET /guides has 0 `<a` tokens between an opening tag carrying `data-index-list-title` and its next `</a>`.
- EARLY CLAIMS, GBC-016 (3 tests): AC-1 GET /guides responds 200 with exactly 1 `h1.page-header__title` reading `Guides`, exactly 1 `.section-header h2` reading `All guides` whose sibling `.chip` reads `5` and equals the row count, exactly 5 `[data-index-list-row]` inside `[data-section-index]`, 0 `nav[aria-label='On this page']`, and no literal text `All guides (5)`. AC-3 /guides has exactly 5 `[data-index-list-row]`, 0 `nav[aria-label='On this page']` and 0 `.toc__nav`. AC-4 at a 393 px wide viewport, `[data-section-index]` computed `grid-template-columns` is exactly 1 track, `nav[data-docs-nav]` has a boundingBox width > 0 and at least 1 link with a boundingBox height >= 44, and `documentElement.scrollWidth - clientWidth` equals 0.
- Every test in guides-index.spec.ts starts its title with `FLOW-DOCS-03-five-guides-index`, so the run_cmd's --grep selects the whole file. No test.skip, test.fixme or project-conditional assertion: GBC-016/AC-4 sets its own 393 x 851 viewport (the Pixel 5 size) so it asserts on all 3 projects, and GBC-001/AC-2's no-JS read is that same test's chromium-nojs run, not a separate test.

## Specification
Objective: Publish the /guides section-index generated from the guides-section collection, listing exactly the five launch guides.
Success state: Over the built preview, /guides lists exactly 5 cards, each card title matching its destination page H1.

## Acceptance Criteria
### AC-1: Guides index lists exactly the five launch guides [PRIMARY]
  GIVEN: the five guides-section entries (GBC-001 order 1..4, GBC-002 order 5), routed at /guides/{slug} by GBC-009 and composed with GBC-015's IndexList and GBC-016's section-index layout, built by the run_cmd's own docs build
  WHEN:  a visitor opens /guides on the Playwright-owned preview at http://localhost:4321
  THEN:  the page responds 200 and lists exactly 5 IndexList rows under a SectionHeader whose count Chip reads 5, each row title equal to the h1 of the page its href opens, with no On this page ToC rail
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['index.astro hardcodes guide titles or hrefs instead of reading the guides-section collection, so a guide whose h1 changes no longer matches its row', 'the page renders an empty or static list (0 rows) or a 4- or 6-row list', 'the SectionHeader count is omitted or disconnected from the row count']
        EVIDENCE: file_artifact
        - START_REF: built_five_guides_candidate
          ACTION: ['GET http://localhost:4321/guides through the Playwright page and record the response status.', 'Count `[data-index-list-row]` elements inside `main`; read the SectionHeader h2 text and its sibling Chip text.', "For each row, read the title anchor text and href, open the href, and read the destination's `h1` text.", "Count `nav[aria-label='On this page']` elements on /guides."]
          MUST_OBSERVE: ['GET /guides responds `200`', 'exactly 5 `[data-index-list-row]` rows inside `main`', 'the SectionHeader h2 reads `All guides` and its sibling Chip text == `5`', '5 of 5 row titles equal the `h1` text of the page their href opens', "`nav[aria-label='On this page']` count on /guides == 0"]
          MUST_NOT_OBSERVE: ['an empty index (0 rows)', '4 rows or 6 rows', 'a row title that differs from its destination `h1`', 'a count Chip value other than `5`']

### AC-2: Every guides-index row opens a 200 guide page
  GIVEN: the /guides index from AC-1 with 5 rows
  WHEN:  the spec requests each row href through the preview
  THEN:  each of the 5 distinct hrefs responds 200
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a row links a removed or misspelled slug, so its href 404s', 'a row renders as static text with the href omitted']
        EVIDENCE: file_artifact
        - START_REF: built_five_guides_candidate
          ACTION: ['Collect the `href` of the title anchor in each of the 5 `[data-index-list-row]` rows on /guides.', 'Request each href through the Playwright request context against http://localhost:4321 and record its status.']
          MUST_OBSERVE: ['5 of 5 row hrefs respond `200` from http://localhost:4321', 'the 5 hrefs are 5 distinct paths starting with `/guides/`']
          MUST_NOT_OBSERVE: ['a row href responding `404`', 'a row with an empty `href` attribute', 'fewer than 5 distinct hrefs']

### AC-3: The five launch guides are the listed set
  GIVEN: the /guides index from AC-1
  WHEN:  a visitor reads the row hrefs
  THEN:  the hrefs are exactly the five launch guides (re-theme, update-installed-items, preview-on-device, customize-rendering, troubleshooting) and no engine-choice, porting or theming row appears
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['theming.mdx stays in the guides section, so a theming row appears or the set is wrong', 'a guide is omitted from the collection, leaving 4 rows']
        EVIDENCE: file_artifact
        - START_REF: built_five_guides_candidate
          ACTION: ['Collect the 5 row hrefs on /guides as a set.', 'Request `/docs/theming` through the preview and record its status.']
          MUST_OBSERVE: ['the row href set == {`/guides/re-theme`, `/guides/update-installed-items`, `/guides/preview-on-device`, `/guides/customize-rendering`, `/guides/troubleshooting`}', 'GET `/docs/theming` responds `200` and 0 row hrefs end in `/theming`']
          MUST_NOT_OBSERVE: ['a row href `/porting` or containing `engine`', 'a row for the reserved `theming` slug', 'an empty href set (0 guides)']

## Test Criteria
- TC-1: /guides responds 200 with exactly 5 `[data-index-list-row]` rows, a count Chip of 5, 0 On this page navs, and 5 of 5 row titles equal to their destination h1  (maps_to: AC-1)
- TC-2: all 5 row hrefs are distinct and respond 200  (maps_to: AC-2)
- TC-3: the row href set equals the five launch slugs and holds no porting, engine-choice or theming row  (maps_to: AC-3)
- TC-4: guides-index.spec.ts holds exactly 12 other-task tests, one per final early AC bound to FLOW-DOCS-03 (GBC-001/AC-1..AC-4, GBC-002/AC-1..AC-2, GBC-009/AC-1, GBC-015/AC-1 and AC-3, GBC-016/AC-1, AC-3 and AC-4), each titled `FLOW-DOCS-03-five-guides-index GBC-00N/AC-M ...`, and the FLOW-DOCS-03 run_cmd reports 0 failed and 0 skipped across all 15 tests (those 12 plus this task's 3) on all 3 projects  (maps_to: AC-1)

## Reading List
- apps/docs/src/pages/components/index.astro
- apps/docs/src/components/SectionHeader.astro
- apps/docs/src/lib/docs-navigation.ts
- apps/docs/src/layouts/DocsLayout.astro

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/pages/guides/index.astro (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-03-five-guides-index/run.json (NEW)
- tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-03-five-guides-index/proof.red (NEW)
WRITE-PROHIBITED:
- apps/docs/src/components/IndexList.astro (design lens owns the primitive)
- apps/docs/src/components/SectionHeader.astro (design lens owns the primitive)
- apps/docs/src/content/docs/guides/** (techwriting authors guide prose)

## Design
References: ['apps/docs/src/pages/components/index.astro (SectionHeader usage)', 'apps/docs/src/components/SectionHeader.astro']
Interaction notes: The page reads the same published guides list GBC-009 derives; it never hardcodes the five titles. IndexList and the section-index layout are the frontend-designer lens's primitives — this task composes, not authors them.
Pattern: Generated section-index composing SectionHeader + IndexList over collection entries (apps/docs/src/pages/components/index.astro)
Anti-pattern: Hardcoding the five guide titles/hrefs in the page template

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index

## Dependencies
Depends on: ['GBC-009', 'GBC-015', 'GBC-016', 'GBC-001', 'GBC-002']
Blocks:     ['GBC-013', 'GBC-014']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-010",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "built_five_guides_candidate": {
      "description": "The candidate at GBC-010's close, built by the run_cmd's own `pnpm --filter @rnr-ai-elements/docs build` segment and served by the Playwright-owned preview at http://localhost:4321: GBC-001's four guides (order 1..4) and GBC-002's troubleshooting guide (order 5) under apps/docs/src/content/docs/guides/, theming.mdx re-sectioned to getting-started, GBC-009's /guides/[slug] route, GBC-015's IndexList, GBC-016's section-index layout, and this task's apps/docs/src/pages/guides/index.astro.",
      "seed_method": "cli",
      "records": [
        "Run `pnpm --filter @rnr-ai-elements/docs build` (registry:build, gallery:manifest, prebuild gates, snippet check, astro build, search index, check:links) and keep the emitted apps/docs/dist/.",
        "CI=1 makes Playwright start its own strict-port preview; a listener already on port 4321 fails the run instead of being reused.",
        "apps/docs/src/content/docs/guides/ holds exactly re-theme, update-installed-items, preview-on-device, customize-rendering and troubleshooting, each with `section: guides`.",
        "Each guide's h1 is read from its built page at test time; the spec never types a guide title."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN the five guides-section entries (GBC-001 order 1..4, GBC-002 order 5), routed at /guides/{slug} by GBC-009 and composed with GBC-015's IndexList and GBC-016's section-index layout, built by the run_cmd's own docs build WHEN a visitor opens /guides on the Playwright-owned preview at http://localhost:4321 THEN the page responds 200 and lists exactly 5 IndexList rows under a SectionHeader whose count Chip reads 5, each row title equal to the h1 of the page its href opens, with no On this page ToC rail",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-010-1",
        "use_case_ref": "UC-DOCS-03",
        "ac_ref": "AC-1",
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "index.astro hardcodes guide titles or hrefs instead of reading the guides-section collection, so a guide whose h1 changes no longer matches its row",
            "the page renders an empty or static list (0 rows) or a 4- or 6-row list",
            "the SectionHeader count is omitted or disconnected from the row count"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-03-five-guides-index/run.json"
        },
        "cases": [
          {
            "start_ref": "built_five_guides_candidate",
            "action": {
              "actor": "user",
              "steps": [
                "GET http://localhost:4321/guides through the Playwright page and record the response status.",
                "Count `[data-index-list-row]` elements inside `main`; read the SectionHeader h2 text and its sibling Chip text.",
                "For each row, read the title anchor text and href, open the href, and read the destination's `h1` text.",
                "Count `nav[aria-label='On this page']` elements on /guides."
              ]
            },
            "end_state": {
              "must_observe": [
                "GET /guides responds `200`",
                "exactly 5 `[data-index-list-row]` rows inside `main`",
                "the SectionHeader h2 reads `All guides` and its sibling Chip text == `5`",
                "5 of 5 row titles equal the `h1` text of the page their href opens",
                "`nav[aria-label='On this page']` count on /guides == 0"
              ],
              "must_not_observe": [
                "an empty index (0 rows)",
                "4 rows or 6 rows",
                "a row title that differs from its destination `h1`",
                "a count Chip value other than `5`"
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
      "description": "GIVEN the /guides index from AC-1 with 5 rows WHEN the spec requests each row href through the preview THEN each of the 5 distinct hrefs responds 200",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-010-2",
        "use_case_ref": "UC-DOCS-03",
        "ac_ref": "AC-2",
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "a row links a removed or misspelled slug, so its href 404s",
            "a row renders as static text with the href omitted"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-03-five-guides-index/run.json"
        },
        "cases": [
          {
            "start_ref": "built_five_guides_candidate",
            "action": {
              "actor": "user",
              "steps": [
                "Collect the `href` of the title anchor in each of the 5 `[data-index-list-row]` rows on /guides.",
                "Request each href through the Playwright request context against http://localhost:4321 and record its status."
              ]
            },
            "end_state": {
              "must_observe": [
                "5 of 5 row hrefs respond `200` from http://localhost:4321",
                "the 5 hrefs are 5 distinct paths starting with `/guides/`"
              ],
              "must_not_observe": [
                "a row href responding `404`",
                "a row with an empty `href` attribute",
                "fewer than 5 distinct hrefs"
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
      "description": "GIVEN the /guides index from AC-1 WHEN a visitor reads the row hrefs THEN the hrefs are exactly the five launch guides (re-theme, update-installed-items, preview-on-device, customize-rendering, troubleshooting) and no engine-choice, porting or theming row appears",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-010-3",
        "use_case_ref": "UC-DOCS-03",
        "ac_ref": "AC-3",
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "theming.mdx stays in the guides section, so a theming row appears or the set is wrong",
            "a guide is omitted from the collection, leaving 4 rows"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-03-five-guides-index/run.json"
        },
        "cases": [
          {
            "start_ref": "built_five_guides_candidate",
            "action": {
              "actor": "user",
              "steps": [
                "Collect the 5 row hrefs on /guides as a set.",
                "Request `/docs/theming` through the preview and record its status."
              ]
            },
            "end_state": {
              "must_observe": [
                "the row href set == {`/guides/re-theme`, `/guides/update-installed-items`, `/guides/preview-on-device`, `/guides/customize-rendering`, `/guides/troubleshooting`}",
                "GET `/docs/theming` responds `200` and 0 row hrefs end in `/theming`"
              ],
              "must_not_observe": [
                "a row href `/porting` or containing `engine`",
                "a row for the reserved `theming` slug",
                "an empty href set (0 guides)"
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
      "description": "/guides responds 200 with exactly 5 `[data-index-list-row]` rows, a count Chip of 5, 0 On this page navs, and 5 of 5 row titles equal to their destination h1",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "all 5 row hrefs are distinct and respond 200",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "the row href set equals the five launch slugs and holds no porting, engine-choice or theming row",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "guides-index.spec.ts holds exactly 12 other-task tests, one per final early AC bound to FLOW-DOCS-03 (GBC-001/AC-1..AC-4, GBC-002/AC-1..AC-2, GBC-009/AC-1, GBC-015/AC-1 and AC-3, GBC-016/AC-1, AC-3 and AC-4), each titled `FLOW-DOCS-03-five-guides-index GBC-00N/AC-M ...`, and the FLOW-DOCS-03 run_cmd reports 0 failed and 0 skipped across all 15 tests (those 12 plus this task's 3) on all 3 projects",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    }
  ]
}
-->
