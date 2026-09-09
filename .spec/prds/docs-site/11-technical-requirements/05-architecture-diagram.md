---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.0.0
---

# Architecture Diagram

```
[contributor] --PR--> {GitHub: hackerpug-ai/rnr-ai-elements}
                          |
                    .github/workflows/ci.yml
                          |
        registry --> typecheck --> lint --> test --> docs-e2e --> docs-preview-curl
                          |                                     (wrangler versions upload,
                          |                                      non-promoting previews)
                          v
   packages/registry/registry.json  (SOURCE OF TRUTH)
          |            |            |
   registry:build   gallery:manifest  families map (apps/docs)
          |            |            |
          v            v            v
   public/r/{nw,uw}  apps/docs/src/data/gallery-manifest.json
           \            |            /
            \           v           /
        [DocsDataPrebuild — fail-closed gates]
                     |
                     v
        apps/docs/src/data/registry-items.json
        apps/docs/public/r/  (gitignored copy)
                     |
              astro build + pagefind
                     |
                     v
                 dist/  ---- wrangler deploy (gated, main only) ---> {Cloudflare Workers
                     |                                            static assets}
                     v                                                  |
        llms.txt / llms-full.txt / robots.txt / sitemap                 |
                                                                        v
                                              https://rnraielements.com/  (apex; www 301)
                                                 |            |            |
                                          docs HTML     /r/{engine}/*.json   llms*.txt
                                                 |            |            |
                        [visitor] <--------------+            +----> [AI agent / RNR CLI]
```
