---
stability: CONSTITUTION
last_validated: 2026-09-09
prd_version: 2.0.0
---

# System Components

| Component | Description |
|-----------|-------------|
| DocsLayout | Sticky header (wordmark, section nav, Cmd+K trigger, ThemeToggle), collapsible sidebar, right-rail TOC (zero-JS), mobile drawer via `<details>`, edit-this-page link. |
| DocsDataPrebuild (`apps/docs` script) | Emits `src/data/registry-items.json` by enriching registry.json with gallery-manifest verdicts, inlined file sources, ts-morph-extracted props, family assignment, imagery refs, the item's canonical usage snippet (inlined from the gallery cell — never hand-written per page), and a theming note derived from the tokens the item source consumes. Fail-closed gates: exactly 56 items; files exist non-empty; component props resolved; family coverage exact; expoGo present. Throws with the item name on any miss. Also copies `public/r` into `apps/docs/public/r` (gitignored). |
| ComponentReference (page template) | Per-item page: breadcrumb, title, chip row, engine-tabbed install block FIRST, Preview/Code TabGroup (matrix imagery + QR SVG vs full untruncated multi-file source), PropsTable, theming note, usage snippets, prev/next within family. |
| LedgerTable + LedgerFilter island | 56-row generated table: name, category, engine URLs, per-row copyable install, Expo Go verdict, docs link; category tabs/engine toggle/text filter enhance without gating content. |
| TabGroup island | Generic tabs island for engine tabs (localStorage-persisted) and Preview/Code; panels server-rendered; JS toggles visibility only. |
| CopyButton island | Custom element on every code block and install command; clipboard write + success state + aria-live. |
| SearchDialog island (Cmd+K) | Native `<dialog>` lazily loading the Pagefind bundle on first open; indexes all item pages + docs (hidden panels included). |
| ThemeToggle | Dark-first flash-free toggle: inline `is:inline` + `data-astro-rerun` head script reads localStorage/prefers-color-scheme and sets root class before paint; tiny custom element for the button. |
| PropsTable | Auto-generated from ts-morph extraction (name/type/default/description); card-ifies on mobile via CSS. |
| TokenTable | Theming-page table of semantic oklch tokens with live swatches sampled from the site's own CSS custom properties. |
| QRCode (build-time) | `qrcode` lib at build → inline SVG deep-linking the item's published gallery screen; zero runtime cost. |
| llms.txt endpoints | `src/pages/llms.txt.ts`, `llms-full.txt.ts`, `robots.txt.ts` generated from collections + registry data: literal absolute-URL commands, engine-detection rules, Expo Go caveats, not-npm statement. |
| DocsSyncWorkflow (v2.0.0) | GitHub Actions workflow on merge to main: reads the sync marker, computes the analysis range, caps the payload, runs the analysis + generation, opens the draft PR or posts the no-impact close-out; concurrency group serializes overlapping runs. |
| Flue docs-sync agent (v2.0.0) | Two personas in one agent run: the analyst (sends capped diff context to deepseek-v4-flash on OpenRouter, parses the JSON impact plan) and the writer (borrows the techwriting-implementer core system prompt including its knowledge graph, applies 12-content-standards.md, emits docs-only edits). |
| SyncMarker (v2.0.0) | A repo-committed file holding the last-documented commit SHA. Advanced only inside merged documentation PRs; documented baseline fallback for first run; unreachable SHA fails the run loudly naming the recovery command. |
| OpenRouterClient (v2.0.0) | Thin adapter over the OpenRouter chat-completions API: model pinned to deepseek-v4-flash, timeout, single retry on transient errors, visible failure on auth/rate-limit errors. |
| Imagery pipeline (phased) | Playwright capture of the harness web gallery's four-state matrix + dark strip into `src/assets/generated/{item}/` — its own future sprint. Until then imagery is null and the preview panel is omitted (never a placeholder); once live, the prebuild fails on missing imagery. |
