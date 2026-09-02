---
title: rnr-ai-elements MVP
version: 1.1.0
scope_posture: full
pr_sequencing: false
base_branches: []
---

# rnr-ai-elements — MVP PRD

A React Native Reusables port of Vercel's AI Elements: universal AI chat and agent UI,
distributed as a copy-paste registry, inheriting the consumer's RNR theme with zero wiring.

## PRD Metadata

| Field | Value |
|-------|-------|
| Version | 1.1.0 |
| Scope Posture | Full feature (default) |
| PR Sequencing | Disabled |
| Base Branches | None (lands on trunk) |
| Created | 2026-09-01 |
| Last Updated | 2026-09-01 |

## Document Index

| File | Section | Stability |
|------|---------|-----------|
| [`00-overview.md`](./00-overview.md) | Product description, problem, solution | PRODUCT_CONTEXT |
| [`01-scope.md`](./01-scope.md) | In scope / out of scope / deferred | FEATURE_SPEC |
| [`02-roles.md`](./02-roles.md) | User roles | PRODUCT_CONTEXT |
| [`03-functional-groups.md`](./03-functional-groups.md) | Groups + use case summary | FEATURE_SPEC |
| [`04-uc-agent.md`](./04-uc-agent.md) | Use Cases: Agent and Tool Surface (`AGENT`) — 5 UCs | FEATURE_SPEC |
| [`05-uc-chat.md`](./05-uc-chat.md) | Use Cases: Core Chat Surface (`CHAT`) — 5 UCs | FEATURE_SPEC |
| [`06-uc-code.md`](./06-uc-code.md) | Use Cases: Coding-Agent Surfaces (`CODE`) — 3 UCs | FEATURE_SPEC |
| [`07-uc-found.md`](./07-uc-found.md) | Use Cases: Foundation and Theming (`FOUND`) — 4 UCs | FEATURE_SPEC |
| [`08-uc-reg.md`](./08-uc-reg.md) | Use Cases: Registry, Compatibility and Docs (`REG`) — 4 UCs | FEATURE_SPEC |
| [`09-uc-voice.md`](./09-uc-voice.md) | Use Cases: Voice and Audio (`VOICE`) — 2 UCs | FEATURE_SPEC |
| [`10-team-contributions.md`](./10-team-contributions.md) | The four specialist lenses and what each found | — |
| [`11-technical-requirements/`](./11-technical-requirements/README.md) | Technical specifications (12 sections) | CONSTITUTION |
| [`12-e2e-testing-criteria.md`](./12-e2e-testing-criteria.md) | 95 per-UC criteria; sprint gates draw `[human-gate]` rows from here | TEST_SPEC |

## Quick Stats

| Metric | Value |
|--------|-------|
| Functional groups | 6 |
| Use cases | 23 |
| Acceptance criteria | 95 |
| Test criteria | 95 (100% AC coverage) |
| AI Elements components to port | 49 |
| shadcn primitives depended on | 55 |
| — reused from RNR | 29 (53%) |
| — gap resolved without creating | 20 (compose 10 · substitute 7 · unnecessary 3) |
| — genuinely new components | **6** |
| Porting verdicts | 22 parity · 11 adapted · 10 substitute · 6 out-of-scope |

## The three promises this PRD exists to keep

1. **Reuse before create.** 29 of 55 primitives come from RNR by registry URL. Of the
   26-item gap, only **6** are genuinely new components. Every created primitive names the
   gap entry and the shipped component that requires it.
2. **One design system on a phone.** The library declares **zero** tokens — no theme file,
   no `@theme` block, no color literal. Proven by swapping the consumer's palette and
   screenshotting six pairs; every pixel must move.
3. **Distributes exactly like RNR.** Copy-paste registry, RNR CLI, files the consumer owns.
   No npm package — `react-native-reusables` is not on npm, and a packaged library would
   have to vendor its own RNR copies, which breaks promises 1 and 2.

## Decisions on the record

| Decision | Value | Why |
|---|---|---|
| Distribution | Registry only | RNR's own model; an npm package cannot reach the consumer's `@/components/ui` alias |
| Styling engine | **Both**, at parity, as RNR does | The two trees differ in one file (`icon.tsx`, RNR's); our source is engine-agnostic |
| Dev + sign-off surface | Storybook, both runtimes | Device build is the gate; web build is iteration and gallery |
| Test runner | Vitest for logic; device tier for render | Uniwind compiles classes in Metro — Vitest cannot assert a style at all |
| Merge gate | Solo (CI green, self-merge) | Set by `/init-project`; main is ruleset-protected |

## Version History

| Version | Date | Changes | Trigger |
|---------|------|---------|---------|
| 1.0.0 | 2026-09-01 | Initial PRD | New initiative |
| 1.1.0 | 2026-09-02 | Dual-engine deferral trigger fired — registry now emits nativewind AND uniwind. Pin corrections verified against sources: react-native 0.86.3 (not 0.87.1), RNR CLI 1.0.0 (not 0.7.1), typescript ~6.0.3 in the harness (Expo 57's pin). | Scaffold findings |

## Next Steps

- `/kb-sprint-plan` — build the sprint roadmap. Every sprint's human testing gate draws
  `[human-gate]` criteria from [`12-e2e-testing-criteria.md`](./12-e2e-testing-criteria.md).
- Before any component work: run the **proven-reference-flow spike** in
  [`11-technical-requirements/12-e2e-testing.md`](./11-technical-requirements/12-e2e-testing.md).
- Correct the RN pin in `AGENTS.md` to Expo 57's `0.86.3` (see `06-external-dependencies.md`).
