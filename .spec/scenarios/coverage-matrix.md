# Coverage Matrix — UC x journey x tier

Generated 2026-09-01, extended 2026-09-04, split 2026-09-05 (`mvp-install-arc` extracted from `mvp-full-arc`; see that journey's own note) with `UC-REG-05` / `UC-REG-06`, from
`.spec/scenarios/`. Verified by
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
| `UC-REG-05` | RNR is a declared, checkable peer dependency | 2 | 2 | `mvp-full-arc` |
| `UC-REG-06` | Versioned public distribution | 2 | 2 | `mvp-full-arc` |

**Totals:** 50 visible · 64 holdout scenarios across 25 use cases · 8 cross-UC journeys

## Journeys

| Journey | Core flows | Edge flows | UCs covered |
|---|---|---|---|
| [`agent-surface`](./journeys/agent-surface.scenario.md) | 1 | 1 | 5 |
| [`chat-navigation`](./journeys/chat-navigation.scenario.md) | 1 | 1 | 2 |
| [`coding-agent`](./journeys/coding-agent.scenario.md) | 1 | 1 | 2 |
| [`mvp-install-arc`](./journeys/mvp-install-arc.scenario.md) | 1 | 0 | 1 |
| [`mvp-full-arc`](./journeys/mvp-full-arc.scenario.md) | 1 | 1 | 9 |
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

## docs-site PRD — added 2026-09-08

From `.spec/prds/docs-site/`. 24 use cases, 43 visible + 98 holdout scenarios, 9 journeys
(7 arcs + 2 edge variants). Verified by
`brain/tools/flow-coverage/flow_coverage_check.py --prd .spec/scenarios` (exit 0, flows=279).
Gap report: none — every docs-site UC appears in >=1 journey and carries >=1 visible + >=1 holdout scenario.

| UC | Title | Visible | Holdout | Journeys |
|---|---|---|---|---|
| `UC-DOCS-01` | Read the getting-started documentation set | 2 | 4 | `docs-integrator-arc`, `docs-themer-arc` |
| `UC-DOCS-02` | Build a chat screen with the single quickstart tutorial | 1 | 4 | `docs-integrator-arc` |
| `UC-DOCS-03` | Use the lean how-to guides | 1 | 3 | `docs-themer-arc` |
| `UC-DOCS-04` | Read the owns-vs-does-not-own boundary | 1 | 3 | `docs-integrator-arc` |
| `UC-DOCS-05` | Read porting notes and prior art | 1 | 3 | `docs-contributor-arc` |
| `UC-DOCS-06` | Track releases through the changelog | 1 | 4 | `docs-evaluator-arc` |
| `UC-GEND-01` | Evaluate the library from the home page in one visit | 2 | 4 | `docs-evaluator-arc` |
| `UC-GEND-02` | Browse components by AI family | 2 | 5 | `docs-evaluator-arc` |
| `UC-GEND-03` | Read a generated component reference page | 2 | 4 | `docs-evaluator-arc`, `docs-themer-arc` |
| `UC-GEND-04` | Copy exact install commands and review dependencies per item | 2 | 5 | `docs-integrator-arc`, `docs-agent-arc` |
| `UC-GEND-05` | See generated run evidence and Expo Go verdicts | 2 | 5 | `docs-evaluator-arc` |
| `UC-GEND-06` | Inspect the generated API reference and full source | 2 | 4 | `docs-evaluator-arc`, `docs-integrator-arc` |
| `UC-GEND-07` | Use the generated registry ledger | 2 | 5 | `docs-integrator-arc`, `docs-contributor-arc` |
| `UC-SHELL-01` | Experience the dark-first themed shell | 2 | 4 | `docs-themer-arc` |
| `UC-SHELL-02` | Navigate by Cmd+K search | 2 | 4 | `docs-resilience-arc` |
| `UC-SHELL-03` | Persist the engine choice across pages | 2 | 4 | `docs-integrator-arc` |
| `UC-SHELL-04` | Use the site without JavaScript, on mobile, and in print | 2 | 5 | `docs-resilience-arc` |
| `UC-DELIV-01` | Build the docs over fail-closed registry data | 2 | 5 | `docs-delivery-arc`, `docs-contributor-arc` |
| `UC-DELIV-02` | Deploy gated to Cloudflare Workers at the canonical domain | 2 | 5 | `docs-delivery-arc` |
| `UC-DELIV-03` | Serve the registry JSON from the same deploy | 2 | 4 | `docs-delivery-arc`, `docs-agent-arc` |
| `UC-DELIV-04` | Recover from bad deploys and dead URLs | 2 | 4 | `docs-resilience-arc` |
| `UC-EXT-01` | Fetch machine-readable agent docs | 2 | 4 | `docs-agent-arc` |
| `UC-EXT-02` | Trust the GitHub-facing surface | 2 | 3 | `docs-contributor-arc` |
| `UC-EXT-03` | Contribute without tribal knowledge | 2 | 3 | `docs-contributor-arc` |
