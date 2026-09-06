# Fixture provenance — `transcript.json`

- **origin**: hand-assembled
- **sdk**: ai@7.0.89
- **created**: 2026-09-06T23:25:23Z

## What this is

A committed `UIMessage[]` transcript (the shape an AI SDK `UIMessageStream` produces):
one user message, one assistant message carrying one completed tool part
(`output-available`, `searchRegistry`) and one text part (`Registry item installed.`).

It was **hand-assembled**, not recorded from a running `/api/chat` — no model call
produced it. It exists so the `/` route cold-boots with a real transcript and zero
network dependencies (streaming against a live backend is sprint 04's work). The
shape is checked against the real `ai@7.0.89` schema by
`node apps/example/fixtures/validate.mjs`, which runs the SDK's own
`validateUIMessages` (the `uiMessagesSchema`: message roles, part discriminants,
and the tool-state union) and exits non-zero on any violation. TypeScript cannot
provide this check — `resolveJsonModule` widens the JSON's string literals and
the route casts the import through `UIMessage[]` — so this validator, not tsc,
is the shape proof. The assistant tool part's state (`output-available`) and
toolName (`searchRegistry`) are asserted verbatim by the TASK-F8 flows, so
renaming either breaks a locked flow.

If a future task records a real transcript, replace this file and flip the origin
line to `recorded from /api/chat`, keeping the SDK version and `created` date
accurate.
