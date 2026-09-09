---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.2.1
---

# UI Infrastructure

## Design libraries
- **Spline Sans (variable)** — UI + headings; the consumer app already sets it, so generated gallery imagery and docs read as one product. Self-hosted woff2, preloaded, `font-display: swap` (satisfies CSP `font-src 'self'`). SIL OFL 1.1.
- **Spline Sans Mono (variable)** — code, install commands, token names; same skeleton metrics as the sans. Self-hosted.
- **Lucide** via astro-icon + @iconify-json/lucide — build-time inlined SVGs; matches lucide-react inside the registry items. ISC.
- **None (deliberate)** for UI primitives — chips/badges/cards/tables/tabs/dialog are hand-rolled Astro components styled with the tokens. Registry items MUST NOT be npm-installed into the docs site (they are RN copy-paste source; installing them would also falsify the "registry ships no tokens" story).

## Style tokens (transcribed consumer vocabulary; oklch values are shadcn's Tailwind v4 rendition of the identical neutral theme)
| Token | Light | Dark | Usage |
|---|---|---|---|
| --background | oklch(1 0 0) | oklch(0.145 0 0) | Page canvas |
| --foreground | oklch(0.145 0 0) | oklch(0.985 0 0) | Body text (15.8:1 / 14.6:1) |
| --card / --popover | oklch(1 0 0) | oklch(0.205 0 0) | Elevated + dialog surfaces |
| --primary (+foreground) | oklch(0.205 0 0) | oklch(0.922 0 0) | THE one accent: CTAs, links, active tab |
| --secondary / --muted / --accent | oklch(0.97 0 0) | oklch(0.269 0 0) | Inactive panels, table bands, hover fills, inline-code pill |
| --muted-foreground | oklch(0.556 0 0) | oklch(0.708 0 0) | Descriptions, chips, types (~5.0:1 / ~7.0:1) |
| --destructive | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | Dev-client verdict tone, errors (>=4.5:1) |
| --border / --input | oklch(0.922 0 0) | oklch(1 0 0 / 10-15%) | Dividers, control edges |
| --ring | oklch(0.708 0 0) | oklch(0.556 0 0) | Focus rings, active tab indicator (>=3:1) |
| --code-background / --code-foreground | oklch(0.97 0 0) / oklch(0.205 0 0) | oklch(0.235 0 0) / oklch(0.922 0 0) | **DOCS-ONLY** (flagged in TokenTable): EC frames + install strips |

Typography: --font-sans Spline Sans Variable; --font-mono Spline Sans Mono Variable; h1 2.25rem/1.2/600; h2 1.5rem/1.35/600; h3 1.1875rem/1.45/600; body 17px/1.65 (prose); small 0.875rem/1.55; code 0.875em pill; kbd 0.75rem. Radius: --radius 0.625rem (verbatim from apps/example/global.css) with sm/md/lg/xl calc derivatives. Layout: --measure 70ch; --layout-header-h 3.5rem (scroll-margin-top); --layout-sidebar-w 16.5rem (>=lg); --layout-toc-w 14rem (>=xl).

## Component reuse (21 docs components + 4 NEW — see Component plan)
DocsLayout, Header, PageHeader, Chip/ChipRow, Badge (Expo Go positive / Dev client warning), ComponentCard, CodeBlock, CopyButton, TabGroup, InstallCommand, MatrixPreview, QrPanel, PropsTable, TokenTable, DataTable, LedgerTable+LedgerFilter, SearchDialog, ThemeToggle, Toc, Pager, Prose — full composition + reuse map in `.tmp/kb-prd-plan/docs-site/proposals/frontend-designer.ui-infra.json` (component_reuse); per-page-type bindings and wireframes in `.tmp/kb-prd-plan/docs-site/proposals/frontend-designer.ui-wireframes.json` + below (v1.2.1 ui-wireframes phase, frontend-designer lens).

## Userflows (v1.2.1 — ui-wireframes phase)

Every flow is end-to-end through the site; UC coverage is complete — all 24 UCs appear in >=1 flow (UC-DELIV-01/02 and UC-EXT-02/03 are non-UI arcs captured for completeness).

