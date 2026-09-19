---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.0.0
---

# Data Schema

| Entity | Properties | Relationships |
|--------|------------|---------------|
| registry_item | name; type (registry:component/ui/lib); title; description; registryDependencies[] ({engine}-templated absolute URLs); dependencies[]; files[] {path,type,target}; meta.permissions {ios[],android[]} | Source of truth at `packages/registry/registry.json`; fans out to `public/r/{nativewind,uniwind}/{name}.json` via `registry:build`; registryDependencies point at reactnativereusables.com items and self-items by absolute URL |
| gallery_manifest_item | name; kind; title; description; dependencies[]; permissions; expoGo (boolean) | Derived from registry_item by `scripts/build-gallery-manifest.ts`; extended to also emit `apps/docs/src/data/gallery-manifest.json` so the verdict computation exists exactly once |
| registry_page_model (build-only) | item; sourceFiles[] {filename,text}; usageSnippet (inlined verbatim from the item's canonical usage file — the gallery cell in apps/example/gallery/cells.ts, the same real code the harness renders and typechecks [v1.2.0]); props[] {name,type,default,description}; themingNote (derived from the oklch utility classes the item source consumes, extracted at build [v1.2.0]); family; expoGo; permissions; imagery {matrix[state],darkStrip} or null; qrDeepLink; metaDescription (generated pattern: '{title} — {one-line description} for React Native, installable via the {engine} registry tree') [v1.1.0 TW-09] | Produced by DocsDataPrebuild; consumed by getStaticPaths for /components/[item], /components, /registry, llms.txt |
| family_group | id; title; order; description; itemNames[] | Hand-maintained map in apps/docs (conversation, message, prompt-input, reasoning, sources, suggestion, tool, ui, lib); CI gate asserts every registry item appears exactly once |
| docs_page (collection) | title; description; section (getting-started \| guides \| porting) — quickstart and owns-vs-does-not-own live under getting-started, matching the real nav [v1.1.0 TW-04]; order; draft? | Glob-loaded from `src/content/docs/**`; .mdx only where in-prose TabGroup composition is needed |
| changelog_entry (collection) | version (semver); date; body (added/changed/fixed markdown) | One file per release; reverse-chronological index; one-to-one with git tags (enforced); the GitHub release body is GENERATED from this entry by the release process [v1.1.0 TW-07] |
| token_map | token name (--background, --foreground, --card, --border, --muted, --primary, …); oklch value; usage | Values mirror the docs site's own @theme block (transcribed consumer theme — the registry ships no tokens by law); feeds TokenTable and the theming guide |
