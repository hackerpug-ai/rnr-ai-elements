================================================================================
TASK: APX-022 - Hand the docs dist from docs-build to deploy as a run-bound artifact
================================================================================

TASK_TYPE:  INFRA
STATUS:     Completed

Commit: 6dbf74f90d11333af862fac65b1e4dc640fc01b2
PRIORITY:   P0
POINTS:     2
AGENT:      planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

PROPOSED BY: ghactions-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: the docs-build job writes `apps/docs/dist` in the step named `Docs build`, but `dist` is untracked and dies with the runner. A deploy job that rebuilt it would ship different bytes from the ones that step wrote.

Why it matters: build once, deploy anywhere. The registry JSON that integrators install from must be exactly the bytes CI produced.

Current: docs-build uploads only the build log. The step named `Upload docs-build evidence` publishes `docs-build-log`.

Desired: docs-build also uploads `apps/docs/dist` as the run-bound artifact `docs-dist`, in one new step after `Docs build`, and only when that step succeeded, so the deploy job (APX-023) downloads and ships exactly that.

## Critical Constraints
MUST:
- MUST add exactly one step named `Upload docs dist` to the docs-build job, after the step named `Docs build`, using actions/upload-artifact pinned to a 40-hex commit SHA with a `# vX.Y.Z` comment. Resolve the SHA with `gh api repos/actions/upload-artifact/commits/<tag> --jq .sha`.
- MUST set name docs-dist, path apps/docs/dist, retention-days 1 and if-no-files-found error, with no `if:` on the step so the default success gate applies.
- MUST keep the job ids typecheck, lint, registry and docs-build, and docs-build's `needs: [typecheck, lint, registry]`, unchanged.
- MUST leave the existing step named `Upload docs-build evidence` unchanged.
NEVER:
- NEVER add a step to any job other than docs-build, and NEVER edit the `Docs build` step.
- NEVER edit anything in ci.yml outside the docs-build job.
STRICTLY:
- STRICTLY treat Sprint 05's ORI-CI-003 as an explicit precondition (it also edits ci.yml and may make it reusable). Before editing, re-read ci.yml as it stands after ORI-CI-003. The live job ids are typecheck, lint, registry, and docs-build, and docs-build needs [typecheck, lint, registry]. This is a precondition and not a depends_on, because it is a cross-sprint id.
- STRICTLY leave the actions/upload-artifact version choice to the SHA the implementer resolves at implementation time. The pin verified 2026-09-29 for the v4 line, and the pin already used by `Upload docs-build evidence`, is ea165f8d65b6e75b540449e92b4886f43607fa02.

## Specification
Objective: Publish the docs dist from docs-build as a run-bound artifact so the deploy job ships exactly what the Docs build step produced.
Success state: ci.yml validates with actionlint, docs-build carries the pinned `Upload docs dist` step after the `Docs build` step, the pin resolves on GitHub to the tagged commit, the job ids and docs-build needs are unchanged, and `Upload docs-build evidence` is unchanged.

Provides:
- Artifact `docs-dist` (path apps/docs/dist, retention-days: 1, if-no-files-found: error) uploaded by the docs-build job after the `Docs build` step, only when that step succeeded
- tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts: parseWorkflow(path) returning the workflow as JSON via the system ruby YAML parser, and runActionlint(path)

Consumes:
- docs-build job, whose step named `Docs build` runs `pnpm --filter @rnr-ai-elements/docs build` and writes apps/docs/dist
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts (APX-006)

Boundary contracts:
- Build-once seam: the bytes deploy later ships are exactly the bytes the `Docs build` step wrote. dist is never rebuilt inside deploy.
- The `Upload docs dist` step has no `if` key, so it runs only after a successful `Docs build` step. A red docs-build run publishes no `docs-dist` for deploy to pick up.
- Every new action reference is pinned to a 40-hex commit SHA with a `# vX.Y.Z` comment, and the SHA resolves on GitHub.

