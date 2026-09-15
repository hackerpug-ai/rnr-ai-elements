<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search · orchestrator-authored follow-up 2026-09-14 -->

# FIX-ORI-AST-008-1: relax REF-009 TC-8 commit-identity so later [item].astro edits stop breaking the re-pin contract

> Status: Backlog
> Assignee: astro-implementer (implementer) · ghactions-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX · Wave: C (after ORI-AST-008 merge)
> Proposed By: orchestrator (ORI-AST-008 reviewer out-of-scope finding, cycle 1 + cycle 2, 2026-09-14)
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Repo: rnr-ai-elements
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-14
> AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=ghactions-reviewer

## What this does

Re-pin the REF-009 TC-8 "re-pins share the page commit" clause in
`tests/sprint-04-generated-reference/item-page-contract.test.ts` (~lines 337-350) so it no
longer requires `apps/docs/src/pages/components/[item].astro` to share a last-commit hash with
the sprint-04 re-pin paths. The two non-lane re-pin files still must share ONE commit
(`specCommit === contractCommit`); the lane file's own last-commit is self-referential and
moves on every lane edit, so it cannot join a stable shared-commit invariant. The `[item].astro`
clause becomes a non-empty committed-SHA existence check only.

## Why

ORI-AST-008 legitimately (and in-scope) edited `apps/docs/src/pages/components/[item].astro` —
its last commit moved from `b70a5c454a029a2b7c01b7af5539f9cecbcf0036` to
`f05d82c86de19891b3b2b5920d3f5831d06dd5b1` — while the three re-pin files
(`tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`,
`tests/sprint-03-family-browse/page-contract.test.ts`, and the lane file itself) stayed at
`b70a5c4`. The clause at lines 346-350 asserts
`[specCommit, contractCommit, laneCommit] === [pageCommit, pageCommit, pageCommit]`, so it now
fails on any candidate where a later task edits `[item].astro` alone. The reviewer confirmed:
candidate → 1 failed / 3 passed; `main` → 4 passed; the sha256 body pins at lines 320-327 still
pass — only the commit-identity clause broke. That assertion is a sprint-04 re-pin artifact, not
a property any later `[item].astro` task can preserve, and the failing file is outside every
sprint-05 task's write_allowed — hence this FIX.

## How to verify

```
pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts
```

Exits 0 (4/4 passed) on the candidate. RED before the fix: the same command exits 1 on the
commit-identity assertion (`the re-pins share the page commit`). The two non-lane re-pin files
must still assert one shared commit; only the `[item].astro` equality is relaxed.

## Scope

