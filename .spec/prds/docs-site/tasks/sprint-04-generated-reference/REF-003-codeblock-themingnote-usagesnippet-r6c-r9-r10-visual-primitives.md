<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-003: CodeBlock + ThemingNote + UsageSnippet — R6c/R9/R10 visual primitives

> Status: ⬜ Pending
> Assignee: frontend-designer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 3 · Type: FEATURE · Wave: A
> Proposed By: frontend-designer · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Author the three R6c/R9/R10 visual primitives — CodeBlock (verbatim full-source block over the unmodified rnr-copy-button island), ThemingNote (prose plus token identifiers as mono Chips), UsageSnippet (verbatim CodeBlock passthrough) — token-governed, zero new islands.

## Why
The three .astro files exist, token-governed and script-free; code-primitives-contract.test.ts passes green (RED first: files absent); the island pair stays byte-identical; FLOW-GEND-35 and gate-10/11 proofs ride REF-009's assembly unchanged.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-verbatim-island-composition

## Scope
apps/docs/src/components/CodeBlock.astro (NEW); apps/docs/src/components/ThemingNote.astro (NEW); apps/docs/src/components/UsageSnippet.astro (NEW); tests/sprint-04-generated-reference/code-primitives-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-003 — required reading for implementer + reviewer)</summary>