Capabilities: CAP-DEP-01. PRD refs: UC-DELIV-02 AC-1; UC-DELIV-01 (registry freshness chain); 11-technical-requirements/09 CAP-DEP-01.

## Acceptance Criteria
### AC-1: docs-build uploads docs-dist after the Docs build step
  GIVEN: the real ci.yml after the change
  WHEN:  the workflow is parsed with the real YAML parser
  THEN:  the docs-build job has a step named `Upload docs dist` that comes after the step named `Docs build`, uses actions/upload-artifact at a 40-hex SHA with a `# v` version comment, and sets name docs-dist, path apps/docs/dist, retention-days 1 and if-no-files-found error, with no `if` key
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
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the upload step is missing","the upload step sits before the Docs build step","retention-days is not 1","the step carries an if key","the action is a floating tag","the upload step is removed from docs-build"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["parse ci.yml","locate docs-build steps by name and index"]},"end_state":{"must_observe":["step `Upload docs dist` at an index greater than the step named `Docs build`","`name`: `docs-dist` and `path`: `apps/docs/dist`","retention-days equals 1 and if-no-files-found equals error","uses matches /^actions\\/upload-artifact@[0-9a-f]{40}$/ and the line comment matches /# v\\d+\\.\\d+\\.\\d+/"],"must_not_observe":["an `if` key on the step","a floating @v tag on the step","the step absent (0 matches for `Upload docs dist`)"]}},{"start_ref":"ci_yml_copy_without_upload_step","action":{"actor":"spec","steps":["run the same checker on the copy without the step"]},"end_state":{"must_observe":["the checker throws an error containing `Upload docs dist`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}
```

### AC-2: ci.yml passes actionlint and a broken copy does not
  GIVEN: the real ci.yml, and a copy whose docs-build needs a job id that does not exist
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

### AC-3: The other jobs and the existing docs-build evidence upload are untouched
  GIVEN: the real ci.yml after the change
  WHEN:  the workflow is parsed
  THEN:  the job ids are exactly typecheck, lint, registry and docs-build, docs-build still needs [typecheck, lint, registry], the step named `Docs build` still runs `pnpm --filter @rnr-ai-elements/docs build`, the existing `Upload docs-build evidence` step still exists with `if: always()`, uses `actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02`, name `docs-build-log`, path `docs-build.log`, retention-days 7 and if-no-files-found error, and only docs-build contains a step with `docs-dist`
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
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["a job id was renamed","docs-build lost a needs entry","the Upload docs-build evidence step was removed or edited","the docs-dist step was added to a second job"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["parse ci.yml","list job ids, the docs-build needs array, and every step referencing docs-dist"]},"end_state":{"must_observe":["job ids equal [`typecheck`, `lint`, `registry`, `docs-build`] in that order","docs-build needs equals [`typecheck`, `lint`, `registry`]","the `Docs build` step still runs `pnpm --filter @rnr-ai-elements/docs build`","the `Upload docs-build evidence` step exists with `if: always()`, uses `actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02`, name `docs-build-log`, path `docs-build.log`, retention-days `7`, and if-no-files-found `error`","exactly `1` job contains a `docs-dist` step"],"must_not_observe":["a renamed job id","docs-dist referenced by any job except docs-build and, after APX-023, deploy's download step","an empty jobs map returned by the parser"]}}]}
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
| TC-1 | The `Upload docs dist` step appears after the step named `Docs build` in the docs-build job | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step |
| TC-2 | The upload step carries no `if` key | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step |
| TC-3 | The checker rejects a ci.yml copy that has no `Upload docs dist` step | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step |
| TC-4 | actionlint exits 0 on the real ci.yml | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint |
| TC-5 | actionlint exits non-zero on a ci.yml copy whose docs-build needs a missing job | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint |
| TC-6 | docs-build still needs typecheck, lint and registry after the change | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-jobs-preserved |
| TC-7 | The pinned upload-artifact SHA resolves on GitHub to the commit of the tag named in its comment | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves |
| TC-8 | GitHub rejects the pinned SHA with its last character flipped | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves |

## Reading List
- .github/workflows/ci.yml (lines 204-254): the docs-build job, the `Docs build` step, and the existing `Upload docs-build evidence` step
- apps/docs/package.json (the build script): what `pnpm --filter @rnr-ai-elements/docs build` runs
- .spec/scenarios/UC-DELIV-02/gated-deploy-order.scenario.md (all): visible deploy contract the artifact serves

## Guardrails
WRITE-ALLOWED:
- .github/workflows/ci.yml (MODIFY)
- tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts (NEW)
- .tmp/APX-022/** (NEW - cycle evidence required by the sprint runner)
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
placed immediately after the `Docs build` step. (.github/workflows/ci.yml:236-246)
Anti-pattern: Rebuilding dist in the deploy job, uploading under `if: always()` so a red Docs build still publishes an artifact, or adding the step to any job other than docs-build.

## Verification Gates
- typecheck: `pnpm typecheck` - Exit 0
- lint: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts` - Exit 0
- complexity: `pnpm check:fallow` - Exit 0
- tests: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts` - Exit 0 with four passing tests, with actionlint and gh installed and authenticated

## Agent Instructions
TDD_MODE is skipped (INFRA), so there is no RED to GREEN ceremony. The real-services proof still applies to every AC.
1. Re-read `.github/workflows/ci.yml` as it stands now. The job ids are typecheck, lint, registry, and docs-build. docs-build needs [typecheck, lint, registry]. The step named `Docs build` runs `pnpm --filter @rnr-ai-elements/docs build`. Edit no job except docs-build.
2. Resolve the upload-artifact SHA at implementation time with `gh api repos/actions/upload-artifact/commits/<tag> --jq .sha` (dereference the tag to a commit). Add the single `Upload docs dist` step in docs-build after the `Docs build` step. Do not edit the `Docs build` step or the `Upload docs-build evidence` step.
3. Write `support/workflow-yaml.ts` (`parseWorkflow`, `runActionlint`) using the system ruby YAML parser through spawnSync. Do not add a package dependency. APX-023 and APX-026 read this file and never edit it.
4. Write the spec. Every negative control runs against an OS-temp copy of the real ci.yml, and the repo file is never mutated.
5. Run every gate. Commit on the task's worktree. Never merge.

## Orchestrator Verification Protocol
The orchestrator re-runs typecheck, lint, complexity and the four-test gate with actionlint and gh authenticated. It runs `git diff` on ci.yml and confirms the change is one added step inside docs-build, after `Docs build`. It confirms the step's SHA matches a real commit of the tag in its comment, that no other job changed, that `Upload docs-build evidence` is unchanged, and that `git diff` touches only `.github/workflows/ci.yml`, `tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts`, and `tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts`.

## Evidence Gates
- Playwright output showing four passing tests.
- The `git diff` of ci.yml showing only the one added step inside docs-build, after `Docs build`.
- The `gh api` output resolving the pinned SHA and its tag to the same commit.
- actionlint output: exit 0 on the real file, non-zero naming `no-such-job` on the broken copy.

## Review Criteria
REVIEWER CHECKS:
- The upload step has no `if` key, so a red Docs build uploads no docs-dist.
- The step sits after the `Docs build` step, and the `Upload docs-build evidence` step is unchanged.
- The pin is a 40-hex commit SHA with a `# vX.Y.Z` comment, and not an annotated tag object SHA.
- No job other than docs-build changed, and no build step was added.
- No package dependency was added, and the negative controls never mutate the repo's ci.yml.

