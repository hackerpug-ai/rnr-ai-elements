================================================================================
TASK: SHELL-010 - THE COPY PASS: hero statement, not-an-npm phrasing, counter/CTA/tab/toggle microcopy
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     32180eccbad58c99bbd9c215e97c4b2ad3dbe287
PRIORITY:   P1
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=techwriting-implementer | reviewer=techwriting-reviewer
PROPOSED-BY: techwriting-planner
TDD_MODE:   shared | RED_GREEN_REQUIRED: no
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=false requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: F
HUMAN-TEST-HOOK: hero-copy-one-pass-legible
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Sharpen every user-visible string the designed shell and hero surface — hero statement, not-an-npm phrasing, counter/CTA/tab/toggle microcopy, install/copy feedback, theming sentences — to final quality under TR-12, without touching any structure.
**Success state:** A stranger reading the hero top-to-bottom at 1440x900 in one pass understands: universal AI chat and agent UI components for React Native, distributed as a copy-paste registry they own line-by-line, NOT an npm package; every pinned suite (home.spec.ts content assertions, theming-route anchors, component-page anatomy) stays green; zero banned terminology; the copy-delta artifact records the strings this pass landed.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Every deliverable string obeys TR-12: active voice, present tense, second person where the UI addresses the reader, <=25 words per sentence in the hero statement
- MUST: Terminology lock on every touched string: 'engine' (never 'styling engine'/'flavor'), 'registry item' for the 56 (the counter label reads 'Registry items'), 'peers' never 'deps' in prose, 'engine tree', 'verdict', 'dev client'
- MUST: Keep the T-GEND-001 grep set verbatim in the served hero: /not an npm package/i, 'React Native', 'registry' — pinned by home.spec.ts's content assertions
- MUST: CTA accessible names stay byte-exact 'Get started' and 'Browse components'; the four theming anchors ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle') survive the sentence polish — pinned by theming-route.test.ts
- MUST: Capture the pre-pass delta artifact before editing: grep the built HTML showing at least one deliverable string absent (e.g. 'Registry items' → 0 matches), and land it post-pass (>=1 match)
- NEVER: Never change DOM structure, selectors, attributes, component logic, or styles — words only; a structural edit dressed as a copy edit fails SHELL-007/008's suites and this task's review
- NEVER: Never pull doc-page prose forward from Sprint 05 — hero + shell microcopy only
- NEVER: Never write or edit anything under tests/** — spec text updates ride the spec tasks (SHELL-011/012/013 author their assertions against the final copy)
- NEVER: Never touch DependencyPanel.astro (structure or copy) or create any new file under apps/docs/src/pages/docs/**
- NEVER: Never emit marketing adjectives — replace subjective modifiers with the concrete fact or number, or delete them
- STRICTLY: Tab accessible names keep every string a landed spec selects as a substring (playwright role-name matching is substring-based): 'nativewind' and 'uniwind' remain inside the aria shape ('nativewind engine', 'uniwind engine')
- STRICTLY: Section heading text pinned by component-page.spec.ts stays byte-identical; sharpen only labels no spec pins
- STRICTLY: Edits to ThemeToggle.astro and TabGroup.astro are labels/aria strings only; edits to [item].astro are section labels only; edits to theming.astro are sentences only
- STRICTLY: Verify lint via ./node_modules/.bin/biome ci <paths> directly (local pnpm lint crashes)
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: the identity sentence, 'copy-paste registry', and 'NOT an npm package' are present; CTA labels 'Get started'/'Browse components' appear with hrefs '/registry'/'/components'; the 56-counter label reads 'Registry items'; no banned terminology appears; no hero sentence exceeds 25 words
- [ ] AC-2: all four copy-stable anchors ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle') survive the polish; zero placeholder signatures; zero banned terminology; every internal href in the source stays within {/, /components}
- [ ] AC-3: data-section="install" remains the first section value in [item].astro; both island files carry aria-label attributes; none of the touched files contains banned terminology or placeholder signatures
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: Hero copy contract holds in the authored source after the pass
  GIVEN: apps/docs/src/pages/index.astro after SHELL-007's tabbed hero lands and this task's copy pass is applied (words only)
  WHEN:  the unit test reads the authored source file, strips Astro comment blocks, and scans the hero strings
  THEN:  the identity sentence, 'copy-paste registry', and 'NOT an npm package' are present; CTA labels 'Get started'/'Browse components' appear with hrefs '/registry'/'/components'; the 56-counter label reads 'Registry items'; no banned terminology appears; no hero sentence exceeds 25 words
  FLOW_REF:              None
  TEST_TIER:             unit
  VERIFICATION_SERVICE:  real filesystem read of the authored apps/docs/src/pages/index.astro — no runtime, no network, no browser
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED:   Pure file-scan assertion over authored source with zero I/O beyond file reads — the island-budget.test.ts / scaffold.build.test.ts file-scan precedent. The rendered-output proof rides the locked flow specs (SHELL-011's home-hero.spec.ts FLOW-GEND-01/FLOW-GEND-02) and the green-maintained sprint-01 lane at merge; this AC pins the authored strings themselves, which is exactly what a words-only task delivers.
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/copy-pass.test.ts
  TEST_FUNCTION:         SHELL-010-hero-copy-contract
  VERIFY:                pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-hero-copy-contract

AC-2: Theming copy polish preserves the route's copy contract
  GIVEN: apps/docs/src/pages/docs/theming.astro after SHELL-009 landed it and this task's sentence polish is applied (sentences only)
  WHEN:  the unit test reads the authored source file, strips Astro comment blocks, and scans for the anchors, placeholder signatures, banned terminology, and internal hrefs
  THEN:  all four copy-stable anchors ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle') survive the polish; zero placeholder signatures; zero banned terminology; every internal href in the source stays within {/, /components}
  FLOW_REF:              None
  TEST_TIER:             unit
  VERIFICATION_SERVICE:  real filesystem read of the authored apps/docs/src/pages/docs/theming.astro — no runtime, no network, no browser
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED:   Pure file-scan assertion over authored source with zero I/O beyond file reads — the island-budget.test.ts / scaffold.build.test.ts file-scan precedent. The served-page and first-frame-dark proofs ride SHELL-009's narrow lane (theming-route.test.ts) and SHELL-013's locked FLOW-SHELL-02 spec at merge; this AC pins that the polish never drops a fact or gains a dead link.
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/copy-pass.test.ts
  TEST_FUNCTION:         SHELL-010-theming-copy-contract
  VERIFY:                pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-theming-copy-contract

AC-3: Item-page labels and island microcopy stay locked and structurally frozen
  GIVEN: the section-label edits to apps/docs/src/pages/components/[item].astro (labels only) and the label/aria edits to ThemeToggle.astro and TabGroup.astro (labels/aria only)
  WHEN:  the unit test reads the three authored source files and scans section order, aria attributes, and terminology
  THEN:  data-section="install" remains the first section value in [item].astro; both island files carry aria-label attributes; none of the touched files contains banned terminology or placeholder signatures
  FLOW_REF:              None
  TEST_TIER:             unit
  VERIFICATION_SERVICE:  real filesystem read of the authored [item].astro, ThemeToggle.astro, and TabGroup.astro — no runtime, no network, no browser
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED:   Pure file-scan assertion over authored source with zero I/O beyond file reads — the island-budget.test.ts / scaffold.build.test.ts file-scan precedent. The rendered anatomy proof (install-first in the served DOM, both engine commands, byte-matched source) rides SHELL-008's rewritten component-page.spec.ts and SHELL-012's locked FLOW-GEND-20 spec at merge; this AC pins that the label edits changed words only.
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/copy-pass.test.ts
  TEST_FUNCTION:         SHELL-010-microcopy-and-anatomy-contract
  VERIFY:                pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-microcopy-and-anatomy-contract

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: The authored index.astro contains 'Universal AI chat and agent UI components for React Native', 'copy-paste registry', 'NOT an npm package', CTA labels 'Get started' and 'Browse components' with hrefs '/registry' and '/components', and the 'Registry items' counter label, with zero banned terminology.
- TC-2 [happy_path, → AC-1]: No sentence in the hero h1 or statement block of the authored index.astro exceeds 25 words after comment-stripping and tag-stripping.
- TC-3 [happy_path, → AC-2]: The authored theming.astro still contains 'ship no tokens', 'oklch', 'prefers-color-scheme', and 'toggle', with zero placeholder signatures ('coming soon', 'TODO', 'placeholder', 'Lorem'), zero banned terminology, and every internal href within {/, /components}.
- TC-4 [happy_path, → AC-3]: In the authored [item].astro, data-section="install" is the first section value; ThemeToggle.astro and TabGroup.astro each contain an aria-label attribute; none of the three touched files contains banned terminology or placeholder signatures.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/pages/index.astro (MODIFY)
- apps/docs/src/components/islands/ThemeToggle.astro (MODIFY)
- apps/docs/src/components/islands/TabGroup.astro (MODIFY)
- apps/docs/src/pages/components/[item].astro (MODIFY)
- apps/docs/src/pages/docs/theming.astro (MODIFY)
- tests/sprint-02-shell-hero/copy-pass.test.ts (NEW)
writeProhibited:
- apps/docs/src/data/**
- packages/**
- apps/docs/src/components/DependencyPanel.astro structure
- tests/** (except tests/sprint-02-shell-hero/copy-pass.test.ts, this task's narrow unit lane — .spec.ts text updates still ride the spec tasks)
- any new file under apps/docs/src/pages/docs/**
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Terminology lock enforced: 'engine' never 'styling engine'/'flavor'; 'registry item' not 'component' for the 56; 'peers' not 'deps' in prose
- Google style baseline: active voice, short sentences, second person where the UI addresses the reader
- NO doc-page prose pulled forward from Sprint 05 — hero + shell microcopy only
- The T-GEND-001 grep set survives verbatim; nothing reads as marketing
- Every machine-pinned string is an invariant this pass must preserve, not create: the suites pinned by SHELL-007/008/009 stay green byte-for-byte through the edits
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md lines all — [PRIMARY PATTERN] the terminology lock table + Google style baseline every deliverable string is held to
- .spec/prds/docs-site/01-scope.md lines 16-33 — positioning language: copy-paste registry, not-an-npm, owns-vs-does-not boundary phrasing
- apps/docs/src/pages/index.astro lines 32-76 — the exact strings being sharpened — identity h1, statement, counter labels, CTA labels
- tests/sprint-01-docs-spike-skeleton/home.spec.ts lines 165-200 — the pinned copy assertions that must survive byte-for-byte (identity sentence, copy-paste registry, NOT an npm package, CTA names and hrefs)
- tests/sprint-02-shell-hero/theming-route.test.ts lines all — the theming copy-stable anchors and honesty contract the sentence polish must preserve
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: string-only edit pass over frozen component structure — labels, aria text, and sentences changed in place; every machine-pinned string treated as an invariant to preserve
Source: apps/docs/src/pages/index.astro:34-39 (the sprint-01 identity sentence and NOT-an-npm phrasing this pass sharpens)
Anti-pattern: structural edits dressed as copy edits, or marketing voice — subjective adjectives where a number or fact belongs; both fail the pinned suites and the TR-12 review
Interaction notes:
- Shared proof model: every verify command names a test file + function that exists by wave F (home.spec.ts is rewritten by SHELL-007 at wave E keeping every content assertion; theming-route.test.ts lands with SHELL-009 at wave C; component-page.spec.ts is rewritten by SHELL-008 at wave E) — this task writes zero test files by design
- Playwright role-name matching is substring-based: aria shapes like 'nativewind engine' keep any pinned 'nativewind'/'uniwind' selector working; if a rename is ever truly needed, the spec update rides the owning spec task (SHELL-011/012/013), never this task
- Structure is frozen: any DOM, selector, attribute, or style change belongs to SHELL-007/008 and fails their suites plus this task's review; DependencyPanel.astro is untouchable (structure AND copy)
- requires_red_evidence discharges via the pre-pass copy-delta artifact (a deliverable string absent before, present after — e.g. 'Registry items'), captured before any edit; requires_seeded_evidence discharges via the scenario cases over the real rebuilt dist
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- Copy-delta RED capture (before any edit): `grep -c "Registry items" apps/docs/dist/index.html || true`
  expected: 0 matches pre-pass — record with the pre-pass green suite outputs to .tmp/sprint-02-shell-hero/copy-pass/SHELL-010-red.txt (the deliverable string is absent; this is the task's red evidence)
- GREEN — hero copy contract: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract`
  expected: exit 0 (rebuild dist first — the strict-port preview webServer serves the built tree)
- GREEN — theming anchors survive the polish: `pnpm vitest run tests/sprint-02-shell-hero/theming-route.test.ts -t SHELL-009-theming-route-served-with-authored-content`
  expected: exit 0
- GREEN — item-page anatomy: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`
  expected: exit 0 across all 39 pages
- Copy-delta landed: `grep -c "Registry items" apps/docs/dist/index.html`
  expected: >= 1 (rebuild first)
- Terminology lock: `grep -rni "styling engine\|flavor\|registry variant" apps/docs/src/pages/index.astro apps/docs/src/pages/docs/theming.astro apps/docs/src/components/islands/ThemeToggle.astro apps/docs/src/components/islands/TabGroup.astro`
  expected: 0 matches
- Typecheck: `pnpm typecheck`
  expected: exit 0
- Lint: `./node_modules/.bin/biome ci apps/docs/src/pages/index.astro apps/docs/src/pages/docs/theming.astro apps/docs/src/pages/components/[item].astro apps/docs/src/components/islands/ThemeToggle.astro apps/docs/src/components/islands/TabGroup.astro`
  expected: exit 0 (never `pnpm lint` — crashes locally)
- Scope compliance: `git diff --name-only`
  expected: output ⊆ write_allowed (five files, MODIFY only — no new files anywhere)
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-007, SHELL-008, SHELL-009
Blocks:     (none)
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
Words only, structure frozen. Deliverable strings: (1) hero h1 + statement — keep the sprint-01 identity sentence 'Universal AI chat and agent UI components for React Native' unless a sharper one survives the grep contract, then a two-sentence body naming copy-paste distribution and the NOT-an-npm-package fact with the own-every-line consequence; (2) counter labels — 'Version', 'Registry items' (the 56; terminology lock), 'Components', 'UI primitives', 'Libs'; (3) CTA labels exact ('Get started', 'Browse components'); (4) tab labels lowercase engine names + aria-label ('nativewind engine', 'uniwind engine' shape); (5) toggle aria-labels naming the destination theme; (6) install-block caller-side microcopy (the aria-label phrasing index.astro passes to the copy button — CopyButton.astro and its script are NOT in this task's lane); (7) theming.astro sentences polished around the four copy-stable anchors. Each string: active voice, <=25 words per sentence, terminology-locked. Shared proof model (per the harness): this task writes no test files — its behavioral ACs verify through the suites that exist by wave F (home.spec.ts FLOW-GEND-01 content assertions from SHELL-007's rewrite, SHELL-009's theming-route.test.ts anchors, SHELL-008's component-page.spec.ts anatomy), and its red evidence is the pre-pass copy-delta artifact recorded to .tmp/sprint-02-shell-hero/copy-pass/SHELL-010-red.txt. Wave-G spec tasks (SHELL-011/012/013) author their assertions against the final copy this pass lands.
Coding standards:
- Google developer documentation style baseline: active voice, short sentences (<=25 words in the hero statement), second person where the UI addresses the reader, present tense
- TR-12 terminology lock on every touched string: 'engine' / 'engine tree' / 'registry item' / 'family' / 'verdict' / 'peers' / 'dev client' — never the Not-column synonyms
- Numbers over adjectives: any claim of speed/scale renders as the concrete count or version, never a subjective modifier
- Accessible-name discipline: visible labels lowercase engine names; aria-labels in the 'nativewind engine' / 'uniwind engine' shape; toggle aria-labels name the destination theme
Capability: touches=['CAP-DOCS-01'] provides=4 items consumes=4 items; boundary_contracts=5
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-010",
 "tdd_mode": "shared",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": false,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "docs_dist_built": {
   "description": "Post-wave-E tree (SHELL-007 tabbed hero, SHELL-008 item pages with Dependencies sections, SHELL-009 theming route) built with the real filtered build; the playwright strict-port webServer serves it at http://localhost:4321.",
   "seed_method": "build_artifact",
   "records": [
    "pnpm --filter @rnr-ai-elements/docs build exit 0",
    "dist/index.html carries the tabbed hero with both engine panels (nativewind first)",
    "dist/docs/theming/index.html served with the four copy-stable anchors",
    "39 dist/components/<item>/index.html pages"
   ]
  },
  "copy_pass_pre": {
   "description": "The same built tree BEFORE any string edit \u2014 the red-capture state where the final deliverable strings are absent from the served HTML.",
   "seed_method": "build_artifact",
   "records": [
    "grep -c 'Registry items' apps/docs/dist/index.html \u2192 0 matches pre-pass",
    "the pre-pass verifying suites (home.spec.ts FLOW-GEND-01, theming-route tokens, component-page FLOW-GEND-14) are green \u2014 the invariants this pass must not break"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "name": "Hero copy contract holds in the authored source after the pass",
   "num": 1,
   "description": "GIVEN apps/docs/src/pages/index.astro after SHELL-007's tabbed hero lands and this task's copy pass is applied (words only) WHEN the unit test reads the authored source file, strips Astro comment blocks, and scans the hero strings THEN the identity sentence, 'copy-paste registry', and 'NOT an npm package' are present; CTA labels 'Get started'/'Browse components' appear with hrefs '/registry'/'/components'; the 56-counter label reads 'Registry items'; no banned terminology appears; no hero sentence exceeds 25 words",
   "given": "apps/docs/src/pages/index.astro after SHELL-007's tabbed hero lands and this task's copy pass is applied (words only)",
   "when": "the unit test reads the authored source file, strips Astro comment blocks, and scans the hero strings",
   "then": "the identity sentence, 'copy-paste registry', and 'NOT an npm package' are present; CTA labels 'Get started'/'Browse components' appear with hrefs '/registry'/'/components'; the 56-counter label reads 'Registry items'; no banned terminology appears; no hero sentence exceeds 25 words",
   "flow_ref": null,
   "test_file": "tests/sprint-02-shell-hero/copy-pass.test.ts",
   "test_function": "SHELL-010-hero-copy-contract",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-hero-copy-contract",
   "test_tier": "unit",
   "verification_service": "real filesystem read of the authored apps/docs/src/pages/index.astro \u2014 no runtime, no network, no browser",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "maps_to_ac": null,
   "unit_test_justified": "Pure file-scan assertion over authored source with zero I/O beyond file reads \u2014 the island-budget.test.ts / scaffold.build.test.ts file-scan precedent. The rendered-output proof rides the locked flow specs (SHELL-011's home-hero.spec.ts FLOW-GEND-01/FLOW-GEND-02) and the green-maintained sprint-01 lane at merge; this AC pins the authored strings themselves, which is exactly what a words-only task delivers."
  },
  {
   "id": "AC-2",
   "type": "acceptance_criterion",
   "primary": false,
   "name": "Theming copy polish preserves the route's copy contract",
   "num": 2,
   "description": "GIVEN apps/docs/src/pages/docs/theming.astro after SHELL-009 landed it and this task's sentence polish is applied (sentences only) WHEN the unit test reads the authored source file, strips Astro comment blocks, and scans for the anchors, placeholder signatures, banned terminology, and internal hrefs THEN all four copy-stable anchors ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle') survive the polish; zero placeholder signatures; zero banned terminology; every internal href in the source stays within {/, /components}",
   "given": "apps/docs/src/pages/docs/theming.astro after SHELL-009 landed it and this task's sentence polish is applied (sentences only)",
   "when": "the unit test reads the authored source file, strips Astro comment blocks, and scans for the anchors, placeholder signatures, banned terminology, and internal hrefs",
   "then": "all four copy-stable anchors ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle') survive the polish; zero placeholder signatures; zero banned terminology; every internal href in the source stays within {/, /components}",
   "flow_ref": null,
   "test_file": "tests/sprint-02-shell-hero/copy-pass.test.ts",
   "test_function": "SHELL-010-theming-copy-contract",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-theming-copy-contract",
   "test_tier": "unit",
   "verification_service": "real filesystem read of the authored apps/docs/src/pages/docs/theming.astro \u2014 no runtime, no network, no browser",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "maps_to_ac": null,
   "unit_test_justified": "Pure file-scan assertion over authored source with zero I/O beyond file reads \u2014 the island-budget.test.ts / scaffold.build.test.ts file-scan precedent. The served-page and first-frame-dark proofs ride SHELL-009's narrow lane (theming-route.test.ts) and SHELL-013's locked FLOW-SHELL-02 spec at merge; this AC pins that the polish never drops a fact or gains a dead link."
  },
  {
   "id": "AC-3",
   "type": "acceptance_criterion",
   "primary": false,
   "name": "Item-page labels and island microcopy stay locked and structurally frozen",
   "num": 3,
   "description": "GIVEN the section-label edits to apps/docs/src/pages/components/[item].astro (labels only) and the label/aria edits to ThemeToggle.astro and TabGroup.astro (labels/aria only) WHEN the unit test reads the three authored source files and scans section order, aria attributes, and terminology THEN data-section=\"install\" remains the first section value in [item].astro; both island files carry aria-label attributes; none of the touched files contains banned terminology or placeholder signatures",
   "given": "the section-label edits to apps/docs/src/pages/components/[item].astro (labels only) and the label/aria edits to ThemeToggle.astro and TabGroup.astro (labels/aria only)",
   "when": "the unit test reads the three authored source files and scans section order, aria attributes, and terminology",
   "then": "data-section=\"install\" remains the first section value in [item].astro; both island files carry aria-label attributes; none of the touched files contains banned terminology or placeholder signatures",
   "flow_ref": null,
   "test_file": "tests/sprint-02-shell-hero/copy-pass.test.ts",
   "test_function": "SHELL-010-microcopy-and-anatomy-contract",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-microcopy-and-anatomy-contract",
   "test_tier": "unit",
   "verification_service": "real filesystem read of the authored [item].astro, ThemeToggle.astro, and TabGroup.astro \u2014 no runtime, no network, no browser",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "maps_to_ac": null,
   "unit_test_justified": "Pure file-scan assertion over authored source with zero I/O beyond file reads \u2014 the island-budget.test.ts / scaffold.build.test.ts file-scan precedent. The rendered anatomy proof (install-first in the served DOM, both engine commands, byte-matched source) rides SHELL-008's rewritten component-page.spec.ts and SHELL-012's locked FLOW-GEND-20 spec at merge; this AC pins that the label edits changed words only."
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The authored index.astro contains 'Universal AI chat and agent UI components for React Native', 'copy-paste registry', 'NOT an npm package', CTA labels 'Get started' and 'Browse components' with hrefs '/registry' and '/components', and the 'Registry items' counter label, with zero banned terminology.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-hero-copy-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "No sentence in the hero h1 or statement block of the authored index.astro exceeds 25 words after comment-stripping and tag-stripping.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-hero-copy-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The authored theming.astro still contains 'ship no tokens', 'oklch', 'prefers-color-scheme', and 'toggle', with zero placeholder signatures ('coming soon', 'TODO', 'placeholder', 'Lorem'), zero banned terminology, and every internal href within {/, /components}.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-theming-copy-contract"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "In the authored [item].astro, data-section=\"install\" is the first section value; ThemeToggle.astro and TabGroup.astro each contain an aria-label attribute; none of the three touched files contains banned terminology or placeholder signatures.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/copy-pass.test.ts -t SHELL-010-microcopy-and-anatomy-contract"
  }
 ]
}
-->
