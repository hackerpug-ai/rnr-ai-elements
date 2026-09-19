<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FIX-FAM-005-1: re-pin page-contract's FLOW-GEND-14 sha256 after FAM-005's mandated expo-chip edit

> Status: ✅ Completed
> Commit: c405110e90585d4b059ae9acc2868d56f4261561
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX · Wave: C (after FAM-005 merge — the new hash exists only on its branch)
> Proposed By: orchestrator (FAM-005 implementer blocker, 2026-09-12)
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 8dd3e41+ (FAM-001/002/003, FIX-FAM-002-1/-003-1 landed)

## What this does

Update the sha256 pin in `tests/sprint-03-family-browse/page-contract.test.ts` (~lines 98-100,
FAM-003's `FAM-003-supersede-contract` test) from the pre-FAM-005 hash
`c62714b4f45293df2dd2ee2d323ad07ac87903e64ea60b1cd6d59c8240839817` to the post-FAM-005 hash of
the same FLOW-GEND-14 body region of `tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`
(`ab81c00bf80919a236f48165c35c10f6e23d8b08ac081ebf02ae76054d4e4e45` per FAM-005's evidence —
RECOMPUTE it yourself from the landed file; do not trust either number).

## Why

FAM-005's AC-5 mandates editing the expo-chip expectation inside `component-page.spec.ts` — the
exact region FAM-003's page-contract test sha256-pins to prove the GEND-14 sibling stayed
byte-identical. The pin therefore MUST move with the mandated edit; that is the pin working as
designed (it proves only the GEND-14 assertions are untouched, and they are — FAM-005 changed the
expo-chip expectation, a different region line). FAM-005's own writeAllowed excludes
page-contract.test.ts, so this FIX owns the one-line re-pin. Evidence of the break:
`.tmp/FAM-005/cycle-1/green/page-contract-KNOWN-CONFLICT.log` (expected c62714b4…, received
ab81c00b…).

## How to verify

```
pnpm vitest run tests/sprint-03-family-browse/page-contract.test.ts
```

Exits 0 (both tests). RED before the fix: the same command exits 1 on
`FAM-003-supersede-contract` with the pin mismatch. The recomputed hash in your diff must equal
the received value from the red log.

## Scope

- WRITE-ALLOWED:
  - tests/sprint-03-family-browse/page-contract.test.ts (MODIFY)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- The ONLY change is the pinned hash literal (plus, if the test labels it, the pin's comment
  describing what region/version it pins). No other line, no other file.
- Recompute the hash from the landed `component-page.spec.ts` region exactly the way the test
  computes it — do not paste the blocker's number without reproducing it.
- Do NOT edit `component-page.spec.ts` or anything else. If the pin still fails after the re-pin,
  that is a FINDING (the GEND-14 region changed when it must not) — report it, stop.
- UNIT_TEST_JUSTIFIED: one-line test-fixture re-pin over a real local build; no product I/O.

### DONE WHEN

- Verify command exits 0; the diff is exactly the hash literal.
- `pnpm typecheck` and `./node_modules/.bin/biome ci <file>` exit 0.

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

- AC-1: `pnpm vitest run tests/sprint-03-family-browse/page-contract.test.ts` exits 0 with the
  re-pinned hash equal to the sha256 of the landed GEND-14 region of component-page.spec.ts,
  recomputed independently by implementer and reviewer.
  `test_tier: unit · verification_service: real local docs build + vitest + node crypto`

### TEST CRITERIA

- TC-1: `git diff --name-only` = exactly page-contract.test.ts (+ evidence lane).
- TC-2: No assertion weakened or removed; the pin still guards the GEND-14 region.

### READING LIST (max 5)

- tests/sprint-03-family-browse/page-contract.test.ts (the pin and its hash computation)
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (the pinned region)
- .tmp/FAM-005/cycle-1/green/page-contract-KNOWN-CONFLICT.log (the break evidence)

### SCOPE (file-level write permissions)

- tests/sprint-03-family-browse/page-contract.test.ts (MODIFY)
- .tmp/FIX-FAM-005-1/** (evidence)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `./node_modules/.bin/biome ci tests/sprint-03-family-browse/page-contract.test.ts`
- test: `pnpm vitest run tests/sprint-03-family-browse/page-contract.test.ts`

### DEPENDENCIES

- Depends on: FAM-005 (merge — the new spec content must be on the branch this runs against)
- Blocks: [] · Parallel: FAM-004, FAM-006 (disjoint files)

### CODING STANDARDS

Keep the pin's comment style; note the re-pin reason and FAM-005 in one line if a comment exists.
