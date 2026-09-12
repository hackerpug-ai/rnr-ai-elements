<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FAM-006: Home R9 family teaser grid — seven anchored family sections below the hero

> Status: ✅ Completed
> Commit: 6d632f231491068ab9683f363a0ac58631c7a888
> Assignee: frontend-designer (implementer) · astro-reviewer (reviewer)
> Priority: P2 · Points: 3 · Type: FEATURE · Wave: D
> Proposed By: frontend-designer · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 2107567

## What this does
Add wireframe region R9 to the home page below the sprint-02 hero — seven anchored family sections generated from the same registry derivation as /components, holding all 39 ComponentCards with their verdict badges — and update the header comment so only R10-R12 remain deferred.

## Why
index.astro's post-hero region renders one section#families deriving 7 families / 39 registry:component items (counts 3/7/6/7/4/1/11) through SectionHeader + ComponentCard with 0 script tags inside the region; the hero region's anchors are all intact; R10-R12 stay deferred; the vitest contract and the playwright lane gate both pass with sprint-02 specs green unchanged.

## How to verify
pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-seven-sections-39-cards

## Scope
apps/docs/src/pages/index.astro (MODIFY); tests/sprint-03-family-browse/home-teaser-contract.test.ts (NEW); tests/sprint-03-family-browse/home-family-teaser.spec.ts (NEW)

<details>
<summary>▸ Full agent specification (FAM-006 — required reading for implementer + reviewer)</summary>

