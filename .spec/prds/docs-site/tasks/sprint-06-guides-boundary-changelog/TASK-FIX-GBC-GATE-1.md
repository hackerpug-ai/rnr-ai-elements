================================================================================
TASK: FIX-GBC-GATE-1 - Unfreeze all 48 frozen e2e failures blocking human-gate step 5 (pnpm e2e:docs)
================================================================================

TASK_TYPE:  FIX
STATUS:     Backlog
PRIORITY:   P1
POINTS:     5
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner (orchestrator ask ask-gate1-add-frozen-lanes, 2026-10-06; scope extended same day to own all 48 gate-step-5 failures)
TDD_MODE: skipped
RED_GREEN_REQUIRED: no

---
## Problem

Gate step 5 requires `pnpm e2e:docs` to exit 0 with retries: 0. The committed fresh full-suite
run at trunk 3fa9f98c (`.tmp/sprint-06-guides-boundary-changelog/e2e-fresh-20261006T-run.log`,
2026-10-06) records 48 failed / 434 passed / 34 skipped, retries 0. **All 48 are this task's
scope**: 45 across exactly 15 spec files from sprints 01-05 (the residue GBC-014's handoff
scope_impact[0] predicted, after FIX-SHELL-15-16 and FIX-ORI-CI-003-1 cleared two groups), plus
the 3 sprint-06 boundary instances (boundary-tables.spec.ts:103, FLOW-DOCS-04 AC-1, one per
chromium project) whose root cause is verified: commit a1045aa3 (sprint-05 ORI-CONT-004, landed
2026-10-02, after the 09-30 gate) rewrote the example-app Callout body in
`apps/docs/src/content/docs/owns-vs-does-not-own.mdx` and put the literal token `useChat` into
prose (line 90, still on the trunk); the lane's AC1_TERMS = ['transport', 'streaming client',
'tool executor', 'useChat'] must appear ONLY in table cells, never in a `main p`. The fix is
already proven on branch kb-run-sprint/sprint-06-guides-boundary-changelog/FIX-GBC-003-1,
commit f042f5eb: the one-line Callout-body reword flipped the lane RED 3 fails -> GREEN 15/15,
retries 0.

Inventory (file:line -> observed error, from the committed log):

