<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-001: RED-first locked-flow lane specs (8 flows, flow-id-verbatim filenames) + riding specs with evidence plumbing

> Status: ⬜ Pending
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 3 · Type: FEATURE · Wave: A
> Proposed By: astro-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Author the entire sprint-04 browser lane RED-first as the flow-primary owner: the eight locked flow specs plus four riding specs, all conforming, running over the built dist, failing for their named sprint-04 anatomy reasons, with evidence writers plumbed and verbatim RED proofs captured per flow.

## Why
Each locked run_cmd executes its authored spec under all three projects and exits 1 naming the sprint-04 anatomy absent from the served DOM; every <FLOW-ID>.red is fresh with red_proof_ok true; the lane is the RED baseline REF-006/REF-009/REF-010 turn green.

## How to verify
pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy

## Scope
tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts (NEW); tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts (NEW); tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts (NEW); tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts (NEW); tests/sprint-04-generated-reference/props-table-generated.spec.ts (NEW); tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts (NEW); tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts (NEW); tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts (NEW); tests/sprint-04-generated-reference/qr-panel.spec.ts (NEW); tests/sprint-04-generated-reference/dev-client-matrix.spec.ts (NEW); tests/sprint-04-generated-reference/site-crawl.spec.ts (NEW); tests/sprint-04-generated-reference/preview-omission-nojs.spec.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-001 — required reading for implementer + reviewer)</summary>

TASK: REF-001 — RED-first locked-flow lane specs (8 flows, flow-id-verbatim filenames) + riding specs with evidence plumbing
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 3
AGENT: implementer=astro-implementer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/13 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: each flow spec's run_cmd is byte-for-byte its locked human-flows.json command: pnpm playwright test tests/sprint-04-generated-reference/<flow-suffix>.spec.ts --grep <FLOW-ID>
- MUST: every flow spec opens with the shared anatomy preamble asserting the top-level section[data-section] order install,source,props,theming,usage across all 39 component pages, 0 preview-panel elements, and the pager in-family
- MUST: every expectation derives at module scope from real src/data via the ENOENT-bridged readJson pattern — names, family memberships, peers, and served /r/{engine}/{item}.json dependency/files fields are read, never hand-typed
- MUST: each spec embeds a writeEvidence-style writer firing on pass to its exact locked artifact path .tmp/sprint-04-generated-reference/e2e-evidence/<id>.json
- MUST: each of the eight flows gets a RED capture via: python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-04-generated-reference --flow <FLOW-ID> --expect red
- NEVER: never run against astro dev, never background a preview server manually — the Playwright webServer owns serving
- NEVER: never hard-code the 39 names, family counts, command literals, or QR/matrix expectations — dataset changes must move the specs
- NEVER: never use fixtures, mocks, or page echoes as oracle; never assert through page.evaluate instead of locator/DOM reads
- NEVER: never skip, guard, or single-project a test — all specs run unguarded under chromium-desktop, chromium-mobile, and chromium-nojs with retries 0
- STRICTLY: strictly scope writes to the twelve enumerated spec files (NEW) — playwright.config.ts, tests/harness/, and every other lane stay untouched
- STRICTLY: strictly lint via ./node_modules/.bin/biome ci tests/sprint-04-generated-reference — pnpm lint crashes locally

### DONE WHEN

- [ ] AC 1: FLOW-GEND-14 primary — anatomy spec authored, RED naming the missing five-section order
- [ ] AC 2: FLOW-GEND-15 primary — family-pager spec authored over the families.json oracle
- [ ] AC 3: FLOW-GEND-20 primary — exact-absolute-URL copy spec authored over the locked regex
- [ ] AC 4: FLOW-GEND-21 primary — dependency-panel peers spec authored against live-served /r JSON
- [ ] AC 5: FLOW-GEND-34 primary — props-table spec authored, RED naming 0 tables
- [ ] AC 6: FLOW-GEND-35 primary — byte-identical Code-view spec authored, RED naming 0 code views
- [ ] AC 7: FLOW-SHELL-13 primary — engine-tab persistence spec authored beyond sprint-02 green
- [ ] AC 8: FLOW-SHELL-14 primary — initial-HTML tab-panels spec authored
- [ ] AC 9: Locked anatomy run_cmd executes the authored spec in all three projects over the built dist
- [ ] AC 10: Anatomy clause set is RED for the named reason — the five-section order vs the sprint-02 remainder
- [ ] AC 11: Riding specs authored under pinned describe tokens, RED on their named absent surfaces, writers plumbed
- [ ] AC 12: Per-flow RED proofs captured fresh via run_flow.py --expect red
- [ ] AC 13: All eight flow specs RED through the shared anatomy markers, isolating the lane from other lanes
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: FLOW-GEND-14 primary — anatomy spec authored, RED naming the missing five-section order [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the sprint-start build served by the pnpm e2e:docs webServer where pages render only install then source WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy) THEN the authored spec runs over the built dist in all three projects, exits 1 naming the expected order install,source,props,theming,usage against the received two-section DOM, and its RED is captured in FLOW-GEND-14-reference-page-anatomy.red

  FLOW_REF: FLOW-GEND-14-reference-page-anatomy · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts · TEST_FUNCTION: FLOW-GEND-14-reference-page-anatomy
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`
  VERIFICATION_SERVICE: built dist over astro preview + Chromium (desktop/mobile/nojs) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_preview_sprint04_start → MUST_OBSERVE [spec file exists at tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts exporting 1 test titled 'FLOW-GEND-14-reference-page-anatomy'; exit code 1 with the diff pinning expected ['install','source','props','theming','usage'] against received ['install','source']; preview_panels == 0 asserted as a standing clause; .red captured fresh (>0 bytes) at .tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-14-reference-page-anatomy.red] / MUST_NOT_OBSERVE [0 passing assertions against the unshipped anatomy; 0 page.evaluate-based assertions; an absent or 0-byte .red]
    - NEGATIVE_CONTROL: would fail if ['the spec is a static shell hand-writing one demo page — the 39-page dataset loop fails', 'the clause set only re-asserts sprint-02 behavior — the spec passes vacuously against the 2-section remainder', 'the anatomy expectation is a mock fixture instead of the dataset-derived order — a dataset change leaves the spec unchanged']

**AC-2: FLOW-GEND-15 primary — family-pager spec authored over the families.json oracle [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the sprint-start build with the within-family pager already shipping and families.json committing 7 families with counts 3/7/6/7/4/1/11 WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family) THEN the authored spec derives each family's member set from families.json, asserts set(pages_reachable_via_pager) == set(family_members) with every pager href 200 in dist/, and exits 1 through the shared anatomy preamble

  FLOW_REF: FLOW-GEND-15-family-pager-stays-in-family · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts · TEST_FUNCTION: FLOW-GEND-15-family-pager-stays-in-family
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family`
  VERIFICATION_SERVICE: built dist over astro preview + Chromium (desktop/mobile/nojs) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE [spec file exists exporting 1 test titled 'FLOW-GEND-15-family-pager-stays-in-family' deriving 7 families with counts 3/7/6/7/4/1/11; exit code 1 through the anatomy preamble naming the expected 5-section order; .red captured fresh (>0 bytes) at the locked path] / MUST_NOT_OBSERVE [0 passing assertions against the unshipped anatomy; 0 page.evaluate-based assertions; a pager-href probe returning non-200 left unasserted]
    - NEGATIVE_CONTROL: would fail if ['the pager expectation is hardcoded names instead of the families.json join — a dataset change leaves it stale', 'an empty dataset collapses the walk to 0 assertions (vacuous pass)', 'the spec is a static stub asserting one hand-picked family — the 7-family loop fails']

