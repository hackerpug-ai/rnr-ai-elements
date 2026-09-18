---
sequence: 5
timeline: Phase 2
status: planned
sprint_id: sprint-05-orient-search
planned_from_roadmap_sha: e1238927
planned_from_source_sha: 38034e972490945b684f5bd5a706bca0479dc659
planned_at: 2026-09-14
---

# Sprint 05: orient-search

**Status:** in_progress  
**Sequence:** 5  
**Timeline:** Phase 2

## Overview

Give a first-time integrator a complete orientation path: Introduction, one engine decision, registry-specific installation and CLI guidance, Theming and Dark mode, one seed-data Quickstart, and a handoff to a real AI SDK v7 example. Connect that content to persistent engine tabs, live theme values, built-site search, registry destinations, and useful missing-page recovery.

Absorb the smallest real prerequisites that make those paths executable: the published PromptInput import graph, both clean Expo consumers, a substantive ownership explanation, actual 404 recovery, the real example API and native composition, canonical registry hosting, and source-bound build and publication checks. This does not add another tutorial or a demonstrated use case. Sprint 06 may deepen the ownership tables; Sprint 11 may deepen resilience and accessibility; later delivery work may harden deployment and rollback.

The plan contains **36 tasks / 131 points**, compared with the roadmap sketch of approximately 12 items / 34–55 points: **76 points above its upper bound**. It retains 13 locked flows, 13 numbered gate steps, and four post-integration journey proofs. Estimates describe the approved prerequisite absorption rather than forcing the work into the sketch.

All implementation, functional RED, product verification, hosted acceptance, and deployment proof are future work. This document records a plan, not a passing gate or release.

## Human Testing Gate

**Gate:** A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

**Entrypoint:** docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction

**Before:** The source snapshot at the planned source SHA already contains Theming and shared layout, header, table, and tab controls. Introduction, Installation, CLI, Dark mode, Quickstart, the ownership-boundary route, and a custom 404 route are absent in that inspected snapshot. Existing Theming content still needs engine-correct claims and the real paired TokenTable. These are planning observations from the source, not current browser results. Each owner must observe the actual functional failure before implementation; the stale roadmap claim that all of these controls are absent is not a RED oracle.

**Success state:** A visitor reads useful, source-backed bodies instead of empty shells, chooses the correct engine once, follows literal registry commands, reads the same information without JavaScript, sees live theme changes without a flash, and reaches real content through keyboard search or missing-page recovery. The single Quickstart reaches a visible seed-data screen and then a separately verified real-provider example. Acceptance also requires the discriminating build checks and fresh native, provider, public-registry, and hosted evidence specified below.

**Demonstrates:** UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)

**Fixed carryover:** UC-GEND-07 AC-2; TR-12 (full); CAP-DOCS-01 snippet/link build integration. Boundary, recovery, API, and publication work support this projection; they do not expand the demonstrated-use-case list.

## Test Deliverable

Execute the following locked checks against the candidate only after their declared prerequisites exist. Browser checks use the owned built preview at http://localhost:4321, not the development server. The exact flow records in `human-flows.json` retain the detailed preconditions, actions, observations, evidence, and teardown contracts. Every checkbox below starts unchecked.

<!-- TESTING-GATE-START -->

- [ ] 1. Open all five Getting started routes in a fresh browser over the built preview. Read the opening identity and registry-only distribution statement, follow the substantive ownership-boundary link, and answer the single engine question. Check NativeWind 4/Tailwind v3 versus Uniwind/Tailwind v4 with @theme. Select each engine and read its complete canonical conversation command inside the matching panel. Follow CLI, Theming, and Dark mode links; require real bodies and 200 responses. Repeat the reading checks on mobile and without JavaScript. Run `pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision`. Flow: `FLOW-DOCS-01-getting-started-engine-decision`. `exercises: ORI-CONT-004, ORI-AST-001, ORI-CONT-001, ORI-CONT-005, ORI-VIS-001`

- [ ] 2. Read /docs/theming, including the engine-scoped no-config statement, @theme mapping, Light and Dark columns, at least ten oklch occurrences, and distinct paired --primary values. Follow CLI and Dark mode links and the preserved #textclasscontext and #rendermarkdown anchors. Require source-correct seam descriptions, real bodies, 200 responses, and readable JavaScript-disabled content. RED must expose the missing contract, not claim that the existing Theming route is absent. Run `pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts --grep FLOW-DOCS-01-theming-and-section-nav`. Flow: `FLOW-DOCS-01-theming-and-section-nav`. `exercises: ORI-CONT-004, ORI-CONT-002, ORI-VIS-002`

- [ ] 3. Follow the single seed-data Quickstart. Execute its literal rnraielements.com commands for both engines in clean Expo 57 consumers, then observe the displayed screen on iOS, Android, and Web. Read its conclusion and follow the handoff to the separate real-provider apps/example live-chat screen. Require fresh, current-invocation proof for all six seed and six live engine/platform combinations, bound to the candidate and source hashes; local registry substitutions or older manifests fail. Run `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen`. Flow: `FLOW-DOCS-02-quickstart-chat-screen`. `exercises: ORI-CONT-004, ORI-CONT-003, ORI-RN-000, ORI-RN-001, ORI-RN-002, ORI-RN-003, ORI-RN-004, ORI-RN-005, ORI-AI-001, ORI-AI-002, ORI-DEP-001`

