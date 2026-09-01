---
stability: FEATURE_SPEC
last_validated: 2026-09-01
prd_version: 1.0.0
functional_group: CHAT
---

# Use Cases: Core Chat Surface (CHAT)

The day-one usable AI chat: conversation transcript with streaming stick-to-bottom, message with markdown and code rendering, prompt-input composer with keyboard handling and attachments, suggestions, questions, queue, checkpoint, sources, inline citations, images, shimmer, toolbar, snippet, open-in-chat.

| ID | Title | Description |
|----|-------|-------------|
| `UC-CHAT-01` | Streaming transcript that stays pinned and yields on scroll | The conversation container keeps a streaming response at the bottom, releases the pin the moment the user scrolls up, and offers an explicit way back. |
| `UC-CHAT-02` | Message rendering with markdown, code, and images | Role-differentiated message bubbles that render streamed markdown, fenced code, and generated images as native views. |
| `UC-CHAT-03` | Composer that survives the mobile keyboard | The prompt input handles keyboard avoidance, multiline growth, attachments, model selection, and in-flight state. |
| `UC-CHAT-04` | Prompt entry points and conversation markers | Suggestion pills, clarifying questions, a message queue, and checkpoint markers give the user ways into and around the conversation. |
| `UC-CHAT-05` | Sources and citations reachable by touch | Grouped sources and inline citations that open by press rather than by hover, and hand off to the platform browser or another chat app. |

---

## UC-CHAT-01: Streaming transcript that stays pinned and yields on scroll

The conversation container keeps a streaming response at the bottom, releases the pin the moment the user scrolls up, and offers an explicit way back.

### Acceptance Criteria

- ☐ **AC-1** — End user can watch a streaming assistant response stay pinned to the bottom of the transcript without the view jumping or stuttering on a mid-range Android device.
- ☐ **AC-2** — End user can scroll up mid-stream to read an earlier message and stay where they scrolled until they tap the scroll-to-bottom control.
- ☐ **AC-3** — End user can open a transcript of 200 or more messages and scroll it at a steady frame rate on a physical device.
- ☐ **AC-4** — Developer can mount the conversation component in an Expo screen and see it respect safe-area insets on a notched iPhone and on a gesture-navigation Android device.

---

## UC-CHAT-02: Message rendering with markdown, code, and images

Role-differentiated message bubbles that render streamed markdown, fenced code, and generated images as native views.

### Acceptance Criteria

- ☐ **AC-1** — End user can distinguish a user message from an assistant message by alignment, surface color, and avatar without reading the text.
- ☐ **AC-2** — End user can read a streamed markdown answer with headings, lists, links, bold text, and fenced code rendered as native views rather than as raw markdown characters.
- ☐ **AC-3** — End user can scroll a long code block horizontally without wrapping and copy its contents to the clipboard with one tap.
- ☐ **AC-4** — End user can view a model-generated image inline in the transcript at its correct aspect ratio.
- ☐ **AC-5** — End user can see a shimmer placeholder while an assistant message is awaiting its first token.

---

## UC-CHAT-03: Composer that survives the mobile keyboard

The prompt input handles keyboard avoidance, multiline growth, attachments, model selection, and in-flight state.

### Acceptance Criteria

- ☐ **AC-1** — End user can tap the composer and see the keyboard open without it covering the text being typed or the send button.
- ☐ **AC-2** — End user can type a multi-line prompt and watch the composer grow to a bounded maximum height before it begins scrolling internally.
- ☐ **AC-3** — End user can attach a photo or a file from the native device picker and see it as a removable chip above the composer before sending.
- ☐ **AC-4** — End user can switch models from the composer using a bottom-sheet picker sized for one-handed use.
- ☐ **AC-5** — End user can send a prompt with a visible send button and see the composer clear and disable while the request is in flight.

---

## UC-CHAT-04: Prompt entry points and conversation markers

Suggestion pills, clarifying questions, a message queue, and checkpoint markers give the user ways into and around the conversation.

### Acceptance Criteria

- ☐ **AC-1** — End user can swipe a horizontal row of suggestion pills and tap one to send it as a prompt.
- ☐ **AC-2** — End user can tap a clarifying question offered by the assistant and have it sent without retyping it.
- ☐ **AC-3** — End user can queue a follow-up message while a response is still streaming and see it listed with a control to remove it before it sends.
- ☐ **AC-4** — End user can see a checkpoint marker in the transcript indicating where a conversation was restored or branched.

---

## UC-CHAT-05: Sources and citations reachable by touch

Grouped sources and inline citations that open by press rather than by hover, and hand off to the platform browser or another chat app.

### Acceptance Criteria

- ☐ **AC-1** — End user can expand a collapsed sources list at the end of an answer and see each source title and domain.
- ☐ **AC-2** — End user can tap an inline citation and see the source detail in a popover opened by press rather than by hover.
- ☐ **AC-3** — End user can tap a source and open it in the device browser through the platform link handler.
- ☐ **AC-4** — End user can send the current conversation to an external chat application from an open-in-chat control.

---

