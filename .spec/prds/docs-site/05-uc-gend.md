---
stability: FEATURE_SPEC
last_validated: 2026-09-08
prd_version: 1.0.0
functional_group: GEND
---

# Use Cases: Generated Registry Surface (GEND)

| ID | Title | Description |
|----|-------|-------------|
| UC-GEND-01 | Evaluate the library from the home page in one visit | What this is, that it is not npm, how healthy it is, and the exact command to try it. |
| UC-GEND-02 | Browse components by AI family | The 39 components grouped by the seven AI families; secondary path after search. |
| UC-GEND-03 | Read a generated component reference page | One page per component, generated from registry data. |
| UC-GEND-04 | Copy exact install commands and review dependencies per item | Absolute-URL CLI command with one-click copy and a full dependency panel. |
| UC-GEND-05 | See generated run evidence and Expo Go verdicts | QR deep links and per-item verdicts ship now; imagery is phase-flagged. |
| UC-GEND-06 | Inspect the generated API reference and full source | Props tables and full untruncated source derive from what ships. |
| UC-GEND-07 | Use the generated registry ledger | All 56 items, generated at build, never hand-maintained. |

---

## UC-GEND-01: Evaluate the library from the home page in one visit

The home page answers the evaluation question in one screen: what this is, that it is not npm, how healthy it is, and the exact command to try it.

- ☐ Visitor can read a one-screen statement of what the library is and that it is not an npm package on the home page
- ☐ Visitor can see health counters (current version 0.2.1 and 56 items split 39 component / 11 ui / 6 lib) without leaving the hero
- ☐ Visitor can copy an install command from the hero in one click
- ☐ Visitor can navigate to Get started and Browse components primary CTAs from the hero

---

## UC-GEND-02: Browse components by AI family

The 39 components are grouped by the seven AI families so any single item is findable without scrolling a flat wall of links. This is the secondary navigation path after search.

- ☐ Visitor can browse the 39 components grouped by AI family (conversation, message, prompt-input, reasoning, sources, suggestion, tool) on /components
- ☐ Visitor can open a card grid where each card carries the component name, a one-line description, a category chip, and an Expo Go verdict badge
- ☐ Visitor can use family grouping as the secondary navigation path alongside Cmd+K search as primary

---

## UC-GEND-03: Read a generated component reference page

One page per component, generated from registry data: chip row, install block first, preview/code views, props, theming note, usage snippets, family pager, and links to the extension seams where relevant.

- ☐ Visitor can open one reference page per component carrying the title, a one-line description, and a status chip row (version, category, nativewind/uniwind engines, Expo Go verdict)
- ☐ Integrator can see the engine-tabbed install block as the first content section on every component page
- ☐ Visitor can move to the previous and next item within the same family via a pager on every component page
- ☐ Themer can reach renderMarkdown and TextClassContext extension-seam documentation from the component pages that use those seams

---

## UC-GEND-04: Copy exact install commands and review dependencies per item

Every item and family exposes the absolute-URL CLI command with one-click copy and a full dependency panel, eliminating npm confusion and short-name collisions.

- ☐ Integrator can copy the exact absolute-URL install command (npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/{item}.json) for every item and item family in one click
- ☐ Integrator can read a per-item dependency panel listing registryDependencies and dependencies, including the AI SDK v7 peers that must be installed
- ☐ System never renders a short-name shadcn-style install form or un-tabbed duplicated engine variants anywhere on the site

---

## UC-GEND-05: See generated run evidence and Expo Go verdicts

QR deep links to the live gallery and per-item Expo Go verdicts ship now. The four-state matrix and dark-strip imagery arrive with the phased Playwright capture sprint (flagged as a second PRD): until then pages omit the preview panel entirely, and once capture is live the prebuild fails on missing imagery.

- ☐ Visitor can scan a QR code on a component page to open the live gallery screen in Expo Go on their own phone with no clone or install required
- ☐ Integrator can read a per-item Expo Go verdict (runs in Expo Go or requires a dev client) as a badge on component pages and ledger rows
- ☐ Integrator can read which of the 4 opt-in items (enriched markdown, streamdown, speech recognition, extended audio) require a dev client, with their peer and permission contracts, in the install docs matrix
- ☐ System omits the preview panel entirely when imagery is null and fails the build on missing imagery once the capture pipeline is live

---

## UC-GEND-06: Inspect the generated API reference and full source

Copy-paste users own every line: props tables and full untruncated source derive from the same registry data that ships, with always-visible copy affordances.

- ☐ Integrator can read an auto-generated props table (name, type, default, description) on every component page
- ☐ Themer can read the full untruncated source of any registry item in a Code view that is never height-limited, prettified-only, or line-numbered-only
- ☐ Visitor can copy any code block or install command through an always-visible copy affordance with a success state
- ☐ System derives props tables and source views from the same registry data that ships, so the reference never contradicts the artifact

---

## UC-GEND-07: Use the generated registry ledger

A single filterable ledger of all 56 items, generated at build from the shipped registry JSON so it can never drift from what actually shipped.

- ☐ Visitor can browse a ledger of all 56 items (39 component / 11 ui / 6 lib) generated at build from the shipped registry JSON at /registry
- ☐ Integrator can filter the ledger with category tabs and an engine toggle, and can copy a per-row install command
- ☐ Visitor can copy the two engine base URLs and read bulk-add instructions above the table
- ☐ Visitor can read a visible note that the table is generated at build from public/r/*.json so it cannot drift from what shipped
- ☐ Maintainer cannot hand-edit ledger content because the system regenerates it from registry data on every build
