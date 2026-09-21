# FIX-ORI-RN-004-2 — evidence

Task: bound and heartbeat every leg-phase await in the Uniwind live-proof driver
(`tests/sprint-05-orient-search/support/live-example-proof.test.ts`) so the
orchestrated web leg cannot idle indefinitely, while leaving the
`runLiveExampleProof` / `options.backend` (OwnedBackendHandle) seam
contract-identical for ORI-AI-002's runner.

## Root cause (isolated)

The orchestrated stall of run `ORI-AI-002-1789929365070` (ios + android legs
passed, then a silent, childless, manifest-less idle for 45+ minutes) matches a
class of **childless unbounded awaits** in the driver's post-native pipeline:

1. **Demonstrated live (in-vitro, RED artifact)** — `stopServer` awaited
   `server.close(callback)`. Node completes that callback only after EVERY
   connection to the proxy has ended; the driver had no bound, no idle sweep,
   and no forced-connection fallback, so the wait's completion was delegated
   entirely to peers. RED run at candidate `42e13ae5`: with one real open
   connection (a POST whose body never completes) on port 8406, the close stayed
   unresolved for **70070 ms** (threshold 60000) and completed ONLY when the
   probe destroyed its own socket (`close_resolution: "peer-departure"`).
   See `.tmp/FIX-ORI-RN-004-2/red.json`.
2. **Locus consistent with every observation of the orchestrated run** — the
   pipeline-tail `await session.stop()` in `runLiveExampleProof`'s finally on a
   CALLER-PROVIDED backend handle. By the time it runs, `runAllLegs`'s finally
   has already stopped Metro (no expo child), Chromium is closed (no chromium
   child), adb reversals are removed, and the manifest is not yet written —
   exactly "no chromium/expo/adb/maestro children, no live run-manifest, idle
   event loop". The real `OwnedBackendHandle` bounds its own stop internally, so
   this can only pend with a caller-side adapter handle (ORI-AI-002's
   file-adapter, write-prohibited to this task) — it cannot be reproduced
   in-scope without that adapter, which is why the reproduced unbounded behavior
   is the in-vitro close-class wait (the charter's second menu option, recorded
   as such in red.json).

The reaper hypothesis (environmental deletion inside the leg) was not needed to
explain the stall: the driver's own unbounded awaits suffice, and no reaper
deletion occurred inside these runs (the tmpdir web dist survived every leg;
one historical dist sweep happened between runs only).

## Fix (GREEN)

Every leg-phase await is bounded and heartbeated (`boundWait` races each wait
against an explicit bound; `heartbeat()` appends run-scoped records to
`tests/sprint-05-orient-search/evidence/ORI-RN-004/heartbeat.log` and the
console):

- proxy listen: 30 s bound (`web/proxy-listen*`)
- proxy close: idle sweep up front, 20 s bound, then `closeAllConnections()`
  forced destruction (`web/proxy-close*`) — GREEN run: the active-SSE open
  connection survived the idle sweep and the bound fired at **20007 ms** with
  the `web/proxy-close/stalled` diagnostic naming step, port 8406, and the last
  heartbeat
- Chromium launch: 60 s; browser close: 30 s; context close: 30 s
- backend session stop/restart (including CALLER handles): 120 s
  (`backend/stop*`, `backend/restart*`) — this bounds the pipeline-tail stop;
  on expiry it heartbeats `pipeline/final-backend-stop/stalled` and the
  manifest is still written
- per-leg wall-clock budgets (web 840 s, ios/android 2400 s) — a leg that
  exceeds its budget becomes a failed outcome whose diagnostic names the
  platform, budget, and last heartbeat, and the run continues to the manifest

Web-leg heartbeat granularity: 22 `web/`-prefixed entries in the GREEN live run
(leg start, export, proxy listen/listening, chromium launch, 8 drive phases,
browser/context/server close, leg end), all timestamp-ordered, run-scoped, and
emitted by the running driver.

## RED → GREEN

- RED: `.tmp/FIX-ORI-RN-004-2/red.json` — exit 1 at candidate `42e13ae5`
  (driver byte-identical to the charter merge except additive exports);
  unbounded close unresolved at 70070 ms, 0 heartbeat entries, no stall
  diagnostic. A weak first red (the essay stream ended naturally at 25 s so the
  close was never blocked) is preserved under `.tmp/FIX-ORI-RN-004-2/red-attempt-1/`.
- GREEN: `.tmp/FIX-ORI-RN-004-2/green.json` — exit 0; all ten assertions true
  (in-vitro close bounded at 20007 ms with the stall diagnostic, driver stall
  diagnostic emitted, probe abort record real, web leg passed under the
  caller-owned-backend seam, fresh manifest + correlation for the run id,
  manifest key set frozen, 6 correlation records with 5 completed + 1 aborted,
  >= 8 ordered web heartbeats). Run binding in `.tmp/FIX-ORI-RN-004-2/run.json`.

## Interface freeze (unchanged)

`runLiveExampleProof(options)` signature and options (including
`options.backend: OwnedBackendHandle`), the `--platforms` / `--case` CLI flags,
the `run-manifest.json` literal key set (task, run_id, candidate_head_sha,
generated_at, commands, source_sha, backend, passed_platforms, completed, legs),
the `provider-correlation.json` schema, and the BackendSession restart
semantics are unchanged; `serveWithChatProxy`, `stopServer`, `BackendSession`,
`heartbeatRecords`, `HeartbeatEntry`, and `StallError` are additive exports for
the orchestration harness. Note: `completed` in the manifest still means
"3 platforms passed", so a web-only invocation records `passed_platforms: 1`
and `completed: false` — pre-existing semantics, deliberately untouched.

## Gates

- `pnpm exec tsx tests/sprint-05-orient-search/web-leg-orchestration-proof.test.ts` — exit 0 (GREEN above)
- full three-platform matrix, AC-5 compiler case, `pnpm typecheck`, scoped
  Biome — see the task commit messages and `.tmp/FIX-ORI-RN-004-2/` for their
  captured outputs.
