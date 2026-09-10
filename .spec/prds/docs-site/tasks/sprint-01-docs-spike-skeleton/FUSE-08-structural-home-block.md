================================================================================
TASK: FUSE-08 - Structural home block (explicitly NOT the designed hero)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog (planning seed — owned by kb-run-sprint sync-status after first dispatch)
PRIORITY:   P0
POINTS:     2   # Fibonacci story points — relative size, never time
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: astro-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-01-docs-spike-skeleton

RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------

Opening / on the built site shows the statement, `NOT an npm package`, counters 0.2.1 and 56/39/11/6 matching the artifact, a selectable nativewind install command whose copy yields the exact string, and 200-resolving CTAs.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: hero statement contains the what-it-is wording (`Universal AI chat and agent UI components for React Native`, `copy-paste registry`) and the explicit literal `NOT an npm package`
- MUST: counters `0.2.1` and `56`/`39`/`11`/`6` computed at build in the same hero element tree — version from root package.json, counts from registry-items.json type filters
- MUST: Get started CTA href `/registry` and Browse components CTA href `/components`, both resolving HTTP 200
- MUST: the install command renders as selectable text: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json`
- NEVER: never hardcode the 56/39/11/6 or 0.2.1 literals as detached text — a fixture edit must change them
- NEVER: never render short-name or relative command forms
- NEVER: no token stylesheet, no theme toggle, no one-screen design contract — those are Sprint 02's designed hero (this block is structural only)
- STRICTLY: one install command only (nativewind form); no engine tabs, no client state in URLs

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1 [PRIMARY]: Home hero evaluation contract: statement, not-npm, computed counters, resolving CTAs
- [ ] AC-2 [PRIMARY]: Hero install command copy yields the exact nativewind string (sprint-01 subset)
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: Home hero evaluation contract: statement, not-npm, computed counters, resolving CTAs [PRIMARY]
  GIVEN: the built site with the 56-entry artifact and the /registry + /components routes
  WHEN:  the spec opens /, imports registry-items.json and the root package.json to compute expected counters, and GETs both CTA hrefs
  THEN:  the hero contains the what-it-is statement and `NOT an npm package`; counters equal the computed values (`0.2.1`, `56`, `39`, `11`, `6`) inside the same hero element tree; Get started href `/registry` and Browse components href `/components` both return HTTP 200

  FLOW_REF:             FLOW-GEND-01-home-hero-evaluation-contract
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real Astro build + astro preview server + Chromium
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/home.spec.ts
  TEST_FUNCTION:        FLOW-GEND-01-home-hero-evaluation-contract
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real Astro build + astro preview + Chromium
    NEGATIVE_CONTROL (would fail if):
      - counters are hardcoded literal text decoupled from registry-items.json — editing the fixture would leave `56` unchanged while the spec's computed expectation moves
      - CTA hrefs point at ungenerated routes returning HTTP 404
    EVIDENCE: screenshot (required_capture=true)
    CASE 1:
      START_REF: built_site
      ACTOR: e2e_runner
        - navigate to http://localhost:4321/
        - import apps/docs/src/data/registry-items.json and the root package.json in the spec; compute expected version + 56/39/11/6 counts
        - read the hero statement, counter values, and CTA hrefs; GET both hrefs; capture a screenshot
      MUST_OBSERVE: hero text contains `Universal AI chat and agent UI components for React Native` and `copy-paste registry`
      MUST_OBSERVE: hero text contains the literal `NOT an npm package`
      MUST_OBSERVE: rendered counters equal the computed expectations: version `0.2.1`, total `56`, split `39` / `11` / `6`, all inside the same hero element tree
      MUST_OBSERVE: Get started href == `/registry` returning HTTP 200 and Browse components href == `/components` returning HTTP 200
      MUST_NOT_OBSERVE: 0 counters rendered
      MUST_NOT_OBSERVE: a counter value that differs from the spec's computed expectation (e.g. `55` after a fixture edit)
      MUST_NOT_OBSERVE: no CTA links
      MUST_NOT_OBSERVE: any CTA href returning HTTP 404

AC-2: Hero install command copy yields the exact nativewind string (sprint-01 subset) [PRIMARY]
  GIVEN: the built home block with the hero install command and copy button
  WHEN:  the spec clicks the hero copy button once and reads the clipboard; then opens / in the javaScriptEnabled:false project and reads the command text
  THEN:  the clipboard is exactly `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` matching the absolute-URL regex character-for-character with no trailing newline or wrap artifacts; with zero JS the same command renders as selectable text

  FLOW_REF:             FLOW-GEND-02-hero-install-command-copy
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real Astro build + astro preview server + Chromium with granted clipboard permissions
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/home.spec.ts
  TEST_FUNCTION:        FLOW-GEND-02-hero-install-command-copy
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-02-hero-install-command-copy

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real Astro build + astro preview + Chromium
    NEGATIVE_CONTROL (would fail if):
      - the copied string is a hardcoded echo that drifts from the displayed command (clipboard vs displayed text compare fails)
      - the button shows success while the clipboard stays empty (stub island)
    EVIDENCE: screenshot (required_capture=true)
    CASE 1:
      START_REF: built_site
      ACTOR: e2e_runner
        - navigate to http://localhost:4321/
        - click the hero install block's copy button once
        - read the clipboard via granted permissions and compare against the displayed command text
      MUST_OBSERVE: clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exactly
      MUST_OBSERVE: the string matches `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$` character-for-character
      MUST_NOT_OBSERVE: clipboard empty
      MUST_NOT_OBSERVE: a trailing newline or wrap artifact
      MUST_NOT_OBSERVE: short-name form `add conversation` or relative form `add /r/...`
    CASE 2:
      START_REF: built_site
      ACTOR: e2e_runner
        - open / in the javaScriptEnabled:false project and read the hero command text node
      MUST_OBSERVE: the selectable command text equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` on a HTTP 200 response
      MUST_NOT_OBSERVE: 0 selectable command text
      MUST_NOT_OBSERVE: placeholder text instead of the real command

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: The home hero contains `Universal AI chat and agent UI components for React Native`, `copy-paste registry`, and the literal `NOT an npm package`.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep 
- TC-2: The rendered counters equal the spec-computed expectations from registry-items.json and root package.json: `0.2.1`, `56`, `39`, `11`, `6`, inside one hero element tree.
  maps_to_ac: AC-1 | type: single_source | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep 
