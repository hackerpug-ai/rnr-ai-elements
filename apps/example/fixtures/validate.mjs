// Shape proof for transcript.json (TASK-F5 AC-4): validates the fixture against
// ai@7.0.89's own uiMessagesSchema via the SDK's validateUIMessages — roles, part
// discriminants, and the tool-state union. This is the check resolveJsonModule and
// the `as UIMessage[]` cast in app/index.tsx cannot provide: tsc never inspects the
// JSON's shape, so this validator is the committed proof the fixture satisfies the
// real UIMessage type, not merely that it parses as JSON.
// Usage: node fixtures/validate.mjs [fixture.json]   (default: transcript.json here)
import { safeValidateUIMessages } from 'ai';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturePath =
  process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), 'transcript.json');
const { messages } = JSON.parse(readFileSync(fixturePath, 'utf8'));

const result = await safeValidateUIMessages({ messages });
if (!result.success) {
  console.error(`INVALID fixture (${fixturePath}): ${result.error.message}`);
  process.exit(1);
}
console.log(
  `VALID: ${result.data.length} message(s) in ${fixturePath} satisfy ai@7.0.89's uiMessagesSchema`,
);
