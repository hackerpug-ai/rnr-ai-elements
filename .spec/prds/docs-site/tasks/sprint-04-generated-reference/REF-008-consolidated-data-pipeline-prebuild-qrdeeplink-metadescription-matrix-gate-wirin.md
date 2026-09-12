<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-008: Consolidated data pipeline — prebuild qrDeepLink/metaDescription + matrix gate wiring + imagery flag (single owner of prebuild.ts + gates.ts)

> Status: ⬜ Pending
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 5 · Type: FEATURE · Wave: B
> Proposed By: astro-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Extend the one composition point of the docs data path with the two TR-03 derived fields (qrDeepLink, metaDescription), wire REF-007's matrix dataset into the fail-closed gate chain, and add the flag-gated imagery gate — re-pinning the sprint-01 contract tests in the same commit.

## Why
The ordered chain emits a 56-entry dataset whose every entry carries the 16 contract keys in order with correct qrDeepLink/metaDescription; runAllGates enforces the matrix shape and the DOCS_GATE_IMAGERY fail-once pair; the two MODIFY'd sprint-01 vitest files pass their extended tokens; default builds behave exactly as before.

## How to verify
pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation

## Scope
scripts/docs-data/prebuild.ts (MODIFY); scripts/docs-data/gates.ts (MODIFY); package.json (MODIFY); tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts (MODIFY); tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts (MODIFY)

<details>
<summary>▸ Full agent specification (REF-008 — required reading for implementer + reviewer)</summary>

TASK: REF-008 — Consolidated data pipeline — prebuild qrDeepLink/metaDescription + matrix gate wiring + imagery flag (single owner of prebuild.ts + gates.ts)
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 5
AGENT: implementer=astro-implementer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/5 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: CONTRACT_KEYS in scripts/docs-data/prebuild.ts and the pinned copy in tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts both enumerate the 16 keys in the same order within one commit
- MUST: qrDeepLink derives from the app.json expo.scheme read at build time — the tests compute their expected values from apps/example/app.json too, never from the literal 'ai-elements-example'
- MUST: metaDescription reuses oneLineDescription from apps/docs/src/lib/one-line-description.ts as its single one-line source
- MUST: the matrix gate reads the committed apps/docs/src/data/dev-client-matrix.json and fails closed naming the offending entry for shape violations: entry count != 4, a name absent from {enriched-markdown, streamdown, speech-recognition, extended-audio}, a registry-absent name, empty peers[], empty permissions.ios[] or permissions.android[]
- MUST: the imagery gate reads DOCS_GATE_IMAGERY from the environment; an unset flag produces 0 imagery violations over the real 56-item dataset
- MUST: every mutation drill byte-exact-restores the touched real file in a finally block (the sprint-01 shimmer-drill precedent)
- NEVER: never delete or reorder the existing 14 CONTRACT_KEYS entries — only append qrDeepLink then metaDescription
- NEVER: never mutate packages/registry/registry.json or hand-edit apps/docs/src/data/registry-items.json (generated output of this pipeline)
- NEVER: never make the imagery gate default-on — default builds stay byte-compatible in behavior with flag off
- NEVER: never invent a second one-line clamp or a second verdict/expectation source
- STRICTLY: strictly keep scripts/docs-data node:fs/node:path discipline — qrcode stays a build-time devDependency, never a runtime dependency
- STRICTLY: strictly verify via pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/<file> -t <TOKEN> — never pnpm test, never a bare directory
- STRICTLY: strictly lint via ./node_modules/.bin/biome ci scripts/docs-data tests/sprint-01-docs-spike-skeleton — pnpm lint crashes locally

### DONE WHEN

