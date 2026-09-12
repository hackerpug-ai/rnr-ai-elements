================================================================================
TASK: FIX-GATE-SHELL-013-1 - Theme flow specs: satisfy governed surface lint + write declared flow artifacts
================================================================================
TASK_TYPE:  FIX
STATUS:     Completed (landed)
COMMIT:     6cc940a0829da7884968be159f8054efc6b6b359
PRIORITY:   P0
POINTS:     1
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: orchestrator (human-gate run 2026-09-12: FLOW-SHELL-01/02 FAIL on surface_ok=False + artifact_fresh=False)
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=false
SPRINT:     sprint-02-shell-hero | WAVE: GATE-FIX (Depends on: none)
RUNTIME_COMMANDS:
  test:      pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash
             pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
  lint:      python3 ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py --test <spec> --emit <out> --governed --policy .spec/e2e-policy/surface.json
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
The human-gate flow runner (run_flow.py) currently grades both theme flows FAIL for reasons
independent of product behavior: (1) e2e_surface_check --governed flags
GENERIC_ROOT_ORACLE on locator('html') success oracles in theme-toggle.spec.ts, and
PRODUCT_TARGET_MISSING in theme-first-paint.spec.ts (its route literals live in a const array,
outside the checker's observation windows); (2) neither spec writes its DECLARED flow artifact
(.tmp/sprint-02-shell-hero/e2e-evidence/<flow>.json) during a run, so run_flow records
artifact_fresh=False. Fix the SPECS (product is correct and stays untouched).
**Success state:** both governed surface lints return surface_ok=true; both locked verify
commands still exit 0; after a run, both declared artifact JSONs are freshly written.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Only these two spec files may change; product source, playwright.config.ts, and all
  other specs stay byte-identical
- NEVER: Never weaken, skip, or delete any existing assertion; the exact oklch equality,
  DCL-first-frame sampling, fresh-context-per-case, and zero-storage discipline all stay
- MUST: Mirror the landed evidence convention from tests/sprint-02-shell-hero/home-hero.spec.ts
  (writeEvidence(flow, observed) writing .tmp/sprint-02-shell-hero/e2e-evidence/<flow>.json)
- MUST: Keep page.evaluate calls as string expressions (no DOM lib in tsconfig)
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [x] AC-1: `python3 ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py --test
      tests/sprint-02-shell-hero/theme-toggle.spec.ts --emit /tmp/s1.json --governed --policy
      .spec/e2e-policy/surface.json` exits 0 (same for theme-first-paint.spec.ts)
- [x] AC-2: after running each locked verify command, the declared artifact
      (.tmp/sprint-02-shell-hero/e2e-evidence/FLOW-SHELL-01-theme-toggle-persisted-flash-free.json
      / FLOW-SHELL-02-first-visit-prefers-dark-no-flash.json) is freshly written by the spec with
      flow + capturedAt + observed fields
- [x] AC-3: both locked verify commands exit 0 with retries 0
- [x] git diff --name-only ⊆ the two spec files
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads)
--------------------------------------------------------------------------------
AC-1: Governed surface lint passes on both specs
  GIVEN: current state where the two lints emit surface_ok=false (RED — capture the outputs)
  WHEN:  the lint runs on the fixed specs
  THEN:  surface_ok=true, zero reasons — theme-toggle via non-generic-root reads (evaluate
         string expressions instead of locator('html')), theme-first-paint via per-route
         navigateLocalhost observation lines carrying the literal routes ('/docs/theming',
         '/components/message') so the product target is in an observation window
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real e2e_surface_check subprocess + real browser run
AC-2: Declared flow artifacts are written by the specs
  GIVEN: artifact_fresh=False today (RED — show the fingerprint unchanged after a run)
  WHEN:  each locked verify command runs
  THEN:  the declared artifact JSON is written by the spec during the run (fresh mtime + content)
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real playwright run + real filesystem
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- tests/sprint-02-shell-hero/theme-toggle.spec.ts (MODIFY)
- tests/sprint-02-shell-hero/theme-first-paint.spec.ts (MODIFY)
writeProhibited:
- everything else
--------------------------------------------------------------------------------
READING LIST (max 3)
--------------------------------------------------------------------------------
- tests/sprint-02-shell-hero/home-hero.spec.ts:42-56 — the writeEvidence convention to mirror
- .tmp/sprint-02-shell-hero/e2e-evidence/FLOW-SHELL-01-theme-toggle-persisted-flash-free.surface.json — the exact lint reasons
- ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py (observation_text/source_regions) — why route literals must sit on observation lines
