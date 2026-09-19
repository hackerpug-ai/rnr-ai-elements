<!-- Template Version: 5.2.0 -->

# ORI-CI-003: Enforce credential-free candidate checks in GitHub Actions

## What this does

Credential-free candidate checks reject missing inputs and stale artifacts, build docs after prerequisites succeed, and produce source-bound hosted evidence for protected acceptance.

## Why

The existing workflow can pass when required inputs are absent. Protected acceptance needs fresh checks of its exact candidate, with complete test and docs-e2e obligations preserved across the workflow handoff.

## How to verify

- Run `actionlint .github/workflows/ci.yml`.
- Run `pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts`.
- Run the exact candidate-preflight command in Evidence Gates.
- Inspect actual hosted negative runs, restored positives, command exits, candidate identities and artifact hashes.

## Scope

Update ci.yml, the candidate preflight, two owned test files and six evidence files. Full native/provider acceptance belongs to ORI-CI-004.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: Backlog
> Assignee: ghactions-implementer · Reviewer: ghactions-reviewer
> Priority: P1 · Points: 5 · Type: INFRA
> Dependency phase: After ORI-CI-002, ORI-CONT-004, ORI-CONT-006 and ORI-AST-010
> Proposed By: ghactions-planner · Co-authored By: []
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no
> Sprint: [SPRINT.md](./SPRINT.md) · Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer
> PROGRESS: 0/4 acceptance criteria; evidence is planned, not observed.

### OUTCOME

Credential-free candidate checks reject missing inputs and stale artifacts, build docs after prerequisites succeed, and produce source-bound hosted evidence for protected acceptance.

### 🚫 CRITICAL CONSTRAINTS

- Never expose provider or Cloudflare credentials, inherit secrets, grant write/OIDC permissions, or use pull_request_target.
- Never accept another SHA, a PR merge ref, cancelled execution, cached proof or static success as candidate acceptance.
- Never skip missing inputs, relax compilers, or replace complete test/docs-e2e obligations with browser-only checks.
- Never let generation silently repair a release or cache accepted dist, consumers, Pagefind output or proof.
- Never edit outside writeAllowed; preserve shared WIP and consume owner-prepared negative product/content candidates.

### RUNTIME_COMMANDS

| Purpose | Exact command |
|---|---|
| Task tests | `pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts` |
| Root typecheck | `pnpm typecheck` |
| Live import graph | `pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json` |
| Lint | `pnpm lint` |
| Tokens | `pnpm check:tokens` |
| Styling contract | `pnpm check:contract` |
| Fresh registry | `pnpm registry:build` |
| Docs build | `pnpm --filter @rnr-ai-elements/docs build` |
| Separate diagnostic | `pnpm --dir apps/example exec tsc --noEmit` |

### DONE WHEN

- [ ] AC-1: four real candidate jobs enforce ordering, source identity and evidence integrity.
- [ ] AC-2: missing inputs and live-chat type errors fail; restored required compilers pass.
- [ ] AC-3: tracked and untracked generated drift fail; restored artifacts permit docs-build.
- [ ] AC-4: invalid content fails the real hosted build; restored content produces fresh output.
- [ ] Evidence gates pass, independent review approves the candidate, and only allowed implementation/evidence paths change.

### ACCEPTANCE CRITERIA

This INFRA task owns no locked visitor flow. All ACs use task-owned integration proof, primary:false and flow_ref:null. No governed UI flow is claimed, so surface_policy is null. The JSON under each heading is the complete human-readable criterion and proof specification.

#### AC-1: Real candidate checks and identity

