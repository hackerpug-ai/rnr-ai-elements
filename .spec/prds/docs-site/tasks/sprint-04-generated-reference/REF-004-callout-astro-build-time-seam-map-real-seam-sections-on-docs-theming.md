<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-004: Callout.astro + build-time seam map + real seam sections on /docs/theming

> Status: ✅ Completed
> Commit: bf006cba9f57e5f11a3f73b297df398894f3391e (approved cycle 1)
> Assignee: frontend-designer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 3 · Type: FEATURE · Wave: A
> Proposed By: frontend-designer · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Author the Callout primitive (info/warning aside with link slot), the pure seam map deriving per-item seams from real sourceFiles text, and the two real anchored seam sections on the existing /docs/theming page whose anchors the seam links target this sprint.

## Why
Callout.astro, seam-map.ts, and the modified theming.astro exist; seam-contract.test.ts passes green with the verified counts (8/3/1-both/29-zero); all 4 copy-stable theming anchors survive; REF-009 can mount Callout with seam-map output without touching this task's files.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-callout-source-contract

## Scope
apps/docs/src/components/Callout.astro (NEW); apps/docs/src/lib/seam-map.ts (NEW); apps/docs/src/pages/docs/theming.astro (MODIFY); tests/sprint-04-generated-reference/seam-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-004 — required reading for implementer + reviewer)</summary>

