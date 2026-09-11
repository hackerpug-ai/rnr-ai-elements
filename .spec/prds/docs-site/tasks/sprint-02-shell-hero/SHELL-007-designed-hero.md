================================================================================
TASK: SHELL-007 - Compose the designed home hero per wireframe R5-R8 — one screen at 1440x900, computed counters, engine-tabbed InstallCommand, Button CTAs
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     5   # Fibonacci story points — relative size, never time
AGENT:      implementer=frontend-designer | reviewer=astro-reviewer
PROPOSED-BY: frontend-designer
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: ?
HUMAN-TEST-HOOK: hero-fits-one-screen
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Recompose / as the designed hero per wireframe R5-R8 on the DocsLayout home variant: statement, computed ChipRow counters, engine-tabbed InstallCommand, Button CTAs — the sprint gate sentence made real.
**Success state:** At 1440x900 over astro preview, / shows the statement, the version counter (0.2.1), the item counters (56/39/11/6), the copyable engine-tabbed install command, and both CTAs without scrolling — and the rewritten home.spec.ts plus the new home-hero.spec.ts prove it.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Counters stay build-computed: version from the root package.json, 56/39/11/6 from registry-items.json type filters — a detached hardcoded literal fails the spec
- MUST: home.spec.ts is rewritten with locator scoping to the ACTIVE tab panel so command textContent stays single-match while BOTH engine panels remain in the served DOM (zero-JS contract)
- MUST: Every sprint-01 content assertion survives: the identity sentence 'Universal AI chat and agent UI components for React Native', 'copy-paste registry', the literal 'NOT an npm package', data-counter hooks (version/total/components/ui/libs), CTA hrefs /registry + /components
- MUST: index.astro adopts DocsLayout's home variant (sidebar + ToC suppressed) and switches off spike.astro
- NEVER: Never render short-name or relative command forms or an un-tabbed engine duplicate (T-GEND-016)
- NEVER: Never add R9-R12 regions (family teaser grid, quickstart strip, boundary teaser, QR) — they ride Sprint 03+; zero dead links this sprint
- NEVER: Never hand-edit the superseded spec's island-demo tests at the top of home.spec.ts — FUSE-09's gates grep the same file and must keep passing
- STRICTLY: The copy source is the displayed panel text so display and clipboard cannot drift
- STRICTLY: Sizing to one 1440x900 screen uses the token scale (h1 2.25rem/1.2/600) — no magic numbers that only fit by accident
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: the hero contains the identity sentence, 'copy-paste registry', and the literal 'NOT an npm package'; the data-counter hooks equal the computed expectations inside one hero element tree; Get started targets /registry and Browse components targets /components via Button; the page renders on DocsLayout (header present, sidebar/ToC suppressed)
- [ ] AC-2: the clipboard equals the displayed active-panel command exactly — `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` by default, matching the boundary regex character-for-character with no trailing newline — and both engine panels exist in the DOM
- [ ] AC-3: the page serves 200 and BOTH the nativewind and the uniwind conversation.json commands render as selectable stacked, labeled text
- [ ] AC-4: every hero element's box lies fully inside the 1440x900 viewport (bottom edge <= 900, no scroll) with the sticky header accounted for; the counters equal the run-time-computed values and both CTA targets return 200
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: Tabbed hero content contract: statement, computed counters, Button CTAs on the DocsLayout home variant
  GIVEN: SHELL-002's DocsLayout, SHELL-004's InstallCommand, and SHELL-005's primitives landed, and home.spec.ts still asserting the sprint-01 un-tabbed block
  WHEN:  the rewritten home.spec.ts hero test opens / and reads the statement, the data-counter values (computed at run time from the real artifacts), and both CTAs
  THEN:  the hero contains the identity sentence, 'copy-paste registry', and the literal 'NOT an npm package'; the data-counter hooks equal the computed expectations inside one hero element tree; Get started targets /registry and Browse components targets /components via Button; the page renders on DocsLayout (header present, sidebar/ToC suppressed)
  FLOW_REF:              FLOW-GEND-01-home-hero-evaluation-contract
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium (via the landed e2e:docs runner)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/home-hero.spec.ts
  TEST_FUNCTION:         FLOW-GEND-01-home-hero-evaluation-contract
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_preview_site: navigate to http://localhost:4321/ (navigateLocalhost helper), derive expected counters from package.json + registry-items.json at run time, read the hero statement, the [data-counter] values, the CTA roles/hrefs, and the shell header; capture a screenshot
      MUST_OBSERVE: hero text contains `Universal AI chat and agent UI components for React Native` and `copy-paste registry`; hero text contains the literal `NOT an npm package`; data-counter hooks resolve to the computed expectations: version `0.2.1`, total `56`, components `39`, ui `11`, libs `6` (today's artifact truth) inside one hero element tree; Get started href `/registry` and Browse components href `/components` rendered as Button instances; the page carries the DocsLayout shell (`<header`) and the home variant (no sidebar/ToC regions)
      MUST_NOT_OBSERVE: 0 counters rendered or a counter differing from the computed expectation (e.g. `55` after a fixture edit); any CTA href pointing elsewhere or returning 404; a sidebar or ToC region on the home variant
    NEGATIVE_CONTROL: would fail if counters are hardcoded literals decoupled from the artifacts — editing the fixture leaves `56` rendered while the spec's computed expectation moves; index.astro still renders through spike.astro — no header/shell markup for the home-variant assertions…

AC-2: Engine-tabbed install command: active-panel-scoped copy yields the exact engine command
  GIVEN: the designed hero embedding SHELL-004's InstallCommand (rnr-tab-group, default nativewind)
  WHEN:  the rewritten home.spec.ts copy test scopes its locator to the ACTIVE tab panel, reads the displayed command, clicks copy, and reads the clipboard
  THEN:  the clipboard equals the displayed active-panel command exactly — `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` by default, matching the boundary regex character-for-character with no trailing newline — and both engine panels exist in the DOM
  FLOW_REF:              FLOW-GEND-02-hero-install-command-copy
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium with granted clipboard permissions
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/home-hero.spec.ts
  TEST_FUNCTION:         FLOW-GEND-02-hero-install-command-copy
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_preview_site: open a clipboard-permission context and navigate to http://localhost:4321/, read the ACTIVE tab panel's command text (single-match scoped locator), click the copy button and read the clipboard via navigator.clipboard.readText()
      MUST_OBSERVE: clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exactly (default nativewind tab); the string matches `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$` character-for-character; exactly 2 div[role=tabpanel][data-engine] elements in the hero install block: data-engine="nativewind" and data-engine="uniwind" (2 of 2)
      MUST_NOT_OBSERVE: clipboard empty or holding a trailing newline/wrap artifact; a concatenated multi-panel string (unscoped textContent merge); short-name form `add conversation` or relative form `add /r/...`
    NEGATIVE_CONTROL: would fail if the copy source is a hardcoded echo drifting from the displayed panel (clipboard vs displayed compare fails); the locator is unscoped so textContent merges both engine panels — the exact-equality assertion catches the multi-match…

AC-3: Zero-JS contract: both engine commands render as selectable stacked text
  GIVEN: the designed hero with both server-rendered engine panels in the DOM
  WHEN:  the zero-JS test opens / in a javaScriptEnabled:false context and reads the command text nodes
  THEN:  the page serves 200 and BOTH the nativewind and the uniwind conversation.json commands render as selectable stacked, labeled text
  FLOW_REF:              FLOW-GEND-02-hero-install-command-copy
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium with javaScriptEnabled:false
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/home-hero.spec.ts
  TEST_FUNCTION:         FLOW-GEND-02-hero-install-command-copy
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_preview_site: open a javaScriptEnabled:false context and navigate to http://localhost:4321/, read every engine panel's command text node
      MUST_OBSERVE: HTTP 200; selectable text equal to `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json`; selectable text equal to `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`
      MUST_NOT_OBSERVE: 0 selectable command text; only one engine's command present; placeholder text instead of the real commands
    NEGATIVE_CONTROL: would fail if panels are client-fetched or JS-gated — with JS off neither command renders and the text assertion fails; only the default engine renders server-side — the uniwind command is absent…

AC-4: One-screen geometric proof at 1440x900 over the widened lane (non-primary rendered reference)
  GIVEN: this hero landed and SHELL-011's home-hero.spec.ts registered under the widened testDir (final-wave verification)
  WHEN:  the hero flow spec cold-navigates to / in a 1440x900 viewport and takes bounding boxes of the statement, counters row, install block, and both CTAs
  THEN:  every hero element's box lies fully inside the 1440x900 viewport (bottom edge <= 900, no scroll) with the sticky header accounted for; the counters equal the run-time-computed values and both CTA targets return 200
  FLOW_REF:              FLOW-GEND-01-home-hero-evaluation-contract
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium at 1440x900 viewport override
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/home-hero.spec.ts
  TEST_FUNCTION:         FLOW-GEND-01-home-hero-evaluation-contract
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_preview_site: cold-navigate to http://localhost:4321/ with a 1440x900 viewport override (spec owned by SHELL-011; this AC is the non-primary geometric reference), measure bounding boxes of the statement, counters row, install block, and both CTAs; GET both CTA targets
      MUST_OBSERVE: every hero element bounding box fully inside the viewport: box.y + box.height <= 900; counters equal the run-time-computed expectations (`0.2.1`, `56`, `39`, `11`, `6` today); GET /registry returns 200 and GET /components returns 200
      MUST_NOT_OBSERVE: any hero element with box.y + box.height > 900; document scroll required to reveal a CTA; any CTA target returning 404
    NEGATIVE_CONTROL: would fail if any hero region (statement, counters, install, CTAs) overflows the first 900px — its bounding box bottom exceeds the viewport; the page requires scroll to reach a CTA — the fold proof fails on geometry, not selectors…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: The rewritten home.spec.ts hero test passes against the designed hero: identity sentence, 'copy-paste registry', literal 'NOT an npm package', data-counter values equal to the run-time-computed expectations, Button CTAs at /registry and /components, DocsLayout home variant with no sidebar/ToC.
- TC-2 [happy_path, → AC-2]: Scoping to the ACTIVE tab panel, one copy click yields a clipboard exactly equal to the displayed command matching `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$` with no trailing newline, and both engine panels exist in the DOM.
- TC-3 [edge, → AC-3]: With javaScriptEnabled:false, / serves 200 rendering BOTH the nativewind and uniwind conversation.json commands as selectable stacked text.
- TC-4 [happy_path, → AC-4]: In a 1440x900 viewport, every hero element's bounding box lies fully inside the first 900px (statement, counters, install block, both CTAs) with computed counters and 200-resolving CTA targets.
- TC-5 [happy_path, → AC-4]: On the widened lane, engine-following copy and persistence hold: click uniwind, copy yields the exact uniwind command; rnr-engine=uniwind survives a cold reload keeping the uniwind tab active.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/pages/index.astro (MODIFY)
- tests/sprint-01-docs-spike-skeleton/home.spec.ts (MODIFY)
- tests/sprint-02-shell-hero/home-hero.spec.ts (NEW)
writeProhibited:
- packages/**
- apps/docs/src/components/**
Supersedes (deliberate changes to existing tests):
- tests/sprint-01-docs-spike-skeleton/home.spec.ts
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- One-screen contract at 1440x900: R5+R6+R7+R8 all inside the first 900px — assertable via bounding boxes
- Counters stay build-computed from package.json + src/data/registry-items.json; a hardcoded literal fails the spec
- CTA targets this sprint: Get started -> /registry, Browse components -> /components (both 200 today); the /docs/introduction swap is Sprint 05's named remainder
- Keep the T-GEND-001 grep surface: /not an npm package/i, 'React Native', 'registry'
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md lines 78-113 — PRIMARY PATTERN — home wireframe R5-R8: statement slot, ChipRow counters, tabbed InstallCommand + copy, Button CTAs; home suppresses sidebar + ToC
- tests/sprint-01-docs-spike-skeleton/home.spec.ts lines 103-243 — the file being superseded: readGeneratedDataset ENOENT-bridge, expectedCounters computation, COMMAND_PATTERN regex, hero locator conventions — keep every content assertion, evolve only the install selector scoping
- apps/docs/src/pages/index.astro lines 1-103 — FUSE-08's block being redesigned: the data-counter markup that must survive verbatim, the counters computation to keep, the comment pre-declaring this supersede
- .spec/prds/docs-site/05-uc-gend.md lines 22-30 — UC-GEND-01's four checkboxes — the one-screen statement, counters without leaving the hero, one-click copy, CTA navigation
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: DocsLayout home variant -> hero stack (R5 statement, R6 ChipRow, R7 InstallCommand, R8 Button pair), counters computed in frontmatter from the real artifacts
Source: apps/docs/src/pages/index.astro:1-103
Anti-pattern: hardcoded counter literals, unscoped panel textContent, R9-R12 regions stubbed in early, or CTA targets that 404
Interaction notes:
- One-screen fit at 1440x900 is a geometric contract: statement, counters, tabbed install, and both CTAs inside the first 900px beneath the 3.5rem sticky header — sized via the token scale, not magic numbers
- Locator discipline in the rewritten spec: scope command reads to the ACTIVE [role=tabpanel] so textContent stays single-match while both panels remain in the DOM
- Counters computation moves as-is from FUSE-08 (package.json version + type-filtered registry counts); Chip renders the same <data data-counter> hooks
- R9-R12 (family teaser, quickstart strip, boundary teaser, QR) are deliberately NOT this sprint — zero dead links
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- hero content contract (superseded lane): `pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract`
  expected: exit 0 — statement + not-npm + computed counters + Button CTAs + home variant
- tabbed copy contract (superseded lane): `pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-02-hero-install-command-copy`
  expected: exit 0 — island tests + tabbed hero copy + zero-JS both-engines all green
- one-screen + engine-following (widened lane, final wave): `pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND`
  expected: exit 0 — 1440x900 bounding boxes inside the viewport, engine-following copy + persistence
- typecheck: `pnpm typecheck`
  expected: exit 0
- lint (never `pnpm lint` — crashes locally): `./node_modules/.bin/biome ci apps/docs/src/pages/index.astro tests/sprint-01-docs-spike-skeleton/home.spec.ts`
  expected: exit 0
- RED-first evidence: `pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND (before recomposing index.astro)`
  expected: FAIL — the spec's tabbed selectors find no rnr-tab-group; record the RED output
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-002, SHELL-004, SHELL-005
Blocks:     SHELL-010 (copy pass polishes the landed hero strings), SHELL-011 (hero specs assert this DOM)
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
This task is the gate sentence. R9-R12 (family teaser grid, quickstart strip, boundary teaser, QR) are deliberately NOT this sprint — they ride Sprint 03+. Statement/counter/CTA observables stay byte-compatible with what sprint-01 specs pin; only the command strip's selector scoping evolves. Lane proof: the superseded home.spec.ts rewritten to the tabbed contract (active-panel scoping, both engines in DOM for zero-JS), with the geometric one-screen and engine-following proofs riding SHELL-011's home-hero.spec.ts as non-primary references.
Coding standards:
- Astro 7 strict compiler: valid nesting, closed non-void tags
- Counters computed in frontmatter from package.json + registry-items.json — never a detached literal
- Consume SHELL-004/005 components; no new components, no new islands in this task
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)
Capability: touches=['CAP-DOCS-01', 'CAP-INST-01'] provides=2 items consumes=4 items; boundary_contracts=4
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-007",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_preview_site": {
   "description": "Docs site built through the real chain with the designed hero, served by the runner's strict-port astro preview webServer at http://localhost:4321. RED at task start: / is FUSE-08's structural block \u2014 a single un-tabbed nativewind CopyButton, no DocsLayout shell, and nothing asserts one-screen fit.",
   "seed_method": "build_artifact",
   "records": [
    "pnpm --filter @rnr-ai-elements/docs build exit 0 with dist/index.html present",
    "astro preview serving http://localhost:4321 (via the Playwright webServer \u2014 never a manually backgrounded preview)"
   ]
  },
  "computed_counters_source": {
   "description": "The real artifacts the spec re-reads at run time to derive expectations \u2014 root package.json (version) and apps/docs/src/data/registry-items.json (type-filtered counts). Values today: version 0.2.1, total 56, components 39, ui 11, libs 6.",
   "seed_method": "build_artifact",
   "records": [
    "package.json version field (today `0.2.1`)",
    "registry-items.json length 56 with 39 registry:component / 11 registry:ui / 6 registry:lib"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN SHELL-002's DocsLayout, SHELL-004's InstallCommand, and SHELL-005's primitives landed, and home.spec.ts still asserting the sprint-01 un-tabbed block WHEN the rewritten home.spec.ts hero test opens / and reads the statement, the data-counter values (computed at run time from the real artifacts), and both CTAs THEN the hero contains the identity sentence, 'copy-paste registry', and the literal 'NOT an npm package'; the data-counter hooks equal the computed expectations inside one hero element tree; Get started targets /registry and Browse components targets /components via Button; the page renders on DocsLayout (header present, sidebar/ToC suppressed)",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-01-home-hero-evaluation-contract",
   "test_file": "tests/sprint-02-shell-hero/home-hero.spec.ts",
   "test_function": "FLOW-GEND-01-home-hero-evaluation-contract",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium (via the landed e2e:docs runner)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview server + Chromium",
    "negative_control": {
     "would_fail_if": [
      "counters are hardcoded literals decoupled from the artifacts \u2014 editing the fixture leaves `56` rendered while the spec's computed expectation moves",
      "index.astro still renders through spike.astro \u2014 no header/shell markup for the home-variant assertions",
      "the hero drops a pinned string (e.g. rewrites the statement without 'NOT an npm package') \u2014 the T-GEND-001 grep surface fails"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "navigate to http://localhost:4321/ (navigateLocalhost helper)",
        "derive expected counters from package.json + registry-items.json at run time",
        "read the hero statement, the [data-counter] values, the CTA roles/hrefs, and the shell header; capture a screenshot"
       ]
      },
      "end_state": {
       "must_observe": [
        "hero text contains `Universal AI chat and agent UI components for React Native` and `copy-paste registry`",
        "hero text contains the literal `NOT an npm package`",
        "data-counter hooks resolve to the computed expectations: version `0.2.1`, total `56`, components `39`, ui `11`, libs `6` (today's artifact truth) inside one hero element tree",
        "Get started href `/registry` and Browse components href `/components` rendered as Button instances",
        "the page carries the DocsLayout shell (`<header`) and the home variant (no sidebar/ToC regions)"
       ],
       "must_not_observe": [
        "0 counters rendered or a counter differing from the computed expectation (e.g. `55` after a fixture edit)",
        "any CTA href pointing elsewhere or returning 404",
        "a sidebar or ToC region on the home variant"
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
   "description": "GIVEN the designed hero embedding SHELL-004's InstallCommand (rnr-tab-group, default nativewind) WHEN the rewritten home.spec.ts copy test scopes its locator to the ACTIVE tab panel, reads the displayed command, clicks copy, and reads the clipboard THEN the clipboard equals the displayed active-panel command exactly \u2014 `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` by default, matching the boundary regex character-for-character with no trailing newline \u2014 and both engine panels exist in the DOM",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-02-hero-install-command-copy",
   "test_file": "tests/sprint-02-shell-hero/home-hero.spec.ts",
   "test_function": "FLOW-GEND-02-hero-install-command-copy",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium with granted clipboard permissions",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium with granted clipboard permissions",
    "negative_control": {
     "would_fail_if": [
      "the copy source is a hardcoded echo drifting from the displayed panel (clipboard vs displayed compare fails)",
      "the locator is unscoped so textContent merges both engine panels \u2014 the exact-equality assertion catches the multi-match",
      "the button shows success while the clipboard stays empty (stub island)"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "open a clipboard-permission context and navigate to http://localhost:4321/",
        "read the ACTIVE tab panel's command text (single-match scoped locator)",
        "click the copy button and read the clipboard via navigator.clipboard.readText()"
       ]
      },
      "end_state": {
       "must_observe": [
        "clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exactly (default nativewind tab)",
        "the string matches `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$` character-for-character",
        "exactly 2 div[role=tabpanel][data-engine] elements in the hero install block: data-engine=\"nativewind\" and data-engine=\"uniwind\" (2 of 2)"
       ],
       "must_not_observe": [
        "clipboard empty or holding a trailing newline/wrap artifact",
        "a concatenated multi-panel string (unscoped textContent merge)",
        "short-name form `add conversation` or relative form `add /r/...`"
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
   "description": "GIVEN the designed hero with both server-rendered engine panels in the DOM WHEN the zero-JS test opens / in a javaScriptEnabled:false context and reads the command text nodes THEN the page serves 200 and BOTH the nativewind and the uniwind conversation.json commands render as selectable stacked, labeled text",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-02-hero-install-command-copy",
   "test_file": "tests/sprint-02-shell-hero/home-hero.spec.ts",
   "test_function": "FLOW-GEND-02-hero-install-command-copy",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium with javaScriptEnabled:false",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium (JS disabled)",
    "negative_control": {
     "would_fail_if": [
      "panels are client-fetched or JS-gated \u2014 with JS off neither command renders and the text assertion fails",
      "only the default engine renders server-side \u2014 the uniwind command is absent",
      "the panel hides via a max-height trick instead of the hidden attribute \u2014 the served-HTML string pin catches it"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "open a javaScriptEnabled:false context and navigate to http://localhost:4321/",
        "read every engine panel's command text node"
       ]
      },
      "end_state": {
       "must_observe": [
        "HTTP 200",
        "selectable text equal to `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json`",
        "selectable text equal to `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`"
       ],
       "must_not_observe": [
        "0 selectable command text",
        "only one engine's command present",
        "placeholder text instead of the real commands"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "AC-4",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN this hero landed and SHELL-011's home-hero.spec.ts registered under the widened testDir (final-wave verification) WHEN the hero flow spec cold-navigates to / in a 1440x900 viewport and takes bounding boxes of the statement, counters row, install block, and both CTAs THEN every hero element's box lies fully inside the 1440x900 viewport (bottom edge <= 900, no scroll) with the sticky header accounted for; the counters equal the run-time-computed values and both CTA targets return 200",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-01-home-hero-evaluation-contract",
   "test_file": "tests/sprint-02-shell-hero/home-hero.spec.ts",
   "test_function": "FLOW-GEND-01-home-hero-evaluation-contract",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium at 1440x900 viewport override",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview server + Chromium at 1440x900",
    "negative_control": {
     "would_fail_if": [
      "any hero region (statement, counters, install, CTAs) overflows the first 900px \u2014 its bounding box bottom exceeds the viewport",
      "the page requires scroll to reach a CTA \u2014 the fold proof fails on geometry, not selectors",
      "counters drift from the artifacts \u2014 the computed expectations diverge"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "cold-navigate to http://localhost:4321/ with a 1440x900 viewport override (spec owned by SHELL-011; this AC is the non-primary geometric reference)",
        "measure bounding boxes of the statement, counters row, install block, and both CTAs; GET both CTA targets"
       ]
      },
      "end_state": {
       "must_observe": [
        "every hero element bounding box fully inside the viewport: box.y + box.height <= 900",
        "counters equal the run-time-computed expectations (`0.2.1`, `56`, `39`, `11`, `6` today)",
        "GET /registry returns 200 and GET /components returns 200"
       ],
       "must_not_observe": [
        "any hero element with box.y + box.height > 900",
        "document scroll required to reveal a CTA",
        "any CTA target returning 404"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The rewritten home.spec.ts hero test passes against the designed hero: identity sentence, 'copy-paste registry', literal 'NOT an npm package', data-counter values equal to the run-time-computed expectations, Button CTAs at /registry and /components, DocsLayout home variant with no sidebar/ToC.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Scoping to the ACTIVE tab panel, one copy click yields a clipboard exactly equal to the displayed command matching `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$` with no trailing newline, and both engine panels exist in the DOM.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-02-hero-install-command-copy"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "With javaScriptEnabled:false, / serves 200 rendering BOTH the nativewind and uniwind conversation.json commands as selectable stacked text.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep \"hero-install-command-copy zero-JS\""
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "In a 1440x900 viewport, every hero element's bounding box lies fully inside the first 900px (statement, counters, install block, both CTAs) with computed counters and 200-resolving CTA targets.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-01-home-hero-evaluation-contract"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "On the widened lane, engine-following copy and persistence hold: click uniwind, copy yields the exact uniwind command; rnr-engine=uniwind survives a cold reload keeping the uniwind tab active.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/home-hero.spec.ts --grep FLOW-GEND-02-hero-install-command-copy"
  }
 ]
}
-->
