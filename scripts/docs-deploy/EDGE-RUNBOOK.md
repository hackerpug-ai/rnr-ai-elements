# Edge runbook — www → apex zone wiring (APX-002)

## Who runs this

A human zone operator with a Cloudflare API token that has both:

- `Zone > DNS > Edit`
- `Zone > Single Redirect > Edit`

The CI deploy token must **not** hold these rights. Wiring is a one-time (idempotent) operator action, never run from CI or from tests.

Export the token in the shell only — never commit it, never put it in the repo `.env` for this step if that file is shared, and never paste it into logs:

```bash
export CLOUDFLARE_API_TOKEN='…operator token…'
```

Zone id `1720eac2fbdd7dc2b975ffdfccbee97f` and account id come from `apps/docs/wrangler.jsonc`. The script reads them from that file; do not pass them on the CLI.

## Order of operations

Run these from the repo root, in this order:

1. **Check** (read-only) — reports whether www DNS + the Single Redirect rule are already correct, or names drift / not-yet-wired (exit 4), or missing authority (exit 3):

```bash
pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --check
```

2. **Apply** (idempotent write) — creates only what is missing: a proxied `AAAA www 100::` record, and a Single Redirect rule tagged `rnr-www-to-apex` on the zone `http_request_dynamic_redirect` entrypoint (expression `http.host eq "www.rnraielements.com"`, 301 to `concat("https://rnraielements.com", http.request.uri.path)`, query string preserved). Refuses to overwrite a differing existing record or rule (exit 4). Then re-probes www:

```bash
pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --apply
```

3. **Probe** (public, no token) — must print `redirect-ok` and exit 0 before any HSTS deploy:

```bash
pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --probe-www
```

4. **Gate step 5** — confirm the public curl contract from the sprint human testing gate:

```bash
curl -sI https://www.rnraielements.com/docs/introduction
curl -sIL https://www.rnraielements.com/docs/introduction
```

Expect exactly one `HTTP/2 301` with `location: https://rnraielements.com/docs/introduction` on the first command, and the `-L` chain ending in one `HTTP/2 200` on the apex.

## HSTS ordering (hard rule)

APX-001 ships `Strict-Transport-Security: max-age=31536000; includeSubDomains`. That header covers `www`. **HSTS ships only after the probe reads `redirect-ok`.** Do not deploy APX-001's `_headers` (or any includeSubDomains HSTS) until:

```bash
pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --probe-www
```

prints `redirect-ok` and exits 0. Shipping HSTS before www redirects traps browsers on an unresolved or non-redirecting www host.

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | ok (`redirect-ok` / check passed) |
| 3 | authority missing — token lacks `Zone > DNS > Edit` and/or `Zone > Single Redirect > Edit` |
| 4 | drift or not-yet-wired / probe not `redirect-ok` |
| 5 | `--apply` wrote config, but the www probe still did not read `redirect-ok` |

On exit 3 the script names both required permissions and never prints the token value.

## Dashboard fallback

If the API token cannot be granted both permissions, wire the same resources in the Cloudflare dashboard for zone `rnraielements.com`:

1. **DNS** → Add record: Type `AAAA`, Name `www`, IPv6 `100::`, Proxy status Proxied.
2. **Rules** → **Redirect Rules** (Single Redirects) → Create rule:
   - Name / description includes `rnr-www-to-apex`
   - If: hostname equals `www.rnraielements.com`
   - Then: Dynamic redirect, status `301`, target expression `concat("https://rnraielements.com", http.request.uri.path)`, preserve query string
3. Re-run `--probe-www`, then the gate step-5 curls above.

Do not replace unrelated redirect rules when editing an existing ruleset; only add the `rnr-www-to-apex` rule.
