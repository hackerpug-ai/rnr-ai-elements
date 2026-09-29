================================================================================
TASK: GBC-018 - Home boundary teaser (R11): the one-line hero teaser + anchor to the boundary page
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     1
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner (orchestrator ask-3, 2026-09-29)
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- add the R11 boundary teaser to the hero region inside <main class="hero"> in apps/docs/src/pages/index.astro: one line of teaser copy plus exactly one anchor <a href="/docs/owns-vs-does-not-own">
- render the teaser with the existing Callout component (variant info, the anchor riding its slot="link") — the R11 wireframe idiom (TR-07 home wireframe: "Boundary teaser | Callout (NEW) | Info-aside linking the canonical boundary page")
- update index.astro's SHELL-007 doc comment so it stops deferring R11 (R10 quickstart strip and R12 QR stay deferred; R11 lands here)
- keep the teaser zero-JS and token-governed: Callout's own scoped styles, no new component, no new stylesheet block unless one token-scaled placement rule is unavoidable
NEVER:
- never add a second anchor with href /docs/owns-vs-does-not-own anywhere on / — not in main, not in Header/Footer chrome: the locked observation reads exactly 1 scoped to main, and the whole-page diagnostic count must also read 1
- never render boundary facts as a table on home — the teaser is one line plus a link, not a second copy of the boundary tables
- never edit tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts (GBC-003 authors and owns it; the assertion this task satisfies must not move)
- never touch any file other than apps/docs/src/pages/index.astro
STRICTLY:
- the anchor href is exactly /docs/owns-vs-does-not-own (no trailing slash, no query, no fragment) so the spec's attribute selector main a[href="/docs/owns-vs-does-not-own"] matches
- the teaser sits inside <main> (the hero region) — Header/Footer anchors fall outside the spec's main scope and would double the whole-page count
- the verify runs GBC-003's committed boundary-tables.spec.ts from the trunk: if that spec is absent at this task's close (GBC-003 not yet landed), report AC-1 blocked — never author or substitute a spec (GBC-012's wave-B precedent)
- TDD_MODE is skipped because the RED state is already captured: GBC-003's cycle-1 evidence at checkpoint 3a5118e7a76364f3ac83561ac89e67673f7732fc records the locked verify failing 12/15 with the home teaser count at 0
- teaser copy is structural phrasing only — SHELL-010 owns the copy pass and may reword it later

## Specification
Objective: Land the R11 home boundary teaser — one line plus exactly one anchor to /docs/owns-vs-does-not-own inside the hero <main> of apps/docs/src/pages/index.astro — so GBC-003's locked AC-4 observation (exactly 1 anchor with href /docs/owns-vs-does-not-own on /, scoped to main; 0 boundary tables on /) goes green with zero spec edits.
Success state: The locked FLOW-DOCS-04 verify passes in full over the built preview: / carries exactly one teaser anchor in main, no boundary table, and every test selected by the --grep is green.

## Acceptance Criteria
### AC-1: home hero carries the R11 boundary teaser — exactly one anchor, no table [PRIMARY]
  GIVEN: GBC-003's boundary-tables.spec.ts is on the trunk unmodified and the real docs build of the candidate serves /
  WHEN:  the locked FLOW-DOCS-04 verify runs (docs build, then the spec's --grep over the Playwright-owned preview)
  THEN:  / returns 200 with exactly 1 anchor href /docs/owns-vs-does-not-own scoped to main (whole-page count also 1) and 0 tables containing 'tool executor' in main, and every test selected by the grep passes
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the teaser anchor lands outside main (Header/Footer chrome), so the main-scoped count stays 0 and the spec still fails', 'a second anchor with href /docs/owns-vs-does-not-own lands on / (count 2)', 'the teaser renders boundary facts as a table, tripping the home no-boundary-table check', 'the teaser line is authored but never rendered (disconnected — the anchor is absent from the built page, so the main-scoped count stays 0)']
        EVIDENCE: file_artifact
        - START_REF: home_boundary_teaser_candidate
          ACTION: ['run the FLOW-DOCS-04 run_cmd (docs build then the locked --grep); record the build exit code and the Playwright result', 'goto / and record the response status', 'count main a[href="/docs/owns-vs-does-not-own"] on / and the whole-page anchor count', "count main table elements whose text matches /tool executor/i on /"]
          MUST_OBSERVE: ['the build segment exits 0 and every test selected by the --grep passes (0 failures), the AC-4 home-teaser expectation included', 'HTTP status 200 at /', 'exactly 1 anchor with href /docs/owns-vs-does-not-own scoped to main on / (whole-page count also 1)', "0 tables containing 'tool executor' in main on /"]
          MUST_NOT_OBSERVE: ['a main-scoped anchor count of 0 (teaser outside the hero main) or >= 2 (duplicate anchors)', 'a boundary table on /', 'any edit to boundary-tables.spec.ts in this task diff']

## Test Criteria
- TC-1: the locked FLOW-DOCS-04 verify passes in full: exactly 1 main-scoped anchor href /docs/owns-vs-does-not-own and 0 boundary tables on /  (maps_to: AC-1)

## Reading List
- apps/docs/src/pages/index.astro [THE ONE FILE] — SHELL-007 hero (<main class="hero">) and the R10-R12 deferral comment this task partially lifts
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md — TR-07 home wireframe, R11 row (Boundary teaser | Callout info-aside linking the canonical boundary page)
- apps/docs/src/components/Callout.astro — imported as-is; variant info; the anchor rides slot="link"
- tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts — read-only: GBC-003's locked AC-4 observation (main-scoped anchor count, home no-boundary-table check)
- .kb-run-sprint/sprint-06-guides-boundary-changelog/GBC-003/cycle-1.blocked.json — the blocked report whose scope_impact[0] this task closes

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/pages/index.astro (MODIFY)
WRITE-PROHIBITED:
- tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts (GBC-003 authors and owns it)
- apps/docs/src/content/** (GBC-003's boundary manuscript; techwriting-owned content)
- apps/docs/src/components/** (Callout is imported, never modified)
- apps/docs/src/layouts/**
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md (TR-07 home wireframe, R11 row)', 'tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts (the locked AC-4 observation this satisfies)']
Interaction notes: Closes the scope gap GBC-003's blocked report identified (checkpoint 3a5118e7, scope_impact[0]): AC-4 / UC-DOCS-04's fifth criterion / T-DOCS-032 require home to carry a one-line teaser plus a link, but index.astro was WRITE-PROHIBITED for GBC-003 (apps/docs/src/pages/**) and listed by no sprint-06 task (sprint-03 deferred home's R10-R12 with no owner). The committed spec already asserts main a[href="/docs/owns-vs-does-not-own"] count == 1 and main table filtered by /tool executor/i count == 0 on /; this one-hero-region change flips the verify's only red (AC-4) green with zero spec edits. No wave conflict: no other sprint-06 task lists index.astro in its WRITE-ALLOWED.
Pattern: wireframe-region landing (R11) reusing the existing Callout primitive, verified by another task's locked spec (bare never-edit reference, sprint-02 SHELL-005 precedent)
Anti-pattern: authoring a new spec for an assertion a committed spec already owns; widening the change past the one hero region

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables

## Dependencies
Depends on: none
Blocks:     none

## Amendments
- none (new task, published 2026-09-29 via orchestrator ask-3 after the five-question test on GBC-003's blocked report)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-018",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "home_boundary_teaser_candidate": {
      "description": "apps/docs/src/pages/index.astro carries the R11 boundary teaser (one line plus exactly one anchor href /docs/owns-vs-does-not-own) inside the hero <main>. The ordered docs build produces the dist the Playwright-owned astro preview serves at http://localhost:4321. GBC-003's boundary-tables.spec.ts is on the trunk unmodified. Each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "index.astro's hero <main> renders the teaser via the existing Callout (variant info) with the anchor in its link slot.",
        "No other anchor with href /docs/owns-vs-does-not-own exists anywhere on / (whole-page count 1).",
        "CI=1 makes Playwright start its own strict-port preview on port 4321."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN GBC-003's boundary-tables.spec.ts is on the trunk unmodified and the real docs build of the candidate serves / WHEN the locked FLOW-DOCS-04 verify runs (docs build, then the spec's --grep over the Playwright-owned preview) THEN / returns 200 with exactly 1 anchor href /docs/owns-vs-does-not-own scoped to main (whole-page count also 1) and 0 tables containing 'tool executor' in main, and every test selected by the grep passes",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-018-1",
        "use_case_ref": "UC-DOCS-04",
        "ac_ref": "AC-1",
        "tier": "visible",
        "primary": true,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the teaser anchor lands outside main (Header/Footer chrome), so the main-scoped count stays 0 and the spec still fails",
            "a second anchor with href /docs/owns-vs-does-not-own lands on / (count 2)",
            "the teaser renders boundary facts as a table, tripping the home no-boundary-table check",
            "the teaser line is authored but never rendered (disconnected — the anchor is absent from the built page, so the main-scoped count stays 0)"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-04-boundary-ownership-tables/run.json"
        },
        "cases": [
          {
            "start_ref": "home_boundary_teaser_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "run the FLOW-DOCS-04 run_cmd (docs build then the locked --grep); record the build exit code and the Playwright result",
                "goto / and record the response status",
                "count main a[href=\"/docs/owns-vs-does-not-own\"] on / and the whole-page anchor count",
                "count main table elements whose text matches /tool executor/i on /"
              ]
            },
            "end_state": {
              "must_observe": [
                "the build segment exits 0 and every test selected by the --grep passes (0 failures), the AC-4 home-teaser expectation included",
                "HTTP status 200 at /",
                "exactly 1 anchor with href /docs/owns-vs-does-not-own scoped to main on / (whole-page count also 1)",
                "0 tables containing 'tool executor' in main on /"
              ],
              "must_not_observe": [
                "a main-scoped anchor count of 0 (teaser outside the hero main) or >= 2 (duplicate anchors)",
                "a boundary table on /",
                "any edit to boundary-tables.spec.ts in this task diff"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "the locked FLOW-DOCS-04 verify passes in full: exactly 1 main-scoped anchor href /docs/owns-vs-does-not-own and 0 boundary tables on /",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    }
  ]
}
-->
