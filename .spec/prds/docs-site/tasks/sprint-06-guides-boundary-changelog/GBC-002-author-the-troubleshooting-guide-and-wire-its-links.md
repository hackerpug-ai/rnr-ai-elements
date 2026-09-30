================================================================================
TASK: GBC-002 - Author the troubleshooting guide and wire its links
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: a6b480efe9d8ce673cd61c9f405398eecf6f2f11
PRIORITY:   P1
POINTS:     5
AGENT:      planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

PROPOSED BY: techwriting-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- Author four distinct symptom-cause-fix entries: short-name collision (DOM imports after add), wrong-engine-tree symptoms (styles silently missing after installing the nativewind tree into a Tailwind v4/uniwind app), Expo Go crash on the 4 opt-in items (move to dev client), markdown streaming crash.
- Give one fix per symptom and link each entry to its canonical owning page.
- Wire inbound links: add a link to /guides/troubleshooting on Installation and on the DependencyPanel footer Callout.
- Set section: guides, order 5 so the five-guide set completes without exceeding the cap.
NEVER:
- Never invent a symptom, cause, or fix not grounded in AGENTS.md or the real registry/example source.
- Never state the markdown streaming cause as anything other than the renamed react-native-streamdown option (workletizableModules to importForwarding.moduleNames).
- Never author a sixth guide or remove the existing /registry link from the dependency panel Callout.
- Never hand-type a code snippet that is not source-backed.
STRICTLY:
- Strictly use the symptom-cause-fix structure (no prose-only troubleshooting).
- Strictly name the 4 dev-client-only opt-in items (enriched-markdown, streamdown, speech-recognition, extended-audio) accurately.
- Strictly keep the Installation link add scoped to a link line, never rewriting Installation content.
- UNIT_TEST_JUSTIFIED: AC-3, AC-4 and AC-5 are pure string and frontmatter scans over one local markdown file with zero I/O beyond reading it, so unit tests are justified.
- NEVER edit tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts: GBC-010 writes it, and AC-1 and AC-2 are proven when GBC-010 closes, not at this task's close.
- STRICTLY keep troubleshooting-content.test.ts read-only over the authored files (no build, no network, no browser).

## Specification
Objective: The fifth guide, /guides/troubleshooting, with four symptom-cause-fix entries and inbound links from Installation and the per-item dependency panel.
Success state: A visitor opens /guides/troubleshooting and reads four distinct symptom-cause-fix entries; a link to it appears on Installation and in a component dependency-panel footer.

## Acceptance Criteria
### AC-1: troubleshooting guide lists four symptom-cause-fix entries
  GIVEN: GIVEN GBC-010's guides-index spec has landed, and the authored troubleshooting guide is built into the real preview
  WHEN:  a visitor opens /guides/troubleshooting
  THEN:  the page renders four distinct symptom-cause-fix entries
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the guide is a stub with fewer than 4 entries', 'the guide omits the Symptom, Cause or Fix labels', 'the /guides index does not list /guides/troubleshooting']
        EVIDENCE: file_artifact
        - START_REF: authored_troubleshooting_candidate
          ACTION: ['goto /guides/troubleshooting and record the response status', 'count the level-2 entry headings and the Symptom, Cause and Fix labels', 'goto /guides and list the anchors inside [data-index-list]']
          MUST_OBSERVE: ['HTTP status 200 at /guides/troubleshooting', 'exactly 4 level-2 entry headings in the guide body', "exactly 4 'Symptom' labels, 4 'Cause' labels and 4 'Fix' labels", "exactly 1 anchor with href '/guides/troubleshooting' inside [data-index-list] on /guides"]
          MUST_NOT_OBSERVE: ['fewer than 4 entries (stub start state)', "an entry with 0 'Fix' labels", "any occurrence of 'coming soon' or 'TODO' in the guide body"]

