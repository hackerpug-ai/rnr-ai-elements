---
service: rnr-ai-elements
feature: UC-FOUND-03
ac_ref: AC-1
priority: P0
type: boundary
tier: visible
test_tier: e2e
start_state: { description: "the core flow of UC-FOUND-03 already passing", seed_method: public_api, records: ["fixture stream"] }
action: { actor: device_user, steps: ["A duplicated primitive"] }
end_state:
  must_observe: ["the guarded behavior described below"]
  must_not_observe: ["a silent failure", "a green result with no assertion"]
negative_control: { would_fail_if: ["the guard is removed", "the check is downgraded to a warning"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# A duplicated primitive

Add a component that imports Pressable and Text to build a button while components/ui/button.tsx exists in the tree. Review must reject it, naming the RNR primitive it duplicates.
