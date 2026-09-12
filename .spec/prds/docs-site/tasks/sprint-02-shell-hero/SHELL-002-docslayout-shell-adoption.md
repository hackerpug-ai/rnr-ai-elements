================================================================================
TASK: SHELL-002 - DocsLayout base + sticky Header (nav, theme slot) + Footer + zero-JS mobile drawer; adopt on ledger, components index, and island-demo pages
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     fd6ad402fd5d41ee3b4f6cc0af61c5bfedbee126
PRIORITY:   P0
POINTS:     5   # Fibonacci story points — relative size, never time
AGENT:      implementer=frontend-designer | reviewer=astro-reviewer
PROPOSED-BY: frontend-designer
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: ?
HUMAN-TEST-HOOK: sticky-header-shell-everywhere
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Build the DocsLayout/Header/Footer shell per wireframe R1/R14 and adopt it on the three sprint-01 pages that exist outside the hero and item routes, so the site reads as one themed product.
**Success state:** A real build emits registry/index.html, components/index.html, and islands/copy-button/index.html each carrying the sticky header (wordmark, Components/Registry nav, theme mount), the zero-JS <details> drawer, the footer, and a linked token stylesheet — with every sprint-01 selector contract intact.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Header is exactly --layout-header-h (3.5rem) tall and position: sticky; anchored sections compensate via scroll-margin-top
- MUST: The mobile drawer is a <details> element operable with zero JavaScript; touch targets >=44px; reduced-motion guards on any transition
- MUST: DocsLayout imports SHELL-001's global.css exactly once so every adopting route inherits the token vocabulary; the head exposes the slot SHELL-003's pre-paint script fills
- MUST: Every sprint-01 selector contract on adopted routes keeps passing: ledger table rows on /registry, family section[id] anchors + ul li rows on /components
- NEVER: Never render a fake Cmd+K dialog or a search island — the trigger stays an inert slot (SearchDialog is a later sprint's island)
- NEVER: Never add a ThemeToggle implementation — this task provides only the mount point; the island is SHELL-003's
- NEVER: Never adopt DocsLayout on index.astro or components/[item].astro — those switch inside SHELL-007/SHELL-008 to keep write lanes disjoint
- NEVER: Never delete layouts/spike.astro — its deletion belongs to SHELL-008 (the last page off it)
- STRICTLY: Authored Header/Footer/DocsLayout styles carry zero hex literals — everything resolves through var(--*) tokens
- STRICTLY: No new customElements.define site and no <script> in these components — island count stays exactly one (rnr-copy-button) until SHELL-003
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: each built page carries the header (RNR wordmark + Components/Registry nav + a ThemeToggle mount point), the footer, the zero-JS <details> drawer, and a <link rel="stylesheet"> to the built token CSS — and no page imports spike.astro anymore
- [ ] AC-2: the header is position: sticky consuming --layout-header-h, anchored content carries scroll-margin-top, and Header/Footer/DocsLayout styles contain zero hex literals and zero script tags
- [ ] AC-3: /registry keeps its ledger table rows; /components keeps its family section[id] anchors and ul li item rows — the sprint-01 ledger and spike-flow specs keep passing without modification
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: Adopted routes render the themed DocsLayout shell in the real build
  GIVEN: the repo with SHELL-001's global.css landed and (RED at start) all three pages still importing spike.astro
  WHEN:  the test runs the real filtered build and reads dist/registry/index.html, dist/components/index.html, and dist/islands/copy-button/index.html
  THEN:  each built page carries the header (RNR wordmark + Components/Registry nav + a ThemeToggle mount point), the footer, the zero-JS <details> drawer, and a <link rel="stylesheet"> to the built token CSS — and no page imports spike.astro anymore
  FLOW_REF:              FLOW-SHELL-01-theme-toggle-persisted-flash-free
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real pnpm workspace filter + real Astro 7 build + real filesystem (dist HTML)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-toggle.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-01-theme-toggle-persisted-flash-free
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_adopted_routes: run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, capturing stdout and exit code, read the three built HTML files from dist/, assert the shell structure and stylesheet link in each
      MUST_OBSERVE: exit code == 0; each of the three files contains `<header` and the wordmark text `RNR`; each contains a nav link `href="/components"` and a nav link `href="/registry"`; each contains a ThemeToggle mount point element in the header (the slot SHELL-003 fills, e.g. an element with a data-theme-slot/theme-toggle-mount marker); each contains `<footer` and `<details` (the zero-JS drawer); each contains `<link rel="stylesheet"` whose href matches /_astro/.*\.css; the built CSS contains the SHELL-001 token `--background: oklch(0.145 0 0)`
      MUST_NOT_OBSERVE: any of the three files with zero occurrences of `<header`; a `<dialog` element anywhere in the three files (fake search); any occurrence of `spike` import residue — the three page sources no longer reference layouts/spike.astro
    NEGATIVE_CONTROL: would fail if DocsLayout exists but the pages still import spike.astro — dist HTML would lack <header>/<footer>/<details>; the shell markup is authored but global.css is never linked (a token-less shell: no /_astro/*.css link in the built head)…

AC-2: Shell CSS is token-governed: sticky header at --layout-header-h with scroll-margin compensation
  GIVEN: the authored shell components from AC-1 and the SHELL-001 token sheet
  WHEN:  the test scans the built CSS bundles and the authored shell sources
  THEN:  the header is position: sticky consuming --layout-header-h, anchored content carries scroll-margin-top, and Header/Footer/DocsLayout styles contain zero hex literals and zero script tags
  FLOW_REF:              FLOW-SHELL-01-theme-toggle-persisted-flash-free
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real Astro 7 build + real filesystem (built CSS + authored component sources)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-toggle.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-01-theme-toggle-persisted-flash-free
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF authored_shell_sources: read the built dist/_astro/*.css bundles and the authored DocsLayout/Header/Footer sources, assert the sticky/scroll-margin declarations and the token-only styling
      MUST_OBSERVE: built CSS contains `position: sticky` on the header rule consuming `var(--layout-header-h)` (resolving 3.5rem); built CSS contains `scroll-margin-top` on anchored content (sections/headings); Header.astro/Footer.astro/DocsLayout.astro reference at least `--background`, `--foreground`, `--border`, `--primary` via var(); drawer/transition rules carry a reduced-motion guard (`prefers-reduced-motion`)
      MUST_NOT_OBSERVE: a hex color literal matching #[0-9a-fA-F]{3,8} in the three authored shell components; a `<script` tag in Header.astro, Footer.astro, or DocsLayout.astro; `position: fixed` on the header
    NEGATIVE_CONTROL: would fail if the header is styled with raw pixel heights and position: static — the sticky-at-scrollY-1000 clause of FLOW-SHELL-01 could never hold; the shell styles hand-pick colors (hex or raw oklch literals) instead of consuming var(--*) tokens…

AC-3: Sprint-01 DOM contracts survive adoption unchanged
  GIVEN: the built adopted routes from AC-1
  WHEN:  the test asserts the sprint-01-pinned selectors inside the new shell markup
  THEN:  /registry keeps its ledger table rows; /components keeps its family section[id] anchors and ul li item rows — the sprint-01 ledger and spike-flow specs keep passing without modification
  FLOW_REF:              FLOW-SHELL-01-theme-toggle-persisted-flash-free
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real Astro 7 build + real filesystem (dist HTML selector structure)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-toggle.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-01-theme-toggle-persisted-flash-free
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_adopted_routes: read dist/components/index.html and count family sections with id attributes and ul li item rows, read dist/registry/index.html and count table rows, assert the shell wraps — not replaces — the sprint-01 content structure
      MUST_OBSERVE: components/index.html contains >=7 family sections carrying id anchors (e.g. id="conversation"); components/index.html contains ul li item rows totalling 39 names; registry/index.html contains a <table> whose row count equals the registry item count (56 today, read from apps/docs/src/data/registry-items.json at run time — never a hand-copied literal)
      MUST_NOT_OBSERVE: 0 family sections with id anchors; 0 table rows in registry/index.html; an item count that differs from the dataset-derived expectation (e.g. 38 after a fixture edit)
    NEGATIVE_CONTROL: would fail if adoption rewraps content and drops the family section[id] anchors — the sprint-01 components-index assertions would 404 their anchors; the ledger table is restructured out of table rows — the sprint-01 ledger row-count assertions would fail…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: The real build's dist/registry/index.html, dist/components/index.html, and dist/islands/copy-button/index.html each contain a <header> with the RNR wordmark, nav links to /components and /registry, a ThemeToggle mount point, a <footer>, a <details> drawer, and a /_astro/*.css stylesheet link.
- TC-2 [edge, → AC-1]: None of the three adopted page sources imports layouts/spike.astro, and no built adopted page contains a <dialog> element.
- TC-3 [happy_path, → AC-2]: The built CSS makes the header position: sticky at var(--layout-header-h) with scroll-margin-top on anchored content; Header/Footer/DocsLayout styles use var(--*) tokens only (zero hex literals) and carry no <script> tag.
- TC-4 [single_source, → AC-3]: dist/components/index.html still holds >=7 id-anchored family sections with 39 ul li item rows, and dist/registry/index.html still holds a table whose row count equals the run-time-derived registry item total.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/layouts/DocsLayout.astro (NEW)
- apps/docs/src/components/Header.astro (NEW)
- apps/docs/src/components/Footer.astro (NEW)
- apps/docs/src/pages/registry.astro (MODIFY)
- apps/docs/src/pages/components/index.astro (MODIFY)
- apps/docs/src/pages/islands/copy-button.astro (MODIFY)
- tests/sprint-02-shell-hero/shell-layout.test.ts (NEW)
- tests/sprint-02-shell-hero/theme-toggle.spec.ts (NEW)
writeProhibited:
- packages/**
- apps/docs/src/pages/index.astro
- apps/docs/src/pages/components/[item].astro
- apps/docs/src/styles/**
- apps/docs/src/layouts/spike.astro (its deletion belongs to SHELL-008, the last page off it)
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Drawer is <details> (zero-JS); header exactly --layout-header-h sticky; touch targets >=44px; reduced-motion guards
- Cmd+K trigger stays an inert slot until the SearchDialog sprint
- Existing sprint-01 ledger/components-index spec selectors (table rows, section[id], ul li) keep passing unchanged
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md lines 78-113 — PRIMARY PATTERN — home wireframe R1/R14: sticky header regions (wordmark, section nav, Cmd+K + theme slots) and the footer DocsLayout slot
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md lines 288-321 — mobile frame M1/M2: the <details> drawer contract, touch targets >=44px, reduced-motion note
- apps/docs/src/layouts/spike.astro lines 1-21 — the bare shell being replaced — the minimal head/body DocsLayout must supersede (title, charset, viewport, slot)
- apps/docs/src/pages/registry.astro lines all — an adopted page: swap the spike import for DocsLayout without disturbing the pinned table-row structure
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts lines 37-62 — the budget this task must not disturb: exactly one customElements.define (rnr-copy-button) until SHELL-003
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: one DocsLayout wrapping head + Header + slot + Footer, pages keep their own content trees; <details> drawer for <lg navigation
Source: .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md:78-113
Anti-pattern: a JS-toggled mobile menu, a fake search dialog, or restyling the ledger/components content structure (adoption wraps — it never rewrites the pinned selectors)
Interaction notes:
- Header height is exactly --layout-header-h (3.5rem) sticky; every anchored section gets scroll-margin-top so deep links land below the header
- Cmd+K renders as an inert slot (e.g. a disabled/hidden trigger placeholder) — never a fake dialog; SearchDialog is a later sprint's island
- The ThemeToggle mount point is a named slot/element in the header so SHELL-003 drops the island in without touching Header markup
- Home variant prop suppresses sidebar+ToC now (consumed by SHELL-007); index.astro itself switches layouts in its owning task
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- themed shell on adopted routes: `pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts -t SHELL-002-themed-shell-on-adopted-routes`
  expected: exit 0 — header/wordmark/nav/mount/footer/details/stylesheet in all three dist pages, no spike import, no <dialog>
- token-governed shell CSS: `pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts -t SHELL-002-shell-css-token-governed`
  expected: exit 0 — sticky var(--layout-header-h), scroll-margin-top, zero hex, zero script tags
- sprint-01 contracts preserved: `pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts -t SHELL-002-sprint01-contracts-preserved`
  expected: exit 0 — >=7 id-anchored family sections, 39 ul li rows, ledger table rows == derived total
- sprint-01 lane still green: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/ledger.spec.ts tests/sprint-01-docs-spike-skeleton/spike-flow.spec.ts`
  expected: exit 0 — adopted routes' existing specs pass unmodified
- typecheck: `pnpm typecheck`
  expected: exit 0
- lint (never `pnpm lint` — crashes locally): `./node_modules/.bin/biome ci apps/docs/src tests/sprint-02-shell-hero/shell-layout.test.ts`
  expected: exit 0
- RED-first evidence: `pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts -t SHELL-002 (before writing the layout/components)`
  expected: FAIL — dist HTML carries no <header>/<footer>/<details>; record the RED output
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-001
Blocks:     SHELL-003 (head slot + Header mount point), SHELL-007 (home variant + index.astro adoption), SHELL-008 ([item].astro adoption + spike deletion), SHELL-009 (/docs/theming renders on DocsLayout)
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
Wireframe binding R1/R14 on every page type that exists after sprint-01. index.astro and [item].astro switch to DocsLayout inside their owning tasks (SHELL-007/SHELL-008) to keep write lanes disjoint. Lane proof: shell-layout.test.ts builds for real and asserts the three adopted dist pages carry the themed shell, token-governed sticky CSS, and every sprint-01 selector contract.
Coding standards:
- Astro 7 strict compiler: valid HTML nesting, closed non-void tags
- Scoped component styles consuming var(--*) tokens only; zero hex literals
- Zero <script> in DocsLayout/Header/Footer — the island count stays one until SHELL-003
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)
Capability: touches=['CAP-DOCS-01'] provides=6 items consumes=1 items; boundary_contracts=3
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-002",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_adopted_routes": {
   "description": "Docs site built through the real chain after adoption, exit 0. RED at task start: the three routes render through layouts/spike.astro \u2014 dist HTML has no <header>, no <footer>, no <details> drawer, and no global.css link.",
   "seed_method": "build_artifact",
   "records": [
    "pnpm --filter @rnr-ai-elements/docs build exit 0",
    "dist/registry/index.html, dist/components/index.html, dist/islands/copy-button/index.html all exist with size > 0",
    "dist/_astro/*.css includes the SHELL-001 token bundle"
   ]
  },
  "authored_shell_sources": {
   "description": "The authored shell files (DocsLayout.astro, Header.astro, Footer.astro) plus the three adopted page sources, read from the real working tree at run time.",
   "seed_method": "build_artifact",
   "records": [
    "apps/docs/src/layouts/DocsLayout.astro, apps/docs/src/components/Header.astro, apps/docs/src/components/Footer.astro exist",
    "registry.astro, components/index.astro, islands/copy-button.astro import DocsLayout, not spike.astro"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the repo with SHELL-001's global.css landed and (RED at start) all three pages still importing spike.astro WHEN the test runs the real filtered build and reads dist/registry/index.html, dist/components/index.html, and dist/islands/copy-button/index.html THEN each built page carries the header (RNR wordmark + Components/Registry nav + a ThemeToggle mount point), the footer, the zero-JS <details> drawer, and a <link rel=\"stylesheet\"> to the built token CSS \u2014 and no page imports spike.astro anymore",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_file": "tests/sprint-02-shell-hero/theme-toggle.spec.ts",
   "test_function": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_tier": "integration",
   "verification_service": "real pnpm workspace filter + real Astro 7 build + real filesystem (dist HTML)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real pnpm workspace filter + real Astro 7 build + real filesystem",
    "negative_control": {
     "would_fail_if": [
      "DocsLayout exists but the pages still import spike.astro \u2014 dist HTML would lack <header>/<footer>/<details>",
      "the shell markup is authored but global.css is never linked (a token-less shell: no /_astro/*.css link in the built head)",
      "a fake Cmd+K <dialog> is rendered to look complete \u2014 the assertion set bans <dialog>"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_adopted_routes",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, capturing stdout and exit code",
        "read the three built HTML files from dist/",
        "assert the shell structure and stylesheet link in each"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code == 0",
        "each of the three files contains `<header` and the wordmark text `RNR`",
        "each contains a nav link `href=\"/components\"` and a nav link `href=\"/registry\"`",
        "each contains a ThemeToggle mount point element in the header (the slot SHELL-003 fills, e.g. an element with a data-theme-slot/theme-toggle-mount marker)",
        "each contains `<footer` and `<details` (the zero-JS drawer)",
        "each contains `<link rel=\"stylesheet\"` whose href matches /_astro/.*\\.css",
        "the built CSS contains the SHELL-001 token `--background: oklch(0.145 0 0)`"
       ],
       "must_not_observe": [
        "any of the three files with zero occurrences of `<header`",
        "a `<dialog` element anywhere in the three files (fake search)",
        "any occurrence of `spike` import residue \u2014 the three page sources no longer reference layouts/spike.astro"
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
   "description": "GIVEN the authored shell components from AC-1 and the SHELL-001 token sheet WHEN the test scans the built CSS bundles and the authored shell sources THEN the header is position: sticky consuming --layout-header-h, anchored content carries scroll-margin-top, and Header/Footer/DocsLayout styles contain zero hex literals and zero script tags",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_file": "tests/sprint-02-shell-hero/theme-toggle.spec.ts",
   "test_function": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_tier": "integration",
   "verification_service": "real Astro 7 build + real filesystem (built CSS + authored component sources)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real Astro 7 build + real filesystem",
    "negative_control": {
     "would_fail_if": [
      "the header is styled with raw pixel heights and position: static \u2014 the sticky-at-scrollY-1000 clause of FLOW-SHELL-01 could never hold",
      "the shell styles hand-pick colors (hex or raw oklch literals) instead of consuming var(--*) tokens",
      "a <script> sneaks into Header/Footer/DocsLayout \u2014 the island budget test would catch a define site, but this bans the script tag itself"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_shell_sources",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read the built dist/_astro/*.css bundles and the authored DocsLayout/Header/Footer sources",
        "assert the sticky/scroll-margin declarations and the token-only styling"
       ]
      },
      "end_state": {
       "must_observe": [
        "built CSS contains `position: sticky` on the header rule consuming `var(--layout-header-h)` (resolving 3.5rem)",
        "built CSS contains `scroll-margin-top` on anchored content (sections/headings)",
        "Header.astro/Footer.astro/DocsLayout.astro reference at least `--background`, `--foreground`, `--border`, `--primary` via var()",
        "drawer/transition rules carry a reduced-motion guard (`prefers-reduced-motion`)"
       ],
       "must_not_observe": [
        "a hex color literal matching #[0-9a-fA-F]{3,8} in the three authored shell components",
        "a `<script` tag in Header.astro, Footer.astro, or DocsLayout.astro",
        "`position: fixed` on the header"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "AC-3",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the built adopted routes from AC-1 WHEN the test asserts the sprint-01-pinned selectors inside the new shell markup THEN /registry keeps its ledger table rows; /components keeps its family section[id] anchors and ul li item rows \u2014 the sprint-01 ledger and spike-flow specs keep passing without modification",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_file": "tests/sprint-02-shell-hero/theme-toggle.spec.ts",
   "test_function": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_tier": "integration",
   "verification_service": "real Astro 7 build + real filesystem (dist HTML selector structure)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real Astro 7 build + real filesystem",
    "negative_control": {
     "would_fail_if": [
      "adoption rewraps content and drops the family section[id] anchors \u2014 the sprint-01 components-index assertions would 404 their anchors",
      "the ledger table is restructured out of table rows \u2014 the sprint-01 ledger row-count assertions would fail",
      "the ul li item rows become divs \u2014 the pinned selectors stop matching"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_adopted_routes",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read dist/components/index.html and count family sections with id attributes and ul li item rows",
        "read dist/registry/index.html and count table rows",
        "assert the shell wraps \u2014 not replaces \u2014 the sprint-01 content structure"
       ]
      },
      "end_state": {
       "must_observe": [
        "components/index.html contains >=7 family sections carrying id anchors (e.g. id=\"conversation\")",
        "components/index.html contains ul li item rows totalling 39 names",
        "registry/index.html contains a <table> whose row count equals the registry item count (56 today, read from apps/docs/src/data/registry-items.json at run time \u2014 never a hand-copied literal)"
       ],
       "must_not_observe": [
        "0 family sections with id anchors",
        "0 table rows in registry/index.html",
        "an item count that differs from the dataset-derived expectation (e.g. 38 after a fixture edit)"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The real build's dist/registry/index.html, dist/components/index.html, and dist/islands/copy-button/index.html each contain a <header> with the RNR wordmark, nav links to /components and /registry, a ThemeToggle mount point, a <footer>, a <details> drawer, and a /_astro/*.css stylesheet link.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts -t SHELL-002-themed-shell-on-adopted-routes"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "None of the three adopted page sources imports layouts/spike.astro, and no built adopted page contains a <dialog> element.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts -t SHELL-002-themed-shell-on-adopted-routes"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The built CSS makes the header position: sticky at var(--layout-header-h) with scroll-margin-top on anchored content; Header/Footer/DocsLayout styles use var(--*) tokens only (zero hex literals) and carry no <script> tag.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts -t SHELL-002-shell-css-token-governed"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "dist/components/index.html still holds >=7 id-anchored family sections with 39 ul li item rows, and dist/registry/index.html still holds a table whose row count equals the run-time-derived registry item total.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/shell-layout.test.ts -t SHELL-002-sprint01-contracts-preserved"
  }
 ]
}
-->
