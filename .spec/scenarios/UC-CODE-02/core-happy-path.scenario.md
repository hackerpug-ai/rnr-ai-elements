---
service: rnr-ai-elements
feature: UC-CODE-02
ac_ref: AC-1
priority: P0
type: happy_path
tier: visible
test_tier: e2e
start_state: { description: "clean Expo 57 app with RNR installed and the component added via the RNR CLI", seed_method: public_api, records: ["committed UIMessageStream fixture"] }
action: { actor: device_user, steps: ["open the component's on-device Storybook story", "replay the stream fixture to completion"] }
end_state:
  must_observe: ["Developer can read terminal output in a monospace view that scrolls horizontally without wrapping and vertically without"]
  must_not_observe: ["an unstyled surface", "a silent no-op", "a console error"]
negative_control: { would_fail_if: ["the component is a stub", "the story renders only on web", "the fixture is not actually replayed"] }
evidence: { artifact_type: device_screenshot, required_capture: true }
---
# Run output: terminal, tests, and stack traces — core flow

Dense monospace output that scrolls rather than wraps, and summarizes rather than dumps.

Verify on an iOS simulator AND an Android emulator: Developer can read terminal output in a monospace view that scrolls horizontally without wrapping and vertically without dropping frames.

Evidence is an on-device screenshot. A web-Storybook capture does not satisfy this scenario.
