================================================================================
TASK: APX-020 - Add the fail-closed deploy precondition check (secret, synced main, production environment)
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
Problem: the gated docs deploy needs three things only a human can provide: the `CLOUDFLARE_API_TOKEN` repo secret, local `main` synced to GitHub through a PR (605 commits ahead on 2026-09-29), and a `production` environment limited to `main`.

Why it matters: if any of the three is missing, the deploy gate fails for a reason nobody can see. A silent assumption here would look like a broken pipeline.

Current (observed 2026-09-29): 0 Actions secrets, no deploy job in GitHub main's ci.yml, no production environment.

Desired: one read-only command, run at gate step 1, that checks all three against real GitHub, prints one PASS or FAIL line each with the human remedy, and exits 0 only when all three pass.

## Critical Constraints
MUST:
- MUST print exactly one PASS or FAIL line per check, in the order secret, synced main, production environment, and exit 0 only when all three are PASS.
- MUST print, under each FAIL line, the concrete human remedy: add the repo secret under Settings > Secrets and variables > Actions, merge the sync PR that lands the deploy job on GitHub main, or create the production environment limited to main under Settings > Environments.
- MUST exit 2 with a `cannot verify` message when gh is missing, unauthenticated, or the API call fails, so a broken lookup is never reported as PASS or FAIL.
NEVER:
- NEVER issue a non-GET request or write to GitHub, and never read a secret value.
- NEVER print the CLOUDFLARE_API_TOKEN value from the environment or the local .env.
STRICTLY:
- STRICTLY treat these as human-owned preconditions (add the secret, sync main by PR, create the environment). This task checks them and never performs them.

## Specification
Objective: Make Decision 2's human prerequisites explicit and machine-checked, so a red deploy gate is never a silent missing-secret or unsynced-main problem.
Success state: Run at gate step 1, the command prints three verdict lines that match GitHub's real state and exits 0 only when the secret is listed, GitHub main's ci.yml has a deploy job, and the production environment is limited to main. Today it prints three FAIL lines with remedies and exits 1.

Provides:
- scripts/docs-deploy/check-deploy-preconditions.ts: exit 0 only if the secret name CLOUDFLARE_API_TOKEN is listed, GitHub main's ci.yml defines a `deploy` job, and the `production` environment exists limited to the main branch; exit 1 on any failed check; exit 2 when the repo cannot be verified

Consumes:
- gh CLI authenticated with repo admin rights
- GitHub REST: actions/secrets (names only), repos/contents, repos/environments

Boundary contracts:
- Deploy-precondition seam: the three human-owned inputs (secret, synced main, environment) are checked against real GitHub. An API error is never treated as a pass.
- Read-only: the script issues GET requests only. It never creates secrets, environments or workflows.
- Secret NAMES only. A secret value is never read, printed or logged.

Capabilities: CAP-DEP-01. PRD refs: UC-DELIV-02 AC-1; 11-technical-requirements/06 external deps (Cloudflare token scope).

