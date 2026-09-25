# FIX-ORI-AST-004-1: Publish the docs-owned streamdown dependency-explainer destination

## What this does

Lands the one destination the locked search contract names but no task ever owned: a docs-owned, hand-authored dependency explainer at `apps/docs/src/pages/components/streamdown.astro`, served at `/components/streamdown`. ORI-AST-004's pinned search-dialog contract (AC-1..4) and the locked gate flows (`human-flows.json:730,742` — "five existing item destinations" including `/components/streamdown`) treat that route as a real destination: Enter navigation must land at HTTP 200 with a rendered title, and the real Pagefind index must surface it for the query `streamdown`. The registry's 56 items never included streamdown — it is the third-party markdown-rendering dependency the conversation family consumes through the renderMarkdown seam, not a shippable registry item — so the generated `[item].astro` fan-out can never emit the route. This task authors the page directly (a static route wins over the `[item]` dynamic route without touching it), verified through a task-owned proof harness (`tests/sprint-05-orient-search/streamdown-destination-proof.test.ts`) that drives the real build, the pinned real Pagefind run, and the real built preview.

The page is honestly framed: it explains what Streamdown is (the npm package `react-native-streamdown`), why the conversation family depends on it (`MessageResponse` in Message and `ReasoningContent` in Reasoning take a `renderMarkdown` prop; omit it and each renders plain Text, and markdown repair runs before either), how a consumer installs it (the four peers and permissions rendered from the committed `apps/docs/src/data/dev-client-matrix.json` streamdown entry, plus the dev-client verdict), and its registry relationship through the pinned sentence `Streamdown is not a registry item.` — no registry CLI command, no `rnraielements.com/r/{engine}/streamdown.json` target, no InstallCommand, no version chip, no family pager.

## Why