- [ ] 4. Open /docs/theming in light mode and use the actual theme toggle. Require root .dark without .light, color-scheme: dark, persisted rnr-theme=dark, background oklch(0.145 0 0), and changed live token swatches. Reload and inspect every captured frame from the first nonblank paint for dark-mode continuity. Toggle back and verify the complementary light state and persistence. Run `pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free`. Flow: `FLOW-SHELL-01-theme-toggle-persisted-flash-free`. `exercises: ORI-AST-003, ORI-VIS-002`

- [ ] 5. Use an empty-storage browser with a dark system preference. Cold-navigate to /docs/theming and require the dark root and color-scheme before the first paint, no light frame, and code background oklch(0.235 0 0). Repeat independent fresh visits to / and /components/message; do not reuse the persisted-theme case. Run `pnpm exec playwright test tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash`. Flow: `FLOW-SHELL-02-first-visit-prefers-dark-no-flash`. `exercises: ORI-AST-003`

- [ ] 6. Open /docs/introduction and press Meta+K on macOS or Control+K elsewhere. Require the modal dialog within 300ms, input focus, and a truthful loading state while the real index loads. Search streamdown, renderMarkdown, and dev client; inspect grouped results and live counts, then use the keyboard to visit real item and ownership destinations. Cover five item and three docs destinations plus indexed props/verdict text. Recover from a fresh unknown URL through the same search. Verify Escape restores the invoker and ordinary links remain usable without JavaScript. Run `pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate`. Flow: `FLOW-SHELL-07-cmdk-open-search-navigate`. `exercises: ORI-AST-010, ORI-AST-004, ORI-AST-008, ORI-AST-009, ORI-CONT-005, ORI-VIS-003, ORI-VIS-005`

- [ ] 7. Use a fresh context on /docs/introduction. Wait five seconds, hover real navigation, and soft-navigate through Installation and Registry without opening search; require zero Pagefind requests. Open search and observe actual same-origin Pagefind JavaScript and index requests. Close and reopen with the unchanged query; require reuse without additional requests. Confirm the JavaScript-disabled path loads no Pagefind resources and retains working links. Run `pnpm exec playwright test tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts --grep FLOW-SHELL-08-pagefind-lazy-load-on-first-open`. Flow: `FLOW-SHELL-08-pagefind-lazy-load-on-first-open`. `exercises: ORI-AST-010, ORI-AST-004`

- [ ] 8. Open Installation in a fresh context and verify its documented default. Select Uniwind and check rnr-engine storage, the root data-engine value, and every tab group. Soft-navigate to Quickstart, hard-load /components/message, and switch a later Quickstart block back to nativewind. Require all groups to synchronize across Installation, Quickstart, Message, home, and Components, with correct keyboard/ARIA behavior and no engine state in URLs. Run `pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages`. Flow: `FLOW-SHELL-13-engine-tab-persists-across-pages`. `exercises: ORI-AST-010, ORI-AST-002, ORI-VIS-001`

- [ ] 9. Fetch the original HTTP responses for Installation and /components/message. Require both complete labeled engine commands inside their corresponding panels before client execution. Disable JavaScript and read both stacked panels. Check unique tab/panel relationships across Quickstart groups; commands constructed only after load do not satisfy this flow. Run `pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html`. Flow: `FLOW-SHELL-14-tab-panels-in-initial-html`. `exercises: ORI-AST-010, ORI-AST-002, ORI-VIS-001`

- [ ] 10. Exercise the focused search contract on the real built index before custom-404 composition. Require zero initial Pagefind requests, dialog opening within 300ms, input focus, keyboard navigation, five item and three docs destinations, and indexed nearBottomThreshold and Conversation verdict text. Verify no-match recovery, literal HTML-shaped query rendering without created elements, soft-navigation reuse, unchanged-query reopen without extra loading, and Escape focus restoration. Run `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery`. Flow: `FLOW-SHELL-15-search-contract-before-recovery`. `exercises: ORI-AST-004`

- [ ] 11. Open Registry and verify 56 total items with category counts 39/11/6. Filter components by conversation, select each engine, and compare the displayed absolute command with the real clipboard. Follow component, UI, and library Docs links to their actual routes. Verify engine persistence, zero-result and clear behavior, the existing component-grid filter, and a JavaScript-disabled ledger with all 56 rows and both commands while inert controls stay hidden. Run `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls`. Flow: `FLOW-GEND-07-registry-ledger-controls`. `exercises: ORI-AST-007`

- [ ] 12. Visit a fresh unknown documentation URL. Read the useful recovery copy within the real header/footer shell and verify that emitted 404 HTML uses the system manuscript outside the docs collection. Open shared search within 300ms, focus the input, and navigate to Message with Enter. Check Escape focus restoration, Pagefind reuse, exclusion of 404 copy from the index, and retained theme controls. Without JavaScript, follow Components and Registry links. Real Worker HTTP 404 status belongs to the deployment proof. Run `pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery`. Flow: `FLOW-SHELL-16-not-found-search-recovery`. `exercises: ORI-AST-009`

- [ ] 13. Run the task-owned API integration selector against the actual Node 24 server and official OpenAI Responses endpoint. Require multiple nonempty incremental deltas with actual response/usage correlation; replay SDK-produced history containing a nonce and verify contextual follow-up. Reject malformed input, oversized requests, unsupported methods, and excess messages before provider calls. Verify failed startup and occupied-port preservation, genuine provider rejection followed by recovery, abort during unfinished generation, and a successful later request. Compile against the pinned real packages and tear down owned resources. This is API/hook-graph proof, not a claim that the whole example or native composition passed. Run `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`. Flow: `FLOW-DOCS-02-live-example-api-stream-history-abort`. `exercises: ORI-AI-001`

