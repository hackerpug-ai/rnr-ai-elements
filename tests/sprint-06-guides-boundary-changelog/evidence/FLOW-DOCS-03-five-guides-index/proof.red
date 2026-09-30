@@RUN-FLOW flow=FLOW-DOCS-03-five-guides-index sprint=sprint-06-guides-boundary-changelog expect=red cmd_sha=7c138204cd8715d6a9d0723c2173e7979318097fe9983c2849c99039cd7250bd head=35a1f9f0e1a1fd0f531eaa12324e2aa78b3a1c63+dirty at=2026-09-30T02:18:50Z@@
+ pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts --grep FLOW-DOCS-03-five-guides-index

> @rnr-ai-elements/docs@0.1.0 build /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs
> pnpm -w run registry:build && pnpm -w run gallery:manifest && pnpm run prebuild && pnpm run check:snippets && astro build && pnpm run search:index && pnpm run check:links


> rnr-ai-elements@0.2.1 registry:build /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010
> tsx packages/registry/scripts/build-registry.ts

registry built — 56 item(s) x 2 engine(s) = 112 file(s) under public/r/

> rnr-ai-elements@0.2.1 gallery:manifest /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010
> tsx scripts/build-gallery-manifest.ts

gallery manifest — 56 item(s) (3 kinds) -> apps/example/gallery/manifest.ts, apps/docs/src/data/gallery-manifest.json

> @rnr-ai-elements/docs@0.1.0 prebuild /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs
> tsx ../../scripts/docs-data/prebuild.ts

