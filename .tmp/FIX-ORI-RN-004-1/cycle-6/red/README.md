# FIX-ORI-RN-004-1 — cycle-6 RED

Fresh replay against the real stack (emulator-5554, Expo Go 57.0.9, real Metro on
:8095, owned ORI-AI-001 backend on :4000, real `gpt-4.1-mini-2025-04-14`), run
2026-09-17 with the COMMITTED driver at branch tip `61e56f55` (the reworked driver
stashed for the duration):

```
RNR_S05_IOS_UDID=81487B1E-… RNR_S05_ANDROID_SERIAL=emulator-5554 \
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts \
  --platforms android --run-id FIX-ORI-RN-004-1-C6RED
```

## What the run shows (`android-red.out`, `run-manifest.json`, `provider-correlation.json`)

Both android legs (light + dark) report **passed**, and this time the provider
correlation shows 3 `completed` + 1 `aborted` records per appearance (530/491
deltas at abort) — i.e. the stop race was WON this run.

That is exactly the defect, not a refutation of it. The committed driver's stop
verdict is a coin flip that does not track whether the stop control was actually
exercised:

- The same committed driver produced the cycle-4 capture
  (`.tmp/FIX-ORI-RN-004-1/cycle-4/committed-driver-pass/` and
  `cycle-4/red/false-green-*.json`): BOTH legs **passed** with 8 records, ALL
  `completed`, ZERO aborted — the stop tap raced an already-finished essay and
  the driver could not tell.
- Today's run won the same race (backend still at the default
  `maxOutputTokens: 1024`, so the essay caps in ~2 s and the +2 s stop tap is a
  race every time). Nothing in the driver changed between the two runs; only the
  race outcome did.

So the committed driver cannot PROVE the AC-2 stop criterion either way:

1. **The stop wait is vacuous.** After submitting the long prompt it waits for
   `'Send message'` to be visible — but the button's `content-desc` never flips
   during streaming (RN Fabric accessibility bug, cycle-3), so the text is
   present for the whole stream and the wait returns instantly whether or not a
   stop ever landed.
2. **No turn gates on a provider record.** A seed/follow-up reply that never
   completed would still pass the leg.
3. **The AC-2 "Send message flips to enabled" observation is never asserted**
   (`sendEnabled` does not exist in the committed driver).
4. **No focus assertion before typing** (`focusField` taps once and prays), the
   minimized LogBox banner strands later taps, and an ungated BACK keypress
   (`hideKeyboard`) can navigate away — the carried-forward cycle-5 findings,
   fixed in the reworked driver and now exercised by the gated flow.

## The GREEN contract for cycle 6

The reworked driver (working tree, this cycle's fix) must pass the SAME
`--platforms android` command with every turn hard-gated on a NEW terminal
provider record (`completed` x3, `aborted` x1 per appearance), an explicit
`Send message` enabled assertion after typing, focus asserted before every type,
and the essay kept genuinely long (`maxOutputTokens: 4096` + a 1200-word demand)
so the stop tap no longer races a capped stream. A lost race is then a hard FAIL,
not a pass.
