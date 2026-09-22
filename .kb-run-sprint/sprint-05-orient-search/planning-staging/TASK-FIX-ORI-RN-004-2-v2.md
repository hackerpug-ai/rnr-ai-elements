# FIX-ORI-RN-004-2: Make the Uniwind live-proof driver's web leg complete under orchestration

## What this does

Isolates and fixes the indefinite stall in the ORI-RN-004-owned Uniwind live-proof driver (`tests/sprint-05-orient-search/support/live-example-proof.test.ts`) that blocks ORI-AI-002's six-target matrix. Observed in run `ORI-AI-002-1789929365070`: the driver, invoked by ORI-AI-002's runner through the real `runLiveExampleProof` export with a caller-owned backend handle for `--platforms ios,android,web`, passed its ios and android legs (android/dark screenshot 19:14:06 UTC), then stalled forever — no chromium/expo/adb/maestro child alive, no live `run-manifest.json`, caller idle 45+ minutes with an idle event loop.

Code facts at main `cf02a240`: the driver's web-leg path contains awaits with no bound — `serveWithChatProxy` resolves only on the proxy server's `listening` event, `stopServer` awaits `server.close(callback)` (which Node completes only after every connection to the proxy has ended; an idle keep-alive socket or a never-terminating proxied SSE stream blocks it forever), `browser.close()` is awaited unbounded — and no step of the ios→android→web sequence emits a heartbeat or carries a wall-clock budget, so one unbounded await presents exactly as observed: a silent, childless, manifest-less idle. The blocked report names two isolation hypotheses: a web-leg wait on a condition the orchestration's dist/port state never satisfies, or a reaper-deleted prerequisite inside the leg. The fix must bound and heartbeat every leg-phase wait, fail fast with a diagnostic naming the stalled step, and record the isolated root cause — while leaving the `runLiveExampleProof` / `options.backend` (OwnedBackendHandle) seam contract-identical for ORI-AI-002's runner.

## Why

ORI-AI-002's cycle-2 blocked report (commit `44ffda8a`, report sha256 `c08d7220…`) root-caused and fixed five defects in its own runner and proved all five uniwind live legs green with recording on; the only remaining blocker is this driver-internal stall, and the driver is write-prohibited to ORI-AI-002. The same driver completed 3/3 platforms standalone (ORI-RN-004 final GREEN `ORI-RN-004-C3F-1789744559`) and its web leg passed standalone in FIX-ORI-RN-004-1's proofs — the failure is specific to the orchestrated three-platform sequence with a caller-passed backend, so no amount of ORI-AI-002-side work can unblock it. ORI-RN-004 is completed; no pending task owns the driver. Once the web leg completes under orchestration, ORI-AI-002's already-committed runner can execute the full matrix and capture vitest GREEN with no further work in its own files.

## How to verify

```sh
pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/live-example-proof.test.ts
```

The first command is the task-owned orchestration harness: it invokes the real driver exactly as ORI-AI-002's runner does (caller-created owned-backend handle, single process, watchdog) and asserts the web leg completes and writes the live manifest. The second is the exact full three-platform driver matrix — the integration gate. The rest are regression and static gates.

## Scope

Own the driver fix and its bounded evidence. On-device app behavior, the ORI-AI-002 runner, the shared support files, and every in-flight file stay untouched; the fixed driver is consumed by ORI-AI-002's cycle-3 re-dispatch through its declared interface.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: Backlog

> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 3 · Type: FIX
> Dependency phase: after ORI-RN-004 and ORI-AI-001
> Proposed By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-20
> Source SHA: cf02a2402dfa92a89cae747e1774ee062b2ac881

AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROGRESS: 0/3 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

The Uniwind live-proof driver completes its live-phase web leg under orchestration — real export, real same-origin proxy, real Chromium, real provider round-trip, live run-manifest written — with every leg-phase await bounded and heartbeated so a stalled condition fails fast with a named-step diagnostic instead of an idle hang, and with the `runLiveExampleProof` / `options.backend` interface contract-identical to what ORI-AI-002's runner already consumes.

### CRITICAL CONSTRAINTS — Never

