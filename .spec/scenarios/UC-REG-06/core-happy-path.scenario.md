---
service: rnr-ai-elements
feature: UC-REG-06
ac_ref: AC-1
priority: P0
type: happy_path
tier: visible
test_tier: integration
start_state: { description: "a published, versioned registry serving both engine trees, and two freshly created Expo SDK 57 apps", seed_method: public_api, records: ["the published item URLs at one pinned version"] }
action: { actor: developer, steps: ["install the same item into app A from the pinned URL", "install it into app B from the same URL at a later time", "diff the two installed files"] }
end_state:
  must_observe:
    - "both installs succeed from a URL carrying no mutable branch segment"
    - "the two installed files are byte-identical"
  must_not_observe:
    - "a 404", "a URL containing `/main/` or another moving ref"
negative_control: { would_fail_if: ["the URL is branch-pinned", "the build is non-deterministic between the two runs"] }
evidence: { artifact_type: ci_log, required_capture: true }
---
# Versioned public distribution — core flow

Two installs of the same pinned URL, at different times, produce the same bytes. That is the
whole promise: a consumer can reproduce their tree, and a repository rename cannot break
what they already published against.