### AC-2: troubleshooting linked from Installation and dependency panel
  GIVEN: GIVEN GBC-010's guides-index spec has landed, and the built preview carries the troubleshooting guide, the Installation link and the dependency panel link
  WHEN:  a visitor reads Installation and a component dependency panel
  THEN:  both surfaces link to /guides/troubleshooting
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the DependencyPanel footer Callout links only /registry', 'Installation lacks the /guides/troubleshooting link', 'the /registry link was removed from the footer Callout']
        EVIDENCE: file_artifact
        - START_REF: authored_troubleshooting_candidate
          ACTION: ['goto the message component page and collect anchors inside the dependency panel footer Callout', "goto /docs/installation and collect anchors whose href is '/guides/troubleshooting'", "request.get '/guides/troubleshooting' and record the status"]
          MUST_OBSERVE: ["exactly 1 anchor with href '/guides/troubleshooting' in the dependency panel footer Callout", "exactly 1 anchor with href '/registry' still present in that same Callout", "at least 1 anchor with href '/guides/troubleshooting' on /docs/installation", "HTTP status 200 for '/guides/troubleshooting'"]
          MUST_NOT_OBSERVE: ["a footer Callout with 0 '/guides/troubleshooting' anchors (start state)", "a footer Callout with 0 '/registry' anchors"]

