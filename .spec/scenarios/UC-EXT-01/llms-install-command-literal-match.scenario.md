---
flow_id: FLOW-EXT-02-llms-install-command-literal-match
service: docs-site
feature: UC-EXT-01
priority: P0
type: happy_path
tier: visible
scope: task
---

# llms.txt install commands are byte-exact against the canonical absolute-URL form

Agents execute install commands verbatim, so any deviation from the canonical form is a broken install. This is the load-bearing trust invariant for UC-EXT-01.

Test inputs:
- Every install command string extracted from https://rnraielements.com/llms-full.txt
- The built registry artifact under public/r/ from the same build

Expected outputs:
- Every extracted command matches the pattern `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/(nativewind|uniwind)/<item>.json` exactly: no short-name shadcn-style form, no other host, no missing `@latest`.
- Every referenced URL resolves: each of the 56 registry items appears under both /r/nativewind/ and /r/uniwind/ (112 resolvable URLs), and live fetches of sampled URLs return HTTP 200 with application/json.
- Zero deviations tolerated: a single malformed or non-resolving command fails this scenario.
