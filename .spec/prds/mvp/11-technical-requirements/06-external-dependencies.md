---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# External Dependencies

## Pin reconciliation — read this first

`AGENTS.md` v1 declared **React Native 0.87.1** under Expo 57.0.19. That is wrong: Expo
SDK 57's `bundledNativeModules.json` pins **`react-native: 0.86.3`**. The value came from
`npm view react-native version` (npm latest) rather than from Expo's resolver.

**One universal rule follows: always `npx expo install`, never `npm install` and never npm
`latest`.** Several relevant packages have npm latest *ahead* of Expo's pin, and taking
latest breaks the native build at runtime rather than at install:

| Package | Expo 57 pin | npm latest | Delta |
|---|---|---|---|
| `react-native` | 0.86.3 | 0.87.1 | minor — **0.86.3 confirmed by Expo's own scaffolder** |
| `react-native-gesture-handler` | ~2.32.0 | 3.2.1 | **major** |
| `react-native-webview` | 13.16.1 | 14.0.1 | **major** |
| `react-native-reanimated` | 4.5.1 | 4.6.0 | minor |
| `@shopify/flash-list` | 2.0.2 | 2.3.2 | minor |
| `lucide-react-native` | (not bundled) | 1.39.0 | **major vs RNR's ^0.577** |
| `@react-native-reusables/cli` | n/a | **1.0.0** | the KB and v1.0.0 of this PRD both said 0.7.1 |
| `typescript` | **~6.0.3** (Expo 57 template) | 7.0.2 | harness uses Expo's pin; workspace root uses 7.0.2 |

CI runs `npx expo-doctor` so drift fails the build instead of surfacing as a native crash.

Second-order risk: `@rn-primitives` 1.5.2 is verified against RN 0.85.3 in the RNR KB, so
its behavior on 0.86.x is untested by anyone. A device smoke pass across every portal
component belongs in the first wave.

## By component

| Component | Dependency | Docs | Expo |
|---|---|---|---|
| all (base layer) | `React Native Reusables registry (CLI 0.7.1, uniwind variants)` | [docs](https://reactnativereusables.com/docs) | yes |
| all (base layer) | `@rn-primitives/* 1.5.2` | [docs](https://rnprimitives.com) | yes |
| all (styling) | `uniwind 1.11 + tailwindcss 4.3` | [docs](https://tailwindcss.com/docs/theme) | yes |
| all (icons) | `lucide-react-native (via RNR Icon)` | [docs](https://lucide.dev/guide/packages/lucide-react-native) | yes |
| conversation | `react-native FlatList (core); @shopify/flash-list optional` | [docs](https://reactnative.dev/docs/flatlist) | yes |
| message-response-markdown | `react-native-enriched-markdown (+ katex peer)` | [docs](https://github.com/software-mansion/enriched-markdown) | yes |
| message-response-markdown (streaming) | `react-native-streamdown 0.2.0` | [docs](https://github.com/software-mansion/enriched-markdown) | yes |
| code-block / terminal / stack-trace / snippet / message-actions | `expo-clipboard` | [docs](https://docs.expo.dev/versions/latest/sdk/clipboard/) | yes |
| prompt-input / confirmation / controls | `expo-haptics` | [docs](https://docs.expo.dev/versions/latest/sdk/haptics/) | yes |
| prompt-input (optional) | `react-native-keyboard-controller` | [docs](https://kirillzyusko.github.io/react-native-keyboard-controller/) | yes |
| web-preview / jsx-preview | `react-native-webview` | [docs](https://docs.expo.dev/versions/latest/sdk/webview/) | yes |
| image / attachments | `expo-image` | [docs](https://docs.expo.dev/versions/latest/sdk/image/) | yes |
| audio-player / transcription / voice-selector | `expo-audio` | [docs](https://docs.expo.dev/versions/latest/sdk/audio/) | yes |
| speech-input / mic-selector | `expo-speech-recognition (jamsch)` | [docs](https://github.com/jamsch/expo-speech-recognition) | yes |
| sheet / drawer / slider / carousel | `react-native-gesture-handler` | [docs](https://docs.swmansion.com/react-native-gesture-handler/) | yes |
| sheet / spinner / shimmer / reasoning / chain-of-thought | `react-native-reanimated + react-native-worklets` | [docs](https://docs.swmansion.com/react-native-reanimated/) | yes |
| toast / toaster / prompt-input / all anchored overlays | `react-native-safe-area-context` | [docs](https://appandflow.github.io/react-native-safe-area-context/) | yes |
| sheet / dialog content (iOS) | `react-native-screens (FullWindowOverlay)` | [docs](https://docs.swmansion.com/react-native-screens/) | yes |
| open-in-chat / inline-citation / sources | `react-native Linking (core) or expo-linking` | [docs](https://docs.expo.dev/versions/latest/sdk/linking/) | yes |
| ai-sdk-adapter (opt-in registry:lib) + apps/example | `ai 7.0.89 / @ai-sdk/react 4.0.92` | [docs](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage) | yes |
| apps/example (streaming transport) | `expo/fetch` | [docs](https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api) | yes |
| NONE — explicitly excluded | `react-flow, embla-carousel, recharts, cmdk, vaul, sonner, react-day-picker, react-resizable-panels, react-hook-form, @radix-ui/*` | [docs](https://reactnative.dev/docs/intro-react-native-components) | **NO — banned** |

## Expo Go vs dev client

The split is an architectural decision, not a discovered constraint. The **core** — the
chat shell, the agent surface, and every gap primitive we build — runs in **Expo Go**,
because it depends only on React Native core plus modules in Expo 57's
`bundledNativeModules`. RNR itself is Expo Go-clean and this preserves that property.

A **dev client** is required only for these opt-in capability items:

| Dependency | Why |
|---|---|
| `react-native-enriched-markdown` | DEV CLIENT REQUIRED — this is the one that forces the split. Verified codegenConfig declaring Fabric components (EnrichedMarkdown, EnrichedMarkdownText, EnrichedMarkdownTextInput) for iOS and Android; absent from Expo 57 bundledNativeModules; peer-depends on katex. Installable via expo install + prebuild/EAS, so Expo-compatible — but NOT Expo Go. Ships as the opt-in message-response-markdown item. Requires flavor='github' for tables and $$...$$ block math. |
| `react-native-streamdown` | DEV CLIENT REQUIRED (transitively). npm 0.2.0. Peers: react-native-worklets >=0.8.3 and react-native-enriched-markdown >=0.4.0. LANDMINE: its documented workletizableModules Metro option was renamed upstream to importForwarding.moduleNames; the stale key is SILENTLY IGNORED and crashes all markdown streaming on device. Prior art paid for this discovery — do not re-pay it. |
| `expo-speech-recognition` | DEV CLIENT REQUIRED. jamsch/expo-speech-recognition, versioned 57.0.0 to track the SDK but a community package with a config plugin, not first-party Expo. Opt-in dependency of speech-input / mic-selector / transcription only. |

This is why `message` takes an injected `renderMarkdown` prop with a plain RNR `Text`
default. Without that ~3-line seam, the single most important component in the library —
and therefore the whole chat shell — becomes dev-client-only.
