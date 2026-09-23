# ORI-AI-002 — cycle 4 GREEN evidence (partial; 2026-09-23)

## What is green, with proof

1. **The marathon crash is fixed** (graceful bounded backend close in the owner +
   error-listened `Readable.fromWeb` body bridge in the teeing proxy + drained
   restore-verify body). `smoke-web2-graceful-close.log`: the live web leg's
   stop-turn (`stopControlVisible=true`) survives `backend/stop` — the drain waits
   10.1s for the orphaned stream, then the retry completes with a single user turn
   (`passed=1`). Four subsequent full marathons (c4b, c4e, c4f, c4g, c4h) all passed
   the previously-fatal stop/restart choreography; `backend/restarted` ~150ms,
   zero process crashes.

2. **Uniwind passes deterministically**: `passed=3 completed=true` in c4e, c4g and
   c4h (`pipeline/manifest-written — passed=3 completed=true heartbeatEntries=160`),
   with full artifacts (recordings, streaming/recovered screenshots, stream growth).

3. **Android recordings fixed**: homebrew ffmpeg was broken on this machine
   (dyld: `libx265.216.dylib` missing after the x265 4.3 upgrade) — every android
   concat died; repaired with `brew reinstall ffmpeg` (now 9.0.1, concat verified on
   the real segments). Plus the recorder's `stop()` now returns disk-present
   segments (late `adb pull`s landed after the 90s race and were dropped from the
   in-memory tally). c4h produced android recordings with no failures.

4. **Mid-matrix device refresh**: `refreshReservedDevices` reboots the RESERVED
   iOS sim + Android emulator between engines (journal `device-refresh-start/end`).
   In c4h it cleared the android follow-up flake from c4g ("follow-up answer never
   added a new marker-bearing text") — nativewind-android PASSED in c4h.

5. **Per-leg diagnostics**: `phase-end` journal events now carry
   `legs[].{platform,status,diagnostic}` — this is what made the remaining blocker
   diagnosable from evidence alone.

## What is still red, and why (the blocker)

`nativewind/live` fails on the iOS marker turn, reproduced identically 3/3 (c4e,
c4g, c4h — `matrix-c4h-baseline-race.log` in ../red/ and the leg diagnostics in
`server-events.jsonl`):

```
FAIL: marker turn ended as no terminal record — observed:
[{"requestId":"…","outcome":"completed","deltaCount":61,…}]
```

The completed record is IN the observed list — the wait predicate
(`records.length > baseline`) can only miss a present terminal record when the
record lands at index == baseline. `runIosInputFlow`'s `awaitTurn` takes the
baseline AFTER `sendTurn` returns (support/nativewind-live-example.ts:1574), but
on iOS the maestro send flow's teardown (~30–90s) outlasts the short marker reply
(~1.7s provider), so the marker's completed record is already in the records file
when the baseline is taken and `length > baseline` never becomes true. The same
file's stop-turn drives already use the correct pattern — baseline BEFORE the
flow (line 1677). The fix is one line of ordering inside the write-prohibited
ORI-RN-005 driver file; it cannot be made from this task's allowlist.

Because the six-target matrix cannot conclude green, `pnpm exec vitest run
tests/sprint-05-orient-search/live-example-proof.test.ts` (which awaits a fresh
matrix) was not re-run this cycle — its failure mode is exactly the marathon
failure documented here, and a 1.5h rerun to reproduce a diagnosed defect adds no
information. `pnpm typecheck` and the scoped biome command are green at the
checkpoint commit.