```json
{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN a reviewed candidate WHEN automatic checks and its protected caller execute THEN four jobs produce fresh evidence and reject mismatched, cancelled or incomplete proof.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts","test_function":"ORI-CI-003-candidate-identity","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-candidate-identity","test_tier":"integration","verification_service":"Real GitHub Actions, GitHub API and pnpm workspace commands","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real GitHub Actions, GitHub API and pnpm workspace commands","negative_control":{"would_fail_if":["The preflight returns static success or GitHub responses are mocked.","Source identity, cancellation or missing artifacts are ignored."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"reviewed_candidate","action":{"actor":"cli_user","steps":["Run the exact preflight command and observe real PR and protected workflow_call executions.","Read actual job, permission, action, cache and artifact records; reconcile all five acceptance check names with GitHub settings."]},"end_state":{"must_observe":["typecheck, lint, registry and docs-build conclude 'success'; docs-build starts after all 3 prerequisites succeed.","Runs use ubuntu-24.04, Node 24, pnpm 10.32.1 and frozen installation; both compilers and all 3 lint commands execute.","Protected caller and checkout equal the candidate SHA; 6 evidence files have hashes and 7-day retention.","Only contents: read, verified full-SHA actions, persist-credentials: false and dependency-download caches are used."],"must_not_observe":["Empty hosted evidence or static YAML substituted for execution.","Automatic test/docs-e2e acceptance, cached dist/proof, privileged permissions or provider/Cloudflare credentials."]}},{"start_ref":"hosted_runs","action":{"actor":"api_client","steps":["Compare candidate B with the genuine completed run for A; supersede an automatic run through a real synchronize event.","Attempt qualification with a missing or altered artifact and inspect actual GitHub records."]},"end_state":{"must_observe":["Exactly 3 qualification attempts report 'rejected': cross-candidate, missing artifact and altered artifact. The cross-candidate record stores unequal 40-character candidate SHA B and proof SHA A, plus the actual source run URL matching https://github.com/hackerpug-ai/rnr-ai-elements/actions/runs/<recorded_run_id>.","The superseded run is 'cancelled'; restored success has its own SHA and URL."],"must_not_observe":["Replayed, PR merge-ref, cancelled or incomplete evidence accepted for B; 0 rejection records or empty candidate SHA, proof SHA or source run URL fields."]}}]}}
```

#### AC-2: Missing inputs and scoped compiler failures

```json
{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN candidates missing inputs or containing a live-chat type error WHEN real checks execute THEN required checks fail, docs-build is withheld, and restored source passes both required compilers.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts","test_function":"ORI-CI-003-required-inputs","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-required-inputs","test_tier":"integration","verification_service":"Real GitHub Actions, pnpm and TypeScript compiler","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real GitHub Actions, pnpm and TypeScript compiler","negative_control":{"would_fail_if":["An absence guard returns fake success.","The live import graph is disconnected from the compiler or its errors are ignored."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["Run missing-package and missing-registry-script candidates through real local preflight and hosted PR checks."]},"end_state":{"must_observe":["Missing package.json fails required checks; missing scripts.registry:build fails registry.","docs-build is 'skipped' after prerequisite failure."],"must_not_observe":["Missing inputs accepted through scaffold notices or skipped-success guards; 0 recorded failing prerequisite jobs or an empty missing-input diagnostic."]}},{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["Run live-type-error through the scoped compiler and hosted typecheck.","Run restored source through both required compilers; separately capture the whole-example diagnostic."]},"end_state":{"must_observe":["The scoped compiler reports string is not assignable to number; typecheck is 'failure' and docs-build is 'skipped'.","Restored required compilers exit 0; live-chat-typecheck.log and whole-example-diagnostic.log record separate commands and actual exits."],"must_not_observe":["docs-build success after compiler failure, hidden diagnostic failure or an unsupported package-wide green claim; 0 captured compiler errors for live-type-error or empty compiler/whole-example logs."]}}]}}
```

#### AC-3: Tracked and untracked registry freshness

```json
{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN stale or missing committed engine artifacts WHEN real registry generation runs THEN tracked and untracked drift fail registry, withhold docs-build, and pass only after restoration.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts","test_function":"ORI-CI-003-registry-drift","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-registry-drift","test_tier":"integration","verification_service":"Real GitHub Actions, Git filesystem and registry generator","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real GitHub Actions, Git filesystem and registry generator","negative_control":{"would_fail_if":["The registry check is disconnected from the generator or returns static success.","Tracked-diff-only inspection ignores untracked generated output."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["Run pnpm registry:build on stale-registry in real local and hosted candidates; inspect tracked differences."]},"end_state":{"must_observe":["Tracked drift names public/r/uniwind/message.json; registry is 'failure' and docs-build is 'skipped'."],"must_not_observe":["Silent regeneration accepted as a clean committed release; 0 tracked drift paths or an empty before/after hash record for public/r/uniwind/message.json."]}},{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["Run pnpm registry:build on missing-generated-item; enumerate untracked generated output.","Rerun restored source and capture both engine inventories and hashes."]},"end_state":{"must_observe":["Untracked drift names public/r/nativewind/message.json; registry is 'failure' and docs-build is 'skipped'.","Restored registry is 'success'; generated-artifacts.json records nonempty nativewind/uniwind inventories, detected paths and before/after hashes."],"must_not_observe":["An empty inventory or untracked generated artifact accepted as fresh release proof."]}}]}}
```

