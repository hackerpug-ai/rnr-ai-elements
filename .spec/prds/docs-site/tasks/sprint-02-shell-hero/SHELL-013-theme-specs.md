================================================================================
TASK: SHELL-013 - Theme flow specs: FLOW-SHELL-01 persisted flash-free toggle + FLOW-SHELL-02 first-visit dark, no flash
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     74ba34d2e54d27217f94b40d51a31d2af8fae10c (reviewed at merged head 4ca606c)
PRIORITY:   P0
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: astro-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: G
HUMAN-TEST-HOOK: theme-flow-specs-green
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Author the two theme flow specs proving the persisted flash-free toggle (flip, storage, reload, stickiness) and first-visit prefers-color-scheme dark with zero light flash on every cold-boot route, with evidence and sprint-start-anchored RED proofs.
**Success state:** Both locked run_cmds exit 0 under the widened lane; evidence JSONs exist; RED proofs recorded against the sprint-start commit (where no toggle exists, html carries no theme class, and /docs/theming 404s).
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: MUST: the two owned flows' verify commands are byte-for-byte the locked run_cmds selecting their spec file + flow id
- MUST: MUST: first-frame theme state is sampled at domContentLoaded via an init script installed before any page script — never read post-load where an island could have corrected it
- MUST: MUST: every case creates a brand-new context (colorScheme/storageState set at creation; zero storage; cold navigation) — never a reused page or context
- NEVER: NEVER: never assert theme from post-load state alone (L7 — module scripts execute once; a late read launders a flash)
- NEVER: NEVER: never rely on bfcache back/forward navigation or shared storage between cases
- NEVER: NEVER: never emit `pnpm lint` or a bare-directory run command
- STRICTLY: STRICTLY: theme never asserted via URL state; observables are the root theme class, computed background-color, and localStorage 'rnr-theme'
- STRICTLY: STRICTLY: the deferred no-preference clause stays out of these specs — locked flow membership only
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: each flip changes the root theme class and body computed background-color between oklch(0.145 0 0) and oklch(1 0 0), 'rnr-theme' is written, the cold reload shows the correct theme already set at domContentLoaded with no URL state, the header stays sticky at scrollY 1000, and with zero JS the toggle is hidden while the site stays readable in the pre-paint-resolved theme [PRIMARY]
- [ ] AC-2: every dark-scheme page renders dark from the first frame with no light flash, the light-scheme context renders light, and the sampled state at domContentLoaded already carries the correct class before any island script [PRIMARY]
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: FLOW-SHELL-01: persisted flash-free theme toggle with sticky header [PRIMARY]
  GIVEN: the built site with the header theme toggle and pre-paint script live
  WHEN:  the spec clicks the toggle dark→light→dark reading computed background-color and localStorage, cold-reloads after a choice, scrolls /components/message to scrollY 1000, and opens it with JavaScript disabled
  THEN:  each flip changes the root theme class and body computed background-color between oklch(0.145 0 0) and oklch(1 0 0), 'rnr-theme' is written, the cold reload shows the correct theme already set at domContentLoaded with no URL state, the header stays sticky at scrollY 1000, and with zero JS the toggle is hidden while the site stays readable in the pre-paint-resolved theme
  FLOW_REF:              FLOW-SHELL-01-theme-toggle-persisted-flash-free
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium (computed styles, localStorage, cold reloads, zero-JS context)
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-toggle.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-01-theme-toggle-persisted-flash-free
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF built_preview_site: cold-navigate / via navigateLocalhost; click the toggle once; read root class + computed body background-color + localStorage; click again and re-read
      MUST_OBSERVE: light state: root class `light`, computed background-color `oklch(1 0 0)`, localStorage `rnr-theme` == `light`; dark state restored: root class `dark`, computed background-color `oklch(0.145 0 0)`, localStorage `rnr-theme` == `dark`; page.url equals exactly `http://localhost:4321/` after both clicks
      MUST_NOT_OBSERVE: background-color unchanged after a click; localStorage key other than `rnr-theme` written; any `?` or `#` theme state appended to the URL
    START_REF built_preview_site: select light; cold-reload (fresh navigation, same context); sample the root theme class at domContentLoaded via an init script installed before page scripts
      MUST_OBSERVE: root class `light` recorded AT domContentLoaded (pre-paint contract, no wrong-theme frame); computed background-color `oklch(1 0 0)` after load
      MUST_NOT_OBSERVE: `dark` recorded at domContentLoaded in the light-persisted context (flash signature); localStorage reset by the reload
    START_REF built_preview_site: cold-navigate /components/message; window.scrollTo(0, 1000); read the header bounding box, open the page in a javaScriptEnabled:false context and inspect the toggle
      MUST_OBSERVE: header box top == 0 (still visible) at scrollY 1000; zero-JS: the rnr-theme-toggle element has offsetParent null / bounding box 0x0 in the javaScriptEnabled:false context; zero-JS: page renders readable in the pre-paint-resolved theme (`dark` root class)
      MUST_NOT_OBSERVE: header box top > 0 at scrollY 1000 (not sticky); zero-JS: a visible interactive toggle button; zero-JS: unstyled/theme-less rendering
    NEGATIVE_CONTROL: would fail if the toggle mutates anything but the class + storage (e.g. injects a stylesheet without flipping the root class); the pre-paint script is absent so the cold reload shows the wrong theme at domContentLoaded (flash)…