**AC-3: FLOW-GEND-20 primary — exact-absolute-URL copy spec authored over the locked regex [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the sprint-start build with the engine-tabbed install block shipping since sprint-02 WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy) THEN the authored spec enumerates the 39 pages from the dataset and asserts per engine tab a one-click clipboard copy matching the locked regex with the displayed text equal to the clipboard, exiting 1 through the shared anatomy preamble

  FLOW_REF: FLOW-GEND-20-exact-absolute-url-command-copy · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts · TEST_FUNCTION: FLOW-GEND-20-exact-absolute-url-command-copy
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy`
  VERIFICATION_SERVICE: built dist over astro preview + Chromium (desktop/mobile/nojs) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_preview_sprint04_start → MUST_OBSERVE [spec file exists exporting 1 test titled 'FLOW-GEND-20-exact-absolute-url-command-copy' embedding the literal regex ^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$; exit code 1 through the anatomy preamble naming the expected 5-section order; .red captured fresh (>0 bytes) at the locked path] / MUST_NOT_OBSERVE [0 passing assertions against the unshipped anatomy; 0 page.evaluate-based assertions; 0 short-name or un-tabbed duplicate forms left unasserted]
    - NEGATIVE_CONTROL: would fail if ['a short-name or relative form is served — the locked regex fails', 'the clipboard read is mocked with a page echo instead of the granted real clipboard — display/clipboard equality is faked', 'a static stub copies one canned command — the 39-page loop fails']

**AC-4: FLOW-GEND-21 primary — dependency-panel peers spec authored against live-served /r JSON [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the sprint-start build with DependencyPanel shipping and the same origin serving /r/nativewind/*.json WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers) THEN the authored spec asserts panels equal registry dependencies plus engine-resolved registryDependencies plus the site-facts AI SDK peer, matches >=5 sampled panels against the live-served dependency fields with 0 invented or dropped entries, and exits 1 through the shared anatomy preamble

  FLOW_REF: FLOW-GEND-21-dependency-panel-peers · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts · TEST_FUNCTION: FLOW-GEND-21-dependency-panel-peers
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers`
  VERIFICATION_SERVICE: built dist over astro preview + Chromium (desktop/mobile/nojs) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE [spec file exists exporting 1 test titled 'FLOW-GEND-21-dependency-panel-peers' reading aiSdkPeers from site-facts.json (the peers entry 'ai'); the sampled-panel clause pins >=5 items fetched from http://localhost:4321/r/nativewind/{item}.json; exit code 1 through the anatomy preamble naming the expected 5-section order; .red captured fresh (>0 bytes) at the locked path] / MUST_NOT_OBSERVE [0 passing assertions against the unshipped anatomy; 0 page.evaluate-based assertions; 0 invented-or-dropped-entry guards missing from the clause set]
    - NEGATIVE_CONTROL: would fail if ['the panel oracle is a mock fixture instead of the live-served /r/nativewind/*.json dependency fields — drift goes undetected', 'a static stub checks one hand-picked panel — the >=5 sampled-panel clause fails', 'an invented or dropped entry passes — the set-equality assert fails']

**AC-5: FLOW-GEND-34 primary — props-table spec authored, RED naming 0 tables [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the sprint-start build where no page renders a props table while all 39 dataset entries carry non-empty props[] WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated) THEN the authored spec asserts 39 tables with Name/Type/Default/Description headers and dataset-equal type cells, exiting 1 with props_tables == 0 against the expected 39

  FLOW_REF: FLOW-GEND-34-props-table-generated · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/props-table-generated.spec.ts · TEST_FUNCTION: FLOW-GEND-34-props-table-generated
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated`
  VERIFICATION_SERVICE: built dist over astro preview + Chromium (desktop/mobile/nojs) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE [spec file exists exporting 1 test titled 'FLOW-GEND-34-props-table-generated' deriving expected counts from the dataset (39 tables, conversation 5 rows); exit code 1 with the diff naming props_tables expected 39 / received 0; .red captured fresh (>0 bytes) at the locked path] / MUST_NOT_OBSERVE [0 passing assertions against the unshipped anatomy; 0 page.evaluate-based assertions; a vacuous green over 0 tables]
    - NEGATIVE_CONTROL: would fail if ['a static shell renders one canned table — the 39-page loop fails', "types are asserted loosely so 'any' or 'unknown' placeholders pass — the resolved-text clause fails", 'an empty dataset collapses the loop to 0 tables asserted (vacuous pass)']

**AC-6: FLOW-GEND-35 primary — byte-identical Code-view spec authored, RED naming 0 code views [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the sprint-start build rendering bare source sections with no Code-view contract and the same origin serving /r/nativewind/{item}.json WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source) THEN the authored spec samples the multi-file items and byte-compares their Code-view text against the served files[].text, exiting 1 with code_views == 0 for the sampled items

  FLOW_REF: FLOW-GEND-35-code-view-byte-identical-to-shipped-source · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts · TEST_FUNCTION: FLOW-GEND-35-code-view-byte-identical-to-shipped-source
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source`
  VERIFICATION_SERVICE: built dist over astro preview + Chromium (desktop/mobile/nojs) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE [spec file exists exporting 1 test titled 'FLOW-GEND-35-code-view-byte-identical-to-shipped-source' sampling >=5 multi-file items; exit code 1 with the diff naming code_views expected >=5 / received 0; .red captured fresh (>0 bytes) at the locked path] / MUST_NOT_OBSERVE [0 passing assertions against the unshipped anatomy; 0 page.evaluate-based assertions; a byte compare that silently normalizes the served text]
    - NEGATIVE_CONTROL: would fail if ['the byte oracle is a mock of the /r endpoint — a source drift goes undetected (injection mode)', 'the compare normalizes whitespace — 0 normalization diffs is asserted against raw bytes', 'a static stub checks one single-file item — the >=5 multi-file sampling clause fails']

**AC-7: FLOW-SHELL-13 primary — engine-tab persistence spec authored beyond sprint-02 green [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the sprint-start build with the engine tab group under storage-key rnr-engine already green from sprint-02 WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages) THEN the authored spec asserts uniwind persistence across a soft navigation and a hard load with 0 engine state in any URL, exiting 1 through the shared anatomy preamble

  FLOW_REF: FLOW-SHELL-13-engine-tab-persists-across-pages · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts · TEST_FUNCTION: FLOW-SHELL-13-engine-tab-persists-across-pages
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages`
  VERIFICATION_SERVICE: built dist over astro preview + Chromium (desktop/mobile/nojs) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_preview_sprint04_start → MUST_OBSERVE [spec file exists exporting 1 test titled 'FLOW-SHELL-13-engine-tab-persists-across-pages' using the literal localStorage key 'rnr-engine'; exit code 1 through the anatomy preamble naming the expected 5-section order; .red captured fresh (>0 bytes) at the locked path] / MUST_NOT_OBSERVE [0 passing assertions against the unshipped anatomy; 0 page.evaluate-based assertions; 0 URL-purity guards in the clause set]
    - NEGATIVE_CONTROL: would fail if ['persistence is asserted by direct state injection (view-injection) instead of the real localStorage read after a hard load', 'engine state leaks into a URL — the URL-purity clause fails', 'the spec only re-asserts sprint-02 clauses — it stays green and the anatomy preamble is absent']

**AC-8: FLOW-SHELL-14 primary — initial-HTML tab-panels spec authored [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the sprint-start build serving raw pre-JS HTML with both engine panels server-rendered WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html) THEN the authored spec asserts both engine URL literals in the served bytes and the no-JS stacked render, exiting 1 through the shared anatomy preamble

  FLOW_REF: FLOW-SHELL-14-tab-panels-in-initial-html · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts · TEST_FUNCTION: FLOW-SHELL-14-tab-panels-in-initial-html
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html`
  VERIFICATION_SERVICE: built dist over astro preview + Chromium (desktop/mobile/nojs) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_preview_sprint04_start → MUST_OBSERVE [spec file exists exporting 1 test titled 'FLOW-SHELL-14-tab-panels-in-initial-html' probing both literals 'https://rnraielements.com/r/nativewind/' and 'https://rnraielements.com/r/uniwind/'; exit code 1 through the anatomy preamble naming the expected 5-section order; .red captured fresh (>0 bytes) at the locked path] / MUST_NOT_OBSERVE [0 passing assertions against the unshipped anatomy; 0 page.evaluate-based assertions; 0 no-JS stacked-panel clauses in the spec]
    - NEGATIVE_CONTROL: would fail if ['the literal probe reads a mocked response instead of the served bytes — a client-rendered regression goes undetected', 'only the active engine is probed — one literal count stays 0 undetected', 'a static stub serves one canned page — the multi-page literal loop fails']

**AC-9: Locked anatomy run_cmd executes the authored spec in all three projects over the built dist**

  GIVEN/WHEN/THEN: GIVEN the authored lane at task completion with the sprint-start build served by the pnpm e2e:docs webServer at localhost:4321 WHEN the locked FLOW-GEND-14 run_cmd executes THEN the run attempts the anatomy test in chromium-desktop, chromium-mobile, and chromium-nojs with 0 skipped tests in the summary

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts · TEST_FUNCTION: FLOW-GEND-14-reference-page-anatomy
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`
  VERIFICATION_SERVICE: real Playwright run over the built dist via the pnpm e2e:docs webServer at localhost:4321 · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Authorship-behavior contract over the spec file this task itself authors — the run must execute the lane it ships; the flow-primary RED proof is AC-1 and the green proof belongs to REF-009.
  SCENARIO:
    - START_REF built_preview_sprint04_start → MUST_OBSERVE [attempt lines for 3 of 3 projects: chromium-desktop, chromium-mobile, chromium-nojs; 0 skipped tests in the run summary; exactly 1 spec file selected: tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts] / MUST_NOT_OBSERVE [0 attempt lines for chromium-nojs (skip signature); a webServer startup failure or ENOENT on src/data replacing the anatomy assertion failure]
    - NEGATIVE_CONTROL: would fail if ['the spec file is absent or misnamed so the run_cmd selects 0 tests', 'a project guard omits chromium-nojs — the nojs attempt line is deleted from the summary', 'the spec disconnects from the webServer and backgrounds its own astro dev server']

**AC-10: Anatomy clause set is RED for the named reason — the five-section order vs the sprint-02 remainder**

  GIVEN/WHEN/THEN: GIVEN the anatomy spec pinning top-level section[data-section] order install,source,props,theming,usage, 0 preview-panel elements, and pager-in-family, against the sprint-start DOM that renders only install then source WHEN the locked FLOW-GEND-14 run_cmd executes THEN the run exits 1 with a failure diff naming the expected five-section order against the received two-section reality

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts · TEST_FUNCTION: FLOW-GEND-14-reference-page-anatomy
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`
  VERIFICATION_SERVICE: real Playwright run over the sprint-start built dist with the real dataset-derived expectation · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: RED-reason contract over the authored spec's own run output — the clause must fail through the missing anatomy, proving it extends beyond already-green sprint-02 behavior.
  SCENARIO:
    - START_REF built_preview_sprint04_start → MUST_OBSERVE [exit code 1; the diff pins expected order ['install','source','props','theming','usage']; the received array names 'install' followed by 'source' on all 39 pages] / MUST_NOT_OBSERVE [exit 0 at RED (vacuous pass against the sprint-02 remainder); a diff naming 0 sections (navigation failure masquerading as the contract)]
    - NEGATIVE_CONTROL: would fail if ['the clause set only re-asserts sprint-02 behavior — the spec passes vacuously against the 2-section remainder (exit 0)', 'the expected order is hardcoded without reading the dataset — a dataset change leaves the spec stale', 'the failure is a disconnected harness error (timeout, navigation) instead of the section-order assertion']

**AC-11: Riding specs authored under pinned describe tokens, RED on their named absent surfaces, writers plumbed**

  GIVEN/WHEN/THEN: GIVEN the four riding specs authored under the lane — qr-panel.spec.ts (T-GEND-017-qr-panel), dev-client-matrix.spec.ts (T-GEND-020-dev-client-matrix), site-crawl.spec.ts (T-GEND-016-site-crawl), preview-omission-nojs.spec.ts (T-GEND-021-preview-omission-nojs) — each deriving its expectation from the real dataset WHEN the pinned qr-panel run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/qr-panel.spec.ts --grep T-GEND-017-qr-panel) THEN the run exits 1 naming qr_panel_count 0 against the dataset-derived expectation of 39

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/qr-panel.spec.ts · TEST_FUNCTION: T-GEND-017-qr-panel
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/qr-panel.spec.ts --grep T-GEND-017-qr-panel`
  VERIFICATION_SERVICE: real Playwright run over the sprint-start built dist with the registry-dataset-derived QR count expectation · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Authorship-behavior contract over a riding spec this task authors — it must run over the built dist and fail through the named absent surface; the QrPanel green proof belongs to REF-005.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE [exit code 1; qr_panel_count == 0 in the failure diff against expected 39; the spec's writer targets the literal path .tmp/sprint-04-generated-reference/e2e-evidence/T-GEND-017-qr-panel.json] / MUST_NOT_OBSERVE [a passing loop over 0 panels (vacuous green); 0 evidence-writer references in the spec source]
    - NEGATIVE_CONTROL: would fail if ['the riding spec is a stub shell with no dataset-derived count — it passes against 0 panels vacuously', 'the expectation is a hardcoded 39 instead of the dataset length — a dataset change leaves it stale', 'the evidence writer is omitted — the locked artifact path is never written']

**AC-12: Per-flow RED proofs captured fresh via run_flow.py --expect red**

  GIVEN/WHEN/THEN: GIVEN the eight authored flow specs each failing for its named sprint-04 reason WHEN python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-04-generated-reference --flow <FLOW-ID> --expect red runs for each of the eight flows THEN each invocation exits 0 with red_proof_ok true and a fresh .tmp/sprint-04-generated-reference/e2e-evidence/<FLOW-ID>.red

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts · TEST_FUNCTION: FLOW-GEND-35-code-view-byte-identical-to-shipped-source
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source`
  VERIFICATION_SERVICE: brain gate-evidence run_flow.py re-executing the locked run_cmd over the real tree and built dist · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Evidence-plumbing contract over this task's own lane — the gate-evidence tool must reproduce each spec's RED run from the locked command.
  SCENARIO:
    - START_REF built_preview_sprint04_start → MUST_OBSERVE [the run_cmd exits 1 with code_views == 0 named for the sampled items; run_flow.py exits 0 with red_proof_ok: true; the .red artifact is fresh (>0 bytes) at the locked path] / MUST_NOT_OBSERVE [exit 0 from the run_cmd (RED is the deliverable — no vacuous pass); an absent or 0-byte .red for any of the 8 flows]
    - NEGATIVE_CONTROL: would fail if ['a flow spec passes at sprint start — run_flow.py --expect red cannot produce a red proof', 'the red proof is an empty or 0-byte paraphrase instead of the captured run', "a spec's run_cmd drifts from the locked human-flows.json command — cmd_sha mismatches (wrong constant)"]

