---
flow_id: FLOW-GEND-20-exact-absolute-url-command-copy
service: docs-site
feature: UC-GEND-04
priority: P0
type: happy_path
tier: visible
scope: task
---

# One-click copy yields the exact absolute-URL command on both engine tabs for every item

For every one of the 56 items (spot-assert all, e.g. `conversation`, `shimmer`, `markdown`, `audio-player`), open the item page, activate each engine tab, and click copy once.

**Expected**: nativewind tab copies `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/{item}.json`; uniwind tab copies the same with the `uniwind` path segment. Every copied string matches `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$` exactly, and the copy affordance shows a success state after the click.
