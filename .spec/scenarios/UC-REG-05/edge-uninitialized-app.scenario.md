---
service: rnr-ai-elements
feature: UC-REG-05
ac_ref: AC-2
priority: P0
type: error_handling
tier: visible
test_tier: integration
start_state: { description: "a freshly created Expo SDK 57 app with NO components.json and NO `rnr init` run", seed_method: public_api, records: [] }
action: { actor: developer, steps: ["run the add command for any shipped item", "if it reports success, run `pnpm exec tsc --noEmit`"] }
end_state:
  must_observe:
    - "the failure names the missing RNR setup step before any file is written"
negative_control: { would_fail_if: ["the check is downgraded to a warning", "the install writes files and defers the error to build time"] }
evidence: { artifact_type: ci_log, required_capture: true }
---
# Installing into an app that was never initialized for RNR

The failure mode this guards is not a crash — it is a *success* followed by
`Cannot find module '@/components/ui/text'` at build time, minutes later, in a file the
developer did not write. The prerequisite has to fail at install time, by name.

FAIL if the add command reports success in an uninitialized app.
