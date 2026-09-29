---
service: docs-site
feature: journey-docs-themer-arc
covers_ucs: [UC-DOCS-01, UC-DOCS-03, UC-SHELL-01, UC-GEND-03]
priority: P1
type: happy_path
tier: visible
test_tier: e2e
---
# Re-theme the suite through the documented token seam

The owner-modifier path: read `/docs/theming` (no tailwind.config.js; the @theme oklch token map), watch the TokenTable swatches flip live with the site's own theme toggle — the page is the demo — open the token-customize guide, then a component page to see which tokens it consumes and reach the renderMarkdown / TextClassContext seam docs from the page that uses them. The arc fails if the theming page shows stale swatches, the toggle flashes, or seam links are dead on seam-using pages.

**Covers:** `UC-DOCS-01`, `UC-DOCS-03`, `UC-SHELL-01`, `UC-GEND-03`
