# ORI-AI-002 — cycle 6 RED (captured 2026-09-24, worktree @ 89e5be8d + cycle-6 code)

Cycle 6 implements the revised proof contract (task Amendments 2026-09-24,
merged fb58634d/89e5be8d, provenance = the cycle-5 blocked report):

- The runner partitions single-engine invocations into
  `evidence/ORI-AI-002/<engine>/` sets, records `engines` + its own validated
  `exit_code` in each manifest, and the validator derives expected targets from
  the manifest's declared engines (a uniwind-only set is complete at 3 targets).
- The vitest suite was rewritten to validate the cycle's ACCUMULATED evidence
  set on disk (both per-engine manifests, identical source digests = one
  candidate SHA, per-target artifacts/correlation, tamper cases through the
  real validator, intact-set validations) — it no longer spawns a matrix.

RED (`vitest-red.txt`, run BEFORE the cycle's seeding invocations):

```
pnpm exec vitest run tests/sprint-05-orient-search/live-example-proof.test.ts
exit=1 — 4 failed / 0 passed
AssertionError: uniwind set manifest.json exists (fresh current-cycle seed
invocation required): expected false to be true
```

All four named tests fail closed on the absent current-cycle engine sets — the
committed state has not yet run the cycle's fresh per-engine invocations.
`pnpm typecheck` and the scoped biome command are green on the cycle-6 code.