| Flow | Arc | Entry → exit | UCs |
|---|---|---|---|
| FLOW-evaluate-first-visit | One-visit evaluation from `/` | Land on `/` → hero not-npm statement + health counters + one-click hero install → CTA into docs/components or gallery QR | UC-GEND-01, UC-SHELL-01, UC-SHELL-02 |
| FLOW-browse-by-family | Find a component by browsing | `/components` → optional filter (client state only) → family anchor → card → item page | UC-GEND-02, UC-SHELL-02 |
| FLOW-read-reference | Read a generated reference page | `/components/[item]` → chip row → install-first copy → Preview/Code → deps → props/theming/usage → seam links → family pager | UC-GEND-03..06 |
| FLOW-decide-engine-install | Decide engine ONCE, install right | `/docs/installation` → decision guide keyed to project facts → engine tab (persisted `rnr-engine`) → engine-correct steps + Expo Go matrix; choice inherited site-wide | UC-DOCS-01, UC-SHELL-03, UC-GEND-04, UC-GEND-05 |
| FLOW-quickstart-integrate | First chat screen via the single quickstart | `/docs/quickstart` → named end state → engine-tabbed steps with expected-result lines → handoff to apps/example | UC-DOCS-02, UC-SHELL-03 |
| FLOW-guides-jobs | Do one how-to job | `/guides` index (capped at 5) → guide (engine forks where they differ) → troubleshooting reached symptom-first | UC-DOCS-03 |
| FLOW-boundary-porting | Ownership boundary + porting prior art | `/docs/owns-vs-does-not-own` tables → example app → `/porting` mapping/deviations/not-ported | UC-DOCS-04, UC-DOCS-05 |
| FLOW-theme-live-demo | Learn tokens by watching the site demo them | `/docs/theming` → no-config statement → TokenTable live swatches → ThemeToggle flips values in place → re-theme guide | UC-SHELL-01, UC-DOCS-01 |
| FLOW-changelog-return | Return-visit health check | `/changelog` → release page → links into touched component pages | UC-DOCS-06 |
| FLOW-registry-ledger | Bulk-audit / bulk-add | `/registry` → generated-note → base-URL copy → filter (ephemeral) → per-row install copy → correct JSON URLs | UC-GEND-07, UC-GEND-04 |
| FLOW-nojs-mobile-print | Same content, any capability | Any route with JS off / <lg viewport / print: stacked engine panels, drawer nav, `<details>` ToC, unfiltered ledger, forced-light print | UC-SHELL-04 |
| FLOW-404-recovery | Recover from dead URL / bad deploy | 404 page with shell intact → Cmd+K or plain links → vanity 301s; maintainer rollback path | UC-DELIV-04 |
| FLOW-agent-install | Agent installs correct tree first try | `llms.txt` → not-npm + absolute-URL commands → engine heuristics → `/r/{engine}/{item}.json` → CLI add | UC-EXT-01, UC-DELIV-03 |
| FLOW-github-trust | Evaluator lands on GitHub first | README (install entry + site link) → LICENSE/release notes from changelog collection → CONTRIBUTING (source-of-truth rule, CI gates) | UC-EXT-02, UC-EXT-03 |
| FLOW-build-deploy | Maintainer: fail-closed build, gated deploy | CI chain (registry:build → gallery:manifest → docs build) → gates name failing items → Cloudflare deploy + headers → one-command rollback | UC-DELIV-01, UC-DELIV-02 |

## Page types (v1.2.1)

| Page type | Routes | Kind | Wireframed |
|---|---|---|---|
| home | `/` | hybrid | yes (desktop) |
| markdown-doc | `/docs/introduction`, `/docs/cli`, `/docs/dark-mode`, `/docs/owns-vs-does-not-own`, `/porting`, `/changelog/[version]`, non-forked `/guides/[slug]` | markdown | yes (both) |
| markdown-mdx-doc | `/docs/installation`, `/docs/quickstart`, `/docs/theming`, engine-forked `/guides/[slug]` | markdown-mdx | yes (both) |
| components-index | `/components` | generated-index | yes (both) |
| component-detail | `/components/[item]` (x39) | generated-detail | yes (desktop + mobile frame) |
| registry-ledger | `/registry` | generated-ledger | yes (both) |
| section-index | `/guides`, `/changelog` | generated-index | yes (both) |
| not-found | `/404` | 404 | yes (both) |
| agent-endpoints | `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml` | static-endpoint | no — no UI surface |
| registry-json-assets | `/r/{engine}/{item}.json` (x112) | static-endpoint | no — assets, not pages |
| vanity-redirects | `/docs`, `/install`, `/quickstart`, `/theming` | redirect | no |

