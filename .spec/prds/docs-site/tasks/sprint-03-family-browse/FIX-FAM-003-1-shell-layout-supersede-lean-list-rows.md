<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FIX-FAM-003-1: shell-layout sprint01-contracts test must assert the card-grid shape, not the superseded lean-list

> Status: ✅ Completed
> Commit: a213c4138020fa21e5d19218cd60011a859149a6
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX · Wave: C (independent — dispatch alongside FAM-004/FAM-005)
> Proposed By: orchestrator (FAM-003 implementer residual #2, 2026-09-12)
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 5b1f520 (FAM-001/002, FIX-FAM-002-1 landed)

## What this does

Update the `/components` block of the `SHELL-002-sprint01-contracts-preserved` test in
`tests/sprint-02-shell-hero/shell-layout.test.ts` (~lines 341-358) so it asserts the
FAM-003 card-grid contract instead of the superseded FUSE-07 lean-list shape.

## Why

FAM-003 replaced `/components`' two-column `<ul>` lean list (56 `<li>` rows: 39 plain links +
17 spans; 9 anchored sections = 7 component families + ui + lib) with the seven-family card
grid (39 `a[data-card]` cards in 7 anchored sections — all-component families only).
The test still asserts the old shape and now fails: `sectionsWithId` expects `families.length`
(9 — ui and lib are in families.json), got 7; `liRows` expects `totalListedNames` (56),
got 39; `liAnchoredRows` expects `componentNames` (39), got 0-style counts. The file is in
FAM-003's writeProhibited set, so FAM-003 could not touch it — this FIX owns the supersede.
The sprint gate (SPRINT.md deliverable 1) requires all sprint-02 lanes green, so this must land.

Assertions to REPLACE (the `/components` block, ~341-358) with the card-grid equivalents, all
derived from the same dataset (families.json + registry-items.json, shell-layout.test.ts:336-338):
- anchored sections: derive the all-component families count
  (`families.filter(f => f.itemNames.every(n => component name set has n)).length` = 7) and
  assert `sectionsWithId` equals it — replacing `=== families.length` (9). Keep a `>= 7` floor
  if you prefer belt-and-suspenders, but the exact derived equality is the primary assertion.
- cards: count of `a[data-card]` in `componentsHtml` === `componentNames` (39).
- card hrefs: distinct `href="/components/{item}"` values on `a[data-card]` === `componentNames`
  (each registry:component name appears exactly once).
- Rename the test title's "ul li rows" phrasing to the card grid so the test name no longer lies
  about what it asserts.

Still-true assertions to KEEP unchanged:
- The `/registry` ledger block (table + derived row count) — FAM-005 touches ledger rows later,
  but nothing in this FIX's scope changes the ledger's shape today.
- The dataset oracle style: constants derive from the dataset files, never typed literals.

## How to verify

```
pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts
```

Exits 0 with all tests passing (the beforeAll does the real ordered chain + docs build;
~900s timeout is already set). RED before the fix: the same command exits 1 on
`SHELL-002-sprint01-contracts-preserved` with the 56-vs-39 li-rows diff.

## Scope

- WRITE-ALLOWED:
  - tests/sprint-02-shell-hero/shell-layout.test.ts (MODIFY)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- ONLY the `/components` block of `SHELL-002-sprint01-contracts-preserved` (~lines 341-358) and
  that test's title string may change, plus nothing else in the file. Every other test and
  helper stays byte-identical.
- Do not weaken: no `>=` loosening, no assertion deletion, no skip guards. The replacements must
  assert the SAME rigor (exact counts derived from the dataset).
- Do not touch `src/pages/components/index.astro`, ComponentCard, SectionHeader, or any product
  source. If the built page does not satisfy the new assertions, that is a FINDING (report it),
  not a page change — FAM-003's green evidence says it will.
- UNIT_TEST_JUSTIFIED: single vitest file over a real local build — no integration surface beyond
  the build it already performs.

### DONE WHEN

- The verify command exits 0 with every test in the file passing against the current main.
- RED evidence shows the lean-list assertions failing before the change.
- `pnpm typecheck` and `./node_modules/.bin/biome ci <file>` exit 0.

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

- AC-1: `pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts` exits 0; the
  sprint01-contracts test now asserts 7 anchored sections + 39 `a[data-card]` cards with 39
  distinct /components/{item} hrefs, all counts derived from families.json + registry-items.json.
  `test_tier: unit · verification_service: real local docs build + vitest`

### TEST CRITERIA

- TC-1: No weakened or deleted assertions anywhere in the file; `git diff` shows only the
  /components block + title string.
- TC-2: No typed literal counts — every expected value derives from the dataset files.

### READING LIST (max 5)

- tests/sprint-02-shell-hero/shell-layout.test.ts (lines 320-360 for the target test, 130-160
  for the beforeAll build chain, 336-338 for the dataset oracle)
- .spec/prds/docs-site/tasks/sprint-03-family-browse/FAM-003-components-seven-family-card-grid.md
  (the grid contract being asserted)
- tests/sprint-03-family-browse/components-family-grid.spec.ts (the browser-side oracle for the
  same contract — mirror its expectations, not its playwright mechanics)

### SCOPE (file-level write permissions)

- tests/sprint-02-shell-hero/shell-layout.test.ts (MODIFY)
- .tmp/FIX-FAM-003-1/** (evidence)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `./node_modules/.bin/biome ci tests/sprint-02-shell-hero/shell-layout.test.ts`
- test: `pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts`

### DEPENDENCIES

- Depends on: FAM-003 (the grid must exist on the branch this test runs against — it does on
  current main once FAM-003 merges; if dispatched before that merge, base this task's worktree
  on the FAM-003 branch tip 83b7d69 or land after the FAM-003 merge, whichever the orchestrator
  sequences)
- Blocks: [] · Parallel: FAM-004, FAM-005, FAM-006 (disjoint files)

### CODING STANDARDS

Match the file's voice: `expect(x, 'reason').toBe(...)`, dataset-derived constants with the same
comment style as lines 336-338.
