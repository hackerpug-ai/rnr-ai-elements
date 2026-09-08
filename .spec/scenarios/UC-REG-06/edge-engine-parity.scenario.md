---
service: rnr-ai-elements
feature: UC-REG-06
ac_ref: AC-2
priority: P0
type: edge_case
tier: visible
test_tier: integration
start_state: { description: "both emitted engine trees under public/r/", seed_method: public_api, records: ["public/r/nativewind", "public/r/uniwind"] }
action: { actor: ci, steps: ["compare the item name sets across the two trees", "for each pair, diff the file bodies"] }
end_state:
  must_observe:
    - "both trees contain exactly the same 56 item names"
    - "every in-pair difference is confined to the engine alias segment and the RNR host segment"
  must_not_observe: ["an item present in one tree only", "an engine-specific class or import in the shared source"]
negative_control: { would_fail_if: ["the comparison only counts files instead of diffing them"] }
evidence: { artifact_type: ci_log, required_capture: true }
---
# The two engine trees stay at parity

The fan-out rewrites exactly two things. Anything else that differs between the trees means
an engine assumption leaked into a source that is supposed to be engine-agnostic — and it
will only show up for the half of consumers on the other engine.
