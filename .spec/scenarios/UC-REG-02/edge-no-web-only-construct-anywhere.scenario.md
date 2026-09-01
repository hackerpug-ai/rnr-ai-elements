---
service: rnr-ai-elements
feature: UC-REG-02
ac_ref: AC-1
priority: P0
type: boundary
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-REG-02 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["No web-only construct anywhere"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# No web-only construct anywhere

Grep every shipped source for DOM elements, iframe, hover-only classes without an active twin, and raw lucide JSX. Any hit fails.
