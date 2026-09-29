---
flow_id: FLOW-SHELL-13-engine-tab-persists-across-pages
service: docs-site
feature: UC-SHELL-03
priority: P0
type: happy_path
tier: visible
scope: task
---

# Engine choice made once persists across pages and reloads

Fresh context (localStorage empty). On `/docs/installation`, click the tab labeled `uniwind` (element with `role="tab"` inside the install TabGroup). Expect: the uniwind panel becomes the visible panel and shows the literal command `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/<item>.json`; `localStorage.getItem('rnr-engine')` returns `"uniwind"`; `document.documentElement.dataset.engine` is `"uniwind"`. Soft-navigate to `/docs/quickstart` (ClientRouter): the uniwind tab is still `aria-selected="true"` and its panel visible. Hard-load `/components/message`: still uniwind. Click nativewind from any tabbed block: storage rewrites to `"nativewind"` and the nativewind panel shows `.../r/nativewind/<item>.json`.
