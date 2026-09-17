---
title: 'Introduction'
description: 'What RNR AI Elements is: universal AI chat and agent UI components for React Native, delivered as a copy-paste registry instead of an npm package.'
section: 'getting-started'
order: 1
---

RNR AI Elements provides universal AI chat and agent UI components for React Native. One set of components covers iOS, Android, and Web, so the same chat surface ships on every platform. The library is distributed as a copy-paste registry: you run one command, the item's source is copied into your project, and the code becomes yours to read and edit. It is not an npm package — you never add a runtime dependency, and no part of the library loads from `node_modules`.

This page explains what the library is and how it reaches your app. It does not cover install commands ([Installation](/docs/installation)), the URL and destination contract ([CLI](/docs/cli)), or the token system ([Theming](/docs/theming)).

## What you receive

The library ships chat-surface compositions: the conversation list, messages with streaming-friendly markdown, the prompt input with attachments, reasoning disclosures, and tool cards. Each of these is a registry item — a shippable unit you install on its own. Items group into seven families, such as conversation, message, and prompt input, and every item is prop-driven: you pass data in, the item renders.

The items build on React Native Reusables (RNR) primitives, so buttons, icons, and sheets come from the same base library with the same theming approach. Everything renders with your theme tokens — the registry items ship no colors of their own.

## How the code reaches your app

A registry is a server that hands out source files; this one lives at `https://rnraielements.com`. You pick an engine — nativewind or uniwind, matching the Tailwind setup your project already uses — and run the install command for that engine tree. The command writes real `.tsx` files into your source tree, resolved through your project's `components.json` aliases.

Because the files are copied rather than imported, an update is a deliberate act: you re-run the command, review the diff, and commit it. Nothing in your app calls back to the registry at runtime.

## Who owns what

The registry items own the visible chat surface. Your app owns everything around the model: transcript state, transport, and tool execution stay in your code, and the items re-render from the props you pass. [What the library owns](/docs/owns-vs-does-not-own) explains the full split and what it costs you in Expo Go.

## Where to go next

- Install your first registry item: [Installation](/docs/installation)
- Look up the URL and destination contract: [CLI](/docs/cli)
- Browse every family and registry item: [Component reference](/components)
