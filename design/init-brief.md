# Pixel Perfect init — evidence brief

Written 2026-09-01, before any decision was asked. Advisory only; `design/manifest.json`
is the durable record.

## What was found

| Source | What it settles |
|---|---|
| `.spec/prds/mvp/` (27 files, v1.0.0) | Goal, views, platforms, framework, style engine, component library, sandbox |
| `.spec/prds/mvp/11-technical-requirements/11-routing.md` | The routing verdict — see the conflict below |
| `.spec/prds/mvp/11-technical-requirements/10-component-inventory.md` | 49 components with porting verdicts; 26-primitive gap resolved |
| `AGENTS.md` | Platforms (iOS/Android/Web all Required), pinned stack, distribution model |
| `.spec/scenarios/` (127 files) | 46 visible + 60 holdout scenarios, 7 journeys, 0 gaps |
| repo state | Greenfield — no `package.json`, no `src/components/`, no `design/` |

## Settled by evidence — not asked

- **Requirements + views document**: `.spec/prds/mvp/README.md`. Sole candidate; it carries
  both the requirements and the view inventory, so B1 Q1 and Q2 are dropped.
- **Framework**: Expo (SDK 57.0.19, RN 0.86.3). Named throughout the PRD and AGENTS.md;
  no competing candidate in the repository.
- **Component library**: React Native Reusables. The plugin ships a first-class adapter at
  `docs/adapters/react-native-reusables.md` (12.5 KB).