## Acceptance Criteria
### AC-1: Verdicts equal GitHub's real state
  GIVEN: the real repo's secret list, main's ci.yml, and environments, read independently by the spec through gh api
  WHEN:  the script is run against the repo with the real gh CLI
  THEN:  each of the three verdict lines equals the independent reading (PASS when the secret name is listed, when main's ci.yml contains a `deploy:` job, and when production exists with a custom branch policy that includes main; otherwise FAIL), and the exit code is 0 only when all three are PASS
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts
  TEST_FUNCTION: APX-020-verdicts-match-github
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-verdicts-match-github
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the script always prints PASS","the script always prints FAIL","the script hardcodes the verdicts","the exit code ignores a FAIL line"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"live_repo_state","action":{"actor":"integrator","steps":["run `pnpm exec tsx scripts/docs-deploy/check-deploy-preconditions.ts`","read the same three facts independently with gh api"]},"end_state":{"must_observe":["on the 2026-09-29 state: `secret CLOUDFLARE_API_TOKEN: FAIL`, `main ci.yml deploy job: FAIL`, `production environment limited to main: FAIL`, exit code 1","after the human preconditions: three PASS lines and exit code 0","every verdict == the independent `gh api` reading (`3` of `3` lines)"],"must_not_observe":["a PASS line for a check the independent reading shows absent","exit code 0 while any line is FAIL"]}}]}
```

### AC-2: An unverifiable repo exits 2 and never passes
  GIVEN: the slug hackerpug-ai/apx-020-does-not-exist, which GitHub answers with 404
  WHEN:  the script is run with `--repo hackerpug-ai/apx-020-does-not-exist`
  THEN:  the exit code is 2, stderr contains `cannot verify`, and no line contains PASS
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts
  TEST_FUNCTION: APX-020-unverifiable-repo-exits-2
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-unverifiable-repo-exits-2
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the script maps an API 404 to FAIL with exit 1","the script maps an API error to PASS","the script swallows the error and exits 0","the script's gh output is replaced by a static fixture, so the 404 is never seen"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"nonexistent_repo","action":{"actor":"integrator","steps":["run the script with `--repo hackerpug-ai/apx-020-does-not-exist`"]},"end_state":{"must_observe":["exit code 2","stderr contains `cannot verify` and the repo slug"],"must_not_observe":["exit code 0","exit code 1","any output line containing PASS"]}}]}
```

### AC-3: The token value is never printed
  GIVEN: a child environment with CLOUDFLARE_API_TOKEN set to the canary string apx020-canary-<random>
  WHEN:  the script runs against the real repo with that environment
  THEN:  neither stdout nor stderr contains the canary string
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts
  TEST_FUNCTION: APX-020-never-prints-secret-value
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-never-prints-secret-value
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the script echoes its environment","the script prints the token on a debug path","the script reads and prints the .env","the check is a static no-op that never runs the script with the canary in its environment"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"canary_token_env","action":{"actor":"integrator","steps":["run the script with the canary token in its environment","search the combined stdout and stderr for the canary"]},"end_state":{"must_observe":["the `3` verdict lines still print (`PASS` or `FAIL` each)","the canary string occurs 0 times in stdout and stderr, checked against a run whose stdout is non-empty"],"must_not_observe":["the canary string in any output","empty stdout, which would make the absence vacuous"]}}]}
```

### AC-4: Each FAIL line carries the exact human remedy
  GIVEN: the real repo state, in which at least one check is FAIL today
  WHEN:  the script prints a FAIL line
  THEN:  the next line names the remedy for that check: `Settings > Secrets and variables > Actions` for the secret, `merge the sync PR` for main, and `Settings > Environments` for production
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts
  TEST_FUNCTION: APX-020-fail-lines-carry-remedy
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-fail-lines-carry-remedy
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["a FAIL line has no remedy","the remedy text is generic and names none of the three settings locations","the remedy lines are removed from the script output"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"live_repo_state","action":{"actor":"integrator","steps":["run the script","for every FAIL line read the following remedy line"]},"end_state":{"must_observe":["the secret FAIL is followed by a line containing `Settings > Secrets and variables > Actions`","the main FAIL is followed by a line containing `merge the sync PR`","the environment FAIL is followed by a line containing `Settings > Environments`"],"must_not_observe":["a FAIL line with no following remedy line"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|----|-----------|---------|--------|
| TC-1 | The secret-check verdict equals the independent gh api secret-name listing when the script runs against the real repo | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-verdicts-match-github |
| TC-2 | The exit code is 0 only when all three verdict lines are PASS | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-verdicts-match-github |
| TC-3 | The exit code is 2 when the repo slug does not exist on GitHub | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-unverifiable-repo-exits-2 |
| TC-4 | No output line contains PASS when the repo slug does not exist | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-unverifiable-repo-exits-2 |
| TC-5 | The canary token string is absent from stdout and stderr when the token is in the environment | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-never-prints-secret-value |
| TC-6 | Every FAIL line is followed by a remedy line naming its settings location | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-fail-lines-carry-remedy |

## Reading List
- .github/workflows/ci.yml (all): the job ids the `deploy:` grep must not confuse with existing jobs
- .tmp/kb-sprint-tasks-plan/sprint-07-deploy-live-at-apex/promotion-blocker.md (all): measured secret and main-sync state (Decision 2)
- .spec/scenarios/UC-DELIV-02/gated-deploy-order.scenario.md (all): token scope and the visible deploy contract

## Guardrails
WRITE-ALLOWED:
- scripts/docs-deploy/check-deploy-preconditions.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts (NEW)
WRITE-PROHIBITED:
- .github/workflows/** - workflow edits belong to APX-022 and APX-023
- scripts/docs-deploy/prepare.ts - Sprint 05 file
- apps/docs/wrangler.jsonc - Sprint 05 file
- tests/sprint-05-orient-search/** - other sprint lane
- .spec/prds/docs-site/tasks/sprint-05-orient-search/** - other sprint's tasks
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - owned by APX-006, read only
- .env - never read a value into output

## Design
References: SPRINT.md gate step 1; 07-uc-deliv.md UC-DELIV-02 AC-1
Pattern: Spawn the script with node:child_process spawnSync, parse its stdout lines, and compare each verdict with a second, independent `gh api` reading made in the spec. (scripts/docs-deploy/prepare.ts:1-60 (host-side spawnSync, fail-closed exits))
Anti-pattern: A script that prints PASS when gh api errors, or a spec that only asserts exit code 0 (fails once the human preconditions are unmet, passes for a hardcoded script).

## Verification Gates
- typecheck: `pnpm typecheck` - Exit 0
- lint: `./node_modules/.bin/biome ci scripts/docs-deploy/check-deploy-preconditions.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts` - Exit 0
- complexity: `pnpm check:fallow` - Exit 0
- tests: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts` - Exit 0 with four passing tests, in a shell with real gh admin authentication

## Agent Instructions
TDD_MODE is skipped (INFRA), so there is no RED to GREEN ceremony. The real-services proof still applies to every AC.
1. Read the reading list. Confirm `tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts` exists (APX-006) before writing the spec.
2. Write the script. It resolves the repo slug from the git remote unless `--repo owner/name` is given, and issues GET requests only through `gh api`.
3. Write the spec. Each test spawns the real script and, for AC-1, makes its own independent `gh api` reading of the same three facts. Never hardcode the expected verdicts: they are FAIL today and PASS after the human preconditions, and the test must be true in both states.
4. For AC-3, spawn the script with `CLOUDFLARE_API_TOKEN=apx020-canary-<random>` and assert the canary never appears while stdout is non-empty.
5. Run every gate. Commit on the task's worktree. Never merge.

## Orchestrator Verification Protocol
The orchestrator re-runs typecheck, lint, complexity and the four-test gate in a shell with real gh admin authentication. It confirms the script issues no non-GET call (search for `-X` and `--method` with POST, PUT, PATCH or DELETE) and that `git diff` touches only the two WRITE-ALLOWED files. It rejects any spec whose expected verdicts are hardcoded.

## Evidence Gates
- Captured stdout of the script at implementation time, showing the three verdict lines and remedies (the 2026-09-29 state is three FAIL lines and exit 1).
- Playwright output showing four passing tests.
- The canary test's stdout capture proving non-empty output with zero canary occurrences.

## Review Criteria
REVIEWER CHECKS:
- The script exits 2, not 1, when the repo cannot be verified, and never prints PASS then.
- No code path prints or logs a token or secret value.
- The spec compares against an independent gh reading and does not hardcode the verdicts.
- Only GET requests are issued.

## Dependencies
Depends on: ['APX-006']
Blocks:     ['APX-023']

## Notes
- Human-owned preconditions, stated plainly. This task checks them and never performs them: (1) the human adds the `CLOUDFLARE_API_TOKEN` repo secret (the token exists only in the local, gitignored `.env`); (2) the human syncs local `main` to GitHub through a PR, because GitHub `main` is PR-gated; (3) the human creates the `production` environment limited to `main`; (4) the Cloudflare token carries Account Workers Scripts Edit, Account Settings Read and Zone Workers Routes Edit.
- Sprint 05's ORI-CI-003 and ORI-DEP-003 are also preconditions of the sprint. They are cross-sprint task ids and are not listed as dependencies.
- Until the human finishes (1) to (3), the script honestly prints FAIL and exits 1. That is expected, not a defect.
- The spec runs in the shared live lane (`live.playwright.config.ts`, owned by APX-006). Root vitest and the root playwright config never collect `*.remote.spec.ts`, so CI cannot run this network test.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"APX-020","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"live_repo_state":{"description":"The real repo hackerpug-ai/rnr-ai-elements on GitHub. Observed 2026-09-29: 0 Actions secrets, no deploy job in main's ci.yml, no production environment. After the human preconditions it flips to secret listed, deploy job present, environment limited to main.","seed_method":"public_api","records":["gh api repos/hackerpug-ai/rnr-ai-elements/actions/secrets","gh api repos/hackerpug-ai/rnr-ai-elements/contents/.github/workflows/ci.yml?ref=main","gh api repos/hackerpug-ai/rnr-ai-elements/environments"]},"canary_token_env":{"description":"A child-process environment carrying CLOUDFLARE_API_TOKEN set to the random canary string apx020-canary-<random>.","seed_method":"cli","records":["CLOUDFLARE_API_TOKEN=apx020-canary-<random>"]},"nonexistent_repo":{"description":"The repo slug hackerpug-ai/apx-020-does-not-exist, which GitHub answers with 404.","seed_method":"public_api","records":["gh api repos/hackerpug-ai/apx-020-does-not-exist returns 404"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the real repo's secret list, main's ci.yml, and environments, read independently by the spec through gh api WHEN the script is run against the repo with the real gh CLI THEN each of the three verdict lines equals the independent reading (PASS when the secret name is listed, when main's ci.yml contains a `deploy:` job, and when production exists with a custom branch policy that includes main; otherwise FAIL), and the exit code is 0 only when all three are PASS","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-verdicts-match-github","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-verdicts-match-github","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the script always prints PASS","the script always prints FAIL","the script hardcodes the verdicts","the exit code ignores a FAIL line"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"live_repo_state","action":{"actor":"integrator","steps":["run `pnpm exec tsx scripts/docs-deploy/check-deploy-preconditions.ts`","read the same three facts independently with gh api"]},"end_state":{"must_observe":["on the 2026-09-29 state: `secret CLOUDFLARE_API_TOKEN: FAIL`, `main ci.yml deploy job: FAIL`, `production environment limited to main: FAIL`, exit code 1","after the human preconditions: three PASS lines and exit code 0","every verdict == the independent `gh api` reading (`3` of `3` lines)"],"must_not_observe":["a PASS line for a check the independent reading shows absent","exit code 0 while any line is FAIL"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the slug hackerpug-ai/apx-020-does-not-exist, which GitHub answers with 404 WHEN the script is run with `--repo hackerpug-ai/apx-020-does-not-exist` THEN the exit code is 2, stderr contains `cannot verify`, and no line contains PASS","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-unverifiable-repo-exits-2","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-unverifiable-repo-exits-2","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the script maps an API 404 to FAIL with exit 1","the script maps an API error to PASS","the script swallows the error and exits 0","the script's gh output is replaced by a static fixture, so the 404 is never seen"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"nonexistent_repo","action":{"actor":"integrator","steps":["run the script with `--repo hackerpug-ai/apx-020-does-not-exist`"]},"end_state":{"must_observe":["exit code 2","stderr contains `cannot verify` and the repo slug"],"must_not_observe":["exit code 0","exit code 1","any output line containing PASS"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN a child environment with CLOUDFLARE_API_TOKEN set to the canary string apx020-canary-<random> WHEN the script runs against the real repo with that environment THEN neither stdout nor stderr contains the canary string","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-never-prints-secret-value","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-never-prints-secret-value","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the script echoes its environment","the script prints the token on a debug path","the script reads and prints the .env","the check is a static no-op that never runs the script with the canary in its environment"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"canary_token_env","action":{"actor":"integrator","steps":["run the script with the canary token in its environment","search the combined stdout and stderr for the canary"]},"end_state":{"must_observe":["the `3` verdict lines still print (`PASS` or `FAIL` each)","the canary string occurs 0 times in stdout and stderr, checked against a run whose stdout is non-empty"],"must_not_observe":["the canary string in any output","empty stdout, which would make the absence vacuous"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the real repo state, in which at least one check is FAIL today WHEN the script prints a FAIL line THEN the next line names the remedy for that check: `Settings > Secrets and variables > Actions` for the secret, `merge the sync PR` for main, and `Settings > Environments` for production","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-fail-lines-carry-remedy","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-fail-lines-carry-remedy","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["a FAIL line has no remedy","the remedy text is generic and names none of the three settings locations","the remedy lines are removed from the script output"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"live_repo_state","action":{"actor":"integrator","steps":["run the script","for every FAIL line read the following remedy line"]},"end_state":{"must_observe":["the secret FAIL is followed by a line containing `Settings > Secrets and variables > Actions`","the main FAIL is followed by a line containing `merge the sync PR`","the environment FAIL is followed by a line containing `Settings > Environments`"],"must_not_observe":["a FAIL line with no following remedy line"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The secret-check verdict equals the independent gh api secret-name listing when the script runs against the real repo","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-verdicts-match-github","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-verdicts-match-github","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"The exit code is 0 only when all three verdict lines are PASS","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-verdicts-match-github","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-verdicts-match-github","maps_to_ac":"AC-1"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The exit code is 2 when the repo slug does not exist on GitHub","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-unverifiable-repo-exits-2","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-unverifiable-repo-exits-2","maps_to_ac":"AC-2"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"No output line contains PASS when the repo slug does not exist","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-unverifiable-repo-exits-2","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-unverifiable-repo-exits-2","maps_to_ac":"AC-2"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"The canary token string is absent from stdout and stderr when the token is in the environment","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-never-prints-secret-value","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-never-prints-secret-value","maps_to_ac":"AC-3"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"Every FAIL line is followed by a remedy line naming its settings location","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts","test_function":"APX-020-fail-lines-carry-remedy","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/check-deploy-preconditions.remote.spec.ts --grep APX-020-fail-lines-carry-remedy","maps_to_ac":"AC-4"}]}
-->
