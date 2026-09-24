<!-- Template Version: 5.2.0 -->
# ORI-AI-002: Prove the composed worked example against the real provider

## What this does

Prove streaming, contextual history, active Stop, failure recovery and Retry on six live targets, with fresh provider correlation and complete owned-resource teardown.

## Why

This task requires the real screen supplied by ORI-RN-004. Separating proof from ORI-AI-001 gives an acyclic implementation-to-composition-to-proof sequence and keeps ORI-AI-002 exclusively about real provider verification.

## How to verify

Run the real six-target proof as fresh per-engine invocations within one cycle — both engines bound to the same candidate SHA — then validate the cycle's accumulated evidence with the task-local Vitest integration suite. Inspect the actual native recordings, screenshots, text-growth timestamps and corresponding server/provider outcomes. Every path below is a planned output; no command is claimed to have passed.

```sh
TMPDIR=/tmp/ori-ai-002-scratch node tests/sprint-05-orient-search/run-live-example-proof.mjs --engines uniwind --platforms ios,android,web --output tests/sprint-05-orient-search/evidence/ORI-AI-002
# cold-reboot the reserved devices between engines after marathon wear (boundary contract 15)
TMPDIR=/tmp/ori-ai-002-scratch node tests/sprint-05-orient-search/run-live-example-proof.mjs --engines nativewind --platforms ios,android,web --output tests/sprint-05-orient-search/evidence/ORI-AI-002
pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts
```

A single monolithic invocation (`--engines uniwind,nativewind --platforms ios,android,web`) remains an acceptable alternative; it is no longer required. Each of the six engine/platform targets must carry a green leg from a fresh invocation in the current cycle. The Vitest suite validates that accumulated set — per-run manifests, correlations and teardowns already on disk, hash-bound to the candidate — instead of spawning its own full matrix.

## Scope

Implement the three task-owned proof files and write evidence only within the exact ORI-AI-002 allowlist. Consume the existing app hook, backend and native-owned drivers through their declared interfaces.

## Amendments

- **2026-09-24 — verify-contract revision** (planner ask `ask-wave13-revise-ori-ai-002-proof-contract`; human-approved replan decision 2026-09-23, in-session). Source: ORI-AI-002 cycle-5 blocked report at `.kb-run-sprint/sprint-05-orient-search/ORI-AI-002/cycle-5.blocked.json`, item `ORI-AI-002:blocked:5:scope_impact:0`, sha256 `b16e4dfb20e55b1f2a9d4b3d379bad5420ddf6a97933e7dc4d2a63549d1ee217`. Evidence base: five cycles against the monolithic shape landed two driver FIXes (FIX-ORI-RN-004-2 web-leg stall; FIX-ORI-AI-002-1 pre-send records baselines) and produced per-engine fresh 3/3 proofs at branch checkpoint `a02b61ce` — c5a (run `ORI-AI-002-1790185559636`: uniwind complete including web-self, nativewind live 3/3) and c5c (run `ORI-AI-002-1790193005750`: all six targets synthesized with full current-run artifacts; only a since-defended web-self first-prompt race failed the monolithic exit) — while c5b and c5d each died on one independent once-per-several-runs environment/oracle flake inside a single leg (nondiscriminating uniwind-ios stop turn; ORI-RN-004-owned web-leg retryControl visibility after a successful retry) and c5e was interrupted externally. Changes, operationalization only: the six-target proof accepts fresh per-engine invocations within one cycle bound to one candidate SHA (monolithic acceptable, not required); the Vitest suite validates the cycle's accumulated evidence instead of spawning its own marathon; the proven environment protocol (reserved devices, between-engine reboot, `TMPDIR` scratch, pinned Expo Go APK, port-4000 pre-clear) and the documented web-leg abort semantics are now contract text. No behavioral assertion was weakened — every AC keeps its real oracle, corrected only where it had contradicted documented driver semantics.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata

> Status: ✅ Completed

Commit: 2138d10e970e0d9d54912b6365576ed235bc2d6a
> Assignee: aisdk-implementer
> Priority: P1 · Points: 5 · Type: TEST
> Dependency phase: After ORI-AI-001, ORI-RN-004 and ORI-RN-005
> Proposed By: aisdk-planner
> Co-authored By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
AGENT: planner=aisdk-planner | implementer=aisdk-implementer | reviewer=aisdk-reviewer
> Progress: 0/4 acceptance criteria complete; all TDD_STATE values are none.
> Artifact status: planned_output_not_observed

## Outcome

All six live targets prove streaming, context, interruption and recovery through real provider requests, with fresh correlated evidence and complete teardown.

The deliverable is a deterministic integration runner and evidence validator. App behavior remains owned by ORI-AI-001, ORI-RN-004 and ORI-RN-005.

## Critical constraints

- Never expose provider credentials beyond the trusted launcher and backend; strip them from child environments, client artifacts, command arguments and evidence.
- Never modify paths outside the allowlist, change selected package/provider/model contracts, or introduce a production failure switch.
- Never substitute mocked HTTP, fake filesystem, injected transcript state, stub providers, canned responses, skipped targets or browser-only native evidence.
- Never accept stale receipts, uncorrelated answers or completion-before-Stop as abort proof; all six targets must produce observations in the current cycle's fresh invocations, bound to one candidate SHA.
- Never reuse or kill unowned listeners, erase shared devices or remove unowned mappings; restore and release only recorded resources on every exit.

## Done when

- [ ] AC-1 proves actual streaming and contextual history on all six targets.
- [ ] AC-2 proves active Stop and successful Retry without duplicate user turns.
- [ ] AC-3 proves actual endpoint loss and provider rejection, followed by successful recovery.
- [ ] AC-4 proves evidence rejection and complete cleanup on success and failure.
- [ ] The exact per-engine command set (or the acceptable monolithic command) and relevant typecheck pass, scope is respected, and aisdk-reviewer independently reruns the candidate — one engine per invocation — and inspects native evidence.

## Runtime commands

```sh
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/run-live-example-proof.mjs tests/sprint-05-orient-search/live-example-proof.ts tests/sprint-05-orient-search/live-example-proof.test.ts
TMPDIR=/tmp/ori-ai-002-scratch node tests/sprint-05-orient-search/run-live-example-proof.mjs --engines uniwind --platforms ios,android,web --output tests/sprint-05-orient-search/evidence/ORI-AI-002
TMPDIR=/tmp/ori-ai-002-scratch node tests/sprint-05-orient-search/run-live-example-proof.mjs --engines nativewind --platforms ios,android,web --output tests/sprint-05-orient-search/evidence/ORI-AI-002
pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts
```

