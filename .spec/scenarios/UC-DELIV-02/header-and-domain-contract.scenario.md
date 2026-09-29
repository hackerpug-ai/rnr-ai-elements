---
flow_id: FLOW-DELIV-02-header-and-domain-contract
service: docs-site
feature: UC-DELIV-02
priority: P0
type: happy_path
tier: visible
scope: task
---

# Apex serves with tiered cache and security headers; www 301s to apex

Header and cache tiers are the delivery contract for every response.

**Test inputs**: `curl -sI` against the live deploy for each path tier.

**Expected outputs**:
- `/docs/introduction` -> `200`, `cache-control: public, max-age=0, must-revalidate`.
- `/_astro/<hashed>.js` -> `cache-control: public, max-age=31536000, immutable`.
- `/r/nativewind/conversation.json` -> `200`, `content-type: application/json`, `cache-control: public, max-age=300`.
- Every response carries: `content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'`, `strict-transport-security: max-age=31536000; includeSubDomains`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: strict-origin-when-cross-origin`.
- `curl -sI https://www.rnraielements.com/docs/introduction` -> exactly one `301` whose `location` is the apex counterpart.
