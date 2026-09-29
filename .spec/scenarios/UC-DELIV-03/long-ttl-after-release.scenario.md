---
flow_id: FLOW-DELIV-03-long-ttl-after-release
service: docs-site
feature: UC-DELIV-03
priority: P0
type: security
tier: holdout
scope: task
---

# Registry JSON cache TTL regression would freeze installs on old items

A TTL regression on `/r/*.json` (e.g. copy-pasting the `/_astro/*` immutable tier) would pin agents to stale items for up to a year after a release.

**Test inputs**: deploy a release that changes `conversation.json`; introduce the regression under test by setting the `/r/*.json` cache tier to `max-age=31536000, immutable`.

**Expected outputs**:
- `curl -sI https://rnraielements.com/r/nativewind/conversation.json` shows exactly `cache-control: public, max-age=300`. Any `/r/*.json` response with a TTL greater than 300 fails the check.
- After a deploy that changes the file, a cache-bypassed fetch (`curl -s -H 'Cache-Control: no-cache' https://rnraielements.com/r/nativewind/conversation.json`) returns the new sha256 within 300 seconds of the deploy.
