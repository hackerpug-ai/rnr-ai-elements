================================================================================
TASK: GBC-012 - Porting consistency gates (mapping slugs resolve; not-ported exact complement)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: ddb87b9a3136c43db9abf53e6169afdf5ecba155
PRIORITY:   P1
POINTS:     3
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- cross-check every mapping-column slug against the 56 registry items and fail naming the row + unknown slug
- compute set(upstream) - set(mapped) and compare to set(not-ported), failing naming any drift and both lists
- cross-check the boundary `gaps` frontmatter array (owns-vs-does-not-own.mdx, GBC-003): every gap ∈ consumer-owned ∪ not-ported, and no gap names one of the 56 slugs — fail naming the gap
- wire into prebuild.ts (or the /porting route getStaticPaths) so drift fails the build
- write a RED-first vitest drill for unknown slug, mapped-but-still-not-ported, new-upstream-in-neither, and a planted gaps-list contradiction (a gap naming a ledger slug)
NEVER:
- author the /porting mapping or not-ported list (techwriting owns the structured source)
- hardcode the 56-item list inside this gate (read the tracked packages/registry/registry.json — never the gitignored generated registry-items.json)
- warn-only on a mapping slug that does not resolve
STRICTLY:
- the 56-item source is the tracked packages/registry/registry.json (registry-items.json is gitignored prebuild output — absent on fresh worktrees)
- the upstream element set is the `upstream` frontmatter array from porting.md (GBC-004 authors it from the dated upstream snapshot) — never derived from the mapping source itself
- parse content frontmatter with the same YAML stack Astro's glob loader uses (gray-matter/js-yaml) — one parse authority, no drift between the gate's view and Astro's
- UNIT_TEST_JUSTIFIED: tier label for proof binding only, not a claim of zero I/O. porting-consistency.test.ts runs the real exported check (the one prebuild.ts calls) over $TMPDIR copies of the real porting.md and gaps array plus the tracked packages/registry/registry.json, with no mocks. FLOW-DOCS-05's rendered proof and its one primary belong to GBC-009; these planted-drift cases are this task's own artifact.
- NEVER edit tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts: GBC-009 writes it and owns FLOW-DOCS-05. It is in write_allowed, unmarked, only so AC-1's bound verify selects an owned path (sprint-02 SHELL-005 precedent).
- AC-1 runs at this task's own close and needs GBC-009's porting-map.spec.ts on the trunk (wave B lands before wave C). If that spec is missing, report AC-1 blocked, never passed.
- Drill mutations live only in $TMPDIR copies: after the drill, `git status --porcelain apps/docs/src/content packages/registry` prints nothing.
- FRONTMATTER PARSER (supersedes the STRICTLY line naming gray-matter/js-yaml, which cannot be imported from scripts/ under the isolated pnpm linker): parse porting.md and owns-vs-does-not-own frontmatter only with Astro's own parser. Build `createRequire` from `apps/docs/package.json`, resolve `astro/package.json`, build a second `createRequire` from that path, resolve `@astrojs/internal-helpers/frontmatter`, import it, and call `parseFrontmatter(text)`; use the returned `.frontmatter` (arrays come back intact; unquoted dates come back as JS Date). The gate and its drill both use this one route, over the real files and the $TMPDIR copies alike. Add no YAML dependency and hand-roll no parser: if the resolve or import fails, the gate throws naming `@astrojs/internal-helpers/frontmatter` and the build fails closed.
- LANDED SOURCE SHAPE (Amendment 2026-09-29, from GBC-004's implementer handoff approved at 7384dd14): porting.md's `mapping` array holds objects `{ upstream: <lowercase kebab name>, item: <registry slug> }` (e.g. `{ upstream: conversation, item: conversation }`), while `upstream` and `notPorted` are bare lowercase kebab strings (the nine not-ported: canvas, connection, controls, edge, jsx-preview, node, panel, sandbox, toolbar). Take mapped names from `mapping[].upstream` and resolution slugs from `mapping[].item`, and write every drill mutation and expected message literal in the lowercase kebab form the frontmatter actually holds — never a capitalized display name like `Conversation`.

## Specification
Objective: Fail the build when the /porting mapping references a non-existent registry slug or the not-ported list is not the exact complement of the mapping against the upstream total.
Success state: A healthy build has every mapping slug resolving to one of the 56 items and not-ported == set(upstream) - set(mapped); an unknown slug, a mapped-but-still-not-ported element, or a new-upstream-in-neither element each fails naming the offender.

## Acceptance Criteria
### AC-1: Healthy build: mapping resolves and not-ported is the exact complement
  GIVEN: GBC-009's porting-map.spec.ts has landed (wave B), GBC-004's porting.md and GBC-003's gaps array are on the trunk, and this task has wired the porting-consistency check into prebuild.ts
  WHEN:  the FLOW-DOCS-05 run_cmd runs the full ordered docs build, whose prebuild now runs the check over the real content, and then porting-map.spec.ts
  THEN:  the build exits 0 and /porting still passes GBC-009's spec: a mapping table with a Deviation column and at least 5 rows whose slugs all resolve to the 56 registry items, and a not-ported list that exactly completes the upstream set
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the check wired into prebuild.ts false-fires on the healthy real content, so the build segment exits non-zero and Playwright never starts', 'porting.md maps a slug absent from registry.json, or its not-ported list is empty or names a shipped item']
        EVIDENCE: file_artifact
        - START_REF: healthy_porting_candidate
          ACTION: ["Run the FLOW-DOCS-05 run_cmd; record the build segment's exit code.", 'In porting-map.spec.ts, GET /porting and /docs/porting and record both statuses.', 'Read the /porting mapping table header cells and body rows, and the not-ported list entries.', "Compare each mapping row slug and each not-ported entry with the 56 `name` values in packages/registry/registry.json, and the combined count with porting.md's `upstream` array."]
          MUST_OBSERVE: ["the run_cmd's first segment `pnpm --filter @rnr-ai-elements/docs build` exits `0` with the porting-consistency check running inside prebuild", 'GET `/porting` responds `200` and GET `/docs/porting` responds `404`', 'the /porting mapping table has a header cell matching /deviation/i and >= 5 body rows', '0 mapping rows whose slug is outside the 56 `name` values in packages/registry/registry.json', "mapping row count + not-ported entry count == length of porting.md's `upstream` array, with 0 not-ported entries equal to a registry `name`"]
          MUST_NOT_OBSERVE: ['a non-zero build exit naming a porting-consistency violation', 'an empty not-ported list (0 entries)', 'a mapping table with no deviation column']

### AC-2: Unknown mapping slug fails the build
  GIVEN: a drill copy of porting.md whose `conversation` mapping entry (`{ upstream: conversation, item: conversation }`) has its `item` rewritten to `chat-conversation` (the real slug is `conversation`)
  WHEN:  the drill runs the real porting-consistency check over that copy and the tracked registry.json
  THEN:  it fails naming the `conversation` mapping entry and the unknown slug `chat-conversation`
  TEST_TIER: unit
  VERIFICATION_SERVICE: Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks
  UNIT_TEST_JUSTIFIED: Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  TEST_FUNCTION: GBC-012-unknown-slug-rejected
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the check is warn-only or omitted (disconnected), so an unresolved slug passes', 'the 56 names are hardcoded in the gate instead of read from packages/registry/registry.json']
        EVIDENCE: stdout
        - START_REF: unknown_slug_copy
          ACTION: ["Copy the real porting.md to a $TMPDIR path and rewrite the `conversation` mapping entry's `item` to `chat-conversation`.", 'Run the exported check prebuild.ts calls over the copy, the real gaps array and packages/registry/registry.json; capture the thrown error or exit code and message.', 'Run the same check over the unmodified real files as the control.']
          MUST_OBSERVE: ['the check exits non-zero or throws (exit code != 0) on the copy', 'the message contains `chat-conversation`', 'the message names the offending mapping entry `conversation` (lowercase kebab, exactly as its `upstream` key appears in the frontmatter)', 'the control run over the real files passes with exit code 0']
          MUST_NOT_OBSERVE: ['exit code 0 on the mutated copy', 'a failure message with no slug named (empty offender)']

### AC-3: Mapped-but-still-not-ported fails the build
  GIVEN: a drill copy of porting.md where `conversation` stays mapped and is also listed in notPorted
  WHEN:  the drill runs the real porting-consistency check over that copy
  THEN:  it fails naming the element and both lists involved
  TEST_TIER: unit
  VERIFICATION_SERVICE: Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks
  UNIT_TEST_JUSTIFIED: Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  TEST_FUNCTION: GBC-012-mapped-and-not-ported-rejected
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the complement is not computed (the check only resolves slugs), so an element in both lists passes', 'the gaps cross-check is omitted, so a boundary gap naming a shipped slug passes']
        EVIDENCE: stdout
        - START_REF: mapped_and_not_ported_copy
          ACTION: ['Copy the real porting.md to $TMPDIR and append `conversation` to `notPorted`, keeping its mapping entry.', 'Run the exported check over the copy; capture the error or exit code and message.']
          MUST_OBSERVE: ['the check exits non-zero or throws (exit code != 0) on the copy', 'the message contains `conversation`', 'the message names both `mapping` and `notPorted`']
          MUST_NOT_OBSERVE: ['exit code 0 on the mutated copy', 'a message naming only one list or no list']
        - START_REF: gap_names_shipped_slug_copy
          ACTION: ['Copy the real owns-vs-does-not-own frontmatter to $TMPDIR and append `conversation` to `gaps`.', 'Run the exported check with the real porting.md and the mutated gaps copy; capture the error or exit code and message.']
          MUST_OBSERVE: ['the check exits non-zero or throws (exit code != 0) on the copy', 'the message contains the gap `conversation` and states it is one of the 56 shipped slugs']
          MUST_NOT_OBSERVE: ['exit code 0 on the mutated gaps array', 'a failure with no gap named']

### AC-4: New upstream element in neither list fails the build
  GIVEN: a drill copy of porting.md whose upstream array gains `DrillOnlyElement`, tracked in neither mapping nor notPorted
  WHEN:  the drill runs the real porting-consistency check over that copy
  THEN:  it fails naming `DrillOnlyElement`
  TEST_TIER: unit
  VERIFICATION_SERVICE: Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks
  UNIT_TEST_JUSTIFIED: Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  TEST_FUNCTION: GBC-012-untracked-upstream-rejected
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["the upstream set is derived from the mapping itself instead of porting.md's `upstream` array, so a new element is never seen", 'the check is omitted from prebuild.ts (disconnected)']
        EVIDENCE: stdout
        - START_REF: untracked_upstream_copy
          ACTION: ['Copy the real porting.md to $TMPDIR and append `DrillOnlyElement` to `upstream` only.', 'Run the exported check over the copy; capture the error or exit code and message.']
          MUST_OBSERVE: ['the check exits non-zero or throws (exit code != 0) on the copy', 'the message contains `DrillOnlyElement`']
          MUST_NOT_OBSERVE: ['exit code 0 on the mutated copy', 'a message with no element named']

## Test Criteria
- TC-1: the FLOW-DOCS-05 run_cmd exits 0 with the check running in prebuild, and porting-map.spec.ts passes  (maps_to: AC-1)
- TC-2: a mapping slug `chat-conversation` fails the check naming the `conversation` mapping entry and the slug, while the real files pass  (maps_to: AC-2)
- TC-3: `conversation` in both mapping and notPorted fails naming the element and both lists  (maps_to: AC-3)
- TC-4: an upstream element in neither list fails naming the element  (maps_to: AC-4)
- TC-5: a boundary gap naming the shipped slug `conversation` fails naming the gap  (maps_to: AC-3)

## Reading List
- packages/registry/registry.json (tracked 56-item source)
- apps/docs/src/content/docs/porting.md (landed GBC-004 source: `mapping` entries are `{ upstream, item }` objects; `upstream`/`notPorted` are bare lowercase kebab arrays)
- scripts/docs-data/prebuild.ts
- scripts/docs-data/gates.ts
- scripts/docs-data/check-dist-links.ts
- tests/sprint-05-orient-search/dist-link-gate.test.ts

## Guardrails
WRITE-ALLOWED:
- scripts/docs-data/porting-consistency.ts (NEW)
- scripts/docs-data/prebuild.ts (MODIFY)
- tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
WRITE-PROHIBITED:
- apps/docs/src/content/docs/** (techwriting authors /porting prose + the structured mapping/not-ported source)
- apps/docs/src/pages/porting.astro (GBC-009 owns the route)

## Design
References: ['scripts/docs-data/gates.ts (cross-check vs pinned dataset)', 'scripts/docs-data/check-dist-links.ts (DEFAULT_REQUIRED_REFERENCES already covers prior-art liveness)']
Interaction notes: Depends on GBC-004's landed porting.md (commit 7384dd14) producing mapping/notPorted/upstream as frontmatter arrays — `mapping` entries are `{ upstream, item }` objects, `upstream`/`notPorted` bare lowercase kebab strings — plus a pinned upstream element set; this task validates that source against the tracked packages/registry/registry.json. Prior-art link liveness is already covered by check-dist-links.ts DEFAULT_REQUIRED_REFERENCES.
Pattern: Cross-dataset consistency gate (porting.md frontmatter vs packages/registry/registry.json + boundary gaps array) + RED-first fixture drill (scripts/docs-data/gates.ts)
Anti-pattern: Hardcoding the 56-item list inside the gate, or reading the gitignored registry-items.json instead of the tracked registry.json

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art

## Dependencies
Depends on: ['GBC-004', 'GBC-009']
Blocks:     none

## Amendments
- 2026-09-29 (astro-planner, orchestrator ask-1): Aligned AC-2 and AC-3 (with their TC-2/TC-3 mirrors, contract fixtures, and scenario steps) to the landed GBC-004 source shape reported in its implementer handoff — `.kb-run-sprint/sprint-06-guides-boundary-changelog/GBC-004/handoff.json`, approved at 7384dd14b3989631ce3b4565232e6d41d23a4d08, scope_impact[0] targeting GBC-012. The landed mapping frontmatter entries are `{ upstream: <kebab name>, item: <registry slug> }` with lowercase kebab upstream names (porting.md:6,56,137), so the drills' capitalized `Conversation` literals became the lowercase kebab `conversation` the file actually holds: AC-2's MUST_OBSERVE now names the offending mapping entry `conversation` exactly as its `upstream` key appears (exact literal chosen over case-insensitive matching — the message echoes the parsed key deterministically), and AC-3's notPorted append now plants the mapped-and-also-not-ported contradiction under the same name the mapping uses (a capitalized append would fall into the not-in-upstream drift class instead). Added the LANDED SOURCE SHAPE STRICTLY line, porting.md to the reading list, and corrected the Design note's validation target from the gitignored registry-items.json to the tracked packages/registry/registry.json the STRICTLY block already mandates. No verify command, gate step, or check strength was weakened: every drill still must exit non-zero naming its offender, and the healthy control must pass.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-012",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "healthy_porting_candidate": {
      "description": "The candidate at GBC-012's close: GBC-004's apps/docs/src/content/docs/porting.md with `mapping` (entries `{ upstream, item }`), `notPorted` and `upstream` frontmatter arrays, GBC-003's owns-vs-does-not-own `gaps` array, the tracked packages/registry/registry.json (56 items), GBC-009's /porting route and porting-map.spec.ts, and this task's check wired into scripts/docs-data/prebuild.ts, built by the run_cmd's own docs build and served by the Playwright-owned preview at http://localhost:4321.",
      "seed_method": "cli",
      "records": [
        "Run `pnpm --filter @rnr-ai-elements/docs build`; its prebuild runs the porting-consistency check over the real files.",
        "packages/registry/registry.json holds 56 items; its `name` values are the only valid mapping slugs.",
        "CI=1 makes Playwright start its own strict-port preview on port 4321."
      ]
    },
    "unknown_slug_copy": {
      "description": "A $TMPDIR copy of the real porting.md whose `conversation` mapping entry (object `{ upstream, item }`) names slug `chat-conversation` instead of `conversation`; the gaps array and registry.json are the real tracked files.",
      "seed_method": "cli",
      "records": [
        "mapping entry { upstream: conversation, item: chat-conversation }"
      ]
    },
    "mapped_and_not_ported_copy": {
      "description": "A $TMPDIR copy of the real porting.md where `conversation` keeps its mapping entry and is also appended to `notPorted`.",
      "seed_method": "cli",
      "records": [
        "conversation in `mapping` and in `notPorted`"
      ]
    },
    "gap_names_shipped_slug_copy": {
      "description": "A $TMPDIR copy of the real owns-vs-does-not-own frontmatter whose `gaps` array gains `conversation`, one of the 56 shipped slugs.",
      "seed_method": "cli",
      "records": [
        "gaps += conversation"
      ]
    },
    "untracked_upstream_copy": {
      "description": "A $TMPDIR copy of the real porting.md whose `upstream` array gains `DrillOnlyElement`, which appears in neither `mapping` nor `notPorted`.",
      "seed_method": "cli",
      "records": [
        "upstream += DrillOnlyElement"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GBC-009's porting-map.spec.ts has landed (wave B), GBC-004's porting.md and GBC-003's gaps array are on the trunk, and this task has wired the porting-consistency check into prebuild.ts WHEN the FLOW-DOCS-05 run_cmd runs the full ordered docs build, whose prebuild now runs the check over the real content, and then porting-map.spec.ts THEN the build exits 0 and /porting still passes GBC-009's spec: a mapping table with a Deviation column and at least 5 rows whose slugs all resolve to the 56 registry items, and a not-ported list that exactly completes the upstream set",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-012-1",
        "use_case_ref": "UC-DOCS-05",
        "ac_ref": "AC-1",
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the check wired into prebuild.ts false-fires on the healthy real content, so the build segment exits non-zero and Playwright never starts",
            "porting.md maps a slug absent from registry.json, or its not-ported list is empty or names a shipped item"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-05-porting-map-and-prior-art/run.json"
        },
        "cases": [
          {
            "start_ref": "healthy_porting_candidate",
            "action": {
              "actor": "system",
              "steps": [
                "Run the FLOW-DOCS-05 run_cmd; record the build segment's exit code.",
                "In porting-map.spec.ts, GET /porting and /docs/porting and record both statuses.",
                "Read the /porting mapping table header cells and body rows, and the not-ported list entries.",
                "Compare each mapping row slug and each not-ported entry with the 56 `name` values in packages/registry/registry.json, and the combined count with porting.md's `upstream` array."
              ]
            },
            "end_state": {
              "must_observe": [
                "the run_cmd's first segment `pnpm --filter @rnr-ai-elements/docs build` exits `0` with the porting-consistency check running inside prebuild",
                "GET `/porting` responds `200` and GET `/docs/porting` responds `404`",
                "the /porting mapping table has a header cell matching /deviation/i and >= 5 body rows",
                "0 mapping rows whose slug is outside the 56 `name` values in packages/registry/registry.json",
                "mapping row count + not-ported entry count == length of porting.md's `upstream` array, with 0 not-ported entries equal to a registry `name`"
              ],
              "must_not_observe": [
                "a non-zero build exit naming a porting-consistency violation",
                "an empty not-ported list (0 entries)",
                "a mapping table with no deviation column"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN a drill copy of porting.md whose `conversation` mapping entry (`{ upstream: conversation, item: conversation }`) has its `item` rewritten to `chat-conversation` (the real slug is `conversation`) WHEN the drill runs the real porting-consistency check over that copy and the tracked registry.json THEN it fails naming the `conversation` mapping entry and the unknown slug `chat-conversation`",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_function": "GBC-012-unknown-slug-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_tier": "unit",
      "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
      "surface_policy": null,
      "unit_test_justified": "Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-012-2",
        "use_case_ref": "UC-DOCS-05",
        "ac_ref": "AC-2",
        "tier": "visible",
        "test_tier": "unit",
        "unit_test_justified": "Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.",
        "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the check is warn-only or omitted (disconnected), so an unresolved slug passes",
            "the 56 names are hardcoded in the gate instead of read from packages/registry/registry.json"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "unknown_slug_copy",
            "action": {
              "actor": "system",
              "steps": [
                "Copy the real porting.md to a $TMPDIR path and rewrite the `conversation` mapping entry's `item` to `chat-conversation`.",
                "Run the exported check prebuild.ts calls over the copy, the real gaps array and packages/registry/registry.json; capture the thrown error or exit code and message.",
                "Run the same check over the unmodified real files as the control."
              ]
            },
            "end_state": {
              "must_observe": [
                "the check exits non-zero or throws (exit code != 0) on the copy",
                "the message contains `chat-conversation`",
                "the message names the offending mapping entry `conversation` (lowercase kebab, exactly as its `upstream` key appears in the frontmatter)",
                "the control run over the real files passes with exit code 0"
              ],
              "must_not_observe": [
                "exit code 0 on the mutated copy",
                "a failure message with no slug named (empty offender)"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN a drill copy of porting.md where `conversation` stays mapped and is also listed in notPorted WHEN the drill runs the real porting-consistency check over that copy THEN it fails naming the element and both lists involved",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_function": "GBC-012-mapped-and-not-ported-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_tier": "unit",
      "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
      "surface_policy": null,
      "unit_test_justified": "Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-012-3",
        "use_case_ref": "UC-DOCS-05",
        "ac_ref": "AC-3",
        "tier": "visible",
        "test_tier": "unit",
        "unit_test_justified": "Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.",
        "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the complement is not computed (the check only resolves slugs), so an element in both lists passes",
            "the gaps cross-check is omitted, so a boundary gap naming a shipped slug passes"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "mapped_and_not_ported_copy",
            "action": {
              "actor": "system",
              "steps": [
                "Copy the real porting.md to $TMPDIR and append `conversation` to `notPorted`, keeping its mapping entry.",
                "Run the exported check over the copy; capture the error or exit code and message."
              ]
            },
            "end_state": {
              "must_observe": [
                "the check exits non-zero or throws (exit code != 0) on the copy",
                "the message contains `conversation`",
                "the message names both `mapping` and `notPorted`"
              ],
              "must_not_observe": [
                "exit code 0 on the mutated copy",
                "a message naming only one list or no list"
              ]
            }
          },
          {
            "start_ref": "gap_names_shipped_slug_copy",
            "action": {
              "actor": "system",
              "steps": [
                "Copy the real owns-vs-does-not-own frontmatter to $TMPDIR and append `conversation` to `gaps`.",
                "Run the exported check with the real porting.md and the mutated gaps copy; capture the error or exit code and message."
              ]
            },
            "end_state": {
              "must_observe": [
                "the check exits non-zero or throws (exit code != 0) on the copy",
                "the message contains the gap `conversation` and states it is one of the 56 shipped slugs"
              ],
              "must_not_observe": [
                "exit code 0 on the mutated gaps array",
                "a failure with no gap named"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN a drill copy of porting.md whose upstream array gains `DrillOnlyElement`, tracked in neither mapping nor notPorted WHEN the drill runs the real porting-consistency check over that copy THEN it fails naming `DrillOnlyElement`",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_function": "GBC-012-untracked-upstream-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_tier": "unit",
      "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
      "surface_policy": null,
      "unit_test_justified": "Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-012-4",
        "use_case_ref": "UC-DOCS-05",
        "ac_ref": "AC-4",
        "tier": "visible",
        "test_tier": "unit",
        "unit_test_justified": "Gate drill: vitest runs the real exported check over $TMPDIR copies of the real porting.md and gaps array plus the tracked registry.json with no mocks; it is tier-labelled unit only because FLOW-DOCS-05's rendered proof belongs to GBC-009 and these planted-drift cases are this task's own artifact.",
        "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the upstream set is derived from the mapping itself instead of porting.md's `upstream` array, so a new element is never seen",
            "the check is omitted from prebuild.ts (disconnected)"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "untracked_upstream_copy",
            "action": {
              "actor": "system",
              "steps": [
                "Copy the real porting.md to $TMPDIR and append `DrillOnlyElement` to `upstream` only.",
                "Run the exported check over the copy; capture the error or exit code and message."
              ]
            },
            "end_state": {
              "must_observe": [
                "the check exits non-zero or throws (exit code != 0) on the copy",
                "the message contains `DrillOnlyElement`"
              ],
              "must_not_observe": [
                "exit code 0 on the mutated copy",
                "a message with no element named"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "the FLOW-DOCS-05 run_cmd exits 0 with the check running in prebuild, and porting-map.spec.ts passes",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build (`pnpm --filter @rnr-ai-elements/docs build`) of the candidate, served by the Playwright-owned strict-port astro preview at http://localhost:4321 (CI=1), driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "a mapping slug `chat-conversation` fails the check naming the `conversation` mapping entry and the slug, while the real files pass",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_function": "GBC-012-unknown-slug-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_tier": "unit",
      "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
      "surface_policy": null,
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "`conversation` in both mapping and notPorted fails naming the element and both lists",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_function": "GBC-012-mapped-and-not-ported-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_tier": "unit",
      "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
      "surface_policy": null,
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "an upstream element in neither list fails naming the element",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_function": "GBC-012-untracked-upstream-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_tier": "unit",
      "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
      "surface_policy": null,
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "a boundary gap naming the shipped slug `conversation` fails naming the gap",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_function": "GBC-012-mapped-and-not-ported-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts",
      "test_tier": "unit",
      "verification_service": "Real exported porting-consistency check (the function prebuild.ts calls) run by vitest over $TMPDIR copies of the real porting.md and boundary gaps array plus the tracked packages/registry/registry.json, no mocks",
      "surface_policy": null,
      "maps_to_ac": "AC-3"
    }
  ]
}
-->

## Handoff

```json
{
  "task": "GBC-012",
  "commit_sha": "ddb87b9a3136c43db9abf53e6169afdf5ecba155",
  "done": "GBC-012 landed as ddb87b9a on kb-run-sprint/sprint-06-guides-boundary-changelog/GBC-012 (merged to main as 9c73de7e): scripts/docs-data/porting-consistency.ts (436 lines) fail-closed cross-checks porting.md frontmatter against the tracked packages/registry/registry.json (unknown mapping slugs, exact-complement notPorted incl. mapped-and-not-ported naming both lists, untracked-upstream, partition outliers, duplicates) and GBC-003's gaps array (exact-equality rejection of any gap naming one of the 56 shipped slugs), parsing frontmatter through Astro's own parser via the createRequire chain apps/docs -> astro -> @astrojs/internal-helpers/frontmatter; scripts/docs-data/prebuild.ts wires the gate beside the changelog gates before any output byte; the RED-first drill tests/sprint-06-guides-boundary-changelog/porting-consistency.test.ts plants all four AC drifts as $TMPDIR copies and passes 4/4, with RED evidence under .tmp/GBC-012/cycle-1/red/; final gates on the committed tree: tsc clean, biome ci . 0 errors, fallow 0 findings, docs build exit 0 with the gate line live in prebuild, FLOW-DOCS-05 18/18, and the contract clean-tree check prints nothing.",
  "deviations": [],
  "concerns": [
    "The full vitest suite (69 files, 809 tests, including two multi-minute docs-build drills) cannot complete within this harness's command limits \u2014 three runs were killed at the 10-minute foreground and 30-minute background caps with zero output flushed, so no task should assume `pnpm exec vitest run` is one runnable command; verification has to be split per directory.",
    "A vitest run killed mid-flight can strand a destructive test mid-rmSync: this session found apps/docs/src/data/dev-client-matrix.json and token-usage.json left deleted in the worktree (restored via git checkout), which had cascaded ~50 false build-dependent failures into a later suite run \u2014 anyone seeing mass 'docs build exited 1' failures should check `git status` for stranded deletions before chasing code.",
    "`pnpm lint` (the pnpm-wrapped biome) intermittently dies with exit 254 'Linter process terminated abnormally (possibly out of memory)' while ./node_modules/.bin/biome ci . exits 0 on the identical tree, and the righthook pre-commit runs the pnpm form \u2014 a healthy tree can still fail its first commit attempt (a retry succeeded).",
    "Running the FLOW-DOCS-05 verify rewrites GBC-009's evidence artifact tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-05-porting-map-and-prior-art/run.json (runIdentity timestamp on line 1); I restored it before committing, but every future re-verify will dirty it again and its owner should decide whether re-baselining is expected."
  ],
  "findings": [
    "The pre-commit hook (righthook, config righthook.yml, jobs biome + fallow) gates new modules on unused exports AND unit size >60 lines / complexity (CRAP), so gate-module authors should internalize helpers and keep functions under ~45 lines from the first draft \u2014 my first porting-consistency.ts version failed the hook until three exports were internalized and two functions were split.",
    "The gate's exported surface is deliberately minimal after that gate: only runPortingConsistencyGates plus the path constants REGISTRY_JSON/PORTING_MD/OWNS_MD are exported from scripts/docs-data/porting-consistency.ts; any future consumer (e.g. a route-side re-check) will need to re-export the pure check deliberately.",
    "Unproven observation from the contaminated suite run, not stash-verified per-file: content-assertion failures in tests/sprint-05-orient-search/live-example-api.test.ts (expects an 'expo/fetch' import), tests/sprint-03-family-browse/ledger-filter-contract.test.ts (expects 'hidden = false'), tests/sprint-04-generated-reference/seam-contract.test.ts (TextClassContext section count), and REF-006 data-table assertions \u2014 treat as suspected trunk drift until individually re-run on a quiet tree.",
    "The orchestrator's known pre-existing list (ORI-AST-001 x3, ORI-AST-004-index-model, SHELL-002, REF-006, deliv-03 cascade, search-slot strict-mode, theming heading) matches failures seen in the cascade log, so that list remains accurate as of c921ac15."
  ],
  "scope_impact": [
    {
      "target": "ROADMAP",
      "found": "tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts (FUSE-05 'copies public r generated-only and byte-identical') asserts apps/docs/public must contain zero tracked files, but `git ls-files apps/docs/public` at c921ac15 shows 5 tracked font files (fonts/OFL.txt, spline-sans-mono-var-latin*.woff2, spline-sans-var-latin-ext.woff2) \u2014 the test fails on a pristine trunk checkout, proven by ls-files at HEAD, unrelated to GBC-012.",
      "change": "Schedule a task to reconcile: either untrack/gitignore apps/docs/public/fonts/* (if fonts are meant to be sourced) or amend the FUSE-05 assertion to allow the tracked fonts (if they are deliberately committed)."
    },
    {
      "target": "ROADMAP",
      "found": "tests/sprint-02-shell-hero/copy-pass.test.ts (SHELL-010 copy contract) fails on pristine trunk because the copy-stable anchor 'ship no tokens' no longer appears in the authored theming content \u2014 stash-proven identical with and without the GBC-012 diff.",
      "change": "Have the sprint-02 owner (or techwriting) either restore the 'ship no tokens' anchor sentence to the theming manuscript or re-pin SHELL-010's anchor list to the current authored copy."
    }
  ],
  "feedback": []
}
```
