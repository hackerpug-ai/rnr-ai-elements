---
stability: FEATURE_SPEC
last_validated: 2026-09-08
prd_version: 1.0.0
functional_group: SHELL
---

# Use Cases: Site Shell Theming and Search (SHELL)

| ID | Title | Description |
|----|-------|-------------|
| UC-SHELL-01 | Experience the dark-first themed shell | The site styles itself with the same oklch token vocabulary it documents. |
| UC-SHELL-02 | Navigate by Cmd+K search | Pagefind-backed search over all 56 item pages and all documentation. |
| UC-SHELL-03 | Persist the engine choice across pages | The engine choice is made once and persists; never in the URL. |
| UC-SHELL-04 | Use the site without JavaScript, on mobile, and in print | Every island has a zero-JS fallback; responsive, keyboard-safe, printable. |

---

## UC-SHELL-01: Experience the dark-first themed shell

The site styles itself with the same oklch token vocabulary it documents, dark-first with a persisted flash-free toggle, making the theming page a live demo.

- ☐ Visitor can toggle between dark and light themes with a persisted, flash-free toggle in the sticky header
- ☐ Visitor can see the site render dark-first while first visits respect prefers-color-scheme
- ☐ Themer can read the Theming page token table with live oklch swatches and watch the values flip with the site theme
- ☐ System styles code blocks through both Expressive Code themes so highlighting matches the active color scheme

---

## UC-SHELL-02: Navigate by Cmd+K search

Pagefind-backed Cmd+K search over all 56 item pages and all documentation is the primary navigation path.

- ☐ Visitor can open a search dialog with Cmd+K from any page
- ☐ Visitor can search across all 56 item pages and all documentation pages, including props and verdict text
- ☐ System lazy-loads the Pagefind index bundle only on first dialog open
- ☐ Visitor can rely on search as the primary navigation path with family browse as the secondary path

---

## UC-SHELL-03: Persist the engine choice across pages

The nativewind vs uniwind choice is made once and persists across pages, so the wrong tree's instructions are never shown unless deliberately selected.

- ☐ Integrator can select an engine tab (nativewind or uniwind) once and see that choice persist across pages in the same browser
- ☐ Integrator can deliberately switch engines at any time from any tabbed block
- ☐ System never encodes engine state in the URL
- ☐ Visitor can read every tabbed code block through server-rendered panels before any JavaScript runs

---

## UC-SHELL-04: Use the site without JavaScript, on mobile, and in print

Every island has a zero-JS fallback; the shell is responsive, keyboard-accessible, motion-safe, and printable.

- ☐ Visitor can read the full ledger table and all tabbed panel content with JavaScript disabled
- ☐ Visitor can navigate documentation on mobile via a drawer navigation and collapsible sidebar
- ☐ Visitor can use keyboard focus-visible states and reduced-motion-safe animations throughout the site
- ☐ Visitor can print a component page with print styles that preserve code blocks and tables