<!-- TESTING-GATE-END -->

### Supporting checks, not additional numbered gates

- `ORI-CARRYOVER-LEDGER`: Verify the existing UC-GEND-07 AC-2 ledger carryover with ORI-AST-007, ORI-AST-008, and ORI-VIS-004. Its locked functional proof is gate 11; this is not another flow.
- `ORI-CONT-TR12`: Use CONTRIBUTING to find the exact build, snippet, and link commands, content-style criteria, and behavior-to-registry-description review rule. ORI-CONT-006 owns this fixed TR-12 check.
- `ORI-PUBLIC-RECOVERY`: After accepted-version verification and controlled apex promotion, open the public Introduction, recover from a new missing path through search, and execute the literal registry commands against the final apex. ORI-DEP-002 and ORI-DEP-003 own this supporting check; the local-preview gate entrypoint does not change.

### Evidence and replay boundaries

For every flow, the canonical outputs are `tests/sprint-05-orient-search/evidence/<FLOW-ID>/run.json` and `tests/sprint-05-orient-search/evidence/<FLOW-ID>/proof.red`. These are planned outputs, not existing pass claims. Capture the real preimplementation failure with the exact replay command; a source-absence statement or authored success flag is not proof. Do not substitute `red.txt` for the canonical `proof.red` path.

Bind each fresh invocation to the actual candidate, lockfile, source, build, surface-policy, and coldboot-policy hashes. Keep invocation-specific evidence under its run identity and reject stale, missing, mismatched, or incomplete evidence. Close owned browser contexts and stop only processes and resources reserved by that run.

Browser flows use `.spec/e2e-policy/surface.json`; the API flow uses the Sprint 05 planning policy `.spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json`. All flows use `.spec/e2e-policy/coldboot.json`. The API policy does not broaden the shared browser policy.

### Post-integration journey proofs

ORI-AST-010 owns the following four journeys as a TEST task. Their phase is `post-integration`, their test tier is `e2e`, and their surface policy is `.spec/e2e-policy/surface.json`. They run after the task's declared content, UI, build, search, and recovery dependencies; they are not task-local primary acceptance criteria for earlier implementation tasks. Their exact files, function selectors, and replay commands appear in the gate and coverage table.

| Journey | Real verification service |
|---|---|
| FLOW-SHELL-07-cmdk-open-search-navigate | Real built Astro preview at http://localhost:4321, production Pagefind index, custom 404, and actual Playwright keyboard, focus, network, and navigation |
| FLOW-SHELL-08-pagefind-lazy-load-on-first-open | Real built Astro preview at http://localhost:4321, ClientRouter, production Pagefind resources, and actual Playwright network observation |
| FLOW-SHELL-13-engine-tab-persists-across-pages | Real built Astro preview at http://localhost:4321, actual Installation and Quickstart content, generated Message, home, Components, ClientRouter, and browser storage |
| FLOW-SHELL-14-tab-panels-in-initial-html | Real built Astro preview at http://localhost:4321, original HTTP response bodies, and actual JavaScript-disabled Playwright rendering |

## Dark Work

Six build/continuous-integration (CI) tasks have no separate visitor action. They account for **26 points / 19.85%** of the sprint, within the **30%** ceiling. They require real discriminating failures and restored positive runs; they are not hidden inside an invented visitor flow.

| Task | Points | Required discriminating proof |
|---|---:|---|
| ORI-AST-005 | 5 | Real snippet/compiler commands reject missing regions, source drift, invalid imports, and invalid props in isolated copies, then accept restored sources. |
| ORI-AST-006 | 3 | The real emitted-site checker rejects missing documents and fragments with source/target diagnostics; external links use actual HTTP. |
| ORI-CI-001 | 3 | The actual build rejects duplicate, missing, and noncanonical published tutorials, then accepts the restored single tutorial. |
| ORI-CI-002 | 5 | The public build command rejects corrupted source, props, routes, fragments, duplicate tutorials, and an unavailable real Pagefind executable; failed stages withhold downstream execution. |
| ORI-CI-003 | 5 | Real hosted negative candidates with missing inputs, a scoped live-chat type error, stale registry output, or invalid content withhold downstream acceptance; restored candidates pass the same checks. |
| ORI-CI-004 | 5 | Actual evidence verification rejects missing Android proof, altered hashes, old manifests, and missing provider correlation. Unavailable resources, genuine service failures, cancellation, and failed uploads cannot produce an accepted release manifest. A real protected candidate run is required. |

The complete test-step projection contains 22 entries: 13 numbered flows, three supporting checks, and these six dark proofs. Task charters retain their exact focused commands and evidence paths. Only ORI-CI-004 owns aggregate `pnpm test` and `pnpm e2e:docs` acceptance after its prerequisites exist. YAML or local validation cannot stand in for hosted proof.

## Tasks

All tasks remain planned. Titles, assignments, estimates, and dependency edges below are the approved contract.

