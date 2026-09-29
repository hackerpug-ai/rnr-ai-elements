================================================================================
TASK: GBC-007 - Changelog content collection + schema + build gates (tag one-to-one, reverse-chrono, section presence)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: 14250e33e501d7d41bb099f01fe8144f115679ed
PRIORITY:   P1
POINTS:     5
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- register the `changelog` collection in apps/docs/src/content.config.ts with glob base `./src/content/changelog`
- require version (semver), date (ISO), added, changed, fixed on every entry via the Zod schema
- enforce one-to-one between `git tag --list 'v*'` (mapped to `{semver}` by stripping the `v`) and entry versions at build
- enforce reverse-chronological order at build: date DESC, then semver DESC as the tiebreak — equal dates are LEGAL (v0.2.0 and v0.2.1 are both 2026-09-08 in the real tags; 'strictly descending dates' would fail the healthy tree)
- pin version to z.string().regex(SEMVER) and date to z.string().datetime() in the Zod schema — presence without shape lets malformed values reach hrefs and headings
- enforce date + added + changed + fixed presence on every entry at build (empty values fine, absent fields not)
- fail malformed-value fixtures: version "<script>alert(1)</script>" and date "not-a-date" each fail the schema naming the entry and field; a duplicate-version pair (two entries claiming 0.2.1 against one tag) fails one-to-one
- include a tie fixture in the vitest drill: two entries sharing a date must order by semver DESC (0.2.1 above 0.2.0)
- wire the gates into scripts/docs-data/prebuild.ts so they run before any output byte is written
- add optional mapping, notPorted, and upstream array fields to the docs collection schema (GBC-004 authors them in porting.md frontmatter; GBC-012's gate consumes them)
- print `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological` on a green run
NEVER:
- derive the expected tag set from the changelog collection (the git tags are the trusted outside source)
- warn-only or silently skip a tag/entry mismatch, an ordering violation, or a missing field
- author the changelog entry .md files (techwriting GBC-005 owns apps/docs/src/content/changelog/*.md)
- write any output file (the gates are read-only; prebuild owns writing)
STRICTLY:
- rendered version/date strings come only from schema-validated frontmatter — raw `git tag` output appears in gate diagnostics (stderr) only, never in rendered pages
- spawn git via arg-array (execFileSync('git', ['tag', '--list', 'v*'])), never a shell string
- zod owns field presence and shape at the astro build; the prebuild gate owns tag-sync and ordering only
- trust model: markdown raw HTML passes through unsanitized (committer-trusted); any external-content path requires rehype-sanitize first
- use the `[docs-data] changelog: ...` violation renderer (matching the gates.ts `[docs-data] <gate>:` shape)
- run `git tag --list 'v*'` from the repo root and map `v{semver}` -> `{semver}`
- keep assertChangelogSync a pure function (entries + tags in, violations out) so the vitest drill can inject a tag set
- SUPERSEDES the frontmatter-field lines above. TR-03 (.spec/prds/docs-site/11-technical-requirements/03-data-schema.md) defines changelog_entry as version; date; body (added/changed/fixed markdown), and GBC-005 authors Added/Changed/Fixed as body headings. So the frontmatter carries only `version` and `date`, and `added`, `changed`, `fixed` are NOT schema fields. Read the earlier lines as follows: 'require version, date, added, changed, fixed via the Zod schema' means require version and date via changelogSchema; 'enforce date + added + changed + fixed presence' means date presence in changelogSchema plus the body-section gate below; 'zod owns field presence and shape; the prebuild gate owns tag-sync and ordering only' means zod owns version and date, and the prebuild gate owns tag-sync, ordering and body sections.
- MUST gate every entry's markdown body in prebuild with a pure function (version and body in, violations out): exactly one `## Added`, one `## Changed` and one `## Fixed` heading, in that order, and each section holds at least 1 list item or a line reading exactly `none`. HTML comments (such as GBC-005's commit-range citation) are ignored. Any miss fails the build naming the version and the heading, e.g. `[docs-data] changelog: entry 0.2.1 missing ## Fixed`. Print the success line only after the tag-sync, ordering and body-section gates all pass.
- MUST read each entry's frontmatter in prebuild with a strict flat `key: scalar` reader (TR-03's fence holds only version and date) and pass the result through changelogSchema, so the gate and the astro build normalize dates the same way. Any other line shape fails the gate naming the file. Add no YAML dependency: none resolves from scripts/ under the isolated pnpm linker (js-yaml, yaml, gray-matter and @astrojs/internal-helpers were all checked).
- MUST export `changelogSchema` (version, date) and the release comparator (date DESC, then semver DESC) from apps/docs/src/lib/changelog-schema.ts. content.config.ts registers the changelog collection with that one schema object, changelog-gates.ts validates and sorts with the same exports, and GBC-008 imports the comparator.
- MUST validate `date` with `z.coerce.date()`: it accepts both the JS Date that js-yaml yields for an unquoted `date: 2026-09-08` and a quoted string, and it rejects a missing date and `not-a-date`. This supersedes the `z.string().datetime()` wording above, which rejects `2026-09-08` under astro 7.3.2's Zod 4 (checked against the installed packages). Compare and print dates as the UTC calendar day (`toISOString().slice(0, 10)`), never local time, which prints 2026-09-07 in America/Denver.
- NEVER edit tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts: GBC-008 writes it. AC-1 is an early binding proven when GBC-008 closes (sprint-02 SHELL-005 precedent), so GBC-007 closes on its own UNIT ACs AC-2..AC-6.
- UNIT_TEST_JUSTIFIED: AC-2..AC-6 test pure logic with zero network, git or build I/O (assertChangelogSync over literal entry and tag arrays, the body-section check over literal markdown bodies, the flat frontmatter reader over literal text, changelogSchema.safeParse over literal objects) plus one static read of content.config.ts; the real-tree proof (real git tags, real prebuild) is AC-1's binding to FLOW-DOCS-06.

## Specification
Objective: Add the changelog content collection and three fail-closed build gates so the CAP-LLMS-01 release source can never drift from the real git tags, order, or required sections.
Success state: A clean tree with tags v0.1.0/v0.2.0/v0.2.1 and three matching entries builds green printing the one-to-one + reverse-chronological success line; a tag-without-entry, entry-without-tag, out-of-order, or missing-field fixture each fails the build naming the offender.

## Acceptance Criteria
### AC-1: One-to-one tag↔entry on the healthy tree
  GIVEN: GBC-008's changelog-release-pages spec has landed (GBC-008 writes it; this early AC is proven when GBC-008 closes), and the tree holds git tags v0.1.0, v0.2.0, v0.2.1 plus GBC-005's entries 0.1.0, 0.2.0, 0.2.1
  WHEN:  the FLOW-DOCS-06 run_cmd builds the docs and the spec spawns the real prebuild (pnpm --filter @rnr-ai-elements/docs run prebuild), which runs the changelog gates from scripts/docs-data/changelog-gates.ts
  THEN:  tag-sync, ordering and body-section gates all pass; prebuild exits 0 and prints `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological`, and the tag count equals the run-time `git tag --list 'v*'` count
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: integration
  VERIFICATION_SERVICE: Real docs prebuild (tsx scripts/docs-data/prebuild.ts via pnpm --filter @rnr-ai-elements/docs run prebuild) spawned inside GBC-008's FLOW-DOCS-06 Playwright spec against the real git tags v0.1.0, v0.2.0, v0.2.1 and GBC-005's committed changelog entries
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['prebuild omits the changelog gate call (wiring removed): stdout carries no `[docs-data] changelog:` line', 'a GBC-005 entry file is deleted, or loses its `## Fixed` heading: the counts stop reading 3 and 3, or the gate throws and prebuild exits non-zero', "the success line is a static string printed regardless of the inputs: the spec checks its tag count against `git tag --list 'v*'`"]
        EVIDENCE: stdout
        - START_REF: release_tags_and_entries
          ACTION: ['run the locked FLOW-DOCS-06 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-06-changelog-release-pages` against the Playwright-owned preview at http://localhost:4321', "inside the spec, read the expected tag count with execFileSync('git', ['tag', '--list', 'v*']) (3 today: v0.1.0, v0.2.0, v0.2.1)", "spawn the real prebuild with execFileSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'run', 'prebuild']) from the repo root and capture its exit code and stdout"]
          MUST_OBSERVE: ['prebuild exit code `0`', 'stdout holds exactly 1 line `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological`', "the `3 tags` figure equals the run-time `git tag --list 'v*'` line count (3)"]
          MUST_NOT_OBSERVE: ['any `[docs-data] changelog:` line other than the success line (a violation)', 'a count of `0 tags` or `0 entries` (unread tags or an empty collection)', 'a non-zero prebuild exit code']

### AC-2: Tag-without-entry fails the gate naming the tag
  GIVEN: assertChangelogSync receives entries 0.1.0 (2026-09-07), 0.2.0 (2026-09-08), 0.2.1 (2026-09-08) and the tag set ['v0.1.0', 'v0.2.0', 'v0.2.1', 'v0.2.2']
  WHEN:  the Vitest drill calls it, then passes the result to the throwing gate wrapper that prebuild calls
  THEN:  it returns exactly 1 violation naming `v0.2.2` as tag-without-entry, rendered as a line starting `[docs-data] changelog:`, and the wrapper throws (never a warning)
  TEST_TIER: unit
  VERIFICATION_SERVICE: Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)
  UNIT_TEST_JUSTIFIED: Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: GBC-007-tag-without-entry
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-tag-without-entry

### AC-3: Entry-without-tag fails the gate naming the entry
  GIVEN: assertChangelogSync receives entries 0.1.0, 0.2.0, 0.2.1, 0.3.0 against tags ['v0.1.0', 'v0.2.0', 'v0.2.1']; a second case passes two entries both claiming 0.2.1 against the same three tags
  WHEN:  the Vitest drill calls it for each case
  THEN:  the first case returns a violation naming `0.3.0` as entry-without-tag; the second returns a violation naming `0.2.1` as a duplicate version; the wrapper throws for both
  TEST_TIER: unit
  VERIFICATION_SERVICE: Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)
  UNIT_TEST_JUSTIFIED: Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: GBC-007-entry-without-tag
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-entry-without-tag

### AC-4: Reverse-chronological ordering enforced
  GIVEN: assertChangelogSync receives entries with swapped dates (0.1.0 2026-09-07, 0.2.0 2026-09-09, 0.2.1 2026-09-08) and matching tags; a tie case gives 0.2.0 and 0.2.1 the same date 2026-09-08
  WHEN:  the Vitest drill calls it for each case
  THEN:  the swapped case returns exactly 1 ordering violation naming both `0.2.0` and `0.2.1`; the tie case returns 0 violations and the exported comparator orders `0.2.1` before `0.2.0` (semver DESC breaks the tie)
  TEST_TIER: unit
  VERIFICATION_SERVICE: Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)
  UNIT_TEST_JUSTIFIED: Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: GBC-007-reverse-chronological
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-reverse-chronological

### AC-5: Added/Changed/Fixed headings enforced in every entry body
  GIVEN: the body-section check receives literal markdown bodies for entry 0.2.1: one healthy body (`## Added` reading `none`, `## Changed` and `## Fixed` each with 1 list item, plus an HTML comment citing `v0.2.0..v0.2.1`) and four broken ones: `## Fixed` removed, `## Added` twice, `## Changed` with no list item and no `none`, and `## Fixed` placed before `## Changed`
  WHEN:  the Vitest drill calls it for each body, then passes each result to the throwing gate wrapper that prebuild calls
  THEN:  the healthy body returns 0 violations; each broken body returns exactly 1 violation naming `0.2.1` and the heading at fault (`## Fixed` missing, `## Added` duplicated, `## Changed` empty, headings out of order), rendered as a line starting `[docs-data] changelog:`, and the wrapper throws
  TEST_TIER: unit
  VERIFICATION_SERVICE: Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)
  UNIT_TEST_JUSTIFIED: Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: GBC-007-body-sections
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-body-sections

### AC-6: Version and date shape enforced
  GIVEN: changelogSchema (version, date) exported from apps/docs/src/lib/changelog-schema.ts, the flat frontmatter reader, and literal inputs for entry 0.2.1
  WHEN:  the Vitest drill runs the reader and changelogSchema.safeParse on each input and reads content.config.ts
  THEN:  the reader turns `version: 0.2.1` and `date: 2026-09-08` into those two values and throws naming the file on a nested YAML line; changelogSchema accepts both a JS Date for 2026-09-08 and the string `2026-09-08`, each printing `2026-09-08` via `toISOString().slice(0, 10)`; it fails a missing date and `not-a-date` at path `date`, and `<script>alert(1)</script>` at path `version`; and content.config.ts registers collection `changelog` with glob base `./src/content/changelog` and `changelogSchema`
  TEST_TIER: unit
  VERIFICATION_SERVICE: Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)
  UNIT_TEST_JUSTIFIED: Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: GBC-007-frontmatter-shape
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-frontmatter-shape

## Test Criteria
- TC-1: content.config.ts registers collection `changelog` with glob base `./src/content/changelog` and changelogSchema (version, date)  (maps_to: AC-6)
- TC-2: the body-section gate fails an entry missing any of `## Added`, `## Changed`, `## Fixed`, and passes a section that reads `none`  (maps_to: AC-5)
- TC-3: the real prebuild runs the changelog gates and prints the one-to-one success line on the healthy tree  (maps_to: AC-1)
- TC-4: assertChangelogSync is pure: entries and tags in, violations out, with no git or filesystem access  (maps_to: AC-2)
- TC-5: changelogSchema rejects a missing or malformed date and a non-semver version  (maps_to: AC-6)

## Reading List
- apps/docs/src/content.config.ts
- scripts/docs-data/gates.ts
- scripts/docs-data/prebuild.ts
- apps/docs/src/lib/docs-navigation.ts
- tests/sprint-05-orient-search/dist-link-gate.test.ts
- tests/sprint-05-orient-search/docs-collection.test.ts

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content.config.ts (MODIFY)
- apps/docs/src/lib/changelog-schema.ts (NEW)
- scripts/docs-data/changelog-gates.ts (NEW)
- scripts/docs-data/prebuild.ts (MODIFY)
- tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts
WRITE-PROHIBITED:
- apps/docs/src/content/changelog/*.md (techwriting GBC-005 authors the three entries)
- apps/docs/src/pages/changelog/** (GBC-008 owns routes)
- apps/docs/src/components/** (design lens owns primitives)
- apps/docs/src/content/docs/** (techwriting owns guides/boundary/porting prose)

## Design
References: ['scripts/docs-data/gates.ts (GateError + runAllGates pattern)', 'scripts/docs-data/prebuild.ts (gate-then-write composition)']
Interaction notes: The changelog gates are a pure assert + a CLI main; prebuild invokes them alongside runAllGates so a degraded tree fails before any output byte. The three entry files are techwriting's (GBC-005); this task only registers the collection and validates the entries.
Pattern: Fail-closed build gate: pure assert function (entries + tags -> violations) + prebuild wiring + RED-first vitest fixture drill over the real build (scripts/docs-data/gates.ts)
Anti-pattern: Deriving the expected tag set from the changelog collection (self-derived expectation) or warning-only drift

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts

## Dependencies
Depends on: ['GBC-005']
Blocks:     ['GBC-008']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-007",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "release_tags_and_entries": {
      "description": "The real repository state FLOW-DOCS-06 runs against: three git tags made with the git CLI and GBC-005's three committed changelog entries, read at run time and never injected.",
      "seed_method": "cli",
      "records": [
        "git tag v0.1.0 (created 2026-09-07)",
        "git tag v0.2.0 (created 2026-09-08)",
        "git tag v0.2.1 (created 2026-09-08)",
        "apps/docs/src/content/changelog/0.1.0.md: frontmatter version 0.1.0, date 2026-09-07; body with one `## Added`, `## Changed`, `## Fixed` heading each",
        "apps/docs/src/content/changelog/0.2.0.md: frontmatter version 0.2.0, date 2026-09-08; body with one `## Added`, `## Changed`, `## Fixed` heading each",
        "apps/docs/src/content/changelog/0.2.1.md: frontmatter version 0.2.1, date 2026-09-08; body with one `## Added`, `## Changed`, `## Fixed` heading each"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GBC-008's changelog-release-pages spec has landed (GBC-008 writes it; this early AC is proven when GBC-008 closes), and the tree holds git tags v0.1.0, v0.2.0, v0.2.1 plus GBC-005's entries 0.1.0, 0.2.0, 0.2.1 WHEN the FLOW-DOCS-06 run_cmd builds the docs and the spec spawns the real prebuild (pnpm --filter @rnr-ai-elements/docs run prebuild), which runs the changelog gates from scripts/docs-data/changelog-gates.ts THEN tag-sync, ordering and body-section gates all pass; prebuild exits 0 and prints `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological`, and the tag count equals the run-time `git tag --list 'v*'` count",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "integration",
      "verification_service": "Real docs prebuild (tsx scripts/docs-data/prebuild.ts via pnpm --filter @rnr-ai-elements/docs run prebuild) spawned inside GBC-008's FLOW-DOCS-06 Playwright spec against the real git tags v0.1.0, v0.2.0, v0.2.1 and GBC-005's committed changelog entries",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "integration",
        "topology": "single-node",
        "verification_service": "Real docs prebuild (tsx scripts/docs-data/prebuild.ts via pnpm --filter @rnr-ai-elements/docs run prebuild) spawned inside GBC-008's FLOW-DOCS-06 Playwright spec against the real git tags v0.1.0, v0.2.0, v0.2.1 and GBC-005's committed changelog entries",
        "negative_control": {
          "would_fail_if": [
            "prebuild omits the changelog gate call (wiring removed): stdout carries no `[docs-data] changelog:` line",
            "a GBC-005 entry file is deleted, or loses its `## Fixed` heading: the counts stop reading 3 and 3, or the gate throws and prebuild exits non-zero",
            "the success line is a static string printed regardless of the inputs: the spec checks its tag count against `git tag --list 'v*'`"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "release_tags_and_entries",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "run the locked FLOW-DOCS-06 run_cmd: the real `pnpm --filter @rnr-ai-elements/docs build`, then `CI=1 pnpm exec playwright test` selecting `--grep FLOW-DOCS-06-changelog-release-pages` against the Playwright-owned preview at http://localhost:4321",
                "inside the spec, read the expected tag count with execFileSync('git', ['tag', '--list', 'v*']) (3 today: v0.1.0, v0.2.0, v0.2.1)",
                "spawn the real prebuild with execFileSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'run', 'prebuild']) from the repo root and capture its exit code and stdout"
              ]
            },
            "end_state": {
              "must_observe": [
                "prebuild exit code `0`",
                "stdout holds exactly 1 line `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological`",
                "the `3 tags` figure equals the run-time `git tag --list 'v*'` line count (3)"
              ],
              "must_not_observe": [
                "any `[docs-data] changelog:` line other than the success line (a violation)",
                "a count of `0 tags` or `0 entries` (unread tags or an empty collection)",
                "a non-zero prebuild exit code"
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
      "description": "GIVEN assertChangelogSync receives entries 0.1.0 (2026-09-07), 0.2.0 (2026-09-08), 0.2.1 (2026-09-08) and the tag set ['v0.1.0', 'v0.2.0', 'v0.2.1', 'v0.2.2'] WHEN the Vitest drill calls it, then passes the result to the throwing gate wrapper that prebuild calls THEN it returns exactly 1 violation naming `v0.2.2` as tag-without-entry, rendered as a line starting `[docs-data] changelog:`, and the wrapper throws (never a warning)",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-tag-without-entry",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-tag-without-entry",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "unit_test_justified": "Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.",
      "maps_to_ac": null
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN assertChangelogSync receives entries 0.1.0, 0.2.0, 0.2.1, 0.3.0 against tags ['v0.1.0', 'v0.2.0', 'v0.2.1']; a second case passes two entries both claiming 0.2.1 against the same three tags WHEN the Vitest drill calls it for each case THEN the first case returns a violation naming `0.3.0` as entry-without-tag; the second returns a violation naming `0.2.1` as a duplicate version; the wrapper throws for both",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-entry-without-tag",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-entry-without-tag",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "unit_test_justified": "Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.",
      "maps_to_ac": null
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN assertChangelogSync receives entries with swapped dates (0.1.0 2026-09-07, 0.2.0 2026-09-09, 0.2.1 2026-09-08) and matching tags; a tie case gives 0.2.0 and 0.2.1 the same date 2026-09-08 WHEN the Vitest drill calls it for each case THEN the swapped case returns exactly 1 ordering violation naming both `0.2.0` and `0.2.1`; the tie case returns 0 violations and the exported comparator orders `0.2.1` before `0.2.0` (semver DESC breaks the tie)",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-reverse-chronological",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-reverse-chronological",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "unit_test_justified": "Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.",
      "maps_to_ac": null
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the body-section check receives literal markdown bodies for entry 0.2.1: one healthy body (`## Added` reading `none`, `## Changed` and `## Fixed` each with 1 list item, plus an HTML comment citing `v0.2.0..v0.2.1`) and four broken ones: `## Fixed` removed, `## Added` twice, `## Changed` with no list item and no `none`, and `## Fixed` placed before `## Changed` WHEN the Vitest drill calls it for each body, then passes each result to the throwing gate wrapper that prebuild calls THEN the healthy body returns 0 violations; each broken body returns exactly 1 violation naming `0.2.1` and the heading at fault (`## Fixed` missing, `## Added` duplicated, `## Changed` empty, headings out of order), rendered as a line starting `[docs-data] changelog:`, and the wrapper throws",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-body-sections",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-body-sections",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "unit_test_justified": "Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.",
      "maps_to_ac": null
    },
    {
      "id": "AC-6",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN changelogSchema (version, date) exported from apps/docs/src/lib/changelog-schema.ts, the flat frontmatter reader, and literal inputs for entry 0.2.1 WHEN the Vitest drill runs the reader and changelogSchema.safeParse on each input and reads content.config.ts THEN the reader turns `version: 0.2.1` and `date: 2026-09-08` into those two values and throws naming the file on a nested YAML line; changelogSchema accepts both a JS Date for 2026-09-08 and the string `2026-09-08`, each printing `2026-09-08` via `toISOString().slice(0, 10)`; it fails a missing date and `not-a-date` at path `date`, and `<script>alert(1)</script>` at path `version`; and content.config.ts registers collection `changelog` with glob base `./src/content/changelog` and `changelogSchema`",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-frontmatter-shape",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-frontmatter-shape",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "unit_test_justified": "Pure logic over literal inputs: the gate functions take entries, tags, markdown bodies and frontmatter text as arguments and the schema parses literal objects, so every case is exact and needs no git, network or build; the real-tree proof is AC-1 on FLOW-DOCS-06.",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "content.config.ts registers collection `changelog` with glob base `./src/content/changelog` and changelogSchema (version, date)",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-frontmatter-shape",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-frontmatter-shape",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "maps_to_ac": "AC-6"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "the body-section gate fails an entry missing any of `## Added`, `## Changed`, `## Fixed`, and passes a section that reads `none`",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-body-sections",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-body-sections",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "maps_to_ac": "AC-5"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "the real prebuild runs the changelog gates and prints the one-to-one success line on the healthy tree",
      "flow_ref": "FLOW-DOCS-06-changelog-release-pages",
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts",
      "test_function": "FLOW-DOCS-06-changelog-release-pages",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages",
      "test_tier": "integration",
      "verification_service": "Real docs prebuild (tsx scripts/docs-data/prebuild.ts via pnpm --filter @rnr-ai-elements/docs run prebuild) spawned inside GBC-008's FLOW-DOCS-06 Playwright spec against the real git tags v0.1.0, v0.2.0, v0.2.1 and GBC-005's committed changelog entries",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "assertChangelogSync is pure: entries and tags in, violations out, with no git or filesystem access",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-tag-without-entry",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-tag-without-entry",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "changelogSchema rejects a missing or malformed date and a non-semver version",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts",
      "test_function": "GBC-007-frontmatter-shape",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts -t GBC-007-frontmatter-shape",
      "test_tier": "unit",
      "verification_service": "Vitest over pure functions with literal inputs: assertChangelogSync(entries, tags), the body-section check, the flat frontmatter reader and changelogSchema.safeParse (no git, no network, no build)",
      "surface_policy": null,
      "maps_to_ac": "AC-6"
    }
  ]
}
-->

## Handoff

```json
{
  "task": "GBC-007",
  "commit_sha": "14250e33e501d7d41bb099f01fe8144f115679ed",
  "done": "Landed the changelog content collection, shared schema, and three fail-closed prebuild gates: apps/docs/src/lib/changelog-schema.ts exports changelogSchema (semver version regex, z.coerce.date per the contract's supersede) plus the compareReleaseDesc/compareSemverDesc comparators; scripts/docs-data/changelog-gates.ts holds the pure assertChangelogSync (tag one-to-one with `git tag --list 'v*'` via arg-array execFileSync, duplicate detection, reverse-chronological consistency), the pure assertChangelogBody (exactly one ## Added/## Changed/## Fixed in order, each a list item or bare `none`, HTML comments ignored), and the strict flat key:scalar frontmatter reader feeding changelogSchema; scripts/docs-data/prebuild.ts runs runChangelogGates before any output byte and prints the computed-count success line; apps/docs/src/content.config.ts:52 registers the changelog collection on ./src/content/changelog and adds the optional mapping/notPorted/upstream fields to the docs schema. RED evidence for all five unit ACs is committed under .tmp/GBC-007/cycle-1/red/ (module-not-found), GREEN plus real-tree proof under green/: the real prebuild exits 0 printing '[docs-data] changelog: 3 tags, 3 entries \u2014 one-to-one, reverse-chronological' against the real v0.1.0/v0.2.0/v0.2.1 tags and GBC-005's three entries, a scratch-copy negative control (## Fixed removed) exits 1 naming '0.2.1 missing ## Fixed', and all four verification gates pass (tsc 0, biome ci 0, full docs build 0, vitest 5/5).",
  "deviations": [],
  "concerns": [
    "In this environment `pnpm exec biome ci .` (the pre-commit hook's `pnpm lint` leg) dies with exit 254 '[warn] Linter process terminated abnormally' \u2014 the task brief's documented artifact \u2014 so lint verification must use the direct binary ./node_modules/.bin/biome ci ., which matches CI.",
    "Invoking `git commit` through the rtk-wrapped path mangled the hook environment (rtk's own broken-pipe panic surfaced in the failed attempt); `rtk proxy git commit` lands cleanly with all three righthook legs green \u2014 future implementers in this repo should commit through rtk proxy.",
    "AC-1's formal closure still rides on GBC-008's changelog-release-pages spec; my run proved TC-3's mechanics on the real tree (exit 0, correct stdout line, tag count cross-checked) but the FLOW-DOCS-06 Playwright selector does not exist yet.",
    "Every docs build emits pre-existing link-check warnings because authored docs point at github.com/hackerpug-ai/rnr-ai-elements (stale org) \u2014 techwriting-owned, warnings only, but they will keep appearing in every build log."
  ],
  "findings": [
    "compareReleaseDesc is a direct Array.sort comparator (negative means a first) \u2014 GBC-008 must pass it straight to .sort() and must not re-derive ordering; my first implementation had the sign inverted and a naive reimplementation would reintroduce that bug.",
    "assertChangelogSync is input-order-independent (it walks a semver-DESC copy internally), so GBC-008 and future callers can pass entries in any array order and readdir order no longer matters.",
    "The prebuild gate's strict flat reader and astro's sync now both validate changelog frontmatter with different error surfaces: the reader rejects non-flat YAML lines before zod (naming the file), while astro's loader reports invalid-content-entry-data-error with field paths \u2014 a malformed entry fails the build twice by design.",
    "fallow skips prebuild.ts as a package.json entry point ('incomplete import graph' caveats) and fails new modules on unused exports \u2014 changelog-gates.ts needed five symbols un-exported and assertChangelogBody decomposed into four helpers to pass its complexity threshold (cyclomatic 18 breach), so future gate modules should keep their export surface minimal from the start.",
    "SEMVER_PATTERN is now module-private (apps/docs/src/lib/changelog-schema.ts:25) and compareSemverDesc ignores prerelease precedence \u2014 extend there, not in the gates, if a v0.3.0-rc.1 tag ever ships.",
    "The success line's 3/3 counts are computed at run time per the GBC-005 relay, so the '3 tags, 3 entries' pin belongs only in GBC-008's test assertions, never in gate code."
  ],
  "scope_impact": [
    {
      "target": "GBC-008",
      "found": "changelog-release-pages.spec.ts will assert the AC-1 stdout line and needs the release ordering for page rendering.",
      "change": "Import compareReleaseDesc (and compareSemverDesc if needed) from apps/docs/src/lib/changelog-schema.ts rather than re-deriving ordering, pin the exact line '[docs-data] changelog: 3 tags, 3 entries \u2014 one-to-one, reverse-chronological' in test assertions only, and note the run_cmd already prints it via scripts/docs-data/changelog-gates.ts runChangelogGates wired in scripts/docs-data/prebuild.ts."
    },
    {
      "target": "GBC-012",
      "found": "The porting-frontmatter fields its gate consumes are now schema-typed in apps/docs/src/content.config.ts: mapping is z.array(z.object({ upstream: z.string(), item: z.string() })), notPorted and upstream are z.array(z.string()).",
      "change": "Type the gate's consumer against the {upstream, item} object shape for mapping \u2014 a string-array assumption will fail typecheck against the authored porting.md data (40 pairs)."
    }
  ],
  "feedback": [
    "Saved RED/GREEN evidence captured through the default rtk-wrapped vitest invocation truncates to 'PASS (0) FAIL (0)' and hides assertion output \u2014 evidence commands for drills should run under `rtk proxy` so the captured logs are readable."
  ]
}
```
