---
flow_id: FLOW-SHELL-07-cmdk-open-search-navigate
service: docs-site
feature: UC-SHELL-02
priority: P1
type: happy_path
tier: visible
scope: task
---

# Open Cmd+K from any page, search, and navigate

On `/docs/introduction`, press Meta+K (macOS) / Control+K (Windows). A native `<dialog>` opens with `aria-modal="true"`, and focus lands in the search input. First open shows a loading state while the index loads (see lazy-load flow). Type `streamdown`: grouped results appear (components / ui / lib / pages) with a result count announced via aria-live. Press Enter on the highlighted result: dialog closes and the browser navigates to that page. Probe two more queries: `renderMarkdown` (hits the extension-seam docs) and `dev client` (hits verdict text on item pages — proves hidden tab panels are indexed). Both return results on `/docs/owns-vs-does-not-own` as well as item pages.
