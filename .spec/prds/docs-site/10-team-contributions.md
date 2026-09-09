# Team Contributions

All findings staged verbatim at `.tmp/kb-prd-plan/docs-site/proposals/` (the diff between those files and this PRD is orchestrator merge/dedupe/template-fill only).

## Phase 1 - User Personas
- 5 product personas (incl. the AI coding agent as a non-human reader), 12 needs, 10 pain points, 5 journeys
- 4 design personas, design direction: sections, page types, theme (Diátaxis calibration vs RNR nav)
- Contributors: product-manager, frontend-designer

## Phase 2 - Architecture
- 21 traced functional requirements (every one mapped to staged persona findings; zero uncovered at synthesis)
- Site architecture: apps/docs placement, static-only output, content collections + DocsDataPrebuild fail-closed gates, Pagefind search, islands inventory, route map draft — verified against current docs (Astro 7 / Vite 8, Expressive Code Astro v7 support, @tailwindcss/vite Vite 8 compatibility, Pagefind)
- Deploy architecture: Workers static assets (not Pages — feature-frozen), apex canonical + zone-level www 301, gated GitHub Actions deploy via wrangler-action, headers/cache tiers, instant rollback, $0 cost posture — verified against current Cloudflare docs
- Contributors: product-manager, astro-planner, cloudflare-workers-planner

## Phase 3 - UI Infrastructure
- Design system grounded in the repo's real consumer theme (apps/example/global.css read; registry class vocabulary tallied): 18 color tokens with light+dark oklch values, typography (Spline Sans / Spline Sans Mono, self-hosted for CSP), radius/spacing/layout tokens, 21-component inventory with reuse map, 12 UI constraints (WCAG AA verified pairs, focus, dialog semantics, reduced motion, no-JS, print)
- Feasibility pass: 12 risks each with a concrete mitigation (CSP vs inline scripts, Pagefind vs connect-src, EC dark-mode pairing via themeCssSelector, engine tab hydration under ClientRouter, registry-same-deploy copy coupling, ts-morph mega-types, phased imagery) — plus one correction to the CF plan (drop the dead /registry vanity 301)
- Final route-vs-state map: 22 routes, all client state classified as states, zero URL-state leaks allowed
- Contributors: frontend-designer, astro-planner

## Phase 4 - Test Suite Authoring
- 141 scenarios (43 visible / 98 holdout) across 24 UCs; flow-coverage gate exit 0 (flows=279 repo-wide)
- 9 journeys (7 arcs + 2 edge variants); coverage matrix extended, 0 gaps
- E2E Harness Constitution commissioned: Playwright over astro preview + curl lanes + real-CLI round-trip; determinism seam pinned; landmine ledger L1-L9; `pnpm e2e:docs` turnkey runner; spike-gated (INCOMPLETE until the reference flow is proven green)
- Per-UC test criteria: see 11-e2e-testing-criteria.md
- Contributors: product-manager (x6 dispatches), astro-planner (harness)

## Delivery record
Every dispatched lens DELIVERED and staged. One delivery failure (synthesis notification truncated) recovered by delivery-only re-ask. See `.tmp/kb-prd-plan/docs-site/_ledger.json`.

## v2.0.0 update (2026-09-09)
- Applied via `/kb-prd-plan --update` (human instruction; update mode, no team dispatch by design): AUTO functional group, UC-AUTO-01..04, T-AUTO-001..019 criteria, TR additions (posture #8, DocsSyncWorkflow/Flue agent/SyncMarker/OpenRouterClient, OpenRouter+Flue+Actions deps, R14–R17, CAP-AUTO-01), file renumbering. Owner lens for the coming sprint work: `flue-implementer` + `techwriting-reviewer` (specialists added to AGENTS.md 2026-09-09).
