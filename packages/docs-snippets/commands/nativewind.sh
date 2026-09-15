#!/usr/bin/env bash
# NativeWind (Tailwind v3) consumer recipe — install the five required items from the
# canonical public registry into a clean Expo 57 consumer, then compile and verify.
#
# Run with cwd = the consumer root (a copy of packages/docs-snippets/nativewind/).
# This is the exact recipe a learner follows; the proof helper executes it verbatim.
# `npx --yes` only skips npx's own install prompt (assume "y"); the `@latest` and the
# `add <url>` / `doctor --summary` commands themselves are literal.
set -euo pipefail

# 1. Install the pinned dependency tree (creates pnpm-lock.yaml, which the RNR CLI and
#    Expo detect to choose pnpm).
pnpm install

# 2. Reconcile native modules to the fixed Expo 57 pins.
npx expo install

# 3. Literal public install contract — five required items from the canonical registry.
npx --yes @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json
npx --yes @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/message.json https://rnraielements.com/r/nativewind/prompt-input.json https://rnraielements.com/r/nativewind/item.json https://rnraielements.com/r/nativewind/sheet.json

# 4. Verification.
npx expo install --check
npx --yes @react-native-reusables/cli@latest doctor --summary
pnpm exec tsc --noEmit
pnpm exec expo-doctor
