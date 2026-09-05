---
service: rnr-ai-elements
feature: journey-mvp-install-arc
covers_ucs: [UC-REG-01]
priority: P0
type: happy_path
tier: visible
test_tier: e2e
---

# MVP install arc — a pinned URL to a booting app

A developer runs one RNR CLI add command against a tag-pinned registry URL inside an Expo SDK 57 app, receives the AI Elements items AND the RNR primitives they declare as editable source in their own tree, and cold-boots that app on an iOS simulator and an Android emulator showing a seeded transcript. This is the leg that has to be green before the full arc means anything — the streaming, theming and chat legs all start from an app that installed and booted.

**Covers:** `UC-REG-01`
