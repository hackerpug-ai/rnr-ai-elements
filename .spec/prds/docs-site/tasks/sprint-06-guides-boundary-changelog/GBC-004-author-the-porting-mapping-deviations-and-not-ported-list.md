================================================================================
TASK: GBC-004 - Author the /porting mapping, deviations, and not-ported list
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
- Author apps/docs/src/content/docs/porting.md (section: porting) as the single /porting page.
- Provide an upstream-to-port mapping table with an explicit deviations column and >=5 rows, every mapped slug resolving to one of the 56 shipped items.
- Provide a not-ported list naming exactly the missing upstream elements such that mapping + not-ported equals the upstream total and none matches a shipped item.
- Credit prior art: elements.ai-sdk.dev and muratcakmak/expo-ai-elements with a why-differs statement.
- Emit `mapping`, `notPorted`, and `upstream` as structured frontmatter arrays in porting.md — the machine-readable source GBC-012's gate diffs.
- Pin the upstream enumeration to the vercel/ai-elements registry listing at a recorded URL/commit; note that dated snapshot in the page intro.
NEVER:
- Never invent an upstream element or a mapping row not grounded in the upstream registry and packages/registry/registry.json.
- Never name a shipped registry item on the not-ported list.
- Never copy the boundary tables from GBC-003 onto /porting (single-canonical rule).
- Never hand-type a mapping slug that does not resolve to a real registry item.
- Never change routing, content.config.ts, the registry source, or generated data.
STRICTLY:
- Strictly use section: porting frontmatter so the astro route serves it at /porting.
- Strictly make the deviations column explicit and present in the rendered table.
- Strictly keep mapping + not-ported equal to the upstream total.

## Specification
Objective: A single /porting page carrying the upstream-to-port mapping table with a deviations column, an exact not-ported list, and prior-art context.
Success state: A contributor opens /porting and reads a >=5-row mapping table with a deviations column, a not-ported list naming exactly the missing upstream elements, and prior-art context crediting elements.ai-sdk.dev and muratcakmak/expo-ai-elements.

## Acceptance Criteria
### AC-1: mapping table with deviations column [PRIMARY]
  GIVEN: the authored porting manuscript and the real built preview
  WHEN:  a contributor opens /porting
  THEN:  the page renders an upstream-to-port mapping table with an explicit deviations column and >=5 rows
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['/porting renders no mapping table, no deviations column, or fewer than 5 rows']
        EVIDENCE: file_artifact
        - ACTION: ['Open /porting through the real preview', 'Inspect the mapping table and its columns']
          MUST_OBSERVE: ['>=5 mapping rows', 'a deviations column header', 'each mapped slug resolving to one of the 56 items']
          MUST_NOT_OBSERVE: ['a mapping row naming a non-existent slug', 'a table without a deviations column']

### AC-2: not-ported list is the exact complement
  GIVEN: the authored porting manuscript and the real registry
  WHEN:  a contributor reads the not-ported list
  THEN:  mapping plus not-ported equals the upstream total and no not-ported name matches a shipped item
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the not-ported list is absent, overlaps a shipped item, or the sets do not sum to the upstream total']
        EVIDENCE: file_artifact
        - ACTION: ['Read the not-ported list', 'Compare mapping + not-ported against the upstream element set']
          MUST_OBSERVE: ['>=1 not-ported entry', 'mapping + not-ported equal to the upstream total', 'zero not-ported names matching a shipped item']
          MUST_NOT_OBSERVE: ['a not-ported name that is one of the 56 shipped items']

### AC-3: prior-art context with why-differs
  GIVEN: the authored porting manuscript
  WHEN:  a contributor reads the prior-art section
  THEN:  the page credits elements.ai-sdk.dev and muratcakmak/expo-ai-elements with a why-differs statement
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the prior-art names are absent or no why-differs rationale is stated']
        EVIDENCE: file_artifact
        - ACTION: ['Read the prior-art section on /porting']
          MUST_OBSERVE: ["'elements.ai-sdk.dev'", "'muratcakmak/expo-ai-elements'", 'a why-differs statement (two-engine fan-out vs stale single-engine forks)']
          MUST_NOT_OBSERVE: ['prior-art names absent']

