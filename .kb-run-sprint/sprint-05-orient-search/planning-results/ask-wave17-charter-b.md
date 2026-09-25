
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
__SCENARIO_2__
```

### TEST CRITERIA

- TC-1 → AC-1: The harness's real build, real Pagefind run, and real built preview prove the route 200 + h1 + pinned honest sentence + index page_count exactly RED + 1, with the pre-change 404 and both counts recorded in red.json. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts`
- TC-2 → AC-2: The harness's served-HTML inspection proves the honest framing and the zero registry-command occurrences over the real matrix facts; the static gates pass; the tracked-file diff is exactly the new page plus the harness. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts`

### SHARED FIXTURES

```json
__FIXTURE_JSON__
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
__CONTRACT_JSON__
-->
</details>
