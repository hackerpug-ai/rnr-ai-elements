# ORI-RN-005 — evidence

The independent NativeWind live-chat proof. **ALL FOUR task verify commands are
GREEN.** The canonical AC-2 run (`ORI-RN-005-1789778781976`, root of this
directory) and the AC-3 selector run (`ORI-RN-005-1789808618192`, under
`ac3-run/`) each passed 3/3 platforms, 5/5 legs through the exact vitest commands
in the task file, with 24 sanitized provider records apiece (20 completed + 4 real
mid-stream aborts, all `gpt-4.1-mini-2025-04-14`).

## The canonical run

- `manifest.json` — run identity, candidate SHA, the five byte-identical source/target
  SHA-256 pairs, resolved versions (`nativewind 4.2.6`, `tailwindcss 3.4.19`,
  `uniwind: missing` — no engine mixing), public registry hashes, and the five
  passed legs.
- `provider-correlation.json` — 24 sanitized records on the owned backend: 20
  completed + 4 aborted (one REAL mid-stream provider abort per native appearance),
  every record on `gpt-4.1-mini-2025-04-14`.
- `ios/{light,dark}/`, `android/{light,dark}/` — per-leg `flow.log` (the verbatim
  interaction log: empty state → nonce marker → seeded count turn with sampled
  growth → contextual follow-up with the marker-recall text oracle → active Stop →
  endpoint-loss + sanitized Retry → retry on a NEW provider request with exactly 1
  retained user turn), `screenshot.png`, and the transcript oracle's
  `retry-state.png`.
- `web/` — the Chromium-driven leg's `final-state.png` capture.
- `teardown.json` — backend stopped, metro stopped, web proxy closed, consumer
  removed, zero adb reverse mappings, both native appearances restored (and the
  Android Do-Not-Disturb flag restored to its captured pre-leg value).
- `metro.log` — the run's Metro output; `install-exact-source.json` +
  `install-log.txt` — the AC-1 receipts (verbatim public recipe, 5/5 SHA pairs,
  tsc 0, expo-doctor 21/21).

## What cycle-2 hardened (each fix answers a real RED)

The cycle-1 blockers (the screen's `useUniwind` import; the unexported `THEME`) were
fixed upstream by FIX-ORI-RN-005-1 (de21fa6c). The remaining cycle-2 REDs and their
fixes, all in the driver/test (this task's files):

1. **Growth oracle** — a max-text-length reader goes blind when a later reply is
   shorter than an earlier one, and the native capture cadence (~9s) exceeds the
   seed turn's stream. Now: a distinct length-SET harvest (>40-char texts) across
   the seed sampler, mid-essay capture (Android), post-abort partial, and the
   essay-window DOM poll (web).
2. **Follow-up recall** — "marker still on screen" is vacuous, and a count-above-
   baseline read goes flat on the virtualized transcript (the answer ADDS an
   occurrence while the oldest turn EVICTS one). Now: marker-bearing TEXT set
   difference — a new text can only be the answer.
3. **iOS Stop** — the control's label never appears in iOS hierarchy dumps, and a
   split type→send→wait flow loses the race to the essay's end. Now: ONE combined
   Maestro flow (type, send, `extendedWaitUntil` Stop, tap) — ORI-RN-004's proven
   shape — plus iOS keyboard dismissal before transcript reads (the IME shifts the
   virtualization window and unmounts the bubbles being read).
4. **Android Stop** — heads-up system notifications ("Set a screen lock") re-expand
   the shade over the composer inside the widened stop window and eat the taps.
   Now: Do-Not-Disturb for the leg (captured + restored) and a statusbar collapse
   in the instant before the stop tap.
5. **Provider error bursts** — transient OpenAI errors (~10.5s each, in clusters)
   on random turns. Now: a provider `error` is terminal (not a silent 120s burn)
   and recovers up to twice through the app's own public Retry control with a
   bounded backoff; an Android send that never dispatched (field still holds the
   prompt) re-sends once.
6. **Harness kills** — the test's 30-min spawnSync timeout SIGTERMed the driver
   mid-leg; Vitest's inherited `NODE_ENV=test` made RN's dev-middleware refuse to
   boot Metro ("DefaultToolLauncher must be mocked"); killed runs orphan their
   backend/Metro and block the next. Now: 60-min spawnSync timeout, NODE_ENV
   stripped (test) and scrubbed from Metro/export spawns (driver), an
   identity-verified orphan reaper (never killing by port alone), incremental
   manifest + per-leg flow.log writes, a persisted driver-error.log, and a
   kill-discriminating retry in the tests (a CONCLUDED failed run never retries).

## Reproduce

```
pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-install-exact-source
RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1 RNR_S05_ANDROID_SERIAL=emulator-5554 \
  pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-live-three-platforms
```

## Cycle-3 note (AC-3 selector)

Three further attempts on the quiet host (logs under `.tmp/ORI-RN-005/cycle-3/`):
attempt A concluded with an iOS stop-timing miss and the (since-fixed) widened
Android stop window; attempt B's RUN COMPLETED FULLY GREEN — run
`ORI-RN-005-1789792426372`, all five legs passed, `completed: true` — but the
selector still failed on a test-side bug (the web branch grepped the native flow-log
phrasing instead of asserting the web booleans, all of which were true); that bug is
fixed in this commit, and attempt B's artifacts were overwritten by attempt C before
the fix could be verified. Attempt C concluded with an Android stop-timing race (all
coordinate taps landing after the essays' natural end) and one aborted-marker-record
anomaly — the same classes that pass in other runs of the identical driver. No
external kills occurred in cycle 3; every attempt concluded and tore down cleanly.

## Cycles 4-6: the evidence-discriminating stop-turn retry

Cycle 4 added the bounded, record-proven stop-turn drive retry (re-drive ONLY when
the records show that drive's essay reached a terminal completed/error outcome with
no abort; verified aborts never re-drive; missing records never re-drive; every
decision logs STOP-RETRY-EVIDENCE / STOP-RETRY-EXHAUSTED with its record query).
Cycle 4 also pinpointed the provider's intermittent short-essay serving (~1.5s /
<=68-delta completions vs the 421-527-delta essays the iOS stops abort) and cycle 5
raised the drive bound to 6 per leg, which reliably carried Android. Cycle 5's iOS
legs exhausted with observed null (the send never dispatched — the reserved
simulator's IME channel degraded under ~20 marathon runs); the coordinator's full
simulator reboot restored it, and cycle 6's run — the committed cycle-5 driver,
byte-identical — passed the AC-3 selector end to end (all five legs, 4 real
mid-stream aborts). Attempt logs for every cycle live under
`.tmp/ORI-RN-005/cycle-{3,4,5,6}/`.

The pinned Expo Go 57.0.9 Android APK lives at
`~/.cache/agent-scratch/opencode/ori-rn-003/Expo-Go-57.0.9.apk`; if the scratch
reaper removes it, restore it from the official
`expo/expo-go-releases` GitHub release (tag `Expo-Go-57.0.9`) to that exact path.

Owned ports (distinct from ORI-RN-004's): backend 4010, Metro 8097, web 8408.
