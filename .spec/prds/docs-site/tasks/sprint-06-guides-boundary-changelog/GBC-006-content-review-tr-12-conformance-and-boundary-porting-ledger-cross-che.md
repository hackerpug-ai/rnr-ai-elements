================================================================================
TASK: GBC-006 - Content review: TR-12 conformance and boundary/porting/ledger cross-check
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     3
AGENT:      planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

PROPOSED BY: techwriting-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- Reconcile the boundary page's gaps list, the 56-item ledger, and the /porting not-ported list so the cross-check yields zero contradictions and zero known omissions.
- Enforce TR-12: active voice, second person, the terminology lock (engine, engine tree, registry item, family, verdict, peers, dev client), the Guide and Troubleshooting templates, and the single-canonical-page rule.
- Fix any contradiction or omission by editing the owning file in write_allowed.
- Leave the tree green for the stranger's cross-check.
NEVER:
- Never ship a gap that names a shipped registry item or omits a known missing element.
- Never introduce a second boundary page or a boundary-table copy on /porting.
- Never edit packages/registry/**, pages/**, components/**, content.config.ts, or generated data.
- Never substitute a mock or canned answer for the real built-preview cross-check.
- Never author the automated e2e specs (those are the astro lens's GBC-014 deliverable).
STRICTLY:
- Strictly read the ledger from apps/docs/src/data/registry-items.json (read-only).
- Strictly keep the cross-check a reconciliation over real rendered content.
- Strictly confirm every gap is a consumer-owned responsibility or a named not-ported element.

## Specification
Objective: A reconciliation pass enforcing TR-12 content standards and the human-gate cross-check invariant so the boundary gaps list, the 56-item ledger, and the /porting not-ported list show zero contradictions and zero known omissions.
Success state: The stranger's gate cross-check passes: boundary gaps list, 56 ledger rows, and not-ported list reconcile with 0 contradictions and 0 omissions.

## Acceptance Criteria
### AC-1: gaps vs ledger vs not-ported reconcile with zero contradictions and omissions [PRIMARY]
  GIVEN: the reconciled boundary page, the /porting page, and the /registry ledger
  WHEN:  a stranger cross-checks the boundary gaps list against the 56 ledger rows and the not-ported list
  THEN:  the cross-check yields zero contradictions and zero known omissions
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the gaps list names a shipped item, omits a known gap, or the not-ported list overlaps a shipped item']
        EVIDENCE: file_artifact
        - ACTION: ['Open /docs/owns-vs-does-not-own, /porting, and /registry', 'Cross-check the gaps list against the 56 ledger rows and the not-ported list']
          MUST_OBSERVE: ['zero contradictions', 'zero known omissions', '56 ledger rows split 39/11/6', 'every gap is a consumer-owned responsibility or a named not-ported element']
          MUST_NOT_OBSERVE: ['a gap naming a shipped registry item', 'a known missing element absent from the not-ported list']

### AC-2: TR-12 terminology and voice conformance
  GIVEN: all sprint-06 authored content
  WHEN:  a reviewer reads for terminology and voice
  THEN:  the canonical terms and active-voice second-person prose hold with no forbidden term
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['forbidden terms (styling engine, flavor, registry variant, component, group, flag, support level, deps, dev build) appear in authored prose']
        EVIDENCE: file_artifact
        - ACTION: ['Scan the authored prose for the terminology lock']
          MUST_OBSERVE: ["'engine' for the styling backend", "'engine tree' for the per-engine artifact set", "'registry item' for a shippable unit", "'dev client' for the runtime requiring a dev build"]
          MUST_NOT_OBSERVE: ["'styling engine'", "'flavor'", "'registry variant'", "'support level'", "'dev build'"]

### AC-3: single-canonical boundary holds after reconciliation
  GIVEN: the reconciled content
  WHEN:  a reviewer re-checks the canonical-page rule
  THEN:  boundary tables remain only on /docs/owns-vs-does-not-own with no /porting copy
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['reconciliation introduced a boundary-table copy on /porting or a second boundary page']
        EVIDENCE: file_artifact
        - ACTION: ['Compare /porting against /docs/owns-vs-does-not-own after reconciliation']
          MUST_OBSERVE: ['boundary tables only on /docs/owns-vs-does-not-own']
          MUST_NOT_OBSERVE: ['a boundary-table copy on /porting']

### AC-4: a planted contradiction is caught
  GIVEN: a reconciliation that leaves a gap naming a shipped item
  WHEN:  the cross-check runs
  THEN:  the check fails naming the contradiction rather than passing
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a contradiction is silently tolerated']
        EVIDENCE: file_artifact
        - ACTION: ['Cross-check the gaps list against the 56 ledger rows']
          MUST_OBSERVE: ['zero contradictions']
          MUST_NOT_OBSERVE: ['a gap naming a shipped registry item']

## Test Criteria
- TC-1: The boundary gaps list, the 56-item ledger, and the not-ported list reconcile with zero contradictions and zero omissions.  (maps_to: AC-1)
- TC-2: The terminology lock holds with no forbidden term in authored prose.  (maps_to: AC-2)
- TC-3: The boundary tables remain canonical to one page with no /porting copy.  (maps_to: AC-3)
- TC-4: A planted contradiction (gap naming a shipped item) fails the cross-check.  (maps_to: AC-4)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — terminology lock and content gates
- apps/docs/src/content/docs/owns-vs-does-not-own.md — the reconciled gaps list
- apps/docs/src/content/docs/porting.md — the exact not-ported list
- apps/docs/src/data/registry-items.json — the 56-item ledger (read-only)
- .spec/prds/docs-site/12-e2e-testing-criteria.md — T-DOCS-018 (the human gate)

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/guides/**
- apps/docs/src/content/docs/owns-vs-does-not-own.md
- apps/docs/src/content/docs/porting.md
- apps/docs/src/content/changelog/**
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/content.config.ts
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md', '.spec/prds/docs-site/12-e2e-testing-criteria.md']
Interaction notes: This is the content half of human-gate T-DOCS-018. The automated e2e specs (GBC-014) are the astro lens's deliverable; this task only reconciles content and leaves the tree green.
Pattern: content reconciliation against the cross-check invariant + TR-12 conformance (.spec/prds/docs-site/11-technical-requirements/12-content-standards.md)
Anti-pattern: a gap naming a shipped item; a known missing element absent from the not-ported list; a boundary-table copy on /porting

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art

## Dependencies
Depends on: ['GBC-003', 'GBC-004']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-006",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "reconciled_cross_check_candidate": {
      "description": "GBC-003 (boundary tables) and GBC-004 (porting) are authored; the registry build and gallery manifest produce the dist served by an owned localhost:4321 preview; each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/owns-vs-does-not-own.md carries the reconciled gaps list.",
        "apps/docs/src/content/docs/porting.md carries the exact not-ported list.",
        "apps/docs/src/data/registry-items.json supplies the 56-item ledger (39 component / 11 ui / 6 lib).",
        "The cross-check reads all three surfaces over the real preview."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN the reconciled boundary page, the /porting page, and the /registry ledger WHEN a stranger cross-checks the boundary gaps list against the 56 ledger rows and the not-ported list THEN the cross-check yields zero contradictions and zero known omissions",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN all sprint-06 authored content WHEN a reviewer reads for terminology and voice THEN the canonical terms and active-voice second-person prose hold with no forbidden term",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the reconciled content WHEN a reviewer re-checks the canonical-page rule THEN boundary tables remain only on /docs/owns-vs-does-not-own with no /porting copy",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN a reconciliation that leaves a gap naming a shipped item WHEN the cross-check runs THEN the check fails naming the contradiction rather than passing",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "The boundary gaps list, the 56-item ledger, and the not-ported list reconcile with zero contradictions and zero omissions.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "The terminology lock holds with no forbidden term in authored prose.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "The boundary tables remain canonical to one page with no /porting copy.",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "A planted contradiction (gap naming a shipped item) fails the cross-check.",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    }
  ]
}
-->