| ID | Title | Agent | Points | Wave | Depends on |
|---|---|---|---:|---:|---|
| ORI-RN-000 | Make the published PromptInput import graph compatible with Expo 57 types | react-native-reusables-implementer | 2 | 1 | None |
| ORI-DEP-001 | Establish the initial Workers deployment and canonical registry prerequisite | cloudflare-workers-implementer | 5 | 2 | ORI-RN-000 |
| ORI-AST-001 | Render authored documentation through the Astro collection and prose shell | astro-implementer | 5 | 3 | ORI-DEP-001 |
| ORI-AST-002 | Keep engine choices synchronized through prose and Astro navigation | astro-implementer | 5 | 4 | ORI-AST-001 |
| ORI-CONT-002 | Author Theming and Dark mode manuscripts for the real route adapter | techwriting-implementer | 3 | 4 | ORI-AST-001 |
| ORI-AST-003 | Make the Theming token table demonstrate the live site theme | astro-implementer | 3 | 5 | ORI-AST-001, ORI-AST-002, ORI-CONT-002 |
| ORI-AST-008 | Publish reference destinations for the remaining 17 UI and library items | astro-implementer | 3 | 1 | None |
| ORI-AST-005 | Reject authored code that loses its real source or typecheck | astro-implementer | 5 | 10 | ORI-AST-001, ORI-CONT-001, ORI-CONT-003 |
| ORI-RN-001 | Provide complete source-backed setup for both clean Expo consumers | react-native-reusables-implementer | 5 | 3 | ORI-RN-000, ORI-DEP-001 |
| ORI-CONT-005 | Author the real boundary explanation and missing-page recovery copy | techwriting-implementer | 2 | 4 | ORI-AST-001 |
| ORI-CONT-001 | Author Introduction, Installation, and registry-specific CLI content | techwriting-implementer | 5 | 6 | ORI-AST-001, ORI-AST-002, ORI-RN-001, ORI-CONT-005, ORI-CONT-002, ORI-AST-003 |
| ORI-RN-002 | Provide the single source-backed seed-data chat screen | react-native-reusables-implementer | 3 | 4 | ORI-RN-001 |
| ORI-AI-001 | Implement the worked example's useChat hook and real OpenAI streaming route | aisdk-implementer | 5 | 4 | ORI-AST-001 |
| FIX-ORI-AI-001-1 | Keep the worked example hook's regenerate payload itemIds unique | aisdk-implementer | 2 | 5 | ORI-AI-001 |
| ORI-RN-003 | Execute the copied quickstart on both native platforms and Web | react-native-reusables-implementer | 5 | 5 | ORI-RN-001, ORI-RN-002 |
| ORI-RN-004 | Compose and verify the separate live chat screen in apps/example | react-native-reusables-implementer | 5 | 6 | ORI-RN-000, ORI-RN-003, ORI-AI-001 |
| ORI-RN-005 | Run the real worked-example source in an independent NativeWind consumer | react-native-reusables-implementer | 3 | 7 | ORI-RN-001, ORI-RN-004, ORI-AI-001 |
| FIX-ORI-RN-005-1 | Make the canonical live-chat sources compile in the independent NativeWind consumer | react-native-reusables-implementer | 2 | 7 | ORI-RN-001, ORI-RN-004, ORI-AI-001 |
| ORI-AI-002 | Prove the composed worked example against the real provider | aisdk-implementer | 5 | 8 | ORI-AI-001, ORI-RN-004, ORI-RN-005 |
| ORI-CONT-003 | Author the single seed-data quickstart and its live-example run handoff | techwriting-implementer | 5 | 9 | ORI-CONT-001, ORI-AST-001, ORI-AST-002, ORI-RN-002, ORI-AI-002 |
| ORI-AST-004 | Navigate the built docs through a lazily loaded Pagefind dialog | astro-implementer | 5 | 10 | ORI-AST-001, ORI-AST-002, ORI-AST-003, ORI-AST-008, ORI-CONT-001, ORI-CONT-003, ORI-CONT-005 |
| ORI-AST-006 | Reject broken links in the built documentation | astro-implementer | 3 | 4 | ORI-AST-001 |
| ORI-AST-007 | Filter the registry ledger and copy commands for the selected engine | astro-implementer | 3 | 5 | ORI-AST-002, ORI-AST-008 |
| ORI-AST-009 | Recover from unknown documentation URLs through the real site search | astro-implementer | 2 | 11 | ORI-AST-001, ORI-AST-004, ORI-CONT-005 |
| ORI-CI-001 | Reject missing, duplicate, or noncanonical published tutorials | astro-implementer | 3 | 10 | ORI-AST-001, ORI-CONT-003 |
| ORI-CI-002 | Make the public docs build execute every content gate in order | ghactions-implementer | 5 | 12 | ORI-AST-001, ORI-AST-004, ORI-AST-005, ORI-AST-006, ORI-AST-009, ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005, ORI-CI-001 |
| ORI-CONT-006 | State the complete TR-12 docs contribution contract | techwriting-implementer | 1 | 13 | ORI-CI-002 |
| ORI-VIS-001 | Complete the shared reading layout for orientation and boundary pages | frontend-designer | 5 | 12 | ORI-AST-001, ORI-AST-002, ORI-AST-003, ORI-AST-004, ORI-AST-007, ORI-AST-009, ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005 |
| ORI-VIS-002 | Present paired token values and the live theme demonstration | frontend-designer | 2 | 13 | ORI-VIS-001, ORI-AST-003, ORI-AST-007 |
| ORI-VIS-003 | Present shared search results and keyboard-visible states | frontend-designer | 2 | 13 | ORI-VIS-001, ORI-AST-004 |
| ORI-VIS-004 | Complete the ledger toolbar and shared table presentation | frontend-designer | 3 | 14 | ORI-VIS-001, ORI-VIS-002, ORI-AST-007 |
| ORI-VIS-005 | Compose the branded missing-page search recovery surface | frontend-designer | 2 | 14 | ORI-VIS-001, ORI-VIS-003, ORI-AST-009 |
| ORI-CONT-004 | Verify the completed content path and bind its claims to real integration evidence | techwriting-implementer | 3 | 15 | ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005, ORI-AST-003, ORI-AST-004, ORI-AST-006, ORI-AST-009, ORI-RN-003, ORI-AI-002, ORI-CI-001, ORI-CI-002, ORI-CONT-006, ORI-RN-005, ORI-VIS-001, ORI-VIS-002, ORI-VIS-003, ORI-VIS-004, ORI-VIS-005 |
| ORI-AST-010 | Prove integrated engine and search flows after real content and recovery exist | astro-implementer | 3 | 16 | ORI-CONT-004, ORI-AST-002, ORI-AST-004, ORI-AST-009, ORI-CI-002, ORI-VIS-001, ORI-VIS-003, ORI-VIS-005 |
| ORI-CI-003 | Enforce credential-free candidate checks in GitHub Actions | ghactions-implementer | 5 | 17 | ORI-CI-002, ORI-CONT-004, ORI-CONT-006, ORI-AST-010 |
| ORI-CI-004 | Require fresh native, provider, and public-registry proof before publication | ghactions-implementer | 5 | 18 | ORI-CI-003, ORI-DEP-001, ORI-RN-003, ORI-RN-004, ORI-AI-002, ORI-CONT-004, ORI-AST-007, ORI-AST-009, ORI-VIS-001, ORI-VIS-002, ORI-VIS-003, ORI-VIS-004, ORI-VIS-005, ORI-RN-005, ORI-CONT-006, ORI-AST-010 |
| ORI-DEP-002 | Verify the accepted candidate's real Cloudflare version and 404 recovery | cloudflare-workers-implementer | 2 | 19 | ORI-DEP-001, ORI-CI-004, ORI-AST-009, ORI-VIS-005 |
| ORI-DEP-003 | Publish and verify the completed Sprint 05 docs at the apex | cloudflare-workers-implementer | 3 | 20 | ORI-DEP-001, ORI-DEP-002, ORI-CI-004 |

