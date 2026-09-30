================================================================================
TASK: APX-042 - Turn FLOW-DELIV-03-live-registry-round-trip green against the first gated GitHub Actions deploy and record run.json
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     2
AGENT:      planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROPOSED BY: react-native-reusables-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md) · Wave G

---
## Background
**Problem.** FLOW-DELIV-03-live-registry-round-trip is authored RED-first (APX-040, APX-041). It can only turn green after the edge headers (APX-001) and the gated deploy job (APX-023) run for real on GitHub Actions.

**Why it matters.** The sprint gate needs the flow green against the real deploy, with evidence bound to the CI run that produced the live version.

**Current.** No push-to-main run has a deploy job. The live version carries no `workers/message`, and `/r/*.json` returns `max-age=0`.

**Desired.** After the human preconditions are met and the first gated deploy succeeds, the unchanged flow passes and its run.json is recorded.

Capabilities: CAP-INST-01, CAP-DEP-01. PRD: UC-DELIV-03 AC-1; UC-DELIV-03 AC-3; T-DELIV-013; CAP-DEP-01.
Boundary contracts:
- The receipt's deploy commit equals workers/message, which equals the head_sha of the green push-to-main ci run whose deploy job produced the active version

## Critical Constraints
MUST:
- MUST confirm every precondition with commands before running. `pnpm exec tsx scripts/docs-deploy/check-deploy-preconditions.ts` exits 0 with 3 PASS lines (APX-020). `gh run list --workflow ci.yml --branch main --event push --status success --limit 1` shows a run whose deploy job concluded success. APX-001, APX-023, APX-024 and APX-041 are merged.
- MUST run `git fetch origin`, then the flow through `run_flow.py` (green) unchanged, so the spec writes run.json during that watched run.
- MUST keep run.json only from a run that exited 0 with `artifact_fresh=True` and `red_proof_ok=True`.
NEVER:
- NEVER edit live-registry-round-trip.remote.spec.ts, gated-deploy-order.remote.spec.ts, live.playwright.config.ts, apps/docs, .github or any assertion to make the run pass.
- NEVER deploy, promote, roll back or run any mutating wrangler command. Never hand-write or edit run.json.
- NEVER report done while a precondition is unmet. Report blocked with the observed value and the owning task: APX-001 for a header value, APX-023 for a missing or malformed workers/message, APX-020 for a precondition.
STRICTLY:
- STRICTLY treat these human-owned items as preconditions, not depends_on: the CLOUDFLARE_API_TOKEN Actions secret, the main-sync PR, the `production` environment limited to main, Sprint 05 ORI-CI-003 and ORI-DEP-003 complete, and a local .env token that can run read-only `wrangler deployments status` and `wrangler versions view`.
- STRICTLY keep the diff to the single run.json file.

## Specification
Objective: Prove, against the first real gated deploy, that FLOW-DELIV-03-live-registry-round-trip passes end to end and is bound to the CI run that deployed it, then record its run.json.
Success state: run_flow.py reports exit 0, `artifact_fresh=True` and `red_proof_ok=True` for FLOW-DELIV-03-live-registry-round-trip. run.json names a 40-hex commit equal to workers/message and to the green push run's head_sha. The FLOW-DELIV-02-gated-deploy-order run_cmd also exits 0.

Fixtures (shared seed data referenced by each START_REF): `gated_deploy_live`, `preconditions_met`, `sync_merge_commit`, `repo_commits`. Their records are in the `fixtures` object of the REQUIREMENT-CONTRACT block at the end of this file.

