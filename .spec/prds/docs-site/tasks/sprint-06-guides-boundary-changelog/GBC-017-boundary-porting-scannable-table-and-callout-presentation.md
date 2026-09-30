================================================================================
TASK: GBC-017 - boundary + porting scannable-table and callout presentation
================================================================================

TASK_TYPE:  DESIGN
STATUS:     Completed

Commit: 199bcb514699ada8bd4f923e57518f942b484a28
PRIORITY:   P1
POINTS:     3
AGENT:      planner=frontend-designer | implementer=frontend-designer | reviewer=react-native-reusables-reviewer

PROPOSED BY: frontend-designer
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Critical Constraints
MUST:
- style markdown tables in Prose so every claim string lands inside td/th
- match DataTable's visual language (var(--muted) zebra, var(--border) dividers, sticky thead offset top calc(var(--layout-header-h) + 0.25rem) so it pins below the site header, muted caption) — declared a known twin of DataTable.astro's table chrome: keep in lockstep, comment says so
- render th with scope="col" on every Prose table plus a muted caption (accessibility floor)
- set td{overflow-wrap:anywhere} and a first-column max-width below 48rem so sentence-length deviation cells wrap instead of blowing the layout
- render the boundary owns/doesn't-own split and the gaps section as tables, never prose
- render the porting mapping table with a 'Deviation' column and the not-ported list
- keep the boundary tables canonical to /docs/owns-vs-does-not-own
NEVER:
- never render boundary claims as prose paragraphs
- never duplicate the boundary tables on /porting
- never author the table cell content (techwriting owns content)
- never change the markdown-doc page kind (GBC-003 re-authors the boundary page as .mdx, which is what makes the info Callout composable; this task consumes, never converts)
STRICTLY:
- >=2 tables on /docs/owns-vs-does-not-own (T-DOCS-019)
- horizontal scroll via the native pattern :global(.prose table){display:block;overflow-x:auto} in Prose.astro scoped styles — reachable from the one write-allowed file, no wrapper element or rehype plugin needed; NO pinned first column (cut: the mapping table is ~5 rows and the boundary tables ~7 claims — DataTable needed pinning for 56 mono-key rows, these do not)
- token-only styling, zero JS
- NEVER edit tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts (GBC-003 writes it) or tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts (GBC-009 writes it). They are listed in write_allowed only so the late non-primary AC-1 to AC-5 bindings resolve. This task must leave both flows green, and both run_cmds are verification gates.
- UNIT_TEST_JUSTIFIED: AC-6 is a pure source-contract scan that only reads Prose.astro from the real working tree (no runtime, no service). Its table rules land after GBC-009's porting spec, and the rendered claims ride the FLOW-DOCS-04 and FLOW-DOCS-05 specs, which this late task may not edit.
- The Prose table thead is NOT sticky: do not declare position: sticky on thead th. Reason: display:block plus overflow-x:auto makes each table its own scroll container (overflow-x:auto forces overflow-y to auto), so a sticky header pins inside the table, not below the site header, and never visibly sticks while the page scrolls; a computed-style check would still read 'sticky' while nothing happens. These tables hold about 5 to 7 rows and need no pinned header. This supersedes every sticky-thead wording in this task, including the MUST line's 'sticky thead offset top calc(var(--layout-header-h) + 0.25rem)' and the Design section's 'sticky thead' interaction note and pattern. The DataTable.astro twin comment names this as the one deliberate divergence from DataTable's chrome.

## Specification
Objective: Extend Prose.astro so markdown tables render scannably (DataTable language), every boundary/porting claim string lands in td/th, the gaps section is a table, and the example-app cross-link is an info Callout, enforcing the single-canonical rule.
Success state: The built /docs/owns-vs-does-not-own and /porting render boundary/porting claims inside styled scannable tables, a gaps section lists >=1 honest gap, the example-app anchor resolves non-404, and /porting carries no second copy of the boundary tables.

