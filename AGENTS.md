# rnr-ai-elements

A **React Native Reusables port of Vercel's AI Elements** — universal (iOS / Android / Web)
AI chat and agent UI, distributed the way RNR distributes everything: as a **copy-paste
registry**, not an npm runtime package.

- Web source of truth being ported: <https://github.com/vercel/ai-elements> · <https://elements.ai-sdk.dev>
- Base UI framework: <https://reactnativereusables.com/>

## Local Domain Experts

When dispatching subagents for planning, review, or implementation, prefer these project-local experts over generic agents. They understand this project's stack, patterns, and conventions.

### Implementation experts — these build the port

| Agent | Role | When to Use |
|-------|------|-------------|
| `react-native-reusables-planner` | Primary planner | Component set, portal/inset topology, TextClassContext strategy, theming scope, transcript/streaming/tool-state architecture |
| `react-native-reusables-implementer` | Primary implementer | Building any component in this registry; RNR CLI scaffolding; universal screens honoring no-bare-strings, no-cascade, portal-host, safe-area-inset, streaming-throttle |
| `react-native-reusables-reviewer` | Primary reviewer | Adversarial review of every component: bare strings, assumed cascade, missing PortalHost, prop-controlled menus, theme drift, unbounded Conversation, stripped streaming throttle, engine mixing |
| `react-native-ui-planner` | RN platform planning | Anything below the RNR registry surface — Expo config, navigation, native modules, gestures/Reanimated, iOS-vs-Android divergence |
| `react-native-ui-implementer` | RN platform implementation | Example-app screens, Expo/Metro wiring, native or platform-specific code that is not itself a registry component |
| `react-native-ui-reviewer` | RN platform review | Accessibility, platform parity across iOS/Android/Web, list/render performance, React Native idiom |
| `aisdk-planner` | AI SDK architecture | The `UIMessage` / tool-part `state` seam, streaming contracts, provider strategy for the example app |
| `aisdk-implementer` | AI SDK wiring | `useChat`, transport, tool execution, abort/retry in the example app — the library itself ships none of this |
| `aisdk-reviewer` | AI SDK review | v7-correctness, real-provider verification, stale-v6 patterns |
| `frontend-designer` | Visual presentation | Layout, styling, animation, token design ONLY — not logic or state management |
| `test-quality-reviewer` | Test reality | Whether a component test would actually catch a break, vs. asserting on a mock |
| `security-reviewer` | Security | Markdown rendering, link handling, any user-content path |

### Consulting experts — reference only, they do NOT implement

The `shadcn-ai-elements-*` agents know the **web** AI Elements library (React DOM,
shadcn/ui, Tailwind on the browser). Consult them to learn what an original component
*is* and *does*. They are the authority on the source material and on nothing else here.

| Agent | Consult about | Never ask it to |
|-------|---------------|-----------------|
| `shadcn-ai-elements-planner` | What a web AI Elements component is for, its composition tree, its prop surface, which registry item corresponds to what | Plan this repo's components, choose our stack, or size our tasks |
| `shadcn-ai-elements-implementer` | How the original is actually built in React DOM — the behavior we must preserve when porting | Write, edit, or scaffold **any** file in this repo |
| `shadcn-ai-elements-reviewer` | Parity check: did the port lose behavior the web original had | Review our React Native code for correctness or idiom |

**Hard rule: this is a React Native port. We do not use the web library.**

- Never `npm install` / `npx shadcn add` any web AI Elements or shadcn/ui package here.
- Never copy web component source into this repo. Read it, understand the behavior,
  then have `react-native-reusables-implementer` write the React Native equivalent.
- Web-only constructs have no place in output: DOM elements, `className` cascade
  assumptions, `data-*` variants, browser portals, CSS hover/focus-visible, `onClick`.
- A consulting agent's answer is **input to a plan**, never a diff. If one returns code,
  treat it as a specification of behavior to reimplement.

**Dispatch priority**: Always check this table first. Only fall back to generic `general-purpose` agents when no domain expert matches the task.

## Platforms

This project targets: **iOS, Android, Web**

| Platform | Status | Notes |
|----------|--------|-------|
| iOS | Required | Primary verification target — simulator screenshots required for visual claims |
| Android | Required | Must ship simultaneously; keyboard/inset behavior differs from iOS |
| Web | Required | RNR is universal; a component that only works on native is not done |
| Desktop | Not targeted | - |

## Tech Stack

