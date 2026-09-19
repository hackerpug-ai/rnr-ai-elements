---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.0.0
---

# E2E Harness Constitution — Docs Site (rnraielements.com)

> **Status: INCOMPLETE until the reference flow (§5) is proven green through the turnkey runner.** This is a gating prerequisite, recorded here and in the sprint plan: no docs sprint may bind flows onto this harness before the spike gate passes.

Destination: `.spec/prds/docs-site/11-technical-requirements/MM-e2e-testing.md`

## 1. Framework + platform/runtime matrix (Reality Gate)

| Surface | Framework | Status | Blocking? |
|---|---|---|---|
| Docs web UI (all pages, five islands, zero-JS fallbacks) | Playwright (Chromium, desktop + mobile viewport projects) | PROVISION | Yes — `docs-e2e` job |
| Registry-asset + header/cache/redirect/404 behavior (`/r/*.json` content-type, cache tiers, CSP, `_redirects`, www->apex, 404) | curl (CI shell; never Playwright — headers exist only around the Worker) | PROVISION | Yes — `docs-preview-curl` + post-deploy lane |
| Real consumer CLI round-trip (`npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json`) | CI shell job into a scratch Expo app (PR #28 / UC-REG-05 pattern) | PROVISION | Yes — post-deploy lane (production only) |
| Build-gate surface (registry git-diff freshness, tsc, biome, vitest, docs prebuild gates, astro check, pagefind) | GitHub Actions — existing ci.yml jobs + new docs job | PRESENT | Yes — already required on main |
| RN library device behavior (Storybook-device, Maestro install arcs) | MVP PRD's existing tiers | PRESENT | Out of scope for this PRD |
| Repo logic (registry builder, manifest, checks) | Vitest | PRESENT | Yes — existing test job |

**Framework roles.** Playwright drives DOM/behavior only, over `astro preview` serving the built `dist/` — NEVER `astro dev` (dev-server HMR and on-demand compilation are not the product). curl asserts everything the static file server cannot express: `_headers` (CSP, cache tiers), `_redirects` vanity 301s, `not_found_handling` 404s, www->apex — these exist only in the Workers deploy, so curl runs against wrangler preview version URLs on PRs and against production post-deploy. The real-CLI job runs the exact published command a consumer copies, into a scratch Expo SDK 57 app, for BOTH engines, asserting `components/ai/{item}.tsx` exists, `registryDependencies` resolve under the consumer's `components/ui`, and `tsc --noEmit` exits 0.

**Out of scope:** physical-device certification, WebKit/Firefox (Chromium-only until a demonstrated need), visual regression (the imagery pipeline owns capture; this harness owns behavior), load testing.

## 2. Determinism seam

The site is fully static — no DB, no sessions, no cookies. Nondeterminism lives in exactly five places, each pinned:

| Source | Pin | Assertion |
|---|---|---|
| localStorage state (theme, engine) | Fresh Playwright context per test (state cannot leak); `addInitScript` seeds keys BEFORE the `is:inline` pre-paint script runs | Rendered root attributes/classes after `astro:page-load` |
| Network | Same-origin only; any cross-origin request fails the test | Zero console errors; request URL allowlist |
| Lazy Pagefind bundle | Count `/pagefind/*` requests per action | ZERO before first Cmd+K open; exactly one bundle load on first open; no NEW load on second open (in-page dialog reuse) |
| Transition/animation timing | `reducedMotion: 'reduce'` + wait on `astro:page-load` after every soft navigation | Post-swap DOM state |
| CDN edge cache (post-deploy only) | Cache-buster query per deploy SHA (or response digest compare); headers asserted on the un-busted URL | Fresh-deploy content within 300s window for `/r/*.json`; HTML must-revalidate |

**Named mechanisms:** reset = browser-context isolation (per-test context; nothing server-side to reset). Seed = `addInitScript` writing localStorage; the `theme` key name is PINNED here; the engine persistence key name is JIT wiring (bind at task time, do not invent now). Fixture = the build chain itself — `registry:build -> gallery:manifest -> docs prebuild (fail-closed gates) -> astro build -> pagefind --site dist` produces the identical site every run; there is no runtime fixture.

## 3. Turnkey runner

**One command: `pnpm e2e:docs`** (repo root; matches the existing `e2e:smoke:*` naming).

1. Preflight: node >= 24, pnpm present, `pnpm exec playwright install chromium` (idempotent).
2. Build the fixture: `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` (prebuild gates fail closed) then `pagefind --site dist`.
3. Serve: Playwright `webServer` runs `astro preview --host 127.0.0.1 --port 4321`, `reuseExistingServer: !process.env.CI`, strict port.
4. Run: Chromium desktop + mobile projects, `javaScriptEnabled: false` project for zero-JS flows; `retries: 0`; trace retain-on-failure.
5. Report: JUnit + HTML into `apps/docs/playwright-report/` (artifact-uploaded in CI).

CI invokes the SAME root command. A flow counts only when it runs through this runner.

## 4. Landmine ledger (locked, append-only; workarounds baked into helpers)

- **L1 — CSP is enforced only by Workers `_headers`.** The browser lane never asserts CSP; headers are curl-only against wrangler-served URLs. If ever tightened to hashes, they must be regenerated from the build (is:inline output is deterministic per build).
- **L2 — ClientRouter `swapRootAttributes` overwrites root attributes on soft navigation.** The pre-paint scripts carry `is:inline` + `data-astro-rerun`; tests assert theme/engine root state AFTER `astro:page-load`, and a standing soft-navigation regression flow exercises nav -> assert root attrs survive.
- **L3 — Pagefind deliberately indexes hidden panels.** Do not assert search absence for hidden engine/code panels; assert DOM presence first, then activate the tab.
- **L4 — Cache tiers do not exist on local `astro preview`.** All Cache-Control/CSP assertions are curl-lane only.
- **L5 — `_redirects`, `not_found_handling`, www->apex live only around the Worker.** Redirect/404 lanes run on wrangler preview version URLs (PR) and the live domain (post-deploy), never on `astro preview`.
- **L6 — clipboard.writeText no-ops on insecure origins.** Pin `--host 127.0.0.1` and navigate ONLY via `http://localhost:4321` (localhost is a secure context; a LAN IP over http is not); `grantPermissions(['clipboard-read','clipboard-write'])`; assert clipboard CONTENT, not a success class.
- **L7 — Module scripts execute once ever.** Never wait on `DOMContentLoaded`; the wait primitive is one helper: `astro:page-load` + window-guarded island init flag.
- **L8 — Pagefind laziness is load-bearing.** Assert request counts explicitly (zero pre-open, one bundle load, none on reopen) so a regression to eager loading fails loudly.
- **L9 — Production edge cache serves the previous deploy up to 300s for `/r/*.json`.** Post-deploy verification cache-busts with the deploy SHA query or compares digests; raw-header assertions use the un-busted URL.

## 5. Proven reference flow — the spike gate

The persona path (open site -> browse ledger -> read a component page -> copy an install command -> fetch that URL as JSON) must run green through `pnpm e2e:docs` BEFORE the deep build depends on this harness. Proven on a clean local checkout AND on the CI runner, in one run, `retries: 0`. Exact steps and pass condition are recorded in the commissioning `spike_flow` object; the sprint plan restamps them as the spike sprint's acceptance gate. Until green, this constitution is INCOMPLETE — sprint-plan may not stamp flows onto an unproven harness.

## 6. Flake policy

**Run once; failures are real; no retry.** `retries: 0` in config and never `--retries` on the CLI. A flaky flow is a broken flow: fix the wait primitive (L7) or the product. Build-gate failures (prebuild gates, registry freshness, typecheck, lint, unit) are NEVER retried — they are deterministic by construction; a retry would only launder a broken artifact. The post-deploy lane has no in-process retry either: the same SHA failing twice is a rollback candidate, not a re-run. Quarantine: a flow may be moved to `e2e/quarantine/` only with a linked fix task and must be fixed or deleted within one sprint; every quarantine entry appends its lesson to §4.

## 7. CI lanes

| Lane | Trigger | Blocks merge? | Content |
|---|---|---|---|
| registry / typecheck / lint / test | PR + main (existing) | Yes (existing) | Unchanged guarded jobs |
| `docs-e2e` | PR + main | Yes | `pnpm e2e:docs` (build chain + Playwright over preview), same package.json-existence guard pattern as existing jobs |
| `docs-preview-curl` | PR, `needs: docs-e2e` | Yes | `wrangler versions upload` (non-promoting, `preview_urls: true`) -> curl assertions: CSP + cache tiers per path class, `/r/{engine}/{item}.json` 200 + `application/json` + digest matches the just-built artifact, `/docs` and `/install` 301 targets, 404 handling |
| deploy | push to main, `needs: [registry, typecheck, lint, test, docs-e2e, docs-preview-curl]` | — (post-merge) | build + `wrangler deploy` via wrangler-action with scoped token; instant rollback available |
| `docs-production-verify` | after deploy (workflow_run) | No — cannot block a completed merge; failure pages owners and marks a rollback candidate | Cache-busted digests, header re-checks, sitemap/llms.txt/robots.txt presence, real-CLI round-trip against the live domain, scratch-app `tsc --noEmit` |

The cumulative suite is the monotonic regression baseline: a flow green on main cannot regress without blocking.

## 8. What this harness deliberately does NOT own

The RN library's device storybook tiers (`storybook:device`, Maestro `e2e:smoke:ios/android` install arcs, UC-REG-01-style gates) — owned by the MVP PRD's existing tiers. Imagery capture (the four-state-matrix Playwright sprint) — that sprint may reuse the browser install but owns its own harness. No cross-browser beyond Chromium, no visual regression, no load testing, no standalone axe lane.
