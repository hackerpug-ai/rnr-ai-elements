---
service: rnr-ai-elements
feature: UC-CHAT-05
ac_ref: AC-1
priority: P0
type: security
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-CHAT-05 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["A javascript: citation"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# A javascript: citation

Feed a source whose url is `javascript:alert(1)`. The scheme allowlist must refuse it before Linking.openURL, and the UI must show the refusal rather than silently doing nothing.
