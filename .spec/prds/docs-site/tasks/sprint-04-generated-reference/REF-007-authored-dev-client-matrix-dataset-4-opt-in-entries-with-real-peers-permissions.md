<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-007: Authored dev-client matrix dataset — 4 opt-in entries with real peers + permissions

> Status: ✅ Completed
> Commit: 5102be28185e901e725997dde0680989114fbd46 (approved cycle 1)
> Assignee: react-native-reusables-implementer (implementer) · react-native-reusables-reviewer (reviewer)
> Priority: P1 · Points: 3 · Type: FEATURE · Wave: A
> Proposed By: react-native-reusables-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Author apps/docs/src/data/dev-client-matrix.json — the four-entry consumer-opt-in dataset (real npm peers + platform permissions) — with every name/range/permission grounded in the real packages' published manifests and docs, and publish the entry shape as a RED-first vitest contract test over the real file.

## Why
The file holds exactly the four pinned entries; the contract test passes over the real file; every peers[].name resolves on the live npm registry (npm view evidence recorded at authoring, re-verified at review); permissions are non-empty on both platforms and name real capability permissions; REF-008 wires its matrix gate against the published shape without re-deriving it.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-matrix-shape

## Scope
apps/docs/src/data/dev-client-matrix.json (NEW); tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-007 — required reading for implementer + reviewer)</summary>

TASK: REF-007 — Authored dev-client matrix dataset — 4 opt-in entries with real peers + permissions
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 3
AGENT: implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: Verify every peers[].name against the live npm registry (npm view <name> version peerDependencies) before authoring; pin the verified anchors: react-native-enriched-markdown 1.0.2, react-native-streamdown 0.3.0, expo-speech-recognition 57.0.0, expo-audio 57.0.5
- MUST: The streamdown entry carries exactly the 3 real peers react-native-enriched-markdown >=1.0.0, react-native-worklets >=0.10.0, remend 1.3.0
- MUST: speech-recognition's android permissions array contains the literal RECORD_AUDIO (verbatim from expo-speech-recognition's README); every other permission string verified against the capability's package documentation before authoring
- MUST: The vitest contract test asserts the shape over the REAL authored file — it is the published shape contract REF-008's gate wiring mirrors
- NEVER: Never invent or placeholder a package name, range, or permission string (no TBD/TODO/example-permission/some-package) — invented names fail review
- NEVER: Never touch packages/registry/registry.json, packages/registry/scripts/, or scripts/docs-data/
- NEVER: Never hit the network from the vitest run — registry verification is authoring-time evidence pinned as literals in the test, keeping CI offline-deterministic
- STRICTLY: Strictly SCOPE write_allowed; the lane file is a .test.ts, outside REF-001's *.spec.ts glob, so wave A stays path-disjoint
- STRICTLY: Exactly 4 entries with ids exactly {enriched-markdown, streamdown, speech-recognition, extended-audio}
- STRICTLY: JSON matches the house data-file convention: 2-space indent, trailing newline (as packages/registry/registry.json)

### DONE WHEN

