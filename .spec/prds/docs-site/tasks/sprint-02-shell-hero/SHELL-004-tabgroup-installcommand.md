================================================================================
TASK: SHELL-004 - TabGroup island (WAI-ARIA engine tabs, persisted rnr-engine, server-rendered panels) + InstallCommand composite
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     5   # Fibonacci story points — relative size, never time
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: astro-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: D
HUMAN-TEST-HOOK: engine-tab-persists-across-pages
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Land island 3 of 5 (rnr-tab-group) as a generic attribute-driven WAI-ARIA tabs element with persisted rnr-engine state, plus the InstallCommand composite embedding the existing CopyButton per engine panel, budget advanced to three in-commit.
**Success state:** Components exist, typecheck-clean, ARIA/panel/command/storage contract pinned by source scan, exactly three define sites; SHELL-007/SHELL-008 adopt them unchanged.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: MUST: both engines' panels are server-rendered in served HTML (T-SHELL-012); JS only toggles the hidden attribute — never fetches panel content
- MUST: MUST: exactly THREE define sites in the SAME commit; storage key exactly 'rnr-engine'; default nativewind
- MUST: MUST: DOM shape fixed here — tabs are buttons with role=tab; each panel a div role=tabpanel carrying data-engine; nativewind panel first in source order
- NEVER: NEVER: never render short-name or relative command forms; absolute-URL only
- NEVER: NEVER: never hide panels via max-height or client-fetch them; never put engine state in the URL
- NEVER: NEVER: never re-implement CopyButton or add a framework import
- STRICTLY: STRICTLY: attribute-driven — <rnr-tab-group storage-key="rnr-engine"> wrapping labeled panels — so no per-page JS is ever written
- STRICTLY: STRICTLY: WAI-ARIA tabs pattern (roving tabindex, ArrowLeft/Right, aria-selected) per TR-07 hard constraints
- STRICTLY: STRICTLY: behavioral flow proofs (FLOW-GEND-02 hero, FLOW-GEND-20 items) are SHELL-011/SHELL-012's — nothing imports these components until SHELL-007/008 adopt them
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: TabGroup emits role=tab buttons and role=tabpanel divs carrying data-engine with hidden-attribute toggling and storage-key="rnr-engine"; InstallCommand wraps one TabGroup whose nativewind panel precedes uniwind and whose command construction matches the locked absolute-URL shape
- [ ] AC-2: exactly THREE customElements.define sites (rnr-copy-button, rnr-theme-toggle, rnr-tab-group) and zero client-framework imports
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: TabGroup ARIA + InstallCommand command-shape source contract
  GIVEN: the source tree after SHELL-003 with no tab-group or InstallCommand files (RED)
  WHEN:  the contract scan reads TabGroup.astro, tab-group.ts and InstallCommand.astro from the real tree
  THEN:  TabGroup emits role=tab buttons and role=tabpanel divs carrying data-engine with hidden-attribute toggling and storage-key="rnr-engine"; InstallCommand wraps one TabGroup whose nativewind panel precedes uniwind and whose command construction matches the locked absolute-URL shape
  FLOW_REF:              None
  TEST_TIER:             unit
  VERIFICATION_SERVICE:  real filesystem source scan of apps/docs/src + real TypeScript compiler via pnpm typecheck
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED:   no page imports TabGroup/InstallCommand at this task's commit (SHELL-007/SHELL-008 adopt them in later waves), so no built artifact can observe them; the only real observable inside this task's write boundary is the real source tree, scanned without mocks. Behavioral proof is owned by SHELL-011 (FLOW-GEND-02) and SHELL-012 (FLOW-GEND-20) against the adopted DOM.
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
  TEST_FUNCTION:         SHELL-004-tab-group-island-contract
  VERIFY:                pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t SHELL-004-tab-group-island-contract
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF authored_island_sources: collect every .ts/.mjs/.js/.astro file under the real apps/docs/src tree, count customElements.define sites and scan for client-framework imports and the storage key
      MUST_OBSERVE: exactly 3 customElements.define sites: rnr-copy-button, rnr-theme-toggle, rnr-tab-group (3 of 3); tab-group.ts references the localStorage key `rnr-engine` exactly; tab-group.ts wires ARIA tabs: the strings role="tab", aria-selected, and hidden appear in the island wiring; 0 client-framework imports (react|react-dom|svelte|vue|preact|solid-js)
      MUST_NOT_OBSERVE: 4 or more define sites (island-budget breach); 2 or fewer define sites (budget not advanced 2 -> 3 in this commit); a framework import anywhere in apps/docs/src
    NEGATIVE_CONTROL: would fail if a framework island or a sixth island sneaks in — the define-site count would not equal exactly 3; tab-group.ts is a no-op stub that never wires role=tab/aria-selected or the `rnr-engine` storage key…