**Total: 38 tasks / 135 points** (the approved 36-task/131-point plan plus FIX-ORI-AI-001-1 and FIX-ORI-RN-005-1, added in flight by planner asks ask-wave8-add-payload-retry-fix and ask-wave9-add-nativewind-compile-fix). Review assignments and exact read/write boundaries remain in the task charters.

## Waves and Dependencies

The following waves are the longest dependency depth of each task. They summarize the exact edges in the task table; they do not add barriers, change dependencies, or imply that unreserved resources can be shared. Start work only when its declared dependencies and execution preconditions are satisfied, and preserve each charter's file ownership.

| Wave | Tasks |
|---:|---|
| 1 | ORI-RN-000, ORI-AST-008 |
| 2 | ORI-DEP-001 |
| 3 | ORI-AST-001, ORI-RN-001 |
| 4 | ORI-AST-002, ORI-CONT-002, ORI-CONT-005, ORI-RN-002, ORI-AI-001, ORI-AST-006 |
| 5 | ORI-AST-003, ORI-RN-003, ORI-AST-007 |
| 6 | ORI-CONT-001, ORI-RN-004 |
| 7 | ORI-RN-005 |
| 8 | ORI-AI-002 |
| 9 | ORI-CONT-003 |
| 10 | ORI-AST-005, ORI-AST-004, ORI-CI-001 |
| 11 | ORI-AST-009 |
| 12 | ORI-CI-002, ORI-VIS-001 |
| 13 | ORI-CONT-006, ORI-VIS-002, ORI-VIS-003 |
| 14 | ORI-VIS-004, ORI-VIS-005 |
| 15 | ORI-CONT-004 |
| 16 | ORI-AST-010 |
| 17 | ORI-CI-003 |
| 18 | ORI-CI-004 |
| 19 | ORI-DEP-002 |
| 20 | ORI-DEP-003 |

The prerequisite chain deliberately reaches beyond prose: ORI-RN-000 precedes canonical registry deployment and clean-consumer work; real AI/native evidence precedes the Quickstart handoff; complete content precedes integrated search and recovery; post-integration journeys precede hosted acceptance; verified accepted-version deployment precedes apex publication. No task may bypass an edge because its source files already exist.

Root `pnpm typecheck` excludes apps, and apps/example has no typecheck script in the inspected source. The approved prerequisite owns the direct PromptInput import graph and a scoped live-chat compiler graph. Broader example diagnostics must be reported separately; this sprint does not silently add whole-example remediation or claim that the root check covers it.

## Unresolved External and Runtime Preconditions

The following seven preconditions remain unresolved. Environment-variable presence, cached login state, a registered domain, local proof, or planned runner labels do not establish success. Resolve each with actual evidence before its owning task can complete; unavailable requirements must fail closed.

- **VP-AI-PACKAGES** (`unverified_external_prerequisite`): Verify published metadata and actual installation of ai@7.0.89, @ai-sdk/react@4.0.92, @ai-sdk/openai@4.0.66 and zod@4.6.1 through Expo tooling. The hook/provider packages were absent locally and the proposed hook pin was not retrievable in the specialist session. Require real LanguageModelV4 compatibility and compiler proof. If the pin is unavailable or incompatible, stop for a version decision; do not silently take latest or add API compatibility shims.

- **VP-OPENAI** (`unverified_external_prerequisite`): OPENAI_API_KEY presence is not provider proof. Make actual server-side requests to the fixed official OpenAI Responses endpoint using gpt-4.1-mini-2025-04-14 and record sanitized authentication/model/quota/network outcomes. Require real incremental deltas, contextual history, active abort, rejected-model error and successful retry. No alternate provider/model silently substitutes for the selected contract.

