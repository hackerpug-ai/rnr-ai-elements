================================================================================
TASK: SHELL-005 - Create Button (NEW 1/4), Chip/ChipRow, and Expo Go verdict Badge — token-governed primitives
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     aefa7825295f60ba1ccd6e067adcf6267e7bc944
PRIORITY:   P1
POINTS:     2   # Fibonacci story points — relative size, never time
AGENT:      implementer=frontend-designer | reviewer=astro-reviewer
PROPOSED-BY: frontend-designer
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: ?
HUMAN-TEST-HOOK: hero-primitives-token-styled
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Create the three token-governed visual primitives the hero consumes (Button CTAs, Chip/ChipRow counters, Badge verdicts) so later surfaces (item pages, ledger, 404) reuse them instead of hand-rolling.
**Success state:** Button.astro, Chip.astro, and Badge.astro exist in apps/docs/src/components/, are prop-driven, consume only var(--*) tokens, render the data-counter hooks, and introduce zero JavaScript.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Chip renders the counter value inside a <data data-counter="..."> element with the exact hook names sprint-01's home spec pins (version, total, components, ui, libs)
- MUST: Badge carries exactly two verdict tones: Expo Go positive and dev-client warning via --destructive (>=4.5:1 in both themes) — one markup pattern reused verbatim by ComponentCard/detail rows/ledger later
- MUST: Button supports filled --primary, outline, and link variants with anchor/button polymorphism (href renders <a>, otherwise <button>) and a :focus-visible ring
- NEVER: Never hardcode a color — every value resolves through var(--*) tokens from SHELL-001
- NEVER: Never add JavaScript: no customElements.define, no <script> tag in any of the three components (zero-JS by contract)
- NEVER: Never invent a fourth variant tone or a second badge pattern — verdicts are Expo Go or dev-client, site-wide
- STRICTLY: Prop-driven variants (variant/href/tone props), not duplicate components per use site
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: Button declares filled --primary/outline/link variants with anchor/button polymorphism and a :focus-visible ring; Chip renders the <data data-counter> passthrough; Badge names both verdict tones with the warning keyed to --destructive; all three are token-only and script-free
- [ ] AC-2: the Chip/ChipRow counters resolve the sprint-01 data-counter hooks with values computed from package.json + registry-items.json, and the Get started / Browse components CTAs render as Button instances targeting /registry and /components
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: The three primitives carry the token contract in source
  GIVEN: the repo with SHELL-001's global.css landed and (RED at start) no Button/Chip/Badge components
  WHEN:  the test reads the three authored files from the real working tree and scans their structure
  THEN:  Button declares filled --primary/outline/link variants with anchor/button polymorphism and a :focus-visible ring; Chip renders the <data data-counter> passthrough; Badge names both verdict tones with the warning keyed to --destructive; all three are token-only and script-free
  FLOW_REF:              None
  TEST_TIER:             unit
  VERIFICATION_SERVICE:  real filesystem read of the authored component sources (no runtime, no network, no rendering)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED:   Pure static source-contract scan over authored .astro files — file reads only, no runtime behavior or external service (same pattern as the landed island-budget.test.ts). The rendered behavioral proof is AC-2's non-primary flow reference.
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/primitives.test.ts
  TEST_FUNCTION:         SHELL-005-primitives-token-contract
  VERIFY:                pnpm vitest run tests/sprint-02-shell-hero/primitives.test.ts -t SHELL-005-primitives-token-contract
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF authored_primitives: read apps/docs/src/components/Button.astro, Chip.astro, and Badge.astro from the real working tree, assert the variant/tone structure, the data-counter passthrough, and the token-only/script-free contract
      MUST_OBSERVE: Button.astro references `var(--primary)` (filled variant) and declares outline and link variants plus an href/button branch; Button.astro contains a `:focus-visible` rule consuming the ring token; Chip.astro contains `data-counter` (the <data> passthrough); Badge.astro references `var(--destructive)` and names both verdicts (`Expo Go` positive, dev-client warning)
      MUST_NOT_OBSERVE: a hex color literal matching #[0-9a-fA-F]{3,8} in any of the three files; `customElements.define` or a `<script` tag in any of the three files; a second badge/verdict component or a hardcoded tone class bypassing the variant props
    NEGATIVE_CONTROL: would fail if the components are stub shells with no variant/tone logic (filler markup would miss the --primary/--destructive/data-counter anchors); colors are hand-picked (hex or raw oklch literals) instead of var(--*) references…

