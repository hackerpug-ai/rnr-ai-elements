| AC | Verdict | Evidence |
|---|---|---|
| AC-1 | PARTIAL | Prior focused receipts retained; not rerun in this checkpoint. |
| AC-2 | PARTIAL | Prior browser receipts retained; not rerun in this checkpoint. |
| AC-3 | FAIL | Recorded-boundary negative controls falsely pass; aggregate remains unrun. |

**Checkpoint: NEEDS_FIXES.** S1-GUARD-001 is resolved. Ordinary verification passes independently in full-history and depth-1 detached checkouts, and rejects source and RED/GREEN/run receipt byte tampering.

**HIGH — S1-GUARD-002:** In the actual c75dc268 depth-1 detached checkout, the ordinary no-env Vitest command exits 0 after scope-audit.boundaryProof.changed receives an unowned apps/docs/src/pages/unowned-review-probe.astro path. It also exits 0 when the required search-contract.spec.ts repair is removed from that list. All current source/receipt hashes remain unchanged. Both JSON mutations were restored byte-exactly. readAndValidateScopeAudit validates implementationPaths, receiptPaths, hash keys, and stored withinBoundary/empty error arrays, but never derives the permitted inventory from boundaryProof.changed and proofRecords. The newly added portableInventory emits productSourceChanged=[] and productSourceByteUnchanged=true regardless of that path list.

**Fix:** Recompute the boundary from the recorded changed-path set: reject duplicates, unknown paths, missing required repair/evidence paths, and inconsistent proofRecords. Permit only explicitly owned proof metadata paths. Compare the recomputed implementation set with IMPLEMENTATION_PATHS and ensure stored summaries agree. Derive productSourceChanged and byte-unchanged status from the validated inventory instead of hardcoding success. Add real ordinary-mode negative probes for an added unowned product path and an omitted required repair, preserving source/receipt byte tamper tests. Keep actual task-time Git auditing, seven real selector proofs, and external aggregate completion requirement intact.

The committed audit itself matches real Git history and all 17 current byte hashes. Typecheck, 8-file Biome, and diff check passed. No heavy aggregate or native/browser gate ran. All scratch mutations were restored; shared task worktree and main are unchanged.
