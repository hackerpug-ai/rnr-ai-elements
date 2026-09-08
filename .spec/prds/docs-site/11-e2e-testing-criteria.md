---
stability: TEST_SPEC
last_validated: 2026-09-08
prd_version: 1.2.0
---

# E2E / Human Testing Criteria — Docs Site (Astro on Cloudflare)

Version 1.1.0 · 2026-09-08 · **111 criteria across 24 use cases / 101 ACs — every AC covered.**
Types: [human-gate] criteria are what sprint human gates draw from; [e2e-automated] run via `pnpm e2e:docs`;
[api-contract] via curl lanes (docs-preview-curl on PRs, docs-production-verify post-deploy); [build-gate] are CI
fixture drills; [integration-test] is the real-CLI round-trip against the live domain. Harness: 10-technical-requirements/11-e2e-testing.md.

## DOCS: Documentation Content

### UC-DOCS-01: Read the getting-started documentation set

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DOCS-001 | Introduction states library identity | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | /docs/introduction returns 200 and contains 'React Native', 'registry', and /not an npm package/i |
| T-DOCS-002 | Introduction identity readable in one pass | AC-1 | [human-gate] | Browser over astro preview | Reader confirms the page says: RN AI chat/agent UI components, copy-paste registry, not an npm package |
| T-DOCS-003 | Engine question posed exactly once | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | /docs/installation renders exactly 1 engine tab group and 0 engine code blocks outside it |
| T-DOCS-004 | Engine decision guide present | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Page pairs 'Tailwind v4' + '@theme' with uniwind and 'nativewind v3' with the nativewind tree |
| T-DOCS-005 | No-tailwind-config theming guide | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | Theming page has a no-config statement matching /tailwind\.config\.js/, >=1 '@theme', >=10 'oklch', and light plus dark columns |
| T-DOCS-006 | CLI and Dark mode reachable | AC-5 | [e2e-automated] | Built dist via pnpm e2e:docs | Getting-started sidebar links CLI and Dark mode; both return 200 |
| T-DOCS-029 | CLI page scoped to registry, links out | AC-6 | [e2e-automated] | built dist via pnpm e2e:docs | CLI page covers absolute-URL add, what it writes, and engine trees, links to the authoritative RNR CLI reference, and contains no mirrored copy of its command catalog |

### UC-DOCS-02: Build a chat screen with the single quickstart tutorial

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DOCS-007 | Quickstart covers the full path | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | /docs/quickstart contains nativewind, uniwind, 'conversation', 'Message', and 'PromptInput' |
| T-DOCS-008 | Quickstart code engine-tabbed | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | All quickstart code blocks sit in engine tab groups; inactive panel hidden until selected |
| T-DOCS-009 | Single-tutorial gate | AC-3 | [build-gate] | Clean checkout, fixture mutation, docs build | Second-tutorial fixture exits non-zero citing duplicate tutorial; one-tutorial tree exits 0 |
| T-DOCS-010 | Worked example linked | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | Conclusion links apps/example with 'useChat' adjacent; link resolves non-404 |
| T-DOCS-030 | Each quickstart step states expected result | AC-5 | [e2e-automated] | built dist via pnpm e2e:docs | every quickstart step ends with an observable after-this-step expected-result line before the next step begins |
| T-DOCS-031 | Quickstart names end state up front | AC-6 | [human-gate] | built dist via pnpm e2e:docs, read in browser | tutorial intro names the end state — scrolling message list, working prompt input, Expo Go, seed data — and hands off to apps/example for live useChat wiring before step 1 |

