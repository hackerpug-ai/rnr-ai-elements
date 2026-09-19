================================================================================
TASK: FUSE-09 - CopyButton island (1/5) with zero-JS selectable-text fallback
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     bcb4cb74b448c88eefa3a95c17b03a3ac010749f
PRIORITY:   P0
POINTS:     2   # Fibonacci story points — relative size, never time
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: astro-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-01-docs-spike-skeleton

RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------

On the built site, clicking copy yields clipboard content identical to the displayed command; with javaScriptEnabled:false the command text is still present and selectable.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: the full command string always renders as selectable text content (crawlable, copyable by hand without JS)
- MUST: on click, navigator.clipboard.writeText places the exact trimmed command on the clipboard and the button shows a visible success state within 500 ms
- MUST: the script is a processed Astro <script> (bundled, TypeScript) — no is:inline, no framework import
- NEVER: never render a short-name (`add conversation`) or relative (`add /r/...`) command — absolute-URL form only
- NEVER: never add a second custom element or any client framework dependency
- NEVER: never gate content behind the island — zero-JS pages still show the full command text
- STRICTLY: Sprint-02 note: init must be re-init safe for ClientRouter soft navigation (window-guarded flag) even though the spike has no view transitions yet

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [x] AC-1: Copy places the exact command on the clipboard with a visible success state  (cycle 2: per-test nojs guard added; click tests pass in chromium-desktop/mobile, zero-JS fallback now proven by unguarded tests running in chromium-nojs itself; reviewer lane run exit 0)
- [x] AC-2: Island budget accounting: exactly one custom element, zero frameworks
- [x] every AC verify command passes (see ACCEPTANCE CRITERIA)  (cycle 2: reviewer-run `timeout 600 pnpm e2e:docs` + `pnpm exec playwright test` EXITCODE=0 — 16 passed / 5 skipped / 0 failed; skips = 3 guarded nojs + 2 pre-existing deliv)
- [x] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [x] git diff --name-only ⊆ SCOPE.writeAllowed  (product/test files only; .tmp evidence follows main convention per FUSE-05/FIX-F5-1)

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: Copy places the exact command on the clipboard with a visible success state
  GIVEN: the built site served at http://localhost:4321 with Chromium granted clipboard permissions
  WHEN:  the spec opens /islands/copy-button and clicks the copy button once
  THEN:  the clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` with no trailing newline, and the button shows a success state within 500 ms

  FLOW_REF:             FLOW-GEND-02-hero-install-command-copy
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real Astro build + astro preview server + Chromium with granted clipboard permissions
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/home.spec.ts
  TEST_FUNCTION:        FLOW-GEND-02-hero-install-command-copy
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-02-hero-install-command-copy

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real Astro build + astro preview + Chromium
    NEGATIVE_CONTROL (would fail if):
      - the island is a stub button that toggles a success class without calling navigator.clipboard (clipboard stays empty)
      - the copied string is a hardcoded echo of markup text that drifts from the displayed command
    EVIDENCE: screenshot (required_capture=true)
    CASE 1:
      START_REF: built_site
      ACTOR: e2e_runner
        - navigate to http://localhost:4321/islands/copy-button
        - click the copy button once
        - read the clipboard via granted clipboard-read permission
        - capture a screenshot of the button state
      MUST_OBSERVE: clipboard content == `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exactly, with no trailing newline
      MUST_OBSERVE: button shows a visible success state within 500 ms of the click (aria-label or data-state containing `copied`)
      MUST_NOT_OBSERVE: clipboard empty
      MUST_NOT_OBSERVE: no visible success state after the click
      MUST_NOT_OBSERVE: a trailing newline or wrap artifact in the clipboard string
    CASE 2:
      START_REF: built_site
      ACTOR: e2e_runner
        - open /islands/copy-button in the javaScriptEnabled:false project
        - read the page's code-element text content
      MUST_OBSERVE: page returns HTTP 200 with javaScriptEnabled: false
      MUST_OBSERVE: a code element's textContent equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json`
      MUST_NOT_OBSERVE: empty command text
      MUST_NOT_OBSERVE: placeholder text instead of the real command
      MUST_NOT_OBSERVE: 0 selectable command text nodes