## Acceptance Criteria
### AC-1: The full flow passes against the gated deploy and records run.json
  GIVEN: the preconditions are met and the first gated deploy is live
  WHEN:  `git fetch origin` runs, then run_flow.py runs the locked run_cmd
  THEN:  the run exits 0 with 0 failed. The spec writes run.json holding the 40-hex commit from workers/message and matching served and built sha256 for 2 of 2 engines. run_flow.py reports artifact_fresh=True and red_proof_ok=True.
  TDD_STATE: N/A
  FLOW_REF: FLOW-DELIV-03-live-registry-round-trip
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-03-live-registry-round-trip
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live https://rnraielements.com, Cloudflare API via wrangler 4.81.0 read-only, real RNR CLI into Expo 57 consumers, local git
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"id":"SC-APX-042-1","use_case_ref":"UC-DELIV-03","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"live apex, Cloudflare API, real CLI, local git","negative_control":{"would_fail_if":["the deploy is unstamped (workers/message empty)","the /r/* tier is missing (`max-age=0`)","the served JSON is a stale or static copy","run.json is hand-written rather than written during the watched run"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"gated_deploy_live","action":{"actor":"cli_user","steps":["git fetch origin","python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-07-deploy-live-at-apex --flow FLOW-DELIV-03-live-registry-round-trip"]},"end_state":{"must_observe":["run_cmd exit `0` with `0 failed`","run.json `commit` is 40 hex and equals workers/message; `served_sha256 == built_sha256` for 2 of 2 engines","run_flow.py prints `artifact_fresh=True` and `red_proof_ok=True`"],"must_not_observe":["`public, max-age=0, must-revalidate`","workers/message `null`","run_cmd exit `1`"]}}]}
```

### AC-2: The bound commit is the gated CI deploy's commit
  GIVEN: the green push-to-main ci run with a deploy job (APX-023) and APX-024's spec
  WHEN:  the FLOW-DELIV-02-gated-deploy-order run_cmd runs
  THEN:  the deploy job needs registry, typecheck, lint, test and docs-e2e, and started after all 5 completed. The active version's workers/message equals that run's 40-hex head_sha, which is the commit APX-042's run.json records.
  TDD_STATE: N/A
  FLOW_REF: FLOW-DELIV-02-gated-deploy-order
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-gated-deploy-order
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real GitHub Actions run data via gh, Cloudflare API via wrangler 4.81.0 read-only
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"id":"SC-APX-042-2","use_case_ref":"UC-DELIV-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"GitHub Actions via gh, Cloudflare API via wrangler","negative_control":{"would_fail_if":["the active version came from a manual deploy, so the message does not equal any green run's head_sha","the deploy job ran before an upstream job finished","GitHub data is read from a recorded fixture instead of gh","the gh lookup is stubbed with a static run record"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"gated_deploy_live","action":{"actor":"cli_user","steps":["CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order"]},"end_state":{"must_observe":["deploy `needs` lists 5 jobs: `registry`, `typecheck`, `lint`, `test`, `docs-e2e`","workers/message equals the run's 40-hex `head_sha`","deploy `started_at` at or after the latest of 5 upstream `completed_at`"],"must_not_observe":["workers/message `null`","a deploy job on a `pull_request` run","an empty `head_sha`"]}}]}
```

### AC-3: A GitHub-created sync commit resolves after fetch without checking it out
  GIVEN: the deploy commit may be a merge or squash commit that GitHub created for the sync PR and that is absent from local main
  WHEN:  `git fetch origin` runs and the locked run_cmd runs from local main
  THEN:  `git rev-parse --verify <sha>^{commit}` resolves, and the builder guard finds build-registry.ts identical between <sha> and HEAD. The flow exits 0 with the rebuild read from `git show <sha>:`, never from HEAD's public/r.
  TDD_STATE: N/A
  FLOW_REF: FLOW-DELIV-03-live-registry-round-trip
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-03-live-registry-round-trip
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip
  TEST_TIER: e2e
  VERIFICATION_SERVICE: local git after fetching GitHub origin, live apex, Cloudflare API read-only
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"id":"SC-APX-042-3","use_case_ref":"UC-DELIV-03","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"local git with GitHub origin, live apex","negative_control":{"would_fail_if":["the resolver falls back to HEAD when the commit is missing","the rebuild reads HEAD's committed public/r instead of `git show <sha>:`","the fetch is skipped and the run reports success anyway","`git fetch origin` is omitted and the resolver silently uses HEAD"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"sync_merge_commit","action":{"actor":"cli_user","steps":["git fetch origin","CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip"]},"end_state":{"must_observe":["`git rev-parse --verify <sha>^{commit}` exit `0`","`git diff --quiet <sha> HEAD -- packages/registry/scripts/build-registry.ts` exit `0`","run_cmd exit `0`"],"must_not_observe":["a failure naming `git fetch origin`","a failure naming `builder drift`","an empty `commit` value in run.json"]}}]}
```

### AC-4: The green run still carries biting fail-closed controls
  GIVEN: the same green run as AC-1
  WHEN:  the run's test list is inspected
  THEN:  APX-040-refuses-unfaithful-commit passed (ffffffffffffffffffffffffffffffffffffffff refused naming `git fetch origin`; 0a899adaf9a5fc921a78ea41a61aac8eacac4af1 refused as `builder drift`), and APX-041-AC-5-install-failure-not-retried passed with 1 attempt. Both ran in the same run as the passing same-deploy test.
  TDD_STATE: N/A
  FLOW_REF: FLOW-DELIV-03-live-registry-round-trip
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-03-live-registry-round-trip
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip
  TEST_TIER: e2e
  VERIFICATION_SERVICE: local git object store and pnpm with the public npm registry, inside the flow run
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"id":"SC-APX-042-4","use_case_ref":"UC-DELIV-03","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"local git and npm registry inside the flow run","negative_control":{"would_fail_if":["the guards were removed or always return success, so the same-deploy test would pass against an unstamped deploy","the controls are dropped from the flow grep or skipped"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"repo_commits","action":{"actor":"cli_user","steps":["CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip"]},"end_state":{"must_observe":["`APX-040-refuses-unfaithful-commit` passed with `ffffffffffffffffffffffffffffffffffffffff` and `0a899adaf9a5fc921a78ea41a61aac8eacac4af1` refused","`APX-041-AC-5-install-failure-not-retried` passed with attempts `1`","both listed in the same run as the passing `APX-040-same-deploy`"],"must_not_observe":["either control reported `skipped`","either control missing from the run's test list","0 control tests in the run's test list"]}}]}
```

## Test Criteria
Verify = `<base> --grep <selector>`; full commands are in the contract block.
- `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts`
- `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts`

| ID | Statement | Maps to | Verify |
|----|-----------|---------|--------|
| TC-1 | The locked FLOW-DELIV-03 run_cmd exits 0 against the gated deploy. | AC-1 | `live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip` |
| TC-2 | run.json's commit equals the active version's workers/message. | AC-1 | `live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip` |
| TC-3 | run.json records matching served and built sha256 for 2 of 2 engines. | AC-1 | `live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip` |
| TC-4 | The FLOW-DELIV-02-gated-deploy-order run_cmd exits 0. | AC-2 | `gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order` |
| TC-5 | workers/message equals the head_sha of the green push-to-main run whose deploy job succeeded. | AC-2 | `gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order` |
| TC-6 | The flow run after `git fetch origin` reports 0 unknown-commit failures. | AC-3 | `live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip` |
| TC-7 | The flow run reports 0 builder-drift failures for the deploy commit. | AC-3 | `live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip` |
| TC-8 | APX-040-refuses-unfaithful-commit passes inside the green flow run. | AC-4 | `live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip` |
| TC-9 | APX-041-AC-5-install-failure-not-retried passes inside the green flow run. | AC-4 | `live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip` |

## Reading List
- `.spec/prds/docs-site/tasks/sprint-07-deploy-live-at-apex/human-flows.json`: locked run_cmds for FLOW-DELIV-03-live-registry-round-trip and FLOW-DELIV-02-gated-deploy-order
- `.spec/prds/docs-site/tasks/sprint-07-deploy-live-at-apex/SPRINT.md` (gate steps 1-3, 12-16): preconditions and the steps this flow automates
- `tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts`: read only: required-test list and run.json writer
- `tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts`: read only: APX-024's head_sha and workers/message assertion
- `scripts/docs-deploy/check-deploy-preconditions.ts`: APX-020's 3 PASS precondition lines
- `~/Projects/brain/tools/gate-evidence/run_flow.py` (1-30, 228-300): green evidence: artifact_fresh and red_proof_ok

## Guardrails
WRITE-ALLOWED:
- tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-live-registry-round-trip/run.json (NEW)
- tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
- tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts
WRITE-PROHIBITED:
- tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts - read only (APX-040/APX-041); listed bare above only for binding
- tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts - read only (APX-024); listed bare above only for binding
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - APX-006
- tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-live-registry-round-trip/proof.red - APX-040's RED proof
- apps/docs/** - edge config
- .github/workflows/** - deploy job
- public/r/** - generated registry
- packages/** - product source and templates
- .env - credential file

## Design
References: SPRINT.md gate steps 12-16; .spec/scenarios/UC-DELIV-03/live-registry-round-trip.scenario.md; .spec/scenarios/UC-DELIV-02/gated-deploy-order.scenario.md
- The full flow takes about 20-30 minutes (two Expo consumers), within APX-006's 60-minute lane timeout.
Pattern (from ~/Projects/brain/tools/gate-evidence/run_flow.py:1-30 (usage)):
```sh
git fetch origin && python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-07-deploy-live-at-apex --flow FLOW-DELIV-03-live-registry-round-trip
```
Anti-pattern: Editing an assertion, re-deploying or hand-writing run.json to reach green. Recording run.json from a run with any failed or skipped test.

## Verification Gates
- preconditions: `pnpm exec tsx scripts/docs-deploy/check-deploy-preconditions.ts` → exit 0 with 3 PASS lines
- fetch: `git fetch origin` → exit 0
- FLOW-DELIV-03-live-registry-round-trip GREEN: `python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-07-deploy-live-at-apex --flow FLOW-DELIV-03-live-registry-round-trip` → exit 0; `artifact_fresh=True` and `red_proof_ok=True`
- FLOW-DELIV-02-gated-deploy-order: AC-2 VERIFY → exit 0
- scope: `git status --porcelain` → exactly 1 line, the run.json path

## Agent Instructions
1. This task writes no code. Confirm every precondition with the commands in Verification Gates before running anything.
2. Run `git fetch origin`, then `python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-07-deploy-live-at-apex --flow FLOW-DELIV-03-live-registry-round-trip`. The spec writes run.json during that run.
3. Run the FLOW-DELIV-02-gated-deploy-order run_cmd and confirm it exits 0.
4. If anything fails, stop. Record the observed value and route it to the owning task: APX-001 for a header value, APX-023 for a missing or malformed workers/message, APX-020 for a precondition. Report this task blocked.

## Orchestrator Verification Protocol
- `pnpm exec tsx scripts/docs-deploy/check-deploy-preconditions.ts` exits 0 with 3 PASS lines.
- `python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-07-deploy-live-at-apex --flow FLOW-DELIV-03-live-registry-round-trip` exits 0 and prints `artifact_fresh=True` and `red_proof_ok=True`.
- run.json holds `deployment_id`, `version_id` and a 40-hex `commit` equal to the head_sha of the green push-to-main ci run (`gh run list --workflow ci.yml --branch main --event push --status success --limit 1 --json headSha`).
- `git status --porcelain` shows exactly 1 line: the run.json path.

## Evidence Gates
- run_flow.py's machine evidence for the flow (`artifact_fresh=True`, `red_proof_ok=True`).
- `tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-live-registry-round-trip/run.json`, written by the spec during the watched run.
- stdout of the FLOW-DELIV-02-gated-deploy-order run.

## Review Criteria
- REVIEWER CHECKS: the diff touches exactly one file, run.json.
- REVIEWER CHECKS: run.json `commit` equals the green push run's head_sha, and the run listed APX-040-refuses-unfaithful-commit and APX-041-AC-5-install-failure-not-retried as passed.
- REVIEWER CHECKS: no spec, config, workflow or edge file changed, and no wrangler mutation appears in the session.
Coding standards: ~/Projects/brain/docs/TESTING-HIERARCHY.md; ~/Projects/brain/docs/FUNCTIONAL-FLOW-COVERAGE.md; ~/Projects/brain/docs/HUMAN-TESTING-GATE-VERIFICATION.md; AGENTS.md

## Dependencies
Depends on: ['APX-041', 'APX-001', 'APX-024']
Blocks:     []

## Notes
- Human-owned preconditions, which are never depends_on: the `CLOUDFLARE_API_TOKEN` GitHub Actions secret added; GitHub main synced to local main through a PR; the `production` environment limited to main; Sprint 05 ORI-CI-003 and ORI-DEP-003 complete; a local `.env` token able to run read-only `wrangler deployments status` and `wrangler versions view`.
- If GitHub squash-merges or merge-commits the sync PR, the deploy commit does not exist locally until `git fetch origin`. That is why the fetch comes first.
- Dependency change from the approved stub: depends_on gained APX-001 (the /r/* tier the flow asserts) and APX-024 (AC-2 binds its spec).
- Gate steps 12-16 are the human form of this flow.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"APX-042","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"gated_deploy_live":{"description":"Apex after the first green push-to-main run with a deploy job","seed_method":"recorded_external","records":["ci run for the sync push: registry, typecheck, lint, test and docs-e2e all `success`, then deploy `success`","active version's workers/message = that run's 40-hex head_sha","/r/* served with exactly one `cache-control: public, max-age=300`"]},"preconditions_met":{"description":"Human-owned preconditions verified by APX-020's check","seed_method":"cli","records":["`pnpm exec tsx scripts/docs-deploy/check-deploy-preconditions.ts` prints 3 `PASS` lines and exits 0"]},"sync_merge_commit":{"description":"GitHub main head after the human's sync PR","seed_method":"recorded_external","records":["if GitHub created a merge or squash commit, it is absent from local main until `git fetch origin`","its packages/registry/scripts/build-registry.ts is byte-identical to local HEAD's"]},"repo_commits":{"description":"Real commits used by the flow's fail-closed controls","seed_method":"cli","records":["ffffffffffffffffffffffffffffffffffffffff absent from the object store","0a899adaf9a5fc921a78ea41a61aac8eacac4af1 carries a build-registry.ts that differs from HEAD"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the preconditions are met and the first gated deploy is live WHEN `git fetch origin` runs, then run_flow.py runs the locked run_cmd THEN the run exits 0 with 0 failed. The spec writes run.json holding the 40-hex commit from workers/message and matching served and built sha256 for 2 of 2 engines. run_flow.py reports artifact_fresh=True and red_proof_ok=True.","primary":false,"flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"live https://rnraielements.com, Cloudflare API via wrangler 4.81.0 read-only, real RNR CLI into Expo 57 consumers, local git","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-042-1","use_case_ref":"UC-DELIV-03","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"live apex, Cloudflare API, real CLI, local git","negative_control":{"would_fail_if":["the deploy is unstamped (workers/message empty)","the /r/* tier is missing (`max-age=0`)","the served JSON is a stale or static copy","run.json is hand-written rather than written during the watched run"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"gated_deploy_live","action":{"actor":"cli_user","steps":["git fetch origin","python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-07-deploy-live-at-apex --flow FLOW-DELIV-03-live-registry-round-trip"]},"end_state":{"must_observe":["run_cmd exit `0` with `0 failed`","run.json `commit` is 40 hex and equals workers/message; `served_sha256 == built_sha256` for 2 of 2 engines","run_flow.py prints `artifact_fresh=True` and `red_proof_ok=True`"],"must_not_observe":["`public, max-age=0, must-revalidate`","workers/message `null`","run_cmd exit `1`"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the green push-to-main ci run with a deploy job (APX-023) and APX-024's spec WHEN the FLOW-DELIV-02-gated-deploy-order run_cmd runs THEN the deploy job needs registry, typecheck, lint, test and docs-e2e, and started after all 5 completed. The active version's workers/message equals that run's 40-hex head_sha, which is the commit APX-042's run.json records.","primary":false,"flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run data via gh, Cloudflare API via wrangler 4.81.0 read-only","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-042-2","use_case_ref":"UC-DELIV-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"GitHub Actions via gh, Cloudflare API via wrangler","negative_control":{"would_fail_if":["the active version came from a manual deploy, so the message does not equal any green run's head_sha","the deploy job ran before an upstream job finished","GitHub data is read from a recorded fixture instead of gh","the gh lookup is stubbed with a static run record"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"gated_deploy_live","action":{"actor":"cli_user","steps":["CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order"]},"end_state":{"must_observe":["deploy `needs` lists 5 jobs: `registry`, `typecheck`, `lint`, `test`, `docs-e2e`","workers/message equals the run's 40-hex `head_sha`","deploy `started_at` at or after the latest of 5 upstream `completed_at`"],"must_not_observe":["workers/message `null`","a deploy job on a `pull_request` run","an empty `head_sha`"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the deploy commit may be a merge or squash commit that GitHub created for the sync PR and that is absent from local main WHEN `git fetch origin` runs and the locked run_cmd runs from local main THEN `git rev-parse --verify <sha>^{commit}` resolves, and the builder guard finds build-registry.ts identical between <sha> and HEAD. The flow exits 0 with the rebuild read from `git show <sha>:`, never from HEAD's public/r.","primary":false,"flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"local git after fetching GitHub origin, live apex, Cloudflare API read-only","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-042-3","use_case_ref":"UC-DELIV-03","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"local git with GitHub origin, live apex","negative_control":{"would_fail_if":["the resolver falls back to HEAD when the commit is missing","the rebuild reads HEAD's committed public/r instead of `git show <sha>:`","the fetch is skipped and the run reports success anyway","`git fetch origin` is omitted and the resolver silently uses HEAD"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"sync_merge_commit","action":{"actor":"cli_user","steps":["git fetch origin","CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip"]},"end_state":{"must_observe":["`git rev-parse --verify <sha>^{commit}` exit `0`","`git diff --quiet <sha> HEAD -- packages/registry/scripts/build-registry.ts` exit `0`","run_cmd exit `0`"],"must_not_observe":["a failure naming `git fetch origin`","a failure naming `builder drift`","an empty `commit` value in run.json"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the same green run as AC-1 WHEN the run's test list is inspected THEN APX-040-refuses-unfaithful-commit passed (ffffffffffffffffffffffffffffffffffffffff refused naming `git fetch origin`; 0a899adaf9a5fc921a78ea41a61aac8eacac4af1 refused as `builder drift`), and APX-041-AC-5-install-failure-not-retried passed with 1 attempt. Both ran in the same run as the passing same-deploy test.","primary":false,"flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"local git object store and pnpm with the public npm registry, inside the flow run","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-042-4","use_case_ref":"UC-DELIV-03","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"local git and npm registry inside the flow run","negative_control":{"would_fail_if":["the guards were removed or always return success, so the same-deploy test would pass against an unstamped deploy","the controls are dropped from the flow grep or skipped"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"repo_commits","action":{"actor":"cli_user","steps":["CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip"]},"end_state":{"must_observe":["`APX-040-refuses-unfaithful-commit` passed with `ffffffffffffffffffffffffffffffffffffffff` and `0a899adaf9a5fc921a78ea41a61aac8eacac4af1` refused","`APX-041-AC-5-install-failure-not-retried` passed with attempts `1`","both listed in the same run as the passing `APX-040-same-deploy`"],"must_not_observe":["either control reported `skipped`","either control missing from the run's test list","0 control tests in the run's test list"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The locked FLOW-DELIV-03 run_cmd exits 0 against the gated deploy.","flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"live https://rnraielements.com, Cloudflare API via wrangler 4.81.0 read-only, real RNR CLI into Expo 57 consumers, local git","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"run.json's commit equals the active version's workers/message.","flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"live https://rnraielements.com, Cloudflare API via wrangler 4.81.0 read-only, real RNR CLI into Expo 57 consumers, local git","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","maps_to_ac":"AC-1"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"run.json records matching served and built sha256 for 2 of 2 engines.","flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"live https://rnraielements.com, Cloudflare API via wrangler 4.81.0 read-only, real RNR CLI into Expo 57 consumers, local git","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","maps_to_ac":"AC-1"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"The FLOW-DELIV-02-gated-deploy-order run_cmd exits 0.","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run data via gh, Cloudflare API via wrangler 4.81.0 read-only","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-2"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"workers/message equals the head_sha of the green push-to-main run whose deploy job succeeded.","flow_ref":"FLOW-DELIV-02-gated-deploy-order","test_file":"tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts","test_function":"FLOW-DELIV-02-gated-deploy-order","test_tier":"e2e","verification_service":"real GitHub Actions run data via gh, Cloudflare API via wrangler 4.81.0 read-only","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts --grep FLOW-DELIV-02-gated-deploy-order","maps_to_ac":"AC-2"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"The flow run after `git fetch origin` reports 0 unknown-commit failures.","flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"local git after fetching GitHub origin, live apex, Cloudflare API read-only","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","maps_to_ac":"AC-3"},{"id":"TC-7","type":"test_criterion","primary":false,"description":"The flow run reports 0 builder-drift failures for the deploy commit.","flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"local git after fetching GitHub origin, live apex, Cloudflare API read-only","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","maps_to_ac":"AC-3"},{"id":"TC-8","type":"test_criterion","primary":false,"description":"APX-040-refuses-unfaithful-commit passes inside the green flow run.","flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"local git object store and pnpm with the public npm registry, inside the flow run","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","maps_to_ac":"AC-4"},{"id":"TC-9","type":"test_criterion","primary":false,"description":"APX-041-AC-5-install-failure-not-retried passes inside the green flow run.","flow_ref":"FLOW-DELIV-03-live-registry-round-trip","test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"FLOW-DELIV-03-live-registry-round-trip","test_tier":"e2e","verification_service":"local git object store and pnpm with the public npm registry, inside the flow run","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip","maps_to_ac":"AC-4"}]}
-->