Dedup rules: `[item]` x39 is ONE page type; `/guides/[slug]` folds into markdown-doc or markdown-mdx-doc by whether the guide forks on engine; `/guides` + `/changelog` share the section-index wireframe.

## Wireframes (v1.2.1 — region → component bindings)

Every wireframe region binds to an existing docs component (21), to registry imagery (rendered content, never installed UI), or to one of the four NEW components in the Component plan. Binding tables use `Component (source)`: source ∈ docs · registry-imagery · NEW. All interactive regions carry a zero-JS fallback in their notes.

### home — `/` (desktop)

```
+------------------------------------------------------------------------+
| R1 Header: [RNR]  Components Registry Guides Porting Changelog  [Cmd+K] [theme] |
+------------------------------------------------------------------------+
| R5 HERO  Universal AI chat/agent UI components for React Native,       |
|          distributed as a copy-paste registry. NOT an npm package.     |
| R6       [v0.2.1] [56 items] [39 component] [11 ui] [6 lib]           |
| R7       $ npx @react-native-reusables/cli@latest add                 |
|            https://rnraielements.com/r/{engine}/{item}.json           |
|          [nativewind | uniwind]                              [copy]   |
| R8       [ Get started ]   [ Browse components ]                      |
+--------------------------------------+---------------------------------+
| R9 FAMILIES (7 sections, anchored)   | R10 quickstart strip -> /docs/quickstart |
| #conversation  #message  #prompt-    | R11 boundary one-line teaser ->         |
|   #reasoning #sources #suggestion    |     /docs/owns-vs-does-not-own          |
|   #tool                              | R12 [QR: open live gallery in Expo Go]  |
| [ComponentCard]x39 grouped by family |                                        |
+--------------------------------------+---------------------------------+
| R14 Footer (DocsLayout slot)                                            |
+------------------------------------------------------------------------+
```

| # | Region | Component | Notes |
|---|---|---|---|
| R1 | Sticky header: wordmark, section nav, Cmd+K, theme | Header (docs) | SearchDialog + ThemeToggle islands; zero-JS: trigger hidden, nav remains |
| R5 | Hero: what it is + not-an-npm-package | Prose (docs) | Static build output from registry-items.json |
| R6 | Health counters (version, 56/39/11/6) | ChipRow (docs) | Static, token-governed tones |
| R7 | Hero install command, engine tabs + copy | InstallCommand (docs) | TabGroup + CopyButton islands; zero-JS: both engine lines stacked, labeled |
| R8 | Primary CTAs | **Button (NEW)** | Primary `--primary` fill + outline link-buttons; no button primitive exists among the 21 |
| R9 | Family teaser grid, 39 cards in 7 anchored sections | ComponentCard (docs) | Name, one-liner, Chip, Badge, MatrixPreview thumbnail |
| R10 | Quickstart strip | Prose (docs) + Button (NEW) | Static |
| R11 | Boundary teaser | **Callout (NEW)** | Info-aside linking the canonical boundary page |
| R12 | Gallery QR | QrPanel (docs) | Build-time inline SVG, `role=img`, accessible name |
| R14 | Footer | DocsLayout (docs) | Home suppresses sidebar + ToC (evaluation surface — judgment call, see Notes) |

### markdown-doc — `/docs/introduction`, `/docs/cli`, `/docs/dark-mode`, `/docs/owns-vs-does-not-own`, `/porting`, `/changelog/[version]`, non-forked guides