- TC-3: Get started href `/registry` and Browse components href `/components` both return HTTP 200.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep 
- TC-4: Clicking the hero copy once yields a clipboard exactly equal to `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` with no trailing newline, and with javaScriptEnabled:false the same command renders as selectable text.
  maps_to_ac: AC-2 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep 

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- apps/docs/src/pages/index.astro (REPLACE the FUSE-01 placeholder wholesale) (NEW)
- tests/sprint-01-docs-spike-skeleton/home.spec.ts (NEW)

writeProhibited:
- apps/docs/src/pages/registry.astro and components/** — FUSE-06/FUSE-07 wave-mates (href consumers only)
- apps/docs/src/data/** and apps/docs/public/r/** — FUSE-05's artifact
- apps/docs/src/components/islands/** — FUSE-09's (import only)
- any token/theme stylesheet — Sprint 02 scope
- packages/registry/**
- tests/sprint-01/**

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-DOCS-01, CAP-INST-01
provides:
- route / — structural home block replacing FUSE-01's placeholder: statement + NOT-an-npm-package + computed counters + one install command + CTAs
- FLOW-GEND-01 and FLOW-GEND-02 proofs in tests/sprint-01-docs-spike-skeleton/home.spec.ts
consumes:
- registry-items-v1: registry-items.json (PROVIDED by FUSE-05 — read-only; counts computed at build by filtering `type`)
- root package.json `version` field (build-time import — the version counter's single source)
- CopyButton island (FUSE-09)
- routes /registry (FUSE-06) and /components (FUSE-07) as CTA hrefs
- e2e runner (FUSE-10)
boundary_contracts:
- registry-items-v1 LOCKED — counts derive by filtering `type` in the frontmatter; no hardcoded counter literals
- Absolute-URL command regex: `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$`
- SPRINT-01 SUBSET: engine-tabbed hero command and persisted engine land Sprint 02/03 — this sprint renders the nativewind form (today's value) as selectable text + copy

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md [78-113]
   Focus: home wireframe R5-R8: hero statement, NOT-an-npm-package, counters, install command + copy, CTAs
2. package.json [2-6]
   Focus: root `version: 0.2.1` — the version counter's build-time source

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FLOW-GEND-01-home-hero-evaluation-contract
  Command:  pnpm playwright test  --grep 
  Expected: exit 0 — statement + not-npm + computed counters + 200 CTAs
Gate 2: FLOW-GEND-02-hero-install-command-copy
  Command:  pnpm playwright test  --grep 
  Expected: exit 0 — clipboard exactly the nativewind conversation command, zero-JS selectable text
Gate 3: FUSE-08-biome
  Command:  ./node_modules/.bin/biome ci apps/docs/src/pages/index.astro tests/sprint-01-docs-spike-skeleton/home.spec.ts
  Expected: exit 0

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Replace the scaffold placeholder with a structural home block that states what the library is and is not, shows build-computed counters, one copyable install command, and CTAs to the two real routes.

Design notes:
- Sprint 02 supersedes both flows: the one-1440x900-screen designed hero replaces this structural block, and engine-tabbed command persistence lands with TabGroup — those tasks list home.spec.ts under their supersedes
- Get-started decision (planner-owned): href `/registry` — a route this sprint truly serves via FUSE-06; Sprint 05 retargets it to `/docs/introduction` when real docs routes exist; no stub docs page is generated

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: FUSE-01, FUSE-05, FUSE-09, FUSE-10, FUSE-06, FUSE-07
Blocks:     FUSE-11

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-08",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_site": {
   "description": "The docs site built through the real chain with FUSE-05's artifact, /registry and /components routes present, served by astro preview at http://localhost:4321.",
   "seed_method": "cli",
   "records": [
    "pnpm --filter @rnr-ai-elements/docs build exit 0 (dist/ includes /, /registry, /components)",
    "astro preview serving http://localhost:4321"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": true,
   "flow_ref": "FLOW-GEND-01-home-hero-evaluation-contract",
   "test_file": "tests/sprint-01-docs-spike-skeleton/home.spec.ts",
   "test_function": "FLOW-GEND-01-home-hero-evaluation-contract",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "counters are hardcoded literal text decoupled from registry-items.json \u2014 editing the fixture would leave `56` unchanged while the spec's computed expectation moves",
      "CTA hrefs point at ungenerated routes returning HTTP 404"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "navigate to http://localhost:4321/",
        "import apps/docs/src/data/registry-items.json and the root package.json in the spec; compute expected version + 56/39/11/6 counts",
        "read the hero statement, counter values, and CTA hrefs; GET both hrefs; capture a screenshot"
       ]
      },
      "end_state": {
       "must_observe": [
        "hero text contains `Universal AI chat and agent UI components for React Native` and `copy-paste registry`",
        "hero text contains the literal `NOT an npm package`",
        "rendered counters equal the computed expectations: version `0.2.1`, total `56`, split `39` / `11` / `6`, all inside the same hero element tree",
        "Get started href == `/registry` returning HTTP 200 and Browse components href == `/components` returning HTTP 200"
       ],
       "must_not_observe": [
        "0 counters rendered",
        "a counter value that differs from the spec's computed expectation (e.g. `55` after a fixture edit)",
        "no CTA links",
        "any CTA href returning HTTP 404"
       ]
      }
     }
    ]
   },
   "given": "the built site with the 56-entry artifact and the /registry + /components routes",
   "when": "the spec opens /, imports registry-items.json and the root package.json to compute expected counters, and GETs both CTA hrefs",
   "then": "the hero contains the what-it-is statement and `NOT an npm package`; counters equal the computed values (`0.2.1`, `56`, `39`, `11`, `6`) inside the same hero element tree; Get started href `/registry` and Browse components href `/components` both return HTTP 200",
   "num": 1,
   "name": "Home hero evaluation contract: statement, not-npm, computed counters, resolving CTAs",
   "type": "acceptance_criterion",
   "description": "GIVEN the built site with the 56-entry artifact and the /registry + /components routes WHEN the spec opens /, imports registry-items.json and the root package.json to compute expected counters, and GETs both CTA hrefs THEN the hero contains the what-it-is statement and `NOT an npm package`; counters equal the computed values (`0.2.1`, `56`, `39`, `11`, `6`) inside the same hero element tree; Get started href `/registry` and Browse components href `/components` both return HTTP 200",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": true,
   "flow_ref": "FLOW-GEND-02-hero-install-command-copy",
   "test_file": "tests/sprint-01-docs-spike-skeleton/home.spec.ts",
   "test_function": "FLOW-GEND-02-hero-install-command-copy",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-02-hero-install-command-copy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium with granted clipboard permissions",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the copied string is a hardcoded echo that drifts from the displayed command (clipboard vs displayed text compare fails)",
      "the button shows success while the clipboard stays empty (stub island)"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "navigate to http://localhost:4321/",
        "click the hero install block's copy button once",
        "read the clipboard via granted permissions and compare against the displayed command text"
       ]
      },
      "end_state": {
       "must_observe": [
        "clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exactly",
        "the string matches `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$` character-for-character"
       ],
       "must_not_observe": [
        "clipboard empty",
        "a trailing newline or wrap artifact",
        "short-name form `add conversation` or relative form `add /r/...`"
       ]
      }
     },
     {
      "start_ref": "built_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "open / in the javaScriptEnabled:false project and read the hero command text node"
       ]
      },
      "end_state": {
       "must_observe": [
        "the selectable command text equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` on a HTTP 200 response"
       ],
       "must_not_observe": [
        "0 selectable command text",
        "placeholder text instead of the real command"
       ]
      }
     }
    ]
   },
   "given": "the built home block with the hero install command and copy button",
   "when": "the spec clicks the hero copy button once and reads the clipboard; then opens / in the javaScriptEnabled:false project and reads the command text",
   "then": "the clipboard is exactly `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` matching the absolute-URL regex character-for-character with no trailing newline or wrap artifacts; with zero JS the same command renders as selectable text",
   "num": 2,
   "name": "Hero install command copy yields the exact nativewind string (sprint-01 subset)",
   "type": "acceptance_criterion",
   "description": "GIVEN the built home block with the hero install command and copy button WHEN the spec clicks the hero copy button once and reads the clipboard; then opens / in the javaScriptEnabled:false project and reads the command text THEN the clipboard is exactly `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` matching the absolute-URL regex character-for-character with no trailing newline or wrap artifacts; with zero JS the same command renders as selectable text",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The home hero contains `Universal AI chat and agent UI components for React Native`, `copy-paste registry`, and the literal `NOT an npm package`.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep "
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "The rendered counters equal the spec-computed expectations from registry-items.json and root package.json: `0.2.1`, `56`, `39`, `11`, `6`, inside one hero element tree.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep "
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Get started href `/registry` and Browse components href `/components` both return HTTP 200.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep "
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "Clicking the hero copy once yields a clipboard exactly equal to `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` with no trailing newline, and with javaScriptEnabled:false the same command renders as selectable text.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep "
  }
 ]
}
-->
