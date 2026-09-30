================================================================================
TASK: GBC-011 - Five-guides cap gate (T-DOCS-014 mirror)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: b01913647623f36214e6aec84725896f9cdd9f10
PRIORITY:   P1
POINTS:     3
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- fail the build when the non-reserved guides-section entry count differs from 5 in either direction (a sixth guide or a 4-guide tree), naming the file (e.g. guides/migrating-from-v0.md) and the five-page launch cap; the reserved `theming` slug (re-sectioned to getting-started by GBC-001) never counts toward the cap
- pass with exactly 5 non-reserved guides-section entries and print `[docs-data] guides: 5 guides — cap satisfied` (the success line asserts count === 5 exactly — the floor is enforced, not just the ceiling)
- wire the assertion into the /guides/[slug] route getStaticPaths so every static build enforces it
- write a RED-first vitest drill that builds the real site, writes a sixth guide, asserts failure, restores, asserts green
NEVER:
- warn-only on a sixth guide
- count non-guides-section entries toward the cap
- derive the cap count from the dataset (5 is pinned)
STRICTLY:
- cap = 5 (pinned constant, never self-derived)
- the offending file is named in the failure
- UNIT_TEST_JUSTIFIED: tier label for proof binding only, not a claim of zero I/O. guides-cap.test.ts spawns the real `pnpm --filter @rnr-ai-elements/docs build` over the real content tree with no mocks. FLOW-DOCS-03's rendered proof and its one primary belong to GBC-010's guides-index.spec.ts, which runs in the same wave C with no dependency edge to this task.
- The drill's writes under apps/docs/src/content/docs/guides/ are transient fixtures: the sixth guide is deleted and the moved guide restored in finally blocks, and each case asserts `git status --porcelain apps/docs/src/content/docs/guides` prints nothing. The commit never touches that tree.
- Never assert on /guides itself (apps/docs/src/pages/guides/index.astro or dist/guides/index.html): GBC-010 builds it in the same wave, and GBC-010/AC-1 owns the index count.

## Specification
Objective: Enforce the five-page guides cap as a build-time gate so a sixth guide can never ship.
Success state: A sixth guides/migrating-from-v0.md fixture (and separately a 4-guide tree) fails the build naming the file and the cap; the five-guide set builds green with /guides listing exactly 5.

## Acceptance Criteria
### AC-1: A sixth guide is rejected at the five-page cap
  GIVEN: the five-guide tree plus a drill-written guides/migrating-from-v0.md (section: guides, order 6)
  WHEN:  the drill runs the real `pnpm --filter @rnr-ai-elements/docs build`
  THEN:  the build exits non-zero and its output names `guides/migrating-from-v0.md` and the five-page launch cap
  TEST_TIER: unit
  VERIFICATION_SERVICE: Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks
  UNIT_TEST_JUSTIFIED: Build-gate drill: vitest spawns the real docs build over the real content tree with drill-written files and no mocks; it is tier-labelled unit only because FLOW-DOCS-03's rendered proof and its one primary belong to GBC-010, which runs in the same wave with no dependency edge to this task.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts
  TEST_FUNCTION: GBC-011-sixth-guide-rejected
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the cap check is warn-only, so the build still exits 0 with 6 guides', 'the cap is derived from the dataset instead of the pinned constant 5, so a sixth guide raises the cap', 'assertGuidesCap is removed from the /guides/[slug] getStaticPaths (disconnected)']
        EVIDENCE: stdout
        - START_REF: sixth_guide_tree
          ACTION: ['Write apps/docs/src/content/docs/guides/migrating-from-v0.md with `section: guides` and `order: 6`.', 'Spawn `pnpm --filter @rnr-ai-elements/docs build`; capture exit code, stdout and stderr.', 'Delete the file in finally and assert `git status --porcelain apps/docs/src/content/docs/guides` prints nothing.']
          MUST_OBSERVE: ['build exit code != 0', 'combined output contains `guides/migrating-from-v0.md`', 'combined output contains `five-page launch cap`']
          MUST_NOT_OBSERVE: ['exit code 0', 'any `cap satisfied` line', 'an error message with no file named (empty offender)']
        - START_REF: four_guide_tree
          ACTION: ['Move guides/preview-on-device.md(x) to a $TMPDIR holding path.', 'Spawn the same build; capture exit code and output.', 'Move the file back in finally and assert the guides dir git status prints nothing.']
          MUST_OBSERVE: ['build exit code != 0', 'combined output contains the count `4` and `five-page launch cap`']
          MUST_NOT_OBSERVE: ['exit code 0 with 4 guides', 'an error message with no count (empty message)']

