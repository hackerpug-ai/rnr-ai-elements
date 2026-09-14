# Implementation log

## 2026-09-13: Righthook pre-commit gates

Righthook runs these read-only checks before a commit:

- `pnpm typecheck`: root and registry TypeScript checks.
- `pnpm lint`: the existing `biome ci .` configuration.
- `pnpm check:fallow`: `fallow audit --base HEAD`. Newly introduced errors block
  the commit; inherited findings and warnings remain visible.

The hook checks the working tree, not an isolated staged snapshot. It does not
stash, auto-fix, stage files, or reuse Righthook job results. Tests and docs builds
are not part of pre-commit.

`pnpm install` installs the hook through `prepare`. Installation requires Go
1.24.11 or newer and pins Righthook to upstream tag `v0.0.1-beta` in the local
`node_modules/.bin` directory. Fallow is pinned to 3.25.0 in the lockfile. Run
`pnpm hooks:install` to reinstall or `pnpm hooks:check` to run the gates manually.
The installer leaves the existing post-checkout hook intact.
Repeated installs preserve the existing pre-commit hook and validate Righthook
ownership. They fail if another tool owns that hook; they never force an overwrite.
Linked worktrees install to the shared Git hooks directory while keeping their
Righthook binaries local.

Fallow treats the copy-paste registry sources as public entry points. Its config
excludes planning, orchestration, and generated test-report directories. It does
not suppress unused-code rules or raise complexity thresholds. The first audit
reported 74 inherited dependency findings and warnings about hidden Storybook
configuration and the cross-workspace docs prebuild entry. Those findings need
separate triage; a passing changed-code audit is not a clean full-repo audit.

Verification:

- `pnpm hooks:check` passed all three real checks.
- `pnpm exec vitest run tests/tooling/righthook.test.ts` passed five tests using
  real Git repositories, TypeScript, Biome, and Fallow. A valid commit succeeded;
  each tool rejected its own failing input. Failed commits preserved staged and
  unstaged bytes.
- The installer test runs twice in a real linked worktree, then verifies that an
  unrelated hook survives unchanged and causes installation to fail.
- The initial typecheck could not resolve `qrcode`. Refreshing dependencies from
  the existing lockfile installed the declared package; typecheck then passed.

The dependency-research skill informed the pinned install and Fallow audit mode.
The coding-standards skill informed the read-only hook and real integration checks.