TASK: REF-004 — Callout.astro + build-time seam map + real seam sections on /docs/theming
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 3
AGENT: implementer=frontend-designer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 4/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: deriveSeams reads sourceFiles text only — detection is a source-text scan, never a hand-curated item list (verified ground truth: 8 TextClassContext users, 3 renderMarkdown users, message in both, 29/39 zero-seam)
- MUST: The two theming sections carry ids textclasscontext and rendermarkdown and state only the real seams — the #textclasscontext body contains the literal 'no style cascade' and names the provider; the #rendermarkdown body names 'react-native-enriched-markdown'
- MUST: Callout warning tone uses --destructive border + text (Badge's dev-client idiom, >=4.5:1 in both themes); info tone uses --secondary surface with --muted-foreground text
- MUST: All seam link targets point at the on-page /docs/theming anchors this sprint — the SEAM_LINK_TARGETS map is the single retarget point for sprint-06
- NEVER: Never invent seam behavior or assign a seam to an item whose sourceFiles lack the marker — 0 hand-curated name arrays
- NEVER: Never remove or reword away the 4 copy-stable anchors on /docs/theming ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle')
- NEVER: Never add JavaScript — 0 <script>, 0 customElements.define, 0 new islands
- NEVER: Never emit raw color literals — var(--*) tokens only
- STRICTLY: Strictly SCOPE write_allowed paths — apps/docs/src/pages/guides/ and apps/docs/src/pages/components/ are write-prohibited (guides are sprint-06; item-page composition is REF-009)

### DONE WHEN

- [x] AC 1: Callout source contract — info/warning variants, link slot, 2 tone rules / 4 declarations
- [x] AC 2: seam-map derivation — real counts from real sourceFiles text
- [x] AC 3: theming.astro seam sections — literal content anchors, 4 surviving copy anchors
- [x] AC 4: Seam scoping — zero seams for non-users, exactly 2 kinds, one-line retarget surface
- [x] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [x] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: Callout source contract — info/warning variants, link slot, 2 tone rules / 4 declarations**

  GIVEN/WHEN/THEN: GIVEN the repo with Badge/Chip/Button landed from sprint-02 as the variant-tone precedent and (RED at start) no Callout.astro WHEN the test reads apps/docs/src/components/Callout.astro from the real working tree and scans its structure and scoped styles THEN it declares 1 variant prop over exactly 'info' | 'warning' (info default), 1 required title, 1 optional body, and exactly 1 <slot name="link" />, renders exactly 1 <aside> root with 1 base class and 1 variant modifier class, and its style block carries exactly 2 tone rules with 4 declarations: .callout--info declares background: var(--secondary) and color: var(--muted-foreground); .callout--warning declares border-color: var(--destructive) and color: var(--destructive)

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/seam-contract.test.ts · TEST_FUNCTION: REF-004-callout-source-contract
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-callout-source-contract`
  VERIFICATION_SERVICE: real filesystem read of the authored Callout.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only (the landed primitives.test.ts pattern); rendered aside behavior rides REF-009's page lanes, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_seam_artifacts → MUST_OBSERVE [1 variant prop over exactly 'info' | 'warning' with an info default; 1 required title; 1 optional body; exactly 1 <slot name="link" /> and exactly 1 <aside> root carrying 1 base class + 1 variant modifier class; 2 tone rules with 4 declarations: .callout--info declares background: var(--secondary) and color: var(--muted-foreground); .callout--warning declares border-color: var(--destructive) and color: var(--destructive)] / MUST_NOT_OBSERVE [0 <script> tags and 0 customElements.define calls; 0 hex color literals matching #[0-9a-fA-F]{3,8}; 0 <img>/<picture> placeholder media]
    - NEGATIVE_CONTROL: would fail if ['a third variant or hardcoded one-off aside appears — the 2-variant union assert fails', 'warning uses a hand-picked error color instead of var(--destructive) — the 4-declaration tone assert fails and AA in both themes is unproven', 'the link is baked into the body instead of the slot — the exactly-1-slot assert fails and REF-009 cannot vary targets']

**AC-2: seam-map derivation — real counts from real sourceFiles text**

  GIVEN/WHEN/THEN: GIVEN the real registry sources at packages/registry/src/components (TextClassContext in message, prompt-input, tool, plan, queue, commit, terminal, environment-variables; renderMarkdown/enriched-markdown in message, reasoning, context) and (RED at start) no seam-map.ts WHEN the test imports deriveSeams from apps/docs/src/lib/seam-map.ts and runs it over the 39 registry:component items' sourceFiles text THEN exactly 8 items return the textclasscontext seam (message, prompt-input, tool, plan, queue, commit, terminal, environment-variables), exactly 3 return the rendermarkdown seam (message, reasoning, context), message is the only item carrying both, and 29/39 return zero seams

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/seam-contract.test.ts · TEST_FUNCTION: REF-004-seam-map-derivation
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-map-derivation`
  VERIFICATION_SERVICE: real registry source reads + pure function execution under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Pure derivation function executed over real source-file text — file reads plus a pure function, no rendering, no network, no DB (the FAM-002 one-line-description pattern); mounted seam callouts ride REF-009.
  SCENARIO:
    - START_REF real_registry_sources → MUST_OBSERVE [exactly 8 items return the textclasscontext seam: message, prompt-input, tool, plan, queue, commit, terminal, environment-variables; exactly 3 items return the rendermarkdown seam: message, reasoning, context; exactly 1 item (message) carries both seams; 29/39 items carry zero seams] / MUST_NOT_OBSERVE [0 hardcoded item-name arrays in seam-map.ts — detection reads source text only; 0 seams assigned to any of the 29 items whose sources lack both markers]
    - NEGATIVE_CONTROL: would fail if ['a hand-curated item list replaces source detection — the module contains a name array and the 8/3 counts are canned rather than derived', 'detection keys on the wrong marker — the 8/3 counts diverge from the grep ground truth', 'a third seam kind is invented — the exactly-2-kinds assert fails']

**AC-3: theming.astro seam sections — literal content anchors, 4 surviving copy anchors**

  GIVEN/WHEN/THEN: GIVEN the existing /docs/theming page with its 4 copy-stable anchors ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle') and (RED at start) 0 section elements WHEN the test reads apps/docs/src/pages/docs/theming.astro from the real working tree after the modification THEN it carries exactly 1 <section id="textclasscontext"> and exactly 1 <section id="rendermarkdown"> appended after the existing prose, the #textclasscontext section body contains the literal 'no style cascade' and names the provider, the #rendermarkdown section names 'react-native-enriched-markdown', both sections carry exactly 1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) declaration, and all 4 copy-stable anchors appear verbatim

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/seam-contract.test.ts · TEST_FUNCTION: REF-004-theming-seam-sections
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-theming-seam-sections`
  VERIFICATION_SERVICE: real filesystem read of the modified theming.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the modified .astro page — real file read only; the rendered anchor/200 proof rides the preview gates and REF-001's site-crawl lane.
  SCENARIO:
    - START_REF authored_seam_artifacts → MUST_OBSERVE [exactly 1 <section id="textclasscontext"> and exactly 1 <section id="rendermarkdown">; the #textclasscontext section body contains the literal 'no style cascade' and names the provider; the #rendermarkdown section names 'react-native-enriched-markdown'; exactly 1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) declaration on the anchored sections; 4/4 copy-stable anchors present verbatim: 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'] / MUST_NOT_OBSERVE [0 removed anchor phrases and 0 rewritten anchor sentences; 0 links to /guides/* (the sprint-06 retarget is future work); 0 <script> tags added by the modification]
    - NEGATIVE_CONTROL: would fail if ['either section id is missing or misspelled — the exactly-2-ids assert fails and the seam-link targets 404', "section prose invents behavior beyond the two real seams — the literal anchors ('no style cascade', 'provider', 'react-native-enriched-markdown') diverge", 'an anchor phrase is removed or reworded away — the 4 copy-stable-anchor asserts fail the SHELL-009/010 contract']

**AC-4: Seam scoping — zero seams for non-users, exactly 2 kinds, one-line retarget surface**

  GIVEN/WHEN/THEN: GIVEN the real sources where 29/39 items reference neither seam marker and (RED at start) no seam-map.ts WHEN the test runs deriveSeams over non-user items' sourceFiles text and inspects the module's export surface THEN 3/3 probed non-user items (shimmer, conversation, suggestion) return empty seam arrays, the module defines exactly 2 seam kinds (textclasscontext, rendermarkdown), and 1 SEAM_LINK_TARGETS export carries exactly 2 entries keyed textclasscontext and rendermarkdown with both values starting '/docs/theming#'

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/seam-contract.test.ts · TEST_FUNCTION: REF-004-seam-scoping-no-invention
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-scoping-no-invention`
  VERIFICATION_SERVICE: real registry source reads + pure function execution under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Pure function execution over real source text plus an export-surface scan — file reads and a module import, no rendering, no network, no DB.
  SCENARIO:
    - START_REF real_registry_sources → MUST_OBSERVE [3/3 probed non-user items (shimmer, conversation, suggestion) return empty seam arrays; 29/39 total; exactly 2 seam kinds defined: textclasscontext and rendermarkdown; 1 SEAM_LINK_TARGETS export with exactly 2 entries, both values starting '/docs/theming#'] / MUST_NOT_OBSERVE [0 seams returned for any source lacking the marker; 0 target URLs outside the '/docs/theming#' prefix this sprint]
    - NEGATIVE_CONTROL: would fail if ['seams are assigned by family or category instead of source text — the 3/3 non-user empty-array asserts fail', "the link targets are scattered across consumers instead of one map — the 2-entry SEAM_LINK_TARGETS assert fails and sprint-06's one-line retarget becomes a hunt", 'a fabricated seam kind appears — the exactly-2-kinds assert fails']

### TEST CRITERIA

- **TC-1** (→AC-1): Callout.astro declares 1 variant prop over exactly 'info' | 'warning' (info default), 1 required title, 1 optional body, and exactly 1 <slot name="link" />. — `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-callout-source-contract`
- **TC-2** (→AC-1): Callout.astro renders exactly 1 <aside> root (1 base class + 1 variant modifier) and carries exactly 2 tone rules / 4 declarations: .callout--info = background var(--secondary) + color var(--muted-foreground); .callout--warning = border-color var(--destructive) + color var(--destructive) — with 0 <script> tags and 0 hex literals. — `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-callout-source-contract`
- **TC-3** (→AC-2): deriveSeams over the real 39 items' sourceFiles text returns the textclasscontext seam for exactly the 8 named items and the rendermarkdown seam for exactly the 3 named items. — `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-map-derivation`
- **TC-4** (→AC-2): message is the only item carrying both seams, 29/39 items carry zero seams, and seam-map.ts contains 0 hardcoded item-name arrays. — `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-map-derivation`
- **TC-5** (→AC-3): theming.astro carries exactly 1 section id='textclasscontext' and 1 section id='rendermarkdown' after the existing prose, each with exactly 1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) declaration. — `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-theming-seam-sections`
- **TC-6** (→AC-3): The #textclasscontext body contains the literal 'no style cascade' and names the provider, the #rendermarkdown section names 'react-native-enriched-markdown', all 4 copy-stable anchors appear verbatim, and 0 /guides/ links exist. — `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-theming-seam-sections`
- **TC-7** (→AC-4): 3/3 probed non-user items (shimmer, conversation, suggestion) return empty seam arrays and the module defines exactly 2 seam kinds. — `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-scoping-no-invention`
- **TC-8** (→AC-4): 1 SEAM_LINK_TARGETS export carries exactly 2 entries keyed textclasscontext and rendermarkdown, both values starting '/docs/theming#' — the one-line sprint-06 retarget surface. — `pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-scoping-no-invention`

