---
flow_id: FLOW-DOCS-01-missing-draft-getting-started-page
service: docs-site
feature: UC-DOCS-01
priority: P1
type: error_handling
tier: holdout
scope: task
---

# No getting-started nav entry dead-ends or leaks a draft

Request each of the five getting-started routes (/docs/introduction, /docs/installation, /docs/cli, /docs/theming, /docs/dark-mode) and crawl every href in the section navigation. Expected output: all five return 200 with populated content, and the crawl finds zero broken nav hrefs (no 404s, no href='#'). Then add a page with draft: true to the docs collection (for example /docs/roadmap). The draft page appears nowhere: absent from the section nav, absent from the sitemap, and a direct GET of /docs/roadmap returns 404 in the production build.
