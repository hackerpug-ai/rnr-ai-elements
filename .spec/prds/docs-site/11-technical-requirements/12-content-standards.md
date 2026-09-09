---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.1.0
---

# Content Standards (authored prose)

*Added in v1.1.0 from the techwriting-planner review (TW-05/06/09) — the one artifact class the fail-closed machinery does not gate: hand-written words.*

## Style baseline
Google developer documentation style guide (https://developers.google.com/style): active voice, short sentences, second person, present tense, define acronyms on first use. How-to guides use imperative titles ("Customize rendering"); the single tutorial uses imperative steps with "we"; reference pages stay austere (no tutorializing inside generated pages).

## Terminology lock (one canonical term per concept)
| Concept | Canonical term | Not |
|---|---|---|
| the styling backend choice | engine (nativewind / uniwind) | "styling engine", "flavor" |
| the per-engine artifact set | engine tree | "registry variant" |
| a shippable unit in registry.json | registry item | "component" (reserve for registry:component type) |
| the 7 AI families | family | "group" |
| Expo Go / dev-client status | verdict | "flag", "support level" |
| required co-installed packages | peers | "deps" (in prose) |
| the runtime requiring a dev build | dev client | "dev build", "custom client" |

## Page templates (authored)
- **Guide**: "This guide shows you how to {goal}." + prerequisites + numbered imperative steps, each with its expected observable result + next steps.
- **Getting-started page**: opening scope sentence + explicit non-scope ("this page does not cover X — see {link}") + onward links.
- **Quickstart (the single tutorial)**: names its end state before step 1; every step states what the learner should see after it.
- **Troubleshooting entry**: symptom → cause → fix, one fix per symptom, links to the canonical page owning each topic.

## Generated-page descriptions
39 reference pages carry `metaDescription` from a template ("{title} — {one-line description} for React Native, installable via the {engine} registry tree") so search results and Pagefind snippets are specified, not accidental.

## Content gates (CI)
1. **Snippet gate**: every code snippet in authored docs is extracted from or typechecked against real files (apps/example or a snippets package compiled in CI). No hand-typed code in markdown.
2. **Link check**: every internal link in dist/ resolves (generated pages included); external links fail soft (warning) except prior-art/reference URLs which fail hard.
3. **Docs-PR criteria** (stated in CONTRIBUTING): build green, link check green, snippet gate green, content-standards conformance (voice/terminology/template).
4. **Registry-description currency** (review-enforced, not machine-gateable): a PR that changes an item's behavior updates that item's `description` in `packages/registry/registry.json` — the one authored sentence per component must move with its code. [v1.2.0]
