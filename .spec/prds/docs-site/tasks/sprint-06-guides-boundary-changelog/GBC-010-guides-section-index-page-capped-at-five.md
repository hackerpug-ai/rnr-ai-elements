================================================================================
TASK: GBC-010 - /guides section-index page (capped at five)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     3
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes

---
## Critical Constraints
MUST:
- render a section-index with SectionHeader carrying count 5
- render IndexList rows linking the five guide destinations
- derive the guide list from the guides-section collection entries (never hardcode titles)
- omit the ToC (short page)
NEVER:
- hardcode the five guide titles or hrefs in the page
- render 4 or 6 cards
- author the IndexList primitive (design lens owns it)
STRICTLY:
- exactly five cards
- each card title matches its destination page H1

## Specification
Objective: Publish the /guides section-index generated from the guides-section collection, listing exactly the five launch guides.
Success state: Over the built preview, /guides lists exactly 5 cards, each card title matching its destination page H1.

## Acceptance Criteria
### AC-1: Guides index lists exactly the five launch guides [PRIMARY]
  GIVEN: five guides-section entries in the collection
  WHEN:  a visitor opens /guides
  THEN:  the index lists exactly 5 cards and each card title matches its destination page H1
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index: exactly five cards with matching H1s
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        MUST_OBSERVE: ['/guides 200', 'exactly 5 guide cards', 'each card title equals its destination H1']
        MUST_NOT_OBSERVE: ['4 or 6 cards', 'a card title mismatching its destination H1', 'a stub or empty card']

### AC-2: Guides index links each guide to a 200 page
  GIVEN: the /guides index with 5 cards
  WHEN:  a visitor opens each linked /guides/{slug}
  THEN:  each returns 200
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index: every card links a 200 page
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        MUST_OBSERVE: ['5 guide hrefs', 'each href 200']
        MUST_NOT_OBSERVE: ['a dead guide href']

### AC-3: The five launch guides are present
  GIVEN: the /guides index
  WHEN:  a visitor reads the card list
  THEN:  the five launch guides (oklch tokens, update installed, Expo Go preview, custom rendering, troubleshooting) are each present
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index: the five launch guide cards are present
  VERIFY: pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        MUST_OBSERVE: ['oklch-tokens guide', 'update-installed guide', 'expo-go-preview guide', 'customize-rendering guide', 'troubleshooting guide']
        MUST_NOT_OBSERVE: ['a sixth guide card', 'engine-choice or porting as a guide']

## Test Criteria
- TC-1: /guides renders exactly 5 cards  (maps_to: AC-1)
- TC-2: every card links a 200 guide page  (maps_to: AC-2)
- TC-3: the five launch guides are present (not engine-choice/porting)  (maps_to: AC-3)

## Reading List
- apps/docs/src/pages/components/index.astro
- apps/docs/src/components/SectionHeader.astro
- apps/docs/src/lib/docs-navigation.ts
- apps/docs/src/layouts/DocsLayout.astro

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/pages/guides/index.astro (NEW)
- tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts (NEW)
WRITE-PROHIBITED:
- apps/docs/src/components/IndexList.astro (design lens owns the primitive)
- apps/docs/src/components/SectionHeader.astro (design lens owns the primitive)
- apps/docs/src/content/docs/guides/** (techwriting authors guide prose)

## Design
References: ['apps/docs/src/pages/components/index.astro (SectionHeader usage)', 'apps/docs/src/components/SectionHeader.astro']
Interaction notes: The page reads the same published guides list GBC-009 derives; it never hardcodes the five titles. IndexList and the section-index layout are the frontend-designer lens's primitives — this task composes, not authors them.
Pattern: Generated section-index composing SectionHeader + IndexList over collection entries (apps/docs/src/pages/components/index.astro)
Anti-pattern: Hardcoding the five guide titles/hrefs in the page template

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index

## Dependencies
Depends on: ['GBC-009']
Blocks:     ['GBC-013', 'GBC-014']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-010",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "five_guides": "five guides-section entries render as five index rows"
  },
  "requirements": [
    {
      "id": "GBC-010-R1",
      "source": "AC-1",
      "type": "behavioral",
      "statement": "guides index lists exactly five cards with matching H1s",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "GBC-010-R2",
      "source": "AC-2",
      "type": "behavioral",
      "statement": "every card links a 200 page",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "GBC-010-R3",
      "source": "AC-3",
      "type": "behavioral",
      "statement": "the five launch guides are present",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "GBC-010-R4",
      "source": "TC-1",
      "type": "boolean-check",
      "statement": "exactly 5 cards",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "GBC-010-R5",
      "source": "TC-2",
      "type": "boolean-check",
      "statement": "card links 200",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    },
    {
      "id": "GBC-010-R6",
      "source": "TC-3",
      "type": "boolean-check",
      "statement": "five launch guides present",
      "verify": "pnpm e2e:docs --grep FLOW-DOCS-03-five-guides-index"
    }
  ]
}
-->
