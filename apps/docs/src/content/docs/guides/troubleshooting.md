---
title: 'Troubleshooting'
description: 'Four symptom-cause-fix entries for failed installs: web components from short names, missing styles from the wrong engine tree, Expo Go crashes on dev-client items, and the renamed Streamdown streaming option.'
section: 'guides'
order: 5
---

This guide shows you how to recover from the four failures installers hit most often. Each entry states one symptom, names the cause, and gives one fix, then links the page that owns the topic.

## The installed item is a web component

**Symptom**

The file the CLI wrote does not look like React Native source. It carries `className` where React Native expects `style`, and `onClick` where it expects `onPress`, and it names DOM elements React Native cannot render.

**Cause**

The add command named a bare item instead of a URL. A short name resolves against the shadcn web registry, which serves the React DOM component of that name — not this registry's React Native item.

**Fix**

Delete the web files the CLI wrote, then re-add the item by its absolute URL on this registry, with your engine tree in the path — for example `https://rnraielements.com/r/uniwind/conversation.json`. The [CLI](/docs/cli) page states the full URL contract.

## Styles are missing after install

**Symptom**

The item renders and responds, but unstyled: no colors, no spacing, no typography. The screen never reports an error — the styles are absent.

**Cause**

The install URL named the wrong engine tree. A project on Tailwind v4 with Uniwind that installs from the nativewind engine tree gets code compiled for NativeWind 4.2.6 on Tailwind v3, and your compiler drops the classes it does not recognize instead of erroring. The missing styles are the only signal.

**Fix**

Re-add the item from the engine tree that matches your project. Read your `package.json`: a `uniwind` dependency means the uniwind tree, a `nativewind` dependency means the nativewind tree. Run the add command with the corrected URL and answer `y` at the overwrite prompt, or append `--overwrite` — [Installation](/docs/installation) walks the engine decision, and [Update installed items](/guides/update-installed-items) covers the prompt.

## The app crashes in Expo Go

**Symptom**

The app quits or throws a native-module error in Expo Go the moment a screen loads one of the four opt-in items: enriched markdown, streamdown, speech recognition, or extended audio.

**Cause**

Those four items load native modules Expo Go cannot load. `react-native-enriched-markdown` is a Fabric native module absent from Expo 57's bundled list; `react-native-streamdown`, `expo-speech-recognition`, and extended audio's capture surface all reach beyond what Expo Go bundles.

**Fix**

Preview these items in a dev client — a development build of your app that includes the native modules. [Preview on a device](/guides/preview-on-device) lists the peers and platform permissions each item brings before you build one.

## Markdown streaming crashes

**Symptom**

Messages crash the app as soon as markdown starts streaming through your Streamdown-backed `renderMarkdown` renderer.

**Cause**

Your Streamdown configuration still names the `workletizableModules` option. The upstream package renamed that option to `importForwarding.moduleNames`; the stale spelling is silently ignored, and all markdown streaming crashes.

**Fix**

List the forwarded modules under `importForwarding.moduleNames` in your Streamdown configuration — the option name the upstream package now reads. The [Streamdown](/components/streamdown) page collects the dependency's peers, permissions, and Expo Go verdict.