```
+------------------------------------------------------------------------+
| R1 Header (sticky, 3.5rem): [RNR] nav... [Cmd+K] [theme]               |
+----------------+----------------------------------------+---------------+
| R2 Sidebar     | R3 PageHeader: Title                   | R8 Toc        |
| (16.5rem,>=lg) |   one-line description                 | (14rem,>=xl)  |
| DocsLayout     |   [optional ChipRow]                   | On this page  |
| section nav    +----------------------------------------+  h2/h3 anchors |
|  Getting       | R4 Prose body (70ch measure):          |               |
|   started      |   paragraphs, anchor-linked h2/h3,     |               |
|   Guides       |   inline-code pills, plain CodeBlocks  |               |
|   ...          | R5 DataTable (owns/doesn't-own tables, |               |
|                |   porting map + deviations,           |               |
|                |   not-ported list)                     |               |
|                | R6 Callout (cross-links: example app,  |               |
|                |   guides, boundary)                    |               |
|                | R7 Pager (guides only: prev/next)      |               |
+----------------+----------------------------------------+---------------+
| R9 Footer / EditThisPage (DocsLayout slot)                             |
+------------------------------------------------------------------------+
MOBILE (<lg): sidebar becomes DocsLayout <details> drawer; ToC collapses
to a top <details> block; DataTable scrolls horizontally; 70ch kept.
```

| # | Region | Component | Notes |
|---|---|---|---|
| R1 | Header | Header (docs) | Islands as above; drawer toggle <lg |
| R2 | Section sidebar | DocsLayout (docs) | Collapsible nav; <lg it is the `<details>` drawer |
| R3 | Title block | PageHeader (docs) | Title + one-liner + chips + optional breadcrumb |
| R4 | Long-form body | Prose (docs) | 70ch, anchor headings w/ scroll-margin-top |
| R5 | Boundary / porting tables | DataTable (docs) | Tables, never prose paragraphs; sticky header, zebra via `--muted` |
| R6 | Cross-link asides | **Callout (NEW)** | Example app / guides / boundary links |
| R7 | Prev/next (guides only) | Pager (docs) | Plain links |
| R8 | On-this-page rail | Toc (docs) | Zero-JS anchors, `:target` highlight; <xl collapses to `<details>` |
| R9 | Footer | DocsLayout (docs) | Incl. EditThisPage |

### markdown-mdx-doc — `/docs/installation`, `/docs/quickstart`, `/docs/theming`, engine-forked guides

```
+------------------------------------------------------------------------+
| R1 Header (sticky): [RNR] nav... [Cmd+K] [theme]                       |
+----------------+----------------------------------------+---------------+
| R2 Sidebar     | R3 PageHeader: Installation |           | R9 Toc        |
| (DocsLayout)   |   Quickstart | Theming | Guide          | (>=xl)        |
|                +----------------------------------------+---------------+
|                | R4 Prose intro: engine decision guide  |               |
|                |   keyed to project facts               |               |
|                | R5 TabGroup [nativewind | uniwind]     |               |
|                |   -> CodeBlock (install steps) [copy]  |               |
|                |   (engine chosen ONCE here, persisted) |               |
|                | R6 route-specific blocks:              |               |
|                |   /installation: DataTable Expo Go     |               |
|                |     matrix (4 opt-in items, peers,     |               |
|                |     permissions, dev-client Badges)    |               |
|                |   /quickstart: expected-result Callout |               |
|                |     per step + end-state named up front|               |
|                |   /theming: TokenTable live swatches   |               |
|                |     (theme toggle IS the demo)         |               |
|                | R7 Pager (guides)                      |               |
+----------------+----------------------------------------+---------------+
| R10 Footer (DocsLayout slot)                                           |
+------------------------------------------------------------------------+
MOBILE: same shell deltas as markdown-doc; stacked labeled engine panels
when JS is off.
```

