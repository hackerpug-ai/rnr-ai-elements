---
flow_id: FLOW-EXT-07-readme-carries-value-prop-and-site-link
service: docs-site
feature: UC-EXT-02
priority: P0
type: happy_path
tier: visible
scope: task
---

# GitHub README states the value prop, the install entry point, and links the site

Evaluation visits land on GitHub before the site. The repo currently has NO README; this is the contract for the shipped state.

Test inputs:
- GET https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/README.md
- The rendered repo home at https://github.com/hackerpug-ai/rnr-ai-elements

Expected outputs:
- HTTP 200 with a non-trivial body that renders on the repo home page.
- The README states the value prop: universal AI chat and agent UI components for React Native, distributed as a copy-paste registry, and explicitly not an npm package.
- The README shows the install entry point as the literal command form `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/{item}.json`.
- The README links CONTRIBUTING.md and https://rnraielements.com.
