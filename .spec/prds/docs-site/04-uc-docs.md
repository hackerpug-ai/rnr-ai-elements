---
stability: FEATURE_SPEC
last_validated: 2026-09-08
prd_version: 1.0.0
functional_group: DOCS
---

# Use Cases: Documentation Content (DOCS)

| ID | Title | Description |
|----|-------|-------------|
| UC-DOCS-01 | Read the getting-started documentation set | The Introduction, Installation, CLI, Theming, and Dark mode pages carry the core orientation. |
| UC-DOCS-02 | Build a chat screen with the single quickstart tutorial | Exactly one tutorial exists: pick engine, add a conversation-family item, render a message list. |
| UC-DOCS-03 | Use the lean how-to guides | Five capped launch guides serve the re-theme, update, preview, engine-choice, and port-next jobs. |
| UC-DOCS-04 | Read the owns-vs-does-not-own boundary | The boundary page states as scannable tables what the library ships and does not. |
| UC-DOCS-05 | Read porting notes and prior art | Intentional divergences from Vercel AI Elements and earlier RN ports, before backporting. |
| UC-DOCS-06 | Track releases through the changelog | One entry per release in reverse chronological order. |

---

## UC-DOCS-01: Read the getting-started documentation set

The Introduction, Installation, CLI, Theming, and Dark mode pages carry the core orientation: what the library is and is not, the engine decision guide keyed to project facts, and the no-tailwind.config.js theming guide.

- ☐ Visitor can read an Introduction page that states what the library is (universal AI chat and agent UI components for React Native, distributed as a copy-paste registry) and that it is not an npm package
- ☐ Visitor can use an Installation page that poses the engine question exactly once and presents nativewind and uniwind instructions as tabs, never un-tabbed duplicates
- ☐ Visitor can read an engine decision guide keyed to project facts (Tailwind v4 plus @theme implies uniwind; nativewind v3 implies the nativewind tree) on the Installation page
- ☐ Themer can read a Theming guide that states there is no tailwind.config.js and documents the Tailwind v4 @theme oklch token map with light and dark values
- ☐ Visitor can reach the CLI and Dark mode pages from the getting-started section navigation
- ☐ Visitor can read the CLI page scoped to how the CLI is used against THIS registry (absolute-URL add, what it writes to the consumer's project, engine trees) with a link out to the authoritative RNR CLI reference, never a mirrored copy of it [v1.1.0 TW-13]

---

## UC-DOCS-02: Build a chat screen with the single quickstart tutorial

Exactly one tutorial exists: pick engine, add a conversation-family item, render a message list with prompt input. It is the compressed tutorials quadrant.

- ☐ Integrator can follow exactly one quickstart tutorial (pick engine, add a conversation family item, render a message list with prompt input) on /docs/quickstart
- ☐ Integrator can read engine-tabbed code blocks throughout the tutorial so the wrong engine's snippet is never shown unless deliberately selected
- ☐ System renders the quickstart as the only tutorial on the site, keeping the tutorials quadrant to a single path
- ☐ Integrator can reach the worked integration example (the apps/example target wiring useChat) from the quickstart conclusion
- ☐ Learner can read what each quickstart step should produce before moving on ("after this step you should see...") so success is observable per step [v1.1.0 TW-10]
- ☐ Learner can read the tutorial's named end state up front — a scrolling message list with working prompt input in Expo Go on seed data — before the handoff to apps/example for live useChat wiring [v1.1.0 TW-10]

---

## UC-DOCS-03: Use the lean how-to guides

A Guides section capped at five launch pages serves the re-theme, update, preview, engine-choice, and port-next jobs without becoming a curriculum.

- ☐ Themer can read a guide on customizing oklch tokens from the Guides index (step-by-step rebrand; the Theming page remains the token-map reference)
- ☐ Integrator can read a guide on updating installed items when the registry moves
- ☐ Themer can read a guide on customizing rendering — injecting a custom markdown renderer through renderMarkdown and propagating text styles through TextClassContext — linked from the component pages that use those seams [v1.1.0 TW-01]
- ☐ Integrator can read a troubleshooting guide with symptom-to-cause-to-fix entries covering the short-name collision (DOM imports after add), wrong-engine-tree symptoms, the Expo Go crash on the 4 opt-in items and the move to a dev client, and the markdown streaming crash — linked from Installation and the per-item dependency panel [v1.1.0 TW-03]
- ☐ Visitor can read a guide on previewing on device via Expo Go from the Guides index
- ☐ System limits the Guides section to five pages at launch (engine choice and porting are NOT guides — Installation and /porting own them) [v1.1.0 TW-02]

---

## UC-DOCS-04: Read the owns-vs-does-not-own boundary

The boundary page states as scannable tables that the library ships no transport, no streaming client, and no tool executor, and points to the example app as the worked reference.

- ☐ Integrator can read the owns-vs-does-not-own boundary as scannable tables (no transport, no streaming client, no tool executor; the consumer wires AI SDK v7 useChat) on /docs/owns-vs-does-not-own
- ☐ Integrator can follow a link to the worked example app from the boundary page
- ☐ Contributor can read the ownership split (primitives belong to react-native-reusables core, AI compositions belong here) with gaps listed honestly
- ☐ System renders boundary content as tables rather than prose paragraphs
- ☐ System treats /docs/owns-vs-does-not-own as the single canonical boundary page — home and Introduction carry one-line teasers plus links, and the Porting notes bundle carries no second copy of the boundary tables [v1.1.0 TW-04]

---

## UC-DOCS-05: Read porting notes and prior art

Porting notes explain intentional divergences from Vercel AI Elements and earlier RN ports before an extender backports anything.

- ☐ Contributor can scan an upstream-to-port mapping table (which Vercel AI Elements element maps to which registry item) with a deviations column on /porting
- ☐ Contributor can read a not-ported list naming exactly which upstream elements are missing
- ☐ Contributor can read prior-art context (elements.ai-sdk.dev and muratcakmak/expo-ai-elements) explaining why the port differs

---

## UC-DOCS-06: Track releases through the changelog

One entry per release in reverse chronological order makes maintenance health visible on the site.

- ☐ Visitor can browse changelog entries in reverse chronological order on /changelog
- ☐ Visitor can open one page per release showing the date plus added, changed, and fixed lists
- ☐ Visitor can follow links from a release entry to the component pages that release touched
