<!-- Version: TASK-TEMPLATE v5.2 · sprint-01-docs-spike-skeleton -->

# FIX-FUSE-08-1: replace body-root oracle in home.spec.ts with an attribute selector (surface policy)

> Status: ✅ Completed
> Commit: 6607c175607d3e38f78f5991788a6133ba7ded83
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX · Wave: A (no dependencies)
> Proposed By: orchestrator (sprint-01 gate re-verification, 2026-09-13)
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-13

## What this does

Replace the one generic-root success oracle in
`tests/sprint-01-docs-spike-skeleton/home.spec.ts` (~line 184):

```ts
expect(await page.locator('body').getAttribute('data-layout')).toBe('home');
```

with an attribute-selected equivalent that keeps (and sharpens) the same fact —
exactly one element carries the home layout marker:

```ts
await expect(page.locator('[data-layout="home"]')).toHaveCount(1);
```

No other assertion, comment, or file changes. The neighboring layout assertions
(`header.site-header` visible, `aside` count 0, `[data-toc]` count 0) already
carry the behavioral half of this test block and must stay byte-identical.

## Why

The sprint-01 human gate is being re-verified with the machine pipeline
(`run_flow.py --all`). The four flows bound to `home.spec.ts` /
`component-page.spec.ts` all pass their real Playwright runs (exit 0, fresh
artifact, cold boot, RED proofs) but fail the surface-entry lint:

```
GENERIC_ROOT_ORACLE: tests/sprint-01-docs-spike-skeleton/home.spec.ts:
selector 'body' is a generic-root success oracle
```

`body`/`html`/`main`/`document`/`*` are banned success-oracle roots by
`.spec/e2e-policy/surface.json` defaults — a `body`-rooted assertion proves the
page rendered, not that the human surface is right. Selecting
`[data-layout="home"]` by attribute asserts the same layout contract on the real
DOM, with a stricter count. This blocks
FLOW-GEND-01-home-hero-evaluation-contract and
FLOW-GEND-02-hero-install-command-copy. Break evidence (fresh, today):
`.tmp/sprint-01-docs-spike-skeleton/e2e-evidence/FLOW-GEND-01-home-hero-evaluation-contract.surface.json`.

## How to verify

```
python3 ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py \
  --test tests/sprint-01-docs-spike-skeleton/home.spec.ts \
  --policy .spec/e2e-policy/surface.json
pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts
```

RED before the fix: the checker exits 1 with the GENERIC_ROOT_ORACLE reason
above (capture it). After the fix: the checker exits 0 and the Playwright file
still passes — the functional behavior never changed, only the oracle's
selector strength.

## Scope

- WRITE-ALLOWED:
  - tests/sprint-01-docs-spike-skeleton/home.spec.ts (MODIFY — one assertion)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- The ONLY change is the one flagged assertion line. Nothing else in the file.
- Do NOT weaken, delete, or skip any assertion. The swap must keep or raise
  oracle strength.
- Do NOT move the locator call out of the assertion to dodge the linter's
  regex — the fix is a better selector, not a rearrangement.
- Do NOT touch `component-page.spec.ts` (owned by FIX-FUSE-07-2, parallel).
- UNIT_TEST_JUSTIFIED: one-line test-oracle tightening over a real local
  docs build; no product I/O.

### DONE WHEN

- Surface checker exits 0 on the file; Playwright file passes; typecheck and
  biome clean; diff is exactly the one line.

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

- AC-1: Surface checker (command above) exits 0 on home.spec.ts with no
  GENERIC_ROOT_ORACLE reason; before the change it exits 1 citing selector
  'body'. RED captured in `.tmp/FIX-FUSE-08-1/cycle-1/red/`, GREEN in
  `cycle-1/green/`.
  `test_tier: integration · verification_service: real Playwright run against locally built docs site + e2e_surface_check`
- AC-2: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts`
  exits 0 (all projects; skipped allowed where the suite already skips).
  `test_tier: integration · verification_service: real Playwright run against locally built docs site`

### TEST CRITERIA

- TC-1: `git diff --name-only` (vs trunk) = exactly home.spec.ts (+ evidence
  lane `.tmp/FIX-FUSE-08-1/**`).
- TC-2: No assertion weakened or removed; the layout-contract assertions in the
  same block are byte-identical.

### READING LIST (max 5)

- tests/sprint-01-docs-spike-skeleton/home.spec.ts (the flagged block, ~line 180)
- .spec/e2e-policy/surface.json (policy)
- ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py (the lint)
- .tmp/sprint-01-docs-spike-skeleton/e2e-evidence/FLOW-GEND-01-home-hero-evaluation-contract.surface.json (break evidence)

### SCOPE (file-level write permissions)

- tests/sprint-01-docs-spike-skeleton/home.spec.ts (MODIFY)
- .tmp/FIX-FUSE-08-1/** (evidence)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `./node_modules/.bin/biome ci tests/sprint-01-docs-spike-skeleton/home.spec.ts`
- test: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts`

### DEPENDENCIES

- Depends on: none
- Blocks: sprint-01 machine gate re-verification (run_flow --all --verdict)
- Parallel: FIX-FUSE-07-2 (disjoint file)