The unfiltered task-local Vitest command executes all four named integration tests against the cycle's accumulated fresh evidence set. The runner invocations that seed it must be fresh and current-cycle; the suite fails closed on absent, stale, mismatched or tampered evidence — reading a previous cycle's manifests is insufficient, and the implementer may change the suite's fixture sourcing to the accumulated set (the test file is in the allowlist). Root typecheck covers the task tests but does not establish whole-example application health.

## Acceptance criteria

This is a TEST task. Its acceptance criteria use task-owned integration proof with FLOW_REF null and PRIMARY false. It supports FLOW-DOCS-02-quickstart-chat-screen; ORI-CONT-004 remains that flow's sole primary owner. No journey ownership is claimed.

### AC-1: Streaming and contextual history

GIVEN six fresh live targets WHEN each sends a nonce-bearing prompt and contextual follow-up THEN all six show incremental responses and retained context correlated with actual provider outcomes.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/live-example-proof.test.ts
- TEST_FUNCTION: ORI-AI-002-AC-1-stream-history
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","negative_control":{"would_fail_if":["The screen is static, the provider is stubbed, or history is disconnected from the next request."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_matrix","action":{"actor":"user","steps":["Submit the first_prompt through each actual live composer, then send the followup_prompt without repeating the first nonce.","Observe assistant text and correlate both requests with actual server/provider events."]},"end_state":{"must_observe":["6 targets each show at least 2 distinct timestamped nonempty text prefixes before completion.","All 6 follow-up answers contain the exact recorded first `${nonce}`; server history includes 1 prior user/assistant exchange, and the latest user message contains 0 occurrences of that nonce.","Completed text hashes match server text hashes; request ID, provider response ID, gpt-4.1-mini-2025-04-14 and positive usage are recorded."],"must_not_observe":["Empty assistant output, a static final answer without growth, unrelated follow-up or missing provider correlation."]}}]}
```

### AC-2: Active Stop and Retry

GIVEN real conversation history WHEN each target stops an unfinished generation and retries THEN the active request aborts and Retry completes without duplicating its user turn.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/live-example-proof.test.ts
- TEST_FUNCTION: ORI-AI-002-AC-2-stop-retry
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","negative_control":{"would_fail_if":["Stop only changes static UI, the upstream request remains connected, or Retry is a stub."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_history","action":{"actor":"user","steps":["Submit a fresh marked bounded long-generation prompt; press Stop generating after growth while the correlated request is unfinished, then press Retry.","Record completion-before-Stop as nondiscriminating and rerun with a longer bounded prompt; never add artificial delays."]},"end_state":{"must_observe":["The 4 native targets (uniwind-ios, uniwind-android, nativewind-ios, nativewind-android) correlate Stop with an aborted provider record for an active unfinished request and no preceding completion event.","The 2 web targets correlate Stop with a client-aborted active request whose upstream record lands as a delayed completed response (documented proxy semantics, FIX-ORI-RN-004-2): screen growth stops, no completion event precedes Stop, and the delayed record never substitutes for the abort observation.","Each Retry creates a new real request and completed provider response while retaining exactly 1 copy of the interrupted user turn."],"must_not_observe":["Completed-before-Stop accepted as abort proof, continuing post-abort growth or 2 copies of the retried user turn. Empty abort evidence or 0 correlated active-request aborts across the 4 native targets."]}}]}
```

### AC-3: Actual failure and recovery

GIVEN working live targets WHEN the owned endpoint disappears or OpenAI rejects a nonexistent model THEN each target shows sanitized errors and successful Retry without duplicate user turns.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/live-example-proof.test.ts
- TEST_FUNCTION: ORI-AI-002-AC-3-error-recovery
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","negative_control":{"would_fail_if":["HTTP is mocked, a production failure switch fabricates rejection, or disconnected Retry returns a canned answer."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_history","action":{"actor":"user","steps":["Stop only the recorded backend child and submit a fresh marked prompt on each target.","Observe actual network failure, restart the owned backend with the primary model and press Retry."]},"end_state":{"must_observe":["6 visible network-failure states followed by 6 completed real provider responses.","Each recovery retains exactly 1 failed user turn and matches rendered text to its new server request."],"must_not_observe":["Static success during endpoint loss, empty error evidence, leaked credentials or duplicate user turns."]}},{"start_ref":"live_history","action":{"actor":"user","steps":["Launch the same server with nonexistent model rnr-s05-nonexistent-${runId}, retaining the official provider endpoint; submit fresh marked prompts.","Observe the actual provider rejection, restore gpt-4.1-mini-2025-04-14 and press Retry on every target."]},"end_state":{"must_observe":["6 actual rejected-provider requests with sanitized status/error correlation and visible screen errors.","6 recovered responses identify gpt-4.1-mini-2025-04-14, positive usage and exactly 1 retained failed user turn."],"must_not_observe":["Locally fabricated rejection, empty provider outcomes, alternate endpoint or successful Retry without a real request."]}}]}
```

### AC-4: Evidence integrity and lifecycle

GIVEN the cycle's accumulated fresh real evidence set WHEN the runner validates complete, missing and mismatched receipts and exits THEN only complete correlated evidence passes and owned resources are released.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/live-example-proof.test.ts
- TEST_FUNCTION: ORI-AI-002-AC-4-evidence-lifecycle
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","negative_control":{"would_fail_if":["Validation accepts empty or static receipts, or cleanup is disconnected from real process ownership."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_matrix","action":{"actor":"cli_user","steps":["Run the six-target proof as fresh per-engine invocations within one cycle (or the acceptable monolithic command) through the real typed drivers and owned backend handle; inspect actual artifacts and native recordings.","Exercise normal and real-service failure exits; inspect process, mapping and reservation ownership after teardown."]},"end_state":{"must_observe":["Exactly 6 current-cycle target records — the union of the cycle's fresh per-engine invocations, all bound to one candidate SHA — contain result.json, stream.jsonl, screen-recording.mp4, streaming.png and recovered.png.","For all 6 targets, the manifests record 64-character SHA-256 digests equal to recomputed source/lockfile/registry/driver/policy and artifact digests; commands, exit codes, target identity, API origin and run identity equal their own invoking run, source digests are identical across every manifest in the set, and server-events.jsonl values correlate.","Each invocation's teardown.json records restored model/appearance, released reservations, closed contexts and 0 remaining owned listeners or mappings."],"must_not_observe":["Missing native targets, browser evidence labeled native, stale receipts, secrets or leftover owned listeners. Empty target records or 0 current-cycle targets."]}},{"start_ref":"live_matrix","action":{"actor":"cli_user","steps":["Create bounded filesystem copies of artifacts from a real invocation; separately remove one target or alter run ID, source/lockfile hash, engine/platform identity or an artifact byte.","Run the real evidence validator on each copy; preserve original evidence."]},"end_state":{"must_observe":["Every missing, stale or mismatched case has process exit_code != 0 and a rejection diagnostic naming the exact removed target or altered field, such as `uniwind-ios`, `runId` or the mismatched SHA-256 digest.","Each intact per-engine evidence set exits 0 through the real validator with its accepted targets; the accumulated cycle set carries exactly 6 accepted target records, 0 correlation mismatches, and recorded SHA-256 digests equal to independently recomputed artifact and server-text hashes."],"must_not_observe":["Exit 0 for an empty matrix, stale run, wrong source/engine, substituted browser or altered artifact."]}}]}
```

