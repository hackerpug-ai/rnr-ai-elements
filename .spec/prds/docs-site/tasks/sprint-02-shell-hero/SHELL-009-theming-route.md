================================================================================
TASK: SHELL-009 - /docs/theming: minimal real route (first-frame-dark surface for FLOW-SHELL-02)
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     2   # Fibonacci story points — relative size, never time
AGENT:      implementer=techwriting-implementer | reviewer=techwriting-reviewer
PROPOSED-BY: frontend-designer
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: C
HUMAN-TEST-HOOK: theming-route-dark-first
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Create /docs/theming as a real, content-complete route on DocsLayout so FLOW-SHELL-02 has its content-shaped cold-boot surface, with authored prose that states only what the shell actually does today.
**Success state:** The real filtered build emits dist/docs/theming/index.html; the served page carries the DocsLayout header, the four copy-stable content anchors, zero placeholder signatures, and zero dead internal links; the narrow-lane vitest test is green and was watched red at task start.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Write real authored prose covering the three contracted topics: the no-config token contract (the phrase 'ship no tokens' appears), dark-first + prefers-color-scheme behavior, and the header toggle as the live actor
- MUST: Pin the four copy-stable anchors 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle' in the served HTML
- MUST: Capture RED before implementation: the narrow-lane test fails at task start because dist/docs/theming/index.html does not exist (the route 404s today)
- NEVER: Never scaffold /docs/introduction, /docs/installation, /docs/cli, /docs/dark-mode, any content collection, or the /theming vanity redirect — theming ONLY
- NEVER: Never link to a route that 404s today; the page's own links stay within {/, /components}
- NEVER: Never fake the TokenTable live demo or Expressive Code theming — both are sprint-05's named remainder on this same route
- NEVER: Never emit 'coming soon', 'TODO', 'placeholder', or 'Lorem' prose — a placeholder page is a stub page
- NEVER: Never emit a verify command that backgrounds a raw astro preview (the daemon squats :4321); this task verifies via vitest over the real built artifact
- STRICTLY: Write ONLY apps/docs/src/pages/docs/theming.astro plus this task's own narrow-lane file tests/sprint-02-shell-hero/theming-route.test.ts (appended per the sprint proof-ownership model); the stub's prohibited set is unchanged and absolute
- STRICTLY: The page adopts SHELL-002's DocsLayout via import — zero writes to layouts/, components/, data/, scripts/, or packages/
- STRICTLY: Astro 7 rust compiler is strict: valid, closed, correctly-nested HTML only
- STRICTLY: Verify lint via ./node_modules/.bin/biome ci <paths> directly (local pnpm lint crashes)
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: the build exits 0 and the file exists (>0 bytes) on DocsLayout carrying the authored anchors 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'
- [ ] AC-2: zero placeholder or banned strings; every internal href resolves to an existing dist file; the page links nowhere outside {/, /components}
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: Route serves cold with authored theming content
  GIVEN: the repo with SHELL-002's DocsLayout landed and (RED at task start) no apps/docs/src/pages/docs/ directory — /docs/theming 404s
  WHEN:  the integration test runs the real filtered build `pnpm --filter @rnr-ai-elements/docs build` as a subprocess and reads dist/docs/theming/index.html from the real filesystem
  THEN:  the build exits 0 and the file exists (>0 bytes) on DocsLayout carrying the authored anchors 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'
  FLOW_REF:              FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real filtered docs build chain (registry:build → gallery:manifest → docs-data prebuild → astro build) + real filesystem read of apps/docs/dist/docs/theming/index.html
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-first-paint.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF clean_repo_with_docs_deps: run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, capturing stdout/stderr and exit code, stat apps/docs/dist/docs/theming/index.html on the real filesystem, readFileSync the artifact and scan for the contracted anchors and the DocsLayout header element
      MUST_OBSERVE: exit code == 0; apps/docs/dist/docs/theming/index.html exists with size > 0 bytes; served HTML contains the literal 'ship no tokens'; served HTML contains the literal 'oklch'; served HTML contains the literal 'prefers-color-scheme'; served HTML contains the literal 'toggle'; served HTML contains a '<header' element (DocsLayout adoption, not spike.astro)
      MUST_NOT_OBSERVE: dist/docs/theming/index.html absent (the sprint-start 404 signature); 'coming soon', 'TODO', 'placeholder', or 'Lorem' anywhere in the served HTML; 'styling engine', 'flavor', or 'registry variant' (banned terminology per the TR-12 lock)
    NEGATIVE_CONTROL: would fail if theming.astro does not exist — the sprint-start state where the build succeeds but no dist/docs/theming/index.html is emitted; the page is an empty static shell with no authored prose (the content anchors are absent)…

