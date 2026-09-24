# ORI-AI-002 — cycle 5 RED (captured 2026-09-23, worktree @ 965c7540)

The committed state has still never concluded the task's two exact commands.

1. `validate-red.txt` — the runner's own evidence validator at committed HEAD against
   `tests/sprint-05-orient-search/evidence/ORI-AI-002` (the cycle-4 c4h artifacts):

   ```
   exit=1
   REJECTED: runId mismatch: manifest run_id ORI-AI-002-1790137909633 != expected
   REJECTED: support/nativewind-live-example.ts: manifest digest != recomputed
             (the FIX-ORI-AI-002-1 baseline fix changed the driver bytes)
   REJECTED: nativewind-web: screen-recording.mp4 / streaming.png / recovered.png missing
   5 accepted target records (nativewind-web rejected)
   ```

2. The cycle-4 blocked record (`.tmp/ORI-AI-002/cycle-4/blocked-report.json`,
   committed) documents the marathon failure this cycle must clear: the
   nativewind-ios marker baseline race, reproduced 3/3, fixed by FIX-ORI-AI-002-1
   (5d624e10, merged at tip 965c7540). The live exercise of that fix IS this
   cycle's six-target matrix run.

A fast vitest RED was not re-run for the same reason as cycle 4: its first test
awaits a fresh 1.5–2h matrix whose committed-state failure is evidenced by items
1–2. `pnpm typecheck` is green at the tip.

Devices cold-rebooted before the run (reserved only): iOS 81487B1E-A4D1-45AE-9BCE-
D675802BACD1, Android emulator-5554 (Pixel_7_API_34, -no-snapshot-load). Unrelated
sim 9051A0C2 untouched. Children run with TMPDIR=/tmp/ori-ai-002-scratch.

## 3. c5a — the fix works; a second, smaller defect surfaced

`matrix-c5a-indexhtml-reject.log` (full run ORI-AI-002-1790185559636): with the
FIX-ORI-AI-002-1 driver, the nativewind LIVE phase passed all three legs (ios/
android/web — the baseline race is gone). Five of six targets synthesized with
full artifacts. The run still exited 1 on the nativewind web-self phase:

- `nativewind/web-self did not complete: no web export dist found from the live phase`

Root cause (this cycle's findWebDist defect, fixed in the same allowlisted file):
`findWebDist` required `index.html` as the dist entry. apps/example (uniwind)
exports a root route — index.html exists. The nativewind consumer's only route is
/live-chat, so its export contains `live-chat.html` (+not-found.html, _sitemap…)
and NO index.html; the validator-quality dist was rejected and web-self orphaned.
The web-self session navigates directly to /live-chat (the proxy serves
live-chat.html fine), so the entry check was the only flaw. Fix: distHasEntry()
accepts index.html OR live-chat.html in both the kept-copy and newest-dist checks.
