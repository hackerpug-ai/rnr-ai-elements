================================================================================
TASK: FIX-SHELL-002-1 - Scope shell-layout's zero-script assertion around the contracted pre-paint theme script
================================================================================
TASK_TYPE:  FIX
STATUS:     Completed (landed)
COMMIT:     8cf8ba9276f6c4f8bab6560265910343e15c7e64
PRIORITY:   P0
POINTS:     1
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: orchestrator (SHELL-007 cycle-1 blocker, 2026-09-12; reproduced on main)
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=false
SPRINT:     sprint-02-shell-hero | WAVE: E (independent — Depends on: none)
RUNTIME_COMMANDS:
  test:      pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
tests/sprint-02-shell-hero/shell-layout.test.ts currently fails on main: its token
`SHELL-002-shell-css-token-governed` asserts no `<script` anywhere in DocsLayout.astro, but
SHELL-003's contracted flash-free pre-paint theme script (is:inline + data-astro-rerun, resolving
stored rnr-theme > prefers-color-scheme > dark) lives in DocsLayout's head by design. The zero-JS
shell constraint was always about Header/Footer and interactive shell behavior — the pre-paint
bootstrap is the theme mechanism SHELL-003 landed, not shell JavaScript.
**Success state:** The full shell-layout lane passes on main: zero-JS assertions hold for
Header.astro/Footer.astro and all interactive shell markup, while the contracted is:inline
pre-paint script in DocsLayout.astro is explicitly exempted (narrowly — the exemption must
pin the script's contract: is:inline, data-astro-rerun, rnr-theme resolution) rather than
dropping the assertion.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Keep every existing assertion intact except narrowing the `<script` prohibition to
  interactive shell JavaScript — the exemption must still pin is:inline + data-astro-rerun +
  rnr-theme so any OTHER script in DocsLayout.astro still fails
- MUST: Header.astro and Footer.astro remain asserted script-free with zero exemptions
- NEVER: Never weaken, skip, or delete any other token in the file
- NEVER: Never touch DocsLayout.astro, Header.astro, Footer.astro, or any product file — this
  fix is test-only; the product behavior (pre-paint script present) is correct and stays
- NEVER: Never edit any file outside SCOPE.writeAllowed
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [x] AC-1: `pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts` exits 0 — all
      tokens green including `SHELL-002-shell-css-token-governed` with the narrowed exemption
- [x] AC-2: the narrowed assertion still FAILS if DocsLayout.astro gains any script other than
      the contracted is:inline pre-paint bootstrap (proven by a scratch revert, not committed)
- [x] typecheck + lint clean on touched paths
- [x] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads)
--------------------------------------------------------------------------------
AC-1: The lane passes with the narrowly-scoped exemption
  GIVEN: main where SHELL-002-shell-css-token-governed fails (1 failed | 2 skipped) because
         DocsLayout.astro:35-50 carries SHELL-003's contracted is:inline data-astro-rerun
         pre-paint script (RED at start — reproduce and capture it)
  WHEN:  the fixed assertion runs as part of the real lane
  THEN:  the full shell-layout lane exits 0; Header/Footer script-free assertions unchanged;
         the exemption pins the script's contract markers (is:inline, data-astro-rerun,
         rnr-theme) so the assertion cannot silently admit arbitrary scripts
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real vitest subprocess + real authored source scan
  TEST_FILE:             tests/sprint-02-shell-hero/shell-layout.test.ts (MODIFY)
  VERIFY:                pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts   # exit 0

AC-2: The exemption is narrow, not a hole
  GIVEN: the fixed test
  WHEN:  a scratch copy of DocsLayout.astro gains a second, non-contracted script (scratch
         experiment, reverted — never committed)
  THEN:  the token still fails against that scratch state, proving the assertion detects
         non-contracted scripts
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real authored source scan against a scratch tree state
  VERIFY:                evidence under .tmp/FIX-SHELL-002-1/cycle-1/

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- tests/sprint-02-shell-hero/shell-layout.test.ts (MODIFY)
writeProhibited:
- everything else
--------------------------------------------------------------------------------
READING LIST (max 3)
--------------------------------------------------------------------------------
- tests/sprint-02-shell-hero/shell-layout.test.ts — the failing token (grep SHELL-002-shell-css-token-governed; the '<script' loop)
- apps/docs/src/layouts/DocsLayout.astro:35-50 — SHELL-003's contracted pre-paint script (is:inline + data-astro-rerun; do not edit)
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts:203-207 — precedent for pinning the theme script's contract markers in a test

---
## Cycle 2 verdict (astro-reviewer, 2026-09-12) — APPROVED
All four DONE-WHEN items verified against commit 8cf8ba9 by independent reproduction:
self-closing interloper now FAILS ('expected 2 to be 1', shell-layout.test.ts:311); paired
second script / no-is:inline / no-rnr-theme / duplication all still FAIL; clean lane 3/3 twice;
typecheck + biome exit 0; diff = test file + task-sanctioned .tmp/FIX-SHELL-002-1/cycle-2/ evidence.
Flagged comment residual judged NONEXISTENT: a paired script inside an HTML comment fails the
comment-blind non-contracted check (:301-303) — reproduced; no constructible comment form passes
all three assertions, and comments ship to dist as inert `<!-- ... -->` text.
