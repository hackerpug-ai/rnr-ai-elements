================================================================================
TASK: SHELL-003 - ThemeToggle island + pre-paint flash-free theme script (rnr-theme, dark default, scheme-respecting)
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: astro-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: C
HUMAN-TEST-HOOK: theme-toggle-flips-persisted
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Land island 2 of 5 (rnr-theme-toggle) plus the DocsLayout pre-paint head script so every route renders the persisted or scheme-resolved theme with zero wrong-theme frames, dark-first, budget advanced to two in-commit.
**Success state:** Built HTML carries the inline pre-paint script in <head> and rnr-theme-toggle on every DocsLayout page; exactly two define sites; zero-JS keeps the site dark and readable.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: MUST: island-budget.test.ts expects exactly TWO define sites in the SAME commit that adds the island
- MUST: MUST: pre-paint script is is:inline + data-astro-rerun in DocsLayout <head>; resolution order stored-choice > system-scheme > dark; class set before first paint
- MUST: MUST: the toggle only mutates the class + localStorage the pre-paint script owns
- NEVER: NEVER: never ship the pre-paint logic as a fetched module (ClientRouter swapRootAttributes overwrites root attrs on soft nav — L2)
- NEVER: NEVER: never put theme state in the URL or add a client framework
- NEVER: NEVER: never emit `pnpm lint` (crashes locally) — use ./node_modules/.bin/biome ci <paths>
- STRICTLY: STRICTLY: spell 'rnr-theme-toggle' literally at the customElements.define site so the budget scan pins it
- STRICTLY: STRICTLY: flow proofs FLOW-SHELL-01/02 are SHELL-013's (wave G; ruling 4 — specs land after features on PR-gated main)
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: every served page's <head> carries an inline is:inline data-astro-rerun script mentioning rnr-theme and prefers-color-scheme, and the body contains rnr-theme-toggle
- [ ] AC-2: exactly TWO customElements.define sites (rnr-copy-button, rnr-theme-toggle) and zero client-framework imports
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: Pre-paint theme script served inline + toggle rendered on every built page
  GIVEN: the repo after SHELL-002 with DocsLayout adopted and no theme mechanism (RED)
  WHEN:  the test runs the real filtered docs build and scans the built dist HTML
  THEN:  every served page's <head> carries an inline is:inline data-astro-rerun script mentioning rnr-theme and prefers-color-scheme, and the body contains rnr-theme-toggle
  FLOW_REF:              FLOW-SHELL-01-theme-toggle-persisted-flash-free
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real pnpm filtered docs build chain + real Astro 7 build output + real filesystem scan of dist
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-toggle.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-01-theme-toggle-persisted-flash-free
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_docs_dist: run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess (ci-chain-order pattern), read dist pages' head scripts and body tags
      MUST_OBSERVE: head inline script with `data-astro-rerun` containing `rnr-theme` and `prefers-color-scheme` and a `dark` fallback; tag `rnr-theme-toggle` present on every DocsLayout page scanned
      MUST_NOT_OBSERVE: 0 inline theme scripts in head; theme logic only via external module src=; a DocsLayout page missing `rnr-theme-toggle`
    NEGATIVE_CONTROL: would fail if the theme script is emitted as a fetched module instead of is:inline; the script is omitted from DocsLayout so first paint runs theme-less (flash)…

AC-2: Island budget advanced to exactly two, zero framework imports
  GIVEN: apps/docs/src with the new theme-toggle.ts island
  WHEN:  the modified island-budget source scan runs over the real tree
  THEN:  exactly TWO customElements.define sites (rnr-copy-button, rnr-theme-toggle) and zero client-framework imports
  FLOW_REF:              None
  TEST_TIER:             unit
  VERIFICATION_SERVICE:  real filesystem source scan of apps/docs/src
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED:   pure static source scan — file reads only, no runtime, no network (FUSE-09 precedent in this same file)
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
  TEST_FUNCTION:         FUSE-09-island-budget
  VERIFY:                pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t FUSE-09-island-budget
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF source_tree_post_002: scan apps/docs/src for define sites and framework imports
      MUST_OBSERVE: exactly `2` define sites: `rnr-copy-button` (copy-button.ts), `rnr-theme-toggle` (theme-toggle.ts)
      MUST_NOT_OBSERVE: `1` define site (budget not advanced); `3`+ define sites; any framework import match
    NEGATIVE_CONTROL: would fail if a third define site is added (unauthorized island path); any react/svelte/vue/preact/solid import appears…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: Built pages' <head> contains the is:inline data-astro-rerun theme script mentioning rnr-theme and prefers-color-scheme.