## Test criteria

- **TC-1**: All six targets have correlated incremental responses and contextual follow-up without repeating the first nonce in the new user message. MAPS_TO_AC: AC-1.
- **TC-2**: All six targets abort unfinished real requests and complete Retry with exactly one retained user turn. MAPS_TO_AC: AC-2.
- **TC-3**: All six targets expose actual endpoint loss and provider rejection, then recover through real requests without duplicate user turns. MAPS_TO_AC: AC-3.
- **TC-4**: The runner rejects missing or mismatched receipts, accepts only fresh complete correlation and records cleanup of all owned resources. MAPS_TO_AC: AC-4.

VERIFY for each TC: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts`. TCs inherit their mapped AC scenario and have no independent fixture or scenario.

## Fixtures

```json
{"live_matrix":{"description":"Fresh isolated candidate with the real owned backend and empty live-screen sessions on six reserved targets.","seed_method":"cli","records":["Targets: uniwind-ios, uniwind-android, uniwind-web, nativewind-ios, nativewind-android, nativewind-web.","Launch through tests/sprint-05-orient-search/support/live-backend.ts with official OpenAI Responses and gpt-4.1-mini-2025-04-14; credentials remain server-only.","Record fresh run/source/lockfile identity, reserved ports, RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL and browser identity; use separate engine caches.","Compose the cycle as fresh per-engine invocations (uniwind then nativewind), both bound to one candidate SHA — identical source digests across the cycle's manifests — and cold-reboot the reserved devices between engines after marathon wear (the unrelated booted simulator is never touched; the emulator keeps its userdata).","RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1 and RNR_S05_ANDROID_SERIAL=emulator-5554 must both be set for any native-including run; children run with TMPDIR=/tmp/ori-ai-002-scratch; the pinned Expo Go 57.0.9 APK must exist on disk even for ios-only runs; clear port 4000 before each backend launch; a per-engine three-platform invocation measures ~25-30 minutes.","manifest.completed literally means all 3 platforms passed — key per-target assertions on legs[].status; web-leg stop turns produce delayed completed records, never aborted (the 4 native targets produce the aborted records).","first_prompt: Remember marker ${nonce}. Reply with the marker and list numbers 1 through 40. Generate a fresh nonsecret nonce per target/run.","followup_prompt: For request ${followupNonce}, repeat the marker from my first message. The new message must not contain the first nonce."]},"live_history":{"description":"A real completed first exchange exists on each target in this invocation.","seed_method":"ui_flow","records":["Create history by submitting first_prompt through the actual composer; never inject transcript state.","Capture actual user/assistant IDs, assistant text, timestamps, provider response ID, model, usage and server text hash.","Every new prompt uses a fresh nonsecret request marker; contextual follow-up excludes the first nonce."]}}
```

## Scope: file-level permissions

writeAllowed:

- `tests/sprint-05-orient-search/run-live-example-proof.mjs`
- `tests/sprint-05-orient-search/live-example-proof.ts`
- `tests/sprint-05-orient-search/live-example-proof.test.ts`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/manifest.json`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/server-events.jsonl`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind-ios/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind-android/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind-web/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/nativewind-ios/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/nativewind-android/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/nativewind-web/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/teardown.json`

writeProhibited:

- `apps/**`
- `packages/**`
- `public/**`
- `pnpm-lock.yaml`
- `.spec/**`
- `.kb-run-sprint/**`
- `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/**`
- Any path not explicitly allowed.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

## Boundaries

### Always

- Invoke the real typed drivers through repository tsx with explicit run, source, engine, platform and reserved device/browser identity.
- Keep one shared app-owned useLiveChat/backend implementation across both engine compositions.
- Validate actual artifacts and provider correlation deterministically; fail closed when required runtime evidence is unavailable.
- Preserve prior runs and capture sanitized failures without exposing credentials.
- Abort requests, clear timers/listeners and release only owned processes, mappings, contexts and reservations on every exit.

### Ask first

- A selected package pin or provider/model contract is unavailable or incompatible: return the concrete blocker to the owning task for an explicit version decision.
- A required repair touches apps, shared drivers, registry, lockfile, policies, docs, CI or deployment: obtain separately scoped owner authorization.

## Boundary contracts