- [ ] AC 1: qrDeepLink + metaDescription derived into the 16-key contract dataset
- [ ] AC 2: Default build unchanged — imagery gate inert with the flag off
- [ ] AC 3: Matrix shape gate passes the real committed four-entry dataset
- [ ] AC 4: Matrix gate fails closed naming the offending entry, then restores byte-exact
- [ ] AC 5: Imagery flag pair — flag ON with null imagery exits non-zero naming the item
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: qrDeepLink + metaDescription derived into the 16-key contract dataset**

  GIVEN/WHEN/THEN: GIVEN the real tree with the ordered chain (registry:build → gallery:manifest → docs build) and the re-pinned CONTRACT_KEYS enumerating 16 keys WHEN the extended derivation runs (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation over the real chain) THEN every one of the 56 emitted entries carries qrDeepLink == expo.scheme + '/' + name with the scheme read from apps/example/app.json, in the 16-key contract order with qrDeepLink then metaDescription appended after themingNote

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts · TEST_FUNCTION: REF-008-qr-metalink-derivation
  VERIFY: `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation`
  VERIFICATION_SERVICE: real ordered build chain (registry:build, gallery:manifest, docs build) producing apps/docs/src/data/registry-items.json read under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Pure build-time field derivation over the real registry dataset asserted by this task's own MODIFY'd vitest file — a real ordered-chain run and JSON reads, no rendering, no network, no DB.
  SCENARIO:
    - START_REF real_build_inputs → MUST_OBSERVE [56/56 entries carry Object.keys in the pinned 16-key order ending [...,'props','usageSnippet','themingNote','qrDeepLink','metaDescription']; conversation's qrDeepLink == 'ai-elements-example/conversation' (scheme read from app.json, expected value computed from app.json in the test); conversation's metaDescription starts with its title followed by ' — ' and ends with ' forReact Native, installable via the nativewind/uniwind registry tree'; the metaDescription one-line segment equals oneLineDescription(item.description) byte-for-byte on all 39 component entries] / MUST_NOT_OBSERVE [0 entries missing qrDeepLink or metaDescription (56/56 carry both); a metaDescription containing the full unclamped description (length > 200 chars on any entry); a qrDeepLink value not starting with the app.json scheme]
    - NEGATIVE_CONTROL: would fail if ["qrDeepLink is a hard-coded 'ai-elements-example/...' literal — changing app.json's scheme leaves the field stale and the app.json-derived expectation diverges", 'metaDescription re-implements a second clamp — the oneLineDescription single-source expectation fails', 'a static stub emits canned fields for 1 sample item — the 56/56 loop over real entries fails']

**AC-2: Default build unchanged — imagery gate inert with the flag off**

  GIVEN/WHEN/THEN: GIVEN the real 56-item dataset where every item's imagery is null and the env var DOCS_GATE_IMAGERY is unset WHEN runAllGates executes over the real dataset (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag) THEN the aggregate holds 0 imagery violations and the clean dataset still passes all gates

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts · TEST_FUNCTION: REF-008-imagery-flag
  VERIFY: `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag`
  VERIFICATION_SERVICE: real gates.ts module execution over loadDefaultDataset() under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Gate-module behavior over the real dataset under vitest — pure function execution on real JSON inputs, no rendering, no network, no DB.
  SCENARIO:
    - START_REF real_build_inputs → MUST_OBSERVE [imagery violations == 0 with the flag unset; runAllGates returns without throwing over the clean 56-item dataset; the gates CLI success line names 6 gates: 'count, files, props, family, verdict, matrix gates pass'] / MUST_NOT_OBSERVE [an imagery GateError thrown with 0 flags set (default-on regression); 0 gates named in the CLI success line (stale five-gate line)]
    - NEGATIVE_CONTROL: would fail if ['the gate is default-on — the unset-flag run over the all-null-imagery dataset throws and the 0-violation assertion fails', 'the gate is a no-op stub that never reads the flag — the flag-on pair case in AC-5 fails', 'the wiring skips the gate entirely — the extended CLI success line omits its name']

