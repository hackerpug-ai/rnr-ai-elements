---
flow_id: FLOW-DELIV-03-one-engine-tree-missing
service: docs-site
feature: UC-DELIV-03
priority: P0
type: error_handling
tier: holdout
scope: task
---

# A single missing engine tree must fail completeness verification

A partial build that serves one engine tree but not the other still breaks every uniwind (or nativewind) install command on the site.

**Test inputs**: simulate a partial build where `dist/r/uniwind/` is absent (or contains only a subset) while `dist/r/nativewind/` is complete, then run the completeness sweep.

**Expected outputs**:
- The 112x`200 application/json` check fails, naming the engine and the count (e.g. `uniwind: 0 of 56 present`).
- Verification must not pass with one complete tree and one missing tree — the sweep iterates over both engines, not either.
