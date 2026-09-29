---
flow_id: FLOW-SHELL-03-light-flash-on-first-paint
service: docs-site
feature: UC-SHELL-01
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Catch a light-mode flash on first paint under dark preference

The regression this catches: the pre-paint script losing `is:inline` (bundled/deferred, runs after first paint) or losing `data-astro-rerun` (runs once, so post-ClientRouter-swap paints are unstyled). Set prefers-color-scheme: dark, empty localStorage. For each of `/`, `/docs/installation`, `/docs/theming`, `/registry`: cold-navigate with a frame screencast running and assert ZERO frames whose root background is light/white before the settled dark frame; assert `<html>` has `.dark` before the first contentful paint. Also fetch the raw served HTML and verify the theme script in `<head>` carries both attributes (`is:inline` present as a non-bundled inline script; `data-astro-rerun` attribute on it). FAIL if any route paints light-first or the script lacks either attribute.
