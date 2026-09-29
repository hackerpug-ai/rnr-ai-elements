---
flow_id: FLOW-DELIV-03-live-registry-round-trip
service: docs-site
feature: UC-DELIV-03
priority: P0
type: happy_path
tier: visible
scope: task
---

# Registry item JSON round-trips from the same deploy through the real CLI

The whole install story depends on one URL serving correct JSON from the same deploy that serves the docs.

**Test inputs**:
- `curl -sI https://rnraielements.com/r/nativewind/conversation.json`
- `curl -s https://rnraielements.com/r/nativewind/conversation.json | jq -r '.name'` and `| jq -r '.type'`
- In a scratch Expo project: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json`

**Expected outputs**:
- Headers: `200`, `content-type: application/json`, `cache-control: public, max-age=300`.
- jq prints `conversation` and `registry:component`.
- The CLI exits 0 and writes the item's files into the project.
- Same-deploy proof: `sha256sum` of the fetched body equals the sha256 of the freshly generated `public/r/nativewind/conversation.json` at the commit the deploy was built from.
