---
service: rnr-ai-elements
feature: UC-AGENT-02
ac_ref: AC-1
priority: P0
type: edge_case
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-AGENT-02 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["Loaded history does not spring open"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Loaded history does not spring open

Mount reasoning with isStreaming false, as loaded history does. It must start CLOSED. Every old message opening at once is the failure.
