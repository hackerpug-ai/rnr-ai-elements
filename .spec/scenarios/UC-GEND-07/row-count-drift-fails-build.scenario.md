---
flow_id: FLOW-GEND-45-row-count-drift-fails-build
service: docs-site
feature: UC-GEND-07
priority: P0
type: error_handling
tier: holdout
scope: task
---

# An enrichment that silently drops an item fails the 56-item gate

Simulate partial enrichment: give one fixture item a `files[].path` that does not exist (or an empty file), so a naive enrichment loop would skip it and emit 55 entries. Run the docs build chain.

**Expected**: the prebuild fails with a non-zero exit naming the item and the gate, in the shape `[docs-data] files: item "transcription" references missing/empty file packages/registry/src/components/ai/transcription.tsx`. The site never publishes a 55-row ledger over a 56-item registry — a silently short table is drift toward invisibility, and the exact-count gate (exactly 56, item named on mismatch) is what makes it impossible. Revert the fixture afterwards.
