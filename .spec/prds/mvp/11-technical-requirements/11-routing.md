---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Routing & Views

## Verdict: split, and the split is the point

**The library has NO routes.** It is a copy-paste registry of presentational components
with no navigator, no linking config, no screen, and no route file. Every surface it ships
— sheet, command, sidebar, toast, the dialog family — is **state-driven**, opened by a prop
or a ref, never by navigation. Writing a route map for the registry would be a category
error, and worse, it would invite an implementer to reach for `expo-router` inside a
component and couple the library to a navigator its consumers may not use.

**One routing rule DOES bind the library:** because the consumer owns the navigator, no
registry file may contain `useRouter`, `Link`, or `useNavigation`. Anything navigational is
an `onPress` callback the consumer wires. That single rule is what lets the same component
work under expo-router, React Navigation, or a hand-rolled state machine.

## Storybook is the primary dev surface — and it has no routes either

Per the distribution decision, components are developed and signed off in Storybook, not in
an app shell. One story set, two runtimes:

| Runtime | Package | Role |
|---|---|---|
| On device / simulator | `@storybook/react-native` 10.5.4 | **Sign-off gate.** Real renderer, real insets, real portals, real gesture handling. |
| Browser | `@storybook/react-native-web-vite` 10.5.10 | Iteration speed + a browsable gallery. **Never sufficient alone.** |

Why the gate is on device: `react-native-web` does not reproduce portal layering,
safe-area insets, keyboard avoidance, or native animation timing. A component can pass
every web story and still be wrong on a phone — which is precisely the failure the visual
parity promise forbids.

## The example app HAS routes, and they are a real deliverable

`apps/example` exists for the one thing Storybook cannot host: a real streaming backend.

| Route | Kind | States | Primary UCs | Enter when |
|---|---|---|---|---|
| `/` | screen | empty · streaming · error | UC-CHAT-01, UC-CHAT-02, UC-CHAT-03 | app launch |
| `/agent` | screen | idle · tool-running · approval-pending · resolved | UC-AGENT-01, UC-AGENT-04 | tapping the agent demo |
| `/api/chat` | server route | — | UC-CHAT-01, UC-AGENT-01 | the client posts a message |

`/api/chat` is an `expo-router` API route calling a real provider with `streamText` and
returning `toUIMessageStreamResponse()`. It exists specifically so streaming, throttling,
auto-scroll, and tool-state rendering are verified against **real tokens** — the prior-art
repo verified against a `setTimeout` simulation, and that is not evidence.

One client-side trap: streaming on native requires **`expo/fetch`**. React Native's global
`fetch` does not stream response bodies.

## Route Delta — v1.0.0

| Route | Change | Detail | Discriminator rationale |
|---|---|---|---|
| `/` | NEW | chat screen | product seam — the app's entry frame |
| `/agent` | NEW | agent-surface demo | product seam — a different frame composition, not a state of `/` |
| `/api/chat` | NEW | streaming provider route | server route, not a view |

Storybook stories are **not routes**. A story is a mounted component in a harness; adding
one is never a Route Delta entry.

## Repo layout

- `package.json (private:true, pnpm workspace root) + pnpm-workspace.yaml + turbo.json`
- `packages/registry/registry.json — shadcn registry index, hand-authored, one entry per item`
- `packages/registry/src/uniwind/components/ai/*.tsx — the 49 ported AI Elements components`
- `packages/registry/src/uniwind/components/ui/*.tsx — the 16 base primitives we own`
- `packages/registry/src/uniwind/lib/*.ts — markdown part-serializer and other pure helpers, published as registry:lib`
- `packages/registry/src/examples/*.tsx — runnable demo compositions, published as registry:example`
- `packages/registry/scripts/build-registry.ts — emits public/r/*.json`
- `public/r/*.json + public/r/registry.json — the BUILT, COMMITTED registry (this is the shipped artifact)`
- `apps/example/ — Expo 57 + expo-router + Uniwind app: dev harness, device verification target, docs site via `expo export -p web`, and the only home of ai/@ai-sdk/react`
- `apps/example/app/api/chat+api.ts — real streaming provider route`
- `scripts/check-registry-fresh.ts, scripts/check-tokens.ts — CI gates`
- `.github/workflows/ci.yml — typecheck | lint | test | registry | tokens, plus a scheduled upstream-RNR drift job`

**Adjustment from the distribution decision:** no npm package is published, so there is no
`registry:lib` npm artifact. The pure-logic modules still live in
`packages/registry/src/uniwind/lib/*.ts` and ship as registry items alongside the
components. Storybook config and `*.stories.tsx` sit beside the sources they exercise.

Install command:

```bash
npx @react-native-reusables/cli@latest add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/public/r/conversation.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/public/r/message.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/public/r/prompt-input.json
```
