---
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Team Contributions

Four specialist lenses were dispatched as unnamed agents; every one delivered, and every
payload is committed verbatim under [`_specialist-proposals/`](./_specialist-proposals/README.md). The sections of this
PRD are templated from those files.

| Lens | Agent | State | Committed artifact |
|---|---|---|---|
| Product | `product-manager` | DELIVERED | [`product-manager.personas-product.json`](./_specialist-proposals/product-manager.personas-product.json) |
| Architecture | `react-native-reusables-planner` | DELIVERED | [`react-native-reusables-planner.architecture.json`](./_specialist-proposals/react-native-reusables-planner.architecture.json) |
| Design / UI infra | `frontend-designer` | DELIVERED | [`frontend-designer.ui-infra.json`](./_specialist-proposals/frontend-designer.ui-infra.json) |
| Web original (consulting only) | `shadcn-ai-elements-planner` | DELIVERED | [`shadcn-ai-elements-planner.web-original.json`](./_specialist-proposals/shadcn-ai-elements-planner.web-original.json) |

## Phase 1 — Product

6 personas, 6 journeys, 6 functional groups, 23 use cases.
Produced a **porting verdict for all 49 components**: 22 port-at-parity,
11 port-adapted, 10 native-substitute, 6 out-of-scope.

Its three flagged findings: `conversation` and `prompt-input` are rewrites wearing a
port's clothes; there is no `response` component in the 49, so streaming markdown is an
unowned dependency hiding inside `message`; and the published verdict table is itself a
deliverable, because it is what keeps "we ported AI Elements" an honest claim.

## Phase 2 — Architecture

10 posture stances, 12 system components, all 26 gap primitives resolved,
26 dependencies assessed for Expo, 16 technical risks.

Three findings verified live rather than recalled:

1. **`@rn-primitives` publishes five primitives RNR never wrapped** — `slider`, `table`,
   `toast`, `navigation-menu`, `toolbar`, all at 1.5.2. That converts five gap items from
   *new behavior* into *a styled shell over an existing primitive*.
2. **`react-native-enriched-markdown` is a Fabric native module** — its npm manifest
   declares `codegenConfig`, and it is absent from Expo SDK 57's `bundledNativeModules`.
   Hard-binding `message` to it would make the entire chat shell dev-client-only.
3. **A pin conflict in AGENTS.md** — it declared RN 0.87.1 under Expo 57, but Expo SDK 57
   pins `react-native: 0.86.3`. Corrected; see `06-external-dependencies.md`.

## Phase 3 — Design / UI infrastructure

17 visual-parity properties, 16 web-to-native interaction translations,
all 49 components classified (27 pure-RNR composition, 22 introducing new visual vocabulary), 17 design risks.

Its decisive finding: **RNR already solved mobile density.** RNR's base classes *are* the
mobile size and `sm:` steps *down* for web (`h-10 px-4 py-2 sm:h-9`). So AI Elements'
desktop density is not the thing being ported — components are authored at RNR's mobile
rhythm and `sm:` produces the compact web build.

And the argument that makes parity auditable rather than a matter of taste: **our deviation
set equals the web original's deviation set.** Wherever web AI Elements uses a shadcn token
we use the RNR token; wherever it *departs* from shadcn — shiki hex inside code blocks,
`text-green-600` for tool status — we depart from RNR by the identical amount, in the
identical place. That reduces "is this parity?" to a diff.

## Phase 4 — Web original (consulting only)

All 49 components documented for purpose, composition, essential behavior, browser
artifact, and state contract. Tiering: 4 minimum-chat, 32 agent-surface, 13 specialist.

This lens is **barred from implementing**. Its output is a specification of behavior to
reimplement, never a diff. Two of its findings changed the plan:

- **The minimum usable chat is four components**: `conversation`, `message`,
  `prompt-input`, `code-block`. Everything else is additive.
- **A correction to the brief**: there is no `chart` component among the 49. `chart`
  appears only in the 55-primitive dependency list and nothing consumes it — the actual
  data-viz in AI Elements is `progress` bars, which RNR already ships.

It also surfaced two **tested composition laws** that are behavior, not styling, and must
survive the port: `file-tree`'s chevron-expands-vs-name-selects split, and
`voice-selector`'s preview-plays-but-does-not-select. Both put two outcomes in one row,
and both are mistap generators on touch unless each target gets a real size.