AC-2: No placeholder prose, no dead links, no out-of-scope siblings
  GIVEN: the built dist/docs/theming/index.html produced by AC-1's real build
  WHEN:  the test scans the served HTML for placeholder signatures, banned terminology, and every internal href, resolving each against the dist tree
  THEN:  zero placeholder or banned strings; every internal href resolves to an existing dist file; the page links nowhere outside {/, /components}
  FLOW_REF:              FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real filtered docs build chain + real filesystem resolution of every internal href against apps/docs/dist
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-first-paint.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF clean_repo_with_docs_deps: run the real filtered build and read dist/docs/theming/index.html, extract every href starting with '/' from the served HTML, resolve each internal href against apps/docs/dist with directory-index resolution and assert existence
      MUST_OBSERVE: the page-content internal href set (served HTML excluding the DocsLayout header/footer chrome) == { '/', '/components' } exactly — 2 distinct internal hrefs; apps/docs/dist/components/index.html exists with size > 0 bytes; the resolved link set includes '/components' → apps/docs/dist/components/index.html exists with size > 0 bytes
      MUST_NOT_OBSERVE: any href to '/docs/introduction', '/docs/installation', '/docs/cli', '/docs/dark-mode', '/docs/quickstart', or '/theming' (routes that 404 or redirect nowhere today); any internal href whose resolved dist target is absent (dead link); 'coming soon', 'TODO', 'placeholder', 'Lorem' in the served HTML; 'styling engine', 'flavor', 'registry variant' in the served HTML
    NEGATIVE_CONTROL: would fail if the page links to a not-yet-built docs route — a dead link passes only if href resolution is stubbed; placeholder copy is shipped ('coming soon') instead of real prose…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: The real filtered build exits 0 and apps/docs/dist/docs/theming/index.html exists with size greater than 0.
