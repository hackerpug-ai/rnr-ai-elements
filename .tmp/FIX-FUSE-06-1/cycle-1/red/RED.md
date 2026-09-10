# FIX-FUSE-06-1 — RED evidence (race is real)

## 1. Captured failure (task-sanctioned RED)

Quoted verbatim from `.kb-run-sprint/sprint-01-docs-spike-skeleton/FUSE-06/cycle-1.verdict.json`
(astro-reviewer, reproduced 2/2; `ledger.spec.ts:54` read `src/data/registry-items.json` at
module scope while deliv-03's destructive cases rmSync'd `src/data` mid-run in a parallel worker):

> "BLOCKER-lane-module-scope-read", "satisfied": false, "evidence": "The real lane `pnpm e2e:docs` (FUSE-12's CI lane) exits 1 deterministically — 2/2 repro on branch, green on main at 4fd63e5. ledger.spec.ts:54 reads src/data/registry-items.json at module scope; deliv-03-112-file-completeness.spec.ts rmSyncs src/data (and public/r) mid-run before prebuild regen, so mobile/nojs workers ENOENT at import (2 failed, 8 did-not-run)."
> "fix": "Bounded existence-retry read in ledger.spec.ts (the FUSE-07-accepted ENOENT-bridge pattern: retry reads of the generated artifact for a deadline, then rethrow — real absence still fails). Systemic lane serialization routed to orchestrator FIX."

That verdict is from a tree whose HEAD is exactly this worktree's HEAD (`4fd63e5`): the reviewer
states "green on main at 4fd63e5" and the failure was on the FUSE-06 branch that layered the
module-scope reader onto it.

## 2. The same hazard class is live on THIS unfixed tree

`tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts` destructively
removes the generated artifacts mid-lane, then regenerates:

- line 88: `rmSync(MANIFEST_JSON);`
- line 91: `rmSync(DATA_DIR, { recursive: true, force: true });`   (apps/docs/src/data)
- line 123: `rmSync(DOCS_PUBLIC_R, { recursive: true, force: true });` (apps/docs/public/r)

`tests/sprint-01-docs-spike-skeleton/component-page.spec.ts` reads those artifacts via
`readJson` (lines 11–22) and only survives the race because of a 15s ENOENT bridge
(`const deadline = Date.now() + 15_000;`). The bridge is masking, not fixing: a reader
without it (FUSE-06's ledger spec, FUSE-11's planned flow spec) or a regen slower than
15s ENOENTs exactly as captured in §1.

## 3. Live proof the lane runs file-parallel workers on the unfixed config

`lane-unfixed-run1.log` (this directory) — `pnpm e2e:docs` on the unfixed config (no
`workers` key → Playwright default parallel workers). Test IDs from different spec files
and different projects interleave in the same window, e.g.:

```
[11/30] [chromium-desktop] › .../copy-button.spec.ts:56
[12/30] [chromium-mobile] › .../copy-button.spec.ts:56
[17/30] [chromium-nojs] › .../component-page.spec.ts:93
[21/30] [chromium-nojs] › .../deliv-03-112-file-completeness.spec.ts:182
```

Run 1 passed (25 passed / 5 skipped / 14.5s, exit 0) — consistent with the reviewer's
"green on main at 4fd63e5": the race needs a module-scope reader to fire against the
rmSync window, and this tree's only reader is bridge-masked. That is why §1's captured
verdict (reproduced 2/2 on the branch that added the unbridged reader) is the RED
evidence, and why the fix is at the config level rather than in any spec.