AC-2: Island budget advanced to exactly three, zero framework imports
  GIVEN: apps/docs/src with the new tab-group.ts island
  WHEN:  the modified island-budget source scan runs over the real tree
  THEN:  exactly THREE customElements.define sites (rnr-copy-button, rnr-theme-toggle, rnr-tab-group) and zero client-framework imports
  FLOW_REF:              None
  TEST_TIER:             unit
  VERIFICATION_SERVICE:  real filesystem source scan of apps/docs/src
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED:   pure static source scan — no runtime, no network (FUSE-09 precedent in this same file)
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
  TEST_FUNCTION:         FUSE-09-island-budget
  VERIFY:                pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t FUSE-09-island-budget
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF source_tree_post_003: scan apps/docs/src for define sites and framework imports
      MUST_OBSERVE: exactly `3` define sites: `rnr-copy-button`, `rnr-theme-toggle`, `rnr-tab-group`
      MUST_NOT_OBSERVE: `2` define sites (budget not advanced); `4`+ define sites; any framework import match
    NEGATIVE_CONTROL: would fail if a fourth define site appears (unauthorized island); any framework import appears…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: TabGroup carries the WAI-ARIA tabs contract: role=tab buttons, role=tabpanel divs with data-engine, hidden-attribute toggling, storage-key rnr-engine, window-guarded idempotent init.
