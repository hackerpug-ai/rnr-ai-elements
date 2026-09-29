---
flow_id: FLOW-GEND-05-hero-cta-targets-resolve
service: docs-site
feature: UC-GEND-01
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Hero CTAs land on live routes after any route change

Crawl the built site and resolve the two hero CTA hrefs.

**Expected**: `Get started` resolves to a docs entry route (e.g. `/docs/introduction`) and `Browse components` resolves to `/components`, both returning 200 in the built `dist/` output — never a 404 or an unbuilt placeholder. Re-run after any docs route rename: the hero link must follow the rename (derive it from the docs collection rather than a frozen string), otherwise the primary conversion path dead-ends.
