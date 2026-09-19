<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FAM-002: SectionHeader + ComponentCard primitives, one-line description clamp, Chip counter-optional

> Status: ✅ Completed
> Commit: 72aa84b1ae42fe1f173da3f2e10ae5a5e50a8e72
> Assignee: frontend-designer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 5 · Type: FEATURE · Wave: A
> Proposed By: frontend-designer · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 2107567

## What this does
Author the two render-ready family-browse primitives (SectionHeader, ComponentCard) plus the pure one-line clamp they and the tests share, and make Chip's counter optional so the primitives can render counter-less pills — token-governed, zero-JS, Badge composed unmodified.

## Why
SectionHeader.astro, ComponentCard.astro, and one-line-description.ts exist in apps/docs/src/, are prop-driven, token-only, and script-free; oneLineDescription passes the 39-real-description contract; Chip renders counter-less with 0 data-counter emissions while the counter form is unchanged; FAM-003 and FAM-006 compose both primitives without modification.

## How to verify
pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-one-line-description-clamp

## Scope
apps/docs/src/components/SectionHeader.astro (NEW); apps/docs/src/components/ComponentCard.astro (NEW); apps/docs/src/lib/one-line-description.ts (NEW); apps/docs/src/components/Chip.astro (MODIFY); tests/sprint-03-family-browse/component-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (FAM-002 — required reading for implementer + reviewer)</summary>