**AC-13: All eight flow specs RED through the shared anatomy markers, isolating the lane from other lanes**

  GIVEN/WHEN/THEN: GIVEN each of the eight flow specs opens with the shared sprint-04 anatomy preamble and the sprint-01/02/03 lane specs exist unmodified WHEN the locked FLOW-SHELL-13 run_cmd executes THEN the run exits 1 through the shared anatomy clause while git diff --name-only lists 0 files outside tests/sprint-04-generated-reference/

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts · TEST_FUNCTION: FLOW-SHELL-13-engine-tab-persists-across-pages
  VERIFY: `pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages`
  VERIFICATION_SERVICE: real Playwright run over the sprint-start built dist plus a real git working-tree diff · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Boundary-behavior contract over this task's own lane — the engine-tab spec must extend beyond sprint-02's already-green persistence clauses via the anatomy preamble, and the task must touch no other lane.
  SCENARIO:
    - START_REF built_preview_sprint04_start → MUST_OBSERVE [exit code 1 with the failure naming the expected order ['install','source','props','theming','usage']; the spec retains the literal localStorage key 'rnr-engine' in its persistence clauses; git diff --name-only lists 0 files outside tests/sprint-04-generated-reference/] / MUST_NOT_OBSERVE [exit 0 from a spec that only re-asserts the green sprint-02 engine clauses; any modified file under tests/sprint-01-docs-spike-skeleton/, tests/sprint-02-shell-hero/, or tests/sprint-03-family-browse/]
    - NEGATIVE_CONTROL: would fail if ['a flow spec omits the anatomy preamble and passes against sprint-02-only behavior (exit 0)', 'an edit lands in tests/sprint-02-shell-hero/ or tests/sprint-03-family-browse/ — the diff shows foreign-lane files', 'the spec asserts engine persistence through a page echo (static mock) instead of the real localStorage key']

