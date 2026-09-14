#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

if ! command -v go >/dev/null 2>&1; then
  echo "Installing Righthook requires Go 1.24.11 or newer. Install Go, then run pnpm hooks:install." >&2
  exit 1
fi

# Pin the upstream release and keep the binary local to this checkout.
GOBIN="$PWD/node_modules/.bin" go install github.com/almeidazs/righthook@v0.0.1-beta
./node_modules/.bin/righthook list --json >/dev/null
hook_path="$(git rev-parse --git-path hooks/pre-commit)"
common_git_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
if [[ ! -e "$hook_path" && ! -L "$hook_path" ]]; then
  ./node_modules/.bin/righthook install --hook pre-commit \
    --path "$common_git_dir" --config "$PWD/righthook.yml"
fi
# Upstream install refuses even its own existing hook. Validate, never overwrite.
# The common Git directory keeps installation correct from linked worktrees.
./node_modules/.bin/righthook policy check \
  --path "$common_git_dir" --config "$PWD/righthook.yml"
if [[ ! -x "$hook_path" ]]; then
  echo "The pre-commit hook is missing or not executable: $hook_path" >&2
  exit 1
fi
