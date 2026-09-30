@@RUN-FLOW flow=journeys/docs-integrator-arc sprint=sprint-06-guides-boundary-changelog expect=red cmd_sha=0844725c85a6fabde598942eb7ab618586ed081f060508710a5be08dc57cd0cb head=53ad890807079e0afdc256f602455bebaaf56949+dirty at=2026-09-30T04:38:49Z@@
+ pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts --grep journeys/docs-integrator-arc --project=chromium-desktop --project=chromium-mobile

> @rnr-ai-elements/docs@0.1.0 build /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs
> pnpm -w run registry:build && pnpm -w run gallery:manifest && pnpm run prebuild && pnpm run check:snippets && astro build && pnpm run search:index && pnpm run check:links


> rnr-ai-elements@0.2.1 registry:build /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base
> tsx packages/registry/scripts/build-registry.ts

registry built — 56 item(s) x 2 engine(s) = 112 file(s) under public/r/

> rnr-ai-elements@0.2.1 gallery:manifest /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base
> tsx scripts/build-gallery-manifest.ts

gallery manifest — 56 item(s) (3 kinds) -> apps/example/gallery/manifest.ts, apps/docs/src/data/gallery-manifest.json

> @rnr-ai-elements/docs@0.1.0 prebuild /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs
> tsx ../../scripts/docs-data/prebuild.ts

[docs-data] prebuild: 56 items; props resolved for 39/39 component items; 9 families; public/r copy 114 files; site-facts aiSdkPeers ai@^7.0.89, @ai-sdk/react@^4.0.92

> @rnr-ai-elements/docs@0.1.0 check:snippets /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs
> tsx ../../scripts/docs-data/authored-snippets.ts

