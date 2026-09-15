<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search · orchestrator-authored follow-up 2026-09-15 -->

# FIX-ORI-RN-001-1: exempt the docs-snippets consumer templates from the fallow dead-code and duplication gate

> Status: 📋 Ready

> Assignee: ghactions-implementer (implementer) · ghactions-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX · Wave: C (unblocks the ORI-RN-001 commit)
> Proposed By: orchestrator (ORI-RN-001 implementer out-of-scope finding, 2026-09-15)
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Repo: rnr-ai-elements
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-15
> AGENT: planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

## What this does

Adds one glob — `packages/docs-snippets/**` — to the `ignorePatterns` array in `.fallowrc.json`.
The righthook pre-commit `fallow` gate (`pnpm check:fallow` → `fallow audit --base HEAD`) currently
flags the two committed ORI-RN-001 consumer templates under
`packages/docs-snippets/{nativewind,uniwind}/` for ~97 unused dependencies + 8 unused dev/optional
dependencies (their `package.json` deps are consumed only by RNR-installed components, invisible to
repo-scoped static analysis — fallow's own `incomplete-import-graph` caveat) and 10 duplication
clone groups (the intentional shared RNR theme-token scaffolding across the
nativewind/uniwind/harness/example trees). Exempting that directory — and nothing else — lets the
ORI-RN-001 commit land.

## Why

ORI-RN-001's 31 staged files (focused test GREEN 5/5) cannot commit: the `fallow` hook job exits 1
on the templates. The templates are standalone consumer scaffolds, not repo source — their deps
resolve only after the RNR CLI installs components into a copied consumer, and their theme tokens
deliberately repeat RNR's canonical values, so both the unused-dependency and the duplication
findings are false positives. fallow offers no comment-based suppression for `unused_dependencies`
(only move/remove-dependency or `ignoreDependencies` config), and `.fallowrc.json` is outside every
sprint-05 task's write_allowed — hence this FIX in the repo tooling/CI lane.

## How to verify

```
pnpm check:fallow
```

Exits 0 after the change. RED before the fix: the same command exits 1 on the ORI-RN-001 tree
(`✗ 97 unused dependencies · 8 dev/optional dependencies`, `✗ 769 lines duplicated across 15 files`,
`exit status 1`).

## Scope

- WRITE-ALLOWED:
  - .fallowrc.json (MODIFY)
  - tests/sprint-05-orient-search/evidence/FIX-ORI-RN-001-1/** (evidence — RED/GREEN + non-weakening probe)
  - .tmp/FIX-ORI-RN-001-1/** (owned scratch)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- The ONLY semantic change is adding `"packages/docs-snippets/**"` to the `ignorePatterns` array.
  Every other key and every other array entry must remain byte-identical: the `$schema`,
  `minimumVersion`, and `entry` keys, and the eight existing `ignorePatterns` entries
  (`.spec/**`, `.kb-run-sprint/**`, `.pi/**`, `.claude/**`, `.tmp/**`, `apps/docs/.astro/**`,
  `apps/docs/playwright-report/**`, `test-results/**`).
- Use fallow's path convention: a project-root-relative glob with `/` separators
  (`packages/docs-snippets/**`), matching the existing entry style.
- Do NOT add the ~30 package names to `ignoreDependencies`, do NOT weaken the `entry` glob, and do
  NOT broaden the pattern (no `packages/**`, no `**`, and no `packages/docs-snippets` without `/**`).
- Do NOT touch `packages/docs-snippets/**` itself or any other file. This FIX owns only
  `.fallowrc.json` plus its evidence/scratch dirs.

### DONE WHEN

- AC-1: `pnpm check:fallow` exits 0 after adding the one glob; `git diff .fallowrc.json` shows
  exactly one added line.
- AC-2: a broken probe file OUTSIDE `packages/docs-snippets/**` still makes `pnpm check:fallow`
  exit 1 (path-scoped, non-weakening), with evidence saved; the tree is byte-exact restored afterward.
- `pnpm typecheck` clean and `pnpm lint` clean.
- Only SCOPE files modified (`git diff --name-only`).

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: the one-glob exemption makes the gate pass and changes nothing else**

  GIVEN the ORI-RN-001 tree (templates under `packages/docs-snippets/{nativewind,uniwind}/`) WHEN
  `"packages/docs-snippets/**"` is added to `.fallowrc.json` `ignorePatterns` THEN `pnpm check:fallow`
  exits 0, and `git diff .fallowrc.json` shows a single `+ "packages/docs-snippets/**",` line with
  every other byte unchanged.

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `fallow audit --base HEAD` + `git diff`
  VERIFY: `pnpm check:fallow`
  TEST_FILE: .fallowrc.json · TEST_FUNCTION: (config change; fallow exit-code + one-line diff are the assertions)

**AC-2: regression control — the exemption is path-scoped and does not weaken the gate repo-wide**

  GIVEN the fixed `.fallowrc.json` WHEN a deliberately-broken probe file (e.g. a scratch `package.json`
  listing an obvious unused dependency, or a `.ts` file carrying an unused export or a duplicated block)
  is placed OUTSIDE `packages/docs-snippets/**` — in a WRITE-ALLOWED path not covered by any other
  `ignorePatterns` entry — THEN `pnpm check:fallow` still exits 1 naming that probe (proving the ignore
  pattern exempted only `packages/docs-snippets/**`, not the rest of the tree), and the probe is removed
  afterward leaving the working tree byte-exact restored (sha256 before === sha256 after). RED/GREEN +
  probe evidence saved under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-001-1/`.

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `fallow audit --base HEAD` (probe drill)
  VERIFY: `pnpm check:fallow` (must be green after probe removal)
  TEST_FILE: (probe fixture under evidence dir) · TEST_FUNCTION: fallow probe drill documented in evidence

### TEST CRITERIA

- TC-1 → AC-1: `pnpm check:fallow` exits 0 after the change; `git diff .fallowrc.json` shows exactly
  one added `"packages/docs-snippets/**"` entry and nothing else.
- TC-2 → AC-2: the probe outside `packages/docs-snippets/**` makes `pnpm check:fallow` exit 1; evidence
  (RED before, GREEN after, probe non-weakening run) saved under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-001-1/`.

### SCOPE (file-level write permissions)

- .fallowrc.json (MODIFY)
- tests/sprint-05-orient-search/evidence/FIX-ORI-RN-001-1/** (evidence)
- .tmp/FIX-ORI-RN-001-1/** (owned scratch)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- fallow: `pnpm check:fallow`

### DEPENDENCIES

- Depends on: none
- Blocks: ORI-RN-001 (commit) — the templates cannot land until the fallow gate passes
- Parallel: none (single config file, single lane)

### READING LIST (max 5)

- .fallowrc.json (the `ignorePatterns` array — entry style)
- .spec/prds/docs-site/tasks/sprint-05-orient-search/FIX-ORI-AST-008-1.md (house FIX-doc shape)
- .spec/prds/docs-site/tasks/sprint-05-orient-search/ORI-RN-001-provide-complete-source-backed-setup-for-both-clean-expo-consumers.md (the blocked task + its fallow finding)
- righthook.yml (the pre-commit hook jobs: typecheck, biome, fallow)

### CODING STANDARDS

Keep the existing two-space JSON formatting and trailing-comma style; add the new glob as a sibling
entry inside the `ignorePatterns` array (append or insert is fine as long as every other byte is
unchanged). Add no new keys.