## Acceptance Criteria
### AC-1: boundary-tables-not-prose
  GIVEN: GBC-003 has closed and its boundary-tables spec passes. This is a late task: that spec already observes this claim, and this task must not break it. The ordered docs build, with this task's Prose table styling, is served by the Playwright-owned astro preview
  WHEN:  a visitor opens /docs/owns-vs-does-not-own
  THEN:  the page renders >=2 tables and each boundary claim string ('transport', 'streaming client', 'tool executor', 'useChat') sits inside a td/th, never only in a prose paragraph
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the boundary page reverts to static prose paragraphs with 0 tables', "the Prose table styling hides cells (display: none), or 'useChat' is omitted from every table cell"]
        EVIDENCE: file_artifact
        - START_REF: boundary_page_built
          ACTION: ['GET http://localhost:4321/docs/owns-vs-does-not-own and record the status', "count '.prose table' elements and, for each of the 4 claim literals, the visible 'td, th' cells whose text contains it"]
          MUST_OBSERVE: ['GET /docs/owns-vs-does-not-own returns HTTP 200', ">= 2 'table' elements inside '.prose'", "each of the 4 literals 'transport', 'streaming client', 'tool executor', 'useChat' is contained in >= 1 'td' or 'th' with a boundingBox height > 0"]
          MUST_NOT_OBSERVE: ["0 or 1 'table' elements on the page", "'useChat' present in 0 'td'/'th' cells (only in a '<p>')"]

### AC-2: porting-mapping-deviations
  GIVEN: GBC-009 has closed and its porting-map spec passes. This is a late task: that spec already observes this claim, including GBC-004's rendered mapping table, and this task must not break it
  WHEN:  a visitor opens /porting
  THEN:  a mapping table with a 'Deviation' column and >=5 rows renders, alongside a not-ported list with >=1 entry and links to both prior-art projects, elements.ai-sdk.dev and muratcakmak/expo-ai-elements
  FLOW_REF: FLOW-DOCS-05-porting-map-and-prior-art
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
  TEST_FUNCTION: FLOW-DOCS-05-porting-map-and-prior-art
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the Deviation column is omitted, or the mapping table is replaced by static prose', 'the not-ported list is empty', 'a prior-art link is removed']
        EVIDENCE: file_artifact
        - START_REF: porting_page_built
          ACTION: ['GET http://localhost:4321/porting and http://localhost:4321/docs/porting and record both statuses', "find the '.prose table' whose 'thead th' texts match /deviation/i and count its 'tbody tr'", "count the items under the heading matching /not ported/i and the prior-art 'a' hrefs"]
          MUST_OBSERVE: ['GET /porting returns HTTP 200 and GET /docs/porting returns HTTP 404', "exactly 1 '.prose table' has a 'thead th' whose text matches /deviation/i, and it holds >= 5 'tbody tr' rows", "the list or table after the heading matching /not ported/i holds >= 1 'li' or 'tbody tr' item", ">= 1 'a' with an href containing 'elements.ai-sdk.dev' and >= 1 'a' with an href containing 'muratcakmak/expo-ai-elements'"]
          MUST_NOT_OBSERVE: ["a mapping table with 0 'Deviation' header cells", 'fewer than 5 mapping rows (0 to 4)', 'an empty not-ported list (0 items)', '0 prior-art links']

### AC-3: boundary-gaps-section
  GIVEN: GBC-003 has closed and its boundary-tables spec passes. This is a late task: that spec already observes this claim, and this task must not break it. The ordered docs build, with this task's Prose table styling, is served by the Playwright-owned astro preview
  WHEN:  the boundary page is inspected
  THEN:  a gaps section lists >=1 honest gap, and the ownership split names 'react-native-reusables' inside a table cell
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the gaps section is omitted or rendered empty', "'react-native-reusables' is removed from the ownership-split table"]
        EVIDENCE: file_artifact
        - START_REF: boundary_page_built
          ACTION: ['open http://localhost:4321/docs/owns-vs-does-not-own', "locate the heading whose text matches /gaps/i and count the 'li' or 'tbody tr' items in the list or table after it", "search the 'td, th' cells for 'react-native-reusables'"]
          MUST_OBSERVE: ["exactly 1 heading whose text matches /gaps/i, followed by a list or table holding >= 1 'li' or 'tbody tr' item", "'react-native-reusables' is contained in >= 1 'td' or 'th'"]
          MUST_NOT_OBSERVE: ['a gaps section with 0 items (empty)', "'react-native-reusables' in 0 table cells"]