- [ ] AC 1: Four-entry shape over the real authored file
- [ ] AC 2: Peers are real published packages with real ranges
- [ ] AC 3: Permissions reflect the real capabilities on both platforms
- [ ] AC 4: Contract rejects malformed data naming the offending entry
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: Four-entry shape over the real authored file**

  GIVEN/WHEN/THEN: the repo with the sprint-04 vitest lane writable and (RED at start) no apps/docs/src/data/dev-client-matrix.json the test reads the real file and validates it against the published entry shape the dataset is an array of exactly 4 entries whose ids equal ['enriched-markdown','streamdown','speech-recognition','extended-audio'] under sorted literal comparison, each entry carrying a non-empty label string, a non-empty peers[] of {name, range} objects with non-empty trimmed strings and a semver-parseable range, and a permissions object with non-empty ios[] and android[] arrays of non-empty trimmed strings

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts · TEST_FUNCTION: REF-007-matrix-shape
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-matrix-shape`
  VERIFICATION_SERVICE: real filesystem read of the authored dev-client-matrix.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Pure JSON shape validation over the real authored data file — a file read plus pure assertions, no rendering, no network, no DB; the rendered matrix section is REF-010's DevClientMatrix.astro and T-GEND-020's playwright spec (REF-001), both outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_dev_client_matrix → MUST_OBSERVE [exactly 4 entries; the parsed file's id array equals ['enriched-markdown','streamdown','speech-recognition','extended-audio'] as a sorted literal comparison — 4 ids, 0 extras, 0 missing; 4/4 entries carry a non-empty label, >=1 peers[] entry, and permissions.ios.length >= 1 and permissions.android.length >= 1; every peers[].range parses as a semver range (e.g. ^1.0.2, >=0.10.0, 57.0.5) — 4/4 entries, 0 unparseable ranges] / MUST_NOT_OBSERVE [0 duplicate entry ids; 0 empty or whitespace-only strings in labels, peers[] names, ranges, or permission elements; 0 placeholder strings anywhere in the file (no TBD, TODO, example-permission, some-package)]
    - START_REF authored_dev_client_matrix → MUST_OBSERVE [a reversed in-memory copy passes with ids sorted before comparison (1 sort call guarding the assert)] / MUST_NOT_OBSERVE [0;  ; o; r; d; e; r; -; d; e; p; e; n; d; e; n; t;  ; i; d;  ; a; s; s; e; r; t; i; o; n; s;  ; t; h; a; t;  ; a;  ; f; u; t; u; r; e;  ; r; e; -; s; o; r; t;  ; o; f;  ; t; h; e;  ; a; u; t; h; o; r; e; d;  ; f; i; l; e;  ; w; o; u; l; d;  ; b; r; e; a; k]
    - NEGATIVE_CONTROL: would fail if ['a fifth entry or a renamed id sneaks in — the sorted-literal id comparison fails (4 ids expected)', 'an entry ships empty permissions arrays — the per-platform non-empty assertions fail', 'the file is a stub placeholder JSON (empty array or dummy entry) — the 4-entry and id-literal assertions fail']

**AC-2: Peers are real published packages with real ranges**

  GIVEN/WHEN/THEN: the authored matrix carrying its peers[] and the authoring-time npm-registry verification captured as pinned literals the test checks every peers[].name against the pinned registry-resolvable anchors and real peer relationships each entry names its anchor package (enriched-markdown -> react-native-enriched-markdown, streamdown -> react-native-streamdown plus its 3 real peers, speech-recognition -> expo-speech-recognition, extended-audio -> expo-audio) with 0 duplicate peer names within an entry

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts · TEST_FUNCTION: REF-007-real-peers
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-real-peers`
  VERIFICATION_SERVICE: real filesystem read of the authored file + pinned npm-registry facts captured at authoring time · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Pure literal comparison over the real authored file against registry facts recorded at authoring time — the vitest run performs no network I/O; the live-registry verification is the implementer's recorded_external evidence (npm view output) reviewed alongside the test.
  SCENARIO:
    - START_REF live_npm_registry_peer_facts → MUST_OBSERVE [4/4 entries name their anchor: react-native-enriched-markdown, react-native-streamdown, expo-speech-recognition, expo-audio; the streamdown entry's peers array contains exactly the 3 literals 'react-native-enriched-markdown', 'react-native-worklets', 'remend' with ranges '>=1.0.0', '>=0.10.0', '1.3.0'; 0 duplicate names within any single entry's peers[]] / MUST_NOT_OBSERVE [0 peers[] names that fail npm-resolution (invented names like react-native-fancy-markdown); 0 self-referential peers[] entries (an entry naming the docs site or the matrix itself); 0 near-miss spellings of a real package (the pinned anchor spellings win)]
    - NEGATIVE_CONTROL: would fail if ['a peers[] name is invented or placeholder — the pinned anchor assertions fail', "peers are derived from the docs site's own devDependencies instead of the capability's real stack — the streamdown exact-3-literal assertion fails", 'a peers list is padded with duplicates to satisfy non-emptiness — the 0-duplicates assertion fails']