- **VP-NATIVE** (`requires_runtime_setup`): Reserve explicit RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL. Boot the selected available Android AVD; adb had no running target in the specialist observations. Verify compatible Expo Go and real native automation. Preserve unrelated booted simulators. Use separate engine consumers/caches and native worktree-local build outputs. Verify actual expo/fetch streaming, structuredClone and text-encoding globals on each running target; missing required runtime support blocks the owning native task.

- **VP-CANONICAL-AUTHORITY** (`unverified_external_prerequisite`): Verify actual owning Cloudflare account, active zone, Worker identity, effective permissions, DNS/custom-domain/routes and absence of conflicts or another deployment owner. Cached local OAuth and registration do not prove authority. Use cached OAuth without reading or copying its token; expired/insufficient access requires the account owner's normal restoration.

- **VP-PUBLIC-DNS-TLS** (`unverified_external_prerequisite`): rnraielements.com was registered but not resolving in parent preflight. Wait for actual activation, ordinary public DNS and trusted HTTPS serving the corrected real registry. Do not use hosts-file overrides, local URL rewrites, arbitrary preview hosts or disabled certificate validation to satisfy literal CLI installs.

- **VP-HOSTED-RUNNER** (`unverified_external_prerequisite`): Provision and verify an eligible exclusive clean/ephemeral macOS ARM64 native runner, its real device/browser/toolchain capabilities and resource reservations. The rnr-s05-native label is proposed, not observed registered. No personal workstation credential cache enters candidate jobs. Without that runner, hosted full native/provider acceptance remains blocked; local proof cannot impersonate GitHub checks.

- **VP-GITHUB-PROTECTION** (`unverified_external_prerequisite`): Verify actual required-check names, workflow availability, same-repository dispatch identity, candidate SHA/event SHA equality, environment protection support, independent approval preventing self-approval, runner-group restrictions and artifact access. Validate action full-SHA provenance before use. Fork/unreviewed code must not receive provider credentials or execute on the protected native runner.

### Execution safeguards

Reserve the real backend, Metro, Web, browser, and native resources. Require the candidate's owned preview on port 4321; identify existing listeners and refuse an unowned conflict. Do not kill unrelated processes or fall back to another origin to satisfy the locked gate. Keep the selected provider secret on the trusted server side, never in Metro, installed consumers, browser code, EXPO_PUBLIC values, arguments, or artifacts.

Use the approved ordered registry/gallery/docs-data/snippet/Astro/Pagefind/link build and current-invocation proof matrix. The initial canonical registry must exist before literal CLI installation. Public registry hashes must match the final accepted candidate; a mismatch requires renewed review and fresh proof. Upload the accepted candidate once, verify its nonpromoting real Cloudflare version, and then promote that exact version at the apex. The first domain attachment uses the approved attended Wrangler flow; do not overwrite conflicting ownership automatically.

Retain cleanup evidence for owned requests, timers, listeners, processes, device mappings, appearance changes, and reservations on success and failure. Inspect native screenshots before making visual claims. No stub, mocked core dependency, placeholder page, canned provider reply, skipped target, or stale manifest satisfies this plan.

## PRD Coverage

| Requirement | Sprint contribution |
|---|---|
| UC-DOCS-01 | Source-backed Introduction, one engine decision, registry-specific Installation/CLI, Theming, Dark mode, section navigation, and substantive boundary context. |
| UC-DOCS-02 | One seed-data Quickstart with visible results, real clean-consumer installation, a useful conclusion, and a separate real-provider worked-example handoff. |
| UC-SHELL-02 | Real built Pagefind search, keyboard/focus behavior, lazy loading, result navigation, and recovery integration. |
| UC-SHELL-01 (TokenTable half) | Paired token reference and a live, persistent, flash-free site-theme demonstration. |
| UC-SHELL-03 (prose-persistence half) | Synchronized engine choice across prose and navigation; both complete panels in initial HTML and readable without JavaScript. |
| UC-GEND-07 AC-2 | Fixed ledger carryover: counts, filtering, engine-correct clipboard commands, and the remaining UI/library reference destinations. |
| TR-12 (full) | Complete contribution contract, source-backed/typechecked snippets, single-tutorial enforcement, real link gates, and ordered CI integration. |
| CAP-DOCS-01 snippet/link build integration | Fail-closed public build and acceptance paths tied to actual source, native/provider evidence, and publication identity. |

Keep documentation modes distinct: the Quickstart is the single learning-by-doing tutorial; engine/setup directions serve an integrator's task; CLI and token/API descriptions serve reference lookup; Introduction, ownership, and Dark mode explain the product or theme boundary without becoming duplicate tutorials. Recovery copy names useful next actions. Every authored claim follows the docs-site content standards and glossary, uses active voice and precise terms, and links to real destinations.

## Capability Coverage

- `CAP-DOCS-01`: orientation and source-backed content, real worked-example proof, theme/search/recovery, complete reference destinations, snippet/link gates, contribution rules, hosted acceptance, and identity-bound publication. All tasks except ORI-AST-002 name this capability.
- `CAP-INST-01`: ORI-AST-002 owns engine synchronization; ORI-AST-007 and ORI-AST-008 also cover engine-correct registry commands and real install/reference destinations.

These are the existing capability identifiers. Supporting prerequisite work does not introduce another capability or demonstrated use case.

## Task Detail Files

The following filenames are derived from each exact task ID and title. Each charter supplies its acceptance criteria, tests, reviewer, file ownership, verification services, and evidence contracts.