### READING LIST (max 5)

- apps/docs/src/components/Badge.astro + apps/docs/src/components/Chip.astro [PRIMARY PATTERN] lines all — The variant/tone selection idiom Callout imitates: Badge's two-tone map keyed to --destructive is the direct warning-tone precedent.
- tests/sprint-02-shell-hero/primitives.test.ts [PRIMARY PATTERN] lines all — The landed vitest source-scan pattern (real file reads, forbidden-string assertions) seam-contract.test.ts imitates.
- apps/docs/src/pages/docs/theming.astro lines all — The file being modified: the 4 copy-stable anchors, the existing prose structure, and the DocsLayout mount the two sections append to.
- packages/registry/src/components/ai/message.tsx + tool.tsx + reasoning.tsx + context.tsx lines all — The real seam sites: TextClassContext provider consumption and renderMarkdown/enriched-markdown usage the map detects.
- apps/docs/src/components/SectionHeader.astro lines all — The anchored-section + scroll-margin-block-start calc(var(--layout-header-h) + 1rem) idiom the theming sections reuse.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/components/Callout.astro (NEW)
- apps/docs/src/lib/seam-map.ts (NEW)
- apps/docs/src/pages/docs/theming.astro (MODIFY)
- tests/sprint-04-generated-reference/seam-contract.test.ts (NEW)
writeProhibited:
- apps/docs/src/pages/guides/
- apps/docs/src/pages/components/
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Prop-driven zero-JS aside primitive with a variant union and a link slot — tone selection via props exactly as Badge selects its two verdict tones; seam derivation as a pure module so vitest can execute it over real source text
- pattern_source: apps/docs/src/components/Badge.astro (two-tone variant map) + apps/docs/src/lib/one-line-description.ts (pure module extracted for testability, FAM-002)
- anti-pattern: per-variant sibling asides; a hand-curated per-item seam list; seam links pointing at routes that do not exist this sprint
- references: ["TR-07 component plan — 'Callout (NEW): Token-governed info/warning aside with a link — 2+ real uses (home teaser, quickstart expected-results, component-detail seams + troubleshooting, 404 hint)'", "TR-07 component-detail R11 — 'Seam Callout (renderMarkdown / TextClassContext -> guides)'", "TR-07 markdown-doc R6 — 'Cross-link asides: Callout (NEW)'"]
- notes: ['Mobile: the aside renders full-width single-column at every breakpoint; no layout shift between variants', 'Focus-visible: the slotted seam/troubleshooting link is the only focusable surface — the global 2px var(--ring) ring with 2px offset is inherited, never suppressed', 'Reduced-motion: 0 animated properties declared (static color surfaces) so 0 prefers-reduced-motion guards are required; any future transition must gate inside @media (prefers-reduced-motion: no-preference)']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01']
- provides: ["Callout.astro — props {variant?: 'info' | 'warning'; title: string; body?: string} plus a link slot: zero-JS token-governed aside with exactly 2 tone rules / 4 declarations", 'seam-map.ts — pure seam derivation from sourceFiles text exporting deriveSeams + a SEAM_LINK_TARGETS map (2 entries); detects renderMarkdown users (message, reasoning, context) and TextClassContext users (message, prompt-input, tool, plan, queue, commit, terminal, environment-variables); the target map is the one-line sprint-06 retarget point', "theming.astro (MODIFIED) — 2 real anchored sections id='textclasscontext' and id='rendermarkdown' appended after the existing prose, stating only the real seams"]
- consumes: ['Real sourceFiles text — packages/registry/src/components/** via the prebuild sourceFiles shape {filename, text}', "The existing /docs/theming prose and its 4 copy-stable anchors ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle' — SHELL-009/010 contract)", 'SHELL-001 tokens: --secondary, --muted-foreground, --destructive, --border, --radius-*, --layout-header-h']
- boundary_contracts: ['seam links only on pages whose source references the seam', 'targets return 200 THIS sprint (C3 ruling: two real anchored sections #textclasscontext and #rendermarkdown on the EXISTING /docs/theming — READ the current theming.astro first)', 'section content states the real seams (TextClassContext: RN has no style cascade, parents publish class strings via the provider; renderMarkdown: streaming markdown via react-native-enriched-markdown) — no invented behavior', 'NAMED FUTURE SUPERSEDE: sprint-06 retargets links to /guides/* as a one-line seam-map change', 'seam-map.ts derives per-item seams from sourceFiles text — renderMarkdown users: message/reasoning/context; TextClassContext users: message/prompt-input/tool/plan/queue/commit/terminal/environment-variables (verified counts: 3 + 8 registry:component items, message in both, 29/39 with zero seams)', 'Callout.astro: variant prop info|warning, title, body, link slot; info = --secondary/--muted surfaces, warning = --destructive accents AA in both themes; zero JS; token-governed']

