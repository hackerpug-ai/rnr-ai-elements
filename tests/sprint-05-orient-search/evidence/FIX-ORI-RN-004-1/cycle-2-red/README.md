# FIX-ORI-RN-004-1 — cycle-2 RED / BLOCKED (Android input path)

AC-2 (amended): make the Android leg deliver REAL device text input via
`adb shell input text` (instead of Maestro's IME-based `inputText`), then prove the
composer receives the text, `Send message` becomes enabled, and a real streamed
reply arrives on `emulator-5554`.

## What was implemented

`tests/sprint-05-orient-search/support/live-example-proof.test.ts` now drives the
Android leg with real adb input:

- `adbTypeText` — `adb shell input text` (key events to the focused EditText,
  `%s` for spaces).
- `tapByText` / `elementCenter` / `parseUiHierarchy` — find an element by its
  accessibility text in `maestro hierarchy` and tap its center via `adb input tap`.
- `dismissLogBox` — dismisses the RN LogBox dev overlay (require-cycle /
  state-update warnings) before taps.
- `hideKeyboard` — `adb input keyevent 4` (BACK) to dismiss the soft keyboard so
  the send control is reachable.
- `runAndroidInputFlow` — the full turn sequence: composer-ready → marker →
  seed → follow-up → active Stop, each via adb tap/type + hierarchy asserts.
- `runNativeAppearance` routes Android through `runAndroidInputFlow` (iOS keeps the
  maestro flow, whose `inputText` works on the iOS simulator).

The adb input mechanism itself is proven correct: with `experiments.reactCompiler`
OFF (cycle-3 evidence, `android-input-isolation/adb-input-text-hierarchy.json`),
`adb shell input text "hello test"` puts `text: "hello test"` in the field and
flips `Send message` to `enabled: true`; with reactCompiler ON the same command
also types (verified in a manual maestro-tap step-through where the field held
`ORI-RN-004:TESTMARKER:android` and `Send message` enabled).

## Why the leg still cannot pass (BLOCKED)

With `experiments.reactCompiler: true` (the committed app.json value — write
Prohibited), the Android bundle logs

```
WARN  Require cycle: components/ai/stack-trace.tsx -> components/ai/stack-trace.tsx
ERROR Can't perform a React state update on a component that hasn't mounted yet.
```

and the RN LogBox dev overlay re-appears on **every interaction** (tap → re-render
→ error re-fires → LogBox re-expands). The driver run fails at the marker turn:

```
FAIL: marker did not land in the transcript
{"fieldText":"What would you like to know?","sendEnabled":"false",
 "sendPresent":true,"screenTexts":"… | Message | Send message | !, Require cycle: …"}
```

The composer is visible (field + `Send message` present) but the field reverts to
the placeholder and the button stays `enabled: false` — the adb-typed text does not
stick because the reactCompiler-induced "state update before mount" error drops the
`setText` state update (the controlled `TextInput`'s `value` stays empty).

The charter's cycle-1 bisect already established: reactCompiler OFF → no
"state update before mount" error (but the button stays disabled via Maestro
`inputText`); reactCompiler ON → the error fires. The adb input fix removes the
Maestro-`inputText` dependency, but the remaining reactCompiler-induced error keeps
dropping the typed text on Android, so AC-2's "real streamed reply arrives" cannot
be satisfied while `experiments.reactCompiler` stays true.

## Artifacts

- `android-failed-driver.out` — driver stdout (`completed: false`).
- `android-failed-manifest.json` — android light+dark legs `failed`
  (`hierarchy_has_marker: false`, `latest_backend_record: null`).
- `android-failed-metro.log` — the reactCompiler-ON bundle log (require-cycle WARN +
  state-update ERROR).
- `android-failed-provider-correlation.json` — zero backend records (no round-trip).

The driver `.out` files and full manifests are also under
`.tmp/FIX-ORI-RN-004-1/cycle-2/green/` (the attempted GREEN runs).

## Blocker

`apps/example/app.json` `experiments.reactCompiler: true` is writeProhibited. The
Android leg requires either reactCompiler OFF (removes the state-update error that
drops the typed text) or suppressing the LogBox/error at the app level (also
writeProhibited). Both are a scope amendment.
