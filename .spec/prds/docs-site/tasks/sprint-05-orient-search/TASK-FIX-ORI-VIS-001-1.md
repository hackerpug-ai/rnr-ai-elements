# FIX-ORI-VIS-001-1: Include the reserved theming entry in section navigation

## What this does

Lands the one semantic line ORI-VIS-001's blocked cycle-1 report named: `apps/docs/src/lib/docs-navigation.ts` `RESERVED_DOC_SLUGS = ['theming']` feeds both consumers of the publication contract — `publishedDocs` (the catch-all `/docs/[...id]` route-generation source, where the exclusion is correct: the static `theming.astro` route owns the destination) and `sectionNavigation` (the nav derivation every rendered page consumes through MarkdownLayout) — so `/docs/theming` is silently absent from every page's section nav and the Guides group never renders. ORI-AST-003 landed the static route but never adapted the nav; the module's own responsibility comment anticipated exactly this ("until ORI-AST-003 adapts it"). This task includes the reserved theming entry in the `sectionNavigation` derivation only, under its authored `'guides'` section, while the catch-all keeps excluding it from generation. `theming.astro` already renders through MarkdownLayout with `nav = sectionNavigation(entries)`, so the landed page lights up unchanged — no consumer edit, no signature change. Verified through a task-owned proof harness (`tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts`) that drives the real module derivation over the real authored collection, the real public build, the built dist nav HTML, and the preserved orientation spec.

## Why