#### AC-4: Real authored-content build failure

```json
{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN invalid authored content and restored source WHEN the real hosted docs build runs after prerequisites THEN invalid content fails and restored content produces fresh output with source-bound evidence.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts","test_function":"ORI-CI-003-docs-build-failure","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-docs-build-failure","test_tier":"integration","verification_service":"Real GitHub Actions and Astro content/build pipeline","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real GitHub Actions and Astro content/build pipeline","negative_control":{"would_fail_if":["The docs step is a no-op or substitutes cached output.","Content validation is bypassed or failure becomes success."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["After typecheck, lint and registry succeed, run pnpm --filter @rnr-ai-elements/docs build verbatim for invalid-content."]},"end_state":{"must_observe":["docs-build is 'failure' and names the actual authored source path and missing required field."],"must_not_observe":["continue-on-error, skipped execution or successful diagnostic upload masking the build failure; 0 content validation errors or empty authored source-path and missing-field diagnostics."]}},{"start_ref":"reviewed_candidate","action":{"actor":"cli_user","steps":["Run restored source through the same hosted workflow; inspect actual apps/docs/dist output and run records."]},"end_state":{"must_observe":["Restored docs-build is 'success' with nonempty apps/docs/dist output and hashes.","hosted-runs.json contains 2 records for this negative/restored pair, with distinct real run IDs and actual URLs matching https://github.com/hackerpug-ai/rnr-ai-elements/actions/runs/<recorded_run_id>. Both runs have status 'completed'; docs-build conclusions are 'failure' and 'success', respectively. Each record contains the actual 40-character workflow revision and checkout SHA equal to its recorded candidate SHA."],"must_not_observe":["Empty or cached dist accepted as fresh build proof."]}}]}}
```

### TEST CRITERIA

Each boolean criterion inherits its mapped AC's scenario.

```json
[{"id":"TC-1","type":"test_criterion","description":"Four real candidate jobs enforce ordering, exact source identity and rejection of cancelled or incomplete proof.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-candidate-identity","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Missing inputs and the live-chat type error fail required checks; restored compilers pass and whole-example diagnostics remain separate.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-required-inputs","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Fresh generation detects tracked and untracked drift; restored registry artifacts permit docs-build.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-registry-drift","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Invalid authored content fails the real hosted build; restored content produces fresh nonempty output and source-bound evidence.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-docs-build-failure","maps_to_ac":"AC-4"}]
```

### SHARED FIXTURES

Owners prepare negative commits through real Git entrypoints in isolated verification candidates. This task consumes those revisions and does not gain permission to edit prohibited product, package or content paths. No fixture injects a view, mocks HTTP, fakes a filesystem or fabricates a hosted result.

```json
{"reviewed_candidate":{"description":"Clean reviewed candidate with the four dependencies integrated and no ORI-CI-003 hosted proof yet.","seed_method":"cli","records":["RNR_S05_CANDIDATE_SHA resolves to a real reviewed commit derived from source 38034e972490945b684f5bd5a706bca0479dc659.","Real package.json, frozen lockfile, tsconfig.live-chat.json, both registry trees and authored docs are present; provider and Cloudflare credentials are absent."]},"negative_candidates":{"description":"Owner-prepared isolated Git candidates, each carrying one recorded real defect.","seed_method":"cli","records":["missing-package omits package.json; missing-registry-script removes scripts.registry:build.","live-type-error adds const oriCi003Probe: number = 'ORI-CI-003' in a file imported by tsconfig.live-chat.json.","stale-registry changes committed public/r/uniwind/message.json; missing-generated-item omits committed public/r/nativewind/message.json, which the real generator recreates as untracked output.","invalid-content removes required frontmatter from one dependency-owned document; record its exact source path and mutation bytes.","Record every candidate SHA, parent and mutation hash; restored source retains the original bytes."]},"hosted_runs":{"description":"Real GitHub runs for different recorded candidate SHAs A and B, including a superseded run and restored positive.","seed_method":"public_api","records":["Real pull_request opened/synchronize/reopened events and the protected workflow_call create the runs.","Read actual run IDs, attempts, workflow/event/checkout SHAs, conclusions and artifact digests from GitHub; no canned responses."]}}
```

### SCOPE

writeAllowed:

