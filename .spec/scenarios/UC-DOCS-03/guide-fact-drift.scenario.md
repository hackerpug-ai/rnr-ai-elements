---
flow_id: FLOW-DOCS-03-guide-fact-drift
service: docs-site
feature: UC-DOCS-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Guides agree with the canonical pages that own their facts

An edit to a guide drops or inverts a fact owned by a canonical page — e.g. the troubleshooting guide states that Tailwind v4 plus `@theme` implies the nativewind tree (Installation owns the mapping: it implies uniwind), or the tokens guide contradicts the Theming page's token map. Expected output: the agreement check fails, naming the guide, the canonical page, and the flipped fact. On the healthy build, guides restate canonical facts consistently: Tailwind v4 + `@theme` implies uniwind; nativewind v3 implies the nativewind tree; the token names match the Theming page's map exactly.
