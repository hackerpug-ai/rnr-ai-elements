================================================================================
TASK: GBC-001 - Author the four job how-to guides (re-theme, update, preview, customize-rendering)
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
- Author each guide in the TR-12 Guide template: 'This guide shows you how to {goal}' + prerequisites + numbered imperative steps each with an expected observable result + next steps.
- Restate engine facts exactly (Tailwind v4 + @theme → uniwind; nativewind v3 → nativewind tree) with no inversion; link out to /docs/theming as the token-map reference rather than duplicating it.
- Repoint apps/docs/src/lib/seam-map.ts SEAM_LINK_TARGETS to /guides/customize-rendering#rendermarkdown and #textclasscontext.
- Use section: guides frontmatter with unique order 1..4 so the five-guide cap and the /guides index can resolve them deterministically.
NEVER:
- Never author a sixth guide or a guide for engine choice or porting (Installation and /porting own those).
- Never hand-type a code snippet that is not extracted from or typechecked against a real file (apps/example or the registry).
- Never change apps/docs/src/content.config.ts, apps/docs/src/pages/**, or the registry source.
- Never present a stub, placeholder, or 'coming soon' as a complete how-to.
STRICTLY:
- Strictly keep the token-map reference on /docs/theming; the re-theme guide links, it does not copy.
- Strictly use the literal absolute-URL add form in update-installed-items (T-DOCS-012).
- Strictly document both renderMarkdown and TextClassContext in customize-rendering (T-DOCS-026).

## Specification
Objective: Four complete how-to guides under apps/docs/src/content/docs/guides/ that serve the re-theme, update, preview, and customize-rendering jobs, plus the seam-link retarget.
Success state: A visitor opens /guides and each of /guides/re-theme, /guides/update-installed-items, /guides/preview-on-device, /guides/customize-rendering returns 200 with a complete how-to; component-page seam Callouts target the customize-rendering guide.

## Acceptance Criteria
### AC-1: re-theme guide renders as a complete how-to [PRIMARY]
  GIVEN: the authored re-theme guide and the real built preview
  WHEN:  a visitor opens /guides/re-theme
  THEN:  the page returns 200 with a complete how-to containing oklch and @theme, and it is listed on the /guides index
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the guide route is disconnected from its markdown source or renders an empty shell, or the guide is not listed on /guides']
        EVIDENCE: file_artifact
        - ACTION: ['Open /guides/re-theme through the real localhost preview', 'Assert a 200 response and visible guide body', 'Open /guides and confirm the re-theme guide appears in the index']
          MUST_OBSERVE: ['HTTP 200 at /guides/re-theme', "visible strings 'oklch' and '@theme' in the guide body", 'a goal sentence matching /This guide shows you how to/', 'the re-theme guide listed on /guides']
          MUST_NOT_OBSERVE: ["placeholder text or 'coming soon'", 'the full Theming token map duplicated inside the guide']

### AC-2: update guide carries the literal absolute-URL add
  GIVEN: the authored update-installed-items guide
  WHEN:  a visitor opens /guides/update-installed-items
  THEN:  the page contains the literal npx @react-native-reusables/cli@latest add command in absolute-URL form
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the add command is absent, short-name, relative, or templated after page load']
        EVIDENCE: file_artifact
        - ACTION: ['Open /guides/update-installed-items', 'Inspect the visible install command']
          MUST_OBSERVE: ["the literal string 'npx @react-native-reusables/cli@latest add'", 'an absolute-URL form matching https://rnraielements.com/r/{engine}/{item}.json']
          MUST_NOT_OBSERVE: ['a short-name add', 'a relative URL']

### AC-3: customize-rendering documents both seams and is the seam target
  GIVEN: the authored customize-rendering guide and the real seam-map
  WHEN:  a visitor opens /guides/customize-rendering and a component page using a seam
  THEN:  the guide documents renderMarkdown and TextClassContext, and the seam Callouts link the guide
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the guide omits one seam, or seam-map.ts still points at /docs/theming#']
        EVIDENCE: file_artifact
        - ACTION: ['Open /guides/customize-rendering', 'Inspect apps/docs/src/lib/seam-map.ts SEAM_LINK_TARGETS', 'Open a seam-using component page and read its seam Callout link']
          MUST_OBSERVE: ["both 'renderMarkdown' and 'TextClassContext' documented in the guide", 'SEAM_LINK_TARGETS pointing at /guides/customize-rendering#rendermarkdown and #textclasscontext']
          MUST_NOT_OBSERVE: ['seam targets still pointing at /docs/theming#rendermarkdown or #textclasscontext']

### AC-4: preview guide reachable and Expo Go-scoped
  GIVEN: the authored preview-on-device guide
  WHEN:  a visitor reaches it from the /guides index
  THEN:  the page returns 200 and documents previewing on device via Expo Go
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the guide is not linked from /guides, or describes a dev-client-only item as an Expo Go preview']
        EVIDENCE: file_artifact
        - ACTION: ['Open /guides and follow the preview guide link', 'Read the guide body']
          MUST_OBSERVE: ['HTTP 200 at /guides/preview-on-device', "'Expo Go' in the guide body"]
          MUST_NOT_OBSERVE: ['a dev-client-only instruction mislabeled as an Expo Go preview']

### AC-5: guides restate engine facts without inversion
  GIVEN: the authored guides
  WHEN:  a reviewer reads their engine statements
  THEN:  Tailwind v4 + @theme implies uniwind and nativewind v3 implies the nativewind tree, with no inverted claim
  FLOW_REF: FLOW-DOCS-03-five-guides-index
  TEST_TIER: e2e
  VERIFICATION_SERVICE: built dist over astro preview at http://localhost:4321
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts
  TEST_FUNCTION: FLOW-DOCS-03-five-guides-index
  VERIFY: pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["a guide restates 'Tailwind v4 + @theme implies the nativewind tree' or 'nativewind v3 implies uniwind'"]
        EVIDENCE: file_artifact
        - ACTION: ['Read the engine statements across the four guides']
          MUST_OBSERVE: ["'Tailwind v4' + '@theme' adjacent to 'uniwind'", "'nativewind v3' adjacent to 'nativewind tree'"]
          MUST_NOT_OBSERVE: ["'Tailwind v4' + '@theme' adjacent to 'nativewind'", "'nativewind v3' adjacent to 'uniwind'"]

## Test Criteria
- TC-1: The re-theme guide returns 200, is listed on /guides, and contains oklch and @theme.  (maps_to: AC-1)
- TC-2: The update guide contains the literal npx @react-native-reusables/cli@latest add command in absolute-URL form.  (maps_to: AC-2)
- TC-3: The customize-rendering guide documents both seams and seam-map.ts targets the guide.  (maps_to: AC-3)
- TC-4: The preview guide is linked from /guides and is Expo Go-scoped.  (maps_to: AC-4)
- TC-5: No guide inverts the engine facts; Tailwind v4 + @theme pairs with uniwind and nativewind v3 with the nativewind tree.  (maps_to: AC-5)

## Reading List
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — Guide template, terminology lock, snippet/link gates
- apps/docs/src/content/docs/theming.mdx — token map and the two seams the guides reference
- apps/docs/src/content/docs/dark-mode.md — existing getting-started prose style to imitate
- apps/docs/src/content.config.ts — section/order frontmatter schema the guide files must satisfy
- apps/docs/src/lib/seam-map.ts — SEAM_LINK_TARGETS the task repoints

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/content/docs/guides/re-theme.md (NEW)
- apps/docs/src/content/docs/guides/update-installed-items.md (NEW)
- apps/docs/src/content/docs/guides/preview-on-device.md (NEW)
- apps/docs/src/content/docs/guides/customize-rendering.md (NEW)
- apps/docs/src/lib/seam-map.ts (SEAM_LINK_TARGETS repoint only)
WRITE-PROHIBITED:
- packages/registry/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/content.config.ts
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/12-content-standards.md', '.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: Guides render at /guides/[slug] via the astro-owned route (not the /docs catch-all); the index uses IndexList + SectionHeader (frontend-designer). This task authors the manuscripts only.
Pattern: how-to quadrant: 'This guide shows you how to {goal}' + prerequisites + numbered imperative steps with expected results + next steps (.spec/prds/docs-site/11-technical-requirements/12-content-standards.md)
Anti-pattern: prose walls without steps; duplicating the Theming token map; engine-choice or porting content smuggled into the guides section

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index

## Dependencies
Depends on: none
Blocks:     ['GBC-002']

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-001",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "authored_guides_candidate": {
      "description": "The authored four guide manuscripts under apps/docs/src/content/docs/guides/ enter the real docs content build; the registry build and gallery manifest produce the dist served by an owned localhost:4321 preview; each browser context starts with empty storage.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/content/docs/guides/re-theme.md, update-installed-items.md, preview-on-device.md, customize-rendering.md are authored with section: guides and order 1..4.",
        "packages/registry/registry.json supplies the real item slugs and the engine-templated URL shape.",
        "apps/docs/src/data/registry-items.json supplies the built ledger.",
        "/guides, /guides/re-theme, /guides/update-installed-items, /guides/preview-on-device, /guides/customize-rendering are built from the candidate's real sources.",
        "apps/docs/src/lib/seam-map.ts SEAM_LINK_TARGETS is repointed at /guides/customize-rendering#rendermarkdown and #textclasscontext."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "description": "GIVEN the authored re-theme guide and the real built preview WHEN a visitor opens /guides/re-theme THEN the page returns 200 with a complete how-to containing oklch and @theme, and it is listed on /guides",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": true,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview at http://localhost:4321",
        "negative_control": {
          "would_fail_if": [
            "the guide route is disconnected from its markdown source or renders an empty shell, or the guide is not listed on /guides"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "user",
              "steps": [
                "Open /guides/re-theme through the real localhost preview",
                "Assert a 200 response and visible guide body",
                "Open /guides and confirm the re-theme guide appears in the index"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP 200 at /guides/re-theme",
                "visible strings 'oklch' and '@theme' in the guide body",
                "a goal sentence matching /This guide shows you how to/",
                "the re-theme guide listed on /guides"
              ],
              "must_not_observe": [
                "placeholder text or 'coming soon'",
                "the full Theming token map duplicated inside the guide"
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
      "description": "GIVEN the authored update-installed-items guide WHEN a visitor opens /guides/update-installed-items THEN the page contains the literal npx @react-native-reusables/cli@latest add command in absolute-URL form",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview at http://localhost:4321",
        "negative_control": {
          "would_fail_if": [
            "the add command is absent, short-name, relative, or templated after page load"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "user",
              "steps": [
                "Open /guides/update-installed-items",
                "Inspect the visible install command"
              ]
            },
            "end_state": {
              "must_observe": [
                "the literal string 'npx @react-native-reusables/cli@latest add'",
                "an absolute-URL form matching https://rnraielements.com/r/{engine}/{item}.json"
              ],
              "must_not_observe": [
                "a short-name add",
                "a relative URL"
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
      "description": "GIVEN the authored customize-rendering guide and the real seam-map WHEN a visitor opens /guides/customize-rendering and a component page using a seam THEN the guide documents renderMarkdown and TextClassContext, and the seam Callouts link the guide",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview at http://localhost:4321",
        "negative_control": {
          "would_fail_if": [
            "the guide omits one seam, or seam-map.ts still points at /docs/theming#"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "user",
              "steps": [
                "Open /guides/customize-rendering",
                "Inspect apps/docs/src/lib/seam-map.ts SEAM_LINK_TARGETS",
                "Open a seam-using component page and read its seam Callout link"
              ]
            },
            "end_state": {
              "must_observe": [
                "both 'renderMarkdown' and 'TextClassContext' documented in the guide",
                "SEAM_LINK_TARGETS pointing at /guides/customize-rendering#rendermarkdown and #textclasscontext"
              ],
              "must_not_observe": [
                "seam targets still pointing at /docs/theming#rendermarkdown or #textclasscontext"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored preview-on-device guide WHEN a visitor reaches it from the /guides index THEN the page returns 200 and documents previewing on device via Expo Go",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview at http://localhost:4321",
        "negative_control": {
          "would_fail_if": [
            "the guide is not linked from /guides, or describes a dev-client-only item as an Expo Go preview"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "user",
              "steps": [
                "Open /guides and follow the preview guide link",
                "Read the guide body"
              ]
            },
            "end_state": {
              "must_observe": [
                "HTTP 200 at /guides/preview-on-device",
                "'Expo Go' in the guide body"
              ],
              "must_not_observe": [
                "a dev-client-only instruction mislabeled as an Expo Go preview"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the authored guides WHEN a reviewer reads their engine statements THEN Tailwind v4 + @theme implies uniwind and nativewind v3 implies the nativewind tree, with no inverted claim",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "built dist over astro preview at http://localhost:4321",
        "negative_control": {
          "would_fail_if": [
            "a guide restates 'Tailwind v4 + @theme implies the nativewind tree' or 'nativewind v3 implies uniwind'"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "authored_guides_candidate",
            "action": {
              "actor": "user",
              "steps": [
                "Read the engine statements across the four guides"
              ]
            },
            "end_state": {
              "must_observe": [
                "'Tailwind v4' + '@theme' adjacent to 'uniwind'",
                "'nativewind v3' adjacent to 'nativewind tree'"
              ],
              "must_not_observe": [
                "'Tailwind v4' + '@theme' adjacent to 'nativewind'",
                "'nativewind v3' adjacent to 'uniwind'"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "primary": false,
      "description": "The re-theme guide returns 200, is listed on /guides, and contains oklch and @theme.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "The update guide contains the literal npx @react-native-reusables/cli@latest add command in absolute-URL form.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "The customize-rendering guide documents both seams and seam-map.ts targets the guide.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "The preview guide is linked from /guides and is Expo Go-scoped.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "No guide inverts the engine facts; Tailwind v4 + @theme pairs with uniwind and nativewind v3 with the nativewind tree.",
      "flow_ref": "FLOW-DOCS-03-five-guides-index",
      "test_file": "tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts",
      "test_function": "FLOW-DOCS-03-five-guides-index",
      "verify": "pnpm playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index",
      "test_tier": "e2e",
      "verification_service": "built dist over astro preview at http://localhost:4321",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-5"
    }
  ]
}
-->
