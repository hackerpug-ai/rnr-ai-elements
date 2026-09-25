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
{"id":"SC-FIX-ORI-AST-004-1-1","use_case_ref":"UC-SHELL-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real Astro build, the pinned real Pagefind CLI (1.5.2 via pnpm dlx) over the completed dist, and the real astro preview serving the built dist on the owned localhost:4321","negative_control":{"would_fail_if":["GREEN is claimed from a cached build receipt, a dev-server render, or a static source grep over a non-built tree instead of the real public build, the real pinned Pagefind run, and the real built preview.","The page ships without data-pagefind-body so Pagefind never indexes it - the route serves 200 while the index page_count stays at the RED value, and the search dialog can never surface it.","A mocked index, a hand-counted page list, or an authored success flag replaces the observed pagefind-entry.json page_count, or the index delta is asserted from source inspection rather than the real run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_without_streamdown_destination","action":{"actor":"cli_user","steps":["Pre-change RED: on the isolated candidate (the page absent), run the real pnpm --filter @rnr-ai-elements/docs build, then the pinned real Pagefind run (pnpm dlx pagefind@1.5.2 --site apps/docs/dist - always after the build, since any astro build wipes dist/pagefind), then serve the built dist through the real astro preview on the owned port; record the route's HTTP 404, the build page count, the index page_count, and the candidate SHA in red.json.","Author apps/docs/src/pages/components/streamdown.astro - the docs-owned dependency explainer on the DocsLayout shell following ORI-AST-008's destination conventions, with data-pagefind-body and data-pagefind-meta category:components.","Rerun the identical commands; confirm build exit 0 at exactly the RED page count + 1, HTTP 200 at /components/streamdown with the main h1 carrying Streamdown and the pinned honest sentence, and index page_count exactly RED + 1."]},"end_state":{"must_observe":["red.json records the pre-change run: route HTTP 404 at /components/streamdown, build page count (67 at planning time), index page_count (63 at planning time), and the candidate SHA.","green.json records the post-change run: build exit 0 at exactly the RED page count + 1 (68 at planning time), HTTP 200 at /components/streamdown, the served route HTML's main h1 carrying Streamdown, the pinned sentence 'Streamdown is not a registry item.' present in the served route HTML, and index page_count exactly RED + 1 (64 at planning time).","The served page carries data-pagefind-body and data-pagefind-meta category:components, so the real index admits it and the search dialog groups it with component destinations."],"must_not_observe":["An index page_count delta other than exactly +1 between the recorded RED and GREEN runs, a GREEN build page count other than RED + 1, or a route status other than 200 after the change.","GREEN claimed from a source grep, a dev-server render, or a cached dist instead of the real build + real Pagefind run + real built preview.","The served route HTML missing the pinned honest sentence, or index-inclusion evidence reported with (0) real Pagefind observations - the empty signature of a static shell."]}}]}
```

#### AC-2: Honest non-registry framing, real matrix facts, static gates, and the two-file diff

GIVEN the landed page WHEN the served route HTML and the candidate tree are inspected THEN the page carries the pinned honest sentence `Streamdown is not a registry item.` with (0) occurrences of `streamdown.json` and (0) occurrences of `@react-native-reusables/cli` in the served route HTML (no copyable registry command), the peers, permissions, and dev-client verdict render from the committed `dev-client-matrix.json` streamdown entry (`react-native-streamdown@0.3.0` among four peers), every internal link resolves to a real destination the build emits, `pnpm typecheck` and the scoped Biome command exit 0, and the tracked-file diff is exactly the new page plus the harness.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real built-preview route HTML over the committed data file, the real TypeScript compiler, and the real Biome linter
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/streamdown-destination-proof.test.ts
- TEST_FUNCTION: runStreamdownDestinationProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-AST-004-1-2","use_case_ref":"UC-SHELL-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"the real built-preview route HTML over the committed data file, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["The page omits the pinned honest sentence, carries a copyable registry CLI command targeting streamdown, or fabricates registry-item data (props, source files, usage snippet).","Peers are hand-typed literals rather than rendered from the committed dev-client-matrix.json entry, so a matrix change can silently drift the page.","The static gates fail without the stash-proven pre-existing record, or any path outside the allowlist changes."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_without_streamdown_destination","action":{"actor":"cli_user","steps":["Fetch /components/streamdown over the built preview; assert the pinned honest sentence 'Streamdown is not a registry item.', count 'streamdown.json' occurrences (exactly 0) and '@react-native-reusables/cli' occurrences (exactly 0) in the served route HTML.","Compare the rendered peers, permissions, and verdict with the committed apps/docs/src/data/dev-client-matrix.json streamdown entry; follow every internal link on the page and require real destinations the build emits.","Run pnpm typecheck and the scoped Biome command on the candidate; prove any failure pre-existing with git stash && rerun before recording it. Confirm the tracked-file diff is exactly apps/docs/src/pages/components/streamdown.astro and tests/sprint-05-orient-search/streamdown-destination-proof.test.ts (plus the owned .tmp/FIX-ORI-AST-004-1 evidence)."]},"end_state":{"must_observe":["The served route HTML carries the pinned sentence 'Streamdown is not a registry item.' and reports exactly 0 occurrences of 'streamdown.json' and exactly 0 occurrences of '@react-native-reusables/cli' - the page documents an npm dependency and never offers a registry CLI command.","The rendered list of peers equals the committed dev-client-matrix.json streamdown entry - react-native-streamdown@0.3.0, react-native-enriched-markdown@>=1.0.0, react-native-worklets@>=0.10.0, remend@1.3.0 - with the dev-client verdict and the iOS/Android permissions, rendered from the data file, never hand-typed literals.","pnpm typecheck and the scoped Biome command exit 0 (or carry the stash-proven pre-existing record); apps/docs/src/pages/components/[item].astro is byte-unchanged; the tracked-file diff is exactly the two new files."],"must_not_observe":["An InstallCommand, version chip, family pager, fabricated Props or Source section, or any other registry-item chrome implying the page is installable via the registry CLI - the empty framing of (0) honest sentences fails the gate.","Hand-typed peers drifting from dev-client-matrix.json, or a link to a route the build does not emit.","Any changed path beyond the new page, the harness, and the owned .tmp evidence."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The harness's real build, real Pagefind run, and real built preview prove the route 200 + h1 + pinned honest sentence + index page_count exactly RED + 1, with the pre-change 404 and both counts recorded in red.json. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts`
- TC-2 → AC-2: The harness's served-HTML inspection proves the honest framing and the zero registry-command occurrences over the real matrix facts; the static gates pass; the tracked-file diff is exactly the new page plus the harness. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts`