- **Icon library**: Lucide React Native, via the plugin's own component-library→icons
  pairing table (RNR → Lucide React Native, used through RNR's `Icon as={...}` wrapper).
- **Sandbox**: Storybook, not the `custom` default. Decided by the user and recorded in the
  PRD. Both adapters exist — `storybook-native.md` (device) and `storybook.md` (web).
  Device is the sign-off gate; web is iteration and gallery.
- **References**: none. No competitor products are named anywhere in the spec.

## Two findings with consequences

### 1. Uniwind has no styling contract and no adapter

The plugin ships built-in styling contracts for `nativewind-mobile`, `rn-stylesheet-mobile`,
`paper-md3-mobile`, and four web contracts. **There is no Uniwind contract and no Uniwind
adapter.** This project is pinned to Uniwind 1.11 + Tailwind v4 by decision (PRD
`01-scope.md`, `AGENTS.md`).

Consequence: the style system resolves through "Other" → `tools.style_docs` → the generic
adapter, and Phase 3 takes the **research path** (`pixel-perfect:research --styling`) to
author a contract rather than matching a built-in.

This matters more than a missing adapter usually would, because the styling contract is
precisely the mechanism that enforces this project's hardest constraint — *declare zero
tokens, consume the consumer's*. `nativewind-mobile.md` is the closest existing contract
and is the right base to derive from, but it assumes Tailwind v3 semantics
(`tailwind.config.js`, HSL vars) where this project uses Tailwind v4 (`@theme`, `oklch`).
Deriving it without that correction would encode the wrong engine.

### 2. The deliverable has no screens

Pixel Perfect's build model is bottom-up and terminates in screens: *"Screens are always
the primary output"* — the one level that cannot be skipped.

This project's deliverable is a **copy-paste component registry**. Per the PRD's routing
section: the library has no navigator, no linking config, no route file, and no screen.
Every surface it ships is state-driven, opened by a prop or a ref. A registry file is
forbidden from containing `useRouter`, `Link`, or `useNavigation`.

The atoms / molecules / organisms levels map cleanly and are where all the value is:

| Pixel Perfect level | This project |
|---|---|
| Tokens | **Skipped by design** — the library declares zero tokens; it consumes RNR's |
| Atoms | The 6 genuinely-new primitives + the 10 composed ones |
| Molecules | Simple elements — `message`, `suggestion`, `shimmer`, `snippet`, `checkpoint` |
| Organisms | `conversation`, `prompt-input`, `tool`, `reasoning`, `chain-of-thought` |
| Screens | **Only two exist**, and only in `apps/example`: `/` and `/agent` |

The screens level is nearly empty, and that is correct rather than a gap. The question
below decides what occupies it.

## Two gates worth keeping

The plugin's **component contract** (hard-fail) forbids re-implementing a primitive the
library already provides — mechanically enforcing "reuse before create". Its **styling
contract** forbids a parallel token system — mechanically enforcing theming passthrough.
Those two gates are the strongest reason to run this project through Pixel Perfect at all,
and both depend on Phase 3 resolving correctly for Uniwind.

---

# Answers recorded (DISCOVER + TARGET)

| Decision | Value |
|---|---|
| Goal | "A React Native Reusables port of Vercel's AI Elements — universal iOS, Android and Web AI chat and agent UI, distributed as a copy-paste registry." |
| Vibe | Match RNR for shared vocabulary; genuinely new AI surfaces (streaming shimmer, tool status badges, reasoning trace) carry their own visual treatment so an agent action reads as distinct from ordinary app chrome. |
| Platforms | `mobile-ios`, `mobile-android`, `web-mobile`, `web-desktop` |
| Screens | **Storybook is the only view.** No full views. One non-distributed example view composing components into an AI chat. |

## The screens answer, resolved

Pixel Perfect requires a screens level. This project has exactly one thing that belongs
there: a single **example composition** — components arranged into an AI chat — that is
*not* part of the registry and never ships to a consumer. Storybook carries everything else.

Recorded as one screen, `example-chat`, flagged `distributed: false`. The registry stays
route-free; nothing in `packages/registry/**` may import a navigator.

## The vibe answer creates a tension worth naming

The PRD's design lens set a hard rule: **zero new tokens.** It explicitly rejected
`--color-reasoning` and a `--color-success` / `--color-warning` pair, on the grounds that
any `@theme` entry this library requires is a manual edit to the consumer's `global.css`
that the RNR CLI cannot make — invisible when omitted, silently broken, and permanently
un-synced when the consumer swaps themes.

The chosen vibe asks for AI surfaces that read as distinct. **These are reconcilable, and
the reconciliation is the whole question.** Distinctness can come from:

- **Composition** — a bordered card, a status rail, an icon, a disclosure affordance,
  different spacing. None of these need a token.
- **Existing roles with modifiers** — `bg-muted/50`, `bg-primary/20`, `dark:bg-input/30`.
  This is exactly how RNR itself expresses new states without adding roles.
- **The three status colors the design lens already sanctioned** — `text-destructive` for
  error, plus Tailwind's built-in `green-600` / `orange-600` for success and denial. These
  need no `@theme` entry because Tailwind ships the default palette, and using them keeps
  our deviation set identical to the web original's.

What distinctness must *not* come from is a new `--color-*` the consumer has to add by hand.

The styling contract is where this line gets drawn and mechanically enforced, which is why
the question below is not a formality.

## Contract resolution status

- **Component contract**: `react-native-reusables` — **built-in match, resolved
  automatically.** `compose: @/components/ui/*` · forbids re-implementing a vendored
  primitive. Enforcement `hard-fail`. This is the gate that makes "reuse before create"
  mechanical rather than aspirational.
- **Styling contract**: **no built-in exists for Uniwind.** Requires resolution — see the
  question below. `nativewind-mobile` is the nearest relative but encodes Tailwind v3
  semantics (`tailwind.config.js`, HSL vars) where this project is Tailwind v4 (`@theme`,
  `oklch`), so it cannot be adopted unchanged.

---

# EQUIP resolved

## Styling contract — researched, 7/7, accepted

`uniwind-tailwind4-universal` → `design/research/styling/uniwind-tailwind4-universal.md`

Grounded in official documentation fetched during research: `docs.uniwind.dev/quickstart`,
`/api/metro-config`, `/theming/basics`, and `uniwind.dev`. Facts that shaped it:

- Uniwind is a **drop-in replacement for NativeWind** — the same `className` API. That is
  what makes the emit method idiomatic rather than a workaround.
- **Tailwind v4 CSS-first**: `@theme` directive, CSS variables, no `tailwind.config.js`.
- `withUniwindConfig(config, { cssEntryFile, dtsFile, extraThemes, polyfills })` **must be
  the outermost Metro wrapper**, and `cssEntryFile` must be a *relative path string* — not
  `path.resolve(...)`.
- `light`, `dark`, `system` are pre-registered with **no ThemeProvider**; `dark:` variants
  work directly.
- Expo Go is supported, which corroborates the PRD's Expo-Go-clean core.

**Rubric: 7/7.**

| # | Criterion | Result |
|---|---|---|
| 1 | Official documentation cited | PASS — four vendor URLs fetched; emit method and token binding grounded in them |
| 2 | Colocation rule stated | PASS — `colocated`, concrete allowed/forbidden globs |
| 3 | Token binding explained | PASS — traced end to end: consumer `@theme` → uniwind/metro → class map → our copied `.tsx` |
| 4 | Forbidden patterns detection-shaped | PASS — 8 entries, each with glob + regex + rationale; all compile |
| 5 | Framework idiom | PASS — `className` is Uniwind's own documented first-class mechanism |
| 6 | No contradictions (load-bearing) | PASS — forbids global custom CSS and inline static styles; requires utilities via `className` |
| 7 | Completeness | PASS — all frontmatter and sections present; `checks` JSON parses; every entry runnable |

The contract encodes the composition-only distinctness rule as a first-class clause, so
"AI surfaces read distinct, but declare no new tokens" is mechanically enforced rather than
remembered.

## Component contract — built-in

`react-native-reusables`, `hard-fail`. Forbids re-implementing a primitive the library
already provides. This is the gate that makes the PRD's reuse-before-create rule mechanical:
of 55 primitives, 29 are RNR's and only 6 are genuinely new.

## What init did not do

Nothing was installed and no component was written. `pixel-perfect:scaffold` does that.
