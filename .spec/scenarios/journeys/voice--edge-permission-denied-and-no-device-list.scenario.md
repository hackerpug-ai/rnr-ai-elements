---
service: rnr-ai-elements
feature: journey-voice
covers_ucs: [UC-VOICE-01]
priority: P0
type: error_handling
tier: visible
test_tier: e2e
---
# Denied permission and an OS that exposes no device list

Deny the microphone permission at OS level, then tap record: the control shows a denied state and never fakes listening. Separately, open the input picker on both iOS and Android and confirm it offers real audio ROUTES (built-in, wired, Bluetooth) rather than a fabricated device list — the browser's `enumerateDevices` has no mobile equivalent, and inventing one would be a component that lies about the platform.

**Covers:** `UC-VOICE-01`
