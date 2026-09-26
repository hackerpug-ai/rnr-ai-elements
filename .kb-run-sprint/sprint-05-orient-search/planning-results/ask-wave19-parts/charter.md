# FIX-ORI-SUITE-1: Repair the pre-existing suite breaks on trunk

## What this does

Repairs the seven pre-existing test-suite breaks on trunk — each planner-verified failing on trunk `ca759bd7` independent of any reporting task — so ORI-CI-003/ORI-CI-004's aggregate `pnpm test` acceptance can pass and the shared search-selector class stops failing the Playwright lane. Every repair lives in the seven named test files plus one task-owned proof harness (`tests/sprint-05-orient-search/suite-repair-proof.test.ts`) that verifies each named selection now passes; NO product source changes.

The seven verified breaks and their repairs:

1. `tests/sprint-05-orient-search/single-tutorial-gate.test.ts` — 3 pass / 2 fail (`ORI-CI-001-duplicate` at :461, `ORI-CI-001-noncanonical` at :496). Since ORI-CI-002's ordered chain, `check:snippets` runs before Astro's tutorial gate, and the drill's copied/renamed Quickstart carries four source-bound blocks with no committed binding, so the build stops at `[authored-snippets] no committed binding (unbound source-bound block): document apps/docs/src/content/docs/ori-ci-001-second-tutorial.mdx …` before `[docs-data] single-tutorial` can speak — the unpublished draft variant trips it too. Repair: the drill's `runDuplicateCases`/`runNoncanonicalCase` extend (duplicate) or re-point (noncanonical) the SCRATCH copy's `COMMITTED_BINDINGS` in `scripts/docs-data/authored-snippets.ts` for the copy's four source-bound blocks — exactly ORI-CI-002's duplicate-tutorial insertion pattern (`docs-build-pipeline.test.ts` `planDuplicateTutorial`) — restored byte-exactly in the drill's finally. The noncanonical rename must RE-POINT the four quickstart entries (not just add): the stale-binding check at `authored-snippets.ts:945` (`stale binding: … matches no authored block and no emitted element`) rejects the orphaned quickstart bindings once the file is renamed.
2. `tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts` — 1 pass / 1 fail (`FUSE-01-manifest-contract` at :142: `dependency "github-slugger" is outside the TR-06 allowed set`; `wrangler` is the next offender behind it; then :162-163 pins the retired three-segment build script). Repair: extend the TR-06 allowed set with exactly the two landed dependencies (`github-slugger`, landed by ORI-AST-001 `bf202aac`; `wrangler`, landed by ORI-DEP-001 `57903f51`) with a supersede comment naming both commits, and supersede the build-script pin to the landed seven-stage public-build form (ORI-CI-002's `ci-chain-order` supersede is the pattern; `STAGE_ORDER` in `docs-build-pipeline.test.ts` is the living contract).
3. `tests/sprint-04-generated-reference/data-table-contract.test.ts` — 3 pass / 1 fail (`:58 rows prop is the required readonly cell-matrix`). AST-007's rich-cell form made `rows` optional (`rows?: readonly { text: string; mono?: boolean }[][]`) and moved the loop to `rows?.map(` with the default-slot rich body. Repair: update the `rows:` regex to the optional form, assert the rich-body slot branch alongside, and re-anchor the exactly-1 loop count to `rows?.map(`.
4. `tests/sprint-01-docs-spike-skeleton/ledger.spec.ts` — failures across its tokens (planner-verified: 112 `rnr-copy-button button` triggers — two labeled engine commands per row since AST-007; strict-mode on the bulk-add `code` pair — the standalone display `<code>` plus the CopyButton island's internal `code`; `td.ledger-type` now renders the stripped category; `td.ledger-verdict` replaced by the Badge in a plain `td`; `table.ledger__table` replaced by `table.data-table` under `.ledger-table__scroll` with `tbody[data-ledger]`; the Docs column now links `/components/{name}` for all 56 rows via `a[data-docs-link]`). Repair: rewrite the selectors to AST-007's landed LedgerTable shape, adopting the living sprint-05 lane precedents (`ledger-presentation.spec.ts`: row-scoped `.badge`, `[data-engine-command="nativewind"] rnr-copy-button`, `a[data-docs-link]`); retire only the assertions superseded by living sprint-05 lanes (the in-page `#row-` docs-href fragment scheme — every row now has a real ORI-AST-008 destination), and keep rewriting everything that still guards real sprint-01 behavior: 56 rows name-for-name against the generated dataset, verdict vocabulary, absolute-URL command regex, clipboard equality, DOM-order, and the no-JS render.
5. `tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts` — 6 pass / 3 fail (token `FAM-005-ledger-badge-wiring` times out in all three projects): same replaced-selector class (`td.ledger-verdict .badge`, `td.ledger-docs a`, the `#row-` docs-href helper, and the per-row copy count now 2 per row). Repair: same selector rewrite; the `id="row-{name}"` anchor assertions stay (the anchors survive on the `tr`).
6. `tests/sprint-05-orient-search/not-found-search-recovery.spec.ts` — 6 pass / 3 fail (the two JS-enabled projects' AC tokens at :488/:706): strict-mode violation `locator('[data-search-slot] button') resolved to 2 elements` — VIS-003's `data-search-close` button landed inside the header slot next to the trigger. Repair: the one-line selector fix, scoping to the trigger's specific selector `'[data-search-slot] button.search-dialog__trigger'` — the exact form the living `search-presentation.spec.ts:40` already uses.
7. `tests/sprint-05-orient-search/search-contract.spec.ts` — 5 pass / 10 fail (every JS-enabled token — the locked 13-step sequence and AC-1..AC-4 — in chromium-desktop and chromium-mobile fails at the :208 click on the same strict-mode violation; the no-JS project passes). Same one-line class and same repair as member 6: `SEARCH_TRIGGER` becomes `'[data-search-slot] button.search-dialog__trigger'`; nothing else in the spec changes.

Planner-verified trunk observations recorded 2026-09-25 on `ca759bd7`: single-tutorial-gate 3/2, scaffold.build 1/1, data-table-contract 3/1, ledger.spec failing, verdict-badge-wiring 6/3, not-found-search-recovery 6/3, search-contract 5/10 (all via the exact per-suite selectors preserved below).

## Why

ORI-CI-003 and ORI-CI-004 are the sprint's CI acceptance owners and their aggregate `pnpm test` gate cannot exit 0 while the vitest-class members fail on trunk and the shared search-selector class fails the Playwright lane, through no fault of theirs. Each break is collateral of landed, reviewed sprint-05 work (ORI-CI-002's ordered chain, ORI-AST-001/DEP-001's dependencies, AST-007's rich-cell ledger, AST-008's per-item destinations, VIS-003's close button) that legitimately moved the product past suites pinned to the older shape. The owning tasks of those suites are all completed, ORI-CI-002 (the ordered-build owner — completed, approved `3573a237`, merged `c9bb5cc5`) has landed, and no pending task owns the repair. The wave-19 decision (source item `ORI-VIS-004:7230130b…:scope_impact:1`, handoff sha256 `4630af86…`) authorized exactly this add.

## How to verify

```sh
pnpm exec vitest run tests/sprint-05-orient-search/suite-repair-proof.test.ts
pnpm test
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/single-tutorial-gate.test.ts tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts tests/sprint-04-generated-reference/data-table-contract.test.ts tests/sprint-01-docs-spike-skeleton/ledger.spec.ts tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts tests/sprint-05-orient-search/not-found-search-recovery.spec.ts tests/sprint-05-orient-search/search-contract.spec.ts tests/sprint-05-orient-search/suite-repair-proof.test.ts
```

The first command is the exact selector: the task-owned proof harness spawns each of the seven preserved per-suite selectors (three vitest, four Playwright after one real `pnpm --filter @rnr-ai-elements/docs` build), asserts exit 0 for each, runs `pnpm typecheck` and the scoped Biome command, and asserts the tracked-file diff boundary — recording RED (the planner-verified trunk failures, bound to the pre-change candidate SHA) and GREEN (per-suite exit 0) in `.tmp/FIX-ORI-SUITE-1/`. `pnpm test` (the aggregate vitest run), `pnpm typecheck`, and the scoped Biome command are preserved GREEN commands the implementer runs and records in `run.json`; the harness never spawns `pnpm test` itself (a vitest child spawning the vitest aggregate would re-run every drill and the harness — unbounded recursion).

## Scope

Own exactly the seven named test files, the task-owned proof harness, drill-emitted evidence appends, and bounded `.tmp/FIX-ORI-SUITE-1/` evidence. Zero product-source changes: the single-tutorial repair mutates `scripts/docs-data/authored-snippets.ts` ONLY inside the drill's owned `os.tmpdir()` scratch copies (restored byte-exactly in the drill's finally — the ORI-CI-002 duplicate-tutorial mutation pattern); `apps/docs/src/components/DataTable.astro`, `LedgerTable.astro`, `Badge.astro`, the islands, `registry.astro`, `package.json`, and `scripts/docs-data/**` on the candidate stay byte-unchanged.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ⬜ Pending

> Assignee: ghactions-implementer
> Priority: P1 · Points: 3 · Type: FIX
> Dependency phase: after ORI-CI-002
> Proposed By: ghactions-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-25
> Source SHA: ca759bd79c9808a476103031e4082e84a55ae9ec

AGENT: planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

PROGRESS: 0/3 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

The seven named suites pass their exact selectors in isolation on trunk, the aggregate `pnpm test` (vitest run) exits 0 on the repaired tree, `pnpm typecheck` and the scoped Biome command exit 0, and ORI-CI-003/ORI-CI-004's aggregate acceptance is unblocked — with zero product-source changes, every data-equality oracle preserved against the real generated dataset and the real built dist, and the repairs owned by a proof harness that verifies each named selection.

### CRITICAL CONSTRAINTS — Never

- Never change product source: no edit to any file under `apps/`, `packages/`, or `scripts/` on the candidate. The single-tutorial repair's `COMMITTED_BINDINGS` extension lives and dies inside the drill's owned `os.tmpdir()` scratch copy, restored byte-exactly in the drill's existing finally path.
- Never weaken an oracle to get green: every data-equality assertion (56 rows name-for-name, verdict vocabulary `runs in Expo Go` / `requires a dev client`, the absolute-URL command regex, clipboard equality with the displayed command, DOM-order, no-JS render, 200-resolution of every docs href) must survive the selector rewrite. Retire ONLY assertions whose behavior no longer exists on the landed product (the `#row-` docs-href fragment scheme — every row now owns a real `/components/{name}` destination) and name each retirement in the handoff.
- Never repair a suite by deleting it, skipping projects, lowering timeouts to dodge slowness, or marking tokens `.skip`.
- Never let the proof harness spawn the aggregate `pnpm test` (unbounded recursion through the harness itself); the aggregate is a preserved GREEN command recorded in `run.json`.
- Never claim GREEN from a cached build receipt or a dev-server render: the Playwright selectors run against `astro preview` serving the freshly built dist (the `pnpm e2e:docs` shape), and the vitest drills run the real seven-stage build inside their owned scratch copies.
- Never touch `tests/sprint-05-orient-search/recovery-presentation.spec.ts`: it carries the same `[data-search-slot] button` constant, but its current 3 failures are the public-origin prerequisite ORI-DEP-003 owns — outside this task's write boundary; report, do not repair.
- Never touch in-flight surfaces, planning artifacts, `human-flows.json`, `gate-plan.json`, or perform trunk/worktree lifecycle operations.

### DONE WHEN

- [ ] AC-1 proves the three vitest suites pass their exact selectors in isolation — the tutorial drill's duplicate/noncanonical variants reaching ASTRO's gate diagnostics, the manifest contract allowing exactly the landed dependency set and pinning the seven-stage script, and the data-table contract asserting the optional rich-cell form — RED captured pre-change.
- [ ] AC-2 proves the four Playwright suites pass their exact selectors across all three projects against the freshly built dist, with the data-equality oracles preserved.
- [ ] AC-3 proves the aggregate `pnpm test` exit 0, `pnpm typecheck` and scoped Biome exit 0, the tracked-file diff boundary (seven suites + harness + drill-emitted evidence appends only), and the RED/GREEN evidence under `.tmp/FIX-ORI-SUITE-1/`.

### SPECIFICATION

Seven test-file repairs + one proof harness. The harness (`tests/sprint-05-orient-search/suite-repair-proof.test.ts`, exporting `runSuiteRepairProof`) spawns the seven preserved per-suite selectors with per-child timeouts that respect the drills (the single-tutorial drill alone is a six-build, 45-minute-class run), runs the two static gates, and asserts the diff boundary; it records RED (planner-verified trunk failures) and GREEN per suite. RED is the recorded pre-change state of the six selectors; GREEN is the identical selectors on the repaired tree.

### BOUNDARY CONTRACTS

1. `tests/sprint-05-orient-search/single-tutorial-gate.test.ts` (MODIFY): the drill's duplicate variants (published and unpublished — both trip `check:snippets` today) and the noncanonical variant extend or re-point the scratch copy's `COMMITTED_BINDINGS` for the copy's four source-bound blocks (`messagesSource`, `screenSource`, `entrypointNativewind`, `entrypointUniwind`) — insertion before the array's closing `];` per ORI-CI-002's `planDuplicateTutorial` anchor pattern; the noncanonical rename RE-POINTS the four quickstart entries' `doc` path to the moved slug (the stale-binding check rejects orphaned bindings); every gate-file mutation is restored byte-exactly in the drill's finally and the restored-build assertion still passes. No change to the five tokens' diagnostic assertions.
2. `tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts` (MODIFY): the TR-06 allowed set gains exactly `github-slugger` and `wrangler` with a supersede comment naming commits `bf202aac` (ORI-AST-001) and `57903f51` (ORI-DEP-001); the build-script pin supersedes to the landed seven-stage string (`pnpm -w run registry:build && pnpm -w run gallery:manifest && pnpm run prebuild && pnpm run check:snippets && astro build && pnpm run search:index && pnpm run check:links`); the banned-adapter/framework negatives, the Astro 7 pin, the site origin, and the static-output assertions stay byte-effective.
3. `tests/sprint-04-generated-reference/data-table-contract.test.ts` (MODIFY): the `rows` prop regex accepts the optional rich-cell form (`rows?:` … `[][]`), asserts the rich-body slot branch (`Astro.slots.has('default')` gating `<slot />`) alongside the prop-driven tbody, and the exactly-1 loop anchor becomes `rows?.map(`; the zebra/sticky/scroll/media/zero-JS/token guards stay byte-effective.
4. `tests/sprint-01-docs-spike-skeleton/ledger.spec.ts` (MODIFY): selectors adopt the landed LedgerTable shape — row-scoped `.badge` for the verdict, the stripped-category `td` text (`component`|`ui`|`lib`) against `categoryOf(item.type)`, `table.data-table` (under `.ledger-table__scroll`, `tbody[data-ledger]`) for the DOM-order probe, `a[data-docs-link]` for the docs column with all 56 hrefs `/components/{item.name}` resolving 200, engine-scoped copy selection (`[data-engine-command="nativewind"] rnr-copy-button`) keeping the sprint-01 nativewind-form command equality and clipboard equality, and the bulk-add display-code scoping that separates the standalone `<code>` from the CopyButton's internal `code`. The `#row-` fragment-href dead-anchor branch retires (superseded: every row owns a real destination); the `id="row-{name}"` anchor existence stays asserted.
5. `tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts` (MODIFY): same selector class — row-scoped `.badge`, `a[data-docs-link]`, the docs-href helper returning `/components/${item.name}` for every item, and the per-row copy affordance counting both labeled engine commands (2 per row, 112 total) or scoping to one engine block with the other asserted present; the anchored-rows, bulk-add, note, and vocabulary assertions stay byte-effective.
6. `tests/sprint-05-orient-search/not-found-search-recovery.spec.ts` (MODIFY): `HEADER_SEARCH_TRIGGER` becomes `'[data-search-slot] button.search-dialog__trigger'` (the `search-presentation.spec.ts:40` form); nothing else in the spec changes.
7. `tests/sprint-05-orient-search/search-contract.spec.ts` (MODIFY): `SEARCH_TRIGGER` (:80) becomes `'[data-search-slot] button.search-dialog__trigger'` so the :208 click resolves the single trigger element — the `search-presentation.spec.ts:40` form, same class as member 6; nothing else in the spec changes.
8. Harness `tests/sprint-05-orient-search/suite-repair-proof.test.ts` (NEW): spawn the seven preserved selectors (vitest three directly; one real `pnpm --filter @rnr-ai-elements/docs build` before the three Playwright selectors, run per the `pnpm e2e:docs` shape), assert each exit 0, run `pnpm typecheck` and the scoped Biome command, assert the tracked-file diff boundary, and emit `.tmp/FIX-ORI-SUITE-1/{red,green,run}.json` binding candidate and harness hashes, per-suite exit codes, and the static-gate results; it never spawns the aggregate `pnpm test`.
9. Drill-emitted evidence appends: running the real single-tutorial selector appends run blocks to `tests/sprint-05-orient-search/evidence/ORI-CI-001/{positive,duplicate,missing,noncanonical,restored}.log` and `manifest.json` — append-only, drill-emitted, never hand-edited; they are the suite's own recording contract.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY.

#### AC-1: The three vitest suites pass their exact selectors in isolation [PRIMARY]

GIVEN trunk `ca759bd7` where the three vitest selectors fail — `single-tutorial-gate.test.ts` 3 pass / 2 fail (`ORI-CI-001-duplicate` at :461 and `ORI-CI-001-noncanonical` at :496, the builds stopping at `check:snippets` `no committed binding` before the tutorial gate, the draft variant tripping it too), `scaffold.build.test.ts` 1 pass / 1 fail (`FUSE-01-manifest-contract` at :142 on `github-slugger` outside the TR-06 set, with `wrangler` behind it, and the retired three-segment pin at :162), and `data-table-contract.test.ts` 3 pass / 1 fail (the `:58` rows regex wanting the pre-AST-007 non-optional form) WHEN the seven named test files carry the repairs THEN each of the three exact vitest selectors exits 0 in isolation — the drill's duplicate/noncanonical variants reaching ASTRO's `[docs-data] single-tutorial` / `canonical-destination` diagnostics through scratch-only `COMMITTED_BINDINGS` extensions, the manifest contract allowing exactly the landed dependency set and pinning the seven-stage script, and the data-table contract asserting the optional rich-cell form.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real vitest runners, the real seven-stage public docs build inside the drills' owned scratch copies, and the real check:snippets and tutorial-gate diagnostics
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/suite-repair-proof.test.ts
- TEST_FUNCTION: runSuiteRepairProof
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/suite-repair-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
__SC1__
```

#### AC-2: The three Playwright suites pass their exact selectors against the built dist

GIVEN trunk where `ledger.spec.ts` fails across its tokens (112 copy triggers — two labeled engine commands per row; the strict-mode bulk-add `code` pair; the replaced `td.ledger-type`/`td.ledger-verdict`/`table.ledger__table` selectors; the docs column's 56 `/components/{name}` links), `verdict-badge-wiring.spec.ts` fails its ledger token in all three projects on the same replaced selectors, and `not-found-search-recovery.spec.ts` fails its two JS-enabled projects on the `'[data-search-slot] button'` strict-mode violation (2 elements since VIS-003's close button) WHEN the three spec files carry the selector repairs adopted from the living sprint-05 lane precedents THEN each exact Playwright selector exits 0 across all three projects against `astro preview` serving the freshly built dist, with the data-equality oracles preserved — 56 rows name-for-name against the generated dataset, the verdict vocabulary, the absolute-URL command regex, clipboard equality with the displayed command, DOM-order, and the no-JS render.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real Playwright runners over astro preview serving the real built dist, the real generated dataset, and the real clipboard
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/suite-repair-proof.test.ts
- TEST_FUNCTION: runSuiteRepairProof
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/suite-repair-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
__SC2__
```

#### AC-3: Aggregate, static gates, diff boundary, and the proof harness evidence

GIVEN the repaired tree WHEN the aggregate `pnpm test` (vitest run) executes THEN it exits 0 — the vitest-class breaks repaired with no other suite regressed; `pnpm typecheck` exits 0; the scoped Biome command over the eight touched test files exits 0; the tracked-file diff is exactly the seven repaired suites plus the new harness, with only drill-appended run blocks under `tests/sprint-05-orient-search/evidence/ORI-CI-001/` as the single-tutorial drill's own recording side effect; the harness records RED (the planner-verified trunk failures bound to the pre-change candidate SHA) and GREEN (per-suite exit 0) under `.tmp/FIX-ORI-SUITE-1/`; and no product source changes — `scripts/docs-data/authored-snippets.ts` mutations live and die inside the drill's owned scratch copies.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real vitest aggregate over the whole repository test tree, the real TypeScript compiler, the real Biome linter, and the harness's own spawned selectors
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/suite-repair-proof.test.ts
- TEST_FUNCTION: runSuiteRepairProof
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/suite-repair-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
__SC3__
```

### TEST CRITERIA

- TC-1 → AC-1: The three vitest selectors exit 0 in isolation (spawned by the harness; per-suite commands preserved below). VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/suite-repair-proof.test.ts`
- TC-2 → AC-2: The three Playwright selectors exit 0 across all three projects after one real build. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/suite-repair-proof.test.ts`
- TC-3 → AC-3: The aggregate `pnpm test`, `pnpm typecheck`, and the scoped Biome command exit 0; the tracked-file diff is the seven suites + harness + drill appends; RED/GREEN recorded. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/suite-repair-proof.test.ts`

### SHARED FIXTURES

```json
__FIXTURES__
```

### SCOPE — file-level write permissions

writeAllowed:

- tests/sprint-05-orient-search/single-tutorial-gate.test.ts (MODIFY)
- tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts (MODIFY)
- tests/sprint-04-generated-reference/data-table-contract.test.ts (MODIFY)
- tests/sprint-01-docs-spike-skeleton/ledger.spec.ts (MODIFY)
- tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts (MODIFY)
- tests/sprint-05-orient-search/not-found-search-recovery.spec.ts (MODIFY)
- tests/sprint-05-orient-search/search-contract.spec.ts (MODIFY)
- tests/sprint-05-orient-search/suite-repair-proof.test.ts (NEW)
- tests/sprint-05-orient-search/evidence/ORI-CI-001/positive.log (APPEND-ONLY drill side effect)
- tests/sprint-05-orient-search/evidence/ORI-CI-001/duplicate.log (APPEND-ONLY drill side effect)
- tests/sprint-05-orient-search/evidence/ORI-CI-001/missing.log (APPEND-ONLY drill side effect)
- tests/sprint-05-orient-search/evidence/ORI-CI-001/noncanonical.log (APPEND-ONLY drill side effect)
- tests/sprint-05-orient-search/evidence/ORI-CI-001/restored.log (APPEND-ONLY drill side effect)
- tests/sprint-05-orient-search/evidence/ORI-CI-001/manifest.json (APPEND-ONLY drill side effect)
- .tmp/FIX-ORI-SUITE-1/red.json (NEW)
- .tmp/FIX-ORI-SUITE-1/green.json (NEW)
- .tmp/FIX-ORI-SUITE-1/run.json (NEW)

Build outputs (`apps/docs/dist/**`, `apps/docs/.astro/**`, `apps/docs/node_modules/.vite/**`, `playwright-report/**`, `test-results/**`) and the worktree-local regenerated `apps/docs/src/data/registry-items.json` are gitignored side effects of the allowed commands — never committed, never hand-edited. Scratch copies live and die under the drill's owned `os.tmpdir()` root. No other path may change.

writeProhibited:

- apps/** (every product source — including `apps/docs/src/components/DataTable.astro`, `LedgerTable.astro`, `Badge.astro`, the islands, `registry.astro`, and `apps/docs/package.json`)
- packages/**
- scripts/** (including `scripts/docs-data/authored-snippets.ts` on the candidate — the drill mutates it only inside its owned scratch copies)
- playwright.config.ts
- tests/** (every path except the eight writeAllowed files and the six append-only drill evidence files)
- .github/**
- .spec/**
- .kb-run-sprint/**
- pnpm-lock.yaml
- human-flows.json · gate-plan.json
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- If any repair genuinely requires a product-source change (for example, a landed markup fact the selectors cannot reach), STOP and report the concrete file and fact for a scope check — never widen the diff past the test files.
- `tests/sprint-05-orient-search/recovery-presentation.spec.ts:52` carries the same stale `[data-search-slot] button` constant, but its current 3 failures are the public-origin prerequisite ORI-DEP-003 owns, not selector drift — it stays OUTSIDE this task's write boundary: report its state in the handoff, do not repair it.
- If the aggregate `pnpm test` surfaces a seventh failing vitest suite beyond the three vitest-class members repaired here, record it in `run.json` and report it for a scope check — do not silently widen the repair set.
- If pnpm-wrapped Biome dies environmentally (exit 254, `Linter process terminated abnormally` in shimmed shells), rerun via the righthook pre-commit or a clean-env invocation before treating it as a gate failure (recorded FIX-ORI-CI-001-1 finding).

### DELIVERABLE

- The seven repaired test files, each passing its exact selector in isolation.
- `tests/sprint-05-orient-search/suite-repair-proof.test.ts`: the proof harness (`runSuiteRepairProof`) spawning the seven preserved selectors, the two static gates, and the diff-boundary check.
- `.tmp/FIX-ORI-SUITE-1/red.json`, `green.json`, `run.json`: RED/GREEN observations and the aggregate/static-gate record.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; on the isolated candidate, run the seven preserved per-suite selectors pre-change and record each failure (exit codes + the failing assertions) in `red.json` with the candidate SHA bound. Wait for orchestrator verification of RED.
2. GREEN: land the seven repairs; rerun the harness selector (it spawns the identical seven selectors plus the static gates); then run the preserved aggregate `pnpm test`, `pnpm typecheck`, and the scoped Biome command, recording all exits in `run.json`. REFACTOR only within the repaired files if a selector rewrite duplicates logic worth sharing.
3. Hand the candidate and evidence to ghactions-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `tests/sprint-05-orient-search/single-tutorial-gate.test.ts` [PRIMARY TARGET] — the drill to extend (duplicate/noncanonical bindings).
2. `tests/sprint-05-orient-search/docs-build-pipeline.test.ts` — `planDuplicateTutorial` (the scratch bindings-insertion pattern) and `STAGE_ORDER` (the seven-stage contract).
3. `apps/docs/src/components/LedgerTable.astro` + `apps/docs/src/components/DataTable.astro` — the landed ledger/table shape the selector rewrites target (read-only).
4. `tests/sprint-05-orient-search/ledger-presentation.spec.ts` + `tests/sprint-05-orient-search/search-presentation.spec.ts` — the living lane selector precedents (`.badge`, `[data-engine-command] rnr-copy-button`, `a[data-docs-link]`, the scoped search trigger).
5. `scripts/docs-data/authored-snippets.ts` — the bindings/stale-binding checks (:733, :945) the drill extensions must satisfy (read-only).

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec vitest run tests/sprint-05-orient-search/suite-repair-proof.test.ts
```

Preserved per-suite selectors (the harness spawns these; each must exit 0 in isolation):

```sh
pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts
pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts
pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts
pnpm --filter @rnr-ai-elements/docs build
pnpm exec playwright test tests/sprint-01-docs-spike-skeleton/ledger.spec.ts
pnpm exec playwright test tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts
pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts
pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts
```

Preserved aggregate and static gates:

```sh
pnpm test
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/single-tutorial-gate.test.ts tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts tests/sprint-04-generated-reference/data-table-contract.test.ts tests/sprint-01-docs-spike-skeleton/ledger.spec.ts tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts tests/sprint-05-orient-search/not-found-search-recovery.spec.ts tests/sprint-05-orient-search/search-contract.spec.ts tests/sprint-05-orient-search/suite-repair-proof.test.ts
```

Command contract: the single-tutorial drill is a six-build, 45-minute-class run (DRILL_TIMEOUT_MS 2_700_000) — the harness's per-child timeouts must respect it. The Playwright selectors need the freshly built dist (the `pnpm e2e:docs` shape: build once, then the three spec selectors; Playwright owns the `astro preview` webServer, CI=1 with a verified-free 4321 per the ORI-VIS-004 handoff finding). A fresh worktree needs the gitignored generated `apps/docs/src/data/registry-items.json` present for `pnpm typecheck` — copy or regenerate via `pnpm registry:build`, never commit. Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells; the working shapes are the righthook pre-commit and a clean-env invocation.

### EVIDENCE GATES

1. Prerequisites: the isolated candidate established at the recorded SHA; the seven trunk failures reproduced (RED) with exit codes and failing assertions recorded.
2. Functional RED: the seven preserved selectors against the pre-change candidate, captured in `red.json`. Wait for orchestrator verification.
3. GREEN: the identical seven selectors post-change (each exit 0), the aggregate `pnpm test` exit 0, `pnpm typecheck` exit 0, the scoped Biome command exit 0, and the tracked-file diff boundary verified.
4. Evidence: `run.json` binds candidate source and harness hashes, per-suite exit codes, the aggregate/static-gate exits, and the diff inventory; scratch roots cleaned; the drill's evidence appends left as emitted. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, no oracle weakened, no product-source change, exact scope compliance.

Planned evidence paths: `.tmp/FIX-ORI-SUITE-1/red.json`, `green.json`, `run.json`. Teardown: remove only owned scratch roots; leave the candidate with exactly the seven repairs + harness.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. The locked gate flows, `human-flows.json`, and `gate-plan.json` are unchanged; no flow evidence writes, no journey proofs. The sprint's dark proof rows stay with their owning tasks; this task only unblocks ORI-CI-003/ORI-CI-004's aggregate acceptance.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-CI-002 (completed — approved `3573a23792b17c0fb2815b404aa65dd10815e4d7`, merged `c9bb5cc51c8eb101d04beafec274522633b37535`); the seven suites' owning tasks are all completed (ORI-CI-001, FUSE-01, REF-006, FAM-005, ORI-AST-009, ORI-AST-004).

Blocks: ORI-CI-003 and ORI-CI-004's aggregate `pnpm test` acceptance; indirectly ORI-DEP-002/ORI-DEP-003's publication chain.

Provides: the seven suites green in isolation and in the aggregate; the proof harness; RED/GREEN evidence under `.tmp/FIX-ORI-SUITE-1/`.

Consumes: ORI-CI-002's ordered seven-stage build and duplicate-tutorial bindings pattern; AST-007's landed ledger/table shape; AST-008's per-item destinations; VIS-003's landed search chrome; the living lane selector precedents.

Supersedes: tests/sprint-05-orient-search/single-tutorial-gate.test.ts, tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts, tests/sprint-04-generated-reference/data-table-contract.test.ts, tests/sprint-01-docs-spike-skeleton/ledger.spec.ts, tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts, tests/sprint-05-orient-search/not-found-search-recovery.spec.ts, tests/sprint-05-orient-search/search-contract.spec.ts — the seven existing suites this task deliberately changes, each pinned to the superseded shape in its boundary contract.

References: UC-DOCS-02; UC-SHELL-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave19-add-preexisting-suite-repair` (wave-19, sequence next); source task ORI-VIS-004 (handoff sha256 `4630af86107466e7efb7fb8da0f9454d981e18c8768ac298a683572a2eb7e8f0`, item `ORI-VIS-004:7230130b726b4371c29f6756ac92dd3c4191878e:scope_impact:1`); proposed by ghactions-planner; amended pre-publication 2026-09-25 to add the seventh same-class break (search-contract.spec.ts) under the orchestrator's in-flight authorization.

### OUT OF SCOPE

Any product-source change; repairing `recovery-presentation.spec.ts` (same-class stale selector outside the boundary — report only); the public-origin deployment prerequisite (ORI-DEP-003); ORI-CI-003/ORI-CI-004's own workflow authoring; journey proofs; planning-artifact edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: each of the seven preserved selectors exit 0 in isolation; the aggregate `pnpm test`, `pnpm typecheck`, and the scoped Biome command exit 0; the tracked-file diff is exactly the seven suites + harness + drill appends; `red.json`/`green.json`/`run.json` bind the candidate and harness hashes; no oracle weakened (each retired assertion named and justified as superseded); no product-source change (candidate `apps/**`, `packages/**`, `scripts/**` byte-unchanged); no stub, fake success, skipped project, or lowered assertion. Should verify: the noncanonical variant's bindings are re-pointed rather than added (the stale-binding check would otherwise preempt the gate); the scaffold allowed-set extension names both landing commits; every ledger selector rewrite keeps the data-equality derivation from the generated dataset (never literals). Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
__REQ_JSON__
-->
</details>

## Handoff

```json
{
  "task": "FIX-ORI-SUITE-1",
  "commit_sha": "",
  "done": "",
  "deviations": [],
  "concerns": [],
  "findings": [],
  "scope_impact": [],
  "feedback": []
}
```
