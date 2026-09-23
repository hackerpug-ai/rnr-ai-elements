# FIX-ORI-AI-002-1: Take the NativeWind driver's turn records baselines before each send flow

## What this does

Fixes the records-baseline ordering defect in the ORI-RN-005-owned NativeWind live-proof driver (`tests/sprint-05-orient-search/support/nativewind-live-example.ts`) that blocks ORI-AI-002's six-target matrix. Observed in ORI-AI-002's cycle-4 attempts c4e/c4g/c4h (3/3 reproductions on freshly rebooted devices; diagnostics in `tests/sprint-05-orient-search/evidence/ORI-AI-002/server-events.jsonl` phase-end legs and `.tmp/ORI-AI-002/cycle-4/red/`): with a caller-provided backend, the iOS leg's marker turn fails as `marker turn ended as no terminal record` while the marker's completed provider record — completed in ~1.7 s — is present in the same run's records.

Code facts at main `cbb782d2`: `runIosInputFlow`'s `awaitTurn` closure (lines 1573-1584) captures `const baseline = session.current.records().length` at await time, and its call sites drive `sendTurn('marker'|'seed'|'follow-up', …)` — the synchronous one-off maestro flow — BEFORE `awaitTurn(…)` (lines 1621-1624, 1634-1637, 1644-1647). Any provider record landing during the maestro send flow's window sits at or before the await-time baseline, so the `records.length > baseline` terminal predicate in `awaitTerminalRecord` (line 934) and `sampleAssistantTextGrowth` (line 965) never fires and the await burns its full 120 s into a false "no terminal record". The same await-time capture exists in `handleTerminal`'s Retry recovery (line 1609, baseline after the Retry tap) and in the Android flow's Retry recoveries (lines 1226, 1256). The correct ordering already exists twice in this file: the stop-turn drives take the baseline BEFORE `runOneOffMaestroFlow` (line 1677), and the Android `runTurn` takes it before the send tap (line 1199). The fix moves every conversational-turn baseline capture to before the flow that issues the request — the `records.length > baseline` guard already makes a pre-send baseline semantically correct for both predicates (it skips every record at or below the baseline, so the baseline detects exactly the send's record whenever it lands), and for the Retry paths the failed turn's error record sits below a pre-tap baseline so only the retry's new record crosses it.

## Why

ORI-AI-002's cycle-4 blocked report (commit `d1f5d99e`, item `ORI-AI-002:blocked:4:scope_impact:0`) proves everything else in the six-target matrix is green at that checkpoint; the single remaining blocker is this driver-internal ordering defect, and the driver is write-prohibited to ORI-AI-002. ORI-RN-005 owns the file and is completed; FIX-ORI-RN-004-2 and FIX-ORI-RN-004-3 (both completed) fixed the sibling Uniwind driver, and this is the NativeWind counterpart's turn. No pending task owns the file. Once the ordering is fixed, ORI-AI-002's committed runner re-runs its two exact verify commands with no further work in its own files.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts
pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts --matrix ios,android,web
pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts --case ORI-RN-005-install-exact-source
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/nativewind-live-example.ts tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts
```

The first command is the task-owned harness: it invokes the real driver exactly as ORI-AI-002's runner does (caller-created owned-backend handle, `platforms: ['ios']`, fresh run identity, watchdog) and proves the marker-turn record-lands-before-baseline failure pre-fix and its absence post-fix. The second is the regression gate: the harness's `--matrix ios,android,web` mode drives the driver's canonical three-platform matrix as a child under the harness watchdog. The third is this driver's own fast compiler/install case (the NativeWind analog of the sibling FIX tasks' ORI-RN-004 AC-5 gate; the Uniwind compiler case does not apply because this task never touches the Uniwind driver). The rest are static gates.

## Scope

Own the baseline-ordering fix in the NativeWind driver and the task-owned harness, plus bounded evidence. ORI-AI-002's runner, the Uniwind driver, the shared support files, and every in-flight file stay untouched; the fixed driver is consumed by ORI-AI-002's re-dispatch through the frozen `runNativewindLiveExampleProof` / `options.backend` interface.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: Backlog

> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 2 · Type: FIX
> Dependency phase: after ORI-RN-005, FIX-ORI-RN-004-2 and FIX-ORI-RN-004-3
> Proposed By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-23
> Source SHA: cbb782d2

AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROGRESS: 0/2 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

The NativeWind driver's conversational-turn terminal awaits detect their turn's provider record regardless of when it lands: every marker/seed/follow-up await — and its Retry recovery — captures its records baseline BEFORE the flow that issues the request, mirroring the file's own stop-turn drives, so a record completing during the maestro send window terminates its await immediately instead of burning 120 s into a false "no terminal record"; ORI-AI-002's runner consumes the fixed driver unchanged through the frozen `runNativewindLiveExampleProof` / `options.backend` seam.

### CRITICAL CONSTRAINTS — Never

- Never weaken the terminal predicates: the `records.length > baseline` guard and the terminal-outcome sets stay as-is. The fix moves WHERE the baseline is captured, never WHAT the predicate accepts — dropping or widening the guard to make the await fire is an oracle weakening, not a fix.
- Never change the consumed interface: `runNativewindLiveExampleProof`'s exported signature and `ProofOptions` (including `options.backend: OwnedBackendHandle`, `runId`, `outputDir`, `manifestPath`, `sourceSha`), the `--platforms` / `--case` / `--run-id` / `--out` / `--manifest` CLI behavior, the `manifest.json` / `provider-correlation.json` / `teardown.json` schemas, and the BackendSession semantics stay behavior-identical. Additive exports of existing module-level helpers are allowed when the in-vitro RED lane needs them; ORI-AI-002's committed runner (d1f5d99e) must invoke the fixed driver unchanged.
- Never mock the device, maestro, backend, or provider for the live lane; the RED reproduction is the real driver on the reserved simulator with a real caller-created owned-backend handle over the real provider.
- Never touch the stop-turn drive baselines (already correct), the endpoint-loss phases, the web leg, or the growth-sampling architecture.
- Never write outside the exact allowlist; never edit ORI-AI-002's in-flight files, the Uniwind driver, the shared support files (`support/live-backend.ts`, `support/native-session.ts`), app code, or prior ORI-RN-005 evidence beyond the driver's own side-effect refresh.
- Never expose provider credentials beyond the trusted launcher/backend; strip them from spawned children and evidence exactly as the driver already does.
- Never treat missing devices, credentials, ffmpeg, or the Expo Go prerequisite as a passing skip; fail closed and record the blocker.
- UNIT_TEST_JUSTIFIED (in-vitro fallback lane only): the terminal predicates (`awaitTerminalRecord`, `sampleAssistantTextGrowth`) are pure logic over the `records()` array with zero I/O, so their baseline-provenance boundary may be demonstrated in vitro against the real predicate code; the live lane remains the primary integration proof and is never replaced by it.

### DONE WHEN

- [ ] AC-1 proves the pre-send baseline ordering on the live caller-composed iOS leg: pre-fix the marker turn fails as "no terminal record" with the completed record present; post-fix both iOS appearance legs pass.
- [ ] AC-2 proves no regression: the canonical three-platform matrix passes, the driver's install/compiler case passes, the static gates hold, and the consumed interface is frozen.
- [ ] The exact selector and preserved commands pass; independent review confirms functional RED, seeded evidence, the recorded root cause, and no oracle weakening.

### SPECIFICATION

Ordering fix in the driver plus a task-owned harness. The harness reproduces ORI-AI-002's exact invocation shape at this task's dependency position: a caller-created owned-backend handle from the real `support/live-backend.ts`, the real `runNativewindLiveExampleProof` export through the repository tsx runtime with `engine: 'nativewind'`, `platforms: ['ios']`, a fresh run identity, a bounded task-owned output directory, and an explicit watchdog — never a reimplementation of the runner.

### BOUNDARY CONTRACTS

1. Primary fix location: `tests/sprint-05-orient-search/support/nativewind-live-example.ts`. In `runIosInputFlow`: capture the records baseline BEFORE `sendTurn` for the marker, seed, and follow-up turns — e.g., extend `awaitTurn(label, sample, baseline)` to receive the baseline captured before its paired `sendTurn` call — and move the `handleTerminal` Retry baseline (currently after the Retry tap, line ~1609) to before the tap. Mirror the file's own correct orderings: the stop-turn drives (line ~1677) and the Android `runTurn` (line ~1199). Align the Android Retry baselines (lines ~1226, ~1256) to before their Retry tap — the identical race class in the identical conversational-turn path, where the retry's record can land during `dismissThenTap`'s flow window. The sampled seed path keeps its behavior: `sampleAssistantTextGrowth` already takes the baseline argument and its `records.length > baseline` guard (line ~965) correctly identifies the seed's record with a pre-send baseline; only the baseline's provenance changes.
2. Root-cause record: the evidence must name the composition defect (await-time baseline capture after a synchronous send flow) with the RED observation — the leg's own "observed" records dump containing the marker turn's completed record — and the commit body records it. A re-ordered capture with no recorded pre-fix observation is incomplete.
3. Interface freeze: the exports, options, CLI flags, and schemas listed in CRITICAL CONSTRAINTS stay behavior-identical; ORI-AI-002's committed runner must invoke the fixed driver unchanged. Manifest semantics note: `manifest.completed` literally means all 3 platforms passed (`countPlatformsPassed` returns `completed: passed === 3`), so the harness's ios-only invocation legitimately records `completed: false` with CLI exit 1 even when both iOS legs pass — assertions key on `legs[].status`, never on `completed`.
4. Harness `tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts` (NEW, in the sprint lane) exports `runNativewindBaselineOrderingProof`: create the owned backend through the real `support/live-backend.ts` handle; invoke the real `runNativewindLiveExampleProof` with engine nativewind, `platforms: ['ios']`, a fresh run identity, a bounded task-owned output directory, and `options.backend` set, under an explicit <= 3600 s watchdog (two iOS appearance legs); RED mode asserts the iOS leg fails the marker turn with the no-terminal-record diagnostic WHILE the same run's records — the diagnostic's own observed dump and/or `provider-correlation.json` for the run id — contain the marker turn's completed record; GREEN mode reruns the identical invocation and asserts both iOS appearance legs record `status: 'passed'` for the run identity; `--matrix ios,android,web` mode drives the driver's exact full three-platform matrix as a child of the harness under an outer watchdog using the canonical CLI invocation, for the regression gate. If the live race does not reproduce in the window, fall back to the recorded in-vitro lane: drive the REAL `awaitTerminalRecord` / `sampleAssistantTextGrowth` predicates (additively exported) with a controlled records seam under both baseline orderings — a post-send baseline cannot see a record that landed during the send; a pre-send baseline returns its outcome — and record the divergence explicitly. Emit bounded JSON evidence and stop only recorded children on every exit path. Real services only for the live lane.
5. Prerequisites: `RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1` (iPhone 17, iOS 26.3; canonical source: FIX-ORI-RN-003-2 session evidence) and `RNR_S05_ANDROID_SERIAL=emulator-5554` must BOTH be set for any native-including run — the shared `support/native-session.ts` `reserveDevices` (imported by this driver) throws on either missing, even for the harness's ios-only invocation; the pinned Expo Go 57.0.9 APK cache must be present or restorable. Marathon-length invocations (the canonical three-platform matrix) run with `TMPDIR=/tmp/ori-ai-002-scratch`: the scratch reaper deletes the agent-scratch tmpdir that `os.tmpdir()` resolves to under cmux agent shells, and the driver's consumer build, maestro flow files, and expo outputs live there. Homebrew ffmpeg must be >= 9.0.1 (8.1.1 has broken x265 dyld linkage that kills android recording concat). Perform the documented simulator reboot/IME restore after marathon sessions. Missing prerequisites block execution.
6. Evidence side effects: the driver writes `manifest.json`, `provider-correlation.json`, `teardown.json`, `metro.log`, `flow.log`, and per-leg captures into its output dir. The harness's runs direct them into the task-owned output directory; the canonical three-platform gate refreshes `tests/sprint-05-orient-search/evidence/ORI-RN-005/` in place as the driver's own side effects — regenerated captures are refreshed in place and committed with the rerun; never deleted, never hand-edited, never fabricated.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. All criteria run the real driver on the real stack.

#### AC-1: Pre-send baselines make the caller-composed iOS leg detect its marker record [PRIMARY]

GIVEN the real driver invoked exactly as ORI-AI-002's runner invokes it (real `runNativewindLiveExampleProof`, caller-created owned-backend handle, engine nativewind, platforms ['ios'], fresh run identity, watchdog) WHEN the iOS leg drives its marker/seed/follow-up turns THEN every terminal await's records baseline is captured before the flow that issues the request, so a provider record completing during the maestro send window terminates its await immediately: pre-fix the leg fails the marker turn with the no-terminal-record diagnostic while the marker's completed record is present in the same run's records; post-fix both iOS appearance legs record status 'passed'.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real driver on the reserved iOS simulator (real Expo Go, real maestro flows) with a real caller-created owned-backend handle over the real OpenAI Responses provider, under an explicit watchdog
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts
- TEST_FUNCTION: runNativewindBaselineOrderingProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-AI-002-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real driver on the reserved iOS simulator (real Expo Go, real maestro flows) with a real caller-created owned-backend handle over the real OpenAI Responses provider, under an explicit watchdog","negative_control":{"would_fail_if":["Any conversational-turn baseline is still captured at await time (post-send), the predicate is weakened to accept the last record regardless of the baseline instead of moving the capture, or the RED artifact shows the leg failing WITHOUT the completed marker record present (a different defect, not this one).","A mocked device, backend, maestro, or provider stands in for the live lane, the in-vitro fallback is used without recording the live divergence, or GREEN is claimed from a different selector than the recorded RED."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"nativewind_baseline_ordering_watch","action":{"actor":"cli_user","steps":["Pre-fix: run the harness — the caller-composed ios-only invocation under the watchdog — and capture the marker-turn failure: the iOS leg's diagnostic carries the no-terminal-record wording while the same run's observed records dump or provider-correlation.json contains the marker turn's completed record; record the run id in red.json. If the live race does not reproduce in the window, run the in-vitro lane over the real predicates under both baseline orderings and record the divergence.","Apply the pre-send baseline ordering to the marker/seed/follow-up awaits and their Retry baselines in both drive flows; rerun the identical harness and confirm both iOS appearance legs record status 'passed'.","Inspect the driver source: every conversational-turn baseline is captured before its issuing flow, mirroring the stop-turn drives, and the predicates are unchanged."]},"end_state":{"must_observe":["Pre-fix RED: the iOS leg fails the marker turn with the no-terminal-record diagnostic AND the marker turn's completed record is present in the same run's records (the diagnostic's own observed dump or provider-correlation.json for the run id), with the invocation run id recorded in red.json.","Post-fix: the identical harness invocation records legs[].status == 'passed' for both iOS appearances, the manifest run_id equals the invocation's run id, and the marker turn's await completed via a beyond-baseline record rather than a 120 s timeout (manifest.completed may legitimately be false for an ios-only run — key on legs[].status).","Source inspection with literal counts: exactly 6 baseline captures sit before their issuing flows — the 3 iOS conversational pairs (marker, seed, follow-up) and all 3 Retry recoveries (the iOS handleTerminal baseline plus the 2 Android retry baselines) — 0 session.current.records().length baseline captures remain anywhere in the conversational-turn family taken after the flow that issued the request, the already-correct captures (the Android runTurn send baseline and both stop-turn drive baselines) are byte-unchanged, and the literal guard records.length > baseline remains intact inside both awaitTerminalRecord and sampleAssistantTextGrowth."],"must_not_observe":["A 'fixed' predicate that drops or widens the baseline guard, a baseline still captured after any send flow in the conversational-turn family, or an authored or absent RED capture (0 observations in red.json).","A mocked device, backend, or provider anywhere in the live lane, or a GREEN claimed from a selector other than the recorded RED selector."]}}]}
```

#### AC-2: No regression — canonical matrix, compiler case, static gates, frozen interface

GIVEN the fixed driver WHEN the harness's --matrix ios,android,web invocation of the driver's canonical three-platform matrix and the preserved gates run THEN ios/android/web all pass for the run identity with the CLI exiting 0 and completed true, the driver's install-exact-source case passes, `pnpm typecheck` and the scoped Biome command exit 0 (or a failure is proven pre-existing with the AGENTS.md `git stash && rerun` proof and recorded), and the consumed interface is unchanged so ORI-AI-002's committed runner invokes the driver without modification.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: real Expo Go on the reserved iOS simulator and Android emulator plus the real web export path, the real owned backend and OpenAI Responses (gpt-4.1-mini-2025-04-14), the real TypeScript compiler and expo-doctor through the install-exact-source case, and the real Biome linter
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts
- TEST_FUNCTION: runNativewindBaselineOrderingProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts --matrix ios,android,web` · `pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts --case ORI-RN-005-install-exact-source` · `pnpm typecheck` · `pnpm exec biome ci tests/sprint-05-orient-search/support/nativewind-live-example.ts tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-AI-002-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus the real web export path, the real owned backend and OpenAI Responses (gpt-4.1-mini-2025-04-14), the real TypeScript compiler and expo-doctor through the install-exact-source case, and the real Biome linter","negative_control":{"would_fail_if":["Any platform regresses, the compiler/install case or static gates break, the interface drifts so ORI-AI-002's runner would need edits, or the diff leaves the allowlist.","A skipped platform, a stale or mismatched run identity in the manifest, or a static shell of the matrix stands in for the real three-platform run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"nativewind_baseline_ordering_watch","action":{"actor":"cli_user","steps":["Run the harness --matrix ios,android,web mode — the driver's exact three-platform invocation as a child under the harness watchdog — with TMPDIR=/tmp/ori-ai-002-scratch, both reserved-device variables, and appearance restore; confirm every leg passes and the manifest records the run identity with completed == true.","Run the ORI-RN-005 install-exact-source case, pnpm typecheck, and the scoped Biome command; prove any failure pre-existing with git stash && rerun before recording it.","Diff the driver against its pre-state; confirm the exported surface, options, CLI flags, and schemas consumed by ORI-AI-002 are unchanged and the diff stays inside the allowlist."]},"end_state":{"must_observe":["The three-platform run exits 0 with completed == true and every leg status 'passed' for the run identity.","The install-exact-source case passes (five matching copy pairs, tsc exit 0, expo-doctor exit 0); typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record.","The consumed interface is unchanged: runNativewindLiveExampleProof's signature and ProofOptions (including backend), the CLI flags, and the manifest/correlation/teardown schemas; green.json records options.backend != null for the harness's caller-passed handle; git diff --name-only reports 0 paths outside the literal allowlist entries."],"must_not_observe":["A regressed platform, a weakened oracle, interface drift, or writes outside the allowlist.","0 passed platforms, a missing or stale manifest for the run identity, or an install-exact-source result with any mismatched copy pair."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The harness RED mode proves the await-time-baseline failure on the live caller-composed iOS leg (no-terminal-record diagnostic with the completed marker record present in the same run), and GREEN proves the pre-send ordering passes both iOS appearance legs through the identical selector. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts`
- TC-2 → AC-2: The canonical three-platform matrix passes with completed == true, the install-exact-source case passes, the static gates hold, the interface is frozen, and the diff is inside the allowlist. VERIFY: the four AC-2 commands.

### SHARED FIXTURES

```json
{"nativewind_baseline_ordering_watch":{"description":"A fresh isolated candidate with the real NativeWind driver, a caller-created owned-backend handle from support/live-backend.ts, the reserved iOS simulator for the harness lane, and — for the matrix gate — the reserved Android emulator and web export path with Expo Go and the pinned credentials available to the trusted backend.","seed_method":"cli","records":["RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1 (iPhone 17, iOS 26.3; canonical source: FIX-ORI-RN-003-2 session evidence) and RNR_S05_ANDROID_SERIAL=emulator-5554 must both be set for any native-including run — the shared support/native-session.ts reserveDevices throws on either missing, even for the harness's ios-only invocation; the pinned Expo Go 57.0.9 APK cache must be present or restorable.","Marathon-length invocations (the canonical three-platform matrix) run with TMPDIR=/tmp/ori-ai-002-scratch — the scratch reaper deletes the agent-scratch tmpdir os.tmpdir() resolves to under cmux agent shells; homebrew ffmpeg must be >= 9.0.1 (8.1.1 has broken x265 dyld linkage killing android recording concat); perform the documented simulator reboot/IME restore after marathon sessions.","Provider credentials reach only the trusted backend; the harness strips them from every other child exactly as the driver does. A higher maxOutputTokens on the handle's launch options widens the Stop-control window (16384 proven versus the driver's 4096 default).","The watchdog budget is <= 3600 s for the ios-only harness run and is recorded; every run binds its run id, commands, exits, and the run's provider-correlation records. manifest.completed literally means 3 platforms passed (countPlatformsPassed returns completed: passed === 3) — an ios-only run legitimately records completed:false with CLI exit 1; assertions key on legs[].status."]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- tests/sprint-05-orient-search/support/nativewind-live-example.ts (MODIFY)
- tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts (NEW)
- tests/sprint-05-orient-search/evidence/FIX-ORI-AI-002-1/README.md (NEW)
- tests/sprint-05-orient-search/evidence/ORI-RN-005/manifest.json (MODIFY)
- tests/sprint-05-orient-search/evidence/ORI-RN-005/provider-correlation.json (MODIFY)
- tests/sprint-05-orient-search/evidence/ORI-RN-005/teardown.json (MODIFY)
- .tmp/FIX-ORI-AI-002-1/red.json (NEW)
- .tmp/FIX-ORI-AI-002-1/green.json (NEW)
- .tmp/FIX-ORI-AI-002-1/run.json (NEW)

The driver's canonical matrix rerun additionally rewrites its own capture set under tests/sprint-05-orient-search/evidence/ORI-RN-005/ (per-leg ios/, android/, web/ captures, flow.log files, metro.log, screenshot.png) and the install-exact-source case writes install-exact-source.json and install-log.txt into its --out directory; those regenerated artifacts are refreshed in place as driver side effects of the allowed commands and committed with the rerun — never deleted, never hand-edited. No other path may change.

writeProhibited:

- tests/sprint-05-orient-search/run-live-example-proof.mjs
- tests/sprint-05-orient-search/live-example-proof.ts
- tests/sprint-05-orient-search/live-example-proof.test.ts
- tests/sprint-05-orient-search/support/live-example-proof.test.ts
- tests/sprint-05-orient-search/evidence/ORI-AI-002/**
- tests/sprint-05-orient-search/support/live-backend.ts
- tests/sprint-05-orient-search/support/native-session.ts
- apps/**
- packages/**
- pnpm-lock.yaml
- .github/**
- .spec/**
- .kb-run-sprint/**
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- If the RED reproduction shows the marker-turn failure has an additional cause beyond the baseline ordering (for example the marker's record never reaching the backend at all), stop and report for a scope amendment rather than broadening the fix.
- If the fix appears to require changing `ProofOptions`, the CLI flags, the manifest/correlation schemas, or the shared support files, escalate; this task must not force ORI-AI-002 code changes.
- If, post-fix, the sampled seed path's growth oracle degrades because the seed record completed entirely within the send window (the sampler then observes only post-completion lengths), report it as a finding — that is a distinct timing property of the post-send sampling architecture (the synchronous maestro flow blocks mid-send sampling), not something this task may restructure.
- Unavailable reserved devices, credentials, ffmpeg, or the Expo Go prerequisite block execution; report the blocker, never substitute another target.

### DELIVERABLE

- `tests/sprint-05-orient-search/support/nativewind-live-example.ts`: every conversational-turn terminal await (marker/seed/follow-up and their Retry recoveries, both drive flows) captures its records baseline before the flow that issues the request; predicates, outcome sets, and the consumed interface unchanged.
- `tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts`: the caller-composed harness (live RED/GREEN lane, the recorded in-vitro fallback, and the --matrix ios,android,web regression mode).
- `.tmp/FIX-ORI-AI-002-1/red.json`, `green.json`, `run.json` plus `tests/sprint-05-orient-search/evidence/FIX-ORI-AI-002-1/README.md` (root-cause record), and refreshed driver side-effect outputs under `tests/sprint-05-orient-search/evidence/ORI-RN-005/`.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; run the exact selector pre-fix; capture the marker-turn failure-with-record-present as AC-1 specifies (the live lane, or the recorded in-vitro fallback with the live divergence documented). Missing devices or tooling is a blocker, never functional RED; a source-absence note or authored flag is not RED. Wait for orchestrator verification of RED.
2. GREEN: apply the ordering fix; rerun the identical selector; then run the canonical three-platform matrix and the preserved gates. REFACTOR only to keep the baseline provenance explicit; rerun affected proofs.
3. Hand the candidate and evidence to react-native-reusables-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `tests/sprint-05-orient-search/support/nativewind-live-example.ts` [PRIMARY TARGET] — `runIosInputFlow`'s `sendTurn`/`awaitTurn`/`handleTerminal` closures (≈1566-1619), the three call-site pairs (≈1621-1647), the stop-turn drives' correct ordering (≈1677), `runAndroidInputFlow`'s `runTurn` (≈1191-1297), `awaitTerminalRecord`/`sampleAssistantTextGrowth` (≈903-976), and the per-leg growth oracle (≈2336).
2. `.kb-run-sprint/sprint-05-orient-search/ORI-AI-002/cycle-4.blocked.json` — the 3/3 reproduction record naming this defect and the fix direction.
3. `.spec/prds/docs-site/tasks/sprint-05-orient-search/ORI-AI-002-prove-the-composed-worked-example-against-the-real-provider.md` — boundary contracts 9 and 10 (the invocation seam to preserve).
4. `tests/sprint-05-orient-search/support/live-backend.ts` — the OwnedBackendHandle seam the harness creates.
5. `TASK-FIX-ORI-RN-004-3.md` — the caller-handle harness conventions, the manifest completed-semantics trap, and the biome clean-env note.

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts
```

Preserved verification commands:

```sh
pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts --matrix ios,android,web
pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts --case ORI-RN-005-install-exact-source
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/nativewind-live-example.ts tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts
```

Command contract: every native-including run needs both reserved-device variables set (the shared `reserveDevices` throws on either missing, even for ios-only harness runs) and the Expo Go prerequisite; the canonical matrix additionally needs `TMPDIR=/tmp/ori-ai-002-scratch` and homebrew ffmpeg >= 9.0.1. The provider credential reaches only the trusted backend (the harness's caller-created handle keeps it server-side). Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells (`Linter process terminated abnormally` — recorded environmental finding); the working shapes are the righthook pre-commit and a clean-env invocation (env -i with explicit pnpm/node PATH) — prove a biome failure environmental before treating it as a gate failure. Do not rerun ORI-AI-002's suites as gates — they touch in-flight files and evidence outside this allowlist.

### EVIDENCE GATES

1. Prerequisites: reserved devices, Expo Go, credentials, ffmpeg (for the matrix), and the isolated candidate established; the driver and its imports present at the recorded candidate SHA.
2. Functional RED: the exact selector against the recorded pre-fix candidate; the marker-turn failure-with-record-present captured as AC-1 specifies, with the invocation identity bound. Wait for orchestrator verification.
3. GREEN: the identical selector post-fix plus the canonical three-platform matrix (every leg passed, manifest for the run identity), the install-exact-source case, and the static gates; the root cause recorded in the evidence and commit body.
4. Evidence: bind candidate source and harness hashes to exact commands, exits, run identity, watchdog budget, the run's provider-correlation records, and the refreshed driver side-effect artifacts; stop only recorded children on every exit path. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, the named root cause, no oracle weakening, exact scope compliance.

Planned evidence paths: .tmp/FIX-ORI-AI-002-1/red.json, .tmp/FIX-ORI-AI-002-1/green.json, .tmp/FIX-ORI-AI-002-1/run.json, tests/sprint-05-orient-search/evidence/FIX-ORI-AI-002-1/README.md. Teardown: stop only children recorded by this run's owned handles (the harness stops its own caller handle at teardown); release reservations; restore appearance; leave prior ORI-RN-005 evidence intact or refreshed.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. FLOW-DOCS-02-quickstart-chat-screen remains owned by ORI-CONT-004; the locked gate steps, human-flows.json, and gate-plan.json are unchanged; no flow evidence writes, no journey proofs.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-RN-005, FIX-ORI-RN-004-2, FIX-ORI-RN-004-3 (all completed).

Blocks: ORI-AI-002's remaining GREEN — its re-dispatch consumes the fixed driver through the frozen interface with no further work in its own files; indirectly ORI-CONT-004's Quickstart gate step 3.

Provides: a NativeWind driver whose conversational-turn terminal awaits detect their turn's record regardless of when it lands; the caller-composed baseline-ordering harness with captured RED/GREEN evidence under `.tmp/FIX-ORI-AI-002-1/`.

Consumes: ORI-RN-005's driver and evidence surface; ORI-AI-001's `support/live-backend.ts` owned-backend handle; FIX-ORI-RN-004-2/-3's recorded caller-handle harness conventions and environment findings.

References: CAP-DOCS-01; UC-DOCS-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave12-add-nativewind-baseline-ordering-fix` (wave-12, sequence next); source task ORI-AI-002 (blocked cycle 4, commit d1f5d99e947f824cb3697520231b4a542126f805; report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-AI-002/cycle-4.blocked.json`, sha256 b58225ed54c8cd24cee2b340817c4ccfe4acfdfc50846497a2b58bab40dffedb, item ORI-AI-002:blocked:4:scope_impact:0); proposed by react-native-reusables-planner.

### OUT OF SCOPE

ORI-AI-002's runner, tests, and evidence (in flight); the Uniwind driver and its ORI-RN-004 AC-5 compiler case; the shared support files and the OwnedBackendHandle contract; app and registry code; the six-target matrix and vitest capture (ORI-AI-002's rerun); restructuring the sampled seed path's post-send sampling architecture; the stop-turn drives and endpoint-loss phases (already correct); dependency or lockfile changes; journey proofs; planning policy edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: functional RED and GREEN bound to the real driver on the real stack through a real caller-created backend handle; the root cause named with the failure-with-record-present observation; every conversational-turn baseline captured before its issuing flow in both drive flows with the predicates unchanged; the canonical matrix passes with the install-exact-source case and static gates green; the consumed interface unchanged; only allowed files change; no stub, fake success, or oracle weakening remains. Should verify: the harness's invocation shape matches ORI-AI-002's runner so its re-dispatch lands clean first try; the growth sample counts are reported in the GREEN evidence so any seed-sampler degradation is visible; driver-fix completion is not presented as ORI-AI-002 acceptance. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-AI-002-1","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"nativewind_baseline_ordering_watch":{"description":"A fresh isolated candidate with the real NativeWind driver, a caller-created owned-backend handle from support/live-backend.ts, the reserved iOS simulator for the harness lane, and — for the matrix gate — the reserved Android emulator and web export path with Expo Go and the pinned credentials available to the trusted backend.","seed_method":"cli","records":["RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1 (iPhone 17, iOS 26.3; canonical source: FIX-ORI-RN-003-2 session evidence) and RNR_S05_ANDROID_SERIAL=emulator-5554 must both be set for any native-including run — the shared support/native-session.ts reserveDevices throws on either missing, even for the harness's ios-only invocation; the pinned Expo Go 57.0.9 APK cache must be present or restorable.","Marathon-length invocations (the canonical three-platform matrix) run with TMPDIR=/tmp/ori-ai-002-scratch — the scratch reaper deletes the agent-scratch tmpdir os.tmpdir() resolves to under cmux agent shells; homebrew ffmpeg must be >= 9.0.1 (8.1.1 has broken x265 dyld linkage killing android recording concat); perform the documented simulator reboot/IME restore after marathon sessions.","Provider credentials reach only the trusted backend; the harness strips them from every other child exactly as the driver does. A higher maxOutputTokens on the handle's launch options widens the Stop-control window (16384 proven versus the driver's 4096 default).","The watchdog budget is <= 3600 s for the ios-only harness run and is recorded; every run binds its run id, commands, exits, and the run's provider-correlation records. manifest.completed literally means 3 platforms passed (countPlatformsPassed returns completed: passed === 3) — an ios-only run legitimately records completed:false with CLI exit 1; assertions key on legs[].status."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Pre-send baselines make the caller-composed iOS leg detect its marker record","primary":true,"description":"GIVEN the real driver invoked exactly as ORI-AI-002's runner invokes it (real runNativewindLiveExampleProof, caller-created owned-backend handle, engine nativewind, platforms ['ios'], fresh run identity, watchdog) WHEN the iOS leg drives its marker/seed/follow-up turns THEN every terminal await's records baseline is captured before the flow that issues the request, so a provider record completing during the maestro send window terminates its await immediately: pre-fix the leg fails the marker turn with the no-terminal-record diagnostic while the marker's completed record is present in the same run's records; post-fix both iOS appearance legs record status 'passed'.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts","test_function":"runNativewindBaselineOrderingProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts","test_tier":"integration","verification_service":"the real driver on the reserved iOS simulator (real Expo Go, real maestro flows) with a real caller-created owned-backend handle over the real OpenAI Responses provider, under an explicit watchdog","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-AI-002-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real driver on the reserved iOS simulator (real Expo Go, real maestro flows) with a real caller-created owned-backend handle over the real OpenAI Responses provider, under an explicit watchdog","negative_control":{"would_fail_if":["Any conversational-turn baseline is still captured at await time (post-send), the predicate is weakened to accept the last record regardless of the baseline instead of moving the capture, or the RED artifact shows the leg failing WITHOUT the completed marker record present (a different defect, not this one).","A mocked device, backend, maestro, or provider stands in for the live lane, the in-vitro fallback is used without recording the live divergence, or GREEN is claimed from a different selector than the recorded RED."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"nativewind_baseline_ordering_watch","action":{"actor":"cli_user","steps":["Pre-fix: run the harness — the caller-composed ios-only invocation under the watchdog — and capture the marker-turn failure: the iOS leg's diagnostic carries the no-terminal-record wording while the same run's observed records dump or provider-correlation.json contains the marker turn's completed record; record the run id in red.json. If the live race does not reproduce in the window, run the in-vitro lane over the real predicates under both baseline orderings and record the divergence.","Apply the pre-send baseline ordering to the marker/seed/follow-up awaits and their Retry baselines in both drive flows; rerun the identical harness and confirm both iOS appearance legs record status 'passed'.","Inspect the driver source: every conversational-turn baseline is captured before its issuing flow, mirroring the stop-turn drives, and the predicates are unchanged."]},"end_state":{"must_observe":["Pre-fix RED: the iOS leg fails the marker turn with the no-terminal-record diagnostic AND the marker turn's completed record is present in the same run's records (the diagnostic's own observed dump or provider-correlation.json for the run id), with the invocation run id recorded in red.json.","Post-fix: the identical harness invocation records legs[].status == 'passed' for both iOS appearances, the manifest run_id equals the invocation's run id, and the marker turn's await completed via a beyond-baseline record rather than a 120 s timeout (manifest.completed may legitimately be false for an ios-only run — key on legs[].status).","Source inspection with literal counts: exactly 6 baseline captures sit before their issuing flows — the 3 iOS conversational pairs (marker, seed, follow-up) and all 3 Retry recoveries (the iOS handleTerminal baseline plus the 2 Android retry baselines) — 0 session.current.records().length baseline captures remain anywhere in the conversational-turn family taken after the flow that issued the request, the already-correct captures (the Android runTurn send baseline and both stop-turn drive baselines) are byte-unchanged, and the literal guard records.length > baseline remains intact inside both awaitTerminalRecord and sampleAssistantTextGrowth."],"must_not_observe":["A 'fixed' predicate that drops or widens the baseline guard, a baseline still captured after any send flow in the conversational-turn family, or an authored or absent RED capture (0 observations in red.json).","A mocked device, backend, or provider anywhere in the live lane, or a GREEN claimed from a selector other than the recorded RED selector."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"No regression — canonical matrix, compiler case, static gates, frozen interface","primary":false,"description":"GIVEN the fixed driver WHEN the harness's --matrix ios,android,web invocation of the driver's canonical three-platform matrix and the preserved gates run THEN ios/android/web all pass for the run identity with the CLI exiting 0 and completed true, the driver's install-exact-source case passes, pnpm typecheck and the scoped Biome command exit 0 (or a failure is proven pre-existing with the AGENTS.md git stash && rerun proof and recorded), and the consumed interface is unchanged so ORI-AI-002's committed runner invokes the driver without modification.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts","test_function":"runNativewindBaselineOrderingProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts --matrix ios,android,web","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus the real web export path, the real owned backend and OpenAI Responses (gpt-4.1-mini-2025-04-14), the real TypeScript compiler and expo-doctor through the install-exact-source case, and the real Biome linter","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-AI-002-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real Expo Go on the reserved iOS simulator and Android emulator plus the real web export path, the real owned backend and OpenAI Responses (gpt-4.1-mini-2025-04-14), the real TypeScript compiler and expo-doctor through the install-exact-source case, and the real Biome linter","negative_control":{"would_fail_if":["Any platform regresses, the compiler/install case or static gates break, the interface drifts so ORI-AI-002's runner would need edits, or the diff leaves the allowlist.","A skipped platform, a stale or mismatched run identity in the manifest, or a static shell of the matrix stands in for the real three-platform run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"nativewind_baseline_ordering_watch","action":{"actor":"cli_user","steps":["Run the harness --matrix ios,android,web mode — the driver's exact three-platform invocation as a child under the harness watchdog — with TMPDIR=/tmp/ori-ai-002-scratch, both reserved-device variables, and appearance restore; confirm every leg passes and the manifest records the run identity with completed == true.","Run the ORI-RN-005 install-exact-source case, pnpm typecheck, and the scoped Biome command; prove any failure pre-existing with git stash && rerun before recording it.","Diff the driver against its pre-state; confirm the exported surface, options, CLI flags, and schemas consumed by ORI-AI-002 are unchanged and the diff stays inside the allowlist."]},"end_state":{"must_observe":["The three-platform run exits 0 with completed == true and every leg status 'passed' for the run identity.","The install-exact-source case passes (five matching copy pairs, tsc exit 0, expo-doctor exit 0); typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record.","The consumed interface is unchanged: runNativewindLiveExampleProof's signature and ProofOptions (including backend), the CLI flags, and the manifest/correlation/teardown schemas; green.json records options.backend != null for the harness's caller-passed handle; git diff --name-only reports 0 paths outside the literal allowlist entries."],"must_not_observe":["A regressed platform, a weakened oracle, interface drift, or writes outside the allowlist.","0 passed platforms, a missing or stale manifest for the run identity, or an install-exact-source result with any mismatched copy pair."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The harness RED mode proves the await-time-baseline failure on the live caller-composed iOS leg (no-terminal-record diagnostic with the completed marker record present in the same run), and GREEN proves the pre-send ordering passes both iOS appearance legs through the identical selector.","verify":"pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The canonical three-platform matrix passes with completed == true, the install-exact-source case passes, the static gates hold, the interface is frozen, and the diff is inside the allowlist.","verify":"pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts --matrix ios,android,web","maps_to_ac":"AC-2"}]}
-->
</details>