AC-2: Island budget accounting: exactly one custom element, zero frameworks
  GIVEN: apps/docs source as authored by this task
  WHEN:  a focused test scans apps/docs/src for custom element registrations and framework imports
  THEN:  exactly one `customElements.define` call exists (`rnr-copy-button`) and no react/svelte/vue/preact/solid import appears under apps/docs/src

  TEST_TIER: unit (UNIT_TEST_JUSTIFIED: pure static source scan with no I/O beyond file reads and no runtime behavior)
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
  TEST_FUNCTION: FUSE-09-island-budget
  VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t "FUSE-09-island-budget"

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: Clicking the copy button on /islands/copy-button places `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` on the clipboard with no trailing newline.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/copy-button.spec.ts --grep 
- TC-2: The button shows a visible success state within 500 ms of the click, and with javaScriptEnabled:false the full command renders as selectable text on a 200 response.
  maps_to_ac: AC-1 | type: zero_js_fallback | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/copy-button.spec.ts --grep 
- TC-3: apps/docs/src contains exactly 1 `customElements.define` call (`rnr-copy-button`) and 0 client-framework imports.
  maps_to_ac: AC-2 | type: structural | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t "FUSE-09-island-budget"

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- apps/docs/src/components/islands/CopyButton.astro (NEW)
- apps/docs/src/scripts/copy-button.ts (NEW)
- apps/docs/src/pages/islands/copy-button.astro (NEW)
- tests/sprint-01-docs-spike-skeleton/copy-button.spec.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/home.spec.ts (NEW)