### SHARED FIXTURES

```json
{"trunk_without_streamdown_destination":{"description":"An isolated candidate worktree of trunk (Source SHA b56b5214c2b48b57493116a6402935dc5b712cf4) with ORI-AST-008's 56 generated reference destinations and ORI-CONT-005's landed boundary prose, where /components/streamdown is a verified 404 and the real index covers 63 pages (56 items + 7 docs), plus the owned .tmp/FIX-ORI-AST-004-1 evidence root.","seed_method":"cli","records":["The gitignored generated apps/docs/src/data/registry-items.json is absent in a fresh worktree and gates pnpm typecheck - copy or regenerate it via pnpm registry:build inside the worktree; never commit it (stash-proven pre-existing behavior recorded in FIX-ORI-AI-002-1's handoff).","dist/pagefind is wiped by any astro build, so the harness runs the pinned Pagefind invocation AFTER the build, never before (the ORI-AST-004 blocked report's gate-order finding); the invocation is pnpm dlx pagefind@1.5.2 --site apps/docs/dist - the identical command ORI-AST-004's indexer runs.","The preview serves the built dist through the shared tests/harness/docs-preview.ts strict-port shape on the canonical owned port 4321; the guard exits 1 while the port is owned by anything else - refuse an unowned conflict, never kill unrelated processes, and stop the owned server on every exit path.","The build page count and index page_count literals are the ones observed at the RED run - 67 and 63 at planning time; the invariant is exactly +1 on both, since the change adds exactly one page."]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- apps/docs/src/pages/components/streamdown.astro (NEW)
- tests/sprint-05-orient-search/streamdown-destination-proof.test.ts (NEW)
- .tmp/FIX-ORI-AST-004-1/red.json (NEW)
- .tmp/FIX-ORI-AST-004-1/green.json (NEW)
- .tmp/FIX-ORI-AST-004-1/run.json (NEW)

Build outputs (apps/docs/dist/**, apps/docs/.astro/**, apps/docs/node_modules/.vite/**) and the worktree-local regenerated registry-items.json are side effects of the allowed commands in the isolated candidate — gitignored, never committed, never hand-edited. No other path may change.

writeProhibited:

- apps/docs/src/pages/components/[item].astro
- apps/docs/src/pages/** (every path except the new streamdown.astro)
- apps/docs/src/islands/** · apps/docs/src/scripts/** (the search surface lands with ORI-AST-004's branch)
- scripts/docs-data/**
- apps/docs/src/lib/**
- apps/docs/src/content/** (the landed manuscripts stay byte-exact)
- apps/docs/src/data/**
- apps/docs/src/components/** · apps/docs/src/layouts/**
- tests/sprint-05-orient-search/** (every path except the writeAllowed harness)
- apps/example/** · packages/** · pnpm-lock.yaml · .github/**
- .spec/** · .kb-run-sprint/**
- human-flows.json · gate-plan.json
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- If the RED index page_count is not 63 (or the build page count not 67) because trunk legitimately moved — merged tasks added indexed pages — record the observed counts and proceed; the invariant is exactly +1 on both, not the literals.
- If any consumer of the route appears on trunk before this task lands (a generated streamdown registry item, a second page at the route, a navigation entry), report for a scope check instead of adjusting the oracle.
- If the real Pagefind run exits nonzero or emits no `pagefind-entry.json`, stop and report — never substitute a hand count.
- If `pnpm typecheck` fails in the fresh worktree on the missing generated registry-items.json, copy or regenerate it (never commit); if it still fails, stash-prove pre-existing before recording.

### DELIVERABLE

- `apps/docs/src/pages/components/streamdown.astro`: the docs-owned dependency-explainer destination (h1 Streamdown, pinned honest sentence, matrix-rendered peers/permissions/verdict, real links only, `data-pagefind-body` + `category:components`).
- `tests/sprint-05-orient-search/streamdown-destination-proof.test.ts`: the minimal proof harness (`runStreamdownDestinationProof`) — real build + pinned Pagefind + built-preview RED/GREEN assertions with the zero-occurrence honest-framing checks.
- `.tmp/FIX-ORI-AST-004-1/red.json`, `green.json`, `run.json`: the bound RED/GREEN observations.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; on the isolated candidate (page absent) run the exact selector — the harness captures the real build, the real Pagefind run, and the real preview 404 with both counts in red.json, candidate SHA bound. Wait for orchestrator verification of RED.
2. GREEN: author the page; rerun the identical selector (build at RED + 1 pages, HTTP 200 with h1 and the pinned sentence, index page_count exactly RED + 1, zero registry-command occurrences); then run the preserved static gates. No REFACTOR is expected — the product change is one authored page.
3. Hand the candidate and evidence to astro-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `apps/docs/src/pages/components/[item].astro` [PRIMARY PATTERN] — ORI-AST-008's reference-destination template whose conventions the page follows (Layout/head/meta, data-pagefind-body + category, breadcrumb) and the generated surface this page must not disturb.
2. `apps/docs/src/content/docs/owns-vs-does-not-own.md` — ORI-CONT-005's landed boundary prose: the markdown-renderer-choice facts the page restates and links to.
3. `apps/docs/src/data/dev-client-matrix.json` — the committed data source for the streamdown peers, permissions, and dev-client verdict.
4. `.kb-run-sprint/sprint-05-orient-search/ORI-AST-004/cycle-1.blocked.json` — the blocked report this task resolves (the 404 destination, the 63-page index, the pinned Pagefind invocation).
5. `tests/sprint-05-orient-search/tutorial-designation-proof.test.ts` — the sibling FIX harness pattern (real-build child, RED/GREEN evidence binding, exit-path cleanup).

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts
```

