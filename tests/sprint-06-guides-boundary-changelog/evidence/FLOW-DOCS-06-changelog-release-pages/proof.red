@@RUN-FLOW flow=FLOW-DOCS-06-changelog-release-pages sprint=sprint-06-guides-boundary-changelog expect=red cmd_sha=8b274a10d864c24846aa50166832dc18cb7dd23ca70bd3a903f477b5b50f85c0 head=99bbde8e65ff31e51b6c86b46bf34ae7c4ac02a6+dirty at=2026-09-30T01:53:52Z@@
+ pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages

> @rnr-ai-elements/docs@0.1.0 build /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs
> pnpm -w run registry:build && pnpm -w run gallery:manifest && pnpm run prebuild && pnpm run check:snippets && astro build && pnpm run search:index && pnpm run check:links


> rnr-ai-elements@0.2.1 registry:build /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008
> tsx packages/registry/scripts/build-registry.ts

registry built — 56 item(s) x 2 engine(s) = 112 file(s) under public/r/

> rnr-ai-elements@0.2.1 gallery:manifest /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008
> tsx scripts/build-gallery-manifest.ts

gallery manifest — 56 item(s) (3 kinds) -> apps/example/gallery/manifest.ts, apps/docs/src/data/gallery-manifest.json

> @rnr-ai-elements/docs@0.1.0 prebuild /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs
> tsx ../../scripts/docs-data/prebuild.ts

