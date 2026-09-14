## What this does

Require fresh native, provider, browser, and public-registry evidence before the completed candidate can enter the Cloudflare owner's publication sequence.

## Why

The existing Ubuntu browser job cannot execute the required native Quickstart or provider-backed example. Earlier receipts cannot prove that the final candidate works. This task integrates the owners' real runners and rejects incomplete, stale, or differently sourced evidence.

## How to verify

Run the exact verification commands below in the provisioned acceptance context. Obtain a protected GitHub run for the reviewed candidate, verify all six engine/platform combinations in both proof matrices, and demonstrate rejection of corrupted evidence and failed execution. Local tests and YAML validation cannot complete this task.

## Scope

Own the acceptance workflow, two orchestration/verification scripts, the acceptance evidence test, runner documentation, and the nine bounded evidence destinations listed below. Native, provider, owner-driver, registry, content, policy, planning, and Cloudflare implementation remain with their declared owners.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-CI-004: Require fresh native, provider, and public-registry proof before publication

> Status: Backlog
> Assignee: ghactions-implementer
> Priority: P1 · Points: 5 · Type: INFRA
> Dependency phase: Final acceptance after all declared dependencies
> Proposed By: ghactions-planner
> Co-authored By: react-native-reusables-planner, aisdk-planner, cloudflare-workers-planner, astro-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer
> Additional reviewers: react-native-reusables-reviewer, aisdk-reviewer, test-quality-reviewer

