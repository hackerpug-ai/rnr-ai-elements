---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Architecture Diagram

```
CONSUMER'S EXPO APP  (owns the theme, the navigator, and the AI transport)
│
│  global.css  @theme { --color-primary … }   ← the ONLY place tokens are declared
│  components/ui/*      ← RNR's files, installed by the RNR CLI
│  components/ai/*      ← OUR files, installed by the same CLI
│  lib/utils.ts (cn)    ← ours import THIS, never a local copy
│
└── useChat / own hook / raw SSE   ← consumer's, we never ship it
                │
                ▼  props only
        ┌───────────────────────────────┐
        │   rnr-ai-elements components   │  49 ported + 16 new base primitives
        │   prop-driven, model-agnostic  │  zero tokens, zero transport
        └───────────────────────────────┘
                │ composes
                ▼
        ┌───────────────────────────────┐
        │  React Native Reusables (29)   │  by registry URL, never vendored
        └───────────────────────────────┘
                │
                ▼
   @rn-primitives/*  →  Uniwind + Tailwind v4  →  React Native / Expo


THIS REPO  (never shipped to a consumer)
│
├── packages/registry/src/uniwind/components/{ai,ui}/*.tsx   the sources
├── packages/registry/registry.json                          hand-authored index
├── packages/registry/scripts/build-registry.ts              deterministic emitter
├── public/r/*.json                     ← THE SHIPPED ARTIFACT (committed)
│
├── .storybook + *.stories.tsx          one story set, two runtimes
│     ├── @storybook/react-native          on device  ← SIGN-OFF GATE
│     └── @storybook/react-native-web-vite  in browser ← iteration + gallery
│
├── apps/example/app/api/chat+api.ts    real provider, real token stream
└── CI: typecheck │ lint │ test │ registry │ tokens
```

**Read the direction of the arrows.** Nothing flows from this repo into a consumer at
runtime. The CLI copies source in once; from that moment the file is the consumer's, and
their tokens reach it because it is a file in their tree like any other.
