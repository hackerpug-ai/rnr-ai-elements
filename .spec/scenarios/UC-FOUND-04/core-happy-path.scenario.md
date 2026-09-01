---
service: rnr-ai-elements
feature: UC-FOUND-04
ac_ref: AC-1
priority: P0
type: happy_path
tier: visible
test_tier: e2e
start_state: { description: "clean Expo 57 app with RNR installed and the component added via the RNR CLI", seed_method: public_api, records: ["committed UIMessageStream fixture"] }
action: { actor: device_user, steps: ["open the component's on-device Storybook story", "replay the stream fixture to completion"] }
end_state:
  must_observe: ["Design-system owner can place an RNR demo screen and an AI Elements chat screen side by side on a phone and cannot ident"]
  must_not_observe: ["an unstyled surface", "a silent no-op", "a console error"]
negative_control: { would_fail_if: ["the component is a stub", "the story renders only on web", "the fixture is not actually replayed"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# One design system on a mobile device — core flow

The binding product promise made observable: on a phone, a reviewer cannot tell which library rendered which surface.

Verify on an iOS simulator AND an Android emulator: Design-system owner can place an RNR demo screen and an AI Elements chat screen side by side on a phone and cannot identify which library rendered which surface from radius, border color, type scale, or spacing.

Evidence is an on-device screenshot. A web-Storybook capture does not satisfy this scenario.
