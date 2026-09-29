================================================================================
TASK: GBC-014 - Post-integration journey proofs (docs-integrator-arc + docs-themer-arc)
================================================================================

TASK_TYPE:  TEST
STATUS:     Backlog
PRIORITY:   P0
POINTS:     5
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- drive the integrator arc: /docs/installation engine-once -> quickstart -> /registry copy -> boundary -> example app useChat
- drive the themer arc: /docs/theming token map -> live toggle -> token-customize guide -> seam pages
- assert engine choice never leaks into a URL and never resets mid-journey
- assert no short-name or relative install command appears
- follow the sprint-05 convention (navigateLocalhost over the built preview, per-test evidence JSON capture)
NEVER:
- mock the backend or stub guide/boundary/changelog content
- substitute a mock renderer
- report a journey as passing without evidence files
STRICTLY:
- navigate only via the localhost preview origin (navigateLocalhost)
- evidence written to tests/sprint-06-guides-boundary-changelog/evidence/**
- STRICTLY begin every test title in docs-integrator-arc.spec.ts with the literal journeys/docs-integrator-arc, and every test title in docs-themer-arc.spec.ts with the literal journeys/docs-themer-arc, so each locked --grep selects both of that journey's ACs.
- STRICTLY keep this TEST task's four ACs at primary:false with flow_ref:null. Journey ownership lives only in the two top-level journey_proofs records, and the four task flows stay owned by their spec writers (GBC-003, GBC-008, GBC-009, GBC-010).
- STRICTLY run each journey only through its locked run_cmd, byte for byte, with no added --project, --retries, --workers or replacement --grep.
- MUST keep TDD red_first: write both specs first, then capture each journey's real failing run at its canonical proof.red by running the locked run_cmd against an isolated checkout of the sprint-06 base commit, where /guides answers 404 and the header carries 2 links. Record GREEN on the integrated candidate in run.json.
- MUST prove each AC's negative control on an isolated copy of the real source (for example NAV_LINKS cut to 2 entries, the TabGroup rnr-engine write removed, or SEAM_LINK_TARGETS reverted to /docs/theming#): the same locked command fails there and passes on the restored candidate. Never edit apps/docs/src in the task worktree.
- NEVER skip a journey step. /docs/quickstart exists on main (apps/docs/src/content/docs/quickstart.mdx), so the skip-with-reason escape in Dependencies does not apply; an unmet prerequisite blocks the task instead.

## Specification
Objective: Prove the two cross-UC journeys end-to-end over the integrated site so the sprint can sign off on the full surface.
Success state: pnpm e2e:docs exits 0 with both journey specs passing and evidence files written.

## Acceptance Criteria
### AC-1: docs-integrator-arc completes end to end, header sections included
  GIVEN: the fully integrated site built by the ordered docs build, and a fresh browser context with empty storage and clipboard access
  WHEN:  a visitor picks uniwind once on /docs/installation, walks /docs/quickstart, copies the conversation command on /registry, reads the boundary page's example-app section, and uses the header's section links
  THEN:  every step returns 200, every install command shown or copied names an absolute https://rnraielements.com/r/ URL, and the header (desktop) or drawer (mobile) carries Components, Registry, Guides, Porting and Changelog, each answering 200
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop and Pixel 5 projects) with real browser storage and clipboard
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts
  TEST_FUNCTION: journeys/docs-integrator-arc
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc --project=chromium-desktop --project=chromium-mobile
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["the boundary page's example-app anchor is removed or left as a '#' placeholder", "an install command is emitted with a short item name such as 'add conversation', or a relative '/r/' path, instead of an absolute https URL", 'NAV_LINKS on an isolated source copy is cut back to the 2 pre-sprint entries: the locked command must fail there and pass on the restored candidate']
        EVIDENCE: file_artifact
        - START_REF: integrated_docs_integrator
          ACTION: ['In the chromium-desktop project, navigateLocalhost to /docs/installation, record the status, and click the first [role="tab"][data-engine="uniwind"] inside main', 'Go to /docs/quickstart, record the status, and read the code text of the first uniwind install panel', 'Go to /registry, count tr[data-filter-text] rows, click the uniwind copy button in tr[id="row-conversation"], and read navigator.clipboard.readText()', "Go to /docs/owns-vs-does-not-own, find the td that contains 'useChat', and read the text and href of the anchor whose text matches /example app/i", "Collect every code text that starts with 'npx @react-native-reusables/cli' on the 4 pages and check every token after 'add'", 'Read the 5 anchors in .site-header__nav and call page.request.get on each href', 'Write the statuses, commands, clipboard text and hrefs to evidence/journeys/docs-integrator-arc/run.json']
          MUST_OBSERVE: ["HTTP 200 at each of '/docs/installation', '/docs/quickstart', '/registry' and '/docs/owns-vs-does-not-own'", "the first uniwind panel on /docs/quickstart shows 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json'", 'exactly 56 tr[data-filter-text] rows on /registry', "the clipboard equals 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json'", "'useChat' inside a td on /docs/owns-vs-does-not-own, and exactly 1 anchor matching /example app/i whose href contains 'apps/example'", "every token after 'add' in every collected install command starts with 'https://rnraielements.com/r/' and ends with '.json'", "exactly 5 anchors in .site-header__nav with hrefs '/components', '/registry', '/guides', '/porting', '/changelog', each answering 200 to page.request.get"]
          MUST_NOT_OBSERVE: ['a 404 at any of the 4 journey pages or the 5 header hrefs', "an install command whose argument is a short name such as 'conversation' or a relative path such as '/r/uniwind/conversation.json'", 'an empty clipboard, or the nativewind command on the clipboard after the uniwind pick', 'only 2 header anchors, the pre-sprint start state']
        - START_REF: integrated_docs_integrator
          ACTION: ['In the chromium-mobile project (Pixel 5 viewport), repeat the installation pick, the quickstart read, the /registry copy and the boundary read from the desktop case, recording each status', 'Assert .site-header__nav is hidden, click summary.site-drawer__toggle, and read the text and href of every anchor in .site-drawer__nav', 'Call page.request.get on each of the 5 drawer hrefs and record each status', 'Append the mobile observations to evidence/journeys/docs-integrator-arc/run.json']
          MUST_OBSERVE: ["HTTP 200 at each of '/docs/installation', '/docs/quickstart', '/registry' and '/docs/owns-vs-does-not-own'", "the clipboard equals 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json'", "exactly 5 anchors in .site-drawer__nav, text in order 'Components', 'Registry', 'Guides', 'Porting', 'Changelog', hrefs in order '/components', '/registry', '/guides', '/porting', '/changelog'", 'page.request.get returns status 200 for 5 of 5 drawer hrefs']
          MUST_NOT_OBSERVE: ['only 2 drawer anchors, the pre-sprint start state', 'an empty clipboard, or a short-name or relative install command', 'a 404 at any journey page or drawer href']

### AC-2: Engine choice never leaks into a URL and never resets
  GIVEN: the integrator arc in a fresh context, where the default engine is 'nativewind'
  WHEN:  the visitor picks uniwind once on /docs/installation and then navigates across 5 pages
  THEN:  no visited URL carries engine state, and 'rnr-engine' storage, the root data-engine attribute and the selected tab all stay 'uniwind' on every page
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop and Pixel 5 projects) with real browser storage and clipboard
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts
  TEST_FUNCTION: journeys/docs-integrator-arc
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc --project=chromium-desktop --project=chromium-mobile
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["the TabGroup rnr-engine write is removed on an isolated source copy, so the pick is not persisted and /docs/quickstart reverts to 'nativewind'", 'the engine is encoded as a query parameter or path segment instead of in storage']
        EVIDENCE: file_artifact
        - START_REF: integrated_docs_integrator
          ACTION: ["In each of the 2 projects of the locked run_cmd, open a fresh context and navigateLocalhost to /docs/installation, then read localStorage 'rnr-engine' and html data-engine before any click", 'Click the uniwind tab in the first rnr-tab-group inside main', 'Visit /docs/quickstart, /registry, /docs/owns-vs-does-not-own and /guides in that order', 'On each of the 5 pages, record page.url(), localStorage \'rnr-engine\', document.documentElement.dataset.engine, and the aria-selected value of the first [role="tab"][data-engine="uniwind"] where the page has one', 'Append the records to evidence/journeys/docs-integrator-arc/run.json']
          MUST_OBSERVE: ["before the click, 'rnr-engine' is null and html data-engine is 'nativewind'", "after the click, localStorage 'rnr-engine' equals 'uniwind' on 5 of 5 pages", "html data-engine equals 'uniwind' on 5 of 5 pages", "the first uniwind tab has aria-selected 'true' on '/docs/quickstart' and '/registry' with 0 further clicks", "0 of 5 recorded URLs contain 'engine', 'uniwind' or 'nativewind'"]
          MUST_NOT_OBSERVE: ['any recorded URL with an engine query parameter, fragment or path segment', "html data-engine back at the default 'nativewind' on any page after the pick", "'rnr-engine' null or empty after the pick"]

### AC-3: docs-themer-arc completes end to end
  GIVEN: the fully integrated site and a fresh chromium-desktop context with colorScheme 'light' and no stored theme
  WHEN:  a themer reads the /docs/theming token map, flips the theme with the header toggle, then follows the header's Guides link to the re-theme guide
  THEN:  the TokenTable swatches flip live without a reload, a reload paints dark from the first frame, and /guides and /guides/re-theme answer 200 with the guide carrying '@theme' and 'oklch'
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop with the real theme toggle, computed styles and link navigation
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts
  TEST_FUNCTION: journeys/docs-themer-arc
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc --project=chromium-desktop
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the TokenTable swatch is a static hardcoded color that ignores the theme class', 'the pre-paint theme script is removed on an isolated source copy, so the first reload frame paints light before switching', 'the Guides header link or the /guides/re-theme route is absent, so the arc stops at a 404']
        EVIDENCE: file_artifact
        - START_REF: integrated_docs_themer
          ACTION: ['Register an init script that records the html class list at the first animation frame of each document', 'navigateLocalhost to /docs/theming, record the status, count tr[data-token] rows, and read the computed background-color of tr[data-token="background"] [data-swatch]', 'Click button[aria-label="Toggle dark and light theme"] once, then re-read the swatch, the html class list and localStorage \'rnr-theme\' without reloading', "Reload /docs/theming and read the first recorded frame's html class list", "Click the header anchor with href '/guides' and record the status, then click the anchor with href '/guides/re-theme' and record its status and article text", 'Write the observations to evidence/journeys/docs-themer-arc/run.json']
          MUST_OBSERVE: ["HTTP 200 at '/docs/theming' with at least 10 tr[data-token] rows", "the background swatch computes to 'oklch(1 0 0)' before the toggle and 'oklch(0.145 0 0)' after 1 click, with 0 reloads in between", "after the click, html has class 'dark' and localStorage 'rnr-theme' equals 'dark'", "the first recorded frame after the reload already carries class 'dark'", "HTTP 200 at '/guides' and at '/guides/re-theme', with html still carrying class 'dark' on both", "the /guides/re-theme article text contains the literals '@theme' and 'oklch'"]
          MUST_NOT_OBSERVE: ["a swatch still at 'oklch(1 0 0)' after the toggle, the stale start state", "a first reload frame without class 'dark', which is a flash", '0 tr[data-token] rows, an empty TokenTable', "a 404 at '/guides' or '/guides/re-theme'"]

### AC-4: Seam links resolve on seam-using pages
  GIVEN: the integrated site, where the sources of /components/message carry both the renderMarkdown and the TextClassContext seams
  WHEN:  the themer follows each seam Callout link from /components/message
  THEN:  each link lands on /guides/customize-rendering with status 200, and that page holds the matching section id
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop with the real theme toggle, computed styles and link navigation
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts
  TEST_FUNCTION: journeys/docs-themer-arc
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc --project=chromium-desktop
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["SEAM_LINK_TARGETS still points at '/docs/theming#', so the Callouts never reach the guide", 'the customize-rendering guide omits one seam section, so its fragment id is absent']
        EVIDENCE: file_artifact
        - START_REF: integrated_docs_themer
          ACTION: ['navigateLocalhost to /components/message and record the status', "Count aside.callout anchors with href '/guides/customize-rendering#rendermarkdown' and with href '/guides/customize-rendering#textclasscontext'", "Click the renderMarkdown seam link, wait for pathname '/guides/customize-rendering', record page.request.get status for that href, and count elements with id 'rendermarkdown'", "Return to /components/message, click the TextClassContext seam link, and record the pathname, the status and the count of elements with id 'textclasscontext'", 'Append the observations to evidence/journeys/docs-themer-arc/run.json']
          MUST_OBSERVE: ["HTTP 200 at '/components/message'", "exactly 1 aside.callout anchor with href '/guides/customize-rendering#rendermarkdown' and exactly 1 with href '/guides/customize-rendering#textclasscontext'", "both clicks land on pathname '/guides/customize-rendering' with status 200", "exactly 1 element with id 'rendermarkdown' and exactly 1 with id 'textclasscontext' on the guide"]
          MUST_NOT_OBSERVE: ['0 seam Callout links on /components/message, the empty start state', "any seam link still pointing at '/docs/theming#rendermarkdown' or '/docs/theming#textclasscontext'", "a 404 at '/guides/customize-rendering'"]

## Test Criteria
- TC-1: On chromium-desktop and chromium-mobile, the integrator arc returns 200 at all 4 pages, /registry holds 56 rows, the clipboard equals 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json', every install-command argument starts with 'https://rnraielements.com/r/', and the header or drawer carries the 5 section hrefs, each answering 200.  (maps_to: AC-1)
- TC-2: After 1 uniwind pick, 'rnr-engine' and html data-engine equal 'uniwind' on 5 of 5 pages, and 0 visited URLs contain 'engine', 'uniwind' or 'nativewind'.  (maps_to: AC-2)
- TC-3: The background swatch flips from 'oklch(1 0 0)' to 'oklch(0.145 0 0)' on 1 toggle click without a reload, the first reload frame carries class 'dark', and /guides and /guides/re-theme answer 200 with '@theme' and 'oklch' in the guide.  (maps_to: AC-3)
- TC-4: Both seam Callout links on /components/message land on /guides/customize-rendering with status 200, and each matching section id exists exactly once.  (maps_to: AC-4)

## Reading List
- tests/sprint-05-orient-search/boundary-content.spec.ts
- tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts
- tests/sprint-05-orient-search/registry-ledger-controls.spec.ts
- tests/harness/docs-preview.ts
- playwright.config.ts

## Guardrails
WRITE-ALLOWED:
- tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/evidence/journeys/docs-integrator-arc/run.json (NEW)
- tests/sprint-06-guides-boundary-changelog/evidence/journeys/docs-integrator-arc/proof.red (NEW)
- tests/sprint-06-guides-boundary-changelog/evidence/journeys/docs-themer-arc/run.json (NEW)
- tests/sprint-06-guides-boundary-changelog/evidence/journeys/docs-themer-arc/proof.red (NEW)
WRITE-PROHIBITED:
- apps/docs/src/** (specs assert the built site; they never edit it)
- tests/sprint-01..05/** (prior lanes are frozen)

## Design
References: ['tests/sprint-05-orient-search/boundary-content.spec.ts (evidence capture convention)', 'tests/harness/docs-preview.ts (navigateLocalhost + waitForAstroPageLoad)']
Interaction notes: Both journeys are post-integration: they only pass once the full surface (UC-DOCS-01..06, GEND-03/04/07, SHELL-01/03) is present. They follow the sprint-05 evidence-capture convention (per-test JSON under evidence/).
Pattern: Cross-UC journey spec over the real built dist with per-test evidence capture (tests/sprint-05-orient-search/boundary-content.spec.ts)
Anti-pattern: Mock renderer or stubbed content standing in for the integrated site

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc --project=chromium-desktop --project=chromium-mobile
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc --project=chromium-desktop

## Dependencies
Depends on: ['GBC-001', 'GBC-003', 'GBC-008', 'GBC-009', 'GBC-010', 'GBC-013']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-014",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "integrated_docs_integrator": {
      "description": "The fully integrated sprint-06 candidate, built by the real ordered docs build (pnpm --filter @rnr-ai-elements/docs build: registry:build, gallery:manifest, the prebuild gates, the snippet check, astro build, the search index and check:links) and served by the Playwright-owned astro preview at http://localhost:4321. Each case opens a fresh browser context with empty localStorage, and clipboard-read plus clipboard-write granted for that origin.",
      "seed_method": "cli",
      "records": [
        "/docs/installation and /docs/quickstart each render an rnr-tab-group engine group whose first tab is 'nativewind', the default, and whose second tab is 'uniwind'.",
        "/registry renders 56 tr[data-filter-text] rows generated from public/r, and row-conversation carries a uniwind copy button whose command is 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json'.",
        "/docs/owns-vs-does-not-own renders GBC-003's ownership tables, with 'useChat' in a table cell and 1 example-app anchor pointing at apps/example.",
        "Header.astro NAV_LINKS holds Components, Registry, Guides, Porting and Changelog, mapped by both the desktop nav and the <details> drawer."
      ]
    },
    "integrated_docs_themer": {
      "description": "The same integrated candidate, build and preview, opened in a fresh chromium-desktop context with colorScheme 'light' and empty localStorage, so no 'rnr-theme' is stored and the page starts light.",
      "seed_method": "cli",
      "records": [
        "/docs/theming renders the TokenTable with at least 10 tr[data-token] rows. The 'background' row's light value is 'oklch(1 0 0)' and its dark value is 'oklch(0.145 0 0)'.",
        "The header's ThemeToggle island exposes button[aria-label=\"Toggle dark and light theme\"].",
        "/guides links the re-theme guide at /guides/re-theme, whose body contains '@theme' and 'oklch'.",
        "apps/docs/src/lib/seam-map.ts SEAM_LINK_TARGETS points at '/guides/customize-rendering#rendermarkdown' and '/guides/customize-rendering#textclasscontext', and the sources of /components/message carry both seams."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the fully integrated site built by the ordered docs build, and a fresh browser context with empty storage and clipboard access WHEN a visitor picks uniwind once on /docs/installation, walks /docs/quickstart, copies the conversation command on /registry, reads the boundary page's example-app section, and uses the header's section links THEN every step returns 200, every install command shown or copied names an absolute https://rnraielements.com/r/ URL, and the header (desktop) or drawer (mobile) carries Components, Registry, Guides, Porting and Changelog, each answering 200",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts",
      "test_function": "journeys/docs-integrator-arc",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc --project=chromium-desktop --project=chromium-mobile",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop and Pixel 5 projects) with real browser storage and clipboard",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop and Pixel 5 projects) with real browser storage and clipboard",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the boundary page's example-app anchor is removed or left as a '#' placeholder",
            "an install command is emitted with a short item name such as 'add conversation', or a relative '/r/' path, instead of an absolute https URL",
            "NAV_LINKS on an isolated source copy is cut back to the 2 pre-sprint entries: the locked command must fail there and pass on the restored candidate"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "integrated_docs_integrator",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "In the chromium-desktop project, navigateLocalhost to /docs/installation, record the status, and click the first [role=\"tab\"][data-engine=\"uniwind\"] inside main",
                "Go to /docs/quickstart, record the status, and read the code text of the first uniwind install panel",
                "Go to /registry, count tr[data-filter-text] rows, click the uniwind copy button in tr[id=\"row-conversation\"], and read navigator.clipboard.readText()",
                "Go to /docs/owns-vs-does-not-own, find the td that contains 'useChat', and read the text and href of the anchor whose text matches /example app/i",
                "Collect every code text that starts with 'npx @react-native-reusables/cli' on the 4 pages and check every token after 'add'",
                "Read the 5 anchors in .site-header__nav and call page.request.get on each href",
                "Write the statuses, commands, clipboard text and hrefs to evidence/journeys/docs-integrator-arc/run.json"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP 200 at each of '/docs/installation', '/docs/quickstart', '/registry' and '/docs/owns-vs-does-not-own'",
                "the first uniwind panel on /docs/quickstart shows 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json'",
                "exactly 56 tr[data-filter-text] rows on /registry",
                "the clipboard equals 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json'",
                "'useChat' inside a td on /docs/owns-vs-does-not-own, and exactly 1 anchor matching /example app/i whose href contains 'apps/example'",
                "every token after 'add' in every collected install command starts with 'https://rnraielements.com/r/' and ends with '.json'",
                "exactly 5 anchors in .site-header__nav with hrefs '/components', '/registry', '/guides', '/porting', '/changelog', each answering 200 to page.request.get"
              ],
              "must_not_observe": [
                "a 404 at any of the 4 journey pages or the 5 header hrefs",
                "an install command whose argument is a short name such as 'conversation' or a relative path such as '/r/uniwind/conversation.json'",
                "an empty clipboard, or the nativewind command on the clipboard after the uniwind pick",
                "only 2 header anchors, the pre-sprint start state"
              ]
            }
          },
          {
            "start_ref": "integrated_docs_integrator",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "In the chromium-mobile project (Pixel 5 viewport), repeat the installation pick, the quickstart read, the /registry copy and the boundary read from the desktop case, recording each status",
                "Assert .site-header__nav is hidden, click summary.site-drawer__toggle, and read the text and href of every anchor in .site-drawer__nav",
                "Call page.request.get on each of the 5 drawer hrefs and record each status",
                "Append the mobile observations to evidence/journeys/docs-integrator-arc/run.json"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP 200 at each of '/docs/installation', '/docs/quickstart', '/registry' and '/docs/owns-vs-does-not-own'",
                "the clipboard equals 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json'",
                "exactly 5 anchors in .site-drawer__nav, text in order 'Components', 'Registry', 'Guides', 'Porting', 'Changelog', hrefs in order '/components', '/registry', '/guides', '/porting', '/changelog'",
                "page.request.get returns status 200 for 5 of 5 drawer hrefs"
              ],
              "must_not_observe": [
                "only 2 drawer anchors, the pre-sprint start state",
                "an empty clipboard, or a short-name or relative install command",
                "a 404 at any journey page or drawer href"
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
      "description": "GIVEN the integrator arc in a fresh context, where the default engine is 'nativewind' WHEN the visitor picks uniwind once on /docs/installation and then navigates across 5 pages THEN no visited URL carries engine state, and 'rnr-engine' storage, the root data-engine attribute and the selected tab all stay 'uniwind' on every page",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts",
      "test_function": "journeys/docs-integrator-arc",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc --project=chromium-desktop --project=chromium-mobile",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop and Pixel 5 projects) with real browser storage and clipboard",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop and Pixel 5 projects) with real browser storage and clipboard",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the TabGroup rnr-engine write is removed on an isolated source copy, so the pick is not persisted and /docs/quickstart reverts to 'nativewind'",
            "the engine is encoded as a query parameter or path segment instead of in storage"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "integrated_docs_integrator",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "In each of the 2 projects of the locked run_cmd, open a fresh context and navigateLocalhost to /docs/installation, then read localStorage 'rnr-engine' and html data-engine before any click",
                "Click the uniwind tab in the first rnr-tab-group inside main",
                "Visit /docs/quickstart, /registry, /docs/owns-vs-does-not-own and /guides in that order",
                "On each of the 5 pages, record page.url(), localStorage 'rnr-engine', document.documentElement.dataset.engine, and the aria-selected value of the first [role=\"tab\"][data-engine=\"uniwind\"] where the page has one",
                "Append the records to evidence/journeys/docs-integrator-arc/run.json"
              ]
            },
            "end_state": {
              "must_observe": [
                "before the click, 'rnr-engine' is null and html data-engine is 'nativewind'",
                "after the click, localStorage 'rnr-engine' equals 'uniwind' on 5 of 5 pages",
                "html data-engine equals 'uniwind' on 5 of 5 pages",
                "the first uniwind tab has aria-selected 'true' on '/docs/quickstart' and '/registry' with 0 further clicks",
                "0 of 5 recorded URLs contain 'engine', 'uniwind' or 'nativewind'"
              ],
              "must_not_observe": [
                "any recorded URL with an engine query parameter, fragment or path segment",
                "html data-engine back at the default 'nativewind' on any page after the pick",
                "'rnr-engine' null or empty after the pick"
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
      "description": "GIVEN the fully integrated site and a fresh chromium-desktop context with colorScheme 'light' and no stored theme WHEN a themer reads the /docs/theming token map, flips the theme with the header toggle, then follows the header's Guides link to the re-theme guide THEN the TokenTable swatches flip live without a reload, a reload paints dark from the first frame, and /guides and /guides/re-theme answer 200 with the guide carrying '@theme' and 'oklch'",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts",
      "test_function": "journeys/docs-themer-arc",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc --project=chromium-desktop",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop with the real theme toggle, computed styles and link navigation",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop with the real theme toggle, computed styles and link navigation",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the TokenTable swatch is a static hardcoded color that ignores the theme class",
            "the pre-paint theme script is removed on an isolated source copy, so the first reload frame paints light before switching",
            "the Guides header link or the /guides/re-theme route is absent, so the arc stops at a 404"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "integrated_docs_themer",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "Register an init script that records the html class list at the first animation frame of each document",
                "navigateLocalhost to /docs/theming, record the status, count tr[data-token] rows, and read the computed background-color of tr[data-token=\"background\"] [data-swatch]",
                "Click button[aria-label=\"Toggle dark and light theme\"] once, then re-read the swatch, the html class list and localStorage 'rnr-theme' without reloading",
                "Reload /docs/theming and read the first recorded frame's html class list",
                "Click the header anchor with href '/guides' and record the status, then click the anchor with href '/guides/re-theme' and record its status and article text",
                "Write the observations to evidence/journeys/docs-themer-arc/run.json"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP 200 at '/docs/theming' with at least 10 tr[data-token] rows",
                "the background swatch computes to 'oklch(1 0 0)' before the toggle and 'oklch(0.145 0 0)' after 1 click, with 0 reloads in between",
                "after the click, html has class 'dark' and localStorage 'rnr-theme' equals 'dark'",
                "the first recorded frame after the reload already carries class 'dark'",
                "HTTP 200 at '/guides' and at '/guides/re-theme', with html still carrying class 'dark' on both",
                "the /guides/re-theme article text contains the literals '@theme' and 'oklch'"
              ],
              "must_not_observe": [
                "a swatch still at 'oklch(1 0 0)' after the toggle, the stale start state",
                "a first reload frame without class 'dark', which is a flash",
                "0 tr[data-token] rows, an empty TokenTable",
                "a 404 at '/guides' or '/guides/re-theme'"
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
      "description": "GIVEN the integrated site, where the sources of /components/message carry both the renderMarkdown and the TextClassContext seams WHEN the themer follows each seam Callout link from /components/message THEN each link lands on /guides/customize-rendering with status 200, and that page holds the matching section id",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts",
      "test_function": "journeys/docs-themer-arc",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc --project=chromium-desktop",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop with the real theme toggle, computed styles and link navigation",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop with the real theme toggle, computed styles and link navigation",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "SEAM_LINK_TARGETS still points at '/docs/theming#', so the Callouts never reach the guide",
            "the customize-rendering guide omits one seam section, so its fragment id is absent"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "integrated_docs_themer",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "navigateLocalhost to /components/message and record the status",
                "Count aside.callout anchors with href '/guides/customize-rendering#rendermarkdown' and with href '/guides/customize-rendering#textclasscontext'",
                "Click the renderMarkdown seam link, wait for pathname '/guides/customize-rendering', record page.request.get status for that href, and count elements with id 'rendermarkdown'",
                "Return to /components/message, click the TextClassContext seam link, and record the pathname, the status and the count of elements with id 'textclasscontext'",
                "Append the observations to evidence/journeys/docs-themer-arc/run.json"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP 200 at '/components/message'",
                "exactly 1 aside.callout anchor with href '/guides/customize-rendering#rendermarkdown' and exactly 1 with href '/guides/customize-rendering#textclasscontext'",
                "both clicks land on pathname '/guides/customize-rendering' with status 200",
                "exactly 1 element with id 'rendermarkdown' and exactly 1 with id 'textclasscontext' on the guide"
              ],
              "must_not_observe": [
                "0 seam Callout links on /components/message, the empty start state",
                "any seam link still pointing at '/docs/theming#rendermarkdown' or '/docs/theming#textclasscontext'",
                "a 404 at '/guides/customize-rendering'"
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
      "description": "On chromium-desktop and chromium-mobile, the integrator arc returns 200 at all 4 pages, /registry holds 56 rows, the clipboard equals 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json', every install-command argument starts with 'https://rnraielements.com/r/', and the header or drawer carries the 5 section hrefs, each answering 200.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts",
      "test_function": "journeys/docs-integrator-arc",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc --project=chromium-desktop --project=chromium-mobile",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop and Pixel 5 projects) with real browser storage and clipboard",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "After 1 uniwind pick, 'rnr-engine' and html data-engine equal 'uniwind' on 5 of 5 pages, and 0 visited URLs contain 'engine', 'uniwind' or 'nativewind'.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts",
      "test_function": "journeys/docs-integrator-arc",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc --project=chromium-desktop --project=chromium-mobile",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop and Pixel 5 projects) with real browser storage and clipboard",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "The background swatch flips from 'oklch(1 0 0)' to 'oklch(0.145 0 0)' on 1 toggle click without a reload, the first reload frame carries class 'dark', and /guides and /guides/re-theme answer 200 with '@theme' and 'oklch' in the guide.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts",
      "test_function": "journeys/docs-themer-arc",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc --project=chromium-desktop",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop with the real theme toggle, computed styles and link navigation",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "Both seam Callout links on /components/message land on /guides/customize-rendering with status 200, and each matching section id exists exactly once.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts",
      "test_function": "journeys/docs-themer-arc",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts --grep journeys/docs-themer-arc --project=chromium-desktop",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium desktop with the real theme toggle, computed styles and link navigation",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    }
  ]
}
-->
