# FIX-ORI-AI-002-1 — NativeWind driver records-baseline ordering fix

## Root cause

`runIosInputFlow`'s `awaitTurn` closure in
`tests/sprint-05-orient-search/support/nativewind-live-example.ts` captured
`const baseline = session.current.records().length` **at await time** — after its
paired `sendTurn('marker'|'seed'|'follow-up', …)` had already returned. A one-off
maestro send flow's window can outlast the provider reply (ORI-AI-002's
caller-composed cycle-4 runs saw marker replies complete in ~1.7 s inside a
30-90 s flow teardown), so the turn's record lands at index ≤ the await-time
baseline and the `records.length > baseline` terminal predicate in
`awaitTerminalRecord` / `sampleAssistantTextGrowth` never fires: the await burns
its full 120 s into a false "no terminal record" while the completed record is
present in the same run's records. ORI-AI-002 reproduced this 3/3 (attempts
c4e/c4g/c4h on freshly rebooted devices; report
`.kb-run-sprint/sprint-05-orient-search/ORI-AI-002/cycle-4.blocked.json`,
checkpoint d1f5d99e) and is blocked on it for the six-target matrix.

The same await-time/post-tap capture existed in `handleTerminal`'s iOS Retry
recovery and in the Android flow's two Retry recoveries (the retry's record can
land during `dismissThenTap`'s flow window). The correct ordering already existed
twice in the same file: the stop-turn drives capture the baseline before
`runOneOffMaestroFlow` / the coordinate send, and the Android `runTurn` captures
it before the send tap.

## The fix

Every conversational-turn baseline is now captured BEFORE the flow that issues
the request — 6 captures in total: the 3 iOS pairs (marker, seed, follow-up,
passed into `awaitTurn(label, sample, baseline)`) and all 3 Retry recoveries
(the iOS `handleTerminal` baseline and the 2 Android retry baselines, both moved
to before their Retry tap). The failed turn's error record sits below a pre-tap
retry baseline, so only the retry's new record crosses it. The predicates, the
terminal-outcome sets, and the consumed interface
(`runNativewindLiveExampleProof` / `ProofOptions` / CLI flags / manifest,
correlation, and teardown schemas) are unchanged. The already-correct captures
(Android `runTurn` send baseline, both stop-turn drive baselines) are
byte-unchanged.

## Evidence

- Selector: `pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts`
  (identical invocation in RED and GREEN: caller-created owned-backend handle,
  engine nativewind, platforms `['ios']`, fresh run identity, bounded output dir
  under `.tmp/FIX-ORI-AI-002-1/live/<run id>/`, 3 600 000 ms watchdog).
- `.tmp/FIX-ORI-AI-002-1/red.json` — pre-fix RED. The live ios-only harness run
  under this harness's light load did NOT re-trigger the race window (both legs
  passed; ORI-AI-002's reproductions ran inside the loaded six-target matrix),
  so the contracted fallback lane fired: the source inspection still found 0
  pre-flow conversational captures, and the in-vitro lane over the REAL
  exported predicates proved the divergence (pre-send baseline →
  `completed` immediately; post-send baseline → `null (no terminal record)`
  after the burn) — exit 1, functional RED recorded with the live divergence.
- `.tmp/FIX-ORI-AI-002-1/green.json` — post-fix GREEN: both iOS appearance legs
  `passed` through the identical selector, manifest run_id bound to the
  invocation, `options.backend != null`, source inspection clean with exactly 6
  pre-flow conversational captures — exit 0.
- `.tmp/FIX-ORI-AI-002-1/run.json` — every mode's ledger (command, exit, run
  id, watchdog, child outcome, manifest snapshot).
- Regression gate (AC-2): the harness `--matrix ios,android,web` mode drove the
  canonical three-platform CLI as a child (run `ORI-RN-005-1790180609945`):
  child exit 0, manifest `completed: true`, `passed_platforms: 3`, every leg
  (ios x2, android x2, web) `passed`, run identity bound to the child's own
  reported id, 24 provider records correlated. The ORI-RN-005-install-exact-source
  case passed (five matching copy pairs, tsc exit 0, expo-doctor exit 0), and
  `pnpm typecheck` plus the scoped Biome command exited 0.
- Driver side effects under `tests/sprint-05-orient-search/evidence/ORI-RN-005/`
  are refreshed in place by the canonical matrix rerun (the regression gate).

## Harness notes

The caller backend is served IN-PROCESS by the harness's mini-runner child
(`createChatServer` from `apps/example/server` — the exact module
`server/index.ts` runs): the driver's `reapOwnedOrphans` kills port-4010
listeners whose command line carries `server/index.ts` BEFORE honoring
`options.backend`, so a `launchOwnedBackend`-spawned caller backend would be
reaped before the first leg. The in-process listener's command line does not
match the heuristic (the same reason ORI-AI-002's owner process survives). The
unguarded import-time `main()` in `apps/example/server/index.ts` is neutered for
the dynamic import by hiding the credential (loadServerEnv fails harmlessly, no
listen), then the credential is restored before the first `serve()`. Real
server code, real OpenAI Responses traffic, real records — no mocked backend.

Environment repairs performed and recorded: the pinned Expo Go 57.0.9 APK cache
(`~/.cache/agent-scratch/opencode/ori-rn-003/Expo-Go-57.0.9.apk`) was restored
from the official `expo/expo-go-releases` GitHub release (tag `Expo-Go-57.0.9`)
— the driver requires the file to exist even for ios-only runs because
`installExpoGoAndroid` checks the path before checking installation.