- TC-2 [happy_path, → AC-1]: The served HTML contains 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle', and a '<header' element proving DocsLayout adoption.
- TC-3 [edge, → AC-2]: No placeholder signature ('coming soon', 'TODO', 'placeholder', 'Lorem') and no banned terminology ('styling engine', 'flavor', 'registry variant') appears in the served HTML.
- TC-4 [edge, → AC-2]: Every internal href resolves to an existing dist file and the page's internal link set contains no route outside {/, /components}.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- apps/docs/src/pages/docs/theming.astro (NEW)
- tests/sprint-02-shell-hero/theming-route.test.ts (NEW)
- tests/sprint-02-shell-hero/theme-first-paint.spec.ts (NEW)
writeProhibited:
- apps/docs/src/layouts/**
- apps/docs/src/components/**
- apps/docs/src/data/**
- packages/**
- scripts/**
- apps/docs/src/pages/docs/** (any sibling route)
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- Serves 200 at /docs/theming and renders dark from the first frame in a fresh dark-OS context (the flow's hard assertion)
- Real content only — the TokenTable live demo (T-SHELL-003) and EC theming (T-SHELL-004) are sprint-05's named remainder; this page must not fake them
- No internal link to a route that 404s today (link out only to / and /components)
- Do NOT scaffold introduction/installation/cli/dark-mode or any content collection — theming ONLY
- Authored copy carries the copy-stable anchors 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'; SHELL-010 polishes sentences AROUND these anchors, never removes them (the narrow-lane test pins them)
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- apps/docs/src/pages/index.astro lines 1-40 — [PRIMARY PATTERN] authored .astro page on a shared layout — frontmatter, authored markup, scoped styles; the page shape this task imitates (without the data imports: theming is static prose)
- tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts lines 1-120 — the real-build-as-subprocess + captured-stdout + real-filesystem assertion pattern the narrow-lane test imitates
- .spec/prds/docs-site/11-technical-requirements/10-routing.md lines 18-24 — the /docs/theming route row — markdown-mdx + TokenTable live demo is the END state; this sprint ships the route with authored prose, the demo arrives sprint-05 on the same route
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md lines all — terminology lock table + Google style baseline governing every authored sentence on the page
- .spec/prds/docs-site/06-uc-shell.md lines 19-27 — UC-SHELL-01 AC-2 — the first-visit prefers-color-scheme clause this route exists to host (FLOW-SHELL-02)
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: authored static .astro page adopted on DocsLayout (no content collection, no generated-data import), verified by a vitest integration test that runs the real build and asserts over the built artifact
Source: apps/docs/src/pages/index.astro:1-31 (frontmatter + authored markup on a shared layout) and tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts (real-build subprocess pattern)
Anti-pattern: content-collection scaffolding or a 'coming soon' placeholder page — the sprint-05 token-table deep-dive arrives on this same route later, but this page must carry real prose NOW; a placeholder page is a stub page
Interaction notes:
- The page imports SHELL-002's DocsLayout and nothing else — no generated data, no content collection, no islands; it inherits the header, footer, and (once SHELL-003 lands, parallel wave C) the pre-paint theme script without this task touching them
- FLOW-SHELL-02's sole proof owner is SHELL-013 (theme-first-paint.spec.ts, wave G, verify equals the locked run_cmd); this task's ACs cite the flow non-primarily as the route's reason-to-exist and verify through this task's own narrow-lane file, which exists and is writable from wave C
- The narrow-lane test runs vitest, not playwright, deliberately: the playwright testDir is still pinned to tests/sprint-01-docs-spike-skeleton until SHELL-011 (wave F) widens it, so a .spec.ts under tests/sprint-02-shell-hero/ would not resolve at wave C
- The four content anchors are copy-stable by contract: SHELL-010 (wave F) may reword the sentences around them but never remove them, so the polish cannot silently drop a fact
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- RED (pre-implementation, route absent): `pnpm vitest run tests/sprint-02-shell-hero/theming-route.test.ts -t SHELL-009-theming-route-served-with-authored-content`
  expected: FAIL — the real build exits 0 but dist/docs/theming/index.html is absent at task start; capture the failure output as this task's red artifact (also red at the recorded sprint-start commit)
- GREEN — route + authored content: `pnpm vitest run tests/sprint-02-shell-hero/theming-route.test.ts -t SHELL-009-theming-route-served-with-authored-content`
  expected: exit 0
- GREEN — content honesty + links: `pnpm vitest run tests/sprint-02-shell-hero/theming-route.test.ts -t SHELL-009-theming-content-honesty-and-links`
  expected: exit 0
- Typecheck: `pnpm typecheck`
  expected: exit 0
- Lint: `./node_modules/.bin/biome ci apps/docs/src/pages/docs/theming.astro tests/sprint-02-shell-hero/theming-route.test.ts`
  expected: exit 0 (never `pnpm lint` — crashes locally)
- Scope compliance: `git diff --name-only`
  expected: output ⊆ {apps/docs/src/pages/docs/theming.astro, tests/sprint-02-shell-hero/theming-route.test.ts}
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-002
Blocks:     SHELL-010, SHELL-013
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
FLOW-SHELL-02 names /docs/theming, so the route must exist this sprint. Scope it honestly: what theming IS on this site today (2-3 sentences of real prose — the no-config token contract phrased 'ship no tokens', dark-first + prefers-color-scheme behavior, the header toggle as the live actor), with the token-table deep-dive arriving with sprint-05's getting-started set on this same route. This expansion adds the task's own narrow vitest lane (tests/sprint-02-shell-hero/theming-route.test.ts) per the sprint's proof-ownership model — the stub's write_prohibited set is untouched, and the verify commands never background a raw preview (the build subprocess + filesystem artifact IS the surface). RED is natural: the route 404s today, so the test fails at task start before theming.astro exists. The four content anchors survive SHELL-010's wave-F sentence polish by contract.
Coding standards:
- Google developer documentation style baseline: active voice, short sentences (<=25 words), second person where the page addresses the reader, present tense, define acronyms on first use
- TR-12 terminology lock: 'engine' (never 'styling engine'/'flavor'), 'engine tree', 'registry item', 'family', 'verdict', 'peers' (never 'deps' in prose), 'dev client'
- Reference-page austerity does not apply here (this is an authored page), but no tutorializing either: state facts about the shell as it behaves today, no steps
- Astro 7 rust compiler strictness: valid, closed, correctly-nested HTML in the page markup
Capability: touches=['CAP-DOCS-01'] provides=3 items consumes=1 items; boundary_contracts=5
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-009",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "clean_repo_with_docs_deps": {
   "description": "Checkout at the task working tree with dependencies installed and SHELL-002's DocsLayout landed; RED signature at task start: the real filtered build exits 0 but emits NO dist/docs/** \u2014 /docs/theming 404s.",
   "seed_method": "build_artifact",
   "records": [
    "pnpm install --frozen-lockfile exit 0",
    "pnpm --filter @rnr-ai-elements/docs build exit 0",
    "pre-implementation: apps/docs/dist/docs/theming/index.html absent (404 signature)",
    "post-implementation: apps/docs/dist/docs/theming/index.html exists with size > 0 bytes"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the repo with SHELL-002's DocsLayout landed and (RED at task start) no apps/docs/src/pages/docs/ directory \u2014 /docs/theming 404s WHEN the integration test runs the real filtered build `pnpm --filter @rnr-ai-elements/docs build` as a subprocess and reads dist/docs/theming/index.html from the real filesystem THEN the build exits 0 and the file exists (>0 bytes) on DocsLayout carrying the authored anchors 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_file": "tests/sprint-02-shell-hero/theme-first-paint.spec.ts",
   "test_function": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_tier": "integration",
   "verification_service": "real filtered docs build chain (registry:build \u2192 gallery:manifest \u2192 docs-data prebuild \u2192 astro build) + real filesystem read of apps/docs/dist/docs/theming/index.html",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real filtered docs build chain + real filesystem read of apps/docs/dist/docs/theming/index.html",
    "negative_control": {
     "would_fail_if": [
      "theming.astro does not exist \u2014 the sprint-start state where the build succeeds but no dist/docs/theming/index.html is emitted",
      "the page is an empty static shell with no authored prose (the content anchors are absent)",
      "the test reads a stale checked-in HTML file instead of the artifact produced by the real build subprocess (a static/mock oracle)"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "clean_repo_with_docs_deps",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess, capturing stdout/stderr and exit code",
        "stat apps/docs/dist/docs/theming/index.html on the real filesystem",
        "readFileSync the artifact and scan for the contracted anchors and the DocsLayout header element"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code == 0",
        "apps/docs/dist/docs/theming/index.html exists with size > 0 bytes",
        "served HTML contains the literal 'ship no tokens'",
        "served HTML contains the literal 'oklch'",
        "served HTML contains the literal 'prefers-color-scheme'",
        "served HTML contains the literal 'toggle'",
        "served HTML contains a '<header' element (DocsLayout adoption, not spike.astro)"
       ],
       "must_not_observe": [
        "dist/docs/theming/index.html absent (the sprint-start 404 signature)",
        "'coming soon', 'TODO', 'placeholder', or 'Lorem' anywhere in the served HTML",
        "'styling engine', 'flavor', or 'registry variant' (banned terminology per the TR-12 lock)"
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
   "description": "GIVEN the built dist/docs/theming/index.html produced by AC-1's real build WHEN the test scans the served HTML for placeholder signatures, banned terminology, and every internal href, resolving each against the dist tree THEN zero placeholder or banned strings; every internal href resolves to an existing dist file; the page links nowhere outside {/, /components}",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_file": "tests/sprint-02-shell-hero/theme-first-paint.spec.ts",
   "test_function": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_tier": "integration",
   "verification_service": "real filtered docs build chain + real filesystem resolution of every internal href against apps/docs/dist",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real filtered docs build chain + real dist-tree link resolution",
    "negative_control": {
     "would_fail_if": [
      "the page links to a not-yet-built docs route \u2014 a dead link passes only if href resolution is stubbed",
      "placeholder copy is shipped ('coming soon') instead of real prose",
      "the link check inspects a handcrafted string instead of the built artifact (a mock oracle)"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "clean_repo_with_docs_deps",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the real filtered build and read dist/docs/theming/index.html",
        "extract every href starting with '/' from the served HTML",
        "resolve each internal href against apps/docs/dist with directory-index resolution and assert existence"
       ]
      },
      "end_state": {
       "must_observe": [
        "the page-content internal href set (served HTML excluding the DocsLayout header/footer chrome) == { '/', '/components' } exactly \u2014 2 distinct internal hrefs; apps/docs/dist/components/index.html exists with size > 0 bytes",
        "the resolved link set includes '/components' \u2192 apps/docs/dist/components/index.html exists with size > 0 bytes"
       ],
       "must_not_observe": [
        "any href to '/docs/introduction', '/docs/installation', '/docs/cli', '/docs/dark-mode', '/docs/quickstart', or '/theming' (routes that 404 or redirect nowhere today)",
        "any internal href whose resolved dist target is absent (dead link)",
        "'coming soon', 'TODO', 'placeholder', 'Lorem' in the served HTML",
        "'styling engine', 'flavor', 'registry variant' in the served HTML"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The real filtered build exits 0 and apps/docs/dist/docs/theming/index.html exists with size greater than 0.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/theming-route.test.ts -t SHELL-009-theming-route-served-with-authored-content"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "The served HTML contains 'ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle', and a '<header' element proving DocsLayout adoption.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/theming-route.test.ts -t SHELL-009-theming-route-served-with-authored-content"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "No placeholder signature ('coming soon', 'TODO', 'placeholder', 'Lorem') and no banned terminology ('styling engine', 'flavor', 'registry variant') appears in the served HTML.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/theming-route.test.ts -t SHELL-009-theming-content-honesty-and-links"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "Every internal href resolves to an existing dist file and the page's internal link set contains no route outside {/, /components}.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/theming-route.test.ts -t SHELL-009-theming-content-honesty-and-links"
  }
 ]
}
-->