| # | Region | Component | Notes |
|---|---|---|---|
| R1–R3 | Shell + title | Header / DocsLayout / PageHeader (docs) | Standard shell |
| R4 | Intro prose (decision guide / steps / token map) | Prose (docs) | Zero JS |
| R5 | Engine-tabbed code blocks | TabGroup (docs) + CodeBlock (docs) | Island toggles visibility only; persists `rnr-engine`; zero-JS: both panels stacked + labeled |
| R6a | Expo Go install matrix (installation) | DataTable (docs) + Badge (docs) | 4 opt-in items, peer/permission contracts |
| R6b | Expected-result asides (quickstart) | **Callout (NEW)** | "After this step you should see…" per step |
| R6c | Live token table (theming) | TokenTable (docs) | Swatches sampled from the site's own CSS custom properties; ThemeToggle re-samples live; zero-JS: static values render |
| R7 | Pager (guides) | Pager (docs) | Zero JS |
| R9 | ToC rail | Toc (docs) | <xl collapses |
| R10 | Footer | DocsLayout (docs) | Static |

### components-index — `/components`

```
+------------------------------------------------------------------------+
| R1 Header (sticky): [RNR] nav... [Cmd+K] [theme]                       |
+------------------------------------------------------------------------+
| R2 PageHeader: Components — browse the 39 items by AI family           |
| R3 [filter cards...___________________]   (client state, never URL)    |
+------------------------------------------------------------------------+
| R4 #conversation (SectionHeader + count chip)                          |
|   [ComponentCard] [ComponentCard] [ComponentCard] ...                  |
| R4 #message ... #prompt-input ... #reasoning ... #sources ...           |
|   ... #suggestion ... #tool   (7 anchored family sections)             |
|   each card: name / one-liner / category Chip / Expo Go Badge /        |
|               MatrixPreview thumbnail -> /components/[item]            |
+------------------------------------------------------------------------+
| R5 Footer (DocsLayout slot)                                            |
+------------------------------------------------------------------------+
MOBILE: cards single-column; family anchors become an in-page jump list;
filter input full-width.
```

| # | Region | Component | Notes |
|---|---|---|---|
| R1 | Header | Header (docs) | Search is the PRIMARY path; this page is secondary |
| R2 | Title block | PageHeader (docs) | Static |
| R3 | Card-grid filter | LedgerFilter (docs) | Island generalized to the card grid per 10-routing.md — keeps the five-island budget; zero-JS: full grid renders |
| R4 | Family section heading + count + anchor | **SectionHeader (NEW)** | h2 + count Chip + `#anchor`; extracted (Rule of 2 — also serves section indexes) |
| R4b | Item cards (x39, 7 sections) | ComponentCard (docs) | Thumbnail is registry imagery, not installed UI |
| R5 | Footer | DocsLayout (docs) | Static |

### component-detail — `/components/[item]` x39 (desktop)

```
+------------------------------------------------------------------------+
| R1 Header (sticky): [RNR] nav... [Cmd+K] [theme]                       |
+----------------+----------------------------------------+---------------+
| R2 Sidebar     | R3 PageHeader: family > Item           | R13 Toc       |
| (16.5rem,>=lg) |   one-line description                 | (14rem,>=xl)  |
| (DocsLayout)   | R4 [v0.2.1][category][nw|uw]           | Install       |
|                |    [Expo Go | Dev client]              | Preview       |
|                +----------------------------------------+ Dependencies  |
|                | R5 INSTALL (first content block)       | Props         |
|                |  $ npx @react-native-reusables/cli@   | Theming       |
|                |    latest add https://rnraielements.  | Usage         |
|                |    com/r/{engine}/{item}.json         |               |
|                |  [nativewind | uniwind]      [copy]   |               |
|                | R6 [Preview | Code]                    |               |
|                |   Preview: MatrixPreview (4-state +    |               |
|                |     dark strip, theme-following) +     |               |
|                |     QrPanel (gallery deep link)        |               |
|                |   Code: full untruncated source,       |               |
|                |     CopyButton, no max-height          |               |
|                | R7 Dependencies: DataTable             |               |
|                |   (registryDependencies, dependencies, |               |
|                |    AI SDK v7 peers) + troubleshooting  |               |
|                |    Callout link                       |               |
|                | R8 PropsTable (name/type/default/desc) |               |
|                | R9 Theming note (Prose + token Chips)  |               |
|                | R10 Usage snippets (CodeBlock, from    |               |
|                |    the item's gallery cell) [copy]     |               |
|                | R11 Seam Callout (renderMarkdown /     |               |
|                |    TextClassContext -> guides)         |               |
|                | R12 Pager: <- prev item | next item -> |               |
|                |    (within family)                     |               |
+----------------+----------------------------------------+---------------+
| R14 Footer / EditThisPage (DocsLayout slot)                            |
+------------------------------------------------------------------------+
NO-IMAGERY VARIANT: R6 Preview panel is omitted entirely (never a
placeholder box) until the Playwright capture sprint ships; build then
fails on missing imagery. PRINT: both engine panels expand, labeled.
```

