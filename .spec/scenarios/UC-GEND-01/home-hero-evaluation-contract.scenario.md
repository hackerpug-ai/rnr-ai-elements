---
flow_id: FLOW-GEND-01-home-hero-evaluation-contract
service: docs-site
feature: UC-GEND-01
priority: P0
type: happy_path
tier: visible
scope: task
---

# Home hero answers the evaluation question with live counters

Build the docs site and open the home page `/`.

**Expected**: the hero renders one screen containing (1) a statement of what the library is (universal AI chat and agent UI components for React Native, distributed as a copy-paste registry), (2) an explicit "this is not an npm package" statement, (3) health counters reading version `0.2.1` and `56 items` split `39 component / 11 ui / 6 lib`, and (4) `Get started` and `Browse components` CTAs. All four are visible without scrolling below the fold and the counters are computed from `src/data/registry-items.json` (grep the built HTML for `39`, `11`, `6` on the same hero element tree), never hardcoded literals in the template.
