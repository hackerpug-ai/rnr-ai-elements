================================================================================
TASK: FUSE-07 - Lean /components index + minimal /components/[item] x39 with install block first
================================================================================

TASK_TYPE:  FEATURE
STATUS:     in_progress
PRIORITY:   P0
POINTS:     5   # Fibonacci story points — relative size, never time
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

All 39 /components/{item} routes serve 200 with h1/description/chips, install block first (both labeled engine commands + copy), full source; the pager walks each family's members exactly; the index anchors all 56 names.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: getStaticPaths generates exactly 39 pages from type `registry:component` entries (slug = item name); every page 200 in dist/
- MUST: install block is the FIRST content section after the header/chips in DOM order, before the source Code section
- MUST: both engine command lines render labeled (`nativewind`, `uniwind`), each as selectable text with its own CopyButton
- MUST: the Code section renders every sourceFiles[].text fully — no max-height, no truncation, no clipping
- MUST: pager prev/next links stay within the item's family per families.json order; from the last member, next wraps to the family's first member or the affordance is omitted
- NEVER: never render a preview panel or placeholder box for missing imagery — omit entirely
- NEVER: never hand-write any of the 39 pages or per-page install commands
- NEVER: never let a pager link cross families
- NEVER: never write into apps/docs/src/data/** or apps/docs/public/r/**
- STRICTLY: sprint-01 pages render the nativewind form as the default/only active form — no engine tabs, no client state
- STRICTLY: h1 equals the item's `title` field (e.g. `Conversation`); description equals the one-line `description` field

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1 [PRIMARY]: Reference-page anatomy on all 39 pages: header, chips, install block FIRST, full source, no preview panel
- [ ] AC-2 [PRIMARY]: Family pager stays in family across all 39 pages
- [ ] AC-3: Lean /components index anchors all 56 names exactly once
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: Reference-page anatomy on all 39 pages: header, chips, install block FIRST, full source, no preview panel [PRIMARY]
  GIVEN: the built site with the 39 generated item pages
  WHEN:  the spec opens /components/conversation in full, then loops all 39 pages asserting the anatomy subset, then byte-compares sampled Code views against the same-origin served /r/nativewind/{item}.json
  THEN:  /components/conversation shows h1 `Conversation`, the one-line description, chips version `0.2.1` + category `component` + both engines + Expo Go verdict, the install block as first content section containing `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` plus the labeled uniwind variant with copy; all 39 pages pass the same anatomy; sampled Code sections byte-match the served registry JSON source and have no height limit; 0 preview-panel elements and 0 placeholder text

  FLOW_REF:             FLOW-GEND-14-reference-page-anatomy
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real Astro build + astro preview server + Chromium + same-origin /r/*.json fetches
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
  TEST_FUNCTION:        FLOW-GEND-14-reference-page-anatomy
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-14-reference-page-anatomy

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real Astro build + astro preview + Chromium
    NEGATIVE_CONTROL (would fail if):
      - pages are a hardcoded static template for `conversation` reused for all 39 slugs (h1 never equals the per-item title)
      - the Code view shows a truncated excerpt while claiming full source — the byte-compare against `/r/nativewind/{item}.json` would fail
      - a placeholder preview box stands in for the omitted imagery panel
    EVIDENCE: screenshot (required_capture=true)
    CASE 1:
      START_REF: built_site
      ACTOR: e2e_runner
        - navigate to http://localhost:4321/components/conversation
        - read h1, description, chip row, and DOM order of content sections; capture a screenshot
      MUST_OBSERVE: h1 equals `Conversation`
      MUST_OBSERVE: one-line description text non-empty and equal to the item's `description` field
      MUST_OBSERVE: chip row contains `0.2.1`, `component`, both `nativewind` and `uniwind`, and an Expo Go verdict value
      MUST_OBSERVE: install block is the first content section after the header and contains `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` plus a labeled `uniwind` variant line, each with a copy button
      MUST_NOT_OBSERVE: h1 empty or equal to the raw slug `conversation-item`
      MUST_NOT_OBSERVE: 0 chips
      MUST_NOT_OBSERVE: no copy button on the install block
      MUST_NOT_OBSERVE: any preview-panel element or placeholder text
    CASE 2:
      START_REF: built_site
      ACTOR: e2e_runner
        - loop all 39 component pages from registry-items.json
        - assert h1 == item `title`, description non-empty, the 4 chip groups, install block first, a Code section present with no max-height style
      MUST_OBSERVE: 39 of 39 pages return HTTP 200 with h1 equal to the item `title`
      MUST_OBSERVE: 39 of 39 pages place the install block before every other content section
      MUST_OBSERVE: 39 of 39 pages render a Code section whose container has no `max-height` and no truncation indicator
      MUST_NOT_OBSERVE: 0 pages passing the anatomy loop
      MUST_NOT_OBSERVE: any page with 0 chips
      MUST_NOT_OBSERVE: any preview-panel element or placeholder text on any of the 39 pages
    CASE 3:
      START_REF: built_site
      ACTOR: e2e_runner
        - sample >= 5 item pages (conversation included)
        - GET http://localhost:4321/r/nativewind/{item}.json on the same origin
        - compare each rendered Code block's text byte-for-byte against the JSON `files` contents
      MUST_OBSERVE: each sampled Code view byte-matches the served `/r/nativewind/{item}.json` file contents
      MUST_OBSERVE: the fetched JSON `name` field equals the sampled item name with `files` non-empty
      MUST_NOT_OBSERVE: any sampled byte mismatch (truncated or edited source)
      MUST_NOT_OBSERVE: an empty `files` array in any sampled fetch

AC-2: Family pager stays in family across all 39 pages [PRIMARY]
  GIVEN: the 39 generated pages and families.json defining the 7 component families' member order
  WHEN:  the spec walks each family from its first item following `next` links until it revisits the start, and GETs every pager href
  THEN:  for every family the set of pages reachable via next equals the family's member set exactly; from a last member next either wraps to the family's first item or is omitted — never a cross-family link; every pager href returns HTTP 200

  FLOW_REF:             FLOW-GEND-15-family-pager-stays-in-family
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real Astro build + astro preview server + Chromium
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
  TEST_FUNCTION:        FLOW-GEND-15-family-pager-stays-in-family
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real Astro build + astro preview + Chromium
    NEGATIVE_CONTROL (would fail if):
      - the pager is a flat alphabetical prev/next over all 39 items ignoring families (a walk would cross families immediately)
      - pager hrefs are generated from a hardcoded list that omits an item (the set-equality check fails)
    EVIDENCE: screenshot (required_capture=true)
    CASE 1:
      START_REF: built_site
      ACTOR: e2e_runner
        - import apps/docs/src/data/families.json in the spec; take the 7 families containing registry:component items
        - for each family: open the first member's page and follow the `next` link until returning to the start or exhausting an omitted affordance; record visited slugs
        - GET every pager href encountered
      MUST_OBSERVE: for each of the 7 families, the set of pages reachable via next-links equals the family's member set exactly (set equality)
      MUST_OBSERVE: from each family's last member, next either links that family's first item or is omitted — 0 cross-family next links
      MUST_OBSERVE: every pager href returns HTTP 200
      MUST_NOT_OBSERVE: a next link resolving to a page outside the walked family
      MUST_NOT_OBSERVE: any pager href returning HTTP 404
      MUST_NOT_OBSERVE: a family walk visiting 0 pages

AC-3: Lean /components index anchors all 56 names exactly once
  GIVEN: the built /components index generated from families.json
  WHEN:  the spec opens /components and cross-checks section membership against families.json
  THEN:  the index renders one anchored section per family covering all 56 names exactly once; the 39 component names link `/components/{item}` and all return HTTP 200

  FLOW_REF:             FLOW-GEND-15-family-pager-stays-in-family
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real Astro build + astro preview server + Chromium
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
  TEST_FUNCTION:        FLOW-GEND-15-family-pager-stays-in-family
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real Astro build + astro preview + Chromium
    NEGATIVE_CONTROL (would fail if):
      - the index is a hardcoded link list that drifts from families.json (a fixture edit leaves it unchanged)
    EVIDENCE: screenshot (required_capture=true)
    CASE 1:
      START_REF: built_site
      ACTOR: e2e_runner
        - navigate to /components
        - collect anchored section ids and member link texts
        - GET each of the 39 item hrefs
      MUST_OBSERVE: section anchors match the 9 family ids from families.json
      MUST_OBSERVE: union of member names across sections == all 56 registry names, each appearing exactly once
      MUST_OBSERVE: all 39 `/components/{item}` hrefs return HTTP 200
      MUST_NOT_OBSERVE: 0 anchored sections
      MUST_NOT_OBSERVE: any name duplicated across sections
      MUST_NOT_OBSERVE: any item href returning HTTP 404

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: /components/conversation shows h1 `Conversation`, the one-line description, chips for `0.2.1`, category, both engines, and an Expo Go verdict.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep 
- TC-2: On all 39 pages the install block is the first content section after the header, containing the labeled nativewind and uniwind absolute-URL commands each with a copy button.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep 
- TC-3: All 39 pages render 0 preview-panel elements and 0 placeholder text, and every Code section renders full source with no max-height style.
  maps_to_ac: AC-1 | type: negative_space | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep 
- TC-4: At least 5 sampled Code views byte-match the file contents served by http://localhost:4321/r/nativewind/{item}.json on the same origin.
  maps_to_ac: AC-1 | type: single_source | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep 
- TC-5: For each of the 7 component families, the set of pages reachable via next-links equals the family's member set, with 0 cross-family pager links and all pager hrefs returning HTTP 200.
  maps_to_ac: AC-2 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep 
- TC-6: The /components index anchors all 56 names exactly once across the 9 family sections, with all 39 item links returning HTTP 200.
  maps_to_ac: AC-3 | type: happy_path | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep 

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- apps/docs/src/pages/components/index.astro (NEW)
- apps/docs/src/pages/components/[item].astro (NEW)
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (NEW)

writeProhibited:
- apps/docs/src/pages/registry.astro (FUSE-06) and index.astro (FUSE-08) — wave-mates
- apps/docs/src/data/** and apps/docs/public/r/** — FUSE-05's artifact
- apps/docs/src/components/islands/** — FUSE-09's (import only)
- packages/registry/**
- tests/sprint-01/**

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-DOCS-01, CAP-INST-01
provides:
- route /components — lean index with anchored family sections covering all 56 names exactly once (39 linking item pages; ui/lib as
anchor rows)
- routes /components/{item} x39 via getStaticPaths over registry-items.json type `registry:component` (slug = name)
- each item page: h1 title, one-line description, chip row (version 0.2.1, category, both engines, Expo Go verdict), install block as FIRST content section (labeled nativewind + labeled uniwind absolute-URL commands with CopyButton), full untruncated source in a Code section with no height limit
- prev/next-within-family pager computed from families.json itemNames order (owns the FLOW-GEND-15 affordance; Sprint 04 restyles)
- FLOW-GEND-14 and FLOW-GEND-15 proofs in tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
consumes:
- registry-items-v1: registry-items.json + families.json + gallery-manifest.json (PROVIDED by FUSE-05 — read-only)
- CopyButton island (FUSE-09)
- e2e runner (FUSE-10)
- FUSE-01 apps/docs package
boundary_contracts:
- registry-items-v1 field names LOCKED — no renames, no second source; Code view renders sourceFiles[].text verbatim
- Absolute-URL command regex everywhere: `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$` — never short-name, never relative
- SPRINT-01 SUBSET: props-table/theming-note/usage-snippet sections land Sprint 04; TabGroup engine tabs land Sprint 02 — the install block renders the zero-JS stacked, labeled two-engine form
- No imagery this sprint: T-GEND-021 — 0 preview-panel elements, 0 placeholder text on all 39 pages

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md [226-312]
   Focus: component-detail wireframe R3-R6/R12: PageHeader + chips, install block FIRST (R5), Code full untruncated (R6c), pager within family (R12), NO-IMAGERY variant note
2. .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md [438-439]
   Focus: hard UI constraints: full untruncated source always, engine panels server-rendered, build-time-only data
3. .spec/prds/docs-site/12-e2e-testing-criteria.md [99-133]
   Focus: T-GEND-009/010/011 anatomy+install-first+pager rows; T-GEND-013/016 command forms; T-GEND-021/024 source/no-placeholder rows

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FLOW-GEND-14-reference-page-anatomy
  Command:  pnpm playwright test  --grep 
  Expected: exit 0 — anatomy on 39/39 pages, install block first, full source, 0 preview panels, sampled byte-match
Gate 2: FLOW-GEND-15-family-pager-stays-in-family
  Command:  pnpm playwright test  --grep 
  Expected: exit 0 — per-family set equality, 0 cross-family links, all hrefs 200
Gate 3: FUSE-07-components-index
  Command:  pnpm playwright test  --grep 
  Expected: exit 0 — 56 names anchored exactly once, 39 item links 200
Gate 4: FUSE-07-biome
  Command:  ./node_modules/.bin/biome ci apps/docs/src/pages/components tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
  Expected: exit 0

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Generate the 39 minimal component reference pages and the lean /components index from registry-items.json with install-block-first anatomy, full untruncated source, and an honest within-family pager.

Design notes:
- FLOW-GEND-15 affordance folded here by planner decision: families.json already provides adjacency, so a lean prev/next is cheap and makes the flow honestly provable this sprint; Sprint 04 restyles the pager (its task supersedes the styling, not the walk proof)
- Sprint-04 supersedes the GEND-14 subset: props table, theming note, usage snippets, dependency panel, Preview|Code TabGroup land there
- The install block renders the zero-JS stacked labeled form — this IS the wireframe's no-JS fallback, promoted to the sprint-01 default until TabGroup exists

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: FUSE-01, FUSE-05, FUSE-09, FUSE-10
Blocks:     FUSE-08, FUSE-11

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-07",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_site": {
   "description": "The docs site built through the real chain with FUSE-05's artifact (56 entries, families map) and served by astro preview at http://localhost:4321.",
   "seed_method": "cli",
   "records": [
    "pnpm registry:build exit 0 (56 x2 engine JSONs under apps/docs/public/r, gitignored)",
    "pnpm --filter @rnr-ai-elements/docs build exit 0 \u2014 dist/ contains /components/{item}/index.html x39 and /components/index.html",
    "astro preview serving http://localhost:4321 with /r/nativewind/conversation.json on the same origin"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": true,
   "flow_ref": "FLOW-GEND-14-reference-page-anatomy",
   "test_file": "tests/sprint-01-docs-spike-skeleton/component-page.spec.ts",
   "test_function": "FLOW-GEND-14-reference-page-anatomy",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-14-reference-page-anatomy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium + same-origin /r/*.json fetches",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "pages are a hardcoded static template for `conversation` reused for all 39 slugs (h1 never equals the per-item title)",
      "the Code view shows a truncated excerpt while claiming full source \u2014 the byte-compare against `/r/nativewind/{item}.json` would fail",
      "a placeholder preview box stands in for the omitted imagery panel"
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
        "navigate to http://localhost:4321/components/conversation",
        "read h1, description, chip row, and DOM order of content sections; capture a screenshot"
       ]
      },
      "end_state": {
       "must_observe": [
        "h1 equals `Conversation`",
        "one-line description text non-empty and equal to the item's `description` field",
        "chip row contains `0.2.1`, `component`, both `nativewind` and `uniwind`, and an Expo Go verdict value",
        "install block is the first content section after the header and contains `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` plus a labeled `uniwind` variant line, each with a copy button"
       ],
       "must_not_observe": [
        "h1 empty or equal to the raw slug `conversation-item`",
        "0 chips",
        "no copy button on the install block",
        "any preview-panel element or placeholder text"
       ]
      }
     },
     {
      "start_ref": "built_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "loop all 39 component pages from registry-items.json",
        "assert h1 == item `title`, description non-empty, the 4 chip groups, install block first, a Code section present with no max-height style"
       ]
      },
      "end_state": {
       "must_observe": [
        "39 of 39 pages return HTTP 200 with h1 equal to the item `title`",
        "39 of 39 pages place the install block before every other content section",
        "39 of 39 pages render a Code section whose container has no `max-height` and no truncation indicator"
       ],
       "must_not_observe": [
        "0 pages passing the anatomy loop",
        "any page with 0 chips",
        "any preview-panel element or placeholder text on any of the 39 pages"
       ]
      }
     },
     {
      "start_ref": "built_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "sample >= 5 item pages (conversation included)",
        "GET http://localhost:4321/r/nativewind/{item}.json on the same origin",
        "compare each rendered Code block's text byte-for-byte against the JSON `files` contents"
       ]
      },
      "end_state": {
       "must_observe": [
        "each sampled Code view byte-matches the served `/r/nativewind/{item}.json` file contents",
        "the fetched JSON `name` field equals the sampled item name with `files` non-empty"
       ],
       "must_not_observe": [
        "any sampled byte mismatch (truncated or edited source)",
        "an empty `files` array in any sampled fetch"
       ]
      }
     }
    ]
   },
   "given": "the built site with the 39 generated item pages",
   "when": "the spec opens /components/conversation in full, then loops all 39 pages asserting the anatomy subset, then byte-compares sampled Code views against the same-origin served /r/nativewind/{item}.json",
   "then": "/components/conversation shows h1 `Conversation`, the one-line description, chips version `0.2.1` + category `component` + both engines + Expo Go verdict, the install block as first content section containing `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` plus the labeled uniwind variant with copy; all 39 pages pass the same anatomy; sampled Code sections byte-match the served registry JSON source and have no height limit; 0 preview-panel elements and 0 placeholder text",
   "num": 1,
   "name": "Reference-page anatomy on all 39 pages: header, chips, install block FIRST, full source, no preview panel",
   "type": "acceptance_criterion",
   "description": "GIVEN the built site with the 39 generated item pages WHEN the spec opens /components/conversation in full, then loops all 39 pages asserting the anatomy subset, then byte-compares sampled Code views against the same-origin served /r/nativewind/{item}.json THEN /components/conversation shows h1 `Conversation`, the one-line description, chips version `0.2.1` + category `component` + both engines + Expo Go verdict, the install block as first content section containing `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` plus the labeled uniwind variant with copy; all 39 pages pass the same anatomy; sampled Code sections byte-match the served registry JSON source and have no height limit; 0 preview-panel elements and 0 placeholder text",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": true,
   "flow_ref": "FLOW-GEND-15-family-pager-stays-in-family",
   "test_file": "tests/sprint-01-docs-spike-skeleton/component-page.spec.ts",
   "test_function": "FLOW-GEND-15-family-pager-stays-in-family",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family",
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
      "the pager is a flat alphabetical prev/next over all 39 items ignoring families (a walk would cross families immediately)",
      "pager hrefs are generated from a hardcoded list that omits an item (the set-equality check fails)"
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
        "import apps/docs/src/data/families.json in the spec; take the 7 families containing registry:component items",
        "for each family: open the first member's page and follow the `next` link until returning to the start or exhausting an omitted affordance; record visited slugs",
        "GET every pager href encountered"
       ]
      },
      "end_state": {
       "must_observe": [
        "for each of the 7 families, the set of pages reachable via next-links equals the family's member set exactly (set equality)",
        "from each family's last member, next either links that family's first item or is omitted \u2014 0 cross-family next links",
        "every pager href returns HTTP 200"
       ],
       "must_not_observe": [
        "a next link resolving to a page outside the walked family",
        "any pager href returning HTTP 404",
        "a family walk visiting 0 pages"
       ]
      }
     }
    ]
   },
   "given": "the 39 generated pages and families.json defining the 7 component families' member order",
   "when": "the spec walks each family from its first item following `next` links until it revisits the start, and GETs every pager href",
   "then": "for every family the set of pages reachable via next equals the family's member set exactly; from a last member next either wraps to the family's first item or is omitted \u2014 never a cross-family link; every pager href returns HTTP 200",
   "num": 2,
   "name": "Family pager stays in family across all 39 pages",
   "type": "acceptance_criterion",
   "description": "GIVEN the 39 generated pages and families.json defining the 7 component families' member order WHEN the spec walks each family from its first item following `next` links until it revisits the start, and GETs every pager href THEN for every family the set of pages reachable via next equals the family's member set exactly; from a last member next either wraps to the family's first item or is omitted \u2014 never a cross-family link; every pager href returns HTTP 200",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "primary": false,
   "flow_ref": "FLOW-GEND-15-family-pager-stays-in-family",
   "test_file": "tests/sprint-01-docs-spike-skeleton/component-page.spec.ts",
   "test_function": "FLOW-GEND-15-family-pager-stays-in-family",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the index is a hardcoded link list that drifts from families.json (a fixture edit leaves it unchanged)"
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
        "navigate to /components",
        "collect anchored section ids and member link texts",
        "GET each of the 39 item hrefs"
       ]
      },
      "end_state": {
       "must_observe": [
        "section anchors match the 9 family ids from families.json",
        "union of member names across sections == all 56 registry names, each appearing exactly once",
        "all 39 `/components/{item}` hrefs return HTTP 200"
       ],
       "must_not_observe": [
        "0 anchored sections",
        "any name duplicated across sections",
        "any item href returning HTTP 404"
       ]
      }
     }
    ]
   },
   "given": "the built /components index generated from families.json",
   "when": "the spec opens /components and cross-checks section membership against families.json",
   "then": "the index renders one anchored section per family covering all 56 names exactly once; the 39 component names link `/components/{item}` and all return HTTP 200",
   "num": 3,
   "name": "Lean /components index anchors all 56 names exactly once",
   "type": "acceptance_criterion",
   "description": "GIVEN the built /components index generated from families.json WHEN the spec opens /components and cross-checks section membership against families.json THEN the index renders one anchored section per family covering all 56 names exactly once; the 39 component names link `/components/{item}` and all return HTTP 200",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "/components/conversation shows h1 `Conversation`, the one-line description, chips for `0.2.1`, category, both engines, and an Expo Go verdict.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep "
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "On all 39 pages the install block is the first content section after the header, containing the labeled nativewind and uniwind absolute-URL commands each with a copy button.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep "
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "All 39 pages render 0 preview-panel elements and 0 placeholder text, and every Code section renders full source with no max-height style.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep "
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "At least 5 sampled Code views byte-match the file contents served by http://localhost:4321/r/nativewind/{item}.json on the same origin.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep "
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "For each of the 7 component families, the set of pages reachable via next-links equals the family's member set, with 0 cross-family pager links and all pager hrefs returning HTTP 200.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep "
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "The /components index anchors all 56 names exactly once across the 9 family sections, with all 39 item links returning HTTP 200.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep "
  }
 ]
}
-->
