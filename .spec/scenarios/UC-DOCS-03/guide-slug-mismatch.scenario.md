---
flow_id: FLOW-DOCS-03-guide-slug-mismatch
service: docs-site
feature: UC-DOCS-03
priority: P1
type: error_handling
tier: holdout
scope: task
---

# Every guide card links to a real guide page

Rename the choose-engine guide's file so the index still links /guides/choose-engine while the page now builds at /guides/engine-choice. Expected output: the link check fails, naming the dead href /guides/choose-engine from the /guides index. On the healthy build, crawling the index yields exactly 5 guide hrefs, each returns 200, and each destination page's H1 matches the card title that linked to it.
