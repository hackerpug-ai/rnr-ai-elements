# Coverage Matrix — UC x journey x tier

Generated 2026-09-01 from `.spec/scenarios/`. Verified by
`brain/tools/flow-coverage/flow_coverage_check.py --prd .spec/scenarios` (exit 0).

| UC | Title | Visible | Holdout | Journeys |
|---|---|---|---|---|
| `UC-FOUND-01` | RNR theme tokens drive every ported component | 2 | 3 | `mvp-full-arc`, `theming-passthrough` |
| `UC-FOUND-02` | Dark mode flips both libraries in the same frame | 2 | 3 | `theming-passthrough` |
| `UC-FOUND-03` | Reuse RNR first, create a primitive only on demand | 2 | 3 | `mvp-full-arc` |
| `UC-FOUND-04` | One design system on a mobile device | 2 | 3 | `theming-passthrough` |
| `UC-CHAT-01` | Streaming transcript that stays pinned and yields on scroll | 2 | 3 | `mvp-full-arc` |
| `UC-CHAT-02` | Message rendering with markdown, code, and images | 2 | 3 | `mvp-full-arc` |
| `UC-CHAT-03` | Composer that survives the mobile keyboard | 2 | 3 | `mvp-full-arc` |
| `UC-CHAT-04` | Prompt entry points and conversation markers | 2 | 2 | `chat-navigation` |
| `UC-CHAT-05` | Sources and citations reachable by touch | 2 | 3 | `chat-navigation` |
| `UC-AGENT-01` | Tool call lifecycle rendered in place | 2 | 3 | `agent-surface` |
| `UC-AGENT-02` | Reasoning and chain-of-thought disclosure | 2 | 2 | `agent-surface` |
| `UC-AGENT-03` | Plan and task progress | 2 | 2 | `agent-surface` |
| `UC-AGENT-04` | Human-in-the-loop confirmation sized for a thumb | 2 | 3 | `agent-surface` |
| `UC-AGENT-05` | Agent identity, context budget, artifacts, and run controls | 2 | 2 | `agent-surface` |
| `UC-CODE-01` | Repository and environment context on a phone screen | 2 | 3 | `coding-agent` |
| `UC-CODE-02` | Run output: terminal, tests, and stack traces | 2 | 2 | `coding-agent` |
| `UC-CODE-03` | Live web preview through a native webview | 2 | 2 | `port-lookup` |
| `UC-VOICE-01` | Speech capture, routing, and live transcription | 2 | 2 | `voice` |
| `UC-VOICE-02` | Generated audio playback and voice selection | 2 | 2 | `voice` |
| `UC-REG-01` | Install exactly like RNR | 2 | 3 | `mvp-full-arc` |
| `UC-REG-02` | Expo compatibility across iOS, Android, and web | 2 | 3 | `mvp-full-arc` |
| `UC-REG-03` | Published porting verdicts and honest non-goals | 2 | 2 | `port-lookup` |
| `UC-REG-04` | Storybook demonstrates every component and every state | 2 | 3 | `mvp-full-arc`, `theming-passthrough` |

**Totals:** 46 visible · 60 holdout scenarios across 23 use cases · 7 cross-UC journeys

## Journeys

| Journey | Core flows | Edge flows | UCs covered |
|---|---|---|---|
| [`agent-surface`](./journeys/agent-surface.scenario.md) | 1 | 1 | 5 |
| [`chat-navigation`](./journeys/chat-navigation.scenario.md) | 1 | 1 | 2 |
| [`coding-agent`](./journeys/coding-agent.scenario.md) | 1 | 1 | 2 |
| [`mvp-full-arc`](./journeys/mvp-full-arc.scenario.md) | 1 | 1 | 8 |
| [`port-lookup`](./journeys/port-lookup.scenario.md) | 1 | 1 | 2 |
| [`theming-passthrough`](./journeys/theming-passthrough.scenario.md) | 1 | 1 | 4 |
| [`voice`](./journeys/voice.scenario.md) | 1 | 1 | 2 |

Every journey carries both a core flow and an edge flow. A journey with only a happy path
tests the case that was never in doubt.

## Gap report

**No gaps.** Every use case is covered by at least one cross-UC journey and carries both a core and an edge scenario of its own.

## The wall

Holdout scenarios use different framing from the visible acceptance criteria on purpose —
different entry paths, different data, and boundaries the ACs do not name. They exist so an
implementer cannot teach to the test, and they are run by the reviewer and CI only. Several
are written against verified silent-failure modes: a planted hex literal in the markdown
style object, a short-name `registryDependencies` entry resolving to the shadcn web
registry, `hover:` with no `active:` twin, a missing `PortalHost`, and an unhandled
`approval-requested` that stalls a gated agent forever.
