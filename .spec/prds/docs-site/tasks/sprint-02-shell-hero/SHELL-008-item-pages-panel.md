================================================================================
TASK: SHELL-008 - Item pages: engine-tabbed InstallCommand (install stays first) + data-driven dependency panel; retire spike.astro
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     5   # Fibonacci story points — relative size, never time
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: frontend-designer
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: ?
HUMAN-TEST-HOOK: item-tabs-and-dependency-panel
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Rebuild /components/[item] on DocsLayout with the engine-tabbed InstallCommand first and a data-verbatim Dependencies section, shipping the FLOW-GEND-21 panel this sprint because the enriched data has existed since sprint-01.
**Success state:** All 39 generated pages serve install-first tabbed panels (both engine commands in served HTML) plus a dependencies section equal to the resolved dataset with the site-facts peers line; message shows an explicit empty-deps state; spike.astro is gone; the sprint-01 component-page spec passes against the new DOM.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Install stays the first main>section[data-section] on every one of the 39 pages, both engines' full command text present in the SERVED HTML (server-rendered panels, hidden attribute only)
- MUST: Every URL the dependencies panel shows equals resolve-deps.ts output for that engine — dataset equality, not authored text
- MUST: component-page.spec.ts migrates in THIS commit (pre-declared supersede) and stays green across all 39 pages
- NEVER: never hand-type a URL, version, or peer range in [item].astro or DependencyPanel.astro — a fixture edit must move the panel
- NEVER: never render `{engine}` or `{version}` literals or the string `max-height` in served HTML
- NEVER: never re-implement CopyButton or TabGroup — import the SHELL-004 composites
- STRICTLY: plain token-styled table — DataTable polish, troubleshooting Callout, and the install matrix remain sprint-04's
- STRICTLY: delete spike.astro only after its last importer is gone; the DocsLayout switch lands in the same commit
- STRICTLY: verify lint via `./node_modules/.bin/biome ci <paths>` — local `pnpm lint` crashes
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: install is the first main>section[data-section] on every page; both engines' full absolute-URL command text appears in served HTML with the nativewind panel first; the tab group carries storageKey rnr-engine; no {engine}/{version} literal and no stacked un-tabbed duplicate rows
- [ ] AC-2: shimmer lists react-native-reanimated and both resolved text.json URLs; conversation lists react-native-safe-area-context, button/icon URLs, and the v0.2.1 raw.githubusercontent URL; every page carries the peers line naming `ai` at the derived 7.x range; message renders an explicit empty-deps state
- [ ] AC-3: FLOW-GEND-14 passes across all 39 pages with tabbed-panel selectors (install first, chips, pager, source byte-match, no max-height string); the page renders inside DocsLayout; layouts/spike.astro no longer exists
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: Tabbed install block first on all 39 pages, both engines server-rendered
  GIVEN: the built item pages over the real dataset and the SHELL-004 InstallCommand/TabGroup composites
  WHEN:  the vitest integration test runs the real build, reads served dist HTML for all 39 pages, and computes expected commands from the dataset
  THEN:  install is the first main>section[data-section] on every page; both engines' full absolute-URL command text appears in served HTML with the nativewind panel first; the tab group carries storageKey rnr-engine; no {engine}/{version} literal and no stacked un-tabbed duplicate rows
  FLOW_REF:              FLOW-GEND-20-exact-absolute-url-command-copy
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real ordered build chain + real filesystem reads of dist/components/*.html + real registry-items.json
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/item-install-copy.spec.ts
  TEST_FUNCTION:         FLOW-GEND-20-exact-absolute-url-command-copy
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_item_pages: run the real docs build, read dist/components/shimmer.html and dist/components/message.html; compute expected commands from the dataset
      MUST_OBSERVE: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/shimmer.json` AND the uniwind twin present in the served HTML; install is main>section[data-section] number 1 on both pages; the nativewind panel precedes the uniwind panel
      MUST_NOT_OBSERVE: `{engine}` or `{version}` anywhere in served HTML; un-tabbed stacked `.install-row` duplicates of the commands
    START_REF built_item_pages: loop all 39 dist pages asserting section order, both commands, and storageKey rnr-engine on the tab group
      MUST_OBSERVE: 39/39 pages with install first and both engine commands in served HTML; all 39 served pages contain storage-key="rnr-engine"
      MUST_NOT_OBSERVE: any page missing a panel; any page with install not first
    NEGATIVE_CONTROL: would fail if panels are client-fetched — the command text is absent from served HTML and the dist read finds nothing; the install block is demoted below another section on any page…

AC-2: Dependencies section equals the resolved dataset + peers line; empty deps explicit
  GIVEN: the built pages, SHELL-006's resolve-deps.ts, and site-facts.json
  WHEN:  the vitest integration test reads the served dependencies section for shimmer, conversation, and message and compares against the dataset arrays resolved per engine plus the derived peers
  THEN:  shimmer lists react-native-reanimated and both resolved text.json URLs; conversation lists react-native-safe-area-context, button/icon URLs, and the v0.2.1 raw.githubusercontent URL; every page carries the peers line naming `ai` at the derived 7.x range; message renders an explicit empty-deps state
  FLOW_REF:              FLOW-GEND-20-exact-absolute-url-command-copy
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real build chain + real dist HTML + real registry-items.json + real site-facts.json
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/item-install-copy.spec.ts
  TEST_FUNCTION:         FLOW-GEND-20-exact-absolute-url-command-copy
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_item_pages: read dist/components/shimmer.html and dist/components/conversation.html dependencies sections, resolve the dataset arrays via resolve-deps.ts for both engines and compare
      MUST_OBSERVE: `react-native-reanimated` (shimmer) and `react-native-safe-area-context` (conversation) present; `https://reactnativereusables.com/r/nativewind/text.json` + uniwind twin; conversation's `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/empty.json` + uniwind twin; a peers line naming `ai` with the 7.x range from site-facts.json on both pages
      MUST_NOT_OBSERVE: `{engine}`/`{version}` in any panel URL; a URL absent from the item's registryDependencies[] (invented row)
    START_REF built_item_pages: read dist/components/message.html (dependencies[] is empty in the dataset)
      MUST_OBSERVE: section[data-section="dependencies"] present with an explicit no-required-packages empty state; `https://reactnativereusables.com/r/nativewind/avatar.json` rendered (not the `{engine}` template)
      MUST_NOT_OBSERVE: the dependencies section missing entirely; an invented npm dependency row for message
    NEGATIVE_CONTROL: would fail if the panel hand-types a URL or version — the data-equality compare fails; empty dependencies[] silently drops the section instead of the explicit empty state…

AC-3: component-page.spec supersede + DocsLayout adoption + spike.astro retirement
  GIVEN: the migrated tabbed DOM and the pre-declared supersede of tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
  WHEN:  the playwright spec runs over astro preview and a grep confirms no spike.astro import remains
  THEN:  FLOW-GEND-14 passes across all 39 pages with tabbed-panel selectors (install first, chips, pager, source byte-match, no max-height string); the page renders inside DocsLayout; layouts/spike.astro no longer exists
  FLOW_REF:              FLOW-GEND-20-exact-absolute-url-command-copy
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/item-install-copy.spec.ts
  TEST_FUNCTION:         FLOW-GEND-20-exact-absolute-url-command-copy
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_item_pages: run the component-page spec over preview with the migrated tabbed selectors, grep apps/docs/src for any remaining `layouts/spike` import and stat the file
      MUST_OBSERVE: FLOW-GEND-14 green: install first, both engine commands, chips, pager, byte-matched source on all 39 pages; `git ls-files -- apps/docs/src/layouts/spike.astro` returns 0 matches and `grep -r "layouts/spike" apps/docs/src` exits 0 with no hits
      MUST_NOT_OBSERVE: `max-height` in served HTML; a failing sprint-01 assertion anywhere in the spec
    NEGATIVE_CONTROL: would fail if the spec still selects the old .install-row stacking (selectors unmigrated — 0 matches); the page keeps the spike layout (no header/footer; grep finds the import)…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: On all 39 served pages, install is the first main>section[data-section] and both engines' full absolute-URL commands appear in served HTML with the nativewind panel first and storageKey rnr-engine.
- TC-2 [edge, → AC-1]: No served item page contains `{engine}`, `{version}`, or `max-height`, and no un-tabbed stacked command duplicates exist.
- TC-3 [happy_path, → AC-2]: The shimmer and conversation dependencies sections equal the dataset arrays resolved per engine (both forms), including conversation's v0.2.1 raw.githubusercontent URL.
- TC-4 [edge, → AC-2]: Every page carries the peers line naming `ai` at the range read from site-facts.json, and message (empty dependencies[]) renders an explicit empty state while still listing its resolved registryDependencies[].
- TC-5 [happy_path, → AC-3]: FLOW-GEND-14 passes with migrated tabbed selectors on all 39 pages, the page uses DocsLayout, and layouts/spike.astro is deleted with no remaining importer.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/pages/components/[item].astro (MODIFY)
- apps/docs/src/components/DependencyPanel.astro (NEW)
- apps/docs/src/layouts/spike.astro (DELETE)
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY)
- tests/sprint-02-shell-hero/item-pages-build.test.ts (NEW)
- tests/sprint-02-shell-hero/item-install-copy.spec.ts (NEW)
writeProhibited:
- packages/**
- apps/docs/src/data/** (generated — never hand-edited)
- apps/docs/src/lib/**
- tests/** (except the declared component-page.spec.ts supersede)
Supersedes (deliberate changes to existing tests):
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Verbatim-or-bust: panel text equals the dataset arrays after placeholder resolution — nothing invented, nothing dropped; a fixture edit moves the panel
- No literal '{engine}' or '{version}' may render; {version} resolves against the SAME root package.json version the sprint-01 chip carries
- Commands absolute-URL only, zero short-name forms, zero un-tabbed engine duplicates; copy source is the displayed text
- Sprint-01 component-page.spec contracts keep passing (install first, chips, pager, source byte-match, no max-height string); empty dependencies[] renders an explicit empty state rather than disappearing
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- apps/docs/src/pages/components/[item].astro lines 21-88 — PRIMARY PATTERN — getStaticPaths fan-out, install-first section anatomy, build-time version read; the tabbed rewrite keeps this skeleton
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts lines 93-195 — the contracts that must keep passing and the .install-row selectors being migrated to tabbed panels
- apps/docs/src/lib/resolve-deps.ts lines all (SHELL-006 output) — the resolver the panel calls — the only substitution site
- apps/docs/src/components/InstallCommand.astro lines all (SHELL-004 output) — the composite being embedded (storageKey, panel DOM shape)
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: generated-route frontmatter deriving every rendered string from the dataset (commandFor/version read in [item].astro)
Source: apps/docs/src/pages/components/[item].astro:36-56
Anti-pattern: hand-typing URLs, versions, or peers in markup; client-fetching panels (absent from served HTML)
Interaction notes:
- DependencyPanel receives the item's raw arrays + the resolved-per-engine URL pairs and renders a plain token-styled table; resolution happens in the frontmatter via resolve-deps.ts so the served HTML is already concrete
- both resolved engine forms render (the active one visible, the other hidden) so the zero-JS project and FLOW-GEND-21's both-forms clause read them
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- tabbed install first (narrow lane): `pnpm vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts -t SHELL-008-tabbed-install-first`
  expected: exit 0
- dependencies data-verbatim (narrow lane): `pnpm vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts -t SHELL-008-dependencies-dataverbatim`
  expected: exit 0
- sprint-01 spec supersede: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`
  expected: exit 0
- typecheck: `pnpm typecheck`
  expected: exit 0
- lint: `./node_modules/.bin/biome ci apps/docs/src/pages/components/[item].astro apps/docs/src/components/DependencyPanel.astro tests/sprint-02-shell-hero/item-pages-build.test.ts`
  expected: exit 0 (never `pnpm lint`)
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-002, SHELL-004, SHELL-006
Blocks:     SHELL-012, SHELL-010
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
Resolves the FLOW-GEND-21 tension: the dependency panel ships THIS sprint because UC-GEND-04 is demonstrated here and the enriched data has existed since sprint-01. Plain token-styled table — DataTable polish, troubleshooting Callout, and the install matrix remain sprint-04's. The >=5-sampled live-/r/*.json cross-check and all-56 coverage of T-GEND-015/T-GEND-013 complete in sprint-04 when ui/lib pages exist; this sprint covers every page the generator emits today (39). Flow-level proofs (FLOW-GEND-20/21 over the live preview with clipboard) belong to SHELL-012; this task's primary ACs are its own narrow vitest lane over the real build artifacts, per the FUSE-01 non-owner pattern.
Coding standards:
- Every rendered string derives from registry-items.json, site-facts.json, or root package.json — zero authored data literals
- Astro 7 rust compiler strictness: valid closed tags and nesting in the new section
Capability: touches=['CAP-DOCS-01', 'CAP-INST-01'] provides=4 items consumes=4 items; boundary_contracts=4
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-008",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_item_pages": {
   "description": "Real docs build output after this task: apps/docs/dist/components/{name}.html for all 39 registry:component items (incl. shimmer, conversation, message), produced by `pnpm --filter @rnr-ai-elements/docs build` through the ordered chain.",
   "seed_method": "build_artifact",
   "records": [
    "build exit 0; one HTML file per registry:component item (39 today)",
    "served shimmer/conversation/message HTML on disk for direct reads"
   ]
  },
  "enriched_dataset": {
   "description": "The real registry-items.json (56 items) the pages derive from: shimmer deps [react-native-reanimated] + 1 templated URL; conversation deps [react-native-safe-area-context] + 3 URLs incl. v{version}; message deps [] + 3 templated URLs.",
   "seed_method": "build_artifact",
   "records": [
    "expectations computed from its arrays at test time \u2014 never hand-copied literals"
   ]
  },
  "site_facts": {
   "description": "The generated apps/docs/src/data/site-facts.json (SHELL-006) carrying aiSdkPeers derived from apps/example/package.json's `ai` pin.",
   "seed_method": "build_artifact",
   "records": [
    "aiSdkPeers names `ai` with a 7.x range"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the built item pages over the real dataset and the SHELL-004 InstallCommand/TabGroup composites WHEN the vitest integration test runs the real build, reads served dist HTML for all 39 pages, and computes expected commands from the dataset THEN install is the first main>section[data-section] on every page; both engines' full absolute-URL command text appears in served HTML with the nativewind panel first; the tab group carries storageKey rnr-engine; no {engine}/{version} literal and no stacked un-tabbed duplicate rows",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_file": "tests/sprint-02-shell-hero/item-install-copy.spec.ts",
   "test_function": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_tier": "integration",
   "verification_service": "real ordered build chain + real filesystem reads of dist/components/*.html + real registry-items.json",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real build chain + real dist HTML + real dataset",
    "negative_control": {
     "would_fail_if": [
      "panels are client-fetched \u2014 the command text is absent from served HTML and the dist read finds nothing",
      "the install block is demoted below another section on any page",
      "commands are hand-composed strings that drift from the dataset-derived expectation"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_item_pages",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the real docs build",
        "read dist/components/shimmer.html and dist/components/message.html; compute expected commands from the dataset"
       ]
      },
      "end_state": {
       "must_observe": [
        "`npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/shimmer.json` AND the uniwind twin present in the served HTML",
        "install is main>section[data-section] number 1 on both pages; the nativewind panel precedes the uniwind panel"
       ],
       "must_not_observe": [
        "`{engine}` or `{version}` anywhere in served HTML",
        "un-tabbed stacked `.install-row` duplicates of the commands"
       ]
      }
     },
     {
      "start_ref": "built_item_pages",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "loop all 39 dist pages asserting section order, both commands, and storageKey rnr-engine on the tab group"
       ]
      },
      "end_state": {
       "must_observe": [
        "39/39 pages with install first and both engine commands in served HTML",
        "all 39 served pages contain storage-key=\"rnr-engine\""
       ],
       "must_not_observe": [
        "any page missing a panel",
        "any page with install not first"
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
   "description": "GIVEN the built pages, SHELL-006's resolve-deps.ts, and site-facts.json WHEN the vitest integration test reads the served dependencies section for shimmer, conversation, and message and compares against the dataset arrays resolved per engine plus the derived peers THEN shimmer lists react-native-reanimated and both resolved text.json URLs; conversation lists react-native-safe-area-context, button/icon URLs, and the v0.2.1 raw.githubusercontent URL; every page carries the peers line naming `ai` at the derived 7.x range; message renders an explicit empty-deps state",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_file": "tests/sprint-02-shell-hero/item-install-copy.spec.ts",
   "test_function": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_tier": "integration",
   "verification_service": "real build chain + real dist HTML + real registry-items.json + real site-facts.json",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real dist HTML equality against the real dataset",
    "negative_control": {
     "would_fail_if": [
      "the panel hand-types a URL or version \u2014 the data-equality compare fails",
      "empty dependencies[] silently drops the section instead of the explicit empty state",
      "the peers line is a hand-typed literal decoupled from site-facts.json"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_item_pages",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read dist/components/shimmer.html and dist/components/conversation.html dependencies sections",
        "resolve the dataset arrays via resolve-deps.ts for both engines and compare"
       ]
      },
      "end_state": {
       "must_observe": [
        "`react-native-reanimated` (shimmer) and `react-native-safe-area-context` (conversation) present",
        "`https://reactnativereusables.com/r/nativewind/text.json` + uniwind twin; conversation's `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/empty.json` + uniwind twin",
        "a peers line naming `ai` with the 7.x range from site-facts.json on both pages"
       ],
       "must_not_observe": [
        "`{engine}`/`{version}` in any panel URL",
        "a URL absent from the item's registryDependencies[] (invented row)"
       ]
      }
     },
     {
      "start_ref": "built_item_pages",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read dist/components/message.html (dependencies[] is empty in the dataset)"
       ]
      },
      "end_state": {
       "must_observe": [
        "section[data-section=\"dependencies\"] present with an explicit no-required-packages empty state",
        "`https://reactnativereusables.com/r/nativewind/avatar.json` rendered (not the `{engine}` template)"
       ],
       "must_not_observe": [
        "the dependencies section missing entirely",
        "an invented npm dependency row for message"
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
   "description": "GIVEN the migrated tabbed DOM and the pre-declared supersede of tests/sprint-01-docs-spike-skeleton/component-page.spec.ts WHEN the playwright spec runs over astro preview and a grep confirms no spike.astro import remains THEN FLOW-GEND-14 passes across all 39 pages with tabbed-panel selectors (install first, chips, pager, source byte-match, no max-height string); the page renders inside DocsLayout; layouts/spike.astro no longer exists",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_file": "tests/sprint-02-shell-hero/item-install-copy.spec.ts",
   "test_function": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "negative_control": {
     "would_fail_if": [
      "the spec still selects the old .install-row stacking (selectors unmigrated \u2014 0 matches)",
      "the page keeps the spike layout (no header/footer; grep finds the import)",
      "a sprint-01 contract regresses (max-height reappears, source byte-match drifts)"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_item_pages",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the component-page spec over preview with the migrated tabbed selectors",
        "grep apps/docs/src for any remaining `layouts/spike` import and stat the file"
       ]
      },
      "end_state": {
       "must_observe": [
        "FLOW-GEND-14 green: install first, both engine commands, chips, pager, byte-matched source on all 39 pages",
        "`git ls-files -- apps/docs/src/layouts/spike.astro` returns 0 matches and `grep -r \"layouts/spike\" apps/docs/src` exits 0 with no hits"
       ],
       "must_not_observe": [
        "`max-height` in served HTML",
        "a failing sprint-01 assertion anywhere in the spec"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "On all 39 served pages, install is the first main>section[data-section] and both engines' full absolute-URL commands appear in served HTML with the nativewind panel first and storageKey rnr-engine.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts -t SHELL-008-tabbed-install-first"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "No served item page contains `{engine}`, `{version}`, or `max-height`, and no un-tabbed stacked command duplicates exist.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts -t SHELL-008-tabbed-install-first"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The shimmer and conversation dependencies sections equal the dataset arrays resolved per engine (both forms), including conversation's v0.2.1 raw.githubusercontent URL.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts -t SHELL-008-dependencies-dataverbatim"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "Every page carries the peers line naming `ai` at the range read from site-facts.json, and message (empty dependencies[]) renders an explicit empty state while still listing its resolved registryDependencies[].",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts -t SHELL-008-dependencies-dataverbatim"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "FLOW-GEND-14 passes with migrated tabbed selectors on all 39 pages, the page uses DocsLayout, and layouts/spike.astro is deleted with no remaining importer.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-14-reference-page-anatomy"
  }
 ]
}
-->
