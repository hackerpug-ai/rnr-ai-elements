================================================================================
TASK: APX-024 - Prove FLOW-DELIV-02-gated-deploy-order against a real GitHub Actions run
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     3
AGENT:      planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

PROPOSED BY: ghactions-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: nothing proves, on a real GitHub Actions run, that the docs deploy waits for every quality job. A workflow file can claim a gate that the run never honoured.

Why it matters: this is the gate's core claim for UC-DELIV-02. A deploy that can run before a red job, or that ships bytes nobody tied to a commit, defeats the whole pipeline.

Current: no main push run has a deploy job. The latest one (34271758930, 2026-09-08) has five jobs and no deploy. The active Worker version carries no commit message.

Desired: a live spec that reads the real run, the real job timings, the real deploy log, the real Worker version and the real apex, and passes only when all of them agree.

## Critical Constraints
MUST:
- MUST capture proof.red by running the flow command before the deploy job exists on GitHub main. It must fail because the latest main push run has no `deploy` job, and the failing output must be saved unedited.
- MUST assert against real data only: gh api for ci.yml on main and for the run's jobs, `gh run view --log` for the log, wrangler for the active version, and request.get for the apex.
- MUST fail closed when gh is unauthenticated, when no push run exists on main, or when the Worker version lookup fails.
NEVER:
- NEVER use act, a local runner, a fixture server, a canned API response, or a hand-written run.json.
- NEVER edit ci.yml, the live lane config, or support/github-run.ts.
STRICTLY:
- STRICTLY treat GREEN as gated by human-owned preconditions: the CLOUDFLARE_API_TOKEN repo secret, the sync PR that lands the deploy job on GitHub main, and the production environment (APX-020 checks them), plus Sprint 05's ORI-CI-003 and ORI-DEP-003. Until they are met the flow stays red, and that is the honest state. Never record GREEN by any other means.
- STRICTLY select the run under test as `latestPushRunOnMain()` at run time, and write its id and head_sha into run.json.

## Specification
Objective: Prove on a real GitHub Actions push run that the docs deploy runs only after registry, typecheck, lint, test and docs-e2e all succeed, is stamped with the commit, and serves the apex.
Success state: The flow command exits 0. The run's five upstream jobs concluded success, deploy started at or after the latest of them and concluded success, both preflight steps precede the wrangler step, the deploy log shows the ./dist assets upload, the active Worker version's workers/message equals the run's head_sha, and the apex returns 200 text/html. Before the sync it exits non-zero with `no deploy job`.

Provides:
- tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts, PRIMARY owner of FLOW-DELIV-02-gated-deploy-order
- evidence/FLOW-DELIV-02-gated-deploy-order/run.json (run id, head_sha, job timings and conclusions, Worker version message, apex response headers)
- evidence/FLOW-DELIV-02-gated-deploy-order/proof.red (the failing output captured before the deploy job reaches GitHub main)

Consumes:
- tests/sprint-07-deploy-live-at-apex/support/github-run.ts (APX-021)
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts (APX-006, the one shared live lane)
- the deploy job in ci.yml (APX-023)
- the live apex https://rnraielements.com/