RUNTIME_COMMANDS:
- test: `pnpm test`
- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- acceptance evidence: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts`

PROGRESS: 0/4 acceptance criteria; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

A protected GitHub run proves the exact candidate across both engines and all three platforms, and only complete, fresh evidence permits publication handoff.

### 🚫 CRITICAL CONSTRAINTS

- Never deploy, attach domains, expose Cloudflare credentials, or accept changed registry bytes without a separately reviewed prerequisite release and fresh acceptance.
- Never execute unreviewed fork code on the native runner, bypass independent approval, or accept disagreement between candidate_sha, GITHUB_SHA, and git rev-parse HEAD.
- Never substitute skipped targets, browser device emulation, mocked services, canned answers, success flags, or earlier receipts for actual current-session native/provider proof.
- Never expose OPENAI_API_KEY beyond the trusted launcher and real backend, inherit reusable-workflow secrets, or grant checks: write, contents: write, or id-token: write.
- Never edit outside the allowlist, disturb shared WIP, select an arbitrary device, reuse an unowned listener, or terminate a process without recorded ownership.

### DONE WHEN

- [ ] AC-1: Complete fresh six-target Quickstart and live-example matrices accompany the complete Vitest and docs suites.
- [ ] AC-2: Real protected dispatch, identity checks, resource reservations, and failed prerequisites enforce execution boundaries.
- [ ] AC-3: The verifier rejects incomplete, stale, corrupted, cancelled, or changed-artifact evidence.
- [ ] AC-4: Real failure/recovery, teardown, upload, and terminal GitHub checks govern publication handoff.
- [ ] All verification/evidence gates pass against the reviewed candidate, and only allowed source/evidence paths change.

### ACCEPTANCE CRITERIA

All four criteria are task-local infrastructure proofs. PRIMARY is false and FLOW_REF is null because this task owns no locked visitor flow. This does not waive real integration or end-to-end proof. The governed surface policy remains unchanged for owner UI executions.

**AC-1 — Fresh complete acceptance**

GIVEN a reviewed candidate with provisioned native, provider, and public-registry prerequisites WHEN the acceptance workflow executes owner preparation, pnpm test, and pnpm e2e:docs THEN fresh six-target matrices and all 13 locked flows identify that candidate.

PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Real GitHub Actions, native owner runners, OpenAI backend, public registry HTTPS, and Astro/Playwright at localhost:4321
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/acceptance-evidence.test.ts
TEST_FUNCTION: ORI-CI-004-fresh-acceptance
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-fresh-acceptance`
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real GitHub Actions, native owner runners, OpenAI backend, public registry HTTPS, and Astro/Playwright at localhost:4321","negative_control":{"would_fail_if":["A stub preparation step reuses old receipts or omits either engine or a native target.","A disconnected backend or static transcript replaces real provider responses."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"reviewed_candidate","action":{"actor":"background_job","steps":["Run the reviewed dispatch through preflight and protected native execution using the exact owner commands.","Prepare fresh owner evidence before evidence-consuming tests, then execute pnpm test and pnpm e2e:docs verbatim in their owned workspaces.","Require the Quickstart invocation inside the docs suite to perform its own fresh public installs and seed/live matrices; inspect native captures and browser traces."]},"end_state":{"must_observe":["6 Quickstart results and 6 live-example results cover nativewind and uniwind on ios, android, and web.","13 locked flows retain their 9 task and 4 journey identities; desktop, mobile, and no-JavaScript cases record actual assertions.","Recorded commands include pnpm test and pnpm e2e:docs with exit code 0, CI=true, and http://localhost:4321.","All 6 live-example results contain nonempty correlated provider request/response IDs; every inspected iOS screenshot, Android recording, and Web trace records candidate SHA == RNR_S05_CANDIDATE_SHA and invocation ID == its current owner invocation within RNR_S05_RUN_ID, with SHA-256(capture bytes) == the referenced capture hash."],"must_not_observe":["0 target results, skipped native/provider tests, or an empty transcript substituted for live proof.","Earlier invocation receipts satisfying the final Quickstart invocation."]}}]}
```

**AC-2 — Protected execution fails closed**

GIVEN eligible and deliberately ineligible real dispatch/resource conditions WHEN the acceptance runner evaluates identity, protection, prerequisites, and reservations THEN only the reviewed matching candidate receives native execution and backend-scoped provider access.

PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Real GitHub dispatch and environment protection, exclusive macOS runner, device reservations, and backend process launch
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/acceptance-evidence.test.ts
TEST_FUNCTION: ORI-CI-004-protected-execution
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-protected-execution`
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real GitHub dispatch and environment protection, exclusive macOS runner, device reservations, and backend process launch","negative_control":{"would_fail_if":["A static approval flag replaces GitHub protection checks.","A stub reservation succeeds for an unavailable device or an unowned occupied port."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"reviewed_candidate","action":{"actor":"background_job","steps":["Verify actual runner eligibility and independent environment approval for the reviewed same-repository dispatch.","Compare git rev-parse HEAD, candidate_sha, and GITHUB_SHA; reserve the explicit iOS UDID, Android serial, and ports.","Launch the real backend with the allowlisted provider secret and inspect child environments/client artifacts without printing secret values."]},"end_state":{"must_observe":["3 source identities agree and runner-preflight.json records the reserved RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL.","sprint-05-real-proof records independent approval preventing self-approval before native execution.","Only the 2 process roles 'trusted launcher' and 'backend' receive OPENAI_API_KEY; each of the 5 prohibited groups (installs, Metro, compilers, browsers, and client artifacts) records 0 occurrences of the actual secret value in inspected environments/artifacts, without printing that value."],"must_not_observe":["An empty approval record, arbitrary first-booted device, or secret in client artifacts.","Cloudflare credential access or unreviewed fork execution on the native runner."]}},{"start_ref":"failure_sessions","action":{"actor":"cli_user","steps":["Exercise actual identity mismatch, unavailable/already-owned device, and occupied-unowned localhost:4321 conditions separately.","Run a separately reviewed protected negative candidate whose real prerequisite check fails and query its actual job conclusions."]},"end_state":{"must_observe":["Each identity/device/port rejection records exit code != 0 and gate outcome 'failed', naming the supplied candidate/resource ID and the conflicting observed SHA, iOS UDID, Android serial, or localhost:4321 listener.","The protected negative run withholds native execution after failed preflight, or docs-e2e after failed test, as appropriate."],"must_not_observe":["Exit code 0 from an absent prerequisite, passing runtime skips, port shifting, or fallback device selection.","An accepted-artifact.json for the failed session."]}}]}
```

**AC-3 — Evidence and artifact integrity**

GIVEN genuine current-session evidence and isolated copies WHEN the real verifier receives complete evidence, corrupted variants, or changed candidate/public-registry bytes THEN it accepts only the complete matching evidence and rejects every invalid variant.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real filesystem evidence, acceptance verifier CLI, GitHub run metadata API, and public registry HTTPS
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/acceptance-evidence.test.ts
TEST_FUNCTION: ORI-CI-004-evidence-integrity
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-evidence-integrity`
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem evidence, acceptance verifier CLI, GitHub run metadata API, and public registry HTTPS","negative_control":{"would_fail_if":["A stub verifier accepts success booleans without reading referenced files or GitHub metadata.","A static hash or disconnected public-registry comparison accepts altered candidate bytes."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_acceptance","action":{"actor":"cli_user","steps":["Invoke the real verifier against the genuine evidence set and recompute referenced file, source, lockfile, driver, policy, snippet, registry, and dist hashes.","Read actual GitHub run identity, attempt, and terminal job conclusions when validating hosted acceptance."]},"end_state":{"must_observe":["The complete 6 plus 6 target set resolves to real captured files with matching hashes and provider correlation.","The accepted dist manifest records candidate SHA == RNR_S05_CANDIDATE_SHA, a complete nonempty path set, SHA-256 of every accepted dist file == its independently hashed candidate file, and SHA-256 of every public prerequisite registry response == its candidate registry file."],"must_not_observe":["An empty file set or a success-only manifest accepted as runtime evidence."]}},{"start_ref":"fresh_acceptance","action":{"actor":"cli_user","steps":["Create separate real filesystem copies under rejected-evidence; remove one Android result, alter one source hash, substitute an earlier run manifest, and omit provider response correlation in four separate trials.","Also exercise missing/truncated references, absent engine/Web/flow evidence, a mismatched GitHub attempt, and cancelled or incomplete run records.","Invoke the real verifier on every copy and preserve the original evidence bytes."]},"end_state":{"must_observe":["4 mandatory corruption trials each return nonzero and identify their missing Android result, altered source hash, earlier run, or missing provider correlation.","Every additional incomplete identity/file/target/flow variant returns verifier exit code != 0; the original evidence path set after each trial == its pre-trial path set and SHA-256 of every original evidence file after each trial == its pre-trial hash."],"must_not_observe":["Exit code 0 or accepted-artifact.json for any rejected variant."]}},{"start_ref":"fresh_acceptance","action":{"actor":"cli_user","steps":["Compare the complete candidate registry with actual prerequisite public responses before hosted acceptance.","Exercise a changed artifact in an isolated evidence copy and verify source/generated artifact hashes again after mutation-capable suites."]},"end_state":{"must_observe":["Each candidate/public registry mismatch or changed dist/source trial records gate outcome 'failed', exit code != 0, at least 1 differing expected/observed SHA-256 pair, and a fresh-proof requirement; valid accepted release manifests for that trial == 0.","The complete source path set after the suite == its pre-suite path set, the complete generated-artifact path set after the suite == its pre-suite path set, both path counts are greater than 0, and every per-path SHA-256 after the suite == its pre-suite hash."],"must_not_observe":["Publication handoff for changed bytes or automatic publication of an unproven prerequisite registry; empty or 0-entry source/generated-artifact hash sets treated as verified."]}}]}
```

**AC-4 — Recovery, teardown, and terminal handoff**

GIVEN real successful and failed acceptance sessions WHEN provider failures, cancellation, upload failure, and final verification are exercised THEN owned resources are released and only a complete terminal GitHub success permits the unchanged artifact handoff.

PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Real OpenAI backend, native/browser owner runners, owned OS processes, GitHub artifact upload and terminal run API
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/acceptance-evidence.test.ts
TEST_FUNCTION: ORI-CI-004-terminal-handoff
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-terminal-handoff`
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real OpenAI backend, native/browser owner runners, owned OS processes, GitHub artifact upload and terminal run API","negative_control":{"would_fail_if":["A stub provider invents recovery without a correlated real response.","A no-op cleanup leaves owned listeners or mappings, or a static receipt treats a cancelled/upload-failed run as accepted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"failure_sessions","action":{"actor":"cli_user","steps":["Execute the AI owner's actual missing-credential, unreachable-backend, and rejected-model paths; restore the real supported backend/model and exercise successful retry.","Cancel an owned acceptance session and cause an actual evidence-upload failure in a separately reviewed protected run.","Run finally cleanup and inspect recorded PIDs, mappings, device appearance, and reservations on success, failure, and cancellation."]},"end_state":{"must_observe":["3 provider failure paths record sanitized actual outcomes and successful recovery includes a correlated provider response.","teardown.json records at least 1 terminated owned child PID; residual owned live PIDs, listeners, reservations, and Android mappings each == 0; selected-device appearance after cleanup == its captured pre-run appearance.","The actual GitHub conclusion for the cancelled run is 'cancelled' and for the artifact-upload-failed run is 'failure'; valid accepted-artifact.json manifests for each affected run ID/attempt == 0."],"must_not_observe":["Empty recovery evidence, an active owned listener, or a surviving owned Android mapping.","An accepted-artifact.json left valid after cancellation or failed upload, or changes to unrelated processes/devices."]}},{"start_ref":"hosted_run_metadata","action":{"actor":"cli_user","steps":["After GitHub reaches terminal status, independently run verify-acceptance against the final candidate and exact run ID/attempt using the real GitHub API and uploaded sanitized artifacts.","Verify immutable dist/public-registry hashes and teardown, then hand the verified artifact identity to the Cloudflare owner without deploying."]},"end_state":{"must_observe":["hosted-run.json records candidate SHA == RNR_S05_CANDIDATE_SHA, workflow revision == that candidate SHA, GitHub run ID == the selected real run ID, run attempt == the API's run_attempt, at least 1 independent approval reference, and every required job conclusion == 'success'.","accepted-artifact.json records candidate SHA == RNR_S05_CANDIDATE_SHA; its nonempty accepted-dist path set == the verified completed dist path set with every per-file SHA-256 equal; the uploaded artifact digest == the independently hashed downloaded archive and every transferred evidence file hash == its verified source hash.","teardown.json records residual owned listener count == 0 before publication handoff, with every recorded session-owned port/PID checked against the actual OS listener inventory."],"must_not_observe":["An unsigned local success receipt impersonating a GitHub check, incomplete GitHub metadata, or a stale run attempt; empty hosted-run.json metadata or 0 independent approval references treated as proof.","A deployment, domain attachment, or Cloudflare credential in this workflow."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: Both fresh six-target matrices and all 13 locked flows are evidenced for the candidate; pnpm test and pnpm e2e:docs finish without runtime skips. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-fresh-acceptance`
- TC-2 → AC-2: Matching protected dispatch succeeds; identity, prerequisite, device, and port failures withhold execution, and provider secrets stay within the launcher/backend boundary. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-protected-execution`
- TC-3 → AC-3: The genuine evidence set validates; every isolated corruption and changed-artifact trial fails without changing the original evidence. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-evidence-integrity`
- TC-4 → AC-4: Actual provider recovery, owned-resource teardown, successful artifact transfer, and terminal GitHub success are required; cancellation or upload failure prevents accepted handoff. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-terminal-handoff`

### FIXTURES

```json
{"reviewed_candidate":{"description":"Future isolated reviewed candidate prepared through the real repository checkout/build entrypoints and a protected same-repository dispatch; prerequisites must be verified before use.","seed_method":"cli","records":["RNR_S05_CANDIDATE_SHA is the reviewed candidate descended from planning source 38034e972490945b684f5bd5a706bca0479dc659; RNR_S05_RUN_ID identifies a fresh session.","Explicit RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL, independent engine consumers/caches/ports, and a clean exclusive macOS ARM64 runner.","Public rnraielements.com registry resolves through ordinary DNS and trusted HTTPS; both engine trees match the candidate.","The real backend uses gpt-4.1-mini-2025-04-14; only its trusted launcher receives OPENAI_API_KEY."]},"fresh_acceptance":{"description":"Future genuine evidence produced by this session's owner commands, complete suites, actual provider requests, and inspected native/browser captures; never hand-authored success data.","seed_method":"cli","records":["6 Quickstart and 6 live-example results: nativewind and uniwind crossed with ios, android, and web.","Real command exits, provider request/response correlation, complete dist/public-registry/snippet hashes, source/lockfile/driver/policy hashes, and owned-resource identities.","Corruption trials copy genuine files into separate rejected-evidence directories; an earlier manifest comes from an actual different run and remains rejection-only input."]},"failure_sessions":{"description":"Future isolated real sessions with controlled operational failures through existing runner/backend entrypoints, plus separately reviewed protected negative candidates.","seed_method":"cli","records":["Separate trials omit credentials, stop only the owned backend to make it unreachable, and exercise the AI owner's actual rejected-model path.","Separate trials request an unavailable or already-reserved explicit device and encounter an identified unowned listener on localhost:4321.","A separately reviewed negative candidate fails an actual prerequisite; owned runs are actually cancelled or encounter an actual artifact-upload failure.","An empty session evidence directory is an explicit rejection case, never a passing fixture."]},"hosted_run_metadata":{"description":"Future actual GitHub API responses and downloaded allowlisted artifacts for the final protected candidate run and recorded negative runs; local receipts cannot populate hosted success.","seed_method":"recorded_external","records":["Repository, candidate, workflow revision, run ID, run attempt, independent approval references, and actual terminal job conclusions.","Uploaded artifact identity and digest, complete referenced evidence files, and teardown result from the same run/attempt."]}}
```

### SCOPE — FILE-LEVEL WRITE PERMISSIONS

writeAllowed:
- .github/workflows/sprint-05-acceptance.yml
- tests/sprint-05-orient-search/support/run-acceptance.mjs
- tests/sprint-05-orient-search/support/verify-acceptance.mjs
- tests/sprint-05-orient-search/acceptance-evidence.test.ts
- tests/sprint-05-orient-search/acceptance-runner.md
- tests/sprint-05-orient-search/evidence/ORI-CI-004/manifest.json
- tests/sprint-05-orient-search/evidence/ORI-CI-004/runner-preflight.json
- tests/sprint-05-orient-search/evidence/ORI-CI-004/hosted-run.json
- tests/sprint-05-orient-search/evidence/ORI-CI-004/test/
- tests/sprint-05-orient-search/evidence/ORI-CI-004/docs-e2e/
- tests/sprint-05-orient-search/evidence/ORI-CI-004/rejected-evidence/
- tests/sprint-05-orient-search/evidence/ORI-CI-004/accepted-artifact.json
- tests/sprint-05-orient-search/evidence/ORI-CI-004/teardown.json

writeProhibited — immutable input categories:
- Native and provider implementations
- Owner test drivers
- Cloudflare deployment implementation
- Registry artifacts
- Authored content
- Scenario and policy weakening
- Planning artifacts

Any path outside writeAllowed is prohibited for task-authored changes. In particular, .github/workflows/ci.yml, package.json, pnpm-lock.yaml, apps/example/**, packages/registry/**, public/r/**, .spec/**, tests/sprint-05-orient-search/support/quickstart-proof.test.ts, and tests/sprint-05-orient-search/run-live-example-proof.mjs remain read-only. Owner commands may create their contractually owned runtime outputs in isolated execution workspaces; this does not transfer their implementation or evidence ownership to ORI-CI-004.

### BOUNDARIES

Always:
- Use the assigned isolated writable candidate/worktree and OS-derived owned scratch roots; preserve shared WIP and prior evidence identities.
- Validate inputs, source identities, dependency outcomes, reservations, evidence schemas, referenced files, and hashes with deterministic code.
- Run the owners' real commands with independent consumers, dependencies, caches, ports, and process records.
- Retain each native platform, Web, both engines, and desktop/mobile/no-JavaScript docs assertions.
- Clean up owned resources in finally handling and verify the result on every exit path.

Ask First:
- Escalate unavailable protected-runner/environment capabilities or missing publication prerequisites to their owners; do not substitute a weaker gate.
- Obtain a new scope decision for dependencies, source edits, runner/account exposure, or registry-prerequisite publication outside this charter.
- Obtain the provider owner's version/model decision if the pinned real dependency is unavailable; never select latest or a fallback silently.

### IMPLEMENTATION AND DELIVERABLES

1. .github/workflows/sprint-05-acceptance.yml: workflow_dispatch requires candidate_sha on an explicitly reviewed same-repository candidate ref. preflight calls ./.github/workflows/ci.yml at this workflow revision. test follows successful preflight and protected admission, prepares real proof, then runs the complete pnpm test suite. docs-e2e follows successful preflight and test and executes pnpm e2e:docs verbatim in a fresh owned workspace.
2. tests/sprint-05-orient-search/support/run-acceptance.mjs: validate identity and prerequisites, reserve resources, invoke owner commands, scope credentials, collect current-session evidence, and clean up recorded children.
3. tests/sprint-05-orient-search/support/verify-acceptance.mjs: validate complete evidence and unchanged candidate bytes, including actual hosted metadata, before the Cloudflare owner may publish.
4. tests/sprint-05-orient-search/acceptance-evidence.test.ts: real task-local scenario assertions and isolated corruption/failure trials; no mocked HTTP, fake filesystem, provider stubs, or passing skips.
5. tests/sprint-05-orient-search/acceptance-runner.md and the allowed evidence destinations: exact runner eligibility, protected execution, command phases, artifact transfer, teardown, and publication handoff documentation with captured values.

Runner labels are exactly [self-hosted, macOS, ARM64, rnr-s05-native]; the environment is sprint-05-real-proof. The label is a proposed prerequisite, not an observed registered runner. Verify its runner group, machine identity, Xcode, selected iOS simulator, selected Android emulator, Expo Go compatibility, browser, and actual native automation. Use an exclusively assigned clean account or ephemeral runner, with no personal Cloudflare OAuth cache. Require independent review, prevent self-approval, and restrict eligible refs before releasing runner or provider access. A reviewed same-repository candidate requires a fresh dispatch; unreviewed fork code never executes there.

Use one acceptance session per reserved runner/device pool and cancel-in-progress: false. Explicitly reserve RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL; never select the first booted device. Preserve unrelated devices and listeners. Local owner runs use the same commands for development/review but never impersonate hosted checks. If an eligible runner is unavailable, hosted acceptance remains blocked.

The workflow must enforce git rev-parse HEAD == candidate_sha == GITHUB_SHA. Dispatching on main and merely checking out a different input SHA is invalid. Reuse ORI-CI-003's verified full-SHA action pins; verify the provenance of any additional full commit pin. The current ci.yml is a reading reference and ORI-CI-003 dependency, not permission to copy its floating tags, broad permissions, or Ubuntu-only acceptance behavior.

### EXECUTION / BOUNDARY CONTRACTS

- Run the complete Vitest suite in the provisioned context. Do not exclude native/provider files from discovery or mark them skipped because an automatic Ubuntu job cannot execute them.
- Before evidence-consuming tests, invoke the real native and live-example owner runners to produce evidence in this session. Tests that require a server must start or use the recorded real backend.
- The exact Quickstart Playwright flow must await fresh clean public installation, native/Web rendering, and live handoff proof from its own invocation. Earlier task receipts cannot satisfy it.
- Preserve desktop, mobile, and no-JavaScript projects. Their interactive and fallback assertions must be explicit test cases; missing runtime prerequisites must never trigger a passing skip.
- Keep CI=true and the strict localhost:4321 preview contract. Refuse an occupied unowned port instead of reusing a stale server.
- Run cleanup in finally handling on success, failure, and cancellation. Terminate only recorded children and remove only session-owned mappings and reservations.
- Do not deploy from this workflow. It emits verified acceptance evidence for the Cloudflare owner's separately controlled publication sequence.
- Use ORI-AI-002's reconciled Uniwind and NativeWind driver exports. Before hosted acceptance, compare the final candidate's complete registry hashes with the prerequisite public release. A mismatch stops acceptance and requires a separately reviewed registry-prerequisite release and fresh real proof; never publish unproven changed registry bytes as the final docs release.

### PERMISSIONS, SECRETS, AND ARTIFACT TRANSFER

Default workflow permissions are contents: read. Grant actions: read only to an evidence-reading job if needed. The only environment provider secret is OPENAI_API_KEY. Nonsecret configuration is EXAMPLE_CHAT_MODEL=gpt-4.1-mini-2025-04-14, EXAMPLE_CHAT_HOST, EXAMPLE_CHAT_PORT, EXAMPLE_CHAT_WEB_ORIGIN, EXPO_PUBLIC_API_BASE_URL, RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL, RNR_S05_CANDIDATE_SHA, and RNR_S05_RUN_ID.

Only the trusted launcher and actual backend receive OPENAI_API_KEY. Strip it from Metro, browsers, consumer installs, compilers, screenshots, command arguments, and other child environments. Do not use secrets: inherit, workflow-wide secret exports, provider fallback, or success for absent credentials/devices. No Cloudflare secret, cached OAuth file, account-wide token, or DNS permission enters test jobs. OIDC and deployment attestations are not added: id-token: write is explicitly forbidden and this workflow does not deploy.

Keep dependencies and caches independent between consumers/jobs and scoped by runner, engine, lockfile, and toolchain identity. Never restore prior acceptance receipts, native state, credentials, or dist as current proof. Upload only allowlisted sanitized evidence, retaining its run/attempt identity; never archive environment dumps, credential stores, dependency trees, or unrestricted workspaces. Keep artifact retention explicit in the workflow and document it in acceptance-runner.md using the repository's existing seven-day evidence baseline unless the publication owner requires a reviewed adjustment.

Evidence-consuming tests must not recursively invoke the complete suite that contains them. Define and document preparation, test, docs, transfer, and terminal-verification phases. Tests exercise real completed stages and real failure controls without runtime skips. An in-progress GitHub run is never terminal success: independently invoke final verify-acceptance after the run finishes. Intermediate validation cannot issue a publishable accepted-artifact.json. Final acceptance requires actual successful job conclusions and artifact transfer; failed/cancelled/upload-failed sessions cannot leave a valid accepted release manifest.

### EVIDENCE CONTRACT

Identity: repository identity; candidate SHA and source-tree identity; workflow revision; GitHub run ID and run attempt; local session ID where applicable; independent approval and review references; lockfile hash; test and driver source hashes; surface and coldboot policy hashes.

Artifact: complete accepted dist manifest; public registry response hashes; displayed snippet source hashes; actual CLI and resolved dependency versions; actual commands and exit codes; runner and reserved device identities.

Runtime: six engine/platform Quickstart results; six engine/platform live-example results; provider request and response correlation; observed streaming, completion, follow-up, abort, failure, and retry; native recordings and inspected screenshots; browser traces and fallback assertions; resource teardown results.

Validation:
- Reject missing, truncated, stale, differently sourced, cancelled, or incomplete evidence.
- Verify referenced files and their hashes; a manifest containing success booleans is insufficient.
- Check actual GitHub run metadata and job conclusions when accepting hosted evidence. Match candidate SHA and run attempt, not just artifact filenames.
- Reject an artifact set that omits either engine, either native platform, Web, required provider outcomes, or any locked flow.
- After mutation-capable suites, verify restored source and generated artifact hashes. A changed build requires fresh acceptance before publication.
- Archive only allowlisted sanitized evidence. Never upload environment dumps, credential stores, dependency trees, or unrestricted workspace archives.

Planned outputs are manifest.json, runner-preflight.json, hosted-run.json, test/, docs-e2e/, rejected-evidence/, accepted-artifact.json, and teardown.json under tests/sprint-05-orient-search/evidence/ORI-CI-004/. Append run-specific captures beneath the allowed directories. Do not overwrite evidence from another session. RED outputs use test/AC-1/proof.red through test/AC-4/proof.red; these are task-local planned paths and do not replace any locked flow's canonical proof.red.

### AGENT INSTRUCTIONS — RED, GREEN, REFACTOR

For each AC, first write its real scenario test in the owned test file. Run the exact targeted VERIFY against the unrepaired behavior and capture an assertion failure with candidate, command, and source identities in the planned proof.red. Missing tools, missing credentials, unreachable prerequisites, or no selected tests are execution blockers, not qualifying functional RED.

After the orchestrator accepts RED, implement the smallest allowed workflow/script change and rerun the same real scenario. Capture the seeded values and referenced artifacts. Refactor only while preserving those observations. Do not introduce fake success paths, test-only product seams, retries that launder failures, or deferred behavior.

After all ACs, run the exact complete verification gates in the provisioned context and submit the candidate for independent ghactions-reviewer review, with native, AI, and test-reality review from the additional reviewers. Commit only the validated owned unit to the assigned branch when implementation is separately authorized; do not merge, push to trunk, or remove worktrees. Planning/rendering does not perform any implementation or external action.

### READING LIST

1. .github/workflows/ci.yml [PRIMARY PATTERN], lines 1–164 at the inspected source: existing job names, ordered docs invocation, and seven-day evidence retention; consume ORI-CI-003's repaired reusable contract before implementation.
2. .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/render-contexts/ORI-CI-004.json, full: immutable task, execution, runner, security, evidence, and prerequisite contracts.
3. .spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md, sections 1–7: real built preview, exact runner command, browser projects, observed targets, and failure policy; the fused task controls the explicit native/hosted/publication changes.
4. .spec/e2e-policy/surface.json, full: unchanged governed owner UI surface and product-target requirements; also consume and hash its companion .spec/e2e-policy/coldboot.json.
5. .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md, CAP-DOCS-01: real docs build/data chain that acceptance protects; no additional capability scope is adopted.

### DESIGN / REFERENCE GUIDANCE AND CODING STANDARDS

Compose the existing owner runners; do not build replacement native automation, transports, provider logic, or deployment code. Keep parsing, process ownership, schema validation, phase transitions, hashing, and acceptance decisions deterministic. Use explicit result/error types, static imports, argument arrays for subprocesses, validated environment inputs, and structured sanitized evidence. Keep Node filesystem/process effects at clear boundaries and cleanup idempotent. Follow repository TypeScript/Biome conventions and Expo-owned dependency decisions without adding packages.

The same-repository relative reusable-workflow reference selects the caller's revision. See [GitHub: Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows). Verify additional action commit provenance and retain least privilege. See [GitHub: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use).

The supplemental Holocron planner reference could not be retrieved because its tool requires approval while approval policy is never. This does not change the fully read locked rendering inputs or authorize a weaker contract.

### EXACT VERIFICATION COMMANDS

```sh
actionlint .github/workflows/ci.yml .github/workflows/sprint-05-acceptance.yml
pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web
node tests/sprint-05-orient-search/run-live-example-proof.mjs --engines uniwind,nativewind --platforms ios,android,web --output tests/sprint-05-orient-search/evidence/ORI-AI-002
node tests/sprint-05-orient-search/support/run-acceptance.mjs --candidate "$RNR_S05_CANDIDATE_SHA" --run-id "$RNR_S05_RUN_ID" --output tests/sprint-05-orient-search/evidence/ORI-CI-004
pnpm test
pnpm e2e:docs
pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts
node tests/sprint-05-orient-search/support/verify-acceptance.mjs --candidate "$RNR_S05_CANDIDATE_SHA" --run-id "$RNR_S05_RUN_ID" --evidence tests/sprint-05-orient-search/evidence/ORI-CI-004
```

### EVIDENCE GATES

1. Authoring and scope: orchestrator validates the requirement/scenario projection, contiguous IDs, exact allowlist, task-local non-primary bindings, and unchanged sprint-flow ownership. Review source identity against planning SHA and reviewed dependency commits.
2. Cheap prerequisite checks: actionlint, pnpm typecheck, and pnpm lint must pass. Verify ORI-CI-003's real preflight outputs, pins, workflow availability, required-check names, environment protections, runner group, and artifact access. The live-chat import-graph compiler remains required; whole-example diagnostics do not imply package-wide green.
3. RED/behavior: each targeted AC has actual assertion RED before GREEN and captured nonempty scenario observations. All four tests execute against real services/files/processes. No skipped runtime prerequisite qualifies.
4. Complete execution: run the exact owner commands, complete pnpm test, and verbatim pnpm e2e:docs with CI=true; retain all engine/platform and desktop/mobile/no-JavaScript cases. Preserve fresh final Quickstart invocation ownership and all 13 flow IDs.
5. Final integrity: execute all corruption, failed prerequisite, real provider recovery, cancellation, upload failure, and teardown trials; verify terminal GitHub metadata and unchanged artifacts before handoff. Scope and stub scans must find no undeclared edits, placeholders, no-ops, mock core behavior, skips, or TODO deferrals.

Discriminating proof must remove one Android result, alter a source hash, substitute an earlier run manifest, and omit provider response correlation in separate copies of genuine successful evidence. Every copy must fail. Unavailable/already-owned devices must fail explicitly. Missing-credential, unreachable-backend, and rejected-model paths must include actual successful recovery. A real protected negative candidate must withhold native execution or downstream docs acceptance after its failing prerequisite. Cancellation and failed upload must not leave accepted release evidence. A real protected GitHub run against the final candidate is mandatory.

### DEPENDENCIES / CAPABILITIES

Depends on, exactly: ORI-CI-003, ORI-DEP-001, ORI-RN-003, ORI-RN-004, ORI-AI-002, ORI-CONT-004, ORI-AST-007, ORI-AST-009, ORI-VIS-001, ORI-VIS-002, ORI-VIS-003, ORI-VIS-004, ORI-VIS-005, ORI-RN-005, ORI-CONT-006, ORI-AST-010.

Consumes: ORI-CI-003's repaired reusable preflight and verified action pins; ORI-DEP-001's publicly reachable corrected registry; native and AI owner commands and reconciled engine exports; the integrated content, browser, visual, native, and journey prerequisites; unchanged source, surface/coldboot policies, command contracts, and candidate artifacts.

Provides: protected complete acceptance execution, current-session runtime evidence, deterministic rejection of unsupported evidence, and immutable accepted artifact identity for the Cloudflare owner's separately controlled publication sequence.

Blocks: final publication handoff and promotion until complete hosted acceptance is verified. No new task dependency edges are invented. Parallel execution may not share the reserved runner/device pool or mutable workspace.

Touches: CAP-DOCS-01. Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/ghactions-planner-absorb-prerequisites.json. Source task IDs: [ORI-CI-004]. Supersedes: [].

### CONTEXT / FIXED SPRINT CONTRACT

Current gap: the old Ubuntu browser job cannot execute the required native Quickstart or provider-backed example. The native runner label, protections, provider availability, public registry, and hosted success are prerequisites to verify, not observed facts. Missing prerequisites block subsequent execution rather than weakening the charter.

The gate is unchanged: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).

The locked sprint has 13 flows: 9 task flows and 4 journey flows; 36 tasks and 131 points. This task adds no visitor flow, has no human_test_hook, and returns no journey_proofs. ORI-AST-010 retains all four journey records. ORI-DARK-ORI-CI-004 is this task's discriminating proof step.

### REVIEW — GHACTIONS-REVIEWER

Must pass:
- Independently verify the exact candidate, real protected run, approval boundary, runner eligibility, identity equality, and least-privilege/full-SHA action configuration.
- Inspect all six Quickstart and six live-example results, native captures, provider correlations, complete suites, all locked flows, and fresh final invocation evidence.
- Re-run the real evidence rejection trials and inspect actual failed prerequisite, provider recovery, cancellation, and upload-failure records.
- Recompute source/generated/public/artifact hashes and verify uploaded files and terminal GitHub job conclusions before accepting handoff.
- Verify source/evidence scope, RED history, deterministic transitions, secret isolation, complete owned-resource teardown, and absence of fake/skipped/deferred core behavior.

Should verify:
- Native reviewers confirm actual iOS/Android execution and inspected visual evidence; browser device emulation cannot satisfy either native result.
- AI reviewer confirms the selected real provider/model and actual incremental deltas, context, abort, failure, and successful retry.
- Test-quality reviewer confirms corrupted real evidence and disconnected/empty states cannot pass the oracles.
- Artifact phase ordering has no recursive suite invocation or self-approval of an in-progress GitHub run.
- Runner documentation makes prerequisites, ownership, cache isolation, transfer, and the separate Cloudflare publication boundary executable and reviewable.

Verdict at implementation review: APPROVED or NEEDS_FIXES, with evidence and actionable file/line findings. No review verdict or successful execution is claimed here.

### OUT OF SCOPE

- Cloudflare deployment implementation, initial domain attachment, registry-prerequisite release, version upload, and promotion.
- Native/provider implementation and owner test-driver changes; unrelated example/gallery repairs or package/version substitutions.
- Registry source/generated artifact edits, authored product content, new visitor flows, journey ownership changes, and weakened scenarios/policies.
- New planning artifacts, broad CI refactors, expanded permissions, personal-workstation exposure, and trunk lifecycle operations.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CI-004","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"reviewed_candidate":{"description":"Future isolated reviewed candidate prepared through the real repository checkout/build entrypoints and a protected same-repository dispatch; prerequisites must be verified before use.","seed_method":"cli","records":["RNR_S05_CANDIDATE_SHA is the reviewed candidate descended from planning source 38034e972490945b684f5bd5a706bca0479dc659; RNR_S05_RUN_ID identifies a fresh session.","Explicit RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL, independent engine consumers/caches/ports, and a clean exclusive macOS ARM64 runner.","Public rnraielements.com registry resolves through ordinary DNS and trusted HTTPS; both engine trees match the candidate.","The real backend uses gpt-4.1-mini-2025-04-14; only its trusted launcher receives OPENAI_API_KEY."]},"fresh_acceptance":{"description":"Future genuine evidence produced by this session's owner commands, complete suites, actual provider requests, and inspected native/browser captures; never hand-authored success data.","seed_method":"cli","records":["6 Quickstart and 6 live-example results: nativewind and uniwind crossed with ios, android, and web.","Real command exits, provider request/response correlation, complete dist/public-registry/snippet hashes, source/lockfile/driver/policy hashes, and owned-resource identities.","Corruption trials copy genuine files into separate rejected-evidence directories; an earlier manifest comes from an actual different run and remains rejection-only input."]},"failure_sessions":{"description":"Future isolated real sessions with controlled operational failures through existing runner/backend entrypoints, plus separately reviewed protected negative candidates.","seed_method":"cli","records":["Separate trials omit credentials, stop only the owned backend to make it unreachable, and exercise the AI owner's actual rejected-model path.","Separate trials request an unavailable or already-reserved explicit device and encounter an identified unowned listener on localhost:4321.","A separately reviewed negative candidate fails an actual prerequisite; owned runs are actually cancelled or encounter an actual artifact-upload failure.","An empty session evidence directory is an explicit rejection case, never a passing fixture."]},"hosted_run_metadata":{"description":"Future actual GitHub API responses and downloaded allowlisted artifacts for the final protected candidate run and recorded negative runs; local receipts cannot populate hosted success.","seed_method":"recorded_external","records":["Repository, candidate, workflow revision, run ID, run attempt, independent approval references, and actual terminal job conclusions.","Uploaded artifact identity and digest, complete referenced evidence files, and teardown result from the same run/attempt."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Fresh complete acceptance","primary":false,"description":"GIVEN a reviewed candidate with provisioned native, provider, and public-registry prerequisites WHEN the acceptance workflow executes owner preparation, pnpm test, and pnpm e2e:docs THEN fresh six-target matrices and all 13 locked flows identify that candidate.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/acceptance-evidence.test.ts","test_function":"ORI-CI-004-fresh-acceptance","verify":"pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-fresh-acceptance","test_tier":"e2e","verification_service":"Real GitHub Actions, native owner runners, OpenAI backend, public registry HTTPS, and Astro/Playwright at localhost:4321","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real GitHub Actions, native owner runners, OpenAI backend, public registry HTTPS, and Astro/Playwright at localhost:4321","negative_control":{"would_fail_if":["A stub preparation step reuses old receipts or omits either engine or a native target.","A disconnected backend or static transcript replaces real provider responses."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"reviewed_candidate","action":{"actor":"background_job","steps":["Run the reviewed dispatch through preflight and protected native execution using the exact owner commands.","Prepare fresh owner evidence before evidence-consuming tests, then execute pnpm test and pnpm e2e:docs verbatim in their owned workspaces.","Require the Quickstart invocation inside the docs suite to perform its own fresh public installs and seed/live matrices; inspect native captures and browser traces."]},"end_state":{"must_observe":["6 Quickstart results and 6 live-example results cover nativewind and uniwind on ios, android, and web.","13 locked flows retain their 9 task and 4 journey identities; desktop, mobile, and no-JavaScript cases record actual assertions.","Recorded commands include pnpm test and pnpm e2e:docs with exit code 0, CI=true, and http://localhost:4321.","All 6 live-example results contain nonempty correlated provider request/response IDs; every inspected iOS screenshot, Android recording, and Web trace records candidate SHA == RNR_S05_CANDIDATE_SHA and invocation ID == its current owner invocation within RNR_S05_RUN_ID, with SHA-256(capture bytes) == the referenced capture hash."],"must_not_observe":["0 target results, skipped native/provider tests, or an empty transcript substituted for live proof.","Earlier invocation receipts satisfying the final Quickstart invocation."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Protected execution fails closed","primary":false,"description":"GIVEN eligible and deliberately ineligible real dispatch/resource conditions WHEN the acceptance runner evaluates identity, protection, prerequisites, and reservations THEN only the reviewed matching candidate receives native execution and backend-scoped provider access.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/acceptance-evidence.test.ts","test_function":"ORI-CI-004-protected-execution","verify":"pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-protected-execution","test_tier":"e2e","verification_service":"Real GitHub dispatch and environment protection, exclusive macOS runner, device reservations, and backend process launch","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real GitHub dispatch and environment protection, exclusive macOS runner, device reservations, and backend process launch","negative_control":{"would_fail_if":["A static approval flag replaces GitHub protection checks.","A stub reservation succeeds for an unavailable device or an unowned occupied port."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"reviewed_candidate","action":{"actor":"background_job","steps":["Verify actual runner eligibility and independent environment approval for the reviewed same-repository dispatch.","Compare git rev-parse HEAD, candidate_sha, and GITHUB_SHA; reserve the explicit iOS UDID, Android serial, and ports.","Launch the real backend with the allowlisted provider secret and inspect child environments/client artifacts without printing secret values."]},"end_state":{"must_observe":["3 source identities agree and runner-preflight.json records the reserved RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL.","sprint-05-real-proof records independent approval preventing self-approval before native execution.","Only the 2 process roles 'trusted launcher' and 'backend' receive OPENAI_API_KEY; each of the 5 prohibited groups (installs, Metro, compilers, browsers, and client artifacts) records 0 occurrences of the actual secret value in inspected environments/artifacts, without printing that value."],"must_not_observe":["An empty approval record, arbitrary first-booted device, or secret in client artifacts.","Cloudflare credential access or unreviewed fork execution on the native runner."]}},{"start_ref":"failure_sessions","action":{"actor":"cli_user","steps":["Exercise actual identity mismatch, unavailable/already-owned device, and occupied-unowned localhost:4321 conditions separately.","Run a separately reviewed protected negative candidate whose real prerequisite check fails and query its actual job conclusions."]},"end_state":{"must_observe":["Each identity/device/port rejection records exit code != 0 and gate outcome 'failed', naming the supplied candidate/resource ID and the conflicting observed SHA, iOS UDID, Android serial, or localhost:4321 listener.","The protected negative run withholds native execution after failed preflight, or docs-e2e after failed test, as appropriate."],"must_not_observe":["Exit code 0 from an absent prerequisite, passing runtime skips, port shifting, or fallback device selection.","An accepted-artifact.json for the failed session."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Evidence and artifact integrity","primary":false,"description":"GIVEN genuine current-session evidence and isolated copies WHEN the real verifier receives complete evidence, corrupted variants, or changed candidate/public-registry bytes THEN it accepts only the complete matching evidence and rejects every invalid variant.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/acceptance-evidence.test.ts","test_function":"ORI-CI-004-evidence-integrity","verify":"pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-evidence-integrity","test_tier":"integration","verification_service":"Real filesystem evidence, acceptance verifier CLI, GitHub run metadata API, and public registry HTTPS","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem evidence, acceptance verifier CLI, GitHub run metadata API, and public registry HTTPS","negative_control":{"would_fail_if":["A stub verifier accepts success booleans without reading referenced files or GitHub metadata.","A static hash or disconnected public-registry comparison accepts altered candidate bytes."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_acceptance","action":{"actor":"cli_user","steps":["Invoke the real verifier against the genuine evidence set and recompute referenced file, source, lockfile, driver, policy, snippet, registry, and dist hashes.","Read actual GitHub run identity, attempt, and terminal job conclusions when validating hosted acceptance."]},"end_state":{"must_observe":["The complete 6 plus 6 target set resolves to real captured files with matching hashes and provider correlation.","The accepted dist manifest records candidate SHA == RNR_S05_CANDIDATE_SHA, a complete nonempty path set, SHA-256 of every accepted dist file == its independently hashed candidate file, and SHA-256 of every public prerequisite registry response == its candidate registry file."],"must_not_observe":["An empty file set or a success-only manifest accepted as runtime evidence."]}},{"start_ref":"fresh_acceptance","action":{"actor":"cli_user","steps":["Create separate real filesystem copies under rejected-evidence; remove one Android result, alter one source hash, substitute an earlier run manifest, and omit provider response correlation in four separate trials.","Also exercise missing/truncated references, absent engine/Web/flow evidence, a mismatched GitHub attempt, and cancelled or incomplete run records.","Invoke the real verifier on every copy and preserve the original evidence bytes."]},"end_state":{"must_observe":["4 mandatory corruption trials each return nonzero and identify their missing Android result, altered source hash, earlier run, or missing provider correlation.","Every additional incomplete identity/file/target/flow variant returns verifier exit code != 0; the original evidence path set after each trial == its pre-trial path set and SHA-256 of every original evidence file after each trial == its pre-trial hash."],"must_not_observe":["Exit code 0 or accepted-artifact.json for any rejected variant."]}},{"start_ref":"fresh_acceptance","action":{"actor":"cli_user","steps":["Compare the complete candidate registry with actual prerequisite public responses before hosted acceptance.","Exercise a changed artifact in an isolated evidence copy and verify source/generated artifact hashes again after mutation-capable suites."]},"end_state":{"must_observe":["Each candidate/public registry mismatch or changed dist/source trial records gate outcome 'failed', exit code != 0, at least 1 differing expected/observed SHA-256 pair, and a fresh-proof requirement; valid accepted release manifests for that trial == 0.","The complete source path set after the suite == its pre-suite path set, the complete generated-artifact path set after the suite == its pre-suite path set, both path counts are greater than 0, and every per-path SHA-256 after the suite == its pre-suite hash."],"must_not_observe":["Publication handoff for changed bytes or automatic publication of an unproven prerequisite registry; empty or 0-entry source/generated-artifact hash sets treated as verified."]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Recovery, teardown, and terminal handoff","primary":false,"description":"GIVEN real successful and failed acceptance sessions WHEN provider failures, cancellation, upload failure, and final verification are exercised THEN owned resources are released and only a complete terminal GitHub success permits the unchanged artifact handoff.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/acceptance-evidence.test.ts","test_function":"ORI-CI-004-terminal-handoff","verify":"pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-terminal-handoff","test_tier":"e2e","verification_service":"Real OpenAI backend, native/browser owner runners, owned OS processes, GitHub artifact upload and terminal run API","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real OpenAI backend, native/browser owner runners, owned OS processes, GitHub artifact upload and terminal run API","negative_control":{"would_fail_if":["A stub provider invents recovery without a correlated real response.","A no-op cleanup leaves owned listeners or mappings, or a static receipt treats a cancelled/upload-failed run as accepted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"failure_sessions","action":{"actor":"cli_user","steps":["Execute the AI owner's actual missing-credential, unreachable-backend, and rejected-model paths; restore the real supported backend/model and exercise successful retry.","Cancel an owned acceptance session and cause an actual evidence-upload failure in a separately reviewed protected run.","Run finally cleanup and inspect recorded PIDs, mappings, device appearance, and reservations on success, failure, and cancellation."]},"end_state":{"must_observe":["3 provider failure paths record sanitized actual outcomes and successful recovery includes a correlated provider response.","teardown.json records at least 1 terminated owned child PID; residual owned live PIDs, listeners, reservations, and Android mappings each == 0; selected-device appearance after cleanup == its captured pre-run appearance.","The actual GitHub conclusion for the cancelled run is 'cancelled' and for the artifact-upload-failed run is 'failure'; valid accepted-artifact.json manifests for each affected run ID/attempt == 0."],"must_not_observe":["Empty recovery evidence, an active owned listener, or a surviving owned Android mapping.","An accepted-artifact.json left valid after cancellation or failed upload, or changes to unrelated processes/devices."]}},{"start_ref":"hosted_run_metadata","action":{"actor":"cli_user","steps":["After GitHub reaches terminal status, independently run verify-acceptance against the final candidate and exact run ID/attempt using the real GitHub API and uploaded sanitized artifacts.","Verify immutable dist/public-registry hashes and teardown, then hand the verified artifact identity to the Cloudflare owner without deploying."]},"end_state":{"must_observe":["hosted-run.json records candidate SHA == RNR_S05_CANDIDATE_SHA, workflow revision == that candidate SHA, GitHub run ID == the selected real run ID, run attempt == the API's run_attempt, at least 1 independent approval reference, and every required job conclusion == 'success'.","accepted-artifact.json records candidate SHA == RNR_S05_CANDIDATE_SHA; its nonempty accepted-dist path set == the verified completed dist path set with every per-file SHA-256 equal; the uploaded artifact digest == the independently hashed downloaded archive and every transferred evidence file hash == its verified source hash.","teardown.json records residual owned listener count == 0 before publication handoff, with every recorded session-owned port/PID checked against the actual OS listener inventory."],"must_not_observe":["An unsigned local success receipt impersonating a GitHub check, incomplete GitHub metadata, or a stale run attempt; empty hosted-run.json metadata or 0 independent approval references treated as proof.","A deployment, domain attachment, or Cloudflare credential in this workflow."]}}]}},{"id":"TC-1","type":"test_criterion","description":"Both fresh six-target matrices and all 13 locked flows are evidenced for the candidate; pnpm test and pnpm e2e:docs finish without runtime skips.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-fresh-acceptance","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Matching protected dispatch succeeds; identity, prerequisite, device, and port failures withhold execution, and provider secrets stay within the launcher/backend boundary.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-protected-execution","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The genuine evidence set validates; every isolated corruption and changed-artifact trial fails without changing the original evidence.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-evidence-integrity","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Actual provider recovery, owned-resource teardown, successful artifact transfer, and terminal GitHub success are required; cancellation or upload failure prevents accepted handoff.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts -t ORI-CI-004-terminal-handoff","maps_to_ac":"AC-4"}]}
-->
</details>
