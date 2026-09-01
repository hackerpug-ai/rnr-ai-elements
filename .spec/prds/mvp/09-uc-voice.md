---
stability: FEATURE_SPEC
last_validated: 2026-09-01
prd_version: 1.0.0
functional_group: VOICE
---

# Use Cases: Voice and Audio (VOICE)

Speech capture and live transcription, audio route selection, generated-audio playback, and voice selection.

| ID | Title | Description |
|----|-------|-------------|
| `UC-VOICE-01` | Speech capture, routing, and live transcription | Record a spoken prompt with visible feedback, see it transcribed live, and choose the audio input route the mobile OS actually exposes. |
| `UC-VOICE-02` | Generated audio playback and voice selection | Play back a spoken response with real transport controls and pick the synthesis voice. |

---

## UC-VOICE-01: Speech capture, routing, and live transcription

Record a spoken prompt with visible feedback, see it transcribed live, and choose the audio input route the mobile OS actually exposes.

### Acceptance Criteria

- ☐ **AC-1** — End user can hold a microphone control to record a prompt and see a live input-level indicator while recording.
- ☐ **AC-2** — End user can watch their speech appear as a live transcript and edit it before sending.
- ☐ **AC-3** — End user can choose an audio input route such as built-in microphone, wired headset, or Bluetooth from a native route picker.
- ☐ **AC-4** — Developer can install the speech components and be told at install time which audio modules and runtime permissions they require.

---

## UC-VOICE-02: Generated audio playback and voice selection

Play back a spoken response with real transport controls and pick the synthesis voice.

### Acceptance Criteria

- ☐ **AC-1** — End user can play a generated audio response with play, pause, and a scrubbable progress bar.
- ☐ **AC-2** — End user can select a text-to-speech voice from a bottom-sheet list showing each voice name and language.
- ☐ **AC-3** — End user can continue playback while scrolling the transcript without the audio restarting.
- ☐ **AC-4** — End user can see elapsed and total duration while an audio response plays.

---

