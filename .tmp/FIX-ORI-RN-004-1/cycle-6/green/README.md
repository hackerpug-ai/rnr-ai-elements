# FIX-ORI-RN-004-1 — cycle-6 GREEN

All runs against the real stack: emulator-5554 (Android) / iPhone 17 sim
`81487B1E-…` (iOS) / Chromium (web), Expo Go 57.0.9, real Metro on :8095, the
owned ORI-AI-001 backend on :4000 (self-launched with `maxOutputTokens: 4096`),
and the real `gpt-4.1-mini-2025-04-14` Responses endpoint. No mocks anywhere.

## Android — `attempt2/` (GREEN)

```
RNR_S05_IOS_UDID=81487B1E-… RNR_S05_ANDROID_SERIAL=emulator-5554 \
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts \
  --platforms android --run-id FIX-ORI-RN-004-1-C6G2
```

Both appearances (light + dark) PASSED with the full gated sequence:

```
OK: composer ready
OK: marker submitted, echoed, and its reply completed
OK: seed reply streamed to a completed provider record
OK: follow-up streamed to a completed provider record
OK: coordinate send + stop tap at 954,2232
OK: active stop aborted the stream (aborted provider record)
```

Provider correlation (8 records, 4 per appearance): 3 `completed`
(marker/seed/follow-up — every conversational turn hard-gated on its own NEW
terminal record) + 1 `aborted` (the active stop) with 193/231 deltas — the
abort landed ~15% into a stream that runs ~1500 deltas ungated, i.e. a genuine
MID-STREAM stop, not an end-of-stream race.

Per-turn hard gates now in the driver (the cycle-4/5 false-green fix):

- `focusField` asserts `focused=true` on the `Message` node before typing
  (re-tapping up to 4 times, dismissing the LogBox each round).
- `sendEnabled` asserts the `Send message` node reports `enabled=true` after
  typing — AC-2's literal observation, previously never checked.
- `hideKeyboard` sends BACK only when `dumpsys` proves an IME is showing, so
  the keypress can never propagate to the activity and navigate away.
- `dismissLogBox` handles ALL THREE overlay forms: the full LogBox list
  ("Dismiss"), the expanded detail view ("Minimize" only), the minimized "!"
  banner, plus the expanded notification shade (gated on its unique
  "Clear all" marker so BACK can never reach the activity).
- Every conversational turn gates on a NEW `completed` provider record; the
  stop turn gates on an `aborted` record. A lost race is a hard FAIL.

## Android — `attempt1/` (the honest intermediate failure)

The first reworked run (run id FIX-ORI-RN-004-1-C6G1) cleared turns 1-3 with
real gates but LOST the stop race in both appearances: the tap sequence between
the send and the stop tap contained two ~9 s `maestro hierarchy` captures plus a
~8 s accessibility tap, putting the first stop tap ~25 s after the send —
exactly at the essay's natural end (records: 1138- and 1495-delta `completed`
essays, zero aborted). This is the same failure shape the committed driver's
cycle-4 false green captured, now VISIBLE as a hard FAIL instead of a pass —
the gates work. The fix that produced attempt 2: the stop turn's hot path sends
AND stops by coordinate with zero device reads between (send tap → 2 s for the
Send→Stop morph → stop tap), keeping the slow verified rounds (overlay dismiss,
did-the-send-land check via field text, maestro re-send) only as fallback.

## iOS — `ios/` (regression, AC-3)

```
RNR_S05_IOS_UDID=81487B1E-… RNR_S05_ANDROID_SERIAL=emulator-5554 \
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts \
  --platforms ios --run-id FIX-ORI-RN-004-1-C6IOS
```

Both appearances PASSED (maestro exit 0, full flow: empty state, marker typed +
echoed, seed, follow-up, long prompt, "Stop generating" tapped mid-stream, back
to "Send message"). Provider correlation: 8 records — 3 `completed` + 1
`aborted` (246/125 deltas) per appearance. The `completed:false` in
`ios-regression.out` is the driver's 3-platform counter (only ios ran), not a
leg failure. NO REGRESSION.

## Web — `web/` (regression, AC-3)

```
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts \
  --platforms web --run-id FIX-ORI-RN-004-1-C6WEB
```

PASSED, and strictly stronger than the committed web green: the reworked
`driveLiveWeb` submits the SEED prompt before asserting the rain reply (the
driver previously asserted "rain" from a reply to a prompt it never sent — the
documented cycle-2/3 false negative). Every drive boolean is true:

```
emptyStateVisible, markerSubmitted, inputCleared,
assistantResponded, stopControlVisible, followUpRecallVisible  → all true
```

3 `completed` provider records through the same-origin reverse proxy to the
real backend + OpenAI. (`completed:false` in `web-regression.out` is again the
3-platform counter — only web ran.) NO REGRESSION.

## Static gates

- `pnpm typecheck` — **exit 0** (root tsc + registry tsc clean).
- Scoped gate `pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json`
  — **exit 0** (also recorded inside `ac5-compiler-case.out`).
- AC-5 compiler case — **passed: true** (`ac5-compiler-case.out`; scoped exit 0,
  route + screen + message + conversation in the program, negative control
  holds).
- Whole-example diagnostic `pnpm --dir apps/example exec tsc --noEmit` — exit 2,
  errors confined to `apps/example` gallery/server/component files this diff
  never touches (retained verbatim in `whole-example-tsc.out`, per the charter's
  "retained with its exit status").
- `pnpm lint` (`biome ci .`) — PASSES via the pre-commit hook (righthook runs it
  in a clean environment), after two fixes in this cycle's diff: a >100-col
  format violation on one new `logs.push` line, and a
  `fallow-ignore-next-line complexity` pragma for `dismissLogBox` (the rework's
  two extra overlay branches pushed it past fallow's cognitive threshold; the
  file's existing convention for its other long driver functions).
  NOTE on the `.out` files: `lint*.out` in this directory capture biome dying
  with exit 254 "Linter process terminated abnormally (possibly out of memory)"
  when invoked from THIS AGENT'S shell — including on the clean tree (stash
  rerun) and unsandboxed. That is an artifact of the agent shell's shimmed PATH
  (cmux-cli-shims/rtk), NOT a repo or machine defect: the same binary run with a
  clean PATH (`env -i … node_modules/.bin/biome ci …`) works fine (exit 0 on a
  sampled pre-existing-infos file), and the hook's own run produced real
  diagnostics. They are retained as the record of that environment quirk.
