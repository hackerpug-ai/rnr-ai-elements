---
stability: PRODUCT_CONTEXT
last_validated: 2026-09-01
prd_version: 1.0.0
---

# rnr-ai-elements — MVP

## Product description

A React Native Reusables port of Vercel's AI Elements: universal (iOS / Android / Web)
AI chat and agent UI, distributed the way RNR distributes everything — as a **copy-paste
registry**, not a runtime npm package.

The deliverable is 49 ported components sitting on RNR's existing design system, plus the
small set of base primitives RNR does not yet ship. Installed with the RNR CLI, the code
lands in the consumer's own tree and inherits their theme with no wiring.

## Problem statement

A developer with a themed Expo app who needs an AI chat screen today has three bad options.

1. **Port the web library by hand.** AI Elements is structurally web: DOM elements, CSS
   cascade, hover affordances, iframes, react-flow, runtime JSX evaluation. None of it
   survives a copy-paste into React Native.
2. **Adopt the existing third-party RN port.** `muratcakmak/expo-ai-elements` publishes an
   npm package containing **zero component code**, and its pending rewrite **drops React
   Native Reusables** for its own primitives — so adopting it forks the design system.
3. **Build it themselves.** The three hardest pieces — stick-to-bottom streaming scroll,
   a keyboard-surviving composer, and streamed markdown with fenced code — are each a
   multi-day problem on React Native, and every hand-rolled attempt jitters.

Underneath all three sits a harder constraint: **52% primitive coverage**. AI Elements
depends on 55 shadcn/ui primitives; RNR ships an equivalent for 29 of them. Roughly half
the dependency surface is missing before a single AI component is written.

## Solution summary

Rebuild every AI Elements component on top of RNR, creating a new primitive **only** where
RNR has none, and declaring nothing — no theme file, no token, no color literal — so that
any config or override the consumer already applies to RNR flows into this library with
zero per-component wiring.

Three properties define success:

| Promise | How it is made true | How it is proven |
|---|---|---|
| Reuse before create | 29 RNR primitives consumed by registry URL; the 26-item gap resolved as 10 compose / 7 substitute / 6 create / 3 unnecessary | Every created primitive names the gap entry and the shipped component that requires it |
| One design system on a phone | Zero tokens declared; every value is an RNR semantic utility class | Swap the consumer's theme for a loud alternate palette; every surface must move |
| Distributes like RNR | Copy-paste registry, RNR CLI, files the consumer owns and edits | CI installs every registry item into a clean Expo app |

## What this library is not

It owns none of the AI. No transport, no `useChat`, no streaming client, no tool executor,
no persistence. Components are prop-driven and stateless about the model — which is what
lets them work with the AI SDK, LangChain, or a hand-rolled SSE reader equally.
