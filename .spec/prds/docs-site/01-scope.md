---
stability: FEATURE_SPEC
last_validated: 2026-09-08
prd_version: 1.0.0
scope_posture: full
---

# Scope

## Scope Posture

Full feature (default — kb-prd-plan never asks for sizing).

## In Scope

- Static Astro 7 docs site as `apps/docs` in the existing pnpm workspace — content collections (docs, changelog) plus `getStaticPaths` pages generated from a prebuilt `registry-items.json` artifact; fully static output, no adapter.
- Home page evaluation surface: one-screen what-this-is / not-npm statement, health counters (v0.2.1, 56 items split 39/11/6), copyable install command, Get started + Browse components CTAs.
- Getting-started set: Introduction, Installation (engine fork decided exactly once), CLI, Theming, Dark mode — with the engine decision guide keyed to project facts and the no-`tailwind.config.js` theming guide.
- Exactly one tutorial: the build-a-chat-screen quickstart with engine-tabbed code blocks, pointing at the `apps/example` worked integration.
- Lean Guides section, five pages max at launch: customize oklch tokens (step-by-step rebrand; the Theming page keeps the token map as reference), update installed items when the registry moves, preview on device via Expo Go, customize rendering (the renderMarkdown + TextClassContext extension seams), and troubleshooting (symptom -> cause -> fix for the short-name collision, wrong-engine-tree symptoms, the Expo Go cliff, markdown streaming crash). Engine choice is NOT a guide — Installation owns that decision; porting is NOT a guide — /porting and CONTRIBUTING own the contributor path. [v1.1.0 TW-01/02/03]
- Porting notes: upstream-to-port mapping table with deviations column, not-ported list, prior-art context.
- Changelog: one entry per release, reverse chronological, linking the component pages each release touched. The GitHub release body is GENERATED from the changelog collection by the release process — never hand-maintained twice. [v1.1.0 TW-07]
- 39 generated component reference pages grouped by the 7 AI families — chip row, install block first, preview/code views, props table, theming note, usage snippets, family pager.
- Auto-generated props/API tables from build-time ts-morph extraction; full untruncated item source in a Code view with always-visible copy.
- Derived per-component usage snippets and theming notes: the usage snippet is the item's canonical usage file (the gallery cell) inlined at build — never hand-written per page; the theming note lists the oklch tokens extracted from the item source. No authored prose per component beyond the registry description. [v1.2.0]
- Exact absolute-URL install commands with one-click copy for every item and family; per-item dependency panel including AI SDK v7 peers.
- Per-item Expo Go verdicts with peer/permission contracts (the 4 opt-in dev-client items) as badges + install-docs matrix. QR deep links to the live gallery ship now; matrix/dark-strip imagery is phase-flagged (UC-GEND-05).
- Generated registry ledger of all 56 items at `/registry` — filterable, per-row copy, engine base URLs, bulk-add, generated-at-build note.
- Dark-first themed shell: the site styled by the same Tailwind v4 `@theme` oklch vocabulary it documents, persisted flash-free toggle, TokenTable live demo.
- Pagefind Cmd+K search as primary navigation; family browse secondary; persisted engine tabs (localStorage, never URL).
- Delivery: Cloudflare Workers static assets at the rnraielements.com apex — zone-level www 301, security + tiered-cache headers, deploy gated behind registry/typecheck/lint/test, non-promoting PR previews, instant rollback; registry JSON served from the same deploy at `/r/{engine}/{item}.json`.
- GitHub-facing trust surface (README, LICENSE, CONTRIBUTING, release notes) and machine-readable agent docs: `llms.txt`, `llms-full.txt`, `robots.txt` generated from the same collections + registry data.
- Content standards for every authored page: Google developer-doc style baseline (active voice, short sentences, second person), a locked glossary (registry item, family, engine, engine tree, verdict, peer, dev client — one canonical term each), per-page-type content templates (guide opening pattern, getting-started scope/non-scope, generated-page description pattern), and generated alt text for phase-2 imagery. Authored code snippets are extracted from or typechecked against real files (no hand-typed code in markdown), and a link check runs over dist/. [v1.1.0 TW-05/06/09/11]

## Out of Scope

- Playwright imagery capture pipeline (four-state matrix + dark-strip screenshots) — its own future sprint; this PRD ships only the null-imagery omission contract (preview panel omitted, never a placeholder) and the fail-once-live gate. `[DEFERRED: separate PRD/sprint]`
- Per-page OG image generation at `/og/{slug}.png` — one static og image now; the `/og/*` cache tier lands with a generator. `[DEFERRED: post-launch]`
- Live React Native rendering inside the docs DOM — infeasible; answered on-device via the Expo Go QR path plus generated props tables.
- SSR, a server runtime, or any Cloudflare bindings (KV/D1/R2/DO) — static-only output; bindings would also block instant rollback.
- Client-framework islands (React/Vue/Svelte hydration) — exactly five vanilla islands, each with a zero-JS fallback.
- External search services (Algolia, Typesense, fuse.js, lunr) — Pagefind over `dist/` is the serverless fit.
- Hosting registry JSON anywhere other than this deploy — `/r/*` served same-origin by design (user-confirmed 2026-09-08).
- Additional tutorials or multi-version docs — one quickstart; no versioned-docs requirement exists.
- Analytics or telemetry on the docs site.
- CSP hash-tightening and gradual deployment rollouts — operational hardening beyond launch scope.