Preserved verification commands:

```sh
pnpm typecheck
pnpm exec biome ci apps/docs/src/pages/components/streamdown.astro tests/sprint-05-orient-search/streamdown-destination-proof.test.ts
```

Command contract: the harness runs the real `pnpm --filter @rnr-ai-elements/docs build` (registry + gallery + astro build) as a child from the repository root, then the pinned Pagefind run, then the owned preview — in that order, because any astro build wipes `dist/pagefind`. A fresh worktree needs the gitignored generated `apps/docs/src/data/registry-items.json` present for `pnpm typecheck` (copy or regenerate via `pnpm registry:build`, never commit). Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells (`Linter process terminated abnormally`); the working shapes are the righthook pre-commit and a clean-env invocation (env -i with explicit pnpm/node PATH) — prove a biome failure environmental before treating it as a gate failure. The fallow pre-commit gate fails on any NEW finding including function size/complexity — keep the harness decomposed (sibling feedback from FIX-ORI-CI-001-1).

### EVIDENCE GATES

1. Prerequisites: the isolated candidate established at the recorded SHA; ORI-AST-008's 56 destinations emitted; ORI-CONT-005's boundary prose present; registry-items.json present or regenerated.
2. Functional RED: the exact selector against the pre-change candidate, captured in red.json (route 404, build page count, index page_count, candidate SHA). Wait for orchestrator verification.
3. GREEN: the identical selector post-change (build at RED + 1, HTTP 200 + h1 + pinned sentence, index page_count RED + 1, zero registry-command occurrences), then the static gates.
4. Evidence: run.json binds candidate source and harness hashes, exact commands, exit codes, observed counts, and the fetched route HTML anchors; the owned preview server stopped on every exit path. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, honest-framing observations, exact two-file scope compliance.