{
  "ok": true,
  "root": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base",
  "docsRoot": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/src/content/docs",
  "documents": [
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/src/content/docs/cli.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/src/content/docs/dark-mode.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/src/content/docs/installation.mdx",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/src/content/docs/introduction.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/src/content/docs/owns-vs-does-not-own.md",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/src/content/docs/quickstart.mdx",
    "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/src/content/docs/theming.mdx"
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
    "shell": 1,
    "ts": 2,
    "tsx": 4,
    "css": 1,
    "configuration": 16
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
      "cwd": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-nativewind-case-VTwAm5",
      "config": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/nativewind-bf4f7977c6d0f6e4/tsconfig.json",
      "args": [
        "--noEmit"
      ],
      "exit": 0,
      "durationMs": 791,
      "typescriptVersion": "6.0.3"
    },
    {
      "engine": "uniwind",
      "executable": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/uniwind-f49305e2646283ff/node_modules/.bin/tsc",
      "cwd": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-uniwind-case-FegG18",
      "config": "/Users/justinrich/.cache/agent-scratch/ori-ast-005-consumers/uniwind-f49305e2646283ff/tsconfig.json",
      "args": [
        "--noEmit"
      ],
      "exit": 0,
      "durationMs": 886,
      "typescriptVersion": "6.0.3"
    },
    {
      "engine": "live-chat",
      "executable": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/example/node_modules/.bin/tsc",
      "cwd": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/example",
      "config": "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/example/tsconfig.live-chat.json",
      "args": [
        "-p",
        "tsconfig.live-chat.json"
      ],
      "exit": 0,
      "durationMs": 1414,
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
22:39:28 [content] Syncing content
22:39:28 [content] Synced content
22:39:28 [types] Generated 350ms
22:39:28 [build] output: "static"
22:39:28 [build] mode: "static"
22:39:28 [build] directory: /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/dist/
22:39:28 [build] Collecting build info...
22:39:28 [build] ✓ Completed in 390ms.
22:39:28 [build] Building static entrypoints...
22:39:29 [vite] ✓ built in 413ms
22:39:29 [vite] ✓ built in 45ms
22:39:29 [build] Rearranging server assets...

 generating static routes 
22:39:29   ├─ /404.html (+12ms) 
22:39:29   ├─ /components/streamdown/index.html (+2ms) 
22:39:29   ├─ /components/shimmer/index.html (+5ms) 
22:39:29   ├─ /components/checkpoint/index.html (+2ms) 
22:39:29   ├─ /components/image/index.html (+2ms) 
22:39:29   ├─ /components/persona/index.html (+2ms) 
22:39:29   ├─ /components/speech-input/index.html (+2ms) 
22:39:29   ├─ /components/kbd/index.html (+1ms) 
22:39:29   ├─ /components/breadcrumb/index.html (+1ms) 
22:39:29   ├─ /components/button-group/index.html (+1ms) 
22:39:29   ├─ /components/slider/index.html (+1ms) 
22:39:29   ├─ /components/table/index.html (+1ms) 
22:39:29   ├─ /components/command/index.html (+1ms) 
22:39:29   ├─ /components/mono/index.html (+1ms) 
22:39:29   ├─ /components/markdown/index.html (+1ms) 
22:39:29   ├─ /components/code-block/index.html (+1ms) 
22:39:29   ├─ /components/conversation/index.html (+1ms) 
22:39:29   ├─ /components/message/index.html (+1ms) 
22:39:29   ├─ /components/prompt-input/index.html (+1ms) 
22:39:29   ├─ /components/empty/index.html (+1ms) 
22:39:29   ├─ /components/item/index.html (+1ms) 
22:39:29   ├─ /components/input-group/index.html (+1ms) 
22:39:29   ├─ /components/sheet/index.html (+1ms) 
22:39:29   ├─ /components/suggestion/index.html (+1ms) 
22:39:29   ├─ /components/status/index.html (+1ms) 
22:39:29   ├─ /components/reasoning-lifecycle/index.html (+1ms) 
22:39:29   ├─ /components/tool/index.html (+1ms) 
22:39:29   ├─ /components/reasoning/index.html (+1ms) 
22:39:29   ├─ /components/task/index.html (+1ms) 
22:39:29   ├─ /components/question/index.html (+1ms) 
22:39:29   ├─ /components/agent/index.html (+1ms) 
22:39:29   ├─ /components/chain-of-thought/index.html (+1ms) 
22:39:29   ├─ /components/plan/index.html (+1ms) 
22:39:29   ├─ /components/confirmation/index.html (+1ms) 
22:39:29   ├─ /components/queue/index.html (+1ms) 
22:39:29   ├─ /components/url/index.html (+1ms) 
22:39:29   ├─ /components/sources/index.html (+1ms) 
22:39:29   ├─ /components/inline-citation/index.html (+1ms) 
22:39:29   ├─ /components/artifact/index.html (+1ms) 
22:39:29   ├─ /components/snippet/index.html (+1ms) 
22:39:29   ├─ /components/commit/index.html (+1ms) 
22:39:29   ├─ /components/attachments/index.html (+1ms) 
22:39:29   ├─ /components/context/index.html (+1ms) 
22:39:29   ├─ /components/open-in-chat/index.html (+1ms) 
22:39:29   ├─ /components/model-selector/index.html (+1ms) 
22:39:29   ├─ /components/mic-selector/index.html (+1ms) 
22:39:29   ├─ /components/voice-selector/index.html (+1ms) 
22:39:29   ├─ /components/audio-player/index.html (+1ms) 
22:39:29   ├─ /components/transcription/index.html (+1ms) 
22:39:29   ├─ /components/terminal/index.html (+1ms) 
22:39:29   ├─ /components/file-tree/index.html (+4ms) 
22:39:29   ├─ /components/environment-variables/index.html (+2ms) 
22:39:29   ├─ /components/package-info/index.html (+1ms) 
22:39:29   ├─ /components/stack-trace-parser/index.html (+1ms) 
22:39:29   ├─ /components/stack-trace/index.html (+1ms) 
22:39:29   ├─ /components/schema-display/index.html (+10ms) 
22:39:29   ├─ /components/test-results/index.html (+1ms) 
22:39:29   ├─ /components/web-preview/index.html (+1ms) 
22:39:29   ├─ /components/index.html (+3ms) 
22:39:29   ├─ /docs/theming/index.html (+4ms) 
22:39:29   ├─ /docs/introduction/index.html (+1ms) 
22:39:29   ├─ /docs/installation/index.html (+1ms) 
22:39:29   ├─ /docs/quickstart/index.html (+2ms) 
22:39:29   ├─ /docs/cli/index.html (+0ms) 
22:39:29   ├─ /docs/dark-mode/index.html (+0ms) 
22:39:29   ├─ /docs/owns-vs-does-not-own/index.html (+0ms) 
22:39:29   ├─ /islands/copy-button/index.html (+1ms) 
22:39:29   ├─ /registry/index.html (+2ms) 
22:39:29   ├─ /index.html (+1ms) 
22:39:29 ✓ Completed in 169ms.

22:39:29 [build] ✓ Completed in 649ms.
22:39:29 [build] 69 page(s) built in 1.04s
22:39:29 [build] Complete!

> @rnr-ai-elements/docs@0.1.0 search:index /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs
> tsx ../../scripts/docs-data/search-index.ts

[search-index] 63 expected destinations (56 items, 7 docs) derived from the real sources
[search-index] all expected destinations emitted under /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs/dist
Running Pagefind v1.5.2 (Extended)
Running from: "/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base"
Source:       "apps/docs/dist"
Output:       "apps/docs/dist/pagefind"

[Walking source directory]
Found 69 files matching **/*.{html}

[Parsing files]
Found a data-pagefind-body element on the site.
↳ Ignoring pages without this tag.

[Reading languages]
Discovered 1 language: en

[Building search indexes]
Total: 
  Indexed 1 language
  Indexed 64 pages
  Indexed 7272 words
  Indexed 0 filters
  Indexed 0 sorts

Finished in 0.086 seconds
[search-index] index complete: 64 pages cover all 63 expected destinations

> @rnr-ai-elements/docs@0.1.0 check:links /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/apps/docs
> tsx ../../scripts/docs-data/check-dist-links.ts

[docs-data] link-check: warning docs/cli/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/cli.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/dark-mode/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/dark-mode.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/installation/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/installation.mdx: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/introduction/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/introduction.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/owns-vs-does-not-own/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/owns-vs-does-not-own.md: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/quickstart/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/quickstart.mdx: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: warning docs/theming/index.html -> https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/docs/src/content/docs/theming.mdx: external link failed (HTTP 404) (HTTP 404)
[docs-data] link-check: 69 html files, 1698 links (1687 internal, 11 external), 0 error(s), 7 warning(s)

Running 6 tests using 1 worker
F°·°F·

  1) [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts:214:1 › journeys/docs-integrator-arc AC-1 desktop arc: engine pick, quickstart command, registry copy, boundary example-app, and the header's five section links answer 200 

    Error: 'useChat' appears inside a td on the boundary page

    expect(received).toBeGreaterThanOrEqual(expected)

    Expected: >= 1
    Received:    0

      305 |     'the clipboard equals the absolute conversation command after the uniwind pick',
      306 |   ).toBe(CONVERSATION_COMMAND);
    > 307 |   expect(useChatTds, "'useChat' appears inside a td on the boundary page").toBeGreaterThanOrEqual(
          |                                                                            ^
      308 |     1,
      309 |   );
      310 |   expect(exampleAnchorCount, 'exactly 1 anchor matching /example app/i').toBe(1);
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts:307:76

    Error Context: test-results/sprint-06-guides-boundary--5d139-ve-section-links-answer-200-chromium-desktop/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--5d139-ve-section-links-answer-200-chromium-desktop/error-context.md

  2) [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts:357:1 › journeys/docs-integrator-arc AC-1 mobile arc: the same walk through the drawer, whose five section links answer 200 

    Error: exactly 5 anchors in .site-drawer__nav

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 2

      423 |     CONVERSATION_COMMAND,
      424 |   );
    > 425 |   expect(drawerCount, 'exactly 5 anchors in .site-drawer__nav').toBe(5);
          |                                                                 ^
      426 |   expect(drawerTexts, 'drawer link text order').toEqual(SECTION_LABELS);
      427 |   expect(drawerHrefs, 'drawer href order').toEqual(SECTION_HREFS);
      428 |   for (const [href, status] of Object.entries(drawerStatuses)) {
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-014/.tmp/GBC-014/red-base/tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts:425:65

    Error Context: test-results/sprint-06-guides-boundary--7e916-ve-section-links-answer-200-chromium-mobile/error-context.md

    Error Context: test-results/sprint-06-guides-boundary--7e916-ve-section-links-answer-200-chromium-mobile/error-context.md

  2 failed
    [chromium-desktop] › tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts:214:1 › journeys/docs-integrator-arc AC-1 desktop arc: engine pick, quickstart command, registry copy, boundary example-app, and the header's five section links answer 200 
    [chromium-mobile] › tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts:357:1 › journeys/docs-integrator-arc AC-1 mobile arc: the same walk through the drawer, whose five section links answer 200 
  2 skipped
  2 passed (12.3s)
@@GATE-EXIT=1@@
