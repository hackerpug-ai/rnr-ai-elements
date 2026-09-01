---
service: rnr-ai-elements
feature: journey-theming-passthrough
covers_ucs: [UC-FOUND-01, UC-FOUND-02, UC-FOUND-04, UC-REG-04]
priority: P0
type: happy_path
tier: visible
test_tier: e2e
---
# Rebrand — one token edit moves both libraries

A design-system owner opens their own global.css, changes --color-primary and the base radius, clears the Metro cache and rebuilds. Chat bubbles, tool cards, the composer and their pre-existing RNR cards all move together. They toggle the device to dark and every AI surface flips in the same frame as the rest of the app. They open no component file and write no override. Six screenshot pairs (iOS + Android, light + dark, chat + agent + approval) are the evidence.

**Covers:** `UC-FOUND-01`, `UC-FOUND-02`, `UC-FOUND-04`, `UC-REG-04`
