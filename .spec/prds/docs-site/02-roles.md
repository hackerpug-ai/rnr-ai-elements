---
stability: PRODUCT_CONTEXT
last_validated: 2026-09-09
prd_version: 2.0.0
---

# Roles

| Role | Description |
|------|-------------|
| Visitor (Evaluator) | React Native/Expo developer who just discovered the library and judges it in one visit: what is this, is it credible, does it run on my stack. Needs the not-npm statement, health counters, live-on-phone proof, and one copyable command. |
| Integrator | Developer executing the install in a real Expo app. Highest-risk persona: must pick the right engine tree, copy absolute-URL commands, install peers (AI SDK v7), know the Expo Go vs dev-client verdict before runtime, and wire `useChat` themselves. |
| Themer / Extender / Porter | Developer rebranding via oklch tokens, swapping the markdown renderer through `renderMarkdown`, propagating text styles via `TextClassContext`, or backporting from Vercel AI Elements. Needs the token map, the seams, and the porting deviations. |
| Contributor / Maintainer | Fixes bugs, adds items, cuts releases. Must know the source-of-truth rule (`packages/registry/`, never `public/r/` by hand), every CI gate, the two-engine fan-out, and the release-notes process. [v2.0.0] Also reviews the docs-sync agent's PRs exactly like human PRs — the PR gate applies to agent output equally. |
| Docs Sync Agent (Flue, non-human) | Runs in GitHub Actions on merge to main. Computes the analysis range from the last-documented-SHA marker, sends the capped diff context to deepseek-v4-flash on OpenRouter for impact analysis, and writes documentation updates through an agent persona that borrows the techwriting-implementer core system prompt (including its knowledge graph). Proposes draft PRs only — it never merges, never pushes to main, and its output is treated as untrusted prose until a human reviews it. |
| AI Coding Agent (non-human) | Claude Code / Copilot / Cursor acting on a user's behalf. Reads `llms.txt`-style stable-URL docs with literal commands and engine-detection heuristics; must never be tempted into an npm install or a short-name add. |
| System | The build/deploy pipeline itself — fail-closed gates, CI lanes, rollback — treated as a role where the criterion is observable machine behavior. |