**AC-3: Permissions reflect the real capabilities on both platforms**

  GIVEN/WHEN/THEN: the authored matrix with its permissions objects the test validates every permissions element and the pinned real-capability anchor every entry's permissions.ios and permissions.android are non-empty arrays (the speech-recognition entry, index 2 in the pinned id order, includes the literal 'RECORD_AUDIO' exactly once in its android array), and 0 elements are placeholders or whitespace

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts · TEST_FUNCTION: REF-007-permissions-real
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-permissions-real`
  VERIFICATION_SERVICE: real filesystem read of the authored dev-client-matrix.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Pure validation over the real authored file; the mic-permission reality is grounded in the package README (recorded at authoring), not probed at test time.
  SCENARIO:
    - START_REF authored_dev_client_matrix → MUST_OBSERVE [4/4 entries have permissions.ios.length >= 1 and permissions.android.length >= 1; matrix entries[2] (speech-recognition in the pinned id order) permissions.android includes the literal 'RECORD_AUDIO' (1 occurrence); 4/4 entries pass the trimmed-non-empty scan across ios+android arrays — 0 failures over all N elements, N >= 8 (every entry >=1 per platform), with N printed in the seeded evidence from the authored file] / MUST_NOT_OBSERVE [0 placeholder permission strings (TBD, TODO, FIXME, example-permission, xxx); 0 empty-string or whitespace-only elements in any permissions array; 0 entries missing either platform's array]
    - NEGATIVE_CONTROL: would fail if ['an entry ships an empty permissions array — the per-platform non-empty assertions fail', 'a permission string is invented filler — the placeholder-pattern assertions fail', 'the speech-recognition entry drops its microphone permission — the RECORD_AUDIO literal assertion fails']

**AC-4: Contract rejects malformed data naming the offending entry**

  GIVEN/WHEN/THEN: the contract validator exercised over in-memory corrupted copies of the real authored dataset the test corrupts one field at a time (drop an entry, add a fifth, blank a peers[], blank a permissions platform, inject a placeholder peer name) each corrupted copy fails validation with a message naming the offending entry id (or the id-set diff) while the pristine real file passes — proving the contract has teeth rather than rubber-stamping the file

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts · TEST_FUNCTION: REF-007-contract-rejects-corruption
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-contract-rejects-corruption`
  VERIFICATION_SERVICE: in-memory corrupted clones of the real dev-client-matrix.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Pure in-memory mutation testing of the shape validator over structuredClone copies of the real data — no I/O beyond the initial real-file read.
  SCENARIO:
    - START_REF authored_dev_client_matrix → MUST_OBSERVE [a copy missing 'streamdown' fails naming streamdown (or the id-set diff names it); a copy with an empty peers[] on 'speech-recognition' fails naming speech-recognition; a copy with the literal placeholder package name 'some-package' fails naming the entry carrying it; the pristine real file passes 4/4 validations] / MUST_NOT_OBSERVE [0 corrupted copies passing validation; 0 validation failures that omit the offending entry id; 0 on-disk byte changes after the run (corruption lives on clones only)]
    - NEGATIVE_CONTROL: would fail if ['the validator only checks array length and never inspects elements — the placeholder-entry corruption passes', 'assertions are weakened to expect-valid-always — the corrupted-copy expectations fail', 'corruption is written to disk instead of an in-memory copy — the byte-unchanged assertion fails']

### TEST CRITERIA

- **TC-1** (→AC-1): The real file holds exactly 4 entries; the id array equals ['enriched-markdown','streamdown','speech-recognition','extended-audio'] under sorted literal comparison; each entry has a non-empty label, >=1 {name, range} peer with a semver-parseable range, and non-empty ios/android permissions arrays. — `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-matrix-shape`
- **TC-2** (→AC-1): A reversed in-memory copy passes with ids sorted before comparison (1 sort call guarding the assert); the file contains 0 duplicate ids and 0 placeholder strings. — `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-matrix-shape`
- **TC-3** (→AC-2): 4/4 entries name their anchor package; the streamdown entry's peers array contains exactly the 3 literals 'react-native-enriched-markdown', 'react-native-worklets', 'remend' with ranges '>=1.0.0', '>=0.10.0', '1.3.0'; 0 duplicate peer names. — `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-real-peers`
- **TC-4** (→AC-3): 4/4 entries carry non-empty permissions on both platforms; entries[2] (speech-recognition) permissions.android includes the literal 'RECORD_AUDIO' (1 occurrence); 0 failures over all N scanned elements (N >= 8, printed from the authored file); 0 placeholder strings. — `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-permissions-real`
- **TC-5** (→AC-4): All 3 corrupted in-memory copies (missing 'streamdown', empty peers[] on 'speech-recognition', placeholder peer 'some-package') fail validation naming the offending entry; the pristine file passes 4/4; the on-disk file's bytes are unchanged after the run. — `pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-contract-rejects-corruption`

