---
flow_id: FLOW-SHELL-12-search-empty-and-loading-states
service: docs-site
feature: UC-SHELL-02
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Loading and empty search states are announced and recoverable

Open Cmd+K on `/docs/introduction` (cold, index not yet loaded): while loading, a loading state is announced through the dialog's aria-live region — not a silent frozen input. Once loaded, type the gibberish query `zzqxv123`: a visible empty state renders naming the query (e.g. "No results for zzqxv123") and is announced via aria-live. Clear the input with Backspace to empty: the prompt/initial state returns. Throughout all three states the input keeps focus — focus is never stolen by results rendering, and the input value is exactly what was typed at each step.
