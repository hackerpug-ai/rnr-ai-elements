---
title: 'CLI'
description: 'The registry URL and destination contract: absolute HTTPS item URLs per engine tree, and the consumer files an install writes.'
section: 'getting-started'
order: 3
---

This page is the reference for this registry's install contract: which URL to add, and which files the operation writes. It does not cover the upstream CLI's full command catalog — the RNR CLI reference is the authoritative documentation for every command and option, linked at the end of this page.

## URL contract

Every registry item resolves to one absolute HTTPS URL on `rnraielements.com`, with the engine tree in the path:

- `/r/nativewind/` — the nativewind engine tree, for projects on NativeWind 4.2.6 with Tailwind v3.
- `/r/uniwind/` — the uniwind engine tree, for projects on Tailwind v4.

An install names a full item URL — `https://rnraielements.com/r/nativewind/conversation.json` is the Conversation item in the nativewind tree. The verified consumer recipes install from these URLs exactly as printed:

```sh
npx --yes @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json
```

The command above is copied from the committed nativewind recipe (`packages/docs-snippets/commands/nativewind.sh`), whose full sequence installs the five required items into a clean Expo project and compiles them.

## Destination contract

An install writes source files into your project; the registry never stays connected at runtime. Each registry item declares its target paths, and the CLI writes them under your project root — Conversation writes `components/ai/conversation.tsx`, and Item writes `components/ui/item.tsx`. Imports inside the installed files resolve through the aliases your project declares in `components.json`, such as `"ui": "@/components/ui"`. After the install, the files belong to you: edit, version, and test them like any other file in your app.

## What this registry is not

Never shorten the command to a bare item name. A short name resolves against the shadcn web registry and installs React DOM components into your React Native project. The engine tree in the URL is also load-bearing: items in the two trees are compiled for their engine, so a `nativewind` URL in a uniwind project installs code styled for the wrong Tailwind major.

For every command and option beyond `add` — `init`, `doctor`, `--styling-library`, logging — read the authoritative [RNR CLI reference](https://reactnativereusables.com/docs/cli). To install your first item with these URLs, follow [Installation](/docs/installation); for the items themselves, browse the [component reference](/components).
