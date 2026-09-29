---
flow_id: FLOW-GEND-02-hero-install-command-copy
service: docs-site
feature: UC-GEND-01
priority: P0
type: happy_path
tier: visible
scope: task
---

# Hero install command copies the exact absolute-URL CLI form in one click

Open `/`, focus the hero install block, click its copy button once.

**Expected**: the clipboard contains exactly `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` (engine segment follows the persisted engine tab; with the uniwind tab active it reads `https://rnraielements.com/r/uniwind/conversation.json`). The copied string matches `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$` character-for-character — no trailing newline added to or stripped from the rendered command, no wrapping artifacts from the visual line break.
