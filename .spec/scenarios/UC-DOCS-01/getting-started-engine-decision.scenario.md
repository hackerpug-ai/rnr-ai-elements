---
flow_id: FLOW-DOCS-01-getting-started-engine-decision
service: docs-site
feature: UC-DOCS-01
priority: P0
type: happy_path
tier: visible
scope: task
---

# Getting-started set answers the engine question with the install decision flow

Open the five getting-started pages with fresh eyes. The Introduction states the library is universal AI chat and agent UI components for React Native, distributed as a copy-paste registry, and explicitly says it is not an npm package (never suggests `npm install rnr-ai-elements`). The Installation page poses the engine question exactly once as nativewind/uniwind tabs. The engine decision guide maps project facts: Tailwind v4 plus CSS `@theme` implies the uniwind tree and commands built on https://rnraielements.com/r/uniwind/, while nativewind v3 implies the nativewind tree and /r/nativewind/ commands. Expected output: every page returns 200, the command `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` appears only inside the nativewind tab panel, and the decision guide states both fact-to-engine mappings.
