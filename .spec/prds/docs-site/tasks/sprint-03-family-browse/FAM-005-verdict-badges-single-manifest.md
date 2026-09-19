<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FAM-005: Verdict badges from the single manifest onto item pages + the 56-row ledger

> Status: ✅ Completed
> Commit: 073da630c2f021c9ea80970846c27c839dbcc558
> Assignee: react-native-reusables-implementer (implementer) · react-native-reusables-reviewer (reviewer)
> Priority: P1 · Points: 3 · Type: FEATURE · Wave: C
> Proposed By: react-native-reusables-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 2107567

## What this does
Retire the short 'Expo Go'/'dev-client' strings for one site-wide verdict vocabulary wired from the ONE manifest source. Badge.astro: VERDICTS becomes exactly {'expo-go': 'runs in Expo Go', 'dev-client': 'requires a dev client'}. [item].astro: import Badge and render it in the li[data-chip=expo] slot with tone from item.expoGo, deleting the plain ternary. registry.astro: render the Badge in td.ledger-verdict for all 56 rows with verdictLabel deleted; add tr id={`row-${item.name}`} and retarget the docsHref non-component branch from the removed /components#ui|#lib anchors to the in-page #row- anchors; keep both engine base URLs, the generated-at-build note, and copy affordances. Update the two sprint-01 assertions pinning the old strings (component-page.spec.ts expo-chip expectation; ledger.spec.ts verdict expectations). Prove the vocabulary is live on /components cards as a secondary owner of the locked FLOW-GEND-08 spec.

## Why
The source contracts hold on the real working tree (VERDICTS map exact, Badge wired in both surfaces, verdictLabel gone, 0 legacy /components#ui|#lib hrefs, both sprint-01 specs updated), the locked FLOW-GEND-08 run_cmd exits 0 because the cards now render the Badge strings, and the gate-step-4 lane shows 39/39 item pages + 56/56 ledger rows with Badge text/tone matching item.expoGo from apps/docs/src/data/registry-items.json (0 mismatches) plus ≥10 sampled /r/nativewind/{item}.json returning 200 with a matching name. Boundary recorded honestly in the lane header: the served /r/*.json carries no verdict field, so the sampled match anchors item identity, not verdict truth — the holistic T-GEND-019 gate stays Sprint 09's.

## How to verify
pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-badge-verdicts-map

## Scope
apps/docs/src/components/Badge.astro (MODIFY); apps/docs/src/pages/components/[item].astro (MODIFY); apps/docs/src/pages/registry.astro (MODIFY); tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY); tests/sprint-01-docs-spike-skeleton/ledger.spec.ts (MODIFY); tests/sprint-03-family-browse/verdict-contract.test.ts (NEW); tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts (NEW); tests/sprint-03-family-browse/card-anatomy.spec.ts

<details>
<summary>▸ Full agent specification (FAM-005 — required reading for implementer + reviewer)</summary>