- `.github/workflows/ci.yml`
- `tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts`
- `tests/sprint-05-orient-search/support/candidate-preflight.mjs`
- `tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts`
- `tests/sprint-05-orient-search/evidence/ORI-CI-003/manifest.json`
- `tests/sprint-05-orient-search/evidence/ORI-CI-003/actionlint.log`
- `tests/sprint-05-orient-search/evidence/ORI-CI-003/live-chat-typecheck.log`
- `tests/sprint-05-orient-search/evidence/ORI-CI-003/hosted-runs.json`
- `tests/sprint-05-orient-search/evidence/ORI-CI-003/generated-artifacts.json`
- `tests/sprint-05-orient-search/evidence/ORI-CI-003/whole-example-diagnostic.log`

writeProhibited:

- Product source
- Package dependencies and lockfile
- Authored documentation
- Cloudflare configuration or deployment implementation
- Broad test exclusions or compiler relaxations
- Planning artifacts
- Any implementation file not explicitly listed in writeAllowed.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES

Always:

- Validate candidate identity before executing its commands.
- Capture actual commands, exits, tool versions and hashes.
- Fail required jobs when declared evidence is absent.
- Keep whole-example diagnostics separate from mandatory compilers.
- Preserve shared WIP and use owned OS-derived scratch roots.

Ask first:

- Any new product, dependency, compiler or documentation scope.
- External actions or protection changes without existing authorization.

#### Acceptance and compiler contracts

- Retain typecheck, lint, registry, test, and docs-e2e as distinct acceptance obligations. Their workflow-qualified required-check names must be reconciled against actual GitHub settings before acceptance.
- Remove all package.json and registry-script success-on-absence guards. Missing required inputs fail.
- Typecheck preserves pnpm typecheck and adds pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json for the newly owned live import graph. Both must pass. The root tsconfig excludes apps; apps/example has no typecheck script. Record the separate whole-example diagnostic without treating it as a new acceptance obligation or a successful package-wide check.
- Lint runs pnpm lint, pnpm check:tokens, and pnpm check:contract.

#### Generation and handoff contracts

- Registry runs fresh generation and checks tracked differences plus untracked generated artifacts. Do not let generation silently repair an uncommitted release.
- Docs-build invokes pnpm --filter @rnr-ai-elements/docs build verbatim after prerequisite success.
- The automatic PR run provides credential-free feedback. It cannot claim full test, native, provider, or publication acceptance.
- The protected acceptance workflow calls this workflow again at its exact candidate revision. Acceptance does not reuse a green run from another SHA or a PR merge ref.

#### Security and execution contracts

- Pass event values through validated inputs or environment variables, never interpolated executable shell text.
- Set checkout persist-credentials: false. Cache dependency downloads only, with operating-system and lockfile identity; never cache accepted dist, consumers, Pagefind output, or proof.
- Use workflow-plus-PR/ref concurrency for automatic checks. Cancellation must invalidate acceptance.
- Run actionlint and verify actual hosted positive and negative runs. Static YAML tests alone are insufficient.

### DELIVERABLE

| Path | Contribution |
|---|---|
| `.github/workflows/ci.yml` | Credential-free automatic and reusable workflow. |
| `tests/sprint-05-orient-search/support/candidate-preflight.mjs` | Candidate identity validation, matching real command execution and evidence capture. |
| `tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts` | Four exact task-owned integration proof tokens. |
| `tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts` | Update superseded workflow assertions while retaining real chain proof. |
| Six exact evidence paths in Scope | Future diagnostics, hosted records and source/artifact manifests. |

#### Workflow architecture

- Events: pull_request opened/synchronize/reopened; push main; workflow_call.
- Jobs: typecheck, lint, registry, docs-build. All three prerequisites must succeed before docs-build.
- Runner/toolchain: ubuntu-24.04; Node 24; pnpm 10.32.1; pnpm install --frozen-lockfile. No redundant platform matrix is needed for this credential-free lane.
- Relocate complete test and docs-e2e jobs to ORI-CI-004's protected acceptance workflow. Do not retain automatic browser-only jobs with those acceptance names.
- The reusable workflow checks its exact candidate revision. Coordinate caller/callee concurrency so they do not cancel each other; never qualify cancellation as acceptance.

#### Action pins

| Action | Full commit pin |
|---|---|
| actions/checkout | 11bd71901bbe5b1630ceea73d27597364c9af683 |
| actions/setup-node | 49933ea5288caeca8642d1e84afbd3f7d6820020 |
| pnpm/action-setup | a7487c7e89a18df4991f7f222e4898a00d66ddda |
| actions/upload-artifact | ea165f8d65b6e75b540449e92b4886f43607fa02 |

