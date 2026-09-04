---
title: rnr-ai-elements MVP
version: 2.0.0
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
| Version | 2.0.0 |
| Scope Posture | Full feature (default) |
| PR Sequencing | Disabled |
| Base Branches | None (lands on trunk) |
| Created | 2026-09-01 |
| Last Updated | 2026-09-04 |

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
| [`08-uc-reg.md`](./08-uc-reg.md) | Use Cases: Registry, Compatibility and Docs (`REG`) — 6 UCs | FEATURE_SPEC |
| [`09-uc-voice.md`](./09-uc-voice.md) | Use Cases: Voice and Audio (`VOICE`) — 2 UCs | FEATURE_SPEC |
| [`10-team-contributions.md`](./10-team-contributions.md) | The four specialist lenses and what each found | — |
| [`11-technical-requirements/`](./11-technical-requirements/README.md) | Technical specifications (12 sections) | CONSTITUTION |
| [`12-e2e-testing-criteria.md`](./12-e2e-testing-criteria.md) | 105 per-UC criteria; sprint gates draw `[human-gate]` rows from here | TEST_SPEC |

## Quick Stats

| Metric | Value |
|--------|-------|
| Functional groups | 6 |
| Use cases | 25 |
| Acceptance criteria | 105 |
| Test criteria | 105 (100% AC coverage) |
| **Component work** | **complete — 14 waves merged, organisms gate passed** |
| Registry items shipped | **56** (39 component · 11 ui · 6 lib), emitted for both engines |
| AI Elements shipped / out of scope | 40 / 9 |
| RNR items consumed by URL | 14 (+ RNR `lib/utils`) |
| Gap primitives built | 10 (compose 7 · create 3); 6 cut, 7 substituted, 3 unnecessary |
| Porting verdicts | 21 parity · 10 adapted · 9 substitute · 9 out-of-scope |

The as-built ledger, and every place it corrects the plan, is
[`11-technical-requirements/10-component-inventory.md`](./11-technical-requirements/10-component-inventory.md).

## The three promises this PRD exists to keep

1. **Reuse before create.** RNR primitives come from RNR by registry URL — 14 distinct
   items across the shipped set. Of the 26-item gap, **10 were built** (7 composed from
   what exists, 3 created) and 16 were resolved without writing a component. Every created
   primitive names the gap entry and the shipped component that requires it.
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
| RNR relationship | Peer prerequisite, never vendored | 14 RNR items are reached through the *consumer's* alias, so one token edit moves their components and ours together (`UC-REG-05`) |
| Styling engine | **Both**, at parity, as RNR does | The two trees differ in one file (`icon.tsx`, RNR's); our source is engine-agnostic |
| Dev + sign-off surface | Storybook, both runtimes | Device build is the gate; web build is iteration and gallery |
| Test runner | Vitest for logic; device tier for render | Uniwind compiles classes in Metro — Vitest cannot assert a style at all |
| Merge gate | Solo (CI green, self-merge) | Set by `/init-project`; main is ruleset-protected |

## Version History

| Version | Date | Changes | Trigger |
|---------|------|---------|---------|
| 1.0.0 | 2026-09-01 | Initial PRD | New initiative |
| 1.1.0 | 2026-09-02 | Dual-engine deferral trigger fired — registry now emits nativewind AND uniwind. Pin corrections verified against sources: react-native 0.86.3 (not 0.87.1), RNR CLI 1.0.0 (not 0.7.1), typescript ~6.0.3 in the harness (Expo 57's pin). | Scaffold findings |
| 2.0.0 | 2026-09-04 | **Component plan reconciled against what was built** (56 registry items at `071af93`). SCOPE: `controls`, `toolbar` and `panel` moved out of scope as react-flow satellites — their product jobs ship inside `agent`, `message` and `sheet`. `sidebar` and `toaster` recorded as never-real gap entries. `code-block` reclassified `registry:ui`. Six `registry:lib` logic modules added — a category the plan did not anticipate. RNR reuse restated as the measured 14 items. Verdicts now 21/10/9/9. NEW: `UC-REG-05` (RNR as a declared, checkable peer dependency) and `UC-REG-06` (versioned public distribution) with 10 test criteria, opening the packaging-and-distribution phase. | Build complete — plan-vs-built reconciliation |

## Where this stands

**Done.** The component work — the bulk of the initiative — is built and merged: 14 waves,
56 registry items, both engines, every level gate passed on an iOS simulator. `FOUND`,
`CHAT`, `AGENT`, `CODE` and `VOICE` are delivered as code.

**In flight.** Style-parity remediation (`design/style-parity-remediation.md`) — wave A
complete, waves B and C outstanding. This converges the port to the pinned web look and
records the mobile-forced departures; it changes no component's scope.

**Remaining, and what this version opens.** The `REG` group:

| | Status |
|---|---|
| `UC-REG-01` Install exactly like RNR | partly proven in the harness; the clean-app CI job is not built |
| `UC-REG-02` Expo compatibility | proven on iOS; Android and web not gated |
| `UC-REG-03` Published porting verdicts | the ledger exists in this PRD; nothing is published |
| `UC-REG-04` Storybook every component / every state | device Storybook is the build gate; the compose/screens level is still open |
| `UC-REG-05` **RNR as a declared, checkable peer dependency** | **new at v2.0.0 — not started** |
| `UC-REG-06` **Versioned public distribution** | **new at v2.0.0 — not started** |

Registry URLs today point at `raw.githubusercontent.com/…/main/public/r/{engine}/*.json`.
That works and is not reproducible: `main` is mutable, so an install cannot be pinned and a
branch rename breaks every published link. `UC-REG-06 AC-1/AC-3` is that problem stated as
a requirement; **which host serves the stable URL is left open here on purpose** — it is a
technical choice for `/kb-sprint-plan`, not a product promise.

## Next Steps

- `/kb-sprint-plan` — build the sprint roadmap for the `REG` group. Every sprint's human
  testing gate draws `[human-gate]` criteria from
  [`12-e2e-testing-criteria.md`](./12-e2e-testing-criteria.md).
- Finish style-parity remediation waves B and C before the distribution sprint — publishing
  a stable, pinnable URL is worth more once the files behind it have stopped moving.
- Correct the RN pin in `AGENTS.md` to Expo 57's `0.86.3` (see `06-external-dependencies.md`).
