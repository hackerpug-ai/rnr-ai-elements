================================================================================
TASK: FUSE-10 - pnpm e2e:docs turnkey runner over astro preview
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog (planning seed — owned by kb-run-sprint sync-status after first dispatch)
PRIORITY:   P0
POINTS:     5   # Fibonacci story points — relative size, never time
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

`pnpm e2e:docs` exits 0 in one run; `pnpm e2e:docs --grep TOKEN` selects only matching tests; every later task's verify command rides this runner.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: webServer.command uses `astro preview` (port 4321, strict), webServer.url http://localhost:4321, reuseExistingServer: !process.env.CI
- MUST: testMatch is **/*.spec.ts so sibling vitest *.test.ts files in the same lane directory are never double-run (root vitest include is tests/**/*.test.ts)
- MUST: retries: 0 in config; the flake policy forbids --retries on the CLI
- MUST: `pnpm e2e:docs --grep TOKEN` forwards the grep through pnpm to Playwright (pnpm passes flags after the script name)
- NEVER: never serve via `astro dev` or a static-file server other than astro preview
- NEVER: never run the whole `pnpm test` suite or bare directories as a verification gate (BROAD_PROOF_COMMAND is rejected)
- NEVER: never write into tests/sprint-01/
- STRICTLY: one invocation runs the ordered chain then the browser suite; the log must show registry:build before gallery:manifest before the docs build before Playwright
- STRICTLY: reporters: JUnit + HTML written under apps/docs/playwright-report/ (the flow artifact)

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: One command builds the fixture, serves dist via preview, and runs the Chromium lane green with retries 0
- [ ] AC-2: Config contract: preview-not-dev, strict 4321, three projects, retries 0
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: One command builds the fixture, serves dist via preview, and runs the Chromium lane green with retries 0
  GIVEN: a clean checkout with dependencies installed and (RED-at-start) no e2e:docs script
  WHEN:  the runner executes `pnpm e2e:docs` end to end, then `pnpm e2e:docs --grep FUSE-10-runner-turnkey`
  THEN:  both invocations exit 0; the log shows the ordered chain then Playwright reporting the canary passed with 0 failures and no retry lines; the grep run executes only the turnkey test

  FLOW_REF:             FLOW-DELIV-01-ci-chain-order
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real build chain + real astro preview server + Chromium
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-ci-chain-order
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real build chain + real astro preview server + Chromium
    NEGATIVE_CONTROL (would fail if):
      - the runner is a stub that runs `astro dev` instead of preview over the built dist
      - the webServer points at a pre-baked static copy so a broken build still passes
      - retries are set above 0, laundering a flaky failure into a pass
    EVIDENCE: stdout (required_capture=true)
    CASE 1:
      START_REF: runner_ready
      ACTOR: e2e_runner
        - run `pnpm e2e:docs` as a real shell command capturing the full log
        - the canary spec navigates to http://localhost:4321/ and asserts the response
      MUST_OBSERVE: exit code == 0 for the whole invocation
      MUST_OBSERVE: log shows `registry:build` before `gallery:manifest` before the docs build before the Playwright run
      MUST_OBSERVE: canary assertion: GET http://localhost:4321/ returns HTTP 200 with non-empty HTML title
      MUST_OBSERVE: Playwright summary shows >= 1 passed, 0 failed, 0 retries
      MUST_NOT_OBSERVE: exit code 1
      MUST_NOT_OBSERVE: 0 tests run
      MUST_NOT_OBSERVE: `astro dev` anywhere in the log
      MUST_NOT_OBSERVE: any `retried` line in the Playwright output
    CASE 2:
      START_REF: runner_ready
      ACTOR: e2e_runner
        - run `pnpm e2e:docs --grep FUSE-10-runner-turnkey` and read the per-test summary
      MUST_OBSERVE: exit code == 0
      MUST_OBSERVE: exactly 1 test matched the grep token in the summary (arg forwarding works end to end)
      MUST_NOT_OBSERVE: 0 matched tests (grep swallowed by pnpm)
      MUST_NOT_OBSERVE: unfiltered run of every spec in the lane