ORI-VIS-001 (in flight, blocked cycle 1, checkpoint `1c732dc1`) proved every other AC-2 observation green across chromium-desktop, chromium-mobile and chromium-nojs — the single failing member is "Section navigation reaches `/docs/installation`, `/docs/cli`, `/docs/theming` and `/docs/dark-mode`": the observed nav hrefs are introduction, installation, quickstart, cli, dark-mode, owns-vs-does-not-own — no theming, so the Guides section group is absent everywhere. The fix file sits outside ORI-VIS-001's write allowlist (write-prohibited "Routing" class), so the wave-18 ruling made the resolution an add ask. Every path to ORI-VIS-001's GREEN runs through this line landing on trunk. ORI-AST-003 (completed — merged `446c98b1`) owns the theming route whose own code comment anticipated this adaptation. No landed test asserts theming's absence from nav: `orientation-content.spec.ts` asserts only the relative order of the four getting-started entries (introduction, installation, CLI, Dark mode), and its `/docs/theming` internal-link check passes today through main-region prose links — which is exactly why a whole-HTML grep proves nothing and the nav-region-scoped read is the only valid oracle.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts
pnpm typecheck
pnpm exec biome ci apps/docs/src/lib/docs-navigation.ts tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts
```

The first command is the exact selector: the task-owned proof harness — (a) RED phase: on the pre-change candidate it imports the real `docs-navigation.ts` module and derives `sectionNavigation` and `publishedDocs` over entries parsed from the real authored content directory, runs the real `pnpm --filter @rnr-ai-elements/docs build`, and reads the built nav HTML from the real dist, recording (0) `/docs/theming` entries in the nav derivation, (0) `guides` groups, the correct-exclusion `publishedDocs` baseline, and the build page count; (b) GREEN phase: identical observations plus the preserved orientation spec — the nav derivation includes theming in the `guides` group with exactly 1 entry ordered after every getting-started entry, `publishedDocs` still excludes it, the build page count is exactly the RED count (route count unchanged — the static route still owns the destination), the built page's `nav[data-docs-nav]` region carries exactly 1 `/docs/theming` anchor inside the `Guides` group, and `orientation-content.spec.ts` (chromium-desktop) exits 0 with its relative-order assertions intact. `pnpm typecheck` and the scoped Biome command are preserved static gates.

## Scope

Own exactly the one semantic line in `apps/docs/src/lib/docs-navigation.ts` (plus its responsibility comment), the task-owned proof harness, and bounded evidence. The static `theming.astro` route, the catch-all `[...id].astro`, MarkdownLayout, every content manuscript, and `human-flows.json` stay byte-unchanged — the locked gate flows read a nav that will carry the link; their bytes stay locked.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ✅ Completed

Commit: 01837e2ea0c1c42f4ca5a76fb37ad2d0e181adce

> Assignee: astro-implementer
> Priority: P1 · Points: 1 · Type: FIX
> Dependency phase: after ORI-AST-003
> Proposed By: astro-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-25
> Source SHA: a35760fabd1c61622173e0019d932d4a0e7ac865

AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROGRESS: 0/2 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

Every rendered docs page's section navigation reaches `/docs/theming` through a `Guides` group derived from the authored `guides` section, while the catch-all route generation keeps excluding the reserved slug — the static `theming.astro` route stays the single destination and the build's route count is unchanged — and ORI-VIS-001's AC-2 theming member becomes satisfiable once its branch meets trunk.

### CRITICAL CONSTRAINTS — Never

- Never admit the reserved slug into `publishedDocs`: route generation, the duplicate-destination guard's published-set view, and the catch-all fan-out must stay byte-equivalent in behavior — the split is navigation-only.
- Never weaken `assertUniqueDestinations`: it is source-file-based, covers every authored file including theming, and remains the build-time collision gate for the static route's destination.
- Never edit a consumer: `theming.astro`, `[...id].astro`, and MarkdownLayout already wire `sectionNavigation(entries)` into every rendered page — the fix is the derivation, not the wiring.
- Never claim nav inclusion from a whole-HTML grep for `/docs/theming`: prose links satisfy that pre-change, so only the `nav[data-docs-nav]`-scoped read (and the module derivation) are valid oracles.
- Never substitute a mocked entries array, a hand-authored nav fixture, or a cached build receipt for the real content-directory parse, the real public build, and the built dist HTML.
- Never touch in-flight ORI-VIS-001 branch files, planning artifacts, or perform trunk/worktree lifecycle operations.

### DONE WHEN

- [ ] AC-1 proves the derivation split with the real module, the real build at an unchanged page count, and the built nav HTML carrying exactly 1 `/docs/theming` anchor inside the `Guides` group, RED captured pre-change.
- [ ] AC-2 proves the preserved contracts (orientation spec exit 0, `publishedDocs` baseline unchanged, static gates) and the two-file diff boundary.
- [ ] The exact selector and preserved commands pass; independent review confirms real RED/GREEN, the nav observations, and exact scope compliance.

### SPECIFICATION

One semantic line in one module plus a minimal task-owned proof harness. RED is the recorded pre-change trunk observation (the gap made mechanical: the nav derivation carries (0) theming entries, so the built nav region carries (0) `/docs/theming` anchors and (0) `Guides` group titles). GREEN is the identical selector after the line lands: the `guides` group appears with exactly the theming entry, the `publishedDocs` baseline is unchanged, the build page count is unchanged, and the preserved orientation spec stays green. The harness orchestrates the real commands — it never mocks the module, the build, or the spec, and never becomes a second navigation gate.

### BOUNDARY CONTRACTS

1. `apps/docs/src/lib/docs-navigation.ts` (MODIFY): one semantic change — `sectionNavigation` derives its groups from the published set INCLUDING reserved slugs (drafts still excluded), so the reserved `theming` entry appears under its authored `'guides'` section (order 1, href `/docs/theming`, sorted after every `getting-started` entry by the existing section-then-order-then-id rule). `publishedDocs` — the catch-all's route-generation source at `apps/docs/src/pages/docs/[...id].astro:51` — keeps excluding `RESERVED_DOC_SLUGS` exactly as today. The module's responsibility comment (#3) updates to state the split: reserved slugs are excluded from catch-all generation but included in section navigation (the static route owns the destination; navigation still reaches it). No signature change, no new export, no consumer edit.
2. Harness `tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts` (NEW, in the sprint lane) exports `runThemingNavInclusionProof`: RED phase — on the pre-change candidate, (i) module observation: import the real module (github-slugger resolves through `apps/docs/node_modules`, the `theming-manuscript.test.ts` precedent), construct the entries array from the real `apps/docs/src/content/docs/` sources (frontmatter parsed with the real js-yaml from the pnpm store, ids derived with the same github-slugger copy the module imports; the content directory is flat), and record `sectionNavigation` output — (0) entries with href `/docs/theming`, (0) groups with section `guides` — and the `publishedDocs` output (6 entries at planning time, (0) of them theming) as the correct-exclusion baseline; (ii) real build: run the real `pnpm --filter @rnr-ai-elements/docs build` and record the printed page count (68 at planning time); (iii) built-HTML observation: read `apps/docs/dist/docs/introduction/index.html` and record (0) `/docs/theming` anchors inside the `nav[data-docs-nav]` region and (0) `Guides` section titles; write `red.json` binding the candidate SHA and exit nonzero naming the gap. GREEN phase — with the line landed, identical commands: `sectionNavigation` output carries a `guides` group with exactly 1 entry at href `/docs/theming` ordered after every `getting-started` entry; `publishedDocs` output identical to the RED baseline; build exit 0 at exactly the RED page count; the built page's `nav[data-docs-nav]` region carries exactly 1 `/docs/theming` anchor inside the section titled `Guides`, positioned after every getting-started anchor; then run the real `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --project=chromium-desktop` and require exit 0; emit `green.json` and `run.json` binding candidate and harness hashes, exact commands, exit codes, and observations.
3. Evidence is exactly `.tmp/FIX-ORI-VIS-001-1/red.json`, `green.json`, `run.json`.
4. No change to any other file: `apps/docs/src/pages/docs/theming.astro`, `apps/docs/src/pages/docs/[...id].astro`, `apps/docs/src/layouts/MarkdownLayout.astro`, every content manuscript under `apps/docs/src/content/docs/`, and `human-flows.json` stay byte-unchanged.
5. Scratch or staging mutations, if any, live and die under the owned `.tmp/FIX-ORI-VIS-001-1/` root; the candidate checkout carries exactly the modified module and the harness beyond trunk.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. All criteria run the real module derivation, the real public build, and the real built dist HTML.

#### AC-1: The nav derivation includes theming while route generation still excludes it [PRIMARY]

GIVEN trunk where `sectionNavigation` over the real authored collection carries (0) `/docs/theming` entries and (0) `guides` groups — so no docs page's section nav links `/docs/theming` and the Guides group never renders (ORI-VIS-001 cycle-1 blocked report) WHEN the reserved theming entry is included in the `sectionNavigation` derivation only, under its authored `'guides'` section, while `publishedDocs` keeps excluding `RESERVED_DOC_SLUGS` from catch-all generation THEN the real public build exits 0 at exactly the recorded RED page count (route count unchanged — the static `/docs/theming` route still owns the destination), the real module derivation reports a `guides` group with exactly 1 entry at href `/docs/theming` ordered after every `getting-started` entry, and the built page's `nav[data-docs-nav]` region carries exactly 1 `/docs/theming` anchor inside the section titled `Guides`.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real docs-navigation module derived over the real authored collection, the real Astro public build, the built dist nav HTML, and the real Playwright orientation spec
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts
- TEST_FUNCTION: runThemingNavInclusionProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-VIS-001-1-1","use_case_ref":"UC-DOCS-01","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real docs-navigation module derived over the real authored collection, the real Astro public build, the built dist nav HTML, and the real Playwright orientation spec","negative_control":{"would_fail_if":["GREEN is claimed from a source grep over docs-navigation.ts or a hand-authored nav fixture instead of the real module derivation over the real authored collection, the real public build, and the built dist HTML.","The fix adds theming to publishedDocs as well, so the catch-all generates a second /docs/theming destination and the build page count changes - the static route no longer owns the destination.","A mocked entries array or a static nav snapshot replaces the real content-directory parse, so a manuscript change can silently drift the proof."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_without_theming_nav_entry","action":{"actor":"cli_user","steps":["Pre-change RED: on the isolated candidate, run the exact selector; the harness imports the real docs-navigation module, derives sectionNavigation and publishedDocs over entries parsed from the real content directory, runs the real pnpm --filter @rnr-ai-elements/docs build, and reads the built dist nav HTML; it records the gap in red.json.","Land the one semantic line: sectionNavigation includes the reserved theming entry under its authored guides section while publishedDocs keeps excluding RESERVED_DOC_SLUGS from catch-all generation; update the module responsibility comment.","Rerun the identical selector; confirm the guides group with exactly 1 /docs/theming entry ordered after every getting-started entry, the publishedDocs baseline unchanged, build exit 0 at exactly the RED page count, and the built nav HTML carrying the link inside the Guides section."]},"end_state":{"must_observe":["red.json records the pre-change run: sectionNavigation over the real collection with (0) /docs/theming entries and (0) guides groups, the publishedDocs output (6 entries at planning time, (0) of them theming), the real build page count (68 at planning time), (0) /docs/theming anchors inside the built nav[data-docs-nav] region, and the candidate SHA.","green.json records the post-change run: a guides group with exactly 1 entry at /docs/theming ordered after every getting-started entry, the publishedDocs output identical to the RED baseline, build exit 0 at exactly the RED page count, and exactly 1 /docs/theming anchor inside the nav region section titled Guides on the built introduction page.","The static theming.astro route still owns /docs/theming: the build emits exactly one destination for it and the catch-all fan-out count is unchanged."],"must_not_observe":["A build page count delta between the recorded RED and GREEN runs, a second generated route for /docs/theming, or theming admitted into publishedDocs.","GREEN claimed from a source grep, a dev-server render, or an authored nav fixture instead of the real module derivation, the real build, and the built dist HTML.","The nav inclusion reported with (0) real build observations - the empty signature of a static shell."]}}]}
```

