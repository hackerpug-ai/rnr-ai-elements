================================================================================
TASK: GBC-007 - Changelog content collection + schema + build gates (tag one-to-one, reverse-chrono, section presence)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
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
- enforce strict reverse-chronological date order at build
- enforce date + added + changed + fixed presence on every entry at build (empty values fine, absent fields not)
- wire the gates into scripts/docs-data/prebuild.ts so they run before any output byte is written
- add optional mapping, notPorted, and upstream array fields to the docs collection schema (GBC-004 authors them in porting.md frontmatter; GBC-012's gate consumes them)
- print `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological` on a green run
NEVER:
- derive the expected tag set from the changelog collection (the git tags are the trusted outside source)
- warn-only or silently skip a tag/entry mismatch, an ordering violation, or a missing field
- author the changelog entry .md files (techwriting GBC-005 owns apps/docs/src/content/changelog/*.md)
- write any output file (the gates are read-only; prebuild owns writing)
STRICTLY:
- use the `[docs-data] changelog: ...` violation renderer (matching the gates.ts `[docs-data] <gate>:` shape)
- run `git tag --list 'v*'` from the repo root and map `v{semver}` -> `{semver}`
- keep assertChangelogSync a pure function (entries + tags in, violations out) so the vitest drill can inject a tag set

## Specification
Objective: Add the changelog content collection and three fail-closed build gates so the CAP-LLMS-01 release source can never drift from the real git tags, order, or required sections.
Success state: A clean tree with tags v0.1.0/v0.2.0/v0.2.1 and three matching entries builds green printing the one-to-one + reverse-chronological success line; a tag-without-entry, entry-without-tag, out-of-order, or missing-field fixture each fails the build naming the offender.

## Acceptance Criteria
### AC-1: One-to-one tag↔entry on the healthy tree
  GIVEN: a clean checkout with git tags v0.1.0, v0.2.0, v0.2.1 and three matching changelog entries 0.1.0, 0.2.0, 0.2.1 (authored by GBC-005)
  WHEN:  the docs prebuild runs scripts/docs-data/changelog-gates.ts
  THEN:  the build exits 0 and prints `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological`
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + git tags
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages: healthy tree is one-to-one and reverse-chronological
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  SCENARIO:
        MUST_OBSERVE: ['build exit 0', '`[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological` on stdout', 'entries 0.1.0, 0.2.0, 0.2.1 all collected']
        MUST_NOT_OBSERVE: ['any `[docs-data] changelog:` violation line', 'non-zero exit']

### AC-2: Tag-without-entry fails the build naming the tag
  GIVEN: the gate receives a tag set including v0.2.2 with no matching 0.2.2 entry
  WHEN:  the gate runs
  THEN:  it fails naming v0.2.2 as a tag-without-entry
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + git tags
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages: v0.2.2 tag without an entry fails naming v0.2.2
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names `v0.2.2`', 'states tag-without-entry']
        MUST_NOT_OBSERVE: ['exit 0', 'a warning-only message']

### AC-3: Entry-without-tag fails the build naming the entry
  GIVEN: an entry 0.3.0 exists with no matching git tag v0.3.0
  WHEN:  the gate runs
  THEN:  it fails naming 0.3.0 as an entry-without-tag
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + git tags
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages: 0.3.0 entry without a tag fails naming 0.3.0
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names `0.3.0`', 'states entry-without-tag']
        MUST_NOT_OBSERVE: ['exit 0']

### AC-4: Reverse-chronological ordering enforced
  GIVEN: entries 0.2.0 and 0.2.1 have swapped dates (0.2.0 dated after 0.2.1)
  WHEN:  the gate runs
  THEN:  it fails naming both entries and the ordering violation
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + git tags
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages: swapped dates fail naming 0.2.0 and 0.2.1
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names both `0.2.0` and `0.2.1`', 'states ordering violation']
        MUST_NOT_OBSERVE: ['exit 0']

### AC-5: Date + added + changed + fixed presence enforced
  GIVEN: an entry omits the `fixed` frontmatter field
  WHEN:  the gate/schema runs
  THEN:  it fails naming the entry and the missing field `fixed`
  FLOW_REF: FLOW-DOCS-06-changelog-release-pages
  TEST_TIER: integration
  VERIFICATION_SERVICE: real astro build + git tags
  SURFACE_POLICY: None
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  TEST_FUNCTION: FLOW-DOCS-06-changelog-release-pages: an entry missing `fixed` fails naming the field
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts
  SCENARIO:
        MUST_OBSERVE: ['non-zero exit', 'names the entry', 'names the missing field `fixed`']
        MUST_NOT_OBSERVE: ['exit 0', 'an entry with an empty `fixed` value being rejected (empty is legal)']

## Test Criteria
- TC-1: content.config.ts declares a `changelog` collection with glob base src/content/changelog  (maps_to: AC-1)
- TC-2: the changelog schema requires version, date, added, changed, fixed  (maps_to: AC-5)
- TC-3: prebuild.ts invokes the changelog gates before any output byte is written  (maps_to: AC-1)
- TC-4: assertChangelogSync is a pure function (entries + tags in, violations out) testable with an injected tag set  (maps_to: AC-2)

## Reading List
- apps/docs/src/content.config.ts
- scripts/docs-data/gates.ts
- scripts/docs-data/prebuild.ts
- apps/docs/src/lib/docs-navigation.ts
- tests/sprint-05-orient-search/dist-link-gate.test.ts
- tests/sprint-05-orient-search/docs-collection.test.ts

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content.config.ts (MODIFY — add changelog collection + optional mapping/notPorted/upstream array fields on the docs collection for GBC-012's gate)
- scripts/docs-data/changelog-gates.ts (NEW)
- scripts/docs-data/prebuild.ts (MODIFY — invoke changelog gates before output bytes)
- tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts (NEW vitest fixture drill)
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
    "three_tags_v010_v020_v021": "injected tag set ['v0.1.0','v0.2.0','v0.2.1'] against the three real entries 0.1.0/0.2.0/0.2.1 \u2014 healthy baseline (exit 0, success line)",
    "tag_without_entry": "injected tag set ['v0.1.0','v0.2.0','v0.2.1','v0.2.2'] with no 0.2.2 entry \u2014 gate fails naming v0.2.2 tag-without-entry",
    "entry_without_tag": "an entry 0.3.0.md present but no v0.3.0 tag \u2014 gate fails naming 0.3.0 entry-without-tag",
    "out_of_order": "entries 0.2.0 and 0.2.1 have swapped dates (0.2.0 dated after 0.2.1) \u2014 gate fails naming both entries",
    "missing_field": "an entry omits the `fixed` frontmatter key \u2014 gate/schema fails naming the entry and field `fixed`"
  },
  "requirements": [
    {
      "id": "GBC-007-R1",
      "source": "AC-1",
      "type": "behavioral",
      "statement": "A clean tree with tags v0.1.0/v0.2.0/v0.2.1 and matching entries builds green printing the one-to-one + reverse-chronological success line",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts"
    },
    {
      "id": "GBC-007-R2",
      "source": "AC-2",
      "type": "behavioral",
      "statement": "A tag without a matching entry fails the build naming the tag",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts"
    },
    {
      "id": "GBC-007-R3",
      "source": "AC-3",
      "type": "behavioral",
      "statement": "An entry without a matching tag fails the build naming the entry",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts"
    },
    {
      "id": "GBC-007-R4",
      "source": "AC-4",
      "type": "behavioral",
      "statement": "Out-of-order entries fail the build naming both entries",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts"
    },
    {
      "id": "GBC-007-R5",
      "source": "AC-5",
      "type": "behavioral",
      "statement": "An entry missing date/added/changed/fixed fails naming the entry and field",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts"
    },
    {
      "id": "GBC-007-R6",
      "source": "TC-1",
      "type": "boolean-check",
      "statement": "changelog collection registered in content.config.ts",
      "verify": "pnpm --filter @rnr-ai-elements/docs build"
    },
    {
      "id": "GBC-007-R7",
      "source": "TC-2",
      "type": "boolean-check",
      "statement": "changelog schema requires version/date/added/changed/fixed",
      "verify": "pnpm exec tsc --noEmit"
    },
    {
      "id": "GBC-007-R8",
      "source": "TC-3",
      "type": "boolean-check",
      "statement": "prebuild invokes the changelog gates before writing output",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts"
    },
    {
      "id": "GBC-007-R9",
      "source": "TC-4",
      "type": "boolean-check",
      "statement": "assertChangelogSync is pure and injectable",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/changelog-gates.test.ts"
    }
  ]
}
-->
