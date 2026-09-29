---
flow_id: FLOW-GEND-06-hero-rejects-shortname-command
service: docs-site
feature: UC-GEND-01
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Hero never degrades to a short-name or bare-relative install form

Inject the regression: point the hero template at a short-name variant (`npx @react-native-reusables/cli@latest add conversation`) or a relative URL (`npx @react-native-reusables/cli@latest add /r/nativewind/conversation.json`), rebuild, and run the assertion pass.

**Expected**: the site's command assertions reject both forms — a short name resolves against the shadcn/web registry and installs the wrong component, and a relative URL breaks outside `rnraielements.com`. The rendered hero command must always match the absolute-URL pattern from FLOW-GEND-02. The test fails the build on any command string on `/` that starts with `npx @react-native-reusables/cli` but does not match the full absolute-URL regex.
