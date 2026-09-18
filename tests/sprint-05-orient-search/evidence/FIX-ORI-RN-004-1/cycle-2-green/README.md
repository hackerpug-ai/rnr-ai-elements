# FIX-ORI-RN-004-1 — cycle-2 GREEN / partial (Android driver fix)

AC-2 (cycle-5 approved): fix the proof driver's LogBox/tap-interception so the
Android leg delivers real adb text input and a real streamed reply arrives.

## What was fixed (all in the proof driver)

- `dismissLogBox` — now detects BOTH the full overlay ("Console Warning"/"Console
  Error" + a `Dismiss` control) AND the MINIMIZED banner (a clickable `!` badge,
  `accessibilityText` starting with `!`); it taps the badge to expand, then
  `Dismiss`, and re-checks.
- `focusField` — now taps the field via **Maestro's accessibility-based `tapOn`**
  (a raw `adb input tap` at the same coordinates is intercepted by the LogBox
  overlay), then asserts the `Message` field reports `focused=true` (tap-first,
  bounded retries). The maestro `tapOn` is the key change — it lands on the field
  where `adb input tap` landed on the LogBox.
- `hideKeyboard` — now sends `keyevent 4` (BACK) only when `dumpsys` reports an IME
  actually shown (`mInputShown=true` / `mIsImeShowing=true`), so BACK no longer
  propagates to the Activity when no keyboard is up.
- All taps (`Message`, `Send message`, `Stop generating`, `Dismiss`) now go through
  a new `maestroTap` helper (one-off temp Maestro flow), not raw `adb input tap`.

## Result (real Android emulator, `emulator-5554`)

- `hierarchy_has_marker: true` — the marker lands in the transcript.
- 8 **completed** `gpt-4.1-mini-2025-04-14` provider records (`android-green-provider-correlation.json`):
  marker + seed + follow-up + the long essay each round-trip to the backend.
- `maestro_output`: `OK: composer ready` → `OK: marker submitted and echoed` →
  `OK: seed reply streamed` → `OK: follow-up streamed` → then
  `FAIL: stop control never appeared`.

So the marker / seed / follow-up legs now PASS. The active-Stop leg still FAILS,
and its cause is now isolated to a DIFFERENT root cause than the tap-interception:

## Remaining blocker — "Stop generating" never appears

After submitting the long prompt, the composer's send control STAYS
`accessibilityLabel="Send message"` (never `"Stop generating"`) for the whole
stream, so `waitForText('Stop generating', 30_000)` times out and there is no stop
control to tap. This is the `isGenerating` branch of `PromptInputSubmit`
(`field.status === 'submitted' || 'streaming'`), i.e. `useChat`'s `chat.status`
never flips to `submitted`/`streaming` on Android.

Verified NOT reactCompiler: re-running the leg with `experiments.reactCompiler`
OFF (temporary, uncommitted) gives the IDENTICAL `FAIL: stop control never appeared`
(and the same 8 completed records), so the cycle-4 "reactCompiler drops setText"
claim is doubly refuted — the text sticks, but the STATUS does not flip. The status
wiring (`useLiveChat`/`@ai-sdk/react` `useChat` → `PromptInput` `status` prop) is
the remaining Android-specific issue, outside the proof driver's WRITE-ALLOWED
scope (it lives in `apps/example/lib/use-live-chat.ts` or the ORI-RN-004-owned
`components/ai/prompt-input.tsx`).

## Artifacts

- `android-green-manifest.json` — android light+dark legs: marker/seed/follow-up
  pass, stop fails (`hierarchy_has_marker: true`, `stopPresent: false`).
- `android-green-provider-correlation.json` — 8 completed provider records.
- `android-green-metro.log` — the reactCompiler-ON bundle log.
- `.tmp/FIX-ORI-RN-004-1/cycle-2/green/` — the driver `.out` files from each run.
