# ORI-AI-002 — cycle 4 RED (captured 2026-09-22, worktree @ bb9cc0d6)

The committed state has never concluded the task's two exact commands. Cycle RED is
that absence plus the two real failures this cycle hit and fixed, each demonstrated
with the strongest honest fast evidence:

## 1. The committed evidence tree fails the task's own validator

`validate-red.txt` — at committed HEAD:

```
node tests/sprint-05-orient-search/run-live-example-proof.mjs \
  --validate tests/sprint-05-orient-search/evidence/ORI-AI-002
exit=1
REJECTED: manifest.json is missing
0 accepted target records:
```

The evidence tree contains only `proof.red` (cycle 1). The six-target matrix command
has produced no concluded artifacts in any committed cycle. Cycle-3's committed
attempts (`.tmp/ORI-AI-002/cycle-{1,2,3}/`) are the behavioral RED for the matrix
command itself (`backend/restart/error — owner did not relisten`, and the c3b undici
crash), whose fixes (FIX-ORI-RN-004-3 e1c33f94, d4938bb3) are merged at HEAD.

## 2. Marathon crash at `backend/stop` during an actively streaming stop-turn

`matrix-c4-crash.log` — the exact six-target command at HEAD (plus the cycle's
diagnostics) crashed 44 minutes in, at the uniwind live web leg:

```
[heartbeat 2026-09-22T20:58:11.896Z] web/drive/stop-turn-checked — stopControlVisible=true
[heartbeat 2026-09-22T20:58:11.897Z] backend/stop/start — port=4000
TypeError: terminated ... SocketError: other side closed (remotePort 4000)
Unhandled 'error' event → process death
```

The browser's Stop is not propagated upstream (documented driver behavior), so the
stop-turn's long generation was still streaming through the driver's teeing proxy
when the backend owner's `closeAllConnections()` destroyed the socket mid-body; the
piped body Readable errored with no listener.

`smoke-web-crash.log` — a web-only uniwind run reproducing the same signature in
~8 minutes (the fast repro): live web leg, `stopControlVisible=true`, crash at
`backend/stop/start`.

FIX (this cycle, `tests/sprint-05-orient-search/live-example-proof.ts`, allowlisted):
the backend owner now closes gracefully and bounded (`closeBackendGracefully`,
60s force bound < the driver's 120s backend-op bound) so in-flight SSE finishes
before the socket dies. Also hardened: the orchestrator's own teeing proxy consumes
its upstream body through an error-listened `Readable.fromWeb` bridge, and
`verifyRestoredModel` drains its response body before stopping its backend (two
more instances of the same unhandled-error class).

GREEN for the fix: `../green/smoke-web2-graceful-close.log` — same web-only run:
`stopControlVisible=true` → `backend/stop` drains 10.1s → no crash →
`web/drive/retry-checked — completed=true singleUserTurn=true`, `passed=1`.

## 3. The agent-scratch reaper ate the marathon's scratch tree mid-run

`matrix-c4b-reaper-run.log` — with the crash fixed, the full six-target command ran
to a clean teardown (no crash; `matrix-teardown model_restored=true
owned_listeners=[]`) but failed on:

- `nativewind/live did not complete: legs failed`
- `nativewind/web-self did not complete: no web export dist found from the live phase`
- `screen-recording.mp4 was not produced` for all four native targets (segment dirs
  under the tmpdir phase root were deleted before concat)

The child inherited `TMPDIR=~/.cache/agent-scratch`; the reaper swept the phase
roots mid-run. The rerun uses `TMPDIR=/tmp/ori-ai-002-scratch` (short path — the
worktree path is too long for tsx's IPC pipes, `listen EINVAL` — and outside the
reaper's tree).

A full `pnpm exec vitest run` RED was NOT re-captured this cycle: the suite's first
test spawns the real matrix runner (a 1.5–2h marathon) and the committed state's
failure of that command is already evidenced above. Faking a faster vitest red
(e.g. by tampering with evidence) would not be honest RED.

Devices: iOS 81487B1E-A4D1-45AE-9BCE-D675802BACD1 booted, Android emulator-5554
(Pixel_7_API_34) booted; the unrelated booted simulator 9051A0C2 untouched.

## 4. Final blocker — nativewind-ios marker baseline race (reproduced 3/3)

`matrix-c4h-baseline-race.log` (+ c4e/c4g in server-events.jsonl leg diagnostics):
the nativewind iOS live marker turn fails as "no terminal record" while the
observed records list CONTAINS the completed marker record. The driver's
`awaitTurn` baseline (support/nativewind-live-example.ts:1574) is taken AFTER the
maestro send flow returns; the flow's teardown outlasts the ~1.7s marker reply, so
the record lands at index == baseline and `records.length > baseline` never fires.
Same-file precedent for the fix: the stop-turn drives take the baseline BEFORE the
flow (line 1677). The file is ORI-RN-005-owned and write-prohibited to this task.

Environment repairs made along the way (machine-level, not repo): `brew reinstall
ffmpeg` (broken dyld linkage killed every android recording concat), and the
marathons run with `TMPDIR=/tmp/ori-ai-002-scratch` (short path — the worktree
path overflows tsx's IPC pipe; outside the agent-scratch reaper's tree).