AC-2: FLOW-SHELL-02: first-visit prefers-color-scheme dark, no light flash [PRIMARY]
  GIVEN: the built site with the pre-paint script and the /docs/theming route
  WHEN:  the spec cold-navigates brand-new colorScheme:'dark' contexts to /docs/theming, /, and /components/message, and a brand-new colorScheme:'light' context to the same routes, sampling the root theme class at domContentLoaded
  THEN:  every dark-scheme page renders dark from the first frame with no light flash, the light-scheme context renders light, and the sampled state at domContentLoaded already carries the correct class before any island script
  FLOW_REF:              FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  TEST_TIER:             e2e
  VERIFICATION_SERVICE:  real Astro build + astro preview server + Chromium fresh colorScheme contexts with pre-page init scripts
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/theme-first-paint.spec.ts
  TEST_FUNCTION:         FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF fresh_dark_context: install an init script recording the root class at domContentLoaded; cold-navigate to /docs/theming, then /, then /components/message (three separate fresh contexts, zero storage)
      MUST_OBSERVE: root class `dark` recorded at domContentLoaded on all three routes; computed body background-color `oklch(0.145 0 0)` on all three routes; each response HTTP 200
      MUST_NOT_OBSERVE: `light` recorded at domContentLoaded on any dark-scheme route (light flash); computed background-color `oklch(1 0 0)` at first paint; pre-existing localStorage `rnr-theme` in the fresh context
    START_REF fresh_light_context: install the same init script; cold-navigate to / (fresh context, colorScheme 'light', zero storage)
      MUST_OBSERVE: root class `light` recorded at domContentLoaded; computed body background-color `oklch(1 0 0)`
      MUST_NOT_OBSERVE: `dark` forced on a light-scheme fresh visitor (scheme not respected); any theme flash signature
    NEGATIVE_CONTROL: would fail if the pre-paint script is missing so the first frame renders theme-less/light (flash); the theme is applied only by an island script after page-load (init-script sample would catch the late class)…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: Clicking the toggle flips the root theme class and computed body background-color between oklch(0.145 0 0) and oklch(1 0 0) both ways and writes localStorage 'rnr-theme', with no theme state in the URL.
