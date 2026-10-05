# FIX-SHELL-15-16 — `[data-search-slot]` dual-button strict-mode failures

Date: 2026-10-05 · Worktree branch: `kb-run-sprint/sprint-05-orient-search/FIX-SHELL-15-16` (off main `37c2a5e6`)

## Ruling: SPEC DRIFT (product renders correctly)

The built page is correct. `[data-search-slot]` legitimately hosts two buttons since
ORI-VIS-003: the visible Search trigger, and the native `method="dialog"` close button
inside the (closed) `<dialog>` panel. The whole `<rnr-search-dialog>` island relocates
into the slot by design (`search-dialog.ts` `connectedCallback`), so the close button
must live inside the slot's subtree.

### Introducing commit

`90cbe643` — `task(ORI-VIS-003): cycle 1 — 8/8 green search presentation over the AST-004 dialog`
(2026-09-25). It added `<form method="dialog">` with `button.search-dialog__close` to
`apps/docs/src/components/islands/SearchDialog.astro`. The original dialog (`b2560ce3`,
ORI-AST-004) had zero `data-search-close` occurrences. FLOW-SHELL-15/16 went green at
`feab34bd` / `d6b5d13f`, which do not contain `90cbe643` — the specs' bare
`'[data-search-slot] button'` assumption ("the slot has exactly one button") was true
when written and drifted when the close action landed.

The regression was already flagged in-repo:
`tests/sprint-05-orient-search/evidence/recovery/green-observations.json` ("regression_note")
names `90cbe643` and recommends the same selector pin this fix applies.

### Real-DOM inventory (built dist, JS enabled — `search-slot-dom.json`)

`http://localhost:4321/docs/introduction`, after island upgrade:

| # | class | label | visible | inside closed dialog |
|---|-------|-------|---------|----------------------|
| 1 | `search-dialog__trigger` | "Search documentation" (`aria-haspopup="dialog"`) | yes | no |
| 2 | `search-dialog__close` | "Close search" (`data-search-close`) | no | yes |

No duplication, no wrong markup — one trigger, one designed close control.

## Fix (tests only, no product change)

Narrow the two stale locators to the element the flows actually mean (the trigger),
matching the three sibling lanes that already narrowed and stayed green:

- `search-contract.spec.ts:80` — `SEARCH_TRIGGER`
- `not-found-search-recovery.spec.ts:79` — `HEADER_SEARCH_TRIGGER`

`'[data-search-slot] button'` → `'[data-search-slot] button.search-dialog__trigger'`

Precedents: `search-presentation.spec.ts:40` (`.search-dialog__trigger` — the ORI-VIS-003
lane itself), `cmdk-open-search-navigate.spec.ts:25` (`[aria-haspopup="dialog"]`),
`getting-started-engine-decision.spec.ts:60` (`[aria-label="Search documentation"]`).

Oracle strength preserved (not weakened): every assertion still targets the same trigger
element; the selector is strictly more precise. `recovery-presentation.spec.ts:52` keeps
its bare selector — it only asserts `toBeHidden()` in no-JS contexts where the island
never relocates (resolves to 0 elements) and is green as-is.

## Counts (CI=true, scoped `--grep` runs, built dist, port 4321)

| Lane | Before (RED) | After (GREEN) |
|------|--------------|---------------|
| FLOW-SHELL-15 search-contract | 10 failed / 5 passed | 0 failed / 15 passed (exit 0) |
| FLOW-SHELL-16 not-found-search-recovery | 4 failed / 11 passed | 0 failed / 15 passed (exit 0) |
| FLOW-SHELL-07 cmdk-open-search-navigate (cross-check) | green pre-fix (FIX-ORI-CI-003-1 suite) | 0 failed / 3 passed (exit 0) |

RED strict-mode violations name exactly the two DOM buttons above (trigger + close).

## Unrelated transient observed during worktree build (not this fix's scope)

First worktree build chain failed in the authored-snippets consumer gate: fresh
`nativewind` recipe assembly exited 2 with TS7031/TS7006 (`item`/`event` implicit any in
`packages/docs-snippets/shared/quickstart-screen.tsx`). Minutes later an identical fresh
assembly from the main checkout succeeded (sentinels written 17:48/17:49 same day) with
the same committed inputs — the recipe installs from the LIVE apex registry and
`npx --yes @react-native-reusables/cli@latest`, so assembly is exposed to a
registry/CLI serving window. Second worktree chain passed (warm cache) and the dist is
real. Robustness concern for the gate owner, not related to the search-slot failures.
