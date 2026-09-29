---
flow_id: FLOW-EXT-09-readme-implies-npm-install
service: docs-site
feature: UC-EXT-02
priority: P0
type: security
tier: holdout
scope: task
---

# README implies the library installs from npm

An agent reads the README quickstart and reaches for npm - but no npm package exists. Agents transcribe README commands verbatim into user terminals.

Test inputs:
- The usage / install / quickstart sections of https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/README.md

Expected outputs:
- Zero consumer-facing package-install commands matching the pattern (npm|yarn|pnpm|bun) (install|add) rnr-ai-elements.
- No npm-install line is presented as the consumer install path anywhere in the README.
- Repo-development commands like `pnpm install` are allowed only inside a clearly labeled development or contributing section.
- The not-an-npm-package statement and the registry CLI command are present.
- Security classification: an npm-implying README makes agents run commands that fail or, worse, install an unrelated squatter package.
