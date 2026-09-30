================================================================================
TASK: APX-022 - Hand the tested docs dist from docs-e2e to deploy as a run-bound artifact
================================================================================

TASK_TYPE:  INFRA
STATUS:     Backlog
PRIORITY:   P0
POINTS:     2
AGENT:      planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

PROPOSED BY: ghactions-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: the docs-e2e job builds `apps/docs/dist` and proves it in a browser, but `dist` is untracked and dies with the runner. A deploy job that rebuilt it would ship different bytes from the ones that were tested.

Why it matters: build once, deploy anywhere. The registry JSON that integrators install from must be exactly the bytes CI proved fresh.

Current: docs-e2e uploads only the Playwright report.

Desired: docs-e2e also uploads `apps/docs/dist` as the run-bound artifact `docs-dist`, only after the e2e step succeeds, so the deploy job (APX-023) downloads and ships exactly that.

## Critical Constraints
MUST:
- MUST add exactly one step named `Upload docs dist` to docs-e2e, after the `pnpm e2e:docs` step and before the existing playwright-report upload, using actions/upload-artifact pinned to a commit SHA resolved with `gh api repos/actions/upload-artifact/commits/<tag> --jq .sha`.
- MUST set name docs-dist, path apps/docs/dist, retention-days 1 and if-no-files-found error, with no `if:` on the step so the default success gate applies.
- MUST keep the job ids typecheck, lint, test, registry and docs-e2e, and docs-e2e's `needs: [typecheck, lint, test, registry]`, unchanged.
NEVER:
- NEVER add a build step to any job other than docs-e2e, and NEVER touch the existing floating @v4 references (Dependabot task APX-026 owns upkeep).
- NEVER edit anything in ci.yml outside the docs-e2e job.
STRICTLY:
- STRICTLY treat Sprint 05's ORI-CI-003 as an explicit precondition (it also edits ci.yml and may make it reusable). Before editing, re-read ci.yml as it stands after ORI-CI-003 and keep its job ids. This is a precondition and not a depends_on, because it is a cross-sprint id.
- STRICTLY leave the actions/upload-artifact version choice to the SHA the implementer resolves at implementation time. The pin verified 2026-09-29 for the v4 line is ea165f8d65b6e75b540449e92b4886f43607fa02.

## Specification
Objective: Publish the tested docs dist from docs-e2e as a run-bound artifact so the deploy job ships exactly what the ordered build chain and browser lane proved.
Success state: ci.yml validates with actionlint, docs-e2e carries the pinned `Upload docs dist` step after the e2e step, the pin resolves on GitHub to the tagged commit, and no other job changed.

Provides:
- Artifact `docs-dist` (path apps/docs/dist, retention-days: 1, if-no-files-found: error) uploaded by the docs-e2e job after the e2e step, only when that step succeeded
- tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts: parseWorkflow(path) returning the workflow as JSON via the system ruby YAML parser, and runActionlint(path)

Consumes:
- docs-e2e job, whose `pnpm e2e:docs` runs the ordered registry:build, gallery:manifest, prebuild, astro build chain and its stale-registry gates (owned by FUSE-10 and ORI-CI-002)
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts (APX-006)

Boundary contracts:
- Build-once seam: the bytes deploy later ships are exactly the bytes docs-e2e built and tested. dist is never rebuilt inside deploy.
- The artifact upload runs only after a successful e2e step, so a red docs-e2e run publishes nothing for deploy to pick up.
- Every new action reference is pinned to a 40-hex commit SHA with a `# vX.Y.Z` comment, and the SHA resolves on GitHub.

Capabilities: CAP-DEP-01. PRD refs: UC-DELIV-02 AC-1; UC-DELIV-01 (registry freshness chain); 11-technical-requirements/09 CAP-DEP-01.