#### AC-2: Preserved contracts, unchanged route generation, static gates, and the two-file diff

GIVEN the landed line WHEN the candidate is inspected THEN the real `orientation-content.spec.ts` run (chromium-desktop project) exits 0 with its nav relative-order assertions intact (introduction, installation, CLI, Dark mode still strictly ordered inside `nav[data-docs-nav]`, every internal link resolving), the `publishedDocs` derivation over the real collection equals its RED baseline (still (0) theming entries — the catch-all excludes the reserved slug from generation), `pnpm typecheck` and the scoped Biome command exit 0, and the tracked-file diff is exactly the modified `docs-navigation.ts` plus the new harness.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real Playwright orientation spec over the built preview, the real module derivation, the real TypeScript compiler, and the real Biome linter
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts
- TEST_FUNCTION: runThemingNavInclusionProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-VIS-001-1-2","use_case_ref":"UC-DOCS-01","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"the real Playwright orientation spec over the built preview, the real module derivation, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["Theming lands inside the getting-started group or ahead of a getting-started entry, so the orientation-content.spec.ts relative-order assertions break instead of holding with theming in its own guides group after them.","The Playwright spec run is replaced by an authored pass flag or a cached receipt instead of the real chromium-desktop project exit code.","Static gates fail without the stash-proven pre-existing record, or any path outside the allowlist changes."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_without_theming_nav_entry","action":{"actor":"cli_user","steps":["Run the real pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --project=chromium-desktop on the landed candidate; require exit 0 with the nav relative-order assertions intact.","Confirm the publishedDocs derivation over the real collection equals its RED baseline - the catch-all still excludes theming from generation.","Run pnpm typecheck and the scoped Biome command on the candidate; prove any failure pre-existing with git stash && rerun before recording it; confirm the tracked-file diff is exactly apps/docs/src/lib/docs-navigation.ts and the new harness."]},"end_state":{"must_observe":["The real Playwright run exits 0: nav lists all four getting-started pages in the order introduction, installation, CLI, Dark mode, and every internal link resolves.","The publishedDocs derivation is identical to the RED baseline (still (0) theming entries), so route generation never admits the reserved slug.","pnpm typecheck and the scoped Biome command exit 0 (or carry the stash-proven pre-existing record); the tracked-file diff is exactly the modified module plus the new harness."],"must_not_observe":["Theming inserted among the getting-started entries, a reordered getting-started sequence, or a broken internal link.","Any changed path beyond docs-navigation.ts, the harness, and the owned .tmp evidence.","The preserved-contract proof reported with (0) real Playwright observations or (0) nav[data-docs-nav] theming anchors - the empty signature of an authored pass flag standing in for the pre-change absence."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The harness's real module derivation, real build, and built dist HTML prove the guides group with exactly 1 `/docs/theming` entry at an unchanged page count and an unchanged `publishedDocs` baseline, with the pre-change absence recorded in red.json. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts`
- TC-2 → AC-2: The harness's real Playwright spec run exits 0 with the relative-order assertions intact; the static gates pass; the tracked-file diff is exactly the modified module plus the harness. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts`

### SHARED FIXTURES

```json
{"trunk_without_theming_nav_entry":{"description":"An isolated candidate worktree of trunk (Source SHA a35760fabd1c61622173e0019d932d4a0e7ac865) with ORI-AST-003's static /docs/theming route landed and ORI-VIS-001's presentation branch absent, where sectionNavigation over the real collection carries (0) theming entries so no docs page's section nav links /docs/theming and the Guides group never renders, plus the owned .tmp/FIX-ORI-VIS-001-1 evidence root.","seed_method":"cli","records":["The gitignored generated apps/docs/src/data/registry-items.json is absent in a fresh worktree and gates pnpm typecheck - copy or regenerate it via pnpm registry:build inside the worktree; never commit it (stash-proven pre-existing behavior recorded in FIX-ORI-AI-002-1's handoff).","The build page count literal is the one observed at the RED run - 68 at planning time; the invariant is UNCHANGED between RED and GREEN, since the change adds no route: the static theming.astro route already owns /docs/theming.","github-slugger resolves for a repo-root tsx harness through apps/docs/node_modules and frontmatter parses with the real js-yaml from the pnpm store - both the theming-manuscript.test.ts precedent; never a hand-rolled YAML reader.","Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells; the working shapes are the clean-env invocation (env -i with explicit pnpm/node PATH) and the direct binary - prove a biome failure environmental before treating it as a gate failure."]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- apps/docs/src/lib/docs-navigation.ts (MODIFY)
- tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts (NEW)
- .tmp/FIX-ORI-VIS-001-1/red.json (NEW)
- .tmp/FIX-ORI-VIS-001-1/green.json (NEW)
- .tmp/FIX-ORI-VIS-001-1/run.json (NEW)

Build outputs (apps/docs/dist/**, apps/docs/.astro/**, apps/docs/node_modules/.vite/**) and the worktree-local regenerated registry-items.json are side effects of the allowed commands in the isolated candidate — gitignored, never committed, never hand-edited. No other path may change.

writeProhibited:

- apps/docs/src/pages/** (the static theming.astro route and the catch-all [id].astro fan-out stay byte-unchanged)
- apps/docs/src/layouts/** · apps/docs/src/components/** · apps/docs/src/styles/**
- apps/docs/src/content/** (the landed manuscripts stay byte-exact)
- apps/docs/src/data/** · apps/docs/src/islands/** · apps/docs/src/scripts/**
- scripts/docs-data/**
- tests/sprint-05-orient-search/** (every path except the writeAllowed harness)
- apps/example/** · packages/** · pnpm-lock.yaml · .github/**
- .spec/** · .kb-run-sprint/**
- human-flows.json · gate-plan.json
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- If the RED build page count is not 68 because trunk legitimately moved — merged tasks added pages — record the observed count and proceed; the invariant is UNCHANGED, not the literal.
- If any consumer of the nav appears on trunk before this task lands (a second Guides entry, a nav-shape-pinning test), report for a scope check instead of adjusting the oracle.
- If the real Playwright spec fails on a leg unrelated to navigation order, stash-prove it pre-existing before recording; never weaken the spec.
- If `pnpm typecheck` fails in the fresh worktree on the missing generated registry-items.json, copy or regenerate it (never commit); if it still fails, stash-prove pre-existing before recording.

### DELIVERABLE

- `apps/docs/src/lib/docs-navigation.ts`: the one semantic line — `sectionNavigation` includes the reserved theming entry under its authored `'guides'` section; `publishedDocs` exclusion unchanged; responsibility comment updated.
- `tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts`: the minimal proof harness (`runThemingNavInclusionProof`) — real module derivation + real build + built dist nav HTML RED/GREEN assertions plus the preserved orientation spec run.
- `.tmp/FIX-ORI-VIS-001-1/red.json`, `green.json`, `run.json`: the bound RED/GREEN observations.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; on the isolated candidate (line absent) run the exact selector — the harness captures the real module derivation, the real build page count, and the built nav HTML absence in red.json, candidate SHA bound. Wait for orchestrator verification of RED.
2. GREEN: land the one semantic line; rerun the identical selector (guides group with exactly 1 theming entry, publishedDocs baseline unchanged, build page count unchanged, built nav HTML carrying the anchor, orientation spec exit 0); then run the preserved static gates. No REFACTOR is expected — the product change is one derivation line.
3. Hand the candidate and evidence to astro-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `apps/docs/src/lib/docs-navigation.ts` [PRIMARY PATTERN] — the module under change: RESERVED_DOC_SLUGS, publishedDocs (route generation), sectionNavigation (nav derivation), the responsibility comment to update.
2. `.kb-run-sprint/sprint-05-orient-search/ORI-VIS-001/cycle-1.blocked.json` — the blocked report this task resolves (the observed nav hrefs, the derivation split, the write-allowlist blocker).
3. `apps/docs/src/pages/docs/theming.astro` — the static route that owns the destination and already consumes `sectionNavigation(entries)` through MarkdownLayout.
4. `tests/sprint-05-orient-search/orientation-content.spec.ts` — the preserved relative-order contract the change must not disturb (lines 399-416) and the nav region selector (`nav[data-docs-nav]`).
5. `tests/sprint-05-orient-search/tutorial-designation-proof.test.ts` — the sibling FIX harness pattern for a MODIFY task (real build child, page-count oracle, RED/GREEN evidence binding).

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts
```

Preserved verification commands:

```sh
pnpm typecheck
pnpm exec biome ci apps/docs/src/lib/docs-navigation.ts tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts
```

Command contract: the harness runs the real `pnpm --filter @rnr-ai-elements/docs build` (registry + gallery + astro build) as a child from the repository root, then reads the built dist HTML — and in GREEN runs the real `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --project=chromium-desktop` as a child, recording its exit code. A fresh worktree needs the gitignored generated `apps/docs/src/data/registry-items.json` present for `pnpm typecheck` (copy or regenerate via `pnpm registry:build`, never commit). Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells; the working shapes are the clean-env invocation (env -i with explicit pnpm/node PATH) and the direct binary — prove a biome failure environmental before treating it as a gate failure. The fallow pre-commit gate fails on any NEW finding including function size/complexity — keep the harness decomposed (sibling feedback from FIX-ORI-CI-001-1).

### EVIDENCE GATES

1. Prerequisites: the isolated candidate established at the recorded SHA; ORI-AST-003's static theming route present; the authored collection present; registry-items.json present or regenerated.
2. Functional RED: the exact selector against the pre-change candidate, captured in red.json ((0) theming entries in the derivation, (0) guides groups, the publishedDocs baseline, the build page count, the nav-region absence, candidate SHA). Wait for orchestrator verification.
3. GREEN: the identical selector post-change (guides group with exactly 1 theming entry, publishedDocs baseline unchanged, build page count unchanged, built nav HTML anchor inside the Guides section, orientation spec exit 0), then the static gates.
4. Evidence: run.json binds candidate source and harness hashes, exact commands, exit codes, observed counts, and the nav-region anchors; the owned children stopped on every exit path. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, the nav observations, and exact two-file scope compliance.

Planned evidence paths: .tmp/FIX-ORI-VIS-001-1/red.json, .tmp/FIX-ORI-VIS-001-1/green.json, .tmp/FIX-ORI-VIS-001-1/run.json. Teardown: stop only owned children; leave the candidate with exactly the modified module and the harness.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. FLOW-DOCS-01-theming-and-section-nav remains owned by ORI-CONT-004; the locked gate steps, human-flows.json, and gate-plan.json are unchanged — the gate flows read a nav that will carry the link; no flow evidence writes, no journey proofs.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-AST-003 (completed — merged 446c98b17270070ac354d9250d4a009d53dfec4e, the theming route owner whose own module comment anticipated this adaptation).

Blocks: ORI-VIS-001's cycle-2 GREEN — its AC-2 theming member flips green once this line reaches trunk and its branch merges; indirectly ORI-VIS-002 through ORI-VIS-005, ORI-CONT-004, ORI-AST-010, ORI-CI-004 and every task chained behind ORI-VIS-001.

Provides: `/docs/theming` present in every rendered page's section navigation under the `Guides` group, with the catch-all generation exclusion unchanged.

Consumes: ORI-AST-003's static theming route and the MarkdownLayout nav wiring; ORI-CONT-002's authored theming.mdx frontmatter (section guides, order 1); ORI-VIS-001's blocked report naming the derivation split.

References: CAP-DOCS-01; UC-DOCS-01.

Provenance: planner ask `ask-wave18-add-theming-nav-inclusion` (wave-18, sequence next); source task ORI-VIS-001 (blocked cycle 1, commit 1c732dc1a571e9747def76b06efb1a9e3788a253; report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-VIS-001/cycle-1.blocked.json`, sha256 6e153cd8e6df6e8acb03b93ff6da64c56ed2e3e1805e3b14690b40b200ee9444, item ORI-VIS-001:blocked:1:scope_impact:0); proposed by astro-planner.

### OUT OF SCOPE

Any change to the static theming route, the catch-all template, MarkdownLayout, content manuscripts, the search surface, or human-flows.json; admitting the reserved slug into route generation; a second navigation gate; ORI-VIS-001's in-flight branch; dependency or lockfile changes; journey proofs; planning-artifact edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: functional RED (the pre-change derivation and nav-region absence with the publishedDocs baseline and build page count) and GREEN bound to the real module, the real build, and the built dist HTML; build page count exactly unchanged; the guides group with exactly 1 theming entry ordered after every getting-started entry; publishedDocs identical to its RED baseline; the orientation spec exit 0; static gates green or stash-proven pre-existing; only the allowlisted files changed; no stub, fake success, or authored count. Should verify: the responsibility comment states the generation/navigation split; the nav link lands in the Guides group rather than among getting-started entries; the nav-inclusion claim is not presented as ORI-VIS-001 acceptance. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-VIS-001-1","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"trunk_without_theming_nav_entry":{"description":"An isolated candidate worktree of trunk (Source SHA a35760fabd1c61622173e0019d932d4a0e7ac865) with ORI-AST-003's static /docs/theming route landed and ORI-VIS-001's presentation branch absent, where sectionNavigation over the real collection carries (0) theming entries so no docs page's section nav links /docs/theming and the Guides group never renders, plus the owned .tmp/FIX-ORI-VIS-001-1 evidence root.","seed_method":"cli","records":["The gitignored generated apps/docs/src/data/registry-items.json is absent in a fresh worktree and gates pnpm typecheck - copy or regenerate it via pnpm registry:build inside the worktree; never commit it (stash-proven pre-existing behavior recorded in FIX-ORI-AI-002-1's handoff).","The build page count literal is the one observed at the RED run - 68 at planning time; the invariant is UNCHANGED between RED and GREEN, since the change adds no route: the static theming.astro route already owns /docs/theming.","github-slugger resolves for a repo-root tsx harness through apps/docs/node_modules and frontmatter parses with the real js-yaml from the pnpm store - both the theming-manuscript.test.ts precedent; never a hand-rolled YAML reader.","Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells; the working shapes are the clean-env invocation (env -i with explicit pnpm/node PATH) and the direct binary - prove a biome failure environmental before treating it as a gate failure."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"The nav derivation includes theming while route generation still excludes it","primary":true,"description":"GIVEN trunk where sectionNavigation over the real authored collection carries (0) /docs/theming entries and (0) guides groups - so no docs page's section nav links /docs/theming and the Guides group never renders (ORI-VIS-001 cycle-1 blocked report) WHEN the reserved theming entry is included in the sectionNavigation derivation only, under its authored 'guides' section, while publishedDocs keeps excluding RESERVED_DOC_SLUGS from catch-all generation THEN the real public build exits 0 at exactly the recorded RED page count (route count unchanged - the static /docs/theming route still owns the destination), the real module derivation reports a guides group with exactly 1 entry at href /docs/theming ordered after every getting-started entry, and the built page's nav[data-docs-nav] region carries exactly 1 /docs/theming anchor inside the section titled Guides.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts","test_function":"runThemingNavInclusionProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts","test_tier":"integration","verification_service":"the real docs-navigation module derived over the real authored collection, the real Astro public build, the built dist nav HTML, and the real Playwright orientation spec","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-VIS-001-1-1","use_case_ref":"UC-DOCS-01","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"the real docs-navigation module derived over the real authored collection, the real Astro public build, the built dist nav HTML, and the real Playwright orientation spec","negative_control":{"would_fail_if":["GREEN is claimed from a source grep over docs-navigation.ts or a hand-authored nav fixture instead of the real module derivation over the real authored collection, the real public build, and the built dist HTML.","The fix adds theming to publishedDocs as well, so the catch-all generates a second /docs/theming destination and the build page count changes - the static route no longer owns the destination.","A mocked entries array or a static nav snapshot replaces the real content-directory parse, so a manuscript change can silently drift the proof."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_without_theming_nav_entry","action":{"actor":"cli_user","steps":["Pre-change RED: on the isolated candidate, run the exact selector; the harness imports the real docs-navigation module, derives sectionNavigation and publishedDocs over entries parsed from the real content directory, runs the real pnpm --filter @rnr-ai-elements/docs build, and reads the built dist nav HTML; it records the gap in red.json.","Land the one semantic line: sectionNavigation includes the reserved theming entry under its authored guides section while publishedDocs keeps excluding RESERVED_DOC_SLUGS from catch-all generation; update the module responsibility comment.","Rerun the identical selector; confirm the guides group with exactly 1 /docs/theming entry ordered after every getting-started entry, the publishedDocs baseline unchanged, build exit 0 at exactly the RED page count, and the built nav HTML carrying the link inside the Guides section."]},"end_state":{"must_observe":["red.json records the pre-change run: sectionNavigation over the real collection with (0) /docs/theming entries and (0) guides groups, the publishedDocs output (6 entries at planning time, (0) of them theming), the real build page count (68 at planning time), (0) /docs/theming anchors inside the built nav[data-docs-nav] region, and the candidate SHA.","green.json records the post-change run: a guides group with exactly 1 entry at /docs/theming ordered after every getting-started entry, the publishedDocs output identical to the RED baseline, build exit 0 at exactly the RED page count, and exactly 1 /docs/theming anchor inside the nav region section titled Guides on the built introduction page.","The static theming.astro route still owns /docs/theming: the build emits exactly one destination for it and the catch-all fan-out count is unchanged."],"must_not_observe":["A build page count delta between the recorded RED and GREEN runs, a second generated route for /docs/theming, or theming admitted into publishedDocs.","GREEN claimed from a source grep, a dev-server render, or an authored nav fixture instead of the real module derivation, the real build, and the built dist HTML.","The nav inclusion reported with (0) real build observations - the empty signature of a static shell."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Preserved contracts, unchanged route generation, static gates, and the two-file diff","primary":false,"description":"GIVEN the landed line WHEN the candidate is inspected THEN the real orientation-content.spec.ts run (chromium-desktop project) exits 0 with its nav relative-order assertions intact (introduction, installation, CLI, Dark mode still strictly ordered inside nav[data-docs-nav], every internal link resolving), the publishedDocs derivation over the real collection equals its RED baseline (still (0) theming entries - the catch-all excludes the reserved slug from generation), pnpm typecheck and the scoped Biome command exit 0, and the tracked-file diff is exactly the modified docs-navigation.ts plus the new harness.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts","test_function":"runThemingNavInclusionProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts","test_tier":"integration","verification_service":"the real Playwright orientation spec over the built preview, the real module derivation, the real TypeScript compiler, and the real Biome linter","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-VIS-001-1-2","use_case_ref":"UC-DOCS-01","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"the real Playwright orientation spec over the built preview, the real module derivation, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["Theming lands inside the getting-started group or ahead of a getting-started entry, so the orientation-content.spec.ts relative-order assertions break instead of holding with theming in its own guides group after them.","The Playwright spec run is replaced by an authored pass flag or a cached receipt instead of the real chromium-desktop project exit code.","Static gates fail without the stash-proven pre-existing record, or any path outside the allowlist changes."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_without_theming_nav_entry","action":{"actor":"cli_user","steps":["Run the real pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --project=chromium-desktop on the landed candidate; require exit 0 with the nav relative-order assertions intact.","Confirm the publishedDocs derivation over the real collection equals its RED baseline - the catch-all still excludes theming from generation.","Run pnpm typecheck and the scoped Biome command on the candidate; prove any failure pre-existing with git stash && rerun before recording it; confirm the tracked-file diff is exactly apps/docs/src/lib/docs-navigation.ts and the new harness."]},"end_state":{"must_observe":["The real Playwright run exits 0: nav lists all four getting-started pages in the order introduction, installation, CLI, Dark mode, and every internal link resolves.","The publishedDocs derivation is identical to the RED baseline (still (0) theming entries), so route generation never admits the reserved slug.","pnpm typecheck and the scoped Biome command exit 0 (or carry the stash-proven pre-existing record); the tracked-file diff is exactly the modified module plus the new harness."],"must_not_observe":["Theming inserted among the getting-started entries, a reordered getting-started sequence, or a broken internal link.","Any changed path beyond docs-navigation.ts, the harness, and the owned .tmp evidence.","The preserved-contract proof reported with (0) real Playwright observations or (0) nav[data-docs-nav] theming anchors - the empty signature of an authored pass flag standing in for the pre-change absence."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The harness's real module derivation, real build, and built dist HTML prove the guides group with exactly 1 /docs/theming entry at an unchanged page count and an unchanged publishedDocs baseline, with the pre-change absence recorded in red.json.","verify":"pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The harness's real Playwright spec run exits 0 with the relative-order assertions intact; the static gates pass; the tracked-file diff is exactly the modified module plus the harness.","verify":"pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts","maps_to_ac":"AC-2"}]}
-->
</details>

## Handoff

```json
{
  "task": "FIX-ORI-VIS-001-1",
  "commit_sha": "01837e2ea0c1c42f4ca5a76fb37ad2d0e181adce",
  "done": "Landed on trunk (merged as dce97e7a772f): the derivation split in apps/docs/src/lib/docs-navigation.ts where sectionNavigation now derives from the non-draft set including reserved slugs (apps/docs/src/lib/docs-navigation.ts:132) while publishedDocs keeps excluding RESERVED_DOC_SLUGS from route generation (apps/docs/src/lib/docs-navigation.ts:95), implemented through a shared toPublishedDocs map+sort helper (apps/docs/src/lib/docs-navigation.ts:68) with the header responsibility comment restated as the generation/navigation split; plus the task-owned proof harness tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts and the RED/GREEN/RUN evidence triple at .tmp/FIX-ORI-VIS-001-1/, so every rendered docs page's section nav now reaches /docs/theming inside a Guides group at an unchanged build page count (69) and ORI-VIS-001's AC-2 theming member is satisfiable once its branch meets trunk.",
  "deviations": [
    "The build page count is 69, not the planning-time literal 68, because trunk moved; the task's BOUNDARIES section pre-authorized recording the observed count with the invariant UNCHANGED (RED 69 = GREEN 69).",
    "The 'one semantic line' required a small shared helper (toPublishedDocs) to avoid duplicating the map+sort across both consumers; publishedDocs behavior is byte-equivalent (filter-then-map equals map-then-filter on identical inputs) and review approved.",
    "RED was captured twice: the first RED runs used earlier harness revisions whose theming_page_built flag was sampled before the build ran (a false negative on a fresh worktree), so the final RED was re-captured under the final harness via a git stash roundtrip of only docs-navigation.ts, making red.json and green.json bind identical harness bytes.",
    "Harness filename theming-nav-inclusion-proof.test.ts and evidence root .tmp/FIX-ORI-VIS-001-1/ follow the task's writeAllowed spellings, which differ from variant spellings used in the task's VERIFY and prose lines."
  ],
  "concerns": [
    "Repo-wide pnpm lint (biome ci .) fails at trunk on pre-existing findings in scripts/docs-data/authored-snippets.ts and tests/sprint-05-orient-search/authored-snippet-gate.test.ts plus a biome.json 'recommended' deprecation warning, so every commit in this repo now depends on the documented transient clearing on retry.",
    "The preserved orientation spec writes into tracked evidence at .tmp/ORI-CONT-001/cycle-1/green/** on every run, dirtying another task's committed files; I restored them byte-exact before committing, but every future rerun of that spec recreates the dirt.",
    "Playwright side effects (apps/docs/playwright-report/ and test-results/) are untracked and not gitignored; my harness removes them and records the removal, but any manual playwright run recreates them."
  ],
  "findings": [
    "The built nav oracle shape: nav[data-docs-nav] contains one section.docs-nav__section per group with an h2.docs-nav__section-title (labels 'Getting started', 'Guides', 'Porting') and plain anchor lists (apps/docs/src/layouts/MarkdownLayout.astro:49-67), which is what the harness parses instead of a whole-HTML grep.",
    "No consumer edit was needed: theming.astro already derives its nav from sectionNavigation(entries) and the catch-all derives per-route nav the same way, so the static route lit up automatically once the derivation changed.",
    "A repo-root tsx harness can import apps/docs/src/lib/docs-navigation.ts directly because github-slugger resolves through the apps/docs node_modules upward walk, with js-yaml resolved from the pnpm store (theming-manuscript.test.ts precedent).",
    "Built-artifact observations must be sampled after the harness's own build, never at identity-capture time: dist does not exist in a fresh worktree before the first build, which produced a false theming_page_built=false in the first RED run.",
    "rtk both garbles identifier words in displayed content and can mask exit codes (my blocked commit printed commit_exit=0 while fallow had failed and HEAD had not moved); real tool exit codes plus git log verification are the only trustworthy oracle."
  ],
  "scope_impact": [
    {
      "target": "ORI-VIS-001",
      "found": "Its cycle-1 blocked report's named gap (theming absent from every page's section nav) is now fixed on trunk at merged dce97e7a772f, with the nav link landing in the Guides group rather than among getting-started entries so its relative-order assertions still hold.",
      "change": "None to its files — its cycle-2 GREEN can proceed once its branch meets trunk; it should keep reading the nav via the nav[data-docs-nav]-scoped selector, since whole-HTML greps pass even without the fix."
    },
    {
      "target": "ORI-CONT-001",
      "found": "The orientation spec's own evidence writes target tracked files under .tmp/ORI-CONT-001/cycle-1/green/**, so any rerun dirties that task's committed captures and screenshots.",
      "change": "Its owner should either gitignore the regenerable captures/screenshots or add a restore step, so reruns stop dirtying tracked evidence."
    },
    {
      "target": "ROADMAP",
      "found": "Repo-wide lint debt (authored-snippets.ts, authored-snippet-gate.test.ts) now gates every commit behind a retry lottery, and the pre-commit hook's three gates (typecheck, lint, fallow) enforce fallow complexity thresholds on all new test code.",
      "change": "Schedule a small cleanup task for the two pre-existing lint findings and the biome.json migration, and note in task templates that proof harnesses must be authored decomposed under fallow thresholds."
    }
  ],
  "feedback": [
    "Verify commits with git log, never by command exit code: the pre-commit hook's transient lint failure plus rtk exit masking made a rejected commit report success, and only git log showed HEAD unmoved.",
    "The fallow gate rejected my first harness (assertGreen 84 lines CRITICAL, runThemingNavInclusionProof 106 lines HIGH, redSummary cyclomatic 16) exactly as the FIX-ORI-CI-001-1 sibling feedback predicted, so author harnesses decomposed into per-concern asserters from the start.",
    "For RED/GREEN tasks, capture both phases under identical harness bytes (stash the product change, re-run RED, pop, run GREEN) so the evidence's harness_sha256 fields match and reviewers need not adjudicate harness drift.",
    "The two sibling worktrees and strict-port preview contract worked as designed: the playwright webServer's port guard plus CI=true prevented any 4321 squatting across the concurrent CI-002 work."
  ]
}
```
