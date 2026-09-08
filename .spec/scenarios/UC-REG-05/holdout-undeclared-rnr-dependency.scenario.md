---
service: rnr-ai-elements
feature: UC-REG-05
ac_ref: AC-4
priority: P0
type: edge_case
tier: holdout
test_tier: integration
start_state: { description: "one registry entry with a real RNR import in its source but that RNR URL removed from its registryDependencies", seed_method: direct_write, records: ["the tampered entry"] }
action: { actor: ci, steps: ["install ONLY that item into a clean rnr-init'ed app", "run `pnpm exec tsc --noEmit`"] }
end_state:
  must_observe: ["typecheck fails on the unresolved import, and the clean-app job is red"]
  must_not_observe: ["a green job because a previously installed item happened to bring the primitive in"]
negative_control: { would_fail_if: ["the job installs all items into one app before typechecking, so a sibling item masks the missing declaration"] }
evidence: { artifact_type: ci_log, required_capture: true }
---
# An undeclared RNR dependency masked by a sibling install

Install-everything-then-typecheck is the trap: with all 56 items in one app, almost every
RNR primitive is present for some other reason, so a missing declaration passes. The
per-item leg is what makes AC-4 mean anything.
