<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference · driver-authored follow-up 2026-09-13 -->

# FIX-REF-009-1: narrow sprint-02 `{engine}` whole-page guards to the substitution-detection intent

> Status: ✅ Completed
> Commit: b5851c725ee7fbcbcacb7fd6cd462417d768d0f9 (approved cycle 1)
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FEATURE · Wave: C
> Proposed By: kb-run-sprint driver · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-13

## What this does

Narrows two sprint-02-lane whole-page `{engine}` guards so they keep catching UNPROCESSED template substitutions while no longer failing on the SANCTIONED literal `path="/r/{engine}/{item}.json"` that schema-display's verbatim usageSnippet legitimately contains (REF-003's fidelity rule mandates verbatim rendering; the sprint-04 six-section assembly renders it). Files: tests/sprint-02-shell-hero/item-pages-build.test.ts (line ~157) and tests/sprint-02-shell-hero/item-install-copy.spec.ts (line ~217).

## Why

After REF-009's landed assembly, every item page's usage region renders the usageSnippet verbatim, and schema-display's real snippet documents the registry-API pattern containing the literal `{engine}`. The sprint-02 guards assert `'{engine}'` never appears anywhere in served item-page HTML — their intent is unprocessed-substitution detection (an engine tab failing to substitute), not banning the literal from data. As written they fail the whole lane on one page: item-pages-build.test.ts fails TODAY on the merged tree (the only failing assertion: 'schema-display: {engine} template'), and item-install-copy.spec.ts:217 carries the same shape for playwright. Both files are outside every sprint-04 task's write_allowed — hence this FIX. Without it the full vitest suite is red at the human gate.

## How to verify

`pnpm exec vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts`

## Scope

tests/sprint-02-shell-hero/item-pages-build.test.ts (MODIFY); tests/sprint-02-shell-hero/item-install-copy.spec.ts (MODIFY)

## CRITICAL CONSTRAINTS

- MUST: the guards keep their substitution-detection teeth — an actually-unsubstituted engine tab (e.g. a fabricated page where the install command or data-engine attribute still carries a literal `{engine}` outside the usage region) must still FAIL. Scope the assertion to the regions where substitution is guaranteed (install + source + dependencies regions, data-engine attributes, engine-tab panel markup), or exempt only the verbatim usageSnippet/usage region content — never delete the guard, never weaken it to a no-op.
- MUST: extend-never-delete — retain every other assertion in both files byte-for-byte; the diff touches only the `{engine}` guard clauses (and any comment documenting the exemption).
- MUST: verify against the REAL merged tree (main + REF-009's b70a5c4): the schema-display page is the ground truth — its usage region carries the literal while every substituted surface is clean.
- NEVER: never touch apps/docs/src/** , scripts/docs-data/**, tests/sprint-04-generated-reference/**, or any file beyond the two named.
- NEVER: never 'fix' this by changing the dataset or rendering (no escaping, no string-mangling of usageSnippet) — the snippet stays byte-verbatim.

## DONE WHEN

- [x] AC 1: both guards pass on the merged tree with schema-display's literal usage region rendered
- [x] AC 2: the guards still fail on a genuinely unsubstituted `{engine}` outside the exempted region (mutation check, restored after)
- [x] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [x] Only SCOPE files modified (git diff --name-only)

## ACCEPTANCE CRITERIA

**AC-1: guards pass on the merged tree with the verbatim usage region**

  GIVEN/WHEN/THEN: GIVEN main with REF-009's landed assembly (schema-display renders usageSnippet verbatim containing `path="/r/{engine}/{item}.json"`) WHEN `pnpm exec vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts` runs over a real build THEN it exits 0 with every assertion passing including the narrowed `{engine}` guard, and `CI=true pnpm exec playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts` passes its `{engine}` clause across chromium-desktop/mobile/nojs.

  FLOW_REF: None · TEST_TIER: integration · verification_service: real docs build + served HTML + Chromium
  VERIFY: `pnpm exec vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts`
  TEST_FILE: tests/sprint-02-shell-hero/item-pages-build.test.ts · TEST_FUNCTION: existing suite (narrowed guard)

**AC-2: guards keep substitution-detection teeth (mutation check)**

  GIVEN/WHEN/THEN: GIVEN the narrowed guards WHEN a mutation temporarily injects a literal `{engine}` into a SUBSTITUTED surface (e.g. the install region's rendered command or a data-engine attribute on a test copy of the built HTML, or by temporarily reverting the narrowing in a scratch check) THEN the guard FAILS naming the page, and the tree restores byte-exact afterward (sha256 before/equal-after).

  FLOW_REF: None · TEST_TIER: integration · verification_service: real docs build + served HTML
  VERIFY: `pnpm exec vitest run tests/sprint-02-shell-hero/item-pages-build.test.ts` (must be green after restore)
  TEST_FILE: tests/sprint-02-shell-hero/item-pages-build.test.ts · TEST_FUNCTION: existing suite (mutation drill documented in evidence)
