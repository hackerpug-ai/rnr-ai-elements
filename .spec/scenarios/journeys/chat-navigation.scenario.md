---
service: rnr-ai-elements
feature: journey-chat-navigation
covers_ucs: [UC-CHAT-04, UC-CHAT-05]
priority: P1
type: happy_path
tier: visible
test_tier: e2e
---
# Getting into a conversation and back out of it

A user opens a chat with no history and sees suggestion pills instead of a blank box. They
swipe the row and tap one; it sends without retyping. Mid-answer they queue a follow-up and
remove it before it fires. The assistant offers a clarifying question and they tap it. When
the answer lands they expand the sources list, tap an inline citation to read the excerpt,
then open the source and return to the conversation with their scroll position intact.

This is the arc that turns a transcript into something navigable — entry points at one end,
provenance at the other. It sits outside the minimum-chat set on purpose: the four core
components make a chat that works, and this journey makes one people can actually use.

**Covers:** `UC-CHAT-04`, `UC-CHAT-05`
