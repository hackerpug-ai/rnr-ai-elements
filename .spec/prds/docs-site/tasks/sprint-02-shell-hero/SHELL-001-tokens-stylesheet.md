================================================================================
TASK: SHELL-001 - Author the 18-token oklch stylesheet (global.css): light+dark, radius/layout vars, focus ring, dark-first
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     aa659a8e5bf3fe76514b30bbdd886e6b8ecd53bd
PRIORITY:   P0
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=frontend-designer | reviewer=astro-reviewer
PROPOSED-BY: frontend-designer
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: ?
HUMAN-TEST-HOOK: dark-first-token-render
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Author apps/docs/src/styles/global.css so every later shell/hero/primitive task consumes one vocabulary: the TR-07 table verbatim, radius/measure/layout variables, focus ring, typographic scale, dark-first.
**Success state:** A real `pnpm --filter @rnr-ai-elements/docs build` emits a CSS bundle carrying all 20 custom properties with the exact oklch values, zero hex literals, dark on :root and light scoped to the html light class.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Transcribe the TR-07 oklch values verbatim — the pairs are pre-verified (body 15.8:1/14.6:1, muted ~5.0:1/~7.0:1, destructive >=4.5:1, ring >=3:1); never re-pick or round a value
- MUST: :root (html default) carries the DARK column; every light value lives under a .light-scoped rule — the pre-paint class flip is the only theme mechanism
- MUST: Plain CSS custom properties only — no Tailwind, no @theme, no EC wiring, no new dependency (convergence ruling 1)
- NEVER: Never introduce a hex color literal (e.g. #fff) anywhere in the stylesheet
- NEVER: Never drive colors from a prefers-color-scheme media query — scheme respect belongs to SHELL-003's pre-paint script, not CSS
- NEVER: Never edit apps/example/global.css or anything under packages/** — docs mirror the consumer app's values, they do not feed back
- STRICTLY: The emitted stylesheet must not contain the string 'max-height' (sprint-01 component-page spec pins served HTML)
- STRICTLY: Comment-flag the code-* tokens DOCS-ONLY so sprint-05's TokenTable can label them
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: the built CSS carries all 18 core token names plus code-background/code-foreground with the exact TR-07 oklch pairs, and the radius/measure/layout/typography constants are present
- [ ] AC-2: the default (unclassed html) rule resolves dark — including oklch(0.145 0 0) background — and every light value is scoped under the html .light class with no second mechanism anywhere
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: Real build emits the complete token vocabulary with exact oklch values
  GIVEN: the repo checkout with the docs build chain green and (RED at start) no token stylesheet
  WHEN:  the test runs `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, then scans every dist/_astro/*.css bundle and the authored global.css
  THEN:  the built CSS carries all 18 core token names plus code-background/code-foreground with the exact TR-07 oklch pairs, and the radius/measure/layout/typography constants are present
  FLOW_REF:              FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real pnpm workspace filter + real Astro 7 build + real filesystem (dist/_astro CSS bundles)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-first-paint.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_docs_css: run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, capturing stdout and exit code, read every file matching apps/docs/dist/_astro/*.css from the real filesystem, assert each of the 18 core token names plus --code-background/--code-foreground appears with both theme values
      MUST_OBSERVE: exit code == 0; built CSS contains `--background: oklch(0.145 0 0)` (dark) and `--background: oklch(1 0 0)` (light); built CSS contains `--foreground: oklch(0.985 0 0)` (dark) and `--foreground: oklch(0.145 0 0)` (light); built CSS contains `--primary: oklch(0.922 0 0)` (dark) and `--primary: oklch(0.205 0 0)` (light); built CSS contains `--destructive: oklch(0.577 0.245 27.325)` (light) and `--destructive: oklch(0.704 0.191 22.216)` (dark); built CSS contains `--code-background: oklch(0.235 0 0)` and `--code-foreground: oklch(0.922 0 0)` (dark column); all 9 remaining core token names present: --card-foreground, --popover-foreground, --primary-foreground, --secondary-foreground, --accent-foreground, --muted-foreground, --border, --input, --ring (9 of 9)
      MUST_NOT_OBSERVE: any hex color literal matching #[0-9a-fA-F]{3,8} (e.g. `#fff`) in the emitted token rules; a missing token name (e.g. no `--ring` declaration anywhere); `--background: oklch(1 0 0)` on the default unclassed rule
    START_REF authored_global_css: read apps/docs/src/styles/global.css from the real working tree, assert the layout/radius/typography constants and the calc derivatives
      MUST_OBSERVE: `--radius: 0.625rem` plus sm/md/lg/xl calc(...) derivatives; `--measure: 70ch`; `--layout-header-h: 3.5rem`, `--layout-sidebar-w: 16.5rem`, `--layout-toc-w: 14rem`; h1 scale carries `2.25rem`, line-height `1.2`, weight `600`; a focus-ring contract referencing --ring with a 2px ring pattern
      MUST_NOT_OBSERVE: `--radius` absent or set to another value (e.g. `0.5rem`); missing --layout-* variables; the string `max-height` anywhere in the stylesheet
    NEGATIVE_CONTROL: would fail if global.css is a static shell naming tokens without values (name grep passes, value grep fails); values are re-picked or rounded — e.g. dark --background written oklch(0.15 0 0) instead of oklch(0.145 0 0)…

AC-2: Dark-first default with the class flip as the single theme mechanism
  GIVEN: the authored global.css from AC-1
  WHEN:  the test parses the stylesheet's rule structure and checks which selector carries which theme column
  THEN:  the default (unclassed html) rule resolves dark — including oklch(0.145 0 0) background — and every light value is scoped under the html .light class with no second mechanism anywhere
  FLOW_REF:              FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real Astro 7 build + real filesystem (authored + emitted CSS rule structure)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-first-paint.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF authored_global_css: read apps/docs/src/styles/global.css, assert the default rule declares the dark column and a .light-scoped rule declares the light column, assert no @media (prefers-color-scheme) block appears anywhere in the stylesheet
      MUST_OBSERVE: the default rule declares `--background: oklch(0.145 0 0)`; a rule scoped to the html light class (e.g. `html.light` / `.light`) declares `--background: oklch(1 0 0)`; the dark `--foreground` value `oklch(0.985 0 0)` sits on the default rule
      MUST_NOT_OBSERVE: the string `prefers-color-scheme` anywhere in global.css; `--background: oklch(1 0 0)` on the default unclassed rule
    NEGATIVE_CONTROL: would fail if the stylesheet is light-first (:root carries oklch(1 0 0)) — the site would flash light before SHELL-003's script adds the class; a prefers-color-scheme media query duplicates the theme mechanism, racing the pre-paint script…

--------------------------------------------------------------------------------
## Amendments

- 2026-09-11 (orchestrator, driven by reviewer cycle-1 verdict, .kb-run-sprint/sprint-02-shell-hero/SHELL-001/cycle-1.verdict.json): SCOPE.writeAllowed extended with apps/docs/astro.config.mjs and apps/docs/src/layouts/spike.astro. Evidence: Astro 7.3.2 default build.inlineStylesheets:'auto' inlines the imported sheet and emits ZERO dist/_astro/*.css bundles, so AC-1/AC-2's built-emission halves are structurally red in the committed state (reviewer reproduced: vitest exit 1 at tokens.test.ts:233/315; isolation run proves the config line independently required; with both wiring lines the full lane passes 2/2 exit 0). No sprint-02 task owns astro.config.mjs (zero references across all 13 task files). The spike.astro import is real interim wiring: /components/[item] serves through spike.astro until SHELL-008 retires it, and SHELL-002's DocsLayout import supersedes it for adopted pages. A separate FIX task was rejected as structurally circular (config-only task cannot prove token-CSS emission before global.css exists on trunk).

TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: The real build's emitted CSS contains all 18 core token names plus --code-background/--code-foreground, each with its exact TR-07 light and dark oklch values.
- TC-2 [edge, → AC-1]: Neither the authored global.css nor the emitted CSS bundle contains a hex color literal, and the string 'max-height' appears nowhere in the stylesheet.
- TC-3 [happy_path, → AC-1]: global.css declares --radius 0.625rem with calc derivatives, --measure 70ch, --layout-header-h 3.5rem, --layout-sidebar-w 16.5rem, --layout-toc-w 14rem, the h1 2.25rem/1.2/600 scale, and a --ring-based 2px focus-ring contract.
- TC-4 [edge, → AC-2]: The default rule carries the dark column (background oklch(0.145 0 0)), the light column is scoped to the html .light class, and no prefers-color-scheme media query exists in the stylesheet.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/styles/global.css (NEW)
- tests/sprint-02-shell-hero/tokens.test.ts (NEW)
- tests/sprint-02-shell-hero/theme-first-paint.spec.ts (NEW)
- apps/docs/astro.config.mjs (MODIFY — AMENDED 2026-09-11, see Amendments)
- apps/docs/src/layouts/spike.astro (MODIFY — AMENDED 2026-09-11, see Amendments)
writeProhibited:
- packages/**
- apps/example/global.css
- apps/docs/src/pages/**
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Zero hex literals; WCAG AA pairs hold in both themes
- Dark-first: :root carries the dark column, light keys on the html light class so the pre-paint class flip is the ONLY theme mechanism
- Plain CSS custom properties consumed by scoped component styles — NO Tailwind/EC dependency this sprint (named remainder, convergence ruling 1)
- The served HTML must never contain the string 'max-height' (pinned by the sprint-01 component-page spec)
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md lines 15-29 — PRIMARY PATTERN — the TR-07 style-token table: transcribe verbatim (18 core + 2 DOCS-ONLY code tokens, exact oklch pairs, radius/measure/layout constants, typographic scale)
- apps/example/global.css lines 49-102 — provenance mirror — the consumer app's theme block; docs values must read as the same product (read-only, never edited)
- tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts lines 1-80 — real-build subprocess pattern: spawn `pnpm --filter @rnr-ai-elements/docs build`, capture stdout/exit, stat real dist artifacts
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts lines 17-62 — static source-scan pattern over the real apps/docs/src tree with zero-hex/zero-forbidden-string assertions
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: single plain-CSS custom-property sheet on :root (dark column) + one .light-scoped override block, consumed by scoped component styles via var()
Source: .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md:15-29
Anti-pattern: Tailwind @theme / EC theme wiring this sprint (convergence ruling 1), a prefers-color-scheme media block (second theme mechanism racing the pre-paint script), or hex literals anywhere in the sheet
Interaction notes:
- Dark-first: a visitor with no stored choice and no OS preference sees dark; only the html .light class (set pre-paint by SHELL-003) ever shows light
- code-* tokens are docs-surface-only (install strips, future EC frames) — flag them so the TokenTable can label them DOCS-ONLY
- Font tokens declare family names now; the self-hosted Spline Sans woff2 files are sprint-05's named remainder (no font binaries exist in the repo)
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- token sheet contract: `pnpm vitest run tests/sprint-02-shell-hero/tokens.test.ts -t SHELL-001`
  expected: exit 0 — 20 tokens with exact oklch pairs in the built CSS, radius/measure/layout/typography constants present
- dark-first single mechanism: `pnpm vitest run tests/sprint-02-shell-hero/tokens.test.ts -t SHELL-001-dark-first-single-mechanism`
  expected: exit 0 — dark on :root, light scoped to html .light, zero prefers-color-scheme blocks
- typecheck: `pnpm typecheck`
  expected: exit 0
- lint (never `pnpm lint` — crashes locally): `./node_modules/.bin/biome ci apps/docs/src/styles/global.css tests/sprint-02-shell-hero/tokens.test.ts`
  expected: exit 0
- RED-first evidence: `pnpm vitest run tests/sprint-02-shell-hero/tokens.test.ts -t SHELL-001 (before authoring global.css)`
  expected: FAIL — global.css absent, no bundle carries the tokens; record the RED output
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: (none)
Blocks:     SHELL-002, SHELL-005, SHELL-003 (consumes the .light class contract), SHELL-007
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
Transcribe the TR-07 style-token table exactly (18 tokens, code-* flagged DOCS-ONLY). Values mirror apps/example/global.css so docs and gallery read as one product. Import once from DocsLayout so every route inherits it. Lane proof: tokens.test.ts runs the real build and asserts the emitted CSS carries every token with the exact oklch values, zero hex, dark-first on :root with light scoped to the html .light class.
Coding standards:
- Plain CSS custom properties; no preprocessor, no framework utility classes this sprint
- One declaration per line, token blocks commented with the TR-07 usage column (Page canvas, Body text, ...)
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)
Capability: touches=['CAP-DOCS-01'] provides=5 items consumes=2 items; boundary_contracts=4
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-001",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_docs_css": {
   "description": "Docs site built through the real ordered chain (registry:build -> gallery:manifest -> astro build), exit 0, dist/_astro/*.css bundles on disk. RED at sprint start: apps/docs/src/styles/global.css does not exist, so no bundle carries the tokens.",
   "seed_method": "build_artifact",
   "records": [
    "pnpm --filter @rnr-ai-elements/docs build exit 0",
    "at least one dist/_astro/*.css file exists with size > 0"
   ]
  },
  "authored_global_css": {
   "description": "apps/docs/src/styles/global.css as authored by this task, read from the real working tree at run time. RED at start: file absent, the read fails.",
   "seed_method": "build_artifact",
   "records": [
    "file apps/docs/src/styles/global.css exists",
    "contains --radius, --measure, --layout-header-h, --layout-sidebar-w, --layout-toc-w declarations"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the repo checkout with the docs build chain green and (RED at start) no token stylesheet WHEN the test runs `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, then scans every dist/_astro/*.css bundle and the authored global.css THEN the built CSS carries all 18 core token names plus code-background/code-foreground with the exact TR-07 oklch pairs, and the radius/measure/layout/typography constants are present",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_file": "tests/sprint-02-shell-hero/theme-first-paint.spec.ts",
   "test_function": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_tier": "integration",
   "verification_service": "real pnpm workspace filter + real Astro 7 build + real filesystem (dist/_astro CSS bundles)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real pnpm workspace filter + real Astro 7 build + real filesystem",
    "negative_control": {
     "would_fail_if": [
      "global.css is a static shell naming tokens without values (name grep passes, value grep fails)",
      "values are re-picked or rounded \u2014 e.g. dark --background written oklch(0.15 0 0) instead of oklch(0.145 0 0)",
      "the file is authored but never emitted into a built CSS bundle (build never ran, or the file sits outside the Astro compile graph)",
      "a hex fallback like #fff replaces any oklch value"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_docs_css",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, capturing stdout and exit code",
        "read every file matching apps/docs/dist/_astro/*.css from the real filesystem",
        "assert each of the 18 core token names plus --code-background/--code-foreground appears with both theme values"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code == 0",
        "built CSS contains `--background: oklch(0.145 0 0)` (dark) and `--background: oklch(1 0 0)` (light)",
        "built CSS contains `--foreground: oklch(0.985 0 0)` (dark) and `--foreground: oklch(0.145 0 0)` (light)",
        "built CSS contains `--primary: oklch(0.922 0 0)` (dark) and `--primary: oklch(0.205 0 0)` (light)",
        "built CSS contains `--destructive: oklch(0.577 0.245 27.325)` (light) and `--destructive: oklch(0.704 0.191 22.216)` (dark)",
        "built CSS contains `--code-background: oklch(0.235 0 0)` and `--code-foreground: oklch(0.922 0 0)` (dark column)",
        "all 9 remaining core token names present: --card-foreground, --popover-foreground, --primary-foreground, --secondary-foreground, --accent-foreground, --muted-foreground, --border, --input, --ring (9 of 9)"
       ],
       "must_not_observe": [
        "any hex color literal matching #[0-9a-fA-F]{3,8} (e.g. `#fff`) in the emitted token rules",
        "a missing token name (e.g. no `--ring` declaration anywhere)",
        "`--background: oklch(1 0 0)` on the default unclassed rule"
       ]
      }
     },
     {
      "start_ref": "authored_global_css",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read apps/docs/src/styles/global.css from the real working tree",
        "assert the layout/radius/typography constants and the calc derivatives"
       ]
      },
      "end_state": {
       "must_observe": [
        "`--radius: 0.625rem` plus sm/md/lg/xl calc(...) derivatives",
        "`--measure: 70ch`",
        "`--layout-header-h: 3.5rem`, `--layout-sidebar-w: 16.5rem`, `--layout-toc-w: 14rem`",
        "h1 scale carries `2.25rem`, line-height `1.2`, weight `600`",
        "a focus-ring contract referencing --ring with a 2px ring pattern"
       ],
       "must_not_observe": [
        "`--radius` absent or set to another value (e.g. `0.5rem`)",
        "missing --layout-* variables",
        "the string `max-height` anywhere in the stylesheet"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "AC-2",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the authored global.css from AC-1 WHEN the test parses the stylesheet's rule structure and checks which selector carries which theme column THEN the default (unclassed html) rule resolves dark \u2014 including oklch(0.145 0 0) background \u2014 and every light value is scoped under the html .light class with no second mechanism anywhere",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_file": "tests/sprint-02-shell-hero/theme-first-paint.spec.ts",
   "test_function": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_tier": "integration",
   "verification_service": "real Astro 7 build + real filesystem (authored + emitted CSS rule structure)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real Astro 7 build + real filesystem",
    "negative_control": {
     "would_fail_if": [
      "the stylesheet is light-first (:root carries oklch(1 0 0)) \u2014 the site would flash light before SHELL-003's script adds the class",
      "a prefers-color-scheme media query duplicates the theme mechanism, racing the pre-paint script",
      "both theme columns sit on :root so the class flip changes nothing"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_global_css",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read apps/docs/src/styles/global.css",
        "assert the default rule declares the dark column and a .light-scoped rule declares the light column",
        "assert no @media (prefers-color-scheme) block appears anywhere in the stylesheet"
       ]
      },
      "end_state": {
       "must_observe": [
        "the default rule declares `--background: oklch(0.145 0 0)`",
        "a rule scoped to the html light class (e.g. `html.light` / `.light`) declares `--background: oklch(1 0 0)`",
        "the dark `--foreground` value `oklch(0.985 0 0)` sits on the default rule"
       ],
       "must_not_observe": [
        "the string `prefers-color-scheme` anywhere in global.css",
        "`--background: oklch(1 0 0)` on the default unclassed rule"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The real build's emitted CSS contains all 18 core token names plus --code-background/--code-foreground, each with its exact TR-07 light and dark oklch values.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/tokens.test.ts -t SHELL-001-token-sheet-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Neither the authored global.css nor the emitted CSS bundle contains a hex color literal, and the string 'max-height' appears nowhere in the stylesheet.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/tokens.test.ts -t SHELL-001-token-sheet-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "global.css declares --radius 0.625rem with calc derivatives, --measure 70ch, --layout-header-h 3.5rem, --layout-sidebar-w 16.5rem, --layout-toc-w 14rem, the h1 2.25rem/1.2/600 scale, and a --ring-based 2px focus-ring contract.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/tokens.test.ts -t SHELL-001-token-sheet-contract"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "The default rule carries the dark column (background oklch(0.145 0 0)), the light column is scoped to the html .light class, and no prefers-color-scheme media query exists in the stylesheet.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/tokens.test.ts -t SHELL-001-dark-first-single-mechanism"
  }
 ]
}
-->