These are full commit pins preserved from the prior proposal, not a claim of current release certification. Verify their official repository provenance and runner compatibility before implementation acceptance. Any replacement must also use a verified full commit SHA.

Workflow permissions default to contents: read. No secrets are declared. Forbid checks: write, pull-requests: write, id-token: write, secrets: inherit, provider credentials, Cloudflare credentials and privileged checkout through pull_request_target. OIDC and attestation actions requiring extra write grants are outside this task.

Allowlisted diagnostics and manifests only; seven-day retention. Successful jobs require their declared evidence files. Failure-diagnostic upload cannot turn failure into success.

### AGENT INSTRUCTIONS

TDD_MODE is skipped because this is workflow/configuration infrastructure. This waives RED-first scheduling, not real behavioral integration proof or seeded evidence. No command is claimed to have run.

1. Recheck source identity and the four dependency outputs. Consume owner-prepared isolated negative candidates.
2. Change only the allowed workflow, preflight and tests. Remove absence-success guards from ci.yml; do not edit package.json or registry implementation.
3. Execute each AC token against real commands and authentic hosted records. Static YAML checks provide supporting evidence only.
4. Observe failure candidates and restored positives. Preserve command exits, source identities, run URLs and artifact hashes.
5. Submit the scoped candidate and evidence to ghactions-reviewer. Unavailable real-service prerequisites block acceptance; do not substitute stubs, skipped targets or canned records.

### READING LIST

1. `.github/workflows/ci.yml`, lines 1-164 — [PRIMARY PATTERN] existing events, guards, job graph and evidence uploads; correct the documented gaps.
2. `tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts`, lines 270-329 — superseded workflow assertions; preserve real chain tests.
3. `package.json`, lines 5-26 — pinned package manager and exact command entrypoints; read-only input.
4. `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/render-contexts/ORI-CI-003.json` — complete immutable scope, contracts and evidence requirements.
5. `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md` — CAP-DOCS-01 enrichment chain.

#### Design/reference guidance

No UI design changes. Address the five GitHub Actions planning domains through explicit events/needs, exact-revision reuse, full action pins, observed required-check settings and least privilege. Keep accepted build artifacts and native/provider proof under ORI-CI-004's ownership.

#### Coding standards

Use explicit YAML permissions, deterministic validation, static imports, typed records and argument-vector process execution. Pass event data through validated inputs/environment values. Propagate real nonzero exits. Preserve package pins and the lockfile; add no compiler relaxation, runtime skip or extra implementation log outside the allowlist.

#### Agent rationale

ghactions-planner defines the job graph and trust boundary; ghactions-implementer owns workflow/preflight changes; ghactions-reviewer independently checks hosted behavior, identity and security.

### EVIDENCE GATES

1. Run actionlint and every exact AC test token. Missing tests, skipped tests and YAML-only proof fail the gate.
2. Run the exact local preflight. Require both compilers, all three lint commands, fresh registry checks and the verbatim docs build; retain the separate whole-example diagnostic.
3. Observe actual hosted missing-input, live-type-error, tracked/untracked registry-drift and invalid-content failures, restored positives, and rejection of mismatched/cancelled/incomplete proof.
4. Verify official action-SHA provenance, runner compatibility, actual workflow-qualified required checks and the protected caller's candidate identity with ORI-CI-004. Unresolved external prerequisites block acceptance.
5. Independently inspect all six evidence files, seeded values, commands/exits, run URLs and hashes. Check the diff against writeAllowed and scan touched production code/tests for stubs, placeholders, skips and deferred behavior.

Exact verification commands:

```sh
actionlint .github/workflows/ci.yml
pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts
node tests/sprint-05-orient-search/support/candidate-preflight.mjs --candidate "$RNR_S05_CANDIDATE_SHA" --output tests/sprint-05-orient-search/evidence/ORI-CI-003
```

Separate diagnostic:

```sh
pnpm --dir apps/example exec tsc --noEmit
```

All six evidence paths are future outputs. The manifest binds source, workflow, lockfile, command, driver and applicable policy hashes to actual artifacts. Record real commands, exits, tool versions, run IDs/attempts, URLs, checked-out SHAs and job conclusions. Preserve negative and restored results in the allowlisted records. Never copy credentials or substitute local proof for hosted checks.

Discriminating proof:

