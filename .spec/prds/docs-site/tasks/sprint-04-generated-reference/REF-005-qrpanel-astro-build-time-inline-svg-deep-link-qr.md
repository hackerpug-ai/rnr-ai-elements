<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-005: QrPanel.astro — build-time inline SVG deep-link QR

> Status: ⬜ Pending
> Assignee: frontend-designer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 2 · Type: FEATURE · Wave: A
> Proposed By: frontend-designer · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Author QrPanel.astro — the zero-JS R6b/R12 QR aside rendering REF-008's build-time inline SVG prop with an item-derived accessible name, as its own region outside any preview panel.

## Why
QrPanel.astro exists, token-governed and script-free; qr-panel-contract.test.ts passes green (RED first: file absent); REF-008 feeds it SVGs without touching this file; REF-001's qr-panel.spec.ts and gate step 10 prove decodability over REF-009's assembly.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-source-contract

## Scope
apps/docs/src/components/QrPanel.astro (NEW); tests/sprint-04-generated-reference/qr-panel-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-005 — required reading for implementer + reviewer)</summary>

TASK: REF-005 — QrPanel.astro — build-time inline SVG deep-link QR
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 2
AGENT: implementer=frontend-designer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: The svg prop renders through exactly 1 set:html binding on the QR container — the module's only raw-HTML entry point, fed only by the prebuild string
- MUST: The QR element carries role=img with aria-label `Open the ${item} gallery screen in Expo Go` — the name derives from the item prop
- MUST: The component root is its own <aside data-qr-panel> — mounted outside any preview panel (C4 null-imagery variant keeps the QR)
- MUST: The source documents the qrDeepLink base ('ai-elements-example' + '/' + item name) and its sprint-09 dead-end
- NEVER: Never encode inside the component — 0 qrcode imports, 0 SVG-path generation, 0 transformation calls on the svg prop
- NEVER: Never fabricate a QR — 0 hardcoded module paths, 0 <img> placeholders
- NEVER: Never add JavaScript or a new island — 0 <script>, 0 customElements.define
- NEVER: Never emit raw color literals — exactly 3 token references style the surface
- STRICTLY: Strictly SCOPE write_allowed paths — apps/docs/src/pages/ (REF-009), scripts/docs-data/ (REF-008), and apps/docs/src/components/islands/ are write-prohibited

### DONE WHEN

