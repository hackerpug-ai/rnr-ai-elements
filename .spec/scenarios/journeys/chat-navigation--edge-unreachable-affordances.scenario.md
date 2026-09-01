---
service: rnr-ai-elements
feature: journey-chat-navigation
covers_ucs: [UC-CHAT-04, UC-CHAT-05]
priority: P0
type: security
tier: visible
test_tier: e2e
---
# Affordances that exist but cannot be reached, and a link that should not open

Two failure classes on one screen, both invisible to a screenshot review.

**Unreachable by touch.** Inline citations open on hover in the web original. If the port
kept `hover:` without an `active:` twin, the citation renders pixel-identically and is
simply dead under a thumb — every code review passes. Tap every citation, every suggestion
pill, and every source row on a physical device. A control that does not respond is a
failure even though it looks correct.

**A link that should not open.** Feed a source whose `url` is `javascript:alert(1)` and
another with a custom scheme. The allowlist (https / http / mailto) must refuse both before
`Linking.openURL` is called, and the refusal must be visible rather than a silent no-op —
a citation that does nothing when tapped is indistinguishable from the bug above.

Then queue two follow-ups mid-stream and remove the first: order is preserved and the
removed message never sends.

**Covers:** `UC-CHAT-04`, `UC-CHAT-05`