- Never substitute a mocked browser, mocked export, mocked proxy, stub backend, canned stream, or skipped platform for the real web-leg path; the proof is a real served export round-trip against the real owned backend and OpenAI Responses.
- Never change the consumed interface: `runLiveExampleProof`'s exported signature and options (including `options.backend: OwnedBackendHandle`), the `--platforms` / `--case` CLI behavior, the `run-manifest.json` / `provider-correlation.json` schemas, and the BackendSession restart semantics stay contract-compatible with ORI-AI-002's runner (its charter's boundary contracts 9 and 10). No renaming, no new required options, no forced ORI-AI-002 code change.
- Never silence or weaken an existing oracle to make the leg pass; a watchdog that only kills the hang without identifying the locus is an incomplete fix, not a GREEN.
- Never write outside the exact allowlist; never edit ORI-AI-002's in-flight files, the shared support files (`support/live-backend.ts`, `support/native-session.ts`, `support/nativewind-live-example.ts`), app code, or prior ORI-RN-004 evidence beyond the driver's own side-effect outputs.
- Never expose provider credentials beyond the trusted launcher/backend; strip them from spawned children and evidence exactly as the driver already does.
- Never treat missing devices, credentials, or the Expo Go prerequisite as a passing skip; fail closed and record the blocker.

### DONE WHEN

- [ ] AC-1 proves every leg-phase await is bounded and heartbeated, with fail-fast diagnostics naming the stalled step.
- [ ] AC-2 proves the web leg completes under the orchestration seam and writes the live manifest.
- [ ] AC-3 proves no regression: the exact three-platform matrix passes 3/3, the AC-5 compiler case passes, static gates hold, and the consumed interface is unchanged.
- [ ] The exact selector and preserved commands pass; independent review confirms functional RED, seeded evidence, the recorded root cause, and no stubs.

### SPECIFICATION

Instrument-and-bound fix in the driver plus a task-owned orchestration harness. The harness reproduces ORI-AI-002's invocation shape at this task's dependency position: a caller-created owned-backend handle from the real `support/live-backend.ts`, the real `runLiveExampleProof` export through the repository tsx runtime, a single process, and an explicit watchdog budget — never a reimplementation of the runner.

### BOUNDARY CONTRACTS

1. Primary fix location: `tests/sprint-05-orient-search/support/live-example-proof.test.ts`. Add per-phase heartbeat records for the leg pipeline (leg start/end and every phase transition, with step name and timestamp, appended to a task-evidence log and the console); give every await an explicit bound — including the proxy-server lifecycle (`serveWithChatProxy`'s listen and `stopServer`'s `close`, using Node's `closeIdleConnections()`/`closeAllConnections()` or an explicit deadline) and `browser.close()` — and add a per-leg wall-clock budget that fails fast with a diagnostic naming the stalled step, the port, and the last heartbeat. Web-leg heartbeat granularity must yield >= 8 entries per web-leg run; per-wait bounds are <= 120000 ms; the harness watchdog budget is <= 900 s per leg.
2. Root-cause record: the evidence must name the concrete stalled await (or the concrete environmental deletion, if the reaper hypothesis proves out) with artifacts from the isolation run; the commit body records it. Detection-plus-timeout without identification is incomplete.
3. Interface freeze: the exports, options, CLI flags, manifest and correlation schemas, and restart semantics listed in CRITICAL CONSTRAINTS stay byte-compatible in behavior; ORI-AI-002's committed runner must invoke the fixed driver unchanged.
4. Harness `.tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts` exports `runWebLegOrchestrationProof`: create the owned backend through the real `support/live-backend.ts` handle; invoke the real `runLiveExampleProof` with `platforms: ['web']`, engine uniwind, a fresh run identity, and a bounded output directory, under an explicit <= 900 s watchdog; assert the web leg completes, the heartbeat log covers >= 8 web-leg steps in order, and a fresh `run-manifest.json` plus `provider-correlation.json` are written for the run; for RED, replay the orchestration shape (three-platform sequence when reserved devices are available; the web-phase watchdog otherwise) and capture the pre-fix unbounded behavior; emit bounded JSON evidence and stop only recorded children on every exit path. Real services only.
5. Prerequisites: `RNR_S05_IOS_UDID` and `RNR_S05_ANDROID_SERIAL` must both be set for any native-including run (`reserveDevices` requires both even for single-platform runs — recorded ORI-RN-004 finding); the pinned Expo Go APK cache must be present or restorable. Missing prerequisites block execution.
6. Evidence side effects: the driver unconditionally writes `run-manifest.json`, `provider-correlation.json`, `metro.log`, and per-leg captures into `tests/sprint-05-orient-search/evidence/ORI-RN-004/` — that directory is write-allowed for these side effects only; the commit must leave it consistent (refreshed artifacts from the GREEN run, or explicitly restored), never half-written, and never delete prior ORI-RN-004 evidence.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. All criteria run the real driver on the real stack.

#### AC-1: Bounded, heartbeated leg pipeline with named-step fail-fast [PRIMARY]

GIVEN the instrumented driver WHEN the orchestration harness replays ORI-AI-002's invocation shape under a watchdog THEN no await in the ios→android→web pipeline can idle indefinitely: every leg phase and phase transition emits a heartbeat record, every lifecycle wait (proxy listen, server close, browser close) carries an explicit bound, and a stalled condition terminates nonzero with a diagnostic naming the exact step, port, and last heartbeat instead of an idle hang.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real driver invoked with a real caller-created owned-backend handle over the real export/proxy/Chromium path under an explicit watchdog
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts
- TEST_FUNCTION: runWebLegOrchestrationProof
- VERIFY: `pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-RN-004-2-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real driver invoked with a real caller-created owned-backend handle over the real export/proxy/Chromium path under an explicit watchdog","negative_control":{"would_fail_if":["Any leg-phase await remains unbounded, the watchdog observes a silent gap with no heartbeat, a stall exits 0 or produces no named-step diagnostic, or the heartbeat records are authored rather than emitted by the running driver.","An empty heartbeat log (0 entries) or a static authored log stands in for the running driver, a mocked proxy/export/browser path replaces the real web leg, or the RED artifact contains 0 captured unbounded-wait observations."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"webleg_orchestration_watch","action":{"actor":"cli_user","steps":["Pre-fix: run the harness watchdog over the orchestration-shaped invocation and capture the unbounded behavior — either the watchdog fires on the reproduced stall (no manifest, stuck phase named by the harness) or the harness reproduces the unbounded lifecycle wait in isolation over the real serveWithChatProxy/stopServer code with a real open connection; record which, with artifacts.","Apply the instrumentation and bounds; rerun the identical harness and confirm every phase emits a heartbeat and each formerly unbounded wait now terminates within its bound or fails fast with the named-step diagnostic.","Inspect the in-vitro lifecycle demonstration and the heartbeat log against the driver source."]},"end_state":{"must_observe":["Pre-fix RED shows >= 1 unbounded await on the leg path demonstrated live — the watchdog firing with harness exit code != 0 and 0 run-manifest.json write for the run id, or an in-vitro close/listen over the real serveWithChatProxy/stopServer code still unresolved after >= 60 s with a real open connection — with the invocation run id recorded in red.json.","Post-fix the web-leg heartbeat log contains >= 8 timestamped entries with 0 out-of-order timestamps, and every formerly unbounded wait (proxy listen on port 8406, proxy server close, browser close) carries an explicit bound <= 120000 ms visible in the driver source and exercised by the harness.","A forced stall (or the in-vitro open-connection case) terminates with process exit code != 0 and a diagnostic naming the stalled step, the port (8406 for the web proxy), and the last heartbeat timestamp; no run idles past the <= 900 s watchdog."],"must_not_observe":["A silent gap with no heartbeat, an unbounded server.close/browser.close/listen wait, an exit-0 stall, or diagnostics that omit the stalled step's identity."]}}]}
```

#### AC-2: The web leg completes under the orchestration seam and writes the live manifest

GIVEN the fixed driver invoked exactly as ORI-AI-002's runner invokes it (real `runLiveExampleProof`, caller-created owned-backend handle, engine uniwind, platform web, fresh run identity, bounded output directory) WHEN the web leg runs THEN it completes end to end — real `expo export`, real same-origin proxy, real Chromium, real provider round-trip — and the driver writes a fresh `run-manifest.json` recording the web leg passed plus a refreshed `provider-correlation.json` for the same run identity.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: real expo export, real same-origin chat proxy, real headless Chromium, real owned backend and OpenAI Responses (gpt-4.1-mini-2025-04-14)
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts
- TEST_FUNCTION: runWebLegOrchestrationProof
- VERIFY: `pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-RN-004-2-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real expo export, real same-origin chat proxy, real headless Chromium, real owned backend and OpenAI Responses (gpt-4.1-mini-2025-04-14)","negative_control":{"would_fail_if":["The web leg stalls or is skipped, the manifest is absent or stale (wrong run identity), the proxy or browser path is mocked, or completion is claimed from a receipt instead of the observed round-trip."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"webleg_orchestration_watch","action":{"actor":"cli_user","steps":["Run the harness: caller-created owned-backend handle, real runLiveExampleProof invocation, platforms ['web'], fresh run identity, watchdog budget.","Observe the export, proxy serve, Chromium drive, and provider round-trip through the heartbeat log; confirm the run-manifest.json and provider-correlation.json writes for this run identity.","Correlate the manifest's web-leg record and backend record set with the harness's observed output."]},"end_state":{"must_observe":["The web leg completes within the <= 900 s watchdog budget with >= 8 ordered heartbeat entries (0 out-of-order timestamps) covering export, proxy listen on 127.0.0.1:8406, Chromium launch, the drive steps, and teardown.","A fresh run-manifest.json has run_id equal to this invocation's run id, a web leg entry with status 'passed' (literal) and completed == true for the platforms run; provider-correlation.json carries the same run_id with >= 4 backend records — >= 3 outcome 'completed' and >= 1 outcome 'aborted'.","green.json records the literal command 'pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts', harness exit code 0, the run id, and options.backend != null for the caller-passed handle."],"must_not_observe":["A missing or stale manifest, a mocked export/proxy/browser path, a skipped web leg, or a hang past the <= 900 s watchdog.","run-manifest web-leg entries count (0), an empty provider-correlation record set (0 records for the run id), or a heartbeat log with 0 entries at completion."]}}]}
```

#### AC-3: No regression — full matrix, compiler case, static gates, frozen interface

GIVEN the fixed driver WHEN the exact three-platform command and the preserved gates run THEN ios/android/web all pass with the manifest recording 3/3 completed, the AC-5 compiler case still passes, `pnpm typecheck` and the scoped Biome command exit 0 (or a failure is proven pre-existing with the AGENTS.md `git stash && rerun` proof and recorded), and the consumed interface — `runLiveExampleProof` options including `backend`, the `--platforms`/`--case` CLI, the manifest and correlation schemas — is unchanged so ORI-AI-002's committed runner invokes the driver without modification.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: real Expo Go on the reserved iOS simulator and Android emulator plus real Chromium, the real owned backend and OpenAI Responses, the real TypeScript compiler, and the real Biome linter
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/support/live-example-proof.test.ts
- TEST_FUNCTION: runLiveExampleProof + runLiveImportGraphCompiler
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web` · `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler` · `pnpm typecheck` · `pnpm exec biome ci tests/sprint-05-orient-search/support/live-example-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-RN-004-2-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus real Chromium, the real owned backend and OpenAI Responses, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["Any platform regresses, the compiler case or static gates break, the interface drifts so ORI-AI-002's runner would need edits, or the diff leaves the allowlist."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"webleg_orchestration_watch","action":{"actor":"cli_user","steps":["Run the exact three-platform driver command with the reserved devices and appearance restore; confirm 3/3 legs pass and the manifest records them for this run identity.","Run the AC-5 compiler case, pnpm typecheck, and the scoped Biome command; prove any failure pre-existing with git stash && rerun before recording it.","Diff the driver against its pre-state; confirm the exported surface and schemas consumed by ORI-AI-002 are unchanged and the diff stays inside the allowlist."]},"end_state":{"must_observe":["The three-platform run passes ios, android and web with heartbeat logs for each phase and a manifest recording 3/3 completed for this run identity.","The AC-5 compiler case passes; typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record.","The consumed interface is unchanged (export signature, options.backend, CLI flags, manifest/correlation schemas); git diff --name-only lists only allowlisted paths."],"must_not_observe":["A regressed platform, a weakened oracle, interface drift, or writes outside the allowlist.","0 of 3 platforms passed, an empty heartbeat log (0 entries) for any leg, or a run-manifest recording passed_platforms == 0."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The harness demonstrates the pre-fix unbounded behavior (watchdog firing or in-vitro unbounded lifecycle wait over the real server code), then shows every leg-phase await bounded and heartbeated post-fix with named-step fail-fast diagnostics. VERIFY: `pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts`
- TC-2 → AC-2: The orchestration-shaped web-only invocation completes against the caller-owned backend and writes a fresh run-manifest.json plus provider-correlation.json for the run identity. VERIFY: `pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts`
- TC-3 → AC-3: The exact three-platform matrix passes 3/3, the AC-5 compiler case passes, static gates hold, the interface is unchanged, and the diff is inside the allowlist. VERIFY: the four AC-3 commands.

### SHARED FIXTURES

```json
{"webleg_orchestration_watch":{"description":"A fresh isolated candidate with the real driver, a caller-created owned-backend handle from support/live-backend.ts, and — for the full-matrix gate — the reserved iOS simulator and Android emulator with Expo Go and the pinned credentials available to the trusted backend.","seed_method":"cli","records":["RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL must both be set for any native-including run; the pinned Expo Go 57.0.9 APK cache must be present or restorable (ORI-RN-003 evidence documents the official release source).","Provider credentials reach only the trusted backend; the harness strips them from every other child exactly as the driver does.","The watchdog budget is explicit and recorded; every run binds its run identity, commands, exits, and heartbeat log."]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- tests/sprint-05-orient-search/support/live-example-proof.test.ts
- tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-2/**
- tests/sprint-05-orient-search/evidence/ORI-RN-004/** (driver side-effect outputs only: run-manifest.json, provider-correlation.json, metro.log, web/ and per-leg captures — refreshed or restored, never deletions of prior evidence)
- .tmp/FIX-ORI-RN-004-2/**

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

- If isolation proves the stall's root cause lives in a shared support file (`support/live-backend.ts`, `support/native-session.ts`) or in ORI-AI-002's runner files, stop and report for a scope amendment rather than editing outside the allowlist.
- If the fix appears to require changing the OwnedBackendHandle contract, the runner's invocation shape, or any manifest schema key, escalate; this task must not force ORI-AI-002 code changes.
- Unavailable reserved devices, credentials, or the Expo Go prerequisite block execution; report the blocker, never substitute another target.

### DELIVERABLE

- `tests/sprint-05-orient-search/support/live-example-proof.test.ts`: bounded, heartbeated leg pipeline with named-step fail-fast diagnostics; root cause fixed at the stall locus; consumed interface unchanged.
- `.tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts` plus red.json, green.json, heartbeat logs, and run.json.
- Refreshed (or explicitly restored) driver side-effect outputs under `tests/sprint-05-orient-search/evidence/ORI-RN-004/` and bounded evidence under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-2/`.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; run the exact selector pre-fix; capture the unbounded behavior as specified in AC-1 (a watchdog firing on the reproduced stall, or the in-vitro unbounded lifecycle wait over the real proxy/server code with a real open connection). Missing devices or tooling is a blocker, never functional RED; a source-absence note or authored flag is not RED. Wait for orchestrator verification of RED.
2. GREEN: apply the driver fix; rerun the identical selector; then run the full three-platform matrix and the preserved gates. REFACTOR only to keep the instrumentation clear; rerun affected proofs.
3. Hand the candidate and evidence to react-native-reusables-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `tests/sprint-05-orient-search/support/live-example-proof.test.ts` [PRIMARY TARGET] — `runAllLegs`, `runWebLeg`, `exportExampleWeb`, `serveWithChatProxy`, `stopServer`, `launchChromiumBrowser`, `writeManifest`.
2. `.kb-run-sprint/sprint-05-orient-search/ORI-AI-002/cycle-2.blocked.json` — the stall observation (run `ORI-AI-002-1789929365070`) and the two isolation hypotheses.
3. `tests/sprint-05-orient-search/support/live-backend.ts` — the OwnedBackendHandle seam that must keep working.
4. `.spec/prds/docs-site/tasks/sprint-05-orient-search/ORI-AI-002-prove-the-composed-worked-example-against-the-real-provider.md` — boundary contracts 9 and 10 (the invocation seam to preserve).
5. `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/README.md` — the prior driver-fix conventions and the ORI-RN-004 evidence side-effect note.

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts
```

Preserved verification commands:

```sh
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/live-example-proof.test.ts
```

Command contract: the full matrix needs both reserved device variables set and the Expo Go prerequisite; the provider credential reaches only the trusted backend (the harness's caller-created handle and the driver's self-hosted path both keep it server-side). Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells (`Linter process terminated abnormally` — recorded environmental finding); the righthook pre-commit and clean-env invocations work, so prove a biome failure environmental before treating it as a gate failure. Do not rerun ORI-AI-002's suites as gates — they touch in-flight files and evidence outside this allowlist.

### EVIDENCE GATES

1. Prerequisites: reserved devices, Expo Go, credentials, and the isolated candidate established; the driver and its imports present at the recorded candidate SHA.
2. Functional RED: the exact selector against the recorded pre-fix candidate; the unbounded behavior captured as AC-1 specifies, with the invocation identity bound. Wait for orchestrator verification.
3. GREEN: the identical selector post-fix plus the exact three-platform matrix (3/3 legs, manifest for the run identity), the AC-5 compiler case, and the static gates; the root cause recorded in the evidence and commit body.
4. Evidence: bind candidate source and harness hashes to exact commands, exits, run identity, watchdog budget, heartbeat logs, and the refreshed manifest/correlation artifacts; stop only recorded children on every exit path. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, the named root cause, no stubs, exact scope compliance.

Planned evidence paths: .tmp/FIX-ORI-RN-004-2/red.json, .tmp/FIX-ORI-RN-004-2/green.json, .tmp/FIX-ORI-RN-004-2/heartbeat.log, .tmp/FIX-ORI-RN-004-2/run.json, tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-2/README.md. Teardown: stop only children recorded by this run's owned handles; release reservations; restore appearance; leave prior ORI-RN-004 evidence intact or refreshed.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. FLOW-DOCS-02-quickstart-chat-screen remains owned by ORI-CONT-004; the locked gate steps, human-flows.json, and gate-plan.json are unchanged; no flow evidence writes, no journey proofs.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-RN-004, ORI-AI-001 (both completed).

Blocks: ORI-AI-002's remaining GREEN — its cycle-3 re-dispatch consumes the fixed driver through the declared interface with no further work in its own files; indirectly ORI-CONT-004's Quickstart gate step 3.

Provides: a Uniwind live-proof driver whose web leg completes under orchestration with bounded, heartbeated leg phases; the orchestration harness with captured RED/GREEN evidence under `.tmp/FIX-ORI-RN-004-2/`.

Consumes: ORI-RN-004's driver and evidence surface; ORI-AI-001's `support/live-backend.ts` owned-backend handle and backend/server code.

References: CAP-DOCS-01; UC-DOCS-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave10-add-uniwind-webleg-stall-fix` (wave-10, sequence next); source task ORI-AI-002 (blocked cycle 2, commit 44ffda8ac87d50c937c16720a057f3853c9dfca7; report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-AI-002/cycle-2.blocked.json`, sha256 c08d72201b6422e74fa87d366e6c43b6806ab91d5ec6e4b09d8a00cb81b29bb8); proposed by react-native-reusables-planner.

### OUT OF SCOPE

ORI-AI-002's runner, tests, and evidence (in flight); the shared support files and the OwnedBackendHandle contract; app and registry code; the nativewind driver (`support/nativewind-live-example.ts`); the six-target matrix's nativewind legs and vitest capture (ORI-AI-002's rerun); dependency or lockfile changes; journey proofs; planning policy edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: functional RED and GREEN bound to the real driver on the real stack; the root cause named with isolation artifacts; every leg-phase await bounded and heartbeated with named-step fail-fast diagnostics; the web leg completes under the caller-owned-backend seam and writes the live manifest; the full matrix passes 3/3 with the compiler case and static gates green; the consumed interface unchanged; only allowed files change; no stub or fake success remains. Should verify: the harness's invocation shape matches ORI-AI-002's runner so its cycle-3 rerun lands clean first try; the heartbeat log is emitted by the running driver, not authored; driver-fix completion is not presented as ORI-AI-002 acceptance. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-RN-004-2","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"webleg_orchestration_watch":{"description":"A fresh isolated candidate with the real driver, a caller-created owned-backend handle from support/live-backend.ts, and — for the full-matrix gate — the reserved iOS simulator and Android emulator with Expo Go and the pinned credentials available to the trusted backend.","seed_method":"cli","records":["RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL must both be set for any native-including run; the pinned Expo Go 57.0.9 APK cache must be present or restorable (ORI-RN-003 evidence documents the official release source).","Provider credentials reach only the trusted backend; the harness strips them from every other child exactly as the driver does.","The watchdog budget is explicit and recorded; every run binds its run identity, commands, exits, and heartbeat log."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Bounded, heartbeated leg pipeline with named-step fail-fast","primary":true,"description":"GIVEN the instrumented driver WHEN the orchestration harness replays ORI-AI-002's invocation shape under a watchdog THEN no await in the ios→android→web pipeline can idle indefinitely: every leg phase and phase transition emits a heartbeat record, every lifecycle wait (proxy listen, server close, browser close) carries an explicit bound, and a stalled condition terminates nonzero with a diagnostic naming the exact step, port, and last heartbeat instead of an idle hang.","flow_ref":null,"test_file":".tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts","test_function":"runWebLegOrchestrationProof","verify":"pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts","test_tier":"integration","verification_service":"the real driver invoked with a real caller-created owned-backend handle over the real export/proxy/Chromium path under an explicit watchdog","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-RN-004-2-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real driver invoked with a real caller-created owned-backend handle over the real export/proxy/Chromium path under an explicit watchdog","negative_control":{"would_fail_if":["Any leg-phase await remains unbounded, the watchdog observes a silent gap with no heartbeat, a stall exits 0 or produces no named-step diagnostic, or the heartbeat records are authored rather than emitted by the running driver.","An empty heartbeat log (0 entries) or a static authored log stands in for the running driver, a mocked proxy/export/browser path replaces the real web leg, or the RED artifact contains 0 captured unbounded-wait observations."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"webleg_orchestration_watch","action":{"actor":"cli_user","steps":["Pre-fix: run the harness watchdog over the orchestration-shaped invocation and capture the unbounded behavior — either the watchdog fires on the reproduced stall (no manifest, stuck phase named by the harness) or the harness reproduces the unbounded lifecycle wait in isolation over the real serveWithChatProxy/stopServer code with a real open connection; record which, with artifacts.","Apply the instrumentation and bounds; rerun the identical harness and confirm every phase emits a heartbeat and each formerly unbounded wait now terminates within its bound or fails fast with the named-step diagnostic.","Inspect the in-vitro lifecycle demonstration and the heartbeat log against the driver source."]},"end_state":{"must_observe":["Pre-fix RED shows >= 1 unbounded await on the leg path demonstrated live — the watchdog firing with harness exit code != 0 and 0 run-manifest.json write for the run id, or an in-vitro close/listen over the real serveWithChatProxy/stopServer code still unresolved after >= 60 s with a real open connection — with the invocation run id recorded in red.json.","Post-fix the web-leg heartbeat log contains >= 8 timestamped entries with 0 out-of-order timestamps, and every formerly unbounded wait (proxy listen on port 8406, proxy server close, browser close) carries an explicit bound <= 120000 ms visible in the driver source and exercised by the harness.","A forced stall (or the in-vitro open-connection case) terminates with process exit code != 0 and a diagnostic naming the stalled step, the port (8406 for the web proxy), and the last heartbeat timestamp; no run idles past the <= 900 s watchdog."],"must_not_observe":["A silent gap with no heartbeat, an unbounded server.close/browser.close/listen wait, an exit-0 stall, or diagnostics that omit the stalled step's identity."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"The web leg completes under the orchestration seam and writes the live manifest","primary":false,"description":"GIVEN the fixed driver invoked exactly as ORI-AI-002's runner invokes it (real runLiveExampleProof, caller-created owned-backend handle, engine uniwind, platform web, fresh run identity, bounded output directory) WHEN the web leg runs THEN it completes end to end — real expo export, real same-origin proxy, real Chromium, real provider round-trip — and the driver writes a fresh run-manifest.json recording the web leg passed plus a refreshed provider-correlation.json for the same run identity.","flow_ref":null,"test_file":".tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts","test_function":"runWebLegOrchestrationProof","verify":"pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts","test_tier":"e2e","verification_service":"real expo export, real same-origin chat proxy, real headless Chromium, real owned backend and OpenAI Responses (gpt-4.1-mini-2025-04-14)","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-RN-004-2-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real expo export, real same-origin chat proxy, real headless Chromium, real owned backend and OpenAI Responses (gpt-4.1-mini-2025-04-14)","negative_control":{"would_fail_if":["The web leg stalls or is skipped, the manifest is absent or stale (wrong run identity), the proxy or browser path is mocked, or completion is claimed from a receipt instead of the observed round-trip."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"webleg_orchestration_watch","action":{"actor":"cli_user","steps":["Run the harness: caller-created owned-backend handle, real runLiveExampleProof invocation, platforms ['web'], fresh run identity, watchdog budget.","Observe the export, proxy serve, Chromium drive, and provider round-trip through the heartbeat log; confirm the run-manifest.json and provider-correlation.json writes for this run identity.","Correlate the manifest's web-leg record and backend record set with the harness's observed output."]},"end_state":{"must_observe":["The web leg completes within the <= 900 s watchdog budget with >= 8 ordered heartbeat entries (0 out-of-order timestamps) covering export, proxy listen on 127.0.0.1:8406, Chromium launch, the drive steps, and teardown.","A fresh run-manifest.json has run_id equal to this invocation's run id, a web leg entry with status 'passed' (literal) and completed == true for the platforms run; provider-correlation.json carries the same run_id with >= 4 backend records — >= 3 outcome 'completed' and >= 1 outcome 'aborted'.","green.json records the literal command 'pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts', harness exit code 0, the run id, and options.backend != null for the caller-passed handle."],"must_not_observe":["A missing or stale manifest, a mocked export/proxy/browser path, a skipped web leg, or a hang past the <= 900 s watchdog.","run-manifest web-leg entries count (0), an empty provider-correlation record set (0 records for the run id), or a heartbeat log with 0 entries at completion."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"No regression — full matrix, compiler case, static gates, frozen interface","primary":false,"description":"GIVEN the fixed driver WHEN the exact three-platform command and the preserved gates run THEN ios/android/web all pass with the manifest recording 3/3 completed, the AC-5 compiler case still passes, pnpm typecheck and the scoped Biome command exit 0 (or a failure is proven pre-existing with the AGENTS.md git stash && rerun proof and recorded), and the consumed interface — runLiveExampleProof options including backend, the --platforms/--case CLI, the manifest and correlation schemas — is unchanged so ORI-AI-002's committed runner invokes the driver without modification.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof + runLiveImportGraphCompiler","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus real Chromium, the real owned backend and OpenAI Responses, the real TypeScript compiler, and the real Biome linter","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-RN-004-2-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus real Chromium, the real owned backend and OpenAI Responses, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["Any platform regresses, the compiler case or static gates break, the interface drifts so ORI-AI-002's runner would need edits, or the diff leaves the allowlist."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"webleg_orchestration_watch","action":{"actor":"cli_user","steps":["Run the exact three-platform driver command with the reserved devices and appearance restore; confirm 3/3 legs pass and the manifest records them for this run identity.","Run the AC-5 compiler case, pnpm typecheck, and the scoped Biome command; prove any failure pre-existing with git stash && rerun before recording it.","Diff the driver against its pre-state; confirm the exported surface and schemas consumed by ORI-AI-002 are unchanged and the diff stays inside the allowlist."]},"end_state":{"must_observe":["The three-platform run passes ios, android and web with heartbeat logs for each phase and a manifest recording 3/3 completed for this run identity.","The AC-5 compiler case passes; typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record.","The consumed interface is unchanged (export signature, options.backend, CLI flags, manifest/correlation schemas); git diff --name-only lists only allowlisted paths."],"must_not_observe":["A regressed platform, a weakened oracle, interface drift, or writes outside the allowlist.","0 of 3 platforms passed, an empty heartbeat log (0 entries) for any leg, or a run-manifest recording passed_platforms == 0."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The harness demonstrates the pre-fix unbounded behavior (watchdog firing or in-vitro unbounded lifecycle wait over the real server code), then shows every leg-phase await bounded and heartbeated post-fix with named-step fail-fast diagnostics.","verify":"pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The orchestration-shaped web-only invocation completes against the caller-owned backend and writes a fresh run-manifest.json plus provider-correlation.json for the run identity.","verify":"pnpm exec tsx .tmp/FIX-ORI-RN-004-2/web-leg-orchestration-proof.ts","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The exact three-platform matrix passes 3/3, the AC-5 compiler case passes, static gates hold, the interface is unchanged, and the diff is inside the allowlist.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","maps_to_ac":"AC-3"}]}
-->
</details>