## Dependencies
Depends on: ['APX-006']
Blocks:     ['APX-023', 'APX-025']

## Notes
- Sprint 05's ORI-CI-003 is a human-sequenced precondition, not a dependency. It already landed the live job ids typecheck, lint, registry, and docs-build. Re-read ci.yml before editing and keep those ids and docs-build's needs [typecheck, lint, registry]. Sprint 05's ORI-DEP-003 (the accepted docs already published) is also a precondition of the sprint.
- Human-owned preconditions for the sprint, stated plainly: the `CLOUDFLARE_API_TOKEN` repo secret, the sync PR that lands the deploy job on GitHub main, the `production` environment, and the Cloudflare zone-edit token scope. This task's tests need none of them, because they read ci.yml and public GitHub metadata. The first real artifact appears only on a run after the sync, and APX-025 proves it.
- The specs run in the shared live lane (`live.playwright.config.ts`, owned by APX-006). Root vitest and the root playwright config never collect `*.remote.spec.ts`.
- The ruby YAML parser comes from the system ruby on the developer machine. `yaml` is not a root dependency and package.json is write-prohibited.

## Amendments
- 2026-10-10 (ghactions-planner, ask revise-APX-022-docs-build): Blocked report sha256 `7163db47a15399de7353b814c24c80e48c42656889baf844de02958b25598c86`. The live `.github/workflows/ci.yml` jobs are typecheck, lint, registry, and docs-build. docs-build needs [typecheck, lint, registry]. The step named `Docs build` runs `pnpm --filter @rnr-ai-elements/docs build`. `Upload docs dist` is one new step on docs-build after `Docs build`. The existing `Upload docs-build evidence` step stays. This task does not restore a test job, a docs-e2e job, a `pnpm e2e:docs` step, or a docs-playwright-report upload. The implementer edits no job except docs-build.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"guardrails":{"write_allowed":[".github/workflows/ci.yml (MODIFY)","tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts (NEW)","tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts (NEW)",".tmp/APX-022/** (NEW - cycle evidence required by the sprint runner)"],"write_prohibited":[".github/workflows/sprint-05-acceptance.yml - Sprint 05 file","apps/docs/wrangler.jsonc - Sprint 05 file","package.json - no new dependency, the parser is the system ruby","scripts/docs-data/** - other task's files","tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - owned by APX-006, read only","tests/sprint-05-orient-search/** - other sprint lane"]},"version":"1","task_id":"APX-022","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"real_ci_yml":{"description":"The repo's real .github/workflows/ci.yml at HEAD, parsed by the system ruby YAML parser.","seed_method":"cli","records":[".github/workflows/ci.yml"]},"ci_yml_copy_without_upload_step":{"description":"An OS-temp copy of the real ci.yml with the `Upload docs dist` step removed. The repo file is never mutated.","seed_method":"cli","records":["copy of .github/workflows/ci.yml minus the Upload docs dist step"]},"ci_yml_copy_with_broken_needs":{"description":"An OS-temp copy of the real ci.yml in which docs-build needs a job id that does not exist (`needs: [no-such-job]`).","seed_method":"cli","records":["copy of .github/workflows/ci.yml with needs: [no-such-job] on docs-build"]},"flipped_sha":{"description":"The real pinned SHA with its last hex character changed, which GitHub cannot resolve.","seed_method":"public_api","records":["pinned sha with last character flipped"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the real ci.yml after the change WHEN the workflow is parsed with the real YAML parser THEN the docs-build job has a step named `Upload docs dist` that comes after the step named `Docs build`, uses actions/upload-artifact at a 40-hex SHA with a `# v` version comment, and sets name docs-dist, path apps/docs/dist, retention-days 1 and if-no-files-found error, with no `if` key","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-artifact-step","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the upload step is missing","the upload step sits before the Docs build step","retention-days is not 1","the step carries an if key","the action is a floating tag","the upload step is removed from docs-build"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["parse ci.yml","locate docs-build steps by name and index"]},"end_state":{"must_observe":["step `Upload docs dist` at an index greater than the step named `Docs build`","`name`: `docs-dist` and `path`: `apps/docs/dist`","retention-days equals 1 and if-no-files-found equals error","uses matches /^actions\\/upload-artifact@[0-9a-f]{40}$/ and the line comment matches /# v\\d+\\.\\d+\\.\\d+/"],"must_not_observe":["an `if` key on the step","a floating @v tag on the step","the step absent (0 matches for `Upload docs dist`)"]}},{"start_ref":"ci_yml_copy_without_upload_step","action":{"actor":"spec","steps":["run the same checker on the copy without the step"]},"end_state":{"must_observe":["the checker throws an error containing `Upload docs dist`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the real ci.yml, and a copy whose docs-build needs a job id that does not exist WHEN `actionlint` runs on each THEN actionlint exits 0 on the real file and exits non-zero on the broken copy with a message naming `no-such-job`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-actionlint","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","topology":"single-node","negative_control":{"would_fail_if":["actionlint is not actually invoked","the checker ignores a non-zero actionlint exit","the actionlint output is replaced by a static fixture"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["run `actionlint .github/workflows/ci.yml`"]},"end_state":{"must_observe":["exit code 0"],"must_not_observe":["any actionlint diagnostic line","non-empty actionlint diagnostic output"]}},{"start_ref":"ci_yml_copy_with_broken_needs","action":{"actor":"spec","steps":["run actionlint on the broken copy"]},"end_state":{"must_observe":["an exit code != `0` (non-zero)","output containing `no-such-job`"],"must_not_observe":["exit code 0"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the real ci.yml after the change WHEN the workflow is parsed THEN the job ids are exactly typecheck, lint, registry and docs-build, docs-build still needs [typecheck, lint, registry], the step named `Docs build` still runs `pnpm --filter @rnr-ai-elements/docs build`, the existing `Upload docs-build evidence` step still exists with `if: always()`, uses `actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02`, name `docs-build-log`, path `docs-build.log`, retention-days 7 and if-no-files-found error, and only docs-build contains a step with `docs-dist`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-jobs-preserved","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-jobs-preserved","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["a job id was renamed","docs-build lost a needs entry","the Upload docs-build evidence step was removed or edited","the docs-dist step was added to a second job"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["parse ci.yml","list job ids, the docs-build needs array, and every step referencing docs-dist"]},"end_state":{"must_observe":["job ids equal [`typecheck`, `lint`, `registry`, `docs-build`] in that order","docs-build needs equals [`typecheck`, `lint`, `registry`]","the `Docs build` step still runs `pnpm --filter @rnr-ai-elements/docs build`","the `Upload docs-build evidence` step exists with `if: always()`, uses `actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02`, name `docs-build-log`, path `docs-build.log`, retention-days `7`, and if-no-files-found `error`","exactly `1` job contains a `docs-dist` step"],"must_not_observe":["a renamed job id","docs-dist referenced by any job except docs-build and, after APX-023, deploy's download step","an empty jobs map returned by the parser"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the pinned SHA and its `# vX.Y.Z` comment in the Upload docs dist step, and the same SHA with its last character flipped WHEN the SHA and tag are looked up with gh api against actions/upload-artifact THEN the real SHA resolves as a commit and equals the dereferenced commit of the tag in the comment, and the flipped SHA is rejected by GitHub with a 404 or 422","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-pin-resolves","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","topology":"single-node","negative_control":{"would_fail_if":["the pin is a made-up SHA","the comment names a tag that points at a different commit","the checker treats a 404 as success","the pinned SHA is a hardcoded value that the lookup never queries"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_ci_yml","action":{"actor":"spec","steps":["extract the SHA and tag comment","call `gh api repos/actions/upload-artifact/commits/<sha>` and `gh api repos/actions/upload-artifact/commits/<tag> --jq .sha`"]},"end_state":{"must_observe":["the SHA lookup returns the same 40-hex sha","the tag lookup returns that same `sha` (`40` hex characters)"],"must_not_observe":["a 404 for the pinned sha","two different shas","an empty sha returned by the lookup"]}},{"start_ref":"flipped_sha","action":{"actor":"spec","steps":["call gh api with the flipped SHA"]},"end_state":{"must_observe":["gh exits non-zero with HTTP 404 or 422"],"must_not_observe":["a resolved commit","a non-empty commit body returned for the flipped sha"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The `Upload docs dist` step appears after the step named `Docs build` in the docs-build job","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-artifact-step","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"The upload step carries no `if` key","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-artifact-step","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step","maps_to_ac":"AC-1"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The checker rejects a ci.yml copy that has no `Upload docs dist` step","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-artifact-step","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-artifact-step","maps_to_ac":"AC-1"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"actionlint exits 0 on the real ci.yml","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-actionlint","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint","maps_to_ac":"AC-2"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"actionlint exits non-zero on a ci.yml copy whose docs-build needs a missing job","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-actionlint","test_tier":"integration","verification_service":"real actionlint binary on the real ci.yml","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-actionlint","maps_to_ac":"AC-2"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"docs-build still needs typecheck, lint and registry after the change","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-jobs-preserved","test_tier":"integration","verification_service":"real ci.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-jobs-preserved","maps_to_ac":"AC-3"},{"id":"TC-7","type":"test_criterion","primary":false,"description":"The pinned upload-artifact SHA resolves on GitHub to the commit of the tag named in its comment","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-pin-resolves","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves","maps_to_ac":"AC-4"},{"id":"TC-8","type":"test_criterion","primary":false,"description":"GitHub rejects the pinned SHA with its last character flipped","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts","test_function":"APX-022-pin-resolves","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts --grep APX-022-pin-resolves","maps_to_ac":"AC-4"}]}
-->

