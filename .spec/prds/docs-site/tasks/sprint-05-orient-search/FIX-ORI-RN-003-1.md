<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search · orchestrator-authored follow-up 2026-09-15 -->

# FIX-ORI-RN-003-1: add react-native-css-interop@0.2.6 as a direct dependency of the nativewind consumer template

> Status: ✅ Completed

Commit: 6a2dd5413268895190ca06266693fc075ca33a1a

> Assignee: react-native-reusables-implementer (implementer) · react-native-reusables-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX · Wave: C (unblocks the ORI-RN-003 commit)
> Proposed By: orchestrator (ORI-RN-003 implementer out-of-scope finding, real-device run, 2026-09-15)
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Repo: rnr-ai-elements
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-15
> AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

## What this does

Adds one dependency — `"react-native-css-interop": "0.2.6"` — to the `dependencies` object of
`packages/docs-snippets/nativewind/package.json`. `nativewind@4.2.6` declares
`react-native-css-interop@0.2.6` as a hard dependency, but pnpm's isolated linker
(`shamefully-hoist=false`) nests it under `node_modules/.pnpm/nativewind@…/node_modules/` and
never hoists it to the consumer root. The babel preset in
`packages/docs-snippets/nativewind/babel.config.js` sets `jsxImportSource: 'nativewind'`, which
injects `import 'react-native-css-interop/jsx-runtime'` into every app file; Metro resolves that
import from `app/index.tsx` (and `app/_layout.tsx`), where the nested transitive dep is
unreachable. Promoting it to a direct dependency hoists it, and the identical source then bundles.
This FIX touches only that template's `package.json`. The template is NOT a pnpm workspace member
(`pnpm-workspace.yaml` globs `apps/*` and `packages/*`; the template is two levels deep), so the
repo-root `pnpm-lock.yaml` has no importer entry for it and is unchanged by this edit — the
dependency resolves in the COPIED consumer's own install (see AC-2), not in the repo lockfile.

## Why

ORI-RN-003's real-device proof (iOS simulator `81487B1E-…`, Android emulator `emulator-5554`,
Expo Go 57.0.9) recorded all three nativewind legs failing/blocking at the Metro bundle with
`Unable to resolve react-native-css-interop/jsx-runtime from app/index.tsx` (native) and the
identical `Error: Unable to resolve module react-native-css-interop/jsx-runtime` from
`expo export --platform web`. The control was proven in a disposable consumer: adding
`react-native-css-interop@0.2.6` hoists it and the same bytes bundle (`iOS Bundled … 3597
modules`). `packages/docs-snippets/nativewind/package.json` is `writeProhibited` for ORI-RN-003
(`packages/**`), so the finding becomes this FIX. The uniwind template and every other dependency
must remain untouched — the defect is nativewind-specific (uniwind uses `withUniwindConfig`, no
css-interop jsx-runtime).

## How to verify

RED before the fix (already recorded under ORI-RN-003 evidence, on its own branch): a clean
nativewind consumer fails Metro/`expo export` with the unresolvable
`react-native-css-interop/jsx-runtime` import.

GREEN after the fix — the direct dependency hoists and the same source bundles:

```
git diff packages/docs-snippets/nativewind/package.json   # exactly one added dependency line
```

then a real bundling proof in a freshly prepared nativewind consumer. The template is copied
OUTSIDE the monorepo and installed in the copy (this is exactly how the learner and the ORI-RN-001
harness install it — `tests/sprint-05-orient-search/support/quickstart-consumer.ts` copies the
template to a fresh OS-derived dir and runs the committed recipe with cwd = the copy):

```
cp -R packages/docs-snippets/nativewind/. "$TMPDIR"/fix-nw-consumer/
cd "$TMPDIR"/fix-nw-consumer && bash /abs/path/to/packages/docs-snippets/commands/nativewind.sh
npx expo export --platform web        # exits 0, NO "Unable to resolve react-native-css-interop/jsx-runtime"
```