[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological
[docs-data] prebuild: 56 items; props resolved for 39/39 component items; 9 families; public/r copy 114 files; site-facts aiSdkPeers ai@^7.0.89, @ai-sdk/react@^4.0.92

> @rnr-ai-elements/docs@0.1.0 check:snippets /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs
> tsx ../../scripts/docs-data/authored-snippets.ts

{
  "ok": true,
  "root": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010",
  "docsRoot": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs",
  "documents": [
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/cli.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/dark-mode.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/guides/customize-rendering.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/guides/preview-on-device.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/guides/re-theme.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/guides/troubleshooting.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/guides/update-installed-items.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/installation.mdx",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/introduction.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/owns-vs-does-not-own.mdx",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/porting.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/quickstart.mdx",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/src/content/docs/theming.mdx"
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
      "cwd": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-nativewind-case-5i2Zm7",
      "config": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/nativewind-bf4f7977c6d0f6e4/tsconfig.json",
      "args": [
        "--noEmit"
      ],
      "exit": 0,
      "durationMs": 1134,
      "typescriptVersion": "6.0.3"
    },
    {
      "engine": "uniwind",
      "executable": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/uniwind-f49305e2646283ff/node_modules/.bin/tsc",
      "cwd": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-uniwind-case-z07M41",
      "config": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/uniwind-f49305e2646283ff/tsconfig.json",
      "args": [
        "--noEmit"
      ],
      "exit": 0,
      "durationMs": 2446,
      "typescriptVersion": "6.0.3"
    },
    {
      "engine": "live-chat",
      "executable": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/example/node_modules/.bin/tsc",
      "cwd": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/example",
      "config": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/example/tsconfig.live-chat.json",
      "args": [
        "-p",
        "tsconfig.live-chat.json"
      ],
      "exit": 0,
      "durationMs": 2158,
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
20:19:48 [content] Syncing content
20:19:48 [content] Synced content
20:19:48 [types] Generated 704ms
20:19:48 [build] output: "static"
20:19:48 [build] mode: "static"
20:19:48 [build] directory: /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/dist/
20:19:48 [build] Collecting build info...
20:19:48 [build] ✓ Completed in 761ms.
20:19:48 [build] Building static entrypoints...
20:19:49 [vite] ✓ built in 514ms
20:19:49 [vite] ✓ built in 70ms
20:19:49 [build] Rearranging server assets...

 generating static routes 
20:19:49   ├─ /404.html (+8ms) 
20:19:49   ├─ /components/streamdown/index.html (+2ms) 
20:19:49   ├─ /components/shimmer/index.html (+7ms) 
20:19:49   ├─ /components/checkpoint/index.html (+2ms) 
20:19:49   ├─ /components/image/index.html (+2ms) 
20:19:49   ├─ /components/persona/index.html (+2ms) 
20:19:49   ├─ /components/speech-input/index.html (+2ms) 
20:19:49   ├─ /components/kbd/index.html (+2ms) 
20:19:49   ├─ /components/breadcrumb/index.html (+2ms) 
20:19:49   ├─ /components/button-group/index.html (+2ms) 
20:19:49   ├─ /components/slider/index.html (+2ms) 
20:19:49   ├─ /components/table/index.html (+1ms) 
20:19:49   ├─ /components/command/index.html (+1ms) 
20:19:49   ├─ /components/mono/index.html (+1ms) 
20:19:49   ├─ /components/markdown/index.html (+1ms) 
20:19:49   ├─ /components/code-block/index.html (+1ms) 
20:19:49   ├─ /components/conversation/index.html (+1ms) 
20:19:49   ├─ /components/message/index.html (+1ms) 
20:19:49   ├─ /components/prompt-input/index.html (+2ms) 
20:19:49   ├─ /components/empty/index.html (+1ms) 
20:19:49   ├─ /components/item/index.html (+1ms) 
20:19:49   ├─ /components/input-group/index.html (+1ms) 
20:19:49   ├─ /components/sheet/index.html (+1ms) 
20:19:49   ├─ /components/suggestion/index.html (+1ms) 
20:19:49   ├─ /components/status/index.html (+1ms) 
20:19:49   ├─ /components/reasoning-lifecycle/index.html (+1ms) 
20:19:49   ├─ /components/tool/index.html (+1ms) 
20:19:49   ├─ /components/reasoning/index.html (+1ms) 
20:19:49   ├─ /components/task/index.html (+1ms) 
20:19:49   ├─ /components/question/index.html (+2ms) 
20:19:49   ├─ /components/agent/index.html (+1ms) 
20:19:49   ├─ /components/chain-of-thought/index.html (+1ms) 
20:19:49   ├─ /components/plan/index.html (+1ms) 
20:19:49   ├─ /components/confirmation/index.html (+1ms) 
20:19:49   ├─ /components/queue/index.html (+1ms) 
20:19:49   ├─ /components/url/index.html (+1ms) 
20:19:49   ├─ /components/sources/index.html (+1ms) 
20:19:49   ├─ /components/inline-citation/index.html (+1ms) 
20:19:49   ├─ /components/artifact/index.html (+1ms) 
20:19:49   ├─ /components/snippet/index.html (+1ms) 
20:19:49   ├─ /components/commit/index.html (+1ms) 
20:19:49   ├─ /components/attachments/index.html (+1ms) 
20:19:49   ├─ /components/context/index.html (+6ms) 
20:19:49   ├─ /components/open-in-chat/index.html (+2ms) 
20:19:49   ├─ /components/model-selector/index.html (+2ms) 
20:19:49   ├─ /components/mic-selector/index.html (+2ms) 
20:19:49   ├─ /components/voice-selector/index.html (+2ms) 
20:19:49   ├─ /components/audio-player/index.html (+2ms) 
20:19:49   ├─ /components/transcription/index.html (+14ms) 
20:19:49   ├─ /components/terminal/index.html (+2ms) 
20:19:49   ├─ /components/file-tree/index.html (+2ms) 
20:19:49   ├─ /components/environment-variables/index.html (+1ms) 
20:19:49   ├─ /components/package-info/index.html (+1ms) 
20:19:49   ├─ /components/stack-trace-parser/index.html (+1ms) 
20:19:49   ├─ /components/stack-trace/index.html (+1ms) 
20:19:49   ├─ /components/schema-display/index.html (+1ms) 
20:19:49   ├─ /components/test-results/index.html (+1ms) 
20:19:49   ├─ /components/web-preview/index.html (+1ms) 
20:19:49   ├─ /components/index.html (+4ms) 
20:19:49   ├─ /docs/theming/index.html (+7ms) 
20:19:49   ├─ /docs/introduction/index.html (+1ms) 
20:19:49   ├─ /docs/installation/index.html (+2ms) 
20:19:49   ├─ /docs/quickstart/index.html (+3ms) 
20:19:49   ├─ /docs/cli/index.html (+1ms) 
20:19:49   ├─ /docs/dark-mode/index.html (+1ms) 
20:19:49   ├─ /docs/owns-vs-does-not-own/index.html (+2ms) 
20:19:49   ├─ /guides/re-theme/index.html (+1ms) 
20:19:49   ├─ /guides/update-installed-items/index.html (+1ms) 
20:19:49   ├─ /guides/preview-on-device/index.html (+1ms) 
20:19:49   ├─ /guides/customize-rendering/index.html (+1ms) 
20:19:49   ├─ /guides/troubleshooting/index.html (+1ms) 
20:19:49   ├─ /islands/copy-button/index.html (+1ms) 
20:19:49   ├─ /porting/index.html (+2ms) 
20:19:49   ├─ /registry/index.html (+3ms) 
20:19:49   ├─ /index.html (+2ms) 
20:19:49 ✓ Completed in 219ms.

20:19:49 [build] ✓ Completed in 836ms.
20:19:49 [build] 75 page(s) built in 1.60s
20:19:49 [build] Complete!

> @rnr-ai-elements/docs@0.1.0 search:index /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs
> tsx ../../scripts/docs-data/search-index.ts

[search-index] 64 expected destinations (56 items, 8 docs) derived from the real sources
[search-index] all expected destinations emitted under /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs/dist
Running Pagefind v1.5.2 (Extended)
Running from: "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010"
Source:       "apps/docs/dist"
Output:       "apps/docs/dist/pagefind"

[Walking source directory]
Found 75 files matching **/*.{html}

[Parsing files]
Found a data-pagefind-body element on the site.
↳ Ignoring pages without this tag.

[Reading languages]
Discovered 1 language: en

[Building search indexes]
Total: 
  Indexed 1 language
  Indexed 70 pages
  Indexed 7417 words
  Indexed 0 filters
  Indexed 0 sorts

Finished in 0.112 seconds
[search-index] index complete: 70 pages cover all 64 expected destinations

> @rnr-ai-elements/docs@0.1.0 check:links /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/apps/docs
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
[docs-data] link-check: warning guides/troubleshooting/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/guides/troubleshooting.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning guides/update-installed-items/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/guides/update-installed-items.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning porting/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/porting.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: 75 html files, 2062 links (2042 internal, 20 external), 0 error(s), 13 warning(s)

Running 45 tests using 1 worker
FFFFF·TFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF

  1) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:220:1 › FLOW-DOCS-03-five-guides-index AC-1 the guides index responds 200 with exactly five rows whose titles equal their destinations' h1, under an All guides header counting 5 and no ToC rail 

    Error: /guides must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      222 | }, testInfo) => {
      223 |   const response = await navigateLocalhost(page, GUIDES_ROUTE);
    > 224 |   expect(response?.status(), '/guides must return HTTP 200').toBe(200);
          |                                                              ^
      225 |   await pageLoad(page, testInfo);
      226 |
      227 |   const rows = page.locator('main [data-index-list-row]');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:224:62

    Error Context: test-results/sprint-06-guides-boundary--5b390--counting-5-and-no-ToC-rail-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--5b390--counting-5-and-no-ToC-rail-chromium-desktop/error-context.md

  2) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:273:1 › FLOW-DOCS-03-five-guides-index AC-2 every guides-index row href is a distinct /guides/ path answering 200 

    Error: /guides must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      276 | }, testInfo) => {
      277 |   const response = await navigateLocalhost(page, GUIDES_ROUTE);
    > 278 |   expect(response?.status(), '/guides must return HTTP 200').toBe(200);
          |                                                              ^
      279 |   await pageLoad(page, testInfo);
      280 |
      281 |   const titleAnchors = page.locator('main a[data-index-list-title]');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:278:62

    Error Context: test-results/sprint-06-guides-boundary--3e8e5-t-guides-path-answering-200-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3e8e5-t-guides-path-answering-200-chromium-desktop/error-context.md

  3) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:306:1 › FLOW-DOCS-03-five-guides-index AC-3 the row href set is exactly the five launch guides with no porting, engine or theming row 

    Error: /guides must return HTTP 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      309 | }, testInfo) => {
      310 |   const response = await navigateLocalhost(page, GUIDES_ROUTE);
    > 311 |   expect(response?.status(), '/guides must return HTTP 200').toBe(200);
          |                                                              ^
      312 |   await pageLoad(page, testInfo);
      313 |
      314 |   const titleAnchors = page.locator('main a[data-index-list-title]');
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:311:62

    Error Context: test-results/sprint-06-guides-boundary--fcd57-rting-engine-or-theming-row-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--fcd57-rting-engine-or-theming-row-chromium-desktop/error-context.md

  4) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:346:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-1 re-theme returns 200 with oklch and @theme, one goal sentence, a theming link out, and exactly one index anchor 

    Error: exactly 1 /guides/re-theme anchor inside [data-index-list] on /guides

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      375 |     await page.locator('[data-index-list] a[href="/guides/re-theme"]').count(),
      376 |     'exactly 1 /guides/re-theme anchor inside [data-index-list] on /guides',
    > 377 |   ).toBe(1);
          |     ^
      378 |
      379 |   record(testInfo, 'gbc-001-ac-1', { status: 200, oklch: true, theme: true, goalSentences: 1 });
      380 | });
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:377:5

    Error Context: test-results/sprint-06-guides-boundary--db7e6-nd-exactly-one-index-anchor-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--db7e6-nd-exactly-one-index-anchor-chromium-desktop/error-context.md

  5) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:382:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-2 update-installed-items carries the literal absolute-URL add command, no short-name or relative adds 

    Error: the exact no---yes add literal is present verbatim

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      404 |     addLines.some((line) => line === ADD_LITERAL || line === `${ADD_LITERAL} --overwrite`),
      405 |     'the exact no---yes add literal is present verbatim',
    > 406 |   ).toBe(true);
          |     ^
      407 |
      408 |   // A bare short-name add (such as 'add button') or a relative URL fails this
      409 |   // exact-form match, so the pattern IS the short-name / relative prohibition.
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:406:5

    Error Context: test-results/sprint-06-guides-boundary--45794-short-name-or-relative-adds-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--45794-short-name-or-relative-adds-chromium-desktop/error-context.md

  6) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:465:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-4 preview-on-device opens from the index click, scopes Expo Go vs the four dev-client items, one goal sentence, no supported-in-Expo-Go pairing 

    Test timeout of 30000ms exceeded.

    Error: page.waitForResponse: Test timeout of 30000ms exceeded.

      468 |   await navigateLocalhost(page, GUIDES_ROUTE);
      469 |   const [navResponse] = await Promise.all([
    > 470 |     page.waitForResponse((r) => new URL(r.url()).pathname === '/guides/preview-on-device'),
          |          ^
      471 |     page.locator('[data-index-list] a[href="/guides/preview-on-device"]').click(),
      472 |   ]);
      473 |   expect(navResponse?.status(), 'the index click lands on a 200 page').toBe(200);
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:470:10

    Error Context: test-results/sprint-06-guides-boundary--2f093-upported-in-Expo-Go-pairing-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--2f093-upported-in-Expo-Go-pairing-chromium-desktop/error-context.md

  7) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:512:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-1 troubleshooting has exactly four Symptom/Cause/Fix entries, no stubs, and exactly one index anchor 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/troubleshooting
    Call log:
      - navigating to "http://localhost:4321/guides/troubleshooting", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:515:26

    Error Context: test-results/sprint-06-guides-boundary--3dc75-nd-exactly-one-index-anchor-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3dc75-nd-exactly-one-index-anchor-chromium-desktop/error-context.md

  8) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:545:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-2 the dependency-panel footer Callout links troubleshooting and the registry, and installation links the guide 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/components/message
    Call log:
      - navigating to "http://localhost:4321/components/message", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:549:26

    Error Context: test-results/sprint-06-guides-boundary--0d19f-nstallation-links-the-guide-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--0d19f-nstallation-links-the-guide-chromium-desktop/error-context.md

  9) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:584:1 › FLOW-DOCS-03-five-guides-index GBC-009/AC-1 the five guides publish at /guides/slug with h1 equal to frontmatter title, no /docs aliases, no /guides/guides hrefs 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/re-theme
    Call log:
      - navigating to "http://localhost:4321/guides/re-theme", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:590:25

    Error Context: test-results/sprint-06-guides-boundary--471da-ases-no-guides-guides-hrefs-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--471da-ases-no-guides-guides-hrefs-chromium-desktop/error-context.md

  10) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:627:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-1 the single index list holds exactly the five destinations, each description equal to its destination meta description 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:630:26

    Error Context: test-results/sprint-06-guides-boundary--3d87d-estination-meta-description-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3d87d-estination-meta-description-chromium-desktop/error-context.md

  11) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:665:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-3 the five rows are relative LI touch targets of 44px with an absolute stretch, and no nested anchors in the raw HTML 

    AggregateError: apiRequestContext.get: connect ECONNREFUSED ::1:4321
    connect ECONNREFUSED 127.0.0.1:4321
    Call log:
      - → GET http://localhost:4321/guides
        - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.12 Safari/537.36
        - accept: */*
        - accept-encoding: gzip,deflate,br

        at apiRequestContext.get: connect ECONNREFUSED ::1:4321
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:669:29

    Error Context: test-results/sprint-06-guides-boundary--774c1-ted-anchors-in-the-raw-HTML-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--774c1-ted-anchors-in-the-raw-HTML-chromium-desktop/error-context.md

  12) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:723:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-1 the shell renders the Guides masthead, one All guides header whose chip equals the row count, and no ToC 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:726:26

    Error Context: test-results/sprint-06-guides-boundary--9ad23-ls-the-row-count-and-no-ToC-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--9ad23-ls-the-row-count-and-no-ToC-chromium-desktop/error-context.md

  13) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:767:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-3 the short index serves the entry list with neither ToC form 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:770:26

    Error Context: test-results/sprint-06-guides-boundary--31fc0--list-with-neither-ToC-form-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--31fc0--list-with-neither-ToC-form-chromium-desktop/error-context.md

  14) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:785:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-4 at a 393px viewport the section index is single-track, the docs nav is a visible 44px touch surface, and nothing overflows 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:791:26

    Error Context: test-results/sprint-06-guides-boundary--13364-rface-and-nothing-overflows-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--13364-rface-and-nothing-overflows-chromium-desktop/error-context.md

  15) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:220:1 › FLOW-DOCS-03-five-guides-index AC-1 the guides index responds 200 with exactly five rows whose titles equal their destinations' h1, under an All guides header counting 5 and no ToC rail 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:223:26

    Error Context: test-results/sprint-06-guides-boundary--5b390--counting-5-and-no-ToC-rail-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--5b390--counting-5-and-no-ToC-rail-chromium-mobile/error-context.md

  16) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:273:1 › FLOW-DOCS-03-five-guides-index AC-2 every guides-index row href is a distinct /guides/ path answering 200 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:277:26

    Error Context: test-results/sprint-06-guides-boundary--3e8e5-t-guides-path-answering-200-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3e8e5-t-guides-path-answering-200-chromium-mobile/error-context.md

  17) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:306:1 › FLOW-DOCS-03-five-guides-index AC-3 the row href set is exactly the five launch guides with no porting, engine or theming row 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:310:26

    Error Context: test-results/sprint-06-guides-boundary--fcd57-rting-engine-or-theming-row-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--fcd57-rting-engine-or-theming-row-chromium-mobile/error-context.md

  18) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:346:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-1 re-theme returns 200 with oklch and @theme, one goal sentence, a theming link out, and exactly one index anchor 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/re-theme
    Call log:
      - navigating to "http://localhost:4321/guides/re-theme", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:349:26

    Error Context: test-results/sprint-06-guides-boundary--db7e6-nd-exactly-one-index-anchor-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--db7e6-nd-exactly-one-index-anchor-chromium-mobile/error-context.md

  19) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:382:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-2 update-installed-items carries the literal absolute-URL add command, no short-name or relative adds 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/update-installed-items
    Call log:
      - navigating to "http://localhost:4321/guides/update-installed-items", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:385:26

    Error Context: test-results/sprint-06-guides-boundary--45794-short-name-or-relative-adds-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--45794-short-name-or-relative-adds-chromium-mobile/error-context.md

  20) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:426:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-3 customize-rendering documents both seams once and the message page seam Callout links it, never the old theming anchors 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/customize-rendering
    Call log:
      - navigating to "http://localhost:4321/guides/customize-rendering", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:429:26

    Error Context: test-results/sprint-06-guides-boundary--c0698-ver-the-old-theming-anchors-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--c0698-ver-the-old-theming-anchors-chromium-mobile/error-context.md

  21) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:465:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-4 preview-on-device opens from the index click, scopes Expo Go vs the four dev-client items, one goal sentence, no supported-in-Expo-Go pairing 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:468:9

    Error Context: test-results/sprint-06-guides-boundary--2f093-upported-in-Expo-Go-pairing-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--2f093-upported-in-Expo-Go-pairing-chromium-mobile/error-context.md

  22) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:512:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-1 troubleshooting has exactly four Symptom/Cause/Fix entries, no stubs, and exactly one index anchor 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/troubleshooting
    Call log:
      - navigating to "http://localhost:4321/guides/troubleshooting", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:515:26

    Error Context: test-results/sprint-06-guides-boundary--3dc75-nd-exactly-one-index-anchor-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3dc75-nd-exactly-one-index-anchor-chromium-mobile/error-context.md

  23) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:545:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-2 the dependency-panel footer Callout links troubleshooting and the registry, and installation links the guide 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/components/message
    Call log:
      - navigating to "http://localhost:4321/components/message", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:549:26

    Error Context: test-results/sprint-06-guides-boundary--0d19f-nstallation-links-the-guide-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--0d19f-nstallation-links-the-guide-chromium-mobile/error-context.md

  24) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:584:1 › FLOW-DOCS-03-five-guides-index GBC-009/AC-1 the five guides publish at /guides/slug with h1 equal to frontmatter title, no /docs aliases, no /guides/guides hrefs 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/re-theme
    Call log:
      - navigating to "http://localhost:4321/guides/re-theme", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:590:25

    Error Context: test-results/sprint-06-guides-boundary--471da-ases-no-guides-guides-hrefs-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--471da-ases-no-guides-guides-hrefs-chromium-mobile/error-context.md

  25) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:627:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-1 the single index list holds exactly the five destinations, each description equal to its destination meta description 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:630:26

    Error Context: test-results/sprint-06-guides-boundary--3d87d-estination-meta-description-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3d87d-estination-meta-description-chromium-mobile/error-context.md

  26) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:665:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-3 the five rows are relative LI touch targets of 44px with an absolute stretch, and no nested anchors in the raw HTML 

    AggregateError: apiRequestContext.get: connect ECONNREFUSED ::1:4321
    connect ECONNREFUSED 127.0.0.1:4321
    Call log:
      - → GET http://localhost:4321/guides
        - user-agent: Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.12 Mobile Safari/537.36
        - accept: */*
        - accept-encoding: gzip,deflate,br

        at apiRequestContext.get: connect ECONNREFUSED ::1:4321
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:669:29

    Error Context: test-results/sprint-06-guides-boundary--774c1-ted-anchors-in-the-raw-HTML-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--774c1-ted-anchors-in-the-raw-HTML-chromium-mobile/error-context.md

  27) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:723:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-1 the shell renders the Guides masthead, one All guides header whose chip equals the row count, and no ToC 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:726:26

    Error Context: test-results/sprint-06-guides-boundary--9ad23-ls-the-row-count-and-no-ToC-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--9ad23-ls-the-row-count-and-no-ToC-chromium-mobile/error-context.md

  28) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:767:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-3 the short index serves the entry list with neither ToC form 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:770:26

    Error Context: test-results/sprint-06-guides-boundary--31fc0--list-with-neither-ToC-form-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--31fc0--list-with-neither-ToC-form-chromium-mobile/error-context.md

  29) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:785:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-4 at a 393px viewport the section index is single-track, the docs nav is a visible 44px touch surface, and nothing overflows 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:791:26

    Error Context: test-results/sprint-06-guides-boundary--13364-rface-and-nothing-overflows-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--13364-rface-and-nothing-overflows-chromium-mobile/error-context.md

  30) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:220:1 › FLOW-DOCS-03-five-guides-index AC-1 the guides index responds 200 with exactly five rows whose titles equal their destinations' h1, under an All guides header counting 5 and no ToC rail 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:223:26

    Error Context: test-results/sprint-06-guides-boundary--5b390--counting-5-and-no-ToC-rail-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--5b390--counting-5-and-no-ToC-rail-chromium-nojs/error-context.md

  31) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:273:1 › FLOW-DOCS-03-five-guides-index AC-2 every guides-index row href is a distinct /guides/ path answering 200 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:277:26

    Error Context: test-results/sprint-06-guides-boundary--3e8e5-t-guides-path-answering-200-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3e8e5-t-guides-path-answering-200-chromium-nojs/error-context.md

  32) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:306:1 › FLOW-DOCS-03-five-guides-index AC-3 the row href set is exactly the five launch guides with no porting, engine or theming row 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:310:26

    Error Context: test-results/sprint-06-guides-boundary--fcd57-rting-engine-or-theming-row-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--fcd57-rting-engine-or-theming-row-chromium-nojs/error-context.md

  33) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:346:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-1 re-theme returns 200 with oklch and @theme, one goal sentence, a theming link out, and exactly one index anchor 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/re-theme
    Call log:
      - navigating to "http://localhost:4321/guides/re-theme", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:349:26

    Error Context: test-results/sprint-06-guides-boundary--db7e6-nd-exactly-one-index-anchor-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--db7e6-nd-exactly-one-index-anchor-chromium-nojs/error-context.md

  34) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:382:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-2 update-installed-items carries the literal absolute-URL add command, no short-name or relative adds 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/update-installed-items
    Call log:
      - navigating to "http://localhost:4321/guides/update-installed-items", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:385:26

    Error Context: test-results/sprint-06-guides-boundary--45794-short-name-or-relative-adds-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--45794-short-name-or-relative-adds-chromium-nojs/error-context.md

  35) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:426:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-3 customize-rendering documents both seams once and the message page seam Callout links it, never the old theming anchors 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/customize-rendering
    Call log:
      - navigating to "http://localhost:4321/guides/customize-rendering", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:429:26

    Error Context: test-results/sprint-06-guides-boundary--c0698-ver-the-old-theming-anchors-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--c0698-ver-the-old-theming-anchors-chromium-nojs/error-context.md

  36) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:465:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-4 preview-on-device opens from the index click, scopes Expo Go vs the four dev-client items, one goal sentence, no supported-in-Expo-Go pairing 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:468:9

    Error Context: test-results/sprint-06-guides-boundary--2f093-upported-in-Expo-Go-pairing-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--2f093-upported-in-Expo-Go-pairing-chromium-nojs/error-context.md

  37) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:512:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-1 troubleshooting has exactly four Symptom/Cause/Fix entries, no stubs, and exactly one index anchor 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/troubleshooting
    Call log:
      - navigating to "http://localhost:4321/guides/troubleshooting", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:515:26

    Error Context: test-results/sprint-06-guides-boundary--3dc75-nd-exactly-one-index-anchor-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3dc75-nd-exactly-one-index-anchor-chromium-nojs/error-context.md

  38) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:545:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-2 the dependency-panel footer Callout links troubleshooting and the registry, and installation links the guide 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/components/message
    Call log:
      - navigating to "http://localhost:4321/components/message", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:549:26

    Error Context: test-results/sprint-06-guides-boundary--0d19f-nstallation-links-the-guide-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--0d19f-nstallation-links-the-guide-chromium-nojs/error-context.md

  39) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:584:1 › FLOW-DOCS-03-five-guides-index GBC-009/AC-1 the five guides publish at /guides/slug with h1 equal to frontmatter title, no /docs aliases, no /guides/guides hrefs 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides/re-theme
    Call log:
      - navigating to "http://localhost:4321/guides/re-theme", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:590:25

    Error Context: test-results/sprint-06-guides-boundary--471da-ases-no-guides-guides-hrefs-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--471da-ases-no-guides-guides-hrefs-chromium-nojs/error-context.md

  40) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:627:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-1 the single index list holds exactly the five destinations, each description equal to its destination meta description 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:630:26

    Error Context: test-results/sprint-06-guides-boundary--3d87d-estination-meta-description-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--3d87d-estination-meta-description-chromium-nojs/error-context.md

  41) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:665:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-3 the five rows are relative LI touch targets of 44px with an absolute stretch, and no nested anchors in the raw HTML 

    AggregateError: apiRequestContext.get: connect ECONNREFUSED ::1:4321
    connect ECONNREFUSED 127.0.0.1:4321
    Call log:
      - → GET http://localhost:4321/guides
        - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.12 Safari/537.36
        - accept: */*
        - accept-encoding: gzip,deflate,br

        at apiRequestContext.get: connect ECONNREFUSED ::1:4321
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:669:29

    Error Context: test-results/sprint-06-guides-boundary--774c1-ted-anchors-in-the-raw-HTML-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--774c1-ted-anchors-in-the-raw-HTML-chromium-nojs/error-context.md

  42) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:723:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-1 the shell renders the Guides masthead, one All guides header whose chip equals the row count, and no ToC 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:726:26

    Error Context: test-results/sprint-06-guides-boundary--9ad23-ls-the-row-count-and-no-ToC-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--9ad23-ls-the-row-count-and-no-ToC-chromium-nojs/error-context.md

  43) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:767:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-3 the short index serves the entry list with neither ToC form 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:770:26

    Error Context: test-results/sprint-06-guides-boundary--31fc0--list-with-neither-ToC-form-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--31fc0--list-with-neither-ToC-form-chromium-nojs/error-context.md

  44) [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:785:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-4 at a 393px viewport the section index is single-track, the docs nav is a visible 44px touch surface, and nothing overflows 

    Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/guides
    Call log:
      - navigating to "http://localhost:4321/guides", waiting until "load"


       at harness/docs-preview.ts:44

      42 |     throw new Error(`refusing non-localhost navigation: ${url.href}`);
      43 |   }
    > 44 |   return page.goto(url.href);
         |               ^
      45 | }
      46 |
      47 | /**
        at navigateLocalhost (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/harness/docs-preview.ts:44:15)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-010/tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:791:26

    Error Context: test-results/sprint-06-guides-boundary--13364-rface-and-nothing-overflows-chromium-nojs/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--13364-rface-and-nothing-overflows-chromium-nojs/error-context.md

  44 failed
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:220:1 › FLOW-DOCS-03-five-guides-index AC-1 the guides index responds 200 with exactly five rows whose titles equal their destinations' h1, under an All guides header counting 5 and no ToC rail 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:273:1 › FLOW-DOCS-03-five-guides-index AC-2 every guides-index row href is a distinct /guides/ path answering 200 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:306:1 › FLOW-DOCS-03-five-guides-index AC-3 the row href set is exactly the five launch guides with no porting, engine or theming row 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:346:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-1 re-theme returns 200 with oklch and @theme, one goal sentence, a theming link out, and exactly one index anchor 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:382:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-2 update-installed-items carries the literal absolute-URL add command, no short-name or relative adds 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:465:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-4 preview-on-device opens from the index click, scopes Expo Go vs the four dev-client items, one goal sentence, no supported-in-Expo-Go pairing 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:512:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-1 troubleshooting has exactly four Symptom/Cause/Fix entries, no stubs, and exactly one index anchor 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:545:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-2 the dependency-panel footer Callout links troubleshooting and the registry, and installation links the guide 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:584:1 › FLOW-DOCS-03-five-guides-index GBC-009/AC-1 the five guides publish at /guides/slug with h1 equal to frontmatter title, no /docs aliases, no /guides/guides hrefs 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:627:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-1 the single index list holds exactly the five destinations, each description equal to its destination meta description 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:665:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-3 the five rows are relative LI touch targets of 44px with an absolute stretch, and no nested anchors in the raw HTML 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:723:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-1 the shell renders the Guides masthead, one All guides header whose chip equals the row count, and no ToC 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:767:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-3 the short index serves the entry list with neither ToC form 
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:785:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-4 at a 393px viewport the section index is single-track, the docs nav is a visible 44px touch surface, and nothing overflows 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:220:1 › FLOW-DOCS-03-five-guides-index AC-1 the guides index responds 200 with exactly five rows whose titles equal their destinations' h1, under an All guides header counting 5 and no ToC rail 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:273:1 › FLOW-DOCS-03-five-guides-index AC-2 every guides-index row href is a distinct /guides/ path answering 200 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:306:1 › FLOW-DOCS-03-five-guides-index AC-3 the row href set is exactly the five launch guides with no porting, engine or theming row 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:346:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-1 re-theme returns 200 with oklch and @theme, one goal sentence, a theming link out, and exactly one index anchor 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:382:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-2 update-installed-items carries the literal absolute-URL add command, no short-name or relative adds 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:426:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-3 customize-rendering documents both seams once and the message page seam Callout links it, never the old theming anchors 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:465:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-4 preview-on-device opens from the index click, scopes Expo Go vs the four dev-client items, one goal sentence, no supported-in-Expo-Go pairing 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:512:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-1 troubleshooting has exactly four Symptom/Cause/Fix entries, no stubs, and exactly one index anchor 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:545:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-2 the dependency-panel footer Callout links troubleshooting and the registry, and installation links the guide 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:584:1 › FLOW-DOCS-03-five-guides-index GBC-009/AC-1 the five guides publish at /guides/slug with h1 equal to frontmatter title, no /docs aliases, no /guides/guides hrefs 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:627:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-1 the single index list holds exactly the five destinations, each description equal to its destination meta description 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:665:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-3 the five rows are relative LI touch targets of 44px with an absolute stretch, and no nested anchors in the raw HTML 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:723:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-1 the shell renders the Guides masthead, one All guides header whose chip equals the row count, and no ToC 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:767:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-3 the short index serves the entry list with neither ToC form 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:785:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-4 at a 393px viewport the section index is single-track, the docs nav is a visible 44px touch surface, and nothing overflows 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:220:1 › FLOW-DOCS-03-five-guides-index AC-1 the guides index responds 200 with exactly five rows whose titles equal their destinations' h1, under an All guides header counting 5 and no ToC rail 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:273:1 › FLOW-DOCS-03-five-guides-index AC-2 every guides-index row href is a distinct /guides/ path answering 200 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:306:1 › FLOW-DOCS-03-five-guides-index AC-3 the row href set is exactly the five launch guides with no porting, engine or theming row 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:346:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-1 re-theme returns 200 with oklch and @theme, one goal sentence, a theming link out, and exactly one index anchor 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:382:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-2 update-installed-items carries the literal absolute-URL add command, no short-name or relative adds 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:426:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-3 customize-rendering documents both seams once and the message page seam Callout links it, never the old theming anchors 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:465:1 › FLOW-DOCS-03-five-guides-index GBC-001/AC-4 preview-on-device opens from the index click, scopes Expo Go vs the four dev-client items, one goal sentence, no supported-in-Expo-Go pairing 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:512:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-1 troubleshooting has exactly four Symptom/Cause/Fix entries, no stubs, and exactly one index anchor 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:545:1 › FLOW-DOCS-03-five-guides-index GBC-002/AC-2 the dependency-panel footer Callout links troubleshooting and the registry, and installation links the guide 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:584:1 › FLOW-DOCS-03-five-guides-index GBC-009/AC-1 the five guides publish at /guides/slug with h1 equal to frontmatter title, no /docs aliases, no /guides/guides hrefs 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:627:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-1 the single index list holds exactly the five destinations, each description equal to its destination meta description 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:665:1 › FLOW-DOCS-03-five-guides-index GBC-015/AC-3 the five rows are relative LI touch targets of 44px with an absolute stretch, and no nested anchors in the raw HTML 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:723:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-1 the shell renders the Guides masthead, one All guides header whose chip equals the row count, and no ToC 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:767:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-3 the short index serves the entry list with neither ToC form 
    [chromium-nojs] › tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts:785:1 › FLOW-DOCS-03-five-guides-index GBC-016/AC-4 at a 393px viewport the section index is single-track, the docs nav is a visible 44px touch surface, and nothing overflows 
  1 passed (1.5m)
@@GATE-EXIT=1@@
