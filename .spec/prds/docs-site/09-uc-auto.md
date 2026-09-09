---
stability: FEATURE_SPEC
last_validated: 2026-09-09
prd_version: 2.0.0
functional_group: AUTO
---

# Use Cases: Documentation Automation (AUTO)

*Added in v2.0.0 — Flue docs-sync agent in GitHub Actions (deepseek-v4-flash on OpenRouter for analysis; writer persona borrows the techwriting-implementer core system prompt including its knowledge graph).*

| ID | Title | Description |
|----|-------|-------------|
| UC-AUTO-01 | Detect documentation drift on merge to main | The workflow analyzes every commit since the last-documented SHA and proposes updates as a reviewable PR. |
| UC-AUTO-02 | Index the last-documented commit SHA | A repo-committed sync marker tracks what documentation was last updated against. |
| UC-AUTO-03 | Analyze change impact with deepseek-v4-flash via OpenRouter | The capped diff context goes to the pinned model; the impact plan names pages and reasons. |
| UC-AUTO-04 | Write doc updates with the techwriting persona | Generation borrows the techwriting core prompt + graph and emits docs-only diffs. |

---

## UC-AUTO-01: Detect documentation drift on merge to main

On merge to main, the docs-sync workflow runs automatically, computes the analysis range from the sync marker, and turns real code changes into a documentation-update PR — or a documented no-impact close-out.

- ☐ Maintainer can merge a change to main and see the docs-sync workflow run automatically, analyzing every commit since the last-documented SHA
- ☐ System computes the analysis range from the stored last-documented commit SHA, falling back to a documented baseline when the marker is absent (first run)
- ☐ System classifies which documentation surfaces are impacted (authored pages, guides, boundary, README/CONTRIBUTING, registry descriptions), naming each candidate page with a one-line reason
- ☐ System opens a single draft PR containing the proposed documentation updates when impact is found, never pushing directly to main
- ☐ System posts a no-impact close-out comment on the workflow run when no documentation needs changes
- ☐ System advances the stored last-documented SHA only after the documentation PR merges

---

## UC-AUTO-02: Index the last-documented commit SHA

A repo-committed sync marker is the single index of what documentation was last updated against — advanced only by merged documentation PRs, so the marker and the docs it describes stay in one reviewable unit.

- ☐ Maintainer can read the sync marker (the commit SHA documentation was last updated against) in the repository
- ☐ System updates the marker only within a merged documentation-update PR, keeping the marker and the docs it describes in one reviewable unit
- ☐ System fails loudly when the marker references a SHA not reachable from main (rebase or history rewrite), naming the recovery command

---

## UC-AUTO-03: Analyze change impact with deepseek-v4-flash via OpenRouter

The analyst persona sends the capped change context to the pinned model on OpenRouter and parses a structured impact plan; provider failures are visible, never silent.

- ☐ System sends the change-analysis request to deepseek-v4-flash on OpenRouter using the OPENROUTER_API_TOKEN GitHub secret
- ☐ System caps the analysis payload (diff truncation and file-count limits) so large merges cannot exceed the model context
- ☐ System fails the workflow visibly on an OpenRouter error (auth, rate limit, timeout) with a retry-friendly message, never silently skipping
- ☐ Maintainer can read the model's page-by-page impact rationale in the PR description or run summary without opening raw logs

---

## UC-AUTO-04: Write doc updates with the techwriting persona

The writer persona borrows the techwriting-implementer core system prompt (including its knowledge graph), applies the repo's content standards, and proposes docs-only diffs that review exactly like human PRs.

- ☐ System runs the update agent with the core system prompt borrowed from the repo's techwriting-implementer agent, including its knowledge graph
- ☐ System applies 12-content-standards.md (style baseline, terminology lock, page templates) to generated prose
- ☐ System emits only documentation files in its PR — no source, config, or registry-code changes
- ☐ Maintainer can review and edit the agent's PR through the standard flow (PR-gated main applies to agent output equally)
- ☐ System leaves unchanged pages out of the PR diff, touching only impacted files
