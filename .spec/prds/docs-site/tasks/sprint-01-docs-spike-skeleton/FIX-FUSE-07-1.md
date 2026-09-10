================================================================================
TASK: FIX-FUSE-07-1 - Remove the generic-root success oracle from component-page.spec.ts
================================================================================

TASK_TYPE:  FIX
STATUS:     Completed (landed)
COMMIT:     ba5b516a1796761ede8a9b3229fbec261ab2e0e1 (written by kb-run-sprint orchestrator, 2026-09-10 — finding from the sprint-01 human gate)
PRIORITY:   P0
POINTS:     1
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: orchestrator (e2e surface lint GENERIC_ROOT_ORACLE)
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true
SPRINT:     sprint-01-docs-spike-skeleton

RUNTIME_COMMANDS:
  test:      pnpm e2e:docs --grep FLOW-GEND   # or the task's greps
  lint:      python3 ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py --test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --emit .tmp/FIX-FUSE-07-1/surface.json --governed --policy .spec/e2e-policy/surface.json

--------------------------------------------------------------------------------
FINDING (sprint-01 human gate, step 6 playback)
--------------------------------------------------------------------------------

The governed surface lint (e2e_surface_check.py --governed) fails
tests/sprint-01-docs-spike-skeleton/component-page.spec.ts with
`GENERIC_ROOT_ORACLE: selector 'main' is a generic-root success oracle`
— line 164: `const mainText = (await page.locator('main').innerText()) ?? '';`
used by the placeholder stand-in scan (`mainText` must-not-match assertions).
An assertion window rooted at the page shell (`main`) proves nothing about the
component page's own content. Every other selector in the file is specific
(`main h1`, `main p.item-description`, `main > section[data-section="install"]`).

--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------

The governed surface lint exits 0 on component-page.spec.ts; the placeholder
stand-in scan keeps its full strength (same must-not-match regexes, asserted over
the item's real content region); all FLOW-GEND-14/15 tests still pass across
chromium-desktop/mobile/nojs with zero assertion loss.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier)
--------------------------------------------------------------------------------

- MUST: change ONLY tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
- MUST: keep every existing assertion — same count, same FLOW tokens in titles, same
  regexes for the placeholder scan; only the ORACLE SELECTOR may be scoped
- MUST: the replacement selector names the item's real content (e.g. scope to the
  rendered title/description/source regions, or add and target a specific container
  that already exists in the generated page markup — check apps/docs/src/pages/components/[item].astro)
- NEVER: never delete, merge, or weaken any test; never change FLOW-GEND-14/15 titles
- NEVER: never touch the product page source or any other spec
- STRICTLY: capture exit codes via wrapper (`sh -c '...; echo exit=$?'`) — rtk masks them;
  run lane steps SEQUENTIALLY and wait-poll port 4321 (never kill another process's server)

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: governed surface lint exits 0 on component-page.spec.ts (RED first: capture the GENERIC_ROOT_ORACLE failure before the fix)
- [ ] AC-2: all FLOW-GEND-14/15 tests pass across all three projects; assertion count not reduced (git diff shows no deleted expect() lines)
- [ ] pnpm typecheck clean; biome ci clean on the touched file
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA
--------------------------------------------------------------------------------

AC-1: Governed lint green, oracle scoped
  GIVEN: component-page.spec.ts with the generic-root `page.locator('main')` oracle (RED: lint exit 1)
  WHEN:  the placeholder scan's oracle is scoped to the item's real content region
  THEN:  lint exits 0; the scan still asserts every must-not-match regex over the
         rendered item content; all flows pass in the real lane

  TEST_TIER:            integration
  VERIFICATION_SERVICE: real governed surface lint + real playwright lane over real astro preview
  TEST_FILE:            n/a — verify = lint command + `pnpm e2e:docs --grep FLOW-GEND`
  VERIFY:               sh -c 'python3 ~/Projects/brain/tools/e2e-surface/e2e_surface_check.py --test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --emit .tmp/FIX-FUSE-07-1/surface.json --governed --policy .spec/e2e-policy/surface.json; echo exit=$?'

--------------------------------------------------------------------------------
SCOPE
--------------------------------------------------------------------------------

writeAllowed:
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts
- .tmp/FIX-FUSE-07-1/ (evidence)

Depends on: none
