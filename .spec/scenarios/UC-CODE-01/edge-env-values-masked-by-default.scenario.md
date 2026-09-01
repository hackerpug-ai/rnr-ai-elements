---
service: rnr-ai-elements
feature: UC-CODE-01
ac_ref: AC-1
priority: P0
type: security
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-CODE-01 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["Env values masked by default"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Env values masked by default

Render environment variables. Values are masked until explicitly revealed, and copy emits the export form.