### AC-4: single-canonical
  GIVEN: GBC-003 has closed and its boundary-tables spec passes. This is a late task: that spec already observes this claim, and this task must not break it. The ordered docs build, with this task's Prose table styling, is served by the Playwright-owned astro preview
  WHEN:  a visitor reads /docs/owns-vs-does-not-own, / and /docs/introduction
  THEN:  the boundary tables render only on /docs/owns-vs-does-not-own, and home and Introduction carry one-line teasers plus links to it
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['the boundary tables are duplicated as a hardcoded copy onto home or Introduction', 'the teaser links to the boundary page are removed from home or Introduction']
        EVIDENCE: file_artifact
        - START_REF: boundary_page_built
          ACTION: ['GET /docs/owns-vs-does-not-own, / and /docs/introduction and record each status', "on each page, count 'table' elements whose cells contain all 3 literals 'transport', 'streaming client' and 'tool executor'", 'on / and /docs/introduction, count \'a[href^="/docs/owns-vs-does-not-own"]\'']
          MUST_OBSERVE: ["all 3 pages return HTTP 200, and exactly 1 of them has a 'table' containing all 3 literals 'transport', 'streaming client', 'tool executor': '/docs/owns-vs-does-not-own'", '\'/\' and \'/docs/introduction\' each hold >= 1 \'a[href^="/docs/owns-vs-does-not-own"]\'']
          MUST_NOT_OBSERVE: ["a table on '/' or '/docs/introduction' containing 'streaming client' and 'tool executor'", "0 teaser links to '/docs/owns-vs-does-not-own' on '/' or '/docs/introduction'"]

### AC-5: example-app-link
  GIVEN: GBC-003 has closed and its boundary-tables spec passes. This is a late task: that spec already observes this claim, and this task must not break it. The ordered docs build, with this task's Prose table styling, is served by the Playwright-owned astro preview
  WHEN:  a visitor follows the example-app anchor on the boundary page
  THEN:  the example-app link resolves non-404
  FLOW_REF: FLOW-DOCS-04-boundary-ownership-tables
  TEST_TIER: e2e
  VERIFICATION_SERVICE: Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
  TEST_FUNCTION: FLOW-DOCS-04-boundary-ownership-tables
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ["the example-app anchor is removed, or its href is a static placeholder '#'", 'the href targets a path absent from the repository (404)']
        EVIDENCE: file_artifact
        - START_REF: boundary_page_built
          ACTION: ['open http://localhost:4321/docs/owns-vs-does-not-own', "find the 'a' whose href contains 'apps/example'", 'request that href, following redirects, and record the final status']
          MUST_OBSERVE: [">= 1 'a' on /docs/owns-vs-does-not-own whose href contains 'apps/example'", 'the final HTTP status of that href is not 404']
          MUST_NOT_OBSERVE: ["0 anchors whose href contains 'apps/example'", "a placeholder href '#'", 'a final HTTP status of 404']

### AC-6: scannable-table-styling-source-contract
  GIVEN: Prose.astro is modified by this task in the real working tree. Its table rules land after GBC-009's porting spec, so no flow spec this task may edit can observe them
  WHEN:  the vitest source-contract test reads Prose.astro
  THEN:  the Prose table rules mirror DataTable's language through tokens only: display:block plus overflow-x:auto on the table, var(--muted) zebra on even rows, var(--border) row dividers, overflow-wrap:anywhere cells with a first-column max-width under 48rem, and a comment naming DataTable.astro as the lockstep twin, with no pinned column, no script and no color literal
  TEST_TIER: unit
  VERIFICATION_SERVICE: Real filesystem read of apps/docs/src/components/Prose.astro by vitest (no build, no server)
  UNIT_TEST_JUSTIFIED: Pure source-contract scan that only reads Prose.astro from the real working tree (no runtime, no service); the rendered table claims ride the FLOW-DOCS-04 and FLOW-DOCS-05 specs, which this late task may not edit.
  TEST_FILE: tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts
  TEST_FUNCTION: GBC-017-prose-table-source-contract
  VERIFY: pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts -t GBC-017-prose-table-source-contract
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['Prose.astro has no table rules, so tables fall back to the static UA defaults', 'colors are hardcoded as hex or oklch literals instead of var(--*) tokens', 'the var(--muted) zebra or the var(--border) divider rule is removed']
        EVIDENCE: stdout
        - START_REF: prose_source
          ACTION: ['read apps/docs/src/components/Prose.astro from the real working tree', "match the <style> block's table selectors and declarations"]
          MUST_OBSERVE: ["a rule targeting '.prose' 'table' declares 'display: block' and 'overflow-x: auto'", "a rule targeting 'tbody tr:nth-child(even)' cells declares 'background: var(--muted)'", "a rule targeting 'th' and 'td' declares 'border-top: 1px solid var(--border)', and a 'td' rule declares 'overflow-wrap: anywhere'", "a '@media (max-width: 48rem)' block sets 'max-width' on ':first-child' cells", "a comment in the <style> block names 'DataTable.astro' as the twin kept in lockstep"]
          MUST_NOT_OBSERVE: ["a hex literal matching '#[0-9a-fA-F]{3,8}' in Prose.astro", "a raw 'rgb(', 'hsl(' or 'oklch(' color function in Prose.astro", "a '<script' tag (0 allowed)", "a ':first-child' cell rule with 'position: sticky' and 'left: 0' (the cut pinned column)", "a 'thead th' rule declaring 'position: sticky' (the header is not sticky; see critical constraints)", '0 table rules (tables left to UA defaults)']

