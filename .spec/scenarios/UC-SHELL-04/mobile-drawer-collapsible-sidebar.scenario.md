---
flow_id: FLOW-SHELL-25-mobile-drawer-navigation
service: docs-site
feature: UC-SHELL-04
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Mobile drawer navigation and responsive shell

Viewport 390x844 (below the 48rem mobile breakpoint). On `/docs/installation`: the desktop sidebar is hidden; a menu button in the sticky header opens the drawer navigation; the drawer is keyboard reachable, closable with Escape, and traps focus while open; the TOC (on a long page like `/docs/theming`) collapses to a top collapsible block. On `/registry` at this width: the ledger is horizontally scrollable with the first column sticky, and the page itself shows no horizontal scrollbar (`document.scrollingElement.scrollWidth <= clientWidth`). All touch targets in the drawer and header measure >=44px in both dimensions; the header remains sticky (3.5rem tall) while scrolling. Resize to 1024x800 (>=64rem): the sidebar is visible as a column and the drawer control is gone.
