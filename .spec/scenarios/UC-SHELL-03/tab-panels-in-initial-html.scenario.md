---
flow_id: FLOW-SHELL-14-tab-panels-in-initial-html
service: docs-site
feature: UC-SHELL-03
priority: P0
type: happy_path
tier: visible
scope: task
---

# Both engine panels are server-rendered in the initial HTML

Fetch the raw HTML (curl or `page.content()` before any JS) of `/docs/installation` and `/components/message`. Assert the markup contains BOTH install commands baked at build: the string `https://rnraielements.com/r/nativewind/` and the string `https://rnraielements.com/r/uniwind/` inside their tab panels. No client fetch of registry JSON renders these — they are literal build output. Then load both pages in a browser with JavaScript disabled: both engine panels render stacked and labeled (nativewind panel plus uniwind panel), each readable top to bottom. This is the zero-JS floor the TabGroup enhances.