Pinned deliberately. `expo-ai-elements` (Expo 55) and the react-native-reusables KB (Expo 56)
are both behind current; this project starts on **current**, not on either KB's pins.

| Layer | Choice | Version (verified on npm 2026-09-01) |
|---|---|---|
| Language | TypeScript | **7.0.2** (the Go-native compiler — `latest`) |
| Package manager | pnpm | 10.32.1 |
| Lint / format | Biome | 2.5.11 |
| Tests | Vitest | 4.1.11 |
| Styling engine | **Uniwind** | 1.11.0 |
| CSS | **Tailwind v4** | 4.3.3 — `@theme` block + `oklch`, no `tailwind.config.js` |
| Base UI | React Native Reusables (registry) | CLI 0.7.1 · `@rn-primitives/*` 1.5.2 |
| App shell | Expo | 57.0.19 · React Native 0.87.1 |
| Node | Node | 24 |
| AI SDK (example app only) | `ai` / `@ai-sdk/react` | 7.0.89 / 4.0.92 |

**Styling engine is Uniwind, not Nativewind.** Tailwind **v4** syntax only. A component
written with a `tailwind.config.js` mental model or HSL tokens is wrong for this repo.

### What this library owns, and what it does not

```
Transcript state    →   THIS LIBRARY            →   RNR base + Uniwind
(consumer's: useChat,   (Conversation, Message,     (Button, Text, Icon,
 or their own hook)      Tool, Reasoning, …)         Tailwind v4 classes)
```

Components are **prop-driven and stateless about the model**. No transport, no streaming
client, no tool executor ships here. That wiring lives in the example app and in the
consumer's code.

## Prior Art — read before porting anything

`muratcakmak/expo-ai-elements` is an existing third-party RN port of Vercel AI Elements.
Brain has a full Rosetta KB on it at `~/Projects/brain/.rosetta/docs/expo-ai-elements/`.
Read it before designing a component — it has already paid for several on-device
discoveries. Three that matter:

1. Its **npm package ships no component code** (2–3 files: package.json, README, LICENSE).
   Registry-URL install is the only path that works. Do not repeat that packaging mistake.
2. Its pending "SDK 57 rewrite" **drops React Native Reusables** in favour of its own
   `src/primitives/`. That is the gap this project exists to fill: *stay on RNR*.
3. `react-native-streamdown`'s documented `workletizableModules` option was renamed
   upstream to `importForwarding.moduleNames`; the stale option is silently ignored and
   crashes all markdown streaming.

Also read `~/Projects/brain/.rosetta/docs/react-native-reusables/` — it overrides model
priors from the pre-2025 RNR rewrite and from shadcn/ui web reflexes.

## Known Risk — Vitest and React Native components

Vitest is this project's test runner by decision. Be aware of what that costs: React
Native ships **untranspiled Flow-typed source**, which is why `jest-expo` (57.0.5) is the
mature default for rendering RN components in a test. The Vitest path needs
`vitest-react-native` (**0.1.5** — early) or a hand-rolled alias/transform config.

Treat "render an RNR component under Vitest and assert on it" as **its own first task**,
proven end to end before component work depends on it. If it cannot be made to work, say
so and raise it — do not quietly swap in a mock renderer and call the component tested.

## Dev Setup

Not scaffolded yet. First task is standing up the Expo 57 + Uniwind + Tailwind v4 app
and the registry build. Once it exists:

```bash
pnpm install
pnpm exec tsc --noEmit      # typecheck  (CI job: typecheck)
pnpm exec biome ci .        # lint       (CI job: lint)
pnpm exec vitest run        # tests      (CI job: test)
pnpm registry:build         # public/r/*.json (CI job: registry — fails if stale)
```

## Scratch artifacts

Temporary files, worktrees, and test junk follow
[`brain/docs/SCRATCH-ARTIFACTS-STANDARD.md`](~/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md).
Never hardcode `/tmp` — use `$TMPDIR` / `tmpdir()`.

## "Pre-existing" claims require proof

Before dismissing a failure as "pre-existing" or "unrelated":
1. `git stash` your changes
2. Re-run the failing check
3. If it ALSO fails → note in commit body, proceed
4. If it PASSES → you caused the regression, fix before committing
5. Document the proof in your response (show both outputs)

"I didn't change that file" is not proof. `git stash && rerun` is proof.
Never use `git commit --no-verify` — it's blocked by `.claude/settings.json`.
