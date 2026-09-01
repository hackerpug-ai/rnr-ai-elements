---
service: rnr-ai-elements
feature: UC-VOICE-01
ac_ref: AC-1
priority: P0
type: error_handling
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-VOICE-01 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["Microphone permission denied"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Microphone permission denied

Deny the mic permission and tap record. The control must show the denied state, not fake listening. Capability detection is not permission state.