TASK: FAM-005 — Verdict badges from the single manifest onto item pages + the 56-row ledger
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 3
AGENT: implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/6 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: MUST: unit ACs verify via pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t <TOKEN> reading the REAL working-tree sources (Badge.astro, [item].astro, registry.astro, the two sprint-01 specs) via node:fs — never fixture copies, never string-mocking the files under test
- MUST: MUST: AC-6's test_file/verify stay byte-identical to the locked FLOW-GEND-08 values (tests/sprint-03-family-browse/card-anatomy.spec.ts + its locked run_cmd) — secondary ownership means running the locked proof, never editing it
- MUST: MUST: land the Badge vocabulary, the registry/[item] wiring, and the two sprint-01 supersede edits in the same change — no window where a sprint-01 spec pins the retired strings against the new markup
- MUST: MUST: verify lint via ./node_modules/.bin/biome ci <paths> (local pnpm lint crashes) and typecheck via pnpm typecheck
- NEVER: NEVER: author, seed, or fake an expoGo:false value — zero items carry expoGo:false at HEAD; the dev-client state ships implemented and contract-asserted (VERDICTS map + source wiring + spec expectation map accept both states), never demonstrated by fabricated data
- NEVER: NEVER: read verdicts from anywhere but registry-items.json — the served /r/*.json carries NO verdict field today (keys verified: dependencies/description/files/name/registryDependencies/title/type)
- NEVER: NEVER: edit FAM-001's locked flow specs (human-flows.json), anything under tests/sprint-02-shell-hero/**, or FAM-003's card-anatomy.spec.ts
- NEVER: NEVER: leave a second verdict label helper beside the Badge — registry.astro's verdictLabel and [item].astro's ternary are deleted, not duplicated
- STRICTLY: STRICTLY: the playwright lane verdict-badge-wiring.spec.ts navigates only via http://localhost:4321 with retries: 0 — the Playwright webServer owns serving; never background a raw astro preview
- STRICTLY: STRICTLY: the docsHref retarget is surgical — both engine base URLs, the generated-at-build note, and every copy affordance on /registry stay rendering and working

### DONE WHEN

- [ ] AC 1: GIVEN the working tree with apps/docs/src/components/Badge.astro WHEN the vitest source co
- [ ] AC 2: GIVEN the working tree with apps/docs/src/pages/components/[item].astro WHEN the vitest so
- [ ] AC 3: GIVEN the working tree with apps/docs/src/pages/registry.astro and the 56-item manifest WH
- [ ] AC 4: GIVEN the working tree with registry.astro and the manifest's 17 non-component rows WHEN t
- [ ] AC 5: GIVEN the two sprint-01 spec files in the working tree WHEN the vitest source contract rea
- [ ] AC 6: GIVEN the built site with FAM-003's seven anchored family sections and the locked card-ana
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: GIVEN the working tree with apps/docs/src/components/Badge.astro WHEN **

  GIVEN/WHEN/THEN: GIVEN the working tree with apps/docs/src/components/Badge.astro WHEN the vitest source contract reads the component and extracts the VERDICTS record THEN it equals exactly the two locked state texts keyed by tone

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/verdict-contract.test.ts · TEST_FUNCTION: FAM-005-badge-verdicts-map
  VERIFY: `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-badge-verdicts-map`
  VERIFICATION_SERVICE: real working-tree source file read via node:fs under vitest (no mocks) · SURFACE_POLICY: None
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["2 VERDICTS entries: 'expo-go' -> 'runs in Expo Go' and 'dev-client' -> 'requires a dev client'", "BadgeTone union still exactly 'expo-go' | 'dev-client'"] / MUST_NOT_OBSERVE ["0 short-string values ('Expo Go' or bare 'dev-client') in the VERDICTS map", "0 tones beyond the two locked ones"]
    - NEGATIVE_CONTROL: would fail if ['the VERDICTS map keeps either short string — the exact-map equality fails', 'a third tone or renamed key is introduced — the record shape check fails', 'the test reads a fixture copy instead of the real file (static shell)']

**AC-2: GIVEN the working tree with apps/docs/src/pages/components/[item].astr**

  GIVEN/WHEN/THEN: GIVEN the working tree with apps/docs/src/pages/components/[item].astro WHEN the vitest source contract reads the page template THEN it imports Badge and renders it in the li[data-chip=expo] slot with tone derived from item.expoGo, and the old plain-text ternary is gone

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/verdict-contract.test.ts · TEST_FUNCTION: FAM-005-item-page-badge-wiring
  VERIFY: `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-item-page-badge-wiring`
  VERIFICATION_SERVICE: real working-tree source file read via node:fs under vitest (no mocks) · SURFACE_POLICY: None
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["1 Badge import from the shared component, rendered inside the li[data-chip=expo] slot", "tone bound to item.expoGo ('expo-go' : 'dev-client') \u2014 the one template all 39 registry:component pages build from"] / MUST_NOT_OBSERVE ["0 occurrences of the plain ternary {item.expoGo ? 'Expo Go' : 'Dev client'}", "0 per-page verdict strings outside the Badge"]
    - NEGATIVE_CONTROL: would fail if ['the Badge import or the tone-from-expoGo binding is missing — the source pattern check fails', 'the old ternary li survives beside the Badge — the absence check fails', 'the tone is hand-selected per page instead of derived from item.expoGo']

**AC-3: GIVEN the working tree with apps/docs/src/pages/registry.astro and the**

  GIVEN/WHEN/THEN: GIVEN the working tree with apps/docs/src/pages/registry.astro and the 56-item manifest WHEN the vitest source contract reads the ledger template THEN every mapped row renders the Badge inside td.ledger-verdict with tone from item.expoGo and the verdictLabel helper is deleted

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/verdict-contract.test.ts · TEST_FUNCTION: FAM-005-registry-badge-rows
  VERIFY: `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-badge-rows`
  VERIFICATION_SERVICE: real working-tree source file read via node:fs under vitest (no mocks) · SURFACE_POLICY: None
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["56/56 rows render the Badge \u2014 the single ledger.map row template covers every manifest entry (56 read from registry-items.json at run time) with td.ledger-verdict containing <Badge tone={item.expoGo ? 'expo-go' : 'dev-client'}>", "1 Badge import in registry.astro"] / MUST_NOT_OBSERVE ["0 plain-text verdict cells in the row template", "0 occurrences of the verdictLabel identifier anywhere in the file"]
    - NEGATIVE_CONTROL: would fail if ['any row path renders plain text instead of the Badge — the template pattern check fails', 'verdictLabel survives as a second verdict path — the identifier absence check fails']

**AC-4: GIVEN the working tree with registry.astro and the manifest's 17 non-c**

  GIVEN/WHEN/THEN: GIVEN the working tree with registry.astro and the manifest's 17 non-component rows WHEN the vitest source contract reads docsHref and the row template THEN each tr carries id={`row-${item.name}`} and the docsHref non-component branch returns the in-page #row- anchor — no /components#ui|#lib href remains in source

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/verdict-contract.test.ts · TEST_FUNCTION: FAM-005-registry-row-anchors
  VERIFY: `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-row-anchors`
  VERIFICATION_SERVICE: real working-tree source file read via node:fs under vitest (no mocks) · SURFACE_POLICY: None
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["17/17 non-component rows anchor via docsHref returning `#row-${item.name}` (count derived from the manifest at run time); component rows keep `/components/${item.name}`", "tr id={`row-${item.name}`} present on the row template; both engine base URLs, the generated-at-build note, and the per-row CopyButton still present in source"] / MUST_NOT_OBSERVE ["0 /components#ui hrefs in source", "0 /components#lib (or any /components#{family}) hrefs in source"]
    - NEGATIVE_CONTROL: would fail if ['any href still targets the removed /components#ui or /components#lib anchor — the source grep fails', 'a row id is missing or misspelled — the id-template check fails and the anchor dangles', 'the retarget drops a base URL, the build note, or a copy affordance — the presence checks fail']

**AC-5: GIVEN the two sprint-01 spec files in the working tree WHEN the vitest**

  GIVEN/WHEN/THEN: GIVEN the two sprint-01 spec files in the working tree WHEN the vitest source contract reads their expectation blocks THEN both carry the updated Badge vocabulary expectations and neither pins the retired short strings

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/verdict-contract.test.ts · TEST_FUNCTION: FAM-005-sprint01-vocabulary-updated
  VERIFY: `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-sprint01-vocabulary-updated`
  VERIFICATION_SERVICE: real working-tree source files read via node:fs under vitest (no mocks) · SURFACE_POLICY: None
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["2 spec files updated \u2014 component-page.spec.ts's expo-chip expectation and ledger.spec.ts's verdict expectations reference the new vocabulary", "2 spec files derive expected verdict text from registry-items.json at run time (0 hand-copied literals; supersede keeps the data-equality shape)"] / MUST_NOT_OBSERVE ["0 expectations pinning the exact short strings 'Expo Go' or 'Dev client'", "0 hand-copied verdict literals replacing the derived expectation"]
    - NEGATIVE_CONTROL: would fail if ["either sprint-01 spec still asserts the retired 'Expo Go'/'Dev client' strings — it would fail against the new markup and the source check catches it first", 'only one of the two files is updated — the per-file assertions fail']

**AC-6: GIVEN the built site with FAM-003's seven anchored family sections and**

  GIVEN/WHEN/THEN: GIVEN the built site with FAM-003's seven anchored family sections and the locked card-anatomy spec WHEN the locked FLOW-GEND-08 run_cmd executes against the preview THEN family cards render the live badge vocabulary — this task's secondary-owner proof that the Badge strings are live on /components cards; it goes green when the Badge strings land because the locked spec asserts those exact strings

  FLOW_REF: FLOW-GEND-08-family-card-anatomy · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/card-anatomy.spec.ts · TEST_FUNCTION: FLOW-GEND-08-family-card-anatomy
  VERIFY: `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy`
  VERIFICATION_SERVICE: built docs over astro preview + served /r/nativewind JSON · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_docs_site → MUST_OBSERVE ["exit 0, retries 0 on the locked run_cmd", "39 cards across the seven anchored family sections render the badge text 'runs in Expo Go' at HEAD (all expoGo:true)"] / MUST_NOT_OBSERVE ["0 cards with the short-string 'Expo Go' vocabulary as the verdict text", "0 cards with a plain-text (non-Badge) verdict element"]
    - NEGATIVE_CONTROL: would fail if ["the Badge VERDICTS strings revert or drift — the locked spec's exact-string card assertions fail", 'cards render plain-text verdicts instead of the Badge markup the locked spec targets', 'this task modifies the locked spec to force green — prohibited and detectable via scope gate']


### TEST CRITERIA

- **TC-1** (→AC-1, happy_path): The vitest source contract reads the real Badge.astro and asserts the VERDICTS record equals exactly 2 entries — 'expo-go' -> 'runs in Expo Go', 'dev-client' -> 'requires a dev client' — with the BadgeTone union unchanged. — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-badge-verdicts-map`
- **TC-2** (→AC-2, happy_path): The source contract asserts [item].astro imports Badge, renders it in the li[data-chip=expo] slot with tone from item.expoGo, and contains 0 occurrences of the old plain ternary. — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-item-page-badge-wiring`
- **TC-3** (→AC-3, happy_path): The source contract asserts the registry row template renders the Badge in td.ledger-verdict for all 56 manifest entries with 1 Badge import and tone from item.expoGo. — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-badge-rows`
- **TC-4** (→AC-3, error_handling): A regression to a second verdict path fails loudly: 0 occurrences of the verdictLabel identifier and 0 plain-text verdict cells in the row template are asserted, so neither can reappear silently. — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-badge-rows`
- **TC-5** (→AC-4, edge_case): All 17 non-component rows (count derived at run time from the manifest: 56 - 39) docsHref to `#row-${item.name}` with tr ids present, 0 /components#ui and 0 /components#lib hrefs in source, and the base URLs, generated-at-build note, and copy affordances survive the retarget. — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-row-anchors`
- **TC-6** (→AC-5, edge_case): Both sprint-01 spec files carry the updated vocabulary expectations with 0 retired short-string assertions and keep their run-time-derived (data-equality) expectation shape. — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-sprint01-vocabulary-updated`
- **TC-7** (→AC-6, happy_path): The locked FLOW-GEND-08-family-card-anatomy run_cmd exits 0 with retries 0 against the built site — the secondary-owner proof that the Badge vocabulary is live on all 39 /components cards. — `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy`

### READING LIST (max 5)

- apps/docs/src/pages/registry.astro [PRIMARY PATTERN] lines 28-36, 65-100 — The ledger manifest join the whole task hangs off, plus the two helpers being replaced — docsHref (lines 34-35, the /components#{family} form to retarget to #row- anchors) and verdictLabel (line 36, the plain-text form the Badge replaces); the row template where the Badge and tr ids land
- apps/docs/src/components/Badge.astro [component-under-edit] lines 8-23, 40-45 — The VERDICTS map (lines 17-20) holding the short strings to replace with the two locked state texts; the BadgeTone union and badge--{tone} class contract
- apps/docs/src/pages/components/[item].astro [component-under-edit] lines 79-84 — The chips row and specifically line 83 — the plain li[data-chip=expo] ternary the Badge replaces; the Badge import site
- tests/sprint-01-docs-spike-skeleton/ledger.spec.ts [superseded-spec] lines all — The verdictLabel-based row expectations being superseded — the exact assertions to update so lane and sprint-01 spec agree on the new vocabulary
- tests/sprint-02-shell-hero/dependency-panels.spec.ts [test-pattern] lines all — The sprint-02 data-equality pattern for the gate-step-4 playwright lane: run-time-derived expectations from the dataset, ENOENT-bridged artifact reads, per-row diffing over the preview origin

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/components/Badge.astro (MODIFY)
- apps/docs/src/pages/components/[item].astro (MODIFY)
- apps/docs/src/pages/registry.astro (MODIFY)
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY)
- tests/sprint-01-docs-spike-skeleton/ledger.spec.ts (MODIFY)
- tests/sprint-03-family-browse/verdict-contract.test.ts (NEW)
- tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts (NEW)
- tests/sprint-03-family-browse/card-anatomy.spec.ts
writeProhibited:
- apps/docs/src/pages/components/index.astro
- apps/docs/src/pages/index.astro
- .spec/prds/docs-site/tasks/sprint-03-family-browse/human-flows.json
- tests/sprint-02-shell-hero/**

### CODE PATTERN
- pattern: Two-layer proof: vitest source-contract ACs over the real working-tree files (exact VERDICTS map, Badge wiring in both surfaces, helper deletion, anchor retarget, sprint-01 vocabulary supersede) + one locked-flow e2e secondary ownership whose byte-identical run_cmd goes green because the strings landed; the browser lane remains gate evidence, not an AC proof object (source: apps/docs/src/pages/registry.astro:28-36 (ledger manifest join + helpers) and tests/sprint-02-shell-hero/dependency-panels.spec.ts (run-time-derived data-equality pattern for the gate lane))
- anti-pattern: per-page verdict strings; reading the served JSON for verdicts it does not carry; editing the locked FLOW-GEND-08 spec to force the secondary proof green
- references: ['apps/docs/src/components/Badge.astro:17-20 (VERDICTS short strings to replace)', 'apps/docs/src/pages/components/[item].astro:83 (plain li[data-chip=expo] ternary to replace)', 'apps/docs/src/pages/registry.astro:34-36 (docsHref + verdictLabel helpers), :88 (plain verdict cell), :16-18 (comment block describing the old ui/lib anchor scheme — update to describe in-page row anchors)', 'TR-07 component-detail R4, TR-07 registry R5']
- notes: ["Unit source-contract lane (vitest, node:fs reads of the real files, -t tokens per AC) proves the wiring; the locked FLOW-GEND-08 spec proves the vocabulary is live on cards without this task touching it; the playwright lane verdict-badge-wiring.spec.ts is gate-step-4 proof (39/39 item pages + 56/56 ledger rows Badge text/tone vs manifest with 0 mismatches, ≥10 sampled /r/nativewind/{item}.json returning 200 with matching name — item-identity anchor only, the served JSON carries no verdict field; record that boundary in the lane header). Badge.astro VERDICTS becomes { 'expo-go': 'runs in Expo Go', 'dev-client': 'requires a dev client' } — Badge is imported nowhere today (verified), so zero regression surface. [item].astro: import Badge, replace line 83's ternary li with the Badge in the li[data-chip=expo] slot, tone from item.expoGo. registry.astro: delete verdictLabel; render <Badge tone={...}/> in td.ledger-verdict; add id={`row-${item.name}`} to each tr; docsHref non-component branch returns `#row-${item.name}`; update the lines 16-18 comment; keep base URLs, note, and CopyButtons. Sprint-01 supersede edits land in the same change. RED evidence per the PR-gated-main pattern (SHELL-012 / Ruling 4): detached scratch checkout at the sprint-start commit + only the new specs — never a red spec merged to main."]

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01'] · provides: ['site-wide verdict-badge markup from the single manifest source'] · consumes: ['apps/docs/src/data/registry-items.json expoGo field (FUSE-05 enrichment)']

- verdict renders from the single manifest source — no second verdict data path anywhere
- FAM-005 is a SECONDARY owner of FLOW-GEND-08-family-card-anatomy — the locked spec file belongs to FAM-003's scope and is never modified here; this task's AC-6 goes green because the Badge strings land

### VERIFICATION GATES

- **AC-1** — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-badge-verdicts-map` → exit 0
- **AC-2** — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-item-page-badge-wiring` → exit 0
- **AC-3** — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-badge-rows` → exit 0
- **AC-4** — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-row-anchors` → exit 0
- **AC-5** — `pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-sprint01-vocabulary-updated` → exit 0
- **AC-6 (locked FLOW-GEND-08 secondary owner)** — `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy` → exit 0, retries 0 — byte-identical to the locked run_cmd; FAM-003 owns the primary
- **gate-step-4 browser proof (not an AC proof object)** — `pnpm playwright test tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts` → exit 0, retries 0 — 39/39 item pages and 56/56 ledger rows render a Badge whose exact text/tone match item.expoGo from registry-items.json (0 mismatches), 0 retired short-string verdict texts, 0 dead docs anchors, ≥10 sampled /r/nativewind/{item}.json return 200 with matching served name, base URLs + generated-at-build note + copy affordances intact
- **supersede-green (component-page)** — `pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts` → exit 0 — the updated expo-chip expectation passes against the new Badge markup
- **supersede-green (ledger)** — `pnpm playwright test tests/sprint-01-docs-spike-skeleton/ledger.spec.ts` → exit 0 — the updated verdict expectations pass against the Badge-rendered cells
- **typecheck** — `pnpm typecheck` → exit 0
- **lint** — `./node_modules/.bin/biome ci apps/docs/src/components/Badge.astro apps/docs/src/pages/components/[item].astro apps/docs/src/pages/registry.astro tests/sprint-01-docs-spike-skeleton/component-page.spec.ts tests/sprint-01-docs-spike-skeleton/ledger.spec.ts tests/sprint-03-family-browse/verdict-contract.test.ts tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts` → exit 0 (never pnpm lint — it crashes locally)
- **scope** — `git diff --name-only` → only the 7 write_allowed paths modified

### DEPENDENCIES
- Depends on: ['FAM-003'] · Blocks: ['FAM-006'] · Parallel: 

### CODING STANDARDS

- brain/docs/TDD-METHODOLOGY.md (RED → GREEN → REFACTOR per AC)
- brain/docs/TESTING-HIERARCHY.md (integration/e2e-first policy; the browser lane carries the integration proof at gate level)
- tests/harness/docs-preview.ts (navigateLocalhost + waitForAstroPageLoad — the only sanctioned navigation/wait helpers in the playwright lanes; never DOMContentLoaded)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FAM-005",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_dataset": {
   "description": "The FUSE-05 enriched manifest at apps/docs/src/data/registry-items.json, read at run time by the tests (ENOENT-bridged like sprint-01/02 lanes) \u2014 the single verdict oracle and the source of the 56-row / 39-component / 17-non-component counts.",
   "seed_method": "public_api",
   "records": [
    "56 items in registry-items.json; 39 registry:component all expoGo:true at HEAD",
    "served /r/nativewind/*.json carries no verdict field",
    "Badge strings 'runs in Expo Go'/'requires a dev client'"
   ]
  },
  "built_docs_site": {
   "description": "The ordered build chain output (registry:build, gallery:manifest, docs build \u2014 post-FAM-003 /components rework with the seven anchored family sections and card-anatomy.spec.ts landed) served by the Playwright webServer at http://localhost:4321.",
   "seed_method": "ui_flow",
   "records": [
    "build exit 0; preview serves /components family sections (39 cards), /registry (56 rows), and /r/nativewind/{item}.json at 200"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "description": "GIVEN the working tree with apps/docs/src/components/Badge.astro WHEN the vitest source contract reads the component and extracts the VERDICTS record THEN it equals exactly the two locked state texts keyed by tone",
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/verdict-contract.test.ts",
   "test_function": "FAM-005-badge-verdicts-map",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-badge-verdicts-map",
   "test_tier": "unit",
   "verification_service": "real working-tree source file read via node:fs under vitest (no mocks)",
   "surface_policy": null,
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "verification_service": "real working-tree source file read via node:fs under vitest",
    "negative_control": {
     "would_fail_if": [
      "the VERDICTS map keeps either short string \u2014 the exact-map equality fails",
      "a third tone or renamed key is introduced \u2014 the record shape check fails",
      "the test reads a fixture copy instead of the real file (static shell)"
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
       "actor": "test_runner",
       "steps": [
        "read apps/docs/src/components/Badge.astro from the working tree",
        "extract the VERDICTS record and the BadgeTone union, assert exact equality"
       ]
      },
      "end_state": {
       "must_observe": [
        "2 VERDICTS entries: 'expo-go' -> 'runs in Expo Go' and 'dev-client' -> 'requires a dev client'",
        "BadgeTone union still exactly 'expo-go' | 'dev-client'"
       ],
       "must_not_observe": [
        "0 short-string values ('Expo Go' or bare 'dev-client') in the VERDICTS map",
        "0 tones beyond the two locked ones"
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
   "description": "GIVEN the working tree with apps/docs/src/pages/components/[item].astro WHEN the vitest source contract reads the page template THEN it imports Badge and renders it in the li[data-chip=expo] slot with tone derived from item.expoGo, and the old plain-text ternary is gone",
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/verdict-contract.test.ts",
   "test_function": "FAM-005-item-page-badge-wiring",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-item-page-badge-wiring",
   "test_tier": "unit",
   "verification_service": "real working-tree source file read via node:fs under vitest (no mocks)",
   "surface_policy": null,
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "verification_service": "real working-tree source file read via node:fs under vitest",
    "negative_control": {
     "would_fail_if": [
      "the Badge import or the tone-from-expoGo binding is missing \u2014 the source pattern check fails",
      "the old ternary li survives beside the Badge \u2014 the absence check fails",
      "the tone is hand-selected per page instead of derived from item.expoGo"
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
       "actor": "test_runner",
       "steps": [
        "read apps/docs/src/pages/components/[item].astro from the working tree",
        "assert the Badge import, the li[data-chip=expo] slot content, and the tone expression"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 Badge import from the shared component, rendered inside the li[data-chip=expo] slot",
        "tone bound to item.expoGo ('expo-go' : 'dev-client') \u2014 the one template all 39 registry:component pages build from"
       ],
       "must_not_observe": [
        "0 occurrences of the plain ternary {item.expoGo ? 'Expo Go' : 'Dev client'}",
        "0 per-page verdict strings outside the Badge"
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
   "description": "GIVEN the working tree with apps/docs/src/pages/registry.astro and the 56-item manifest WHEN the vitest source contract reads the ledger template THEN every mapped row renders the Badge inside td.ledger-verdict with tone from item.expoGo and the verdictLabel helper is deleted",
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/verdict-contract.test.ts",
   "test_function": "FAM-005-registry-badge-rows",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-badge-rows",
   "test_tier": "unit",
   "verification_service": "real working-tree source file read via node:fs under vitest (no mocks)",
   "surface_policy": null,
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "verification_service": "real working-tree source file read via node:fs under vitest",
    "negative_control": {
     "would_fail_if": [
      "any row path renders plain text instead of the Badge \u2014 the template pattern check fails",
      "verdictLabel survives as a second verdict path \u2014 the identifier absence check fails"
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
       "actor": "test_runner",
       "steps": [
        "read apps/docs/src/pages/registry.astro from the working tree",
        "assert the td.ledger-verdict cell renders <Badge> inside the ledger.map row template covering all 56 manifest entries, and grep for verdictLabel"
       ]
      },
      "end_state": {
       "must_observe": [
        "56/56 rows render the Badge \u2014 the single ledger.map row template covers every manifest entry (56 read from registry-items.json at run time) with td.ledger-verdict containing <Badge tone={item.expoGo ? 'expo-go' : 'dev-client'}>",
        "1 Badge import in registry.astro"
       ],
       "must_not_observe": [
        "0 plain-text verdict cells in the row template",
        "0 occurrences of the verdictLabel identifier anywhere in the file"
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
   "description": "GIVEN the working tree with registry.astro and the manifest's 17 non-component rows WHEN the vitest source contract reads docsHref and the row template THEN each tr carries id={`row-${item.name}`} and the docsHref non-component branch returns the in-page #row- anchor \u2014 no /components#ui|#lib href remains in source",
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/verdict-contract.test.ts",
   "test_function": "FAM-005-registry-row-anchors",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-row-anchors",
   "test_tier": "unit",
   "verification_service": "real working-tree source file read via node:fs under vitest (no mocks)",
   "surface_policy": null,
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "verification_service": "real working-tree source file read via node:fs under vitest",
    "negative_control": {
     "would_fail_if": [
      "any href still targets the removed /components#ui or /components#lib anchor \u2014 the source grep fails",
      "a row id is missing or misspelled \u2014 the id-template check fails and the anchor dangles",
      "the retarget drops a base URL, the build note, or a copy affordance \u2014 the presence checks fail"
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
       "actor": "test_runner",
       "steps": [
        "read apps/docs/src/pages/registry.astro; evaluate the docsHref helper shape and the tr id template",
        "count manifest non-component entries at run time (17 at HEAD: 56 - 39) and grep the source for legacy anchors and surviving affordances"
       ]
      },
      "end_state": {
       "must_observe": [
        "17/17 non-component rows anchor via docsHref returning `#row-${item.name}` (count derived from the manifest at run time); component rows keep `/components/${item.name}`",
        "tr id={`row-${item.name}`} present on the row template; both engine base URLs, the generated-at-build note, and the per-row CopyButton still present in source"
       ],
       "must_not_observe": [
        "0 /components#ui hrefs in source",
        "0 /components#lib (or any /components#{family}) hrefs in source"
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
   "id": "AC-5",
   "description": "GIVEN the two sprint-01 spec files in the working tree WHEN the vitest source contract reads their expectation blocks THEN both carry the updated Badge vocabulary expectations and neither pins the retired short strings",
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/verdict-contract.test.ts",
   "test_function": "FAM-005-sprint01-vocabulary-updated",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-sprint01-vocabulary-updated",
   "test_tier": "unit",
   "verification_service": "real working-tree source files read via node:fs under vitest (no mocks)",
   "surface_policy": null,
   "scenario": {
    "tier": "visible",
    "test_tier": "unit",
    "verification_service": "real working-tree source files read via node:fs under vitest",
    "negative_control": {
     "would_fail_if": [
      "either sprint-01 spec still asserts the retired 'Expo Go'/'Dev client' strings \u2014 it would fail against the new markup and the source check catches it first",
      "only one of the two files is updated \u2014 the per-file assertions fail"
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
       "actor": "test_runner",
       "steps": [
        "read tests/sprint-01-docs-spike-skeleton/component-page.spec.ts and tests/sprint-01-docs-spike-skeleton/ledger.spec.ts from the working tree",
        "assert the expo-chip / verdict expectations reference the new vocabulary ('runs in Expo Go', 'requires a dev client', or the Badge-derived helper) and grep for the retired strings"
       ]
      },
      "end_state": {
       "must_observe": [
        "2 spec files updated \u2014 component-page.spec.ts's expo-chip expectation and ledger.spec.ts's verdict expectations reference the new vocabulary",
        "2 spec files derive expected verdict text from registry-items.json at run time (0 hand-copied literals; supersede keeps the data-equality shape)"
       ],
       "must_not_observe": [
        "0 expectations pinning the exact short strings 'Expo Go' or 'Dev client'",
        "0 hand-copied verdict literals replacing the derived expectation"
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
   "id": "AC-6",
   "description": "GIVEN the built site with FAM-003's seven anchored family sections and the locked card-anatomy spec WHEN the locked FLOW-GEND-08 run_cmd executes against the preview THEN family cards render the live badge vocabulary \u2014 this task's secondary-owner proof that the Badge strings are live on /components cards; it goes green when the Badge strings land because the locked spec asserts those exact strings",
   "primary": false,
   "flow_ref": "FLOW-GEND-08-family-card-anatomy",
   "test_file": "tests/sprint-03-family-browse/card-anatomy.spec.ts",
   "test_function": "FLOW-GEND-08-family-card-anatomy",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy",
   "test_tier": "e2e",
   "verification_service": "built docs over astro preview + served /r/nativewind JSON",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "built docs over astro preview + served /r/nativewind JSON",
    "negative_control": {
     "would_fail_if": [
      "the Badge VERDICTS strings revert or drift \u2014 the locked spec's exact-string card assertions fail",
      "cards render plain-text verdicts instead of the Badge markup the locked spec targets",
      "this task modifies the locked spec to force green \u2014 prohibited and detectable via scope gate"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_docs_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked command byte-for-byte: pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit 0, retries 0 on the locked run_cmd",
        "39 cards across the seven anchored family sections render the badge text 'runs in Expo Go' at HEAD (all expoGo:true)"
       ],
       "must_not_observe": [
        "0 cards with the short-string 'Expo Go' vocabulary as the verdict text",
        "0 cards with a plain-text (non-Badge) verdict element"
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
   "type": "happy_path",
   "description": "The vitest source contract reads the real Badge.astro and asserts the VERDICTS record equals exactly 2 entries \u2014 'expo-go' -> 'runs in Expo Go', 'dev-client' -> 'requires a dev client' \u2014 with the BadgeTone union unchanged.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-badge-verdicts-map"
  },
  {
   "id": "TC-2",
   "type": "happy_path",
   "description": "The source contract asserts [item].astro imports Badge, renders it in the li[data-chip=expo] slot with tone from item.expoGo, and contains 0 occurrences of the old plain ternary.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-item-page-badge-wiring"
  },
  {
   "id": "TC-3",
   "type": "happy_path",
   "description": "The source contract asserts the registry row template renders the Badge in td.ledger-verdict for all 56 manifest entries with 1 Badge import and tone from item.expoGo.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-badge-rows"
  },
  {
   "id": "TC-4",
   "type": "error_handling",
   "description": "A regression to a second verdict path fails loudly: 0 occurrences of the verdictLabel identifier and 0 plain-text verdict cells in the row template are asserted, so neither can reappear silently.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-badge-rows"
  },
  {
   "id": "TC-5",
   "type": "edge_case",
   "description": "All 17 non-component rows (count derived at run time from the manifest: 56 - 39) docsHref to `#row-${item.name}` with tr ids present, 0 /components#ui and 0 /components#lib hrefs in source, and the base URLs, generated-at-build note, and copy affordances survive the retarget.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-registry-row-anchors"
  },
  {
   "id": "TC-6",
   "type": "edge_case",
   "description": "Both sprint-01 spec files carry the updated vocabulary expectations with 0 retired short-string assertions and keep their run-time-derived (data-equality) expectation shape.",
   "maps_to_ac": "AC-5",
   "verify": "pnpm vitest run tests/sprint-03-family-browse/verdict-contract.test.ts -t FAM-005-sprint01-vocabulary-updated"
  },
  {
   "id": "TC-7",
   "type": "happy_path",
   "description": "The locked FLOW-GEND-08-family-card-anatomy run_cmd exits 0 with retries 0 against the built site \u2014 the secondary-owner proof that the Badge vocabulary is live on all 39 /components cards.",
   "maps_to_ac": "AC-6",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy"
  }
 ]
}
-->

</details>
