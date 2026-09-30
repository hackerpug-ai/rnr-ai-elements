---
title: 'Preview on a device'
description: 'Run your app with installed items in Expo Go on a physical device, and know which opt-in items need a dev client before they will load.'
section: 'guides'
order: 3
---

This guide shows you how to preview installed items on a physical device through Expo Go, with no native build.

## Prerequisites

Before you start:

- An Expo project with at least one item installed ([Installation](/docs/installation)).
- Expo Go on your device: the App Store on iOS, or the Play Store on Android.
- Your phone and your computer on the same network.

## Start the dev server and open the app

1. Run `npx expo start` at your project root. You should see `Starting Metro Bundler` and the dev-server URL in the output, and a QR code when your terminal can draw one.
2. Open Expo Go on your phone and scan the QR code, or type the URL Expo printed. The bundle builds for a moment, then your app opens in Expo Go.
3. Walk the screen that renders your installed item. The transcript, the prompt input, and the tool surfaces render and respond to touch, and streaming text updates live.

## What runs in Expo Go

The core chat and agent surface runs in Expo Go: conversation, message, prompt-input, tool, and the other core items load no native module beyond what Expo Go bundles. Markdown stays plain text unless you inject a JavaScript renderer — [Customize rendering](/guides/customize-rendering) shows how.

## What needs a dev client

Four opt-in items load native modules Expo Go cannot, so each requires a dev client — a development build of your app:

- Enriched markdown — `react-native-enriched-markdown`, a Fabric native module absent from Expo 57's bundled list.
- Streamdown — `react-native-streamdown`.
- Speech recognition — `expo-speech-recognition`.
- Extended audio — `expo-audio`.

The dev-client matrix on the [Installation](/docs/installation) page lists the peers and the platform permissions each of these items brings. Install the peers, declare the permissions, and build a dev client before you preview them.

## Next steps

- Keep items current: [Update installed items](/guides/update-installed-items)
- The markdown seam behind the plain-text default: [Customize rendering](/guides/customize-rendering)
