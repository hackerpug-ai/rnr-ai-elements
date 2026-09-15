---
title: 'Dark mode'
description: 'Who owns a theme choice: your app, through its scheme state and tokens; this site, through its stored choice.'
section: 'getting-started'
order: 4
---

A theme choice has two owners, and they never share state. Your app owns its theme: it tracks the device scheme and hands tokens to every registry item it renders. This site owns its own appearance: it stores one site-wide choice. Reading one tells you nothing about the other.

## Your app owns its theme state

In your app, light or dark is application state. Uniwind exposes the active scheme to your components, and the example app mirrors it into a plain token map: `apps/example/lib/theme.ts` pairs a light and a dark value for every token, and the app's layout hands those values to react-navigation. Registry items stay out of the decision — they render whatever your tokens resolve to. To change how your app looks in the dark, change your tokens or your scheme state, never the items.

## This site stores its own choice

This site resolves its theme before first paint, in one order: your stored choice first — a localStorage key named `rnr-theme` — then your operating system `prefers-color-scheme` setting, then dark. Dark is the site's default: with no stored choice and no scheme preference, the site renders dark. The theme toggle in the site header changes the stored choice, and the next visit remembers it.

## Where to go next

The [Installation](/docs/installation) page and the [CLI](/docs/cli) page cover engine setup. [Theming](/docs/theming) holds the token map and the text and markdown seams.
