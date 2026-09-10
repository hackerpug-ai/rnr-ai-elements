# FIX-FUSE-07-1 — evidence (cycle 1)

Scope of change: `tests/sprint-01-docs-spike-skeleton/component-page.spec.ts:164`
only — `page.locator('main')` → `page.locator('main.component-page')`.

`main.component-page` is the container that already exists in the generated
markup (`apps/docs/src/pages/components/[item].astro:60`) and wraps exactly the
item's real content region: header (title, description, chips) + install
section + source section + family pager. The must-not-match regexes are
unchanged and are still asserted over that full content region. `expect()` count
49 before → 49 after; FLOW-GEND-14/15 titles unchanged.

## RED (before fix) — `red/`

```
python3 ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py \
  --test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts \
  --emit .tmp/FIX-FUSE-07-1/cycle-1/red/surface.json --governed \
  --policy .spec/e2e-policy/surface.json
GENERIC_ROOT_ORACLE: ...selector 'main' is a generic-root success oracle
exit=1
```

## GREEN (after fix) — `green/`

- `lint-trunk-policy.txt` / `surface-trunk-policy.json`: same command with the
  trunk (post-5eed561) policy → `surface_ok=true`, **exit=0**. This is AC-1:
  the merge pairs this spec change with trunk's extended docs-lane policy.
- `lint-worktree-policy.txt` / `surface-worktree-policy.json`: same command with
  this worktree's checked-out policy → GENERIC_ROOT_ORACLE gone; the two
  remaining reasons (SURFACE_DRIVER_MISSING / PRODUCT_TARGET_MISSING) are
  policy-version artifacts only — this worktree's base predates trunk commit
  `5eed561`, which extended `.spec/e2e-policy/surface.json` with the docs-lane
  driver/target patterns. That policy file is outside this task's
  writeAllowed, so it is verified against trunk's copy rather than edited.
- `e2e-flow-gend.log`: `pnpm e2e:docs --grep FLOW-GEND` → **exit=0**, 34 passed
  / 5 skipped / 0 failed. junit: component-page.spec.ts 3 tests × 3 projects
  (chromium-desktop / mobile / nojs), 0 failures, 0 skipped. The 5 skips are
  pre-existing clipboard-JS tests in home.spec.ts / ledger.spec.ts under nojs.
- `typecheck.log`: `pnpm typecheck` → exit=0.
- `biome.log`: `biome ci tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`
  → exit=0.

Port 4321 was wait-polled free before the lane (1 poll, nothing killed). All
lane steps ran sequentially in this worktree.
