---
service: rnr-ai-elements
feature: UC-FOUND-01
ac_ref: AC-1
priority: P0
type: happy_path
tier: visible
test_tier: e2e
start_state: { description: "clean Expo 57 app with RNR installed and the component added via the RNR CLI", seed_method: public_api, records: ["committed UIMessageStream fixture"] }
action: { actor: device_user, steps: ["open the component's on-device Storybook story", "replay the stream fixture to completion"] }
end_state:
  must_observe: ["Developer can change a single RNR theme token such as the primary color or the base radius and see both RNR components a"]
  must_not_observe: ["an unstyled surface", "a silent no-op", "a console error"]
negative_control: { would_fail_if: ["the component is a stub", "the story renders only on web", "the fixture is not actually replayed"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# RNR theme tokens drive every ported component — core flow

Every color, radius, spacing, and type value in every ported component resolves from the host app's RNR theme rather than from a literal, so a single token edit propagates across both libraries.

Verify on an iOS simulator AND an Android emulator: Developer can change a single RNR theme token such as the primary color or the base radius and see both RNR components and AI Elements components change together on iOS, Android, and web without editing any component file.

Evidence is an on-device screenshot. A web-Storybook capture does not satisfy this scenario.