The web export is the bundling proof (it drives Metro's resolver, which is what fails pre-fix); it
needs no device. The authoritative end-to-end 6-leg proof is ORI-RN-003's own harness (on its own
branch), re-run by ORI-RN-003 once this FIX lands — not by this FIX.

## Scope

- WRITE-ALLOWED:
  - packages/docs-snippets/nativewind/package.json (MODIFY)
  - tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-1/** (evidence — RED/GREEN + bundling proof)
  - .tmp/FIX-ORI-RN-003-1/** (owned scratch)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- The ONLY semantic change to `packages/docs-snippets/nativewind/package.json` is adding
  `"react-native-css-interop": "0.2.6",` to the `dependencies` object. Every other field — `name`,
  `version`, `private`, `main`, `scripts`, every existing `dependencies` entry, and the entire
  `devDependencies` object — must remain byte-identical.
- Pin the exact version `0.2.6` (nativewind@4.2.6's own declared range), not `^0.2.6` or `latest`.
  `0.2.7` exists on npm but is NOT what nativewind@4.2.6 pins — do not take it.
- Do NOT add `react-native-css-interop` to `devDependencies`, and do NOT add it to the uniwind
  template (`packages/docs-snippets/uniwind/package.json`) — uniwind has no css-interop jsx-runtime.
- Do NOT change any engine config, any other package.json, `babel.config.js`, `metro.config.js`, or
  any `packages/docs-snippets/**` file beyond the one allowed path.
- Do NOT edit the repo-root `pnpm-lock.yaml` — it has no importer entry for the template (the
  template is not a workspace member) and must not drift. The dependency resolves in the COPIED
  consumer's own `pnpm install` (run by `commands/nativewind.sh` in the copy), never in the repo.

### DONE WHEN

- AC-1: `packages/docs-snippets/nativewind/package.json` `dependencies` gains exactly
  `"react-native-css-interop": "0.2.6",`; `git diff` shows one added line and nothing else changed.
- AC-2: a freshly prepared nativewind consumer (exact committed template + recipe) bundles with no
  `react-native-css-interop/jsx-runtime` resolution failure; the uniwind template, the repo-root
  `pnpm-lock.yaml`, and every other dependency are byte-unchanged.
- `pnpm typecheck` clean and `pnpm lint` clean.
- Only SCOPE files modified (`git diff --name-only`).

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: the one dependency is added, pinned, and is the ONLY change to the template**

  GIVEN `packages/docs-snippets/nativewind/package.json` (nativewind@4.2.6, no direct
  css-interop dep) WHEN `"react-native-css-interop": "0.2.6"` is added to its `dependencies`
  THEN `git diff packages/docs-snippets/nativewind/package.json` shows exactly one added
  `"react-native-css-interop": "0.2.6",` line with every other byte unchanged. The repo-root
  `pnpm-lock.yaml` is untouched (the template is not a workspace member; it has no importer entry).

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `git diff`
  VERIFY: `git diff packages/docs-snippets/nativewind/package.json`
  TEST_FILE: packages/docs-snippets/nativewind/package.json · TEST_FUNCTION: (dependency change; the one-line diff is the assertion)

**AC-2: real bundling proof — the jsx-runtime resolves where the install actually happens, and nothing else moves**

  GIVEN the fixed template WHEN a clean nativewind consumer is prepared (copy the template OUTSIDE
  the monorepo and run the committed recipe `bash packages/docs-snippets/commands/nativewind.sh`
  with cwd = the copy — the recipe's `pnpm install` resolves deps in the copy's own lockfile) and
  Metro bundles it via `npx expo export --platform web` THEN the export exits 0 with no
  `Unable to resolve react-native-css-interop/jsx-runtime` diagnostic (RED before the fix: exit 1
  with that exact diagnostic), the uniwind template
  (`packages/docs-snippets/uniwind/package.json`), the repo-root `pnpm-lock.yaml`, and every other
  dependency are byte-unchanged, and `git diff --name-only` lists only
  `packages/docs-snippets/nativewind/package.json` and the FIX evidence/scratch dirs.

  FLOW_REF: None · TEST_TIER: integration · verification_service: real Metro / `expo export --platform web`
  VERIFY: `npx expo export --platform web` in the prepared nativewind consumer (must be green, no unresolvable import)
  TEST_FILE: packages/docs-snippets/nativewind/ (prepared consumer) · TEST_FUNCTION: (bundling proof documented in evidence)

### TEST CRITERIA

- TC-1 → AC-1: `git diff packages/docs-snippets/nativewind/package.json` shows exactly one added
  `"react-native-css-interop": "0.2.6",` dependency line and no other byte change.
- TC-2 → AC-1: the repo-root `pnpm-lock.yaml` is unchanged by the edit (`git diff --name-only` does
  not list `pnpm-lock.yaml`); the template remains a non-workspace standalone scaffold whose
  dependency resolves only in a copied consumer.
- TC-3 → AC-2: the prepared nativewind consumer bundles (`npx expo export --platform web`) with exit 0
  and no `react-native-css-interop/jsx-runtime` failure; RED evidence (the pre-fix failure) and GREEN
  evidence (the post-fix success) saved under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-1/`.

### SCOPE (file-level write permissions)

- packages/docs-snippets/nativewind/package.json (MODIFY)
- tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-1/** (evidence)
- .tmp/FIX-ORI-RN-003-1/** (owned scratch)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- bundling: `npx expo export --platform web` in the prepared nativewind consumer (exit 0, no unresolvable import)

### DEPENDENCIES

- Depends on: ORI-RN-001 (the nativewind template + recipe this FIX corrects)
- Blocks: ORI-RN-003 (the three nativewind legs cannot execute until the jsx-runtime resolves)
- Parallel: none (single template file; do not race the uniwind template or other docs-snippets edits)

### READING LIST (max 5)

- pnpm-lock.yaml (nativewind@4.2.6 snapshot declares `react-native-css-interop: 0.2.6`, nested under `.pnpm/…`, absent from root `node_modules`)
- packages/docs-snippets/nativewind/babel.config.js (the `jsxImportSource: 'nativewind'` that injects the css-interop jsx-runtime import)
- packages/docs-snippets/nativewind/package.json (the dependencies object the fix targets)
- packages/docs-snippets/uniwind/package.json (the unaffected control — must stay byte-identical)
- tests/sprint-05-orient-search/support/quickstart-consumer.ts (the `prepareConsumer` helper: copies the template OUTSIDE the monorepo and runs the recipe in the copy — the install location the proof must exercise)

> Note: the finding's primary artifact — `tests/sprint-05-orient-search/evidence/ORI-RN-003/run-manifest.json`
> — lives on ORI-RN-003's own branch (`kb-run-sprint/sprint-05-orient-search/ORI-RN-003`), not this
> trunk. The diagnosis is fully reproducible from the on-branch artifacts above.

### CODING STANDARDS

Keep the existing two-space JSON formatting and trailing-comma style. Insert
`"react-native-css-interop": "0.2.6",` alphabetically into the `dependencies` object (between
`react-native-safe-area-context` and `react-native-screens`, or wherever it sorts by key — any
position is fine as long as it is the ONLY added line and valid JSON). Add no new keys, and do not
touch `devDependencies`.

## Amendments

- Cycle-2 remediation (independent reviewer NEEDS_FIXES, DOC-5/DOC-7/DOC-8):
  - DOC-5 — dropped the un-runnable "authoritative end-to-end re-run" command that cited a
    non-existent `tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines/--platforms`
    (that harness lives on ORI-RN-003's own branch). The proof now points at the real on-branch
    harness: `tests/sprint-05-orient-search/support/quickstart-consumer.ts` copies the template
    outside the monorepo and runs `commands/nativewind.sh` in the copy; the bundling assertion is
    `npx expo export --platform web` in that copy.
  - DOC-7 — removed `pnpm-lock.yaml` from WRITE-ALLOWED and from the AC/TC/VERIFY/gate wording. The
    template is NOT a workspace member (`pnpm-workspace.yaml` globs `apps/*`/`packages/*`; the
    template is two levels deep), so the repo-root lockfile has no importer entry and is unchanged
    by the edit. The dependency is verified where it actually takes effect — the copied consumer's
    `pnpm install` (run by the recipe in the copy) — not via a root-lockfile diff.
  - DOC-8 — re-pointed the reading list off the absent
    `tests/sprint-05-orient-search/evidence/ORI-RN-003/run-manifest.json` (it lives on ORI-RN-003's
    branch) to on-branch artifacts (`pnpm-lock.yaml` nativewind snapshot, `babel.config.js`, the
    template/control package.json, and `support/quickstart-consumer.ts`), with a note naming the
    branch-qualified finding source.
  - The verified diagnosis and the one-line dependency change are unchanged.

## Handoff

```json
{"task": "FIX-ORI-RN-003-1", "commit_sha": "6a2dd5413268895190ca06266693fc075ca33a1a", "done": "Added the single pinned dependency \"react-native-css-interop\": \"0.2.6\" to packages/docs-snippets/nativewind/package.json and proved RED→GREEN via a real copy-outside-monorepo consumer bundling run (expo export --platform web: exit 1 'Unable to resolve react-native-css-interop/jsx-runtime' → exit 0, 3083 modules, css-interop hoisted at 0.2.6), with the uniwind template and repo-root pnpm-lock.yaml byte-unchanged.", "deviations": ["The contract's literal proof command `cp -R packages/docs-snippets/nativewind/.` omits the shared/ overlay that app/index.tsx imports, so a clean GREEN is unreachable via that literal path; I followed ORI-RN-003's prepareConsumer order instead (copy the 12 template files → run the verbatim recipe → THEN overlay app/index.tsx + shared/*).", "Evidence was committed under .tmp/FIX-ORI-RN-003-1/cycle-1/{red,green}/ per the task-level instruction, not under tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-1/ as TC-3 names it."], "concerns": ["The recipe runs `pnpm exec tsc --noEmit` under set -euo pipefail, so if app/index.tsx is copied BEFORE the recipe runs, tsc fails on the unresolved @/shared/quickstart-screen import and aborts — the entrypoint+shared overlay must always follow the recipe."], "findings": ["Hoisting confirmed: pre-fix pnpm nests react-native-css-interop@0.2.6 under node_modules/.pnpm/nativewind@4.2.6_…/node_modules/ and never hoists it; post-fix it is hoisted to the consumer root at exactly 0.2.6 (npm latest is 0.2.7, which nativewind@4.2.6 does not pin).", "The bundling proof requires the overlay-order preparation; ORI-RN-001's quickstart-consumer.ts copies only the 12 template files and only typechecks, so a bundling re-run must use ORI-RN-003's native-session.ts prepareConsumer.", "biome.json's includes do not match packages/docs-snippets/** so biome ci on the template reports no files processed; the effective lint gate is pnpm lint (biome ci .)."], "scope_impact": [{"target": "ORI-RN-003", "found": "The three nativewind legs now bundle because the direct dep hoists react-native-css-interop@0.2.6 to the consumer root; its harness already overlays entrypoint+shared after the recipe.", "change": "Re-run the existing quickstart-proof.test.ts matrix as-is; the recorded bundle RED should now pass (it did for nativewind/web; ios/android are blocked by a separate registry defect)."}, {"target": "ROADMAP", "found": "packages/docs-snippets/{nativewind,uniwind} are standalone consumer scaffolds, not pnpm workspace members, so their deps resolve only in a copied consumer and never affect the repo-root lockfile.", "change": "Roadmap note: (a) any template dependency edit must be proven via the copy-outside-monorepo recipe + expo export bundling path, never a root-lockfile diff; (b) biome/fallow intentionally exclude packages/docs-snippets/**."}], "feedback": []}
```