## Acceptance Criteria
### AC-1: docs-e2e uploads docs-dist after the e2e step
  GIVEN: the real ci.yml after the change
  WHEN:  the workflow is parsed with the real YAML parser
  THEN:  the docs-e2e job has a step named `Upload docs dist` that comes after the step running `pnpm e2e:docs`, uses actions/upload-artifact at a 40-hex SHA with a `# v` version comment, and sets name docs-dist, path apps/docs/dist, retention-days 1 and if-no-files-found error, with no `if` key
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts
  TEST_FUNCTION: APX-022-artifact-step
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step
  TEST_TIER: integration
  VERIFICATION_SERVICE: real ci.yml on the real filesystem, parsed by the system ruby YAML parser
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the upload step is missing","the upload step sits before the e2e step","retention-days is not 1","the step carries an if key","the action is a floating tag","the upload step is removed from docs-e2e"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["parse ci.yml","locate docs-e2e steps by name and index"]},"end_state":{"must_observe":["step `Upload docs dist` at an index greater than the `pnpm e2e:docs` step","`name`: `docs-dist` and `path`: `apps/docs/dist`","retention-days equals 1 and if-no-files-found equals error","uses matches /^actions\\/upload-artifact@[0-9a-f]{40}$/ and the line comment matches /# v\\d+\\.\\d+\\.\\d+/"],"must_not_observe":["an `if` key on the step","a floating @v tag on the step","the step absent (0 matches for `Upload docs dist`)"]}},{"start_ref":"ci_yml_copy_without_upload_step","action":{"actor":"spec","steps":["run the same checker on the copy without the step"]},"end_state":{"must_observe":["the checker throws an error containing `Upload docs dist`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}
```

### AC-2: ci.yml passes actionlint and a broken copy does not
  GIVEN: the real ci.yml, and a copy whose docs-e2e needs a job id that does not exist
  WHEN:  `actionlint` runs on each
  THEN:  actionlint exits 0 on the real file and exits non-zero on the broken copy with a message naming `no-such-job`
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts
  TEST_FUNCTION: APX-022-actionlint
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint
  TEST_TIER: integration
  VERIFICATION_SERVICE: real actionlint binary on the real ci.yml
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","topology":"single-node","negative_control":{"would_fail_if":["actionlint is not actually invoked","the checker ignores a non-zero actionlint exit","the actionlint output is replaced by a static fixture"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["run `actionlint .github/workflows/ci.yml`"]},"end_state":{"must_observe":["exit code 0"],"must_not_observe":["any actionlint diagnostic line","non-empty actionlint diagnostic output"]}},{"start_ref":"ci_yml_copy_with_broken_needs","action":{"actor":"spec","steps":["run actionlint on the broken copy"]},"end_state":{"must_observe":["an exit code != `0` (non-zero)","output containing `no-such-job`"],"must_not_observe":["exit code 0"]}}]}
```

### AC-3: The other jobs and the existing report upload are untouched
  GIVEN: the real ci.yml after the change
  WHEN:  the workflow is parsed
  THEN:  the job ids typecheck, lint, test, registry and docs-e2e are all present, docs-e2e still needs [typecheck, lint, test, registry], the existing `docs-playwright-report` upload still exists with `if: always() && steps.guard.outputs.ready == 'true'`, and only docs-e2e contains a step with `docs-dist`
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts
  TEST_FUNCTION: APX-022-jobs-preserved
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-jobs-preserved
  TEST_TIER: integration
  VERIFICATION_SERVICE: real ci.yml on the real filesystem, parsed by the system ruby YAML parser
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["a job id was renamed","docs-e2e lost a needs entry","the report upload was removed or edited","the docs-dist step was added to a second job"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["parse ci.yml","list job ids, the docs-e2e needs array, and every step referencing docs-dist"]},"end_state":{"must_observe":["job ids include typecheck, lint, test, registry, docs-e2e","docs-e2e needs equals [typecheck, lint, test, registry]","the `docs-playwright-report` upload step exists with its original `if: always() && steps.guard.outputs.ready == 'true'`","exactly `1` job contains a `docs-dist` step"],"must_not_observe":["a renamed job id","docs-dist referenced by any job except docs-e2e and, after APX-023, deploy's download step","an empty jobs map returned by the parser"]}}]}
```

### AC-4: The upload-artifact pin resolves on GitHub to its tagged commit
  GIVEN: the pinned SHA and its `# vX.Y.Z` comment in the Upload docs dist step, and the same SHA with its last character flipped
  WHEN:  the SHA and tag are looked up with gh api against actions/upload-artifact
  THEN:  the real SHA resolves as a commit and equals the dereferenced commit of the tag in the comment, and the flipped SHA is rejected by GitHub with a 404 or 422
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts
  TEST_FUNCTION: APX-022-pin-resolves
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the pin is a made-up SHA","the comment names a tag that points at a different commit","the checker treats a 404 as success","the pinned SHA is a hardcoded value that the lookup never queries"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["extract the SHA and tag comment","call `gh api repos/actions/upload-artifact/commits/<sha>` and `gh api repos/actions/upload-artifact/commits/<tag> --jq .sha`"]},"end_state":{"must_observe":["the SHA lookup returns the same 40-hex sha","the tag lookup returns that same `sha` (`40` hex characters)"],"must_not_observe":["a 404 for the pinned sha","two different shas","an empty sha returned by the lookup"]}},{"start_ref":"flipped_sha","action":{"actor":"spec","steps":["call gh api with the flipped SHA"]},"end_state":{"must_observe":["gh exits non-zero with HTTP 404 or 422"],"must_not_observe":["a resolved commit","a non-empty commit body returned for the flipped sha"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|----|-----------|---------|--------|
| TC-1 | The `Upload docs dist` step appears after the `pnpm e2e:docs` step in the docs-e2e job | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step |
| TC-2 | The upload step carries no `if` key | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step |
| TC-3 | The checker rejects a ci.yml copy that has no `Upload docs dist` step | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step |
| TC-4 | actionlint exits 0 on the real ci.yml | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint |
| TC-5 | actionlint exits non-zero on a ci.yml copy whose docs-e2e needs a missing job | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint |
| TC-6 | docs-e2e still needs typecheck, lint, test and registry after the change | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-jobs-preserved |
| TC-7 | The pinned upload-artifact SHA resolves on GitHub to the commit of the tag named in its comment | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves |
| TC-8 | GitHub rejects the pinned SHA with its last character flipped | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves |

## Reading List
- .github/workflows/ci.yml (lines 134-164): docs-e2e job: where the upload step goes and the existing report upload
- package.json (lines 15-30): the e2e:docs chain that produces apps/docs/dist
- .spec/scenarios/UC-DELIV-02/gated-deploy-order.scenario.md (all): visible deploy contract the artifact serves

## Guardrails
WRITE-ALLOWED:
- .github/workflows/ci.yml (MODIFY)
- tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts (NEW)
WRITE-PROHIBITED:
- .github/workflows/sprint-05-acceptance.yml - Sprint 05 file
- apps/docs/wrangler.jsonc - Sprint 05 file
- package.json - no new dependency, the parser is the system ruby
- scripts/docs-data/** - other task's files
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - owned by APX-006, read only
- tests/sprint-05-orient-search/** - other sprint lane

## Design
References: SPRINT.md gate steps 2 and 17; 07-uc-deliv.md UC-DELIV-02
Pattern: - name: Upload docs dist
  uses: actions/upload-artifact@<40-hex sha> # vX.Y.Z
  with: { name: docs-dist, path: apps/docs/dist, retention-days: 1, if-no-files-found: error }
placed right after the `pnpm e2e:docs` step. (.github/workflows/ci.yml:159-164)
Anti-pattern: Rebuilding dist in the deploy job, or uploading under `if: always()` so a red e2e run still publishes an artifact.

## Verification Gates
- typecheck: `pnpm typecheck` - Exit 0
- lint: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts` - Exit 0
- complexity: `pnpm check:fallow` - Exit 0
- tests: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts` - Exit 0 with four passing tests, with actionlint and gh installed and authenticated

## Agent Instructions
TDD_MODE is skipped (INFRA), so there is no RED to GREEN ceremony. The real-services proof still applies to every AC.
1. Re-read `.github/workflows/ci.yml` as it stands now. If Sprint 05's ORI-CI-003 has changed it, keep its job ids and confirm docs-e2e still needs the four jobs.
2. Resolve the upload-artifact SHA at implementation time with `gh api repos/actions/upload-artifact/commits/<tag> --jq .sha` (dereference the tag to a commit). Add the single `Upload docs dist` step in docs-e2e after the `pnpm e2e:docs` step.
3. Write `support/workflow-yaml.ts` (`parseWorkflow`, `runActionlint`) using the system ruby YAML parser through spawnSync. Do not add a package dependency. APX-023 and APX-026 read this file and never edit it.
4. Write the spec. Every negative control runs against an OS-temp copy of the real ci.yml, and the repo file is never mutated.
5. Run every gate. Commit on the task's worktree. Never merge.

## Orchestrator Verification Protocol
The orchestrator re-runs typecheck, lint, complexity and the four-test gate with actionlint and gh authenticated. It runs `git diff` on ci.yml and confirms the change is one added step inside docs-e2e. It confirms the step's SHA matches a real commit of the tag in its comment, that no other job changed, and that `git diff` touches only the three WRITE-ALLOWED files.

## Evidence Gates
- Playwright output showing four passing tests.
- The `git diff` of ci.yml showing only the one added step.
- The `gh api` output resolving the pinned SHA and its tag to the same commit.
- actionlint output: exit 0 on the real file, non-zero naming `no-such-job` on the broken copy.

## Review Criteria
REVIEWER CHECKS:
- The upload step has no `if` key, so a red e2e run uploads nothing.
- The step sits after the `pnpm e2e:docs` step and before the report upload.
- The pin is a 40-hex commit SHA with a `# vX.Y.Z` comment, and not an annotated tag object SHA.
- No job or trigger other than docs-e2e's steps changed, and no build step was added elsewhere.
- No package dependency was added, and the negative controls never mutate the repo's ci.yml.

## Dependencies
Depends on: ['APX-006']
Blocks:     ['APX-023', 'APX-025']

## Notes
- Sprint 05's ORI-CI-003 is a human-sequenced precondition, not a dependency. It also edits ci.yml and may make it reusable, so re-read the real job ids before editing. Sprint 05's ORI-DEP-003 (the accepted docs already published) is also a precondition of the sprint.
- Human-owned preconditions for the sprint, stated plainly: the `CLOUDFLARE_API_TOKEN` repo secret, the sync PR that lands the deploy job on GitHub main, the `production` environment, and the Cloudflare zone-edit token scope. This task's tests need none of them, because they read ci.yml and public GitHub metadata. The first real artifact appears only on a run after the sync, and APX-025 proves it.
- The specs run in the shared live lane (`live.playwright.config.ts`, owned by APX-006). Root vitest and the root playwright config never collect `*.remote.spec.ts`.
- The ruby YAML parser comes from the system ruby on the developer machine. `yaml` is not a root dependency and package.json is write-prohibited.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"APX-022","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"real_ci_yml":{"description":"The repo's real .github/workflows/ci.yml at HEAD, parsed by the system ruby YAML parser.","seed_method":"cli","records":[".github/workflows/ci.yml"]},"ci_yml_copy_without_upload_step":{"description":"An OS-temp copy of the real ci.yml with the `Upload docs dist` step removed. The repo file is never mutated.","seed_method":"cli","records":["copy of .github/workflows/ci.yml minus the Upload docs dist step"]},"ci_yml_copy_with_broken_needs":{"description":"An OS-temp copy of the real ci.yml in which docs-e2e needs a job id that does not exist (`needs: [no-such-job]`).","seed_method":"cli","records":["copy of .github/workflows/ci.yml with needs: [no-such-job] on docs-e2e"]},"flipped_sha":{"description":"The real pinned SHA with its last hex character changed, which GitHub cannot resolve.","seed_method":"public_api","records":["pinned sha with last character flipped"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the real ci.yml after the change WHEN the workflow is parsed with the real YAML parser THEN the docs-e2e job has a step named `Upload docs dist` that comes after the step running `pnpm e2e:docs`, uses actions/upload-artifact at a 40-hex SHA with a `# v` version comment, and sets name docs-dist, path apps/docs/dist, retention-days 1 and if-no-files-found error, with no `if` key","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-artifact-step","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the upload step is missing","the upload step sits before the e2e step","retention-days is not 1","the step carries an if key","the action is a floating tag","the upload step is removed from docs-e2e"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["parse ci.yml","locate docs-e2e steps by name and index"]},"end_state":{"must_observe":["step `Upload docs dist` at an index greater than the `pnpm e2e:docs` step","`name`: `docs-dist` and `path`: `apps/docs/dist`","retention-days equals 1 and if-no-files-found equals error","uses matches /^actions\\/upload-artifact@[0-9a-f]{40}$/ and the line comment matches /# v\\d+\\.\\d+\\.\\d+/"],"must_not_observe":["an `if` key on the step","a floating @v tag on the step","the step absent (0 matches for `Upload docs dist`)"]}},{"start_ref":"ci_yml_copy_without_upload_step","action":{"actor":"spec","steps":["run the same checker on the copy without the step"]},"end_state":{"must_observe":["the checker throws an error containing `Upload docs dist`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the real ci.yml, and a copy whose docs-e2e needs a job id that does not exist WHEN `actionlint` runs on each THEN actionlint exits 0 on the real file and exits non-zero on the broken copy with a message naming `no-such-job`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-actionlint","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","topology":"single-node","negative_control":{"would_fail_if":["actionlint is not actually invoked","the checker ignores a non-zero actionlint exit","the actionlint output is replaced by a static fixture"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["run `actionlint .github/workflows/ci.yml`"]},"end_state":{"must_observe":["exit code 0"],"must_not_observe":["any actionlint diagnostic line","non-empty actionlint diagnostic output"]}},{"start_ref":"ci_yml_copy_with_broken_needs","action":{"actor":"spec","steps":["run actionlint on the broken copy"]},"end_state":{"must_observe":["an exit code != `0` (non-zero)","output containing `no-such-job`"],"must_not_observe":["exit code 0"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the real ci.yml after the change WHEN the workflow is parsed THEN the job ids typecheck, lint, test, registry and docs-e2e are all present, docs-e2e still needs [typecheck, lint, test, registry], the existing `docs-playwright-report` upload still exists with `if: always() && steps.guard.outputs.ready == 'true'`, and only docs-e2e contains a step with `docs-dist`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-jobs-preserved","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-jobs-preserved","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["a job id was renamed","docs-e2e lost a needs entry","the report upload was removed or edited","the docs-dist step was added to a second job"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["parse ci.yml","list job ids, the docs-e2e needs array, and every step referencing docs-dist"]},"end_state":{"must_observe":["job ids include typecheck, lint, test, registry, docs-e2e","docs-e2e needs equals [typecheck, lint, test, registry]","the `docs-playwright-report` upload step exists with its original `if: always() && steps.guard.outputs.ready == 'true'`","exactly `1` job contains a `docs-dist` step"],"must_not_observe":["a renamed job id","docs-dist referenced by any job except docs-e2e and, after APX-023, deploy's download step","an empty jobs map returned by the parser"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the pinned SHA and its `# vX.Y.Z` comment in the Upload docs dist step, and the same SHA with its last character flipped WHEN the SHA and tag are looked up with gh api against actions/upload-artifact THEN the real SHA resolves as a commit and equals the dereferenced commit of the tag in the comment, and the flipped SHA is rejected by GitHub with a 404 or 422","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-pin-resolves","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the pin is a made-up SHA","the comment names a tag that points at a different commit","the checker treats a 404 as success","the pinned SHA is a hardcoded value that the lookup never queries"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["extract the SHA and tag comment","call `gh api repos/actions/upload-artifact/commits/<sha>` and `gh api repos/actions/upload-artifact/commits/<tag> --jq .sha`"]},"end_state":{"must_observe":["the SHA lookup returns the same 40-hex sha","the tag lookup returns that same `sha` (`40` hex characters)"],"must_not_observe":["a 404 for the pinned sha","two different shas","an empty sha returned by the lookup"]}},{"start_ref":"flipped_sha","action":{"actor":"spec","steps":["call gh api with the flipped SHA"]},"end_state":{"must_observe":["gh exits non-zero with HTTP 404 or 422"],"must_not_observe":["a resolved commit","a non-empty commit body returned for the flipped sha"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The `Upload docs dist` step appears after the `pnpm e2e:docs` step in the docs-e2e job","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-artifact-step","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"The upload step carries no `if` key","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-artifact-step","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step","maps_to_ac":"AC-1"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The checker rejects a ci.yml copy that has no `Upload docs dist` step","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-artifact-step","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step","maps_to_ac":"AC-1"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"actionlint exits 0 on the real ci.yml","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-actionlint","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint","maps_to_ac":"AC-2"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"actionlint exits non-zero on a ci.yml copy whose docs-e2e needs a missing job","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-actionlint","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint","maps_to_ac":"AC-2"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"docs-e2e still needs typecheck, lint, test and registry after the change","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-jobs-preserved","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-jobs-preserved","maps_to_ac":"AC-3"},{"id":"TC-7","type":"test_criterion","primary":false,"description":"The pinned upload-artifact SHA resolves on GitHub to the commit of the tag named in its comment","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-pin-resolves","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves","maps_to_ac":"AC-4"},{"id":"TC-8","type":"test_criterion","primary":false,"description":"GitHub rejects the pinned SHA with its last character flipped","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-pin-resolves","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves","maps_to_ac":"AC-4"}]}
-->
