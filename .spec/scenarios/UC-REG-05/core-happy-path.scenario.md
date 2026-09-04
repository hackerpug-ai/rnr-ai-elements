---
service: rnr-ai-elements
feature: UC-REG-05
ac_ref: AC-1
priority: P0
type: happy_path
tier: visible
test_tier: integration
start_state: { description: "a freshly created Expo SDK 57 app with `rnr init` completed for one engine and no AI Elements items installed", seed_method: public_api, records: ["the published registry URL for `message`"] }
action: { actor: developer, steps: ["run `npx @react-native-reusables/cli add <message-url>` once", "run `pnpm exec tsc --noEmit`"] }
end_state:
  must_observe:
    - "`components/ai/message.tsx` exists in the consumer tree"
    - "every RNR item named in the entry's registryDependencies (avatar, text) exists under the consumer's own components/ui"
    - "typecheck exits 0"
  must_not_observe:
    - "a second copy of an RNR primitive under components/ai"
    - "an unresolved @/components/ui import"
negative_control: { would_fail_if: ["the RNR dependency URLs are dropped from the entry", "the primitive is vendored into our own file instead of referenced"] }
evidence: { artifact_type: ci_log, required_capture: true }
---
# RNR is a declared, checkable peer dependency — core flow

One CLI command installs the component *and* the RNR items it declares, into the consumer's
own `components/ui`. The proof is that the component typechecks against primitives it never
shipped.

Run it for both engines. A pass on one engine says nothing about the other, because the
engine segment is part of every dependency URL.
