================================================================================
TASK: GBC-001 - Author the four job how-to guides (re-theme, update, preview, customize-rendering)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     5
AGENT:      planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

PROPOSED BY: techwriting-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- Author each guide in the TR-12 Guide template: 'This guide shows you how to {goal}' + prerequisites + numbered imperative steps each with an expected observable result + next steps.
- Restate engine facts exactly (Tailwind v4 + @theme → the uniwind tree; Tailwind v3 → the nativewind tree, NativeWind 4.2.6) with no inversion; link out to /docs/theming as the token-map reference rather than duplicating it.
- Repoint apps/docs/src/lib/seam-map.ts SEAM_LINK_TARGETS to /guides/customize-rendering#rendermarkdown and #textclasscontext.
- Use section: guides frontmatter with unique order 1..4 among the non-reserved guides-section entries (GBC-002's troubleshooting guide takes order 5) so the five-guide cap and the /guides index can resolve them deterministically.
- Re-section apps/docs/src/content/docs/theming.mdx to getting-started (reserved slug keeps /docs/theming) so the five-guide cap counts exactly the five real guides.
- Name where theme tokens live per engine in the re-theme guide (@theme in global.css for the uniwind tree vs the config-token path for the nativewind tree — theming.mdx is the reference).
- Name the four dev-client opt-in items (or link the DevClientMatrix) inside the preview guide's Expo Go scope.
- Cover both renderMarkdown call sites (message and reasoning) in the customize-rendering guide.
- Re-run the sprint-05 e2e lane that asserts seam Callout targets after the seam-map repoint, before merge.
NEVER:
- Never author a sixth guide or a guide for engine choice or porting (Installation and /porting own those).
- Never hand-type a code snippet that is not extracted from or typechecked against a real file (apps/example or the registry).
- Never change apps/docs/src/content.config.ts, apps/docs/src/pages/**, or the registry source.
- Never present a stub, placeholder, or 'coming soon' as a complete how-to.
- Never print 'nativewind v3' or 'NativeWind 3' as version claims — v3 is the Tailwind major on that path (NativeWind is 4.2.6).
- Never describe registry version pinning — the registry publishes unversioned URLs; document the CLI's existing-file overwrite prompt in update-installed-items instead.
STRICTLY:
- Strictly keep the token-map reference on /docs/theming; the re-theme guide links, it does not copy.
- Strictly use the literal absolute-URL add form in update-installed-items (T-DOCS-012).
- Strictly document both renderMarkdown and TextClassContext in customize-rendering (T-DOCS-026).
- UNIT_TEST_JUSTIFIED: AC-5 and AC-6 are pure string scans over local markdown and TypeScript source with zero I/O beyond reading files, so unit tests are justified.
- NEVER edit tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts: GBC-010 writes it, and AC-1 to AC-4 are proven when GBC-010 closes, not at this task's close.
- STRICTLY keep guides-content.test.ts read-only over the authored files (no build, no network, no browser).

## Specification
Objective: Four complete how-to guides under apps/docs/src/content/docs/guides/ that serve the re-theme, update, preview, and customize-rendering jobs, plus the seam-link retarget.
Success state: A visitor opens /guides and each of /guides/re-theme, /guides/update-installed-items, /guides/preview-on-device, /guides/customize-rendering returns 200 with a complete how-to; component-page seam Callouts target the customize-rendering guide.

## Acceptance Criteria
### AC-1: re-theme guide renders as a complete how-to
  GIVEN: GIVEN GBC-010's guides-index spec has landed, and the authored re-theme guide is built into the real preview
  WHEN:  a visitor opens /guides/re-theme
  THEN:  the page returns 200 with a complete how-to containing oklch and @theme, and it is listed on the /guides index
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the guide route is disconnected from its markdown source and renders an empty shell', 'the guide body is a stub with no oklch or @theme text', 'the /guides index does not link /guides/re-theme']
        EVIDENCE: file_artifact
        - START_REF: authored_guides_candidate
          ACTION: ['goto /guides/re-theme and record the response status', 'read the guide body text and count the goal sentences', 'goto /guides and list the anchors inside [data-index-list]']
          MUST_OBSERVE: ['HTTP status 200 at /guides/re-theme', "the literal strings 'oklch' and '@theme' each appear at least 1 time in the guide body", "exactly 1 sentence starting with the literal 'This guide shows you how to'", "at least 1 anchor with href '/docs/theming' in the guide body (link out, token map not copied)", "exactly 1 anchor with href '/guides/re-theme' inside [data-index-list] on /guides"]
          MUST_NOT_OBSERVE: ["0 occurrences of 'oklch' (empty-shell start state)", "any occurrence of 'coming soon' or 'TODO' in the guide body", 'a second /guides/re-theme anchor inside [data-index-list]']

### AC-2: update guide carries the literal absolute-URL add
  GIVEN: GIVEN GBC-010's guides-index spec has landed, and the authored update-installed-items guide is built into the real preview
  WHEN:  a visitor opens /guides/update-installed-items
  THEN:  the page contains the literal npx @react-native-reusables/cli@latest add command in absolute-URL form
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the add command is absent, short-name, relative, or templated after page load', 'the command is rendered only by client JavaScript (fails the no-JS project)']
        EVIDENCE: file_artifact
        - START_REF: authored_guides_candidate
          ACTION: ['goto /guides/update-installed-items and record the response status', "read every <pre><code> block and collect lines that contain 'add'", 'repeat the read under the chromium-nojs project']
          MUST_OBSERVE: ['HTTP status 200 at /guides/update-installed-items', "at least 1 code line containing the literal 'npx @react-native-reusables/cli@latest add'", "that line contains a URL matching https://rnraielements.com/r/{engine}/{item}.json where {engine} is 'nativewind' or 'uniwind'", "exactly 1 sentence starting with the literal 'This guide shows you how to'", "under the chromium-nojs project, at least 1 <pre><code> line still contains the literal 'npx @react-native-reusables/cli@latest add' followed by a URL matching https://rnraielements.com/r/{engine}/{item}.json"]
          MUST_NOT_OBSERVE: ["an add line whose argument is a bare short name such as 'add button'", "an add line whose URL starts with '/' or './' (relative URL)"]

### AC-3: customize-rendering documents both seams and is the seam target
  GIVEN: GIVEN GBC-010's guides-index spec has landed, and the authored customize-rendering guide and the repointed seam-map are built into the real preview
  WHEN:  a visitor opens /guides/customize-rendering and a component page that carries a seam Callout
  THEN:  the guide documents renderMarkdown and TextClassContext, and the seam Callouts link the guide
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the guide omits one seam, so an id is missing', 'seam-map.ts still points at /docs/theming#, so the rendered Callout hrefs are stale']
        EVIDENCE: file_artifact
        - START_REF: authored_guides_candidate
          ACTION: ['goto /guides/customize-rendering and record the response status', "count elements with id 'rendermarkdown' and id 'textclasscontext'", 'goto the message component page and collect anchors inside its seam Callout']
          MUST_OBSERVE: ['HTTP status 200 at /guides/customize-rendering', "exactly 1 element with id 'rendermarkdown' and exactly 1 element with id 'textclasscontext'", "the guide body mentions 'message' and 'reasoning' as the 2 renderMarkdown call sites", "at least 1 anchor on the message page with href '/guides/customize-rendering#rendermarkdown'", "exactly 1 sentence starting with the literal 'This guide shows you how to'"]
          MUST_NOT_OBSERVE: ["any anchor with href '/docs/theming#rendermarkdown'", "any anchor with href '/docs/theming#textclasscontext'"]

### AC-4: preview guide reachable and Expo Go-scoped
  GIVEN: GIVEN GBC-010's guides-index spec has landed, and the authored preview-on-device guide is built into the real preview
  WHEN:  a visitor reaches the guide from the /guides index
  THEN:  the page returns 200 and documents previewing on device via Expo Go
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the guide is not linked from /guides', "the guide body never says 'Expo Go'", 'a dev-client-only item is described as an Expo Go preview']
        EVIDENCE: file_artifact
        - START_REF: authored_guides_candidate
          ACTION: ["goto /guides and click the anchor with href '/guides/preview-on-device' inside [data-index-list]", 'record the response status and read the guide body text', 'search the body for the four opt-in package names']
          MUST_OBSERVE: ['HTTP status 200 at /guides/preview-on-device after the click from /guides', "the literal 'Expo Go' appears at least 2 times in the guide body", "each of the 4 literal names 'react-native-enriched-markdown', 'react-native-streamdown', 'expo-speech-recognition' and 'expo-audio' appears at least 1 time, or the body holds 1 anchor to the DevClientMatrix", "exactly 1 sentence starting with the literal 'This guide shows you how to'"]
          MUST_NOT_OBSERVE: ["a sentence that pairs 'Expo Go' with 'react-native-enriched-markdown' as supported", 'a 404 on the click from /guides']

### AC-5: guides restate engine facts without inversion
  GIVEN: GIVEN the four authored guide files
  WHEN:  a vitest source scan reads their engine statements
  THEN:  Tailwind v4 + @theme pairs with the uniwind tree and Tailwind v3 with the nativewind tree (NativeWind 4.2.6), with no inverted claim
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: The check is a pure text scan of 4 authored markdown files with zero I/O beyond reading them, so no service is involved.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-content.test.ts
  TEST_FUNCTION: engine facts pair Tailwind majors with the right tree
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-content.test.ts

### AC-6: guide sources carry frontmatter, goal sentence and seam targets
  GIVEN: GIVEN the four authored guide files, theming.mdx and seam-map.ts
  WHEN:  a vitest source scan reads them
  THEN:  the guides carry section: guides with orders 1, 2, 3 and 4, each has exactly one sentence starting 'This guide shows you how to', theming.mdx is section: getting-started, and SEAM_LINK_TARGETS points at /guides/customize-rendering#rendermarkdown and #textclasscontext
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Frontmatter values, one literal sentence and two literal URL targets are pure string checks over local files with no I/O beyond reading them.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-content.test.ts
  TEST_FUNCTION: guide frontmatter, goal sentence and seam targets
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-content.test.ts

## Test Criteria
- TC-1: /guides/re-theme returns 200, contains oklch and @theme, and is listed once inside [data-index-list] on /guides.  (maps_to: AC-1)
- TC-2: /guides/update-installed-items contains the literal 'npx @react-native-reusables/cli@latest add' with an absolute https://rnraielements.com/r/{engine}/{item}.json URL.  (maps_to: AC-2)
- TC-3: /guides/customize-rendering has ids rendermarkdown and textclasscontext, and the message page seam link targets /guides/customize-rendering#rendermarkdown.  (maps_to: AC-3)
- TC-4: /guides/preview-on-device returns 200, says 'Expo Go', and names the four opt-in items or links the DevClientMatrix.  (maps_to: AC-4)
- TC-5: No guide file pairs Tailwind v4 + @theme with 'nativewind tree', pairs Tailwind v3 with 'uniwind', or prints 'nativewind v3' or 'NativeWind 3'.  (maps_to: AC-5)
- TC-6: The four guides have section: guides with orders {1,2,3,4}, one goal sentence each, theming.mdx is getting-started, and SEAM_LINK_TARGETS holds both customize-rendering anchors.  (maps_to: AC-6)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — Guide template, terminology lock, snippet/link gates
- AGENTS.md [PRIMARY] — engine-parity contract, Expo Go vs dev-client split, and the warning that the RNR Rosetta theming.md documents the Nativewind path and misleads
- apps/docs/src/content/docs/installation.mdx — canonical engine phrasing to copy (NativeWind 4.2.6 pairs with Tailwind v3)
- apps/docs/src/content/docs/theming.mdx — token map and the two seams the guides reference
- apps/docs/src/content/docs/dark-mode.md — existing getting-started prose style to imitate
- apps/docs/src/content.config.ts — section/order frontmatter schema the guide files must satisfy
- apps/docs/src/lib/seam-map.ts — SEAM_LINK_TARGETS the task repoints

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/guides/re-theme.md (NEW)
- apps/docs/src/content/docs/guides/update-installed-items.md (NEW)
- apps/docs/src/content/docs/guides/preview-on-device.md (NEW)
- apps/docs/src/content/docs/guides/customize-rendering.md (NEW)
- apps/docs/src/lib/seam-map.ts (MODIFY)
- apps/docs/src/content/docs/theming.mdx (MODIFY)
- tests/sprint-06-guides-boundary-changelog/guides-content.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/content.config.ts
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md', '.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: Guides render at /guides/[slug] via the astro-owned route (not the /docs catch-all); the index uses IndexList + SectionHeader (frontend-designer). This task authors the manuscripts only.
Pattern: how-to quadrant: 'This guide shows you how to {goal}' + prerequisites + numbered imperative steps with expected results + next steps (.spec/prds/docs-site/11-technical-requirements/12-content-standards.md)
Anti-pattern: prose walls without steps; duplicating the Theming token map; engine-choice or porting content smuggled into the guides section

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-content.test.ts

## Dependencies
Depends on: ['GBC-009']
Blocks:     ['GBC-002', 'GBC-006', 'GBC-008', 'GBC-010', 'GBC-011', 'GBC-014']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-001",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "authored_guides_candidate": {
      "description": "The four authored guide manuscripts enter the real docs content build. The ordered docs build produces the dist that the Playwright-owned astro preview serves at http://localhost:4321. Each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/guides/re-theme.md, update-installed-items.md, preview-on-device.md and customize-rendering.md are authored with section: guides and order 1..4.",
        "apps/docs/src/lib/seam-map.ts SEAM_LINK_TARGETS points at /guides/customize-rendering#rendermarkdown and #textclasscontext.",
        "apps/docs/src/content/docs/theming.mdx is re-sectioned to getting-started and keeps /docs/theming.",
        "GBC-009's section-aware guides route and GBC-010's /guides index are built from the same candidate."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-010's guides-index spec has landed, and the authored re-theme guide is built into the real preview WHEN a visitor opens /guides/re-theme THEN the page returns 200 with a complete how-to containing oklch and @theme, and it is listed on the /guides index",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the guide route is disconnected from its markdown source and renders an empty shell",
            "the guide body is a stub with no oklch or @theme text",
            "the /guides index does not link /guides/re-theme"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /guides/re-theme and record the response status",
                "read the guide body text and count the goal sentences",
                "goto /guides and list the anchors inside [data-index-list]"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /guides/re-theme",
                "the literal strings 'oklch' and '@theme' each appear at least 1 time in the guide body",
                "exactly 1 sentence starting with the literal 'This guide shows you how to'",
                "at least 1 anchor with href '/docs/theming' in the guide body (link out, token map not copied)",
                "exactly 1 anchor with href '/guides/re-theme' inside [data-index-list] on /guides"
              ],
              "must_not_observe": [
                "0 occurrences of 'oklch' (empty-shell start state)",
                "any occurrence of 'coming soon' or 'TODO' in the guide body",
                "a second /guides/re-theme anchor inside [data-index-list]"
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
      "description": "GIVEN GIVEN GBC-010's guides-index spec has landed, and the authored update-installed-items guide is built into the real preview WHEN a visitor opens /guides/update-installed-items THEN the page contains the literal npx @react-native-reusables/cli@latest add command in absolute-URL form",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the add command is absent, short-name, relative, or templated after page load",
            "the command is rendered only by client JavaScript (fails the no-JS project)"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /guides/update-installed-items and record the response status",
                "read every <pre><code> block and collect lines that contain 'add'",
                "repeat the read under the chromium-nojs project"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /guides/update-installed-items",
                "at least 1 code line containing the literal 'npx @react-native-reusables/cli@latest add'",
                "that line contains a URL matching https://rnraielements.com/r/{engine}/{item}.json where {engine} is 'nativewind' or 'uniwind'",
                "exactly 1 sentence starting with the literal 'This guide shows you how to'",
                "under the chromium-nojs project, at least 1 <pre><code> line still contains the literal 'npx @react-native-reusables/cli@latest add' followed by a URL matching https://rnraielements.com/r/{engine}/{item}.json"
              ],
              "must_not_observe": [
                "an add line whose argument is a bare short name such as 'add button'",
                "an add line whose URL starts with '/' or './' (relative URL)"
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
      "description": "GIVEN GIVEN GBC-010's guides-index spec has landed, and the authored customize-rendering guide and the repointed seam-map are built into the real preview WHEN a visitor opens /guides/customize-rendering and a component page that carries a seam Callout THEN the guide documents renderMarkdown and TextClassContext, and the seam Callouts link the guide",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the guide omits one seam, so an id is missing",
            "seam-map.ts still points at /docs/theming#, so the rendered Callout hrefs are stale"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /guides/customize-rendering and record the response status",
                "count elements with id 'rendermarkdown' and id 'textclasscontext'",
                "goto the message component page and collect anchors inside its seam Callout"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /guides/customize-rendering",
                "exactly 1 element with id 'rendermarkdown' and exactly 1 element with id 'textclasscontext'",
                "the guide body mentions 'message' and 'reasoning' as the 2 renderMarkdown call sites",
                "at least 1 anchor on the message page with href '/guides/customize-rendering#rendermarkdown'",
                "exactly 1 sentence starting with the literal 'This guide shows you how to'"
              ],
              "must_not_observe": [
                "any anchor with href '/docs/theming#rendermarkdown'",
                "any anchor with href '/docs/theming#textclasscontext'"
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
      "description": "GIVEN GIVEN GBC-010's guides-index spec has landed, and the authored preview-on-device guide is built into the real preview WHEN a visitor reaches the guide from the /guides index THEN the page returns 200 and documents previewing on device via Expo Go",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the guide is not linked from /guides",
            "the guide body never says 'Expo Go'",
            "a dev-client-only item is described as an Expo Go preview"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /guides and click the anchor with href '/guides/preview-on-device' inside [data-index-list]",
                "record the response status and read the guide body text",
                "search the body for the four opt-in package names"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /guides/preview-on-device after the click from /guides",
                "the literal 'Expo Go' appears at least 2 times in the guide body",
                "each of the 4 literal names 'react-native-enriched-markdown', 'react-native-streamdown', 'expo-speech-recognition' and 'expo-audio' appears at least 1 time, or the body holds 1 anchor to the DevClientMatrix",
                "exactly 1 sentence starting with the literal 'This guide shows you how to'"
              ],
              "must_not_observe": [
                "a sentence that pairs 'Expo Go' with 'react-native-enriched-markdown' as supported",
                "a 404 on the click from /guides"
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
      "description": "GIVEN GIVEN the four authored guide files WHEN a vitest source scan reads their engine statements THEN Tailwind v4 + @theme pairs with the uniwind tree and Tailwind v3 with the nativewind tree (NativeWind 4.2.6), with no inverted claim",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-content.test.ts",
      "test_function": "engine facts pair Tailwind majors with the right tree",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "The check is a pure text scan of 4 authored markdown files with zero I/O beyond reading them, so no service is involved.",
      "maps_to_ac": null
    },
    {
      "id": "AC-6",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the four authored guide files, theming.mdx and seam-map.ts WHEN a vitest source scan reads them THEN the guides carry section: guides with orders 1, 2, 3 and 4, each has exactly one sentence starting 'This guide shows you how to', theming.mdx is section: getting-started, and SEAM_LINK_TARGETS points at /guides/customize-rendering#rendermarkdown and #textclasscontext",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-content.test.ts",
      "test_function": "guide frontmatter, goal sentence and seam targets",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Frontmatter values, one literal sentence and two literal URL targets are pure string checks over local files with no I/O beyond reading them.",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "/guides/re-theme returns 200, contains oklch and @theme, and is listed once inside [data-index-list] on /guides.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "/guides/update-installed-items contains the literal 'npx @react-native-reusables/cli@latest add' with an absolute https://rnraielements.com/r/{engine}/{item}.json URL.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "/guides/customize-rendering has ids rendermarkdown and textclasscontext, and the message page seam link targets /guides/customize-rendering#rendermarkdown.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "/guides/preview-on-device returns 200, says 'Expo Go', and names the four opt-in items or links the DevClientMatrix.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "No guide file pairs Tailwind v4 + @theme with 'nativewind tree', pairs Tailwind v3 with 'uniwind', or prints 'nativewind v3' or 'NativeWind 3'.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-content.test.ts",
      "test_function": "engine facts pair Tailwind majors with the right tree",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-5"
    },
    {
      "id": "TC-6",
      "type": "test_criterion",
      "primary": false,
      "description": "The four guides have section: guides with orders {1,2,3,4}, one goal sentence each, theming.mdx is getting-started, and SEAM_LINK_TARGETS holds both customize-rendering anchors.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-content.test.ts",
      "test_function": "guide frontmatter, goal sentence and seam targets",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-6"
    }
  ]
}
-->
