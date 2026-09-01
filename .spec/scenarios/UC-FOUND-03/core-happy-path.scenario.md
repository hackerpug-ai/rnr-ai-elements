---
service: rnr-ai-elements
feature: UC-FOUND-03
ac_ref: AC-1
priority: P0
type: happy_path
tier: visible
test_tier: e2e
start_state: { description: "clean Expo 57 app with RNR installed and the component added via the RNR CLI", seed_method: public_api, records: ["committed UIMessageStream fixture"] }
action: { actor: device_user, steps: ["open the component's on-device Storybook story", "replay the stream fixture to completion"] }
end_state:
  must_observe: ["Developer can install any shipped component and get RNR's own primitive wherever RNR already ships one, with no duplicat"]
  must_not_observe: ["an unstyled surface", "a silent no-op", "a console error"]
negative_control: { would_fail_if: ["the component is a stub", "the story renders only on web", "the fixture is not actually replayed"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Reuse RNR first, create a primitive only on demand — core flow

The 29 primitives RNR already ships are reused directly; new primitives are created only when a shipped component requires one from the documented 26-item gap list.

Verify on an iOS simulator AND an Android emulator: Developer can install any shipped component and get RNR's own primitive wherever RNR already ships one, with no duplicated fork of accordion, dialog, popover, or the other reused primitives.

Evidence is an on-device screenshot. A web-Storybook capture does not satisfy this scenario.
