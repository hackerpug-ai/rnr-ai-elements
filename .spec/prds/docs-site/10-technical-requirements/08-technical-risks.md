---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.0.0
---

# Technical Risks

| # | Risk | Mitigation | Owner |
|---|------|------------|-------|
| R1 | CSP `unsafe-inline` vs pre-paint scripts / Astro inline islands | Compatible by design (site is static, zero user input); tightening to hashes stays mechanical because is:inline output is deterministic per build | cloudflare/astro implementer |
| R2 | Pagefind vs CSP connect-src | Same-origin only; no CSP edit ever needed | astro implementer |
| R3 | Expressive Code dark theme following OS instead of `.dark` class (discussion #410 failure) | `themes: ['github-light','github-dark']`, `useDarkModeMediaQuery: false`, `themeCssSelector` keyed to `.dark`/`:root` — verified option names | astro implementer |
| R4 | Astro v7 Sätteri + MDX + EC is a new codepath | EC has official v7 support, versions pinned; documented fallback `markdown.processor = unified()` + `@astrojs/markdown-remark`, EC config unchanged | astro implementer |
| R5 | Engine tab lost after ClientRouter swaps (swapRootAttributes overwrite) | Server-render both panels; pre-paint `is:inline` + `data-astro-rerun` script re-applies `data-engine`; island owns clicks; standing regression scenario (FLOW-SHELL-15) | astro implementer |
| R6 | Registry-same-deploy copy coupling / stale trees | Prebuild copies `public/r` after `registry:build`; git-diff freshness gate runs before docs build; `/r/*.json` max-age=300; dropped the CF plan's dead `/registry` vanity 301 | both implementers |
| R7 | ts-morph mega-types / unresolved props | Fail-closed gate: unresolved type fails the build naming the item (empty-resolved allowed); long types render in full with CSS wrap | astro implementer |
| R8 | Imagery pipeline is phased — pages could ship placeholders | Contract: null imagery omits the preview panel entirely; once capture is live the prebuild fails on missing imagery (FLOW-GEND-30/31) | astro implementer |
| R9 | Pagefind indexing hidden panels | Desirable: data-pagefind-body / data-pagefind-ignore boundaries keep both engines' commands searchable | astro implementer |
| R10 | `_headers` promising an OG tier that 404s | One static og image now; `/og/*` cache tier added only when a generator exists | cloudflare implementer |
| R11 | View transitions vs island lifecycle (module scripts run once) | Islands init on `astro:page-load` with window guard; documented MPA escape hatch (remove ClientRouter — nothing depends on it) | astro implementer |
| R12 | Workers-vs-Pages platform choice drift | Verified 2026-09 against current docs: Pages feature-frozen, Workers Static Assets at parity + gradual deploys; static requests free/unlimited — $0 posture | cloudflare implementer |
| R13 | Repo currently has NO README/LICENSE — external trust gap until this ships | In scope (UC-EXT-02); README + LICENSE are early deliverables, not launch-day | implementer |
