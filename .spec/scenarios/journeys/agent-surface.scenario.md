---
service: rnr-ai-elements
feature: journey-agent-surface
covers_ucs: [UC-AGENT-01, UC-AGENT-02, UC-AGENT-03, UC-AGENT-04, UC-AGENT-05]
priority: P0
type: happy_path
tier: visible
test_tier: e2e
---
# Agent trace — tool call to human approval and back

An agent streams reasoning into an auto-opened disclosure that collapses when the answer begins. A tool call renders pending, running, then complete without the transcript reflowing. The agent then requests a destructive action; an approval card appears with thumb-sized controls and fully legible arguments. The user approves, the card resolves in place, and the resolved state stays in the transcript. Without the approval leg the agent stalls forever, which is why it belongs in the same arc rather than a later one.

**Covers:** `UC-AGENT-01`, `UC-AGENT-02`, `UC-AGENT-03`, `UC-AGENT-04`, `UC-AGENT-05`
