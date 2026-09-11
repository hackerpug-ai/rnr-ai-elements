================================================================================
TASK: SHELL-011 - Widen the Playwright lane to tests/ + hero flow specs (FLOW-GEND-01 one-screen, FLOW-GEND-02 engine-following copy)
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: astro-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: F
HUMAN-TEST-HOOK: hero-flow-specs-green
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Widen the single turnkey Playwright lane to tests/ and author the two hero flow specs — the one-screen 1440x900 evaluation contract and the engine-following clipboard copy — with JSON evidence and sprint-start-anchored RED proofs.
**Success state:** Both locked run_cmds exit 0 under pnpm e2e:docs with both lanes in the summary; evidence JSONs exist; RED proofs recorded against the sprint-start commit.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: MUST: the two owned flows' verify commands are byte-for-byte the locked run_cmds selecting tests/sprint-02-shell-hero/home-hero.spec.ts + the flow id
- MUST: MUST: expected counters computed in-spec from package.json + apps/docs/src/data/registry-items.json via the ENOENT-retry reader (deliv-03 rmSyncs src/data mid-run)
- MUST: MUST: one-screen proof is geometric — per-test viewport override to 1440x900 (not a new project), bounding boxes of statement/counters/install/CTAs within 0..900
- NEVER: NEVER: never emit a run_cmd that backgrounds a raw astro preview (it daemonizes and squats :4321) — the config webServer owns serving
- NEVER: NEVER: never assert copy success by class name or trust a page-echoed literal; assert clipboard content by exact equality
- NEVER: NEVER: never delete or modify a sprint-01 spec other than the declared runner-config.test.ts supersede
- STRICTLY: STRICTLY: clipboard cases skip on javaScriptEnabled:false projects with a separate UNGUARDED zero-JS test proving both stacked panels selectable (home.spec.ts precedent)
- STRICTLY: STRICTLY: cold navigation via navigateLocalhost only; waits via waitForAstroPageLoad (L7 — never DOMContentLoaded)
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: statement + not-npm phrase + computed counters + tabbed install + both CTAs all sit inside the viewport with zero scroll and both CTA targets return HTTP 200 [PRIMARY]
- [ ] AC-2: each clipboard equals the displayed active-panel command matching the locked regex exactly, success shows by value within 500 ms, the persisted engine survives cold reload, and zero-JS keeps both commands selectable [PRIMARY]
- [ ] AC-3: testDir == 'tests' with testMatch **/*.spec.ts, retries 0, workers 1, strict-port astro-preview webServer (never astro dev), and the three chromium projects unchanged
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: FLOW-GEND-01: one-screen hero evaluation contract at 1440x900 [PRIMARY]
  GIVEN: the built designed hero served at localhost:4321 with the 56-entry artifact and /registry + /components routes
  WHEN:  the spec cold-navigates / at a per-test 1440x900 viewport, computes expected counters from the real artifacts, reads bounding boxes, and GETs both CTA hrefs
  THEN:  statement + not-npm phrase + computed counters + tabbed install + both CTAs all sit inside the viewport with zero scroll and both CTA targets return HTTP 200
  FLOW_REF:              FLOW-GEND-01-home-hero-evaluation-contract
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium at 1440x900 + real package.json/registry-items.json reads
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/home-hero.spec.ts
  TEST_FUNCTION:         FLOW-GEND-01-home-hero-evaluation-contract
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_preview_site: set viewport 1440x900; cold-navigate http://localhost:4321/ via navigateLocalhost, compute expected version + 56/39/11/6 from package.json + registry-items.json (ENOENT-retry reader), read hero text, data-counter values, element bounding boxes; GET /registry and /components; write the evidence JSON + screenshot
      MUST_OBSERVE: hero contains `Universal AI chat and agent UI components for React Native`, `copy-paste registry`, and `NOT an npm package`; data-counter values equal the computed expectations (`0.2.1`, `56`, `39`, `11`, `6` today) inside one hero tree; every hero element bounding box: y >= 0 and y + height <= 900 (zero scroll); Get started href `/registry` and Browse components href `/components` both return HTTP 200
      MUST_NOT_OBSERVE: any hero element bottom > 900; a counter differing from the computed expectation (e.g. `55` after a fixture edit); 0 counters or missing data-counter nodes; any CTA href returning 404
    NEGATIVE_CONTROL: would fail if counters are hardcoded literals decoupled from registry-items.json (computed expectation drifts); any hero region overflows 900px so scrolling is required…

AC-2: FLOW-GEND-02: engine-following hero install copy with persistence and zero-JS fallback [PRIMARY]
  GIVEN: the built hero install block with engine tabs, copy button, and both server-rendered panels
  WHEN:  the spec copies on the default tab, clicks uniwind and copies, reloads with rnr-engine=uniwind persisted, and opens / with JavaScript disabled
  THEN:  each clipboard equals the displayed active-panel command matching the locked regex exactly, success shows by value within 500 ms, the persisted engine survives cold reload, and zero-JS keeps both commands selectable
  FLOW_REF:              FLOW-GEND-02-hero-install-command-copy
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium with granted clipboard permissions (localhost secure context)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/home-hero.spec.ts
  TEST_FUNCTION:         FLOW-GEND-02-hero-install-command-copy
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF clipboard_context: cold-navigate /, click the hero copy once; read clipboard; assert the success state within 500 ms
      MUST_OBSERVE: clipboard == `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exactly; trigger data-state == `copied` within 500 ms (value-based); page.url equals exactly `http://localhost:4321/` (no `?` or `#` suffix after the copy click)
      MUST_NOT_OBSERVE: clipboard empty; trailing newline/wrap artifact; short-name `add conversation` or relative `/r/...`
    START_REF clipboard_context: cold-navigate /; click the uniwind tab; copy and read the clipboard
      MUST_OBSERVE: displayed active-panel engine segment is `/r/uniwind/conversation.json`; clipboard == `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json` matching `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$`
      MUST_NOT_OBSERVE: clipboard still the nativewind string; engine state in the URL
    START_REF uniwind_persisted_context: cold-navigate / (storage seeded pre-paint); read the active tab; copy
      MUST_OBSERVE: the button[role=tab] with accessible name containing `uniwind` has aria-selected="true" and the nativewind tab aria-selected="false" at first read; copied segment still `/r/uniwind/conversation.json` after the cold reload
      MUST_NOT_OBSERVE: nativewind aria-selected="true" after reload (persistence broken); engine in the URL
    START_REF built_preview_site: open / in a javaScriptEnabled:false context (unguarded — the nojs project proves it)
      MUST_OBSERVE: HTTP 200; 2 selectable command text nodes: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` AND the identical string with `/r/uniwind/`
      MUST_NOT_OBSERVE: 0 selectable command text; placeholder text instead of a real command
    NEGATIVE_CONTROL: would fail if the copied string is a hardcoded echo drifting from the displayed panel text; the button shows success while the clipboard stays empty (stub island)…

AC-3: Lane widened to tests/ with every other runner guarantee pinned
  GIVEN: playwright.config.ts testDir pinned to the sprint-01 lane (RED) and the new sprint-02 spec directory
  WHEN:  the modified runner-config test imports the config
  THEN:  testDir == 'tests' with testMatch **/*.spec.ts, retries 0, workers 1, strict-port astro-preview webServer (never astro dev), and the three chromium projects unchanged
  FLOW_REF:              None
  TEST_TIER:             unit
  VERIFICATION_SERVICE:  real config module import (pure config-object assertions)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED:   pure config-object assertions — importing the config and checking fields involves no runtime service (precedent header in this same file)
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-01-docs-spike-skeleton/runner-config.test.ts
  TEST_FUNCTION:         FUSE-10-config-contract
  VERIFY:                pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t FUSE-10-config-contract
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_preview_site: import playwright.config.ts and assert the contract fields
      MUST_OBSERVE: testDir == `tests`; testMatch == `**/*.spec.ts`; retries == `0` and workers == `1`; webServer command contains `astro preview`, `--port 4321`, `process.exit(1)`; url `http://localhost:4321`; projects == [`chromium-desktop`, `chromium-mobile`, `chromium-nojs`]
      MUST_NOT_OBSERVE: testDir still `tests/sprint-01-docs-spike-skeleton`; any `astro dev` in the webServer command; testMatch broadened to `*.ts`
    NEGATIVE_CONTROL: would fail if testDir widening also loosens testMatch (vitest *.test.ts double-run); workers/retries/strict-port/projects guarantees regress silently…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: At 1440x900 the hero statement, not-npm phrase, computed counters, tabbed install, and both CTAs are within viewport bounds with both CTA targets returning 200.