ORI-AST-004 (in flight, blocked cycle 1, checkpoint `b2560ce3`) proved the entire search dialog against the real index — 7 passed / 8 failed, and all 8 failures are the single pinned `/components/streamdown` destination leg: the route is a verified 404 and searching streamdown returns only the two docs pages that mention it. The wave-4 ruling made the resolution human-owned; the human decided (recorded in-session 2026-09-25) to create the docs-owned destination page rather than amend three tasks' ACs plus locked gate steps. Every path to ORI-AST-004's GREEN runs through this page existing at that route in the built dist and the real index. ORI-AST-008 (completed — commit `f5586742`) owns the reference-destination surface whose conventions this page follows; ORI-CONT-005 (completed) authored the boundary prose the page restates and links to. The search dialog, the indexer script, and the page model are write-prohibited to this task — they land with ORI-AST-004's branch, whose eight failing legs flip green once this page reaches trunk.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts
pnpm typecheck
pnpm exec biome ci apps/docs/src/pages/components/streamdown.astro tests/sprint-05-orient-search/streamdown-destination-proof.test.ts
```

The first command is the exact selector: the task-owned proof harness — (a) RED phase: on the pre-change candidate it runs the real `pnpm --filter @rnr-ai-elements/docs build`, the pinned real Pagefind run (`pnpm dlx pagefind@1.5.2 --site apps/docs/dist`, the identical invocation ORI-AST-004's indexer uses), and the real built preview over the dist, recording the route's 404, the build page count, and the index page_count; (b) GREEN phase: identical commands with the page landed — build exit 0 at RED page count + 1, HTTP 200 at `/components/streamdown` with the rendered h1 carrying Streamdown and the pinned honest sentence, index page_count exactly RED + 1 (63 → 64 as it lands), and zero registry-command occurrences in the served HTML. The harness stays small — it orchestrates the real commands and does not become a second search gate. `pnpm typecheck` and the scoped Biome command are preserved static gates.

## Scope

Own exactly the new destination page, the task-owned proof harness, plus bounded evidence. The search dialog, `scripts/docs-data/search-index.ts`, `apps/docs/src/lib/search-page-model.ts`, the `[item].astro` template, every existing page, and `human-flows.json` stay byte-unchanged — the locked gate flows now point at a route that will exist; their bytes stay locked.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ⬜ Pending

> Assignee: astro-implementer
> Priority: P1 · Points: 2 · Type: FIX
> Dependency phase: after ORI-AST-008
> Proposed By: astro-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-25
> Source SHA: b56b5214c2b48b57493116a6402935dc5b712cf4

AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROGRESS: 0/2 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

The built site serves a real, indexed `/components/streamdown` destination that the locked search flows can navigate to: a docs-owned dependency explainer on the DocsLayout shell, honestly framed as documentation of the conversation family's third-party markdown renderer rather than a registry item, with its peers and verdict rendered from the committed matrix data — while the search dialog, the indexer, the page model, the `[item].astro` template, and every existing page stay byte-unchanged, and ORI-AST-004's eight pinned streamdown legs become satisfiable once its branch meets trunk.

### CRITICAL CONSTRAINTS — Never

- Never present streamdown as a registry item: no InstallCommand, no `npx @react-native-reusables/cli` add command, no `rnraielements.com/r/{engine}/streamdown.json` target, no version chip or family pager implying registry membership — the page documents an npm dependency and says so in the pinned sentence.
- Never touch the search dialog, the indexer, the page model, `[item].astro`, any existing page, or `human-flows.json` — the locked gate flows now point at a route that will exist; their bytes stay locked, and the search surface lands with ORI-AST-004's branch.
- Never fabricate registry data this dependency does not have: no props table, no source-file figures, no usage snippet, no invented family membership; the page is authored prose over the committed matrix facts.
- Never claim index inclusion from source inspection: the real pinned Pagefind run over the completed dist is the only accepted index evidence.
- Never substitute a dev-server render, a static file read, or a cached dist for the real built preview's HTTP 200.
- Never commit the gitignored build outputs or the regenerated `apps/docs/src/data/registry-items.json` (required for `pnpm typecheck` in a fresh worktree — copy or regenerate, never commit).
- Never touch in-flight ORI-AST-004 branch files, planning artifacts, or perform trunk/worktree lifecycle operations.

### DONE WHEN

- [ ] AC-1 proves the route lands with the real build green at RED page count + 1, HTTP 200 with the h1 and the pinned honest sentence, and the real index page_count exactly RED + 1, RED captured pre-change.
- [ ] AC-2 proves the honest non-registry framing with zero registry-command occurrences, the matrix-fact parity, the static gates, and the two-file diff boundary.
- [ ] The exact selector and preserved commands pass; independent review confirms real RED/GREEN, the index observations, the honest-framing observations, and exact scope compliance.

### SPECIFICATION

One authored page plus a minimal task-owned proof harness. RED is the recorded pre-change trunk observation (the gap made mechanical: the route 404s over the real built preview, the index covers 63 pages without it). GREEN is the identical selector after the page lands: build +1 page, route 200, index +1 page. The harness orchestrates the real commands — it never mocks the build, the indexer, or the preview, and never becomes a second search gate.

### BOUNDARY CONTRACTS

1. `apps/docs/src/pages/components/streamdown.astro` (NEW): the docs-owned dependency-explainer page at the `/components/streamdown` route on the DocsLayout shell, following ORI-AST-008's destination conventions — `Layout title="Streamdown — RNR AI Elements"`, a head-slot meta description, breadcrumb, `h1` carrying Streamdown, and `<main data-pagefind-body data-pagefind-meta="category:components">` so the real index admits it and the dialog groups it with component destinations. Content, all source-backed: what Streamdown is (the third-party markdown renderer for streaming markdown in React Native, published as the npm package `react-native-streamdown`); why the conversation family depends on it (`MessageResponse` in Message and `ReasoningContent` in Reasoning accept a `renderMarkdown` prop — omit it and each renders plain Text; markdown repair runs before either, per the landed boundary prose); how a consumer installs it (the four peers, the iOS/Android permissions, and the dev-client verdict rendered from the committed `dev-client-matrix.json` entry `id: "streamdown"` — `react-native-streamdown@0.3.0`, `react-native-enriched-markdown@>=1.0.0`, `react-native-worklets@>=0.10.0`, `remend@1.3.0`); and the honest registry relationship through the pinned sentence `Streamdown is not a registry item.` with the explanation that no `rnraielements.com/r/{engine}/streamdown.json` exists and the registry's `markdown` item is the repair lib consumed through the same renderMarkdown seam. Links only to real destinations the build emits: `/components`, `/components/message`, `/components/reasoning`, `/components/markdown`, `/docs/installation`, `/docs/owns-vs-does-not-own`, `/docs/theming#rendermarkdown`. Content follows the docs-site content standards (active voice, terminology lock, austere reference register).
2. Harness `tests/sprint-05-orient-search/streamdown-destination-proof.test.ts` (NEW, in the sprint lane) exports `runStreamdownDestinationProof`: RED phase — on the pre-change candidate, run the real `pnpm --filter @rnr-ai-elements/docs build`, then the pinned real Pagefind run (`pnpm dlx pagefind@1.5.2 --site apps/docs/dist`, always after the build since any astro build wipes `dist/pagefind`), then serve the built dist through the real astro preview (the shared `tests/harness/docs-preview.ts` strict-port shape on the owned port 4321); record the route's HTTP 404, the build page count, the `pagefind-entry.json` page_count, and the candidate SHA in `red.json` and exit nonzero naming the gap. GREEN phase — with the page landed, identical commands: assert build exit 0 at exactly RED page count + 1, HTTP 200 at `/components/streamdown` with the main h1 carrying Streamdown and the pinned honest sentence, index page_count exactly RED + 1, and exactly 0 occurrences of `streamdown.json` and of `@react-native-reusables/cli` in the served route HTML; emit `green.json` and `run.json` binding candidate and harness hashes, exact commands, exit codes, and observed counts; stop only owned children on every exit path.
3. Evidence is exactly `.tmp/FIX-ORI-AST-004-1/red.json`, `green.json`, `run.json`.
4. No change to any other file: the search dialog (`apps/docs/src/islands/` + its script), `scripts/docs-data/search-index.ts`, `apps/docs/src/lib/search-page-model.ts`, `apps/docs/src/pages/components/[item].astro`, every existing page, and `human-flows.json` stay byte-unchanged. The search-index script and dialog land with ORI-AST-004's branch; this task never touches them.
5. The page consumes the committed `apps/docs/src/data/dev-client-matrix.json` as its data source for peers, permissions, and verdict — never hand-typed versions that can drift; no other data file changes.
6. Scratch or staging mutations, if any, live and die under the owned `.tmp/FIX-ORI-AST-004-1/` root; the candidate checkout carries exactly the new page and the harness beyond trunk.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. All criteria run the real build, the real Pagefind run, and the real built preview.

#### AC-1: The destination lands, serves HTTP 200, and enters the real index [PRIMARY]

GIVEN trunk where `/components/streamdown` is a verified 404 and the real Pagefind index covers 63 pages (56 items + 7 docs) WHEN the docs-owned dependency-explainer page is authored at `apps/docs/src/pages/components/streamdown.astro` THEN the real public build exits 0 at exactly the recorded RED page count + 1 (67 → 68 at planning time), the built preview serves `/components/streamdown` at HTTP 200 with a main h1 carrying Streamdown and the pinned honest sentence `Streamdown is not a registry item.`, and the pinned real Pagefind run over the completed dist reports an index page_count of exactly RED + 1 (63 → 64 as it lands) — the new page is in the index, not just on disk.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real Astro build, the pinned real Pagefind CLI (1.5.2 via pnpm dlx) over the completed dist, and the real astro preview serving the built dist on the owned localhost:4321
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/streamdown-destination-proof.test.ts
- TEST_FUNCTION: runStreamdownDestinationProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
__SCENARIO_1__
```
