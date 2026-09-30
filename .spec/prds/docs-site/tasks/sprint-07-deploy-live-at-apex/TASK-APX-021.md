================================================================================
TASK: APX-021 - Add the real-GitHub observation support module for the shared live lane
================================================================================

TASK_TYPE:  INFRA
STATUS:     Backlog
PRIORITY:   P1
POINTS:     2
AGENT:      planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

PROPOSED BY: ghactions-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: the two live specs (APX-024 and APX-025) need to read real GitHub Actions runs, job timings, logs, artifacts and the active Worker version's message. Without one shared, honest helper, each spec would grow its own copy, and a copy that returns an empty value on failure would let a live proof pass with no data.

Why it matters: the deploy-order proof is only as honest as the data it reads. Every helper must return real data or throw a named error.

Current: no such module exists.

Desired: `tests/sprint-07-deploy-live-at-apex/support/github-run.ts` with five read-only helpers, each proven in the live lane against the real repo and the real Worker.

## Critical Constraints
MUST:
- MUST throw an error naming the run id, job id, artifact name or missing variable when a lookup fails, never return an empty or default value.
- MUST return the workers/message annotation string or null, and null means the active version carries no message.
- MUST resolve the repo slug from the git remote (or GITHUB_REPOSITORY), not hardcode it.
NEVER:
- NEVER print or log the CLOUDFLARE_API_TOKEN value.
- NEVER call `gh workflow run`, `gh run rerun`, `wrangler deploy` or any mutating command.
STRICTLY:
- STRICTLY keep this file under tests/sprint-07-deploy-live-at-apex/support/ so it is never collected by the root vitest or playwright runs.

## Specification
Objective: Give the two live specs one honest way to read GitHub Actions runs, job timings, logs, artifacts and the active Worker version's message.
Success state: Each helper returns the real data for a real run or throws a named error. The five helper behaviours pass in the live lane against the real repo and the real Worker.

Provides:
- tests/sprint-07-deploy-live-at-apex/support/github-run.ts: latestPushRunOnMain(), jobs(runId), jobLog(runId, jobId), downloadArtifact(runId, name), workerVersionMessage()

Consumes:
- gh CLI
- GitHub REST actions/runs, actions/runs/{id}/jobs, actions/artifacts
- wrangler pinned in apps/docs (4.81.0) plus the CLOUDFLARE_API_TOKEN environment variable
- the shared live lane config from APX-006, which owns the runner

Boundary contracts:
- Every call is a real gh or wrangler invocation and fails closed on a non-zero exit. There is no fixture and no mock.
- Read-only against GitHub and Cloudflare. It never triggers a workflow and never deploys.
- The module holds no runner config. The runner is the lane in live.playwright.config.ts.

Capabilities: CAP-DEP-01. PRD refs: 11-technical-requirements/11 e2e-testing; 12-e2e-testing-criteria T-DELIV-005..008.

