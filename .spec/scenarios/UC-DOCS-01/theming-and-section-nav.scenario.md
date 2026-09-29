---
flow_id: FLOW-DOCS-01-theming-and-section-nav
service: docs-site
feature: UC-DOCS-01
priority: P1
type: happy_path
tier: visible
scope: task
---

# Theming guide and getting-started navigation hold up

Read /docs/theming top to bottom. It states there is no tailwind.config.js and documents the Tailwind v4 `@theme` oklch token map with a light and dark value per token (for example --primary). Then click through the getting-started section navigation. Expected output: /docs/theming, /docs/cli, and /docs/dark-mode all return 200, each is reachable from the section nav links, and the theming page shows paired light/dark oklch values rather than a single value per token.