- TC-2 [edge, → AC-1]: InstallCommand wraps one TabGroup, nativewind panel first, CopyButton embedded per panel, absolute-URL command construction, no max-height usage.
- TC-3 [edge, → AC-2]: Exactly three customElements.define sites (rnr-copy-button, rnr-theme-toggle, rnr-tab-group) and zero framework imports exist in apps/docs/src.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/components/islands/TabGroup.astro (NEW)
- apps/docs/src/scripts/tab-group.ts (NEW)
- apps/docs/src/components/InstallCommand.astro (NEW)
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts (MODIFY)
writeProhibited:
- packages/**
- apps/docs/src/pages/**
- apps/docs/src/layouts/**
Supersedes (deliberate changes to existing tests):
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Command regex locked: ^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$ — copy source is the displayed panel text so display and clipboard cannot drift
- localStorage key exactly 'rnr-engine'; engine state never in the URL
- Panels never client-fetched; hidden via the hidden attribute, never max-height tricks (served-HTML string pinned by the sprint-01 component-page spec)
- Copy success state observable by value within 500 ms, not by class name alone
- island-budget.test.ts updated in THIS commit (budget 2 -> 3)
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- apps/docs/src/scripts/copy-button.ts lines 20-35 — [PRIMARY PATTERN] connectedCallback per-instance wiring + dataset guard
- apps/docs/src/components/islands/CopyButton.astro lines 1-40 — island wrapper shape reused verbatim inside each panel
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md lines 78-113,423-440 — R7 install binding (TabGroup + CopyButton, zero-JS stacked+labelled); WAI-ARIA tabs; server-rendered panels
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts lines 1-63 — budget scan to advance 2→3; append SHELL-004-tab-group-island-contract here
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: attribute-driven vanilla custom element over server-rendered panels; visibility via hidden attribute only
Source: apps/docs/src/scripts/copy-button.ts:20-35
Anti-pattern: client-fetched panels, max-height reveal tricks, per-page tab JS, engine state in the URL
Interaction notes:
- tab click / arrow key: set aria-selected, roving tabindex, toggle hidden on the matching data-engine panel, persist storage-key value
- init reads persisted engine and activates that panel; default nativewind; idempotent under soft navigation
- copy success rides CopyButton's existing value-based data-state within 500 ms
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- tab-group + InstallCommand contract: `pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t SHELL-004-tab-group-island-contract`
  expected: exit 0
- budget exactly three: `pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t FUSE-09-island-budget`
  expected: exit 0
- typecheck: `pnpm typecheck`
  expected: exit 0
- lint: `./node_modules/.bin/biome ci apps/docs/src/components/islands/TabGroup.astro apps/docs/src/scripts/tab-group.ts apps/docs/src/components/InstallCommand.astro tests/sprint-01-docs-spike-skeleton/island-budget.test.ts`
  expected: exit 0
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-003
Blocks:     SHELL-007, SHELL-008, SHELL-010, SHELL-011, SHELL-012
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
One generic island reused by the hero (SHELL-007) and the item pages (SHELL-008). Attribute-driven — <rnr-tab-group storage-key="rnr-engine"> wrapping labeled panels — so no per-page JS is ever written. DOM shape fixed here: tabs as buttons with role=tab, each panel a div role=tabpanel carrying data-engine. Primary AC is unit-justified because nothing imports the components until SHELL-007/008 adopt them; behavioral flow proofs (FLOW-GEND-02/FLOW-GEND-20) are SHELL-011/SHELL-012's against the adopted DOM.
Coding standards:
- TypeScript strict; token-governed styles (--primary active tab, --ring indicator), zero hex
- RED first against the pre-task tree
- reuse CopyButton verbatim — no copy logic in tab-group.ts
Capability: touches=['CAP-DOCS-01', 'CAP-INST-01'] provides=3 items consumes=3 items; boundary_contracts=5
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-004",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "source_tree_post_003": {
   "description": "apps/docs/src on disk after SHELL-003: two define sites, no TabGroup/InstallCommand files (RED signature).",
   "seed_method": "build_artifact",
   "records": [
    "exactly 2 customElements.define sites",
    "no 'rnr-tab-group' string anywhere in apps/docs/src"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the source tree after SHELL-003 with no tab-group or InstallCommand files (RED) WHEN the contract scan reads TabGroup.astro, tab-group.ts and InstallCommand.astro from the real tree THEN TabGroup emits role=tab buttons and role=tabpanel divs carrying data-engine with hidden-attribute toggling and storage-key=\"rnr-engine\"; InstallCommand wraps one TabGroup whose nativewind panel precedes uniwind and whose command construction matches the locked absolute-URL shape",
   "maps_to_ac": null,
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/island-budget.test.ts",
   "test_function": "SHELL-004-tab-group-island-contract",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t SHELL-004-tab-group-island-contract",
   "test_tier": "unit",
   "verification_service": "real filesystem source scan of apps/docs/src + real TypeScript compiler via pnpm typecheck",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Pure static source-contract scan over the authored island sources \u2014 file reads only, no runtime behavior, no network, no rendering (the landed island-budget.test.ts pattern); the behavioral tabs/persistence/copy proof rides the e2e flow specs (SHELL-011/SHELL-012) as non-primary references.",
    "verification_service": "real filesystem read of the apps/docs/src island sources (island-budget scan)",
    "negative_control": {
     "would_fail_if": [
      "a framework island or a sixth island sneaks in \u2014 the define-site count would not equal exactly 3",
      "tab-group.ts is a no-op stub that never wires role=tab/aria-selected or the `rnr-engine` storage key",
      "the budget test is edited to assert nothing (count assertion removed) instead of the real 2 -> 3 advance"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_island_sources",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "collect every .ts/.mjs/.js/.astro file under the real apps/docs/src tree",
        "count customElements.define sites and scan for client-framework imports and the storage key"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 3 customElements.define sites: rnr-copy-button, rnr-theme-toggle, rnr-tab-group (3 of 3)",
        "tab-group.ts references the localStorage key `rnr-engine` exactly",
        "tab-group.ts wires ARIA tabs: the strings role=\"tab\", aria-selected, and hidden appear in the island wiring",
        "0 client-framework imports (react|react-dom|svelte|vue|preact|solid-js)"
       ],
       "must_not_observe": [
        "4 or more define sites (island-budget breach)",
        "2 or fewer define sites (budget not advanced 2 -> 3 in this commit)",
        "a framework import anywhere in apps/docs/src"
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
   "description": "GIVEN apps/docs/src with the new tab-group.ts island WHEN the modified island-budget source scan runs over the real tree THEN exactly THREE customElements.define sites (rnr-copy-button, rnr-theme-toggle, rnr-tab-group) and zero client-framework imports",
   "maps_to_ac": null,
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/island-budget.test.ts",
   "test_function": "FUSE-09-island-budget",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t FUSE-09-island-budget",
   "test_tier": "unit",
   "verification_service": "real filesystem source scan of apps/docs/src",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "verification_service": "real filesystem source scan",
    "negative_control": {
     "would_fail_if": [
      "a fourth define site appears (unauthorized island)",
      "any framework import appears",
      "the budget bump lands in a different commit than the island"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "source_tree_post_003",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "scan apps/docs/src for define sites and framework imports"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly `3` define sites: `rnr-copy-button`, `rnr-theme-toggle`, `rnr-tab-group`"
       ],
       "must_not_observe": [
        "`2` define sites (budget not advanced)",
        "`4`+ define sites",
        "any framework import match"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "TabGroup carries the WAI-ARIA tabs contract: role=tab buttons, role=tabpanel divs with data-engine, hidden-attribute toggling, storage-key rnr-engine, window-guarded idempotent init.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t SHELL-004-tab-group-island-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "InstallCommand wraps one TabGroup, nativewind panel first, CopyButton embedded per panel, absolute-URL command construction, no max-height usage.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t SHELL-004-tab-group-island-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Exactly three customElements.define sites (rnr-copy-button, rnr-theme-toggle, rnr-tab-group) and zero framework imports exist in apps/docs/src.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t FUSE-09-island-budget"
  }
 ]
}
-->
