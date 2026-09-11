================================================================================
TASK: SHELL-012 - Item install + dependency-panel flow specs (data-equality against the enriched dataset)
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
PROPOSED-BY: react-native-reusables-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: ?
HUMAN-TEST-HOOK: item-and-panel-specs-green
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Own FLOW-GEND-20 and FLOW-GEND-21 end-to-end over the real preview: every component page's tabbed install copies the exact absolute-URL command per engine, and the dependency panels equal the enriched dataset with derived peers — the equality oracle being the point.
**Success state:** Both locked run_cmds exit 0 under the widened tests/ lane with retries 0; JSON evidence and RED proofs exist at the locked paths; every expectation traces to the real artifacts computed at run time.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: run_cmd selects exactly one spec file + one flow id — byte-for-byte the locked human-flows.json command for both owned flows
- MUST: Expected values derived at run time: item list from registry-items.json / the components index, version from root package.json, peers from apps/example/package.json
- MUST: Capture JSON evidence to the locked artifact paths and RED proofs to the locked red_proof paths
- NEVER: never a bare directory or `pnpm test` as a verify; never a hardcoded item list or hand-copied URL/version literal
- NEVER: never assert a success class name instead of clipboard content; never trust a page-echoed literal as oracle
- NEVER: never emit a run_cmd that backgrounds a raw astro preview — the Playwright webServer owns serving (astro preview daemonizes and squats :4321)
- STRICTLY: navigate only via http://localhost:4321 (L6 clipboard secure context); retries: 0 always
- STRICTLY: reuse the readGeneratedDataset ENOENT-retry pattern — the lane's destructive cases still rmSync src/data mid-run
- STRICTLY: verify lint via `./node_modules/.bin/biome ci <paths>` — local `pnpm lint` crashes
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: each clipboard equals that engine's exact absolute-URL command matching the locked regex, a value-based success state shows within 500 ms, and both engines' panel text is server-rendered (nojs project reads it) with no short-name or un-tabbed duplicates [PRIMARY]
- [ ] AC-2: panel text equals dependencies[]/registryDependencies[] with {engine}/{version} resolved (both forms incl. conversation's v0.2.1 raw.githubusercontent URL), message shows the explicit empty-deps state, and the peers line names `ai` at the range derived from the manifest [PRIMARY]
- [ ] AC-3: the uniwind tab is active with its command displayed on both pages without any URL param, and no page renders a second un-tabbed copy of either engine's command
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: FLOW-GEND-20: exact absolute-URL command copy on every component page [PRIMARY]
  GIVEN: the built site served at localhost:4321 with all component pages live and clipboard permissions granted
  WHEN:  the spec dynamically enumerates every /components/* page from the dataset and clicks copy once per engine tab
  THEN:  each clipboard equals that engine's exact absolute-URL command matching the locked regex, a value-based success state shows within 500 ms, and both engines' panel text is server-rendered (nojs project reads it) with no short-name or un-tabbed duplicates
  FLOW_REF:              FLOW-GEND-20-exact-absolute-url-command-copy
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium with granted clipboard permissions
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/item-install-copy.spec.ts
  TEST_FUNCTION:         FLOW-GEND-20-exact-absolute-url-command-copy
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_site_with_items: enumerate pages dynamically from the dataset (39 today), on each page click copy on the nativewind tab then the uniwind tab, reading the clipboard each time
      MUST_OBSERVE: clipboard == `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/shimmer.json` on shimmer's nativewind tab (and each page's own engine/name pair); every copied string matches `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$`
      MUST_NOT_OBSERVE: clipboard empty or with trailing newline; short-name `add conversation` or relative `add /r/...` forms
    START_REF built_site_with_items: open pages in the chromium-nojs project and read both panels' text
      MUST_OBSERVE: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/shimmer.json` and `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/shimmer.json` both present as selectable text with javaScriptEnabled:false
      MUST_NOT_OBSERVE: an empty install block under nojs
    NEGATIVE_CONTROL: would fail if the copied string drifts from the displayed panel text (clipboard vs displayed compare fails); the enumeration is a hardcoded list — a new item never gets copied…

AC-2: FLOW-GEND-21: dependency panels equal the enriched dataset with derived peers [PRIMARY]
  GIVEN: the built site, the real registry-items.json, and apps/example/package.json
  WHEN:  the spec reads the dependencies sections on /components/shimmer, /components/conversation, and /components/message and compares against the dataset arrays resolved per engine plus the run-time-derived peers
  THEN:  panel text equals dependencies[]/registryDependencies[] with {engine}/{version} resolved (both forms incl. conversation's v0.2.1 raw.githubusercontent URL), message shows the explicit empty-deps state, and the peers line names `ai` at the range derived from the manifest
  FLOW_REF:              FLOW-GEND-21-dependency-panel-peers
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview + Chromium over the real dataset and example manifest
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/dependency-panels.spec.ts
  TEST_FUNCTION:         FLOW-GEND-21-dependency-panel-peers
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF enriched_dataset: read /components/shimmer and /components/conversation panels, resolve the items' arrays per engine in the spec and diff
      MUST_OBSERVE: `react-native-reanimated` (shimmer), `react-native-safe-area-context` (conversation); `https://reactnativereusables.com/r/nativewind/text.json` + uniwind twin; `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/empty.json` + uniwind twin
      MUST_NOT_OBSERVE: `{engine}`/`{version}` rendered; a URL absent from the item's arrays
    START_REF example_manifest: read the peers line on each probed page, derive the expected `ai` range from apps/example/package.json in the spec
      MUST_OBSERVE: peers line names `ai` at the spec-derived 7.x range
      MUST_NOT_OBSERVE: a literal `^7` typed in the spec; an empty peers line
    START_REF enriched_dataset: read /components/message (dependencies[] empty)
      MUST_OBSERVE: the Dependencies section shows the literal `No required packages`
      MUST_NOT_OBSERVE: the dependencies section absent; an invented dependency row
    NEGATIVE_CONTROL: would fail if the panel hand-types a URL or version — the dataset equality fails; the peers line is a hand-copied literal in the spec — a manifest bump leaves it stale…

AC-3: Engine follows persisted rnr-engine across pages; zero un-tabbed duplicates
  GIVEN: a context with localStorage rnr-engine=uniwind seeded via addInitScript before the pre-paint/page scripts
  WHEN:  the spec cold-navigates shimmer then message and checks the active tab, and scans every enumerated page for duplicate command forms
  THEN:  the uniwind tab is active with its command displayed on both pages without any URL param, and no page renders a second un-tabbed copy of either engine's command
  FLOW_REF:              FLOW-GEND-20-exact-absolute-url-command-copy
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview + Chromium with seeded localStorage
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/item-install-copy.spec.ts
  TEST_FUNCTION:         FLOW-GEND-20-exact-absolute-url-command-copy
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_site_with_items: seed rnr-engine=uniwind via addInitScript, cold-navigate /components/shimmer then /components/message; read the active tab and command; scan all pages for duplicate forms
      MUST_OBSERVE: `button[role=tab][aria-selected="true"]` accessible name contains `uniwind` on both /components/shimmer and /components/message, with the uniwind command displayed; both page URLs equal exactly `http://localhost:4321/components/shimmer` and `http://localhost:4321/components/message` with no query string
      MUST_NOT_OBSERVE: nativewind active despite the stored uniwind choice; more than one copy of an engine's command per page
    NEGATIVE_CONTROL: would fail if engine state leaks into the URL (query param present); the tab group re-inits per page and loses the stored engine…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: Every page enumerated dynamically from the dataset yields a per-engine clipboard exactly matching that engine's absolute-URL command and the locked regex, with a value-based success state within 500 ms.
- TC-2 [edge, → AC-1]: Under the chromium-nojs project both engines' panel text is server-rendered and selectable, with no short-name or un-tabbed duplicated forms on any page.
- TC-3 [happy_path, → AC-2]: shimmer and conversation panel content equals the dataset arrays resolved per engine, including conversation's v0.2.1 raw.githubusercontent URL in both engine forms.
- TC-4 [edge, → AC-2]: The peers line names `ai` with the range derived at run time from apps/example/package.json, and message's empty dependencies[] renders the explicit empty state.
- TC-5 [happy_path, → AC-3]: With rnr-engine=uniwind seeded pre-script, the active tab and displayed command stay uniwind across cold navigations to multiple item pages, with no engine state in any URL.
- TC-6 [error, → AC-1]: JSON evidence and RED proofs exist at the four locked .tmp/sprint-02-shell-hero/e2e-evidence/ paths, the RED text captured against sprint-start commit 41f519dea484c32e37ed5d61f5d04ed4b842791d.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- tests/sprint-02-shell-hero/item-install-copy.spec.ts (NEW)
- tests/sprint-02-shell-hero/dependency-panels.spec.ts (NEW)
writeProhibited:
- apps/docs/src/**
- playwright.config.ts
- tests/sprint-01-docs-spike-skeleton/**
- packages/**
- scripts/**
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Expectations computed from the REAL artifacts at run time; page enumeration dynamic — a stale hardcoded 56/39 or literal URL fails
- The chromium-nojs project proves panels are server-rendered (unguarded case)
- retries: 0; RED proof captured against the recorded sprint-start commit 41f519dea484c32e37ed5d61f5d04ed4b842791d (spec lands after its feature to keep PR-gated CI green — convergence Ruling 4)
- No assertion trusts a success class or a page-echoed literal — clipboard CONTENT, panel-vs-dataset equality
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts lines 12-71 — PRIMARY PATTERN — readJson ENOENT-bridge + dataset-derived expectations + unguarded server-rendered assertions
- tests/harness/docs-preview.ts lines 39-101 — navigateLocalhost, grantClipboardPermissions, waitForAstroPageLoad (L6/L7 primitives)
- .spec/prds/docs-site/tasks/sprint-02-shell-hero/human-flows.json lines FLOW-GEND-20/GEND-21 entries — locked run_cmd/test/artifact/red_proof paths — byte-for-byte proof fields
- apps/docs/src/components/DependencyPanel.astro lines all (SHELL-008 output) — the DOM under assertion — section[data-section=dependencies] shape
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: dataset-derived expectations + ENOENT-bridged artifact reads + clipboard-content asserts over the preview origin
Source: tests/sprint-01-docs-spike-skeleton/component-page.spec.ts:12-71
Anti-pattern: hand-copied expected URLs/counts, success-class assertions, page-echoed oracles, hardcoded page lists
Interaction notes:
- RED proofs: detached scratch checkout at the recorded sprint-start commit 41f519dea484c32e37ed5d61f5d04ed4b842791d + only the spec + tools/gate-evidence/run_flow.py --expect red — never a red spec merged to PR-gated main
- evidence JSON lands at the locked .tmp/sprint-02-shell-hero/e2e-evidence/<FLOW-ID>.json paths; RED at <FLOW-ID>-red.txt
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- FLOW-GEND-20: `pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy`
  expected: exit 0, retries 0
- FLOW-GEND-21: `pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers`
  expected: exit 0, retries 0
- engine persistence + nojs: `pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep SHELL-012-engine-follow-and-zerojs`
  expected: exit 0
- lint: `./node_modules/.bin/biome ci tests/sprint-02-shell-hero/item-install-copy.spec.ts tests/sprint-02-shell-hero/dependency-panels.spec.ts`
  expected: exit 0 (never `pnpm lint`)
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-008, SHELL-011
Blocks:     (none)
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
The equality oracle is the point: if a panel ever hand-types a URL or version, these specs fail against the dataset. Owns FLOW-GEND-20 and FLOW-GEND-21 with byte-for-byte locked run_cmds; both probe sets cover shimmer (reanimated + text.json {engine} template), conversation (safe-area-context + the v{version} raw.githubusercontent URL), and message (empty-deps explicit state), with the peers line derived live from apps/example/package.json. RED proofs anchor to the recorded sprint-start commit because specs land after features on this PR-gated main (Ruling 4); never emit a run_cmd that backgrounds a raw astro preview.
Coding standards:
- Every expectation computed from real artifacts at run time; navigation only via http://localhost:4321; waits via waitForAstroPageLoad, never DOMContentLoaded
Capability: touches=['CAP-DOCS-01', 'CAP-INST-01'] provides=3 items consumes=4 items; boundary_contracts=4
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-012",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_site_with_items": {
   "description": "The full ordered chain built and served: registry:build && gallery:manifest && docs build (with SHELL-006 resolver/site-facts and SHELL-008 tabbed pages), astro preview at http://localhost:4321 via the Playwright webServer \u2014 /components/{shimmer,conversation,message,...} live.",
   "seed_method": "build_artifact",
   "records": [
    "build exit 0; preview serves /components/* (39 pages) and /r/{engine}/{item}.json at 200",
    "clipboard permissions granted for the localhost origin"
   ]
  },
  "enriched_dataset": {
   "description": "The real registry-items.json read at run time by the specs (ENOENT-bridged): shimmer deps [react-native-reanimated]+ 1 templated text.json URL; conversation deps [react-native-safe-area-context] + 3 URLs incl. v{version}; message deps [] + 3 templated URLs.",
   "seed_method": "build_artifact",
   "records": [
    "expectations computed from its arrays at test time \u2014 never hand-copied literals"
   ]
  },
  "example_manifest": {
   "description": "apps/example/package.json as committed \u2014 dependencies include \"ai\": \"7.0.89\", the source the peers-line expectation derives from at run time.",
   "seed_method": "build_artifact",
   "records": [
    "apps/example/package.json dependencies[\"ai\"] == \"7.0.89\""
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": true,
   "description": "GIVEN the built site served at localhost:4321 with all component pages live and clipboard permissions granted WHEN the spec dynamically enumerates every /components/* page from the dataset and clicks copy once per engine tab THEN each clipboard equals that engine's exact absolute-URL command matching the locked regex, a value-based success state shows within 500 ms, and both engines' panel text is server-rendered (nojs project reads it) with no short-name or un-tabbed duplicates",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_file": "tests/sprint-02-shell-hero/item-install-copy.spec.ts",
   "test_function": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium with granted clipboard permissions",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium (clipboard granted)",
    "negative_control": {
     "would_fail_if": [
      "the copied string drifts from the displayed panel text (clipboard vs displayed compare fails)",
      "the enumeration is a hardcoded list \u2014 a new item never gets copied",
      "the success state is asserted by class while the clipboard stays empty (stub island)"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_site_with_items",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "enumerate pages dynamically from the dataset (39 today)",
        "on each page click copy on the nativewind tab then the uniwind tab, reading the clipboard each time"
       ]
      },
      "end_state": {
       "must_observe": [
        "clipboard == `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/shimmer.json` on shimmer's nativewind tab (and each page's own engine/name pair)",
        "every copied string matches `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$`"
       ],
       "must_not_observe": [
        "clipboard empty or with trailing newline",
        "short-name `add conversation` or relative `add /r/...` forms"
       ]
      }
     },
     {
      "start_ref": "built_site_with_items",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "open pages in the chromium-nojs project and read both panels' text"
       ]
      },
      "end_state": {
       "must_observe": [
        "`npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/shimmer.json` and `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/shimmer.json` both present as selectable text with javaScriptEnabled:false"
       ],
       "must_not_observe": [
        "an empty install block under nojs"
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
   "description": "GIVEN the built site, the real registry-items.json, and apps/example/package.json WHEN the spec reads the dependencies sections on /components/shimmer, /components/conversation, and /components/message and compares against the dataset arrays resolved per engine plus the run-time-derived peers THEN panel text equals dependencies[]/registryDependencies[] with {engine}/{version} resolved (both forms incl. conversation's v0.2.1 raw.githubusercontent URL), message shows the explicit empty-deps state, and the peers line names `ai` at the range derived from the manifest",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-21-dependency-panel-peers",
   "test_file": "tests/sprint-02-shell-hero/dependency-panels.spec.ts",
   "test_function": "FLOW-GEND-21-dependency-panel-peers",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview + Chromium over the real dataset and example manifest",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real preview + data-equality oracle against real artifacts",
    "negative_control": {
     "would_fail_if": [
      "the panel hand-types a URL or version \u2014 the dataset equality fails",
      "the peers line is a hand-copied literal in the spec \u2014 a manifest bump leaves it stale",
      "expectations come from a page echo instead of the artifacts (circular oracle)"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "enriched_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read /components/shimmer and /components/conversation panels",
        "resolve the items' arrays per engine in the spec and diff"
       ]
      },
      "end_state": {
       "must_observe": [
        "`react-native-reanimated` (shimmer), `react-native-safe-area-context` (conversation)",
        "`https://reactnativereusables.com/r/nativewind/text.json` + uniwind twin; `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/empty.json` + uniwind twin"
       ],
       "must_not_observe": [
        "`{engine}`/`{version}` rendered",
        "a URL absent from the item's arrays"
       ]
      }
     },
     {
      "start_ref": "example_manifest",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read the peers line on each probed page",
        "derive the expected `ai` range from apps/example/package.json in the spec"
       ]
      },
      "end_state": {
       "must_observe": [
        "peers line names `ai` at the spec-derived 7.x range"
       ],
       "must_not_observe": [
        "a literal `^7` typed in the spec",
        "an empty peers line"
       ]
      }
     },
     {
      "start_ref": "enriched_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read /components/message (dependencies[] empty)"
       ]
      },
      "end_state": {
       "must_observe": [
        "the Dependencies section shows the literal `No required packages`"
       ],
       "must_not_observe": [
        "the dependencies section absent",
        "an invented dependency row"
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
   "description": "GIVEN a context with localStorage rnr-engine=uniwind seeded via addInitScript before the pre-paint/page scripts WHEN the spec cold-navigates shimmer then message and checks the active tab, and scans every enumerated page for duplicate command forms THEN the uniwind tab is active with its command displayed on both pages without any URL param, and no page renders a second un-tabbed copy of either engine's command",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_file": "tests/sprint-02-shell-hero/item-install-copy.spec.ts",
   "test_function": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview + Chromium with seeded localStorage",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real preview + seeded storage state",
    "negative_control": {
     "would_fail_if": [
      "engine state leaks into the URL (query param present)",
      "the tab group re-inits per page and loses the stored engine",
      "a page renders an un-tabbed engine duplicate (T-GEND-016 violation)"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_site_with_items",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "seed rnr-engine=uniwind via addInitScript",
        "cold-navigate /components/shimmer then /components/message; read the active tab and command; scan all pages for duplicate forms"
       ]
      },
      "end_state": {
       "must_observe": [
        "`button[role=tab][aria-selected=\"true\"]` accessible name contains `uniwind` on both /components/shimmer and /components/message, with the uniwind command displayed",
        "both page URLs equal exactly `http://localhost:4321/components/shimmer` and `http://localhost:4321/components/message` with no query string"
       ],
       "must_not_observe": [
        "nativewind active despite the stored uniwind choice",
        "more than one copy of an engine's command per page"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "Every page enumerated dynamically from the dataset yields a per-engine clipboard exactly matching that engine's absolute-URL command and the locked regex, with a value-based success state within 500 ms.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Under the chromium-nojs project both engines' panel text is server-rendered and selectable, with no short-name or un-tabbed duplicated forms on any page.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "shimmer and conversation panel content equals the dataset arrays resolved per engine, including conversation's v0.2.1 raw.githubusercontent URL in both engine forms.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "The peers line names `ai` with the range derived at run time from apps/example/package.json, and message's empty dependencies[] renders the explicit empty state.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "With rnr-engine=uniwind seeded pre-script, the active tab and displayed command stay uniwind across cold navigations to multiple item pages, with no engine state in any URL.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep SHELL-012-engine-follow-and-zerojs"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "JSON evidence and RED proofs exist at the four locked .tmp/sprint-02-shell-hero/e2e-evidence/ paths, the RED text captured against sprint-start commit 41f519dea484c32e37ed5d61f5d04ed4b842791d.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy"
  }
 ]
}
-->
