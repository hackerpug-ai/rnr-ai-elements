---
flow_id: FLOW-GEND-25-command-url-serves-correct-engine-json
service: docs-site
feature: UC-GEND-04
priority: P0
type: edge_case
tier: holdout
scope: task
---

# The command's URL actually serves that engine's item JSON

End-to-end against the deployed (or preview) static output: for a sample of items on both engines, GET `https://rnraielements.com/r/nativewind/conversation.json` and `https://rnraielements.com/r/uniwind/conversation.json`.

**Expected**: each URL returns 200 with the React Native item JSON whose `files[].target` paths belong to the fetched engine's tree, matching the corresponding `public/r/{engine}/{item}.json` byte-for-byte (all 112 engine-item files = 56 items x 2 engines). A command whose nativewind URL actually serves uniwind content — or a 404 — is the worst-case install failure and fails immediately. Run the same check against PR preview deploys so the guarantee holds before promotion.
