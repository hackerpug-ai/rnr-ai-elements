# FIX-ORI-RN-004-1 — evidence

Task: read the live-chat endpoint via direct `process.env` access (web) and
un-block the Android composer. Branch base:
`kb-run-sprint/sprint-05-orient-search/ORI-RN-004` @ `001488c` + `main`.

## Outcome

- **Defect A (CONFIRMED) — FIXED.** `apps/example/lib/live-chat-config.ts` reads
  `process.env.EXPO_PUBLIC_API_BASE_URL` directly; `resolveLiveChatConfig(env)` is
  byte-identical. Web RED → GREEN demonstrated: pre-fix the client bundle contains
  `EXPO_PUBLIC_API_BASE_URL is not configured` and `driveLiveWeb` fails at
  `getByLabel('Message')`; post-fix the composer renders (`emptyStateVisible:
  true`), a real message round-trips (2 completed OpenAI provider records via the
  same-origin proxy), and iOS shows no regression.
- **Defect B (HYPOTHESIS) — root cause determined, NOT a code bug. FIXED IN THE
  DRIVER (cycle 2-6 scope amendments moved the fix into the WRITE-ALLOWED proof
  driver).** The bisect (reactCompiler OFF) removes the "state update before
  mount" error but does NOT enable the button. Direct `adb shell input text`
  DOES enable the button on Android; Maestro's `inputText` silently fails to
  type (emulator soft keyboard not shown). The Android composer is functional;
  the Android leg's failures were driver-side: LogBox-jailed taps, no focus
  assertion, an ungated BACK keypress, a vacuous stop wait, and — cycle 6's
  finding — a stop-tap path slow enough (~25 s of maestro ceremony between send
  and stop) to race a 4096-token essay to its natural end. Cycle 6's driver
  passes the Android leg for real on emulator-5554: every turn hard-gated on a
  NEW terminal provider record, `Send message` enable asserted after typing,
  focus asserted before typing, and the stop turn sends + stops by coordinate
  with zero device reads between (abort landed 193/231 deltas into a ~1500-delta
  stream, both appearances). iOS and web re-run green with no regression; web
  additionally fixed the seed-prompt false negative (`assistantResponded:
  true` now). Evidence: `.tmp/FIX-ORI-RN-004-1/cycle-6/` (red/ and green/).

## RED (pre-fix)

- web: static export client bundle has "not configured", browser fails at
  `getByLabel('Message')` (see `.tmp/FIX-ORI-RN-004-1/cycle-1/red/`).
- android: `Send message` `enabled: false` after Maestro types the marker; metro
  log line 43 "Can't perform a React state update …" (reactCompiler ON).

## GREEN (post-fix)

- web: composer renders, real round-trips, follow-up + stop legs pass — see
  `web-green-manifest.json` + `web-green-provider-correlation.json`. (Cycle 6
  additionally fixed the seed-prompt false negative noted in earlier cycles: the
  driver now submits the seed prompt before asserting the rain reply, so
  `assistantResponded` is true. See `.tmp/FIX-ORI-RN-004-1/cycle-6/green/web/`.)
- ios: light + dark PASS (maestro exit 0, marker visible, 8 provider records incl.
  aborted Stop legs). No regression — re-confirmed in cycle 6
  (`.tmp/FIX-ORI-RN-004-1/cycle-6/green/ios/`).
- android: light + dark PASS with per-turn provider-record gates — 3 `completed`
  + 1 mid-stream `aborted` record per appearance, `Send message` enable asserted,
  focus asserted, stop exercised via the coordinate fast path
  (`.tmp/FIX-ORI-RN-004-1/cycle-6/green/attempt2/`).

## Android text-input isolation (Defect B, cycle-3 evidence)

Captured under `android-input-isolation/` (see its README.md):
- `dumpsys-input-method.txt` — emulator soft keyboard NOT shown
  (`mInputShown=false`, `mIsImeShowing=false`, `mImeHeight=0`).
- `adb-input-text-hierarchy.json` — `adb shell input text "hello test"` → field
  holds the text and `Send message` is `enabled: true` (the app works).
- `maestro-inputtext-red.txt` + `maestro-inputtext-hierarchy.json` — Maestro
  `inputText` reports COMPLETED but the field reverts and `Send message` stays
  `enabled: false`.
- `bisect-reactcompiler-off-manifest.json` + `bisect-reactcompiler-off-metro.log` —
  the `reactCompiler` OFF re-run (no "state update" error, android legs still FAIL).

## Bisect (Defect B)

`experiments.reactCompiler` ON → OFF, re-ran `--platforms android`: the
"state update before mount" error disappears, the button STAYS `enabled: false`.
React Compiler is NOT the root cause. `app.json` reverted (no diff).

## Root cause (Defect B)

Maestro `inputText` (IME-based) fails on this emulator (soft keyboard not shown:
`dumpsys input_method` → `mIsImeShowing=false`, `mImeHeight=0`); `adb shell input
text` (direct key events) works and enables the button. The app is not broken on
Android.

## Gates

- `pnpm lint` — exit 0 (clean).
- scoped tsc (`tsconfig.live-chat.json`) — exit 0.
- AC-5 compiler case — `passed: true`.
- `pnpm typecheck` / whole-example tsc — fail ONLY on pre-existing
  `tests/sprint-04-generated-reference/code-primitives-contract.test.ts` (proven
  pre-existing with `git stash && rerun`; identical 7 errors with the change
  stashed).
