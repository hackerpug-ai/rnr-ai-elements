import { readFileSync } from 'node:fs';
import { buildNativeWindConsumer } from '/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AI-002/tests/sprint-05-orient-search/support/nativewind-live-example';
const manifest = JSON.parse(
  readFileSync('tests/sprint-05-orient-search/nativewind-live-source-manifest.json', 'utf8'),
);
const c = buildNativeWindConsumer(manifest);
console.log('ROOT=' + c.root);
console.log('tsc=' + c.tsc.exit, 'doctor=' + c.expoDoctor.exit, 'script=' + c.scriptExit);
