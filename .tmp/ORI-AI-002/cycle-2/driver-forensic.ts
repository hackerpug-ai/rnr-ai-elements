import { readFileSync } from 'node:fs';
import { runLiveExampleProof } from '/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AI-002/tests/sprint-05-orient-search/support/live-example-proof.test.ts';
import { launchOwnedBackend } from '/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AI-002/tests/sprint-05-orient-search/support/live-backend';
const backend = await launchOwnedBackend({ host: '127.0.0.1', port: 4000, model: 'gpt-4.1-mini-2025-04-14', maxOutputTokens: 4096 });
console.log('backend up:', backend.started);
try {
  const result = await runLiveExampleProof({
    platforms: ['ios'],
    runId: 'ORI-AI-002-FORENSIC',
    backend,
    outputDir: '/tmp/driver-forensic-out',
    sourceSha: (await import('node:crypto')).createHash('sha256').update(readFileSync('/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AI-002/apps/example/app/live-chat.tsx', 'utf8')).digest('hex'),
  });
  console.log('driver returned:', result.completed, result.legs.map((l: { platform: string; status: string }) => `${l.platform}:${l.status}`).join(','));
} catch (error) {
  console.log('DRIVER THREW:', error instanceof Error ? error.stack?.split('\n').slice(0, 4).join('\n') : String(error));
} finally {
  await backend.stop();
}
