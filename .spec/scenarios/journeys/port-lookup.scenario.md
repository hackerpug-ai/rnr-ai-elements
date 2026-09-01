---
service: rnr-ai-elements
feature: journey-port-lookup
covers_ucs: [UC-REG-03, UC-CODE-03]
priority: P1
type: happy_path
tier: visible
test_tier: e2e
---
# A web developer maps their screen to mobile

A developer with a shipping AI Elements web app lists the components on their screen and looks each up in the published verdict table. conversation, message, tool and sources come back at parity or adapted; web-preview comes back as a native webview requiring a declared peer dependency; canvas and sandbox come back out-of-scope with a stated reason and a named alternative. They rescope before writing code rather than after.

**Covers:** `UC-REG-03`, `UC-CODE-03`