TASK: FAM-002 — SectionHeader + ComponentCard primitives, one-line description clamp, Chip counter-optional
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 5
AGENT: implementer=frontend-designer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: Badge.astro is consumed UNMODIFIED — ComponentCard maps item.expoGo to tone 'expo-go' | 'dev-client'; the scenario-exact strings land via FAM-005, never here
- MUST: oneLineDescription is deterministic: clamp the REAL description field at a word boundary to <=120 chars, appending an ellipsis ONLY when truncation occurred — a window onto the field, never a rewrite
- MUST: Every color, spacing, radius, and typography value resolves through var(--*) tokens from SHELL-001 — zero hex, zero raw color literals
- NEVER: Never invent a new verdict vocabulary or a second badge pattern — exactly two tones site-wide, keyed off item.expoGo
- NEVER: Never add imagery, thumbnails, or placeholder media boxes — null-imagery this sprint; keep the anatomy stacked so a media row can prepend later
- NEVER: Never add JavaScript — no <script>, no customElements.define, in either new component or the Chip modification
- STRICTLY: Strictly SCOPE write_allowed paths — Badge.astro, Button.astro, islands/**, and pages/** are write-prohibited (page composition is FAM-003/FAM-006 work)
- STRICTLY: Chip.astro modification is counter-optional ONLY — the counter-present render path and sprint-01 hook names stay byte-identical so home-hero.spec.ts stays green

### DONE WHEN

- [ ] AC 1: oneLineDescription clamps all 39 real descriptions deterministically
- [ ] AC 2: ComponentCard source contract — anchor-card anatomy, tokens, hover/focus, data hooks
- [ ] AC 3: SectionHeader source contract — anchored h2, scroll-margin, counter-less count Chip
- [ ] AC 4: Chip counter-optional without regressing the sprint-02 counter contract
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: oneLineDescription clamps all 39 real descriptions deterministically**

  GIVEN/WHEN/THEN: GIVEN the repo with the real registry at apps/docs/src/data/registry-items.json and (RED at start) no one-line-description module WHEN the test imports the 39 registry:component descriptions and maps them through oneLineDescription THEN every output is non-empty, <=120 chars, a string-prefix of its source description (before the appended ellipsis), with the ellipsis present only when truncation occurred

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/component-contract.test.ts · TEST_FUNCTION: FAM-002-one-line-description-clamp
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-one-line-description-clamp`
  VERIFICATION_SERVICE: real registry-items.json import + pure function execution under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Pure deterministic string transform over the real registry JSON — a file import and pure function, no rendering, no network, no DB. Rendered card behavior is FAM-003's card-anatomy.spec.ts (flow owner), outside this task's write_allowed.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["39/39 one-liners <=120 chars and non-empty", "39/39 outputs are prefixes of their source description field (before the appended ellipsis)", "all 39 real descriptions are 132-1840 chars, so all 39 outputs truncate and end with the ellipsis"] / MUST_NOT_OBSERVE ["0 empty outputs and 0 outputs longer than 120 chars (39/39 pass)", "0 outputs containing text absent from the source description (a rewrite or hand-written one-liner field)", "0 ellipses appended to non-truncated outputs"]
    - START_REF real_registry_dataset → MUST_OBSERVE ["the short input returns its exact input length (e.g. 12 chars in, 12 chars out) with no trailing ellipsis", "an input fitting exactly 120 chars returns with no ellipsis"] / MUST_NOT_OBSERVE ["0 ellipses on non-truncated outputs", "0 mid-word cuts (no truncated output ending inside a word without a preceding word boundary)"]
    - NEGATIVE_CONTROL: would fail if ['a second curated description source (hand-written one-liner field) replaces the clamp — the prefix-of-source assertions diverge', 'a static shell returns canned strings — the 39-record prefix/length assertions fail', 'the clamp rewrites text instead of windowing the real field — outputs stop being prefixes of the source descriptions']

**AC-2: ComponentCard source contract — anchor-card anatomy, tokens, hover/focus, data hooks**

  GIVEN/WHEN/THEN: GIVEN the repo with Badge/Chip/Button landed from sprint-02 and (RED at start) no ComponentCard WHEN the test reads apps/docs/src/components/ComponentCard.astro from the real working tree and scans its structure THEN the card is exactly one <a class="card" href={href}> with an inheriting h3, a 2-line-clamped muted one-liner at 0.875rem, a margin-top:auto footer composing Chip(category) + Badge(tone from expoGo), token-only surface, Button's outline hover idiom, an unsuppressed :focus-visible ring, a reduced-motion-gated 120ms transition, and data-card + data-filter-text emission

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/component-contract.test.ts · TEST_FUNCTION: FAM-002-component-card-source-contract
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-component-card-source-contract`
  VERIFICATION_SERVICE: real filesystem read of the authored ComponentCard.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file reads only, no runtime or external service (same pattern as the landed primitives.test.ts). The rendered card behavior is FAM-003's card-anatomy.spec.ts, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_primitives_sprint03 → MUST_OBSERVE ["exactly 1 <a class=\"card\" href={href}> root \u2014 no nested competing link", "1 <h3> with 0 font-size overrides (inherits the base h3 scale)", "the one-liner element declares font-size: 0.875rem, color var(--muted-foreground), and -webkit-line-clamp: 2", "1 footer row with margin-top: auto composing Chip (category) and Badge with tone derived from expoGo", "surface var(--card), 1px solid var(--border), border-radius var(--radius-lg), padding 1rem 1.25rem", "1 :hover rule setting border-color var(--input) and background var(--accent) (Button's outline idiom)", "1 :focus-visible rule consuming the ring token \u2014 never suppressed", "the 120ms ease transition declared inside @media (prefers-reduced-motion: no-preference)", "both data-card and data-filter-text emitted (2 attributes), filter text carrying name + clamped description + family"] / MUST_NOT_OBSERVE ["0 hex color literals matching #[0-9a-fA-F]{3,8}", "0 <script tags and 0 customElements.define calls", "0 local verdict strings or hardcoded badge text (Badge imported and driven via its tone prop)", "0 <img>, <picture>, or thumbnail placeholder elements"]
    - NEGATIVE_CONTROL: would fail if ['the component is a static stub shell — filler markup misses the clamp/hover/focus/data-attribute anchors', 'colors are hand-picked hex or raw literals instead of var(--*) references', 'the card hand-rolls verdict markup instead of importing Badge — a local verdict map or hardcoded string appears']

**AC-3: SectionHeader source contract — anchored h2, scroll-margin, counter-less count Chip**

  GIVEN/WHEN/THEN: GIVEN the repo and (RED at start) no SectionHeader WHEN the test reads apps/docs/src/components/SectionHeader.astro from the real working tree and scans its structure THEN it renders exactly one <h2 id={anchor}> with an optional counter-less count Chip, scroll-margin-block-start: calc(var(--layout-header-h) + 1rem), a baseline-aligned flex row with gap 0.75rem, and token-only zero-JS styles

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/component-contract.test.ts · TEST_FUNCTION: FAM-002-section-header-source-contract
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-section-header-source-contract`
  VERIFICATION_SERVICE: real filesystem read of the authored SectionHeader.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file reads only, no runtime or external service; rendered anchor behavior rides FAM-003's playwright lane.
  SCENARIO:
    - START_REF authored_primitives_sprint03 → MUST_OBSERVE ["1 <h2 id={anchor}> binding the anchor prop", "the optional count composed through Chip's counter-less form carrying 1 var(--font-mono) rule and 1 tabular-nums value style", "1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) declaration on the anchored heading", "1 flex row, baseline-aligned, gap: 0.75rem"] / MUST_NOT_OBSERVE ["0 hex color literals and 0 <script tags", "0 h2 font-size overrides (the base heading scale carries it)", "0 hand-rolled count pills bypassing Chip", "0 border and 0 background declarations on the header row"]
    - NEGATIVE_CONTROL: would fail if ['a static shell — filler markup misses the anchor binding, scroll-margin, and counter-less Chip anchors', 'the header hand-rolls its own count pill instead of composing Chip — a second pill pattern appears', 'anchor jumps would hide under the sticky Header — the scroll-margin token expression is absent']

**AC-4: Chip counter-optional without regressing the sprint-02 counter contract**

  GIVEN/WHEN/THEN: GIVEN sprint-02's landed Chip.astro with a required counter prop WHEN the test reads the modified Chip.astro source THEN counter is optional (counter?), the counter-less path is a plain pill emitting exactly 0 data-counter attributes, and the counter-present path still emits <data data-counter value> naming exactly 5 hooks (version/total/components/ui/libs) with sprint-02 styling unchanged

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/component-contract.test.ts · TEST_FUNCTION: FAM-002-chip-counter-optional
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-chip-counter-optional`
  VERIFICATION_SERVICE: real filesystem read of the modified Chip.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file reads only, no runtime or external service; the rendered regression proof is the unchanged sprint-02 hero spec in verification_gates.
  SCENARIO:
    - START_REF authored_primitives_sprint03 → MUST_OBSERVE ["Props declares counter optional \u2014 1 'counter?:' optional marker", "exactly 0 data-counter occurrences in the counter-absent render path", "the counter-present path emits <data data-counter={counter} value={String(value)}> with the CounterHook union naming exactly 5 hooks: version, total, components, ui, libs", ".chip__value still carries font-family: var(--font-mono) and font-variant-numeric: tabular-nums"] / MUST_NOT_OBSERVE ["0 data-counter attributes emitted when counter is absent", "0 missing hook names from the 5-name union", "0 style-rule drift in .chip/.chip__value from sprint-02 defaults"]
    - NEGATIVE_CONTROL: would fail if ['counter stays required — 0 counter-less render paths exist so the optional-signature assert fails', 'the edit removes or renames the <data data-counter> passthrough — the hook-name count drops below 5 and the sprint-01 hero spec would break', 'the edit restyles the counter form — the .chip/.chip__value rules drift from sprint-02 defaults']


### TEST CRITERIA

- **TC-1** (→AC-1, ): 39/39 real registry:component one-liners are non-empty, <=120 chars, prefixes of their source descriptions, with the ellipsis appended only on truncation. — `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-one-line-description-clamp`
- **TC-2** (→AC-1, ): Short and exactly-120 inputs pass through unchanged with no ellipsis; truncation cuts at a word boundary, never mid-word. — `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-one-line-description-clamp`
- **TC-3** (→AC-2, ): ComponentCard.astro carries exactly 1 <a class="card"> root, an inheriting h3, the 2-line clamp on var(--muted-foreground) at 0.875rem, the margin-top:auto Chip+Badge footer, the token surface, the hover idiom (var(--input) + var(--accent)), the unsuppressed :focus-visible ring, the reduced-motion-gated 120ms transition, and both data attributes. — `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-component-card-source-contract`
- **TC-4** (→AC-2, ): ComponentCard.astro imports Badge and Chip and contains 0 local verdict strings, 0 hex literals, 0 script tags, and 0 imagery elements. — `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-component-card-source-contract`
- **TC-5** (→AC-3, ): SectionHeader.astro binds 1 <h2 id={anchor}>, declares 1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem), lays out 1 baseline flex row with gap 0.75rem, composes the count through counter-less Chip, and declares 0 border/background rules. — `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-section-header-source-contract`
- **TC-6** (→AC-4, ): Chip.astro declares counter optional, renders a plain pill with exactly 0 data-counter emissions when counter is absent, and keeps the counter-present passthrough naming all 5 hooks (version/total/components/ui/libs) byte-identical to sprint-02. — `pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-chip-counter-optional`

### READING LIST (max 5)

- apps/docs/src/components/Chip.astro + apps/docs/src/components/Badge.astro [PRIMARY PATTERN] lines all — The composition contract being extended and consumed: Chip's Props {counter, value, label?} and the <data data-counter> passthrough (Chip lines 10-34); Badge's tone prop and two-tone VERDICTS map the card must consume unmodified (Badge lines 8-23).
- apps/docs/src/components/Button.astro [closest-analogue] lines all — Lines 48-82: the outline hover idiom (background var(--accent) swap) and the :focus-visible ring contract the card's hover/focus rules imitate.
- apps/docs/src/pages/components/[item].astro [data conventions] lines all — How registry fields (name, description, family, expoGo) are already read and rendered on item pages — the enriched item shape ComponentCard consumes.
- apps/docs/src/data/registry-items.json [real dataset] lines all — The REAL 39-item registry:component dataset the clamp contract runs against (descriptions 132-1840 chars) — never a fixture copy.
- tests/sprint-02-shell-hero/primitives.test.ts [test pattern] lines all — The landed vitest source-scan pattern (real file reads, forbidden-string assertions) component-contract.test.ts imitates.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/components/SectionHeader.astro (NEW)
- apps/docs/src/components/ComponentCard.astro (NEW)
- apps/docs/src/lib/one-line-description.ts (NEW)
- apps/docs/src/components/Chip.astro (MODIFY)
- tests/sprint-03-family-browse/component-contract.test.ts (NEW)
writeProhibited:
- apps/docs/src/components/Badge.astro — verdict strings land via FAM-005; consumed unmodified here
- apps/docs/src/components/Button.astro
- apps/docs/src/islands/**
- apps/docs/src/pages/** — page composition belongs to FAM-003/FAM-006
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Prop-driven Astro function component with scoped var(--*)-only styles; variant/tone selection via props, composition over duplication — the card composes Chip + Badge exactly as the hero composes Button + Chip (source: apps/docs/src/components/Button.astro)
- anti-pattern: per-variant sibling components; hardcoded card counts; a second curated description field
- references: ['TR-07 components-index wireframe row — family section (anchored header + card grid) and card anatomy', 'TR-07 home R9 wireframe row — teaser consumes these same primitives']
- notes: ["Hover: Button's outline idiom — border-color var(--input) + background var(--accent); never a scale/shadow effect", 'Focus: the global :focus-visible contract (2px var(--ring), 2px offset) inherited, never suppressed — the whole card is the link so the ring wraps it', "One-liner: small/0.875rem var(--muted-foreground), -webkit-line-clamp: 2, fed by oneLineDescription's <=120-char word-boundary window", 'Motion: the 120ms ease transition exists only inside @media (prefers-reduced-motion: no-preference)', 'Anchors: scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) so anchor jumps clear the sticky Header; consumers bind aria-labelledby', 'Counter-less Chip keeps the tabular-numeric value styling so SectionHeader counts align in columns; no thumbnail/imagery this sprint (null-imagery rule)']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01'] · provides: ['SectionHeader.astro — props {title, anchor, count?}: zero-JS anchored <h2 id={anchor}> + optional counter-less count Chip (tabular numerals), scroll-margin clearing the sticky Header; consumers bind aria-labelledby', 'ComponentCard.astro — props {href, title, description, category, expoGo}: single <a class="card"> root, 2-line-clamped one-liner, Chip(category) + Badge(tone from expoGo) footer, data-card + data-filter-text emission', 'one-line-description.ts — pure oneLineDescription(description): word-boundary clamp to <=120 chars, ellipsis only on truncation; plain module because vitest cannot import .astro frontmatter', 'Chip.astro counter-optional form — absent counter renders a plain pill with no <data data-counter> wrapper; counter-present markup unchanged from sprint-02'] · consumes: ['Enriched registry item shape from apps/docs/src/data/registry-items.json (name, description, family, expoGo — the fields item pages render today)', "Badge.astro UNMODIFIED — tone 'expo-go' when item.expoGo true, 'dev-client' when false; scenario-exact strings land via FAM-005", 'Chip.astro (counter-optionalized by this task) for the category pill and SectionHeader count', 'SHELL-001 tokens: --card, --border, --radius-lg, --muted-foreground, --input, --accent, --layout-header-h, --ring, --font-mono']

- {"provider": "FAM-002", "consumer": "FAM-003 /components page + FAM-006 home teaser", "contract": "SectionHeader props {title, anchor, count?} render <h2 id={anchor}> + optional counter-less count Chip; consumers bind aria-labelledby to the anchor id"}
- {"provider": "FAM-002", "consumer": "FAM-003 filter island + family sections", "contract": "ComponentCard props {href, title, description, category, expoGo} render one <a> root emitting data-card and data-filter-text (name + clamped description + family)"}
- {"provider": "FAM-002", "consumer": "any vitest test", "contract": "oneLineDescription(description: string): string \u2014 <=120 chars, word-boundary clamp, '\u2026' appended only when truncation occurred; deterministic, never a rewrite"}
- {"provider": "FAM-005 (Badge.astro strings)", "consumer": "FAM-002 ComponentCard", "contract": "Badge consumed verbatim: tone = item.expoGo ? 'expo-go' : 'dev-client'; rendered strings become 'runs in Expo Go' / 'requires a dev client' when FAM-005 lands"}

### VERIFICATION GATES

- AC-1: pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-one-line-description-clamp — exit 0
- AC-2: pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-component-card-source-contract — exit 0
- AC-3: pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-section-header-source-contract — exit 0
- AC-4: pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-chip-counter-optional — exit 0
- RED-first: the four -t runs FAIL before authoring (module absent / files absent / counter still required) — record the RED outputs
- Seeded evidence: captured stdout shows 39/39 one-liners <=120 chars, not merely exit 0
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/components apps/docs/src/lib tests/sprint-03-family-browse/component-contract.test.ts — exit 0 (never pnpm lint; local crash)
- sprint-02 regression: pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts green unchanged (Chip counter path untouched)
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES
- Depends on: [] · Blocks: ['FAM-003', 'FAM-006'] · Parallel: 

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Scoped component styles consuming var(--*) tokens only; prop-driven variants
- Zero <script>, zero customElements.define — zero-JS primitives
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FAM-002",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_dataset": {
   "description": "The real registry dataset imported from the working tree at run time: apps/docs/src/data/registry-items.json filtered to type 'registry:component'. RED at task start: one-line-description.ts does not exist, so importing the module under test fails.",
   "seed_method": "public_api",
   "records": [
    "39 registry:component items, 7 families, counts 3/7/6/7/4/1/11",
    "descriptions 132-1840 chars",
    "Badge strings 'runs in Expo Go' / 'requires a dev client' (land via FAM-005)"
   ]
  },
  "authored_primitives_sprint03": {
   "description": "The authored SectionHeader.astro, ComponentCard.astro, one-line-description.ts, and modified Chip.astro read from the real working tree at run time. RED at task start: the three new files are absent so the reads fail; Chip still requires counter so the counter-less assert fails.",
   "seed_method": "ui_flow",
   "records": [
    "apps/docs/src/components/SectionHeader.astro exists with {title, anchor, count?} props",
    "apps/docs/src/components/ComponentCard.astro exists with the single-<a> anatomy",
    "apps/docs/src/lib/one-line-description.ts exports oneLineDescription",
    "apps/docs/src/components/Chip.astro declares counter as optional"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "oneLineDescription clamps all 39 real descriptions deterministically",
   "primary": false,
   "description": "GIVEN the repo with the real registry at apps/docs/src/data/registry-items.json and (RED at start) no one-line-description module WHEN the test imports the 39 registry:component descriptions and maps them through oneLineDescription THEN every output is non-empty, <=120 chars, a string-prefix of its source description (before the appended ellipsis), with the ellipsis present only when truncation occurred",
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Pure deterministic string transform over the real registry JSON \u2014 a file import and pure function, no rendering, no network, no DB. Rendered card behavior is FAM-003's card-anatomy.spec.ts (flow owner), outside this task's write_allowed.",
   "verification_service": "real registry-items.json import + pure function execution under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-03-family-browse/component-contract.test.ts",
   "test_function": "FAM-002-one-line-description-clamp",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-one-line-description-clamp",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Pure deterministic string transform over the real registry JSON \u2014 a file import and pure function, no rendering, no network, no DB.",
    "verification_service": "real registry-items.json import + pure function execution under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "a second curated description source (hand-written one-liner field) replaces the clamp \u2014 the prefix-of-source assertions diverge",
      "a static shell returns canned strings \u2014 the 39-record prefix/length assertions fail",
      "the clamp rewrites text instead of windowing the real field \u2014 outputs stop being prefixes of the source descriptions"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "import apps/docs/src/data/registry-items.json and filter to the 39 registry:component items",
        "map every item's description through oneLineDescription and assert the clamp contract"
       ]
      },
      "end_state": {
       "must_observe": [
        "39/39 one-liners <=120 chars and non-empty",
        "39/39 outputs are prefixes of their source description field (before the appended ellipsis)",
        "all 39 real descriptions are 132-1840 chars, so all 39 outputs truncate and end with the ellipsis"
       ],
       "must_not_observe": [
        "0 empty outputs and 0 outputs longer than 120 chars (39/39 pass)",
        "0 outputs containing text absent from the source description (a rewrite or hand-written one-liner field)",
        "0 ellipses appended to non-truncated outputs"
       ]
      }
     },
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "call oneLineDescription on boundary inputs: a short string under 120 chars and a string whose word boundary lands exactly at 120"
       ]
      },
      "end_state": {
       "must_observe": [
        "the short input returns its exact input length (e.g. 12 chars in, 12 chars out) with no trailing ellipsis",
        "an input fitting exactly 120 chars returns with no ellipsis"
       ],
       "must_not_observe": [
        "0 ellipses on non-truncated outputs",
        "0 mid-word cuts (no truncated output ending inside a word without a preceding word boundary)"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "ComponentCard source contract \u2014 anchor-card anatomy, tokens, hover/focus, data hooks",
   "primary": false,
   "description": "GIVEN the repo with Badge/Chip/Button landed from sprint-02 and (RED at start) no ComponentCard WHEN the test reads apps/docs/src/components/ComponentCard.astro from the real working tree and scans its structure THEN the card is exactly one <a class=\"card\" href={href}> with an inheriting h3, a 2-line-clamped muted one-liner at 0.875rem, a margin-top:auto footer composing Chip(category) + Badge(tone from expoGo), token-only surface, Button's outline hover idiom, an unsuppressed :focus-visible ring, a reduced-motion-gated 120ms transition, and data-card + data-filter-text emission",
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file \u2014 real file reads only, no runtime or external service (same pattern as the landed primitives.test.ts). The rendered card behavior is FAM-003's card-anatomy.spec.ts, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored ComponentCard.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-03-family-browse/component-contract.test.ts",
   "test_function": "FAM-002-component-card-source-contract",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-component-card-source-contract",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over an authored .astro file \u2014 real file reads only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored ComponentCard.astro source",
    "negative_control": {
     "would_fail_if": [
      "the component is a static stub shell \u2014 filler markup misses the clamp/hover/focus/data-attribute anchors",
      "colors are hand-picked hex or raw literals instead of var(--*) references",
      "the card hand-rolls verdict markup instead of importing Badge \u2014 a local verdict map or hardcoded string appears"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_primitives_sprint03",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/ComponentCard.astro from the real working tree",
        "assert the anchor-card anatomy, token surface, hover/focus/reduced-motion rules, and data attribute emission"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 <a class=\"card\" href={href}> root \u2014 no nested competing link",
        "1 <h3> with 0 font-size overrides (inherits the base h3 scale)",
        "the one-liner element declares font-size: 0.875rem, color var(--muted-foreground), and -webkit-line-clamp: 2",
        "1 footer row with margin-top: auto composing Chip (category) and Badge with tone derived from expoGo",
        "surface var(--card), 1px solid var(--border), border-radius var(--radius-lg), padding 1rem 1.25rem",
        "1 :hover rule setting border-color var(--input) and background var(--accent) (Button's outline idiom)",
        "1 :focus-visible rule consuming the ring token \u2014 never suppressed",
        "the 120ms ease transition declared inside @media (prefers-reduced-motion: no-preference)",
        "both data-card and data-filter-text emitted (2 attributes), filter text carrying name + clamped description + family"
       ],
       "must_not_observe": [
        "0 hex color literals matching #[0-9a-fA-F]{3,8}",
        "0 <script tags and 0 customElements.define calls",
        "0 local verdict strings or hardcoded badge text (Badge imported and driven via its tone prop)",
        "0 <img>, <picture>, or thumbnail placeholder elements"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "SectionHeader source contract \u2014 anchored h2, scroll-margin, counter-less count Chip",
   "primary": false,
   "description": "GIVEN the repo and (RED at start) no SectionHeader WHEN the test reads apps/docs/src/components/SectionHeader.astro from the real working tree and scans its structure THEN it renders exactly one <h2 id={anchor}> with an optional counter-less count Chip, scroll-margin-block-start: calc(var(--layout-header-h) + 1rem), a baseline-aligned flex row with gap 0.75rem, and token-only zero-JS styles",
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file \u2014 real file reads only, no runtime or external service; rendered anchor behavior rides FAM-003's playwright lane.",
   "verification_service": "real filesystem read of the authored SectionHeader.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-03-family-browse/component-contract.test.ts",
   "test_function": "FAM-002-section-header-source-contract",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-section-header-source-contract",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over an authored .astro file \u2014 real file reads only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored SectionHeader.astro source",
    "negative_control": {
     "would_fail_if": [
      "a static shell \u2014 filler markup misses the anchor binding, scroll-margin, and counter-less Chip anchors",
      "the header hand-rolls its own count pill instead of composing Chip \u2014 a second pill pattern appears",
      "anchor jumps would hide under the sticky Header \u2014 the scroll-margin token expression is absent"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_primitives_sprint03",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/SectionHeader.astro from the real working tree",
        "assert the anchor wiring, scroll-margin, layout row, and counter-less Chip composition"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 <h2 id={anchor}> binding the anchor prop",
        "the optional count composed through Chip's counter-less form carrying 1 var(--font-mono) rule and 1 tabular-nums value style",
        "1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem) declaration on the anchored heading",
        "1 flex row, baseline-aligned, gap: 0.75rem"
       ],
       "must_not_observe": [
        "0 hex color literals and 0 <script tags",
        "0 h2 font-size overrides (the base heading scale carries it)",
        "0 hand-rolled count pills bypassing Chip",
        "0 border and 0 background declarations on the header row"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Chip counter-optional without regressing the sprint-02 counter contract",
   "primary": false,
   "description": "GIVEN sprint-02's landed Chip.astro with a required counter prop WHEN the test reads the modified Chip.astro source THEN counter is optional (counter?), the counter-less path is a plain pill emitting exactly 0 data-counter attributes, and the counter-present path still emits <data data-counter value> naming exactly 5 hooks (version/total/components/ui/libs) with sprint-02 styling unchanged",
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file \u2014 real file reads only, no runtime or external service; the rendered regression proof is the unchanged sprint-02 hero spec in verification_gates.",
   "verification_service": "real filesystem read of the modified Chip.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-03-family-browse/component-contract.test.ts",
   "test_function": "FAM-002-chip-counter-optional",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-chip-counter-optional",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan \u2014 real file reads only, no runtime or external service.",
    "verification_service": "real filesystem read of the modified Chip.astro source",
    "negative_control": {
     "would_fail_if": [
      "counter stays required \u2014 0 counter-less render paths exist so the optional-signature assert fails",
      "the edit removes or renames the <data data-counter> passthrough \u2014 the hook-name count drops below 5 and the sprint-01 hero spec would break",
      "the edit restyles the counter form \u2014 the .chip/.chip__value rules drift from sprint-02 defaults"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_primitives_sprint03",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/Chip.astro from the real working tree",
        "assert the optional counter signature, the counter-less plain-pill path, and the unchanged counter-present passthrough"
       ]
      },
      "end_state": {
       "must_observe": [
        "Props declares counter optional \u2014 1 'counter?:' optional marker",
        "exactly 0 data-counter occurrences in the counter-absent render path",
        "the counter-present path emits <data data-counter={counter} value={String(value)}> with the CounterHook union naming exactly 5 hooks: version, total, components, ui, libs",
        ".chip__value still carries font-family: var(--font-mono) and font-variant-numeric: tabular-nums"
       ],
       "must_not_observe": [
        "0 data-counter attributes emitted when counter is absent",
        "0 missing hook names from the 5-name union",
        "0 style-rule drift in .chip/.chip__value from sprint-02 defaults"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "description": "39/39 real registry:component one-liners are non-empty, <=120 chars, prefixes of their source descriptions, with the ellipsis appended only on truncation.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-one-line-description-clamp",
   "type": "test_criterion"
  },
  {
   "id": "TC-2",
   "description": "Short and exactly-120 inputs pass through unchanged with no ellipsis; truncation cuts at a word boundary, never mid-word.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-one-line-description-clamp",
   "type": "test_criterion"
  },
  {
   "id": "TC-3",
   "description": "ComponentCard.astro carries exactly 1 <a class=\"card\"> root, an inheriting h3, the 2-line clamp on var(--muted-foreground) at 0.875rem, the margin-top:auto Chip+Badge footer, the token surface, the hover idiom (var(--input) + var(--accent)), the unsuppressed :focus-visible ring, the reduced-motion-gated 120ms transition, and both data attributes.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-component-card-source-contract",
   "type": "test_criterion"
  },
  {
   "id": "TC-4",
   "description": "ComponentCard.astro imports Badge and Chip and contains 0 local verdict strings, 0 hex literals, 0 script tags, and 0 imagery elements.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-component-card-source-contract",
   "type": "test_criterion"
  },
  {
   "id": "TC-5",
   "description": "SectionHeader.astro binds 1 <h2 id={anchor}>, declares 1 scroll-margin-block-start: calc(var(--layout-header-h) + 1rem), lays out 1 baseline flex row with gap 0.75rem, composes the count through counter-less Chip, and declares 0 border/background rules.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-section-header-source-contract",
   "type": "test_criterion"
  },
  {
   "id": "TC-6",
   "description": "Chip.astro declares counter optional, renders a plain pill with exactly 0 data-counter emissions when counter is absent, and keeps the counter-present passthrough naming all 5 hooks (version/total/components/ui/libs) byte-identical to sprint-02.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/component-contract.test.ts -t FAM-002-chip-counter-optional",
   "type": "test_criterion"
  }
 ]
}
-->

</details>