### TEST CRITERIA

- **TC-1** (→AC-1): reference-page-anatomy.spec.ts exists exporting the FLOW-GEND-14-titled test and exits 1 naming the five-section order with a fresh .red. — `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`
- **TC-2** (→AC-2): family-pager-stays-in-family.spec.ts derives 7 families (3/7/6/7/4/1/11) from families.json and exits 1 through the anatomy preamble. — `pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family`
- **TC-3** (→AC-3): exact-absolute-url-command-copy.spec.ts embeds the locked regex and enumerates 39 pages, exiting 1 through the anatomy preamble. — `pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy`
- **TC-4** (→AC-4): dependency-panel-peers.spec.ts samples >=5 panels against live-served /r/nativewind/*.json and exits 1 through the anatomy preamble. — `pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers`
- **TC-5** (→AC-5): props-table-generated.spec.ts derives expected 39 tables (conversation 5 rows) from the dataset and exits 1 with props_tables expected 39 / received 0. — `pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated`
- **TC-6** (→AC-6): code-view-byte-identical-to-shipped-source.spec.ts samples >=5 multi-file items and exits 1 with code_views == 0 named. — `pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source`
- **TC-7** (→AC-7): engine-tab-persists-across-pages.spec.ts retains the literal key 'rnr-engine' and exits 1 through the anatomy preamble. — `pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages`
- **TC-8** (→AC-8): tab-panels-in-initial-html.spec.ts probes both engine URL literals and exits 1 through the anatomy preamble. — `pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html`
- **TC-9** (→AC-9): The locked FLOW-GEND-14 run_cmd attempts its test in 3 of 3 projects with 0 skipped. — `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`
- **TC-10** (→AC-10): The anatomy run exits 1 with a diff pinning expected ['install','source','props','theming','usage'] against received ['install','source']. — `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`
- **TC-11** (→AC-11): The pinned T-GEND-017-qr-panel run_cmd exits 1 naming qr_panel_count == 0 against the dataset-derived expected 39. — `pnpm playwright test tests/sprint-04-generated-reference/qr-panel.spec.ts --grep T-GEND-017-qr-panel`
- **TC-12** (→AC-12): run_flow.py --expect red for FLOW-GEND-35 exits 0 with red_proof_ok true and a fresh non-empty .red at the locked path. — `pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source`
- **TC-13** (→AC-13): The FLOW-SHELL-13 run_cmd exits 1 through the shared anatomy clause naming the five-section order. — `pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages`
- **TC-14** (→AC-13): git diff --name-only lists 0 files outside tests/sprint-04-generated-reference/ at task completion. — `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy`

### READING LIST (max 5)

- tests/sprint-02-shell-hero/item-install-copy.spec.ts [PRIMARY PATTERN] lines all — the in-place-extension lane shape this sprint's specs mirror: flow-id test titles, writeEvidence to locked .tmp artifacts, unguarded server-rendered asserts, dataset-derived expectations.
- tests/sprint-03-family-browse/components-family-grid.spec.ts [closest analogue] lines all — the RED-first precedent: lane spec authored before implementation, failing verbatim under all three projects until the implementer landed.
- .spec/prds/docs-site/tasks/sprint-04-generated-reference/human-flows.json [lock] lines all — the byte-frozen run_cmd/test/artifact/red_proof entries for the eight flows; every verify copies these verbatim.
- tests/harness/docs-preview.ts [harness] lines all — PREVIEW_URL, navigateLocalhost, waitForAstroPageLoad, clipboard grants every spec consumes.
- apps/docs/src/data/registry-items.json [data] lines all — the module-scope oracle via ENOENT-bridged readJson: 39 component names, families, props/themingNote/usageSnippet, sourceFiles.

### SCOPE (file-level write permissions)

writeAllowed:
- tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts (NEW)
- tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts (NEW)
- tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts (NEW)
- tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts (NEW)
- tests/sprint-04-generated-reference/props-table-generated.spec.ts (NEW)
- tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts (NEW)
- tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts (NEW)
- tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts (NEW)
- tests/sprint-04-generated-reference/qr-panel.spec.ts (NEW)
- tests/sprint-04-generated-reference/dev-client-matrix.spec.ts (NEW)
- tests/sprint-04-generated-reference/site-crawl.spec.ts (NEW)
- tests/sprint-04-generated-reference/preview-omission-nojs.spec.ts (NEW)
writeProhibited:
- tests/sprint-01-docs-spike-skeleton/
- tests/sprint-02-shell-hero/
- tests/sprint-03-family-browse/
- apps/docs/src/

### CODE PATTERN
- pattern: dataset-derived expectations at module scope (ENOENT-bridged readJson) + flow-id-verbatim spec filenames and test titles + shared anatomy preamble + writeEvidence JSON writers to locked .tmp artifact paths
- pattern_source: tests/sprint-02-shell-hero/item-install-copy.spec.ts (writeEvidence + locked-flow lane) and tests/sprint-03-family-browse/components-family-grid.spec.ts (RED-first lane)
- anti-pattern: hand-typed counts/names/literals, fixture oracles, page echoes, page.evaluate assertions, single-project guards, specs that re-assert only already-green sprint-02 clauses
- references: ['TR-07 component-detail wireframe — the 14-region anatomy the flow specs pin (section order install→source→props→theming→usage)', 'T-GEND-009–026 — the e2e criteria the eight flows and four riding specs encode', 'sprint-02 SHELL-011/012 lane tasks + sprint-03 FAM-001 — the flow-primary ownership and in-place-extension precedents']
- notes: ['This task owns the eight flow-primary e2e ACs because its write_allowed covers the spec files (FAM-001 precedent); REF-006/REF-009/REF-010 hold only unit ACs and green these specs.', 'RED is the deliverable: exit 1 at task completion is correct evidence, never a blocker.', 'Flow specs assert the agreed selectors so the implementation tasks green them without edits (RED-to-GREEN handoff).', 'Riding-spec describe tokens are pinned (T-GEND-016/017/020/021 suffixes) so gate step 1 and later tasks grep them mechanically.']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01']
- provides: ['the eight flow specs named exactly after their flow-id suffixes, each exporting a test titled with its flow id verbatim so --grep <FLOW-ID> selects it, each carrying the shared sprint-04 anatomy preamble and an evidence writer to .tmp/sprint-04-generated-reference/e2e-evidence/<FLOW-ID>.json', 'the four riding specs — qr-panel.spec.ts (T-GEND-017-qr-panel), dev-client-matrix.spec.ts (T-GEND-020-dev-client-matrix), site-crawl.spec.ts (T-GEND-016-site-crawl), preview-omission-nojs.spec.ts (T-GEND-021-preview-omission-nojs)', 'the eight flow-primary e2e ACs for this sprint, RED at completion and green when REF-002..REF-010 land', 'verbatim RED proofs per flow via run_flow.py --expect red into <FLOW-ID>.red at the locked paths']
- consumes: ['tests/harness/docs-preview (navigateLocalhost, clipboard grants, waitForAstroPageLoad) over the pnpm e2e:docs webServer serving built dist at localhost:4321', 'apps/docs/src/data/registry-items.json + families.json + site-facts.json as the module-scope oracle via the ENOENT-bridged readJson pattern', 'the locked human-flows.json byte-frozen run_cmd/test/artifact/red_proof entries for all eight flows']
- boundary_contracts: ['every spec drives the built dist via the pnpm e2e:docs webServer at localhost:4321, never astro dev', 'flow specs pin the sprint-04 anatomy markers (top-level section[data-section] order install→source→props→theming→usage; 0 preview-panel elements; pager in-family) so clause sets extend beyond already-green sprint-02 behavior', "no modifications to other lanes' specs"]

### VERIFICATION GATES

- AC-1: pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy → exit 1 at sprint start naming the five-section order; exit 0 after REF-009
- AC-2: pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family → exit 1 at sprint start
- AC-3: pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy → exit 1 at sprint start
- AC-4: pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers → exit 1 at sprint start; exit 0 after REF-006/REF-009
- AC-5: pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated → exit 1 naming props_tables 0 vs 39; exit 0 after REF-002/REF-009
- AC-6: pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source → exit 1 naming code_views 0
- AC-7: pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages → exit 1 through the anatomy clause
- AC-8: pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html → exit 1 through the anatomy clause
- AC-12: python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-04-generated-reference --flow <FLOW-ID> --expect red → exit 0, red_proof_ok true, fresh <FLOW-ID>.red, for each of the 8 flows
- typecheck: pnpm typecheck → exit 0
- lint: ./node_modules/.bin/biome ci tests/sprint-04-generated-reference → exit 0 (never pnpm lint; local crash)
- scope: git diff --name-only → 0 files outside the 12 enumerated spec paths

### DEPENDENCIES

- Depends on: [] · Blocks: ['REF-005', 'REF-006', 'REF-009', 'REF-010']

### CODING STANDARDS

- Specs read real src/data at module scope; zero hand-typed oracles
- Unguarded server-rendered DOM/served-byte assertions via locators, never page.evaluate; retries 0; navigation only via the harness against localhost:4321
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-001",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_dataset": {
   "description": "The real committed build inputs read at module scope via the ENOENT-bridged readJson pattern.",
   "seed_method": "public_api",
   "records": [
    "apps/docs/src/data/registry-items.json: 56 entries, 39 registry:component, 7 AI families with counts 3/7/6/7/4/1/11",
    "39/39 component entries carry non-empty props[], themingNote, usageSnippet (verified present, unrendered at HEAD)",
    "apps/docs/src/data/site-facts.json: aiSdkPeers incl. name 'ai'",
    "served /r/{nativewind,uniwind}/{item}.json dependency fields and files[].text are the live-served oracles"
   ]
  },
  "built_preview_sprint04_start": {
   "description": "The sprint-start build served by the Playwright webServer (pnpm e2e:docs chain) at localhost:4321: every component page renders breadcrumb, h1, chips, engine-tabbed install, DependencyPanel, bare section[data-section=\"source\"], and the within-family pager — and lacks props/theming/usage sections, any Code view, any QrPanel, and the dev-client matrix section.",
   "seed_method": "ui_flow",
   "records": [
    "top-level section[data-section] order at HEAD: install then source (2 sections)",
    "0 props tables, 0 theming/usage sections, 0 preview-panel elements, 0 QrPanel elements, 0 matrix sections across the 39 pages",
    "engine tab group under storage-key rnr-engine already green from sprint-02 — the anatomy preamble is what makes each flow spec RED"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "FLOW-GEND-14 primary — anatomy spec authored, RED naming the missing five-section order",
   "primary": true,
   "flow_ref": "FLOW-GEND-14-reference-page-anatomy",
   "test_tier": "e2e",
   "unit_test_justified": null,
   "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "test_file": "tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts",
   "test_function": "FLOW-GEND-14-reference-page-anatomy",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "unit_test_justified": null,
    "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
    "negative_control": {
     "would_fail_if": [
      "the spec is a static shell hand-writing one demo page — the 39-page dataset loop fails",
      "the clause set only re-asserts sprint-02 behavior — the spec passes vacuously against the 2-section remainder",
      "the anatomy expectation is a mock fixture instead of the dataset-derived order — a dataset change leaves the spec unchanged"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_sprint04_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd against the sprint-start preview",
        "read the section-order failure across the 39 dataset-enumerated pages",
        "capture the RED via run_flow.py --expect red"
       ]
      },
      "end_state": {
       "must_observe": [
        "spec file exists at tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts exporting 1 test titled 'FLOW-GEND-14-reference-page-anatomy'",
        "exit code 1 with the diff pinning expected ['install','source','props','theming','usage'] against received ['install','source']",
        "preview_panels == 0 asserted as a standing clause",
        ".red captured fresh (>0 bytes) at .tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-14-reference-page-anatomy.red"
       ],
       "must_not_observe": [
        "0 passing assertions against the unshipped anatomy",
        "0 page.evaluate-based assertions",
        "an absent or 0-byte .red"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the sprint-start build served by the pnpm e2e:docs webServer where pages render only install then source WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy) THEN the authored spec runs over the built dist in all three projects, exits 1 naming the expected order install,source,props,theming,usage against the received two-section DOM, and its RED is captured in FLOW-GEND-14-reference-page-anatomy.red",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "FLOW-GEND-15 primary — family-pager spec authored over the families.json oracle",
   "primary": true,
   "flow_ref": "FLOW-GEND-15-family-pager-stays-in-family",
   "test_tier": "e2e",
   "unit_test_justified": null,
   "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "test_file": "tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts",
   "test_function": "FLOW-GEND-15-family-pager-stays-in-family",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "unit_test_justified": null,
    "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
    "negative_control": {
     "would_fail_if": [
      "the pager expectation is hardcoded names instead of the families.json join — a dataset change leaves it stale",
      "an empty dataset collapses the walk to 0 assertions (vacuous pass)",
      "the spec is a static stub asserting one hand-picked family — the 7-family loop fails"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd",
        "read the per-family walk against the families.json member sets and the anatomy-preamble failure"
       ]
      },
      "end_state": {
       "must_observe": [
        "spec file exists exporting 1 test titled 'FLOW-GEND-15-family-pager-stays-in-family' deriving 7 families with counts 3/7/6/7/4/1/11",
        "exit code 1 through the anatomy preamble naming the expected 5-section order",
        ".red captured fresh (>0 bytes) at the locked path"
       ],
       "must_not_observe": [
        "0 passing assertions against the unshipped anatomy",
        "0 page.evaluate-based assertions",
        "a pager-href probe returning non-200 left unasserted"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the sprint-start build with the within-family pager already shipping and families.json committing 7 families with counts 3/7/6/7/4/1/11 WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family) THEN the authored spec derives each family's member set from families.json, asserts set(pages_reachable_via_pager) == set(family_members) with every pager href 200 in dist/, and exits 1 through the shared anatomy preamble",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "FLOW-GEND-20 primary — exact-absolute-URL copy spec authored over the locked regex",
   "primary": true,
   "flow_ref": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "test_tier": "e2e",
   "unit_test_justified": null,
   "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "test_file": "tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts",
   "test_function": "FLOW-GEND-20-exact-absolute-url-command-copy",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "unit_test_justified": null,
    "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
    "negative_control": {
     "would_fail_if": [
      "a short-name or relative form is served — the locked regex fails",
      "the clipboard read is mocked with a page echo instead of the granted real clipboard — display/clipboard equality is faked",
      "a static stub copies one canned command — the 39-page loop fails"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_sprint04_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd",
        "read the per-engine copy clauses and the anatomy-preamble failure over the 39 dataset pages"
       ]
      },
      "end_state": {
       "must_observe": [
        "spec file exists exporting 1 test titled 'FLOW-GEND-20-exact-absolute-url-command-copy' embedding the literal regex ^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$",
        "exit code 1 through the anatomy preamble naming the expected 5-section order",
        ".red captured fresh (>0 bytes) at the locked path"
       ],
       "must_not_observe": [
        "0 passing assertions against the unshipped anatomy",
        "0 page.evaluate-based assertions",
        "0 short-name or un-tabbed duplicate forms left unasserted"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the sprint-start build with the engine-tabbed install block shipping since sprint-02 WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy) THEN the authored spec enumerates the 39 pages from the dataset and asserts per engine tab a one-click clipboard copy matching the locked regex with the displayed text equal to the clipboard, exiting 1 through the shared anatomy preamble",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "FLOW-GEND-21 primary — dependency-panel peers spec authored against live-served /r JSON",
   "primary": true,
   "flow_ref": "FLOW-GEND-21-dependency-panel-peers",
   "test_tier": "e2e",
   "unit_test_justified": null,
   "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "test_file": "tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts",
   "test_function": "FLOW-GEND-21-dependency-panel-peers",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "unit_test_justified": null,
    "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
    "negative_control": {
     "would_fail_if": [
      "the panel oracle is a mock fixture instead of the live-served /r/nativewind/*.json dependency fields — drift goes undetected",
      "a static stub checks one hand-picked panel — the >=5 sampled-panel clause fails",
      "an invented or dropped entry passes — the set-equality assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd",
        "read the peers clauses (shimmer, conversation pinned) and the anatomy-preamble failure"
       ]
      },
      "end_state": {
       "must_observe": [
        "spec file exists exporting 1 test titled 'FLOW-GEND-21-dependency-panel-peers' reading aiSdkPeers from site-facts.json (the peers entry 'ai')",
        "the sampled-panel clause pins >=5 items fetched from http://localhost:4321/r/nativewind/{item}.json",
        "exit code 1 through the anatomy preamble naming the expected 5-section order",
        ".red captured fresh (>0 bytes) at the locked path"
       ],
       "must_not_observe": [
        "0 passing assertions against the unshipped anatomy",
        "0 page.evaluate-based assertions",
        "0 invented-or-dropped-entry guards missing from the clause set"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the sprint-start build with DependencyPanel shipping and the same origin serving /r/nativewind/*.json WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers) THEN the authored spec asserts panels equal registry dependencies plus engine-resolved registryDependencies plus the site-facts AI SDK peer, matches >=5 sampled panels against the live-served dependency fields with 0 invented or dropped entries, and exits 1 through the shared anatomy preamble",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-5",
   "name": "FLOW-GEND-34 primary — props-table spec authored, RED naming 0 tables",
   "primary": true,
   "flow_ref": "FLOW-GEND-34-props-table-generated",
   "test_tier": "e2e",
   "unit_test_justified": null,
   "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "test_file": "tests/sprint-04-generated-reference/props-table-generated.spec.ts",
   "test_function": "FLOW-GEND-34-props-table-generated",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "unit_test_justified": null,
    "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
    "negative_control": {
     "would_fail_if": [
      "a static shell renders one canned table — the 39-page loop fails",
      "types are asserted loosely so 'any' or 'unknown' placeholders pass — the resolved-text clause fails",
      "an empty dataset collapses the loop to 0 tables asserted (vacuous pass)"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd",
        "read the props_tables count failure and the header/type clauses"
       ]
      },
      "end_state": {
       "must_observe": [
        "spec file exists exporting 1 test titled 'FLOW-GEND-34-props-table-generated' deriving expected counts from the dataset (39 tables, conversation 5 rows)",
        "exit code 1 with the diff naming props_tables expected 39 / received 0",
        ".red captured fresh (>0 bytes) at the locked path"
       ],
       "must_not_observe": [
        "0 passing assertions against the unshipped anatomy",
        "0 page.evaluate-based assertions",
        "a vacuous green over 0 tables"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the sprint-start build where no page renders a props table while all 39 dataset entries carry non-empty props[] WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated) THEN the authored spec asserts 39 tables with Name/Type/Default/Description headers and dataset-equal type cells, exiting 1 with props_tables == 0 against the expected 39",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-6",
   "name": "FLOW-GEND-35 primary — byte-identical Code-view spec authored, RED naming 0 code views",
   "primary": true,
   "flow_ref": "FLOW-GEND-35-code-view-byte-identical-to-shipped-source",
   "test_tier": "e2e",
   "unit_test_justified": null,
   "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "test_file": "tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts",
   "test_function": "FLOW-GEND-35-code-view-byte-identical-to-shipped-source",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "unit_test_justified": null,
    "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
    "negative_control": {
     "would_fail_if": [
      "the byte oracle is a mock of the /r endpoint — a source drift goes undetected (injection mode)",
      "the compare normalizes whitespace — 0 normalization diffs is asserted against raw bytes",
      "a static stub checks one single-file item — the >=5 multi-file sampling clause fails"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd",
        "read the code-view count failure for the sampled multi-file items (audio-player, prompt-input, tool among them)"
       ]
      },
      "end_state": {
       "must_observe": [
        "spec file exists exporting 1 test titled 'FLOW-GEND-35-code-view-byte-identical-to-shipped-source' sampling >=5 multi-file items",
        "exit code 1 with the diff naming code_views expected >=5 / received 0",
        ".red captured fresh (>0 bytes) at the locked path"
       ],
       "must_not_observe": [
        "0 passing assertions against the unshipped anatomy",
        "0 page.evaluate-based assertions",
        "a byte compare that silently normalizes the served text"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the sprint-start build rendering bare source sections with no Code-view contract and the same origin serving /r/nativewind/{item}.json WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source) THEN the authored spec samples the multi-file items and byte-compares their Code-view text against the served files[].text, exiting 1 with code_views == 0 for the sampled items",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-7",
   "name": "FLOW-SHELL-13 primary — engine-tab persistence spec authored beyond sprint-02 green",
   "primary": true,
   "flow_ref": "FLOW-SHELL-13-engine-tab-persists-across-pages",
   "test_tier": "e2e",
   "unit_test_justified": null,
   "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "test_file": "tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts",
   "test_function": "FLOW-SHELL-13-engine-tab-persists-across-pages",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "unit_test_justified": null,
    "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
    "negative_control": {
     "would_fail_if": [
      "persistence is asserted by direct state injection (view-injection) instead of the real localStorage read after a hard load",
      "engine state leaks into a URL — the URL-purity clause fails",
      "the spec only re-asserts sprint-02 clauses — it stays green and the anatomy preamble is absent"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_sprint04_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd",
        "read the persistence clauses (literal key 'rnr-engine', >=2 navigations) and the anatomy-preamble failure"
       ]
      },
      "end_state": {
       "must_observe": [
        "spec file exists exporting 1 test titled 'FLOW-SHELL-13-engine-tab-persists-across-pages' using the literal localStorage key 'rnr-engine'",
        "exit code 1 through the anatomy preamble naming the expected 5-section order",
        ".red captured fresh (>0 bytes) at the locked path"
       ],
       "must_not_observe": [
        "0 passing assertions against the unshipped anatomy",
        "0 page.evaluate-based assertions",
        "0 URL-purity guards in the clause set"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the sprint-start build with the engine tab group under storage-key rnr-engine already green from sprint-02 WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages) THEN the authored spec asserts uniwind persistence across a soft navigation and a hard load with 0 engine state in any URL, exiting 1 through the shared anatomy preamble",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-8",
   "name": "FLOW-SHELL-14 primary — initial-HTML tab-panels spec authored",
   "primary": true,
   "flow_ref": "FLOW-SHELL-14-tab-panels-in-initial-html",
   "test_tier": "e2e",
   "unit_test_justified": null,
   "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "test_file": "tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts",
   "test_function": "FLOW-SHELL-14-tab-panels-in-initial-html",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "unit_test_justified": null,
    "verification_service": "built dist over astro preview + Chromium (desktop/mobile/nojs)",
    "negative_control": {
     "would_fail_if": [
      "the literal probe reads a mocked response instead of the served bytes — a client-rendered regression goes undetected",
      "only the active engine is probed — one literal count stays 0 undetected",
      "a static stub serves one canned page — the multi-page literal loop fails"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_sprint04_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd",
        "read the literal-count clauses for /components/conversation and /components/message and the anatomy-preamble failure"
       ]
      },
      "end_state": {
       "must_observe": [
        "spec file exists exporting 1 test titled 'FLOW-SHELL-14-tab-panels-in-initial-html' probing both literals 'https://rnraielements.com/r/nativewind/' and 'https://rnraielements.com/r/uniwind/'",
        "exit code 1 through the anatomy preamble naming the expected 5-section order",
        ".red captured fresh (>0 bytes) at the locked path"
       ],
       "must_not_observe": [
        "0 passing assertions against the unshipped anatomy",
        "0 page.evaluate-based assertions",
        "0 no-JS stacked-panel clauses in the spec"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the sprint-start build serving raw pre-JS HTML with both engine panels server-rendered WHEN the locked run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html) THEN the authored spec asserts both engine URL literals in the served bytes and the no-JS stacked render, exiting 1 through the shared anatomy preamble",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-9",
   "name": "Locked anatomy run_cmd executes the authored spec in all three projects over the built dist",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Authorship-behavior contract over the spec file this task itself authors — the run must execute the lane it ships; the flow-primary RED proof is AC-1 and the green proof belongs to REF-009.",
   "verification_service": "real Playwright run over the built dist via the pnpm e2e:docs webServer at localhost:4321",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts",
   "test_function": "FLOW-GEND-14-reference-page-anatomy",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Authorship-behavior contract over the spec file this task itself authors; the green proof belongs to REF-009.",
    "verification_service": "real Playwright run over the built dist via the pnpm e2e:docs webServer at localhost:4321",
    "negative_control": {
     "would_fail_if": [
      "the spec file is absent or misnamed so the run_cmd selects 0 tests",
      "a project guard omits chromium-nojs — the nojs attempt line is deleted from the summary",
      "the spec disconnects from the webServer and backgrounds its own astro dev server"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_sprint04_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked FLOW-GEND-14 run_cmd against the sprint-start preview",
        "read the per-project attempt lines from the run summary"
       ]
      },
      "end_state": {
       "must_observe": [
        "attempt lines for 3 of 3 projects: chromium-desktop, chromium-mobile, chromium-nojs",
        "0 skipped tests in the run summary",
        "exactly 1 spec file selected: tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts"
       ],
       "must_not_observe": [
        "0 attempt lines for chromium-nojs (skip signature)",
        "a webServer startup failure or ENOENT on src/data replacing the anatomy assertion failure"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the authored lane at task completion with the sprint-start build served by the pnpm e2e:docs webServer at localhost:4321 WHEN the locked FLOW-GEND-14 run_cmd executes THEN the run attempts the anatomy test in chromium-desktop, chromium-mobile, and chromium-nojs with 0 skipped tests in the summary",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-10",
   "name": "Anatomy clause set is RED for the named reason — the five-section order vs the sprint-02 remainder",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "RED-reason contract over the authored spec's own run output — the clause must fail through the missing anatomy, proving it extends beyond already-green sprint-02 behavior.",
   "verification_service": "real Playwright run over the sprint-start built dist with the real dataset-derived expectation",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts",
   "test_function": "FLOW-GEND-14-reference-page-anatomy",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "RED-reason contract over the authored spec's own run output.",
    "verification_service": "real Playwright run over the sprint-start built dist with the real dataset-derived expectation",
    "negative_control": {
     "would_fail_if": [
      "the clause set only re-asserts sprint-02 behavior — the spec passes vacuously against the 2-section remainder (exit 0)",
      "the expected order is hardcoded without reading the dataset — a dataset change leaves the spec stale",
      "the failure is a disconnected harness error (timeout, navigation) instead of the section-order assertion"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_sprint04_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked FLOW-GEND-14 run_cmd",
        "read the section-order assertion failure from the output"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 1",
        "the diff pins expected order ['install','source','props','theming','usage']",
        "the received array names 'install' followed by 'source' on all 39 pages"
       ],
       "must_not_observe": [
        "exit 0 at RED (vacuous pass against the sprint-02 remainder)",
        "a diff naming 0 sections (navigation failure masquerading as the contract)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the anatomy spec pinning top-level section[data-section] order install,source,props,theming,usage, 0 preview-panel elements, and pager-in-family, against the sprint-start DOM that renders only install then source WHEN the locked FLOW-GEND-14 run_cmd executes THEN the run exits 1 with a failure diff naming the expected five-section order against the received two-section reality",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-11",
   "name": "Riding specs authored under pinned describe tokens, RED on their named absent surfaces, writers plumbed",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Authorship-behavior contract over a riding spec this task authors — it must run over the built dist and fail through the named absent surface; the QrPanel green proof belongs to REF-005.",
   "verification_service": "real Playwright run over the sprint-start built dist with the registry-dataset-derived QR count expectation",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/qr-panel.spec.ts",
   "test_function": "T-GEND-017-qr-panel",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/qr-panel.spec.ts --grep T-GEND-017-qr-panel",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Authorship-behavior contract over a riding spec this task authors; the green proof belongs to REF-005.",
    "verification_service": "real Playwright run over the sprint-start built dist with the registry-dataset-derived QR count expectation",
    "negative_control": {
     "would_fail_if": [
      "the riding spec is a stub shell with no dataset-derived count — it passes against 0 panels vacuously",
      "the expectation is a hardcoded 39 instead of the dataset length — a dataset change leaves it stale",
      "the evidence writer is omitted — the locked artifact path is never written"
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
       "actor": "e2e_runner",
       "steps": [
        "run the pinned T-GEND-017-qr-panel run_cmd against the sprint-start preview",
        "read the QR-count assertion failure"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 1",
        "qr_panel_count == 0 in the failure diff against expected 39",
        "the spec's writer targets the literal path .tmp/sprint-04-generated-reference/e2e-evidence/T-GEND-017-qr-panel.json"
       ],
       "must_not_observe": [
        "a passing loop over 0 panels (vacuous green)",
        "0 evidence-writer references in the spec source"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the four riding specs authored under the lane — qr-panel.spec.ts (T-GEND-017-qr-panel), dev-client-matrix.spec.ts (T-GEND-020-dev-client-matrix), site-crawl.spec.ts (T-GEND-016-site-crawl), preview-omission-nojs.spec.ts (T-GEND-021-preview-omission-nojs) — each deriving its expectation from the real dataset WHEN the pinned qr-panel run_cmd executes (pnpm playwright test tests/sprint-04-generated-reference/qr-panel.spec.ts --grep T-GEND-017-qr-panel) THEN the run exits 1 naming qr_panel_count 0 against the dataset-derived expectation of 39",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-12",
   "name": "Per-flow RED proofs captured fresh via run_flow.py --expect red",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Evidence-plumbing contract over this task's own lane — the gate-evidence tool must reproduce each spec's RED run from the locked command.",
   "verification_service": "brain gate-evidence run_flow.py re-executing the locked run_cmd over the real tree and built dist",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts",
   "test_function": "FLOW-GEND-35-code-view-byte-identical-to-shipped-source",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Evidence-plumbing contract over this task's own lane.",
    "verification_service": "brain gate-evidence run_flow.py re-executing the locked run_cmd over the real tree and built dist",
    "negative_control": {
     "would_fail_if": [
      "a flow spec passes at sprint start — run_flow.py --expect red cannot produce a red proof",
      "the red proof is an empty or 0-byte paraphrase instead of the captured run",
      "a spec's run_cmd drifts from the locked human-flows.json command — cmd_sha mismatches (wrong constant)"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_sprint04_start",
      "action": {
       "actor": "cli_runner",
       "steps": [
        "execute the locked FLOW-GEND-35 run_cmd (the run the red proof records)",
        "execute run_flow.py --flow FLOW-GEND-35-code-view-byte-identical-to-shipped-source --expect red",
        "read the .red artifact"
       ]
      },
      "end_state": {
       "must_observe": [
        "the run_cmd exits 1 with code_views == 0 named for the sampled items",
        "run_flow.py exits 0 with red_proof_ok: true",
        "the .red artifact is fresh (>0 bytes) at the locked path"
       ],
       "must_not_observe": [
        "exit 0 from the run_cmd (RED is the deliverable — no vacuous pass)",
        "an absent or 0-byte .red for any of the 8 flows"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the eight authored flow specs each failing for its named sprint-04 reason WHEN python3 ~/Projects/brain/tools/gate-evidence/run_flow.py --sprint-dir .spec/prds/docs-site/tasks/sprint-04-generated-reference --flow <FLOW-ID> --expect red runs for each of the eight flows THEN each invocation exits 0 with red_proof_ok true and a fresh .tmp/sprint-04-generated-reference/e2e-evidence/<FLOW-ID>.red",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-13",
   "name": "All eight flow specs RED through the shared anatomy markers, isolating the lane from other lanes",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Boundary-behavior contract over this task's own lane — the engine-tab spec must extend beyond sprint-02's already-green persistence clauses via the anatomy preamble, and the task must touch no other lane.",
   "verification_service": "real Playwright run over the sprint-start built dist plus a real git working-tree diff",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts",
   "test_function": "FLOW-SHELL-13-engine-tab-persists-across-pages",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Boundary-behavior contract over this task's own lane.",
    "verification_service": "real Playwright run over the sprint-start built dist plus a real git working-tree diff",
    "negative_control": {
     "would_fail_if": [
      "a flow spec omits the anatomy preamble and passes against sprint-02-only behavior (exit 0)",
      "an edit lands in tests/sprint-02-shell-hero/ or tests/sprint-03-family-browse/ — the diff shows foreign-lane files",
      "the spec asserts engine persistence through a page echo (static mock) instead of the real localStorage key"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_sprint04_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked FLOW-SHELL-13 run_cmd",
        "read which clause produced the failure",
        "run git diff --name-only at task completion"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 1 with the failure naming the expected order ['install','source','props','theming','usage']",
        "the spec retains the literal localStorage key 'rnr-engine' in its persistence clauses",
        "git diff --name-only lists 0 files outside tests/sprint-04-generated-reference/"
       ],
       "must_not_observe": [
        "exit 0 from a spec that only re-asserts the green sprint-02 engine clauses",
        "any modified file under tests/sprint-01-docs-spike-skeleton/, tests/sprint-02-shell-hero/, or tests/sprint-03-family-browse/"
       ]
      }
     }
    ]
   },
   "description": "GIVEN each of the eight flow specs opens with the shared sprint-04 anatomy preamble and the sprint-01/02/03 lane specs exist unmodified WHEN the locked FLOW-SHELL-13 run_cmd executes THEN the run exits 1 through the shared anatomy clause while git diff --name-only lists 0 files outside tests/sprint-04-generated-reference/",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "reference-page-anatomy.spec.ts exists exporting the FLOW-GEND-14-titled test and exits 1 naming the five-section order with a fresh .red.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "family-pager-stays-in-family.spec.ts derives 7 families (3/7/6/7/4/1/11) from families.json and exits 1 through the anatomy preamble.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "exact-absolute-url-command-copy.spec.ts embeds the locked regex and enumerates 39 pages, exiting 1 through the anatomy preamble.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "dependency-panel-peers.spec.ts samples >=5 panels against live-served /r/nativewind/*.json and exits 1 through the anatomy preamble.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "props-table-generated.spec.ts derives expected 39 tables (conversation 5 rows) from the dataset and exits 1 with props_tables expected 39 / received 0.",
   "maps_to_ac": "AC-5",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "code-view-byte-identical-to-shipped-source.spec.ts samples >=5 multi-file items and exits 1 with code_views == 0 named.",
   "maps_to_ac": "AC-6",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "engine-tab-persists-across-pages.spec.ts retains the literal key 'rnr-engine' and exits 1 through the anatomy preamble.",
   "maps_to_ac": "AC-7",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages"
  },
  {
   "id": "TC-8",
   "type": "test_criterion",
   "description": "tab-panels-in-initial-html.spec.ts probes both engine URL literals and exits 1 through the anatomy preamble.",
   "maps_to_ac": "AC-8",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html"
  },
  {
   "id": "TC-9",
   "type": "test_criterion",
   "description": "The locked FLOW-GEND-14 run_cmd attempts its test in 3 of 3 projects with 0 skipped.",
   "maps_to_ac": "AC-9",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy"
  },
  {
   "id": "TC-10",
   "type": "test_criterion",
   "description": "The anatomy run exits 1 with a diff pinning expected ['install','source','props','theming','usage'] against received ['install','source'].",
   "maps_to_ac": "AC-10",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy"
  },
  {
   "id": "TC-11",
   "type": "test_criterion",
   "description": "The pinned T-GEND-017-qr-panel run_cmd exits 1 naming qr_panel_count == 0 against the dataset-derived expected 39.",
   "maps_to_ac": "AC-11",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/qr-panel.spec.ts --grep T-GEND-017-qr-panel"
  },
  {
   "id": "TC-12",
   "type": "test_criterion",
   "description": "run_flow.py --expect red for FLOW-GEND-35 exits 0 with red_proof_ok true and a fresh non-empty .red at the locked path.",
   "maps_to_ac": "AC-12",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source"
  },
  {
   "id": "TC-13",
   "type": "test_criterion",
   "description": "The FLOW-SHELL-13 run_cmd exits 1 through the shared anatomy clause naming the five-section order.",
   "maps_to_ac": "AC-13",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages"
  },
  {
   "id": "TC-14",
   "type": "test_criterion",
   "description": "git diff --name-only lists 0 files outside tests/sprint-04-generated-reference/ at task completion.",
   "maps_to_ac": "AC-13",
   "verify": "pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy"
  }
 ]
}
-->

</details>