TASK: FAM-006 — Home R9 family teaser grid — seven anchored family sections below the hero
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P2 · POINTS: 3
AGENT: implementer=frontend-designer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: Hero regions R1-R8 are write-prohibited — SHELL-010's landed copy pass must survive; sprint-02 home-hero + copy-pass specs stay green unchanged
- MUST: The teaser derives from the same families.json + registry-items.json derivation as /components — no second curated list, no hardcoded card markup
- MUST: Every edit lands strictly in the post-hero region plus the file header comment
- NEVER: Never touch the hero regions R1-R8 — copy, counters, InstallCommand, and CTAs are frozen; escalate-don't-edit if a sprint-02 assertion over-specifies
- NEVER: Never add a filter island on home, or QR / quickstart strip / Callout / empty right-rail regions — R10-R12 remain deferred
- NEVER: Never add JavaScript — the teaser region is zero-JS (no new <script>, no island, no custom element)
- STRICTLY: Strictly write_allowed paths — components/**, islands/**, packages/**, and sprint-02 spec files are write-prohibited

### DONE WHEN

- [ ] AC 1: R9 source contract — one #families section deriving 7 families / 39 cards
- [ ] AC 2: Verdict vocabulary reaches the teaser cards only through ComponentCard composition
- [ ] AC 3: Sprint-02 hero regions stay untouched above the teaser
- [ ] AC 4: Deferred regions stay deferred and the teaser adds zero JS
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: R9 source contract — one #families section deriving 7 families / 39 cards**

  GIVEN/WHEN/THEN: GIVEN the repo with FAM-002 primitives landed and (RED at start) index.astro still deferring R9-R12 WHEN the test reads apps/docs/src/pages/index.astro plus families.json and registry-items.json from the real working tree THEN the post-hero region renders exactly 1 <section id="families" aria-label="Component families"> whose family blocks derive from the families.json + registry-items.json loop (7 families, 39 registry:component items, counts 3/7/6/7/4/1/11) composing SectionHeader per family and ComponentCard per item

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/home-teaser-contract.test.ts · TEST_FUNCTION: FAM-006-teaser-seven-sections-39-cards
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-seven-sections-39-cards`
  VERIFICATION_SERVICE: real filesystem reads of index.astro + families.json + registry-items.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored page source plus real JSON data imports — file reads only, no rendering, no network, no DB. The rendered browser proof rides the home-family-teaser.spec.ts lane gate in verification_gates (SHELL-004/SHELL-010 all-unit precedent).
  SCENARIO:
    - START_REF landed_home_hero → MUST_OBSERVE ["exactly 1 <section id=\"families\" aria-label=\"Component families\"> in the post-hero region", "the derivation imports families.json + registry-items.json and filters to registry:component: 7 families, 39 items, family counts 3/7/6/7/4/1/11", "1 SectionHeader composition per family (7 via the loop) and 1 ComponentCard per item (39 via the loop), both imported from apps/docs/src/components/"] / MUST_NOT_OBSERVE ["0 #families sections before the hero region in document order", "0 hand-written family sections outside the families.json loop", "0 non-registry:component items rendered (39 exactly)", "0 ComponentCard invocations outside the #families region"]
    - NEGATIVE_CONTROL: would fail if ['a static shell — section#families is absent (0 occurrences) so the section anchor assert fails', 'a hand-written curated list — the imported families/registry counts diverge from 7 families / 39 items / counts 3/7/6/7/4/1/11', 'cards are hand-rolled markup instead of ComponentCard composition — the ComponentCard import/invocation anchors vanish']

**AC-2: Verdict vocabulary reaches the teaser cards only through ComponentCard composition**

  GIVEN/WHEN/THEN: GIVEN the R9 teaser source WHEN the test scans the #families region of index.astro THEN every ComponentCard invocation passes the item's expoGo prop and the file contains 0 local verdict strings — the two-state vocabulary reaches the cards only through ComponentCard's Badge composition (strings landed by FAM-005)

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/home-teaser-contract.test.ts · TEST_FUNCTION: FAM-006-teaser-badge-vocabulary
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-badge-vocabulary`
  VERIFICATION_SERVICE: real filesystem read of index.astro under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored page source — file reads only, no rendering, no network, no DB; the rendered badge literals are proven by the playwright lane gate.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["every ComponentCard invocation inside #families binds the item's expoGo field (the loop passes item.expoGo \u2014 1 binding site covering all 39 items)", "the two-state vocabulary reaches the cards only via ComponentCard's Badge composition (ComponentCard imported from FAM-002, unmodified path)"] / MUST_NOT_OBSERVE ["0 local verdict strings in index.astro ('runs in Expo Go', 'requires a dev client', 'Expo Go', 'dev-client' \u2014 0 occurrences outside imports)", "0 hand-rolled badge spans/classes bypassing ComponentCard", "0 card invocations missing the expoGo binding"]
    - NEGATIVE_CONTROL: would fail if ['the teaser hand-rolls badge markup bypassing ComponentCard/Badge — a local verdict string appears (count > 0)', 'the expoGo prop is dropped from the card invocations — 0 expoGo bindings found', 'a third verdict path is introduced on home — vocabulary strings outside the Badge composition appear']

**AC-3: Sprint-02 hero regions stay untouched above the teaser**

  GIVEN/WHEN/THEN: GIVEN the sprint-02 landed hero in the same file WHEN the test scans the pre-#families hero region of index.astro THEN all hero anchors survive the edit — the 5 data-counter hook names (version/total/components/ui/libs), both CTA hrefs (/registry and /components), and the InstallCommand composition — with 0 drift in the hero region

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/home-teaser-contract.test.ts · TEST_FUNCTION: FAM-006-hero-regions-intact
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-hero-regions-intact`
  VERIFICATION_SERVICE: real filesystem read of index.astro under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored page source — file reads only, no rendering, no network, no DB; the rendered hero values (0.2.1/56/39/11/6) are re-asserted by the sprint-02 regression gate and the lane spec.
  SCENARIO:
    - START_REF landed_home_hero → MUST_OBSERVE ["5 data-counter hook names present in the hero region (version, total, components, ui, libs)", "2 CTA hrefs present: /registry (Get started) and /components (Browse components)", "1 InstallCommand composition unchanged, and the hero region precedes #families in document order"] / MUST_NOT_OBSERVE ["0 missing hero anchors (5 counters + 2 CTA hrefs + 1 InstallCommand all present)", "0 hero copy changes against the SHELL-010 landed literals", "0 teaser markup inside the hero region"]
    - NEGATIVE_CONTROL: would fail if ['a hero overwrite — any counter hook, CTA href, or InstallCommand anchor disappears (anchor count drops below 5 counters / 2 hrefs / 1 composition)', 'the teaser markup is injected inside or above the hero — the document-order anchor assert fails', 'hero copy is edited — the landed SHELL-010 copy literals stop matching']

**AC-4: Deferred regions stay deferred and the teaser adds zero JS**

  GIVEN/WHEN/THEN: GIVEN the modified index.astro WHEN the test scans the header comment and the #families region THEN the comment marks R9 shipped with R10-R12 deferred (1 comment anchor), and the region contains 0 <script elements, 0 custom elements, 0 R10-R12 markers, and 0 filter-island imports

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/home-teaser-contract.test.ts · TEST_FUNCTION: FAM-006-deferred-regions-and-zero-js
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-deferred-regions-and-zero-js`
  VERIFICATION_SERVICE: real filesystem read of index.astro under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored page source — file reads only, no rendering, no network, no DB; the rendered absence proof is re-asserted by the playwright lane gate.
  SCENARIO:
    - START_REF landed_home_hero → MUST_OBSERVE ["1 header comment anchor marking R9 shipped and R10-R12 deferred", "the #families region composes exactly 7 SectionHeader and 39 ComponentCard invocations (0 hand-rolled card markup)"] / MUST_NOT_OBSERVE ["0 <script elements inside #families", "0 custom-element registrations or island imports inside #families", "0 R10-R12 markers (QR, quickstart strip, Callout, right-rail region)", "0 filter-island imports anywhere in the file"]
    - NEGATIVE_CONTROL: would fail if ['scope creep — R10-R12 markers or a filter-island import appear (count > 0)', 'JS sneaks in — a <script> or custom element appears inside #families (count > 0)', 'the header comment still defers R9 (stale deferral) or drops the R10-R12 deferral entirely (0 deferral markers)']


### TEST CRITERIA

- **TC-1** (→AC-1, ): index.astro renders exactly 1 section#families with aria-label in the post-hero region, deriving 7 families / 39 registry:component items (counts 3/7/6/7/4/1/11) through SectionHeader + ComponentCard composition. — `pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-seven-sections-39-cards`
- **TC-2** (→AC-2, ): Every ComponentCard invocation binds item.expoGo and index.astro contains 0 local verdict strings and 0 hand-rolled badge markup. — `pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-badge-vocabulary`
- **TC-3** (→AC-3, ): The hero region keeps all 8 anchors (5 data-counter hook names, 2 CTA hrefs /registry + /components, 1 InstallCommand composition) and precedes #families in document order with 0 copy drift. — `pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-hero-regions-intact`
- **TC-4** (→AC-4, ): The header comment marks exactly R10-R12 deferred (R9 shipped) and the #families region holds 0 script/custom-element/island markers and 0 R10-R12 region markup. — `pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-deferred-regions-and-zero-js`

### READING LIST (max 5)

- tests/sprint-02-shell-hero/primitives.test.ts [PRIMARY PATTERN] lines all — The landed vitest source-scan pattern (real file reads, forbidden-string assertions, concrete literal anchors) home-teaser-contract.test.ts imitates for all four ACs.
- apps/docs/src/pages/index.astro [file under modification] lines all — Hero regions R1-R8 (write-prohibited: 5 counters, 2 CTA hrefs, InstallCommand, landed copy) and the header comment currently deferring R9-R12 — the post-hero insertion point.
- apps/docs/src/components/SectionHeader.astro + apps/docs/src/components/ComponentCard.astro [primitives consumed] lines all — FAM-002's outputs composed as-is: props {title, anchor, count?} and {href, title, description, category, expoGo}.
- apps/docs/src/data/families.json + apps/docs/src/data/registry-items.json [derivation source] lines all — The same derivation as /components: 7 families, 39 registry:component items, counts 3/7/6/7/4/1/11.
- tests/sprint-02-shell-hero/home-hero.spec.ts [lane spec pattern] lines all — The landed home playwright spec whose hero assertions (counters, CTAs, copy) the lane gate re-asserts as the rendered protection proof.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/pages/index.astro (MODIFY)
- tests/sprint-03-family-browse/home-teaser-contract.test.ts (NEW)
- tests/sprint-03-family-browse/home-family-teaser.spec.ts (NEW)
writeProhibited:
- hero regions R1-R8 in apps/docs/src/pages/index.astro — copy, counters, InstallCommand, CTAs frozen
- apps/docs/src/components/**, apps/docs/src/islands/**, packages/**
- tests/sprint-02-shell-hero/** — sprint-02 specs stay green unchanged; escalate-don't-edit if an assertion over-specifies
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Compose the landed FAM-002 primitives inside one wrapping landmark section, generated from the shared registry derivation — no new styling, no per-page variants (source: apps/docs/src/components/Button.astro)
- anti-pattern: per-variant sibling components; hardcoded card counts; a second curated description field
- references: ['TR-07 home R9 wireframe row — family teaser grid below the hero', 'TR-07 components-index wireframe row — the family section pattern replicated verbatim']
- notes: ['The teaser is a strict reuse surface: same SectionHeader anchors, same card grid, same derivation — home and /components differ only in wrapping context', 'No filter island on home — data-filter-text attributes ride along on the cards but nothing consumes them there yet', "Anchor jumps still clear the sticky Header via SectionHeader's scroll-margin; #families is the wrapping landmark with aria-label; zero new JS — the pre-existing pre-paint theme script is untouched"]

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: [] · provides: ['Home R9 teaser region in apps/docs/src/pages/index.astro: one wrapping <section id="families" aria-label="Component families"> below the hero, holding the same seven SectionHeader + card-grid blocks as /components, generated from the same families.json + registry-items.json derivation (registry:component items only)', 'Updated index.astro header comment: R9 ships; R10-R12 remain deferred', 'NEW vitest contract tests/sprint-03-family-browse/home-teaser-contract.test.ts (the AC proof) and NEW playwright lane spec tests/sprint-03-family-browse/home-family-teaser.spec.ts (gate-step rendered proof)'] · consumes: ['SectionHeader + ComponentCard primitives from FAM-002 — composed as-is, no prop extensions', "Badge two-state vocabulary via FAM-005 — 'runs in Expo Go' / 'requires a dev client'", 'The same families.json + registry-items.json derivation as /components — no second data path', 'SHELL-001 tokens and the DocsLayout shell — no new styles beyond what the primitives carry']

- {"provider": "FAM-002", "consumer": "FAM-006 index.astro R9 region", "contract": "SectionHeader and ComponentCard composed unmodified; the teaser passes the same family title/anchor/count and item href/title/description/category/expoGo props"}
- {"provider": "FAM-005", "consumer": "FAM-006 teaser cards", "contract": "Badge literals asserted by the lane gate are the scenario-exact 'runs in Expo Go' / 'requires a dev client'"}
- {"provider": "sprint-02 (SHELL-007/SHELL-010/SHELL-011)", "consumer": "FAM-006", "contract": "Hero regions R1-R8 are read-only: counters 0.2.1/56/39/11/6, CTAs /registry + /components, landed copy byte-intact; sprint-02 home specs stay green unchanged"}

### VERIFICATION GATES

- AC-1: pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-seven-sections-39-cards — exit 0
- AC-2: pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-badge-vocabulary — exit 0
- AC-3: pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-hero-regions-intact — exit 0
- AC-4: pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-deferred-regions-and-zero-js — exit 0
- RED-first: the AC-1/AC-2/AC-4 -t runs FAIL before the index.astro edit (0 #families occurrences, 0 ComponentCard imports, stale R9-R12 deferral comment) — record the RED outputs; AC-3 passes at RED by design (hero already intact) and documents the protection baseline
- Seeded evidence: captured stdout shows 7 families / 39 items / counts 3/7/6/7/4/1/11 against the real JSON, not merely exit 0
- Rendered lane proof (gate-step, not an AC): pnpm playwright test tests/sprint-03-family-browse/home-family-teaser.spec.ts --grep FAM-006-home-family-teaser — exit 0; screenshots show 7 anchored sections below the hero, 39 cards, both badge literals, hero counters 0.2.1/56/39/11/6
- sprint-02 regression: pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts (and the copy-pass spec) green unchanged
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/pages/index.astro tests/sprint-03-family-browse/home-teaser-contract.test.ts tests/sprint-03-family-browse/home-family-teaser.spec.ts — exit 0 (never pnpm lint; local crash)
- build: pnpm --filter @rnr-ai-elements/docs build — exit 0
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES
- Depends on: ['FAM-002', 'FAM-005'] · Blocks: [] · Parallel: 

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Compose landed primitives; no new scoped styles beyond section-level layout the primitives do not carry
- Zero new <script> in the teaser region
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FAM-006",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_dataset": {
   "description": "The real registry dataset imported from the working tree at run time: apps/docs/src/data/registry-items.json filtered to registry:component, grouped by the 7 families from families.json \u2014 the same derivation /components uses.",
   "seed_method": "public_api",
   "records": [
    "39 registry:component items, 7 families, counts 3/7/6/7/4/1/11",
    "descriptions 132-1840 chars",
    "Badge strings 'runs in Expo Go' / 'requires a dev client' (land via FAM-005)"
   ]
  },
  "landed_home_hero": {
   "description": "The sprint-02 landed home source in apps/docs/src/pages/index.astro read from the real working tree. RED at task start: the header comment defers R9-R12, section#families is absent (0 occurrences), and 0 SectionHeader/ComponentCard imports exist \u2014 while the hero anchors (5 counters, 2 CTA hrefs, InstallCommand) already pass.",
   "seed_method": "ui_flow",
   "records": [
    "5 data-counter hook names (version/total/components/ui/libs) with values 0.2.1 / 56 / 39 / 11 / 6 at render time",
    "CTAs Get started -> /registry and Browse components -> /components",
    "file header comment defers R9-R12"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "R9 source contract \u2014 one #families section deriving 7 families / 39 cards",
   "description": "GIVEN the repo with FAM-002 primitives landed and (RED at start) index.astro still deferring R9-R12 WHEN the test reads apps/docs/src/pages/index.astro plus families.json and registry-items.json from the real working tree THEN the post-hero region renders exactly 1 <section id=\"families\" aria-label=\"Component families\"> whose family blocks derive from the families.json + registry-items.json loop (7 families, 39 registry:component items, counts 3/7/6/7/4/1/11) composing SectionHeader per family and ComponentCard per item",
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored page source plus real JSON data imports \u2014 file reads only, no rendering, no network, no DB. The rendered browser proof rides the home-family-teaser.spec.ts lane gate in verification_gates (SHELL-004/SHELL-010 all-unit precedent).",
   "verification_service": "real filesystem reads of index.astro + families.json + registry-items.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-03-family-browse/home-teaser-contract.test.ts",
   "test_function": "FAM-006-teaser-seven-sections-39-cards",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-seven-sections-39-cards",
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over the authored page source plus real JSON data imports \u2014 file reads only, no rendering, no network, no DB.",
    "verification_service": "real filesystem reads of index.astro + families.json + registry-items.json under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "a static shell \u2014 section#families is absent (0 occurrences) so the section anchor assert fails",
      "a hand-written curated list \u2014 the imported families/registry counts diverge from 7 families / 39 items / counts 3/7/6/7/4/1/11",
      "cards are hand-rolled markup instead of ComponentCard composition \u2014 the ComponentCard import/invocation anchors vanish"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "landed_home_hero",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/pages/index.astro, apps/docs/src/data/families.json, and apps/docs/src/data/registry-items.json from the real working tree",
        "assert the #families section anchor, the data-file derivation loop, and the SectionHeader/ComponentCard composition"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 <section id=\"families\" aria-label=\"Component families\"> in the post-hero region",
        "the derivation imports families.json + registry-items.json and filters to registry:component: 7 families, 39 items, family counts 3/7/6/7/4/1/11",
        "1 SectionHeader composition per family (7 via the loop) and 1 ComponentCard per item (39 via the loop), both imported from apps/docs/src/components/"
       ],
       "must_not_observe": [
        "0 #families sections before the hero region in document order",
        "0 hand-written family sections outside the families.json loop",
        "0 non-registry:component items rendered (39 exactly)",
        "0 ComponentCard invocations outside the #families region"
       ]
      }
     }
    ],
    "primary": false
   },
   "primary": false,
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Verdict vocabulary reaches the teaser cards only through ComponentCard composition",
   "description": "GIVEN the R9 teaser source WHEN the test scans the #families region of index.astro THEN every ComponentCard invocation passes the item's expoGo prop and the file contains 0 local verdict strings \u2014 the two-state vocabulary reaches the cards only through ComponentCard's Badge composition (strings landed by FAM-005)",
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored page source \u2014 file reads only, no rendering, no network, no DB; the rendered badge literals are proven by the playwright lane gate.",
   "verification_service": "real filesystem read of index.astro under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-03-family-browse/home-teaser-contract.test.ts",
   "test_function": "FAM-006-teaser-badge-vocabulary",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-badge-vocabulary",
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over the authored page source \u2014 file reads only, no rendering, no network, no DB.",
    "verification_service": "real filesystem read of index.astro under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the teaser hand-rolls badge markup bypassing ComponentCard/Badge \u2014 a local verdict string appears (count > 0)",
      "the expoGo prop is dropped from the card invocations \u2014 0 expoGo bindings found",
      "a third verdict path is introduced on home \u2014 vocabulary strings outside the Badge composition appear"
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
        "read apps/docs/src/pages/index.astro from the real working tree",
        "assert the expoGo passthrough on the card invocations and the absence of local verdict markup"
       ]
      },
      "end_state": {
       "must_observe": [
        "every ComponentCard invocation inside #families binds the item's expoGo field (the loop passes item.expoGo \u2014 1 binding site covering all 39 items)",
        "the two-state vocabulary reaches the cards only via ComponentCard's Badge composition (ComponentCard imported from FAM-002, unmodified path)"
       ],
       "must_not_observe": [
        "0 local verdict strings in index.astro ('runs in Expo Go', 'requires a dev client', 'Expo Go', 'dev-client' \u2014 0 occurrences outside imports)",
        "0 hand-rolled badge spans/classes bypassing ComponentCard",
        "0 card invocations missing the expoGo binding"
       ]
      }
     }
    ],
    "primary": false
   },
   "primary": false,
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "Sprint-02 hero regions stay untouched above the teaser",
   "description": "GIVEN the sprint-02 landed hero in the same file WHEN the test scans the pre-#families hero region of index.astro THEN all hero anchors survive the edit \u2014 the 5 data-counter hook names (version/total/components/ui/libs), both CTA hrefs (/registry and /components), and the InstallCommand composition \u2014 with 0 drift in the hero region",
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored page source \u2014 file reads only, no rendering, no network, no DB; the rendered hero values (0.2.1/56/39/11/6) are re-asserted by the sprint-02 regression gate and the lane spec.",
   "verification_service": "real filesystem read of index.astro under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-03-family-browse/home-teaser-contract.test.ts",
   "test_function": "FAM-006-hero-regions-intact",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-hero-regions-intact",
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over the authored page source \u2014 file reads only, no rendering, no network, no DB.",
    "verification_service": "real filesystem read of index.astro under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "a hero overwrite \u2014 any counter hook, CTA href, or InstallCommand anchor disappears (anchor count drops below 5 counters / 2 hrefs / 1 composition)",
      "the teaser markup is injected inside or above the hero \u2014 the document-order anchor assert fails",
      "hero copy is edited \u2014 the landed SHELL-010 copy literals stop matching"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "landed_home_hero",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/pages/index.astro from the real working tree",
        "assert the hero region's counter hooks, CTA hrefs, InstallCommand composition, and document order relative to #families"
       ]
      },
      "end_state": {
       "must_observe": [
        "5 data-counter hook names present in the hero region (version, total, components, ui, libs)",
        "2 CTA hrefs present: /registry (Get started) and /components (Browse components)",
        "1 InstallCommand composition unchanged, and the hero region precedes #families in document order"
       ],
       "must_not_observe": [
        "0 missing hero anchors (5 counters + 2 CTA hrefs + 1 InstallCommand all present)",
        "0 hero copy changes against the SHELL-010 landed literals",
        "0 teaser markup inside the hero region"
       ]
      }
     }
    ],
    "primary": false
   },
   "primary": false,
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Deferred regions stay deferred and the teaser adds zero JS",
   "description": "GIVEN the modified index.astro WHEN the test scans the header comment and the #families region THEN the comment marks R9 shipped with R10-R12 deferred (1 comment anchor), and the region contains 0 <script elements, 0 custom elements, 0 R10-R12 markers, and 0 filter-island imports",
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored page source \u2014 file reads only, no rendering, no network, no DB; the rendered absence proof is re-asserted by the playwright lane gate.",
   "verification_service": "real filesystem read of index.astro under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-03-family-browse/home-teaser-contract.test.ts",
   "test_function": "FAM-006-deferred-regions-and-zero-js",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-deferred-regions-and-zero-js",
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over the authored page source \u2014 file reads only, no rendering, no network, no DB.",
    "verification_service": "real filesystem read of index.astro under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "scope creep \u2014 R10-R12 markers or a filter-island import appear (count > 0)",
      "JS sneaks in \u2014 a <script> or custom element appears inside #families (count > 0)",
      "the header comment still defers R9 (stale deferral) or drops the R10-R12 deferral entirely (0 deferral markers)"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "landed_home_hero",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/pages/index.astro from the real working tree",
        "assert the header comment deferral state and the zero-JS/zero-deferred-markers contract of the #families region"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 header comment anchor marking R9 shipped and R10-R12 deferred",
        "the #families region composes exactly 7 SectionHeader and 39 ComponentCard invocations (0 hand-rolled card markup)"
       ],
       "must_not_observe": [
        "0 <script elements inside #families",
        "0 custom-element registrations or island imports inside #families",
        "0 R10-R12 markers (QR, quickstart strip, Callout, right-rail region)",
        "0 filter-island imports anywhere in the file"
       ]
      }
     }
    ],
    "primary": false
   },
   "primary": false,
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "description": "index.astro renders exactly 1 section#families with aria-label in the post-hero region, deriving 7 families / 39 registry:component items (counts 3/7/6/7/4/1/11) through SectionHeader + ComponentCard composition.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-seven-sections-39-cards",
   "type": "test_criterion"
  },
  {
   "id": "TC-2",
   "description": "Every ComponentCard invocation binds item.expoGo and index.astro contains 0 local verdict strings and 0 hand-rolled badge markup.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-teaser-badge-vocabulary",
   "type": "test_criterion"
  },
  {
   "id": "TC-3",
   "description": "The hero region keeps all 8 anchors (5 data-counter hook names, 2 CTA hrefs /registry + /components, 1 InstallCommand composition) and precedes #families in document order with 0 copy drift.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-hero-regions-intact",
   "type": "test_criterion"
  },
  {
   "id": "TC-4",
   "description": "The header comment marks exactly R10-R12 deferred (R9 shipped) and the #families region holds 0 script/custom-element/island markers and 0 R10-R12 region markup.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/home-teaser-contract.test.ts -t FAM-006-deferred-regions-and-zero-js",
   "type": "test_criterion"
  }
 ]
}
-->

</details>
