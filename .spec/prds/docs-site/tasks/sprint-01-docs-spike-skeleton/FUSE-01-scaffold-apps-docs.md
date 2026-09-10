================================================================================
TASK: FUSE-01 - Scaffold apps/docs static Astro 7 package with the build chain pre-wired
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog (planning seed — owned by kb-run-sprint sync-status after first dispatch)
PRIORITY:   P0
POINTS:     3   # Fibonacci story points — relative size, never time
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

A clean clone's `pnpm install --frozen-lockfile` lists the docs package; the filtered build exits 0 with dist/index.html on disk; every later wave-B/D task builds on this package unchanged.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: apps/docs/package.json `name` is exactly `@rnr-ai-elements/docs` and `private: true`
- MUST: build script chains `pnpm -w run registry:build && pnpm -w run gallery:manifest && astro build` in that order so the gate log shows the ordered chain
- MUST: output stays static: no adapter package, no `output: 'server'`, no prerender overrides
- MUST: astro.config.mjs sets `site: 'https://rnraielements.com'` (canonical origin for every absolute-URL install command rendered downstream)
- NEVER: never add a dependency outside the TR-06 allowed set (no client framework, no Tailwind required this sprint)
- NEVER: never wire an SSR adapter or on-demand rendering
- NEVER: never call `astro dev` anywhere — the product surface is built dist over `astro preview`
- NEVER: never create apps/docs/src/data/** or apps/docs/public/r/** — both are FUSE-05's generated artifact
- STRICTLY: Astro 7 rust compiler is strict: unclosed non-void tags error and invalid nesting is not auto-corrected — write valid HTML in the layout and placeholder page
- STRICTLY: verify lint via `./node_modules/.bin/biome ci apps/docs` directly (local `pnpm lint` crashes — known quirk)

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: Filtered docs build runs the ordered chain and produces dist/
- [ ] AC-2: Package manifest is a static Astro 7 package inside the TR-06 allowed set
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: Filtered docs build runs the ordered chain and produces dist/
  GIVEN: the repo checkout with dependencies installed and (RED-at-start) no apps/docs package
  WHEN:  the integration test executes the real command `pnpm --filter @rnr-ai-elements/docs build` and inspects the real filesystem and captured stdout
  THEN:  the command exits 0, stdout shows `registry:build` completing before `gallery:manifest` before the `astro build` step, and `apps/docs/dist/index.html` exists as a real file

  FLOW_REF:             FLOW-DELIV-01-ci-chain-order
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real pnpm workspace filter + real registry/gallery build scripts + real Astro 7 build + real filesystem
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-ci-chain-order
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real pnpm workspace filter + real build chain + real filesystem
    NEGATIVE_CONTROL (would fail if):
      - apps/docs is a stub package.json with a hardcoded `echo` build script that never invokes registry:build or astro build
      - the build 'succeeds' by copying a checked-in dist/ directory instead of running the real Astro build
      - the chain order is swapped so gallery:manifest could consume a stale registry fan-out
    EVIDENCE: stdout (required_capture=true)
    CASE 1:
      START_REF: clean_checkout
      ACTOR: e2e_runner
        - run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, capturing stdout/stderr and exit code
        - stat `apps/docs/dist/index.html` on the real filesystem
      MUST_OBSERVE: exit code == 0
      MUST_OBSERVE: stdout contains `registry:build` output completing before `gallery:manifest` output, and both before the `astro build` output
      MUST_OBSERVE: `apps/docs/dist/index.html` exists with size > 0 bytes
      MUST_NOT_OBSERVE: exit code ERR_PNPM_NO_MATCHING_PACKAGE or any non-zero exit
      MUST_NOT_OBSERVE: `apps/docs/dist` empty or missing
      MUST_NOT_OBSERVE: 0 HTML files under apps/docs/dist
      MUST_NOT_OBSERVE: any `astro dev` invocation in the captured output

AC-2: Package manifest is a static Astro 7 package inside the TR-06 allowed set
  GIVEN: apps/docs/package.json and apps/docs/astro.config.mjs as authored by this task
  WHEN:  a focused test reads both files and asserts the structural contract
  THEN:  name is `@rnr-ai-elements/docs`, dependencies are a subset of the TR-06 allowed set, no adapter or client-framework package appears, `site` is `https://rnraielements.com`, output is static, and a `preview` script runs `astro preview`

  TEST_TIER: unit (UNIT_TEST_JUSTIFIED: pure structural assertion over two config files with no runtime behavior or external service)
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts
  TEST_FUNCTION: FUSE-01-manifest-contract
  VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t "FUSE-01-manifest-contract"

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: The integration test runs `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess and it exits 0.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t "FUSE-01-scaffold-build"
- TC-2: The captured build log shows `registry:build` before `gallery:manifest` before the Astro build step, and `apps/docs/dist/index.html` exists with size greater than 0.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t "FUSE-01-scaffold-build"
- TC-3: apps/docs/package.json name equals `@rnr-ai-elements/docs`, every dependency is inside the TR-06 allowed set, no adapter package is present, and astro.config.mjs sets `site: 'https://rnraielements.com'` with static output.
  maps_to_ac: AC-2 | type: structural | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t "FUSE-01-manifest-contract"

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- apps/docs/package.json (NEW)
- apps/docs/astro.config.mjs (NEW)
- apps/docs/tsconfig.json (NEW)
- apps/docs/src/env.d.ts (NEW)
- apps/docs/src/layouts/spike.astro (NEW)
- apps/docs/src/pages/index.astro (NEW)
- tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts (NEW)

writeProhibited:
- packages/registry/** — registry source is upstream of the docs
- scripts/build-gallery-manifest.ts — owned by the enrichment batch
- root package.json — the `e2e:docs` script belongs to FUSE-10
- playwright.config.ts — belongs to FUSE-10
- apps/docs/src/data/** and apps/docs/public/r/** — FUSE-05's generated artifact
- .gitignore public/r entry — owned by FUSE-05
- tests/sprint-01/** — another PRD's lane; writing there is rejected

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-DOCS-01
provides:
- workspace package `@rnr-ai-elements/docs` under apps/ (static Astro 7, no adapter, no SSR)
- apps/docs/astro.config.mjs with `site: 'https://rnraielements.com'` and default static output
- apps/docs build script pre-wired to run `pnpm -w run registry:build` then `pnpm -w run gallery:manifest` before `astro build` (FUSE-05 inserts the enrichment prebuild step later, wave C)
- `preview` script running `astro preview` on port 4321
- minimal spike layout (apps/docs/src/layouts/spike.astro) and placeholder index page
consumes:
- pnpm-workspace.yaml `apps/*` glob (already present — no root change needed)
- root scripts `registry:build` and `gallery:manifest`
boundary_contracts:
- TR-06 allowed dependency set for apps/docs: `astro ^7`, `@astrojs/mdx`, `astro-expressive-code`, `@tailwindcss/vite ^4.3.3` (optional in spike), `@astrojs/sitemap`, `ts-morph`, `qrcode`, plus `@playwright/test` for the harness — nothing else

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. package.json [1-40]
   Focus: root scripts registry:build / gallery:manifest the chain must invoke via `pnpm -w run`
2. pnpm-workspace.yaml [1-3]
   Focus: `apps/*` glob already covers the new package — no root edit needed
3. .spec/prds/docs-site/11-technical-requirements/06-external-dependencies.md [all]
   Focus: TR-06 allowed dependency set for apps/docs
4. .spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md [42-52]
   Focus: §3 turnkey runner chain order this scaffold pre-wires
5. .spec/prds/docs-site/ROADMAP.md [55-70]
   Focus: Sprint 01 gate entrypoint and Before (RED) state

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FUSE-01-scaffold-build
  Command:  pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t "FUSE-01"
  Expected: exit 0 — build chain ordered (registry:build → gallery:manifest → astro build) and apps/docs/dist/index.html present
Gate 2: FUSE-01-biome
  Command:  ./node_modules/.bin/biome ci apps/docs tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts
  Expected: exit 0 (never `pnpm lint` — crashes locally)

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Create the apps/docs Astro 7 static workspace package so that `pnpm --filter @rnr-ai-elements/docs build` runs the ordered upstream chain (registry:build → gallery:manifest → astro build) and produces dist/, and `astro preview` serves it at http://localhost:4321.

Design notes:
- Minimal styling is deliberate: the designed shell/tokens land in Sprint 02 — do not add a token stylesheet or Tailwind this sprint
- The placeholder index page exists only so `astro build` has a root route; FUSE-08 (wave D) replaces it entirely

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: none
Blocks:     FUSE-09, FUSE-10, FUSE-06, FUSE-07, FUSE-08

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-01",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "clean_checkout": {
   "description": "Clean clone of the repo with `pnpm install --frozen-lockfile` completed exit 0; apps/docs absent before this task (RED signature: `pnpm --filter @rnr-ai-elements/docs build` fails with no-matching-package).",
   "seed_method": "cli",
   "records": [
    "git clone exit 0",
    "pnpm install --frozen-lockfile exit 0",
    "pnpm --filter @rnr-ai-elements/docs build exits 0 after this task with apps/docs/dist/index.html present"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": false,
   "flow_ref": "FLOW-DELIV-01-ci-chain-order",
   "test_file": "tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts",
   "test_function": "FLOW-DELIV-01-ci-chain-order",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order",
   "test_tier": "integration",
   "verification_service": "real pnpm workspace filter + real registry/gallery build scripts + real Astro 7 build + real filesystem",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real pnpm workspace filter + real build chain + real filesystem",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "apps/docs is a stub package.json with a hardcoded `echo` build script that never invokes registry:build or astro build",
      "the build 'succeeds' by copying a checked-in dist/ directory instead of running the real Astro build",
      "the chain order is swapped so gallery:manifest could consume a stale registry fan-out"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "clean_checkout",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, capturing stdout/stderr and exit code",
        "stat `apps/docs/dist/index.html` on the real filesystem"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code == 0",
        "stdout contains `registry:build` output completing before `gallery:manifest` output, and both before the `astro build` output",
        "`apps/docs/dist/index.html` exists with size > 0 bytes"
       ],
       "must_not_observe": [
        "exit code ERR_PNPM_NO_MATCHING_PACKAGE or any non-zero exit",
        "`apps/docs/dist` empty or missing",
        "0 HTML files under apps/docs/dist",
        "any `astro dev` invocation in the captured output"
       ]
      }
     }
    ]
   },
   "given": "the repo checkout with dependencies installed and (RED-at-start) no apps/docs package",
   "when": "the integration test executes the real command `pnpm --filter @rnr-ai-elements/docs build` and inspects the real filesystem and captured stdout",
   "then": "the command exits 0, stdout shows `registry:build` completing before `gallery:manifest` before the `astro build` step, and `apps/docs/dist/index.html` exists as a real file",
   "num": 1,
   "name": "Filtered docs build runs the ordered chain and produces dist/",
   "type": "acceptance_criterion",
   "description": "GIVEN the repo checkout with dependencies installed and (RED-at-start) no apps/docs package WHEN the integration test executes the real command `pnpm --filter @rnr-ai-elements/docs build` and inspects the real filesystem and captured stdout THEN the command exits 0, stdout shows `registry:build` completing before `gallery:manifest` before the `astro build` step, and `apps/docs/dist/index.html` exists as a real file",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts",
   "test_function": "FUSE-01-manifest-contract",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t \"FUSE-01-manifest-contract\"",
   "test_tier": "unit",
   "verification_service": "real filesystem read of the authored package.json and astro.config.mjs",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": null,
   "given": "apps/docs/package.json and apps/docs/astro.config.mjs as authored by this task",
   "when": "a focused test reads both files and asserts the structural contract",
   "then": "name is `@rnr-ai-elements/docs`, dependencies are a subset of the TR-06 allowed set, no adapter or client-framework package appears, `site` is `https://rnraielements.com`, output is static, and a `preview` script runs `astro preview`",
   "num": 2,
   "name": "Package manifest is a static Astro 7 package inside the TR-06 allowed set",
   "type": "acceptance_criterion",
   "description": "GIVEN apps/docs/package.json and apps/docs/astro.config.mjs as authored by this task WHEN a focused test reads both files and asserts the structural contract THEN name is `@rnr-ai-elements/docs`, dependencies are a subset of the TR-06 allowed set, no adapter or client-framework package appears, `site` is `https://rnraielements.com`, output is static, and a `preview` script runs `astro preview`",
   "maps_to_ac": null,
   "unit_test_justified": "pure structural assertion over two config files with no runtime behavior or external service"
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The integration test runs `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess and it exits 0.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t \"FUSE-01-scaffold-build\""
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "The captured build log shows `registry:build` before `gallery:manifest` before the Astro build step, and `apps/docs/dist/index.html` exists with size greater than 0.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t \"FUSE-01-scaffold-build\""
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "apps/docs/package.json name equals `@rnr-ai-elements/docs`, every dependency is inside the TR-06 allowed set, no adapter package is present, and astro.config.mjs sets `site: 'https://rnraielements.com'` with static output.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts -t \"FUSE-01-manifest-contract\""
  }
 ]
}
-->
