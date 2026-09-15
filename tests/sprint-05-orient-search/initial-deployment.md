# ORI-DEP-001 — initial Workers deployment (attended)

This runbook is the human-attended execution path for the first domain attachment of
`rnr-ai-elements-docs` at `rnraielements.com`. It is **assets-only**: no Worker
runtime, no bindings, no Pages, no routes beyond the single custom domain.

> The implementer cannot run the deploy. Boundary contracts 6 and 13 of the task
> require a human-attended terminal with inherited TTY stdout for the first domain
> attachment; wrangler 4.81.0 may set overwrite flags when stdout is captured. Do
> not pipe this deploy through `tee`, do not auto-confirm, and refuse replacement or
> overwrite prompts.

## Preconditions (fail closed on any of these)

1. **Authority.** The OAuth login must hold `zone (edit)` (or equivalent) in
   addition to the observed `zone (read)` + `workers_* (write)` + `ssl_certs (write)`.
   `wrangler whoami` must list `zone (edit)`; a read-only zone cannot create the apex
   DNS record for the custom domain.
2. **Zone.** `rnraielements.com` must be an active zone in account
   `d5110b1895ee190e145c0c8756f49879`. Its NS already point at Cloudflare
   (`shaz.ns.cloudflare.com`, `etienne.ns.cloudflare.com`). Resolve the zone ID
   (e.g. `GET /zones?name=rnraielements.com`) and put it in `apps/docs/wrangler.jsonc`
   `routes[0].zone_id`, replacing the placeholder.
3. **DNS.** The apex currently has no A/AAAA. The attended custom-domain attachment
   must create the proxied apex record (this is the `zone edit` permission gate).
4. **Frozen build.** `tests/sprint-05-orient-search/evidence/ORI-DEP-001/` must hold a
   fresh `asset-manifest.json` and `build.json` whose `release_sha` equals the current
   candidate HEAD. Re-verify first:

   ```sh
   pnpm exec tsx scripts/docs-deploy/prepare.ts --phase bootstrap \
     --source "$(git rev-parse HEAD)" \
     --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001
   ```

## Attended deploy (the only step that needs a human terminal)

Run these in order in an interactive terminal, in `apps/docs`, observing stdout:

```sh
# 1. Pin and identity checks
pnpm --dir apps/docs exec wrangler --version
pnpm --dir apps/docs exec wrangler whoami

# 2. Pre-deploy state (read-only) — distinguishes "absent Worker" from auth/network failure
pnpm --dir apps/docs exec wrangler deployments list --config wrangler.jsonc --json

# 3. THE attended first deploy (do not pipe, do not tee, do not auto-confirm)
pnpm --dir apps/docs exec wrangler deploy --config wrangler.jsonc

# 4. Bind INITIAL_VERSION_ID from the deploy output, then observe
pnpm --dir apps/docs exec wrangler deployments list --config wrangler.jsonc --json
pnpm --dir apps/docs exec wrangler versions view "$INITIAL_VERSION_ID" --config wrangler.jsonc
```

After the deploy, record the actual `INITIAL_VERSION_ID` and deployment ID into
`tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json` (shape documented in
`public-http.test.ts`), then run the public verification:

```sh
pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts \
  --phase bootstrap --origin https://rnraielements.com \
  --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json
```

## The deploy cannot proceed while

- `wrangler whoami` lacks `zone (edit)`;
- the active zone ID cannot be resolved and verified as uncontested ownership;
- the apex DNS is held elsewhere or the custom domain is attached to another Worker;
- a conflicting Worker/deployment for `rnr-ai-elements-docs` already exists that is
  not the reviewed first release.

Do not overwrite conflicting ownership. Escalate instead.
