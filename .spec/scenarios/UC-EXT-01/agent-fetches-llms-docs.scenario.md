---
flow_id: FLOW-EXT-01-agent-fetches-llms-docs
service: docs-site
feature: UC-EXT-01
priority: P0
type: happy_path
tier: visible
scope: task
---

# Agent fetches llms.txt and llms-full.txt at stable URLs and gets the full install contract

An autonomous coding agent with no prior knowledge of this library wants machine-readable orientation before touching a user project. It fetches the three generated endpoints.

Test inputs:
- GET https://rnraielements.com/llms.txt
- GET https://rnraielements.com/llms-full.txt
- GET https://rnraielements.com/robots.txt
- The dist/ output of one run of `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build`

Expected outputs:
- All three URLs return HTTP 200 as text/plain and are present in dist/ after that single build run (generated endpoints, not hand-authored files).
- llms.txt is an index: it links llms-full.txt and the key docs pages (installation, registry ledger, engine choice guide).
- llms-full.txt contains verbatim: (1) an explicit statement that this library is NOT an npm package; (2) literal install commands of the exact form `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/{item}.json` for both engines; (3) engine-detection heuristics keyed to project facts (Tailwind v4 with @theme implies uniwind; nativewind v3 implies the nativewind tree); (4) per-item peer dependencies and ios/android permission contracts; (5) Expo Go vs dev-client flags.
- robots.txt comes from the same generated build, not a checked-in static file.