## Test Criteria
- TC-1: /docs/owns-vs-does-not-own has >= 2 '.prose table' elements and each of 'transport', 'streaming client', 'tool executor', 'useChat' sits in >= 1 visible td/th  (maps_to: AC-1)
- TC-2: /porting returns 200 and /docs/porting 404, with 1 Deviation-column table of >= 5 rows, >= 1 not-ported item and both prior-art links  (maps_to: AC-2)
- TC-3: the boundary page has 1 gaps heading followed by >= 1 item, and 'react-native-reusables' in >= 1 table cell  (maps_to: AC-3)
- TC-4: of /docs/owns-vs-does-not-own, / and /docs/introduction, only /docs/owns-vs-does-not-own holds a table containing 'transport', 'streaming client' and 'tool executor', and / plus /docs/introduction each link to it  (maps_to: AC-4)
- TC-5: the 'apps/example' link on the boundary page ends with a final status other than 404  (maps_to: AC-5)
- TC-6: Prose.astro declares the block/scroll table, the var(--muted) zebra, the var(--border) dividers and the wrapping cells through tokens only, with 0 script tags, 0 color literals, no sticky thead and no pinned column  (maps_to: AC-6)

## Reading List
- apps/docs/src/components/DataTable.astro
- apps/docs/src/components/Callout.astro
- apps/docs/src/components/Prose.astro
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/src/components/Prose.astro (MODIFY)
- tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts (NEW)
- tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts
- tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts
WRITE-PROHIBITED:
- apps/docs/src/pages/**
- apps/docs/src/content/**
- apps/docs/src/data/**

## Design
References: ['.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md']
Interaction notes: Tables scroll horizontally below 48rem with pinned first column; sticky thead; example-app cross-link is an info Callout. Zero JS.
Pattern: Scannable markdown tables styled to DataTable's language; claims live in td/th, never prose. (DataTable.astro (zebra/sticky/pin), Callout.astro (info aside))
Anti-pattern: Do not render boundary claims as prose; do not author table content; do not duplicate boundary tables on /porting.

## Verification Gates
- pnpm exec tsc --noEmit
- pnpm exec biome ci .
- pnpm --filter @rnr-ai-elements/docs build
- pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts -t GBC-017-prose-table-source-contract
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art

## Dependencies
Depends on: ['GBC-003', 'GBC-004', 'GBC-009']
Blocks:     none

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "GBC-017",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "boundary_page_built": {
      "description": "GBC-003's owns-vs-does-not-own.mdx (GFM ownership tables, a gaps list, the example-app link) plus the home and Introduction teasers, built by the ordered docs build with this task's Prose.astro table styling and served by the Playwright-owned astro preview at http://localhost:4321. GBC-003 has closed, so its boundary-tables spec exists and passes.",
      "seed_method": "cli",
      "records": [
        "`pnpm --filter @rnr-ai-elements/docs build` exits 0",
        "apps/docs/dist/docs/owns-vs-does-not-own/index.html, apps/docs/dist/index.html and apps/docs/dist/docs/introduction/index.html exist",
        "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts exists (written by GBC-003)"
      ]
    },
    "porting_page_built": {
      "description": "GBC-004's porting.md (a mapping table with a Deviation column, a not-ported list, prior-art credits), routed to /porting by GBC-009, built with this task's Prose.astro table styling and served by the Playwright-owned astro preview at http://localhost:4321. GBC-009 has closed, so its porting-map spec exists and passes.",
      "seed_method": "cli",
      "records": [
        "apps/docs/dist/porting/index.html exists",
        "apps/docs/dist/docs/porting/index.html does not exist",
        "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts exists (written by GBC-009)"
      ]
    },
    "prose_source": {
      "description": "Prose.astro as modified by this task, read from the real working tree by vitest. RED at task start: Prose.astro has no table rules.",
      "seed_method": "cli",
      "records": [
        "apps/docs/src/components/Prose.astro exists",
        "`pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts -t GBC-017-prose-table-source-contract` reads it"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GBC-003 has closed and its boundary-tables spec passes. This is a late task: that spec already observes this claim, and this task must not break it. The ordered docs build, with this task's Prose table styling, is served by the Playwright-owned astro preview WHEN a visitor opens /docs/owns-vs-does-not-own THEN the page renders >=2 tables and each boundary claim string ('transport', 'streaming client', 'tool executor', 'useChat') sits inside a td/th, never only in a prose paragraph",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the boundary page reverts to static prose paragraphs with 0 tables",
            "the Prose table styling hides cells (display: none), or 'useChat' is omitted from every table cell"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-04-boundary-ownership-tables/run.json"
        },
        "cases": [
          {
            "start_ref": "boundary_page_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "GET http://localhost:4321/docs/owns-vs-does-not-own and record the status",
                "count '.prose table' elements and, for each of the 4 claim literals, the visible 'td, th' cells whose text contains it"
              ]
            },
            "end_state": {
              "must_observe": [
                "GET /docs/owns-vs-does-not-own returns HTTP 200",
                ">= 2 'table' elements inside '.prose'",
                "each of the 4 literals 'transport', 'streaming client', 'tool executor', 'useChat' is contained in >= 1 'td' or 'th' with a boundingBox height > 0"
              ],
              "must_not_observe": [
                "0 or 1 'table' elements on the page",
                "'useChat' present in 0 'td'/'th' cells (only in a '<p>')"
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
      "description": "GIVEN GBC-009 has closed and its porting-map spec passes. This is a late task: that spec already observes this claim, including GBC-004's rendered mapping table, and this task must not break it WHEN a visitor opens /porting THEN a mapping table with a 'Deviation' column and >=5 rows renders, alongside a not-ported list with >=1 entry and links to both prior-art projects, elements.ai-sdk.dev and muratcakmak/expo-ai-elements",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the Deviation column is omitted, or the mapping table is replaced by static prose",
            "the not-ported list is empty",
            "a prior-art link is removed"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-05-porting-map-and-prior-art/run.json"
        },
        "cases": [
          {
            "start_ref": "porting_page_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "GET http://localhost:4321/porting and http://localhost:4321/docs/porting and record both statuses",
                "find the '.prose table' whose 'thead th' texts match /deviation/i and count its 'tbody tr'",
                "count the items under the heading matching /not ported/i and the prior-art 'a' hrefs"
              ]
            },
            "end_state": {
              "must_observe": [
                "GET /porting returns HTTP 200 and GET /docs/porting returns HTTP 404",
                "exactly 1 '.prose table' has a 'thead th' whose text matches /deviation/i, and it holds >= 5 'tbody tr' rows",
                "the list or table after the heading matching /not ported/i holds >= 1 'li' or 'tbody tr' item",
                ">= 1 'a' with an href containing 'elements.ai-sdk.dev' and >= 1 'a' with an href containing 'muratcakmak/expo-ai-elements'"
              ],
              "must_not_observe": [
                "a mapping table with 0 'Deviation' header cells",
                "fewer than 5 mapping rows (0 to 4)",
                "an empty not-ported list (0 items)",
                "0 prior-art links"
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
      "description": "GIVEN GBC-003 has closed and its boundary-tables spec passes. This is a late task: that spec already observes this claim, and this task must not break it. The ordered docs build, with this task's Prose table styling, is served by the Playwright-owned astro preview WHEN the boundary page is inspected THEN a gaps section lists >=1 honest gap, and the ownership split names 'react-native-reusables' inside a table cell",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the gaps section is omitted or rendered empty",
            "'react-native-reusables' is removed from the ownership-split table"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-04-boundary-ownership-tables/run.json"
        },
        "cases": [
          {
            "start_ref": "boundary_page_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "open http://localhost:4321/docs/owns-vs-does-not-own",
                "locate the heading whose text matches /gaps/i and count the 'li' or 'tbody tr' items in the list or table after it",
                "search the 'td, th' cells for 'react-native-reusables'"
              ]
            },
            "end_state": {
              "must_observe": [
                "exactly 1 heading whose text matches /gaps/i, followed by a list or table holding >= 1 'li' or 'tbody tr' item",
                "'react-native-reusables' is contained in >= 1 'td' or 'th'"
              ],
              "must_not_observe": [
                "a gaps section with 0 items (empty)",
                "'react-native-reusables' in 0 table cells"
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
      "description": "GIVEN GBC-003 has closed and its boundary-tables spec passes. This is a late task: that spec already observes this claim, and this task must not break it. The ordered docs build, with this task's Prose table styling, is served by the Playwright-owned astro preview WHEN a visitor reads /docs/owns-vs-does-not-own, / and /docs/introduction THEN the boundary tables render only on /docs/owns-vs-does-not-own, and home and Introduction carry one-line teasers plus links to it",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the boundary tables are duplicated as a hardcoded copy onto home or Introduction",
            "the teaser links to the boundary page are removed from home or Introduction"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-04-boundary-ownership-tables/run.json"
        },
        "cases": [
          {
            "start_ref": "boundary_page_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "GET /docs/owns-vs-does-not-own, / and /docs/introduction and record each status",
                "on each page, count 'table' elements whose cells contain all 3 literals 'transport', 'streaming client' and 'tool executor'",
                "on / and /docs/introduction, count 'a[href^=\"/docs/owns-vs-does-not-own\"]'"
              ]
            },
            "end_state": {
              "must_observe": [
                "all 3 pages return HTTP 200, and exactly 1 of them has a 'table' containing all 3 literals 'transport', 'streaming client', 'tool executor': '/docs/owns-vs-does-not-own'",
                "'/' and '/docs/introduction' each hold >= 1 'a[href^=\"/docs/owns-vs-does-not-own\"]'"
              ],
              "must_not_observe": [
                "a table on '/' or '/docs/introduction' containing 'streaming client' and 'tool executor'",
                "0 teaser links to '/docs/owns-vs-does-not-own' on '/' or '/docs/introduction'"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN GBC-003 has closed and its boundary-tables spec passes. This is a late task: that spec already observes this claim, and this task must not break it. The ordered docs build, with this task's Prose table styling, is served by the Playwright-owned astro preview WHEN a visitor follows the example-app anchor on the boundary page THEN the example-app link resolves non-404",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "the example-app anchor is removed, or its href is a static placeholder '#'",
            "the href targets a path absent from the repository (404)"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-04-boundary-ownership-tables/run.json"
        },
        "cases": [
          {
            "start_ref": "boundary_page_built",
            "action": {
              "actor": "e2e_runner",
              "steps": [
                "open http://localhost:4321/docs/owns-vs-does-not-own",
                "find the 'a' whose href contains 'apps/example'",
                "request that href, following redirects, and record the final status"
              ]
            },
            "end_state": {
              "must_observe": [
                ">= 1 'a' on /docs/owns-vs-does-not-own whose href contains 'apps/example'",
                "the final HTTP status of that href is not 404"
              ],
              "must_not_observe": [
                "0 anchors whose href contains 'apps/example'",
                "a placeholder href '#'",
                "a final HTTP status of 404"
              ]
            }
          }
        ],
        "primary": false
      }
    },
    {
      "id": "AC-6",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN Prose.astro is modified by this task in the real working tree. Its table rules land after GBC-009's porting spec, so no flow spec this task may edit can observe them WHEN the vitest source-contract test reads Prose.astro THEN the Prose table rules mirror DataTable's language through tokens only: display:block plus overflow-x:auto on the table, var(--muted) zebra on even rows, var(--border) row dividers, overflow-wrap:anywhere cells with a first-column max-width under 48rem, and a comment naming DataTable.astro as the lockstep twin, with no pinned column, no script and no color literal",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts",
      "test_function": "GBC-017-prose-table-source-contract",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts -t GBC-017-prose-table-source-contract",
      "test_tier": "unit",
      "verification_service": "Real filesystem read of apps/docs/src/components/Prose.astro by vitest (no build, no server)",
      "surface_policy": null,
      "unit_test_justified": "Pure source-contract scan that only reads Prose.astro from the real working tree (no runtime, no service); the rendered table claims ride the FLOW-DOCS-04 and FLOW-DOCS-05 specs, which this late task may not edit.",
      "maps_to_ac": null,
      "scenario": {
        "tier": "visible",
        "test_tier": "unit",
        "unit_test_justified": "Pure source-contract scan that only reads Prose.astro from the real working tree (no runtime, no service); the rendered table claims ride the FLOW-DOCS-04 and FLOW-DOCS-05 specs, which this late task may not edit.",
        "verification_service": "Real filesystem read of apps/docs/src/components/Prose.astro by vitest (no build, no server)",
        "topology": "single-node",
        "negative_control": {
          "would_fail_if": [
            "Prose.astro has no table rules, so tables fall back to the static UA defaults",
            "colors are hardcoded as hex or oklch literals instead of var(--*) tokens",
            "the var(--muted) zebra or the var(--border) divider rule is removed"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "prose_source",
            "action": {
              "actor": "test_runner",
              "steps": [
                "read apps/docs/src/components/Prose.astro from the real working tree",
                "match the <style> block's table selectors and declarations"
              ]
            },
            "end_state": {
              "must_observe": [
                "a rule targeting '.prose' 'table' declares 'display: block' and 'overflow-x: auto'",
                "a rule targeting 'tbody tr:nth-child(even)' cells declares 'background: var(--muted)'",
                "a rule targeting 'th' and 'td' declares 'border-top: 1px solid var(--border)', and a 'td' rule declares 'overflow-wrap: anywhere'",
                "a '@media (max-width: 48rem)' block sets 'max-width' on ':first-child' cells",
                "a comment in the <style> block names 'DataTable.astro' as the twin kept in lockstep"
              ],
              "must_not_observe": [
                "a hex literal matching '#[0-9a-fA-F]{3,8}' in Prose.astro",
                "a raw 'rgb(', 'hsl(' or 'oklch(' color function in Prose.astro",
                "a '<script' tag (0 allowed)",
                "a ':first-child' cell rule with 'position: sticky' and 'left: 0' (the cut pinned column)",
                "a 'thead th' rule declaring 'position: sticky' (the header is not sticky; see critical constraints)",
                "0 table rules (tables left to UA defaults)"
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
      "description": "/docs/owns-vs-does-not-own has >= 2 '.prose table' elements and each of 'transport', 'streaming client', 'tool executor', 'useChat' sits in >= 1 visible td/th",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "primary": false,
      "description": "/porting returns 200 and /docs/porting 404, with 1 Deviation-column table of >= 5 rows, >= 1 not-ported item and both prior-art links",
      "flow_ref": "FLOW-DOCS-05-porting-map-and-prior-art",
      "test_file": "tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts",
      "test_function": "FLOW-DOCS-05-porting-map-and-prior-art",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "primary": false,
      "description": "the boundary page has 1 gaps heading followed by >= 1 item, and 'react-native-reusables' in >= 1 table cell",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "primary": false,
      "description": "of /docs/owns-vs-does-not-own, / and /docs/introduction, only /docs/owns-vs-does-not-own holds a table containing 'transport', 'streaming client' and 'tool executor', and / plus /docs/introduction each link to it",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_criterion",
      "primary": false,
      "description": "the 'apps/example' link on the boundary page ends with a final status other than 404",
      "flow_ref": "FLOW-DOCS-04-boundary-ownership-tables",
      "test_file": "tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts",
      "test_function": "FLOW-DOCS-04-boundary-ownership-tables",
      "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts --grep FLOW-DOCS-04-boundary-ownership-tables",
      "test_tier": "e2e",
      "verification_service": "Real ordered docs build of the candidate served by the Playwright-owned astro preview at http://localhost:4321, driven by Playwright Chromium (chromium-desktop, chromium-mobile and chromium-nojs projects)",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": "AC-5"
    },
    {
      "id": "TC-6",
      "type": "test_criterion",
      "primary": false,
      "description": "Prose.astro declares the block/scroll table, the var(--muted) zebra, the var(--border) dividers and the wrapping cells through tokens only, with 0 script tags, 0 color literals, no sticky thead and no pinned column",
      "flow_ref": null,
      "test_file": "tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts",
      "test_function": "GBC-017-prose-table-source-contract",
      "verify": "pnpm exec vitest run tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts -t GBC-017-prose-table-source-contract",
      "test_tier": "unit",
      "verification_service": "Real filesystem read of apps/docs/src/components/Prose.astro by vitest (no build, no server)",
      "surface_policy": null,
      "maps_to_ac": "AC-6"
    }
  ]
}
-->

## Handoff

```json
{
  "task": "GBC-017",
  "commit_sha": "199bcb514699ada8bd4f923e57518f942b484a28",
  "done": "Prose.astro at apps/docs/src/components/Prose.astro:103-148 now carries the markdown-table chrome declared a known twin of DataTable.astro (block/scroll table, var(--muted) zebra at :138, var(--border) dividers, muted caption, overflow-wrap:anywhere td, 48rem first-column cap at :143), with the new AC-6 source-contract test at tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts, RED-then-GREEN evidence plus Chromium computed-style metrics and desktop/mobile screenshots under .tmp/GBC-017/cycle-1/, and both late-bound flows left green over the real ordered build (FLOW-DOCS-04: 15 passed, FLOW-DOCS-05: 18 passed).",
  "deviations": [
    "The MUST 'render th with scope=\"col\" on every Prose table plus a muted caption' was resolved CSS-only (caption styled at apps/docs/src/components/Prose.astro:124-128, floor declared content's at :115-116) because GFM pipe tables emit no scope/caption attributes, content is WRITE-PROHIBITED, and wrappers/rehype plugins are forbidden by the STRICTLY lines.",
    "DataTable's background:var(--card) cell base was deliberately omitted \u2014 it exists only to give DataTable's pinned column an opaque cover, and the pin is cut for these tables (documented in the twin comment at apps/docs/src/components/Prose.astro:113-115).",
    "The first-column cap value 10rem at apps/docs/src/components/Prose.astro:146 was my choice \u2014 the contract pinned the media query and property but not the value; 10rem keeps label columns intact while wrapped deviation cells hold a scannable band (verified no horizontal overflow at 390px)."
  ],
  "concerns": [
    "The stated accessibility floor is not actually rendered anywhere yet: no table on /docs/owns-vs-does-not-own or /porting carries th[scope] or a caption today, because GFM cannot emit them \u2014 the styling is ready but the floor waits on content authoring or a sanctioned transform.",
    "The horizontal scroller is currently a latent affordance, not an active behavior: with overflow-wrap:anywhere, every table on both pages fits at 390px (measured horizontalOverflow:false), so overflow-x:auto only becomes live if future content adds an unbreakable column (mono keys, URLs).",
    "Every re-run of the FLOW-DOCS-04/FLOW-DOCS-05 gates rewrites the tracked evidence run.json files (both were left dirty in the GBC-017 worktree and excluded from the commit per scope rules), so verification runs inherently dirty the tree."
  ],
  "findings": [
    "The Astro/lightningcss build rewrites source CSS literals in dist \u2014 :nth-child(even) becomes :nth-child(2n) and @media (max-width: 48rem) becomes @media (width<=48rem) in apps/docs/dist/_astro/docs-navigation.JoNiSX2d.css \u2014 so any future assertion must match the minified forms or read source, never grep dist for the authored strings.",
    "Prose.astro's compiled styles do not land in a Prose-named or inlined file: they share the docs-navigation.<hash>.css chunk, which made them look missing until located \u2014 do not hunt for a Prose.css in dist.",
    "The house first-match ruleFor regex pattern has a shadowing trap: a query for '.prose :global(td)' first-matches the combined th/td rule's second selector line, not the standalone td rule, so the AC-6 test uses matchAll at tests/sprint-06-guides-boundary-changelog/prose-table-source.test.ts:96-103 \u2014 future contract tests hitting multi-selector rules need the same treatment.",
    "biome ci . exits 0 while printing 15 informational diagnostics that exist identically on trunk (useLiteralKeys at scripts/docs-data/authored-snippets.ts:900:14 and in tests/sprint-05-orient-search/{authored-snippet-gate,live-example-proof,rnw-pin-proof}.test.ts, useTemplate in the first) \u2014 proven by a stash-rerun; treat them as noise, not failures."
  ],
  "scope_impact": [
    {
      "target": "GBC-017",
      "found": "The task's own MUST requiring th scope=\"col\" plus a muted caption on every Prose table is unimplementable from its write-allowed surface (one CSS file, content prohibited, no wrapper or rehype plugin).",
      "change": "Strike the scope/caption half of that MUST or re-route it: either a techwriting task authors raw-HTML tables with scope/caption in the .mdx sources, or the plan sanctions a remark/rehype transform \u2014 the CSS side (muted caption) is already landed and waiting."
    },
    {
      "target": "ROADMAP",
      "found": "No markdown table on the site emits th[scope] or caption, so the docs site's table accessibility floor is open despite the chrome being in place at apps/docs/src/components/Prose.astro:124-128.",
      "change": "If the floor is meant to be real rather than aspirational, add a small follow-up task owning the content-side or transform-side fix; an accessibility audit against WCAG 1.3.1 would currently flag every prose table."
    },
    {
      "target": "GATE:FLOW-DOCS-04",
      "found": "The gate's run.json artifact under tests/sprint-06-guides-boundary-changelog/evidence/ is tracked but stamped with a fresh runIdentity on every run, so any verifier re-run dirties the tree.",
      "change": "Either move the volatile per-run fields out of the tracked file or make regenerating-and-committing the evidence an explicit step of the gate, so post-merge verification runs don't leave unexplained dirt."
    }
  ],
  "feedback": [
    "STRICTLY line 36's sticky-thead supersession was correct in real behavior, not just on paper: display:block plus overflow-x:auto really does make each table its own scroll container, and the landed chrome renders full-measure tables with no overflow on current content \u2014 keep that supersede-with-reasoning pattern for contract contradictions.",
    "Binding a late presentation task's ACs to specs owned by earlier tasks (write-allowed but never-edit) worked exactly as intended here: the styling change was forced to prove it broke nothing, and the one new proof that only source could observe landed as a justified unit-tier contract test."
  ]
}
```
