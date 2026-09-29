=== GBC-015 blocker evidence: pre-commit fallow gate ===
Date: 2026-09-29T19:24:40Z

1. The repo pre-commit hook (righthook.yml) runs: pnpm typecheck, pnpm lint, pnpm check:fallow.
2. pnpm check:fallow = 'fallow audit --base HEAD'. With IndexList.astro staged, the verdict is FAIL:
  apps/docs/src/components/IndexList.astro (caveat: incomplete import graph)
  Files not reachable from any entry point — https://docs.fallow.tools/explanations/dead-code#unused-files
  Listed in dependencies but never imported — https://docs.fallow.tools/explanations/dead-code#unused-dependencies
  Listed in devDependencies but never imported or referenced — https://docs.fallow.tools/explanations/dead-code#unused-dependencies
✗ 1 file · 68 unused dependencies · 6 dev/optional dependencies (0.23s)
✗ dead code: 75 issues · 12 changed files (0.83s)

3. JSON attribution (audit.json): verdict=fail, dead_code_introduced=1, unused_files=1 —
   the single introduced finding is apps/docs/src/components/IndexList.astro,
   unreachable because its importers (GBC-008 /changelog, GBC-010 /guides, GBC-016
   SectionIndexLayout) are later sprint-06 tasks.

4. The sanctioned config fix is OUTSIDE this task's write_allowed (which lists only
   IndexList.astro and index-list-source.test.ts): add to .fallowrc.json —
     "dynamicallyLoaded": ["apps/docs/src/components/IndexList.astro"]
   (fallow v3.25.0 schema: seeds graph-invisible files as entry points; removable once
   GBC-008/GBC-010 import the component).

5. Precedent: commit 75e5cc9e fix(FIX-ORI-RN-001-1) resolved the identical gate class
   with a one-line .fallowrc.json change as its own dedicated task.