| # | Region | Component | Notes |
|---|---|---|---|
| R1 | Header | Header (docs) | Search indexes props + verdict text |
| R2 | Sidebar | DocsLayout (docs) | <lg → drawer (mobile frame below) |
| R3 | Breadcrumb + title | PageHeader (docs) | Breadcrumb slot: family > item; generated |
| R4 | Status chip row | ChipRow (docs) + Badge (docs) | Expo Go positive / Dev client `--destructive` warning; same markup as cards + ledger |
| R5 | Install block — FIRST content section | InstallCommand (docs) | TabGroup (persisted engine) + CopyButton; absolute-URL-only |
| R6 | Preview \| Code toggle | TabGroup (docs) | Same generic island; zero-JS stacked; server-rendered → Code crawlable |
| R6a | Preview content | MatrixPreview (docs) | Registry imagery: 4-state + dark strip, fixed aspect (no CLS), theme-following |
| R6b | QR deep link | QrPanel (docs) | Inline SVG, accessible name "Open the {item} gallery screen in Expo Go" |
| R6c | Code content | CodeBlock (docs) | Full untruncated source, never height-limited |
| R7 | Dependency panel | DataTable (docs) | registryDeps + deps incl. AI SDK v7 peers; troubleshooting Callout |
| R8 | Props table | PropsTable (docs) | From prebuild ts-morph data; CSS-only mobile card mode |
| R9 | Theming note | Prose (docs) | Token names as Chips/pills |
| R10 | Usage snippets | CodeBlock (docs) | Derived from the item's gallery cell — never hand-written per page (fidelity rule, v1.2.0) |
| R11 | Extension-seam links | **Callout (NEW)** | renderMarkdown / TextClassContext → guides |
| R12 | Prev/next in family | Pager (docs) | Generated adjacency |
| R13 | ToC rail | Toc (docs) | <xl collapses |
| R14 | Footer | DocsLayout (docs) | Incl. EditThisPage |

**component-detail — mobile frame** (shell-level deltas repeat on every page type):

```
+--------------------------------+
| [=] RNR          [Cmd+K] [th]  |  Header + drawer toggle
+--------------------------------+
| (drawer open state, <details>) |
|  Getting started               |
|  Components  > families        |  DocsLayout drawer
|  Registry / Guides / Porting   |
|  Changelog                     |
+--------------------------------+
| family > Item (breadcrumb)     |  PageHeader
| one-line description           |
| [v0.2.1][cat][nw|uw][Expo Go]  |  ChipRow (wraps)
| [v] On this page (<details>)   |  Toc as collapsible block
| $ npx ... r/{engine}/{item}.   |  InstallCommand strip
|   json  [nw|uw]        [copy]  |
| [Preview | Code]               |  TabGroup
| PropsTable -> stacked cards    |  PropsTable CSS card mode
| <- prev item    next item ->   |  Pager full-width
+--------------------------------+
TOUCH TARGETS >=44px; LedgerTable/DataTable scroll horizontally with
sticky first column; drawer + TOC <details> work with zero JS.
```

| # | Region | Component | Notes |
|---|---|---|---|
| M1 | Drawer nav (replaces >=lg sidebar) | DocsLayout (docs) | `<details>` drawer, zero-JS operable; reduced-motion disables slide |
| M2 | Header + drawer toggle | Header (docs) | Same Header |
| M3 | Title + breadcrumb + wrapped chips | PageHeader (docs) | Identical markup to desktop |
| M4 | Install strip | InstallCommand (docs) | Zero-JS stacked fallback |
| M5 | Preview \| Code + props as stacked cards | TabGroup (docs) | Card-ify via CSS only — no new island |

### registry-ledger — `/registry`