### VERIFICATION GATES

- AC-1: pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-callout-source-contract — exit 0
- AC-2: pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-map-derivation — exit 0
- AC-3: pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-theming-seam-sections — exit 0
- AC-4: pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-scoping-no-invention — exit 0
- RED-first: the four -t runs FAIL before authoring (Callout.astro and seam-map.ts absent; theming.astro carries 0 sections) — record the RED outputs
- Seeded evidence: captured stdout shows the derivation tallies (8 textclasscontext / 3 rendermarkdown / 1 both / 29 zero), the 2 section ids, the 2-rules/4-declarations tone count, and the 4 surviving anchors — not merely exit 0
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/components/Callout.astro apps/docs/src/lib/seam-map.ts apps/docs/src/pages/docs/theming.astro tests/sprint-04-generated-reference/seam-contract.test.ts — exit 0 (never pnpm lint; local crash)
- tokens: the AC scans assert 0 raw color literals in Callout.astro (the scripts/check-tokens vocabulary) — check-tokens passes
- regression: the sprint-01/02 lanes stay green via the pnpm e2e:docs chain — /docs/theming keeps all 4 copy-stable anchors (SHELL-009/010 contract) and the route still serves 200
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: [] · Blocks: ['REF-006', 'REF-009']

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Scoped component styles consuming var(--*) tokens only — 0 hex, 0 raw color literals
- Zero <script>, zero customElements.define — a zero-JS primitive; seam-map.ts is a pure module (no side effects, no I/O)
- Biome-clean via ./node_modules/.bin/biome ci <paths> — never pnpm lint (local crash)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-004",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_sources": {
   "description": "The real RN registry sources read from the working tree at run time — packages/registry/src/components/**, the same text the prebuild sourceFiles field carries. Exists at task start; grounds every seam count.",
   "seed_method": "ui_flow",
   "records": [
    "TextClassContext appears in exactly 8 registry:component items: message, prompt-input, tool, plan, queue, commit, terminal, environment-variables (5 further file matches — breadcrumb, empty, input-group, item, table — are registry:ui, out of scope)",
    "renderMarkdown/enriched-markdown appears in exactly 3 registry:component items: message, reasoning, context (context.logic.ts belongs to the context item)",
    "message carries both seams (1 overlap); union 10; 29/39 items carry zero seams"
   ]
  },
  "authored_seam_artifacts": {
   "description": "The authored Callout.astro and seam-map.ts plus the modified theming.astro read from the real working tree at run time. RED at task start: both new files are absent and theming.astro carries 0 section elements.",
   "seed_method": "ui_flow",
   "records": [
    "apps/docs/src/components/Callout.astro exists with variant/title/body props and a link slot",
    "apps/docs/src/lib/seam-map.ts exports deriveSeams and SEAM_LINK_TARGETS",
    "apps/docs/src/pages/docs/theming.astro carries sections id='textclasscontext' and id='rendermarkdown' with all 4 copy-stable anchors intact"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "Callout source contract — info/warning variants, link slot, 2 tone rules / 4 declarations",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only (the landed primitives.test.ts pattern); rendered aside behavior rides REF-009's page lanes, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored Callout.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/seam-contract.test.ts",
   "test_function": "REF-004-callout-source-contract",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-callout-source-contract",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored Callout.astro source",
    "negative_control": {
     "would_fail_if": [
      "a third variant or hardcoded one-off aside appears — the 2-variant union assert fails",
      "warning uses a hand-picked error color instead of var(--destructive) — the 4-declaration tone assert fails and AA in both themes is unproven",
      "the link is baked into the body instead of the slot — the exactly-1-slot assert fails and REF-009 cannot vary targets"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_seam_artifacts",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/Callout.astro from the real working tree",
        "assert the variant union, the single slot, the aside root, and the counted tone declarations"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 variant prop over exactly 'info' | 'warning' with an info default; 1 required title; 1 optional body",
        "exactly 1 <slot name=\"link\" /> and exactly 1 <aside> root carrying 1 base class + 1 variant modifier class",
        "2 tone rules with 4 declarations: .callout--info declares background: var(--secondary) and color: var(--muted-foreground); .callout--warning declares border-color: var(--destructive) and color: var(--destructive)"
       ],
       "must_not_observe": [
        "0 <script> tags and 0 customElements.define calls",
        "0 hex color literals matching #[0-9a-fA-F]{3,8}",
        "0 <img>/<picture> placeholder media"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the repo with Badge/Chip/Button landed from sprint-02 as the variant-tone precedent and (RED at start) no Callout.astro WHEN the test reads apps/docs/src/components/Callout.astro from the real working tree and scans its structure and scoped styles THEN it declares 1 variant prop over exactly 'info' | 'warning' (info default), 1 required title, 1 optional body, and exactly 1 <slot name=\"link\" />, renders exactly 1 <aside> root with 1 base class and 1 variant modifier class, and its style block carries exactly 2 tone rules with 4 declarations: .callout--info declares background: var(--secondary) and color: var(--muted-foreground); .callout--warning declares border-color: var(--destructive) and color: var(--destructive)",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "seam-map derivation — real counts from real sourceFiles text",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Pure derivation function executed over real source-file text — file reads plus a pure function, no rendering, no network, no DB (the FAM-002 one-line-description pattern); mounted seam callouts ride REF-009.",
   "verification_service": "real registry source reads + pure function execution under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/seam-contract.test.ts",
   "test_function": "REF-004-seam-map-derivation",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-map-derivation",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Pure derivation over real file text — real file reads plus a pure function, no runtime or external service.",
    "verification_service": "real registry source reads + pure function execution under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "a hand-curated item list replaces source detection — the module contains a name array and the 8/3 counts are canned rather than derived",
      "detection keys on the wrong marker — the 8/3 counts diverge from the grep ground truth",
      "a third seam kind is invented — the exactly-2-kinds assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_sources",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the 39 registry:component items' source files from packages/registry/src",
        "map each item's concatenated sourceFiles text through deriveSeams and tally the seams"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 8 items return the textclasscontext seam: message, prompt-input, tool, plan, queue, commit, terminal, environment-variables",
        "exactly 3 items return the rendermarkdown seam: message, reasoning, context",
        "exactly 1 item (message) carries both seams; 29/39 items carry zero seams"
       ],
       "must_not_observe": [
        "0 hardcoded item-name arrays in seam-map.ts — detection reads source text only",
        "0 seams assigned to any of the 29 items whose sources lack both markers"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real registry sources at packages/registry/src/components (TextClassContext in message, prompt-input, tool, plan, queue, commit, terminal, environment-variables; renderMarkdown/enriched-markdown in message, reasoning, context) and (RED at start) no seam-map.ts WHEN the test imports deriveSeams from apps/docs/src/lib/seam-map.ts and runs it over the 39 registry:component items' sourceFiles text THEN exactly 8 items return the textclasscontext seam (message, prompt-input, tool, plan, queue, commit, terminal, environment-variables), exactly 3 return the rendermarkdown seam (message, reasoning, context), message is the only item carrying both, and 29/39 return zero seams",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "theming.astro seam sections — literal content anchors, 4 surviving copy anchors",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the modified .astro page — real file read only; the rendered anchor/200 proof rides the preview gates and REF-001's site-crawl lane.",
   "verification_service": "real filesystem read of the modified theming.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/seam-contract.test.ts",
   "test_function": "REF-004-theming-seam-sections",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-theming-seam-sections",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the modified theming.astro source",
    "negative_control": {
     "would_fail_if": [
      "either section id is missing or misspelled — the exactly-2-ids assert fails and the seam-link targets 404",
      "section prose invents behavior beyond the two real seams — the literal anchors ('no style cascade', 'provider', 'react-native-enriched-markdown') diverge",
      "an anchor phrase is removed or reworded away — the 4 copy-stable-anchor asserts fail the SHELL-009/010 contract"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_seam_artifacts",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/pages/docs/theming.astro from the real working tree",
        "assert the two section ids, the literal content anchors, the scroll-margin declaration, and the 4 surviving copy anchors"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 <section id=\"textclasscontext\"> and exactly 1 <section id=\"rendermarkdown\">",
        "the #textclasscontext section body contains the literal 'no style cascade' and names the provider; the #rendermarkdown section names 'react-native-enriched-markdown'",
        "exactly 1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) declaration on the anchored sections",
        "4/4 copy-stable anchors present verbatim: 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'"
       ],
       "must_not_observe": [
        "0 removed anchor phrases and 0 rewritten anchor sentences",
        "0 links to /guides/* (the sprint-06 retarget is future work)",
        "0 <script> tags added by the modification"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the existing /docs/theming page with its 4 copy-stable anchors ('ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle') and (RED at start) 0 section elements WHEN the test reads apps/docs/src/pages/docs/theming.astro from the real working tree after the modification THEN it carries exactly 1 <section id=\"textclasscontext\"> and exactly 1 <section id=\"rendermarkdown\"> appended after the existing prose, the #textclasscontext section body contains the literal 'no style cascade' and names the provider, the #rendermarkdown section names 'react-native-enriched-markdown', both sections carry exactly 1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) declaration, and all 4 copy-stable anchors appear verbatim",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Seam scoping — zero seams for non-users, exactly 2 kinds, one-line retarget surface",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Pure function execution over real source text plus an export-surface scan — file reads and a module import, no rendering, no network, no DB.",
   "verification_service": "real registry source reads + pure function execution under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/seam-contract.test.ts",
   "test_function": "REF-004-seam-scoping-no-invention",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-scoping-no-invention",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Pure function over real source text plus an export-surface scan — real file reads only, no runtime or external service.",
    "verification_service": "real registry source reads + pure function execution under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "seams are assigned by family or category instead of source text — the 3/3 non-user empty-array asserts fail",
      "the link targets are scattered across consumers instead of one map — the 2-entry SEAM_LINK_TARGETS assert fails and sprint-06's one-line retarget becomes a hunt",
      "a fabricated seam kind appears — the exactly-2-kinds assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_sources",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "run deriveSeams over the sourceFiles text of shimmer, conversation, and suggestion",
        "inspect seam-map.ts's kind union and the SEAM_LINK_TARGETS export"
       ]
      },
      "end_state": {
       "must_observe": [
        "3/3 probed non-user items (shimmer, conversation, suggestion) return empty seam arrays; 29/39 total",
        "exactly 2 seam kinds defined: textclasscontext and rendermarkdown",
        "1 SEAM_LINK_TARGETS export with exactly 2 entries, both values starting '/docs/theming#'"
       ],
       "must_not_observe": [
        "0 seams returned for any source lacking the marker",
        "0 target URLs outside the '/docs/theming#' prefix this sprint"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real sources where 29/39 items reference neither seam marker and (RED at start) no seam-map.ts WHEN the test runs deriveSeams over non-user items' sourceFiles text and inspects the module's export surface THEN 3/3 probed non-user items (shimmer, conversation, suggestion) return empty seam arrays, the module defines exactly 2 seam kinds (textclasscontext, rendermarkdown), and 1 SEAM_LINK_TARGETS export carries exactly 2 entries keyed textclasscontext and rendermarkdown with both values starting '/docs/theming#'",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "Callout.astro declares 1 variant prop over exactly 'info' | 'warning' (info default), 1 required title, 1 optional body, and exactly 1 <slot name=\"link\" />.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-callout-source-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Callout.astro renders exactly 1 <aside> root (1 base class + 1 variant modifier) and carries exactly 2 tone rules / 4 declarations: .callout--info = background var(--secondary) + color var(--muted-foreground); .callout--warning = border-color var(--destructive) + color var(--destructive) — with 0 <script> tags and 0 hex literals.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-callout-source-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "deriveSeams over the real 39 items' sourceFiles text returns the textclasscontext seam for exactly the 8 named items and the rendermarkdown seam for exactly the 3 named items.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-map-derivation"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "message is the only item carrying both seams, 29/39 items carry zero seams, and seam-map.ts contains 0 hardcoded item-name arrays.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-map-derivation"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "theming.astro carries exactly 1 section id='textclasscontext' and 1 section id='rendermarkdown' after the existing prose, each with exactly 1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) declaration.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-theming-seam-sections"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "The #textclasscontext body contains the literal 'no style cascade' and names the provider, the #rendermarkdown section names 'react-native-enriched-markdown', all 4 copy-stable anchors appear verbatim, and 0 /guides/ links exist.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-theming-seam-sections"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "3/3 probed non-user items (shimmer, conversation, suggestion) return empty seam arrays and the module defines exactly 2 seam kinds.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-scoping-no-invention"
  },
  {
   "id": "TC-8",
   "type": "test_criterion",
   "description": "1 SEAM_LINK_TARGETS export carries exactly 2 entries keyed textclasscontext and rendermarkdown, both values starting '/docs/theming#' — the one-line sprint-06 retarget surface.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/seam-contract.test.ts -t REF-004-seam-scoping-no-invention"
  }
 ]
}
-->

</details>