Planned evidence paths: .tmp/FIX-ORI-AST-004-1/red.json, .tmp/FIX-ORI-AST-004-1/green.json, .tmp/FIX-ORI-AST-004-1/run.json. Teardown: stop only the owned preview server and owned children; leave the candidate with exactly the new page and the harness.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. FLOW-SHELL-15-search-contract-before-recovery remains owned by ORI-AST-004; FLOW-SHELL-07-cmdk-open-search-navigate and its sibling journeys remain owned by ORI-AST-010; the locked gate steps, human-flows.json, and gate-plan.json are unchanged — the gate flows now point at a route that will exist; no flow evidence writes, no journey proofs.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-AST-008 (completed — commit f5586742, the reference-destination surface owner whose conventions the page follows). ORI-CONT-005 (completed) supplies the boundary-copy conventions the page's prose restates and links to.

Blocks: ORI-AST-004's cycle-2 GREEN — its eight pinned streamdown legs flip green once this page reaches trunk and its branch merges; indirectly ORI-AST-009, ORI-AST-010, ORI-CI-002 and every task chained behind ORI-AST-004.

Provides: the docs-owned `/components/streamdown` destination on trunk, indexed by the real Pagefind run, with the pinned honest non-registry-item framing.

Consumes: ORI-AST-008's reference-destination conventions and `[item].astro` template patterns; ORI-CONT-005's landed boundary prose (the markdown-renderer choice and renderMarkdown seam facts); the committed `dev-client-matrix.json` streamdown entry; ORI-AST-004's blocked report naming the missing destination and its pinned Pagefind invocation.

References: CAP-DOCS-01; UC-SHELL-02; `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`.