- TC-2 [edge, → AC-1]: A cold reload after choosing light shows the light root class already set at domContentLoaded (no wrong-theme frame), and the header remains sticky at scrollY 1000 on /components/message.
- TC-3 [edge, → AC-1]: With JavaScript disabled the toggle is hidden and the page stays readable in the pre-paint-resolved dark theme.
- TC-4 [happy_path, → AC-2]: Brand-new zero-storage dark-scheme contexts render /docs/theming, /, and /components/message dark from the first frame (class correct at domContentLoaded, background oklch(0.145 0 0)), and a fresh light-scheme context renders light.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- tests/sprint-02-shell-hero/theme-toggle.spec.ts (NEW)
- tests/sprint-02-shell-hero/theme-first-paint.spec.ts (NEW)
writeProhibited:
- apps/docs/src/**
- playwright.config.ts
- tests/sprint-01-docs-spike-skeleton/**
- packages/**
- scripts/**
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- First-frame assertions sample state at domContentLoaded (pre-paint contract), or via an init script installed before any page script — never post-load state
- Fresh contexts are brand-new (create explicitly, never reuse); coldboot policy: no bfcache, no service worker, no shared storage
- retries: 0; RED proof captured against the recorded sprint-start commit
- The no-preference-renders-dark clause of T-SHELL-002 is deferred — emulating 'no preference' is unreliable in Chromium and is not in this flow's locked membership
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- tests/sprint-01-docs-spike-skeleton/home.spec.ts lines 36-71 — [PRIMARY PATTERN] per-project no-JS guard + fresh context creation + clipboard-free context discipline
- tests/harness/docs-preview.ts lines 39-101 — navigateLocalhost (cold navigation discipline) and waitForAstroPageLoad (L7 — the post-load wait these first-frame cases must NOT rely on)
- playwright.config.ts lines 24-33 — the three chromium projects these specs run under; colorScheme is set per-context, not per-project
- .spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md lines 28-41 — determinism seam: addInitScript seeds/records BEFORE the is:inline pre-paint script runs — the sampling mechanism for AC-2
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: fresh-context browser-emulation spec; one flow id per --grep; per-case context creation
Source: tests/sprint-01-docs-spike-skeleton/home.spec.ts:47-50
Anti-pattern: post-load theme assertions, reused contexts leaking storage, back/forward navigation, asserting a success class instead of computed values
Interaction notes:
- first-frame sampling: context.addInitScript installs a domContentLoaded recorder before any page script; the spec then reads the recorded value — never a post-load read
- fresh contexts created explicitly per case (colorScheme/storageState at creation); no context, page, or storage reuse; cold navigation only (no bfcache)
- theme observables: root class, computed background-color, localStorage 'rnr-theme' — never URL state
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- FLOW-SHELL-01 green: `pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free`
  expected: exit 0 — flip/persist/domContentLoaded/sticky/zero-JS all hold
- FLOW-SHELL-02 green: `pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash`
  expected: exit 0 — first-frame dark on all three routes; light context light
- RED proofs recorded: `detached scratch checkout of the recorded sprint-start commit + only the two specs + run_flow.py --expect red`
  expected: both flows fail against the sprint-start state (no toggle, no theme class, /docs/theming 404); outputs saved to .tmp/sprint-02-shell-hero/e2e-evidence/<FLOW-ID>-red.txt
- lint: `./node_modules/.bin/biome ci tests/sprint-02-shell-hero/theme-toggle.spec.ts tests/sprint-02-shell-hero/theme-first-paint.spec.ts`
  expected: exit 0
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: SHELL-003, SHELL-009, SHELL-011
Blocks:     (none)
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
RED today: no toggle exists, html has no theme class, and /docs/theming 404s. Capture RED against the recorded sprint-start commit; land green after SHELL-003/009 (PR-gated CI). The no-preference-renders-dark clause of T-SHELL-002 is deferred to sprint-05 — emulating 'no preference' is unreliable in Chromium and is not in this flow's locked membership.
Coding standards:
- repo tsconfig has no DOM lib — declare browser globals used in evaluate callbacks (home.spec.ts precedent)
- retries never appears on any invocation; a flaky theme flow is a broken flow
- no assertion trusts a class name, an attribute alone, or a page-echoed literal — computed styles and storage values only
Capability: touches=['CAP-DOCS-01'] provides=3 items consumes=4 items; boundary_contracts=4
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-013",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "built_preview_site": {
   "description": "Built dist served by the config webServer over astro preview at http://localhost:4321, with SHELL-003's toggle + pre-paint script live and SHELL-009's /docs/theming route present.",
   "seed_method": "build_artifact",
   "records": [
    "build chain exit 0",
    "/, /components/message, /docs/theming all answer 200"
   ]
  },
  "fresh_dark_context": {
   "description": "Brand-new browser context created with colorScheme 'dark', zero storage, no bfcache; cold navigation only.",
   "seed_method": "browser_action",
   "records": [
    "browser.newContext({ colorScheme: 'dark' }) per case",
    "no localStorage keys exist before navigation"
   ]
  },
  "fresh_light_context": {
   "description": "Brand-new browser context created with colorScheme 'light', zero storage.",
   "seed_method": "browser_action",
   "records": [
    "browser.newContext({ colorScheme: 'light' }) per case"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": true,
   "description": "GIVEN the built site with the header theme toggle and pre-paint script live WHEN the spec clicks the toggle dark\u2192light\u2192dark reading computed background-color and localStorage, cold-reloads after a choice, scrolls /components/message to scrollY 1000, and opens it with JavaScript disabled THEN each flip changes the root theme class and body computed background-color between oklch(0.145 0 0) and oklch(1 0 0), 'rnr-theme' is written, the cold reload shows the correct theme already set at domContentLoaded with no URL state, the header stays sticky at scrollY 1000, and with zero JS the toggle is hidden while the site stays readable in the pre-paint-resolved theme",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_file": "tests/sprint-02-shell-hero/theme-toggle.spec.ts",
   "test_function": "FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium (computed styles, localStorage, cold reloads, zero-JS context)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "negative_control": {
     "would_fail_if": [
      "the toggle mutates anything but the class + storage (e.g. injects a stylesheet without flipping the root class)",
      "the pre-paint script is absent so the cold reload shows the wrong theme at domContentLoaded (flash)",
      "the header is not sticky (scrolls away at scrollY 1000)"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "cold-navigate / via navigateLocalhost; click the toggle once; read root class + computed body background-color + localStorage; click again and re-read"
       ]
      },
      "end_state": {
       "must_observe": [
        "light state: root class `light`, computed background-color `oklch(1 0 0)`, localStorage `rnr-theme` == `light`",
        "dark state restored: root class `dark`, computed background-color `oklch(0.145 0 0)`, localStorage `rnr-theme` == `dark`",
        "page.url equals exactly `http://localhost:4321/` after both clicks"
       ],
       "must_not_observe": [
        "background-color unchanged after a click",
        "localStorage key other than `rnr-theme` written",
        "any `?` or `#` theme state appended to the URL"
       ]
      }
     },
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "select light; cold-reload (fresh navigation, same context); sample the root theme class at domContentLoaded via an init script installed before page scripts"
       ]
      },
      "end_state": {
       "must_observe": [
        "root class `light` recorded AT domContentLoaded (pre-paint contract, no wrong-theme frame)",
        "computed background-color `oklch(1 0 0)` after load"
       ],
       "must_not_observe": [
        "`dark` recorded at domContentLoaded in the light-persisted context (flash signature)",
        "localStorage reset by the reload"
       ]
      }
     },
     {
      "start_ref": "built_preview_site",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "cold-navigate /components/message; window.scrollTo(0, 1000); read the header bounding box",
        "open the page in a javaScriptEnabled:false context and inspect the toggle"
       ]
      },
      "end_state": {
       "must_observe": [
        "header box top == 0 (still visible) at scrollY 1000",
        "zero-JS: the rnr-theme-toggle element has offsetParent null / bounding box 0x0 in the javaScriptEnabled:false context",
        "zero-JS: page renders readable in the pre-paint-resolved theme (`dark` root class)"
       ],
       "must_not_observe": [
        "header box top > 0 at scrollY 1000 (not sticky)",
        "zero-JS: a visible interactive toggle button",
        "zero-JS: unstyled/theme-less rendering"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "AC-2",
   "type": "acceptance_criterion",
   "primary": true,
   "description": "GIVEN the built site with the pre-paint script and the /docs/theming route WHEN the spec cold-navigates brand-new colorScheme:'dark' contexts to /docs/theming, /, and /components/message, and a brand-new colorScheme:'light' context to the same routes, sampling the root theme class at domContentLoaded THEN every dark-scheme page renders dark from the first frame with no light flash, the light-scheme context renders light, and the sampled state at domContentLoaded already carries the correct class before any island script",
   "maps_to_ac": null,
   "flow_ref": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_file": "tests/sprint-02-shell-hero/theme-first-paint.spec.ts",
   "test_function": "FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium fresh colorScheme contexts with pre-page init scripts",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Astro build + astro preview + Chromium",
    "negative_control": {
     "would_fail_if": [
      "the pre-paint script is missing so the first frame renders theme-less/light (flash)",
      "the theme is applied only by an island script after page-load (init-script sample would catch the late class)",
      "the route 404s (/docs/theming absent)"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "fresh_dark_context",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "install an init script recording the root class at domContentLoaded; cold-navigate to /docs/theming, then /, then /components/message (three separate fresh contexts, zero storage)"
       ]
      },
      "end_state": {
       "must_observe": [
        "root class `dark` recorded at domContentLoaded on all three routes",
        "computed body background-color `oklch(0.145 0 0)` on all three routes",
        "each response HTTP 200"
       ],
       "must_not_observe": [
        "`light` recorded at domContentLoaded on any dark-scheme route (light flash)",
        "computed background-color `oklch(1 0 0)` at first paint",
        "pre-existing localStorage `rnr-theme` in the fresh context"
       ]
      }
     },
     {
      "start_ref": "fresh_light_context",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "install the same init script; cold-navigate to / (fresh context, colorScheme 'light', zero storage)"
       ]
      },
      "end_state": {
       "must_observe": [
        "root class `light` recorded at domContentLoaded",
        "computed body background-color `oklch(1 0 0)`"
       ],
       "must_not_observe": [
        "`dark` forced on a light-scheme fresh visitor (scheme not respected)",
        "any theme flash signature"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "Clicking the toggle flips the root theme class and computed body background-color between oklch(0.145 0 0) and oklch(1 0 0) both ways and writes localStorage 'rnr-theme', with no theme state in the URL.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "A cold reload after choosing light shows the light root class already set at domContentLoaded (no wrong-theme frame), and the header remains sticky at scrollY 1000 on /components/message.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "With JavaScript disabled the toggle is hidden and the page stays readable in the pre-paint-resolved dark theme.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-toggle.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "Brand-new zero-storage dark-scheme contexts render /docs/theming, /, and /components/message dark from the first frame (class correct at domContentLoaded, background oklch(0.145 0 0)), and a fresh light-scheme context renders light.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/theme-first-paint.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash"
  }
 ]
}
-->