### AC-2: The five-guide set passes with the cap-satisfied line
  GIVEN: the real five-guide tree and no sixth guide
  WHEN:  the drill runs the real `pnpm --filter @rnr-ai-elements/docs build`
  THEN:  the build exits 0, stdout carries `[docs-data] guides: 5 guides — cap satisfied`, and exactly 5 guide pages are emitted under apps/docs/dist/guides/ (the /guides index count is GBC-010/AC-1's proof)
  TEST_TIER: unit
  VERIFICATION_SERVICE: Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks
  UNIT_TEST_JUSTIFIED: Build-gate drill: vitest spawns the real docs build over the real content tree with drill-written files and no mocks; it is tier-labelled unit only because FLOW-DOCS-03's rendered proof and its one primary belong to GBC-010, which runs in the same wave with no dependency edge to this task.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts
  TEST_FUNCTION: GBC-011-five-guides-cap-satisfied
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the success line is static text printed without counting, or counts non-guides-section entries, so the floor goes unenforced', 'the reserved `theming` slug is counted, making the real set 6 and failing a healthy build']
        EVIDENCE: stdout
        - START_REF: five_guide_tree
          ACTION: ['Assert the guides dir holds exactly the five launch guides and its git status prints nothing.', 'Spawn `pnpm --filter @rnr-ai-elements/docs build`; capture exit code and stdout.', 'List the subdirectories of apps/docs/dist/guides/ that contain index.html.']
          MUST_OBSERVE: ['build exit code == 0', 'stdout contains the exact line `[docs-data] guides: 5 guides — cap satisfied`', 'exactly 5 subdirectories of apps/docs/dist/guides/ contain index.html: `re-theme`, `update-installed-items`, `preview-on-device`, `customize-rendering`, `troubleshooting`']
          MUST_NOT_OBSERVE: ['a cap violation message', 'the guides line with a count other than `5`', 'an empty apps/docs/dist/guides/ (0 guide pages)']

## Test Criteria
- TC-1: a sixth guide `guides/migrating-from-v0.md` makes the build exit non-zero with output naming that file and `five-page launch cap`  (maps_to: AC-1)
- TC-2: the real five-guide tree builds with exit 0, prints `[docs-data] guides: 5 guides — cap satisfied`, and emits exactly 5 guide pages  (maps_to: AC-2)
- TC-3: after a full build has generated the prebuild data, `pnpm --filter @rnr-ai-elements/docs exec astro build` alone over the sixth-guide tree also exits non-zero naming `guides/migrating-from-v0.md`, so the check lives in the /guides/[slug] getStaticPaths  (maps_to: AC-1)
- TC-4: a four-guide tree makes the build exit non-zero naming the count 4 and `five-page launch cap`  (maps_to: AC-1)

## Reading List
- apps/docs/src/lib/docs-navigation.ts
- apps/docs/src/pages/guides/[slug].astro
- scripts/docs-data/gates.ts
- tests/sprint-05-orient-search/dist-link-gate.test.ts

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/lib/docs-navigation.ts (MODIFY)
- apps/docs/src/pages/guides/[slug].astro (MODIFY)
- tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts (NEW)
WRITE-PROHIBITED:
- apps/docs/src/content/docs/guides/** (techwriting authors the five guides)
- apps/docs/src/components/** (design lens owns primitives)

## Design
References: ['scripts/docs-data/gates.ts (pinned-constant gate)', 'tests/sprint-05-orient-search/dist-link-gate.test.ts (real-build fixture drill)']
Interaction notes: The five guides themselves are authored by the techwriting-planner; this gate only counts and rejects overflow. The cap count (5) and the naming of the offending file must match the techwriting content exactly.
Pattern: Pinned-constant build gate over collection entries + real-build fixture drill (scripts/docs-data/gates.ts)
Anti-pattern: Deriving the cap count from the dataset under test

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts

## Dependencies
Depends on: ['GBC-009', 'GBC-001', 'GBC-002']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-011",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "five_guide_tree": {
      "description": "The real content tree at GBC-011's close: exactly 5 non-reserved guides-section entries (GBC-001's four at order 1..4, GBC-002's troubleshooting at order 5) under apps/docs/src/content/docs/guides/, theming.mdx in getting-started, and GBC-009's /guides/[slug] route, built by vitest spawning the real `pnpm --filter @rnr-ai-elements/docs build`.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/guides/ holds exactly re-theme, update-installed-items, preview-on-device, customize-rendering and troubleshooting.",
        "`git status --porcelain apps/docs/src/content/docs/guides` prints nothing before the drill starts."
      ]
    },
    "sixth_guide_tree": {
      "description": "five_guide_tree plus a drill-written apps/docs/src/content/docs/guides/migrating-from-v0.md (frontmatter `section: guides`, `order: 6`, a title and one paragraph), deleted in a finally block.",
      "seed_method": "cli",
      "records": [
        "guides/migrating-from-v0.md with `section: guides` and `order: 6`",
        "the five real guides unchanged"
      ]
    },
    "four_guide_tree": {
      "description": "five_guide_tree with guides/preview-on-device.md(x) moved to a $TMPDIR holding path for the drill and moved back in a finally block.",
      "seed_method": "cli",
      "records": [
        "4 guides-section entries remain: re-theme, update-installed-items, customize-rendering, troubleshooting"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the five-guide tree plus a drill-written guides/migrating-from-v0.md (section: guides, order 6) WHEN the drill runs the real `pnpm --filter @rnr-ai-elements/docs build` THEN the build exits non-zero and its output names `guides/migrating-from-v0.md` and the five-page launch cap",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_function": "GBC-011-sixth-guide-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_tier": "unit",
      "verification_service": "Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks",
      "surface_policy": null,
      "unit_test_justified": "Build-gate drill: vitest spawns the real docs build over the real content tree with drill-written files and no mocks; it is tier-labelled unit only because FLOW-DOCS-03's rendered proof and its one primary belong to GBC-010, which runs in the same wave with no dependency edge to this task.",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-011-1",
        "use_case_ref": "UC-DOCS-03",
        "ac_ref": "AC-1",
        "tier": "visible",
        "test_tier": "unit",
        "unit_test_justified": "Build-gate drill: vitest spawns the real docs build over the real content tree with drill-written files and no mocks; it is tier-labelled unit only because FLOW-DOCS-03's rendered proof and its one primary belong to GBC-010, which runs in the same wave with no dependency edge to this task.",
        "verification_service": "Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the cap check is warn-only, so the build still exits 0 with 6 guides",
            "the cap is derived from the dataset instead of the pinned constant 5, so a sixth guide raises the cap",
            "assertGuidesCap is removed from the /guides/[slug] getStaticPaths (disconnected)"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "sixth_guide_tree",
            "action": {
              "actor": "system",
              "steps": [
                "Write apps/docs/src/content/docs/guides/migrating-from-v0.md with `section: guides` and `order: 6`.",
                "Spawn `pnpm --filter @rnr-ai-elements/docs build`; capture exit code, stdout and stderr.",
                "Delete the file in finally and assert `git status --porcelain apps/docs/src/content/docs/guides` prints nothing."
              ]
            },
            "end_state": {
              "must_observe": [
                "build exit code != 0",
                "combined output contains `guides/migrating-from-v0.md`",
                "combined output contains `five-page launch cap`"
              ],
              "must_not_observe": [
                "exit code 0",
                "any `cap satisfied` line",
                "an error message with no file named (empty offender)"
              ]
            }
          },
          {
            "start_ref": "four_guide_tree",
            "action": {
              "actor": "system",
              "steps": [
                "Move guides/preview-on-device.md(x) to a $TMPDIR holding path.",
                "Spawn the same build; capture exit code and output.",
                "Move the file back in finally and assert the guides dir git status prints nothing."
              ]
            },
            "end_state": {
              "must_observe": [
                "build exit code != 0",
                "combined output contains the count `4` and `five-page launch cap`"
              ],
              "must_not_observe": [
                "exit code 0 with 4 guides",
                "an error message with no count (empty message)"
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
      "description": "GIVEN the real five-guide tree and no sixth guide WHEN the drill runs the real `pnpm --filter @rnr-ai-elements/docs build` THEN the build exits 0, stdout carries `[docs-data] guides: 5 guides — cap satisfied`, and exactly 5 guide pages are emitted under apps/docs/dist/guides/ (the /guides index count is GBC-010/AC-1's proof)",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_function": "GBC-011-five-guides-cap-satisfied",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_tier": "unit",
      "verification_service": "Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks",
      "surface_policy": null,
      "unit_test_justified": "Build-gate drill: vitest spawns the real docs build over the real content tree with drill-written files and no mocks; it is tier-labelled unit only because FLOW-DOCS-03's rendered proof and its one primary belong to GBC-010, which runs in the same wave with no dependency edge to this task.",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-GBC-011-2",
        "use_case_ref": "UC-DOCS-03",
        "ac_ref": "AC-2",
        "tier": "visible",
        "test_tier": "unit",
        "unit_test_justified": "Build-gate drill: vitest spawns the real docs build over the real content tree with drill-written files and no mocks; it is tier-labelled unit only because FLOW-DOCS-03's rendered proof and its one primary belong to GBC-010, which runs in the same wave with no dependency edge to this task.",
        "verification_service": "Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the success line is static text printed without counting, or counts non-guides-section entries, so the floor goes unenforced",
            "the reserved `theming` slug is counted, making the real set 6 and failing a healthy build"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "five_guide_tree",
            "action": {
              "actor": "system",
              "steps": [
                "Assert the guides dir holds exactly the five launch guides and its git status prints nothing.",
                "Spawn `pnpm --filter @rnr-ai-elements/docs build`; capture exit code and stdout.",
                "List the subdirectories of apps/docs/dist/guides/ that contain index.html."
              ]
            },
            "end_state": {
              "must_observe": [
                "build exit code == 0",
                "stdout contains the exact line `[docs-data] guides: 5 guides — cap satisfied`",
                "exactly 5 subdirectories of apps/docs/dist/guides/ contain index.html: `re-theme`, `update-installed-items`, `preview-on-device`, `customize-rendering`, `troubleshooting`"
              ],
              "must_not_observe": [
                "a cap violation message",
                "the guides line with a count other than `5`",
                "an empty apps/docs/dist/guides/ (0 guide pages)"
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
      "description": "a sixth guide `guides/migrating-from-v0.md` makes the build exit non-zero with output naming that file and `five-page launch cap`",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_function": "GBC-011-sixth-guide-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_tier": "unit",
      "verification_service": "Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks",
      "surface_policy": null,
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "the real five-guide tree builds with exit 0, prints `[docs-data] guides: 5 guides — cap satisfied`, and emits exactly 5 guide pages",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_function": "GBC-011-five-guides-cap-satisfied",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_tier": "unit",
      "verification_service": "Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks",
      "surface_policy": null,
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "after a full build has generated the prebuild data, `pnpm --filter @rnr-ai-elements/docs exec astro build` alone over the sixth-guide tree also exits non-zero naming `guides/migrating-from-v0.md`, so the check lives in the /guides/[slug] getStaticPaths",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_function": "GBC-011-sixth-guide-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_tier": "unit",
      "verification_service": "Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks",
      "surface_policy": null,
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "a four-guide tree makes the build exit non-zero naming the count 4 and `five-page launch cap`",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_function": "GBC-011-sixth-guide-rejected",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts",
      "test_tier": "unit",
      "verification_service": "Real `pnpm --filter @rnr-ai-elements/docs build` spawned by vitest over the real apps/docs content tree with drill-written guide files, no mocks",
      "surface_policy": null,
      "maps_to_ac": "AC-1"
    }
  ]
}
-->

## Handoff

```json
{
  "task": "GBC-011",
  "commit_sha": "b01913647623f36214e6aec84725896f9cdd9f10",
  "done": "Landed on the task branch and merged to main as 15fc3e10: assertGuidesCap with the module-pinned GUIDES_CAP = 5 in apps/docs/src/lib/docs-navigation.ts:182-206, wired into the /guides/[slug] getStaticPaths at apps/docs/src/pages/guides/[slug].astro:39 over the exact publishedDocs list the route maps, failing the build on any published guides-section count but 5 (observed count, the phrase 'five-page launch cap', and every guides-section source path named; theming and drafts structurally excluded by the section key) and printing the computed '[docs-data] guides: 5 guides \u2014 cap satisfied' line at exactly 5; tests/sprint-06-guides-boundary-changelog/guides-cap.test.ts drills the real production chain with transient sixth-guide and four-guide fixtures (RED evidence at .tmp/GBC-011/cycle-1/red/, GREEN at .tmp/GBC-011/cycle-1/green/), all verification gates green, content tree restored to exactly the five launch guides.",
  "deviations": [
    "GUIDES_CAP is a module-local const rather than the exported pin the design reference (scripts/docs-data/gates.ts EXPECTED_ITEM_COUNT) models, because the repo's fallow pre-commit gate fails on unused exports and no consumer existed; the pin still lives in the one module that asserts it.",
    "The rejection message names every guides-section source path instead of a single inferred offender file, because a sixth guide carrying an out-of-order value (e.g. order 3) is indistinguishable from the set by data; the AC's required substring 'guides/migrating-from-v0.md' is always contained in the full membership list.",
    "Durable build-stdout evidence was captured by a scripted fourth pass outside vitest (.tmp/GBC-011/cycle-1/green/capture-evidence.sh), because vitest does not echo a spawned build's captured stdout when assertions pass, so a green run alone leaves no stdout artifact."
  ],
  "concerns": [
    "The cmux-injected NODE_OPTIONS (--require shim plus --max-old-space-size=4096) makes biome die with 'linter process terminated abnormally' (exit 254) whenever it launches through pnpm's script shim, which is exactly how the righthook pre-commit job invokes it; commits from cmux sessions need `env -u NODE_OPTIONS git commit` until that shim interaction is fixed.",
    "guides-cap.test.ts intentionally leaves apps/docs/dist in a partial failed-build state (its last drill is the rejected four-guide build), so anything reading apps/docs/dist after this file must run a fresh docs build first.",
    "Four fallow clone groups span docs/[...id].astro, guides/[slug].astro, porting.astro and docs-navigation.ts; they pass only as 'inherited findings' exclusions, so future edits to those four files can trip the fallow gate on duplication that predates this task."
  ],
  "findings": [
    "The exact failure shape for output-greps is '[docs-data] guides: found <n> published guides-section entries; the five-page launch cap pins exactly 5 \u2014 guides-section sources: <repo-relative paths>' (apps/docs/src/lib/docs-navigation.ts:195), so matchers should grep the count via 'found <n> published guides-section entries' rather than a bare digit.",
    "The cap-satisfied line prints once per build from getStaticPaths during astro build, so it appears both in the full `pnpm --filter @rnr-ai-elements/docs build` stdout and in a bare `astro build` (TC-3's path) \u2014 a grepper need not run the full chain to observe it.",
    "The gate counts the same publishedDocs list the route maps (apps/docs/src/pages/guides/[slug].astro:38-41), so any future consumer needing the guides count (for example a guides index gate) should reuse assertGuidesCap or publishedDocs rather than re-deriving from the filesystem."
  ],
  "scope_impact": [
    {
      "target": "GBC-010",
      "found": "Within tests/sprint-06-guides-boundary-changelog/, vitest's alphabetical file order runs guides-cap.test.ts before guides-index.spec.ts, and guides-cap's last drill leaves apps/docs/dist holding a rejected four-guide build while the content tree is restored to five.",
      "change": "GBC-010's guides-index.spec.ts should build its own dist (or assert only after a fresh `pnpm --filter @rnr-ai-elements/docs build`) rather than reading a dist assumed green from a prior task's run."
    }
  ],
  "feedback": [
    "righthook's fallow job re-flags long-accepted duplication the moment any of the four clone-bearing files is touched, which cost this task a remediation cycle on inherited code; consider fallow-ignore markers on the accepted clone blocks (the house pattern already used for complexity) or a wider inherited-exclusion window in .fallowrc.json."
  ]
}
```
