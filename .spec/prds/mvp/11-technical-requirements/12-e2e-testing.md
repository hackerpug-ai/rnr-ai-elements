---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# E2E Harness Constitution

Per `brain/docs/E2E-HARNESS-CONSTITUTION.md`. **Incomplete until its reference flow is
proven green in a spike** — that spike gates the deep build.

## Surfaces and their frameworks

| Surface | Framework | Present or provision? |
|---|---|---|
| Component render + interaction (iOS/Android) | `@storybook/react-native` 10.5.4 + Storybook test runner | **PROVISION** |
| Component render (web) | `@storybook/react-native-web-vite` 10.5.10 | **PROVISION** |
| Pure logic | Vitest 4.1 | **PROVISION** |
| Registry install into a clean Expo app | shell + `@react-native-reusables/cli` in CI | **PROVISION** |
| Real streaming end-to-end | `apps/example` + real provider route | **PROVISION** |

Nothing is present today — this is a greenfield repo. Every row is a leading INFRA sprint
that feature sprints depend on.

## The determinism seam

The product renders a **non-deterministic token stream**. Asserting on model prose is
reward-hacking waiting to happen: the test passes when the model is chatty and fails when
it is terse, and nobody learns anything.

**The seam: fixture the stream, assert the engine's outcomes.**

- A recorded `UIMessageStream` fixture (captured once from the real provider, committed)
  replays deterministically for every assertion about rendering, scroll pinning, tool-state
  transitions, and throttle behavior.
- Assertions are on **observable outcomes**: "the transcript is pinned within 2px of the
  bottom after the final chunk", "the tool badge reads Completed", "`ToolInput` did not
  throw on a partial-JSON chunk". Never on the text the model produced.
- Exactly **one** live-provider test exists, and it asserts only that a real stream
  arrives and terminates — it is a connectivity canary, not a rendering test.

## Tier ownership — scoped by what each tool can actually observe

This is the load-bearing decision. Uniwind compiles classes **in the Metro transform**, so
even a perfectly working React Native render under Vitest cannot assert a single style.
That is not one problem but two stacked, and the second has no fix inside Vitest.

| Tier | Owns | Cannot observe |
|---|---|---|
| **Vitest 4.1** | markdown part-serializer, ANSI tokenizer, stack-trace parser, `getMediaCategory`, tool-status→badge map, throttle scheduler, registry build + freshness + token scripts, AI SDK type conformance | anything rendered; **any style at all** |
| **Storybook on device** | render, style, portal layering, safe-area insets, keyboard behavior, Reanimated timing, streaming frame rate, theming flip | — |
| **Storybook on web** | render, prop matrices, fast iteration, the public gallery | portals, insets, keyboard, native timing |
| **CI shell** | registry item installs into a clean Expo app and typechecks | runtime behavior |

**The go/no-go this constitution demands first:** prove whether React Native components can
render under Vitest at all, with a hard timebox and a written verdict, **before** any
component work depends on it. `vitest-react-native` is at **0.1.5**. The alternative is
hand-rolling a Flow-strip transform plus RN exports-condition resolution plus mocks for
reanimated/svg/gesture-handler/uniwind — optimistically a day, realistically several, on a
permanently fragile config. If it does not land, `jest-expo@57.0.5` +
`@testing-library/react-native@14` joins as a **second** runner for rendering only.

**Absolute floor:** do not substitute a mock renderer and report a component as tested.
If neither runner lands, say so and let the device tier carry it.

## Landmine ledger

Each of these fails **silently** — no build error, no lint error, no runtime exception.

| Landmine | Symptom | Guard |
|---|---|---|
| `workletizableModules` renamed upstream to `importForwarding.moduleNames` | all markdown streaming crashes on device | comment naming the rename + a device streaming test |
| uniwind × worklets react-native shim cycle | app does not boot (stack overflow) | outermost Metro arbitrator; first-wave task |
| Short-name `registryDependencies` | resolves to the shadcn **web** registry, installs a DOM component | CI asserts every entry starts with `https://` |
| Hardcoded color / invented token | never re-themes; unknown utilities are dropped without warning | `check-tokens.ts` grep + token allowlist + the 6-screenshot flip |
| Raw `<XIcon className>` instead of `<Icon as={X} />` | className ignored; icon frozen at default color | CI grep on `lucide-react-native` used as JSX |
| `hover:` ported with no `active:` twin | control looks right, is dead under a thumb | lint rule + "pressed every control on device" in the review gate |
| Missing `PortalHost` / `contentInsets` | overlay renders **nothing**, or sits under the notch | ship insets inside our components; device screenshot on a notched device |
| Non-virtualized `Conversation` | passes review, degrades with real usage | 500-message device test |
| Streaming text as a live region | screen reader restarts its utterance ~12×/second | hide while streaming, announce once on completion |

## Flake policy

A flaky test is deleted or fixed within one sprint — never retried into green. Retries mask
exactly the timing bugs (scroll pinning, streaming throttle, animation completion) this
product is made of.

## CI lanes

`typecheck` · `lint` · `test` (Vitest) · `registry` (freshness + URL form) · `tokens`
(color literals + allowlist) · scheduled `upstream-rnr-drift`. Device Storybook runs on a
simulator lane per PR touching a component; the token-flip screenshot proof runs per
release.

## Proven-reference-flow gate

Before the deep build begins, ONE component — `message` — must go the whole distance:
authored → story renders on iOS and Android → theming flip verified in light and dark →
registry item installs into a clean Expo app → renders there against the real streaming
route. Until that flow is green, this constitution is a draft.
