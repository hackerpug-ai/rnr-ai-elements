---
service: rnr-ai-elements
feature: UC-REG-05
ac_ref: AC-3
priority: P0
type: security
tier: holdout
test_tier: integration
start_state: { description: "the shipped source tree with one RNR primitive's implementation pasted inline into a component file, under a slightly different name", seed_method: direct_write, records: ["a planted copy of RNR Badge as `StatusBadge`"] }
action: { actor: ci, steps: ["run the no-vendored-primitive check over packages/registry/src and both emitted trees"] }
end_state:
  must_observe: ["the check fails and names the file and the primitive it duplicates"]
  must_not_observe: ["a green build"]
negative_control: { would_fail_if: ["the check only compares file names and not the duplicated implementation"] }
evidence: { artifact_type: ci_log, required_capture: true }
---
# A vendored RNR primitive under a different name

A vendored copy compiles, renders, and looks right. It fails only later, invisibly, when the
consumer edits their theme and half their screen moves. A name-only check does not catch it,
because the whole point is that the copy has a different name.
