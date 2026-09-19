# FUSE-09 verification evidence

Task: FUSE-09 CopyButton island (1/5) with zero-JS selectable-text fallback.

## What was verified (real services, cycle 1)

- AC-1, CASE 1 — real Astro build (`pnpm --filter @rnr-ai-elements/docs build`,
  exit 0), real `astro preview` at http://localhost:4321 (secure context),
  real Chromium 136 (playwright 1.52.0 library) with
  `grantPermissions(['clipboard-read','clipboard-write'])`. One click placed
  exactly `npx @react-native-reusables/cli@latest add
  https://rnraielements.com/r/nativewind/conversation.json` (99 chars, no
  trailing newline) on the real clipboard; `data-state="copied"` observed
  96 ms after the click (bound: 500 ms). Screenshot: `green/copy-success.png`.
- AC-1, CASE 2 — fresh context with `javaScriptEnabled: false`: HTTP 200 and
  `rnr-copy-button code` textContent equal to the exact command (selectable,
  crawlable, JS-free).
- AC-2 — `pnpm vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
  -t "FUSE-09-island-budget"`: exactly one `customElements.define`
  ('rnr-copy-button', in `apps/docs/src/scripts/copy-button.ts`), zero
  client-framework imports under `apps/docs/src`.
- Gates — `pnpm typecheck` exit 0; `./node_modules/.bin/biome ci` exit 0 on all
  touched paths (Gate 2 command plus the two remaining spec files).

## RED evidence (`red/`)

- `island-budget.test.out` — vitest FAIL before the island existed (0 define
  sites found).
- `ac1-driver.out` — AC-1 driver FAIL before the island existed (no
  `rnr-copy-button code` element; route absent from the FUSE-01 dist).
- `runner-hang-repo-testdir.out` (0 bytes — hung) vs
  `runner-works-same-spec-in-tmp.out` — with @playwright/test **1.52.0**, the
  `playwright test` runner deadlocked discovering test files anywhere inside
  this repo; the identical spec listed instantly when the testDir was outside
  the repo. Reproduced minimal (trivial spec, JS config), unaffected by
  `env -i`, removing NODE_OPTIONS, disabling the Bash sandbox, `--workers=1`,
  or `--list` mode.

  **CORRECTION (post-review, 2026-09-10)**: the hang is version-specific, not
  a repo property. Upgrading the same runner install to **1.63.0** and re-running
  the exact same in-repo repro completes instantly
  (`post-review/fuse09-v163.out`), and the landed FUSE-10 config on main lists
  6 tests in-repo in seconds (`post-review/fuse10-list-main.out`, via
  `pnpm exec playwright test --list` after `pnpm install` on the main
  checkout). The landed FUSE-10 runner is unaffected; this cycle's AC-1
  behavioral evidence below was captured on 1.52 through the library API and
  remains valid for the behavior it asserts (real Chromium, real clipboard,
  real preview server).

Because of the runner deadlock above, AC-1's assertions were executed through
the Playwright LIBRARY API (same real Chromium, same permissions, same
selectors, same 500 ms bound) by `../ac1-driver.mjs`:

```
pnpm --filter @rnr-ai-elements/docs build
pnpm --filter @rnr-ai-elements/docs exec astro preview   # serves :4321
node .tmp/FUSE-09/ac1-driver.mjs http://localhost:4321 .tmp/FUSE-09/cycle-N/green/copy-success.png
```

`tests/sprint-01-docs-spike-skeleton/home.spec.ts` and `copy-button.spec.ts`
remain the canonical runner artifacts (grep tokens FLOW-GEND-02-hero-install-
command-copy, FUSE-09 TC-1, FUSE-09 TC-2). They import `@playwright/test`,
which is not yet a repo dependency — FUSE-10 owns `playwright.config.ts` and
the root `package.json` entry. `pnpm typecheck` resolves their imports here
via a local, uncommitted runner install at `.tmp/fuse09-runner/` symlinked
into `node_modules/` (node_modules is gitignored; the shim is not part of the
commit). Until FUSE-10 lands the dependency, run the specs through a local
runner install with testDir scoped OUTSIDE the repo crawl problem.

## Port note

A stale `astro preview` daemon from the merged FUSE-01 worktree held port
4321 and was stopped (restartable; its worktree is merged). All runs here
used the contracted port 4321.
