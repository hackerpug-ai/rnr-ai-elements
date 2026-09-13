<!-- Version: TASK-TEMPLATE v5.2 · sprint-01-docs-spike-skeleton -->

# FIX-FUSE-07-2: replace universal-selector oracle in component-page.spec.ts with a direct child count (surface policy)

> Status: ✅ Completed
> Commit: 2eee5c0d755ef66705fcfaa339ab9f382e45d8a0
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX · Wave: A (no dependencies)
> Proposed By: orchestrator (sprint-01 gate re-verification, 2026-09-13)
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-13

## What this does

Replace the one generic-root success oracle in
`tests/sprint-01-docs-spike-skeleton/component-page.spec.ts` (~line 335):

```ts
expect(await slot.locator('*').count(), '0 stub-UI children in the slot').toBe(0);
```

with the direct-child form of the same structural contract — the mount slot is
an empty plain div, so zero element children:

```ts
expect(await slot.evaluate((el) => el.children.length), 'empty structural slot — zero element children').toBe(0);
```

No other assertion, comment, or file changes. Zero children implies zero
descendants, so the swap is logically equivalent to (and more directly states)
the "exactly one empty plain div, never stub UI" contract in the comment above
it, which must stay byte-identical.

## Why

The sprint-01 human gate is being re-verified with the machine pipeline
(`run_flow.py --all`). Flows bound to `component-page.spec.ts` pass their real
Playwright runs (exit 0, fresh artifact, cold boot, RED proofs) but fail the
surface-entry lint:

```
GENERIC_ROOT_ORACLE: tests/sprint-01-docs-spike-skeleton/component-page.spec.ts:
selector '*' is a generic-root success oracle
```

`*` is a banned success-oracle root by `.spec/e2e-policy/surface.json` defaults.
The oracle's strength here comes from the exact zero count, and the direct
child count names the ruled structural fact without a universal selector. This
blocks FLOW-GEND-14-reference-page-anatomy and
FLOW-GEND-15-family-pager-stays-in-family. Break evidence (fresh, today):
`.tmp/sprint-01-docs-spike-skeleton/e2e-evidence/FLOW-GEND-14-reference-page-anatomy.surface.json`.

## How to verify

```
python3 ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py \
  --test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts \
  --policy .spec/e2e-policy/surface.json
pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
```

RED before the fix: the checker exits 1 with the GENERIC_ROOT_ORACLE reason
above (capture it). After the fix: the checker exits 0 and the Playwright file
still passes — the functional behavior never changed, only the oracle's
selector form.

## Scope

- WRITE-ALLOWED:
  - tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY — one assertion)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- The ONLY change is the one flagged assertion line. Nothing else in the file.
- Do NOT weaken, delete, or skip any assertion. The swap must keep or raise
  oracle strength (zero children ⇔ zero descendants; do not drop the count
  assertion for a vaguer check).
- Do NOT rearrange code to dodge the linter's regex — the fix is a better
  oracle form, not a relocation.
- Do NOT touch `home.spec.ts` (owned by FIX-FUSE-08-1, parallel).
- UNIT_TEST_JUSTIFIED: one-line test-oracle tightening over a real local
  docs build; no product I/O.

### DONE WHEN

- Surface checker exits 0 on the file; Playwright file passes; typecheck and
  biome clean; diff is exactly the one line.

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

- AC-1: Surface checker (command above) exits 0 on component-page.spec.ts with
  no GENERIC_ROOT_ORACLE reason; before the change it exits 1 citing selector
  '*'. RED captured in `.tmp/FIX-FUSE-07-2/cycle-1/red/`, GREEN in
  `cycle-1/green/`.
  `test_tier: integration · verification_service: real Playwright run against locally built docs site + e2e_surface_check`
- AC-2: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`
  exits 0 (all projects; skipped allowed where the suite already skips).
  `test_tier: integration · verification_service: real Playwright run against locally built docs site`

### TEST CRITERIA

- TC-1: `git diff --name-only` (vs trunk) = exactly component-page.spec.ts
  (+ evidence lane `.tmp/FIX-FUSE-07-2/**`).
- TC-2: No assertion weakened or removed; the mount-slot comment and sibling
  assertions are byte-identical.

### READING LIST (max 5)

- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (the flagged block, ~line 325)
- .spec/e2e-policy/surface.json (policy)
- ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py (the lint)
- .tmp/sprint-01-docs-spike-skeleton/e2e-evidence/FLOW-GEND-14-reference-page-anatomy.surface.json (break evidence)

### SCOPE (file-level write permissions)

- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY)
- .tmp/FIX-FUSE-07-2/** (evidence)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `./node_modules/.bin/biome ci tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`
- test: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`

### DEPENDENCIES

- Depends on: none
- Blocks: sprint-01 machine gate re-verification (run_flow --all --verdict)
- Parallel: FIX-FUSE-08-1 (disjoint file)
