---
flow_id: FLOW-GEND-21-dependency-panel-peers
service: docs-site
feature: UC-GEND-04
priority: P1
type: happy_path
tier: visible
scope: task
---

# Dependency panel lists registryDependencies, dependencies, and AI SDK v7 peers

Open the `shimmer` page (deps: `react-native-reanimated`; registryDependencies: `https://reactnativereusables.com/r/{engine}/text.json`) and a chat-family page that requires the AI SDK.

**Expected**: each page's dependency panel renders its `dependencies[]` and `registryDependencies[]` verbatim from the registry data (engine-templated URLs shown resolved for the active engine), and the chat-family page additionally names the AI SDK v7 peer packages the consumer must install themselves. Cross-check against `packages/registry/registry.json`: panel contents == the item's `dependencies` + `registryDependencies` fields, nothing dropped, nothing invented.