1. Build a deterministic runner that starts the real example backend, invokes the native-owned screen drivers, validates their artifacts against actual server outcomes, and exits nonzero for missing or stale evidence.
2. Run the same useLiveChat implementation and backend for uniwind and nativewind on iOS, Android, and Web. ORI-RN-004 owns the Uniwind composition and drivers; ORI-RN-005 owns the independent NativeWind composition and drivers.
3. Use a fresh nonsecret nonce in each prompt. Capture actual assistant text, timestamped growth, a provider response ID, the configured model, usage, and completion. Correlate the rendered answer with the server's response text hash and request ID.
4. Require a contextual follow-up, Stop during an unfinished stream, Retry after interruption, a visible real network failure, and successful Retry after restoring the owned service.
5. Exercise an upstream error by launching the same server with a deliberately nonexistent model identifier while retaining the real provider endpoint. Require the actual provider rejection and sanitized UI error, then restore the primary model and retry. Do not add a failure switch to production code.
6. Validate source hashes, lockfile hash, commands, exit codes, engine, platform, device identity, API origin, and run ID. Evidence from another source tree, another engine, a browser substituting for native, or the offline gallery must fail.
7. Treat a generation that finishes before Stop as nondiscriminating evidence. Report the result and rerun with a longer bounded prompt; never insert artificial stream delays or invent an abort.
8. The reviewer independently reruns the owned commands and inspects native recordings. Existing green artifacts alone do not establish acceptance.
9. run-live-example-proof.mjs invokes the real typed driver exports through the repository's tsx runtime: runLiveExampleProof from support/live-example-proof.test.ts for uniwind; runNativewindLiveExampleProof from support/nativewind-live-example.ts for nativewind. Those are the only native-driver paths; no nonexistent live-example-native.test.ts or live-example-web.spec.ts is invoked.
10. Pass a fresh run ID, exact source identity, engine/platform, explicit reserved iOS UDID or Android serial/browser identity, bounded output directory and the support/live-backend.ts owned-backend handle. The orchestrator starts/stops/restarts the actual backend and restores its real model configuration for error/recovery legs.
11. Each of the six target records must carry observed screenshots/recordings, stream-growth timestamps and actual backend/provider correlation from this invocation. Reject absent or stale targets and mismatched source identities.
12. Verify the contextual follow-up without repeating the first prompt's nonce in the new user message. Require answer/context and server history correlation; simply producing a second unrelated answer does not prove history.
13. The final docs Quickstart test awaits this runner's fresh engine invocations (sequenced by the awaiting caller, or the acceptable monolithic command) within its own invocation after the seed-data proof. Prior task evidence cannot stand in for that fresh execution.
14. Compose the six-target proof as fresh per-engine invocations within one cycle — uniwind then nativewind, each `--engines <one> --platforms ios,android,web` through run-live-example-proof.mjs, mirroring how the runner already invokes the drivers — all bound to one candidate SHA: the cycle's manifests must record identical source digests, and each of the six engine/platform targets must carry a green leg from a current-cycle invocation. A monolithic single-command run remains acceptable. The reviewer's independent rerun is scoped to one engine per invocation. The runner and the Vitest suite may be adapted within the existing allowlist to accumulate and validate the cycle's evidence set (per-engine run journals, manifests and teardowns); the per-target oracles and the tamper-rejection cases are unchanged.
15. Environment protocol (operational rules the cycles proved): `RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1` and `RNR_S05_ANDROID_SERIAL=emulator-5554` must both be set for any native-including run (the shared reserveDevices throws on either missing); cold-reboot the reserved devices between engines after marathon wear — the runner's refreshReservedDevices implements this mid-invocation, so per-engine invocations reboot between invocations, never touching the unrelated booted simulator and keeping the emulator's userdata; children run with `TMPDIR=/tmp/ori-ai-002-scratch` (the scratch reaper deletes the agent-scratch tmpdir os.tmpdir() resolves to under cmux agent shells, and the driver's consumer builds, maestro flow files and expo outputs live there); the pinned Expo Go 57.0.9 APK must exist on disk even for ios-only runs (restorable from the expo/expo-go-releases tag Expo-Go-57.0.9); clear port 4000 before each backend launch (orphaned backend children from crashed runs hold it). A per-engine three-platform invocation measures ~25-30 minutes; record an explicit per-invocation watchdog budget.

## Deliverable

- `tests/sprint-05-orient-search/live-example-proof.ts`: typed orchestration and evidence validation.
- `tests/sprint-05-orient-search/run-live-example-proof.mjs`: deterministic command entrypoint using tsx and the actual typed driver exports.
- `tests/sprint-05-orient-search/live-example-proof.test.ts`: four named real integration tests, one per AC.
- The exact evidence paths listed below: source-bound observations, real RED/GREEN output and cleanup records.

Planned evidence paths:

- `tests/sprint-05-orient-search/evidence/ORI-AI-002/manifest.json`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/server-events.jsonl`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind-ios/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind-android/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind-web/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/nativewind-ios/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/nativewind-android/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/nativewind-web/`
- `tests/sprint-05-orient-search/evidence/ORI-AI-002/teardown.json`

Per-target evidence:

- result.json: actual prompt nonce, request IDs, provider response IDs, model, usage, terminal outcomes, command exits, and source identity
- stream.jsonl: timestamped text growth and actual final assistant text from nonsecret test prompts
- screen-recording.mp4: send, growing response, Stop, visible error, and Retry
- streaming.png and recovered.png: visually inspected native or browser states

## Agent instructions: TDD flow

1. For each AC, write its named integration test before the corresponding runner/validator behavior. Exercise actual prerequisite entrypoints. Capture a real assertion failure against a disconnected owned service or missing/mismatched real evidence; missing imports or unavailable tooling alone do not constitute behavioral RED. Under the accumulated-evidence contract the suite's RED is achievable without a marathon: the validation path fails on absent or incomplete cycle evidence by construction.
2. Preserve command, exit, source and actual failure output at `tests/sprint-05-orient-search/evidence/ORI-AI-002/proof.red`, with distinct run identities. After the orchestrator verifies RED, implement the smallest allowed behavior and rerun the same real suite.
3. Refactor only after GREEN, within the allowlist, and rerun affected proof. Return phase, exact test identity, files changed and actual output. Route app or driver defects to their named owners.
4. After all ACs, hand the exact candidate to aisdk-reviewer for independent reruns and inspection of iOS screenshots and Android recordings. Existing green artifacts cannot replace that execution.

## Reading list

1. `tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts` [PRIMARY PATTERN], lines 48-83: real response-to-filesystem byte correlation; do not inherit browser-only coverage for native claims.
2. `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/render-contexts/ORI-AI-002.json`: complete immutable scope, driver exports, provider matrix and execution prerequisites.
3. `/Users/justinrich/Projects/brain/.rosetta/docs/ai-sdk/ROSETTA.md`: v7 streaming, message identity and abort semantics; installed-version API questions remain with the dependency owner.
4. `/Users/justinrich/Projects/brain/docs/kanban/SCENARIO-CONTRACT-V1.md`: real fixtures, concrete observations and negative controls.
5. `AGENTS.md`: universal targets, real testing, ownership and scratch discipline.

## Design/reference guidance

Consume ORI-RN-004/005 compositions and accessibility drivers. Observe the actual composer, growing assistant text, Stop generating, error and Retry controls. Generic root visibility is not a success oracle. Layout, tokens and screen state changes are outside this task.

## Coding standards

- Use Node 24 ESM, strict TypeScript, static imports, named exports and explicit types; no any, suppression or compatibility shim.
- Validate driver output, identities, hashes, event correlation and exit status deterministically before accepting evidence.
- Use typed owned-process handles, argument arrays, bounded requests and finally cleanup; retain actual sanitized failures.
- Consume the installed-version v7 hook and transport supplied by ORI-AI-001. Prove actual stream consumption, history, message identity and abort handling without adding alternate app logic.

## Agent rationale

aisdk-planner specifies provider and transport evidence; aisdk-implementer builds the real integration runner; aisdk-reviewer independently verifies provider semantics. react-native-reusables-planner co-authors the native-driver boundary.

## Verification and evidence gates

1. Establish the prerequisite commits, candidate identity, package compatibility, real credentials, reserved ports/devices and endpoint/CORS reachability before runtime proof. A missing prerequisite blocks execution rather than producing a passing skip.
2. Require actual RED-before-GREEN for every AC and exact correspondence among human proof fields, Scenario Contracts and the machine requirements below.
3. Run `pnpm typecheck`, the exact scoped Biome command, the exact per-engine runner commands (or the acceptable monolithic command) and the exact task verification command. The runner invocations must be fresh and current-cycle; the Vitest invocation validates the cycle's accumulated evidence set and must fail on missing, stale or tampered receipts. Record commands, exits and source identity.
4. Require six complete current-cycle target records across the cycle's invocations — all bound to one candidate SHA — plus observed text growth, server/provider correlation, inspected native evidence, invalid-receipt rejection and teardown on every exit.
5. Independently rerun against the candidate, one engine per invocation, covering both engines across the review. Scan touched code/tests for stubs, placeholders, skips, fake success and deferred required logic; any remaining required behavior blocks approval.

The orchestrator performs Requirement/Scenario validation and sprint-wide flow coverage validation before planning writes and again before dispatch. This response does not claim those validators ran.

## Execution prerequisites

- ORI-AI-001 must establish actual installation and compatibility of ai@7.0.89, @ai-sdk/react@4.0.92, @ai-sdk/openai@4.0.66 and zod@4.6.1, including LanguageModelV4 and the real live-chat import graph. Unavailable or incompatible pins require a version decision.
- OPENAI_API_KEY presence is not provider proof. Use the fixed official OpenAI Responses endpoint and gpt-4.1-mini-2025-04-14; capture sanitized authentication, model, quota and network outcomes. No silent substitution is allowed.
- Reserve backend, Metro and Web ports and identify listeners first. Refuse unowned listeners. Validate each platform's endpoint reachability and the actual Web CORS origin. localhost:4321 remains the docs gate origin.
- Native owners must provide explicit RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL, compatible Expo Go, actual automation and functioning expo/fetch streaming, structuredClone and text-encoding globals. Keep engine caches and native build outputs separate.
- Only launcher/backend receive secrets. Strip them from installs, Metro, compilers, browsers, EXPO_PUBLIC variables, configuration, arguments and captured artifacts. Inspect client outputs for leakage without printing matched values.

Documented driver semantics the proof must respect (FIX-ORI-RN-004-2 and FIX-ORI-AI-002-1 handoffs): web-leg stop turns produce delayed `completed` provider records and never `aborted` — the web proxy does not propagate client aborts upstream, while the four native targets abort for real because the apps connect directly. `manifest.completed` literally means all 3 platforms passed; key per-target assertions on `legs[].status`, never on `completed`, for single-engine invocations. The ORI-RN-004 heartbeat log is append-only across runs — filter by run id. The ORI-RN-004-owned web-leg final-state check can fail a leg whose retry demonstrably completed (`retryControlVisible` sampled after the successful retry has removed the control; observed once in ~7 runs) — that oracle is write-prohibited here: report it and rerun the affected engine invocation; never weaken a predicate to pass it.

Preserve `pnpm --dir apps/example exec tsc --noEmit` diagnostics separately through their owners; root typecheck excludes apps and cannot establish package-wide green. Required live-graph errors block their owning task. This is planning-only output; later implementation and external actions remain separately authorized.

## Out of scope

- Backend, hook, transport, screen or shared-driver implementation and repairs, owned by ORI-AI-001, ORI-RN-004 and ORI-RN-005.
- Offline gallery, unrelated example diagnostics, registry components, seed-consumer implementation and visual redesign.
- Package/lockfile changes, provider/model substitutions, production failure switches and artificial stream delays.
- Quickstart content, browser-flow ownership, journey ownership, policy edits, CI configuration, deployment, publishing and sprint closure.

## Context

**Current gap:** The supplied planning context contains no observed six-target provider proof. Backend/hook delivery and both native compositions are prerequisites whose current completion must be checked at execution.

**Success state:** The exact per-engine commands produce current-cycle evidence for all six actual targets, bound to one candidate SHA; every AC has behavioral RED then GREEN and independent native/provider review.

**Capability:** CAP-DOCS-01.

**PRD references:** `.spec/prds/docs-site/README.md`; `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md`; UC-DOCS-02.

**Locked sprint gate:** A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

**Entrypoint:** docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

**Demonstrates:** UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).