## Acceptance Criteria
### AC-1: jobs() returns the real job graph for a real run
  GIVEN: the latest completed pull_request ci run
  WHEN:  jobs(runId) is called
  THEN:  it returns entries for typecheck, lint, test, registry and docs-e2e, each with name, conclusion, started_at and completed_at, and started_at is not after completed_at
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts
  TEST_FUNCTION: APX-021-jobs-graph
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-jobs-graph
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["jobs() returns a hardcoded list","jobs() drops the timestamps","jobs() returns an empty array for a real run"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_ci_history","action":{"actor":"spec","steps":["find the latest completed pull_request ci run with gh run list","call jobs(runId)","read `gh api repos/{repo}/actions/runs/{id}/jobs` independently"]},"end_state":{"must_observe":["the five names typecheck, lint, test, registry, docs-e2e are all present","each `conclusion` == the independent `gh api` reading","every `started_at` is an ISO timestamp not after its `completed_at` (`5` jobs checked)"],"must_not_observe":["an empty array","a job missing started_at"]}}]}
```

### AC-2: latestPushRunOnMain() returns a real main push run
  GIVEN: the real repo's ci history
  WHEN:  latestPushRunOnMain() is called
  THEN:  the run's event is push, its branch is main, its head_sha is 40 hex characters, and it equals the newest run in an independent `gh run list --branch main --event push` reading
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts
  TEST_FUNCTION: APX-021-latest-push-run
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-latest-push-run
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the helper returns a pull_request run","the helper returns a run from another branch","the helper returns a run older than the newest push run","the helper returns a hardcoded run id instead of querying GitHub"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_ci_history","action":{"actor":"spec","steps":["call latestPushRunOnMain()","read `gh run list --workflow ci.yml --branch main --event push --limit 1 --json databaseId,headSha` independently"]},"end_state":{"must_observe":["`event` == `push`","`head_branch` == `main`","head_sha matches /^[0-9a-f]{40}$/","run id == the independent `gh run list` `databaseId`"],"must_not_observe":["event equals pull_request","a run id different from the independent reading","an empty run (0 runs returned)"]}}]}
```

### AC-3: jobLog() returns real log text and rejects an unknown job
  GIVEN: a finished job of the latest completed pull_request ci run, and the job id 1 which does not exist
  WHEN:  jobLog is called for each
  THEN:  the real job's log is non-empty text containing `Set up job`, and the call for job id 1 rejects with an error naming job id 1
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts
  TEST_FUNCTION: APX-021-job-log
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-job-log
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["jobLog returns an empty string for a real job","jobLog returns an empty string instead of throwing for a missing job","the helper reads a stubbed log"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_ci_history","action":{"actor":"spec","steps":["call jobLog for the `typecheck` job of the latest completed pull_request run"]},"end_state":{"must_observe":["the log text is longer than 200 characters","the log contains `Set up job`"],"must_not_observe":["an empty string"]}},{"start_ref":"missing_things","action":{"actor":"spec","steps":["call jobLog for job id 1"]},"end_state":{"must_observe":["the call rejects for job id `1`","the error message contains `1` as the job id and the word `job`"],"must_not_observe":["a resolved empty string","a resolved value of any kind"]}}]}
```

### AC-4: downloadArtifact() fails closed for a missing artifact
  GIVEN: the latest completed pull_request ci run, which has no artifact named apx-021-no-such-artifact
  WHEN:  downloadArtifact(runId, 'apx-021-no-such-artifact') is called
  THEN:  it rejects with an error naming the artifact and the run id, and it leaves no empty destination directory behind
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts
  TEST_FUNCTION: APX-021-artifact-fail-closed
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-artifact-fail-closed
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the helper resolves with an empty directory","the helper resolves with a path that does not exist","the helper swallows the gh error"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"missing_things","action":{"actor":"spec","steps":["call downloadArtifact with the latest completed pull_request run id and the name apx-021-no-such-artifact"]},"end_state":{"must_observe":["the call rejects for artifact `apx-021-no-such-artifact`","the error message contains apx-021-no-such-artifact and the run id","the destination directory `does not exist` afterward (0 entries created)"],"must_not_observe":["a resolved value","an existing empty destination directory"]}}]}
```

### AC-5: workerVersionMessage() matches wrangler and fails closed without a token
  GIVEN: the real Worker rnr-ai-elements-docs and a shell with the deploy token available
  WHEN:  workerVersionMessage() is called, and again with CLOUDFLARE_API_TOKEN removed from the child environment
  THEN:  the first call returns exactly the annotations['workers/message'] value from an independent `wrangler versions view --json` reading (null today), and the second call rejects with an error naming CLOUDFLARE_API_TOKEN
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts
  TEST_FUNCTION: APX-021-worker-message
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-worker-message
  TEST_TIER: integration
  VERIFICATION_SERVICE: real Cloudflare Workers API through wrangler
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Cloudflare Workers API through wrangler","topology":"single-node","negative_control":{"would_fail_if":["the helper returns a hardcoded sha","the helper returns an empty string instead of null when no message exists","the helper succeeds with no token"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"live_worker","action":{"actor":"spec","steps":["call workerVersionMessage()","read the active version with `wrangler versions view <id> --config apps/docs/wrangler.jsonc --json` independently"]},"end_state":{"must_observe":["the returned value equals the independent annotations['workers/message'] reading","on the 2026-09-29 state the value is null","once a gated deploy has run the value matches /^[0-9a-f]{40}$/"],"must_not_observe":["an empty string","a value that differs from the independent reading"]}},{"start_ref":"live_worker","action":{"actor":"spec","steps":["call workerVersionMessage() with CLOUDFLARE_API_TOKEN deleted from the child environment"]},"end_state":{"must_observe":["the call rejects with no `CLOUDFLARE_API_TOKEN` in the child environment","the error message contains `CLOUDFLARE_API_TOKEN`"],"must_not_observe":["a resolved value","no error message, meaning a default value was returned"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|----|-----------|---------|--------|
| TC-1 | jobs() returns the five job names typecheck, lint, test, registry and docs-e2e for a real pull_request ci run | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-jobs-graph |
| TC-2 | latestPushRunOnMain() returns a run whose event is push and whose head_sha is 40 hex characters | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-latest-push-run |
| TC-3 | jobLog() returns text containing `Set up job` for a finished real job | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-job-log |
| TC-4 | jobLog() rejects when the job id does not exist | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-job-log |
| TC-5 | downloadArtifact() rejects when the artifact name does not exist on the run | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-artifact-fail-closed |
| TC-6 | workerVersionMessage() equals the independent wrangler reading of workers/message | AC-5 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-worker-message |
| TC-7 | workerVersionMessage() rejects when CLOUDFLARE_API_TOKEN is absent from the environment | AC-5 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-worker-message |

## Reading List
- .github/workflows/ci.yml (all): job ids the helpers must recognise
- apps/docs/wrangler.jsonc (all): the config path wrangler is pointed at
- tests/harness/docs-preview.ts (all): house style for a harness module in tests/

## Guardrails
WRITE-ALLOWED:
- tests/sprint-07-deploy-live-at-apex/support/github-run.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts (NEW)
WRITE-PROHIBITED:
- vitest.config.ts - root runner
- playwright.config.ts - root runner
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - owned by APX-006, read only
- .github/workflows/** - workflow edits belong to APX-022 and APX-023
- tests/sprint-05-orient-search/** - other sprint lane

## Design
References: SPRINT.md gate steps 2-4; 11-technical-requirements/11 e2e-testing
Pattern: Thin wrappers over spawnSync('gh', [...]) that parse --json output and throw on a non-zero exit. (scripts/docs-deploy/prepare.ts:1-60)
Anti-pattern: A helper that returns [] or '' on failure, which lets a live spec pass with no data.

## Verification Gates
- typecheck: `pnpm typecheck` - Exit 0
- lint: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/support/github-run.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts` - Exit 0
- complexity: `pnpm check:fallow` - Exit 0
- tests: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts` - Exit 0 with five passing tests, in a shell with real gh authentication and CLOUDFLARE_API_TOKEN

## Agent Instructions
TDD_MODE is skipped (INFRA), so there is no RED to GREEN ceremony. The real-services proof still applies to every AC.
1. Read the reading list. Confirm `live.playwright.config.ts` exists (APX-006) before writing the spec.
2. Write `support/github-run.ts` as thin spawnSync wrappers. Every helper throws a named error on a non-zero exit, an empty result, or a missing variable. `workerVersionMessage()` reads `CLOUDFLARE_API_TOKEN` from the environment and throws naming it when absent.
3. Write the spec. Find the run, job and version under test by real queries at run time (latest completed pull_request run, job id 1, artifact `apx-021-no-such-artifact`). Never hardcode run ids. In each test, make a second independent `gh` or `wrangler` reading and compare.
4. Run every gate in a shell with gh authentication and the deploy token. Commit on the task's worktree. Never merge.

## Orchestrator Verification Protocol
The orchestrator re-runs typecheck, lint, complexity and the five-test gate with real gh authentication and the deploy token. It searches the module for `workflow run`, `rerun`, `deploy` and any POST, PUT, PATCH or DELETE call, and rejects any hit. It confirms `git diff` touches only the two WRITE-ALLOWED files and that no test hardcodes a run id.

## Evidence Gates
- Playwright output showing five passing tests.
- Captured stdout of the not-found cases (job id 1, missing artifact, missing token), showing the named errors.
- The independent wrangler reading beside the helper's return value (null on the 2026-09-29 state).

## Review Criteria
REVIEWER CHECKS:
- No helper returns an empty array, an empty string or a default on failure.
- `workerVersionMessage()` returns null only when the annotation is absent and never an empty string.
- No code path prints the token, and no mutating gh or wrangler command exists.
- The module lives only under `tests/sprint-07-deploy-live-at-apex/support/`.

## Dependencies
Depends on: ['APX-006']
Blocks:     ['APX-024', 'APX-025']

## Notes
- Dark task: test-support plumbing with no user-facing surface. Gate steps 2-4 exercise it through APX-024 and APX-025.
- The five specs run in the shared live lane (`live.playwright.config.ts`, owned by APX-006). Root vitest and the root playwright config never collect `*.remote.spec.ts`, so CI cannot run these network tests.
- Human-owned preconditions, stated plainly: the `CLOUDFLARE_API_TOKEN` repo secret, the sync PR that lands the deploy job on GitHub main, the `production` environment, and the Cloudflare zone-edit token scope. AC-5 needs the deploy token in the shell that runs it (it exists only in the local, gitignored `.env`). Sprint 05's ORI-CI-003 and ORI-DEP-003 are also preconditions, never dependencies.
- The positive path of `downloadArtifact()` needs a real `docs-dist` artifact from a gated run. That exists only after the human preconditions are met, so APX-025 proves it. This task proves only the fail-closed path.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"APX-021","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"real_ci_history":{"description":"The real ci workflow history of hackerpug-ai/rnr-ai-elements. The latest completed pull_request run has the five jobs typecheck, lint, test, registry and docs-e2e. Push runs on main exist (latest 34271758930 dated 2026-09-08 at planning time).","seed_method":"public_api","records":["gh run list --workflow ci.yml --event pull_request --status completed --limit 1","gh run list --workflow ci.yml --branch main --event push --limit 1"]},"missing_things":{"description":"Identifiers GitHub cannot resolve: job id 1, artifact name apx-021-no-such-artifact.","seed_method":"public_api","records":["job id 1","artifact apx-021-no-such-artifact"]},"live_worker":{"description":"The real Worker rnr-ai-elements-docs serving the apex. Observed 2026-09-29: active version bb65ae86-7586-45da-8bdb-27d734ded8b9 carries only workers/triggered_by, so its message is null.","seed_method":"public_api","records":["wrangler deployments status --config apps/docs/wrangler.jsonc --json"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the latest completed pull_request ci run WHEN jobs(runId) is called THEN it returns entries for typecheck, lint, test, registry and docs-e2e, each with name, conclusion, started_at and completed_at, and started_at is not after completed_at","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-jobs-graph","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-jobs-graph","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["jobs() returns a hardcoded list","jobs() drops the timestamps","jobs() returns an empty array for a real run"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_ci_history","action":{"actor":"spec","steps":["find the latest completed pull_request ci run with gh run list","call jobs(runId)","read `gh api repos/{repo}/actions/runs/{id}/jobs` independently"]},"end_state":{"must_observe":["the five names typecheck, lint, test, registry, docs-e2e are all present","each `conclusion` == the independent `gh api` reading","every `started_at` is an ISO timestamp not after its `completed_at` (`5` jobs checked)"],"must_not_observe":["an empty array","a job missing started_at"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the real repo's ci history WHEN latestPushRunOnMain() is called THEN the run's event is push, its branch is main, its head_sha is 40 hex characters, and it equals the newest run in an independent `gh run list --branch main --event push` reading","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-latest-push-run","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-latest-push-run","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the helper returns a pull_request run","the helper returns a run from another branch","the helper returns a run older than the newest push run","the helper returns a hardcoded run id instead of querying GitHub"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_ci_history","action":{"actor":"spec","steps":["call latestPushRunOnMain()","read `gh run list --workflow ci.yml --branch main --event push --limit 1 --json databaseId,headSha` independently"]},"end_state":{"must_observe":["`event` == `push`","`head_branch` == `main`","head_sha matches /^[0-9a-f]{40}$/","run id == the independent `gh run list` `databaseId`"],"must_not_observe":["event equals pull_request","a run id different from the independent reading","an empty run (0 runs returned)"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN a finished job of the latest completed pull_request ci run, and the job id 1 which does not exist WHEN jobLog is called for each THEN the real job's log is non-empty text containing `Set up job`, and the call for job id 1 rejects with an error naming job id 1","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-job-log","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-job-log","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["jobLog returns an empty string for a real job","jobLog returns an empty string instead of throwing for a missing job","the helper reads a stubbed log"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_ci_history","action":{"actor":"spec","steps":["call jobLog for the `typecheck` job of the latest completed pull_request run"]},"end_state":{"must_observe":["the log text is longer than 200 characters","the log contains `Set up job`"],"must_not_observe":["an empty string"]}},{"start_ref":"missing_things","action":{"actor":"spec","steps":["call jobLog for job id 1"]},"end_state":{"must_observe":["the call rejects for job id `1`","the error message contains `1` as the job id and the word `job`"],"must_not_observe":["a resolved empty string","a resolved value of any kind"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the latest completed pull_request ci run, which has no artifact named apx-021-no-such-artifact WHEN downloadArtifact(runId, 'apx-021-no-such-artifact') is called THEN it rejects with an error naming the artifact and the run id, and it leaves no empty destination directory behind","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-artifact-fail-closed","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-artifact-fail-closed","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the helper resolves with an empty directory","the helper resolves with a path that does not exist","the helper swallows the gh error"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"missing_things","action":{"actor":"spec","steps":["call downloadArtifact with the latest completed pull_request run id and the name apx-021-no-such-artifact"]},"end_state":{"must_observe":["the call rejects for artifact `apx-021-no-such-artifact`","the error message contains apx-021-no-such-artifact and the run id","the destination directory `does not exist` afterward (0 entries created)"],"must_not_observe":["a resolved value","an existing empty destination directory"]}}]}},{"id":"AC-5","type":"acceptance_criterion","description":"GIVEN the real Worker rnr-ai-elements-docs and a shell with the deploy token available WHEN workerVersionMessage() is called, and again with CLOUDFLARE_API_TOKEN removed from the child environment THEN the first call returns exactly the annotations['workers/message'] value from an independent `wrangler versions view --json` reading (null today), and the second call rejects with an error naming CLOUDFLARE_API_TOKEN","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-worker-message","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-worker-message","test_tier":"integration","verification_service":"real Cloudflare Workers API through wrangler","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Cloudflare Workers API through wrangler","topology":"single-node","negative_control":{"would_fail_if":["the helper returns a hardcoded sha","the helper returns an empty string instead of null when no message exists","the helper succeeds with no token"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"live_worker","action":{"actor":"spec","steps":["call workerVersionMessage()","read the active version with `wrangler versions view <id> --config apps/docs/wrangler.jsonc --json` independently"]},"end_state":{"must_observe":["the returned value equals the independent annotations['workers/message'] reading","on the 2026-09-29 state the value is null","once a gated deploy has run the value matches /^[0-9a-f]{40}$/"],"must_not_observe":["an empty string","a value that differs from the independent reading"]}},{"start_ref":"live_worker","action":{"actor":"spec","steps":["call workerVersionMessage() with CLOUDFLARE_API_TOKEN deleted from the child environment"]},"end_state":{"must_observe":["the call rejects with no `CLOUDFLARE_API_TOKEN` in the child environment","the error message contains `CLOUDFLARE_API_TOKEN`"],"must_not_observe":["a resolved value","no error message, meaning a default value was returned"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"jobs() returns the five job names typecheck, lint, test, registry and docs-e2e for a real pull_request ci run","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-jobs-graph","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-jobs-graph","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"latestPushRunOnMain() returns a run whose event is push and whose head_sha is 40 hex characters","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-latest-push-run","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-latest-push-run","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"jobLog() returns text containing `Set up job` for a finished real job","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-job-log","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-job-log","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"jobLog() rejects when the job id does not exist","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-job-log","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-job-log","maps_to_ac":"AC-3"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"downloadArtifact() rejects when the artifact name does not exist on the run","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-artifact-fail-closed","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-artifact-fail-closed","maps_to_ac":"AC-4"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"workerVersionMessage() equals the independent wrangler reading of workers/message","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-worker-message","test_tier":"integration","verification_service":"real Cloudflare Workers API through wrangler","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-worker-message","maps_to_ac":"AC-5"},{"id":"TC-7","type":"test_criterion","primary":false,"description":"workerVersionMessage() rejects when CLOUDFLARE_API_TOKEN is absent from the environment","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts","test_function":"APX-021-worker-message","test_tier":"integration","verification_service":"real Cloudflare Workers API through wrangler","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/github-run-support.remote.spec.ts --grep APX-021-worker-message","maps_to_ac":"AC-5"}]}
-->
