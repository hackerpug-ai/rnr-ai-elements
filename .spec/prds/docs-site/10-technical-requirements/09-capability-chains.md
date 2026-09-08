---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.0.0
---

# Capability Chains

| ID | Chain | Trigger | Hops (boundary contracts) | Failure modes | Real-service proof | Owner |
|----|-------|---------|---------------------------|---------------|--------------------|-------|
| CAP-REG-01 | Registry build & two-engine fan-out | Edit under `packages/registry/` | `registry:build` rewrites import/URL alias segments → `public/r/{nativewind,uniwind}/` (gate: CI git-diff freshness, exit-code) | stale tree reaches docs build; one-engine-only edit unsyncs trees | existing CI registry job (live today, PR #23/#28 lineage) | rnr implementer |
| CAP-DOCS-01 | Docs data enrichment | `pnpm --filter @rnr-ai-elements/docs build` (prebuild) | registry.json + gallery-manifest.json + families map → gates (56 exact / files non-empty / props resolved / family exact / verdict present) → `src/data/registry-items.json` + gitignored `public/r` copy | silently dropped item; fabricated 57th row; unresolved props | docs-e2e lane runs the real chain; FLOW-DELIV-01 family drills each gate | astro implementer |
| CAP-DEP-01 | Gated deploy + rollback | Merge to main | quality jobs green → `wrangler deploy` (assets-only, scoped token) → apex + headers live; recovery: `wrangler rollback` restores the full old asset set incl. `/r/` | red job deploying; preview promoting; rollback stranding new JSONs; expired token silently skipping | docs-preview-curl + docs-production-verify lanes; FLOW-DELIV-02/04 drills | cloudflare implementer |
| CAP-INST-01 | Consumer install by absolute URL | Visitor/agent copies a command | CLI fetches `https://rnraielements.com/r/{engine}/{item}.json` (contract: 200 application/json, max-age=300, no redirect) → resolves RNR registryDependencies → writes files into the consumer app at `@/components/*` | short-name/relative form installs the web item; HTML 404 body fed to CLI; wrong engine tree | PR #28 proved the mechanism from a git tag; the post-deploy real-CLI lane re-proves it against the live domain, both engines, scratch Expo app + `tsc --noEmit` | cloudflare + rnr implementers |
| CAP-LLMS-01 | Machine-readable doc generation | Same build as the site | collections + registry data → llms.txt / llms-full.txt / robots.txt (byte-consistent with ledger copy commands; no Disallow touches `/r/` or `/llms*`) | llms command diverges from UI copy; stale after version bump; robots blocks the registry | FLOW-EXT-01..06 + docs-production-verify presence checks | astro implementer |

Credential/trust notes: the only credential in the system is `CLOUDFLARE_API_TOKEN` (scoped, GitHub-secret stored; expiry fails the deploy loudly — FLOW-DELIV-02). Persistence/network chains carry retry/idempotency semantics via cache tiers (max-age=300 window) and digest comparison rather than client retries.
