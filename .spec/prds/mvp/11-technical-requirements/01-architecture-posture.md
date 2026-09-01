---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Architecture Posture

Binding stances. A change to any of these is an architecture review, not a task.

### 1. Zero-runtime registry. The published artifact is `public/r/*.json` plus committed `.tsx` sources — never an importable npm package.

Constraint 6 plus verified prior art: `expo-ai-elements` reserved the npm name and shipped tarballs containing 2-3 files and zero component code (`files:['src/']` pointing at a non-existent dir, `main:'expo-router/entry'`). Every `import ... from 'expo-ai-elements/...'` in its own README is unresolvable. If we publish an npm name at all it must be a pointer package that errors loudly on import, or nothing.

### 2. RNR is consumed as a peer registry by full URL, not vendored and not reimplemented. Our `registryDependencies` point at `https://reactnativereusables.com/r/uniwind/<name>.json`.

Constraint 1. 29 of 55 shadcn deps already exist in RNR at 32/32 engine parity. Vendoring them would fork the design system and break constraint 3 (one visual system). The known cost — RNR can change what a URL serves — is mitigated by a scheduled CI job that reinstalls the example app from the live registry and typechecks, not by vendoring.

### 3. This library ships zero theme files. No `global.css`, no `@theme` block, no `tailwind.config.js`, no `lib/theme.ts`, no `NAV_THEME`, no ThemeProvider, no color literal anywhere in the tree.

Constraint 5. The only way a consumer override passes through with no per-component wiring is if we never declare a token — we only *consume* utility classes that Uniwind resolves in the consumer's own Metro pipeline. Any value we hold is a value the consumer cannot override.

### 4. Presentation only. No transport, no `useChat`, no streaming client, no tool executor, no persistence ships in the registry. Components are prop-driven and stateless about the model.

AGENTS.md already declares this split. It also keeps `ai` out of the install graph so a consumer on LangChain, their own hook, or a raw SSE reader can use the components. The AI SDK is wired exactly once, in `apps/example`.

### 5. Uniwind-only for v1, with the RNR dual-engine directory layout in place from commit one (`packages/registry/src/uniwind/...`).

See distribution_design.tradeoff. Deferring Nativewind is a build-script fan-out plus a Tailwind v3/v4 utility-name pass later, not a rewrite — because we never call `cssInterop`/`withUniwind` ourselves; RNR's `Icon` absorbs the one genuine engine divergence.

### 6. Expo Go-safe core; every native-module capability is an opt-in registry item with the dev-client requirement stated in its `description`.

Constraint 7. `react-native-enriched-markdown` ships a `codegenConfig` with Fabric components (verified on the npm manifest) and is absent from Expo SDK 57's `bundledNativeModules.json` — it cannot run in Expo Go. If `message-response` hard-binds to it, the entire chat shell becomes dev-client-only. Making the markdown renderer an injected prop keeps ~45 of 49 components Expo Go-runnable for a 3-line cost.

### 7. `Conversation` is virtualized from day one — `FlatList` with `inverted` + `maintainVisibleContentPosition`.

Prior art's `Conversation` is a `ScrollView` + `.map()` wearing FlatList-shaped props. It renders every message, passes every code review, and degrades with usage. This is the single defect most worth not inheriting.

### 8. Verification is tiered by what the tool can actually observe: Vitest owns pure logic, type-conformance, and build scripts; a device/simulator tier owns render, style, portal, inset, animation, and theming.

Uniwind compiles classes in the Metro transform. Even a perfectly working React Native render under Vitest cannot assert a single style, because the styling engine is not in the Vitest pipeline. Scoping Vitest to what it can prove is the honest architecture, not a concession.

### 9. Every string goes inside RNR `Text`; every icon goes through RNR `Icon as={...}`; every class merge goes through RNR `cn` imported from `@/lib/utils`.

These three indirections are what make constraint 3 (one visual system) and constraint 5 (theming passthrough) mechanically true rather than aspirational. `Icon` is also the one file where Nativewind and Uniwind diverge, so routing through it is what keeps our source engine-agnostic.

### 10. Overlays inside our own `sheet`/`command` use a NAMED `PortalHost`, designed at plan time — not the root default host.

An RNR `Select` or `DropdownMenu` rendered inside a bottom sheet portals to the root host and appears *behind* the sheet. This is invisible on web and only reproduces on device.
