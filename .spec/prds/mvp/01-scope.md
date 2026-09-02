---
stability: FEATURE_SPEC
last_validated: 2026-09-01
prd_version: 1.0.0
scope_posture: full
---

# Scope

**Scope posture:** Full feature (kb-prd-plan default — no sizing prompt).

## In scope

- Day-one chat set delivered first and together: conversation, message, prompt-input, code-block, suggestion, sources, shimmer, image
- Streaming markdown and fenced-code rendering inside message, since the 49-component list contains no separate response component and message content is the payload
- Agent surface: tool, reasoning, chain-of-thought, task, plan, confirmation, context, agent, persona, artifact, schema-display, controls
- Coding-agent display surfaces: file-tree, terminal, test-results, stack-trace, commit, package-info, environment-variables
- Voice family behind declared native dependencies: speech-input, transcription, audio-player, voice-selector, audio route selection
- RNR theme token passthrough as the sole styling source, verified by a CI check for hardcoded literals
- Reuse of the 29 existing RNR primitives; creation of gap primitives only when a shipped component requires one
- Press-based replacements for every hover-only interaction
- RNR CLI copy-paste registry distribution with declared peer dependencies
- Expo SDK 57 support on iOS, Android, and web from a single codebase
- Published porting verdicts for all 49 components, including the ones that do not ship
- Example app covering loading, empty, error, and populated states for every shipped component
- **Storybook as the development and sign-off surface** — `@storybook/react-native` on
  device/simulator AND `@storybook/react-native-web-vite` in the browser, from one set of
  story files. The device build is the gate; the web build is for iteration and for a
  browsable gallery.
- A **minimal example app** retained for one purpose Storybook cannot serve: a real
  `expo-router` API route streaming from a real provider, so streaming, throttling,
  auto-scroll and tool-state rendering are verified against real tokens rather than a
  `setTimeout` simulation.

## Out of scope

- Node-graph editing: canvas, node, edge, and connection are a react-flow workspace and have no mobile product in this initiative
- Runtime JSX evaluation: jsx-preview requires evaluating arbitrary JSX at runtime, which Hermes and app-store policy do not support
- Server-backed code execution: sandbox requires a hosted execution service, which is out of a component registry's scope
- Any runtime npm package of components; distribution is registry copy-paste only, matching RNR
- Any server, account, authentication, or hosted service of our own
- Building all 26 missing shadcn primitives; only primitives a shipped component demands are created
- Chat state management, model routing, or provider wiring; these components render whatever the developer's AI SDK stream provides
- Desktop-class multi-pane layouts and drag-to-resize interactions
- Pixel-identical parity with the web reference where touch requires a different interaction; the promise is design-system coherence, not pixel cloning
- **Any npm package of components.** `react-native-reusables` is not published to npm
  (only `@react-native-reusables/cli` is), and RNR components resolve at the *consumer's*
  `@/components/ui/*` alias, which an npm package cannot import from. A packaged library
  would have to vendor its own copies of the 29 reused primitives — two Buttons in one
  app, and a consumer token edit that reaches theirs but not ours. Distribution is
  registry-only, which is also RNR's own model.
- Web Storybook as a sign-off surface. `react-native-web` does not reproduce portal
  layering, safe-area insets, keyboard avoidance, or native animation timing, so a
  component can pass every web story and still be wrong on a phone.

## Dual-engine — the deferral trigger fired

v1.0.0 scoped this as Uniwind-only with a named trigger. **The trigger fired during
scaffold and both engines are now in scope.** The registry emits `nativewind` and `uniwind`
variants at parity, as RNR does.

It turned out cheap for a measured reason: after the RNR CLI rewrites imports on install,
its own two trees differ in **exactly one file, `icon.tsx`** — 125 identical class tokens,
zero nativewind-only classes. That file is RNR's, so our source stays engine-agnostic and
the build fans it out by rewriting a path segment.

Each engine needs its own harness package, because `nativewind@4.2.6` requires Tailwind v3
while `uniwind@1.11` requires v4 and one package cannot hold both majors.