- Use isolated negative candidate branches to demonstrate missing required inputs fail instead of returning scaffold success.
- Demonstrate a real type error in the owned live-chat import graph fails its scoped compiler and withholds docs-build; restore the source and obtain a positive hosted result.
- Demonstrate stale or additional generated registry output fails registry and withholds docs-build.
- Demonstrate invalid authored content fails the real hosted docs build.
- Record run URLs, workflow revision, checked-out SHA, job conclusions, and restored positive results.

### OUT OF SCOPE

- Complete test, browser/native/provider acceptance and protected runner implementation: ORI-CI-004.
- Product/content repairs, dependency or lockfile changes, compiler relaxation and whole-example gallery remediation.
- Cloudflare configuration, deployment, publication and unapproved protection-setting changes.
- New visitor flows, journey ownership or planning artifact edits.

### CONTEXT

Current gap: ci.yml contains absence-success guards, floating action tags, checks: write and no workflow_call. Its existing docs-e2e job depends on test.

Success state: actual hosted failures stop the intended stage, restored positives execute fresh commands, and exact source/evidence identity supports the protected acceptance handoff without claiming full acceptance from automatic feedback.

### REVIEW

Must pass:

- Human and machine criteria carry identical complete scenarios and proof bindings.
- Real negative candidates fail their intended stage; restored positives prove fresh execution.
- Five acceptance obligations remain distinct, with complete test/docs-e2e assigned to ORI-CI-004.
- Full pins, least privilege, safe event handling, dependency-only caches and seven-day evidence retention hold.
- The implementation/evidence diff respects the allowlist and contains no fake or deferred core behavior.

Should verify:

- Workflow-plus-PR/ref concurrency cancels superseded automatic runs without caller/callee self-cancellation.
- Untracked generated files cannot escape freshness checks.
- Diagnostic uploads preserve failed conclusions and contain no credentials.

Verdict: APPROVED or NEEDS_FIXES, supported by concrete evidence and file references. Planned artifacts and static tests alone cannot support APPROVED.

### DEPENDENCIES

Depends on: ORI-CI-002, ORI-CONT-004, ORI-CONT-006, ORI-AST-010.

Blocks: ORI-CI-004.

Provides:

- Reusable credential-free candidate checks and a matching real local preflight.
- Six allowlisted source-bound evidence artifacts.
- Workflow-qualified check identity reconciliation for protected acceptance.

Consumes:

- ORI-CI-002's ordered build contract.
- ORI-CONT-004 and ORI-CONT-006 authored content and validation inputs.
- ORI-AST-010's integrated journey lane, retained by complete acceptance.
- Owner-prepared negative candidates and actual GitHub run/protection observations.