Provenance: planner ask `ask-wave17-add-streamdown-dependency-destination` (wave-17, sequence next); source task ORI-AST-004 (blocked cycle 1, commit b2560ce36e2e5ba2eb2012d77f53db5987b63432; report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-AST-004/cycle-1.blocked.json`, sha256 02b699e60e185f399f40755974ead67f9ee591d33c5b4c9a4d4637ca2074087a, item ORI-AST-004:blocked:1:scope_impact:0); human decision recorded in-session 2026-09-25 — create the docs-owned dependency-explainer page at `/components/streamdown` rather than amend the locked contracts; proposed by astro-planner.

### OUT OF SCOPE

Any change to the search dialog, the indexer script, the page model, `[item].astro`, existing pages, or human-flows.json; adding streamdown to the registry (`packages/registry/registry.json`) or fabricating registry data; a second search gate; ORI-AST-004's in-flight branch; dependency or lockfile changes; journey proofs; planning-artifact edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: functional RED (the pre-change 404 + both observed counts) and GREEN bound to the real build, the real pinned Pagefind run, and the real built preview; build page count and index page_count each exactly RED + 1; HTTP 200 with the h1 and the pinned honest sentence; exactly 0 occurrences of `streamdown.json` and of `@react-native-reusables/cli` in the served route HTML; peers rendered from the committed matrix entry; static gates green or stash-proven pre-existing; `[item].astro` untouched; only the allowlisted files changed; no stub, fake success, or authored count. Should verify: the pinned honest sentence is the page's own visible framing, not a hidden comment; every internal link resolves (the link gate stays green); the honest-framing claim is not presented as ORI-AST-004 acceptance. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-AST-004-1","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"trunk_without_streamdown_destination":{"description":"An isolated candidate worktree of trunk (Source SHA b56b5214c2b48b57493116a6402935dc5b712cf4) with ORI-AST-008's 56 generated reference destinations and ORI-CONT-005's landed boundary prose, where /components/streamdown is a verified 404 and the real index covers 63 pages (56 items + 7 docs), plus the owned .tmp/FIX-ORI-AST-004-1 evidence root.","seed_method":"cli","records":["The gitignored generated apps/docs/src/data/registry-items.json is absent in a fresh worktree and gates pnpm typecheck - copy or regenerate it via pnpm registry:build inside the worktree; never commit it (stash-proven pre-existing behavior recorded in FIX-ORI-AI-002-1's handoff).","dist/pagefind is wiped by any astro build, so the harness runs the pinned Pagefind invocation AFTER the build, never before (the ORI-AST-004 blocked report's gate-order finding); the invocation is pnpm dlx pagefind@1.5.2 --site apps/docs/dist - the identical command ORI-AST-004's indexer runs.","The preview serves the built dist through the shared tests/harness/docs-preview.ts strict-port shape on the canonical owned port 4321; the guard exits 1 while the port is owned by anything else - refuse an unowned conflict, never kill unrelated processes, and stop the owned server on every exit path.","The build page count and index page_count literals are the ones observed at the RED run - 67 and 63 at planning time; the invariant is exactly +1 on both, since the change adds exactly one page."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"The destination lands, serves HTTP 200, and enters the real index","primary":true,"description":"GIVEN trunk where /components/streamdown is a verified 404 and the real Pagefind index covers 63 pages (56 items + 7 docs) WHEN the docs-owned dependency-explainer page is authored at apps/docs/src/pages/components/streamdown.astro THEN the real public build exits 0 at exactly the recorded RED page count + 1 (67 -> 68 at planning time), the built preview serves /components/streamdown at HTTP 200 with a main h1 carrying Streamdown and the pinned honest sentence 'Streamdown is not a registry item.', and the pinned real Pagefind run over the completed dist reports an index page_count of exactly RED + 1 (63 -> 64 as it lands) - the new page is in the index, not just on disk.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/streamdown-destination-proof.test.ts","test_function":"runStreamdownDestinationProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts","test_tier":"integration","verification_service":"the real Astro build, the pinned real Pagefind CLI (1.5.2 via pnpm dlx) over the completed dist, and the real astro preview serving the built dist on the owned localhost:4321","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-AST-004-1-1","use_case_ref":"UC-SHELL-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real Astro build, the pinned real Pagefind CLI (1.5.2 via pnpm dlx) over the completed dist, and the real astro preview serving the built dist on the owned localhost:4321","negative_control":{"would_fail_if":["GREEN is claimed from a cached build receipt, a dev-server render, or a static source grep over a non-built tree instead of the real public build, the real pinned Pagefind run, and the real built preview.","The page ships without data-pagefind-body so Pagefind never indexes it - the route serves 200 while the index page_count stays at the RED value, and the search dialog can never surface it.","A mocked index, a hand-counted page list, or an authored success flag replaces the observed pagefind-entry.json page_count, or the index delta is asserted from source inspection rather than the real run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_without_streamdown_destination","action":{"actor":"cli_user","steps":["Pre-change RED: on the isolated candidate (the page absent), run the real pnpm --filter @rnr-ai-elements/docs build, then the pinned real Pagefind run (pnpm dlx pagefind@1.5.2 --site apps/docs/dist - always after the build, since any astro build wipes dist/pagefind), then serve the built dist through the real astro preview on the owned port; record the route's HTTP 404, the build page count, the index page_count, and the candidate SHA in red.json.","Author apps/docs/src/pages/components/streamdown.astro - the docs-owned dependency explainer on the DocsLayout shell following ORI-AST-008's destination conventions, with data-pagefind-body and data-pagefind-meta category:components.","Rerun the identical commands; confirm build exit 0 at exactly the RED page count + 1, HTTP 200 at /components/streamdown with the main h1 carrying Streamdown and the pinned honest sentence, and index page_count exactly RED + 1."]},"end_state":{"must_observe":["red.json records the pre-change run: route HTTP 404 at /components/streamdown, build page count (67 at planning time), index page_count (63 at planning time), and the candidate SHA.","green.json records the post-change run: build exit 0 at exactly the RED page count + 1 (68 at planning time), HTTP 200 at /components/streamdown, the served route HTML's main h1 carrying Streamdown, the pinned sentence 'Streamdown is not a registry item.' present in the served route HTML, and index page_count exactly RED + 1 (64 at planning time).","The served page carries data-pagefind-body and data-pagefind-meta category:components, so the real index admits it and the search dialog groups it with component destinations."],"must_not_observe":["An index page_count delta other than exactly +1 between the recorded RED and GREEN runs, a GREEN build page count other than RED + 1, or a route status other than 200 after the change.","GREEN claimed from a source grep, a dev-server render, or a cached dist instead of the real build + real Pagefind run + real built preview.","The served route HTML missing the pinned honest sentence, or index-inclusion evidence reported with (0) real Pagefind observations - the empty signature of a static shell."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Honest non-registry framing, real matrix facts, static gates, and the two-file diff","primary":false,"description":"GIVEN the landed page WHEN the served route HTML and the candidate tree are inspected THEN the page carries the pinned honest sentence 'Streamdown is not a registry item.' with (0) occurrences of 'streamdown.json' and (0) occurrences of '@react-native-reusables/cli' in the served route HTML (no copyable registry command), the peers, permissions, and dev-client verdict render from the committed dev-client-matrix.json streamdown entry (react-native-streamdown@0.3.0 among four peers), every internal link resolves to a real destination the build emits, pnpm typecheck and the scoped Biome command exit 0, and the tracked-file diff is exactly the new page plus the harness.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/streamdown-destination-proof.test.ts","test_function":"runStreamdownDestinationProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts","test_tier":"integration","verification_service":"the real built-preview route HTML over the committed data file, the real TypeScript compiler, and the real Biome linter","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-AST-004-1-2","use_case_ref":"UC-SHELL-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"the real built-preview route HTML over the committed data file, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["The page omits the pinned honest sentence, carries a copyable registry CLI command targeting streamdown, or fabricates registry-item data (props, source files, usage snippet).","Peers are hand-typed literals rather than rendered from the committed dev-client-matrix.json entry, so a matrix change can silently drift the page.","The static gates fail without the stash-proven pre-existing record, or any path outside the allowlist changes."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_without_streamdown_destination","action":{"actor":"cli_user","steps":["Fetch /components/streamdown over the built preview; assert the pinned honest sentence 'Streamdown is not a registry item.', count 'streamdown.json' occurrences (exactly 0) and '@react-native-reusables/cli' occurrences (exactly 0) in the served route HTML.","Compare the rendered peers, permissions, and verdict with the committed apps/docs/src/data/dev-client-matrix.json streamdown entry; follow every internal link on the page and require real destinations the build emits.","Run pnpm typecheck and the scoped Biome command on the candidate; prove any failure pre-existing with git stash && rerun before recording it. Confirm the tracked-file diff is exactly apps/docs/src/pages/components/streamdown.astro and tests/sprint-05-orient-search/streamdown-destination-proof.test.ts (plus the owned .tmp/FIX-ORI-AST-004-1 evidence)."]},"end_state":{"must_observe":["The served route HTML carries the pinned sentence 'Streamdown is not a registry item.' and reports exactly 0 occurrences of 'streamdown.json' and exactly 0 occurrences of '@react-native-reusables/cli' - the page documents an npm dependency and never offers a registry CLI command.","The rendered list of peers equals the committed dev-client-matrix.json streamdown entry - react-native-streamdown@0.3.0, react-native-enriched-markdown@>=1.0.0, react-native-worklets@>=0.10.0, remend@1.3.0 - with the dev-client verdict and the iOS/Android permissions, rendered from the data file, never hand-typed literals.","pnpm typecheck and the scoped Biome command exit 0 (or carry the stash-proven pre-existing record); apps/docs/src/pages/components/[item].astro is byte-unchanged; the tracked-file diff is exactly the two new files."],"must_not_observe":["An InstallCommand, version chip, family pager, fabricated Props or Source section, or any other registry-item chrome implying the page is installable via the registry CLI - the empty framing of (0) honest sentences fails the gate.","Hand-typed peers drifting from dev-client-matrix.json, or a link to a route the build does not emit.","Any changed path beyond the new page, the harness, and the owned .tmp evidence."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The harness's real build, real Pagefind run, and real built preview prove the route 200 + h1 + pinned honest sentence + index page_count exactly RED + 1, with the pre-change 404 and both counts recorded in red.json.","verify":"pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The harness's served-HTML inspection proves the honest framing and the zero registry-command occurrences over the real matrix facts; the static gates pass; the tracked-file diff is exactly the new page plus the harness.","verify":"pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts","maps_to_ac":"AC-2"}]}
-->
</details>
