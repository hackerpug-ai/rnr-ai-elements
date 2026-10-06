<!-- Version: TASK-TEMPLATE v5.2 · sprint-06-guides-boundary-changelog -->

# FIX-GBC-003-1 — Boundary page prose carries a table-only term (useChat) after ORI-CONT-004 rewrite

> Status: 🔧 Implemented (RED→GREEN in worktree; orchestrator publishes completion)
> Assignee: techwriting-implementer (implementer) · techwriting-reviewer (reviewer)
> Priority: P1 · Points: 1 · Type: FIX
> Proposed By: orchestrator (sprint-06 e2e regression, 2026-10-06)
> Sprint: [SPRINT.md](./SPRINT.md) · base HEAD 4d789caf (trunk)

## What this does

Reword ONE sentence in the "See the worked example app" Callout body of
`apps/docs/src/content/docs/owns-vs-does-not-own.mdx` (~line 90): the literal
hook name `AI SDK v7 useChat` becomes `the AI SDK v7 chat hook`. Nothing else on
the page changes.

## Why

Commit a1045aa3 (merge of sprint-05 ORI-CONT-004, 2026-10-02) rewrote the
Callout body to point readers at the example app's /live-chat route. That body
renders as a `<p>`, and the GBC-003 lane's AC-1 requires each boundary-ownership
term (`transport`, `streaming client`, `tool executor`, `useChat`) to sit inside
a table cell (`main td, main th`) and appear ZERO times in any `main p`. The
rewritten prose put the literal token `useChat` in a paragraph, so
`tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts:131` fails
"Expected: 0, Received: 1" on all 3 projects (chromium-desktop,
chromium-mobile, chromium-nojs). The lane was green when the sprint-06 human
gate ran on 2026-09-30; a1045aa3 regressed it.

The page's own law (GBC-003): ownership terms live in tables; prose stays
term-free. The fix keeps every fact the ORI-CONT-004 rewrite added — the
/live-chat route exists, it composes the same registry items, a small server
keeps provider credentials off the device, and the verified run guide lives at
`apps/example/docs/live-chat.md` — while referring to the hook indirectly, the
way the page's prose already refers to table-only concepts.

Failing evidence: `.tmp/FIX-GBC-003-1/cycle-1/red/lane.log` (3 failures, one
per project, all the useChat-in-prose assertion at spec line 131).
Passing evidence: `.tmp/FIX-GBC-003-1/cycle-1/green/lane.log` (15/15 passed,
0 failed — 5 ACs × 3 projects).

## How to verify

```
pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
```

15 passed, 0 failed, retries 0 (config pins `retries: 0`). RED before the fix:
AC-1 fails on all 3 projects at the `useChat`-never-in-prose assertion.

## Scope

- WRITE-ALLOWED:
  - apps/docs/src/content/docs/owns-vs-does-not-own.mdx (MODIFY — the Callout
    body string only)
  - .spec/prds/docs-site/tasks/sprint-06-guides-boundary-changelog/FIX-GBC-003-1.md (CREATE — this doc)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- No AC1_TERM (`transport`, `streaming client`, `tool executor`, `useChat`) may
  appear in any prose paragraph on the page, case-insensitive. `streaming
  client` is a two-word bigram — avoid the word pair; "streaming" alone is
  lawful.
- The ownership tables stay untouched: `useChat` remains in its
  consumer-wires cells (lines 48, 59, 61 of the manuscript).
- Do NOT edit the lane spec, any test file, or any other page.
- Preserve every ORI-CONT-004 fact listed in Why.

### DONE WHEN

- The verify command exits 0 with all 15 tests passing (5 ACs × 3 projects,
  retries 0).
- RED and GREEN evidence saved under `.tmp/FIX-GBC-003-1/cycle-1/`.
- `pnpm exec tsc --noEmit` and Biome on the touched files exit 0.

### ACCEPTANCE CRITERIA

- AC-1: `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright
  test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep
  FLOW-DOCS-04-boundary-ownership-tables` exits 0 — the boundary lane is green
  on chromium-desktop, chromium-mobile, and chromium-nojs with retries 0, and
  no AC1_TERM appears in a `main p` on /docs/owns-vs-does-not-own.
  `test_tier: e2e · verification_service: real docs build + astro preview + playwright (3 chromium projects)`

### TEST CRITERIA

- TC-1 (verifies AC-1): the verify command above, run twice in this task —
  once before the content fix (RED, `.tmp/FIX-GBC-003-1/cycle-1/red/lane.log`,
  exit 1, 3× useChat-in-prose failures) and once after (GREEN,
  `.tmp/FIX-GBC-003-1/cycle-1/green/lane.log`, exit 0, PASS (15) FAIL (0)).
