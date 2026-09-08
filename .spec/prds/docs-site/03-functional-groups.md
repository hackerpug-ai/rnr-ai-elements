---
stability: FEATURE_SPEC
last_validated: 2026-09-08
prd_version: 1.0.0
---

# Functional Groups

| Group | Prefix | Description |
|-------|--------|-------------|
| Documentation Content | DOCS | Authored prose pages: getting-started set, single quickstart, lean guides, boundary, porting notes, changelog. |
| Generated Registry Surface | GEND | Every page generated from registry data at build: home evaluation surface, family browse, 39 reference pages, install/dependency panels, evidence and verdicts, ledger. |
| Site Shell Theming and Search | SHELL | The cross-cutting shell: dark-first token-driven theming, Cmd+K search, persisted engine state, and no-JS/mobile/print/accessibility guarantees. |
| Delivery and Operations | DELIV | Fail-closed build pipeline, gated Cloudflare Workers deploy at the canonical domain, same-deploy registry JSON serving, and recovery paths. |
| GitHub-Facing and Agent Docs | EXT | Trust surfaces outside the site chrome: machine-readable llms.txt docs, the GitHub README/LICENSE/release-notes surface, and CONTRIBUTING. |

*Prefix note: the synthesis draft labeled this last group AGENT; it is written as EXT because `.spec/scenarios/UC-AGENT-0*` belongs to the MVP PRD.*

## Use Case Summary

| Group | UCs |
|-------|-----|
| DOCS | 6 |
| GEND | 7 |
| SHELL | 4 |
| DELIV | 4 |
| EXT | 3 |
| **Total** | **24** |
