---
flow_id: FLOW-GEND-33-missing-verdict-fails-build
service: docs-site
feature: UC-GEND-05
priority: P1
type: error_handling
tier: holdout
scope: task
---

# An enriched item missing its Expo Go verdict fails the build naming the item

Inject the gap: drop one item's entry from the emitted `apps/docs/src/data/gallery-manifest.json` (or add a registry item the manifest script skipped), then run the docs build chain.

**Expected**: the prebuild verdict-present gate fails with a non-zero exit naming the item (`[docs-data] expoGo verdict missing for "audio-player"`) and no pages are emitted. The alternative — rendering the page with a blank badge or a default-true guess — is precisely the silent degradation the fail-closed design forbids, because a guessed `runs in Expo Go` on a dev-client item crashes on the visitor's phone.
