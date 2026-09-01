---
service: rnr-ai-elements
feature: UC-VOICE-01
ac_ref: AC-1
priority: P0
type: happy_path
tier: visible
test_tier: e2e
start_state: { description: "clean Expo 57 app with RNR installed and the component added via the RNR CLI", seed_method: public_api, records: ["committed UIMessageStream fixture"] }
action: { actor: device_user, steps: ["open the component's on-device Storybook story", "replay the stream fixture to completion"] }
end_state:
  must_observe: ["End user can hold a microphone control to record a prompt and see a live input-level indicator while recording."]
  must_not_observe: ["an unstyled surface", "a silent no-op", "a console error"]
negative_control: { would_fail_if: ["the component is a stub", "the story renders only on web", "the fixture is not actually replayed"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Speech capture, routing, and live transcription — core flow

Record a spoken prompt with visible feedback, see it transcribed live, and choose the audio input route the mobile OS actually exposes.

Verify on an iOS simulator AND an Android emulator: End user can hold a microphone control to record a prompt and see a live input-level indicator while recording.

Evidence is an on-device screenshot. A web-Storybook capture does not satisfy this scenario.