- [ ] AC 1: QrPanel source contract — prop-fed inline SVG with an item-derived accessible name
- [ ] AC 2: Read-only SVG dependency — zero encoding, documented scheme base
- [ ] AC 3: Own aside outside any preview panel — counted token surface, zero focusables
- [ ] AC 4: No fabricated QR — positive accessible-name literal plus zero placeholders
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: QrPanel source contract — prop-fed inline SVG with an item-derived accessible name**

  GIVEN/WHEN/THEN: GIVEN the repo where REF-008's prebuild will supply item.qrDeepLink and its encoded SVG as props, and (RED at start) no QrPanel.astro WHEN the test reads apps/docs/src/components/QrPanel.astro from the real working tree and scans its structure THEN it declares 1 {item: string; svg: string} props interface (both required, 0 defaults), renders exactly 1 <aside data-qr-panel> root and 0 nested section/article roots, carries exactly 1 role="img" element whose aria-label composes 'Open the ' + item + ' gallery screen in Expo Go', and injects the SVG through exactly 1 set:html={svg} binding — the module's only raw-HTML entry point

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/qr-panel-contract.test.ts · TEST_FUNCTION: REF-005-qr-panel-source-contract
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-source-contract`
  VERIFICATION_SERVICE: real filesystem read of the authored QrPanel.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only; decodable-content proof rides REF-001's qr-panel.spec.ts lane, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_qr_panel → MUST_OBSERVE [1 {item: string; svg: string} props interface — both required, 0 defaults; exactly 1 <aside data-qr-panel> root and 0 nested section/article roots; exactly 1 role="img" element with aria-label={`Open the ${item} gallery screen in Expo Go`}; exactly 1 set:html={svg} binding — the module's only raw-HTML entry point] / MUST_NOT_OBSERVE [0 <script> tags and 0 customElements.define calls; 0 hex color literals matching #[0-9a-fA-F]{3,8} in the component styles; 0 <img> or picture placeholders substituting for the inline SVG]
    - NEGATIVE_CONTROL: would fail if ['the component encodes or rewrites the SVG itself — the single set:html assert fails or extra raw-HTML entry points appear', 'the accessible name is a fixed string instead of the item-derived formula — the aria-label assert fails and screen readers announce the wrong item', 'the QR is wrapped in an <img> or placeholder box — the role=img + inline-SVG structure assert fails']

**AC-2: Read-only SVG dependency — zero encoding, documented scheme base**

  GIVEN/WHEN/THEN: GIVEN the division where REF-008's prebuild owns encoding (qrcode devDep over item.qrDeepLink) and (RED at start) no QrPanel.astro WHEN the test reads QrPanel.astro and scans its imports and the svg prop's usage THEN the module imports 0 encoding libraries (0 qrcode imports), applies 0 transformation calls to the svg prop (0 .trim( / .replace( / .slice(), and its source contains exactly 1 comment naming 'ai-elements-example' + '/' + item name and the sprint-09 dead-end

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/qr-panel-contract.test.ts · TEST_FUNCTION: REF-005-qr-panel-readonly-svg-prop
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-readonly-svg-prop`
  VERIFICATION_SERVICE: real filesystem read of the authored QrPanel.astro source + real apps/example/app.json import under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan plus a real app.json import to pin the scheme literal — real file reads only, no rendering, no network, no DB.
  SCENARIO:
    - START_REF real_example_scheme → MUST_OBSERVE [0 imports resolving to qrcode or any encoding/crypto module; 0 .trim( / .replace( / .slice( calls applied to the svg prop; exactly 1 source comment naming 'ai-elements-example' + '/' + item name and the sprint-09 dead-end, matching the real app.json expo.scheme === 'ai-elements-example'] / MUST_NOT_OBSERVE [0 divergent scheme literals between the comment and app.json]
    - NEGATIVE_CONTROL: would fail if ['the component pulls the qrcode devDep itself — the 0-encoding-import assert fails and the REF-008 single-owner contract splits', 'the svg prop is trimmed or rewritten — the 0-transformation assert fails and byte drift enters between prebuild output and served markup', 'the scheme base is undocumented — the 1-comment assert fails and the sprint-09 dead-end is undiscoverable']

**AC-3: Own aside outside any preview panel — counted token surface, zero focusables**

  GIVEN/WHEN/THEN: GIVEN the C4 null-imagery discipline where the R6 preview panel is omitted entirely until the capture sprint and (RED at start) no QrPanel.astro WHEN the test reads QrPanel.astro and scans its template and scoped styles THEN the component renders exactly 1 <aside data-qr-panel> root and 0 nested section/article roots, contains 0 preview/matrix/imagery markup, styles its surface through exactly 3 token references (var(--card), var(--border), one var(--radius-*)), and exposes 0 focusable elements — the QR is a non-interactive image this sprint

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/qr-panel-contract.test.ts · TEST_FUNCTION: REF-005-qr-panel-own-aside
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-own-aside`
  VERIFICATION_SERVICE: real filesystem read of the authored QrPanel.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only; the rendered standalone-aside proof is gate step 10 over REF-009's assembly.
  SCENARIO:
    - START_REF authored_qr_panel → MUST_OBSERVE [exactly 1 <aside data-qr-panel> root and 0 nested section/article roots; 3 token references: var(--card), var(--border), one var(--radius-*), 0 hex] / MUST_NOT_OBSERVE [0 preview/matrix/tab markup inside the component; 0 <a> wrappers or button elements (the deep link is inert until sprint-09)]
    - NEGATIVE_CONTROL: would fail if ['the aside is nested inside preview/tab markup — the 1-root/0-nested-roots assert fails and the null-imagery variant would lose the QR', 'a fourth token or a raw color styles the surface — the exactly-3-token-references assert fails', 'the QR is wrapped in an anchor — the 0-focusable assert fails and a dead-end link ships']

**AC-4: No fabricated QR — positive accessible-name literal plus zero placeholders**

  GIVEN/WHEN/THEN: GIVEN the build-time-only data discipline (never a placeholder or stale asset) and (RED at start) no QrPanel.astro WHEN the test reads QrPanel.astro and scans for fallback content and the accessible-name template THEN 1 aria-label renders 'Open the conversation gallery screen in Expo Go' for item=conversation via the 'Open the ' + item + ' gallery screen in Expo Go' template, and the component contains 0 hardcoded QR module paths, 0 authored inline <svg>/<path> markup, and 0 conditional substitution branches

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/qr-panel-contract.test.ts · TEST_FUNCTION: REF-005-qr-panel-no-fabrication
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-no-fabrication`
  VERIFICATION_SERVICE: real filesystem read of the authored QrPanel.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only; the positive literal proves the name formula and the 0-counts prove no fabrication.
  SCENARIO:
    - START_REF authored_qr_panel → MUST_OBSERVE [1 aria-label rendering 'Open the conversation gallery screen in Expo Go' for item=conversation (the positive literal proving the template)] / MUST_NOT_OBSERVE [0 hardcoded QR module/path strings and 0 authored inline <svg>/<path> markup (the SVG arrives only via the prop); 0 conditional substitution branches replacing an absent svg with authored content; 0 references to committed static QR assets under public/]
    - NEGATIVE_CONTROL: would fail if ['a canned placeholder QR renders when the prop is missing — the 0-placeholder asserts fail (fabricated content)', 'a conditional branch substitutes authored SVG — the 0-substitution assert fails', "the name formula drifts from the exact string — the item=conversation literal assert fails and R6b's accessible-name contract breaks"]

### TEST CRITERIA

- **TC-1** (→AC-1): QrPanel.astro declares 1 required {item, svg} props interface with 0 defaults and renders exactly 1 <aside data-qr-panel> root with 0 nested section/article roots. — `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-source-contract`
- **TC-2** (→AC-1): Exactly 1 role=img element carries the aria-label formula 'Open the ' + item + ' gallery screen in Expo Go', and exactly 1 set:html={svg} binding is the module's only raw-HTML entry point. — `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-source-contract`
- **TC-3** (→AC-2): The module imports 0 encoding libraries, applies 0 transformations to the svg prop, and carries exactly 1 comment naming 'ai-elements-example' + '/' + item name with the sprint-09 dead-end. — `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-readonly-svg-prop`
- **TC-4** (→AC-2): The documented scheme literal matches the real apps/example/app.json expo.scheme ('ai-elements-example'). — `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-readonly-svg-prop`
- **TC-5** (→AC-3): The component renders exactly 1 aside root with 0 preview/matrix/tab markup inside, a surface of exactly 3 token references (var(--card), var(--border), one var(--radius-*)), and 0 hex. — `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-own-aside`
- **TC-6** (→AC-3): The component exposes 0 focusable elements (no <a> wrapper, no button) and declares 0 <script> tags. — `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-own-aside`
- **TC-7** (→AC-4): 1 aria-label renders 'Open the conversation gallery screen in Expo Go' for item=conversation — the positive literal proving the name template. — `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-no-fabrication`
- **TC-8** (→AC-4): The component contains 0 hardcoded QR paths, 0 authored inline <svg>/<path> markup, 0 static QR asset references, and 0 conditional substitution branches. — `pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-no-fabrication`

### READING LIST (max 5)

- apps/docs/src/components/Badge.astro + apps/docs/src/components/Chip.astro [PRIMARY PATTERN] lines all — The zero-JS prop-driven primitive shape QrPanel imitates.
- tests/sprint-02-shell-hero/primitives.test.ts [PRIMARY PATTERN] lines all — The landed vitest source-scan pattern qr-panel-contract.test.ts imitates.
- apps/example/app.json lines all — The real expo.scheme 'ai-elements-example' the source comment names.
- apps/docs/src/pages/components/[item].astro lines all — The future mount site (REF-009) and existing section idioms.
- apps/docs/src/styles/global.css lines all — The token vocabulary (--card, --border, --radius-*) for the counted 3-reference surface.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/components/QrPanel.astro (NEW)
- tests/sprint-04-generated-reference/qr-panel-contract.test.ts (NEW)
writeProhibited:
- apps/docs/src/pages/
- scripts/docs-data/
- apps/docs/src/components/islands/
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Zero-JS display primitive over a build-time prop — renders what prebuild computed, does none of the computing: one set:html entry point, an item-derived accessible name, its own aside region
- pattern_source: apps/docs/src/components/Badge.astro (single-root prop-driven primitive) + the CopyButton island's server-rendered-children discipline
- anti-pattern: encoding inside the component; a committed static QR asset; a dead-end link before sprint-09; nesting the aside inside preview/tab chrome
- references: ["TR-07 home R12 — 'Gallery QR: QrPanel (docs) — Build-time inline SVG, role=img, accessible name'", "TR-07 component-detail R6b — 'QR deep link: QrPanel (docs) — Inline SVG, accessible name: Open the {item} gallery screen in Expo Go'", 'TR-07 hard UI constraints — build-time-only data (never a placeholder/stale screenshot)']
- notes: ['Mobile: the aside stacks full-width below the code surface at <lg with the SVG capped to its intrinsic module grid — no sizing that would distort decoding', 'Focus-visible: 0 focusable elements — role=img is non-interactive this sprint; when sprint-09 links it, the global 2px var(--ring) contract applies un-suppressed', 'Reduced-motion: static SVG with 0 transitions, so 0 prefers-reduced-motion guards are required']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01']
- provides: ["QrPanel.astro — props {item: string; svg: string}: renders the prebuild-generated inline SVG inside its own <aside data-qr-panel> with role=img and the accessible name 'Open the {item} gallery screen in Expo Go'; zero encoding, zero JS, no new island"]
- consumes: ["REF-008's prebuild output — item.qrDeepLink + the encoded SVG arrive as props (READ-ONLY; this component does no encoding)", "apps/example/app.json expo.scheme 'ai-elements-example' + '/' + item name — the documented qrDeepLink base (dead-ends until sprint-09)", 'SHELL-001 tokens: --card, --border, --radius-*, --muted-foreground']
- boundary_contracts: ["renders a build-time inline SVG passed in as a prop (the SVG itself is generated by REF-008's prebuild via the qrcode devDep — READ-ONLY dependency: item.qrDeepLink + the encoded SVG arrive as props; this component does NO encoding)", "role=img with accessible name 'Open the {item} gallery screen in Expo Go'", 'own aside OUTSIDE any preview panel (C4)', 'zero JS, no new island', 'token-governed', "qrDeepLink base = apps/example/app.json expo.scheme (ai-elements-example) + '/' + item name — dead-ends until sprint-09 (documented)"]

### VERIFICATION GATES

- AC-1..AC-4: pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-source-contract / -t REF-005-qr-panel-readonly-svg-prop / -t REF-005-qr-panel-own-aside / -t REF-005-qr-panel-no-fabrication — each exit 0
- RED-first: the four -t runs FAIL before authoring (QrPanel.astro absent) — record the RED outputs
- Seeded evidence: captured stdout shows the counted anchors (1 aside root with 0 nested roots, 1 set:html, 3 token references, 0 encoding imports, the item=conversation accessible-name literal) — not merely exit 0
- island/pipeline integrity: apps/docs/src/components/islands/ and scripts/docs-data/ show 0 changes in git diff
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/components/QrPanel.astro tests/sprint-04-generated-reference/qr-panel-contract.test.ts — exit 0 (never pnpm lint)
- Browser ride-along (gated on REF-008 + REF-009, NOT this task's write surface): REF-001's qr-panel.spec.ts (T-GEND-017 decodability) + gate step 10
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: [] · Blocks: ['REF-009']

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Scoped styles consuming var(--*) tokens only — 0 hex; SVG geometry comes from the prop, never component CSS
- Zero <script>, zero customElements.define — the five-island budget is untouched
- Biome-clean via ./node_modules/.bin/biome ci <paths> — never pnpm lint (local crash)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-005",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_example_scheme": {
   "description": "The real Expo config imported at run time: apps/example/app.json — the documented qrDeepLink base. Exists at task start.",
   "seed_method": "public_api",
   "records": [
    "expo.scheme = 'ai-elements-example' — the base is scheme + '/' + item name",
    "the deep link dead-ends until sprint-09 ships the gallery screens (documented in the component source)"
   ]
  },
  "authored_qr_panel": {
   "description": "The authored QrPanel.astro read from the real working tree. RED at task start: file absent so every read-based assert fails.",
   "seed_method": "ui_flow",
   "records": [
    "QrPanel.astro exists with {item, svg} props",
    "exactly 1 <aside data-qr-panel> root, 1 role=img element with the accessible-name formula, exactly 1 set:html={svg} binding",
    "0 encoding imports, 0 <script>, 0 hex literals"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "QrPanel source contract — prop-fed inline SVG with an item-derived accessible name",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only; decodable-content proof rides REF-001's qr-panel.spec.ts lane, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored QrPanel.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/qr-panel-contract.test.ts",
   "test_function": "REF-005-qr-panel-source-contract",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-source-contract",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored QrPanel.astro source",
    "negative_control": {
     "would_fail_if": [
      "the component encodes or rewrites the SVG itself — the single set:html assert fails or extra raw-HTML entry points appear",
      "the accessible name is a fixed string instead of the item-derived formula — the aria-label assert fails and screen readers announce the wrong item",
      "the QR is wrapped in an <img> or placeholder box — the role=img + inline-SVG structure assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_qr_panel",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read QrPanel.astro from the real working tree",
        "assert the prop pair, the root counts, the accessible-name formula, and the single set:html entry point"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 {item: string; svg: string} props interface — both required, 0 defaults",
        "exactly 1 <aside data-qr-panel> root and 0 nested section/article roots",
        "exactly 1 role=\"img\" element with aria-label={`Open the ${item} gallery screen in Expo Go`}",
        "exactly 1 set:html={svg} binding — the module's only raw-HTML entry point"
       ],
       "must_not_observe": [
        "0 <script> tags and 0 customElements.define calls",
        "0 hex color literals matching #[0-9a-fA-F]{3,8} in the component styles",
        "0 <img> or picture placeholders substituting for the inline SVG"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the repo where REF-008's prebuild will supply item.qrDeepLink and its encoded SVG as props, and (RED at start) no QrPanel.astro WHEN the test reads apps/docs/src/components/QrPanel.astro from the real working tree and scans its structure THEN it declares 1 {item: string; svg: string} props interface (both required, 0 defaults), renders exactly 1 <aside data-qr-panel> root and 0 nested section/article roots, carries exactly 1 role=\"img\" element whose aria-label composes 'Open the ' + item + ' gallery screen in Expo Go', and injects the SVG through exactly 1 set:html={svg} binding — the module's only raw-HTML entry point",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Read-only SVG dependency — zero encoding, documented scheme base",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan plus a real app.json import to pin the scheme literal — real file reads only, no rendering, no network, no DB.",
   "verification_service": "real filesystem read of the authored QrPanel.astro source + real apps/example/app.json import under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/qr-panel-contract.test.ts",
   "test_function": "REF-005-qr-panel-readonly-svg-prop",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-readonly-svg-prop",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus a real config import — real file reads only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored QrPanel.astro source + real apps/example/app.json import under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the component pulls the qrcode devDep itself — the 0-encoding-import assert fails and the REF-008 single-owner contract splits",
      "the svg prop is trimmed or rewritten — the 0-transformation assert fails and byte drift enters between prebuild output and served markup",
      "the scheme base is undocumented — the 1-comment assert fails and the sprint-09 dead-end is undiscoverable"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_example_scheme",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "import apps/example/app.json and pin expo.scheme",
        "read QrPanel.astro and assert the 0-import/0-transformation contract and the documented base"
       ]
      },
      "end_state": {
       "must_observe": [
        "0 imports resolving to qrcode or any encoding/crypto module",
        "0 .trim( / .replace( / .slice( calls applied to the svg prop",
        "exactly 1 source comment naming 'ai-elements-example' + '/' + item name and the sprint-09 dead-end, matching the real app.json expo.scheme === 'ai-elements-example'"
       ],
       "must_not_observe": [
        "0 divergent scheme literals between the comment and app.json"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the division where REF-008's prebuild owns encoding (qrcode devDep over item.qrDeepLink) and (RED at start) no QrPanel.astro WHEN the test reads QrPanel.astro and scans its imports and the svg prop's usage THEN the module imports 0 encoding libraries (0 qrcode imports), applies 0 transformation calls to the svg prop (0 .trim( / .replace( / .slice(), and its source contains exactly 1 comment naming 'ai-elements-example' + '/' + item name and the sprint-09 dead-end",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "Own aside outside any preview panel — counted token surface, zero focusables",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only; the rendered standalone-aside proof is gate step 10 over REF-009's assembly.",
   "verification_service": "real filesystem read of the authored QrPanel.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/qr-panel-contract.test.ts",
   "test_function": "REF-005-qr-panel-own-aside",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-own-aside",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored QrPanel.astro source",
    "negative_control": {
     "would_fail_if": [
      "the aside is nested inside preview/tab markup — the 1-root/0-nested-roots assert fails and the null-imagery variant would lose the QR",
      "a fourth token or a raw color styles the surface — the exactly-3-token-references assert fails",
      "the QR is wrapped in an anchor — the 0-focusable assert fails and a dead-end link ships"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_qr_panel",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read QrPanel.astro from the real working tree",
        "assert the root counts, the absent preview markup, the counted token surface, and the 0-focusable structure"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 <aside data-qr-panel> root and 0 nested section/article roots",
        "3 token references: var(--card), var(--border), one var(--radius-*), 0 hex"
       ],
       "must_not_observe": [
        "0 preview/matrix/tab markup inside the component",
        "0 <a> wrappers or button elements (the deep link is inert until sprint-09)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the C4 null-imagery discipline where the R6 preview panel is omitted entirely until the capture sprint and (RED at start) no QrPanel.astro WHEN the test reads QrPanel.astro and scans its template and scoped styles THEN the component renders exactly 1 <aside data-qr-panel> root and 0 nested section/article roots, contains 0 preview/matrix/imagery markup, styles its surface through exactly 3 token references (var(--card), var(--border), one var(--radius-*)), and exposes 0 focusable elements — the QR is a non-interactive image this sprint",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "No fabricated QR — positive accessible-name literal plus zero placeholders",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only; the positive literal proves the name formula and the 0-counts prove no fabrication.",
   "verification_service": "real filesystem read of the authored QrPanel.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/qr-panel-contract.test.ts",
   "test_function": "REF-005-qr-panel-no-fabrication",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-no-fabrication",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored QrPanel.astro source",
    "negative_control": {
     "would_fail_if": [
      "a canned placeholder QR renders when the prop is missing — the 0-placeholder asserts fail (fabricated content)",
      "a conditional branch substitutes authored SVG — the 0-substitution assert fails",
      "the name formula drifts from the exact string — the item=conversation literal assert fails and R6b's accessible-name contract breaks"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_qr_panel",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read QrPanel.astro from the real working tree",
        "evaluate the aria-label template for item=conversation and scan for placeholder content"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 aria-label rendering 'Open the conversation gallery screen in Expo Go' for item=conversation (the positive literal proving the template)"
       ],
       "must_not_observe": [
        "0 hardcoded QR module/path strings and 0 authored inline <svg>/<path> markup (the SVG arrives only via the prop)",
        "0 conditional substitution branches replacing an absent svg with authored content",
        "0 references to committed static QR assets under public/"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the build-time-only data discipline (never a placeholder or stale asset) and (RED at start) no QrPanel.astro WHEN the test reads QrPanel.astro and scans for fallback content and the accessible-name template THEN 1 aria-label renders 'Open the conversation gallery screen in Expo Go' for item=conversation via the 'Open the ' + item + ' gallery screen in Expo Go' template, and the component contains 0 hardcoded QR module paths, 0 authored inline <svg>/<path> markup, and 0 conditional substitution branches",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "QrPanel.astro declares 1 required {item, svg} props interface with 0 defaults and renders exactly 1 <aside data-qr-panel> root with 0 nested section/article roots.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-source-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Exactly 1 role=img element carries the aria-label formula 'Open the ' + item + ' gallery screen in Expo Go', and exactly 1 set:html={svg} binding is the module's only raw-HTML entry point.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-source-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The module imports 0 encoding libraries, applies 0 transformations to the svg prop, and carries exactly 1 comment naming 'ai-elements-example' + '/' + item name with the sprint-09 dead-end.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-readonly-svg-prop"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "The documented scheme literal matches the real apps/example/app.json expo.scheme ('ai-elements-example').",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-readonly-svg-prop"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "The component renders exactly 1 aside root with 0 preview/matrix/tab markup inside, a surface of exactly 3 token references (var(--card), var(--border), one var(--radius-*)), and 0 hex.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-own-aside"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "The component exposes 0 focusable elements (no <a> wrapper, no button) and declares 0 <script> tags.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-own-aside"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "1 aria-label renders 'Open the conversation gallery screen in Expo Go' for item=conversation — the positive literal proving the name template.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-no-fabrication"
  },
  {
   "id": "TC-8",
   "type": "test_criterion",
   "description": "The component contains 0 hardcoded QR paths, 0 authored inline <svg>/<path> markup, 0 static QR asset references, and 0 conditional substitution branches.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/qr-panel-contract.test.ts -t REF-005-qr-panel-no-fabrication"
  }
 ]
}
-->

</details>