AC-2: Config contract: preview-not-dev, strict 4321, three projects, retries 0
  GIVEN: root playwright.config.ts as authored
  WHEN:  a focused test imports the config object and asserts the TR-11 contract
  THEN:  testDir is the sprint lane, webServer uses astro preview (never dev) on port 4321 strict with reuseExistingServer !CI, projects include desktop + mobile viewports and a javaScriptEnabled:false project, retries === 0, and testMatch excludes *.test.ts

  TEST_TIER: unit (UNIT_TEST_JUSTIFIED: pure config-object assertions — importing the config and checking fields involves no runtime service)
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/runner-config.test.ts
  TEST_FUNCTION: FUSE-10-config-contract
  VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t "FUSE-10-config-contract"

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: `pnpm e2e:docs` exits 0 in one run and its log shows registry:build, then gallery:manifest, then the docs build, then Playwright.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/runner.spec.ts --grep 
- TC-2: The canary navigation to http://localhost:4321/ returns HTTP 200 with a non-empty title, and the Playwright summary reports 0 failed and 0 retries.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/runner.spec.ts --grep 
- TC-3: `pnpm e2e:docs --grep FUSE-10-runner-turnkey` matches exactly 1 test, proving pnpm forwards --grep to Playwright.
  maps_to_ac: AC-1 | type: contract | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/runner.spec.ts --grep 
- TC-4: playwright.config.ts has retries === 0, webServer command containing `preview` and not `dev`, port 4321 strict, reuseExistingServer === !process.env.CI, a javaScriptEnabled:false project, and testMatch that excludes *.test.ts.
  maps_to_ac: AC-2 | type: structural | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t "FUSE-10-config-contract"

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- playwright.config.ts (ROOT, NEW) (NEW)
- package.json (ROOT — add only the e2e:docs script and the @playwright/test devDependency) (NEW)
- tests/harness/docs-preview.ts (NEW shared helpers) (NEW)
- tests/sprint-01-docs-spike-skeleton/runner.spec.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/runner-config.test.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts (NEW)

writeProhibited:
- apps/docs/src/** — pages and islands belong to FUSE-01/06/07/08/09
- apps/docs/package.json — FUSE-01 owns it (FUSE-05 extends prebuild later)
- tests/sprint-01/** — another PRD's lane; writing there is rejected
- .github/workflows/ci.yml — FUSE-12's (other batch)

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-DOCS-01
provides:
- root playwright.config.ts: testDir tests/sprint-01-docs-spike-skeleton, testMatch **/*.spec.ts, webServer = `astro preview` over the BUILT dist (strict port 4321, reuseExistingServer: !CI), Chromium desktop + mobile viewport projects + a javaScriptEnabled:false project, retries: 0, JUnit+HTML reporters into apps/docs/playwright-report/
- root package.json script `e2e:docs` = `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build && pnpm exec playwright install chromium && pnpm exec playwright test` — forwards CLI args (--grep etc.) to Playwright
- tests/harness/docs-preview.ts helpers: localhost-only navigation, clipboard permission grants, post-load wait primitive (L6/L7)
consumes:
- FUSE-01 apps/docs package + preview script
boundary_contracts:
- TR-11: Playwright over `astro preview` serving built dist/, never `astro dev`; Chromium only; `retries: 0`
- tests/sprint-01-docs-spike-skeleton/ is this sprint's lane; tests/sprint-01/ belongs to another PRD and must never be touched
- surface_policy .spec/e2e-policy/surface.json; coldboot_policy .spec/e2e-policy/coldboot.json — referenced, never re-created

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. .spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md [28-62]
   Focus: §2 determinism seam, §3 turnkey runner, §4 landmines L6/L7 — bake workarounds into tests/harness helpers
2. package.json [10-21]
   Focus: root scripts the chain reuses; e2e:smoke:* naming pattern to match