### AC-3: short-name collision entry names the DOM-import cause
  GIVEN: GIVEN the authored troubleshooting.md source
  WHEN:  a vitest source scan reads the short-name collision entry
  THEN:  it names DOM imports as the symptom, the shadcn web registry resolution as the cause, and the absolute URL as the fix
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: The check is a string scan of one authored markdown entry (className, onClick, shadcn, https://) with no I/O beyond reading the file.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts
  TEST_FUNCTION: short-name collision entry names DOM symptom, shadcn cause, absolute URL fix
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts

### AC-4: markdown streaming crash entry names the renamed option
  GIVEN: GIVEN the authored troubleshooting.md source
  WHEN:  a vitest source scan reads the markdown streaming crash entry
  THEN:  it names the renamed react-native-streamdown option as the cause and importForwarding.moduleNames as the fix
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: The check is a string scan for two literal option names in the Cause and Fix parts of one entry, with no I/O beyond reading the file.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts
  TEST_FUNCTION: streaming crash entry names workletizableModules cause and importForwarding.moduleNames fix
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts

### AC-5: one fix per symptom
  GIVEN: GIVEN the authored troubleshooting.md source
  WHEN:  a vitest source scan counts entries, fixes and links
  THEN:  there are exactly 4 entries, each symptom has exactly one fix and links its canonical owning page, and the frontmatter is section: guides with order 5
  TEST_TIER: unit
  VERIFICATION_SERVICE: none (read-only file scan)
  UNIT_TEST_JUSTIFIED: Counting entries, Fix labels, internal links and two frontmatter values is a pure parse of one local markdown file with no I/O beyond reading it.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts
  TEST_FUNCTION: four entries, one fix each, owning-page link, guides order 5
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts

## Test Criteria
- TC-1: /guides/troubleshooting has exactly 4 entries with 4 Symptom, 4 Cause and 4 Fix labels and is listed once inside [data-index-list] on /guides.  (maps_to: AC-1)
- TC-2: The dependency panel footer holds exactly 1 '/guides/troubleshooting' anchor plus the '/registry' anchor, and /docs/installation holds at least 1 '/guides/troubleshooting' anchor.  (maps_to: AC-2)
- TC-3: The short-name collision entry contains className or onClick, 'shadcn' and an https:// URL.  (maps_to: AC-3)
- TC-4: The streaming entry names workletizableModules as the cause and importForwarding.moduleNames as the fix, and never offers workletizableModules as the fix.  (maps_to: AC-4)
- TC-5: troubleshooting.md has exactly 4 entries, exactly 1 Fix per entry, at least 1 internal link per entry, and frontmatter section: guides with order 5.  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md
- apps/docs/src/components/DependencyPanel.astro
- apps/docs/src/data/dev-client-matrix.json
- AGENTS.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/guides/troubleshooting.md (NEW)
- apps/docs/src/content/docs/installation.mdx (MODIFY)
- apps/docs/src/components/DependencyPanel.astro (MODIFY)
- tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/content.config.ts
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md']
Interaction notes: Astro routes section: guides at /guides/[slug]; the troubleshooting guide is the fifth entry. The DependencyPanel footer Callout edit is claimed here so frontend-designer does not re-add the link.
Pattern: troubleshooting entry: symptom → cause → fix, one fix per symptom, link to the canonical owning page (.spec/prds/docs-site/11-technical-requirements/12-content-standards.md)
Anti-pattern: prose-only troubleshooting; a symptom with zero or two fixes; blaming the markdown crash on anything but the renamed option

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts

## Dependencies
Depends on: ['GBC-001']
Blocks:     ['GBC-006', 'GBC-010', 'GBC-011']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-002",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "authored_troubleshooting_candidate": {
      "description": "The authored troubleshooting guide, the Installation link line and the DependencyPanel footer link enter the real docs build. The ordered docs build produces the dist that the Playwright-owned astro preview serves at http://localhost:4321. Each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/guides/troubleshooting.md is authored with section: guides, order 5 and four symptom-cause-fix entries.",
        "apps/docs/src/content/docs/installation.mdx gains one link line to /guides/troubleshooting.",
        "apps/docs/src/components/DependencyPanel.astro footer Callout links both /registry and /guides/troubleshooting.",
        "GBC-009's guides route and GBC-010's /guides index are built from the same candidate."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN GBC-010's guides-index spec has landed, and the authored troubleshooting guide is built into the real preview WHEN a visitor opens /guides/troubleshooting THEN the page renders four distinct symptom-cause-fix entries",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the guide is a stub with fewer than 4 entries",
            "the guide omits the Symptom, Cause or Fix labels",
            "the /guides index does not list /guides/troubleshooting"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_troubleshooting_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto /guides/troubleshooting and record the response status",
                "count the level-2 entry headings and the Symptom, Cause and Fix labels",
                "goto /guides and list the anchors inside [data-index-list]"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP status 200 at /guides/troubleshooting",
                "exactly 4 level-2 entry headings in the guide body",
                "exactly 4 'Symptom' labels, 4 'Cause' labels and 4 'Fix' labels",
                "exactly 1 anchor with href '/guides/troubleshooting' inside [data-index-list] on /guides"
              ],
              "must_not_observe": [
                "fewer than 4 entries (stub start state)",
                "an entry with 0 'Fix' labels",
                "any occurrence of 'coming soon' or 'TODO' in the guide body"
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
      "description": "GIVEN GIVEN GBC-010's guides-index spec has landed, and the built preview carries the troubleshooting guide, the Installation link and the dependency panel link WHEN a visitor reads Installation and a component dependency panel THEN both surfaces link to /guides/troubleshooting",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build served by astro preview at http://localhost:4321, Playwright Chromium",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the DependencyPanel footer Callout links only /registry",
            "Installation lacks the /guides/troubleshooting link",
            "the /registry link was removed from the footer Callout"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_troubleshooting_candidate",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "goto the message component page and collect anchors inside the dependency panel footer Callout",
                "goto /docs/installation and collect anchors whose href is '/guides/troubleshooting'",
                "request.get '/guides/troubleshooting' and record the status"
              ]
            },
            "end_state": {
              "must_observe": [
                "exactly 1 anchor with href '/guides/troubleshooting' in the dependency panel footer Callout",
                "exactly 1 anchor with href '/registry' still present in that same Callout",
                "at least 1 anchor with href '/guides/troubleshooting' on /docs/installation",
                "HTTP status 200 for '/guides/troubleshooting'"
              ],
              "must_not_observe": [
                "a footer Callout with 0 '/guides/troubleshooting' anchors (start state)",
                "a footer Callout with 0 '/registry' anchors"
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
      "description": "GIVEN GIVEN the authored troubleshooting.md source WHEN a vitest source scan reads the short-name collision entry THEN it names DOM imports as the symptom, the shadcn web registry resolution as the cause, and the absolute URL as the fix",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_function": "short-name collision entry names DOM symptom, shadcn cause, absolute URL fix",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "The check is a string scan of one authored markdown entry (className, onClick, shadcn, https://) with no I/O beyond reading the file.",
      "maps_to_ac": null
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the authored troubleshooting.md source WHEN a vitest source scan reads the markdown streaming crash entry THEN it names the renamed react-native-streamdown option as the cause and importForwarding.moduleNames as the fix",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_function": "streaming crash entry names workletizableModules cause and importForwarding.moduleNames fix",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "The check is a string scan for two literal option names in the Cause and Fix parts of one entry, with no I/O beyond reading the file.",
      "maps_to_ac": null
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GIVEN the authored troubleshooting.md source WHEN a vitest source scan counts entries, fixes and links THEN there are exactly 4 entries, each symptom has exactly one fix and links its canonical owning page, and the frontmatter is section: guides with order 5",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_function": "four entries, one fix each, owning-page link, guides order 5",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "unit_test_justified": "Counting entries, Fix labels, internal links and two frontmatter values is a pure parse of one local markdown file with no I/O beyond reading it.",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "/guides/troubleshooting has exactly 4 entries with 4 Symptom, 4 Cause and 4 Fix labels and is listed once inside [data-index-list] on /guides.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "The dependency panel footer holds exactly 1 '/guides/troubleshooting' anchor plus the '/registry' anchor, and /docs/installation holds at least 1 '/guides/troubleshooting' anchor.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (desktop, Pixel 5 and no-JS projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "The short-name collision entry contains className or onClick, 'shadcn' and an https:// URL.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_function": "short-name collision entry names DOM symptom, shadcn cause, absolute URL fix",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "The streaming entry names workletizableModules as the cause and importForwarding.moduleNames as the fix, and never offers workletizableModules as the fix.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_function": "streaming crash entry names workletizableModules cause and importForwarding.moduleNames fix",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "troubleshooting.md has exactly 4 entries, exactly 1 Fix per entry, at least 1 internal link per entry, and frontmatter section: guides with order 5.",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_function": "four entries, one fix each, owning-page link, guides order 5",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts",
      "test_tier": "unit",
      "verification_service": "none (read-only file scan)",
      "surface_policy": null,
      "maps_to_ac": "AC-5"
    }
  ]
}
-->

## Handoff

```json
{
  "task": "GBC-002",
  "commit_sha": "a6b480efe9d8ce673cd61c9f405398eecf6f2f11",
  "done": "Landed the fifth guides entry at apps/docs/src/content/docs/guides/troubleshooting.md (section: guides, order 5) with exactly four symptom-cause-fix entries at lines 10, 24, 38 and 52, each with one Symptom/Cause/Fix label set, exactly one Fix, and a canonical owning-page link (/docs/cli, /docs/installation + /guides/update-installed-items, /guides/preview-on-device, /components/streamdown); wired the two inbound links as one Next-steps line at apps/docs/src/content/docs/installation.mdx:66 and a second Callout anchor at apps/docs/src/components/DependencyPanel.astro:83 beside the kept /registry link; and added the read-only AC-3/4/5 source scan tests/sprint-06-guides-boundary-changelog/troubleshooting-content.test.ts (10/10 green, Astro frontmatter parser, no build/network/browser), with gates green (tsc clean, biome exit 0, docs build link-check 0 errors, sprint-06 suite 52/52) and built-dist verification in .tmp/GBC-002/cycle-1/green/.",
  "deviations": [],
  "concerns": [
    "Guide pages render three sidebar navigation h2s ('Getting started', 'Guides', 'Porting') alongside the entry headings \u2014 a page-wide h2 count on /guides/troubleshooting observes 7 elements (5 grep lines), not 4, so GBC-010's AC-1 'exactly 4 level-2 entry headings' must scope to the entry/prose area rather than all h2 elements.",
    "The Expo Go entry names the four opt-in items in their documented prose forms ('enriched markdown, streamdown, speech recognition, or extended audio' at apps/docs/src/content/docs/guides/troubleshooting.md:42, packages at :46), so the hyphenated matrix id 'extended-audio' and the string 'expo-audio' never appear verbatim \u2014 a GBC-010 grep for matrix ids would miss item 4 unless it matches label or package forms.",
    "The built /docs/installation page carries two anchors with href '/guides/troubleshooting' (the Next steps link at installation.mdx:66 plus the sidebar nav entry), which satisfies AC-2's 'at least 1' but would break any exact-1 page-wide assertion.",
    "During the pre-existing proof, a failed scoped 'git stash push' followed by 'git stash pop' popped the repo's shared sprint-05 stash (ORI-RN-005 rn005-cycle2-wip) into the worktree; all 12 conflicted out-of-scope files were restored to HEAD, my four files re-verified byte-exact, and the stash entry kept (never dropped), but the shared-stash hazard itself remains for every worktree session (refs/stash is common across worktrees)."
  ],
  "findings": [
    "The three docs-collection failures (ORI-AST-001-collection-schema, ORI-AST-001-publication-contract, ORI-AST-001-mdx-code-copy) are proven pre-existing at HEAD 99bbde8e by a clean-baseline rerun with my files fully removed \u2014 identical 3 failures \u2014 evidence at .tmp/GBC-002/cycle-1/green/pre-existing-proof.txt, so no downstream task needs to re-litigate them.",
    "The troubleshooting manuscript is deliberately fence-free, so scripts/docs-data/authored-snippets.ts gained no COMMITTED_BINDINGS entries; any future fence added to this guide must budget a binding the GBC-001 way (packages/docs-snippets/commands/update.sh pattern).",
    "The guide carries exactly one 'This guide shows you how to' sentence in the body and none in the frontmatter description, so a GBC-010 generalization of GBC-001's goal-sentence scan to all five guides passes as authored.",
    "The docs build link-check emits 13 fail-soft warnings, all external edit URLs 404ing against the stale GitHub main (documented as stale since 09-08) \u2014 0 errors, and the count includes one per page including the new guide, so it is not a regression signal.",
    "The built /components/message dependency panel footer Callout holds exactly 1 '/registry' and exactly 1 '/guides/troubleshooting' anchor (verified in dist), matching AC-2's must-observe exactly."
  ],
  "scope_impact": [
    {
      "target": "GBC-010",
      "found": "AC-1's 'exactly 4 level-2 entry headings' and the four-item naming are ambiguous against the real DOM: sidebar h2s inflate page-wide counts, and the fourth opt-in item appears only as 'extended audio' (label) / capture-surface prose, never as the id 'extended-audio' or package 'expo-audio'.",
      "change": "Scope the entry-heading count to the guide's prose/entry area (or exclude sidebar nav headings) and match the four items by their rendered label or package forms rather than dev-client-matrix.json ids."
    },
    {
      "target": "GBC-011",
      "found": "troubleshooting.md intentionally has exactly four h2s (the entries) and no Prerequisites/Next steps headings, unlike the four TR-12 job guides.",
      "change": "If GBC-011 writes a template-conformance gate over guides-section pages (prerequisites/next-steps headings, goal-sentence placement), exempt the troubleshooting page or assert its symptom-cause-fix shape instead of the job-guide shape."
    }
  ],
  "feedback": [
    "Worktree implementers should avoid 'git stash' entirely for baseline proofs \u2014 refs/stash is shared across worktrees, so a pop can pull a foreign sprint's WIP into the tree; the mv-aside plus 'git checkout HEAD -- <paths>' baseline used after the incident achieved the same proof with zero blast radius.",
    "The contract's seeded-evidence requirement worked well paired with committed .tmp/GBC-002 evidence; future tasks hitting 'pre-existing' failures should be required to attach exactly this clean-baseline proof rather than asserting staleness."
  ]
}
```