### AC-4: prior-art links absolute and live
  GIVEN: the authored porting manuscript
  WHEN:  a reviewer checks the prior-art hrefs
  THEN:  both links are absolute https URLs resolving 200 or 301 (validated by the recorded link-check lane, not an in-browser e2e follow)
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a prior-art link is relative, malformed, or dead']
        EVIDENCE: file_artifact
        - ACTION: ['Inspect the prior-art anchor hrefs on /porting', 'Resolve each via the recorded link-check lane (scripts/docs-data/check-dist-links.ts)']
          MUST_OBSERVE: ['both prior-art links absolute https', 'each resolving 200 or 301']
          MUST_NOT_OBSERVE: ['a relative or http-only href', 'a dead link']

### AC-5: no boundary-table copy on /porting
  GIVEN: the authored porting manuscript and the rewritten boundary page
  WHEN:  a reviewer compares /porting with /docs/owns-vs-does-not-own
  THEN:  /porting carries no second copy of the boundary tables
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['/porting duplicates the boundary ships/does-not-ship tables']
        EVIDENCE: file_artifact
        - ACTION: ['Compare /porting content against the boundary tables on /docs/owns-vs-does-not-own']
          MUST_OBSERVE: ['/porting has the mapping table and not-ported list only']
          MUST_NOT_OBSERVE: ['a second copy of the boundary ships/does-not-ship tables on /porting']

## Test Criteria
- TC-1: /porting renders a >=5-row mapping table with an explicit deviations column, every slug resolving to a real item.  (maps_to: AC-1)
- TC-2: Mapping + not-ported equals the upstream total and no not-ported name matches a shipped item.  (maps_to: AC-2)
- TC-3: Prior art credits elements.ai-sdk.dev and muratcakmak/expo-ai-elements with a why-differs statement.  (maps_to: AC-3)
- TC-4: Both prior-art links are absolute https and resolve 200 or 301.  (maps_to: AC-4)
- TC-5: /porting carries no second copy of the boundary tables.  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — terminology lock and link gates
- packages/registry/registry.json — the 56 real slugs for the mapping and not-ported complement
- apps/docs/src/data/registry-items.json — the built ledger
- .spec/prds/docs-site/04-uc-docs.md — UC-DOCS-05 acceptance criteria
- AGENTS.md — prior art (elements.ai-sdk.dev, muratcakmak/expo-ai-elements) and porting context

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/porting.md (NEW)
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/content.config.ts
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md', '.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: Astro routes section: porting to the top-level /porting page (not /docs/porting) and integrates it into the link check. The not-ported list is the second input to the human-gate cross-check.
Pattern: porting notes as a mapping table with deviations + exact complement not-ported list + prior-art context (.spec/prds/docs-site/11-technical-requirements/12-content-standards.md)
Anti-pattern: a mapping row naming a non-existent slug; a not-ported entry that is a shipped item; duplicating the boundary tables

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art

## Dependencies
Depends on: none
Blocks:     ['GBC-006']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-004",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "authored_porting_candidate": {
      "description": "The authored porting.md enters the real docs content build; the registry build and gallery manifest produce the dist served by an owned localhost:4321 preview; each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/porting.md is authored with section: porting.",
        "packages/registry/registry.json supplies the 56 real slugs for the mapping and the not-ported complement.",
        "apps/docs/src/data/registry-items.json supplies the built ledger.",
        "/porting is built from the candidate's real source."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN the authored porting manuscript and the real built preview WHEN a contributor opens /porting THEN the page renders an upstream-to-port mapping table with an explicit deviations column and >=5 rows",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored porting manuscript and the real registry WHEN a contributor reads the not-ported list THEN mapping plus not-ported equals the upstream total and no not-ported name matches a shipped item",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored porting manuscript WHEN a contributor reads the prior-art section THEN the page credits elements.ai-sdk.dev and muratcakmak/expo-ai-elements with a why-differs statement",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored porting manuscript WHEN a reviewer checks the prior-art hrefs THEN both links are absolute https URLs resolving 200 or 301",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored porting manuscript and the rewritten boundary page WHEN a reviewer compares /porting with /docs/owns-vs-does-not-own THEN /porting carries no second copy of the boundary tables",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "/porting renders a >=5-row mapping table with an explicit deviations column, every slug resolving to a real item.",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "Mapping + not-ported equals the upstream total and no not-ported name matches a shipped item.",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "Prior art credits elements.ai-sdk.dev and muratcakmak/expo-ai-elements with a why-differs statement.",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "Both prior-art links are absolute https and resolve 200 or 301.",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "/porting carries no second copy of the boundary tables.",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-5"
    }
  ]
}
-->
