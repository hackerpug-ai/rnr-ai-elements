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

Pinned to **Expo SDK 57's own resolver**, not to npm `latest`. Verified against
`expo/expo@sdk-57 packages/expo/bundledNativeModules.json` on 2026-09-01.

| Layer | Choice | Version |
|---|---|---|
| Language | TypeScript | **6.0.3** in the harness (Expo 57's pin) · 7.0.2 at the workspace root |
| Package manager | pnpm | 10.32.1 |
| Lint / format | Biome | 2.5.11 |
| Tests (logic) | Vitest | 4.1.11 |
| Dev + sign-off | Storybook | `@storybook/react-native` 10.5.4 (device) + `@storybook/react-native-web-vite` 10.5.10 (web) |
| Styling engine | **Uniwind AND NativeWind** | uniwind 1.11.0 (Tailwind v4) · nativewind 4.2.6 (Tailwind v3) |
| CSS | **Tailwind v4** | 4.3.3 — `@theme` + `oklch`, no `tailwind.config.js` |
| Base UI | React Native Reusables (registry) | CLI **1.0.0** · `@rn-primitives/*` 1.5.2 |
| App shell | Expo | 57.0.19 |
| React Native | **0.86.3** | Expo 57's pin. **npm latest is 0.87.1 — do not take it.** |
| Node | Node | 24 |
| AI SDK (example app only) | `ai` / `@ai-sdk/react` | 7.0.89 / 4.0.92 |

**Always `npx expo install`. Never `npm install`, never npm `latest.`** Several packages
have npm latest ahead of Expo's pin, and taking latest breaks the native build at runtime
rather than at install:

| Package | Expo 57 pin | npm latest |
|---|---|---|
| `react-native-gesture-handler` | ~2.32.0 | 3.2.1 (**major**) |
| `react-native-webview` | 13.16.1 | 14.0.1 (**major**) |
| `react-native-reanimated` | 4.5.1 | 4.6.0 |
| `@shopify/flash-list` | 2.0.2 | 2.3.2 |
| `lucide-react-native` | not bundled | 1.39.0 (**major** vs RNR's ^0.577) |

CI runs `npx expo-doctor` so drift fails the build instead of surfacing as a native crash.

**The registry ships BOTH engines**, at parity, exactly as RNR does. Registry source is
**engine-agnostic**: it never imports `uniwind` or `nativewind` and never calls `withUniwind`
or `cssInterop`. The build fans one source into `public/r/{nativewind,uniwind}/` by rewriting
the import alias segment and the registry-dependency URL segment.

Measured basis: after the RNR CLI rewrites imports on install, its own two component trees
differ in **exactly one file — `icon.tsx`**. All 32 others are byte-identical. That one file
is RNR's, not ours, so we never write engine-specific code. The styling contract hard-fails
any that appears.

Each engine has its own harness package because their Tailwind majors conflict:
`apps/harness` (uniwind, Tailwind v4, :6006) and `apps/harness-nativewind`
(nativewind, Tailwind v3, :6007).
Note: the RNR Rosetta KB's `theming.md` documents the **Nativewind** path and is superseded
here by its `MIGRATION.md` v1.1.0. Anyone briefed with `theming.md` alone will produce a
component that silently does not theme.

## Distribution — registry only, no npm package

`react-native-reusables` is **not published to npm** (only `@react-native-reusables/cli`
is). RNR components resolve at the **consumer's** `@/components/ui/*` alias, which an npm
package cannot import from. A packaged library would have to vendor its own copies of the
29 reused primitives — two `Button`s in one app, and a consumer token edit that reaches
theirs but not ours.

So the shipped artifact is `public/r/*.json` plus committed `.tsx` sources, installed with
the RNR CLI. `registryDependencies` entries are **always absolute https URLs**; a short
name like `"card"` resolves against the shadcn **web** registry and installs a DOM
component.

## Expo Go vs dev client

The **core** chat and agent surface runs in **Expo Go**. A dev client is required only for
four opt-in items: `react-native-enriched-markdown` (a Fabric native module, confirmed
absent from Expo 57's bundled list), `react-native-streamdown`, `expo-speech-recognition`,
and audio capture beyond `expo-audio`'s Expo Go surface. This is why `message` takes an
injected `renderMarkdown` prop with a plain RNR `Text` default — without that seam the
whole chat shell becomes dev-client-only.

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

## Known Risk — Vitest cannot assert a React Native style

Vitest is this project's test runner by decision. The cost is **two stacked problems**, and
the second has no fix inside Vitest:

1. React Native ships untranspiled Flow-typed source, which is why `jest-expo` (57.0.5)
   exists. The Vitest path needs `vitest-react-native` (**0.1.5** — early) or a hand-rolled
   transform.
2. **Uniwind compiles classes in the Metro transform.** Under Vitest a `className` is an
   inert string, so even a working render cannot assert a single style.

Verification is therefore tiered by what each tool can actually observe:

| Tier | Owns |
|---|---|
| **Vitest** | markdown part-serializer, ANSI tokenizer, stack-trace parser, tool-status→badge map, throttle scheduler, registry build/freshness/token scripts, AI SDK type conformance |
| **Storybook on device** | render, style, portal layering, safe-area insets, keyboard, Reanimated timing, streaming frame rate, theming flip — **the sign-off gate** |
| **Storybook on web** | prop matrices, fast iteration, the public gallery — **never sufficient alone** |
| **CI shell** | a registry item installs into a clean Expo app and typechecks |

Run the render-under-Vitest question as its **own first task** with a hard timebox and a
written go/no-go. Fallback is `jest-expo` as a second runner for rendering only.
**Absolute floor: never substitute a mock renderer and report a component as tested.**

## Dev Setup

Not scaffolded yet. The first task is the **proven-reference-flow spike**: stand up the
Expo 57 + Uniwind + Tailwind v4 workspace, the registry build, and Storybook, then take ONE
component (`message`) the whole distance — story renders on iOS and Android, theming flip
verified in light and dark, registry item installs into a clean Expo app, renders there
against a real streaming route. Until that is green, nothing downstream is trustworthy.

Once it exists:

```bash
pnpm install                     # ALWAYS npx expo install for RN/Expo packages
pnpm exec tsc --noEmit           # typecheck   (CI job: typecheck)
pnpm exec biome ci .             # lint        (CI job: lint)
pnpm exec vitest run             # logic tests (CI job: test)
pnpm registry:build              # public/r/*.json (CI job: registry — fails if stale)
pnpm exec expo-doctor            # pin drift   (CI job: registry)

pnpm storybook:web               # iteration + gallery
pnpm storybook:device            # THE SIGN-OFF GATE — iOS simulator + Android emulator
```

**A component is not done on the strength of a web story.** `react-native-web` does not
reproduce portal layering, safe-area insets, keyboard avoidance, or native animation
timing. Every completion claim cites an on-device story.

## Spec

- PRD: [`.spec/prds/mvp/`](.spec/prds/mvp/README.md) — 23 use cases, 95 acceptance criteria,
  95 test criteria, all 49 components carrying a porting verdict.
- Scenarios: `.spec/scenarios/` — 46 visible, 60 holdout, 7 cross-UC journeys.
  Holdouts are run by the reviewer and CI only; never hand them to an implementer.
- Coverage: [`.spec/scenarios/coverage-matrix.md`](.spec/scenarios/coverage-matrix.md).

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