**AC-3: Matrix shape gate passes the real committed four-entry dataset**

  GIVEN/WHEN/THEN: GIVEN REF-007's committed apps/docs/src/data/dev-client-matrix.json with exactly enriched-markdown, streamdown, speech-recognition, extended-audio, each with non-empty peers[] and permissions{ios[],android[]} WHEN runAllGates executes with the matrix gate wired (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate) THEN the matrix gate contributes 0 violations over the real dataset and the real prebuild chain exits 0

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts · TEST_FUNCTION: REF-008-matrix-gate
  VERIFY: `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate`
  VERIFICATION_SERVICE: real gates.ts matrix gate over the committed dev-client-matrix.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Gate-module behavior over REF-007's real committed dataset plus a real prebuild run — JSON reads and pure gate execution, no rendering, no network, no DB.
  SCENARIO:
    - START_REF real_build_inputs → MUST_OBSERVE [matrix violations == 0 over the committed 4-entry dataset; the entry count assertion pins exactly 4 entries; all 4 names — enriched-markdown, streamdown, speech-recognition, extended-audio — match registry dataset names] / MUST_NOT_OBSERVE [a violation naming any of the 4 committed entries (false positive); 0 entries read from a missing or empty file path]
    - NEGATIVE_CONTROL: would fail if ['the gate derives its expected four names from the dataset itself — the mutated-name drill in AC-4 passes against its own mutation', 'the gate is a stub returning an empty violations array — the shape-violation drill in AC-4 fails', 'the committed dataset is never read — a missing file yields 0 violations instead of failing closed']

