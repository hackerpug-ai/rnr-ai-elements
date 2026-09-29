---
flow_id: FLOW-GEND-16-unknown-item-404
service: docs-site
feature: UC-GEND-03
priority: P1
type: error_handling
tier: holdout
scope: task
---

# An unknown item slug gets the styled 404, not a degraded empty page

Request `/components/this-item-does-not-exist` and `/components/button-group` (a real ui item that must NOT have a component page) from the built site.

**Expected**: both return the styled 404 page (with search recovery), because `getStaticPaths` generates exactly the 39 component routes from the enriched data. No template path may render a page shell with an empty title, missing chip row, or null description for a non-existent slug — the failure mode under test is a fallback/dynamic route that renders a broken page instead of 404.