```
+------------------------------------------------------------------------+
| R1 Header (sticky): [RNR] nav... [Cmd+K] [theme]                       |
+------------------------------------------------------------------------+
| R2 PageHeader: Registry ledger — all 56 items                           |
|    [generated at build from public/r/*.json — cannot drift] (Chip)     |
| R3 Bulk-add intro (Prose): two engine base URLs                        |
|    https://rnraielements.com/r/nativewind  [copy]                      |
|    https://rnraielements.com/r/uniwind    [copy]                       |
| R4 LedgerFilter: [All|component|ui|lib] [nw|uw toggle] [filter______]  |
+------------------------------------------------------------------------+
| R5 LedgerTable (56 rows):                                               |
|  item | category | engines | Expo Go Badge | $ install cmd [copy] | ->  |
|  ...zebra bands via --muted, sticky header, hover --accent              |
+------------------------------------------------------------------------+
| R6 Footer (DocsLayout slot)                                            |
+------------------------------------------------------------------------+
NO-JS: full unfiltered table + base URLs + note all render.
MOBILE: horizontal scroll w/ sticky first column; tabs scroll as chips.
```

| # | Region | Component | Notes |
|---|---|---|---|
| R1 | Header | Header (docs) | Islands as above |
| R2 | Title + generated-note chip | PageHeader (docs) + Chip (docs) | Build-generated content — maintainers cannot hand-edit |
| R3 | Engine base URLs + bulk-add intro | Prose (docs) + CopyButton (docs) | Zero-JS: URLs render as selectable text |
| R4 | Category tabs + engine toggle + text filter | LedgerFilter (docs) | All filter state ephemeral client DOM state — canonical URL never changes |
| R5 | 56-row generated table | LedgerTable (docs) | Per-row CopyButton + Badge verdict pair; generated from registry-items.json at build |
| R6 | Footer | DocsLayout (docs) | Static |

### section-index — `/guides`, `/changelog`

```
+------------------------------------------------------------------------+
| R1 Header (sticky): [RNR] nav... [Cmd+K] [theme]                       |
+----------------+----------------------------------------+---------------+
| R2 Sidebar     | R3 PageHeader: Guides | Changelog       | (no ToC —    |
| (DocsLayout)   |   one-line description                 |  short page) |
|                +----------------------------------------+               |
|                | R4 SectionHeader: All guides (5) |     |               |
|                |   Releases (reverse-chrono)            |               |
|                | R5 IndexList:                          |               |
|                |  [title]  one-liner  [Chip meta]  ->   |               |
|                |  guides: 5 entries (re-theme, update,  |               |
|                |   preview, custom rendering,          |               |
|                |   troubleshooting)                     |               |
|                |  changelog: [v0.2.1] date + touched-   |               |
|                |   component links -> /components/[*]   |               |
+----------------+----------------------------------------+---------------+
| R6 Footer (DocsLayout slot)                                            |
+------------------------------------------------------------------------+
/changelog is the hybrid variant: entries generated from the release
collection; link out to touched component pages. MOBILE: single column.
```

| # | Region | Component | Notes |
|---|---|---|---|
| R1–R3 | Shell + title | Header / DocsLayout / PageHeader (docs) | Standard shell; no ToC (short page) |
| R4 | Section heading with count | **SectionHeader (NEW)** | Same primitive as /components families (Rule of 2) |
| R5 | Linked entry rows: title + one-liner + meta chip | **IndexList (NEW)** | ComponentCard is registry-imagery-specific and does not fit docs/release entries; changelog rows carry touched-component links; zero JS |
| R6 | Footer | DocsLayout (docs) | Static |

### not-found — `/404`

```
+------------------------------------------------------------------------+
| R1 Header (sticky): [RNR] nav... [Cmd+K] [theme]                       |
+------------------------------------------------------------------------+
| R2 PageHeader: 404 — Page not found                                    |
| R3 Prose: the URL moved or never existed. Try search:                  |
| R4 Callout: press Cmd+K to search all 56 items and every docs page     |
|    (SearchDialog is the primary recovery path)                         |
| R5 [ Search the site ]  [ Browse components ]  [ Registry ]            |
+------------------------------------------------------------------------+
| R6 Footer (DocsLayout slot)                                            |
+------------------------------------------------------------------------+
MOBILE: identical single-column structure.
```