## Handoff

```json
{"task":"APX-022","commit_sha":"6dbf74f90d11333af862fac65b1e4dc640fc01b2","done":"docs-build uploads apps/docs/dist as artifact docs-dist at .github/workflows/ci.yml:247, after the Docs build step and before Upload docs-build evidence, pinned to actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2 with retention-days 1, if-no-files-found error, and no if key. parseWorkflow and runActionlint are tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts:32 and :47, and the four checks are tests/sprint-07-deploy-live-at-apex/ci-docs-dist-artifact.remote.spec.ts:154, :162, :175, and :196. The approved tip also allows that one-day retention at tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts:299 and rebinds tests/sprint-05-orient-search/evidence/ORI-CI-003 to candidate b876c194.","deviations":["The revised task still write-prohibits tests/sprint-05-orient-search, but b876c194 changes tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts:299 so only the docs-dist upload may use retention-days 1, and 6dbf74f9 replaces the ORI-CI-003 evidence with a real preflight of that candidate, because the new upload otherwise fails the seven-day retention assertion."],"concerns":[],"findings":["Live ci.yml still registers on.workflow_call with a required candidate_sha, which TASK-APX-023.md:68 says the workflow on keys must not include."],"scope_impact":[{"target":"APX-023","found":"TASK-APX-023.md:22 still says ci.yml has jobs typecheck, lint, test, registry, and docs-e2e, and TASK-APX-023.md:68 requires deploy needs that set.","change":"Point deploy needs at typecheck, lint, registry, and docs-build, and download artifact docs-dist from the docs-build upload at .github/workflows/ci.yml:247."},{"target":"GATE:FLOW-DELIV-02-gated-deploy-order","found":"SPRINT.md:56 still expects registry, typecheck, lint, test, and docs-e2e, and says the docs-dist artifact comes from docs-e2e.","change":"Expect the four live jobs plus deploy, and say docs-dist is uploaded by docs-build at .github/workflows/ci.yml:247."}],"feedback":["The first APX-022 contract named a docs-e2e step after telling the implementer to keep ORI-CI-003's job ids, and the revise fixed APX-022 while leaving APX-023 and SPRINT.md:56 on the old five-job list."]}
```
