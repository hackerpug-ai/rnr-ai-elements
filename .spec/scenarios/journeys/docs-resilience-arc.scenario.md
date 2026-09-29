---
service: docs-site
feature: journey-docs-resilience-arc
covers_ucs: [UC-SHELL-02, UC-SHELL-04, UC-DELIV-04]
priority: P1
type: happy_path
tier: visible
test_tier: e2e
---
# The site stays usable when things degrade

The resilience path: load the full ledger and tabbed pages with JavaScript disabled, navigate by Cmd+K search when you do not know where something lives, use the mobile drawer on a phone-width viewport with keyboard focus and reduced motion, print a component page, and hit a styled 404 with search recovery (plus working vanity redirects) when a URL is dead. The arc fails if any island gates content, search cannot find an item, or an unknown URL returns a blank body.

**Covers:** `UC-SHELL-02`, `UC-SHELL-04`, `UC-DELIV-04`
