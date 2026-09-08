---
service: rnr-ai-elements
feature: UC-REG-06
ac_ref: AC-5
priority: P1
type: edge_case
tier: holdout
test_tier: integration
start_state: { description: "a published install page listing items, with one shipped item absent from the page and one listed item that no longer exists in registry.json", seed_method: direct_write, records: ["the drifted page", "registry.json"] }
action: { actor: ci, steps: ["compare the page's item list against registry.json in both directions"] }
end_state:
  must_observe: ["the check fails and names both the missing item and the phantom item"]
  must_not_observe: ["a one-directional check that only catches missing entries"]
negative_control: { would_fail_if: ["the page is hand-maintained with no check at all"] }
evidence: { artifact_type: ci_log, required_capture: true }
---
# An install page that drifts from the registry

Two failures, opposite directions, one cause: a hand-maintained page. A missing item is
invisible to a developer who never learns it exists; a phantom item is a documented install
command that 404s. Only a two-way check catches both.
