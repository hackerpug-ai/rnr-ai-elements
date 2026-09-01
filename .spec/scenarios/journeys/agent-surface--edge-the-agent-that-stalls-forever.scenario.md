---
service: rnr-ai-elements
feature: journey-agent-surface
covers_ucs: [UC-AGENT-01, UC-AGENT-04]
priority: P0
type: error_handling
tier: visible
test_tier: e2e
---
# A gated tool call with no approval UI

Run a real provider tool call that emits `approval-requested` against a build where that state is unhandled. The correct observable outcome is a rendered approval card. The failure outcome is nothing at all — no error, no spinner, no log — and the agent waits forever. Also drive `input-streaming` with deliberately truncated JSON arguments: `ToolInput` must render without throwing. Both are silent failures that look identical to a slow network, which is why they need an explicit scenario rather than trust.

**Covers:** `UC-AGENT-01`, `UC-AGENT-04`