AC-2: Rendered proof: hero counters keep the data-counter hooks and CTAs render through Button
  GIVEN: SHELL-007's designed hero composed with these primitives and SHELL-011's hero spec landed (final-wave verification)
  WHEN:  the hero flow spec opens / at 1440x900 and reads the counters row and both CTAs
  THEN:  the Chip/ChipRow counters resolve the sprint-01 data-counter hooks with values computed from package.json + registry-items.json, and the Get started / Browse components CTAs render as Button instances targeting /registry and /components
  FLOW_REF:              FLOW-GEND-01-home-hero-evaluation-contract
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium at 1440x900
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/home-hero.spec.ts
  TEST_FUNCTION:         FLOW-GEND-01-home-hero-evaluation-contract
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF authored_primitives: cold-navigate to http://localhost:4321/ at 1440x900 (spec owned by SHELL-011; this AC is the non-primary rendered reference), read [data-counter="version"|"total"|"components"|"ui"|"libs"] values and both CTA roles/hrefs
      MUST_OBSERVE: data-counter hooks present with values equal to the run-time-computed expectations (version `0.2.1`, total `56`, `39`/`11`/`6` today); Get started renders as a link targeting `/registry` and Browse components targeting `/components` (Button anchor polymorphism)
      MUST_NOT_OBSERVE: 0 data-counter hooks in the hero counters row; a counter value differing from the computed expectation; CTA hrefs pointing at any other route
    NEGATIVE_CONTROL: would fail if the hero hand-rolls counter markup instead of consuming Chip — the data-counter hooks vanish and the computed-value assertions fail; the CTAs are raw anchors styled inline — the Button variant contract is dead code the hero never exercises…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: Button.astro declares filled var(--primary), outline, and link variants with href/button polymorphism and a :focus-visible ring rule.