The fixed sprint retains 13 flows: nine task flows and four journeys; 36 tasks and 131 points.

## Supported locked flow

- FLOW_REF: FLOW-DOCS-02-quickstart-chat-screen
- PRIMARY: false
- PRIMARY_OWNER: ORI-CONT-004
- GATE_STEP: ORI-GATE-03, number 3
- TEST_FILE: tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts
- TEST_FUNCTION: FLOW-DOCS-02-quickstart-chat-screen
- RUN_CMD: `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop`
- ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/run.json
- RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json

The final Quickstart browser invocation awaits runQuickstartProof and then this live runner, using fresh evidence from that invocation. Source, lockfile, registry and run identities must agree. ORI-CONT-004 owns the canonical browser-flow RED path; it is outside this task's allowlist. All four journey proofs remain with ORI-AST-010.

## Review: aisdk-reviewer

Must pass:

- Four behavioral ACs have genuine RED/GREEN evidence and mapped TCs.
- All six targets prove growth, context, active abort, both actual failure modes and retry without duplicate user turns.
- Real artifacts and server/provider events share source/run identity; missing or mismatched receipts fail.
- Native captures are inspected, credentials are absent and all owned resources are released on success and failure.
- Only allowed paths change; no required behavior is stubbed, skipped or deferred.

Should verify:

