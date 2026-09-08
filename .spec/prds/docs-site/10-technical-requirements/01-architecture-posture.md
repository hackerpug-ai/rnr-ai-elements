---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.0.0
---

# Architecture Posture

1. **Static-only, no runtime.** `astro build` default output, no adapter — not even a Cloudflare one. Every byte of data is known at build time (the registry IS the repo); SSR would add a runtime and cold starts while disabling nothing. Keeps CDN caching and instant rollback unblocked.
2. **One source of truth per fact.** Registry facts flow only from `packages/registry/registry.json` through the fail-closed enrichment into `src/data/registry-items.json`. Prose is authored markdown; reference data is generated; neither hand-maintains the other. Missing data fails the build naming the item — never a silently degraded page, placeholder, or stale screenshot.
3. **The docs deploy IS the registry host.** `public/r/{nativewind,uniwind}/` is copied into the Astro public dir at prebuild and served at `https://rnraielements.com/r/{engine}/{item}.json` from the same Workers static-assets deploy as the docs (user-confirmed 2026-09-08). One origin, one CI chain; install commands and docs cannot diverge. `apps/docs/public/r` is gitignored and generated-only.
4. **Zero client framework.** Exactly five vanilla custom-element islands (SearchDialog, TabGroup, CopyButton, LedgerFilter, ThemeToggle), each with a zero-JS fallback. A sixth island or any framework island is a planning decision, not an implementer addition.
5. **No client state in URLs.** Engine tab, filters, dialogs, theme are DOM/localStorage state; routes differ by content, never by such state. Shared URLs must not pin anyone to the wrong engine tree.
6. **Deploy is gated and reversible.** The wrangler deploy job needs registry/typecheck/lint/test green; previews are non-promoting version uploads; the Worker stays bindings-free so `wrangler rollback` is always one command.
7. **Trust boundaries.** The site is read-only static content for anonymous visitors and agents; the only writes in the whole system are repo commits through the PR-gated CI chain. CSP allows `'unsafe-inline'` script/style solely because Astro islands and the pre-paint theme script require it — the site has zero user input.
