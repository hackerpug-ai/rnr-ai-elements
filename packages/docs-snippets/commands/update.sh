#!/usr/bin/env bash
# Update recipe — bring an installed item back in sync with the canonical public
# registry. Run with cwd = an EXISTING nativewind consumer root (a copy of
# packages/docs-snippets/nativewind/ with items already installed).
#
# Verified live against rnraielements.com (2026-09-29):
#   - A file identical to its registry copy is skipped silently.
#   - A file that differs prompts: "The file <name> already exists. Would you
#     like to overwrite? (y/N)" — the default N keeps your local edit.
#   - --overwrite updates differing files without prompting.
# Automation may prepend `--yes` to skip npx's own install prompt only; the
# `add <url>` commands themselves are literal.
set -euo pipefail

# 1. Re-run the identical add: review each differing file at the prompt.
# 2. Add --overwrite to take the registry copy over your edits, unprompted.
npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/item.json
npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/item.json --overwrite

# 3. Confirm the tree still compiles after the update.
pnpm exec tsc --noEmit
