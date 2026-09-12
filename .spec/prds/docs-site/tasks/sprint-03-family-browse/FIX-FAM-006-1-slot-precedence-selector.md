<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FIX-FAM-006-1: component-page extras spec must tolerate the ledger-filter island between slot and grid

> Status: ✅ Completed
> Commit: 05974bf6d197a5a1eb851562ccf0e38ed2c93d3b
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX · Wave: D (independent — parallel with FAM-006 review)
> Proposed By: orchestrator (FAM-006 implementer blocker #2, 2026-09-12)
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 4eb8599 (all FAM tasks + FIX-FAM-002-1/-003-1/-005-1 landed)

## What this does

Update ONE assertion in `tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`
(FAM-003-family-grid-extras, lines ~335-340): the mount-slot precedence check
`page.locator('main div.family-grid-slot + section').count() === 1` becomes a
general-sibling precedence check `page.locator('main div.family-grid-slot ~ section').count()`
=== the derived all-component families count (7), with the comment updated to state that the
rnr-ledger-filter island lawfully mounts between the slot and the grid (FAM-004's ruled,
contract-locked position).

## Why

FAM-004 landed the rnr-ledger-filter island mounted immediately AFTER FAM-003's empty slot div
and BEFORE the first section — the position its cycle-1 review ruled correct (PRD
07-ui-infrastructure.md governs the filter row as sitting above the grid; FAM-004's own
contract lane pins slot < island < first-section). The extras spec's ADJACENT-sibling selector
(`slot + section`) therefore matches 0 on the landed DOM, and `pnpm e2e:docs`
(SPRINT.md gate step 1) is red at component-page.spec.ts:336 (FAM-006 implementer evidence;
blocked FLOW-DELIV-01 ci-chain-order). The spec's INTENT — "the mount slot sits above the
grid, structural only" — is preserved and strengthened by asserting the slot precedes EVERY
family section, which is robust to the island's lawful presence and would also catch the slot
being moved below the grid.

Failing evidence: FAM-006's blocker report (red on base 83090e5 + FAM-006 branch);
`pnpm exec playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FAM-003-family-grid-extras` reproduces on current main.

## How to verify

```
CI=true pnpm exec playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
```

All tests in the file pass (12/12). RED before the fix: the extras test fails at the
`slot + section` assertion with count 0-vs-1.

## Scope

- WRITE-ALLOWED:
  - tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- ONLY the mount-slot precedence assertion (the `slot + section` expect block, lines ~336-340)
  and its comment may change. Every other assertion in the file stays byte-identical.
- The replacement must be STRONGER or equal: `~ section` count === the dataset-derived family
  count (derive it the way the file already derives `components`/families — no typed literal 7
  unless the file already pins one in scope; if it derives, you derive).
- Do NOT touch the island, the slot div, index.astro, or any product source. The landed DOM is
  correct (two review-approved tasks put it there); the spec selector is what moved out of date.
- Do NOT weaken the other two slot assertions (exactly-one-slot, zero-children).
- UNIT_TEST_JUSTIFIED: one selector in one spec over the real built page; no product I/O.

### DONE WHEN

- The verify command exits 0 with every test in the file passing.
- RED evidence shows the extras test failing on the old selector before the change.
- `pnpm typecheck` and `./node_modules/.bin/biome ci <file>` exit 0.
- A full `pnpm vitest run` sweep stays green (this file is playwright-only, but the sweep proves
  no cross-lane surprise).

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

- AC-1: On current main, the FAM-003-family-grid-extras test passes with the slot-precedence
  assertion expressed as `main div.family-grid-slot ~ section` matching the derived family
  count, and the whole spec file passes under the verify command.
  `test_tier: e2e · verification_service: real docs build + playwright (chromium-desktop)`

### TEST CRITERIA

- TC-1: `git diff --name-only` = exactly component-page.spec.ts (+ evidence lane); the diff
  touches only the precedence assertion + comment.
- TC-2: The new assertion is derived from the dataset, not a typed literal, and is not weaker
  than the one it replaces.

### READING LIST (max 5)

- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (lines 320-345, the extras test)
- tests/sprint-03-family-browse/ledger-filter-island.spec.ts (the contract-locked
  slot < island < first-section position this FIX accommodates)
- .spec/prds/docs-site/tasks/sprint-03-family-browse/FAM-004-ledger-filter-island.md (AMEND-1 ruling)

### SCOPE (file-level write permissions)

- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY)
- .tmp/FIX-FAM-006-1/** (evidence)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `./node_modules/.bin/biome ci tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`
- test: `CI=true pnpm exec playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`

### DEPENDENCIES

- Depends on: FAM-003, FAM-004 (both landed — the DOM this asserts is on current main)
- Blocks: [] · Parallel: FAM-006 review/merge (disjoint files)

### CODING STANDARDS

Match the file's `expect(locator.count(), 'reason').toBe(n)` voice and comment style.
