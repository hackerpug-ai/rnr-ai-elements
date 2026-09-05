---
service: rnr-ai-elements
feature: journey-mvp-full-arc
covers_ucs: [UC-REG-05, UC-REG-06, UC-FOUND-01, UC-FOUND-03, UC-CHAT-01, UC-CHAT-02, UC-CHAT-03, UC-REG-02, UC-REG-04]
priority: P0
type: happy_path
tier: visible
test_tier: e2e
---
# MVP full arc — zero to a themed streaming chat on a device

A developer with a themed Expo 57 app installs the four minimum-chat components with one RNR CLI command, wires them to an existing useChat stream with no adapter, and runs on an iOS simulator, an Android emulator and web from one codebase. A streaming answer pins to the bottom, the keyboard does not cover the composer, and every surface uses their existing brand tokens without a single component file being opened. This is the arc that must be green before any other journey matters. The install leg is `mvp-install-arc`; this journey begins from an already-installed, already-booting app. The arc starts one step earlier than it used to: the URL they install from is a pinned, published one that no branch move can break, and the RNR items each component needs arrive in that same command because the entry declares them.

**Covers:** `UC-REG-05`, `UC-REG-06`, `UC-FOUND-01`, `UC-FOUND-03`, `UC-CHAT-01`, `UC-CHAT-02`, `UC-CHAT-03`, `UC-REG-02`, `UC-REG-04`
