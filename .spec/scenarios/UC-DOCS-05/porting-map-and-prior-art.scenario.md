---
flow_id: FLOW-DOCS-05-porting-map-and-prior-art
service: docs-site
feature: UC-DOCS-05
priority: P1
type: happy_path
tier: visible
scope: task
---

# Porting page maps upstream elements with deviations on display

Open /porting. The page carries an upstream-to-port mapping table (each Vercel AI Elements element, for example Conversation, Message, PromptInput, mapped to its registry item) with an explicit deviations column, a not-ported list naming which upstream elements are missing, and a prior-art section crediting elements.ai-sdk.dev and muratcakmak/expo-ai-elements with a why-differs statement (maintained two-engine fan-out vs stale single-engine forks). Expected output: the page returns 200, the mapping table renders with a deviations column, the not-ported list is present, and both prior-art names appear.
