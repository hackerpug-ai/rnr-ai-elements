---
service: rnr-ai-elements
feature: UC-REG-06
ac_ref: AC-4
priority: P0
type: error_handling
tier: holdout
test_tier: integration
start_state: { description: "a component source edited without rebuilding the registry, so the committed public/r/ tree is one commit behind its source", seed_method: direct_write, records: ["the edited source", "the stale emitted JSON"] }
action: { actor: ci, steps: ["rebuild the registry into a scratch directory", "diff against the committed public/r/"] }
end_state:
  must_observe: ["the diff is non-empty and the job fails, naming the drifted item"]
  must_not_observe: ["a green job"]
negative_control: { would_fail_if: ["the freshness check compares timestamps or file counts instead of content"] }
evidence: { artifact_type: ci_log, required_capture: true }
---
# A published tree that no longer matches its source

The registry is the product. A tree one commit behind its source ships a component the
repository does not contain, and no consumer can tell — the JSON is valid, the install
succeeds, and the file is simply the wrong version.