writeProhibited:
- apps/docs/src/pages/index.astro — FUSE-01 placeholder, later FUSE-08's home
- apps/docs/src/pages/registry.astro and components/** pages — wave-D tasks own them
- playwright.config.ts and root package.json — FUSE-10's
- apps/docs/src/data/** — FUSE-05's artifact
- tests/sprint-01/** — another PRD's lane

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-INST-01
provides:
- apps/docs/src/components/islands/CopyButton.astro — island 1/5 (wraps a command as selectable text + copy button)
- vanilla custom element `rnr-copy-button` registered from apps/docs/src/scripts/copy-button.ts (module script, executes once per full page load)
- spike-only proof route /islands/copy-button embedding the island around the canonical conversation command (removed at Sprint 02 when real pages exercise it everywhere)
consumes:
- FUSE-01 apps/docs package
boundary_contracts:
- Island budget: exactly five vanilla custom elements site-wide; this task adds 1/5 and registers NO other element
- E2E landmine L6: navigate only via http://localhost:4321 (secure context), grantPermissions(['clipboard-read','clipboard-write']), assert clipboard CONTENT not a success class
- E2E landmine L7: never wait on DOMContentLoaded; module scripts execute once

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md [423-439]
   Focus: island budget (CopyButton is 1/5), zero-JS fallback rule, hard UI constraints
2. .spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md [54-62]
   Focus: L6 clipboard landmine (localhost secure context, grantPermissions, assert CONTENT) and L7 module-script-once

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FUSE-09-copy-button
  Command:  pnpm playwright test  --grep 
  Expected: clipboard equals the exact conversation command in the JS project; selectable text + HTTP 200 in the javaScriptEnabled:false project
Gate 2: FUSE-09-biome
  Command:  ./node_modules/.bin/biome ci apps/docs/src/components/islands apps/docs/src/scripts apps/docs/src/pages/islands tests/sprint-01-docs-spike-skeleton/copy-button.spec.ts
  Expected: exit 0

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Ship island 1/5: a CopyButton Astro component + vanilla custom element that copies the exact displayed absolute-URL command to the clipboard with a visible success state, degrading to selectable text with zero JS.

Design notes:
- The /islands/copy-button route is the island's own proof surface because wave B runs before any real page embeds the island; Sprint 02 removes or repoints it once every page exercises CopyButton
- Success state is a data-state/aria attribute, asserted by value not by class name

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: FUSE-01
Blocks:     FUSE-06, FUSE-07, FUSE-08, FUSE-11

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-09",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_site": {
   "description": "The docs site built by the real chain (pnpm registry:build, gallery:manifest, docs build) and served by astro preview at http://localhost:4321, including the /islands/copy-button proof route.",
   "seed_method": "cli",
   "records": [
    "pnpm --filter @rnr-ai-elements/docs build exit 0 (dist/ includes /islands/copy-button/index.html)",
    "astro preview serving http://localhost:4321"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": false,
   "flow_ref": "FLOW-GEND-02-hero-install-command-copy",
   "test_file": "tests/sprint-01-docs-spike-skeleton/home.spec.ts",
   "test_function": "FLOW-GEND-02-hero-install-command-copy",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-02-hero-install-command-copy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium with granted clipboard permissions",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the island is a stub button that toggles a success class without calling navigator.clipboard (clipboard stays empty)",
      "the copied string is a hardcoded echo of markup text that drifts from the displayed command"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "navigate to http://localhost:4321/islands/copy-button",
        "click the copy button once",
        "read the clipboard via granted clipboard-read permission",
        "capture a screenshot of the button state"
       ]
      },
      "end_state": {
       "must_observe": [
        "clipboard content == `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exactly, with no trailing newline",
        "button shows a visible success state within 500 ms of the click (aria-label or data-state containing `copied`)"
       ],
       "must_not_observe": [
        "clipboard empty",
        "no visible success state after the click",
        "a trailing newline or wrap artifact in the clipboard string"
       ]
      }
     },
     {
      "start_ref": "built_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "open /islands/copy-button in the javaScriptEnabled:false project",
        "read the page's code-element text content"
       ]
      },
      "end_state": {
       "must_observe": [
        "page returns HTTP 200 with javaScriptEnabled: false",
        "a code element's textContent equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json`"
       ],
       "must_not_observe": [
        "empty command text",
        "placeholder text instead of the real command",
        "0 selectable command text nodes"
       ]
      }
     }
    ]
   },
   "given": "the built site served at http://localhost:4321 with Chromium granted clipboard permissions",
   "when": "the spec opens /islands/copy-button and clicks the copy button once",
   "then": "the clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` with no trailing newline, and the button shows a success state within 500 ms",
   "num": 1,
   "name": "Copy places the exact command on the clipboard with a visible success state",
   "type": "acceptance_criterion",
   "description": "GIVEN the built site served at http://localhost:4321 with Chromium granted clipboard permissions WHEN the spec opens /islands/copy-button and clicks the copy button once THEN the clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` with no trailing newline, and the button shows a success state within 500 ms",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/island-budget.test.ts",
   "test_function": "FUSE-09-island-budget",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t \"FUSE-09-island-budget\"",
   "test_tier": "unit",
   "verification_service": "real filesystem scan of apps/docs/src",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": null,
   "given": "apps/docs source as authored by this task",
   "when": "a focused test scans apps/docs/src for custom element registrations and framework imports",
   "then": "exactly one `customElements.define` call exists (`rnr-copy-button`) and no react/svelte/vue/preact/solid import appears under apps/docs/src",
   "num": 2,
   "name": "Island budget accounting: exactly one custom element, zero frameworks",
   "type": "acceptance_criterion",
   "description": "GIVEN apps/docs source as authored by this task WHEN a focused test scans apps/docs/src for custom element registrations and framework imports THEN exactly one `customElements.define` call exists (`rnr-copy-button`) and no react/svelte/vue/preact/solid import appears under apps/docs/src",
   "maps_to_ac": null,
   "unit_test_justified": "pure static source scan with no I/O beyond file reads and no runtime behavior"
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "Clicking the copy button on /islands/copy-button places `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` on the clipboard with no trailing newline.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/copy-button.spec.ts --grep "
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "The button shows a visible success state within 500 ms of the click, and with javaScriptEnabled:false the full command renders as selectable text on a 200 response.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/copy-button.spec.ts --grep "
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "apps/docs/src contains exactly 1 `customElements.define` call (`rnr-copy-button`) and 0 client-framework imports.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t \"FUSE-09-island-budget\""
  }
 ]
}
-->