TASK: REF-003 — CodeBlock + ThemingNote + UsageSnippet — R6c/R9/R10 visual primitives
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 3
AGENT: implementer=frontend-designer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/5 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: The code prop passes to CopyButton's command prop untouched — zero normalization inside CodeBlock
- MUST: Full untruncated body: the code surface grows with content, never height-limited
- MUST: Compose islands/CopyButton.astro UNMODIFIED with command={code}; success state via the island's role=status span (T-GEND-025)
- MUST: ThemingNote renders prose + token identifiers as counter-less mono Chips; UsageSnippet renders CodeBlock over item.usageSnippet verbatim
- NEVER: Never normalize inside CodeBlock — 0 .trim( / .replace( / .normalize( / dedent( calls and 0 set:html bindings on the source text
- NEVER: Never gate the copy affordance on hover — 0 opacity: 0 / visibility: hidden reveal rules
- NEVER: Never add a new island or touch islands/** — the five-island budget is closed
- NEVER: Never fabricate snippet or note text — 0 canned fallback strings
- NEVER: Never add print styles — 0 @media print rules (sprint-11 scope)
- STRICTLY: Strictly SCOPE write_allowed paths — apps/docs/src/pages/ (REF-009) and apps/docs/src/components/islands/ (island stays byte-identical) are write-prohibited

### DONE WHEN

- [ ] AC 1: CodeBlock verbatim source contract over the unmodified rnr-copy-button island
- [ ] AC 2: Full untruncated body — the block never height-limits or clips
- [ ] AC 3: Copy affordance always visible — no hover gating, 44px touch target, label plumbing
- [ ] AC 4: ThemingNote deterministic token-chip split over the real notes
- [ ] AC 5: UsageSnippet verbatim passthrough — never fabricated
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: CodeBlock verbatim source contract over the unmodified rnr-copy-button island**

  GIVEN/WHEN/THEN: GIVEN the CopyButton island landed (islands/CopyButton.astro + scripts/copy-button.ts copying its <code> child's textContent) and (RED at start) no CodeBlock.astro WHEN the test reads apps/docs/src/components/CodeBlock.astro from the real working tree and scans its structure THEN it composes exactly 1 CopyButton with command={code}, declares exactly 1 background: var(--code-background) declaration and 1 color: var(--code-foreground) declaration in the scoped style block, plus 1 white-space: pre-wrap and 1 font-family: var(--font-mono) declaration on the composed code-surface rule, and passes the code prop through with zero normalization

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/code-primitives-contract.test.ts · TEST_FUNCTION: REF-003-code-block-verbatim-island-composition
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-verbatim-island-composition`
  VERIFICATION_SERVICE: real filesystem read of the authored CodeBlock.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only (the landed primitives.test.ts pattern); the rendered byte-match proof is REF-001/REF-009's FLOW-GEND-35 lane, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_code_primitives → MUST_OBSERVE [1 import of CopyButton from './islands/CopyButton.astro' and exactly 1 <CopyButton command={code}> composition; exactly 1 background: var(--code-background) declaration and 1 color: var(--code-foreground) declaration in the scoped style block; 1 white-space: pre-wrap declaration and 1 font-family: var(--font-mono) declaration on the :global(.copy-button__command) rule] / MUST_NOT_OBSERVE [0 <script> tags and 0 customElements.define calls; 0 hex color literals matching #[0-9a-fA-F]{3,8}; 0 .trim( / .replace( / .normalize( / dedent( calls on the code prop and 0 set:html bindings on the source text node]
    - NEGATIVE_CONTROL: would fail if ['the component re-implements copy with its own script — the 0-script assert fails and the island budget is breached', 'the code prop is trimmed, dedented, or re-rendered through set:html — the 0-normalization asserts fail and T-GEND-024 breaks downstream', 'hand-picked hex literals replace var(--*) references — the 0-hex assert fails']

**AC-2: Full untruncated body — the block never height-limits or clips**

  GIVEN/WHEN/THEN: GIVEN the real dataset where 38/39 usage snippets are multi-line and served file bodies run multi-KB, and (RED at start) no CodeBlock.astro WHEN the test reads CodeBlock.astro and scans its scoped style block THEN the code surface carries 0 max-height and 0 fixed height declarations, 0 -webkit-line-clamp, 0 text-overflow: ellipsis, and 0 overflow: hidden, with exactly 1 overflow-wrap: anywhere declaration keeping every character visible as the block grows

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/code-primitives-contract.test.ts · TEST_FUNCTION: REF-003-code-block-untruncated-body
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-untruncated-body`
  VERIFICATION_SERVICE: real filesystem read of the authored CodeBlock.astro source + real registry-items.json import under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan plus a real dataset import — real file reads only; the rendered no-clip proof is FLOW-GEND-35/gate-11 over REF-009's assembly.
  SCENARIO:
    - START_REF authored_code_primitives → MUST_OBSERVE [0 max-height and 0 fixed height declarations on the code surface; exactly 1 overflow-wrap: anywhere declaration on the code surface rule; 38/39 usage snippets are multi-line — pre-wrap preserves their newlines] / MUST_NOT_OBSERVE [0 -webkit-line-clamp / text-overflow: ellipsis / overflow: hidden declarations; 0 details/summary collapse affordances gating the body]
    - NEGATIVE_CONTROL: would fail if ["the block clamps with max-height or line-clamp — the 0-declaration asserts fail and T-GEND-024's no-height-limit clause breaks", 'overflow: hidden clips wrapped content — the 0-hidden assert fails', 'a details/summary collapse gates the body — the 0-collapse assert fails']

**AC-3: Copy affordance always visible — no hover gating, 44px touch target, label plumbing**

  GIVEN/WHEN/THEN: GIVEN the island's trigger renders unconditionally beside its <code> child, and (RED at start) no CodeBlock.astro WHEN the test reads CodeBlock.astro and scans its styles and label plumbing THEN the composed trigger carries 0 opacity: 0 rules, 0 visibility: hidden rules, and 0 hover-revealed display rules, exactly 1 label default 'Copy code' flows to the CopyButton aria-label prop, and exactly 1 :global(.copy-button__trigger) override declares min-height: 44px with 0 outline suppression

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/code-primitives-contract.test.ts · TEST_FUNCTION: REF-003-code-block-copy-affordance
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-copy-affordance`
  VERIFICATION_SERVICE: real filesystem read of the authored CodeBlock.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only; clipboard-equals-text and success-state proofs are T-GEND-025 in the REF-001 lane.
  SCENARIO:
    - START_REF copy_button_island → MUST_OBSERVE [0 opacity: 0 and 0 visibility: hidden rules targeting the trigger; 0 :hover reveal rules; exactly 1 label default 'Copy code' flowing to the CopyButton aria-label prop; exactly 1 :global(.copy-button__trigger) override declaring min-height: 44px] / MUST_NOT_OBSERVE [0 outline: none / outline suppression declarations on the trigger; 0 modifications to islands/CopyButton.astro or scripts/copy-button.ts (byte-identical baseline)]
    - NEGATIVE_CONTROL: would fail if ["the trigger is revealed only on hover — the 0 opacity/visibility asserts fail and T-GEND-025's visible-without-hover clause breaks", 'the touch target stays below 44px — the min-height assert fails the gate-11 mobile frame', 'an outline: none override strips the focus ring — the outline-suppression assert fails']

**AC-4: ThemingNote deterministic token-chip split over the real notes**

  GIVEN/WHEN/THEN: GIVEN the real dataset's 39 themingNote strings (37/39 carry hyphenated semantic-class identifiers — 147 total, 16 unique; conversation and suggestion carry none) and (RED at start) no ThemingNote.astro WHEN the test reads apps/docs/src/components/ThemingNote.astro and scans its frontmatter and template THEN it declares exactly 1 token-identifier pattern (a hyphenated-lowercase regex literal), renders each match as a Chip counter-less mono pill, and renders non-match segments as plain prose — 37/39 notes render >=1 chip with the note's full text reconstructible from chips + prose (grounded on the 147-identifier dataset); conversation and suggestion render 0 chips

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/code-primitives-contract.test.ts · TEST_FUNCTION: REF-003-theming-note-token-chips
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-theming-note-token-chips`
  VERIFICATION_SERVICE: real filesystem read of the authored ThemingNote.astro source + real registry-items.json import under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file plus a real dataset import — real file reads only; the rendered chip proof is gate step 10 over REF-009's assembly.
  SCENARIO:
    - START_REF authored_code_primitives → MUST_OBSERVE [exactly 1 token-identifier regex literal in the frontmatter; 1 import of Chip with matches composed in its counter-less value-only form; 37/39 notes render >=1 chip with the note's full text reconstructible from chips + prose (grounded on the 147-identifier dataset); conversation and suggestion render 0 chips] / MUST_NOT_OBSERVE [0 hardcoded theming sentences (the note prop is the sole string source); 0 hex color literals and 0 <script> tags]
    - NEGATIVE_CONTROL: would fail if ['the note renders as one unsplit plain string — the pattern literal and Chip composition asserts fail', 'a hand-written note vocabulary replaces the real field — the 37/39 + 147-identifier grounding diverges', 'a second pill pattern is hand-rolled instead of composing Chip — the Chip-import assert fails']

**AC-5: UsageSnippet verbatim passthrough — never fabricated**

  GIVEN/WHEN/THEN: GIVEN the real dataset where 39/39 items carry a non-empty usageSnippet (the gallery-cell snippet) and (RED at start) no UsageSnippet.astro WHEN the test reads apps/docs/src/components/UsageSnippet.astro and scans its structure THEN it takes 1 required snippet prop with 0 assigned defaults, composes exactly 1 <CodeBlock code={snippet}> with the snippet passed verbatim, and contains 0 canned fallback snippet strings and 0 conditional substitution branches

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/code-primitives-contract.test.ts · TEST_FUNCTION: REF-003-usage-snippet-verbatim
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-usage-snippet-verbatim`
  VERIFICATION_SERVICE: real filesystem read of the authored UsageSnippet.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only; the rendered snippet proof is gate step 10 over REF-009's assembly.
  SCENARIO:
    - START_REF authored_code_primitives → MUST_OBSERVE [1 required snippet prop with 0 assigned defaults; exactly 1 <CodeBlock code={snippet}> composition] / MUST_NOT_OBSERVE [0 fallback example snippets (no '() => <Example>' style canned strings); 0 .trim( / .replace( normalization applied to snippet; 0 conditional substitution branches replacing an empty snippet with authored text]
    - NEGATIVE_CONTROL: would fail if ['a canned example snippet substitutes for missing input — the 0-fallback-string assert fails (fabricated content)', 'snippet is normalized before rendering — the 0-normalization assert fails the verbatim fidelity rule', 'the prop is optional with a default snippet — the required-no-default assert fails']

### TEST CRITERIA

- **TC-1** (→AC-1): CodeBlock.astro imports and composes exactly 1 CopyButton with command={code} and declares exactly 1 background: var(--code-background) + 1 color: var(--code-foreground) in the scoped style block plus 1 white-space: pre-wrap + 1 font-family: var(--font-mono) on the composed code surface. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-verbatim-island-composition`
- **TC-2** (→AC-1): CodeBlock.astro carries 0 <script> tags, 0 customElements.define calls, 0 hex literals, and 0 normalization (.trim( / .replace( / .normalize( / set:html) applied to the code prop. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-verbatim-island-composition`
- **TC-3** (→AC-2): The code surface declares 0 max-height/height, 0 -webkit-line-clamp, 0 text-overflow: ellipsis, and 0 overflow: hidden, with exactly 1 overflow-wrap: anywhere declaration. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-untruncated-body`
- **TC-4** (→AC-2): 0 details/summary collapse affordances gate the body, and the 38/39 multi-line snippets keep their newlines under pre-wrap. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-untruncated-body`
- **TC-5** (→AC-3): The composed trigger carries 0 opacity/visibility hover-gating rules and exactly 1 label default 'Copy code' flows to the CopyButton aria-label prop. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-copy-affordance`
- **TC-6** (→AC-3): Exactly 1 :global(.copy-button__trigger) override declares min-height: 44px with 0 outline suppression, and the island pair is byte-identical to task start. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-copy-affordance`
- **TC-7** (→AC-4): ThemingNote.astro declares exactly 1 token-identifier regex literal, composes matches through 1 Chip import in counter-less form, and renders 37/39 notes with >=1 chip reconstructible from the 147-identifier dataset while conversation and suggestion render 0 chips. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-theming-note-token-chips`
- **TC-8** (→AC-4): ThemingNote.astro contains 0 hand-written note strings, 0 hex literals, and 0 <script> tags. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-theming-note-token-chips`
- **TC-9** (→AC-5): UsageSnippet.astro takes 1 required snippet prop with 0 defaults and composes exactly 1 CodeBlock with code={snippet} verbatim. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-usage-snippet-verbatim`
- **TC-10** (→AC-5): UsageSnippet.astro contains 0 canned fallback snippet strings, 0 conditional substitution branches, and 0 normalization applied to snippet. — `pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-usage-snippet-verbatim`

### READING LIST (max 5)

- apps/docs/src/components/islands/CopyButton.astro + apps/docs/src/scripts/copy-button.ts [PRIMARY PATTERN] lines all — The island composed UNMODIFIED: command renders the <code> child the island copies, with the trigger and role=status span.
- tests/sprint-02-shell-hero/primitives.test.ts [PRIMARY PATTERN] lines all — The landed vitest source-scan pattern code-primitives-contract.test.ts imitates.
- apps/docs/src/components/Chip.astro lines all — The counter-less mono pill form ThemingNote composes.
- apps/docs/src/components/Button.astro lines all — Scoped-style discipline and the :focus-visible ring contract for :global child styling.
- apps/docs/src/data/registry-items.json lines all — The REAL themingNote (37/39 with 147 identifiers) and usageSnippet (38/39 multi-line) fields.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/components/CodeBlock.astro (NEW)
- apps/docs/src/components/ThemingNote.astro (NEW)
- apps/docs/src/components/UsageSnippet.astro (NEW)
- tests/sprint-04-generated-reference/code-primitives-contract.test.ts (NEW)
writeProhibited:
- apps/docs/src/pages/
- apps/docs/src/components/islands/
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Composition over re-implementation — CodeBlock composes the unmodified CopyButton island and styles the composed child via :global scoped overrides; ThemingNote composes Chip; UsageSnippet composes CodeBlock
- pattern_source: apps/docs/src/components/islands/CopyButton.astro (the island seam) + apps/docs/src/components/Chip.astro (counter-less pill idiom, FAM-002)
- anti-pattern: a second copy-button implementation or a new island; a syntax-highlighter dependency; hand-written snippet or note text beside the real fields
- references: ["TR-07 component-detail R6c — 'Code content: CodeBlock (docs) — Full untruncated source, never height-limited'", "TR-07 component-detail R9 — 'Theming note (Prose + token Chips)'", "TR-07 component-detail R10 — 'Usage snippets: CodeBlock, from the item's gallery cell — never hand-written per page (fidelity rule, v1.2.0)'", 'TR-07 hard UI constraints — full untruncated source always; token-governed styling; :focus-visible 2px ring never suppressed']
- notes: ['Mobile: code surfaces wrap (pre-wrap + overflow-wrap: anywhere) — no horizontal scroll traps at 390px; the copy trigger keeps a min 44px touch target', "Focus-visible: the copy trigger inherits the island's native button semantics; CodeBlock adds 0 outline overrides — the global 2px var(--ring) ring stays intact", "Reduced-motion: the island's 2s copied-to-idle reset is a text/state swap, not motion; CodeBlock declares 0 transitions so 0 prefers-reduced-motion guards are required"]

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01']
- provides: ['CodeBlock.astro — props {code: string; label?: string}: verbatim pre-wrap code surface composing the UNMODIFIED rnr-copy-button island (command={code}); full untruncated body; always-visible copy, 44px touch target', 'ThemingNote.astro — props {note: string}: deterministic identifier split rendering hyphenated semantic-class tokens as Chip mono pills, the rest as prose', 'UsageSnippet.astro — props {snippet: string}: CodeBlock passthrough rendering item.usageSnippet verbatim']
- consumes: ["islands/CopyButton.astro (rnr-copy-button island) UNMODIFIED — command={code}; island copies its <code> child's textContent, swaps data-state with a role=status span", 'Chip.astro counter-less mono pill (FAM-002 form)', 'registry fields themingNote + usageSnippet (39/39 non-empty each)', 'SHELL-001 tokens: --code-background, --code-foreground, --font-mono, --border, --radius-*, --ring']
- boundary_contracts: ['CodeBlock renders its text node VERBATIM — zero normalization inside the component (the T-GEND-024 byte-match contract depends on it)', 'full untruncated body, never height-limited', 'copy affordance always visible without hover, clipboard equals block text, success state (T-GEND-025) — reuse the existing rnr-copy-button island UNMODIFIED', 'ThemingNote = prose + oklch token identifiers as mono Chips', 'UsageSnippet = CodeBlock over item.usageSnippet (the gallery-cell snippet, rendered verbatim)', 'zero new islands', 'token-governed', 'no print styles']

### VERIFICATION GATES

- AC-1..AC-5: pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-verbatim-island-composition / -t REF-003-code-block-untruncated-body / -t REF-003-code-block-copy-affordance / -t REF-003-theming-note-token-chips / -t REF-003-usage-snippet-verbatim — each exit 0
- RED-first: the five -t runs FAIL before authoring (the three .astro files absent) — record the RED outputs
- Seeded evidence: captured stdout shows the counted declarations (1 background var(--code-background), 1 min-height 44px, 1 regex literal) and the dataset grounding (37/39 notes with 147 identifiers, 38/39 multi-line snippets), not merely exit 0
- island integrity: islands/CopyButton.astro and scripts/copy-button.ts show 0 changes in git diff
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/components/CodeBlock.astro apps/docs/src/components/ThemingNote.astro apps/docs/src/components/UsageSnippet.astro tests/sprint-04-generated-reference/code-primitives-contract.test.ts — exit 0 (never pnpm lint)
- tokens: 0 raw color literals across the three components (the scripts/check-tokens vocabulary) — check-tokens passes
- Browser ride-along (gated on REF-009, NOT this task's write surface): FLOW-GEND-35 (gate 7 byte-match) + gates 10-11 (copy visible/success, token chips, 44px touch targets at 390px)
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: [] · Blocks: ['REF-009']

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Scoped styles consuming var(--*) tokens only — composed children styled via :global selectors, never by editing islands/**
- Zero <script>, zero customElements.define in the three new components
- Biome-clean via ./node_modules/.bin/biome ci <paths> — never pnpm lint (local crash)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-003",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "copy_button_island": {
   "description": "The landed island pair read from the real working tree — the unmodified-consumption baseline. Exists at task start; REF-003 writes neither file.",
   "seed_method": "ui_flow",
   "records": [
    "islands/CopyButton.astro renders <rnr-copy-button> wrapping a <code> child, a button trigger with aria-label, and a role=status span",
    "scripts/copy-button.ts copies the <code> child's textContent (trimmed) and swaps data-state idle/copied/error for 2s"
   ]
  },
  "real_theming_usage_dataset": {
   "description": "registry-items.json filtered to registry:component, fields themingNote and usageSnippet, imported at run time. Exists at task start.",
   "seed_method": "public_api",
   "records": [
    "39/39 themingNote non-empty — 37/39 carry >=1 hyphenated semantic-class identifier (147 total, 16 unique, max 7); conversation and suggestion carry none",
    "39/39 usageSnippet non-empty — 38/39 multi-line"
   ]
  },
  "authored_code_primitives": {
   "description": "The authored CodeBlock.astro, ThemingNote.astro, UsageSnippet.astro read from the real working tree. RED at task start: all three absent.",
   "seed_method": "ui_flow",
   "records": [
    "CodeBlock.astro with {code, label?} composing CopyButton",
    "ThemingNote.astro with {note} composing Chip",
    "UsageSnippet.astro with {snippet} composing CodeBlock"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "CodeBlock verbatim source contract over the unmodified rnr-copy-button island",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only (the landed primitives.test.ts pattern); the rendered byte-match proof is REF-001/REF-009's FLOW-GEND-35 lane, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored CodeBlock.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/code-primitives-contract.test.ts",
   "test_function": "REF-003-code-block-verbatim-island-composition",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-verbatim-island-composition",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored CodeBlock.astro source",
    "negative_control": {
     "would_fail_if": [
      "the component re-implements copy with its own script — the 0-script assert fails and the island budget is breached",
      "the code prop is trimmed, dedented, or re-rendered through set:html — the 0-normalization asserts fail and T-GEND-024 breaks downstream",
      "hand-picked hex literals replace var(--*) references — the 0-hex assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_code_primitives",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read CodeBlock.astro and islands/CopyButton.astro from the real working tree",
        "assert the single composition, the counted token declarations, and the zero-normalization pass-through"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 import of CopyButton from './islands/CopyButton.astro' and exactly 1 <CopyButton command={code}> composition",
        "exactly 1 background: var(--code-background) declaration and 1 color: var(--code-foreground) declaration in the scoped style block",
        "1 white-space: pre-wrap declaration and 1 font-family: var(--font-mono) declaration on the :global(.copy-button__command) rule"
       ],
       "must_not_observe": [
        "0 <script> tags and 0 customElements.define calls",
        "0 hex color literals matching #[0-9a-fA-F]{3,8}",
        "0 .trim( / .replace( / .normalize( / dedent( calls on the code prop and 0 set:html bindings on the source text node"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the CopyButton island landed (islands/CopyButton.astro + scripts/copy-button.ts copying its <code> child's textContent) and (RED at start) no CodeBlock.astro WHEN the test reads apps/docs/src/components/CodeBlock.astro from the real working tree and scans its structure THEN it composes exactly 1 CopyButton with command={code}, declares exactly 1 background: var(--code-background) declaration and 1 color: var(--code-foreground) declaration in the scoped style block, plus 1 white-space: pre-wrap and 1 font-family: var(--font-mono) declaration on the composed code-surface rule, and passes the code prop through with zero normalization",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Full untruncated body — the block never height-limits or clips",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan plus a real dataset import — real file reads only; the rendered no-clip proof is FLOW-GEND-35/gate-11 over REF-009's assembly.",
   "verification_service": "real filesystem read of the authored CodeBlock.astro source + real registry-items.json import under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/code-primitives-contract.test.ts",
   "test_function": "REF-003-code-block-untruncated-body",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-untruncated-body",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus real dataset import — real file reads only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored CodeBlock.astro source + real registry-items.json import under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the block clamps with max-height or line-clamp — the 0-declaration asserts fail and T-GEND-024's no-height-limit clause breaks",
      "overflow: hidden clips wrapped content — the 0-hidden assert fails",
      "a details/summary collapse gates the body — the 0-collapse assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_code_primitives",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read CodeBlock.astro and import the real registry dataset",
        "assert the counted 0-clamp/0-height declarations and the multi-line grounding"
       ]
      },
      "end_state": {
       "must_observe": [
        "0 max-height and 0 fixed height declarations on the code surface",
        "exactly 1 overflow-wrap: anywhere declaration on the code surface rule",
        "38/39 usage snippets are multi-line — pre-wrap preserves their newlines"
       ],
       "must_not_observe": [
        "0 -webkit-line-clamp / text-overflow: ellipsis / overflow: hidden declarations",
        "0 details/summary collapse affordances gating the body"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real dataset where 38/39 usage snippets are multi-line and served file bodies run multi-KB, and (RED at start) no CodeBlock.astro WHEN the test reads CodeBlock.astro and scans its scoped style block THEN the code surface carries 0 max-height and 0 fixed height declarations, 0 -webkit-line-clamp, 0 text-overflow: ellipsis, and 0 overflow: hidden, with exactly 1 overflow-wrap: anywhere declaration keeping every character visible as the block grows",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "Copy affordance always visible — no hover gating, 44px touch target, label plumbing",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only; clipboard-equals-text and success-state proofs are T-GEND-025 in the REF-001 lane.",
   "verification_service": "real filesystem read of the authored CodeBlock.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/code-primitives-contract.test.ts",
   "test_function": "REF-003-code-block-copy-affordance",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-copy-affordance",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored CodeBlock.astro source",
    "negative_control": {
     "would_fail_if": [
      "the trigger is revealed only on hover — the 0 opacity/visibility asserts fail and T-GEND-025's visible-without-hover clause breaks",
      "the touch target stays below 44px — the min-height assert fails the gate-11 mobile frame",
      "an outline: none override strips the focus ring — the outline-suppression assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "copy_button_island",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read CodeBlock.astro and the island pair from the real working tree",
        "assert the counted visibility rules, the label default, the single 44px override, and the unchanged island baseline"
       ]
      },
      "end_state": {
       "must_observe": [
        "0 opacity: 0 and 0 visibility: hidden rules targeting the trigger; 0 :hover reveal rules",
        "exactly 1 label default 'Copy code' flowing to the CopyButton aria-label prop",
        "exactly 1 :global(.copy-button__trigger) override declaring min-height: 44px"
       ],
       "must_not_observe": [
        "0 outline: none / outline suppression declarations on the trigger",
        "0 modifications to islands/CopyButton.astro or scripts/copy-button.ts (byte-identical baseline)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the island's trigger renders unconditionally beside its <code> child, and (RED at start) no CodeBlock.astro WHEN the test reads CodeBlock.astro and scans its styles and label plumbing THEN the composed trigger carries 0 opacity: 0 rules, 0 visibility: hidden rules, and 0 hover-revealed display rules, exactly 1 label default 'Copy code' flows to the CopyButton aria-label prop, and exactly 1 :global(.copy-button__trigger) override declares min-height: 44px with 0 outline suppression",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "ThemingNote deterministic token-chip split over the real notes",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file plus a real dataset import — real file reads only; the rendered chip proof is gate step 10 over REF-009's assembly.",
   "verification_service": "real filesystem read of the authored ThemingNote.astro source + real registry-items.json import under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/code-primitives-contract.test.ts",
   "test_function": "REF-003-theming-note-token-chips",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-theming-note-token-chips",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus real dataset import — real file reads only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored ThemingNote.astro source + real registry-items.json import under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the note renders as one unsplit plain string — the pattern literal and Chip composition asserts fail",
      "a hand-written note vocabulary replaces the real field — the 37/39 + 147-identifier grounding diverges",
      "a second pill pattern is hand-rolled instead of composing Chip — the Chip-import assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_code_primitives",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read ThemingNote.astro and import the real registry dataset",
        "assert the single pattern literal, the Chip composition, and the identifier grounding"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 token-identifier regex literal in the frontmatter",
        "1 import of Chip with matches composed in its counter-less value-only form",
        "37/39 notes render >=1 chip with the note's full text reconstructible from chips + prose (grounded on the 147-identifier dataset); conversation and suggestion render 0 chips"
       ],
       "must_not_observe": [
        "0 hardcoded theming sentences (the note prop is the sole string source)",
        "0 hex color literals and 0 <script> tags"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real dataset's 39 themingNote strings (37/39 carry hyphenated semantic-class identifiers — 147 total, 16 unique; conversation and suggestion carry none) and (RED at start) no ThemingNote.astro WHEN the test reads apps/docs/src/components/ThemingNote.astro and scans its frontmatter and template THEN it declares exactly 1 token-identifier pattern (a hyphenated-lowercase regex literal), renders each match as a Chip counter-less mono pill, and renders non-match segments as plain prose — 37/39 notes render >=1 chip with the note's full text reconstructible from chips + prose (grounded on the 147-identifier dataset); conversation and suggestion render 0 chips",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-5",
   "name": "UsageSnippet verbatim passthrough — never fabricated",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only; the rendered snippet proof is gate step 10 over REF-009's assembly.",
   "verification_service": "real filesystem read of the authored UsageSnippet.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/code-primitives-contract.test.ts",
   "test_function": "REF-003-usage-snippet-verbatim",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-usage-snippet-verbatim",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored UsageSnippet.astro source",
    "negative_control": {
     "would_fail_if": [
      "a canned example snippet substitutes for missing input — the 0-fallback-string assert fails (fabricated content)",
      "snippet is normalized before rendering — the 0-normalization assert fails the verbatim fidelity rule",
      "the prop is optional with a default snippet — the required-no-default assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_code_primitives",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read UsageSnippet.astro from the real working tree",
        "assert the required prop, the single CodeBlock passthrough, and the absence of fabricated content"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 required snippet prop with 0 assigned defaults",
        "exactly 1 <CodeBlock code={snippet}> composition"
       ],
       "must_not_observe": [
        "0 fallback example snippets (no '() => <Example>' style canned strings)",
        "0 .trim( / .replace( normalization applied to snippet",
        "0 conditional substitution branches replacing an empty snippet with authored text"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real dataset where 39/39 items carry a non-empty usageSnippet (the gallery-cell snippet) and (RED at start) no UsageSnippet.astro WHEN the test reads apps/docs/src/components/UsageSnippet.astro and scans its structure THEN it takes 1 required snippet prop with 0 assigned defaults, composes exactly 1 <CodeBlock code={snippet}> with the snippet passed verbatim, and contains 0 canned fallback snippet strings and 0 conditional substitution branches",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "CodeBlock.astro imports and composes exactly 1 CopyButton with command={code} and declares exactly 1 background: var(--code-background) + 1 color: var(--code-foreground) in the scoped style block plus 1 white-space: pre-wrap + 1 font-family: var(--font-mono) on the composed code surface.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-verbatim-island-composition"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "CodeBlock.astro carries 0 <script> tags, 0 customElements.define calls, 0 hex literals, and 0 normalization (.trim( / .replace( / .normalize( / set:html) applied to the code prop.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-verbatim-island-composition"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The code surface declares 0 max-height/height, 0 -webkit-line-clamp, 0 text-overflow: ellipsis, and 0 overflow: hidden, with exactly 1 overflow-wrap: anywhere declaration.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-untruncated-body"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "0 details/summary collapse affordances gate the body, and the 38/39 multi-line snippets keep their newlines under pre-wrap.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-untruncated-body"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "The composed trigger carries 0 opacity/visibility hover-gating rules and exactly 1 label default 'Copy code' flows to the CopyButton aria-label prop.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-copy-affordance"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "Exactly 1 :global(.copy-button__trigger) override declares min-height: 44px with 0 outline suppression, and the island pair is byte-identical to task start.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-code-block-copy-affordance"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "ThemingNote.astro declares exactly 1 token-identifier regex literal, composes matches through 1 Chip import in counter-less form, and renders 37/39 notes with >=1 chip reconstructible from the 147-identifier dataset while conversation and suggestion render 0 chips.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-theming-note-token-chips"
  },
  {
   "id": "TC-8",
   "type": "test_criterion",
   "description": "ThemingNote.astro contains 0 hand-written note strings, 0 hex literals, and 0 <script> tags.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-theming-note-token-chips"
  },
  {
   "id": "TC-9",
   "type": "test_criterion",
   "description": "UsageSnippet.astro takes 1 required snippet prop with 0 defaults and composes exactly 1 CodeBlock with code={snippet} verbatim.",
   "maps_to_ac": "AC-5",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-usage-snippet-verbatim"
  },
  {
   "id": "TC-10",
   "type": "test_criterion",
   "description": "UsageSnippet.astro contains 0 canned fallback snippet strings, 0 conditional substitution branches, and 0 normalization applied to snippet.",
   "maps_to_ac": "AC-5",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/code-primitives-contract.test.ts -t REF-003-usage-snippet-verbatim"
  }
 ]
}
-->

</details>