- Stop timing is discriminating and bounded reruns report nondiscriminating attempts honestly.
- Each target is the claimed engine/runtime and has actual native/browser observations.
- The final docs flow executes this runner freshly after its seed proof.
- The independent rerun is scoped to one engine per invocation and still covers both engines across the review.

Verdict: APPROVED or NEEDS_FIXES. NEEDS_FIXES must identify concrete file/line or artifact evidence. No verdict is asserted by this charter.

## Dependencies, provides and consumes

Depends on: ORI-AI-001, ORI-RN-004, ORI-RN-005.

Blocks final acceptance consumers: ORI-CONT-004, ORI-AST-010, ORI-CI-004.

Provides:

- ORI-CONT-004: an awaitable fresh six-target proof after runQuickstartProof (engine invocations sequenced by the awaiting caller, or the acceptable monolithic command), current-cycle artifacts and failure when any leg is absent.
- ORI-AST-010 and ORI-CI-004: the same deterministic per-engine command set (or monolithic command) and sanitized source-bound evidence for fresh integrated/hosted execution; historical receipts are insufficient.

Consumes:

- ORI-AI-001: real useLiveChat, v7 transport/backend, official provider integration and `tests/sprint-05-orient-search/support/live-backend.ts` owned-backend handle.
- ORI-RN-004: Uniwind composition and `runLiveExampleProof` from `tests/sprint-05-orient-search/support/live-example-proof.test.ts`.
- ORI-RN-005: independent NativeWind composition and `runNativewindLiveExampleProof` from `tests/sprint-05-orient-search/support/nativewind-live-example.ts`.

