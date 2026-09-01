---
stability: FEATURE_SPEC
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Functional Groups

| Group | Prefix | Delivers |
|-------|--------|----------|
| Foundation and Theming | `FOUND` | The RNR token bridge, dark-mode parity, the reuse-first primitive policy, and demand-driven creation of the missing shadcn primitives (scroll-area, item, empty, spinner, kbd, field, input-group, button-group) that shipped components actually require. |
| Core Chat Surface | `CHAT` | The day-one usable AI chat: conversation transcript with streaming stick-to-bottom, message with markdown and code rendering, prompt-input composer with keyboard handling and attachments, suggestions, questions, queue, checkpoint, sources, inline citations, images, shimmer, toolbar, snippet, open-in-chat. |
| Agent and Tool Surface | `AGENT` | Tool call lifecycle, reasoning and chain-of-thought disclosure, task and plan progress, human-in-the-loop confirmation, agent and persona identity, context budget, artifact container, run controls, schema display. |
| Coding-Agent Surfaces | `CODE` | Developer-artifact display for coding agents: file-tree, terminal, test-results, stack-trace, commit, package-info, environment-variables, and the native webview substitute for web-preview. |
| Voice and Audio | `VOICE` | Speech capture and live transcription, audio route selection, generated-audio playback, and voice selection. |
| Registry, Compatibility and Docs | `REG` | RNR CLI installability, registry entries with declared peer dependencies, Expo SDK 57 compatibility across iOS, Android and web, published per-component porting verdicts including documented non-goals, and a live example app demonstrating every state. |

## Use case summary

| Group | Prefix | Use cases |
|-------|--------|-----------|
| Foundation and Theming | `FOUND` | 4 |
| Core Chat Surface | `CHAT` | 5 |
| Agent and Tool Surface | `AGENT` | 5 |
| Coding-Agent Surfaces | `CODE` | 3 |
| Voice and Audio | `VOICE` | 2 |
| Registry, Compatibility and Docs | `REG` | 4 |
| **Total** | | **23** |

## Why these groups

### Foundation and Theming (`FOUND`)

Constraint 3 (one design system on a mobile device) and constraint 5 (RNR theming passthrough) are the binding promises of the whole initiative. Nothing in any other group can be visually coherent until this lands, and 26 of 55 dependency primitives are missing, so every other group blocks on a subset of this one. It is also the only group where the correct outcome is invisible when right and glaring when wrong, which is why it needs its own acceptance criteria and its own CI check.

### Core Chat Surface (`CHAT`)

This is the minimum set that makes the library worth installing. A developer who gets only this group has a shipping product; a developer who gets everything else without it has nothing. It is also where all the genuinely hard native work lives (scroll pinning, keyboard avoidance, markdown), so it must be delivered as one coherent slice rather than component-by-component.

### Agent and Tool Surface (`AGENT`)

A separable second slice with its own testable gate: everything here is driven by agent stream events rather than user input, and all of it is optional for a plain chat app. Grouping by this delivery shape means the group can ship after CHAT without blocking it, and it shares one dominant risk (state-change rendering without transcript reflow) that is worth testing once across the whole group.

### Coding-Agent Surfaces (`CODE`)

These share one product problem that none of the chat or agent components have: dense, wide, monospace content on a phone-width screen. They also share one audience (developers using a coding agent) and are the group most likely to be cut or deferred by a consumer-app developer. Keeping them separate keeps that cut cheap.

### Voice and Audio (`VOICE`)

This is the only group that requires native permissions and native modules (audio recording, playback, route selection), which makes it the only group with an install-time cost to the developer beyond copied code. Isolating it keeps the rest of the library dependency-free and lets a developer who does not want microphone permissions skip the whole group.

### Registry, Compatibility and Docs (`REG`)

Constraints 6 and 7 (distribute exactly like RNR, fully Expo compatible) are product promises about how the library is obtained, not about what it renders, so they need their own criteria. This group also owns the honest public record of what did and did not port, which is the artifact that saves a web-to-mobile porter from building around a component that does not exist.
