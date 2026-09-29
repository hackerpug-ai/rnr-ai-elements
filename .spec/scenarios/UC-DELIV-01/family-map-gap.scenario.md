---
flow_id: FLOW-DELIV-01-family-map-gap
service: docs-site
feature: UC-DELIV-01
priority: P0
type: error_handling
tier: holdout
scope: task
---

# Item missing from the families map fails family-coverage gate

Every registry item must appear in exactly one entry of the hand-maintained families map (conversation, message, prompt-input, reasoning, sources, suggestion, tool, ui, lib), so `/components` grouping can never silently drop an item.

**Test inputs**: add a new item `voice-input` to `packages/registry/registry.json`, rebuild `public/r`, and deliberately omit it from the families map.

**Expected outputs**:
- Prebuild fails with `family coverage not exact: item 'voice-input' appears in 0 families (expected exactly 1)`.
- Adding the same item to two families fails the same gate.