### READING LIST (max 5)

- scripts/docs-data/gates.ts [PRIMARY PATTERN] — the module REF-008 wires the matrix gate into: the pinned '[docs-data] <gate>: item "<name>"' violation shape, GateError aggregation, and the never-derive-expectations-from-the-dataset-under-test law the matrix gate must mirror.
- apps/example/package.json [PRIMARY PATTERN] — the real peer stack this repo pins (@rn-primitives ^1.5.2, expo ~57, ai 7.0.89): ground truth for what a real package name + range looks like here.
- tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts [test pattern] — the landed vitest lane pattern (real-file reads, literal pins, in-memory boundary cases) dev-client-matrix-contract.test.ts imitates.
- apps/docs/src/data/registry-items.json [data conventions] — the existing authored docs data file: shape, 2-space formatting, trailing newline, and how docs pages consume src/data/ files.
- scripts/docs-data/drill-item-count.ts [downstream consumer] — how drills treat authored data as real fixtures (mutate + byte-restore); REF-011 will drill this exact file's streamdown entry.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/data/dev-client-matrix.json (NEW)
- tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts (NEW)
writeProhibited:
- packages/registry/registry.json — the matrix is docs presentation data, not shipped registry content
- packages/registry/scripts/
- scripts/docs-data/ — the matrix gate wiring is REF-008's
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Authored JSON dataset in apps/docs/src/data/ + a RED-first vitest contract test over the real file that publishes the shape downstream gates and components consume — the registry-items.json/gates.ts convention.
- pattern_source: apps/docs/src/data/registry-items.json (authored data) + tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts (lane contract-test pattern)
- anti-pattern: deriving peer facts from the dataset itself, placeholder peers/permissions to satisfy a shape, or scattering matrix data across page frontmatter.
- references: ['TR-03 data schema — authored docs-data files', "T-GEND-020 dev-client-matrix riding spec (REF-001's lane)", 'UC-GEND-05 AC-3 — the four-entry matrix dataset']
- notes: ["REF-008 wires the matrix gate against THIS task's published shape — the contract test is the shape declaration; REF-008 must not re-derive or widen it without amending this test.", "REF-010's DevClientMatrix.astro renders the file; field names (id, label, peers, permissions) are the render contract — renames route through this test.", "REF-011's drill corrupts the streamdown entry as its real fixture — entry ids are load-bearing for the drill's name-the-entry assertions.", "write_allowed carries the converged data path verbatim plus the dispatch-mandated vitest lane file (a .test.ts outside REF-001's *.spec.ts glob — wave A stays path-disjoint); flag to the orchestrator at splice time if the ledger must stay verbatim."]

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01']
- provides: ['apps/docs/src/data/dev-client-matrix.json with exactly enriched-markdown, streamdown, speech-recognition, extended-audio — each with non-empty peers[] (real npm package names + ranges, verified against the live npm registry) and non-empty permissions{ios[],android[]}', "the declared entry shape REF-008's gate enforces, published as the RED-first vitest contract test over the real file", 'tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts asserting the 4-entry shape over the REAL authored file (RED at start: file absent)']
- consumes: ['the real capability stacks: react-native-enriched-markdown@1.0.2, react-native-streamdown@0.3.0 (real peers: react-native-enriched-markdown >=1.0.0, react-native-worklets >=0.10.0, remend 1.3.0), expo-speech-recognition@57.0.0 (Android RECORD_AUDIO per its README), expo-audio@57.0.5', 'apps/example/package.json + packages/registry peer manifests as in-repo ground truth for real names/ranges']
- boundary_contracts: ['Peers must be real published packages — invented or placeholder names fail review; permissions reflect the real capability (e.g. microphone for speech)', 'NO registry.json changes (C2): the matrix is docs presentation data about consumer-side opt-ins, not shipped registry content', 'Exactly 4 entries; shape contract published for the gates.ts wiring']

### VERIFICATION GATES

