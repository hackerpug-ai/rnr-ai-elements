set -u
cd /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-011
E=.tmp/GBC-011/cycle-1/green
GUIDES=apps/docs/src/content/docs/guides
SIXTH=$GUIDES/migrating-from-v0.md
HOLD=$(mktemp -d)

cat > "$SIXTH" <<'MD'
---
title: 'Migrating from v0'
description: 'Drill fixture for the five-page launch cap gate; never published.'
section: 'guides'
order: 6
---

This fixture exists only to prove the cap gate rejects a sixth guides-section entry.
MD
rm -rf apps/docs/node_modules/.astro
pnpm --filter @rnr-ai-elements/docs build > "$E/sixth-guide-rejection-output.txt" 2>&1
echo "sixth-guide full-chain exit: $?" >> "$E/sixth-guide-rejection-output.txt"
rm -f "$SIXTH"
echo "git status after sixth restore: [$(/usr/bin/git status --porcelain apps/docs/src/content/docs/guides)]" >> "$E/sixth-guide-rejection-output.txt"

cat > "$SIXTH" <<'MD'
---
title: 'Migrating from v0'
description: 'Drill fixture for the five-page launch cap gate; never published.'
section: 'guides'
order: 6
---

This fixture exists only to prove the cap gate rejects a sixth guides-section entry.
MD
rm -rf apps/docs/node_modules/.astro
pnpm --filter @rnr-ai-elements/docs exec astro build > "$E/astro-alone-rejection-output.txt" 2>&1
echo "astro-alone exit: $?" >> "$E/astro-alone-rejection-output.txt"
rm -f "$SIXTH"
echo "git status after astro-alone restore: [$(/usr/bin/git status --porcelain apps/docs/src/content/docs/guides)]" >> "$E/astro-alone-rejection-output.txt"

mv "$GUIDES/preview-on-device.md" "$HOLD/preview-on-device.md"
rm -rf apps/docs/node_modules/.astro
pnpm --filter @rnr-ai-elements/docs build > "$E/four-guide-rejection-output.txt" 2>&1
echo "four-guide exit: $?" >> "$E/four-guide-rejection-output.txt"
mv "$HOLD/preview-on-device.md" "$GUIDES/preview-on-device.md"
rmdir "$HOLD"
echo "git status after four-guide restore: [$(/usr/bin/git status --porcelain apps/docs/src/content/docs/guides)]" >> "$E/four-guide-rejection-output.txt"

pnpm --filter @rnr-ai-elements/docs build > "$E/five-guide-build-output.txt" 2>&1
echo "five-guide exit: $?" >> "$E/five-guide-build-output.txt"