Parallel execution must not share reserved devices, listeners, caches or evidence directories.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AI-002","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"live_matrix":{"description":"Fresh isolated candidate with the real owned backend and empty live-screen sessions on six reserved targets.","seed_method":"cli","records":["Targets: uniwind-ios, uniwind-android, uniwind-web, nativewind-ios, nativewind-android, nativewind-web.","Launch through tests/sprint-05-orient-search/support/live-backend.ts with official OpenAI Responses and gpt-4.1-mini-2025-04-14; credentials remain server-only.","Record fresh run/source/lockfile identity, reserved ports, RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL and browser identity; use separate engine caches.","Compose the cycle as fresh per-engine invocations (uniwind then nativewind), both bound to one candidate SHA — identical source digests across the cycle's manifests — and cold-reboot the reserved devices between engines after marathon wear (the unrelated booted simulator is never touched; the emulator keeps its userdata).","RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1 and RNR_S05_ANDROID_SERIAL=emulator-5554 must both be set for any native-including run; children run with TMPDIR=/tmp/ori-ai-002-scratch; the pinned Expo Go 57.0.9 APK must exist on disk even for ios-only runs; clear port 4000 before each backend launch; a per-engine three-platform invocation measures ~25-30 minutes.","manifest.completed literally means all 3 platforms passed — key per-target assertions on legs[].status; web-leg stop turns produce delayed completed records, never aborted (the 4 native targets produce the aborted records).","first_prompt: Remember marker ${nonce}. Reply with the marker and list numbers 1 through 40. Generate a fresh nonsecret nonce per target/run.","followup_prompt: For request ${followupNonce}, repeat the marker from my first message. The new message must not contain the first nonce."]},"live_history":{"description":"A real completed first exchange exists on each target in this invocation.","seed_method":"ui_flow","records":["Create history by submitting first_prompt through the actual composer; never inject transcript state.","Capture actual user/assistant IDs, assistant text, timestamps, provider response ID, model, usage and server text hash.","Every new prompt uses a fresh nonsecret request marker; contextual follow-up excludes the first nonce."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN six fresh live targets WHEN each sends a nonce-bearing prompt and contextual follow-up THEN all six show incremental responses and retained context correlated with actual provider outcomes.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/live-example-proof.test.ts","test_function":"ORI-AI-002-AC-1-stream-history","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts","test_tier":"integration","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","negative_control":{"would_fail_if":["The screen is static, the provider is stubbed, or history is disconnected from the next request."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_matrix","action":{"actor":"user","steps":["Submit the first_prompt through each actual live composer, then send the followup_prompt without repeating the first nonce.","Observe assistant text and correlate both requests with actual server/provider events."]},"end_state":{"must_observe":["6 targets each show at least 2 distinct timestamped nonempty text prefixes before completion.","All 6 follow-up answers contain the exact recorded first `${nonce}`; server history includes 1 prior user/assistant exchange, and the latest user message contains 0 occurrences of that nonce.","Completed text hashes match server text hashes; request ID, provider response ID, gpt-4.1-mini-2025-04-14 and positive usage are recorded."],"must_not_observe":["Empty assistant output, a static final answer without growth, unrelated follow-up or missing provider correlation."]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN real conversation history WHEN each target stops an unfinished generation and retries THEN the active request aborts and Retry completes without duplicating its user turn.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/live-example-proof.test.ts","test_function":"ORI-AI-002-AC-2-stop-retry","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts","test_tier":"integration","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","negative_control":{"would_fail_if":["Stop only changes static UI, the upstream request remains connected, or Retry is a stub."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_history","action":{"actor":"user","steps":["Submit a fresh marked bounded long-generation prompt; press Stop generating after growth while the correlated request is unfinished, then press Retry.","Record completion-before-Stop as nondiscriminating and rerun with a longer bounded prompt; never add artificial delays."]},"end_state":{"must_observe":["The 4 native targets (uniwind-ios, uniwind-android, nativewind-ios, nativewind-android) correlate Stop with an aborted provider record for an active unfinished request and no preceding completion event.","The 2 web targets correlate Stop with a client-aborted active request whose upstream record lands as a delayed completed response (documented proxy semantics, FIX-ORI-RN-004-2): screen growth stops, no completion event precedes Stop, and the delayed record never substitutes for the abort observation.","Each Retry creates a new real request and completed provider response while retaining exactly 1 copy of the interrupted user turn."],"must_not_observe":["Completed-before-Stop accepted as abort proof, continuing post-abort growth or 2 copies of the retried user turn. Empty abort evidence or 0 correlated active-request aborts across the 4 native targets."]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN working live targets WHEN the owned endpoint disappears or OpenAI rejects a nonexistent model THEN each target shows sanitized errors and successful Retry without duplicate user turns.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/live-example-proof.test.ts","test_function":"ORI-AI-002-AC-3-error-recovery","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts","test_tier":"integration","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","negative_control":{"would_fail_if":["HTTP is mocked, a production failure switch fabricates rejection, or disconnected Retry returns a canned answer."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_history","action":{"actor":"user","steps":["Stop only the recorded backend child and submit a fresh marked prompt on each target.","Observe actual network failure, restart the owned backend with the primary model and press Retry."]},"end_state":{"must_observe":["6 visible network-failure states followed by 6 completed real provider responses.","Each recovery retains exactly 1 failed user turn and matches rendered text to its new server request."],"must_not_observe":["Static success during endpoint loss, empty error evidence, leaked credentials or duplicate user turns."]}},{"start_ref":"live_history","action":{"actor":"user","steps":["Launch the same server with nonexistent model rnr-s05-nonexistent-${runId}, retaining the official provider endpoint; submit fresh marked prompts.","Observe the actual provider rejection, restore gpt-4.1-mini-2025-04-14 and press Retry on every target."]},"end_state":{"must_observe":["6 actual rejected-provider requests with sanitized status/error correlation and visible screen errors.","6 recovered responses identify gpt-4.1-mini-2025-04-14, positive usage and exactly 1 retained failed user turn."],"must_not_observe":["Locally fabricated rejection, empty provider outcomes, alternate endpoint or successful Retry without a real request."]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN the cycle's accumulated fresh real evidence set WHEN the runner validates complete, missing and mismatched receipts and exits THEN only complete correlated evidence passes and owned resources are released.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/live-example-proof.test.ts","test_function":"ORI-AI-002-AC-4-evidence-lifecycle","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts","test_tier":"integration","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real useLiveChat screens, owned example backend, official OpenAI Responses, reserved iOS/Android devices and Web browser","negative_control":{"would_fail_if":["Validation accepts empty or static receipts, or cleanup is disconnected from real process ownership."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_matrix","action":{"actor":"cli_user","steps":["Run the six-target proof as fresh per-engine invocations within one cycle (or the acceptable monolithic command) through the real typed drivers and owned backend handle; inspect actual artifacts and native recordings.","Exercise normal and real-service failure exits; inspect process, mapping and reservation ownership after teardown."]},"end_state":{"must_observe":["Exactly 6 current-cycle target records — the union of the cycle's fresh per-engine invocations, all bound to one candidate SHA — contain result.json, stream.jsonl, screen-recording.mp4, streaming.png and recovered.png.","For all 6 targets, the manifests record 64-character SHA-256 digests equal to recomputed source/lockfile/registry/driver/policy and artifact digests; commands, exit codes, target identity, API origin and run identity equal their own invoking run, source digests are identical across every manifest in the set, and server-events.jsonl values correlate.","Each invocation's teardown.json records restored model/appearance, released reservations, closed contexts and 0 remaining owned listeners or mappings."],"must_not_observe":["Missing native targets, browser evidence labeled native, stale receipts, secrets or leftover owned listeners. Empty target records or 0 current-cycle targets."]}},{"start_ref":"live_matrix","action":{"actor":"cli_user","steps":["Create bounded filesystem copies of artifacts from a real invocation; separately remove one target or alter run ID, source/lockfile hash, engine/platform identity or an artifact byte.","Run the real evidence validator on each copy; preserve original evidence."]},"end_state":{"must_observe":["Every missing, stale or mismatched case has process exit_code != 0 and a rejection diagnostic naming the exact removed target or altered field, such as `uniwind-ios`, `runId` or the mismatched SHA-256 digest.","Each intact per-engine evidence set exits 0 through the real validator with its accepted targets; the accumulated cycle set carries exactly 6 accepted target records, 0 correlation mismatches, and recorded SHA-256 digests equal to independently recomputed artifact and server-text hashes."],"must_not_observe":["Exit 0 for an empty matrix, stale run, wrong source/engine, substituted browser or altered artifact."]}}]}},{"id":"TC-1","type":"test_criterion","description":"All six targets have correlated incremental responses and contextual follow-up without repeating the first nonce in the new user message.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"All six targets abort unfinished real requests and complete Retry with exactly one retained user turn.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"All six targets expose actual endpoint loss and provider rejection, then recover through real requests without duplicate user turns.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The runner rejects missing or mismatched receipts, accepts only fresh complete correlation and records cleanup of all owned resources.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts","maps_to_ac":"AC-4"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-AI-002",
  "commit_sha": "2138d10e970e0d9d54912b6365576ed235bc2d6a",
  "done": "The six-target provider proof concluded under the cycle-6 revised per-engine contract and was APPROVED at 2138d10e (merged to main as ae0fb0d8): two fresh per-engine invocations bound to one candidate SHA — uniwind run ORI-AI-002-1790254489381 and nativewind run ORI-AI-002-1790256894249, both exit 0 with full artifacts including native screen recordings — are committed as self-contained sets under tests/sprint-05-orient-search/evidence/ORI-AI-002/<engine>/, and the rewritten vitest suite (tests/sprint-05-orient-search/live-example-proof.test.ts) validates the accumulated evidence set on disk (cross-manifest digest identity, per-target artifacts and provider correlation, five tamper cases through the real validator, intact-set validations, teardown cleanliness) with 4/4 passing, typecheck and scoped biome clean. Along the way the runner (tests/sprint-05-orient-search/live-example-proof.ts) gained: graceful bounded backend close (the cycle-3/4 crash fix — an abortive mid-SSE kill crashed the whole orchestrator through unhandled undici errors), an error-listened Readable.fromWeb body bridge in the teeing proxy, per-engine output partitioning with manifest-declared engines and self-recorded exit codes, per-target session-scoped record derivations, the reviewer-proven answer-lead/ENGINE_TAG recall oracle with wrap-tolerant matching, the drivers'-literal-'What marker' bubble oracle, disk-scan android recorder stop, mid-matrix reserved-device refresh, and a hardened web-self first-prompt re-drive; the discrimination proof (positives 1/12/23/17, disconnected-recall negative 0/0/0/0) is committed at .tmp/ORI-AI-002/cycle-8/red/discrimination-proof.txt with its runnable script.",
  "deviations": [
    "The amendment's literal commands pass the same --output root for both engine invocations, but the runner partitions single-engine invocations into evidence/ORI-AI-002/<engine>/ subdirs (tests/sprint-05-orient-search/live-example-proof.ts:2455) so the two sets accumulate instead of the second clobbering the first's root-level manifest/server-events/teardown.",
    "Native completed_before_stop=false is delegated to the drivers' passed stop-turn gates rather than independently derived (tests/sprint-05-orient-search/live-example-proof.ts:2244) because the records stream cannot order events — request ids repeat across a session's ~30 turns and journal timestamps are batch-observation times, so an independent derivation would misattribute.",
    "prior_exchange_count is the session's generation-0 completed turns minus the latest (tests/sprint-05-orient-search/live-example-proof.ts:2360) rather than a server-side history count — the backend never logs message history, only terminal records per turn.",
    "The vitest suite no longer spawns a matrix (the original contract's shape) but validates accumulated on-disk evidence and re-derives the native context oracles from stream.jsonl dom-samples, per the cycle-6 amendment's explicit fixture-sourcing allowance.",
    "The suite's transient validate-cases copies and the drivers' evidence-root rewrites are deliberately never committed — they are per-run side effects, and committing them once tripped the repo's fallow pre-commit audit."
  ],
  "concerns": [
    "The recall oracle keys on model answer phrasings ('gave me the marker', 'asked me to remember', 'marker you/vou gave/aave') — a future model or prompt change in wording drifts these lines and false-fails AC-1; the regexes live in three places (synthesizer, suite, proof script) and must move together.",
    "The ORI-RN-004 web-leg retryControlVisible oracle remains flaky in the wild (three occurrences across cycle 5-6: retryCompleted=true and retrySingleUserTurn=true while the control had already vanished after a successful retry) — every future engine run rerolls it at ~35 minutes per attempt, and it is write-prohibited to this task family.",
    "The web-self port-4000 handoff race is defended by one bounded re-drive (relaunch + fresh page) but the actual killer of the 1.8-second-old backend child was never identified — the defense converts the race into a pass, it does not explain it.",
    "The latest-user-message nonce count observes only the VISIBLE portion of the truncated follow-up bubble — line-fragment OCR cannot see a nonce repeated beyond the rendered text, so that oracle is as strong as the screen, not the message.",
    "Machine-level fragility that silently eats runs: homebrew ffmpeg dyld breakage killed every android recording concat with zero error in the runner, and children must run with a short reaper-free TMPDIR (/tmp/ori-ai-002-scratch) because the worktree path overflows tsx IPC pipes and the agent-scratch reaper deletes mid-run dists."
  ],
  "findings": [
    "macOS Vision OCR returns wrapped ~36-char LINES, so a full nonce never matches on screen and the marker always sits alone on its own line whether it came from the user bubble, the seed prompt, or the answer — only answer-lead phrasing with an OCR-tolerant engine tag on the same or adjacent line discriminates (proven at .tmp/ORI-AI-002/cycle-8/red/discrimination-proof.txt).",
    "The app reuses ONE chat id across a whole session (~30 turns) and one server hosts every leg of a phase, so the records stream interleaves all legs and any phase-global or id-keyed lookup misattributes aborts/retries across platforms — per-target derivations must scope by the drivers' latest_backend_record session pin (tests/sprint-05-orient-search/live-example-proof.ts:2215).",
    "The journal ts is observation time, not event time — batches share timestamps and uniwind flow-end flushes give every turn one ts, so event ordering must use records-file order, never timestamps.",
    "The nativewind consumer's web export has no index.html (its only route is /live-chat, exporting live-chat.html plus static routes) — any dist entry-point check must accept both (distHasEntry, tests/sprint-05-orient-search/live-example-proof.ts:1046).",
    "launchOwnedBackend's pid is the tsx CLI wrapper, and a zombie wrapper still reports started while its server is dead — health checks must probe the listener or the child process, not the handle flag.",
    "The 'invalid server configuration: EXAMPLE_CHAT_MODEL…' stderr line at the top of every runner log is a non-fatal import-time preamble from the orchestrator module importing the server env validator, and it was misread as a fatal spawn failure twice (cycle-5 review and once by the orchestrator).",
    "The original monolithic verify contract (one 1.5-2h six-target command plus a vitest suite that respawns its own matrix) could not converge against once-per-several-runs device/driver flakes — five cycles and two landed driver FIXes proved it before the cycle-6 replan (fb58634d) fixed the shape."
  ],
  "scope_impact": [
    {
      "target": "ORI-RN-004",
      "found": "The uniwind web-leg endpoint-loss oracle samples retryControlVisible after a swallow-timeout wait, failing legs whose retry demonstrably completed (retryCompleted=true, retrySingleUserTurn=true, control already removed), and the big-yaml flow asserts no follow-up marker recall at all — recall proof rests entirely on ORI-AI-002's OCR oracle.",
      "change": "Gate the web leg on the completed retry record rather than post-hoc control visibility, and add a waitForNewMarkerText-style recall assertion to the yaml (nativewind already has one)."
    },
    {
      "target": "ORI-AI-001",
      "found": "support/live-backend.ts exposes the tsx wrapper's pid as `pid` and its LISTENING-line flag as `started`; a zombie wrapper reports started while its grandchild server is dead, which twice defeated health checks at the port-4000 handoff.",
      "change": "Expose the real server child (or a listener-probing healthy()) on OwnedBackendHandle so callers can distinguish a live server from a live wrapper."
    },
    {
      "target": "ROADMAP",
      "found": "TEST tasks whose verify shape is a single long monolithic invocation plus a self-respawning suite cannot converge on real devices — this task burned five cycles proving it before the per-engine amendment.",
      "change": "Write per-invocation composition (per-engine/per-platform fresh invocations within one cycle, one candidate SHA, accumulated-evidence validation) into the TEST-task template from the start instead of amending under fire."
    }
  ],
  "feedback": [
    "The original 'How to verify' block was wrong for this environment: one monolithic six-target command plus a vitest suite that spawns its own full matrix meant any single flaky leg re-rolled 1.5-2h — the cycle-6 amendment's per-engine composition with a ~35-minute reroll unit is the shape to write next time.",
    "The fixture JSON should document that the follow-up prompt wording differs per surface (web session 'For request…' vs native drivers 'What marker did I ask you to remember?' / 'What marker did I give you?') — the divergence silently produced a vacuous oracle that passed review once.",
    "The task's evidence layout (writeAllowed listing root-level target dirs) predated the per-engine sets; allowing 'evidence/ORI-AI-002/**' explicitly would have avoided re-deriving intent from the amendment's plural-manifest wording.",
    "Boundaries that say 'the drivers own every device interaction channel' left the passive OCR observer as the only legal independent screen oracle — say so explicitly in future charters, because it dictates what the oracles can and cannot discriminate."
  ]
}
```
