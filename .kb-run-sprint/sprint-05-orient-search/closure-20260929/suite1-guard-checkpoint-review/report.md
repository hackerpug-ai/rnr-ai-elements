| AC | Verdict | Evidence |
|---|---|---|
| AC-1 | PARTIAL | Prior focused receipts present; not rerun in this guard checkpoint. |
| AC-2 | PARTIAL | Prior browser receipts present; not rerun in this guard checkpoint. |
| AC-3 | FAIL | Default entrypoint still requires local `main`; aggregate exit remains null. |

**Checkpoint verdict: NEEDS_FIXES.** No whole-task approval.

1. **HIGH — S1-GUARD-001:** MODE defaults to green. The test calls runSuiteRepairProof, which dispatches green to runGreen. runGreen still calls git merge-base HEAD main after the expensive seven selector runs. Only the dedicated scopeSelector helper supplies SUITE_REPAIR_PROOF_MODE=scope. Neither package.json nor Vitest configuration supplies that mode for pnpm test. Therefore the shallow proof does not exercise the ordinary aggregate path, whose missing-main and later-main defects remain.

**Fix:** Separate the portable recorded-proof verifier from the dedicated shallow-fixture shape assertions, and wire ordinary selector/aggregate execution to that portable verifier. Keep actual immutable task-base/history auditing in task-time proof capture, keep the seven real focused selector runs and full external aggregate mandatory for task completion, and validate durable boundary/current source and receipt bytes rather than status flags. Do not simply make scope the default: its strict depth-one/detached/no-main assertions would reject normal local checkouts. Add real plain-mode verification in clean shallow and normal full-history checkouts plus source/evidence tamper rejection.

Typecheck, scoped Biome (8 files), diff check, and scenario validation passed. Real Git inventory matches the recorded 21-path boundary; all 14 recorded implementation/drill receipt hashes match current files. No explicit stubs were found in the changed harness.

Independent shallow fetch passed. Detached checkout was rejected by the main-folder guard (exit 126), so no independent runtime/tamper success is claimed. No guard bypass or heavy aggregate/browser/native run occurred.
