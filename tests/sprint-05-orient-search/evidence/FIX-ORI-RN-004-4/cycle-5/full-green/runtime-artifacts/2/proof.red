ORI-AI-002 — cycle 1 RED (captured 2026-09-19, worktree ORI-AI-002 @ cf02a240)

Command:
  pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts

Exit: nonzero (4 failed / 0 passed)

The four named integration tests were written BEFORE the runner/validator
existed and failed against missing real evidence (the honest behavioral RED):

1. ORI-AI-002-AC-1-stream-history
   AssertionError: the real matrix runner must succeed (tail of output):
   matrix runner was never spawned / runner missing -> expected -1 to be +0
2. ORI-AI-002-AC-2-stop-retry
   AssertionError: uniwind-ios/result.json exists: expected false to be true
3. ORI-AI-002-AC-3-error-recovery
   Error: ENOENT .../evidence/ORI-AI-002/manifest.json
4. ORI-AI-002-AC-4-evidence-lifecycle
   Error: ENOENT .../evidence/ORI-AI-002/manifest.json

Full output retained at .tmp/ORI-AI-002/cycle-1/red/vitest-red.txt (same
command, same worktree state). No implementation existed when this was captured.
