================================================================================
TASK: GBC-010 - /guides section-index page (capped at five)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: 2e7cfd9c34d401749909557631118bc68f198c48
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

## Handoff

```json
{
  "task": "GBC-010",
  "commit_sha": "2e7cfd9c34d401749909557631118bc68f198c48",
  "done": "GBC-010 \u5728\u5de5\u4f5c\u6811\u5206\u652f\u4e0a\u4ee5\u4e24\u4e2a\u63d0\u4ea4\u5b8c\u6210\uff1ab494d87c \u5f15\u5165\u4e86 apps/docs/src/pages/guides/index.astro\uff08\u5206\u533a\u7d22\u5f15\u5b8c\u5168\u6d3e\u751f\u81ea\u5171\u4eab docs-navigation \u53d1\u5e03\u5951\u7ea6\uff0c\u7531 SectionIndexLayout + IndexList \u4ee5\u53ca count={rows.length} \u7ec4\u5408\uff0c\u65e0\u786c\u7f16\u7801\u6807\u9898/href\uff0c\u65e0 ToC \u680f\uff0c\u96f6 JS\uff09\u4ee5\u53ca tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts\uff08\u5305\u542b 15 \u4e2a\u5e26\u6709 FLOW-DOCS-03-five-guides-index \u524d\u7f00\u7684\u6d4b\u8bd5\uff1a\u62e5\u6709 AC-1..3 \u4ee5\u53ca GBC-001/AC-1..4, GBC-002/AC-1..2, GBC-009/AC-1, GBC-015/AC-1,3, GBC-016/AC-1,3,4\uff0c\u5916\u52a0\u5305\u542b .tmp/GBC-010/cycle-1 \u548c\u5df2\u63d0\u4ea4\u7684 evidence/FLOW-DOCS-03-five-guides-index/{run.json,proof.red} \u7684 RED/GREEN \u8bc1\u636e\uff09\uff0c\u5e76\u4e14 2e7cfd9c \u6839\u636e surface lint \u4fee\u590d\u4e86 cycle-1 \u7684\u5ba1\u67e5\u7ed3\u679c\uff1bgoverned run_flow \u62a5\u544a exit=0 artifact_fresh=True surface_ok=True coldboot_ok=True red_proof_ok=True\uff0c\u9501\u5b9a\u7684\u9a8c\u8bc1\u901a\u8fc7\u4e86 45/45 \u6d4b\u8bd5\uff080 \u5931\u8d25/\u8df3\u8fc7\uff0c\u8de8 chromium-desktop/mobile/nojs\uff09\uff0c\u5e76\u4e14 orchestrator \u5c06\u8be5\u5de5\u4f5c\u5408\u5e76\u5230\u4e86 main \u5206\u652f\uff0c\u63d0\u4ea4\u53f7\u4e3a 91463b5860903bd534dbcdbe75f6820dff1565e6\u3002",
  "deviations": [],
  "concerns": [
    "\u7aef\u53e3 4321 \u7684\u7ade\u4e89\u5c06\u5728 GBC-013/GBC-014 \u4e2d\u518d\u6b21\u53d1\u751f\uff1a\u88ab SIGKILL \u6740\u6b7b\u7684 Playwright \u8fd0\u884c\u4f1a\u9057\u7559\u4e00\u4e2a\u5b64\u7acb\u7684 astro preview \u8fdb\u7a0b\uff0c\u8be5\u8fdb\u7a0b\u4f1a\u4ee5 404 \u62d2\u7edd\u5176\u4ed6\u4efb\u52a1\u7684\u6b63\u786e\u8def\u7531\uff08\u6211\u7684\u7b2c\u4e8c\u6b21 GREEN \u8fd0\u884c\u56e0\u6b64\u5931\u8d25\uff1bGBC-006 \u4e5f\u9057\u7559\u4e86\u4e00\u4e2a\uff0c\u6211\u5728\u9a8c\u8bc1\u76d1\u542c\u5668 cwd \u540e\u5c06\u5176\u6740\u6b7b\u4e86\uff09\uff0c\u56e0\u6b64\u5982\u679c\u51fa\u73b0\u5305\u542b ERR_CONNECTION_REFUSED \u4ee5\u53ca\u95f4\u6b47\u6027 404 \u7684\u5931\u8d25\u8fd0\u884c\uff0c\u5e94\u9996\u5148\u6392\u67e5\u662f\u5426\u4e3a\u7aef\u53e3\u6cc4\u9732\u3002",
    "spec \u7684 STATUS_DIR \u805a\u5408\u4e86\u76ee\u5f55\u4e2d\u7684\u6bcf\u4e2a\u72b6\u6001\u6587\u4ef6\uff0c\u56e0\u6b64\u5728\u4e2d\u6b62\u6216\u90e8\u5206\u8fd0\u884c\u540e\u4ea7\u751f\u7684\u8fc7\u65f6\u72b6\u6001\u6587\u4ef6\u53ef\u80fd\u4f1a\u5e72\u6270 run.json \u7684\u8ba1\u6570\uff0c\u9664\u975e\u5148\u5220\u9664\u8be5\u76ee\u5f55 \u2014\u2014 \u6211\u5728\u6bcf\u6b21\u8fd0\u884c\u524d\u90fd\u6267\u884c\u4e86 rm -rf \u64cd\u4f5c\uff0c\u540e\u7eed\u91cd\u65b0\u8fd0\u884c\u7684\u4eba\u5fc5\u987b\u7ee7\u627f\u8fd9\u4e00\u505a\u6cd5\u3002",
    "\u5982\u679c\u6709\u4eba\u91cd\u65b0\u6355\u83b7 FLOW-DOCS-03 \u7684 RED\uff0cRED \u5c06\u59cb\u7ec8\u663e\u793a 45 \u4e2a\u6d4b\u8bd5\u4e2d\u7684 44 \u4e2a\u5931\u8d25\uff0c\u56e0\u4e3a GBC-001/AC-3 \u7684\u58f0\u660e\u4ece\u672a\u89e6\u53ca /guides \u7d22\u5f15\uff1b\u8fd9\u662f\u9884\u671f\u7684\uff0c\u800c\u4e0d\u662f RED \u6355\u83b7\u7684\u7f3a\u9677\u3002"
  ],
  "findings": [
    "e2e surface lint \u4f1a\u7981\u6b62 expect+5 \u7a97\u53e3\u5185\u7684\u88f8 generic-root locator \u5b57\u9762\u91cf\uff08body/html/main/document\uff09\uff1b\u89e3\u51b3\u65b9\u6cd5\u662f\u5c06\u8bfb\u53d6\u64cd\u4f5c\u63d0\u5347\u5230\u6d4b\u8bd5\u7684\u9996\u6b21 expect \u4e4b\u4e0a\u4f5c\u4e3a const \u2014\u2014 \u53c2\u89c1 guides-index.spec.ts:533 \u548c guides-index.spec.ts:755 \u2014\u2014 \u8fd9\u662f\u9002\u7528\u4e8e\u672c sprint \u4e2d\u6bcf\u4e2a\u672a\u6765 spec \u7684 sprint-05 orientation-content \u6a21\u5f0f\u3002",
    "Playwright 1.63 \u5c06 locator.evaluate \u7684\u5b57\u7b26\u4e32\u5f62\u5f0f\uff08\u4f8b\u5982 'element => ...'\uff09\u89c6\u4e3a\u4ece\u672a\u8c03\u7528\u7684\u8868\u8fbe\u5f0f\uff08\u63a2\u6d4b\u5230\uff1a\u8fd4\u56de undefined\uff09\uff0c\u800c IIFE \u5b57\u7b26\u4e32\u5f62\u5f0f\u53ef\u4ee5\u5de5\u4f5c\uff1b\u8be5 repo \u514d tsc-DOM \u7684\u4e60\u60ef\u7528\u6cd5\u662f\u4f7f\u7528\u901a\u8fc7 el.ownerDocument.defaultView \u5230\u8fbe getComputedStyle \u7684\u51fd\u6570\u5f62\u5f0f\u56de\u8c03 \u2014\u2014 \u53c2\u89c1 guides-index.spec.ts GBC-015/AC-3 \u548c GBC-016/AC-4 \u6d4b\u8bd5 \u2014\u2014 \u6587\u6863\u7ea7\u522b\u7684\u8bfb\u53d6\u4f7f\u7528 IIFE \u5b57\u7b26\u4e32\u3002",
    "page.evaluate \u5728 javaScriptEnabled:false \u4e0b\u53ef\u4ee5\u5de5\u4f5c\uff08\u811a\u672c\u6267\u884c\u7981\u7528\u4ec5\u505c\u6b62\u9875\u9762\u811a\u672c\uff0c\u800c\u4e0d\u505c\u6b62 CDP \u8bc4\u4f30\uff09\uff0c\u56e0\u6b64\u8ba1\u7b97\u6837\u5f0f\u548c scrollWidth \u65ad\u8a00\u5728 chromium-nojs \u4e0a\u662f\u53ef\u65ad\u8a00\u7684\uff1b\u53ea\u6709 waitForAstroPageLoad \u5728\u90a3\u91cc\u5fc5\u987b\u88ab\u8df3\u8fc7\uff0c\u56e0\u4e3a astro:page-load \u6c38\u8fdc\u4e0d\u4f1a\u89e6\u53d1\u3002",
    "Astro v7 \u7684 compressHTML \u4f1a\u53bb\u9664\u5757\u7ea7\u5143\u7d20\u4e4b\u95f4\u7684\u6362\u884c\u6587\u672c\uff0c\u56e0\u6b64 pre code \u7684 textContent \u4f1a\u5c06 expressive-code \u884c\u878d\u5408\uff08\u6ca1\u6709\u6362\u884c\u6587\u672c\u8282\u70b9\uff09\uff1b\u884c\u7ea7\u4ee3\u7801\u65ad\u8a00\u5fc5\u987b\u8bfb\u53d6 pre \u7684 innerText \u2014\u2014 \u53c2\u89c1 guides-index.spec.ts \u4e2d\u7684 GBC-001/AC-2 \u2014\u2014 \u4e14\u5757\u8303\u56f4\u7684\u6b63\u6587\u8bfb\u53d6\u5e94\u4f7f\u7528 main.innerText()\uff08\u8f85\u52a9\u51fd\u6570\u4f4d\u4e8e guides-index.spec.ts:127\uff09\uff0c\u8fd9\u4e5f\u80fd\u5c06\u4fa7\u8fb9\u680f/ToC \u7684 aside \u6392\u9664\u5728\u5916\u3002",
    "\u6392\u67e5\u9a8c\u8bc1\uff08Bash \u63a2\u6d4b\uff0c\u7ea6 30 \u79d2\uff09\u5728\u7f16\u5199\u7ea6 800 \u884c spec \u4e4b\u524d\u6355\u83b7\u4e86\u4e24\u4e2a\u6f5c\u5728\u7684\u8fd0\u884c\u65f6\u9677\u9631\uff1b\u5728 run_flow \u5468\u671f\u4e4b\u524d\u8fdb\u884c\u9488\u5bf9\u6027\u884c\u7684\u5ec9\u4ef7\u8fd0\u884c\u53ef\u4ee5\u907f\u514d\u6d6a\u8d39\u5b8c\u6574\u7684\u6784\u5efa+45\u4e2a\u6d4b\u8bd5\u5faa\u73af\u3002",
    " GBC-002 \u548c GBC-011 \u7684\u534f\u8c03\u5458\u8f6c\u8fbe\u4e8b\u5b9e\u5747\u5df2\u9a8c\u8bc1\u5e76\u7eb3\u5165\uff1atroubleshooting \u7684\u5165\u53e3 h2 \u8ba1\u6570\u9650\u5b9a\u5728 main\uff08\u4fa7\u8fb9\u680f aside \u5305\u542b 3 \u4e2a h2\uff0c7 \u4e2a\u9875\u9762\u8303\u56f4 vs 4 \u4e2a main\uff09\uff0c/docs/installation \u9875\u9762\u8303\u56f4\u5185\u7684 'at least 1' /guides/troubleshooting \u951a\u70b9\u6210\u7acb\uff0c\u5e76\u4e14 FLOW-DOCS-03 \u9501\u5b9a\u7684 run_cmd \u5728\u6bcf\u6b21 Playwright \u8fd0\u884c\u524d\u91cd\u5efa dist\uff0c\u56e0\u6b64 guides-cap \u7684 dist-drill \u65e0\u6cd5\u6cc4\u6f0f\u5230\u8fd9\u4e2a Playwright-lane spec \u4e2d\u3002"
  ],
  "scope_impact": [
    {
      "target": "GBC-013",
      "found": "\u4efb\u52a1\u8fde\u63a5\u9875\u7709/\u9875\u811a\u5bfc\u822a\uff0c\u4f46\u6ca1\u6709\u7f16\u7801\u9488\u5bf9 expect \u7a97\u53e3\u5185\u7981\u6b62\u7684\u88f8 generic-root locator \u6216 Playwright 1.63 \u7684 string-evaluate \u9677\u9631\u7684 e2e surface-lint \u89c4\u5219\u3002",
      "change": "\u5f53\u8fdb\u884c\u89c4\u5212\u65f6\uff0c\u6dfb\u52a0\u4e00\u884c\u5b9e\u73b0\u8bf4\u660e\uff1a\u5c06 main/body/html/document locator \u8bfb\u53d6\u63d0\u5347\u5230 const \u4e2d\uff0c\u7f6e\u4e8e\u9996\u6b21 expect \u4e4b\u524d\uff0c\u5e76\u5728 no-DOM-lib tsconfig \u4e0b\u4f7f\u7528 el.ownerDocument.defaultView \u7f16\u5199\u8ba1\u7b97\u6837\u5f0f/\u6eda\u52a8\u68c0\u67e5\uff08\u51fd\u6570\u5f62\u5f0f\uff09\uff0cIIFE \u5b57\u7b26\u4e32\u4ec5\u7528\u4e8e\u6587\u6863\u7ea7\u522b\u8bfb\u53d6\u3002"
    },
    {
      "target": "GBC-014",
      "found": "\u96c6\u6210\u540e\u6d41\u7a0b\u8bc1\u660e\u5c06\u9a71\u52a8\u6307\u5357/\u5206\u533a\u7d22\u5f15\u548c\u7ec4\u4ef6\u9875\u9762\uff0c\u5176\u4e2d\u76f8\u540c\u7684 surface-lint \u548c evaluate \u4e60\u60ef\u7528\u6cd5\u9002\u7528\uff0c\u4e14 FLOW-DOCS-03 \u7684 spec\uff08\u800c\u975e vitest\uff09\u73b0\u5728\u62e5\u6709 12 \u4e2a\u65e9\u671f AC \u58f0\u660e\uff0c\u4efb\u4f55 journey spec \u90fd\u4e0d\u5f97\u91cd\u590d\u8fd9\u4e9b\u58f0\u660e\u3002",
      "change": "\u6dfb\u52a0\u4e00\u4e2a\u8bf4\u660e\uff0c\u5373 journey \u8bc1\u660e\u5fc5\u987b\u907f\u514d\u91cd\u65b0\u58f0\u660e\u7531 guides-index.spec.ts \u627f\u8f7d\u7684 FLOW-DOCS-03 early-AC \u89c2\u5bdf\uff0c\u5e76\u9075\u5faa\u76f8\u540c\u7684 hoist/evaluate \u4e60\u60ef\u7528\u6cd5\uff1b\u672a\u6765\u4efb\u4f55 flow \u7684\u91cd\u65b0 RED \u9884\u671f\u90fd\u4f1a\u6709\u4e00\u4e2a\u5408\u6cd5\u7684\u901a\u8fc7\u6d4b\u8bd5\uff08GBC-001/AC-3\uff09\uff0c\u5176\u58f0\u660e\u4e0d\u4f9d\u8d56\u4e8e index\u3002"
    }
  ],
  "feedback": [
    "\u5468\u671f\u4e2d\u7684\u4e24\u4e2a\u534f\u8c03\u5458\u8f6c\u8fbe\uff08GBC-002 \u7684 DOM \u4e8b\u5b9e\uff0cGBC-011 \u7684 dist \u6c61\u67d3\u8b66\u544a\uff09\u7cbe\u786e\u3001\u53ca\u65f6\uff0c\u5e76\u9632\u6b62\u4e86\u9519\u8bef\u7684\u7f16\u7801\uff1b\u5982\u679c\u5728\u540c\u7ea7\u7684 task-close \u65f6\u523b\u7ee7\u7eed\u4fdd\u6301\u8fd9\u79cd\u8f6c\u8fbe\u6a21\u5f0f\uff0c\u5c06\u80fd\u6355\u83b7\u6574\u7c7b\u8de8\u4efb\u52a1\u7684\u7f16\u7801\u9519\u8bef\u3002",
    "surface-lint \u53d1\u73b0\u4ec5\u5728\u5ba1\u67e5\u540e\u51fa\u73b0\uff0c\u5e76\u8017\u8d39\u4e86\u4e00\u4e2a\u5b8c\u6574\u7684\u5468\u671f\uff1b\u5982\u679c\u5b9e\u73b0\u7684\u9a8c\u8bc1\u95e8\uff08\u6216\u9884\u63d0\u4ea4 hook\uff09\u5728 run_flow \u4e4b\u524d\u8fd0\u884c e2e_surface_check\uff0cGBC-010 \u7684 cycle 2 \u5c06\u662f\u4e0d\u5fc5\u8981\u7684\u3002"
  ]
}
```
