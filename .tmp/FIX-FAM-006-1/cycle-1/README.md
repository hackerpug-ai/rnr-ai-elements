# FIX-FAM-006-1 — cycle 1 evidence

Scope: `tests/sprint-01-docs-spike-skeleton/component-page.spec.ts` — one assertion
(`slot + section` → `slot ~ section`, `.toBe(1)` → `.toBe(componentFamilies.length)`)
plus its comment. No other line touched.

## red/

- `playwright-red.txt` — unmodified spec, `CI=true playwright test --grep FAM-003-family-grid-extras --project=chromium-desktop`.
  FAILS at line 336: `slot + section` count 0 vs 1 (exit 1). Matches the task's predicted RED exactly.

## green/

- `playwright-green.txt` — first full-file run after the fix: extras test PASSES; 11/12,
  exit 1 from a 30s locator timeout in `FLOW-GEND-15` pager test (untouched spec) during
  machine load ~117 (30+ concurrent sibling worktrees). Page snapshot in the error context
  shows the pager fully rendered — starvation, not DOM.
- `playwright-green-run2.txt` — re-run, same command: **12/12 passed, exit 0 in 47s**. Confirms
  the single failure was load.
- `vitest-sweep.txt` — full `pnpm vitest run`: 679/680, one failure —
  `ci-chain-order.test.ts` line 72 (`pnpm e2e:docs exited 1`). The embedded child log shows the
  full 126-test lane ran with the fix; FAM-003-family-grid-extras PASSED in it (items 4/126
  chromium-desktop, 46/126 chromium-mobile). The lane exit 1 came from two locator-timeout
  flakes in untouched sibling-lane specs under load ~130-160:
  `item-install-copy.spec.ts:297` (240s, chromium-mobile) and
  `verdict-badge-wiring.spec.ts:69` (30s, chromium-mobile).
- `vitest-ci-chain-rerun.txt` — re-run of `ci-chain-order.test.ts` alone: **3/3 passed, exit 0** —
  rebuilds and re-runs the full 126-test lane twice with the fix. The sweep-1 failure does not
  reproduce; it was transient sibling-load timeouts.
- `vitest-full-sweep-2.txt` — full `pnpm vitest run` re-sweep: **680/680 tests, 62/62 files,
  exit 0**.

## Gates

- `pnpm typecheck` exit 0.
- `./node_modules/.bin/biome ci tests/sprint-01-docs-spike-skeleton/component-page.spec.ts` exit 0.