### UC-DOCS-03: Use the lean how-to guides

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DOCS-011 | Token customization guide | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | Guides index links a token/theming slug; page returns 200 containing 'oklch' and '@theme' |
| T-DOCS-012 | Update-installed-items guide | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Update guide contains literal 'npx @react-native-reusables/cli@latest add' |
| T-DOCS-014 | Five-page guides cap | AC-6 | [build-gate] | Clean checkout, fixture mutation, docs build | Sixth-guide fixture exits non-zero citing the cap; five-guide set exits 0 and index lists exactly 5 |
| T-DOCS-026 | Customize-rendering guide covers both rendering seams | AC-3 | [e2e-automated] | built dist via pnpm e2e:docs | guide exists in Guides section, documents renderMarkdown and TextClassContext, and every component page using those seams links to it |
| T-DOCS-027 | Troubleshooting guide has symptom-cause-fix entries | AC-4 | [e2e-automated] | built dist via pnpm e2e:docs | page carries distinct symptom/cause/fix entries for short-name collision, wrong-engine symptoms, Expo Go cliff with dev-client move, and markdown streaming crash; linked from Installation and per-item dependency panel |
| T-DOCS-028 | Expo Go preview guide reachable from Guides index | AC-5 | [e2e-automated] | built dist via pnpm e2e:docs | Guides index links an on-device Expo Go preview guide and the Guides section totals exactly five pages |

### UC-DOCS-04: Read the owns-vs-does-not-own boundary

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DOCS-015 | Boundary table content | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | /docs/owns-vs-does-not-own returns 200 and contains transport, streaming client, tool executor, and 'useChat' |
| T-DOCS-016 | Example app link | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Example-app anchor on the boundary page resolves non-404 |
| T-DOCS-017 | Ownership split and gaps | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Page contains 'react-native-reusables' and a gaps section with >=1 listed item |
| T-DOCS-018 | Gaps list accuracy | AC-3 | [human-gate] | Browser plus /registry and /porting | Human cross-checks gaps vs ledger and not-ported list: 0 contradicted, 0 known omission |
| T-DOCS-019 | Tables not prose | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | Each boundary claim string sits inside td/th; page has >=2 tables |
| T-DOCS-032 | Boundary tables canonical to one page | AC-5 | [e2e-automated] | built dist via pnpm e2e:docs | boundary tables render only on /docs/owns-vs-does-not-own; home and Introduction carry one-line teasers plus links; /porting contains no second copy of the tables |

### UC-DOCS-05: Read porting notes and prior art

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DOCS-020 | Mapping table with deviations | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | /porting has a table with a /deviation/i column and >=5 rows |
| T-DOCS-021 | Not-ported list exact | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Not-ported list has >=1 entry, none matching the 56 shipped items; mapping plus not-ported equals upstream total |
| T-DOCS-022 | Prior-art context | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Page contains 'elements.ai-sdk.dev' and 'muratcakmak/expo-ai-elements' with rationale for divergence |

### UC-DOCS-06: Track releases through the changelog

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DOCS-023 | Reverse chronological order | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | /changelog entry dates strictly descending top to bottom |
| T-DOCS-024 | Per-release pages | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Every entry links a 200 page with a date and Added/Changed/Fixed headings |
| T-DOCS-025 | Release-to-component links | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Sampled release links hit 200 pages titled per registry item names |

## GEND: Generated Registry Surface

### UC-GEND-01: Evaluate the library from the home page in one visit

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-GEND-001 | Home one-screen statement | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | Home contains /not an npm package/i, 'React Native', and 'registry' |
| T-GEND-002 | Hero fits one screen | AC-1 | [human-gate] | Browser at 1440x900 over astro preview | Statement, counters, install command, and both CTAs visible without scrolling |
| T-GEND-003 | Health counters in hero | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Hero shows 0.2.1 and 56 items split 39 component / 11 ui / 6 lib |
| T-GEND-004 | Hero install copy | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Clipboard matches ^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/[a-z]+/[a-z0-9-]+\.json$ and shows a success state |
| T-GEND-005 | Hero CTAs | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | Anchors matching /get started/i and /browse components/i present; both targets return 200 |

### UC-GEND-02: Browse components by AI family

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-GEND-006 | Seven family sections | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | /components shows all 7 family sections containing 39 cards total |
| T-GEND-007 | Card grid fields | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | 39/39 cards carry name, description <=120 chars, category chip, and Expo Go verdict badge |
| T-GEND-008 | Family path secondary to search | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Cmd+K trigger present in header; family sections serve as secondary nav alongside it |

