---
flow_id: FLOW-SHELL-22-reduced-motion-still-animates
service: docs-site
feature: UC-SHELL-04
priority: P1
type: edge_case
tier: holdout
scope: task
---

# prefers-reduced-motion disables every shell animation

The regression this catches: a motion rule added without a reduced-motion guard. Emulate `prefers-reduced-motion: reduce`, then exercise every animated surface: switch engine tabs, toggle the theme, open/close the Cmd+K dialog, open the mobile drawer, click a copy button (success icon), and scroll a long page (TOC highlight). For each surface's animating elements assert computed `transition-duration` resolves to `0s` and/or `animation-name` is `none` — nothing moves. Meaning must survive the removed motion: the copy success is announced via aria-live plus a static icon state, and the dialog/drawer state changes are conveyed by DOM state, not the slide. Contrast control under `no-preference`: the same surfaces show non-zero durations, proving the guard targets reduce specifically.