- [ORI-RN-000-make-the-published-promptinput-import-graph-compatible-with-expo-57-types.md](./ORI-RN-000-make-the-published-promptinput-import-graph-compatible-with-expo-57-types.md)

- [ORI-DEP-001-establish-the-initial-workers-deployment-and-canonical-registry-prerequisite.md](./ORI-DEP-001-establish-the-initial-workers-deployment-and-canonical-registry-prerequisite.md)

- [ORI-AST-001-render-authored-documentation-through-the-astro-collection-and-prose-shell.md](./ORI-AST-001-render-authored-documentation-through-the-astro-collection-and-prose-shell.md)

- [ORI-AST-002-keep-engine-choices-synchronized-through-prose-and-astro-navigation.md](./ORI-AST-002-keep-engine-choices-synchronized-through-prose-and-astro-navigation.md)

- [ORI-CONT-002-author-theming-and-dark-mode-manuscripts-for-the-real-route-adapter.md](./ORI-CONT-002-author-theming-and-dark-mode-manuscripts-for-the-real-route-adapter.md)

- [ORI-AST-003-make-the-theming-token-table-demonstrate-the-live-site-theme.md](./ORI-AST-003-make-the-theming-token-table-demonstrate-the-live-site-theme.md)

- [ORI-AST-008-publish-reference-destinations-for-the-remaining-17-ui-and-library-items.md](./ORI-AST-008-publish-reference-destinations-for-the-remaining-17-ui-and-library-items.md)

- [ORI-AST-005-reject-authored-code-that-loses-its-real-source-or-typecheck.md](./ORI-AST-005-reject-authored-code-that-loses-its-real-source-or-typecheck.md)

- [ORI-RN-001-provide-complete-source-backed-setup-for-both-clean-expo-consumers.md](./ORI-RN-001-provide-complete-source-backed-setup-for-both-clean-expo-consumers.md)

- [ORI-CONT-005-author-the-real-boundary-explanation-and-missing-page-recovery-copy.md](./ORI-CONT-005-author-the-real-boundary-explanation-and-missing-page-recovery-copy.md)

- [ORI-CONT-001-author-introduction-installation-and-registry-specific-cli-content.md](./ORI-CONT-001-author-introduction-installation-and-registry-specific-cli-content.md)

- [ORI-RN-002-provide-the-single-source-backed-seed-data-chat-screen.md](./ORI-RN-002-provide-the-single-source-backed-seed-data-chat-screen.md)

- [ORI-AI-001-implement-the-worked-examples-usechat-hook-and-real-openai-streaming-route.md](./ORI-AI-001-implement-the-worked-examples-usechat-hook-and-real-openai-streaming-route.md)

- [TASK-FIX-ORI-AI-001-1.md](./TASK-FIX-ORI-AI-001-1.md)

- [ORI-RN-003-execute-the-copied-quickstart-on-both-native-platforms-and-web.md](./ORI-RN-003-execute-the-copied-quickstart-on-both-native-platforms-and-web.md)

- [ORI-RN-004-compose-and-verify-the-separate-live-chat-screen-in-apps-example.md](./ORI-RN-004-compose-and-verify-the-separate-live-chat-screen-in-apps-example.md)

- [ORI-RN-005-run-the-real-worked-example-source-in-an-independent-nativewind-consumer.md](./ORI-RN-005-run-the-real-worked-example-source-in-an-independent-nativewind-consumer.md)

- [TASK-FIX-ORI-RN-005-1.md](./TASK-FIX-ORI-RN-005-1.md)

- [ORI-AI-002-prove-the-composed-worked-example-against-the-real-provider.md](./ORI-AI-002-prove-the-composed-worked-example-against-the-real-provider.md)

- [ORI-CONT-003-author-the-single-seed-data-quickstart-and-its-live-example-run-handoff.md](./ORI-CONT-003-author-the-single-seed-data-quickstart-and-its-live-example-run-handoff.md)

- [ORI-AST-004-navigate-the-built-docs-through-a-lazily-loaded-pagefind-dialog.md](./ORI-AST-004-navigate-the-built-docs-through-a-lazily-loaded-pagefind-dialog.md)

- [ORI-AST-006-reject-broken-links-in-the-built-documentation.md](./ORI-AST-006-reject-broken-links-in-the-built-documentation.md)

- [ORI-AST-007-filter-the-registry-ledger-and-copy-commands-for-the-selected-engine.md](./ORI-AST-007-filter-the-registry-ledger-and-copy-commands-for-the-selected-engine.md)

- [ORI-AST-009-recover-from-unknown-documentation-urls-through-the-real-site-search.md](./ORI-AST-009-recover-from-unknown-documentation-urls-through-the-real-site-search.md)

- [ORI-CI-001-reject-missing-duplicate-or-noncanonical-published-tutorials.md](./ORI-CI-001-reject-missing-duplicate-or-noncanonical-published-tutorials.md)

- [ORI-CI-002-make-the-public-docs-build-execute-every-content-gate-in-order.md](./ORI-CI-002-make-the-public-docs-build-execute-every-content-gate-in-order.md)

- [ORI-CONT-006-state-the-complete-tr-12-docs-contribution-contract.md](./ORI-CONT-006-state-the-complete-tr-12-docs-contribution-contract.md)

- [ORI-VIS-001-complete-the-shared-reading-layout-for-orientation-and-boundary-pages.md](./ORI-VIS-001-complete-the-shared-reading-layout-for-orientation-and-boundary-pages.md)