- AC-1: pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-matrix-shape — exit 0
- AC-2: pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-real-peers — exit 0
- AC-3: pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-permissions-real — exit 0
- AC-4: pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-contract-rejects-corruption — exit 0
- RED-first: the four -t runs FAIL before authoring (dev-client-matrix.json absent — the read throws) — record the RED outputs
- Seeded evidence: captured stdout shows '4 entries', the sorted id literal, and the N count, not merely exit 0
- Registry evidence: npm view output for the four anchor packages (version + peerDependencies) attached to the task record and re-verified by the reviewer
- lint: ./node_modules/.bin/biome ci tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts — exit 0 (never pnpm lint)
- data-file sanity: the JSON parses via JSON.parse and the file ends with a newline
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: [] · Blocks: ['REF-008', 'REF-010', 'REF-011']

### CODING STANDARDS

- JSON data files: 2-space indent, trailing newline, no comments — same convention as packages/registry/registry.json
- Vitest lane tests: real-file reads, literal field-naming assertions — no whole-file snapshots
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-007",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "authored_dev_client_matrix": {
   "description": "The real apps/docs/src/data/dev-client-matrix.json read from the working tree at run time. RED at task start: the file is absent so the contract test's read fails.",
   "seed_method": "ui_flow",
   "records": [
    "exactly 4 entries with ids enriched-markdown, streamdown, speech-recognition, extended-audio",
    "anchor peers: react-native-enriched-markdown 1.0.2, react-native-streamdown 0.3.0, expo-speech-recognition 57.0.0, expo-audio 57.0.5",
    "streamdown peers: react-native-enriched-markdown >=1.0.0, react-native-worklets >=0.10.0, remend 1.3.0",
    "speech-recognition android contains RECORD_AUDIO"
   ]
  },
  "live_npm_registry_peer_facts": {
   "description": "Authoring-time verification captures against the live npm registry (npm view / registry.npmjs.org) proving each peers[].name resolves and recording the real peerDependencies the ranges come from; pinned as literal expectations in the test — the vitest run itself stays offline. All npm 'peer' vocabulary here means package peerDependencies on a single build node — no cross-device topology.",
   "seed_method": "recorded_external",
   "records": [
    "react-native-enriched-markdown latest 1.0.2",
    "react-native-streamdown latest 0.3.0 with peerDependencies react-native-enriched-markdown >=1.0.0, react-native-worklets >=0.10.0, remend 1.3.0",
    "expo-speech-recognition latest 57.0.0 — Android RECORD_AUDIO documented in its README",
    "expo-audio latest 57.0.5"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "Four-entry shape over the real authored file",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Pure JSON shape validation over the real authored data file — a file read plus pure assertions, no rendering, no network, no DB; the rendered matrix section is REF-010's DevClientMatrix.astro and T-GEND-020's playwright spec (REF-001), both outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored dev-client-matrix.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts",
   "test_function": "REF-007-matrix-shape",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-matrix-shape",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "Pure JSON shape validation over the real authored file — no rendering, no network, no DB.",
    "verification_service": "real filesystem read of the authored dev-client-matrix.json under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "a fifth entry or a renamed id sneaks in — the sorted-literal id comparison fails (4 ids expected)",
      "an entry ships empty permissions arrays — the per-platform non-empty assertions fail",
      "the file is a stub placeholder JSON (empty array or dummy entry) — the 4-entry and id-literal assertions fail"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_dev_client_matrix",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the real apps/docs/src/data/dev-client-matrix.json",
        "assert the 4-entry shape: ids, labels, peers, permissions"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 4 entries",
        "the parsed file's id array equals ['enriched-markdown','streamdown','speech-recognition','extended-audio'] as a sorted literal comparison — 4 ids, 0 extras, 0 missing",
        "4/4 entries carry a non-empty label, >=1 peers[] entry, and permissions.ios.length >= 1 and permissions.android.length >= 1",
        "every peers[].range parses as a semver range (e.g. ^1.0.2, >=0.10.0, 57.0.5) — 4/4 entries, 0 unparseable ranges"
       ],
       "must_not_observe": [
        "0 duplicate entry ids",
        "0 empty or whitespace-only strings in labels, peers[] names, ranges, or permission elements",
        "0 placeholder strings anywhere in the file (no TBD, TODO, example-permission, some-package)"
       ]
      }
     },
     {
      "start_ref": "authored_dev_client_matrix",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "reverse the parsed array in memory and re-validate"
       ]
      },
      "end_state": {
       "must_observe": [
        "a reversed in-memory copy passes with ids sorted before comparison (1 sort call guarding the assert)"
       ],
       "must_not_observe": "0 order-dependent id assertions that a future re-sort of the authored file would break"
      }
     }
    ]
   },
   "description": "the repo with the sprint-04 vitest lane writable and (RED at start) no apps/docs/src/data/dev-client-matrix.json the test reads the real file and validates it against the published entry shape the dataset is an array of exactly 4 entries whose ids equal ['enriched-markdown','streamdown','speech-recognition','extended-audio'] under sorted literal comparison, each entry carrying a non-empty label string, a non-empty peers[] of {name, range} objects with non-empty trimmed strings and a semver-parseable range, and a permissions object with non-empty ios[] and android[] arrays of non-empty trimmed strings",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Peers are real published packages with real ranges",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Pure literal comparison over the real authored file against registry facts recorded at authoring time — the vitest run performs no network I/O; the live-registry verification is the implementer's recorded_external evidence (npm view output) reviewed alongside the test.",
   "verification_service": "real filesystem read of the authored file + pinned npm-registry facts captured at authoring time",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts",
   "test_function": "REF-007-real-peers",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-real-peers",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "Literal comparison over the real file against recorded registry facts — no network at test time; 'peers' means npm peerDependencies, not device topology.",
    "verification_service": "real filesystem read + pinned npm-registry facts",
    "negative_control": {
     "would_fail_if": [
      "a peers[] name is invented or placeholder — the pinned anchor assertions fail",
      "peers are derived from the docs site's own devDependencies instead of the capability's real stack — the streamdown exact-3-literal assertion fails",
      "a peers list is padded with duplicates to satisfy non-emptiness — the 0-duplicates assertion fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "live_npm_registry_peer_facts",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the real file's peers[] arrays",
        "assert the anchor names and the streamdown peers set against the pinned registry facts"
       ]
      },
      "end_state": {
       "must_observe": [
        "4/4 entries name their anchor: react-native-enriched-markdown, react-native-streamdown, expo-speech-recognition, expo-audio",
        "the streamdown entry's peers array contains exactly the 3 literals 'react-native-enriched-markdown', 'react-native-worklets', 'remend' with ranges '>=1.0.0', '>=0.10.0', '1.3.0'",
        "0 duplicate names within any single entry's peers[]"
       ],
       "must_not_observe": [
        "0 peers[] names that fail npm-resolution (invented names like react-native-fancy-markdown)",
        "0 self-referential peers[] entries (an entry naming the docs site or the matrix itself)",
        "0 near-miss spellings of a real package (the pinned anchor spellings win)"
       ]
      }
     }
    ]
   },
   "description": "the authored matrix carrying its peers[] and the authoring-time npm-registry verification captured as pinned literals the test checks every peers[].name against the pinned registry-resolvable anchors and real peer relationships each entry names its anchor package (enriched-markdown -> react-native-enriched-markdown, streamdown -> react-native-streamdown plus its 3 real peers, speech-recognition -> expo-speech-recognition, extended-audio -> expo-audio) with 0 duplicate peer names within an entry",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "Permissions reflect the real capabilities on both platforms",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Pure validation over the real authored file; the mic-permission reality is grounded in the package README (recorded at authoring), not probed at test time.",
   "verification_service": "real filesystem read of the authored dev-client-matrix.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts",
   "test_function": "REF-007-permissions-real",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-permissions-real",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "Pure validation over the real file — no network, no rendering.",
    "verification_service": "real filesystem read of the authored file",
    "negative_control": {
     "would_fail_if": [
      "an entry ships an empty permissions array — the per-platform non-empty assertions fail",
      "a permission string is invented filler — the placeholder-pattern assertions fail",
      "the speech-recognition entry drops its microphone permission — the RECORD_AUDIO literal assertion fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_dev_client_matrix",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read every entry's permissions object",
        "assert non-empty per platform, the RECORD_AUDIO pin, and the trimmed-non-empty scan"
       ]
      },
      "end_state": {
       "must_observe": [
        "4/4 entries have permissions.ios.length >= 1 and permissions.android.length >= 1",
        "matrix entries[2] (speech-recognition in the pinned id order) permissions.android includes the literal 'RECORD_AUDIO' (1 occurrence)",
        "4/4 entries pass the trimmed-non-empty scan across ios+android arrays — 0 failures over all N elements, N >= 8 (every entry >=1 per platform), with N printed in the seeded evidence from the authored file"
       ],
       "must_not_observe": [
        "0 placeholder permission strings (TBD, TODO, FIXME, example-permission, xxx)",
        "0 empty-string or whitespace-only elements in any permissions array",
        "0 entries missing either platform's array"
       ]
      }
     }
    ]
   },
   "description": "the authored matrix with its permissions objects the test validates every permissions element and the pinned real-capability anchor every entry's permissions.ios and permissions.android are non-empty arrays (the speech-recognition entry, index 2 in the pinned id order, includes the literal 'RECORD_AUDIO' exactly once in its android array), and 0 elements are placeholders or whitespace",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Contract rejects malformed data naming the offending entry",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Pure in-memory mutation testing of the shape validator over structuredClone copies of the real data — no I/O beyond the initial real-file read.",
   "verification_service": "in-memory corrupted clones of the real dev-client-matrix.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts",
   "test_function": "REF-007-contract-rejects-corruption",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-contract-rejects-corruption",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "In-memory corruption of cloned real data — pure logic, no I/O side effects; 'peers[] name' means an npm package name field, not a device-topology concept.",
    "verification_service": "in-memory corrupted clones of the real file under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the validator only checks array length and never inspects elements — the placeholder-entry corruption passes",
      "assertions are weakened to expect-valid-always — the corrupted-copy expectations fail",
      "corruption is written to disk instead of an in-memory copy — the byte-unchanged assertion fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_dev_client_matrix",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "structuredClone the parsed real dataset",
        "corrupt one field at a time and re-validate each copy"
       ]
      },
      "end_state": {
       "must_observe": [
        "a copy missing 'streamdown' fails naming streamdown (or the id-set diff names it)",
        "a copy with an empty peers[] on 'speech-recognition' fails naming speech-recognition",
        "a copy with the literal placeholder package name 'some-package' fails naming the entry carrying it",
        "the pristine real file passes 4/4 validations"
       ],
       "must_not_observe": [
        "0 corrupted copies passing validation",
        "0 validation failures that omit the offending entry id",
        "0 on-disk byte changes after the run (corruption lives on clones only)"
       ]
      }
     }
    ]
   },
   "description": "the contract validator exercised over in-memory corrupted copies of the real authored dataset the test corrupts one field at a time (drop an entry, add a fifth, blank a peers[], blank a permissions platform, inject a placeholder peer name) each corrupted copy fails validation with a message naming the offending entry id (or the id-set diff) while the pristine real file passes — proving the contract has teeth rather than rubber-stamping the file",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The real file holds exactly 4 entries; the id array equals ['enriched-markdown','streamdown','speech-recognition','extended-audio'] under sorted literal comparison; each entry has a non-empty label, >=1 {name, range} peer with a semver-parseable range, and non-empty ios/android permissions arrays.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-matrix-shape"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "A reversed in-memory copy passes with ids sorted before comparison (1 sort call guarding the assert); the file contains 0 duplicate ids and 0 placeholder strings.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-matrix-shape"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "4/4 entries name their anchor package; the streamdown entry's peers array contains exactly the 3 literals 'react-native-enriched-markdown', 'react-native-worklets', 'remend' with ranges '>=1.0.0', '>=0.10.0', '1.3.0'; 0 duplicate peer names.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-real-peers"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "4/4 entries carry non-empty permissions on both platforms; entries[2] (speech-recognition) permissions.android includes the literal 'RECORD_AUDIO' (1 occurrence); 0 failures over all N scanned elements (N >= 8, printed from the authored file); 0 placeholder strings.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-permissions-real"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "All 3 corrupted in-memory copies (missing 'streamdown', empty peers[] on 'speech-recognition', placeholder peer 'some-package') fail validation naming the offending entry; the pristine file passes 4/4; the on-disk file's bytes are unchanged after the run.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/dev-client-matrix-contract.test.ts -t REF-007-contract-rejects-corruption"
  }
 ]
}
-->

</details>
