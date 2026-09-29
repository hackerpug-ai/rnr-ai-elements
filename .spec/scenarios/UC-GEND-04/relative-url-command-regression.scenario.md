---
flow_id: FLOW-GEND-23-relative-url-command-regression
service: docs-site
feature: UC-GEND-04
priority: P0
type: edge_case
tier: holdout
scope: task
---

# A bare-relative /r/... URL in any install command fails the audit

Inject the regression: a template composes the install command from a relative path (`npx @react-native-reusables/cli@latest add /r/nativewind/conversation.json`) — plausible after a refactor to a site-relative constant. Run the command audit over the built HTML.

**Expected**: failure. The CLI resolves relative paths against whatever registry the user's project already points at, and a relative URL breaks the moment the docs are mirrored or previewed on a non-apex host (including PR preview hosts). Only the absolute `https://rnraielements.com/r/...` form is valid on the live site; the audit regex enforces the scheme + apex host + `/r/{engine}/{item}.json` shape with no exemptions for previews.