3. vitest.config.ts [17-23]
   Focus: vitest include tests/**/*.test.ts excludes apps/** — why *.spec.ts is the Playwright lane convention

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FUSE-10-runner-turnkey
  Command:  pnpm playwright test  --grep 
  Expected: exit 0 — chain ordered, preview serves dist, canary green, exactly 1 test matched
Gate 2: FUSE-10-config-contract
  Command:  pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t "FUSE-10-config-contract"
  Expected: exit 0 — retries 0, preview not dev, strict 4321, no-JS project present
Gate 3: FUSE-10-biome
  Command:  ./node_modules/.bin/biome ci playwright.config.ts tests/harness tests/sprint-01-docs-spike-skeleton/runner.spec.ts tests/sprint-01-docs-spike-skeleton/runner-config.test.ts
  Expected: exit 0

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Deliver the one-command turnkey runner `pnpm e2e:docs` that builds the real fixture through the ordered chain, serves the built dist via astro preview on strict port 4321, and runs the Chromium lane with retries 0 and arg forwarding.

Design notes:
- This runner is the harness the DELIV-03 proofs (FUSE-11/FUSE-12, other batch) execute in — keep the script a plain chain so CI can invoke the identical command
- pagefind is NOT wired this sprint

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: FUSE-01
Blocks:     FUSE-06, FUSE-07, FUSE-08, FUSE-11, FUSE-12

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-10",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "runner_ready": {
   "description": "Repo with dependencies installed, @playwright/test installed at the root, Chromium browser installed (idempotent), and the docs site buildable via the ordered chain.",
   "seed_method": "cli",
   "records": [
    "pnpm install --frozen-lockfile exit 0 (lists @playwright/test)",
    "pnpm exec playwright install chromium exit 0 (idempotent)",
    "pnpm e2e:docs exit 0 in one run with the canary spec passing"
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
   "test_tier": "e2e",
   "verification_service": "real build chain + real astro preview server + Chromium",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real build chain + real astro preview server + Chromium",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the runner is a stub that runs `astro dev` instead of preview over the built dist",
      "the webServer points at a pre-baked static copy so a broken build still passes",
      "retries are set above 0, laundering a flaky failure into a pass"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "runner_ready",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run `pnpm e2e:docs` as a real shell command capturing the full log",
        "the canary spec navigates to http://localhost:4321/ and asserts the response"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code == 0 for the whole invocation",
        "log shows `registry:build` before `gallery:manifest` before the docs build before the Playwright run",
        "canary assertion: GET http://localhost:4321/ returns HTTP 200 with non-empty HTML title",
        "Playwright summary shows >= 1 passed, 0 failed, 0 retries"
       ],
       "must_not_observe": [
        "exit code 1",
        "0 tests run",
        "`astro dev` anywhere in the log",
        "any `retried` line in the Playwright output"
       ]
      }
     },
     {
      "start_ref": "runner_ready",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run `pnpm e2e:docs --grep FUSE-10-runner-turnkey` and read the per-test summary"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code == 0",
        "exactly 1 test matched the grep token in the summary (arg forwarding works end to end)"
       ],
       "must_not_observe": [
        "0 matched tests (grep swallowed by pnpm)",
        "unfiltered run of every spec in the lane"
       ]
      }
     }
    ]
   },
   "given": "a clean checkout with dependencies installed and (RED-at-start) no e2e:docs script",
   "when": "the runner executes `pnpm e2e:docs` end to end, then `pnpm e2e:docs --grep FUSE-10-runner-turnkey`",
   "then": "both invocations exit 0; the log shows the ordered chain then Playwright reporting the canary passed with 0 failures and no retry lines; the grep run executes only the turnkey test",
   "num": 1,
   "name": "One command builds the fixture, serves dist via preview, and runs the Chromium lane green with retries 0",
   "type": "acceptance_criterion",
   "description": "GIVEN a clean checkout with dependencies installed and (RED-at-start) no e2e:docs script WHEN the runner executes `pnpm e2e:docs` end to end, then `pnpm e2e:docs --grep FUSE-10-runner-turnkey` THEN both invocations exit 0; the log shows the ordered chain then Playwright reporting the canary passed with 0 failures and no retry lines; the grep run executes only the turnkey test",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/runner-config.test.ts",
   "test_function": "FUSE-10-config-contract",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t \"FUSE-10-config-contract\"",
   "test_tier": "unit",
   "verification_service": "import of the real playwright.config.ts module",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": null,
   "given": "root playwright.config.ts as authored",
   "when": "a focused test imports the config object and asserts the TR-11 contract",
   "then": "testDir is the sprint lane, webServer uses astro preview (never dev) on port 4321 strict with reuseExistingServer !CI, projects include desktop + mobile viewports and a javaScriptEnabled:false project, retries === 0, and testMatch excludes *.test.ts",
   "num": 2,
   "name": "Config contract: preview-not-dev, strict 4321, three projects, retries 0",
   "type": "acceptance_criterion",
   "description": "GIVEN root playwright.config.ts as authored WHEN a focused test imports the config object and asserts the TR-11 contract THEN testDir is the sprint lane, webServer uses astro preview (never dev) on port 4321 strict with reuseExistingServer !CI, projects include desktop + mobile viewports and a javaScriptEnabled:false project, retries === 0, and testMatch excludes *.test.ts",
   "maps_to_ac": null,
   "unit_test_justified": "pure config-object assertions \u2014 importing the config and checking fields involves no runtime service"
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "`pnpm e2e:docs` exits 0 in one run and its log shows registry:build, then gallery:manifest, then the docs build, then Playwright.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/runner.spec.ts --grep "
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "The canary navigation to http://localhost:4321/ returns HTTP 200 with a non-empty title, and the Playwright summary reports 0 failed and 0 retries.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/runner.spec.ts --grep "
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "`pnpm e2e:docs --grep FUSE-10-runner-turnkey` matches exactly 1 test, proving pnpm forwards --grep to Playwright.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/runner.spec.ts --grep "
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "playwright.config.ts has retries === 0, webServer command containing `preview` and not `dev`, port 4321 strict, reuseExistingServer === !process.env.CI, a javaScriptEnabled:false project, and testMatch that excludes *.test.ts.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/runner-config.test.ts -t \"FUSE-10-config-contract\""
  }
 ]
}
-->