| # | Spec file:line | Observed error |
|---|----------------|----------------|
| 1 | tests/sprint-01-docs-spike-skeleton/component-page.spec.ts:415 | FAM-003: family sections expected 7, received 8 |
| 2 | tests/sprint-01-docs-spike-skeleton/home.spec.ts:174 | FLOW-GEND-01: `aside` count expected 0, received 1 |
| 3 | tests/sprint-01-docs-spike-skeleton/ledger.spec.ts:116 | FLOW-GEND-40: renderedTypes expected 56-entry array, received 1 element |
| 4 | tests/sprint-01-docs-spike-skeleton/ledger.spec.ts:184 | FLOW-GEND-40 zero-JS: strict-mode — bulk-add nativewind base-URL `code` resolves to 2 elements (bare `<code>` + `rnr-copy-button` command code) |
| 5 | tests/sprint-01-docs-spike-skeleton/ledger.spec.ts:204 | FLOW-GEND-40: timeout waiting for `td.ledger-docs a` on the first row |
| 6 | tests/sprint-01-docs-spike-skeleton/ledger.spec.ts:269 | FLOW-GEND-40 copy: same 2-element strict-mode match inside the bulk-add li |
| 7 | tests/sprint-01-docs-spike-skeleton/ledger.spec.ts:298 | FLOW-GEND-41: row copy triggers expected 56, received 112 |
| 8 | tests/sprint-02-shell-hero/item-install-copy.spec.ts:320 | FLOW-GEND-20, mobile: install-tab click intercepted by the page-header overlay |
| 9 | tests/sprint-03-family-browse/ledger-filter-island.spec.ts:204 | FAM-004: `[role="search"]` landmarks expected 1, received 2 |
| 10 | tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts:110 | FAM-005: timeout on `td.ledger-docs a` at row-shimmer (same family as #5) |
| 11 | tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts:162 | FLOW-GEND-20, mobile: same tab-click interception as #8 |
| 12 | tests/sprint-04-generated-reference/site-crawl.spec.ts:91 | T-GEND-016: crawl purity — 2 short-name/relative/un-tabbed command forms |
| 13 | tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts:146 | FLOW-SHELL-14: per-engine install panels count 0 in the initial HTML on every item page |
| 14 | tests/sprint-05-orient-search/boundary-content.spec.ts:197 | ORI-CONT-005-AC-3: heading at `#rendermarkdown` expected "renderMarkdown seam" — anchor attached, heading text changed by reviewed rewrites |
| 15 | tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts:340 | FLOW-DOCS-01 AC-4: ENOENT on owns-vs-does-not-own.md — GBC-003 landed it as `.mdx` |
| 16 | tests/sprint-05-orient-search/orientation-content.spec.ts:370 | ORI-CONT-001: "no troubleshooting link (unimplemented Sprint 06)" guard now finds /guides/troubleshooting — premise obsolete |
| 17 | tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts:205 | FLOW-DOCS-02: fail-closed env gate — RNR_S05_IOS_UDID / RNR_S05_ANDROID_SERIAL / OPENAI_API_KEY absent (chromium-desktop, 4h timeout) |
| 18 | tests/sprint-05-orient-search/registry-item-reference-pages.spec.ts:519 | ORI-AST-008: /components/message link to `/docs/theming#rendermarkdown` count 0 — GBC-001 repointed the seam map to /guides/customize-rendering#rendermarkdown |
| 19 | tests/sprint-05-orient-search/token-presentation.spec.ts:547 | ORI-VIS-002-AC-4, mobile: token-table horizontal scrollLeft stays 0 |
| 20 | tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts:103 | FLOW-DOCS-04 AC-1 (3 instances, one per chromium project): `useChat` appears in the Callout prose at owns-vs-does-not-own.mdx:90 (a1045aa3) — AC1_TERMS are table-cell-only; fix pre-proven at f042f5eb (lane spec untouched, content reword only) |

Most earlier-sprint lanes are stale expectations pinning superseded product truth; a minority
are genuine product regressions the lanes correctly catch; the boundary lane is a proven
product-content fix. The disposition rules decide which is which.

## Disposition rules

Every failure closes by exactly one of:

- **(a) Stale expectation -> update to verified current truth.** The update cites its source
  inline (landed task id and/or commit). Reviewed truths this sprint already knows: the apex
  domain `https://rnraielements.com` live since the sprint-07 deploy; GBC-001's seam-map
  repoint to `/guides/customize-rendering#rendermarkdown` (+ `#textclasscontext`); GBC-003's
  `owns-vs-does-not-own.mdx` rewrite (path AND content); ORI-CONT-004's heading-text change at
  `#rendermarkdown`; sprint-06's landed `/guides`, `/porting`, `/changelog` routes + header
  nav + IndexList; the sprint-05 search dialog (second `role="search"` landmark); the
  `rnr-copy-button` affordance now in bulk-add and rows.
- **(b) Lane right, product wrong -> fix the product.** The failing assertion expresses a
  live contract the current product breaks. The product edit names, in the handoff, the exact
  failing assertion that proved the lane right. The boundary lane (#20) is this rule with the
  fix already proven: re-apply exactly the f042f5eb reword.

An unknown gets investigated until it is one of the two. No third "relaxed" category exists.

## Critical Constraints
MUST:
- re-apply exactly the f042f5eb Callout-body reword in `apps/docs/src/content/docs/owns-vs-does-not-own.mdx` (the "See the worked example app" Callout, line 90: "around AI SDK v7 useChat, streaming" -> "around the AI SDK v7 chat hook, streaming") — tables and every other byte untouched, the lane spec untouched — and prove the boundary segment RED (the 3 instances failing on the trunk prose) then GREEN (boundary-tables.spec.ts 15/15, retries 0) inside this task's own evidence, citing the f042f5eb cycle-1 precedent (.tmp/FIX-GBC-003-1/cycle-1/)
- work from the committed ground truth log; record any divergence between it and reality at execution time, never assume it away
- keep every live contract live: an updated expectation still asserts the same contract (bulk-add still asserts the exact base-URL text AND the clipboard copy; crawl purity still demands absolute tabbed command forms; a11y still demands exactly the landmarks the reviewed surface ships; AC1_TERMS stay table-cell-only)
- resolve the env-gated quickstart lane honestly: run the acceptance with the documented native env (`RNR_S05_IOS_UDID`, `RNR_S05_ANDROID_SERIAL`, `OPENAI_API_KEY`, devices attached — the fail-closed gate stays as authored), or propose an explicit skip naming the missing prerequisite that never silently reduces the matrix; the choice and rationale go in the handoff
- capture evidence under `.tmp/FIX-GBC-GATE-1/` (dispositions.json + red/green segment logs + green/run.json + the full-suite log), committed force-added like the GBC-018 precedent
NEVER:
- never delete a test, never `.skip` a live contract, never relax an assertion that still expresses a live contract (row counts, absolute-URL forms, landmark counts, clipboard equality, AC1_TERMS cell-only) — a strict-mode violation is resolved by a selector scoped to the one element the contract means, never by `.first()` to swallow a duplicate
- never edit `tests/sprint-06-guides-boundary-changelog/**` — the boundary fix is content-only; the lane spec and every other sprint-06 lane file belong to landed tasks
- never edit any spec file outside the 15 earlier-sprint files in the inventory
- never improvise a second boundary wording — a different reword re-opens ORI-CONT-004 review questions; f042f5eb's exact bytes are the reviewed answer
- never touch `playwright.config.ts` (retries stay pinned 0), `package.json`, `pnpm-lock.yaml`, planning artifacts, `human-flows.json`, `gate-plan.json`, `.kb-run-sprint/**`, or `.github/**`
- never claim the acceptance from a filtered run — `--grep`, single-project, or scoped invocations are iteration tools only; the acceptance run is the full `pnpm e2e:docs`
- never paper over a product regression as a "stale expectation" — prove which side is wrong before editing either
STRICTLY:
- TDD_MODE is skipped because RED is already captured twice: the committed fresh-run log records 45 earlier-sprint red at trunk 3fa9f98c, and f042f5eb's cycle-1 evidence records the boundary lane's 3-instance RED on the same trunk prose
- stale-truth lanes (start here; each update cites its source): #18 registry-item-reference-pages (GBC-001 repoint), #15 getting-started (.mdx path), #14 boundary-content (heading text), #16 orientation-content (obsolete negative guard becomes the positive /guides/troubleshooting expectation), #9 ledger-filter-island (second landmark is the sprint-05 search dialog), #4/#6 bulk-add strict-mode (scope past rnr-copy-button, keep URL-text + clipboard assertions), #2 home aside (identify the landed surface rendering it, then scope or update with citation)
- investigation lanes (product may be wrong — decide with evidence): #5/#10 ledger docs-cell timeouts, #3 renderedTypes collapse to 1, #7 112-vs-56 triggers, #13 panels absent from initial HTML, #8/#11 mobile tab-click interception, #12 crawl purity (find the two offending forms; if on the new /guides /porting /changelog pages, the absolute-form content fix is the product edit), #19 mobile token-table scroll geometry
- runner constraints already paid for: port 4321 discipline (CI=1; sweep orphan previews first — a squatted port reports a port error instead of results); fresh worktrees need the gitignored generated `apps/docs/src/data/registry-items.json` (`pnpm registry:build && pnpm gallery:manifest && pnpm exec tsx scripts/docs-data/prebuild.ts`, never committed); rtk tees Playwright's JSON reporter to `~/Library/Application Support/rtk/tee/*_playwright.log` — capture the tee path into evidence; biome can OOM under pnpm wrappers (use `./node_modules/.bin/biome`, retry once)
- the full suite runs ~25m (up to 4h if the quickstart native matrix executes); single-lane invocations plus the boundary-lane --grep are the fast loops
- verify commands are focused by contract: each anchors exactly one write_allowed lane spec; the aggregate full-suite green (exit 0, retries 0, zero failures) is an evidence expectation recorded at implementation and re-checked by the human gate — no single verify command covers it

## Specification
Objective: take `pnpm e2e:docs` from 48 failed / 434 passed (retries 0) to exit 0 with retries 0
and ZERO failures — by dispositioning each of the 45 earlier-sprint failures against verified
current product truth (lane update with citation) or against the live contract the product
breaks (product fix with the proving assertion), and by re-applying the proven f042f5eb
boundary reword.
Success state: the full suite runs green across chromium-desktop, chromium-mobile, and
chromium-nojs — all 48 inventoried failures closed; the disposition ledger enumerates every
failure's closing rule with its citation or proof; gate step 5's own command passes: exit 0,
retries 0.

## Acceptance Criteria
### AC-1: full suite green — all 48 gone, exit 0 [PRIMARY]
  GIVEN: the candidate worktree carries this task's dispositions (the 15 earlier-sprint lanes dispositioned by rule a or b, and the f042f5eb Callout reword re-applied) and the real registry + docs build of the candidate serves the Playwright-owned preview
  WHEN:  the full docs e2e suite runs (`pnpm e2e:docs` — registry build, docs build, Playwright over the built preview, chromium-desktop + chromium-mobile + chromium-nojs, retries pinned 0 by playwright.config.ts)
  THEN:  the run reports 0 failures and exits 0 with retries: 0 — every one of the 48 inventoried failures green in the same run, including the three boundary-tables.spec.ts:103 FLOW-DOCS-04 AC-1 instances and all 15 earlier-sprint spec files in every project they run under; the verify command anchors the densest write_allowed lane (ledger, 6 of the 45) — the aggregate full-suite run is captured as evidence at implementation and re-checked by the human gate, since no single verify command covers it
  FLOW_REF: null
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects
  SURFACE_POLICY: null
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/ledger.spec.ts
  TEST_FUNCTION: null
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-01-docs-spike-skeleton/ledger.spec.ts
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a lane is silenced by removing or skipping its failing assertion while the contract it expresses is still live — the underlying product truth is unchanged and the same expectation re-fails under the reviewer re-run', 'a stale lane is repointed to a destination that was never reviewed (a hand-invented URL, heading, or count) — the update carries no citable landed source', 'the Callout prose keeps the literal token useChat in a main p (the reword skipped, partial, or improvised differently) — the three boundary-tables.spec.ts:103 instances stay red and the suite cannot exit 0', 'a product regression is papered over as a stale expectation (ledger rows genuinely lost their docs links, install panels became client-only, the sticky header physically covers the install tabs) — the live contract is silently dropped while the suite reports green', 'GREEN is claimed from a filtered run (--grep, a single project, or a scoped invocation) — the frozen lanes re-fail on the first unfiltered full-suite run']
        EVIDENCE: file_artifact
        - START_REF: trunk_with_48_frozen_failures
          ACTION: ['prove the boundary segment RED first: on the candidate before the reword, run the boundary-lane --grep and record the 3 failing instances on the trunk prose', 'land the dispositions and exactly the f042f5eb reword; rerun the boundary-lane --grep and record 15/15 green, retries 0', 'record the aggregate full-suite run as evidence: pnpm e2e:docs on the candidate (registry build + docs build + Playwright over the built preview, all three chromium projects, retries 0) with exit code, per-project counts, and the complete failing-test list — the aggregate is an evidence expectation (no single verify command covers it), re-checked by the human gate']
          MUST_OBSERVE: ['the boundary segment flips 3 failing instances -> boundary-tables.spec.ts 15/15 passing, retries 0, with the reword byte-identical to f042f5eb', 'the full run completes the suite (516 tests at planning time; all three chromium projects) with retries 0 — never overridden on the CLI', '0 failures in the final summary — every one of the 48 inventoried failures green in the same run: the 15 earlier-sprint spec files (tests/sprint-01-docs-spike-skeleton/{component-page,home,ledger}.spec.ts, tests/sprint-02-shell-hero/item-install-copy.spec.ts, tests/sprint-03-family-browse/{ledger-filter-island,verdict-badge-wiring}.spec.ts, tests/sprint-04-generated-reference/{exact-absolute-url-command-copy,site-crawl,tab-panels-in-initial-html}.spec.ts, tests/sprint-05-orient-search/{boundary-content,getting-started-engine-decision,orientation-content,quickstart-chat-screen,registry-item-reference-pages,token-presentation}.spec.ts) plus the 3 boundary instances', 'the command exits 0 with retries: 0 — the exact acceptance of sprint-06 human-gate step 5', 'green/run.json binds the candidate SHA, the exact command `pnpm e2e:docs`, the exit code, the per-project pass/fail counts, the failing-test list (empty), and the rtk tee log path']
          MUST_NOT_OBSERVE: ['a deleted test, a .skip on a live contract, or an assertion relaxed past the contract it still owes', 'any CLI retry flag, any project filter, or any --grep narrowing the acceptance run', 'any failure anywhere in the suite — there is no carve-out: all 48 must be green in the one run', 'an empty or hand-authored failing-test list standing in for the parsed Playwright results, or a green summary copied from a scoped loop instead of the full suite']

### AC-2: every disposition is evidenced; no contract regressed; scope respected
  GIVEN: the candidate diff against the review base and the disposition ledger at .tmp/FIX-GBC-GATE-1/dispositions.json
  WHEN:  the diff is audited hunk-by-hunk against the committed fresh-run inventory and the ledger
  THEN:  every one of the 16 inventoried failure groups (the 15 earlier-sprint spec files plus the boundary lane) is closed by rule (a) stale-update-with-citation or rule (b) product-fix-with-proving-assertion — the boundary group by exactly the f042f5eb reword; every spec hunk leaves its contract semantically intact (same URL/text/count/clipboard/landmark assertions, updated only to verified truth); every product-file hunk names the failing assertion that proved the lane right; the tracked diff touches only write_allowed paths; and the preserved static gates pass
  FLOW_REF: null
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects; the reviewer additionally source-traces every diff hunk against the committed fresh-run inventory and the disposition ledger, and the preserved static gates (tsc --noEmit, biome ci .) stay in the task's Verification Gates
  SURFACE_POLICY: null
  TEST_FILE: tests/sprint-05-orient-search/boundary-content.spec.ts
  TEST_FUNCTION: null
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts
  SCENARIO:
        NEGATIVE_CONTROL: would fail if ['a failing assertion is removed or relaxed while the contract it expresses is still live — the audit finds the hunk with no citable truth source and no proving assertion', 'the boundary reword deviates from the f042f5eb bytes or touches any table row — the lane may pass today but the reviewed fix was not what landed', 'a product file changes with no lane proving it wrong (an unjustified edit riding the task)', 'a spec file outside the 15-file inventory or a write-prohibited path appears in the tracked diff', 'the disposition ledger omits a group or invents a citation that names no landed artifact']
        EVIDENCE: file_artifact
        - START_REF: trunk_with_48_frozen_failures
          ACTION: ['enumerate the tracked diff (git diff --name-only against the review base) and confirm every path is write_allowed', 'for each of the 16 groups, read the disposition ledger entry and the cited source (landed task/commit/manuscript) or the quoted proving assertion; diff the owns-vs-does-not-own.mdx hunk against f042f5eb byte-for-byte', 'run pnpm exec biome ci . and pnpm exec tsc --noEmit on the candidate']
          MUST_OBSERVE: ['dispositions.json enumerates all 16 groups, each closed by exactly one rule with its citation (rule a: the landed task id and/or commit that superseded the pinned truth) or its proof (rule b: the quoted failing assertion that the product broke)', 'the owns-vs-does-not-own.mdx hunk is byte-identical to f042f5eb\'s Callout-body reword — one line changed, no table row touched, boundary-tables.spec.ts untouched', 'every stale-update hunk carries an inline citation comment naming its reviewed-truth source; the bulk-add lanes still assert the exact base-URL text AND the clipboard copy; crawl purity still demands 0 non-absolute command forms against the reviewed surface', 'every product-file hunk names its proving assertion in the handoff; the tracked diff touches only the 15 spec files, owns-vs-does-not-own.mdx, tests/harness/** where a lane\'s failure was proven harness-caused, evidenced product files under apps/docs/src/**, and .tmp/FIX-GBC-GATE-1/**', 'biome ci and tsc --noEmit exit 0 on the candidate (or a stash-proven pre-existing failure is recorded, never assumed)']
          MUST_NOT_OBSERVE: ['an uncited repoint, a count relaxed without a reviewed source, or a selector broadened past the one element the contract names', 'a product edit justified only by preference — every product hunk must quote the assertion that failed', 'a write-prohibited path (the sprint-06 lane specs, playwright.config.ts, package.json, planning artifacts) in the diff', 'a disposition ledger that is empty or omits one of the 16 groups']

## Test Criteria
- TC-1: the acceptance outcome sampled on a second write_allowed lane — the ORI-AST-008 registry-item-reference-pages spec (the GBC-001 repoint lane) passes in every project it runs under; the aggregate `pnpm e2e:docs` exit-0 / retries-0 / zero-failure run is recorded as evidence at implementation and re-checked by the human gate  (maps_to: AC-1)
- TC-2: a focused single-file run on the mobile-overlay investigation lane (item-install-copy, the FLOW-GEND-20 lane whose click the page header intercepts) passes across all projects after its disposition  (maps_to: AC-1)
- TC-3: the source-path rule-(a) lane (getting-started-engine-decision, the owns-vs-does-not-own `.mdx` ENOENT lane) passes after its citation-backed update, and the tracked diff against the review base touches only write_allowed paths  (maps_to: AC-2)

## Reading List
- .tmp/sprint-06-guides-boundary-changelog/e2e-fresh-20261006T-run.log [GROUND TRUTH] — the committed full-run inventory (48 failed / 434 passed / 34 skipped, retries 0)
- .tmp/FIX-GBC-003-1/cycle-1/ (branch FIX-GBC-003-1, commit f042f5eb) — the proven boundary RED/GREEN evidence this task re-applies
- tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts [READ-ONLY] — AC1_TERMS cell-only contract (line 45)
- tests/sprint-01-docs-spike-skeleton/ledger.spec.ts — the densest frozen lane (6 failing tests)
- GBC-014-post-integration-journey-proofs-docs-integrator-arc-docs-themer-arc.md — the handoff whose scope_impact[0] asked for exactly this task

## Guardrails
WRITE-ALLOWED:
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY)
- tests/sprint-01-docs-spike-skeleton/home.spec.ts (MODIFY)
- tests/sprint-01-docs-spike-skeleton/ledger.spec.ts (MODIFY)
- tests/sprint-02-shell-hero/item-install-copy.spec.ts (MODIFY)
- tests/sprint-03-family-browse/ledger-filter-island.spec.ts (MODIFY)
- tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts (MODIFY)
- tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts (MODIFY)
- tests/sprint-04-generated-reference/site-crawl.spec.ts (MODIFY)
- tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts (MODIFY)
- tests/sprint-05-orient-search/boundary-content.spec.ts (MODIFY)
- tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts (MODIFY)
- tests/sprint-05-orient-search/orientation-content.spec.ts (MODIFY)
- tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts (MODIFY)
- tests/sprint-05-orient-search/registry-item-reference-pages.spec.ts (MODIFY)
- tests/sprint-05-orient-search/token-presentation.spec.ts (MODIFY)
- apps/docs/src/content/docs/owns-vs-does-not-own.mdx (MODIFY — exactly the f042f5eb Callout-body reword; tables and every other byte untouched)
- tests/harness/** (MODIFY — only where a lane's failure is proven harness-caused, each edit named in the handoff)
- apps/docs/src/pages/** (MODIFY — only files proven wrong by a lane, each with its proving assertion)
- apps/docs/src/components/** (MODIFY — same rule)
- apps/docs/src/layouts/** (MODIFY — same rule)
- apps/docs/src/content/** (MODIFY — same rule; e.g. non-absolute command copy on the new /guides /porting /changelog pages)
- apps/docs/src/data/** (MODIFY — same rule)
- apps/docs/src/styles/** (MODIFY — same rule)
- .tmp/FIX-GBC-GATE-1/** (NEW — evidence: dispositions.json, red/green segment logs, green/run.json, run logs)
WRITE-PROHIBITED:
- tests/sprint-06-guides-boundary-changelog/** (the boundary fix is content-only; the lane specs belong to landed tasks)
- tests/** — every other spec file outside the 15-file inventory
- tests/tooling/** and tests/*.test.ts (the vitest logic lanes are not in scope)
- playwright.config.ts (retries pinned 0; suite shape unchanged)
- package.json · pnpm-lock.yaml (no dependency or script changes)
- apps/example/** · packages/**
- scripts/** (build/gate scripts are not in scope)
- .spec/** · human-flows.json · gate-plan.json · .kb-run-sprint/** · .github/**

## Design
References: ['.tmp/sprint-06-guides-boundary-changelog/e2e-fresh-20261006T-run.log (the committed ground-truth inventory)', 'GBC-014 handoff scope_impact[0] (the source item)', 'SPRINT.md human gate step 5 (the target)', 'f042f5eb cycle-1 evidence (the proven boundary fix)']
Interaction notes: The frozen-lane remediation GBC-014's handoff asked for, narrowed by the two groups FIX-SHELL-15-16 and FIX-ORI-CI-003-1 already cleared, extended to own the three boundary instances whose fix f042f5eb already proved on the FIX-GBC-003-1 branch. The disposition rule is binary — stale-update-with-citation or product-fix-with-proof — because the failure modes split cleanly: reviewed truth moved (apex domain, seam repoint, .mdx rewrite, new routes/nav, search dialog, copy-button affordance) versus live contracts the product now breaks (docs links, server-rendered panels, mobile overlay, command-form purity, scroll geometry, AC1_TERMS in prose). The quickstart lane differs only in mechanism (env-gated by design): its fail-closed refusal is itself a live contract, so it closes by providing the documented env or an orchestrator-approved explicit skip — never by deleting the gate.
Pattern: lane remediation against a committed inventory (FIX-ORI-SUITE-2 aggregate precedent: enumerate -> disposition -> full-suite acceptance), with the scoped 15-file invocation and the boundary-lane --grep as the fast loops and the full pnpm e2e:docs as the only acceptance
Anti-pattern: blanket re-baselining (relaxing counts to whatever the product currently renders without a reviewed-truth citation) — the frozen-lane failure mode wearing a green badge

## Verification Gates
Every verify command anchors exactly ONE write_allowed lane (the flow validator's focused-proof rule — no broad suite command, no multi-lane chains, and boundary-tables.spec.ts cannot anchor a verify because it is WRITE-PROHIBITED):
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-01-docs-spike-skeleton/ledger.spec.ts (AC-1 anchor — the densest lane, 6 of the 45)
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts (AC-2 anchor — the purest rule-(a) citation lane)
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-05-orient-search/registry-item-reference-pages.spec.ts (TC-1 anchor)
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts (TC-2 anchor)
- pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts (TC-3 anchor)
- pnpm exec tsc --noEmit · pnpm exec biome ci . (preserved static gates — never a requirement verify command)
- AGGREGATE (evidence expectation, NOT a verify command): the full `pnpm e2e:docs` run — all three chromium projects, 0 failures, exit 0, retries 0 — is captured at implementation under `.tmp/FIX-GBC-GATE-1/green/` and re-checked by the human gate (SPRINT.md gate step 5); no single verify command covers it

## Dependencies
Depends on: none (every other sprint-06 task is completed; sequenced `when: next`)
Blocks:     the sprint-06 human gate's step 5 outright — this task owns all 48 failures, the three boundary instances via the f042f5eb-proven reword

## Amendments
- 2026-10-06 (pre-publication, orchestrator): scope extended from the 45 earlier-sprint failures to all 48 — the three boundary-tables.spec.ts:103 instances join via the f042f5eb-proven content reword; acceptance tightened from "modulo the boundary lane" to 0 failures / exit 0
- 2026-10-06 (repair 3, publish-plan flow validator): every verify command re-anchored to exactly one write_allowed lane spec (BROAD_PROOF_COMMAND findings on the former `pnpm e2e:docs` and static-gate verifies and the multi-lane chain); the aggregate full-suite green stays in the AC/TC descriptions and evidence expectations and is re-checked by the human gate

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FIX-GBC-GATE-1",
 "tdd_mode": "skipped",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": false,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "trunk_with_48_frozen_failures": {
   "description": "An isolated candidate worktree of the sprint-06 trunk carrying the committed fresh full-suite inventory at .tmp/sprint-06-guides-boundary-changelog/e2e-fresh-20261006T-run.log (48 failed / 434 passed / 34 skipped, retries 0): 45 of the 48 failures sit in exactly 15 spec files from sprints 01-05, and the other 3 are boundary-tables.spec.ts:103 FLOW-DOCS-04 AC-1 instances whose root cause is verified — commit a1045aa3 (ORI-CONT-004) put the literal token useChat into the Callout prose at owns-vs-does-not-own.mdx:90 while AC1_TERMS are table-cell-only. The docs build serves the Playwright-owned preview and every browser context starts with empty storage.",
   "seed_method": "cli",
   "records": [
    "The boundary fix is pre-proven on branch kb-run-sprint/sprint-06-guides-boundary-changelog/FIX-GBC-003-1, commit f042f5eb: the one-line Callout-body reword (around AI SDK v7 useChat, streaming -> around the AI SDK v7 chat hook, streaming) flipped the lane RED 3 fails -> GREEN 15/15, retries 0; the task re-applies exactly those bytes (evidence at .tmp/FIX-GBC-003-1/cycle-1/).",
    "Port 4321 discipline: run with CI=1 so Playwright owns the strict-port preview, and sweep orphan previews first (lsof -nP -iTCP:4321 -sTCP:LISTEN) — a squatted port makes the run report a port error instead of results (GBC-018's recorded trap).",
    "A fresh worktree needs the gitignored generated apps/docs/src/data/registry-items.json before pnpm exec tsc --noEmit: pnpm registry:build && pnpm gallery:manifest && pnpm exec tsx scripts/docs-data/prebuild.ts — regenerate, never commit.",
    "The rtk hook tees Playwright's JSON reporter output to ~/Library/Application Support/rtk/tee/*_playwright.log rather than the redirected shell log — capture the tee path into evidence.",
    "The quickstart lane's heavyweight matrix (quickstart-chat-screen.spec.ts:205, chromium-desktop only, 4h timeout) fails closed without RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL and OPENAI_API_KEY — it refuses a reduced target matrix by design.",
    "The full suite runs ~25m (up to 4h if the quickstart native matrix actually executes); the scoped 15-file Playwright invocation and the boundary-lane --grep are the fast iteration loops."
   ]
  }
 },
 "guardrails": {
  "write_allowed": [
   "tests/sprint-01-docs-spike-skeleton/component-page.spec.ts",
   "tests/sprint-01-docs-spike-skeleton/home.spec.ts",
   "tests/sprint-01-docs-spike-skeleton/ledger.spec.ts",
   "tests/sprint-02-shell-hero/item-install-copy.spec.ts",
   "tests/sprint-03-family-browse/ledger-filter-island.spec.ts",
   "tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts",
   "tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts",
   "tests/sprint-04-generated-reference/site-crawl.spec.ts",
   "tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts",
   "tests/sprint-05-orient-search/boundary-content.spec.ts",
   "tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts",
   "tests/sprint-05-orient-search/orientation-content.spec.ts",
   "tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts",
   "tests/sprint-05-orient-search/registry-item-reference-pages.spec.ts",
   "tests/sprint-05-orient-search/token-presentation.spec.ts",
   "apps/docs/src/content/docs/owns-vs-does-not-own.mdx (MODIFY - exactly the f042f5eb Callout-body reword; tables and every other byte untouched)",
   "tests/harness/** (MODIFY - only where a lane's failure is proven harness-caused, each edit named in the handoff)",
   "apps/docs/src/pages/** (MODIFY - only files proven wrong by a lane, each with its proving assertion)",
   "apps/docs/src/components/** (MODIFY - same rule)",
   "apps/docs/src/layouts/** (MODIFY - same rule)",
   "apps/docs/src/content/** (MODIFY - same rule)",
   "apps/docs/src/data/** (MODIFY - same rule)",
   "apps/docs/src/styles/** (MODIFY - same rule)",
   ".tmp/FIX-GBC-GATE-1/** (NEW - evidence: dispositions.json, green/run.json, run logs)"
  ],
  "write_prohibited": [
   "tests/sprint-06-guides-boundary-changelog/**",
   "tests/** (every spec file outside the 15-file inventory)",
   "tests/tooling/**",
   "playwright.config.ts",
   "package.json",
   "pnpm-lock.yaml",
   "apps/example/**",
   "packages/**",
   "scripts/**",
   ".spec/**",
   "human-flows.json",
   "gate-plan.json",
   ".kb-run-sprint/**",
   ".github/**"
  ]
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "name": "full suite green - all 48 gone, exit 0",
   "primary": true,
   "description": "GIVEN the candidate worktree carries this task's dispositions (the 15 earlier-sprint lanes dispositioned by rule a or b, and the f042f5eb Callout reword re-applied) and the real registry + docs build of the candidate serves the Playwright-owned preview WHEN the full docs e2e suite runs (pnpm e2e:docs - registry build, docs build, Playwright over the built preview, chromium-desktop + chromium-mobile + chromium-nojs, retries pinned 0 by playwright.config.ts) THEN the run reports 0 failures and exits 0 with retries: 0 - every one of the 48 inventoried failures green in the same run, including the three boundary-tables.spec.ts:103 FLOW-DOCS-04 AC-1 instances and all 15 earlier-sprint spec files in every project they run under; the verify command anchors the densest write_allowed lane (ledger, 6 of the 45) - the aggregate full-suite run is captured as evidence at implementation and re-checked by the human gate, since no single verify command covers it",
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/ledger.spec.ts",
   "test_function": null,
   "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-01-docs-spike-skeleton/ledger.spec.ts",
   "test_tier": "e2e",
   "verification_service": "real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
   "surface_policy": null,
   "maps_to_ac": null,
   "scenario": {
    "id": "SC-FIX-GBC-GATE-1-1",
    "use_case_ref": "UC-DOCS-03",
    "ac_ref": "AC-1",
    "tier": "visible",
    "primary": true,
    "test_tier": "e2e",
    "verification_service": "real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "a lane is silenced by removing or skipping its failing assertion while the contract it expresses is still live - the underlying product truth is unchanged and the same expectation re-fails under the reviewer re-run",
      "a stale lane is repointed to a destination that was never reviewed (a hand-invented URL, heading, or count) - the update carries no citable landed source",
      "the Callout prose keeps the literal token useChat in a main p (the reword skipped, partial, or improvised differently) - the three boundary-tables.spec.ts:103 instances stay red and the suite cannot exit 0",
      "a product regression is papered over as a stale expectation (ledger rows genuinely lost their docs links, install panels became client-only, the sticky header physically covers the install tabs) - the live contract is silently dropped while the suite reports green",
      "GREEN is claimed from a filtered run (--grep, a single project, or a scoped invocation) - the frozen lanes re-fail on the first unfiltered full-suite run"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true,
     "path": ".tmp/FIX-GBC-GATE-1/green/run.json"
    },
    "cases": [
     {
      "start_ref": "trunk_with_48_frozen_failures",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "prove the boundary segment RED first: on the candidate before the reword, run the boundary-lane --grep and record the 3 failing instances on the trunk prose",
        "land the dispositions and exactly the f042f5eb reword; rerun the boundary-lane --grep and record 15/15 passing, retries 0",
        "record the aggregate full-suite run as evidence: pnpm e2e:docs on the candidate (registry build + docs build + Playwright over the built preview, all three chromium projects, retries 0) with exit code, per-project counts, and the complete failing-test list - the aggregate is an evidence expectation (no single verify command covers it), re-checked by the human gate"
       ]
      },
      "end_state": {
       "must_observe": [
        "the boundary segment flips 3 failing instances -> boundary-tables.spec.ts 15/15 passing, retries 0, with the reword byte-identical to f042f5eb",
        "the full run completes the suite (516 tests at planning time; all three chromium projects) with retries 0 - never overridden on the CLI",
        "0 failures in the final summary - every one of the 48 inventoried failures green in the same run: the 15 earlier-sprint spec files (tests/sprint-01-docs-spike-skeleton/{component-page,home,ledger}.spec.ts, tests/sprint-02-shell-hero/item-install-copy.spec.ts, tests/sprint-03-family-browse/{ledger-filter-island,verdict-badge-wiring}.spec.ts, tests/sprint-04-generated-reference/{exact-absolute-url-command-copy,site-crawl,tab-panels-in-initial-html}.spec.ts, tests/sprint-05-orient-search/{boundary-content,getting-started-engine-decision,orientation-content,quickstart-chat-screen,registry-item-reference-pages,token-presentation}.spec.ts) plus the 3 boundary instances",
        "the command exits 0 with retries: 0 - the exact acceptance of sprint-06 human-gate step 5",
        "green/run.json binds the candidate SHA, the exact command `pnpm e2e:docs`, the exit code, the per-project pass/fail counts, the failing-test list (empty), and the rtk tee log path"
       ],
       "must_not_observe": [
        "a deleted test, a .skip on a live contract, or an assertion relaxed past the contract it still owes",
        "any CLI retry flag, any project filter, or any --grep narrowing the acceptance run",
        "any failure anywhere in the suite - there is no carve-out: all 48 must be green in the one run",
        "an empty or hand-authored failing-test list standing in for the parsed Playwright results, or a green summary copied from a scoped loop instead of the full suite"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "AC-2",
   "type": "acceptance_criterion",
   "name": "every disposition is evidenced; no contract regressed; scope respected",
   "primary": false,
   "description": "GIVEN the candidate diff against the review base and the disposition ledger at .tmp/FIX-GBC-GATE-1/dispositions.json WHEN the diff is audited hunk-by-hunk against the committed fresh-run inventory and the ledger THEN every one of the 16 inventoried failure groups (the 15 earlier-sprint spec files plus the boundary lane) is closed by rule (a) stale-update-with-citation or rule (b) product-fix-with-proving-assertion - the boundary group by exactly the f042f5eb reword; every spec hunk leaves its contract semantically intact (same URL/text/count/clipboard/landmark assertions, updated only to verified truth); every product-file hunk names the failing assertion that proved the lane right; the tracked diff touches only write_allowed paths; and the preserved static gates pass",
   "flow_ref": null,
   "test_file": "tests/sprint-05-orient-search/boundary-content.spec.ts",
   "test_function": null,
   "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts",
   "test_tier": "e2e",
   "verification_service": "real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects; the reviewer additionally source-traces every diff hunk against the committed fresh-run inventory and the disposition ledger, and the preserved static gates (tsc --noEmit, biome ci .) stay in the task's Verification Gates",
   "surface_policy": null,
   "maps_to_ac": null,
   "scenario": {
    "id": "SC-FIX-GBC-GATE-1-2",
    "use_case_ref": "UC-DOCS-03",
    "ac_ref": "AC-2",
    "tier": "visible",
    "primary": false,
    "test_tier": "e2e",
    "verification_service": "real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects; the reviewer additionally source-traces every diff hunk against the committed fresh-run inventory and the disposition ledger, and the preserved static gates (tsc --noEmit, biome ci .) stay in the task's Verification Gates",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "a failing assertion is removed or relaxed while the contract it expresses is still live - the audit finds the hunk with no citable truth source and no proving assertion",
      "the boundary reword deviates from the f042f5eb bytes or touches any table row - the lane may pass today but the reviewed fix was not what landed",
      "a product file changes with no lane proving it wrong (an unjustified edit riding the task)",
      "a spec file outside the 15-file inventory or a write-prohibited path appears in the tracked diff",
      "the disposition ledger omits a group or invents a citation that names no landed artifact"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true,
     "path": ".tmp/FIX-GBC-GATE-1/dispositions.json"
    },
    "cases": [
     {
      "start_ref": "trunk_with_48_frozen_failures",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "enumerate the tracked diff (git diff --name-only against the review base) and confirm every path is write_allowed",
        "for each of the 16 groups, read the disposition ledger entry and the cited source (landed task/commit/manuscript) or the quoted proving assertion; diff the owns-vs-does-not-own.mdx hunk against f042f5eb byte-for-byte",
        "run pnpm exec biome ci . and pnpm exec tsc --noEmit on the candidate"
       ]
      },
      "end_state": {
       "must_observe": [
        "dispositions.json enumerates all 16 groups, each closed by exactly one rule with its citation (rule a: the landed task id and/or commit that superseded the pinned truth) or its proof (rule b: the quoted failing assertion that the product broke)",
        "the owns-vs-does-not-own.mdx hunk is byte-identical to f042f5eb's Callout-body reword - one line changed, no table row touched, boundary-tables.spec.ts untouched",
        "every stale-update hunk carries an inline citation comment naming its reviewed-truth source; the bulk-add lanes still assert the exact base-URL text AND the clipboard copy; crawl purity still demands 0 non-absolute command forms against the reviewed surface",
        "every product-file hunk names its proving assertion in the handoff; the tracked diff touches only the 15 spec files, owns-vs-does-not-own.mdx, tests/harness/** where a lane's failure was proven harness-caused, evidenced product files under apps/docs/src/**, and .tmp/FIX-GBC-GATE-1/**",
        "biome ci and tsc --noEmit exit 0 on the candidate (or a stash-proven pre-existing failure is recorded, never assumed)"
       ],
       "must_not_observe": [
        "an uncited repoint, a count relaxed without a reviewed source, or a selector broadened past the one element the contract names",
        "a product edit justified only by preference - every product hunk must quote the assertion that failed",
        "a write-prohibited path (the sprint-06 lane specs, playwright.config.ts, package.json, planning artifacts) in the diff",
        "a disposition ledger that is empty or omits one of the 16 groups"
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
   "description": "the acceptance outcome sampled on a second write_allowed lane - the ORI-AST-008 registry-item-reference-pages spec (the GBC-001 repoint lane) passes in every project it runs under; the aggregate pnpm e2e:docs exit-0 / retries-0 / zero-failure run is recorded as evidence at implementation and re-checked by the human gate",
   "flow_ref": null,
   "test_file": "tests/sprint-05-orient-search/registry-item-reference-pages.spec.ts",
   "test_function": null,
   "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-05-orient-search/registry-item-reference-pages.spec.ts",
   "test_tier": "e2e",
   "verification_service": "real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
   "surface_policy": null,
   "maps_to_ac": "AC-1"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "primary": false,
   "description": "a focused single-file run on the mobile-overlay investigation lane (item-install-copy, the FLOW-GEND-20 lane whose click the page header intercepts) passes across all projects after its disposition",
   "flow_ref": null,
   "test_file": "tests/sprint-02-shell-hero/item-install-copy.spec.ts",
   "test_function": null,
   "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-02-shell-hero/item-install-copy.spec.ts",
   "test_tier": "e2e",
   "verification_service": "real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects",
   "surface_policy": null,
   "maps_to_ac": "AC-1"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "primary": false,
   "description": "the source-path rule-(a) lane (getting-started-engine-decision, the owns-vs-does-not-own .mdx ENOENT lane) passes after its citation-backed update, and the tracked diff against the review base touches only write_allowed paths",
   "flow_ref": null,
   "test_file": "tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts",
   "test_function": null,
   "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts",
   "test_tier": "e2e",
   "verification_service": "real ordered docs build (registry + gallery + astro) of the candidate, served by the Playwright-owned strict-port preview at http://localhost:4321, driven by Playwright Chromium in the chromium-desktop, chromium-mobile and chromium-nojs projects; the reviewer additionally source-traces every diff hunk against the committed fresh-run inventory and the disposition ledger, and the preserved static gates (tsc --noEmit, biome ci .) stay in the task's Verification Gates",
   "surface_policy": null,
   "maps_to_ac": "AC-2"
  }
 ]
}
-->
