---
stability: CONSTITUTION
last_validated: 2026-09-09
prd_version: 2.0.0
---

# Technical Risks

| # | Risk | Mitigation | Owner |
|---|------|------------|-------|
| R1 | CSP `unsafe-inline` vs pre-paint scripts / Astro inline islands | Compatible by design (site is static, zero user input); tightening to hashes stays mechanical because is:inline output is deterministic per build | cloudflare/astro implementer |
| R2 | Pagefind vs CSP (connect-src + WebAssembly) | Same-origin fetches need only `connect-src 'self'`; Pagefind compiles its index as WebAssembly, which needs `'wasm-unsafe-eval'` in `script-src` (measured 2026-09-29: without it Chromium and WebKit return 0 search results — "Failed to load the Pagefind WASM"). Amended at Sprint 07 promotion with owner approval | astro implementer |
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
| R14 | Agent-authored docs subtly wrong (hallucinated API claims, stale defaults) | PR-gated human review on every agent PR; the docs-PR gates already in scope (build green, snippet gate, content-standards conformance) apply to agent PRs equally; techwriting-reviewer is the standing review lane | flue-implementer + techwriting-reviewer |
| R15 | Prompt injection through analyzed repo content steering the agent | Model output is untrusted prose: never executed, docs-only PR path allowlist enforced structurally, no secrets in payloads, marker and workflow files excluded from agent-written paths | flue-implementer |
| R16 | OpenRouter cost / rate limits / outage stalls docs sync | Payload caps (diff truncation, file-count limits), timeout + single retry, visible failure with a retry-friendly message, budget monitoring on the OpenRouter key | flue-implementer |
| R17 | Marker races — two merges land before a docs PR merges, or history rewrite makes the SHA unreachable | Concurrency group serializes runs; range computed at run start from the marker; marker advances monotonically (fast-forward only); unreachable SHA fails loudly naming the re-baseline command | flue-implementer |