| # | Region | Component | Notes |
|---|---|---|---|
| R1 | Shell header — theme + Cmd+K stay live | Header (docs) | SearchDialog is the recovery mechanism |
| R2 | 404 title block | PageHeader (docs) | Static |
| R3 | Recovery prose | Prose (docs) | Static |
| R4 | Search-recovery hint | **Callout (NEW)** | Plain links carry recovery without JS |
| R5 | Recovery CTAs | **Button (NEW)** | Primary focuses SearchDialog trigger; secondary = plain links to /components, /registry |
| R6 | Footer | DocsLayout (docs) | Static |

## Component plan (v1.2.1)

**NEW components — 4, each justified by the Rule of 2, all zero-JS.** These are the only honest gaps found against the existing 21; everything else binds to an existing component.

| New component | Justification | Used on |
|---|---|---|
| Button | Primary/secondary CTA primitive (filled `--primary` / outline / link variants) — no button primitive exists among the 21; home + 404 CTAs currently have no home. Hand-rolled Astro anchor/button. | home hero CTAs, not-found recovery CTAs |
| SectionHeader | Anchored section heading (h2 + count/label Chip + `#fragment` id), appearing 7× on /components + section indexes — extracted so anchors and scroll-margin stay consistent | components-index (x7), section-index |
| IndexList | Linked non-registry entry rows (title + one-liner + meta Chip) — ComponentCard is registry-imagery-specific; pattern appears on both /guides and /changelog | section-index; optionally home quickstart strip |
| Callout | Token-governed info/warning aside with a link — 2+ real uses (home teaser, quickstart expected-results, component-detail seams + troubleshooting, 404 hint); none of the 21 covers asides | home, quickstart, component-detail, markdown-doc, not-found |

**Island budget — exactly five, all vanilla, all with zero-JS fallbacks:**

1. **CopyButton** — every CodeBlock and InstallCommand (home, component-detail, registry-ledger, all docs pages)
2. **TabGroup** — engine tabs on markdown-mdx pages + forked guides, component-detail install block and Preview|Code, home hero InstallCommand
3. **LedgerFilter** — /registry (tabs + engine toggle + text filter) AND /components card grid (generalized per 10-routing.md — a separate card-filter island would make six)
4. **SearchDialog** — every route via Header trigger (lazy Pagefind on first open); primary recovery on /404
5. **ThemeToggle** — every route via Header; the live-demo actor on /docs/theming

No island gates content. Engine + theme persist via localStorage (`rnr-engine`, `rnr-theme`), applied pre-paint by `is:inline` head scripts, never in the URL.

**Wireframe judgment calls (from the ui-wireframes phase, kept as notes):**
- Home is framed as DocsLayout with sidebar + ToC suppressed (one-screen evaluation surface, not a reading surface) — confirm intent if the shell constitution wants the sidebar on home too; all home region bindings are unaffected.
- The 10-routing.md filter state on /components is implemented by generalizing LedgerFilter (constitution wins over the earlier ui-infra proposal draft).
- Agent + maintainer arcs (llms.txt, /r/*.json, build/deploy/rollback) are real userflows with no UI surface — page types `static-endpoint` / `redirect`, matching the routing constitution's "assets, not pages" boundary.

## Hard UI constraints
No client framework; exactly five islands; every island has a zero-JS fallback; build-time-only data (never a placeholder/stale screenshot); no URL state; token-governed styling (no hex literals); full untruncated source always; engine panels server-rendered (never client-fetched); pre-paint scripts `is:inline` + `data-astro-rerun`, islands init on `astro:page-load`; `apps/docs/public/r` generated-only; dark-first; WAI-ARIA tabs pattern, focus trap + Escape in dialogs, `:focus-visible` 2px ring + 2px offset, reduced-motion guards; WCAG AA verified pairs in both themes; print styles on reference pages; generated imagery ships with generated alt text derived from item name + state ('message component, iOS, dark, streaming state') and decorative chrome is alt="" [v1.1.0 TW-11].
