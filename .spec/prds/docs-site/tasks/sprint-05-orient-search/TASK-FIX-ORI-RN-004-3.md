# FIX-ORI-RN-004-3: Un-stick the live-proof driver's caller-backend restart after the endpoint-loss stop

## What this does

Bounds and un-sticks the ORI-RN-004 driver's caller-provided-backend stop→restart decision path (`tests/sprint-05-orient-search/support/live-example-proof.test.ts`). Observed in run `ORI-AI-002-1789975643876`: with the FIX-ORI-RN-004-2 bounded driver adopted (commit `23afaf8f`), the six-target matrix completed every native leg and drove the live web leg through its stop-turn and endpoint-loss backend stop — the stop completes through the caller's `options.backend` handle (heartbeat `backend/stop/start` at 08:04:18; the owner adapter executes its commands faithfully per its status file) — and then the driver never issues the following restart: no restart command reaches the owner adapter's command file, no further heartbeats for 30+ minutes, past the 120 s backend-operation bound and the 840 s web-leg budget, with the orchestrator idle in kevent and no chromium/expo/adb children alive.

The stalled surface is the decision segment between `session.stop()` completing and `session.restart()` being issued — in the web leg that is the post-stop UI observation sequence (`fill` the probe, `Send message`, wait for the accessible `Retry` control, read the sanitized alert) plus whatever adapter interaction surrounds it. FIX-ORI-RN-004-2's reviewer matrix passed 3/3 with the driver's self-launched backend and never exercised this seam; its bounds race only at await points that yield, so a segment that never yields (or a condition that never fires for a caller handle) sits upstream of every existing bound. This task isolates which await/segment never proceeds for caller-provided handles and makes every segment between the `backend/stop/*` stop heartbeats (`backend/stop/start` then `backend/stop/done`) and `backend/restarted` bounded, heartbeated, and fail-fast — with the reproduction built on a task-owned minimal caller-handle adapter (the file/record/command adapter shape documented in ORI-AI-002's cycle-3 blocked report), never on ORI-AI-002's write-prohibited runner code.

## Why

ORI-AI-002's cycle-3 blocked report (commit `d4938bb3`, item `ORI-AI-002:blocked:3:scope_impact:0`) proves everything else works: the bounded driver restored from main, the owner-dispose split, the stale-listener pre-clear, all native legs, and the web leg up to the stop. The single remaining blocker is this driver-internal restart-not-issued path, and the driver is write-prohibited to ORI-AI-002. FIX-ORI-RN-004-2 is completed and owns the surrounding machinery (BackendSession bounds, heartbeats, StallError diagnostics), but its charter's oracle never required a caller handle mid-leg — its own handoff records that the caller-adapter bound was "proven by construction… not by a live adapter hang" and that ORI-AI-002's cycle 3 would be the first real exercise. It was, and it stalled exactly there. No pending task owns the driver; once the restart path is un-stuck, ORI-AI-002's committed runner (d4938bb3) can conclude the six-target matrix and capture vitest GREEN with no further work in its own files.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts
pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts --matrix ios,android,web
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/live-example-proof.test.ts tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts
```

The first command is the task-owned caller-handle harness (RED stall reproduction + GREEN web-leg completion under a minimal file/command adapter). The second runs the full exact three-platform matrix through a caller-provided backend handle. The rest are regression and static gates.

## Scope

Own the driver's post-stop restart decision path and the caller-handle harness, plus bounded evidence. ORI-AI-002's runner, the shared support files, and every in-flight file stay untouched; the fixed driver is consumed by ORI-AI-002's re-dispatch through the frozen `runLiveExampleProof` / `options.backend` interface.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: Backlog

> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 3 · Type: FIX
> Dependency phase: after ORI-RN-004 and FIX-ORI-RN-004-2
> Proposed By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-21
> Source SHA: 31af7d88

AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROGRESS: 0/3 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

The driver's endpoint-loss sequence completes for caller-provided backend handles: after the `backend/stop/*` stop heartbeats, every segment up to and including `backend/restarted` is itself bounded and heartbeated, a stalled segment fails fast with a named diagnostic instead of an idle hang, and the full exact three-platform matrix driven through a caller-provided handle completes 3/3 with the restart observed in the adapter's command file — with the `runLiveExampleProof` / `options.backend` seam and the FIX-ORI-RN-004-2 additive exports behavior-identical.

### CRITICAL CONSTRAINTS — Never

- Never substitute a mocked browser, mocked export, mocked proxy, stub backend, canned stream, or skipped platform for the real leg path; the RED reproduction uses a real file/command adapter over the real backend server code, and the GREEN drives real UI against the real provider.
- Never import, copy, or consume ORI-AI-002's runner or adapter code (write-prohibited, in flight on its branch at d4938bb3); the harness builds its own minimal caller-handle adapter from the documented shape (record/status/command files over the real server).
- Never change the consumed interface: `runLiveExampleProof`'s exported signature and options (including `options.backend: OwnedBackendHandle`), the `--platforms` / `--case` CLI behavior, the `run-manifest.json` / `provider-correlation.json` schemas, the BackendSession restart semantics, and the FIX-ORI-RN-004-2 additive exports (`serveWithChatProxy`, `stopServer`, `BackendSession`, `StallError`, `heartbeatRecords`, `HeartbeatEntry`) stay behavior-identical.
- Never weaken an existing bound, budget, or oracle to make the leg pass; a watchdog that kills the hang without identifying the stalled segment is an incomplete fix, not a GREEN.
- Never write outside the exact allowlist; never edit ORI-AI-002's in-flight files, the shared support files (`support/live-backend.ts`, `support/native-session.ts`, `support/nativewind-live-example.ts`), app code, or prior ORI-RN-004 evidence beyond the driver's own side-effect outputs.
- Never expose provider credentials beyond the trusted launcher/backend; strip them from spawned children and evidence exactly as the driver already does.
- Never treat missing devices, credentials, or the Expo Go prerequisite as a passing skip; fail closed and record the blocker.

### DONE WHEN

- [ ] AC-1 proves every segment between the `backend/stop/*` stop heartbeats and `backend/restarted` is bounded and heartbeated, with a fail-fast diagnostic naming the stalled segment for caller handles.
- [ ] AC-2 proves the caller-handle web leg completes the endpoint-loss sequence with the restart observed in the adapter's command file.
- [ ] AC-3 proves the full three-platform matrix under a caller-provided handle completes 3/3, with the regression and static gates green and the interface frozen.
- [ ] The exact selectors and preserved commands pass; independent review confirms functional RED, seeded evidence, the recorded root cause, and no stubs.

### SPECIFICATION

Isolate-then-bound fix in the driver plus a task-owned caller-handle harness. The harness reproduces the seam ORI-AI-002 exercises: a minimal owned-backend adapter (spawn the real server, expose the `OwnedBackendHandle` shape over record/status/command files exactly as the cycle-3 report documents the runner's pattern) passed as `options.backend` to the real `runLiveExampleProof` — never a reimplementation of the runner, never a mock of the server.

### BOUNDARY CONTRACTS

1. Primary fix location: `tests/sprint-05-orient-search/support/live-example-proof.test.ts`. Instrument the decision segment between the endpoint-loss `session.stop()` completing and `session.restart()` being issued: per-segment heartbeat records (step name + timestamp) for every await in that window (the post-stop fill/send/Retry-wait/alert-read sequence and any adapter interaction), an explicit bound <= 120000 ms per segment, and a fail-fast diagnostic (StallError-style: step, port 4000, boundMs, lastHeartbeat). If isolation shows the stall is a segment that never yields to the timer (the await-point-only backstop class recorded in FIX-ORI-RN-004-2's concerns), restructure that segment into bounded steps or an outer child-process watchdog — the oracle is that no segment can outlive its bound silently.
2. Root-cause record: the evidence must name the concrete stalled segment (or the never-firing condition for caller handles) with artifacts from the isolation run; the commit body records it. Detection-plus-timeout without identification is incomplete.
3. Interface freeze: the exports, options, CLI flags, manifest and correlation schemas, restart semantics, and the FIX-ORI-RN-004-2 additive exports stay behavior-identical; ORI-AI-002's committed runner must invoke the fixed driver unchanged. Single-platform export-driven runs still legitimately record `manifest.completed == false` (completed literally means 3 platforms); assertions key on `legs[].status`, not `manifest.completed`.
4. Harness `tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts` (NEW, in the sprint lane) exports `runCallerBackendRestartProof`: build the minimal caller-handle adapter over the real backend server (record/status/command files; the adapter — not the driver — owns the initial child, matching the documented ownership split where the caller's initial handle is stopped by the caller, the driver stops only its own restart child); RED mode replays the caller-handle web leg under a <= 900 s watchdog and captures the pre-fix stall (watchdog firing with the last heartbeat in the `backend/stop/*` family (e.g. `backend/stop/start`) and 0 restart commands in the adapter command file, or the equivalent in-vitro demonstration over the real post-stop segment code with the adapter); GREEN mode drives the real web leg through the adapter and asserts the full stop→restart→retry completion (the harness performs one real mid-stream client abort directly against the adapter's backend so the run's correlation carries an aborted record — the web proxy does not propagate client aborts upstream — recorded in green.json); `--matrix ios,android,web` runs the full exact three-platform matrix through the caller handle. Emit bounded JSON evidence and stop only recorded children on every exit path. Real services only.
5. Prerequisites: `RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1` (iPhone 17, iOS 26.3; canonical source FIX-ORI-RN-003-2 session evidence) and `RNR_S05_ANDROID_SERIAL=emulator-5554` must both be set for any native-including run (web-only runs skip `reserveDevices`); the pinned Expo Go 57.0.9 APK cache must be present or restorable; after marathon simulator sessions, perform the documented reboot/IME restore first. Missing prerequisites block execution.
6. Evidence side effects: the driver writes `run-manifest.json`, `provider-correlation.json`, `metro.log`, run-scoped `heartbeat.log` entries, and per-leg captures under `tests/sprint-05-orient-search/evidence/ORI-RN-004/` — the enumerated files are write-allowed for these side effects; regenerated captures are refreshed in place and committed with the run; never delete prior evidence. `heartbeat.log` is append-only across runs: consumers filter by the `run` field, and a naive cross-run line count is wrong by construction.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. All criteria run the real driver on the real stack through a caller-provided handle.

#### AC-1: Bounded, heartbeated post-stop restart path with named-segment fail-fast [PRIMARY]

GIVEN the instrumented driver and the minimal caller-handle adapter WHEN the harness replays the caller-handle endpoint-loss sequence under a <= 900 s watchdog THEN no segment between the stop family and the restart can idle or block indefinitely: the stop phase emits the boundWait-affixed literals 'backend/stop/start' then 'backend/stop/done' (stalled/error variants 'backend/stop/stalled'/'backend/stop/error'), 'backend/restarted' is an exact literal, matching is on that prefix family, and each segment emits its own heartbeat record and carries an explicit bound <= 120000 ms, and a stalled segment terminates with process exit code != 0 and a diagnostic naming the segment, the backend port 4000, the bound in ms, and the last heartbeat — never a silent 30-minute gap.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real driver invoked through a real file/command caller-handle adapter over the real backend server and OpenAI Responses, under an explicit watchdog
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts
- TEST_FUNCTION: runCallerBackendRestartProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-RN-004-3-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real driver invoked through a real file/command caller-handle adapter over the real backend server and OpenAI Responses, under an explicit watchdog","negative_control":{"would_fail_if":["Any segment between the backend/stop/* family and backend/restarted remains unbounded or unheartbeated, a stall exits 0 or produces no named-segment diagnostic, or the diagnostic omits the port/bound/last-heartbeat values.","A mocked adapter fabricates the restart without the real server child, an authored heartbeat log stands in for the running driver, or the RED artifact contains 0 captured stall observations."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"caller_adapter_watch","action":{"actor":"cli_user","steps":["Pre-fix: run the harness RED mode — the caller-handle web leg under the watchdog — and capture the stall: watchdog exit code != 0 with the last heartbeat in the 'backend/stop/*' family (e.g. 'backend/stop/start'), 0 restart commands in the adapter's command file, and 0 heartbeats after the last 'backend/stop/*' entry for >= the watchdog window; or, if the live stall does not reproduce in the window, the in-vitro equivalent over the real post-stop segment code with the adapter, with the divergence recorded.","Apply the per-segment instrumentation and bounds; rerun the identical harness and confirm every segment between backend/stop and backend/restarted emits a heartbeat and each formerly silent segment now terminates within its bound or fails fast with the named-segment diagnostic.","Force a stall (or replay the in-vitro never-yielding segment) and read the diagnostic."]},"end_state":{"must_observe":["Pre-fix RED shows >= 1 segment after the last 'backend/stop/*' heartbeat neither completing nor firing any bound — watchdog exit code != 0, 0 restart commands in the adapter command file, 0 heartbeats after the last 'backend/stop/*' entry and 0 'backend/restarted' entries — with the invocation run id recorded in red.json.","Post-fix the heartbeat log for the run id contains the full ordered segment chain from 'backend/stop/start' through 'backend/stop/done' to 'backend/restarted' (exact literals; >= 3 entries) with 0 out-of-order timestamps, and every segment carries a bound <= 120000 ms visible in the driver source.","A forced stall terminates with process exit code != 0 and a diagnostic naming the segment, port 4000, boundMs, and lastHeartbeat within <= 120 s; no run idles past the <= 900 s watchdog."],"must_not_observe":["A silent gap with 0 heartbeats between the last 'backend/stop/*' entry and 'backend/restarted', a segment that outlives its bound without the diagnostic, an exit-0 stall, or diagnostics omitting the named values.","heartbeat entries between 'backend/stop/start' and 'backend/restarted' count (0) at GREEN, or an empty RED stall capture (0 observations in red.json)."]}}]}
```

#### AC-2: The caller-handle web leg completes the endpoint-loss sequence

GIVEN the fixed driver invoked through the minimal caller-handle adapter (real `runLiveExampleProof`, `options.backend` set, engine uniwind, platform web, fresh run identity) WHEN the web leg runs its endpoint-loss sequence THEN the adapter's command file records the stop AND the restart, the heartbeat log shows the literal steps 'backend/stop/start' then 'backend/stop/done' (the boundWait-affixed stop family) and 'backend/restarted' for the run id, and the manifest records the web leg passed.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: real expo export, real same-origin chat proxy, real headless Chromium, the real caller-handle adapter's backend server and OpenAI Responses (gpt-4.1-mini-2025-04-14)
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts
- TEST_FUNCTION: runCallerBackendRestartProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-RN-004-3-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real expo export, real same-origin chat proxy, real headless Chromium, the real caller-handle adapter's backend server and OpenAI Responses (gpt-4.1-mini-2025-04-14)","negative_control":{"would_fail_if":["The web leg stalls or is skipped, the restart is absent from the adapter's command file, the adapter or proxy path is mocked, or completion is claimed from a receipt instead of the observed stop→restart→retry round-trip."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"caller_adapter_watch","action":{"actor":"cli_user","steps":["Run the harness GREEN mode: adapter-created caller handle, real runLiveExampleProof invocation, platforms ['web'], fresh run identity, <= 900 s watchdog.","Observe the stop-turn, the 'backend/stop/start' then 'backend/stop/done' pair, the on-screen sanitized error and Retry control, backend/restarted, and the completed retry through the heartbeat log; read the adapter's command and status files.","Correlate the manifest's web-leg record and backend record set with the harness output."]},"end_state":{"must_observe":["The adapter command file contains >= 1 stop entry and >= 1 restart entry for the run id, and the heartbeat log contains the literal steps 'backend/stop/start' followed by 'backend/stop/done' and 'backend/restarted' with 0 gaps between them beyond the bounded segments.","A fresh run-manifest.json has run_id equal to this invocation's run id and legs[platform=='web'].status == 'passed' (literal; manifest.completed may legitimately be false for a single-platform run); provider-correlation.json carries the same run_id with >= 4 backend records — >= 3 outcome 'completed' and >= 1 outcome 'aborted', where the aborted record is the harness's own one real mid-stream client abort against the adapter's backend (recorded in green.json) because the web proxy does not propagate client aborts upstream and the driver's web leg alone yields only 'completed' records.","green.json records the literal command 'pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts', harness exit code 0, the run id, and options.backend != null for the caller-passed handle."],"must_not_observe":["0 restart commands in the adapter command file at GREEN, an empty provider-correlation record set — provider-correlation records count (0), a heartbeat log with 0 entries for the run id, or a hang past the <= 900 s watchdog."]}}]}
```

#### AC-3: Full matrix under a caller handle, regression gates, frozen interface

GIVEN the fixed driver WHEN the harness runs the full exact three-platform matrix through the caller-provided handle THEN all three legs pass, the preserved gates hold, and the consumed interface — including the FIX-ORI-RN-004-2 additive exports — is unchanged.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: real Expo Go on the reserved iOS simulator and Android emulator plus real Chromium, the caller-handle adapter's backend and OpenAI Responses, the real TypeScript compiler, and the real Biome linter
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts
- TEST_FUNCTION: runCallerBackendRestartProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts --matrix ios,android,web` · `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler` · `pnpm typecheck` · `pnpm exec biome ci tests/sprint-05-orient-search/support/live-example-proof.test.ts tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-RN-004-3-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus real Chromium, the caller-handle adapter's backend and OpenAI Responses, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["Any platform regresses, the interface or additive-export surface drifts so ORI-AI-002's runner would need edits, the compiler case or static gates break, or the diff leaves the allowlist.","A mocked adapter fabricates leg outcomes without the real devices, browser, and provider, or a static shell of the matrix stands in for the real 3/3 run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"caller_adapter_watch","action":{"actor":"cli_user","steps":["Run the harness --matrix ios,android,web with the reserved devices and the documented marathon-session reboot; confirm 3/3 legs pass and the adapter command file shows the restart for each endpoint-loss leg.","Run the AC-5 compiler case, pnpm typecheck, and the scoped Biome command; prove any failure pre-existing with git stash && rerun before recording it.","Diff the driver against its pre-state; confirm the exported surface and schemas consumed by ORI-AI-002 are unchanged and the diff stays inside the allowlist."]},"end_state":{"must_observe":["The matrix completes with legs[].status == 'passed' for exactly 3/3 platforms, the adapter command file contains >= 3 restart entries (1 per endpoint-loss leg) for the run id, and run-manifest.json run_id equals the harness run id.","The AC-5 compiler case passes; pnpm typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record.","The consumed interface is unchanged: the CLI accepts exactly the literal flags --platforms and --case, the additive exports serveWithChatProxy, stopServer, BackendSession, StallError, heartbeatRecords, and HeartbeatEntry remain present with behavior-identical signatures, green.json records options.backend != null; git diff --name-only reports 0 paths outside the literal allowlist entries."],"must_not_observe":["0 of 3 platforms passed, an empty heartbeat log (0 entries) for the run id, 0 restart entries in the adapter command file after the matrix, a missing or renamed export, or writes outside the allowlist."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The harness RED mode demonstrates the pre-fix post-stop stall (watchdog firing with the last heartbeat in the 'backend/stop/*' family (e.g. 'backend/stop/start') and 0 restart commands, or the recorded in-vitro equivalent), and GREEN shows every segment between the 'backend/stop/*' stop family and 'backend/restarted' bounded and heartbeated with named-segment fail-fast diagnostics. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`
- TC-2 → AC-2: The caller-handle web-only invocation completes the endpoint-loss sequence with >= 1 stop and >= 1 restart entry in the adapter command file and the web leg recorded 'passed'. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`
- TC-3 → AC-3: The --matrix ios,android,web run completes 3/3 under the caller handle, the preserved gates pass, and the diff is inside the allowlist. VERIFY: the four AC-3 commands.

### SHARED FIXTURES

```json
{"caller_adapter_watch":{"description":"A fresh isolated candidate with the real driver, a task-owned minimal caller-handle adapter (record/status/command files over the real backend server, spawned by the adapter and owned by it, matching the documented ORI-AI-002 pattern), and — for the matrix gate — the reserved iOS simulator and Android emulator with Expo Go and the pinned credentials available to the trusted backend.","seed_method":"cli","records":["RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1 (iPhone 17, iOS 26.3; canonical source: FIX-ORI-RN-003-2 session evidence) and RNR_S05_ANDROID_SERIAL=emulator-5554 must both be set for any native-including run; web-only runs skip reserveDevices; the pinned Expo Go 57.0.9 APK cache must be present or restorable; perform the documented simulator reboot/IME restore after marathon sessions.","Provider credentials reach only the trusted backend; the harness strips them from every other child exactly as the driver does. A higher maxOutputTokens on the adapter's launch options widens the Stop-control window (16384 proven versus the driver's 4096 default).","The watchdog budget is <= 900 s and recorded; every run binds its run id, commands, exits, adapter file paths, and the run-scoped heartbeat slice; heartbeat.log consumers filter by the run field because the file is append-only across runs; the harness's one real direct-backend mid-stream abort supplies the aborted correlation record because the web proxy never propagates client aborts."]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- tests/sprint-05-orient-search/support/live-example-proof.test.ts (MODIFY)
- tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts (NEW)
- tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-3/README.md (NEW)
- tests/sprint-05-orient-search/evidence/ORI-RN-004/run-manifest.json (MODIFY)
- tests/sprint-05-orient-search/evidence/ORI-RN-004/provider-correlation.json (MODIFY)
- tests/sprint-05-orient-search/evidence/ORI-RN-004/heartbeat.log (MODIFY)
- .tmp/FIX-ORI-RN-004-3/red.json (NEW)
- .tmp/FIX-ORI-RN-004-3/green.json (NEW)
- .tmp/FIX-ORI-RN-004-3/run.json (NEW)

The driver's full-matrix rerun additionally rewrites its own per-leg capture set under tests/sprint-05-orient-search/evidence/ORI-RN-004/ios/, .../android/, and .../web/ (screenshots, recordings, retry-state captures) and metro.log when native legs run; those regenerated captures are refreshed in place as driver side effects of the allowed commands and committed with the rerun — never deleted, never hand-edited. No other path may change.

writeProhibited:

- tests/sprint-05-orient-search/run-live-example-proof.mjs
- tests/sprint-05-orient-search/live-example-proof.ts
- tests/sprint-05-orient-search/live-example-proof.test.ts
- tests/sprint-05-orient-search/evidence/ORI-AI-002/**
- tests/sprint-05-orient-search/support/live-backend.ts
- tests/sprint-05-orient-search/support/native-session.ts
- tests/sprint-05-orient-search/support/nativewind-live-example.ts
- apps/**
- packages/**
- pnpm-lock.yaml
- .github/**
- .spec/**
- .kb-run-sprint/**
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- If isolation proves the stall's root cause lives in a shared support file (`support/live-backend.ts`, `support/native-session.ts`) or in ORI-AI-002's runner/adapter code, stop and report for a scope amendment rather than editing outside the allowlist.
- If the fix appears to require changing the OwnedBackendHandle contract, the runner's invocation shape, or any manifest schema key, escalate; this task must not force ORI-AI-002 code changes.
- Unavailable reserved devices, credentials, or the Expo Go prerequisite block execution; report the blocker, never substitute another target.

### DELIVERABLE

- `tests/sprint-05-orient-search/support/live-example-proof.test.ts`: per-segment bounded, heartbeated post-stop restart path with named-segment fail-fast diagnostics; root cause fixed at the stalled locus; consumed interface and additive exports unchanged.
- `tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`: the minimal caller-handle adapter harness (RED stall mode, GREEN web-leg mode, --matrix mode).
- `.tmp/FIX-ORI-RN-004-3/red.json`, `green.json`, `run.json` plus `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-3/README.md` (root-cause record), and refreshed driver side-effect outputs under `tests/sprint-05-orient-search/evidence/ORI-RN-004/`.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; run the exact selector pre-fix in RED mode; capture the stall as AC-1 specifies (the watchdog firing on the live caller-handle stall, or the recorded in-vitro equivalent over the real post-stop segment code — name which, with artifacts). Missing devices or tooling is a blocker, never functional RED; a source-absence note or authored flag is not RED. Wait for orchestrator verification of RED.
2. GREEN: apply the driver fix; rerun the identical selector; then run the --matrix three-platform gate and the preserved commands. REFACTOR only to keep the instrumentation clear; rerun affected proofs.
3. Hand the candidate and evidence to react-native-reusables-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `tests/sprint-05-orient-search/support/live-example-proof.test.ts` [PRIMARY TARGET] — `BackendSession.stop`/`restart`, `boundWait`, the `driveLiveWeb` endpoint-loss block between `session.stop()` and `session.restart()`, `runIosEndpointLossRetry`, the Android retry tail.
2. `.kb-run-sprint/sprint-05-orient-search/ORI-AI-002/cycle-3.blocked.json` — the restart-not-issued observation (run `ORI-AI-002-1789975643876`) and the adapter-shape documentation.
3. `tests/sprint-05-orient-search/support/live-backend.ts` — the OwnedBackendHandle interface the adapter must satisfy.
4. `TASK-FIX-ORI-RN-004-2.md` ## Handoff — the teardown-ownership rule, heartbeat semantics, manifest `completed` semantics, additive exports, and the await-point-only backstop concern.
5. `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-2/README.md` — the prior root-cause record and bounded-wait conventions.

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts
```

Preserved verification commands:

```sh
pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts --matrix ios,android,web
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/live-example-proof.test.ts tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts
```

Command contract: the matrix needs both reserved-device variables set and the Expo Go prerequisite; the provider credential reaches only the trusted backend (the adapter's server child and the driver's self-hosted path both keep it server-side). Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells (`Linter process terminated abnormally`); the working shapes are the righthook pre-commit and a clean-env invocation (env -i with explicit pnpm/node PATH) — prove a biome failure environmental before treating it as a gate failure. Do not rerun ORI-AI-002's suites as gates — they touch in-flight files and evidence outside this allowlist.

### EVIDENCE GATES

1. Prerequisites: reserved devices, Expo Go, credentials, the documented marathon-session reboot, and the isolated candidate established; the driver and its imports present at the recorded candidate SHA.
2. Functional RED: the exact selector in RED mode against the recorded pre-fix candidate; the stall captured as AC-1 specifies, with the invocation identity and the adapter file paths bound. Wait for orchestrator verification.
3. GREEN: the identical selector post-fix plus the --matrix three-platform gate (3/3 legs, adapter restart entries, manifest for the run identity), the AC-5 compiler case, and the static gates; the root cause recorded in the evidence and commit body.
4. Evidence: bind candidate source and harness hashes to exact commands, exits, run identity, watchdog budget, the run-scoped heartbeat slice, the adapter command/status file contents, and the refreshed manifest/correlation artifacts; stop only recorded children on every exit path. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, the named root cause, no stubs, exact scope compliance.

Planned evidence paths: .tmp/FIX-ORI-RN-004-3/red.json, .tmp/FIX-ORI-RN-004-3/green.json, .tmp/FIX-ORI-RN-004-3/run.json, tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-3/README.md. Teardown: stop only children recorded by this run's owned handles (the adapter stops its own initial child at teardown); release reservations; restore appearance; leave prior ORI-RN-004 evidence intact or refreshed.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. FLOW-DOCS-02-quickstart-chat-screen remains owned by ORI-CONT-004; the locked gate steps, human-flows.json, and gate-plan.json are unchanged; no flow evidence writes, no journey proofs.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-RN-004, FIX-ORI-RN-004-2 (both completed).

Blocks: ORI-AI-002's remaining GREEN — its re-dispatch consumes the fixed driver through the declared interface with no further work in its own files; indirectly ORI-CONT-004's Quickstart gate step 3.

Provides: a driver whose caller-backend stop→restart path completes with per-segment bounds and heartbeats; the caller-handle harness with captured RED/GREEN evidence.

Consumes: ORI-RN-004's driver and evidence surface; FIX-ORI-RN-004-2's bounded-lifecycle machinery (boundWait, heartbeats, StallError) and its additive exports; ORI-AI-001's `support/live-backend.ts` OwnedBackendHandle interface and backend/server code.

References: CAP-DOCS-01; UC-DOCS-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave11-add-caller-backend-restart-fix` (wave-11, sequence next); source task ORI-AI-002 (blocked cycle 3, commit d4938bb399f0a22e6760e07d49f50dbfea029754; report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-AI-002/cycle-3.blocked.json`, item ORI-AI-002:blocked:3:scope_impact:0); proposed by react-native-reusables-planner.

### OUT OF SCOPE

ORI-AI-002's runner, adapter, tests, and evidence (in flight); the shared support files and the OwnedBackendHandle contract; app and registry code; the nativewind driver (`support/nativewind-live-example.ts`); the six-target matrix's nativewind legs and vitest capture (ORI-AI-002's rerun); dependency or lockfile changes; journey proofs; planning policy edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: functional RED and GREEN bound to the real driver on the real stack through a real caller-handle adapter; the root cause named with isolation artifacts; every post-stop segment bounded and heartbeated with named-segment fail-fast diagnostics; the caller-handle web leg completes with the restart observed in the adapter command file; the --matrix three-platform run passes 3/3 with the preserved gates green; the consumed interface and additive exports unchanged; only allowed files change; no stub or fake success remains. Should verify: the harness's adapter shape matches ORI-AI-002's documented pattern so its re-dispatch lands clean first try; the heartbeat slice is emitted by the running driver, not authored; driver-fix completion is not presented as ORI-AI-002 acceptance. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-RN-004-3","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"caller_adapter_watch":{"description":"A fresh isolated candidate with the real driver, a task-owned minimal caller-handle adapter (record/status/command files over the real backend server, spawned by the adapter and owned by it, matching the documented ORI-AI-002 pattern), and — for the matrix gate — the reserved iOS simulator and Android emulator with Expo Go and the pinned credentials available to the trusted backend.","seed_method":"cli","records":["RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1 (iPhone 17, iOS 26.3; canonical source: FIX-ORI-RN-003-2 session evidence) and RNR_S05_ANDROID_SERIAL=emulator-5554 must both be set for any native-including run; web-only runs skip reserveDevices; the pinned Expo Go 57.0.9 APK cache must be present or restorable; perform the documented simulator reboot/IME restore after marathon sessions.","Provider credentials reach only the trusted backend; the harness strips them from every other child exactly as the driver does. A higher maxOutputTokens on the adapter's launch options widens the Stop-control window (16384 proven versus the driver's 4096 default).","The watchdog budget is <= 900 s and recorded; every run binds its run id, commands, exits, adapter file paths, and the run-scoped heartbeat slice; heartbeat.log consumers filter by the run field because the file is append-only across runs; the harness's one real direct-backend mid-stream abort supplies the aborted correlation record because the web proxy never propagates client aborts."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Bounded, heartbeated post-stop restart path with named-segment fail-fast","primary":true,"description":"GIVEN the instrumented driver and the minimal caller-handle adapter WHEN the harness replays the caller-handle endpoint-loss sequence under a <= 900 s watchdog THEN no segment between the stop family and the restart can idle or block indefinitely: the stop phase emits the boundWait-affixed literals 'backend/stop/start' then 'backend/stop/done' (stalled/error variants 'backend/stop/stalled'/'backend/stop/error'), 'backend/restarted' is an exact literal, matching is on that prefix family, and each segment emits its own heartbeat record and carries an explicit bound <= 120000 ms, and a stalled segment terminates with process exit code != 0 and a diagnostic naming the segment, the backend port 4000, the bound in ms, and the last heartbeat — never a silent 30-minute gap.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts","test_function":"runCallerBackendRestartProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts","test_tier":"integration","verification_service":"the real driver invoked through a real file/command caller-handle adapter over the real backend server and OpenAI Responses, under an explicit watchdog","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-RN-004-3-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real driver invoked through a real file/command caller-handle adapter over the real backend server and OpenAI Responses, under an explicit watchdog","negative_control":{"would_fail_if":["Any segment between the backend/stop/* family and backend/restarted remains unbounded or unheartbeated, a stall exits 0 or produces no named-segment diagnostic, or the diagnostic omits the port/bound/last-heartbeat values.","A mocked adapter fabricates the restart without the real server child, an authored heartbeat log stands in for the running driver, or the RED artifact contains 0 captured stall observations."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"caller_adapter_watch","action":{"actor":"cli_user","steps":["Pre-fix: run the harness RED mode — the caller-handle web leg under the watchdog — and capture the stall: watchdog exit code != 0 with the last heartbeat in the 'backend/stop/*' family (e.g. 'backend/stop/start'), 0 restart commands in the adapter's command file, and 0 heartbeats after the last 'backend/stop/*' entry for >= the watchdog window; or, if the live stall does not reproduce in the window, the in-vitro equivalent over the real post-stop segment code with the adapter, with the divergence recorded.","Apply the per-segment instrumentation and bounds; rerun the identical harness and confirm every segment between backend/stop and backend/restarted emits a heartbeat and each formerly silent segment now terminates within its bound or fails fast with the named-segment diagnostic.","Force a stall (or replay the in-vitro never-yielding segment) and read the diagnostic."]},"end_state":{"must_observe":["Pre-fix RED shows >= 1 segment after the last 'backend/stop/*' heartbeat neither completing nor firing any bound — watchdog exit code != 0, 0 restart commands in the adapter command file, 0 heartbeats after the last 'backend/stop/*' entry and 0 'backend/restarted' entries — with the invocation run id recorded in red.json.","Post-fix the heartbeat log for the run id contains the full ordered segment chain from 'backend/stop/start' through 'backend/stop/done' to 'backend/restarted' (exact literals; >= 3 entries) with 0 out-of-order timestamps, and every segment carries a bound <= 120000 ms visible in the driver source.","A forced stall terminates with process exit code != 0 and a diagnostic naming the segment, port 4000, boundMs, and lastHeartbeat within <= 120 s; no run idles past the <= 900 s watchdog."],"must_not_observe":["A silent gap with 0 heartbeats between the last 'backend/stop/*' entry and 'backend/restarted', a segment that outlives its bound without the diagnostic, an exit-0 stall, or diagnostics omitting the named values.","heartbeat entries between 'backend/stop/start' and 'backend/restarted' count (0) at GREEN, or an empty RED stall capture (0 observations in red.json)."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"The caller-handle web leg completes the endpoint-loss sequence","primary":false,"description":"GIVEN the fixed driver invoked through the minimal caller-handle adapter (real runLiveExampleProof, options.backend set, engine uniwind, platform web, fresh run identity) WHEN the web leg runs its endpoint-loss sequence THEN the adapter's command file records the stop AND the restart, the heartbeat log shows the literal steps 'backend/stop/start' then 'backend/stop/done' (the boundWait-affixed stop family) and 'backend/restarted' for the run id, and the manifest records the web leg passed.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts","test_function":"runCallerBackendRestartProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts","test_tier":"e2e","verification_service":"real expo export, real same-origin chat proxy, real headless Chromium, the real caller-handle adapter's backend server and OpenAI Responses (gpt-4.1-mini-2025-04-14)","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-RN-004-3-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real expo export, real same-origin chat proxy, real headless Chromium, the real caller-handle adapter's backend server and OpenAI Responses (gpt-4.1-mini-2025-04-14)","negative_control":{"would_fail_if":["The web leg stalls or is skipped, the restart is absent from the adapter's command file, the adapter or proxy path is mocked, or completion is claimed from a receipt instead of the observed stop→restart→retry round-trip."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"caller_adapter_watch","action":{"actor":"cli_user","steps":["Run the harness GREEN mode: adapter-created caller handle, real runLiveExampleProof invocation, platforms ['web'], fresh run identity, <= 900 s watchdog.","Observe the stop-turn, the 'backend/stop/start' then 'backend/stop/done' pair, the on-screen sanitized error and Retry control, backend/restarted, and the completed retry through the heartbeat log; read the adapter's command and status files.","Correlate the manifest's web-leg record and backend record set with the harness output."]},"end_state":{"must_observe":["The adapter command file contains >= 1 stop entry and >= 1 restart entry for the run id, and the heartbeat log contains the literal steps 'backend/stop/start' followed by 'backend/stop/done' and 'backend/restarted' with 0 gaps between them beyond the bounded segments.","A fresh run-manifest.json has run_id equal to this invocation's run id and legs[platform=='web'].status == 'passed' (literal; manifest.completed may legitimately be false for a single-platform run); provider-correlation.json carries the same run_id with >= 4 backend records — >= 3 outcome 'completed' and >= 1 outcome 'aborted', where the aborted record is the harness's own one real mid-stream client abort against the adapter's backend (recorded in green.json) because the web proxy does not propagate client aborts upstream and the driver's web leg alone yields only 'completed' records.","green.json records the literal command 'pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts', harness exit code 0, the run id, and options.backend != null for the caller-passed handle."],"must_not_observe":["0 restart commands in the adapter command file at GREEN, an empty provider-correlation record set — provider-correlation records count (0), a heartbeat log with 0 entries for the run id, or a hang past the <= 900 s watchdog."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Full matrix under a caller handle, regression gates, frozen interface","primary":false,"description":"GIVEN the fixed driver WHEN the harness runs the full exact three-platform matrix through the caller-provided handle THEN all three legs pass, the preserved gates hold, and the consumed interface — including the FIX-ORI-RN-004-2 additive exports — is unchanged.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts","test_function":"runCallerBackendRestartProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts --matrix ios,android,web","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus real Chromium, the caller-handle adapter's backend and OpenAI Responses, the real TypeScript compiler, and the real Biome linter","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-RN-004-3-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus real Chromium, the caller-handle adapter's backend and OpenAI Responses, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["Any platform regresses, the interface or additive-export surface drifts so ORI-AI-002's runner would need edits, the compiler case or static gates break, or the diff leaves the allowlist.","A mocked adapter fabricates leg outcomes without the real devices, browser, and provider, or a static shell of the matrix stands in for the real 3/3 run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"caller_adapter_watch","action":{"actor":"cli_user","steps":["Run the harness --matrix ios,android,web with the reserved devices and the documented marathon-session reboot; confirm 3/3 legs pass and the adapter command file shows the restart for each endpoint-loss leg.","Run the AC-5 compiler case, pnpm typecheck, and the scoped Biome command; prove any failure pre-existing with git stash && rerun before recording it.","Diff the driver against its pre-state; confirm the exported surface and schemas consumed by ORI-AI-002 are unchanged and the diff stays inside the allowlist."]},"end_state":{"must_observe":["The matrix completes with legs[].status == 'passed' for exactly 3/3 platforms, the adapter command file contains >= 3 restart entries (1 per endpoint-loss leg) for the run id, and run-manifest.json run_id equals the harness run id.","The AC-5 compiler case passes; pnpm typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record.","The consumed interface is unchanged: the CLI accepts exactly the literal flags --platforms and --case, the additive exports serveWithChatProxy, stopServer, BackendSession, StallError, heartbeatRecords, and HeartbeatEntry remain present with behavior-identical signatures, green.json records options.backend != null; git diff --name-only reports 0 paths outside the literal allowlist entries."],"must_not_observe":["0 of 3 platforms passed, an empty heartbeat log (0 entries) for the run id, 0 restart entries in the adapter command file after the matrix, a missing or renamed export, or writes outside the allowlist."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The harness RED mode demonstrates the pre-fix post-stop stall (watchdog firing with the last heartbeat in the 'backend/stop/*' family (e.g. 'backend/stop/start') and 0 restart commands, or the recorded in-vitro equivalent), and GREEN shows every segment between the 'backend/stop/*' stop family and 'backend/restarted' bounded and heartbeated with named-segment fail-fast diagnostics.","verify":"pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The caller-handle web-only invocation completes the endpoint-loss sequence with >= 1 stop and >= 1 restart entry in the adapter command file and the web leg recorded 'passed'.","verify":"pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The --matrix ios,android,web run completes 3/3 under the caller handle, the preserved gates pass, and the diff is inside the allowlist.","verify":"pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts --matrix ios,android,web","maps_to_ac":"AC-3"}]}
-->
</details>
