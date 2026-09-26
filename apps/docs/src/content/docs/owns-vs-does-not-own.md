---
title: What the library owns
description: What the registry items supply, what your app must supply, and what the optional markdown renderer choice costs in Expo Go.
section: getting-started
order: 50
---

This page explains who supplies what in an RNR AI Elements chat. Read it to
decide which pieces your application must build before any component renders
useful output. It covers the ownership split between the library and your app,
and the consequences of the markdown renderer choice. It does not cover
installation steps or the token system —
[Theming](/docs/theming#rendermarkdown) covers the token system and its
seams.

## What the library supplies

This library supplies AI UI compositions over React Native Reusables (RNR)
primitives. The registry items render the visible chat surface: the
virtualized transcript view, message bubbles, the composer, the reasoning
disclosure, and tool cards. The components are prop-driven and hold no model
state. You copy each registry item into your app's own source tree and style
it with your theme tokens.

## What your app supplies

Your application supplies everything the model interaction needs. Five
responsibilities stay in your code:

- transcript state
- transport
- streaming client
- provider calls
- tool execution

The library makes no provider calls and executes no tools. Your `useChat`
hook, or any state hook you write, owns the transcript and the network. The
components re-render from the props you pass each render.

## The markdown renderer choice

The components that render model output do not bundle a markdown renderer.
`MessageResponse` in the Message registry item and `ReasoningContent` in the
Reasoning registry item both accept a `renderMarkdown` prop. Omit the prop and
each component renders the string as plain Text; supply one and the component
renders your function's output. Half-streamed markdown is repaired before
rendering either way, so incomplete `**bold` never flashes literal asterisks
mid-stream.

The plain-Text core runs in Expo Go with no extra dependency. Expo Go cannot
load the native modules the optional renderers need, so choosing `streamdown`
or `enriched-markdown` introduces a dev client requirement. A dev client is a
development build of your app that includes native modules Expo Go cannot
load.

`enriched-markdown` adds one peer package, `react-native-enriched-markdown`.
`streamdown` adds four peers, among them `react-native-streamdown` itself and
`react-native-worklets`. The exact peers and permissions for both choices are
listed with peers in the [install docs matrix](/components). The
[Message reference](/components/message) documents the full prop list.

## Where to look next

To see how a real consumer installs and composes the items, read the
[example app source (apps/example)](https://github.com/hackerpug-ai/rnr-ai-elements/tree/main/apps/example).
Its `/live-chat` route composes the same registry items around AI SDK v7's
`useChat` hook, streaming from a small server that keeps your provider
credentials off the device — the model-side wiring your app owns under the
split above. To run that screen against the real provider, follow the
verified run guide:
[Run the live chat example (apps/example/docs/live-chat.md)](https://github.com/hackerpug-ai/rnr-ai-elements/blob/main/apps/example/docs/live-chat.md).
For the styling side of the same split, read
[Theming: the renderMarkdown seam](/docs/theming#rendermarkdown).