- TC-2 [happy_path, → AC-1]: The rnr-theme-toggle element renders in the body of every built DocsLayout page.
- TC-3 [edge, → AC-2]: Exactly two customElements.define sites (rnr-copy-button, rnr-theme-toggle) and zero framework imports exist in apps/docs/src.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/components/islands/ThemeToggle.astro (NEW)
- apps/docs/src/scripts/theme-toggle.ts (NEW)
- apps/docs/src/layouts/DocsLayout.astro (MODIFY)
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts (MODIFY)
- tests/sprint-02-shell-hero/theme-toggle.spec.ts (NEW)
writeProhibited:
- packages/**
- apps/docs/src/pages/**
Supersedes (deliberate changes to existing tests):
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Theme never in the URL; key exactly 'rnr-theme'
- No flash on cold nav or reload — class present in served HTML's first parse (inline script, never a fetched module)
- Zero-JS: toggle hidden, site stays dark-first and fully readable
- island-budget.test.ts updated in THIS commit (per-commit budget advance keeps the sprint-01 lane green at every merge)
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- apps/docs/src/scripts/copy-button.ts lines 14-67 — [PRIMARY PATTERN] window-guarded init, registration guard, literal tag at define site, connectedCallback wiring
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts lines 1-63 — file this task modifies: budget 1→2; append SHELL-003-theme-island-contract here
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md lines 423-440 — five-island budget; pre-paint is:inline + data-astro-rerun; astro:page-load init; dark-first
- .spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md lines 28-63 — determinism seam (theme key pinned; addInitScript seeds before pre-paint) + landmines L2/L7
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: vanilla custom element + window-guarded init + is:inline data-astro-rerun head script mutating only the root theme class
Source: apps/docs/src/scripts/copy-button.ts:57-67
Anti-pattern: media-query-only theming, a fetched theme module, or any second mechanism beside the class flip + storage
Interaction notes:
- toggle click flips html class dark/light, writes localStorage 'rnr-theme', updates aria-pressed
- pre-paint: localStorage rnr-theme > prefers-color-scheme > dark
- data-astro-rerun re-executes the inline script after soft-navigation swaps
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- pre-paint + island contract: `pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t SHELL-003-theme-island-contract`
  expected: exit 0
- budget exactly two: `pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t FUSE-09-island-budget`
  expected: exit 0
- typecheck: `pnpm typecheck`
  expected: exit 0
- lint: `./node_modules/.bin/biome ci apps/docs/src/components/islands/ThemeToggle.astro apps/docs/src/scripts/theme-toggle.ts apps/docs/src/layouts/DocsLayout.astro tests/sprint-01-docs-spike-skeleton/island-budget.test.ts`
  expected: exit 0
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-002
Blocks:     SHELL-004, SHELL-008, SHELL-010, SHELL-013
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
T-SHELL-001/002 behavior: persisted, flash-free, dark-first, scheme-respecting. Resolution order stored-choice > system-scheme > dark, applied pre-paint. The toggle only mutates the class + storage the pre-paint script owns — no second theme mechanism, no media-query listener. Behavioral flow proofs (FLOW-SHELL-01/02) are SHELL-013's; this task's lane proves the island + pre-paint contract via island-budget.test.ts (build + dist scan + budget 1→2 in-commit so PR-gated CI stays green).
Coding standards:
- TypeScript strict; declare browser globals like copy-button.ts does (repo tsconfig has no DOM lib)
- token-governed styling, zero hex literals
- RED first: append the failing scan, watch it fail, then implement
Capability: touches=['CAP-DOCS-01'] provides=4 items consumes=2 items; boundary_contracts=4
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-003",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_docs_dist": {
   "description": "dist/ from the real chain `pnpm --filter @rnr-ai-elements/docs build` after this task, DocsLayout adopted on /registry, /components, /islands/copy-button.",
   "seed_method": "build_artifact",
   "records": [
    "build exit 0",
    "dist pages carry rnr-theme-toggle + inline theme script"
   ]
  },
  "source_tree_post_002": {
   "description": "apps/docs/src on disk after SHELL-002: one define site, no rnr-theme string anywhere (RED signature, verified at sprint start).",
   "seed_method": "build_artifact",
   "records": [
    "exactly 1 customElements.define site (rnr-copy-button)",
    "no 'rnr-theme' in apps/docs/src"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the repo after SHELL-002 with DocsLayout adopted and no theme mechanism (RED) WHEN the test runs the real filtered docs build and scans the built dist HTML THEN every served page's <head> carries an inline is:inline data-astro-rerun script mentioning rnr-theme and prefers-color-scheme, and the body contains rnr-theme-toggle",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_file": "tests/sprint-02-shell-hero/theme-toggle.spec.ts",
   "test_function": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_tier": "integration",
   "verification_service": "real pnpm filtered docs build chain + real Astro 7 build output + real filesystem scan of dist",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real docs build chain + dist scan",
    "negative_control": {
     "would_fail_if": [
      "the theme script is emitted as a fetched module instead of is:inline",
      "the script is omitted from DocsLayout so first paint runs theme-less (flash)",
      "Header never renders the rnr-theme-toggle mount point"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_docs_dist",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess (ci-chain-order pattern)",
        "read dist pages' head scripts and body tags"
       ]
      },
      "end_state": {
       "must_observe": [
        "head inline script with `data-astro-rerun` containing `rnr-theme` and `prefers-color-scheme` and a `dark` fallback",
        "tag `rnr-theme-toggle` present on every DocsLayout page scanned"
       ],
       "must_not_observe": [
        "0 inline theme scripts in head",
        "theme logic only via external module src=",
        "a DocsLayout page missing `rnr-theme-toggle`"
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
   "description": "GIVEN apps/docs/src with the new theme-toggle.ts island WHEN the modified island-budget source scan runs over the real tree THEN exactly TWO customElements.define sites (rnr-copy-button, rnr-theme-toggle) and zero client-framework imports",
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
      "a third define site is added (unauthorized island path)",
      "any react/svelte/vue/preact/solid import appears",
      "the budget bump lands in a different commit than the island"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "source_tree_post_002",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "scan apps/docs/src for define sites and framework imports"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly `2` define sites: `rnr-copy-button` (copy-button.ts), `rnr-theme-toggle` (theme-toggle.ts)"
       ],
       "must_not_observe": [
        "`1` define site (budget not advanced)",
        "`3`+ define sites",
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
   "description": "Built pages' <head> contains the is:inline data-astro-rerun theme script mentioning rnr-theme and prefers-color-scheme.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t SHELL-003-theme-island-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "The rnr-theme-toggle element renders in the body of every built DocsLayout page.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t SHELL-003-theme-island-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Exactly two customElements.define sites (rnr-copy-button, rnr-theme-toggle) and zero framework imports exist in apps/docs/src.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t FUSE-09-island-budget"
  }
 ]
}
-->
