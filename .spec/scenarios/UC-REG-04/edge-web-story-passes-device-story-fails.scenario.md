---
service: rnr-ai-elements
feature: UC-REG-04
ac_ref: AC-1
priority: P0
type: edge_case
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-REG-04 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["Web story passes, device story fails"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Web story passes, device story fails

Build a component that renders correctly on web Storybook but has no PortalHost on device. The device story must catch it. If both pass, the gate is not real.
