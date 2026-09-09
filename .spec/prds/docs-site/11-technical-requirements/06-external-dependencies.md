---
stability: CONSTITUTION
last_validated: 2026-09-09
prd_version: 2.0.0
---

# External Dependencies

**Site build (apps/docs devDeps)** — https://docs.astro.build · https://expressive-code.com/ · https://pagefind.app/ · https://ts-morph.com/ · https://github.com/soldair/node-qrcode · https://playwright.dev/ (imagery sprint only)
- `astro ^7` — static SSG, content collections, getStaticPaths, islands, Vite 8 build; no adapter.
- `@astrojs/mdx` — in-prose tabbed code blocks (Sätteri handles .mdx in v7).
- `astro-expressive-code` (latest) — build-time Shiki highlighting, `<Code>` component for registry sources, dual github-light/github-dark themes. Verified Astro v7 + Sätteri support.
- `@tailwindcss/vite ^4.3.3` (+ tailwindcss) — Tailwind v4 as Vite plugin; Vite 8-verified (the one issue is npm-hoisting-only; this repo is pnpm). Fallback documented: `@tailwindcss/postcss`, identical CSS.
- `pagefind ^1` — build-time static search over dist/; chunked, serverless.
- `@astrojs/sitemap` — sitemap.xml for rnraielements.com.
- `ts-morph` — build-time props extraction; never shipped.
- `qrcode` — build-time QR SVGs; zero runtime.
- Spline Sans + Spline Sans Mono (SIL OFL 1.1, self-hosted woff2) and Lucide via `astro-icon` + `@iconify-json/lucide` (ISC, build-time inlined) — see 07.

**Delivery** — https://developers.cloudflare.com/workers/wrangler/ · https://github.com/cloudflare/wrangler-action · https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/ · https://developers.cloudflare.com/workers/configuration/routing/custom-domains/ · https://developers.cloudflare.com/rules/
- `wrangler (^4)` — assets-only Worker config (assets.directory=./dist, not_found_handling=404-page, preview_urls=true), deploy, non-promoting preview uploads, instant rollback.
- `cloudflare/wrangler-action` — deploy step inside the existing Actions CI, `CLOUDFLARE_API_TOKEN` scoped to Account Workers Scripts Edit + Account Settings Read + Zone Workers Routes Edit.
- Cloudflare Workers Static Assets + Custom Domains — apex rnraielements.com attached with auto DNS + cert; zone Redirect Rule for www→apex.

**Upstream (read-only references, not dependencies of the site)** — reactnativereusables.com registry items (absolute-URL registryDependencies), elements.ai-sdk.dev (porting reference).

**Docs automation (v2.0.0)** — https://openrouter.ai/docs · https://flue.dev · https://docs.github.com/actions
- `OpenRouter API` — change-impact analysis via `deepseek/deepseek-v4-flash` (slug verified live against https://openrouter.ai/api/v1/models on 2026-09-09: present, context_length 1,048,576; dated variants `deepseek/deepseek-v4-flash-0731` and `~deepseek/deepseek-v4-flash-latest` also exist — pin the un-suffixed canonical id); chat-completions contract with a JSON impact-plan response, timeout + single retry; authenticated by the `OPENROUTER_API_TOKEN` GitHub secret (scoped key, expiry fails the run loudly).
- `Flue` — the docs-sync agent runtime; the agent definition borrows the techwriting-implementer core system prompt including its knowledge graph. Verified sources: the agent body at `~/.claude/agents/techwriting-implementer/agent.md` (embeds the Rosetta KB graph block, `domain="techwriting" kb_version="1.0.0 @ 2026-09-08 sha:3327c171"`); canonical graph of record at `brain/.rosetta/docs/techwriting/fact-graph.json` (+ `provenance.json`). The T-AUTO-015 drift check diffs the borrowed prompt against these.
- `GitHub Actions` — merge-to-main trigger, concurrency group (runs serialize), draft-PR creation via the standard `gh`/API surface; agent output lands through PRs only.
