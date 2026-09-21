# FIX-ORI-RN-004-3 — evidence

Task: un-stick the live-proof driver's caller-backend restart path after the
endpoint-loss stop (`tests/sprint-05-orient-search/support/live-example-proof.test.ts`),
with the task-owned caller-handle harness
(`tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`).

## The observed stall

Run `ORI-AI-002-1789975643876` (ORI-AI-002 cycle 3): with the FIX-ORI-RN-004-2
bounded driver adopted, the web leg's endpoint-loss backend stop completed
through the caller's `options.backend` handle (heartbeat `backend/stop/start`
at 08:04:18; the owner adapter executed the stop per its status file) and the
driver never issued the following restart — no restart command in the owner
adapter's command file, no further heartbeats for 30+ minutes, past the 120 s
backend bound and the 840 s web-leg budget, orchestrator alive in kevent, no
chromium/expo/adb children, no manifest.

## Root cause (isolated)

Two facts, both proven by isolation:

1. **The post-stop decision window carried zero observability and zero
   driver-side bounds.** Between `backend/stop/done` and `backend/restart/start`
   the pre-fix driver ran five Playwright awaits (`textarea.fill` the probe,
   `send.click`, the `Retry` wait, the alert read — then `session.restart()`)
   with no heartbeat and no bound of its own; their only enforcement was
   Playwright's in-process 30 s default, invisible to the driver's heartbeat
   log. The pre-fix RED run's own heartbeat slice documents the silent window
   (`backend/stop/done` at 09:32:39.921 directly followed by
   `backend/restart/start` at 09:32:39.990 — nothing in between, attempt-1
   slice under `.tmp/FIX-ORI-RN-004-3/red-attempt-1/`).