- TC-2 [happy_path, → AC-2]: One hero copy click yields a clipboard exactly equal to the displayed active-panel command matching the locked regex, with a value-based success state within 500 ms, for both engine tabs.
- TC-3 [edge, → AC-2]: With rnr-engine=uniwind seeded before page scripts, a cold reload keeps the uniwind tab active and its command copied; with JavaScript disabled both stacked engine commands remain selectable on 200.
- TC-4 [edge, → AC-3]: playwright.config.ts testDir is 'tests' with testMatch **/*.spec.ts, retries 0, workers 1, strict-port astro-preview webServer, and the three chromium projects unchanged.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- playwright.config.ts (MODIFY)
- tests/sprint-01-docs-spike-skeleton/runner-config.test.ts (MODIFY)
- tests/sprint-02-shell-hero/home-hero.spec.ts (NEW)
writeProhibited:
- apps/docs/src/**
- packages/**
- scripts/**
- .github/**
- tests/sprint-01-docs-spike-skeleton/** (except the declared runner-config supersede)
- tests/harness/**
Supersedes (deliberate changes to existing tests):
- tests/sprint-01-docs-spike-skeleton/runner-config.test.ts
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- run_cmd selects exactly one spec file + one flow id — never a bare directory, never `pnpm test`
- Expected values computed from the real artifacts at run time — never hand-copied literals (a stale hardcoded 56 fails)
- Clipboard asserts CONTENT plus a value-based success state within 500 ms, never a class name; exact equality catches trailing whitespace
- retries: 0 always; navigation only via localhost:4321 (L6 clipboard secure context)
- RED proof captured against the recorded sprint-start commit (pre-feature checkout + only the spec + run_flow.py --expect red) since the spec lands after its feature to keep PR-gated CI green
- No spec under tests/sprint-01-docs-spike-skeleton is deleted
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- tests/sprint-01-docs-spike-skeleton/home.spec.ts lines 36-153 — [PRIMARY PATTERN] expectedCounters + readGeneratedDataset ENOENT-retry; project no-JS guard; clipboard context pattern
- playwright.config.ts lines 1-35 — the testDir/testMatch/workers/webServer block this task widens
- tests/sprint-01-docs-spike-skeleton/runner-config.test.ts lines 1-53 — the assertions to update for the broadened testDir while pinning the rest
- tests/harness/docs-preview.ts lines 22-101 — navigateLocalhost / grantClipboardPermissions / waitForAstroPageLoad (L6/L7)
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: computed-expectation Playwright spec over the built preview, one flow id per --grep
Source: tests/sprint-01-docs-spike-skeleton/home.spec.ts:112-153
Anti-pattern: hand-copied counter literals, bare-directory runs, class-name success asserts, DOMContentLoaded waits
Interaction notes:
- per-test viewport override (test.use or newContext viewport) — never a new Playwright project
- clipboard cases skip on nojs with a separate unguarded zero-JS test (home.spec.ts precedent)
- evidence JSON written per flow under .tmp/sprint-02-shell-hero/e2e-evidence/
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- FLOW-GEND-01 green: `pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract`
  expected: exit 0 — one-screen contract holds
- FLOW-GEND-02 green: `pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy`
  expected: exit 0 — exact per-engine copy + persistence + zero-JS
- runner config: `pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t FUSE-10-config-contract`
  expected: exit 0 — testDir 'tests', all other guarantees pinned
- RED proofs recorded: `detached scratch checkout of the recorded sprint-start commit + only home-hero.spec.ts + run_flow.py --expect red`
  expected: both flows fail against the sprint-start state; outputs saved to .tmp/sprint-02-shell-hero/e2e-evidence/<FLOW-ID>-red.txt
- lint: `./node_modules/.bin/biome ci playwright.config.ts tests/sprint-01-docs-spike-skeleton/runner-config.test.ts tests/sprint-02-shell-hero/home-hero.spec.ts`
  expected: exit 0
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-007
Blocks:     SHELL-012, SHELL-013
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
Widening testDir keeps ONE turnkey runner owning every flow — both lanes serialize under the existing workers:1 setting. The 1440x900 one-screen check uses a per-test viewport override, not a new project. Reuse the sprint-01 readGeneratedDataset ENOENT-retry pattern — the lane's destructive cases still rmSync src/data mid-run. RED proofs anchor to the recorded sprint-start commit (pre-feature checkout + only the spec + run_flow.py --expect red) since the spec lands after its feature to keep PR-gated CI green.
Coding standards:
- repo tsconfig has no DOM lib — declare the one browser global an evaluate callback needs (home.spec.ts precedent)
- retries never appears on any CLI invocation; failures are real
- no spec deletes or edits a sprint-01 file other than the declared supersede
Capability: touches=['CAP-DOCS-01'] provides=4 items consumes=3 items; boundary_contracts=6
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-011",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_preview_site": {
   "description": "Built dist of the SHELL-007-designed site served by the config webServer over astro preview at http://localhost:4321 (strictPreviewCommand, strict port).",
   "seed_method": "build_artifact",
   "records": [
    "pnpm e2e:docs build chain exit 0",
    "preview answers 200 at / with the tabbed hero on DocsLayout"
   ]
  },
  "clipboard_context": {
   "description": "Fresh JS-enabled browser context with clipboard-read/write granted on the localhost origin (L6).",
   "seed_method": "browser_action",
   "records": [
    "context.grantPermissions(['clipboard-read','clipboard-write'], { origin: PREVIEW_URL })"
   ]
  },
  "uniwind_persisted_context": {
   "description": "Context whose localStorage rnr-engine=uniwind was seeded via addInitScript BEFORE any page script runs (TR-11 \u00a72 determinism seam).",
   "seed_method": "browser_action",
   "records": [
    "addInitScript seeding `rnr-engine`=`uniwind` executes before the is:inline scripts"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": true,
   "description": "GIVEN the built designed hero served at localhost:4321 with the 56-entry artifact and /registry + /components routes WHEN the spec cold-navigates / at a per-test 1440x900 viewport, computes expected counters from the real artifacts, reads bounding boxes, and GETs both CTA hrefs THEN statement + not-npm phrase + computed counters + tabbed install + both CTAs all sit inside the viewport with zero scroll and both CTA targets return HTTP 200",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-01-home-hero-evaluation-contract",
   "test_file": "tests/sprint-02-shell-hero/home-hero.spec.ts",
   "test_function": "FLOW-GEND-01-home-hero-evaluation-contract",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium at 1440x900 + real package.json/registry-items.json reads",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "negative_control": {
     "would_fail_if": [
      "counters are hardcoded literals decoupled from registry-items.json (computed expectation drifts)",
      "any hero region overflows 900px so scrolling is required",
      "CTA hrefs point at routes returning 404"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "set viewport 1440x900; cold-navigate http://localhost:4321/ via navigateLocalhost",
        "compute expected version + 56/39/11/6 from package.json + registry-items.json (ENOENT-retry reader)",
        "read hero text, data-counter values, element bounding boxes; GET /registry and /components; write the evidence JSON + screenshot"
       ]
      },
      "end_state": {
       "must_observe": [
        "hero contains `Universal AI chat and agent UI components for React Native`, `copy-paste registry`, and `NOT an npm package`",
        "data-counter values equal the computed expectations (`0.2.1`, `56`, `39`, `11`, `6` today) inside one hero tree",
        "every hero element bounding box: y >= 0 and y + height <= 900 (zero scroll)",
        "Get started href `/registry` and Browse components href `/components` both return HTTP 200"
       ],
       "must_not_observe": [
        "any hero element bottom > 900",
        "a counter differing from the computed expectation (e.g. `55` after a fixture edit)",
        "0 counters or missing data-counter nodes",
        "any CTA href returning 404"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "AC-2",
   "type": "acceptance_criterion",
   "primary": true,
   "description": "GIVEN the built hero install block with engine tabs, copy button, and both server-rendered panels WHEN the spec copies on the default tab, clicks uniwind and copies, reloads with rnr-engine=uniwind persisted, and opens / with JavaScript disabled THEN each clipboard equals the displayed active-panel command matching the locked regex exactly, success shows by value within 500 ms, the persisted engine survives cold reload, and zero-JS keeps both commands selectable",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-02-hero-install-command-copy",
   "test_file": "tests/sprint-02-shell-hero/home-hero.spec.ts",
   "test_function": "FLOW-GEND-02-hero-install-command-copy",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium with granted clipboard permissions (localhost secure context)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium + clipboard",
    "negative_control": {
     "would_fail_if": [
      "the copied string is a hardcoded echo drifting from the displayed panel text",
      "the button shows success while the clipboard stays empty (stub island)",
      "engine selection does not persist (cold reload reverts to nativewind)"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "clipboard_context",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "cold-navigate /",
        "click the hero copy once; read clipboard; assert the success state within 500 ms"
       ]
      },
      "end_state": {
       "must_observe": [
        "clipboard == `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exactly",
        "trigger data-state == `copied` within 500 ms (value-based)",
        "page.url equals exactly `http://localhost:4321/` (no `?` or `#` suffix after the copy click)"
       ],
       "must_not_observe": [
        "clipboard empty",
        "trailing newline/wrap artifact",
        "short-name `add conversation` or relative `/r/...`"
       ]
      }
     },
     {
      "start_ref": "clipboard_context",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "cold-navigate /; click the uniwind tab; copy and read the clipboard"
       ]
      },
      "end_state": {
       "must_observe": [
        "displayed active-panel engine segment is `/r/uniwind/conversation.json`",
        "clipboard == `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json` matching `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$`"
       ],
       "must_not_observe": [
        "clipboard still the nativewind string",
        "engine state in the URL"
       ]
      }
     },
     {
      "start_ref": "uniwind_persisted_context",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "cold-navigate / (storage seeded pre-paint); read the active tab; copy"
       ]
      },
      "end_state": {
       "must_observe": [
        "the button[role=tab] with accessible name containing `uniwind` has aria-selected=\"true\" and the nativewind tab aria-selected=\"false\" at first read",
        "copied segment still `/r/uniwind/conversation.json` after the cold reload"
       ],
       "must_not_observe": [
        "nativewind aria-selected=\"true\" after reload (persistence broken)",
        "engine in the URL"
       ]
      }
     },
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "open / in a javaScriptEnabled:false context (unguarded \u2014 the nojs project proves it)"
       ]
      },
      "end_state": {
       "must_observe": [
        "HTTP 200",
        "2 selectable command text nodes: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` AND the identical string with `/r/uniwind/`"
       ],
       "must_not_observe": [
        "0 selectable command text",
        "placeholder text instead of a real command"
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
   "description": "GIVEN playwright.config.ts testDir pinned to the sprint-01 lane (RED) and the new sprint-02 spec directory WHEN the modified runner-config test imports the config THEN testDir == 'tests' with testMatch **/*.spec.ts, retries 0, workers 1, strict-port astro-preview webServer (never astro dev), and the three chromium projects unchanged",
   "maps_to_ac": null,
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/runner-config.test.ts",
   "test_function": "FUSE-10-config-contract",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t FUSE-10-config-contract",
   "test_tier": "unit",
   "verification_service": "real config module import (pure config-object assertions)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "verification_service": "real config module import",
    "negative_control": {
     "would_fail_if": [
      "testDir widening also loosens testMatch (vitest *.test.ts double-run)",
      "workers/retries/strict-port/projects guarantees regress silently"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "import playwright.config.ts and assert the contract fields"
       ]
      },
      "end_state": {
       "must_observe": [
        "testDir == `tests`",
        "testMatch == `**/*.spec.ts`",
        "retries == `0` and workers == `1`",
        "webServer command contains `astro preview`, `--port 4321`, `process.exit(1)`; url `http://localhost:4321`",
        "projects == [`chromium-desktop`, `chromium-mobile`, `chromium-nojs`]"
       ],
       "must_not_observe": [
        "testDir still `tests/sprint-01-docs-spike-skeleton`",
        "any `astro dev` in the webServer command",
        "testMatch broadened to `*.ts`"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "At 1440x900 the hero statement, not-npm phrase, computed counters, tabbed install, and both CTAs are within viewport bounds with both CTA targets returning 200.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "One hero copy click yields a clipboard exactly equal to the displayed active-panel command matching the locked regex, with a value-based success state within 500 ms, for both engine tabs.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "With rnr-engine=uniwind seeded before page scripts, a cold reload keeps the uniwind tab active and its command copied; with JavaScript disabled both stacked engine commands remain selectable on 200.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "playwright.config.ts testDir is 'tests' with testMatch **/*.spec.ts, retries 0, workers 1, strict-port astro-preview webServer, and the three chromium projects unchanged.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t FUSE-10-config-contract"
  }
 ]
}
-->