- TC-2 [happy_path, → AC-1]: Chip.astro renders the <data data-counter> passthrough with the sprint-01 hook names (version, total, components, ui, libs).
- TC-3 [edge, → AC-1]: Badge.astro carries exactly two verdict tones — Expo Go positive and dev-client warning keyed to var(--destructive) — and none of the three primitive files contains a hex literal, a <script> tag, or a customElements.define call.
- TC-4 [happy_path, → AC-2]: On the sprint-final hero at 1440x900, the data-counter hooks resolve the computed counter values and both CTAs render through Button targeting /registry and /components.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/components/Button.astro (NEW)
- apps/docs/src/components/Chip.astro (NEW)
- apps/docs/src/components/Badge.astro (NEW)
- tests/sprint-02-shell-hero/primitives.test.ts (NEW)
- tests/sprint-02-shell-hero/home-hero.spec.ts (NEW)
writeProhibited:
- packages/**
- apps/docs/src/pages/**
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Token-governed, zero hex; Badge is THE one site-wide verdict pattern for cards/detail rows/ledger later; zero JS
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md lines 412-436 — PRIMARY PATTERN — component plan: Button as NEW 1/4 (filled --primary/outline/link; home + 404 CTAs) and the zero-JS island-budget constraints
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md lines 102-113 — R6 ChipRow binding and R8 Button binding — the hero regions these primitives serve; token-governed tones
- apps/docs/src/pages/index.astro lines 41-62 — the exact <data data-counter="version|total|components|ui|libs"> markup the Chip passthrough must preserve
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts lines 17-62 — the static source-scan test pattern (real file reads, forbidden-string assertions) this task's lane proof imitates
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: prop-driven Astro function components with scoped var(--*)-only styles; variant prop selects the tone class
Source: .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md:412-421
Anti-pattern: one component per use site, hex literals, a JS toggle for variant state, or a second competing verdict badge
Interaction notes:
- Button anchor polymorphism: href prop renders <a>, absence renders <button> — hero CTAs are anchors, 404 recovery later mixes both
- Chip keeps the <data data-counter> element so home.spec.ts's hooks survive the hero redesign byte-for-byte
- Badge tones: Expo Go positive (default foreground/background pairing) vs dev-client warning via --destructive; >=4.5:1 both themes; one markup reused on cards, detail chip rows, and ledger rows in later sprints
- Zero JS by design — these are hand-rolled Astro components per TR-07's 'None (deliberate)' design-library rule
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- primitives token contract: `pnpm vitest run tests/sprint-02-shell-hero/primitives.test.ts -t SHELL-005-primitives-token-contract`
  expected: exit 0 — variants, data-counter passthrough, --destructive tone, zero hex, zero script
- typecheck: `pnpm typecheck`
  expected: exit 0
- lint (never `pnpm lint` — crashes locally): `./node_modules/.bin/biome ci apps/docs/src/components tests/sprint-02-shell-hero/primitives.test.ts`
  expected: exit 0
- build stays green with the new components present: `pnpm --filter @rnr-ai-elements/docs build`
  expected: exit 0 — the real chain compiles the package unchanged
- RED-first evidence: `pnpm vitest run tests/sprint-02-shell-hero/primitives.test.ts -t SHELL-005-primitives-token-contract (before authoring the components)`
  expected: FAIL — the three files are absent, reads fail; record the RED output
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-001
Blocks:     SHELL-007 (hero consumes Button/Chip immediately; Badge prefigures item-card verdicts in sprint 03/04)
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
Home R6/R8 bindings now; 404 recovery CTAs and ledger verdict pairs reuse these later. Lane proof: primitives.test.ts scans the three authored sources for the variant structure, the data-counter passthrough, the --destructive verdict tone, zero hex, and zero JS; the rendered behavioral proof rides SHELL-011's hero flow spec as a non-primary reference.
Coding standards:
- Astro 7 strict compiler: valid nesting, closed non-void tags
- Scoped styles consuming var(--*) tokens only; prop-driven variants
- Zero <script>, zero customElements.define — zero-JS primitives
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)
Capability: touches=['CAP-DOCS-01'] provides=4 items consumes=1 items; boundary_contracts=1
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-005",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "authored_primitives": {
   "description": "The three authored primitive files read from the real working tree at run time. RED at task start: none of the three files exists, so the reads fail.",
   "seed_method": "build_artifact",
   "records": [
    "apps/docs/src/components/Button.astro exists and declares variant handling (filled/outline/link) plus href/button polymorphism",
    "apps/docs/src/components/Chip.astro exists and renders a <data data-counter> passthrough",
    "apps/docs/src/components/Badge.astro exists and carries the Expo Go / dev-client verdict tones"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the repo with SHELL-001's global.css landed and (RED at start) no Button/Chip/Badge components WHEN the test reads the three authored files from the real working tree and scans their structure THEN Button declares filled --primary/outline/link variants with anchor/button polymorphism and a :focus-visible ring; Chip renders the <data data-counter> passthrough; Badge names both verdict tones with the warning keyed to --destructive; all three are token-only and script-free",
   "maps_to_ac": null,
   "flow_ref": null,
   "test_file": "tests/sprint-02-shell-hero/primitives.test.ts",
   "test_function": "SHELL-005-primitives-token-contract",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/primitives.test.ts -t SHELL-005-primitives-token-contract",
   "test_tier": "unit",
   "verification_service": "real filesystem read of the authored component sources (no runtime, no network, no rendering)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Pure static source-contract scan over authored .astro files \u2014 file reads only, no runtime behavior or external service (same pattern as the landed island-budget.test.ts). The rendered behavioral proof is AC-2's non-primary flow reference.",
    "verification_service": "real filesystem read of the authored component sources",
    "negative_control": {
     "would_fail_if": [
      "the components are stub shells with no variant/tone logic (filler markup would miss the --primary/--destructive/data-counter anchors)",
      "colors are hand-picked (hex or raw oklch literals) instead of var(--*) references",
      "Chip drops the <data data-counter> passthrough \u2014 the sprint-01 home spec hooks would stop resolving when the hero adopts it"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_primitives",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "read apps/docs/src/components/Button.astro, Chip.astro, and Badge.astro from the real working tree",
        "assert the variant/tone structure, the data-counter passthrough, and the token-only/script-free contract"
       ]
      },
      "end_state": {
       "must_observe": [
        "Button.astro references `var(--primary)` (filled variant) and declares outline and link variants plus an href/button branch",
        "Button.astro contains a `:focus-visible` rule consuming the ring token",
        "Chip.astro contains `data-counter` (the <data> passthrough)",
        "Badge.astro references `var(--destructive)` and names both verdicts (`Expo Go` positive, dev-client warning)"
       ],
       "must_not_observe": [
        "a hex color literal matching #[0-9a-fA-F]{3,8} in any of the three files",
        "`customElements.define` or a `<script` tag in any of the three files",
        "a second badge/verdict component or a hardcoded tone class bypassing the variant props"
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
   "description": "GIVEN SHELL-007's designed hero composed with these primitives and SHELL-011's hero spec landed (final-wave verification) WHEN the hero flow spec opens / at 1440x900 and reads the counters row and both CTAs THEN the Chip/ChipRow counters resolve the sprint-01 data-counter hooks with values computed from package.json + registry-items.json, and the Get started / Browse components CTAs render as Button instances targeting /registry and /components",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-01-home-hero-evaluation-contract",
   "test_file": "tests/sprint-02-shell-hero/home-hero.spec.ts",
   "test_function": "FLOW-GEND-01-home-hero-evaluation-contract",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium at 1440x900",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview server + Chromium",
    "negative_control": {
     "would_fail_if": [
      "the hero hand-rolls counter markup instead of consuming Chip \u2014 the data-counter hooks vanish and the computed-value assertions fail",
      "the CTAs are raw anchors styled inline \u2014 the Button variant contract is dead code the hero never exercises",
      "counter values are hardcoded literals decoupled from the artifacts \u2014 the spec's run-time-computed expectations diverge"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_primitives",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "cold-navigate to http://localhost:4321/ at 1440x900 (spec owned by SHELL-011; this AC is the non-primary rendered reference)",
        "read [data-counter=\"version\"|\"total\"|\"components\"|\"ui\"|\"libs\"] values and both CTA roles/hrefs"
       ]
      },
      "end_state": {
       "must_observe": [
        "data-counter hooks present with values equal to the run-time-computed expectations (version `0.2.1`, total `56`, `39`/`11`/`6` today)",
        "Get started renders as a link targeting `/registry` and Browse components targeting `/components` (Button anchor polymorphism)"
       ],
       "must_not_observe": [
        "0 data-counter hooks in the hero counters row",
        "a counter value differing from the computed expectation",
        "CTA hrefs pointing at any other route"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "Button.astro declares filled var(--primary), outline, and link variants with href/button polymorphism and a :focus-visible ring rule.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/primitives.test.ts -t SHELL-005-primitives-token-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Chip.astro renders the <data data-counter> passthrough with the sprint-01 hook names (version, total, components, ui, libs).",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/primitives.test.ts -t SHELL-005-primitives-token-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Badge.astro carries exactly two verdict tones \u2014 Expo Go positive and dev-client warning keyed to var(--destructive) \u2014 and none of the three primitive files contains a hex literal, a <script> tag, or a customElements.define call.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/primitives.test.ts -t SHELL-005-primitives-token-contract"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "On the sprint-final hero at 1440x900, the data-counter hooks resolve the computed counter values and both CTAs render through Button targeting /registry and /components.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract"
  }
 ]
}
-->