**AC-4: Matrix gate fails closed naming the offending entry, then restores byte-exact**

  GIVEN/WHEN/THEN: GIVEN the real tree with the matrix entry 'speech-recognition' renamed to 'speech-recognition-x' on disk (byte-exact restore in a finally) WHEN the gate executes over the mutated tree (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate drill case) THEN runAllGates throws one GateError rendering '[docs-data] matrix: item "speech-recognition-x" ...' naming the offending entry

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts · TEST_FUNCTION: REF-008-matrix-gate
  VERIFY: `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate`
  VERIFICATION_SERVICE: real dev-client-matrix.json mutation + gates.ts execution + sha256-verified restore under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Fail-closed drill over the real committed file with real byte-exact restore — filesystem mutation and pure gate execution under vitest, no rendering, no network, no DB.
  SCENARIO:
    - START_REF mutated_matrix_drill → MUST_OBSERVE [the GateError message matches '[docs-data] matrix: item "speech-recognition-x"' with its violation detail; the mutated run reports 1 matrix violation naming the renamed entry; the restored file's sha256 equals the pre-mutation sha256] / MUST_NOT_OBSERVE [exit 0 over the mutated tree (fail-open); 0 violations with the count-unchanged mutation present; a leftover mutated file after the finally (restore failure)]
    - NEGATIVE_CONTROL: would fail if ["the gate omits the offending name from its violation — the pinned '[docs-data] matrix: item' shape assert fails", 'the gate checks only entry count — the renamed-entry drill (count still 4) passes vacuously', 'the mutation leaks — the post-run sha256 of dev-client-matrix.json differs from the pre-run hash']

**AC-5: Imagery flag pair — flag ON with null imagery exits non-zero naming the item**

  GIVEN/WHEN/THEN: GIVEN the real 56-item dataset with imagery null on every entry and DOCS_GATE_IMAGERY=1 exported into the gate run's environment WHEN runAllGates executes under the flag (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag flag-on case) THEN the aggregate throws a GateError rendering '[docs-data] imagery: item "<name>" missing imagery' naming the first offending item

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts · TEST_FUNCTION: REF-008-imagery-flag
  VERIFY: `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag`
  VERIFICATION_SERVICE: real gates.ts imagery gate execution with DOCS_GATE_IMAGERY=1 over loadDefaultDataset() under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Env-flag gate behavior over the real all-null-imagery dataset under vitest — pure function execution with a real environment variable, no rendering, no network, no DB.
  SCENARIO:
    - START_REF real_build_inputs → MUST_OBSERVE [the GateError message matches '[docs-data] imagery: item "<name>" missing imagery' for a real dataset name; imagery violations == 56 under the flag (one per null-imagery entry); the same invocation with the flag unset reports 0 imagery violations] / MUST_NOT_OBSERVE [exit without throwing under DOCS_GATE_IMAGERY=1 (fail-open); 0 imagery violations under the flag; a violation message naming no item (anonymous failure)]
    - NEGATIVE_CONTROL: would fail if ['the flag is unread — the flag-on run returns 0 violations like the flag-off run (no-ops gate)', "the violation omits the item name — the pinned '[docs-data] imagery: item' shape assert fails", 'the flag is checked as a hard-coded constant instead of process.env — flipping DOCS_GATE_IMAGERY changes nothing']

### TEST CRITERIA

- **TC-1** (→AC-1): 56/56 emitted entries carry the 16-key CONTRACT_KEYS order ending [props, usageSnippet, themingNote, qrDeepLink, metaDescription]. — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation`
- **TC-2** (→AC-1): Every qrDeepLink equals the app.json-derived scheme + '/' + name (conversation: 'ai-elements-example/conversation'). — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation`
- **TC-3** (→AC-1): Every metaDescription equals the TR-03 pattern string with the one-line segment byte-equal to oneLineDescription(item.description) and the 'nativewind/uniwind' engine tail. — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation`
- **TC-4** (→AC-2): runAllGates over the clean real dataset reports 0 imagery violations with DOCS_GATE_IMAGERY unset. — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag`
- **TC-5** (→AC-3): The matrix gate reports 0 violations over the committed four-entry dataset with all 4 names matching registry names. — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate`
- **TC-6** (→AC-4): The renamed-entry drill throws a GateError matching '[docs-data] matrix: item "speech-recognition-x"' with the file restored byte-identical (sha256 equal). — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate`
- **TC-7** (→AC-5): DOCS_GATE_IMAGERY=1 over the all-null dataset throws a GateError matching '[docs-data] imagery: item "<name>" missing imagery'. — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag`
- **TC-8** (→AC-1): The extended CONTRACT_KEYS pin in both MODIFY'd sprint-01 tests enumerates the identical 16-key list as scripts/docs-data/prebuild.ts within one commit. — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation`

### READING LIST (max 5)

- scripts/docs-data/prebuild.ts [PRIMARY PATTERN] lines all — the CONTRACT_KEYS serialize() composition point being extended: key order discipline, buildDataset join, gate-then-write, temp+rename emission.
- scripts/docs-data/gates.ts [PRIMARY PATTERN] lines all — the runAllGates aggregate, Violation/GateError shapes, formatViolation's pinned renderer, and the CLI success line the two new gates join.
- tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts [test pattern] lines all — the field-gate fixture drill + pinned violation strings being extended in place (extend never delete).
- apps/docs/src/lib/one-line-description.ts [single source] lines all — the FAM-002 clamp metaDescription consumes; importing it keeps the derivation single-source.
- .spec/prds/docs-site/11-technical-requirements/03-data-schema.md [contract] lines 13 — TR-03 registry_page_model: qrDeepLink and the metaDescription generated pattern '{title} — {one-line description} ... {engine} registry tree'.

### SCOPE (file-level write permissions)

writeAllowed:
- scripts/docs-data/prebuild.ts (MODIFY)
- scripts/docs-data/gates.ts (MODIFY)
- package.json (MODIFY)
- tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts (MODIFY)
- tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts (MODIFY)
writeProhibited:
- packages/registry/registry.json
- apps/docs/src/data/registry-items.json (generated)
- apps/docs/src/pages/

### CODE PATTERN
- pattern: extend the single composition point in place: append contract keys, join new gates into runAllGates' aggregate array, flag-gate the not-yet-live check, re-pin the contract tests in the same commit
- pattern_source: scripts/docs-data/prebuild.ts CONTRACT_KEYS + gates.ts runAllGates (FUSE-04/05); FIX-FAM-005-1 for the same-commit re-pin
- anti-pattern: a parallel second prebuild/gates module, deleting or reordering existing contract keys, a default-on imagery gate, a hand-typed scheme literal
- references: ['TR-03 registry_page_model — qrDeepLink + metaDescription generated-pattern fields', 'T-GEND-022 — the fail-once-live imagery gate pair (flag on: non-zero naming the item; default: 0)', 'FIX-FAM-005-1 — the extend-never-delete CONTRACT_KEYS re-pin precedent from sprint-03']
- notes: ['Wave B runs after REF-007 — the matrix gate reads the committed dev-client-matrix.json the gate enforces the shape of.', "REF-009 consumes the two new fields when assembling [item].astro; REF-011's drill exercises the new gates — both need the 16-key dataset and the wired gates from this task.", 'The build lock discipline in docs-data-prebuild.test.ts (FUSE-01 lockDir) already serializes full-chain runs; the new token rides the same file so no new lock is needed.']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01']
- provides: ["qrDeepLink derivation in DocsDataPrebuild: every emitted entry carries qrDeepLink = expo.scheme + '/' + name, scheme read at build from apps/example/app.json (ai-elements-example), never hard-coded", "metaDescription derivation in DocsDataPrebuild: TR-03 pattern '{title} — {one-line description} for React Native, installable via the {engine} registry tree', the one-line description from the single-source oneLineDescription in apps/docs/src/lib/one-line-description.ts, {engine} = engines.join('/') (nativewind/uniwind)", 'CONTRACT_KEYS extended in place from 14 to 16 keys, qrDeepLink then metaDescription appended after themingNote in contract order', 'matrix shape gate (GateName \'matrix\') wired into runAllGates reading apps/docs/src/data/dev-client-matrix.json: exactly 4 entries naming enriched-markdown, streamdown, speech-recognition, extended-audio, each with non-empty peers[] and non-empty permissions{ios[],android[]}, every name present in the registry dataset; violations render in the pinned \'[docs-data] matrix: item "<name>" ...\' shape', "imagery gate (GateName 'imagery') behind env flag DOCS_GATE_IMAGERY (default off): flag ON with null imagery exits non-zero naming the item; flag absent exits 0 (T-GEND-022)", 'gates CLI success line extended to name all six gates (count, files, props, family, verdict, matrix) — extend never delete', 'qrcode added as a root devDependency (build-time only)']
- consumes: ["apps/docs/src/data/dev-client-matrix.json (REF-007's committed four-entry dataset and its declared entry shape)", 'apps/example/app.json expo.scheme (ai-elements-example)', "apps/docs/src/lib/one-line-description.ts (FAM-002's single-source clamp)", 'the existing CONTRACT_KEYS contract and runAllGates aggregate from FUSE-05/FUSE-04']
- boundary_contracts: ['single owner of prebuild.ts AND gates.ts this sprint', 'CONTRACT_KEYS re-pins in both sprint-01 tests land in the same commit — extend never delete (FIX-FAM-005-1 precedent)', 'empty-resolved props stay legal, only unresolved types fail; default build behavior unchanged (flag off)']
- supersedes: ['tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts', 'tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts']

### VERIFICATION GATES

- AC-1/TC-1..3/TC-8: pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation — exit 0 with 56/16-key/field-derivation evidence in stdout
- AC-2/AC-5/TC-4/TC-7: pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag — exit 0 covering both flag states
- AC-3/AC-4/TC-5/TC-6: pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate — exit 0 covering clean + drill + restore
- RED-first: the three -t runs FAIL before implementation (tokens select no tests / fields absent / gates absent) — record the RED outputs
- regression: the full MODIFY'd files still pass untokened — pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts and pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts — exit 0 (existing cases untouched)
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci scripts/docs-data tests/sprint-01-docs-spike-skeleton package.json — exit 0 (never pnpm lint; local crash)
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: ['REF-007'] · Blocks: ['REF-009', 'REF-011']

### CODING STANDARDS

- node:fs/node:path discipline in scripts/docs-data; qrcode stays a root devDependency (build-time only)
- Gates stay pure: never write output files; violations render through formatViolation's pinned '[docs-data] <gate>: item "<name>"' shape
- Gate-then-write preserved: every gate runs over the in-memory dataset before any output byte lands
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-008",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_build_inputs": {
   "description": "The real tree at run time: the committed registry, app.json scheme, REF-007's matrix dataset, and the sprint-01 pinned tests. RED at task start: the new -t tokens select no tests and the derived fields are absent from the emitted dataset.",
   "seed_method": "public_api",
   "records": [
    "packages/registry/registry.json: 56 items, 39 registry:component across 7 families",
    "apps/example/app.json expo.scheme: 'ai-elements-example'",
    "apps/docs/src/data/dev-client-matrix.json (REF-007): exactly 4 entries — enriched-markdown, streamdown, speech-recognition, extended-audio — each with non-empty peers[] and non-empty permissions{ios[],android[]}",
    "ENGINES from build-registry.ts: ['nativewind', 'uniwind']",
    "all 56 items have imagery null/absent at HEAD (T-GEND-022's flag-on trigger condition)"
   ]
  },
  "mutated_matrix_drill": {
   "description": "The drill fixture the re-pinned test drives: the real dev-client-matrix.json mutated on disk (one entry renamed to a registry-absent name), the gate executed against it, then byte-exact restore in a finally — the sprint-01 shimmer-drill pattern over a different trusted file.",
   "seed_method": "cli",
   "records": [
    "mutated form: entry 'speech-recognition' renamed to 'speech-recognition-x' (count still 4, name absent from the pinned four and from the registry)",
    "gate CLI invoked over the mutated tree exits 1 naming the offending entry",
    "restore verified byte-identical via sha256 before and after"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "qrDeepLink + metaDescription derived into the 16-key contract dataset",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Pure build-time field derivation over the real registry dataset asserted by this task's own MODIFY'd vitest file — a real ordered-chain run and JSON reads, no rendering, no network, no DB.",
   "verification_service": "real ordered build chain (registry:build, gallery:manifest, docs build) producing apps/docs/src/data/registry-items.json read under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts",
   "test_function": "REF-008-qr-metalink-derivation",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Pure build-time field derivation over the real registry dataset asserted by this task's own MODIFY'd vitest file — no rendering, no network, no DB.",
    "verification_service": "real ordered build chain producing registry-items.json read under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "qrDeepLink is a hard-coded 'ai-elements-example/...' literal — changing app.json's scheme leaves the field stale and the app.json-derived expectation diverges",
      "metaDescription re-implements a second clamp — the oneLineDescription single-source expectation fails",
      "a static stub emits canned fields for 1 sample item — the 56/56 loop over real entries fails"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_build_inputs",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "run the real ordered chain so the prebuild emits the dataset",
        "read apps/docs/src/data/registry-items.json and apps/example/app.json",
        "assert the 16-key order and the two derived fields on every entry"
       ]
      },
      "end_state": {
       "must_observe": [
        "56/56 entries carry Object.keys in the pinned 16-key order ending [...,'props','usageSnippet','themingNote','qrDeepLink','metaDescription']",
        "conversation's qrDeepLink == 'ai-elements-example/conversation' (scheme read from app.json, expected value computed from app.json in the test)",
        "conversation's metaDescription starts with its title followed by ' — ' and ends with ' forReact Native, installable via the nativewind/uniwind registry tree'",
        "the metaDescription one-line segment equals oneLineDescription(item.description) byte-for-byte on all 39 component entries"
       ],
       "must_not_observe": [
        "0 entries missing qrDeepLink or metaDescription (56/56 carry both)",
        "a metaDescription containing the full unclamped description (length > 200 chars on any entry)",
        "a qrDeepLink value not starting with the app.json scheme"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real tree with the ordered chain (registry:build → gallery:manifest → docs build) and the re-pinned CONTRACT_KEYS enumerating 16 keys WHEN the extended derivation runs (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation over the real chain) THEN every one of the 56 emitted entries carries qrDeepLink == expo.scheme + '/' + name with the scheme read from apps/example/app.json, in the 16-key contract order with qrDeepLink then metaDescription appended after themingNote",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Default build unchanged — imagery gate inert with the flag off",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Gate-module behavior over the real dataset under vitest — pure function execution on real JSON inputs, no rendering, no network, no DB.",
   "verification_service": "real gates.ts module execution over loadDefaultDataset() under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "REF-008-imagery-flag",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Gate-module behavior over the real dataset under vitest — pure function execution on real JSON inputs.",
    "verification_service": "real gates.ts module execution over loadDefaultDataset() under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the gate is default-on — the unset-flag run over the all-null-imagery dataset throws and the 0-violation assertion fails",
      "the gate is a no-op stub that never reads the flag — the flag-on pair case in AC-5 fails",
      "the wiring skips the gate entirely — the extended CLI success line omits its name"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_build_inputs",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "load the real default dataset (56 items, imagery null on all)",
        "invoke runAllGates with DOCS_GATE_IMAGERY unset",
        "count imagery violations in the result"
       ]
      },
      "end_state": {
       "must_observe": [
        "imagery violations == 0 with the flag unset",
        "runAllGates returns without throwing over the clean 56-item dataset",
        "the gates CLI success line names 6 gates: 'count, files, props, family, verdict, matrix gates pass'"
       ],
       "must_not_observe": [
        "an imagery GateError thrown with 0 flags set (default-on regression)",
        "0 gates named in the CLI success line (stale five-gate line)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real 56-item dataset where every item's imagery is null and the env var DOCS_GATE_IMAGERY is unset WHEN runAllGates executes over the real dataset (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag) THEN the aggregate holds 0 imagery violations and the clean dataset still passes all gates",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "Matrix shape gate passes the real committed four-entry dataset",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Gate-module behavior over REF-007's real committed dataset plus a real prebuild run — JSON reads and pure gate execution, no rendering, no network, no DB.",
   "verification_service": "real gates.ts matrix gate over the committed dev-client-matrix.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "REF-008-matrix-gate",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Gate-module behavior over REF-007's real committed dataset — JSON reads and pure gate execution.",
    "verification_service": "real gates.ts matrix gate over the committed dev-client-matrix.json under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the gate derives its expected four names from the dataset itself — the mutated-name drill in AC-4 passes against its own mutation",
      "the gate is a stub returning an empty violations array — the shape-violation drill in AC-4 fails",
      "the committed dataset is never read — a missing file yields 0 violations instead of failing closed"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_build_inputs",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/data/dev-client-matrix.json from the working tree",
        "invoke the matrix gate over it joined with the real registry dataset"
       ]
      },
      "end_state": {
       "must_observe": [
        "matrix violations == 0 over the committed 4-entry dataset",
        "the entry count assertion pins exactly 4 entries",
        "all 4 names — enriched-markdown, streamdown, speech-recognition, extended-audio — match registry dataset names"
       ],
       "must_not_observe": [
        "a violation naming any of the 4 committed entries (false positive)",
        "0 entries read from a missing or empty file path"
       ]
      }
     }
    ]
   },
   "description": "GIVEN REF-007's committed apps/docs/src/data/dev-client-matrix.json with exactly enriched-markdown, streamdown, speech-recognition, extended-audio, each with non-empty peers[] and permissions{ios[],android[]} WHEN runAllGates executes with the matrix gate wired (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate) THEN the matrix gate contributes 0 violations over the real dataset and the real prebuild chain exits 0",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Matrix gate fails closed naming the offending entry, then restores byte-exact",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Fail-closed drill over the real committed file with real byte-exact restore — filesystem mutation and pure gate execution under vitest, no rendering, no network, no DB.",
   "verification_service": "real dev-client-matrix.json mutation + gates.ts execution + sha256-verified restore under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "REF-008-matrix-gate",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Fail-closed drill over the real committed file with real byte-exact restore under vitest.",
    "verification_service": "real dev-client-matrix.json mutation + gates.ts execution + sha256-verified restore under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the gate omits the offending name from its violation — the pinned '[docs-data] matrix: item' shape assert fails",
      "the gate checks only entry count — the renamed-entry drill (count still 4) passes vacuously",
      "the mutation leaks — the post-run sha256 of dev-client-matrix.json differs from the pre-run hash"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "mutated_matrix_drill",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "snapshot the real dev-client-matrix.json bytes",
        "rewrite it with 'speech-recognition' renamed to 'speech-recognition-x'",
        "invoke runAllGates and capture the GateError",
        "restore the original bytes in a finally"
       ]
      },
      "end_state": {
       "must_observe": [
        "the GateError message matches '[docs-data] matrix: item \"speech-recognition-x\"' with its violation detail",
        "the mutated run reports 1 matrix violation naming the renamed entry",
        "the restored file's sha256 equals the pre-mutation sha256"
       ],
       "must_not_observe": [
        "exit 0 over the mutated tree (fail-open)",
        "0 violations with the count-unchanged mutation present",
        "a leftover mutated file after the finally (restore failure)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real tree with the matrix entry 'speech-recognition' renamed to 'speech-recognition-x' on disk (byte-exact restore in a finally) WHEN the gate executes over the mutated tree (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate drill case) THEN runAllGates throws one GateError rendering '[docs-data] matrix: item \"speech-recognition-x\" ...' naming the offending entry",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-5",
   "name": "Imagery flag pair — flag ON with null imagery exits non-zero naming the item",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Env-flag gate behavior over the real all-null-imagery dataset under vitest — pure function execution with a real environment variable, no rendering, no network, no DB.",
   "verification_service": "real gates.ts imagery gate execution with DOCS_GATE_IMAGERY=1 over loadDefaultDataset() under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "REF-008-imagery-flag",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Env-flag gate behavior over the real all-null-imagery dataset under vitest.",
    "verification_service": "real gates.ts imagery gate execution with DOCS_GATE_IMAGERY=1 over loadDefaultDataset() under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the flag is unread — the flag-on run returns 0 violations like the flag-off run (no-ops gate)",
      "the violation omits the item name — the pinned '[docs-data] imagery: item' shape assert fails",
      "the flag is checked as a hard-coded constant instead of process.env — flipping DOCS_GATE_IMAGERY changes nothing"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_build_inputs",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "set DOCS_GATE_IMAGERY=1 for the gate invocation",
        "invoke runAllGates over the real 56-item dataset",
        "capture the thrown GateError",
        "unset the flag and re-invoke (the AC-2 flag-off pair)"
       ]
      },
      "end_state": {
       "must_observe": [
        "the GateError message matches '[docs-data] imagery: item \"<name>\" missing imagery' for a real dataset name",
        "imagery violations == 56 under the flag (one per null-imagery entry)",
        "the same invocation with the flag unset reports 0 imagery violations"
       ],
       "must_not_observe": [
        "exit without throwing under DOCS_GATE_IMAGERY=1 (fail-open)",
        "0 imagery violations under the flag",
        "a violation message naming no item (anonymous failure)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real 56-item dataset with imagery null on every entry and DOCS_GATE_IMAGERY=1 exported into the gate run's environment WHEN runAllGates executes under the flag (pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag flag-on case) THEN the aggregate throws a GateError rendering '[docs-data] imagery: item \"<name>\" missing imagery' naming the first offending item",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "56/56 emitted entries carry the 16-key CONTRACT_KEYS order ending [props, usageSnippet, themingNote, qrDeepLink, metaDescription].",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Every qrDeepLink equals the app.json-derived scheme + '/' + name (conversation: 'ai-elements-example/conversation').",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Every metaDescription equals the TR-03 pattern string with the one-line segment byte-equal to oneLineDescription(item.description) and the 'nativewind/uniwind' engine tail.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "runAllGates over the clean real dataset reports 0 imagery violations with DOCS_GATE_IMAGERY unset.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "The matrix gate reports 0 violations over the committed four-entry dataset with all 4 names matching registry names.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "The renamed-entry drill throws a GateError matching '[docs-data] matrix: item \"speech-recognition-x\"' with the file restored byte-identical (sha256 equal).",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-matrix-gate"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "DOCS_GATE_IMAGERY=1 over the all-null dataset throws a GateError matching '[docs-data] imagery: item \"<name>\" missing imagery'.",
   "maps_to_ac": "AC-5",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t REF-008-imagery-flag"
  },
  {
   "id": "TC-8",
   "type": "test_criterion",
   "description": "The extended CONTRACT_KEYS pin in both MODIFY'd sprint-01 tests enumerates the identical 16-key list as scripts/docs-data/prebuild.ts within one commit.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t REF-008-qr-metalink-derivation"
  }
 ]
}
-->

</details>
