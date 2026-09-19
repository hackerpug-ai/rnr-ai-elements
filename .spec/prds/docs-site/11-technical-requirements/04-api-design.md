---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.0.0
---

# API Design

The site exposes no request/response API — everything is static build output. Its "API surface" is the set of URL contracts others depend on:

| URL | Method | Contract |
|-----|--------|----------|
| `https://rnraielements.com/r/{nativewind\|uniwind}/{item}.json` (x112) | GET | 200, `application/json`, `cache-control: public, max-age=300`, body byte-identical to the freshly generated `public/r/{engine}/{item}.json` at the deploy's commit. Never redirects, never HTML. Consumed by the real RNR CLI (`npx @react-native-reusables/cli@latest add <url>`). |
| `https://rnraielements.com/llms.txt` | GET | 200 text/plain; generated index linking llms-full.txt and key docs pages. |
| `https://rnraielements.com/llms-full.txt` | GET | 200 text/plain; contains the not-npm statement, literal absolute-URL install commands for both engines, engine-detection heuristics, per-item peer/permission contracts, Expo Go vs dev-client flags — generated from the same data as the site UI, byte-consistent with the ledger's copy-button commands. |
| `https://rnraielements.com/robots.txt` | GET | 200 text/plain; must Disallow nothing under `/r/` or `/llms*`; references sitemap.xml. |
| `https://rnraielements.com/sitemap.xml` | GET | 200; @astrojs/sitemap output over content + generated routes. |
| All HTML routes | GET | 200 with `cache-control: public, max-age=0, must-revalidate` and the security-header baseline (CSP `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'`, HSTS, nosniff, frame-deny, strict-origin-when-cross-origin). |
| `/_astro/*` | GET | 200, `cache-control: public, max-age=31536000, immutable`. |
| `www.rnraielements.com/*` | GET | single 301 to the apex counterpart (zone Redirect Rule). |
| `/docs`, `/install` | GET | single-hop 301 to `/docs/introduction` / `/docs/installation`. |
| Unknown paths | GET | styled 404 (non-empty HTML with search recovery) via `not_found_handling: "404-page"`. |