2. **No single in-process await can produce the observed 30-minute silence in a
   healthy event loop — the stalled process's loop itself was not advancing.**
   Isolation probes over the real Playwright stack (scratch probe, not
   committed): the browser child is a DIRECT child (no separate Playwright
   driver process); with the browser frozen (SIGSTOP) a pending `fill` rejects
   at exactly 30003 ms (the in-process timer fires); with the browser killed it
   rejects in 4 ms. Every `boundWait` timer and the 840 s leg budget likewise
   fire in a healthy loop, and the documented caller-adapter pattern bounds its
   own stop (10 s) and restart (15 s). A silence that outlives ALL in-process
   timers therefore requires the loop to stop advancing (suspension /
   starvation / sync-block — the await-point-only backstop class recorded in
   FIX-ORI-RN-004-2's concerns), which no in-process bound can catch. That
   residual class is why every driver invocation in the harness runs as a child
   process under an outer watchdog.

## Fix

Every segment between the `backend/stop/*` family and `backend/restarted` is
individually bounded and heartbeated in the driver (constants
`WAIT_BOUND_WEB_SEGMENT_MS = 60_000` / `WAIT_BOUND_NATIVE_SEGMENT_MS = 120_000`,
both <= 120 s, visible in the source):

- web (`driveLiveWeb`): `web/endpoint-loss/probe-fill`, `probe-send`,
  `retry-wait`, `alert-read`, and `retry-click` — each emits its own
  start/done pair, carries the backend port 4000 in its diagnostic, and
  force-closes the page on expiry so a wedged op cannot outlive its bound;
- android (`runAndroidInputFlow` tail): `android/endpoint-loss/probe-send`,
  `retry-wait`, `retry-tap`, `retry-record`;
- ios (`runIosEndpointLossRetry`): `ios/endpoint-loss/probe-type-send`,
  `retry-wait`, `retry-tap`, `retry-record`.

The stop/restart pair itself (`backend/stop/start` → `backend/stop/done` →
`backend/restart/start` → `backend/restarted`) was already bounded by
FIX-ORI-RN-004-2; its bound is now proven by a live adapter hang (below) rather
than by construction. Native segments whose internals are synchronous
`spawnSync` calls still block the loop while they run — the bound bites at the
next yield; the frozen-loop class remains the harness watchdog's job (documented
in the driver's constants comment).

## RED → GREEN

- RED (pre-fix driver, charter's in-vitro-equivalent menu): the harness child
  ran the real caller-handle web leg (real export, proxy, Chromium, provider
  traffic — marker/seed/follow-up/stop all observed true in the heartbeat
  slice) and was frozen at the `backend/stop/start` heartbeat, reproducing the
  observed stalled PROCESS STATE. Captured in `.tmp/FIX-ORI-RN-004-3/red.json`:
  180628 ms of silence (past every 120 s segment bound), 0 heartbeats after the
  last `backend/stop/*` entry, 0 restart commands in the adapter command file,
  0 `backend/restarted` entries, no manifest, harness exit 1. Divergence
  recorded in red.json: the live 30-minute stall does not reproduce in a
  healthy loop (see isolation above), so the RED reproduces the process state
  rather than the timer-healthy stall. A first harness attempt that froze only
  the tsx supervisor (wrong pid) is preserved on disk under the gitignored
  `.tmp/FIX-ORI-RN-004-3/red-attempt-1/` (outside this commit's evidence
  allowlist; the committed RED artifact is the successful capture).
- GREEN (`pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`,
  exit 0, all 25 assertions true; final clean-provenance run
  `FIX-ORI-RN-004-3-GREEN-1789986430709` recorded in green.json), two children:
  1. **Forced stall (live adapter hang)** — the adapter performs its real stop
     (command file entry, server child stopped, status file updated) then never
     confirms: the driver's `backend/stop` bound fired at ~120 s with the
     diagnostic naming `step=backend/stop port=4000 boundMs=120000
     lastHeartbeat=...`, the leg failed fast, the manifest was still written,
     and the child exited nonzero — FIX-ORI-RN-004-2's "proven by construction"
     bound is now proven by a live adapter hang.
  2. **Caller-handle web leg (AC-2)** — full stop→restart→retry completion.
     Adapter command file: stop (web leg) → restart (web leg) → stop (the
     driver's pipeline-tail stop of ITS restart child — the documented
     ownership split). Heartbeat chain for the run (13 ordered entries, max gap
     5051 ms): `backend/stop/start` → `backend/stop/done` →
     `web/endpoint-loss/probe-fill|probe-send|retry-wait|alert-read` (start+done
     each) → `backend/restart/start` → `backend/restarted`. Fresh
     `run-manifest.json` (run_id matches, `legs[web].status == 'passed'`,
     `completed: false` — the frozen single-platform semantics) and
     `provider-correlation.json` (same run id, 6 backend records: 5 completed +
     1 aborted — the aborted record is the harness's own one real mid-stream
     client abort against the adapter's backend, because the web proxy does not
     propagate client aborts upstream).
- Matrix (`--matrix ios,android,web` through the caller handle, reserved
  devices rebooted first per the marathon-session rule; harness exit 0): run
  `FIX-ORI-RN-004-3-MATRIX-1789986449929` — all three platforms passed
  (ios light+dark, android light+dark, web; manifest `passed_platforms: 3`,
  `completed: true`), the adapter command file recorded 6 stops + 5 restarts
  (one per endpoint-loss cycle plus the driver's tail stops of its own restart
  children), the heartbeat log carries 5 `backend/restarted` entries with the
  per-segment `ios|android|web/endpoint-loss/*` chains ordered, and the fresh
  `provider-correlation.json` for the run holds 76 real backend records
  (65 completed + 11 aborted). The committed `run-manifest.json` /
  `provider-correlation.json` / `heartbeat.log` are this matrix run's side
  effects.

## Interface freeze (unchanged)

`runLiveExampleProof`'s signature and options (including
`options.backend: OwnedBackendHandle`), the `--platforms` / `--case` CLI flags,
the `run-manifest.json` / `provider-correlation.json` schemas, the
BackendSession restart semantics, and the FIX-ORI-RN-004-2 additive exports
(`serveWithChatProxy`, `stopServer`, `BackendSession`, `StallError`,
`heartbeatRecords`, `HeartbeatEntry`) are behavior-identical; the only driver
changes are additive per-segment bounds and heartbeats inside the leg bodies.
ORI-AI-002's committed runner (d4938bb3) invokes the fixed driver unchanged.

## Gates

- `pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts`
  — exit 0 (GREEN above).
- `pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts --matrix ios,android,web`
  — result recorded in `.tmp/FIX-ORI-RN-004-3/green.json` (matrix section).
- `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler`
  — exit 0, all assertions true.
- `pnpm typecheck` — exit 0.
- Scoped `biome ci` on both files — exit 0 (clean-env invocation; direct
  pnpm-wrapped biome dies with the documented environmental exit 254).
- Driver side effects refreshed in place and committed with the run:
  `evidence/ORI-RN-004/heartbeat.log` (append-only; consumers filter by the
  `run` field), `run-manifest.json`, `provider-correlation.json`, and the
  compiler outputs.
