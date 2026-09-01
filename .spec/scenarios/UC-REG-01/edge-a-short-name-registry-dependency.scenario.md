---
service: rnr-ai-elements
feature: UC-REG-01
ac_ref: AC-1
priority: P0
type: error_handling
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-REG-01 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["A short-name registry dependency"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# A short-name registry dependency

Set one registryDependencies entry to `card` instead of a full https URL. It resolves against the shadcn WEB registry and installs a DOM component. CI must fail on the URL form.
