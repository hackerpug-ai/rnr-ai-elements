---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.0.0
---

# Routing & Views

**Discriminator (route vs state):** a URL route differs by *content*; engine tab, filter, dialog, theme, drawer, Preview/Code are DOM/localStorage **states** of a route. No two routes may differ only by such state, and no client state ever enters the URL (query params, state hashes, pushState) — shared URLs must not pin a reader to the wrong engine tree. Engine state is localStorage (`rnr-engine`), theme is localStorage (`rnr-theme`); both re-applied pre-paint via `is:inline` + `data-astro-rerun` head scripts. Content anchors (`#conversation` family sections) are allowed.

**Router decision:** Astro static routes (`src/pages/**` + content collections); ClientRouter enabled for hover-prefetch/soft nav with the documented MPA escape hatch; islands router-agnostic.

## Route map

| Route | Kind | States | Primary UCs | Enter when |
|-------|------|--------|-------------|------------|
| `/` | hybrid (generated from registry-items.json) | engine-tab (hero), cmdk, theme, drawer | UC-GEND-01 | first visit / evaluation |
| `/docs/introduction` | markdown | cmdk, theme, drawer | UC-DOCS-01 | Get started CTA |
| `/docs/installation` | markdown-mdx | engine-tab (decided ONCE, persisted), cmdk, theme, drawer | UC-DOCS-01, UC-SHELL-03 | integrating |
| `/docs/cli` | markdown | cmdk, theme, drawer | UC-DOCS-01 | CLI questions — scoped to THIS registry's usage, links out to the authoritative RNR CLI reference [v1.1.0 TW-13] |
| `/docs/theming` | markdown-mdx + TokenTable live demo | theme (IS the demo), cmdk, drawer | UC-DOCS-01, UC-SHELL-01 | re-theming |
| `/docs/dark-mode` | markdown | cmdk, theme, drawer | UC-DOCS-01 | dark-mode wiring |
| `/docs/quickstart` | markdown-mdx (the single tutorial) | engine-tab (inherited), cmdk, theme, drawer | UC-DOCS-02 | first integration |
| `/docs/owns-vs-does-not-own` | markdown (tables) | cmdk, theme, drawer | UC-DOCS-04 | boundary questions |
| `/components` | generated index (families + data) | filter input, family anchors, cmdk, theme, drawer | UC-GEND-02 | browsing |
| `/components/[item]` (x39) | generated (getStaticPaths) | engine-tab, preview-code toggle, cmdk, theme, drawer | UC-GEND-03..06 | reference |
| `/registry` | generated ledger | ledger-filter, category-tabs, engine toggle, cmdk, theme, drawer | UC-GEND-07, UC-DELIV-03 surface | install copy / bulk add |
| `/changelog` | hybrid index | cmdk, theme, drawer | UC-DOCS-06 | health check |
| `/changelog/[version]` | markdown (collection) | cmdk, theme, drawer | UC-DOCS-06 | release detail |
| `/guides` | generated index (section-index page type) | filter input, cmdk, theme, drawer | UC-DOCS-03 | Guides nav entry [v1.1.0 TW-08] |
| `/guides/[slug]` (x5) | markdown | engine-tab (where engines differ), cmdk, theme, drawer | UC-DOCS-03 | how-to jobs |
| `/porting` | markdown (mapping tables) | cmdk, theme, drawer | UC-DOCS-05 | porting/contributing |
| `/llms.txt`, `/llms-full.txt`, `/robots.txt` | generated endpoints | — | UC-EXT-01 | agent fetch |
| `/sitemap.xml` | generated | — | — | crawlers |
| `/r/{engine}/{item}.json` (x112) | static assets (copied at prebuild — assets, not pages) | — | UC-DELIV-03 | CLI/agent install |
| `/404` | generated | cmdk (recovery), theme | UC-DELIV-04 | dead URL |
| `/docs` | redirect 301 → `/docs/introduction` | — | UC-DELIV-04 | vanity |
| `/install` | redirect 301 → `/docs/installation` | — | UC-DELIV-04 | vanity |
| `/quickstart` | redirect 301 → `/docs/quickstart` | — | UC-DELIV-04 | vanity [v1.1.0 TW-12] |
| `/theming` | redirect 301 → `/docs/theming` | — | UC-DELIV-04 | vanity [v1.1.0 TW-12] |

Every UI-facing UC maps to a route's States or Primary UCs (validated at [12]); every route serves >=1 UC — the llms/sitemap/robots/redirect rows serve UC-EXT-01/UC-DELIV-04 crawlers-and-agents, the `/r/*` assets serve UC-DELIV-03.

## Route Delta

| Route | Status | Detail | Discriminator rationale |
|-------|--------|--------|-------------------------|
| all | NEW | v1.0.0 — initial map | n/a (greenfield site) |

## UC coverage (validation appendix)

Every UC in the PRD maps to a route's Primary UCs, one of its States, or is explicitly non-UI:

| UC | Covered by |
|----|------------|
| UC-DOCS-01 | `/docs/introduction`, `/docs/installation`, `/docs/cli`, `/docs/theming`, `/docs/dark-mode` |
| UC-DOCS-02 | `/docs/quickstart` |
| UC-DOCS-03 | `/guides` (index) + `/guides/[slug]` |
| UC-DOCS-04 | `/docs/owns-vs-does-not-own` |
| UC-DOCS-05 | `/porting` |
| UC-DOCS-06 | `/changelog`, `/changelog/[version]` |
| UC-GEND-01 | `/` |
| UC-GEND-02 | `/components` |
| UC-GEND-03 | `/components/[item]` |
| UC-GEND-04 | `/components/[item]` + `/registry` + `/` (engine-tab state on install blocks) |
| UC-GEND-05 | `/components/[item]` (QR panel + verdict chips) + `/docs/installation` (matrix) |
| UC-GEND-06 | `/components/[item]` (props + code states) |
| UC-GEND-07 | `/registry` |
| UC-SHELL-01 | `theme` state on every route + `/docs/theming` (TokenTable demo) |
| UC-SHELL-02 | `cmdk-dialog` state on every route + `/404` recovery |
| UC-SHELL-03 | `engine-tab` state (persisted) on `/docs/installation`, `/docs/quickstart`, `/components/[item]`, `/guides/[slug]` |
| UC-SHELL-04 | zero-JS/mobile/print behavior of every route (`drawer`, no-JS fallbacks, print styles) |
| UC-DELIV-01 | non-UI — CI build chain (see 11-e2e-testing.md lanes) |
| UC-DELIV-02 | non-UI-page — deploy + headers; observable at every route via `curl` |
| UC-DELIV-03 | `/r/{engine}/{item}.json` static assets |
| UC-DELIV-04 | `/404` + `/docs`, `/install` redirects |
| UC-EXT-01 | `/llms.txt`, `/llms-full.txt`, `/robots.txt` |
| UC-EXT-02 | non-site — GitHub README/LICENSE/release notes |
| UC-EXT-03 | non-site — GitHub CONTRIBUTING.md |
