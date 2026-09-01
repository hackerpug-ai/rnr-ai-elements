---
service: rnr-ai-elements
feature: UC-AGENT-01
ac_ref: AC-1
priority: P0
type: happy_path
tier: visible
test_tier: e2e
start_state: { description: "clean Expo 57 app with RNR installed and the component added via the RNR CLI", seed_method: public_api, records: ["committed UIMessageStream fixture"] }
action: { actor: device_user, steps: ["open the component's on-device Storybook story", "replay the stream fixture to completion"] }
end_state:
  must_observe: ["End user can see a tool call render its name and current state as pending, running, complete, or error without the trans"]
  must_not_observe: ["an unstyled surface", "a silent no-op", "a console error"]
negative_control: { would_fail_if: ["the component is a stub", "the story renders only on web", "the fixture is not actually replayed"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Tool call lifecycle rendered in place — core flow

A single component covers every tool-part state and shows inputs and outputs without disturbing the transcript.

Verify on an iOS simulator AND an Android emulator: End user can see a tool call render its name and current state as pending, running, complete, or error without the transcript reflowing when the state changes.

Evidence is an on-device screenshot. A web-Storybook capture does not satisfy this scenario.
