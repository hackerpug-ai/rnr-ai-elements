---
flow_id: FLOW-GEND-32-qr-per-item-distinct-and-resolves
service: docs-site
feature: UC-GEND-05
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Every page's QR is distinct and its deep link resolves to that item

Decode the QR SVG from all 39 component pages.

**Expected**: 39 distinct decoded URLs, each resolving (200 / valid Expo redirect) to its OWN item's gallery screen — the regression under test is a template bug where every page embeds the same root-gallery QR (39 identical decodes), or a stale base URL that 404s. Assert `len(set(decoded_urls)) == 39` and each URL contains its page's item name.