[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological
[docs-data] prebuild: 56 items; props resolved for 39/39 component items; 9 families; public/r copy 114 files; site-facts aiSdkPeers ai@^7.0.89, @ai-sdk/react@^4.0.92

> @rnr-ai-elements/docs@0.1.0 check:snippets /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs
> tsx ../../scripts/docs-data/authored-snippets.ts

{
  "ok": true,
  "root": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008",
  "docsRoot": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs",
  "documents": [
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/cli.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/dark-mode.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/guides/customize-rendering.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/guides/preview-on-device.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/guides/re-theme.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/guides/update-installed-items.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/installation.mdx",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/introduction.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/owns-vs-does-not-own.mdx",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/porting.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/quickstart.mdx",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/src/content/docs/theming.mdx"
  ],
  "blocks": [
    {
      "doc": "apps/docs/src/content/docs/cli.md",
      "snippet": "fence-0",
      "kind": "shell",
      "flavor": "fence",
      "source": "packages/docs-snippets/commands/nativewind.sh",
      "region": {
        "sha256": "97761277ab70e48cd68036e590bed17364c559767461ee1b41117fd1fd182b91",
        "length": 105
      },
      "byteLength": 105,
      "sha256": "97761277ab70e48cd68036e590bed17364c559767461ee1b41117fd1fd182b91"
    },
    {
      "doc": "apps/docs/src/content/docs/guides/customize-rendering.md",
      "snippet": "fence-0",
      "kind": "tsx",
      "flavor": "fence",
      "source": "apps/example/components/ai/message.tsx",
      "region": {
        "sha256": "272fd3912c11a2d509c0ed818bce766c0de8897382f8344955131471e1d13222",
        "length": 302
      },
      "byteLength": 302,
      "sha256": "272fd3912c11a2d509c0ed818bce766c0de8897382f8344955131471e1d13222"
    },
    {
      "doc": "apps/docs/src/content/docs/guides/customize-rendering.md",
      "snippet": "fence-1",
      "kind": "tsx",
      "flavor": "fence",
      "source": "apps/example/components/ai/reasoning.tsx",
      "region": {
        "sha256": "5910ecbf944ae87d4c2f116e397227287cb5d00640c01b81d097d0c87d5c2313",
        "length": 689
      },
      "byteLength": 689,
      "sha256": "5910ecbf944ae87d4c2f116e397227287cb5d00640c01b81d097d0c87d5c2313"
    },
    {
      "doc": "apps/docs/src/content/docs/guides/customize-rendering.md",
      "snippet": "fence-2",
      "kind": "tsx",
      "flavor": "fence",
      "source": "apps/harness/src/stories/Chat.stories.tsx",
      "region": {
        "sha256": "0d66186c70a4be3d95185f08a1a5750a3ae69a314adc6ac1f3358b4716296c89",
        "length": 529
      },
      "byteLength": 529,
      "sha256": "0d66186c70a4be3d95185f08a1a5750a3ae69a314adc6ac1f3358b4716296c89"
    },
    {
      "doc": "apps/docs/src/content/docs/guides/re-theme.md",
      "snippet": "fence-0",
      "kind": "css",
      "flavor": "fence",
      "source": "apps/example/global.css",
      "region": {
        "sha256": "8017c29e7e88c25b48ea4afe70852fcc29acbaf24152109d3dccf4d914d852d9",
        "length": 186
      },
      "byteLength": 186,
      "sha256": "8017c29e7e88c25b48ea4afe70852fcc29acbaf24152109d3dccf4d914d852d9"
    },
    {
      "doc": "apps/docs/src/content/docs/guides/re-theme.md",
      "snippet": "fence-1",
      "kind": "css",
      "flavor": "fence",
      "source": "apps/example/global.css",
      "region": {
        "sha256": "218d3c0c7bfa84a664eed364afc513d7ba3344eb374c7dc5eb4ac1682216430e",
        "length": 838
      },
      "byteLength": 838,
      "sha256": "218d3c0c7bfa84a664eed364afc513d7ba3344eb374c7dc5eb4ac1682216430e"
    },
    {
      "doc": "apps/docs/src/content/docs/guides/re-theme.md",
      "snippet": "fence-2",
      "kind": "configuration",
      "flavor": "fence",
      "source": "packages/docs-snippets/nativewind/tailwind.config.js",
      "region": {
        "sha256": "673d6c96b05fb563d1c9742a5d7d9f5ca208b5f24078a40c2f03700bf9515870",
        "length": 276
      },
      "byteLength": 276,
      "sha256": "673d6c96b05fb563d1c9742a5d7d9f5ca208b5f24078a40c2f03700bf9515870"
    },
    {
      "doc": "apps/docs/src/content/docs/guides/update-installed-items.md",
      "snippet": "fence-0",
      "kind": "shell",
      "flavor": "fence",
      "source": "packages/docs-snippets/commands/update.sh",
      "region": {
        "sha256": "27d596dd2d00c865c95f062ea8ac11c4d2b236917f8a70aa64a8dab32eec3f8d",
        "length": 195
      },
      "byteLength": 195,
      "sha256": "27d596dd2d00c865c95f062ea8ac11c4d2b236917f8a70aa64a8dab32eec3f8d"
    },
    {
      "doc": "apps/docs/src/content/docs/quickstart.mdx",
      "snippet": "messagesSource",
      "kind": "ts",
      "flavor": "source-bound",
      "source": "packages/docs-snippets/shared/quickstart-messages.ts",
      "region": null,
      "byteLength": 3895,
      "sha256": "fba7e6844e9ddc8ab6e4b8e638cda926a8123cb3629b3e329cc82a364f68c322"
    },
    {
      "doc": "apps/docs/src/content/docs/quickstart.mdx",
      "snippet": "messagesSource",
      "kind": "ts",
      "flavor": "source-bound",
      "source": "packages/docs-snippets/shared/quickstart-messages.ts",
      "region": null,
      "byteLength": 3895,
      "sha256": "fba7e6844e9ddc8ab6e4b8e638cda926a8123cb3629b3e329cc82a364f68c322"
    },
    {
      "doc": "apps/docs/src/content/docs/quickstart.mdx",
      "snippet": "screenSource",
      "kind": "tsx",
      "flavor": "source-bound",
      "source": "packages/docs-snippets/shared/quickstart-screen.tsx",
      "region": null,
      "byteLength": 3138,
      "sha256": "270a1c140af7b0095259bed4c8cb417fc231127469836565bed1453a1e8a91a2"
    },
    {
      "doc": "apps/docs/src/content/docs/quickstart.mdx",
      "snippet": "screenSource",
      "kind": "tsx",
      "flavor": "source-bound",
      "source": "packages/docs-snippets/shared/quickstart-screen.tsx",
      "region": null,
      "byteLength": 3138,
      "sha256": "270a1c140af7b0095259bed4c8cb417fc231127469836565bed1453a1e8a91a2"
    },
    {
      "doc": "apps/docs/src/content/docs/quickstart.mdx",
      "snippet": "entrypointNativewind",
      "kind": "tsx",
      "flavor": "source-bound",
      "source": "packages/docs-snippets/nativewind/app/index.tsx",
      "region": null,
      "byteLength": 411,
      "sha256": "af11e01b3cf55b807e259e3b426b19245ffebba5898aa20bf73234c54969497b"
    },
    {
      "doc": "apps/docs/src/content/docs/quickstart.mdx",
      "snippet": "entrypointUniwind",
      "kind": "tsx",
      "flavor": "source-bound",
      "source": "packages/docs-snippets/uniwind/app/index.tsx",
      "region": null,
      "byteLength": 408,
      "sha256": "2152e4cbcc3241dd45592baf380a6657ef6e1c26389a6467f1a1e25a8d4fecd4"
    },
    {
      "doc": "apps/docs/src/content/docs/theming.mdx",
      "snippet": "fence-0",
      "kind": "css",
      "flavor": "fence",
      "source": "apps/example/global.css",
      "region": {
        "sha256": "218d3c0c7bfa84a664eed364afc513d7ba3344eb374c7dc5eb4ac1682216430e",
        "length": 838
      },
      "byteLength": 838,
      "sha256": "218d3c0c7bfa84a664eed364afc513d7ba3344eb374c7dc5eb4ac1682216430e"
    }
  ],
  "kindCoverage": {
    "shell": 2,
    "tsx": 7,
    "css": 3,
    "configuration": 16,
    "ts": 2
  },
  "configurationInputs": [
    "packages/docs-snippets/nativewind/package.json",
    "packages/docs-snippets/nativewind/tsconfig.json",
    "packages/docs-snippets/nativewind/tailwind.config.js",
    "packages/docs-snippets/nativewind/babel.config.js",
    "packages/docs-snippets/nativewind/metro.config.js",
    "packages/docs-snippets/nativewind/components.json",
    "packages/docs-snippets/nativewind/app.json",
    "packages/docs-snippets/nativewind/global.css",
    "packages/docs-snippets/nativewind/nativewind-env.d.ts",
    "packages/docs-snippets/uniwind/package.json",
    "packages/docs-snippets/uniwind/tsconfig.json",
    "packages/docs-snippets/uniwind/metro.config.js",
    "packages/docs-snippets/uniwind/components.json",
    "packages/docs-snippets/uniwind/app.json",
    "packages/docs-snippets/uniwind/global.css",
    "packages/docs-snippets/uniwind/uniwind-types.d.ts"
  ],
  "compilerReceipts": [
    {
      "engine": "nativewind",
      "executable": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/nativewind-bf4f7977c6d0f6e4/node_modules/.bin/tsc",
      "cwd": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-nativewind-case-rUowg7",
      "config": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/nativewind-bf4f7977c6d0f6e4/tsconfig.json",
      "args": [
        "--noEmit"
      ],
      "exit": 0,
      "durationMs": 2082,
      "typescriptVersion": "6.0.3"
    },
    {
      "engine": "uniwind",
      "executable": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/uniwind-f49305e2646283ff/node_modules/.bin/tsc",
      "cwd": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-uniwind-case-ITVjMU",
      "config": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/uniwind-f49305e2646283ff/tsconfig.json",
      "args": [
        "--noEmit"
      ],
      "exit": 0,
      "durationMs": 1909,
      "typescriptVersion": "6.0.3"
    },
    {
      "engine": "live-chat",
      "executable": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/example/node_modules/.bin/tsc",
      "cwd": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/example",
      "config": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/example/tsconfig.live-chat.json",
      "args": [
        "-p",
        "tsconfig.live-chat.json"
      ],
      "exit": 0,
      "durationMs": 2468,
      "typescriptVersion": "6.0.3"
    }
  ],
  "consumerCache": {
    "nativewind": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/nativewind-bf4f7977c6d0f6e4",
    "uniwind": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/uniwind-f49305e2646283ff"
  },
  "emitted": null,
  "errors": []
}
19:55:21 [content] Syncing content
19:55:22 [content] Synced content
19:55:22 [types] Generated 1.10s
19:55:22 [build] output: "static"
19:55:22 [build] mode: "static"
19:55:22 [build] directory: /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/dist/
19:55:22 [build] Collecting build info...
19:55:22 [build] ✓ Completed in 1.19s.
19:55:22 [build] Building static entrypoints...
19:55:23 [vite] ✓ built in 1.05s
19:55:23 [vite] ✓ built in 140ms
19:55:23 [build] Rearranging server assets...

 generating static routes 
19:55:23   ├─ /404.html (+12ms) 
19:55:23   ├─ /components/streamdown/index.html (+4ms) 
19:55:23   ├─ /components/shimmer/index.html (+11ms) 
19:55:23   ├─ /components/checkpoint/index.html (+4ms) 
19:55:23   ├─ /components/image/index.html (+3ms) 
19:55:23   ├─ /components/persona/index.html (+3ms) 
19:55:23   ├─ /components/speech-input/index.html (+3ms) 
19:55:23   ├─ /components/kbd/index.html (+3ms) 
19:55:23   ├─ /components/breadcrumb/index.html (+3ms) 
19:55:23   ├─ /components/button-group/index.html (+3ms) 
19:55:23   ├─ /components/slider/index.html (+3ms) 
19:55:23   ├─ /components/table/index.html (+3ms) 
19:55:23   ├─ /components/command/index.html (+3ms) 
19:55:23   ├─ /components/mono/index.html (+2ms) 
19:55:23   ├─ /components/markdown/index.html (+2ms) 
19:55:23   ├─ /components/code-block/index.html (+2ms) 
19:55:23   ├─ /components/conversation/index.html (+2ms) 
19:55:23   ├─ /components/message/index.html (+2ms) 
19:55:23   ├─ /components/prompt-input/index.html (+3ms) 
19:55:23   ├─ /components/empty/index.html (+2ms) 
19:55:23   ├─ /components/item/index.html (+2ms) 
19:55:23   ├─ /components/input-group/index.html (+2ms) 
19:55:23   ├─ /components/sheet/index.html (+2ms) 
19:55:23   ├─ /components/suggestion/index.html (+2ms) 
19:55:23   ├─ /components/status/index.html (+2ms) 
19:55:23   ├─ /components/reasoning-lifecycle/index.html (+2ms) 
19:55:23   ├─ /components/tool/index.html (+2ms) 
19:55:23   ├─ /components/reasoning/index.html (+2ms) 
19:55:23   ├─ /components/task/index.html (+2ms) 
19:55:23   ├─ /components/question/index.html (+2ms) 
19:55:23   ├─ /components/agent/index.html (+2ms) 
19:55:23   ├─ /components/chain-of-thought/index.html (+2ms) 
19:55:23   ├─ /components/plan/index.html (+3ms) 
19:55:23   ├─ /components/confirmation/index.html (+3ms) 
19:55:23   ├─ /components/queue/index.html (+2ms) 
19:55:23   ├─ /components/url/index.html (+2ms) 
19:55:23   ├─ /components/sources/index.html (+2ms) 
19:55:23   ├─ /components/inline-citation/index.html (+2ms) 
19:55:23   ├─ /components/artifact/index.html (+21ms) 
19:55:23   ├─ /components/snippet/index.html (+2ms) 
19:55:23   ├─ /components/commit/index.html (+2ms) 
19:55:23   ├─ /components/attachments/index.html (+2ms) 
19:55:23   ├─ /components/context/index.html (+3ms) 
19:55:23   ├─ /components/open-in-chat/index.html (+3ms) 
19:55:23   ├─ /components/model-selector/index.html (+2ms) 
19:55:23   ├─ /components/mic-selector/index.html (+2ms) 
19:55:23   ├─ /components/voice-selector/index.html (+3ms) 
19:55:23   ├─ /components/audio-player/index.html (+2ms) 
19:55:23   ├─ /components/transcription/index.html (+2ms) 
19:55:23   ├─ /components/terminal/index.html (+2ms) 
19:55:23   ├─ /components/file-tree/index.html (+2ms) 
19:55:23   ├─ /components/environment-variables/index.html (+2ms) 
19:55:23   ├─ /components/package-info/index.html (+2ms) 
19:55:23   ├─ /components/stack-trace-parser/index.html (+2ms) 
19:55:23   ├─ /components/stack-trace/index.html (+2ms) 
19:55:23   ├─ /components/schema-display/index.html (+2ms) 
19:55:23   ├─ /components/test-results/index.html (+2ms) 
19:55:23   ├─ /components/web-preview/index.html (+2ms) 
19:55:23   ├─ /components/index.html (+6ms) 
19:55:23   ├─ /docs/theming/index.html (+12ms) 
19:55:23   ├─ /docs/introduction/index.html (+1ms) 
19:55:23   ├─ /docs/installation/index.html (+3ms) 
19:55:23   ├─ /docs/quickstart/index.html (+5ms) 
19:55:23   ├─ /docs/cli/index.html (+1ms) 
19:55:23   ├─ /docs/dark-mode/index.html (+1ms) 
19:55:23   ├─ /docs/owns-vs-does-not-own/index.html (+3ms) 
19:55:23   ├─ /guides/re-theme/index.html (+2ms) 
19:55:23   ├─ /guides/update-installed-items/index.html (+1ms) 
19:55:23   ├─ /guides/preview-on-device/index.html (+1ms) 
19:55:23   ├─ /guides/customize-rendering/index.html (+1ms) 
19:55:23   ├─ /islands/copy-button/index.html (+2ms) 
19:55:23   ├─ /porting/index.html (+4ms) 
19:55:23   ├─ /registry/index.html (+6ms) 
19:55:23   ├─ /index.html (+3ms) 
19:55:23 ✓ Completed in 362ms.

19:55:23 [build] ✓ Completed in 1.61s.
19:55:23 [build] 74 page(s) built in 2.80s
19:55:23 [build] Complete!

> @rnr-ai-elements/docs@0.1.0 search:index /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs
> tsx ../../scripts/docs-data/search-index.ts

[search-index] 64 expected destinations (56 items, 8 docs) derived from the real sources
[search-index] all expected destinations emitted under /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs/dist
Running Pagefind v1.5.2 (Extended)
Running from: "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008"
Source:       "apps/docs/dist"
Output:       "apps/docs/dist/pagefind"

[Walking source directory]
Found 74 files matching **/*.{html}

[Parsing files]
Found a data-pagefind-body element on the site.
↳ Ignoring pages without this tag.

[Reading languages]
Discovered 1 language: en

[Building search indexes]
Total: 
  Indexed 1 language
  Indexed 69 pages
  Indexed 7400 words
  Indexed 0 filters
  Indexed 0 sorts

Finished in 0.183 seconds
[search-index] index complete: 69 pages cover all 64 expected destinations

> @rnr-ai-elements/docs@0.1.0 check:links /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/apps/docs
> tsx ../../scripts/docs-data/check-dist-links.ts

[docs-data] link-check: warning docs/cli/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/cli.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/dark-mode/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/dark-mode.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/installation/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/installation.mdx: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/introduction/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/introduction.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/owns-vs-does-not-own/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/owns-vs-does-not-own.mdx: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/quickstart/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/quickstart.mdx: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/theming/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/theming.mdx: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning guides/customize-rendering/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/guides/customize-rendering.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning guides/preview-on-device/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/guides/preview-on-device.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning guides/re-theme/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/guides/re-theme.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning guides/update-installed-items/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/guides/update-installed-items.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning porting/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/porting.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: 74 html files, 1958 links (1939 internal, 19 external), 0 error(s), 12 warning(s)

Running 36 tests using 1 worker
FFF·FFFFFFFFFFF·FFFFFFFFFFF·FFFFFFFF

  1) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:343:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-1 index title anchors reverse-chronological 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:346:16

    Error Context: test-results/sprint-06-guides-boundary--18425-chors-reverse-chronological-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--18425-chors-reverse-chronological-chromium-desktop/error-context.md

  2) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:366:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-2 newest release page date and three headings 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      369 |   const newest = expectedVersions[0];
      370 |   const response = await navigateLocalhost(page, releaseRoute(newest));
    > 371 |   expect(response?.status(), `${releaseRoute(newest)} must return HTTP 200`).toBe(200);
          |                                                                              ^
      372 |   await pageLoad(page, testInfo);
      373 |   const article = await releaseArticle(page);
      374 |   const articleText = await article.innerText();
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:371:78

    Error Context: test-results/sprint-06-guides-boundary--39ee2-age-date-and-three-headings-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--39ee2-age-date-and-three-headings-chromium-desktop/error-context.md

  3) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:387:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-3 prebuild gate anchor count phantom routes 404 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:398:16

    Error Context: test-results/sprint-06-guides-boundary--bd1fd-or-count-phantom-routes-404-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--bd1fd-or-count-phantom-routes-404-chromium-desktop/error-context.md

  4) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:432:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-4 every release article component link resolves in the ledger 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      439 |   for (const version of expectedVersions) {
      440 |     const response = await navigateLocalhost(page, releaseRoute(version));
    > 441 |     expect(response?.status(), `${releaseRoute(version)} must return HTTP 200`).toBe(200);
          |                                                                                 ^
      442 |     await pageLoad(page, testInfo);
      443 |     const hrefs = await componentHrefs(await releaseArticle(page));
      444 |     if (version === newest) newestLinks = hrefs.length;
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:441:81

    Error Context: test-results/sprint-06-guides-boundary--45d31-link-resolves-in-the-ledger-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--45d31-link-resolves-in-the-ledger-chromium-desktop/error-context.md

  5) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:463:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-2 rows newest-first with one date chip each 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:466:16

    Error Context: test-results/sprint-06-guides-boundary--fb0a3-rst-with-one-date-chip-each-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--fb0a3-rst-with-one-date-chip-each-chromium-desktop/error-context.md

  6) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:487:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-4 touched anchors are row-title siblings that resolve 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:491:3

    Error Context: test-results/sprint-06-guides-boundary--5133d-title-siblings-that-resolve-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--5133d-title-siblings-that-resolve-chromium-desktop/error-context.md

  7) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:511:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-2 section-index shell Changelog Releases no rail 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:514:3

    Error Context: test-results/sprint-06-guides-boundary--11709--Changelog-Releases-no-rail-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--11709--Changelog-Releases-no-rail-chromium-desktop/error-context.md

  8) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:542:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-5 docs-section nav carries the three groups 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:545:3

    Error Context: test-results/sprint-06-guides-boundary--8be82-av-carries-the-three-groups-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--8be82-av-carries-the-three-groups-chromium-desktop/error-context.md

  9) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:568:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-1 index newest-first and newest release page complete 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:572:3

    Error Context: test-results/sprint-06-guides-boundary--dfaea-ewest-release-page-complete-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--dfaea-ewest-release-page-complete-chromium-desktop/error-context.md

  10) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:604:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-2 every release page 200 with UTC date and three headings 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      608 |   for (const version of expectedVersions) {
      609 |     const response = await navigateLocalhost(page, releaseRoute(version));
    > 610 |     expect(response?.status(), `${releaseRoute(version)} must return HTTP 200`).toBe(200);
          |                                                                                 ^
      611 |     await pageLoad(page, testInfo);
      612 |     const article = await releaseArticle(page);
      613 |     const date = expectedDates.get(version) ?? '';
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:610:81

    Error Context: test-results/sprint-06-guides-boundary--77a5a-UTC-date-and-three-headings-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--77a5a-UTC-date-and-three-headings-chromium-desktop/error-context.md

  11) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:627:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-3 newest release row and article link the same titled slugs 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:632:3

    Error Context: test-results/sprint-06-guides-boundary--32310--link-the-same-titled-slugs-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--32310--link-the-same-titled-slugs-chromium-desktop/error-context.md

  12) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:343:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-1 index title anchors reverse-chronological 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:346:16

    Error Context: test-results/sprint-06-guides-boundary--18425-chors-reverse-chronological-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--18425-chors-reverse-chronological-chromium-mobile/error-context.md

  13) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:366:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-2 newest release page date and three headings 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      369 |   const newest = expectedVersions[0];
      370 |   const response = await navigateLocalhost(page, releaseRoute(newest));
    > 371 |   expect(response?.status(), `${releaseRoute(newest)} must return HTTP 200`).toBe(200);
          |                                                                              ^
      372 |   await pageLoad(page, testInfo);
      373 |   const article = await releaseArticle(page);
      374 |   const articleText = await article.innerText();
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:371:78

    Error Context: test-results/sprint-06-guides-boundary--39ee2-age-date-and-three-headings-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--39ee2-age-date-and-three-headings-chromium-mobile/error-context.md

  14) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:387:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-3 prebuild gate anchor count phantom routes 404 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:398:16

    Error Context: test-results/sprint-06-guides-boundary--bd1fd-or-count-phantom-routes-404-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--bd1fd-or-count-phantom-routes-404-chromium-mobile/error-context.md

  15) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:432:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-4 every release article component link resolves in the ledger 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      439 |   for (const version of expectedVersions) {
      440 |     const response = await navigateLocalhost(page, releaseRoute(version));
    > 441 |     expect(response?.status(), `${releaseRoute(version)} must return HTTP 200`).toBe(200);
          |                                                                                 ^
      442 |     await pageLoad(page, testInfo);
      443 |     const hrefs = await componentHrefs(await releaseArticle(page));
      444 |     if (version === newest) newestLinks = hrefs.length;
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:441:81

    Error Context: test-results/sprint-06-guides-boundary--45d31-link-resolves-in-the-ledger-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--45d31-link-resolves-in-the-ledger-chromium-mobile/error-context.md

  16) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:463:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-2 rows newest-first with one date chip each 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:466:16

    Error Context: test-results/sprint-06-guides-boundary--fb0a3-rst-with-one-date-chip-each-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--fb0a3-rst-with-one-date-chip-each-chromium-mobile/error-context.md

  17) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:487:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-4 touched anchors are row-title siblings that resolve 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:491:3

    Error Context: test-results/sprint-06-guides-boundary--5133d-title-siblings-that-resolve-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--5133d-title-siblings-that-resolve-chromium-mobile/error-context.md

  18) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:511:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-2 section-index shell Changelog Releases no rail 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:514:3

    Error Context: test-results/sprint-06-guides-boundary--11709--Changelog-Releases-no-rail-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--11709--Changelog-Releases-no-rail-chromium-mobile/error-context.md

  19) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:542:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-5 docs-section nav carries the three groups 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:545:3

    Error Context: test-results/sprint-06-guides-boundary--8be82-av-carries-the-three-groups-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--8be82-av-carries-the-three-groups-chromium-mobile/error-context.md

  20) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:568:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-1 index newest-first and newest release page complete 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:572:3

    Error Context: test-results/sprint-06-guides-boundary--dfaea-ewest-release-page-complete-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--dfaea-ewest-release-page-complete-chromium-mobile/error-context.md

  21) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:604:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-2 every release page 200 with UTC date and three headings 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      608 |   for (const version of expectedVersions) {
      609 |     const response = await navigateLocalhost(page, releaseRoute(version));
    > 610 |     expect(response?.status(), `${releaseRoute(version)} must return HTTP 200`).toBe(200);
          |                                                                                 ^
      611 |     await pageLoad(page, testInfo);
      612 |     const article = await releaseArticle(page);
      613 |     const date = expectedDates.get(version) ?? '';
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:610:81

    Error Context: test-results/sprint-06-guides-boundary--77a5a-UTC-date-and-three-headings-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--77a5a-UTC-date-and-three-headings-chromium-mobile/error-context.md

  22) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:627:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-3 newest release row and article link the same titled slugs 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:632:3

    Error Context: test-results/sprint-06-guides-boundary--32310--link-the-same-titled-slugs-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--32310--link-the-same-titled-slugs-chromium-mobile/error-context.md

  23) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:343:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-1 index title anchors reverse-chronological 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:346:16

    Error Context: test-results/sprint-06-guides-boundary--18425-chors-reverse-chronological-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--18425-chors-reverse-chronological-chromium-nojs/error-context.md

  24) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:366:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-2 newest release page date and three headings 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      369 |   const newest = expectedVersions[0];
      370 |   const response = await navigateLocalhost(page, releaseRoute(newest));
    > 371 |   expect(response?.status(), `${releaseRoute(newest)} must return HTTP 200`).toBe(200);
          |                                                                              ^
      372 |   await pageLoad(page, testInfo);
      373 |   const article = await releaseArticle(page);
      374 |   const articleText = await article.innerText();
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:371:78

    Error Context: test-results/sprint-06-guides-boundary--39ee2-age-date-and-three-headings-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--39ee2-age-date-and-three-headings-chromium-nojs/error-context.md

  25) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:387:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-3 prebuild gate anchor count phantom routes 404 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:398:16

    Error Context: test-results/sprint-06-guides-boundary--bd1fd-or-count-phantom-routes-404-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--bd1fd-or-count-phantom-routes-404-chromium-nojs/error-context.md

  26) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:432:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-4 every release article component link resolves in the ledger 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      439 |   for (const version of expectedVersions) {
      440 |     const response = await navigateLocalhost(page, releaseRoute(version));
    > 441 |     expect(response?.status(), `${releaseRoute(version)} must return HTTP 200`).toBe(200);
          |                                                                                 ^
      442 |     await pageLoad(page, testInfo);
      443 |     const hrefs = await componentHrefs(await releaseArticle(page));
      444 |     if (version === newest) newestLinks = hrefs.length;
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:441:81

    Error Context: test-results/sprint-06-guides-boundary--45d31-link-resolves-in-the-ledger-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--45d31-link-resolves-in-the-ledger-chromium-nojs/error-context.md

  27) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:463:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-2 rows newest-first with one date chip each 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:466:16

    Error Context: test-results/sprint-06-guides-boundary--fb0a3-rst-with-one-date-chip-each-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--fb0a3-rst-with-one-date-chip-each-chromium-nojs/error-context.md

  28) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:487:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-4 touched anchors are row-title siblings that resolve 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:491:3

    Error Context: test-results/sprint-06-guides-boundary--5133d-title-siblings-that-resolve-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--5133d-title-siblings-that-resolve-chromium-nojs/error-context.md

  29) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:511:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-2 section-index shell Changelog Releases no rail 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:514:3

    Error Context: test-results/sprint-06-guides-boundary--11709--Changelog-Releases-no-rail-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--11709--Changelog-Releases-no-rail-chromium-nojs/error-context.md

  30) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:542:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-5 docs-section nav carries the three groups 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:545:3

    Error Context: test-results/sprint-06-guides-boundary--8be82-av-carries-the-three-groups-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--8be82-av-carries-the-three-groups-chromium-nojs/error-context.md

  31) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:568:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-1 index newest-first and newest release page complete 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:572:3

    Error Context: test-results/sprint-06-guides-boundary--dfaea-ewest-release-page-complete-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--dfaea-ewest-release-page-complete-chromium-nojs/error-context.md

  32) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:604:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-2 every release page 200 with UTC date and three headings 

    Error: /changelog/0.2.1 must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      608 |   for (const version of expectedVersions) {
      609 |     const response = await navigateLocalhost(page, releaseRoute(version));
    > 610 |     expect(response?.status(), `${releaseRoute(version)} must return HTTP 200`).toBe(200);
          |                                                                                 ^
      611 |     await pageLoad(page, testInfo);
      612 |     const article = await releaseArticle(page);
      613 |     const date = expectedDates.get(version) ?? '';
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:610:81

    Error Context: test-results/sprint-06-guides-boundary--77a5a-UTC-date-and-three-headings-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--77a5a-UTC-date-and-three-headings-chromium-nojs/error-context.md

  33) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:627:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-3 newest release row and article link the same titled slugs 

    Error: /changelog must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      178 | ): Promise<ReturnType<Page['locator']>> {
      179 |   const response = await navigateLocalhost(page, INDEX_ROUTE);
    > 180 |   expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
          |                                                                     ^
      181 |   await pageLoad(page, testInfo);
      182 |   return page.locator('[data-index-list-row]');
      183 | }
        at openIndex (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:180:69)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-008/tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:632:3

    Error Context: test-results/sprint-06-guides-boundary--32310--link-the-same-titled-slugs-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--32310--link-the-same-titled-slugs-chromium-nojs/error-context.md

  33 failed
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:343:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-1 index title anchors reverse-chronological 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:366:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-2 newest release page date and three headings 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:387:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-3 prebuild gate anchor count phantom routes 404 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:432:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-4 every release article component link resolves in the ledger 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:463:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-2 rows newest-first with one date chip each 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:487:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-4 touched anchors are row-title siblings that resolve 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:511:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-2 section-index shell Changelog Releases no rail 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:542:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-5 docs-section nav carries the three groups 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:568:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-1 index newest-first and newest release page complete 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:604:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-2 every release page 200 with UTC date and three headings 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:627:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-3 newest release row and article link the same titled slugs 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:343:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-1 index title anchors reverse-chronological 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:366:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-2 newest release page date and three headings 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:387:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-3 prebuild gate anchor count phantom routes 404 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:432:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-4 every release article component link resolves in the ledger 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:463:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-2 rows newest-first with one date chip each 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:487:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-4 touched anchors are row-title siblings that resolve 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:511:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-2 section-index shell Changelog Releases no rail 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:542:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-5 docs-section nav carries the three groups 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:568:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-1 index newest-first and newest release page complete 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:604:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-2 every release page 200 with UTC date and three headings 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:627:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-3 newest release row and article link the same titled slugs 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:343:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-1 index title anchors reverse-chronological 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:366:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-2 newest release page date and three headings 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:387:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-3 prebuild gate anchor count phantom routes 404 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:432:1 › FLOW-DOCS-06-changelog-release-pages GBC-005-AC-4 every release article component link resolves in the ledger 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:463:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-2 rows newest-first with one date chip each 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:487:1 › FLOW-DOCS-06-changelog-release-pages GBC-015-AC-4 touched anchors are row-title siblings that resolve 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:511:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-2 section-index shell Changelog Releases no rail 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:542:1 › FLOW-DOCS-06-changelog-release-pages GBC-016-AC-5 docs-section nav carries the three groups 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:568:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-1 index newest-first and newest release page complete 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:604:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-2 every release page 200 with UTC date and three headings 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:627:1 › FLOW-DOCS-06-changelog-release-pages GBC-008-AC-3 newest release row and article link the same titled slugs 
  3 passed (1.2m)
@@GATE-EXIT=1@@
