---
flow_id: FLOW-GEND-29-verdict-matches-manifest
service: docs-site
feature: UC-GEND-05
priority: P1
type: edge_case
tier: holdout
scope: task
---

# A rendered verdict that disagrees with the gallery manifest fails

Inject the disagreement: hardcode a `runs in Expo Go` badge into the template for an item whose gallery-manifest entry has `expoGo: false` (e.g. the extended-audio item), rebuild, and run the verdict-consistency check, which diffs every rendered badge against `src/data/gallery-manifest.json` — the single verdict computation emitted by `scripts/build-gallery-manifest.ts`.

**Expected**: the check fails naming the item. A visitor who trusts an Expo Go badge on a native-module item hits a crash on their phone — the most expensive broken promise the site can make — so any second source of verdict truth (template constants, docs prose, hardcoded lists) must be caught. The docs read verdicts ONLY from the manifest-derived enriched data.
