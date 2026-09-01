# GROUND TRUTH — verified from live repo trees 2026-09-01

Sources: github.com/vercel/ai-elements @main, github.com/founded-labs/react-native-reusables @main

## AI Elements components to port (49)

agent, artifact, attachments, audio-player, canvas, chain-of-thought, checkpoint, code-block, commit, confirmation, connection, context, controls, conversation, edge, environment-variables, file-tree, image, inline-citation, jsx-preview, message, mic-selector, model-selector, node, open-in-chat, package-info, panel, persona, plan, prompt-input, question, queue, reasoning, sandbox, schema-display, shimmer, snippet, sources, speech-input, stack-trace, suggestion, task, terminal, test-results, tool, toolbar, transcription, voice-selector, web-preview

## shadcn/ui primitives AI Elements depends on (55)

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

## RNR ships 32 components, in EXACT nativewind/uniwind parity

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, button, card, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, icon, input, label, menubar, native-only-animated-view, popover, progress, radio-group, select, separator, skeleton, switch, tabs, text, textarea, toggle, toggle-group, tooltip

## REUSE DIRECTLY from RNR — 29 of 55 (52%)

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, button, card, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, input, label, menubar, popover, progress, radio-group, select, separator, skeleton, switch, tabs, textarea, toggle, toggle-group, tooltip

## GAP — no RNR equivalent, must compose or create (26)

breadcrumb, button-group, calendar, carousel, chart, command, drawer, empty, field, form, input-group, input-otp, item, kbd, navigation-menu, pagination, resizable, scroll-area, sheet, sidebar, slider, sonner, spinner, table, toast, toaster

## Project constraints (from the user, binding)

1. Success = every AI Elements component rebuilt using RNR components.
2. Only create/compose a NEW component when RNR has no equivalent.
3. On a mobile device there should be little visible difference between the RNR
   system and the AI Elements system — they must look like one design system.
4. Pure React Native. No web-only constructs.
5. Must use RNR's theming system such that ANY config or override RNR requires
   passes seamlessly into this library.
6. Must distribute exactly the same as RNR (copy-paste registry, RNR CLI).
7. Must be fully compatible with Expo.

## Repo stack (already pinned in AGENTS.md)
TypeScript 7.0.2 - pnpm 10.32 - Biome 2.5 - Vitest 4.1 - Uniwind 1.11 + Tailwind v4
Expo 57.0.19 - React Native 0.87.1 - Node 24 - @rn-primitives 1.5.2 - RNR CLI 0.7.1
Repo: github.com/hackerpug-ai/rnr-ai-elements (public, solo merge gate, CI = typecheck/lint/test/registry)

## Known prior art
muratcakmak/expo-ai-elements is an existing RN port on Uniwind. Its npm package ships
NO component code (registry-only). Its pending rewrite DROPS RNR for its own primitives.
Brain KBs: ~/Projects/brain/.rosetta/docs/react-native-reusables/ and .../expo-ai-elements/

