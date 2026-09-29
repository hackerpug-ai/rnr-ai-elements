---
flow_id: FLOW-GEND-40-ledger-56-rows-and-base-urls
service: docs-site
feature: UC-GEND-07
priority: P0
type: happy_path
tier: visible
scope: task
---

# Ledger renders all 56 rows, both engine base URLs, and the generated-at-build note

Open `/registry` in the built site.

**Expected**: the table renders exactly 56 item rows — 39 `component`, 11 `ui`, 6 `lib` — matching `src/data/registry-items.json` name-for-name. Above the table, the two engine base URLs are present and copyable: `https://rnraielements.com/r/nativewind` and `https://rnraielements.com/r/uniwind`, plus bulk-add instructions composed of absolute-URL per-item commands. A visible note states the table is generated at build from `public/r/*.json` so it cannot drift from what shipped. Every row's docs-page link resolves to 200 (component rows to `/components/{item}`; ui/lib rows to wherever the site documents them) and every row carries an Expo Go verdict.
