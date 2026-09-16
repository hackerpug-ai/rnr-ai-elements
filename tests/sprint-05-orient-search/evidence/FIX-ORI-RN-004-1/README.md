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
- **Defect B (HYPOTHESIS) — root cause determined, NOT a code bug, NOT in scope.**
  The bisect (reactCompiler OFF) removes the "state update before mount" error but
  does NOT enable the button. Direct `adb shell input text` DOES enable the button
  on Android; Maestro's `inputText` silently fails to type (emulator soft keyboard
  not shown). The Android composer is functional; the Android leg's RED is a
  Maestro/emulator input artifact. Per the charter escalation rule, reported for a
  scope amendment (do not expand the diff beyond WRITE-ALLOWED).

## RED (pre-fix)

- web: static export client bundle has "not configured", browser fails at
  `getByLabel('Message')` (see `.tmp/FIX-ORI-RN-004-1/cycle-1/red/`).
- android: `Send message` `enabled: false` after Maestro types the marker; metro
  log line 43 "Can't perform a React state update …" (reactCompiler ON).

## GREEN (post-fix)

- web: composer renders, 2 completed provider records, follow-up + stop legs pass
  — see `web-green-manifest.json` + `web-green-provider-correlation.json` (the
  per-leg `assistantResponded` flag is false because the model's seed response did
  not literally contain "rain"; the round-trip is proven by the 2 completed
  records).
- ios: light + dark PASS (maestro exit 0, marker visible, 8 provider records incl.
  aborted Stop legs). No regression.

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
