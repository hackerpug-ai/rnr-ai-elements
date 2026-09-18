# ORI-RN-004 cycle 3 — GREEN

## Commands

```
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler
```

## Final GREEN run

`ORI-RN-004-C3F-1789744559` (the committed record, on the final refactored source; preceded by `ORI-RN-004-C3G6-1789743015` with identical 3/3 results) — **3/3 platforms, `completed: true`**, all five
legs (ios light/dark, android light/dark, web) `passed`:

- iOS retry legs: `endpoint loss + retry OK (new request K5yVk5icybN3nlSq /
  kNBoXfZynpqxYiLu, exactly 1 retained user turn — oracle channel:
  hierarchy-after-scrollUntilVisible)`.
- Android retry legs: same channel, exactly 1, new request ids
  sERXM7yFB1mCyk08 / 1t1XPqIOrW7NNo5M.
- Web: full drive-result flags all true.
- Backend for the run: 24 records = 20 completed + 4 aborted + 0 error
  (4 active-stop aborts, 20 completed conversational + retry turns).

AC-5 rerun on the final source: `passed: true` (scoped compiler exit 0, program
includes route + screen + message + conversation, negative control holds;
whole-example diagnostic exit 2 retained separately).

## What it took (RED → GREEN iterations, all on the real stack)

1. **RED** (`ORI-RN-004-1789731738223`): web passes; all 4 native legs read the
   probe 0x — the inherited oracle counted the a11y tree wherever the viewport
   happened to sit; by retry time the transcript spans ~6 screens and the
   inverted list's stickiness never returns on its own.
2. The oracle gained verified-scroll channels. Android passed immediately
   (scrollUntilVisible + element count). iOS needed three more findings, each
   proven on-device with pixel-verified captures (Vision OCR + CG bitmap
   histograms; the harness's image viewer served cached renditions by basename
   twice and lied to my eyes — only local pixel reads were trusted):
   - Maestro's `hideKeyboard` does NOT dismiss this app's keyboard; a tap on
     the unhandled transcript region does (`keyboardShouldPersistTaps="handled"`).
   - The composer keeps keyboard focus through the whole retry phase; with the
     keyboard up, ~40% of the screen is IME, the scroll affordance is covered,
     and gestures below ~60% height are eaten.
   - RN aggregates descendant labels onto container elements: one rendered
     probe bubble matched at both the cell wrapper and the inner Text
     (attempt-5's phantom 2). The counter now counts innermost matches.
   - A mid-session concurrent edit flipped `scrollUntilVisible` to
     `direction: UP`, breaking the Android legs (attempt 4); reverted to DOWN
     per Maestro's documented content-direction semantics and the passing runs.
3. Two runs (attempts 2-4 window) were lost to an unattributed concurrent
   duplicate driver fighting over the same devices/port (all failure modes
   contamination: garbled typing, "Live chat never appeared", backend restarts
   killing each other's records). Its orphaned owned children (backend :4000,
   Metro :8095) were identified by worktree path/port and cleaned before the
   clean attempt.
4. One environment gap: the pinned Expo Go 57.0.9 APK scratch cache was
   missing; re-fetched from the official `expo/expo-go-releases` GitHub release
   pinned in the sprint proposal to the exact expected path.

## Other gates (all exit 0)

- `pnpm typecheck` (root tsc + registry)
- `./node_modules/.bin/biome ci .` (163 files; repo-wide; apps/example is
  excluded by biome.json includes — the scoped RUNTIME_COMMANDS lint on the
  task's own files also exits 0 checking the driver)
- `pnpm check:fallow` (14 changed files, no issues)
- `pnpm exec playwright test ... --grep FLOW-DOCS-02-quickstart-chat-screen`:
  cannot run — the locked flow's spec
  (`tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts`) does not
  exist on any branch (ORI-CONT-004's future output; outside this task's
  writeAllowlist). Captured under `playwright-flowdocs02-missing-spec.log`.

## Artifacts

- `full-run-final.log` — the committed run's console result (`completed: true`).
- `full-run-6.log` — the first full 3/3 run (pre-refactor source).
- `run5-id.txt` / `full-run-5.log` + `attempt-5-android-web-pass/` — the
  iteration that isolated the iOS aggregation phantom.
- `attempt-1-android-web-pass/` — the iteration that first proved Android+web.
- `../red/` — the cycle's RED record.
