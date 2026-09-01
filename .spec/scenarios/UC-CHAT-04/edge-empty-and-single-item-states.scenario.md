---
service: rnr-ai-elements
feature: UC-CHAT-04
ac_ref: AC-1
priority: P0
type: edge_case
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-CHAT-04 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["Empty and single-item states"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Empty and single-item states

Render suggestions with zero items and with one. Zero renders nothing; one does not stretch to fill the row.