Capability: CAP-DOCS-01, `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md`.

Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/ghactions-planner-absorb-prerequisites.json`. Source task IDs: [ORI-CI-003]. Co-author provenance: [].

### VERIFICATION PRECONDITIONS

- VP-EXECUTION-SCOPE: this is planning only. Subsequent implementation/external actions require their execution authorization; preserve shared WIP and owned scratch roots. All evidence remains future output.
- VP-SOURCE-IDENTITY: recheck the dispatch source 38034e972490945b684f5bd5a706bca0479dc659 and selected reviewed commits; bind source, lockfile, commands, drivers/policies and artifact bytes.
- VP-EXAMPLE-DIAGNOSTICS: root typecheck excludes apps and apps/example has no typecheck script. Capture the whole-example compiler separately; errors entering the required live graph block its owner. Broader gallery repairs require new scope.
- VP-GITHUB-PROTECTION: verify actual check names, workflow availability, same-repository dispatch and candidate/event SHA equality, protection support, independent approval, runner-group restrictions and artifact access. Verify action provenance. Fork/unreviewed code receives neither provider credentials nor protected native-runner access.

### FIXED SPRINT CONTRACT

Gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).

The fixed sprint has 13 flows: 9 task flows and 4 journey flows; 36 tasks and 131 points. This task owns no visitor flow and returns no journey proofs. The four journey proofs remain with ORI-AST-010. No canonical proof.red path is renamed.

Hosted enforcement has no additional visitor flow. Actual failed candidates must prevent downstream acceptance.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CI-003","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"reviewed_candidate":{"description":"Clean reviewed candidate with the four dependencies integrated and no ORI-CI-003 hosted proof yet.","seed_method":"cli","records":["RNR_S05_CANDIDATE_SHA resolves to a real reviewed commit derived from source 38034e972490945b684f5bd5a706bca0479dc659.","Real package.json, frozen lockfile, tsconfig.live-chat.json, both registry trees and authored docs are present; provider and Cloudflare credentials are absent."]},"negative_candidates":{"description":"Owner-prepared isolated Git candidates, each carrying one recorded real defect.","seed_method":"cli","records":["missing-package omits package.json; missing-registry-script removes scripts.registry:build.","live-type-error adds const oriCi003Probe: number = 'ORI-CI-003' in a file imported by tsconfig.live-chat.json.","stale-registry changes committed public/r/uniwind/message.json; missing-generated-item omits committed public/r/nativewind/message.json, which the real generator recreates as untracked output.","invalid-content removes required frontmatter from one dependency-owned document; record its exact source path and mutation bytes.","Record every candidate SHA, parent and mutation hash; restored source retains the original bytes."]},"hosted_runs":{"description":"Real GitHub runs for different recorded candidate SHAs A and B, including a superseded run and restored positive.","seed_method":"public_api","records":["Real pull_request opened/synchronize/reopened events and the protected workflow_call create the runs.","Read actual run IDs, attempts, workflow/event/checkout SHAs, conclusions and artifact digests from GitHub; no canned responses."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN a reviewed candidate WHEN automatic checks and its protected caller execute THEN four jobs produce fresh evidence and reject mismatched, cancelled or incomplete proof.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts","test_function":"ORI-CI-003-candidate-identity","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-candidate-identity","test_tier":"integration","verification_service":"Real GitHub Actions, GitHub API and pnpm workspace commands","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real GitHub Actions, GitHub API and pnpm workspace commands","negative_control":{"would_fail_if":["The preflight returns static success or GitHub responses are mocked.","Source identity, cancellation or missing artifacts are ignored."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"reviewed_candidate","action":{"actor":"cli_user","steps":["Run the exact preflight command and observe real PR and protected workflow_call executions.","Read actual job, permission, action, cache and artifact records; reconcile all five acceptance check names with GitHub settings."]},"end_state":{"must_observe":["typecheck, lint, registry and docs-build conclude 'success'; docs-build starts after all 3 prerequisites succeed.","Runs use ubuntu-24.04, Node 24, pnpm 10.32.1 and frozen installation; both compilers and all 3 lint commands execute.","Protected caller and checkout equal the candidate SHA; 6 evidence files have hashes and 7-day retention.","Only contents: read, verified full-SHA actions, persist-credentials: false and dependency-download caches are used."],"must_not_observe":["Empty hosted evidence or static YAML substituted for execution.","Automatic test/docs-e2e acceptance, cached dist/proof, privileged permissions or provider/Cloudflare credentials."]}},{"start_ref":"hosted_runs","action":{"actor":"api_client","steps":["Compare candidate B with the genuine completed run for A; supersede an automatic run through a real synchronize event.","Attempt qualification with a missing or altered artifact and inspect actual GitHub records."]},"end_state":{"must_observe":["Exactly 3 qualification attempts report 'rejected': cross-candidate, missing artifact and altered artifact. The cross-candidate record stores unequal 40-character candidate SHA B and proof SHA A, plus the actual source run URL matching https://github.com/hackerpug-ai/rnr-ai-elements/actions/runs/<recorded_run_id>.","The superseded run is 'cancelled'; restored success has its own SHA and URL."],"must_not_observe":["Replayed, PR merge-ref, cancelled or incomplete evidence accepted for B; 0 rejection records or empty candidate SHA, proof SHA or source run URL fields."]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN candidates missing inputs or containing a live-chat type error WHEN real checks execute THEN required checks fail, docs-build is withheld, and restored source passes both required compilers.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts","test_function":"ORI-CI-003-required-inputs","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-required-inputs","test_tier":"integration","verification_service":"Real GitHub Actions, pnpm and TypeScript compiler","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real GitHub Actions, pnpm and TypeScript compiler","negative_control":{"would_fail_if":["An absence guard returns fake success.","The live import graph is disconnected from the compiler or its errors are ignored."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["Run missing-package and missing-registry-script candidates through real local preflight and hosted PR checks."]},"end_state":{"must_observe":["Missing package.json fails required checks; missing scripts.registry:build fails registry.","docs-build is 'skipped' after prerequisite failure."],"must_not_observe":["Missing inputs accepted through scaffold notices or skipped-success guards; 0 recorded failing prerequisite jobs or an empty missing-input diagnostic."]}},{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["Run live-type-error through the scoped compiler and hosted typecheck.","Run restored source through both required compilers; separately capture the whole-example diagnostic."]},"end_state":{"must_observe":["The scoped compiler reports string is not assignable to number; typecheck is 'failure' and docs-build is 'skipped'.","Restored required compilers exit 0; live-chat-typecheck.log and whole-example-diagnostic.log record separate commands and actual exits."],"must_not_observe":["docs-build success after compiler failure, hidden diagnostic failure or an unsupported package-wide green claim; 0 captured compiler errors for live-type-error or empty compiler/whole-example logs."]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN stale or missing committed engine artifacts WHEN real registry generation runs THEN tracked and untracked drift fail registry, withhold docs-build, and pass only after restoration.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts","test_function":"ORI-CI-003-registry-drift","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-registry-drift","test_tier":"integration","verification_service":"Real GitHub Actions, Git filesystem and registry generator","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real GitHub Actions, Git filesystem and registry generator","negative_control":{"would_fail_if":["The registry check is disconnected from the generator or returns static success.","Tracked-diff-only inspection ignores untracked generated output."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["Run pnpm registry:build on stale-registry in real local and hosted candidates; inspect tracked differences."]},"end_state":{"must_observe":["Tracked drift names public/r/uniwind/message.json; registry is 'failure' and docs-build is 'skipped'."],"must_not_observe":["Silent regeneration accepted as a clean committed release; 0 tracked drift paths or an empty before/after hash record for public/r/uniwind/message.json."]}},{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["Run pnpm registry:build on missing-generated-item; enumerate untracked generated output.","Rerun restored source and capture both engine inventories and hashes."]},"end_state":{"must_observe":["Untracked drift names public/r/nativewind/message.json; registry is 'failure' and docs-build is 'skipped'.","Restored registry is 'success'; generated-artifacts.json records nonempty nativewind/uniwind inventories, detected paths and before/after hashes."],"must_not_observe":["An empty inventory or untracked generated artifact accepted as fresh release proof."]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN invalid authored content and restored source WHEN the real hosted docs build runs after prerequisites THEN invalid content fails and restored content produces fresh output with source-bound evidence.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts","test_function":"ORI-CI-003-docs-build-failure","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-docs-build-failure","test_tier":"integration","verification_service":"Real GitHub Actions and Astro content/build pipeline","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real GitHub Actions and Astro content/build pipeline","negative_control":{"would_fail_if":["The docs step is a no-op or substitutes cached output.","Content validation is bypassed or failure becomes success."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"negative_candidates","action":{"actor":"cli_user","steps":["After typecheck, lint and registry succeed, run pnpm --filter @rnr-ai-elements/docs build verbatim for invalid-content."]},"end_state":{"must_observe":["docs-build is 'failure' and names the actual authored source path and missing required field."],"must_not_observe":["continue-on-error, skipped execution or successful diagnostic upload masking the build failure; 0 content validation errors or empty authored source-path and missing-field diagnostics."]}},{"start_ref":"reviewed_candidate","action":{"actor":"cli_user","steps":["Run restored source through the same hosted workflow; inspect actual apps/docs/dist output and run records."]},"end_state":{"must_observe":["Restored docs-build is 'success' with nonempty apps/docs/dist output and hashes.","hosted-runs.json contains 2 records for this negative/restored pair, with distinct real run IDs and actual URLs matching https://github.com/hackerpug-ai/rnr-ai-elements/actions/runs/<recorded_run_id>. Both runs have status 'completed'; docs-build conclusions are 'failure' and 'success', respectively. Each record contains the actual 40-character workflow revision and checkout SHA equal to its recorded candidate SHA."],"must_not_observe":["Empty or cached dist accepted as fresh build proof."]}}]}},{"id":"TC-1","type":"test_criterion","description":"Four real candidate jobs enforce ordering, exact source identity and rejection of cancelled or incomplete proof.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-candidate-identity","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Missing inputs and the live-chat type error fail required checks; restored compilers pass and whole-example diagnostics remain separate.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-required-inputs","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Fresh generation detects tracked and untracked drift; restored registry artifacts permit docs-build.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-registry-drift","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Invalid authored content fails the real hosted build; restored content produces fresh nonempty output and source-bound evidence.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/ci-build-gate-wiring.test.ts -t ORI-CI-003-docs-build-failure","maps_to_ac":"AC-4"}]}
-->
</details>