### UC-GEND-03: Read a generated component reference page

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-GEND-009 | Reference page header | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | 39/39 pages have h1 equal to item name, a one-line description, and chips for version, category, engines, verdict |
| T-GEND-010 | Install block first | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | 39/39 pages render the tabbed install as first content section containing both /r/{engine}/ URLs |
| T-GEND-011 | Family pager | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | 39/39 pages have prev/next within the same family; each family cycle closes |
| T-GEND-012 | Extension-seam links | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | Seam-using pages link renderMarkdown and TextClassContext docs; targets return 200 |

### UC-GEND-04: Copy exact install commands and review dependencies per item

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-GEND-013 | Per-item install copy | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | All 56 item pages yield the exact absolute-URL command; engine segment matches active tab |
| T-GEND-014 | Family install copy | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | 7 family pages expose a copyable command containing https://rnraielements.com/r/ |
| T-GEND-015 | Dependency panel | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Panels list registryDependencies and dependencies including AI SDK v7 peers; >=5 sampled match live /r/*.json |
| T-GEND-016 | No short-name or un-tabbed forms | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs site crawl | Every command is absolute-URL form; 0 un-tabbed engine variants; 0 short-name adds |

### UC-GEND-05: See generated run evidence and Expo Go verdicts

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-GEND-017 | QR present and correct | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | 39/39 pages carry a QR img/canvas; decoded content equals the documented gallery deep link |
| T-GEND-018 | QR opens Expo Go gallery | AC-1 | [human-gate] | Phone with Expo Go scanning live page | Scan opens the live gallery in Expo Go within 30s; no clone, install, or dev client required |
| T-GEND-019 | Verdict badges everywhere | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Badges on 39 pages and 56 ledger rows; >=10 sampled match /r/nativewind/{item}.json with 0 mismatches |
| T-GEND-020 | Dev-client matrix | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Matrix lists all 4 items (enriched-markdown, streamdown, speech-recognition, extended-audio) with non-empty peers and permissions |
| T-GEND-021 | Null imagery omits panel | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | 39/39 pages show 0 preview-panel elements and 0 placeholder text; other sections intact |
| T-GEND-022 | Fail-once-live imagery gate | AC-4 | [build-gate] | Clean checkout, capture flag force-enabled, docs build | Missing imagery with flag on exits non-zero naming the item; default flag exits 0 |

### UC-GEND-06: Inspect the generated API reference and full source

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-GEND-023 | Props tables generated | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | 39/39 pages have a props table with Name/Type/Default/Description and >=1 row |
| T-GEND-024 | Full untruncated source | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | >=5 sampled Code views byte-match served source; no height limit, truncation, or clipping |
| T-GEND-025 | Always-visible copy | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Every code block's copy button visible without hover; clipboard equals block text; success state within 500ms |
| T-GEND-026 | Single-source derivation | AC-4 | [build-gate] | Clean checkout, fixture registry edit, docs build | Props table and Code view change together from one fixture edit; build reads a single generated artifact |

### UC-GEND-07: Use the generated registry ledger

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-GEND-027 | Ledger row count | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | /registry renders exactly 56 rows split 39/11/6; rows link docs pages |
| T-GEND-028 | Ledger filters and copy | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Category tabs filter to 39/11/6 and all-56; engine toggle flips command segment; per-row copy works |
| T-GEND-029 | Base URLs and bulk-add | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | Both engine base URLs copyable with clipboard equal to href; bulk-add instructions precede the table in DOM |
| T-GEND-030 | Generated-at-build note | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | Note matches /generated at build/i and mentions public/r/ |
| T-GEND-031 | No hand-edit path | AC-5 | [build-gate] | Clean checkout, fixture registry change, docs build | No hand-editable ledger source under apps/docs src; fixture change regenerates the affected row |

## SHELL: Site Shell Theming and Search

### UC-SHELL-01: Experience the dark-first themed shell

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-SHELL-001 | Persisted flash-free toggle | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | Toggle flips theme, sets localStorage key, persists across reload; header sticky at scrollY 1000; reload video shows 0 wrong-theme frames |
| T-SHELL-002 | Dark-first with scheme respect | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs, fresh browser contexts | prefers-color-scheme dark renders dark, light renders light, no-preference renders dark |
| T-SHELL-003 | Live oklch token table | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | /docs/theming has >=10 token rows with swatches; sampled swatch computed background-color differs dark vs light |
| T-SHELL-004 | Both Expressive Code themes | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | Dark code background luminance <0.2; >=1 syntax token color differs between themes; EC data-theme attribute flips |

### UC-SHELL-02: Navigate by Cmd+K search

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-SHELL-005 | Cmd+K opens anywhere | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | Cmd+K opens the dialog within 300ms on sampled pages including 404; Escape closes |
| T-SHELL-006 | Search coverage | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Queries return an item page, a props-table string, and 'dev client' verdict text; 5 item + 3 docs pages confirmed indexed |
| T-SHELL-007 | Lazy Pagefind bundle | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs, network log | 0 /pagefind/* requests in first 5s before open; >=1 after first open; no duplicate loads on re-open |
| T-SHELL-008 | Search primary path | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs | Cmd+K hint in header on every page; search and family browse reach the same page within 2 interactions |

### UC-SHELL-03: Persist the engine choice across pages

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-SHELL-009 | Engine persists | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | uniwind selected on /docs/installation persists across >=3 pages; fresh context gets the documented default |
| T-SHELL-010 | Switch from any block | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs | Switching engines from a tabbed block on >=5 pages changes active engine globally |
| T-SHELL-011 | Engine never in URL | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | No engine query param or path segment appears in URLs across >=5 pages after selection |
| T-SHELL-012 | Server-rendered panels | AC-4 | [e2e-automated] | Built dist, JS disabled or curl of served HTML | Served HTML contains both engines' panel text before any JavaScript runs |

### UC-SHELL-04: Use the site without JavaScript, on mobile, and in print

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-SHELL-013 | No-JS ledger and tabs | AC-1 | [e2e-automated] | Built dist, JS disabled | /registry shows 56 rows and tabbed content is readable; 0 blank sections |
| T-SHELL-014 | Mobile drawer nav | AC-2 | [e2e-automated] | Built dist via pnpm e2e:docs at 390x844 | Hamburger drawer opens; sidebar collapses and expands; drawer closes |
| T-SHELL-015 | Focus and reduced motion | AC-3 | [e2e-automated] | Built dist via pnpm e2e:docs | focus-visible ring on >=10 interactive tab elements; reduced-motion mode yields ~0 animation duration |
| T-SHELL-016 | Print styles | AC-4 | [e2e-automated] | Built dist via pnpm e2e:docs, print emulation | Nav hidden in print; props table and code blocks render at non-zero size |
| T-SHELL-017 | PDF preserves content | AC-4 | [human-gate] | Browser print-to-PDF of a component page | Saved PDF shows code blocks and tables fully and legibly |

## DELIV: Delivery and Operations

### UC-DELIV-01: Build the docs over fail-closed registry data

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DELIV-001 | 56-item integrity gate | AC-1 | [build-gate] | Clean checkout, fixture mutation, docs build | Fixture removing an item exits non-zero naming the item and observed-count-vs-56; clean tree exits 0 |
| T-DELIV-002 | Field-level fail-closed gates | AC-2 | [build-gate] | Clean checkout, fixture mutations, docs build | Empty files[].path, unresolved props type, bogus family, and missing verdict each fail naming the item; restored tree exits 0 |
| T-DELIV-003 | Ordered CI chain | AC-3 | [build-gate] | Clean checkout, run registry:build, gallery:manifest, docs build | All three steps exit 0 producing artifacts; workflow yaml orders them via sequential needs |
| T-DELIV-004 | public/r generated-only | AC-4 | [build-gate] | Clean checkout and fresh clone | git check-ignore apps/docs/public/r exits 0; directory absent in fresh clone; delete and rebuild yields byte-identical output |
| T-DELIV-017 | Build fails on broken internal link | AC-5 | [build-gate] | clean checkout + fixture mutation (add broken internal link) + docs build | docs build exits nonzero with the link check naming the broken link in dist/ |
| T-DELIV-018 | Build fails on non-typechecking snippet | AC-5 | [build-gate] | clean checkout + fixture mutation (edit markdown snippet away from its source) + docs build | snippet gate fails the docs build citing the snippet and the real source file it no longer typechecks against |

### UC-DELIV-02: Deploy gated to Cloudflare Workers at the canonical domain

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DELIV-005 | Deploy gated | AC-1 | [build-gate] | Repo CI workflow files | Deploy job needs registry-freshness, typecheck, lint, and test; wrangler assets directory is dist; failing typecheck skips deploy |
| T-DELIV-006 | Apex and www redirect | AC-2 | [api-contract] | Live domain via docs-production-verify | GET https://rnraielements.com/ returns 200 with final URL at the apex; GET www returns exactly 301 with Location https://rnraielements.com/ |
| T-DELIV-007 | Cache tier headers | AC-3 | [api-contract] | Live domain via curl; also wrangler preview via docs-preview-curl | HTML carries must-revalidate and not immutable; /_astro/* immutable with max-age >=31536000; /r/*.json max-age <=3600 and not immutable |
| T-DELIV-008 | Security headers | AC-3 | [api-contract] | Live domain via curl; also wrangler preview via docs-preview-curl | An HTML page and one /r/*.json response each carry non-empty content-security-policy, strict-transport-security with max-age, x-content-type-options: nosniff, and frame-deny (DENY) |
| T-DELIV-009 | Non-promoting PR preview | AC-4 | [e2e-automated] | Open PR with unique marker change; wrangler preview URL | Preview URL serves the PR marker; production apex does not; version upload does not promote |
| T-DELIV-010 | Instant rollback drill | AC-4 | [e2e-automated] | Live deploy with fixture change; live domain | Single documented rollback command exits 0; apex serves previous content within 60s |

### UC-DELIV-03: Serve the registry JSON from the same deploy

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DELIV-011 | Same-origin item fetch | AC-1 | [api-contract] | Live domain via docs-production-verify | All 112 /r/{engine}/{item}.json URLs return 200 application/json with name, files, registryDependencies; host is rnraielements.com |
| T-DELIV-012 | Exactly 112 served | AC-2 | [api-contract] | Live domain plus CI artifacts | Enumerated count is exactly 112; fabricated slug returns 404; >=10 sampled files hash-match CI-built artifacts |
| T-DELIV-013 | Real CLI round-trip | AC-3 | [integration-test] | Scratch Expo app, real CLI, real network, no mocks | npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json exits 0; written files byte-equal JSON files[].content; registryDependencies fetched |

### UC-DELIV-04: Recover from bad deploys and dead URLs

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-DELIV-014 | Styled 404 with recovery | AC-1 | [e2e-automated] | Built dist via pnpm e2e:docs | Unknown URL returns status 404 with styled header/footer; Cmd+K opens search; result click navigates |
| T-DELIV-015 | Vanity redirects | AC-2 | [api-contract] | Live domain via curl | GET /docs returns 301 Location /docs/introduction then 200; GET /install returns 301 Location /docs/installation then 200 |
| T-DELIV-016 | Rollback unblocked | AC-3 | [build-gate] | Repo wrangler config and runbook | Wrangler config declares 0 bindings (no KV/DO/R2/D1/queues); rollback documented as exactly one command |

## EXT: GitHub-Facing and Agent Docs

### UC-EXT-01: Fetch machine-readable agent docs

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-EXT-001 | llms.txt endpoints | AC-1 | [api-contract] | Live domain via curl | GET /llms.txt and /llms-full.txt return 200 with non-empty text/plain bodies |
| T-EXT-002 | Not-npm plus literal commands | AC-2 | [api-contract] | Live domain via curl | Both bodies match /not an npm package/i; every CLI command is absolute-URL form; llms-full.txt carries >=56 item commands; 0 short-name forms |
| T-EXT-003 | Engine heuristics | AC-3 | [api-contract] | Live domain via curl | Body pairs 'Tailwind v4' + '@theme' with uniwind and 'nativewind v3' with the nativewind tree |
| T-EXT-004 | Per-item contracts | AC-4 | [api-contract] | Live domain via curl | Entries cover all 56 items with peers; the 4 dev-client items flag permissions; >=10 sampled match live /r/*.json |
| T-EXT-005 | Generated from same data | AC-5 | [build-gate] | Clean checkout, fixture registry/changelog edit, docs build | Files absent from repo source but present in dist; fixture edit changes llms-full.txt on rebuild; robots.txt regenerates likewise |

### UC-EXT-02: Trust the GitHub-facing surface

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-EXT-006 | README surface | AC-1 | [e2e-automated] | GitHub repo at HEAD via gh api / raw.githubusercontent | README states the value prop (React Native AI/agent UI registry), the install entry point, and a resolving CONTRIBUTING link |
| T-EXT-007 | LICENSE present | AC-2 | [e2e-automated] | GitHub repo at HEAD via gh api | LICENSE exists at HEAD with >=500 chars; gh api repos/{repo}/license returns a non-null license |
| T-EXT-009 | Domain reachable from README | AC-4 | [e2e-automated] | GitHub repo at HEAD plus live fetch | README contains https://rnraielements.com; fetching it returns 200 |
| T-EXT-014 | Release notes generated from changelog collection | AC-3 | [integration-test] | clean checkout + release-notes generation run + gh api | running the documented release process emits the GitHub release body from the site changelog collection, and the latest GitHub release body matches the generated output for that version |

### UC-EXT-03: Contribute without tribal knowledge

| # | Criterion | AC Ref | Type | Setup | Pass/Fail |
|---|-----------|--------|------|-------|-----------|
| T-EXT-010 | Source-of-truth rule | AC-1 | [e2e-automated] | GitHub repo at HEAD via gh api / raw.githubusercontent | CONTRIBUTING names packages/registry and public/r with an explicit never-hand-edit rule plus the regeneration command |
| T-EXT-011 | Full gate list | AC-2 | [e2e-automated] | GitHub repo at HEAD plus workflow files | CONTRIBUTING lists all 8 gates (typecheck, biome, vitest, registry freshness, expo-doctor, peer and permission contracts both directions, 56-item integrity, design-token gate), each mapping to a real workflow job |
| T-EXT-012 | CONTRIBUTING explains fan-out and release-notes process | AC-3 | [e2e-automated] | GitHub repo at HEAD via gh api | CONTRIBUTING.md states one source in packages/registry fans out to both engine trees and documents the release-notes generation steps end to end |
| T-EXT-013 | CONTRIBUTING lists docs-PR pass criteria | AC-4 | [e2e-automated] | GitHub repo at HEAD via gh api | CONTRIBUTING.md names all four docs-PR gates verbatim: build green, link check green, snippet gate green (no hand-typed markdown code), content-standards conformance |
| T-EXT-015 | Registry-description currency stated | AC-5 | [e2e-automated] | GitHub repo at HEAD via gh api | CONTRIBUTING carries the review-enforced rule: behavior-changing item PRs update the item's registry description |

## Summary

| Type | Count |
|------|-------|
| [e2e-automated] | 78 |
| [build-gate] | 14 |
| [api-contract] | 10 |
| [human-gate] | 6 |
| [integration-test] | 2 |
| **Total** | **110** |

## Maintenance

- Adding/changing an AC (via `/kb-prd-plan --update` or `--feedback`) requires a criteria row before the sprint that ships it — re-run the every-AC-covered check.
- [human-gate] rows are the pool sprint gates sample from; keep them judgment-shaped (a human must be required, or the row belongs in [e2e-automated]).
- Provenance: product-manager lens (2 dispatches — the first failed on an output cap at T-EXT-012; its delivered 89% is staged verbatim, the delta completed it). Proposals: `.tmp/kb-prd-plan/docs-site/proposals/product-manager.criteria*.json`.
