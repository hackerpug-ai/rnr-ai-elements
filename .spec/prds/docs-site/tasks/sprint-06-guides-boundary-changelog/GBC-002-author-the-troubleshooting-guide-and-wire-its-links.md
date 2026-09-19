================================================================================
TASK: GBC-002 - Author the troubleshooting guide and wire its links
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     5
AGENT:      planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

PROPOSED BY: techwriting-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- Author four distinct symptom-cause-fix entries: short-name collision (DOM imports after add), wrong-engine-tree symptoms, Expo Go crash on the 4 opt-in items (move to dev client), markdown streaming crash.
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

## Specification
Objective: The fifth guide, /guides/troubleshooting, with four symptom-cause-fix entries and inbound links from Installation and the per-item dependency panel.
Success state: A visitor opens /guides/troubleshooting and reads four distinct symptom-cause-fix entries; a link to it appears on Installation and in a component dependency-panel footer.

## Acceptance Criteria
### AC-1: troubleshooting guide lists four symptom-cause-fix entries
  GIVEN: the authored troubleshooting guide
  WHEN:  a visitor opens /guides/troubleshooting
  THEN:  the page renders four distinct symptom-cause-fix entries
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the guide is a stub, has fewer than four entries, or omits symptom/cause/fix headings']
        EVIDENCE: file_artifact
        - ACTION: ['Open /guides/troubleshooting', 'Read the four entries']
          MUST_OBSERVE: ['4 distinct symptom-cause-fix entries', 'each entry has a cause and a fix']
          MUST_NOT_OBSERVE: ['a symptom with zero fixes', 'a stub or placeholder body']

### AC-2: troubleshooting linked from Installation and dependency panel
  GIVEN: the built preview with the troubleshooting guide and the dependency panel
  WHEN:  a visitor reads Installation and a component dependency panel
  THEN:  both surfaces link to /guides/troubleshooting
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the DependencyPanel footer Callout links only /registry, or Installation lacks the link']
        EVIDENCE: file_artifact
        - ACTION: ['Open a component page and read its dependency panel footer', 'Open Installation and find the troubleshooting link']
          MUST_OBSERVE: ['a /guides/troubleshooting link in the dependency-panel footer', 'a /guides/troubleshooting link on Installation (once Sprint 05 has landed it)']
          MUST_NOT_OBSERVE: ['the dependency panel footer linking only /registry with no troubleshooting link']

### AC-3: short-name collision entry names the DOM-import cause
  GIVEN: the troubleshooting guide
  WHEN:  a visitor reads the short-name collision entry
  THEN:  it names DOM imports as the symptom, the shadcn web registry resolution as the cause, and the absolute URL as the fix
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the entry omits the DOM-import symptom, the shadcn registry cause, or the absolute-URL fix']
        EVIDENCE: file_artifact
        - ACTION: ['Read the short-name collision entry in /guides/troubleshooting']
          MUST_OBSERVE: ['DOM import symptom wording (className/onClick)', 'shadcn web registry resolution named as the cause', 'absolute https URL named as the fix']
          MUST_NOT_OBSERVE: ['the cause misattributed to an engine or a registry bug']

### AC-4: markdown streaming crash entry names the renamed option
  GIVEN: the troubleshooting guide
  WHEN:  a visitor reads the markdown streaming crash entry
  THEN:  it names the renamed react-native-streamdown option as the cause and importForwarding.moduleNames as the fix
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the entry blames a different cause or omits the renamed option name']
        EVIDENCE: file_artifact
        - ACTION: ['Read the markdown streaming crash entry']
          MUST_OBSERVE: ["'importForwarding.moduleNames' named as the fix", 'the renamed workletizableModules option named as the cause']
          MUST_NOT_OBSERVE: ['a cause other than the option rename', 'the stale workletizableModules presented as the fix']

### AC-5: one fix per symptom
  GIVEN: the troubleshooting guide
  WHEN:  a reviewer scans every entry
  THEN:  each symptom has exactly one fix and links its canonical owning page
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a symptom carries zero or two contradictory fixes']
        EVIDENCE: file_artifact
        - ACTION: ['Scan all four entries for fix counts and owning-page links']
          MUST_OBSERVE: ['exactly one fix per symptom across all four entries', 'each entry links its canonical owning page']
          MUST_NOT_OBSERVE: ['a symptom with zero fixes', 'two contradictory fixes for one symptom']

## Test Criteria
- TC-1: The troubleshooting guide renders four distinct symptom-cause-fix entries.  (maps_to: AC-1)
- TC-2: Installation and the dependency-panel footer link to /guides/troubleshooting.  (maps_to: AC-2)
- TC-3: The short-name collision entry names DOM imports, the shadcn registry cause, and the absolute-URL fix.  (maps_to: AC-3)
- TC-4: The markdown streaming crash entry names the renamed option as cause and importForwarding.moduleNames as the fix.  (maps_to: AC-4)
- TC-5: Every symptom has exactly one fix and links its canonical owning page.  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md
- apps/docs/src/components/DependencyPanel.astro
- apps/docs/src/data/dev-client-matrix.json
- AGENTS.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/guides/troubleshooting.md (NEW)
- apps/docs/src/content/docs/installation.md (add a troubleshooting link; Sprint 05 owned — coordinate)
- apps/docs/src/components/DependencyPanel.astro (footer Callout: add a /guides/troubleshooting link alongside /registry)
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
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index

## Dependencies
Depends on: ['GBC-001']
Blocks:     none

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
  "fixtures": {},
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored troubleshooting guide WHEN a visitor opens /guides/troubleshooting THEN the page renders four distinct symptom-cause-fix entries",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the built preview with the troubleshooting guide and the dependency panel WHEN a visitor reads Installation and a component dependency panel THEN both surfaces link to /guides/troubleshooting",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the troubleshooting guide WHEN a visitor reads the short-name collision entry THEN it names DOM imports as the symptom, the shadcn web registry resolution as the cause, and the absolute URL as the fix",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the troubleshooting guide WHEN a visitor reads the markdown streaming crash entry THEN it names the renamed react-native-streamdown option as the cause and importForwarding.moduleNames as the fix",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the troubleshooting guide WHEN a reviewer scans every entry THEN each symptom has exactly one fix and links its canonical owning page",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "The troubleshooting guide renders four distinct symptom-cause-fix entries.",
      "maps_to_ac": "AC-1",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "Installation and the dependency-panel footer link to /guides/troubleshooting.",
      "maps_to_ac": "AC-2",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "The short-name collision entry names DOM imports, the shadcn registry cause, and the absolute-URL fix.",
      "maps_to_ac": "AC-3",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "The markdown streaming crash entry names the renamed option as cause and importForwarding.moduleNames as the fix.",
      "maps_to_ac": "AC-4",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "Every symptom has exactly one fix and links its canonical owning page.",
      "maps_to_ac": "AC-5",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index"
    }
  ]
}
-->
