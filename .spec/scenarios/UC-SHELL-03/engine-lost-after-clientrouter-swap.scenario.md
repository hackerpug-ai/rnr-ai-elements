---
flow_id: FLOW-SHELL-15-engine-lost-after-clientrouter-swap
service: docs-site
feature: UC-SHELL-03
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Engine root attribute is re-applied after every ClientRouter swap

The regression this catches: `swapRootAttributes` overwrites `data-engine` from the incoming document (which defaulted to nativewind), silently reverting a stored uniwind choice on soft navigation. Set `localStorage['rnr-engine'] = "uniwind"`. Hard-load `/docs/installation`, then soft-navigate through `/docs/quickstart` -> `/components/message` -> `/docs/installation`. After each `astro:page-load` event: `document.documentElement` matches `html[data-engine="uniwind"]`, the uniwind tab is `aria-selected="true"` with its panel visible, and no nativewind-first flash occurs between swap and settle. Finish with a cold load of `/components/message`: still uniwind. FAIL on any revert to nativewind mid-journey.
