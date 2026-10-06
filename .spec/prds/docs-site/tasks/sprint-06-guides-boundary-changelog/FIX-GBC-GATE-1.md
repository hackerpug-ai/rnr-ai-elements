# FIX-GBC-GATE-1 — un-freeze the 15 earlier-sprint e2e lane specs

> Status: implemented — cycle-1 fixes applied per spec below; final full `pnpm e2e:docs` verification recorded under `.tmp/FIX-GBC-GATE-1/cycle-1/green/`.

Sprint-06 gate step 5 requires `pnpm e2e:docs` to exit 0 with retries 0. The 2026-10-06
full run (RED evidence: `.tmp/FIX-GBC-GATE-1/cycle-1/red/full-run-48-failures.log`) showed
48 failures: 3 owned by FIX-GBC-003-1 (`boundary-tables.spec.ts:103`, NOT this task), and
45 across 15 earlier-sprint spec files — this task's set.

## Per-spec finding → diagnosis → fix

| Spec (project instances) | Finding | Diagnosis | Fix |
|---|---|---|---|
| `sprint-01/component-page.spec.ts:415` (3) | `div.family-grid-slot ~ section` = 8, expected 7 | GBC-013 added the `dev-client-matrix` section (class only, no id) as a lawful non-family sibling after the grid | Lane: select `~ section[id]` (the 7 id'd family sections) |
| `sprint-01/home.spec.ts:174` (3) | `locator('aside')` = 1, expected 0 | ORI-CONT-005's boundary Callout on the home hero renders a lawful content `<aside class="callout">`; the lane's intent is the absence of reading RAILS | Lane: assert 0 `aside[class*="markdown-doc__"], aside[class*="section-index__"]` (rail asides) |
| `sprint-01/ledger.spec.ts` :116/:184/:204/:269/:298 (12) | `td.ledger-type` gone (`Array []`); bulk-add `code` matches 2 (plain + CopyButton copy); `td.ledger-docs a` gone; 112 row copy buttons | ORI-AST-007/ORI-VIS-004 rebuilt the ledger through shared DataTable: stripped Category cell (`td:nth-child(2)`), Badge in 4th cell, `a[data-docs-link]` on every row, TWO labeled engine command blocks per row; ORI-AST-008 retarget links ALL 56 rows to `/components/{name}` reference pages (all 56 exist, verified 200) | Lane: selectors to the current DataTable surface; category values stripped (`component/ui/lib`); docs-href expectation all-`/components/{name}`; copy counts 56 per nativewind block + 112 total; bulk-add plain code = `code:not(.copy-button__command)` |
| `sprint-02/item-install-copy.spec.ts:320` (1, mobile) | nativewind tab click intercepted forever by `page-header`/`site-header` content; 240s timeout | REAL PRODUCT BUG: six item pages (terminal, environment-variables, package-info, stack-trace, schema-display, web-preview) horizontally overflow at 393px — generated descriptions carry unbreakable slash-joined tokens (e.g. 794px `WebPreview/WebPreviewNavigation/...`); mobile Chrome zooms the page out (innerWidth 393→794) and Playwright's actionability geometry diverges from the visual position | PRODUCT: `overflow-wrap: anywhere` on `.item-description` (`apps/docs/src/pages/components/[item].astro`). Verified: all 39 item pages `innerWidth == 393` after the fix |
| `sprint-03/ledger-filter-island.spec.ts:204` (2) | `[role="search"]` = 2, expected 1 | Sprint-05's site-wide search dialog (`search-dialog__form`) is a second, separately labeled search landmark alongside the filter island's | Lane: scope to `rnr-ledger-filter[role="search"]` |
| `sprint-03/verdict-badge-wiring.spec.ts:110` (3) | `td.ledger-docs a` absent (timeout on `tr#row-shimmer`); same ledger rebuild as above | Same ORI-AST-007/ORI-VIS-004/ORI-AST-008 truths | Lane: badge = `td:nth-child(4) .badge`; docs href all-`/components/{name}`; per-row affordances 112 (both engines); bulk-add plain-code scoping |
| `sprint-04/exact-absolute-url-command-copy.spec.ts:162` (1, mobile) | Same mobile click interception as item-install-copy | Same product bug | Same product fix (no lane change needed) |
| `sprint-04/site-crawl.spec.ts:91` (3) | 2 crawl-purity violations on `/guides/update-installed-items` | Parser false positives on expressive-code output: 0x7F line separators ride the URL token, the `data-code` attribute copy ends mid-token (`--overwrite">`), and GBC-001/AC-2's reviewed guide legitimately teaches the `--overwrite` CLI flag (a flag is not an add ARGUMENT) | Lane: strip control chars/quotes/`>` from tokens; allow `--flag` tokens; every other token must still be an absolute registry URL (short-name/relative forms still violate) |
| `sprint-04/tab-panels-in-initial-html.spec.ts:146` (3) | `id="panel-nativewind"` count 0 on all 39 pages | ORI-AST-002 scoped TabGroup ids behind per-instance group prefixes (`{groupId}-panel-{engine}`); the literal pin is stale | Lane: probe the contract attributes — `role="tabpanel"[^>]*data-engine="{engine}"` counts in the served bytes |
| `sprint-05/boundary-content.spec.ts:197` (3) | `#rendermarkdown` carries no heading descendant; page no longer says "does not yet include a live streaming chat" | The anchor id rides the h2 itself (no wrapper section), heading text is `renderMarkdown`; the example app SHIPPED its /live-chat route, superseding the old honesty caveat with the current phrasing | Lane: assert the anchor's own text contains `renderMarkdown`; assert the new honest sentences (`composes the same registry items around AI SDK v7 useChat`, `the model-side wiring your app owns`) |
| `sprint-05/getting-started-engine-decision.spec.ts:340` (3) | ENOENT `owns-vs-does-not-own.md`; then live-guide link locator waits forever | The boundary source is `.mdx` (ORI-CONT-005 composed Callouts into it); the boundary NAMES the run guide path in prose instead of hyperlinking it (boundary page under GBC-003's active rework) | Lane: read the `.mdx` source; assert the rendered boundary carries the live-guide PATH in prose + the guide file exists |
| `sprint-05/orientation-content.spec.ts:370` (3) | Expected NO troubleshooting link ("unimplemented Sprint 06"), got `/guides/troubleshooting` | Sprint-06 GBC-002 SHIPPED the guide and the installation page links it — the lane asserted a temporary state | Lane: assert exactly `/guides/troubleshooting` is linked (and the resolve loop still proves 200) |
| `sprint-05/quickstart-chat-screen.spec.ts:205` (1, desktop) | Fail-closed: `RNR_S05_IOS_UDID must be provided` | The six-target device matrix proof requires env the invocation must export (by design, never a reduced matrix) | Environment: export `RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1` (pinned iPhone 17, booted on this machine, Expo Go present) + `RNR_S05_ANDROID_SERIAL` (booted emulator) + `OPENAI_API_KEY` (set); the matrix then runs for real |
| `sprint-05/registry-item-reference-pages.spec.ts:519` (3) | `a[href="/docs/theming#rendermarkdown"]` = 0 on /components/message | GBC-001 retargeted `SEAM_LINK_TARGETS` to `/guides/customize-rendering#rendermarkdown` (verified in the built page) | Lane: assert the GBC-001 target |
| `sprint-05/token-presentation.spec.ts:547` (1, mobile) | `.token-table__scroll` cannot scroll (`afterScrollLeft` 0); table element `display: block` | REAL PRODUCT BUG: GBC-017's `.prose :global(table) { display: block; overflow-x: auto }` hijacks the DataTable-composed TokenTable inside the theming prose body — the table element became its own scroll container, leaving DataTable's wrapper with nothing to scroll and breaking the mobile pinned-column contract | PRODUCT: scope the prose rule to markdown tables — `.prose :global(table:not(.data-table))` (plus the <48rem first-column cap), `apps/docs/src/components/Prose.astro` |

## AC-1

`pnpm e2e:docs` exits 0 in this worktree with retries 0; the ONLY allowed failures are the
3 `tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts:103` instances owned
by FIX-GBC-003-1. Full-run log: `.tmp/FIX-GBC-GATE-1/cycle-1/green/`.

## Test criteria + verify commands

```bash
# focused per-spec (iteration)
pnpm exec playwright test tests/sprint-01-docs-spike-skeleton/ledger.spec.ts --project=chromium-desktop
# full acceptance lane
pnpm e2e:docs   # build → playwright over astro preview :4321, retries 0, workers 1
```

TC-1 every fixed spec passes in all three projects (chromium-desktop, chromium-mobile,
chromium-nojs). TC-2 the two product fixes are observable: `innerWidth == 393` on every
item page at the Pixel 5 viewport; `.token-table__scroll` scrolls with `scrollLeft > 0` on
/docs/theming at 393px.

## WRITE-ALLOWED (touched)

- `tests/sprint-01-docs-spike-skeleton/component-page.spec.ts`, `home.spec.ts`, `ledger.spec.ts`
- `tests/sprint-03-family-browse/ledger-filter-island.spec.ts`, `verdict-badge-wiring.spec.ts`
- `tests/sprint-04-generated-reference/site-crawl.spec.ts`, `tab-panels-in-initial-html.spec.ts`
- `tests/sprint-05-orient-search/boundary-content.spec.ts`, `getting-started-engine-decision.spec.ts`, `orientation-content.spec.ts`, `registry-item-reference-pages.spec.ts`
- (`tests/sprint-02-shell-hero/item-install-copy.spec.ts`, `tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts`, `tests/sprint-05-orient-search/token-presentation.spec.ts`, `quickstart-chat-screen.spec.ts` — in scope; no lane edit needed for the first two)
- PRODUCT (rule-2 case 2, evidence above): `apps/docs/src/pages/components/[item].astro`, `apps/docs/src/components/Prose.astro`
- `.tmp/FIX-GBC-GATE-1/**` evidence
