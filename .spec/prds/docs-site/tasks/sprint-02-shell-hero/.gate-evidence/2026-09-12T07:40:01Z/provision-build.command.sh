cd /Users/justinrich/Projects/rnr-ai-elements && ( pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build ) > /Users/justinrich/Projects/rnr-ai-elements/.spec/prds/docs-site/tasks/sprint-02-shell-hero/.gate-evidence/2026-09-12T07:40:01Z/provision-build.raw 2>&1
EC=$?
tee -a /Users/justinrich/Projects/rnr-ai-elements/.spec/prds/docs-site/tasks/sprint-02-shell-hero/.gate-evidence/2026-09-12T07:40:01Z/provision-build.log < /Users/justinrich/Projects/rnr-ai-elements/.spec/prds/docs-site/tasks/sprint-02-shell-hero/.gate-evidence/2026-09-12T07:40:01Z/provision-build.raw
echo "@@GATE-EXIT=$EC@@" >> /Users/justinrich/Projects/rnr-ai-elements/.spec/prds/docs-site/tasks/sprint-02-shell-hero/.gate-evidence/2026-09-12T07:40:01Z/provision-build.log
printf "%s" "$EC" > /Users/justinrich/Projects/rnr-ai-elements/.spec/prds/docs-site/tasks/sprint-02-shell-hero/.gate-evidence/2026-09-12T07:40:01Z/provision-build.exit
rm -f /Users/justinrich/Projects/rnr-ai-elements/.spec/prds/docs-site/tasks/sprint-02-shell-hero/.gate-evidence/2026-09-12T07:40:01Z/provision-build.raw
