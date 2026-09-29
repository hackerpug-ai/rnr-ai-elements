---
flow_id: FLOW-GEND-41-ledger-filter-and-row-copy
service: docs-site
feature: UC-GEND-07
priority: P0
type: happy_path
tier: visible
scope: task
---

# Category tabs and engine toggle filter to exact counts; per-row copy is exact

On `/registry`: click each category tab, flip the engine toggle, and copy a row's install command (e.g. the `conversation` row, then the `markdown` lib row).

**Expected**: the component tab shows exactly 39 rows, ui exactly 11, lib exactly 6 (or an unfiltered view shows all 56) — counts never off by one. The engine toggle re-renders every visible row's command between `https://rnraielements.com/r/nativewind/{item}.json` and the uniwind form. Each per-row copy places the full absolute-URL command (matching the FLOW-GEND-20 regex) on the clipboard with a success state. The counts and commands come from the same generated data as the unfiltered table — filtering never re-derives from a second source.
