---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# System Components

| Component | Role |
|---|---|
| `packages/registry/src/uniwind/components/ai/*.tsx` | The 49 ported AI Elements components. The product. Import RNR by alias (`@/components/ui/*`, `@/lib/utils`) so the build script can retarget paths on install. |
| `packages/registry/src/uniwind/components/ui/*.tsx` | The 16 base primitives we own because RNR does not ship them (sheet, slider, table, toast, toaster, item, empty, field, input-group, button-group, spinner, command, breadcrumb, kbd, sidebar, navigation-menu). Written to RNR's exact file shape — `cva` + `cn(variants, contextClass, className)` + `Platform.select` — so a consumer cannot tell ours from RNR's. |
| `packages/registry/src/examples/*.tsx` | Runnable demo compositions published as `registry:example` items (chat shell, agent trace, tool-approval flow). Doubles as the docs code samples so samples cannot rot. |
| `packages/registry/registry.json` | shadcn registry index. One entry per item: `name`, `type`, `title`, `description`, `dependencies` (npm), `registryDependencies` (FULL URLs only), `files[{path,type,target}]`. |
| `packages/registry/scripts/build-registry.ts` | Reads `registry.json` + sources, rewrites internal `@/registry/uniwind/...` imports to consumer aliases, emits `public/r/<name>.json` and `public/r/registry.json`. Deterministic — byte-identical output for identical input, so the CI freshness gate works. |
| `scripts/check-registry-fresh.ts` | CI gate (`registry` job in AGENTS.md). Re-runs the build into a temp dir and diffs against committed `public/r/`. Fails on stale output. Also asserts every `registryDependencies` entry starts with `https://` — the short-name form silently resolves against the shadcn WEB registry and installs DOM components. |
| `scripts/check-tokens.ts` | CI gate. Greps registry sources for `#rrggbb`, `rgb(`, `hsl(`, `oklch(`, and `style={{ color:` and fails on any hit. This is the deterministic enforcement of the theming-passthrough contract; without it, drift is only visible on a device in a rebranded app. |
| `apps/example (Expo 57 + expo-router + Uniwind)` | Dev harness, device verification target, and — via `expo export -p web` — the docs site that also hosts `public/r/*.json` once a domain exists. The ONLY place `ai` / `@ai-sdk/react` appear. |
| `apps/example/app/api/chat+api.ts` | A real expo-router API route calling a real provider with `streamText` + `toUIMessageStreamResponse()`. Exists specifically so streaming, throttling, auto-scroll, and tool-state rendering are verified against a real token stream — the prior-art repo verified against a `setTimeout` simulation and that is not evidence. |
| `vitest.config.ts + tests/` | Logic tier: markdown part-serializer, tool-status to badge mapping, attachment media categorization, throttle scheduler, build-script output. Plus the type-conformance test against AI SDK v7. No component rendering. |
| `Device verification protocol (apps/example + simulator/emulator)` | The tier that owns everything Vitest structurally cannot: portal layering, safe-area insets, keyboard behavior, Reanimated transitions, streaming under real jitter, and the token-flip theming proof in light AND dark on iOS and Android. |
| `.github/workflows/ci.yml` | Jobs: typecheck (tsgo), lint (biome ci), test (vitest run), registry (freshness + URL-form gate), tokens (hardcoded-color gate). Plus a scheduled job that installs the example app fresh from the live RNR registry and typechecks, to catch upstream RNR drift. |
