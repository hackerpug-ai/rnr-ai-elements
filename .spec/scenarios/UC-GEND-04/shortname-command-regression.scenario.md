---
flow_id: FLOW-GEND-22-shortname-command-regression
service: docs-site
feature: UC-GEND-04
priority: P0
type: edge_case
tier: holdout
scope: task
---

# A short-name shadcn-style command anywhere on the site fails the audit

Inject the regression into one template (component page, ledger row, family section, or quickstart prose): render `npx @react-native-reusables/cli@latest add shimmer` — the short-name form. Run the site-wide command audit, which extracts every string in the built HTML matching `npx @react-native-reusables/cli[^<\s]*`.

**Expected**: the audit fails listing the offending page. A short name resolves against the upstream web registry and installs the wrong (web) component — the exact npm-confusion collision this UC exists to eliminate — so the audit requires 100% of extracted commands to match the absolute-URL pattern, with zero exceptions across all pages including prose.
