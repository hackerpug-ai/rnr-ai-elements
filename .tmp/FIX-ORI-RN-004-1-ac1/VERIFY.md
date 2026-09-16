# FIX-ORI-RN-004-1-AC-1 — verification record

Change: `apps/example/lib/live-chat-config.ts` (one-line env read). Pure seam
`resolveLiveChatConfig` and the ORI-AI-001 test file are untouched.

## Commands run

| command | exit | verdict |
|---|---|---|
| `pnpm lint` (`biome ci .`) | 0 | clean ("Found 4 infos", no errors; my file not flagged) |
| `pnpm typecheck` | 1 | **pre-existing** — 7 errors, all in `tests/sprint-04-generated-reference/code-primitives-contract.test.ts` |
| `pnpm --dir apps/example exec tsc --noEmit` | 2 | **pre-existing** — 77 errors, none touching `lib/live-chat-config.ts` / `use-live-chat.ts` |
| `pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json` | 0 | clean (scoped to `lib/live-chat-config.ts` + `lib/use-live-chat.ts`) |
| `pnpm exec tsx .tmp/FIX-ORI-RN-004-1-ac1/seam-check.mts` | 0 | 6/6 pure-seam assertions pass |

## Pre-existing failure proof (AGENTS.md `git stash && rerun`)

The two failing checks were re-run with the change stashed
(`git stash push -m "ac1-stash-proof"`), then the change was restored
(`git stash pop`). Both failures reproduce **byte-identically** without the
change:

- `pnpm typecheck`: exit 1, **7 errors** with change applied AND stashed
  (identical error text — `diff` of the two `error TS` lists is empty).
  Root cause: `tests/sprint-04-generated-reference/code-primitives-contract.test.ts`
  imports the gitignored `apps/docs/src/data/registry-items.json`
  (`TS2307`), which cascades 6 implicit-`any` errors.
- `pnpm --dir apps/example exec tsc --noEmit`: exit 2, **77 errors** with change
  applied AND stashed (identical). Errors are in `app/index.tsx`,
  `components/ai/*`, `gallery/cells/*`, `components/ui/input.tsx` — none in the
  touched file.

Raw outputs: `.tmp/FIX-ORI-RN-004-1-ac1/typecheck.out`,
`typecheck-stashed.out`, `example-tsc.out`, `example-tsc-stashed.out`,
`live-chat-tsc.out`, `lint.out`.

## Pre-commit typecheck gate — resolved by generating the gitignored artifact

The righthook pre-commit gate runs `pnpm typecheck`, which fails on the same
pre-existing `TS2307` (missing gitignored `apps/docs/src/data/registry-items.json`).
Following the FIX-ORI-RN-004-1 precedent, the artifact was generated locally so the
gate passes:

```
pnpm gallery:manifest                                   # -> gallery-manifest.json
pnpm --filter @rnr-ai-elements/docs prebuild            # -> registry-items.json
pnpm typecheck                                          # exit 0 (see typecheck-after-generate.out)
```

`registry-items.json`, `gallery-manifest.json`, and `site-facts.json` are gitignored
(`git check-ignore` lists them) and are **not** part of this commit.

## Pure-seam integrity

`resolveLiveChatConfig(env)` is byte-identical pre/post (the diff touches only
`getLiveChatConfig`). Its behavior, asserted directly (mirroring ORI-AI-001 AC-4,
no provider required):

```
PASS  undefined -> !ok
PASS  '' -> !ok
PASS  not-a-url -> !ok
PASS  ftp:// -> !ok
PASS  ok for http
PASS  endpoint derived   (http://127.0.0.1:4100/api/chat)
```