- [ORI-VIS-002-present-paired-token-values-and-the-live-theme-demonstration.md](./ORI-VIS-002-present-paired-token-values-and-the-live-theme-demonstration.md)

- [ORI-VIS-003-present-shared-search-results-and-keyboard-visible-states.md](./ORI-VIS-003-present-shared-search-results-and-keyboard-visible-states.md)

- [ORI-VIS-004-complete-the-ledger-toolbar-and-shared-table-presentation.md](./ORI-VIS-004-complete-the-ledger-toolbar-and-shared-table-presentation.md)

- [ORI-VIS-005-compose-the-branded-missing-page-search-recovery-surface.md](./ORI-VIS-005-compose-the-branded-missing-page-search-recovery-surface.md)

- [ORI-CONT-004-verify-the-completed-content-path-and-bind-its-claims-to-real-integration-evidence.md](./ORI-CONT-004-verify-the-completed-content-path-and-bind-its-claims-to-real-integration-evidence.md)

- [ORI-AST-010-prove-integrated-engine-and-search-flows-after-real-content-and-recovery-exist.md](./ORI-AST-010-prove-integrated-engine-and-search-flows-after-real-content-and-recovery-exist.md)

- [ORI-CI-003-enforce-credential-free-candidate-checks-in-github-actions.md](./ORI-CI-003-enforce-credential-free-candidate-checks-in-github-actions.md)

- [ORI-CI-004-require-fresh-native-provider-and-public-registry-proof-before-publication.md](./ORI-CI-004-require-fresh-native-provider-and-public-registry-proof-before-publication.md)

- [ORI-DEP-002-verify-the-accepted-candidates-real-cloudflare-version-and-404-recovery.md](./ORI-DEP-002-verify-the-accepted-candidates-real-cloudflare-version-and-404-recovery.md)

- [ORI-DEP-003-publish-and-verify-the-completed-sprint-05-docs-at-the-apex.md](./ORI-DEP-003-publish-and-verify-the-completed-sprint-05-docs-at-the-apex.md)

## Automated Functional Coverage

This table projects the same 13 locked flows: nine task flows and four journeys. The function selector is the exact flow ID. All paths begin at the repository root; the exact runnable selector command is printed in the matching numbered gate step.

| Flow ID | Scope | Gate | Primary owner | Test file / function | Replay phase |
|---|---|---:|---|---|---|
| FLOW-DOCS-01-getting-started-engine-decision | task | 1 | ORI-CONT-004 | tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts :: FLOW-DOCS-01-getting-started-engine-decision | task |
| FLOW-DOCS-01-theming-and-section-nav | task | 2 | ORI-CONT-004 | tests/sprint-05-orient-search/theming-and-section-nav.spec.ts :: FLOW-DOCS-01-theming-and-section-nav | task |
| FLOW-DOCS-02-quickstart-chat-screen | task | 3 | ORI-CONT-004 | tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts :: FLOW-DOCS-02-quickstart-chat-screen | task |
| FLOW-SHELL-01-theme-toggle-persisted-flash-free | task | 4 | ORI-AST-003 | tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts :: FLOW-SHELL-01-theme-toggle-persisted-flash-free | task |
| FLOW-SHELL-02-first-visit-prefers-dark-no-flash | task | 5 | ORI-AST-003 | tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts :: FLOW-SHELL-02-first-visit-prefers-dark-no-flash | task |
| FLOW-SHELL-07-cmdk-open-search-navigate | journey | 6 | ORI-AST-010 | tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts :: FLOW-SHELL-07-cmdk-open-search-navigate | post-integration |
| FLOW-SHELL-08-pagefind-lazy-load-on-first-open | journey | 7 | ORI-AST-010 | tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts :: FLOW-SHELL-08-pagefind-lazy-load-on-first-open | post-integration |
| FLOW-SHELL-13-engine-tab-persists-across-pages | journey | 8 | ORI-AST-010 | tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts :: FLOW-SHELL-13-engine-tab-persists-across-pages | post-integration |
| FLOW-SHELL-14-tab-panels-in-initial-html | journey | 9 | ORI-AST-010 | tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts :: FLOW-SHELL-14-tab-panels-in-initial-html | post-integration |
| FLOW-SHELL-15-search-contract-before-recovery | task | 10 | ORI-AST-004 | tests/sprint-05-orient-search/search-contract.spec.ts :: FLOW-SHELL-15-search-contract-before-recovery | task |
| FLOW-GEND-07-registry-ledger-controls | task | 11 | ORI-AST-007 | tests/sprint-05-orient-search/registry-ledger-controls.spec.ts :: FLOW-GEND-07-registry-ledger-controls | task |
| FLOW-SHELL-16-not-found-search-recovery | task | 12 | ORI-AST-009 | tests/sprint-05-orient-search/not-found-search-recovery.spec.ts :: FLOW-SHELL-16-not-found-search-recovery | task |
| FLOW-DOCS-02-live-example-api-stream-history-abort | task | 13 | ORI-AI-001 | tests/sprint-05-orient-search/live-example-api.test.ts :: FLOW-DOCS-02-live-example-api-stream-history-abort | task |

`human-flows.json`, the approved journey-proof records, and the task Requirement Contracts remain authoritative. The original projection is historical; this sprint uses the final 13-flow contract. Ownership is singular for each flow, including the four ORI-AST-010 journeys. Planned structural consistency does not establish functional success: every required product, service, device, hosted-runner, GitHub-protection, DNS, TLS, and deployment observation still needs fresh execution evidence.