Boundary contracts:
- CAP-DEP-01 consumer view: the proof reads what GitHub and Cloudflare actually recorded (job graph, timestamps, version annotation, apex response), never what the workflow file claims.
- Observe only. The spec never triggers a workflow, never deploys and never pushes.
- Runner pickup: the root playwright config ignores **/*.remote.spec.ts and root vitest only includes *.test.ts, so CI never collects this file. Only the shared live lane config picks it up, using the request fixture and gh/wrangler subprocesses with no browser.

Capabilities: CAP-DEP-01. PRD refs: UC-DELIV-02 AC-1; 12-e2e-testing-criteria T-DELIV-005; 11-technical-requirements/09 CAP-DEP-01.

## Acceptance Criteria
### AC-1: The deploy job ran only after the five jobs succeeded, with both preflights before wrangler [PRIMARY]
  GIVEN: the latest push-to-main ci run and the ci.yml on GitHub main
  WHEN:  the spec reads the workflow and the run's jobs through gh api
  THEN:  the deploy job's needs set equals {registry, typecheck, lint, test, docs-e2e}; the steps `Preflight dist` and `Preflight edge` both come before the cloudflare/wrangler-action step; registry, typecheck, lint, test and docs-e2e all concluded success; deploy started at or after the latest of their completed_at and concluded success
  TDD_STATE: RED
  FLOW_REF: FLOW-DELIV-02-gated-deploy-order
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-gated-deploy-order
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"primary":true,"tier":"visible","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","topology":"single-node","negative_control":{"would_fail_if":["the workflow has no deploy job","deploy needs omits docs-e2e or any other job","deploy started before an upstream job completed","an upstream job did not conclude success","wrangler runs before a preflight step"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_main_push_run","action":{"actor":"integrator","steps":["read the ci.yml on GitHub main and the jobs of the latest push run with gh api","compare deploy started_at with the latest upstream completed_at","read the step names of the deploy job"]},"end_state":{"must_observe":["needs set equals {registry, typecheck, lint, test, docs-e2e}","step order: `Preflight dist` < `Preflight edge` < wrangler step (`3` steps in that index order)","`conclusion` == `success` for all `5` upstream jobs","deploy `started_at` >= the latest upstream `completed_at` of the `5` jobs","deploy `conclusion` == `success`"],"must_not_observe":["no deploy job in run 34271758930 (the red state before the sync)","a skipped or failed deploy job"]}}]}
```

### AC-2: The active Worker version carries the run's commit
  GIVEN: the run from AC-1 and the Worker version currently receiving 100% of traffic
  WHEN:  the spec reads the version's annotations with the pinned wrangler
  THEN:  annotations['workers/message'] is a 40-hex string equal to the run's head_sha
  TDD_STATE: RED
  FLOW_REF: FLOW-DELIV-02-gated-deploy-order
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-gated-deploy-order
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","topology":"single-node","negative_control":{"would_fail_if":["the deploy omitted --message","the wrangler version drops the message on assets-only uploads","the version served is not the one this run deployed"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_main_push_run","action":{"actor":"integrator","steps":["read the active version id with `wrangler deployments status --config apps/docs/wrangler.jsonc --json`","read its annotations with `wrangler versions view <id> --json`"]},"end_state":{"must_observe":["annotations['workers/message'] matches /^[0-9a-f]{40}$/","it == the run's `head_sha` (`40` hex characters)"],"must_not_observe":["a null message (version bb65ae86-7586-45da-8bdb-27d734ded8b9 today)","a message that differs from head_sha","an empty message annotation"]}}]}
```

### AC-3: The log shows the assets upload and the apex serves HTML
  GIVEN: the deploy job of the run from AC-1 and the live apex
  WHEN:  the spec reads the deploy log and requests https://rnraielements.com/ with request.get
  THEN:  the log shows the wrangler-action deploy uploading static assets from ./dist with no token value in the text, and the apex returns 200 with content-type text/html
  TDD_STATE: RED
  FLOW_REF: FLOW-DELIV-02-gated-deploy-order
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-gated-deploy-order
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","topology":"single-node","negative_control":{"would_fail_if":["the deploy ran without uploading assets","the apex returns non-200","the apex returns a non-HTML content type","the log leaks the token","the apex response is replaced by a static fixture instead of a real request"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex","action":{"actor":"integrator","steps":["fetch the deploy job log with gh run view --log","GET https://rnraielements.com/ with request.get"]},"end_state":{"must_observe":["the log contains a wrangler assets upload line for `./dist`","status equals 200","`content-type` starts with `text/html`"],"must_not_observe":["a Cloudflare authentication error in the log","status 404 or 5xx","an empty deploy log (0 lines)"]}}]}
```

### AC-4: The order checker rejects real runs that are not gated deploys
  GIVEN: the latest completed pull_request ci run and the latest completed ci run whose conclusion is not success, both found by real gh queries
  WHEN:  the spec's order checker is run on each
  THEN:  the pull_request run is rejected with an error naming `push`, and the non-success run is rejected with an error naming `conclusion`
  TDD_STATE: RED
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts
  TEST_FUNCTION: APX-024-order-checker-rejects-non-deploy-runs
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep APX-024-order-checker-rejects-non-deploy-runs
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the checker passes any run that has some conclusion","the checker ignores the run event","the checker ignores a non-success conclusion","the checker is a no-op that accepts an empty jobs list"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_non_deploy_runs","action":{"actor":"spec","steps":["run the order checker on the latest completed pull_request ci run and its jobs"]},"end_state":{"must_observe":["the checker throws for the `pull_request` run","the error message contains `push`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}},{"start_ref":"real_non_deploy_runs","action":{"actor":"spec","steps":["run the order checker on the latest completed ci run whose conclusion is failure"]},"end_state":{"must_observe":["the checker throws for the run with `conclusion` != `success`","the error message contains `conclusion`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|----|-----------|---------|--------|
| TC-1 | The deploy job's needs set equals registry, typecheck, lint, test and docs-e2e in the ci.yml on GitHub main | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order |
| TC-2 | Deploy started_at is not before the latest upstream completed_at on the latest push run | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order |
| TC-3 | The flow command exits non-zero with `no deploy job` while the latest main push run has no deploy job | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order |
| TC-4 | The active Worker version's workers/message equals the run's head_sha | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order |
| TC-5 | The active Worker version's workers/message is not null after the first gated deploy | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order |
| TC-6 | The apex returns 200 with content-type text/html | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order |
| TC-7 | The deploy log contains a wrangler assets upload line for ./dist | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order |
| TC-8 | The order checker throws naming `push` for a real pull_request run | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep APX-024-order-checker-rejects-non-deploy-runs |
| TC-9 | The order checker throws naming `conclusion` for a real non-success run | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep APX-024-order-checker-rejects-non-deploy-runs |

## Reading List
- .spec/scenarios/UC-DELIV-02/gated-deploy-order.scenario.md (all): the visible scenario this flow proves
- tests/sprint-07-deploy-live-at-apex/support/github-run.ts (all): the observation helpers written by APX-021, read only
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts (all): the shared live lane written by APX-006, read only
- .github/workflows/ci.yml (all): the deploy job under test, after APX-023
- .spec/e2e-policy/surface.json (all): patterns the spec must match (request.get, rnraielements.com)

## Guardrails
WRITE-ALLOWED:
- tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-02-gated-deploy-order/run.json (NEW)
- tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-02-gated-deploy-order/proof.red (NEW)
WRITE-PROHIBITED:
- .github/workflows/** - workflow edits belong to APX-022 and APX-023
- tests/sprint-05-orient-search/** - other sprint lane
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - owned by APX-006, never edit
- tests/sprint-07-deploy-live-at-apex/support/github-run.ts - owned by APX-021, never edit
- vitest.config.ts - root runner
- playwright.config.ts - root runner

## Design
References: SPRINT.md gate steps 2 and 3; 07-uc-deliv.md UC-DELIV-02 AC-1
Pattern: test('FLOW-DELIV-02-gated-deploy-order', async ({ request }) => { const run = await latestPushRunOnMain(); const jobs = await jobs(run.id); assertGatedDeployOrder(run, jobs); ... const res = await request.get('https://rnraielements.com/'); ... }) (tests/sprint-05-orient-search/completed-site.remote.spec.ts (live public-origin spec style))
Anti-pattern: Asserting only the workflow YAML, or replaying a saved API response. Both pass with no real run behind them.

## Verification Gates
- typecheck: `pnpm typecheck` - Exit 0
- lint: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts` - Exit 0
- complexity: `pnpm check:fallow` - Exit 0
- FLOW-DELIV-02-gated-deploy-order: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order` - Before the human sync: non-zero exit with `no deploy job`, saved as proof.red. After the sync and one green deploy: exit 0 and run.json written
- tests: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep APX-024-order-checker-rejects-non-deploy-runs` - Exit 0 with one passing test, in a shell with real gh authentication

## Agent Instructions
TDD_MODE is red_first. Capture the RED proof first, then reach GREEN only through the human-owned preconditions.
1. RED: write `gated-deploy-order.remote.spec.ts` with the primary test titled exactly `FLOW-DELIV-02-gated-deploy-order`. Run the flow command before the deploy job exists on GitHub main. It must fail with `no deploy job`. Save the failing output unedited as `evidence/FLOW-DELIV-02-gated-deploy-order/proof.red`.
2. Build the assertions from real data only: `latestPushRunOnMain()`, `jobs()`, `jobLog()` and `workerVersionMessage()` from `support/github-run.ts` (APX-021, read only), `gh api` for main's ci.yml, and `request.get('https://rnraielements.com/')`.
3. Write the task-local test `APX-024-order-checker-rejects-non-deploy-runs`. Find the pull_request run and the non-success run by real gh queries at run time. Never hardcode run ids.
4. GREEN needs the human preconditions (secret, sync PR, production environment). Do not fake it. When a gated push run exists, rerun the flow command and let the test write `evidence/FLOW-DELIV-02-gated-deploy-order/run.json` with the run id, head_sha, job timings, version message and response headers.
5. Run every gate. Commit on the task's worktree. Never merge.

## Orchestrator Verification Protocol
The orchestrator re-runs typecheck, lint, complexity and the task-local test with real gh authentication. It opens proof.red and confirms it is real failing output naming `no deploy job`. It confirms the spec uses no mock, no saved API response and no `act`, and that `git diff` touches only the three WRITE-ALLOWED files. When a gated run exists, it reruns the flow command and compares run.json with `gh run view`.

## Evidence Gates
- proof.red: unedited failing output of the flow command captured before the deploy job reached GitHub main.
- After the human preconditions and one gated push: the flow command exiting 0 and run.json holding the run id, head_sha, upstream and deploy timings, the version message and the apex headers.
- Playwright output for the task-local rejection test.

## Review Criteria
REVIEWER CHECKS:
- The primary test reads the real run, jobs, log, Worker version and apex. Nothing is replayed or mocked.
- The order assertion compares deploy `started_at` with the latest upstream `completed_at` and requires `conclusion` of `success` for all five upstream jobs.
- The Worker message assertion requires 40 hex characters equal to the run's head_sha and fails on null.
- proof.red is real failing output and run.json is written by the test, not by hand.
- The task-local test finds its real runs by query at run time and hardcodes no run id.

## Dependencies
Depends on: ['APX-006', 'APX-021', 'APX-023']
Blocks:     []

## Notes
- Human-owned preconditions, stated plainly. GREEN for this flow needs all of them: (1) the `CLOUDFLARE_API_TOKEN` repo secret; (2) the sync PR that lands local main (605 commits ahead on 2026-09-29) on GitHub main; (3) the `production` environment limited to main; (4) the Cloudflare token scope Account Workers Scripts Edit, Account Settings Read and Zone Workers Routes Edit; (5) Sprint 05's ORI-CI-003 and ORI-DEP-003, which are cross-sprint ids and not dependencies. APX-020 checks the first three. Until they are met the flow is honestly RED and proof.red records it. Never record GREEN by any other means.
- This task is the PRIMARY owner of FLOW-DELIV-02-gated-deploy-order. AC-2 and AC-3 are bound to the same flow and replay the same command.
- The spec runs in the shared live lane (`live.playwright.config.ts`, owned by APX-006). Root vitest and the root playwright config never collect `*.remote.spec.ts`.
- The deploy stamp check (AC-2) is also the first real proof that wrangler 4.81.0 keeps `--message` on assets-only uploads.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"guardrails":{"write_allowed":["tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts (NEW)","tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-02-gated-deploy-order/run.json (NEW)","tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-02-gated-deploy-order/proof.red (NEW)",".tmp/APX-024/** (NEW - cycle evidence required by the sprint runner)"],"write_prohibited":[".github/workflows/** - workflow edits belong to APX-022 and APX-023","tests/sprint-05-orient-search/** - other sprint lane","tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - owned by APX-006, never edit","tests/sprint-07-deploy-live-at-apex/support/github-run.ts - owned by APX-021, never edit","vitest.config.ts - root runner","playwright.config.ts - root runner"]},"version":"1","task_id":"APX-024","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"real_main_push_run":{"description":"The latest push-triggered ci run on main of hackerpug-ai/rnr-ai-elements. At planning time it was run 34271758930 (2026-09-08) with no deploy job. After the human sync PR merges, it is the run that job produced.","seed_method":"public_api","records":["gh run list --workflow ci.yml --branch main --event push --limit 1","gh api repos/hackerpug-ai/rnr-ai-elements/actions/runs/{id}/jobs","gh api repos/hackerpug-ai/rnr-ai-elements/contents/.github/workflows/ci.yml?ref=main"]},"real_non_deploy_runs":{"description":"Two real historical ci runs found by query at run time. (a) The latest completed pull_request run, which never has a deploy job because deploy is push-only. (b) The latest completed run whose conclusion is not success (a failed PR run existed at planning time, 35423560538).","seed_method":"public_api","records":["gh run list --workflow ci.yml --event pull_request --status completed --limit 1","gh run list --workflow ci.yml --status failure --limit 1"]},"live_apex":{"description":"The real apex https://rnraielements.com/ served by the Worker rnr-ai-elements-docs.","seed_method":"public_api","records":["GET https://rnraielements.com/"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the latest push-to-main ci run and the ci.yml on GitHub main WHEN the spec reads the workflow and the run's jobs through gh api THEN the deploy job's needs set equals {registry, typecheck, lint, test, docs-e2e}; the steps `Preflight dist` and `Preflight edge` both come before the cloudflare/wrangler-action step; registry, typecheck, lint, test and docs-e2e all concluded success; deploy started at or after the latest of their completed_at and concluded success","primary":true,"flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":true,"tier":"visible","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","topology":"single-node","negative_control":{"would_fail_if":["the workflow has no deploy job","deploy needs omits docs-e2e or any other job","deploy started before an upstream job completed","an upstream job did not conclude success","wrangler runs before a preflight step"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_main_push_run","action":{"actor":"integrator","steps":["read the ci.yml on GitHub main and the jobs of the latest push run with gh api","compare deploy started_at with the latest upstream completed_at","read the step names of the deploy job"]},"end_state":{"must_observe":["needs set equals {registry, typecheck, lint, test, docs-e2e}","step order: `Preflight dist` < `Preflight edge` < wrangler step (`3` steps in that index order)","`conclusion` == `success` for all `5` upstream jobs","deploy `started_at` >= the latest upstream `completed_at` of the `5` jobs","deploy `conclusion` == `success`"],"must_not_observe":["no deploy job in run 34271758930 (the red state before the sync)","a skipped or failed deploy job"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the run from AC-1 and the Worker version currently receiving 100% of traffic WHEN the spec reads the version's annotations with the pinned wrangler THEN annotations['workers/message'] is a 40-hex string equal to the run's head_sha","primary":false,"flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","topology":"single-node","negative_control":{"would_fail_if":["the deploy omitted --message","the wrangler version drops the message on assets-only uploads","the version served is not the one this run deployed"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_main_push_run","action":{"actor":"integrator","steps":["read the active version id with `wrangler deployments status --config apps/docs/wrangler.jsonc --json`","read its annotations with `wrangler versions view <id> --json`"]},"end_state":{"must_observe":["annotations['workers/message'] matches /^[0-9a-f]{40}$/","it == the run's `head_sha` (`40` hex characters)"],"must_not_observe":["a null message (version bb65ae86-7586-45da-8bdb-27d734ded8b9 today)","a message that differs from head_sha","an empty message annotation"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the deploy job of the run from AC-1 and the live apex WHEN the spec reads the deploy log and requests https://rnraielements.com/ with request.get THEN the log shows the wrangler-action deploy uploading static assets from ./dist with no token value in the text, and the apex returns 200 with content-type text/html","primary":false,"flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","topology":"single-node","negative_control":{"would_fail_if":["the deploy ran without uploading assets","the apex returns non-200","the apex returns a non-HTML content type","the log leaks the token","the apex response is replaced by a static fixture instead of a real request"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex","action":{"actor":"integrator","steps":["fetch the deploy job log with gh run view --log","GET https://rnraielements.com/ with request.get"]},"end_state":{"must_observe":["the log contains a wrangler assets upload line for `./dist`","status equals 200","`content-type` starts with `text/html`"],"must_not_observe":["a Cloudflare authentication error in the log","status 404 or 5xx","an empty deploy log (0 lines)"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the latest completed pull_request ci run and the latest completed ci run whose conclusion is not success, both found by real gh queries WHEN the spec's order checker is run on each THEN the pull_request run is rejected with an error naming `push`, and the non-success run is rejected with an error naming `conclusion`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"APX-024-order-checker-rejects-non-deploy-runs","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep APX-024-order-checker-rejects-non-deploy-runs","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the checker passes any run that has some conclusion","the checker ignores the run event","the checker ignores a non-success conclusion","the checker is a no-op that accepts an empty jobs list"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_non_deploy_runs","action":{"actor":"spec","steps":["run the order checker on the latest completed pull_request ci run and its jobs"]},"end_state":{"must_observe":["the checker throws for the `pull_request` run","the error message contains `push`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}},{"start_ref":"real_non_deploy_runs","action":{"actor":"spec","steps":["run the order checker on the latest completed ci run whose conclusion is failure"]},"end_state":{"must_observe":["the checker throws for the run with `conclusion` != `success`","the error message contains `conclusion`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The deploy job's needs set equals registry, typecheck, lint, test and docs-e2e in the ci.yml on GitHub main","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"Deploy started_at is not before the latest upstream completed_at on the latest push run","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-1"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The flow command exits non-zero with `no deploy job` while the latest main push run has no deploy job","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-1"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"The active Worker version's workers/message equals the run's head_sha","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-2"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"The active Worker version's workers/message is not null after the first gated deploy","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-2"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"The apex returns 200 with content-type text/html","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-3"},{"id":"TC-7","type":"test_criterion","primary":false,"description":"The deploy log contains a wrangler assets upload line for ./dist","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run on hackerpug-ai/rnr-ai-elements, real Cloudflare Workers, real apex over HTTPS","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-3"},{"id":"TC-8","type":"test_criterion","primary":false,"description":"The order checker throws naming `push` for a real pull_request run","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"APX-024-order-checker-rejects-non-deploy-runs","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep APX-024-order-checker-rejects-non-deploy-runs","maps_to_ac":"AC-4"},{"id":"TC-9","type":"test_criterion","primary":false,"description":"The order checker throws naming `conclusion` for a real non-success run","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"APX-024-order-checker-rejects-non-deploy-runs","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep APX-024-order-checker-rejects-non-deploy-runs","maps_to_ac":"AC-4"}]}
-->