- WRITE-ALLOWED:
  - tests/sprint-04-generated-reference/item-page-contract.test.ts (MODIFY)
  - tests/sprint-05-orient-search/evidence/FIX-ORI-AST-008-1/** (evidence — RED/GREEN + mutation proof)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- The ONLY change is the commit-identity clause (~lines 337-350). Keep
  `expect(pageCommit, 'the page change is committed').not.toBe('')` byte-identical; replace ONLY
  the `.toEqual([pageCommit, pageCommit, pageCommit])` equality with an assertion that the two
  non-lane re-pin files share one commit (`expect(specCommit, 'the two re-pin files share one commit').toBe(contractCommit)`),
  and update the surrounding comment to state the new intent.
- Extend-never-delete: no other assertion in the file may be weakened, reworded to a weaker form,
  or deleted. The sha256 body pins (lines 320-327), the anatomy/region assertions (TC-1..TC-7),
  and every other expect stay byte-for-byte.
- The two non-lane re-pin files MUST still share one commit (`specCommit === contractCommit`) — that
  is the invariant that caught the real sprint-04 split-re-pin defect, and relaxing it to a no-op
  is a defect. The lane file's own last-commit is self-referential and must NOT be part of the
  invariant (it moves on every lane edit by construction).
- Do NOT edit `apps/docs/src/pages/components/[item].astro`, the three re-pin files, or any other
  file. This FIX touches only the test file's TC-8 clause plus its evidence dir.
- Recompute nothing that is already green: the sha256 pins at 320-327 are correct on `main` and on
  the candidate — do not re-pin them.

### DONE WHEN

- AC 1: the relaxed clause passes on the candidate (`pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts` exits 0, 4/4).
- AC 2: re-introducing the old equality in a scratch copy makes the suite fail (1 failed naming `the re-pins share the page commit`), and the tree restores byte-exact afterward.
- `pnpm typecheck` clean + `pnpm exec biome ci tests/sprint-04-generated-reference/item-page-contract.test.ts` clean.
- Only SCOPE files modified (`git diff --name-only`).

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: the relaxed clause passes on the candidate and keeps the re-pin invariant**

  GIVEN the merged candidate (ORI-AST-008's `[item].astro` edit at `f05d82c`, the two non-lane re-pin files at `b70a5c4`) WHEN
  `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts` runs THEN it exits 0 (4/4 passed):
  `pageCommit` is a non-empty committed SHA (existence check retained), `specCommit === contractCommit` (the two non-lane
  re-pin files share one commit — the lane file's last-commit is self-referential via `git log -1` on itself, so it moves on
  every lane edit and cannot join the invariant), and every other assertion (anatomy regions, sha256 pins, no-clipping,
  seams, qr, pager) is byte-identical to the pre-fix file.

  FLOW_REF: None · TEST_TIER: unit · verification_service: real local `git log` + vitest
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts`
  TEST_FILE: tests/sprint-04-generated-reference/item-page-contract.test.ts · TEST_FUNCTION: REF-009-spec-repins (existing suite, relaxed clause)

**AC-2: regression control — the old equality still fails, proving the relaxation is load-bearing**

  GIVEN the fixed file WHEN a scratch copy temporarily restores the OLD `.toEqual([pageCommit, pageCommit, pageCommit])`
  equality (or reverts the relaxation) THEN `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts`
  against that copy exits 1 naming `the re-pins share the page commit`, and the working tree is byte-exact restored afterward
  (sha256 before === sha256 after). Evidence of the failed mutation run is saved under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-AST-008-1/`.

  FLOW_REF: None · TEST_TIER: unit · verification_service: real local `git log` + vitest (mutation drill)
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts` (must be green after restore)
  TEST_FILE: tests/sprint-04-generated-reference/item-page-contract.test.ts · TEST_FUNCTION: REF-009-spec-repins (mutation drill documented in evidence)

### TEST CRITERIA

- TC-1 → AC-1: `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts` exits 0 (4/4 passed) on the candidate; the diff touches only the TC-8 clause (+ comment) and evidence.
- TC-2 → AC-1: `git diff` on the test file shows the `specCommit === contractCommit` assertion and the retained `pageCommit ... not.toBe('')`; the sha256 pins at lines 320-327 are unchanged.
- TC-3 → AC-2: the mutation run (old equality restored in a scratch copy) exits 1 naming `the re-pins share the page commit`; evidence saved under `tests/sprint-05-orient-search/evidence/FIX-ORI-AST-008-1/`.

### SCOPE (file-level write permissions)

- tests/sprint-04-generated-reference/item-page-contract.test.ts (MODIFY)
- tests/sprint-05-orient-search/evidence/FIX-ORI-AST-008-1/** (evidence)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `pnpm exec biome ci tests/sprint-04-generated-reference/item-page-contract.test.ts`
- test: `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts`

### DEPENDENCIES

- Depends on: ORI-AST-008 (merge — the `[item].astro` edit that moved its last-commit off the re-pin trio must be on the branch)
- Blocks: [] · Parallel: none (single test file, single lane)

### READING LIST (max 5)

- tests/sprint-04-generated-reference/item-page-contract.test.ts:316-351 (the TC-8 sha256 pins + the failing commit-identity clause)
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (a re-pin path)
- tests/sprint-03-family-browse/page-contract.test.ts (a re-pin path)
- .kb-run-sprint/sprint-05-orient-search/ORI-AST-008/cycle-2.verdict.json (the finding: OUT-OF-SCOPE REF-009 TC-8, fix_location)

### CODING STANDARDS

Keep the clause's comment style; in one line state that the two non-lane re-pin files share one commit and that later `[item].astro` edits move the page commit independently.

## Amendments

- Cycle-2 remediation: AC-1 invariant reduced to `specCommit === contractCommit` per ghactions-reviewer cycle-1 finding (lane-file self-reference).
