---
service: rnr-ai-elements
feature: UC-FOUND-01
ac_ref: AC-1
priority: P0
type: security
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-FOUND-01 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["A component file contains a hex literal"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# A component file contains a hex literal

Add `#ff00ff` to one shipped component, run `scripts/check-tokens.ts`. The build must FAIL naming the file and line. A green build here means every future hardcoded color ships silently.
