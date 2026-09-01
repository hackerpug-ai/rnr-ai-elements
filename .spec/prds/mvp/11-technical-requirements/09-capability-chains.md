---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Capability Chains

Boundary-crossing promises, per `brain/docs/CAPABILITY-CHAIN-PLANNING.md`.

| ID | Promise | Trigger | Hops | Failure mode | Real-service proof | Owner |
|---|---|---|---|---|---|---|
| `CAP-DIST-01` | A registry item installs into a clean Expo app and renders | `npx @react-native-reusables/cli add <url>` | build → commit `public/r/*.json` → raw.githubusercontent → CLI resolves `registryDependencies` → RNR registry → files land at `target` | A short-name `registryDependencies` entry resolves against the **shadcn WEB registry** and installs a DOM component | CI installs every item into a fresh Expo app and typechecks | `react-native-reusables-implementer` |
| `CAP-THEME-01` | A consumer token edit reaches every component with no per-component wiring | edit `--color-*` in the consumer's `global.css` | Tailwind v4 `@theme` → Uniwind Metro transform → class-to-style map → our copied `.tsx` | A hex literal, an invented token, or a local `cn` copy — **all four fail silently** | Swap for a loud alternate palette; screenshot 6 pairs (iOS + Android × light + dark); every pixel must move | `frontend-designer` |
| `CAP-STREAM-01` | Streamed tokens render pinned to the bottom without dropping frames | provider streams a response | provider → `expo/fetch` (RN's global fetch does **not** stream bodies) → `useChat` → parts → `Conversation` → `FlatList` | Non-virtualized list mounts every message; or the ~80ms throttle is removed "to reduce latency" | Real `streamText` route in `apps/example`, 500+ message transcript, mid-range Android | `aisdk-implementer` |
| `CAP-TOOL-01` | Every AI SDK tool-part state renders, including approval | provider emits a tool part | SDK `UIMessage.parts` → `ToolStatus` union → badge + disclosure → `addToolApprovalResponse({id, approved})` | A hand-rolled status union type-checks locally and drifts on the next SDK upgrade; an unhandled `approval-requested` stalls a gated agent forever | Vitest type-conformance test + a real gated tool call answered on device | `aisdk-implementer` |
| `CAP-UPSTREAM-01` | RNR components we compose against keep composing | RNR publishes a registry change | our `registryDependencies` URL → live RNR registry | Upstream drift silently changes what a consumer's `add` pulls | Scheduled CI job scaffolds the example app from the **live** RNR registry and typechecks | `react-native-reusables-reviewer` |
| `CAP-SEC-01` | Model-authored content cannot open a hostile URL or execute | a link or markdown arrives in a message part | model output → markdown render → `Linking.openURL` | A `javascript:` or custom-scheme link; a pathological markdown payload | Scheme allowlist (https/http/mailto) + a length guard, exercised by a negative test | `security-reviewer` |

`jsx-preview` and `sandbox` would each add a chain (runtime evaluation of model-authored
JSX; hosted code execution). Both are **out of scope**, which is why neither appears here.
