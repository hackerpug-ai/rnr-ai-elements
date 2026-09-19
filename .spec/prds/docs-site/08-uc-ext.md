---
stability: FEATURE_SPEC
last_validated: 2026-09-08
prd_version: 1.0.0
functional_group: EXT
---

# Use Cases: GitHub-Facing and Agent Docs (EXT)

*Prefix EXT (not AGENT — UC-AGENT-0* is taken by the MVP PRD's scenario tree).*

| ID | Title | Description |
|----|-------|-------------|
| UC-EXT-01 | Fetch machine-readable agent docs | Stable-URL llms.txt-style docs carry literal commands, heuristics, and contracts. |
| UC-EXT-02 | Trust the GitHub-facing surface | README, LICENSE, CONTRIBUTING, and release notes exist and point at the site. |
| UC-EXT-03 | Contribute without tribal knowledge | CONTRIBUTING encodes the source-of-truth rule, gate list, fan-out, and release process. |

---

## UC-EXT-01: Fetch machine-readable agent docs

Stable-URL llms.txt-style docs carry literal commands, engine-detection heuristics, and per-item contracts so agents install the correct tree on the first attempt.

- ☐ Agent can fetch an llms.txt index and an llms-full.txt document at stable URLs on rnraielements.com
- ☐ Agent can read the explicit not-an-npm-package statement and literal absolute-URL install commands in those documents
- ☐ Agent can read engine-detection heuristics keyed to project facts (Tailwind v4 plus @theme implies uniwind; nativewind v3 implies the nativewind tree)
- ☐ Agent can read per-item peer and permission contracts and Expo Go vs dev-client flags
- ☐ System generates llms.txt, llms-full.txt, and robots.txt from the same collections and registry data that build the site

---

## UC-EXT-02: Trust the GitHub-facing surface

Evaluation visits that land on GitHub instead of the site still succeed: README, LICENSE, CONTRIBUTING, and release notes exist and point at rnraielements.com.

- ☐ Visitor can read a README on GitHub stating the value prop, the install entry point, and a Contributing link
- ☐ Visitor can read a LICENSE file in the repository
- ☐ Visitor can read release notes on GitHub generated from the site changelog collection by the release process, so the two can never disagree [v1.1.0 TW-07]
- ☐ Visitor can reach rnraielements.com from the GitHub README

---

## UC-EXT-03: Contribute without tribal knowledge

CONTRIBUTING encodes the source-of-truth rule, the full CI gate list, the two-engine fan-out, and the release process.

- ☐ Contributor can read the source-of-truth rule (edit packages/registry/, never the shipped trees under public/r/ by hand) in CONTRIBUTING
- ☐ Contributor can read the full CI gate list a PR must pass (typecheck, biome, vitest, registry freshness, expo-doctor, peer and permission contracts in both directions, 56-item integrity, design-token gate)
- ☐ Contributor can read how one source fans out to both engine trees and follow the release-notes process
- ☐ Contributor can read the docs-PR pass criteria in CONTRIBUTING: build green, link check green, snippet gate green (no hand-typed code in markdown), content-standards conformance [v1.1.0 TW-05/06]
- ☐ Contributor can read the review-enforced rule in CONTRIBUTING that a PR changing an item's behavior also updates that item's registry description [v1.2.0]
