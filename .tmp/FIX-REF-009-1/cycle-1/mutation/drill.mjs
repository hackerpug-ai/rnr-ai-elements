// FIX-REF-009-1 AC-2 mutation drill.
//
// Reads REAL built HTML from apps/docs/dist/components/. The conversation
// page has been mutated on disk before this script runs: a literal {engine}
// injected into the install region's substituted command (an engine tab
// failing to substitute — the exact failure mode the guard exists for).
//
// The guard expression below is the committed narrowed clause, replicated
// statement-for-statement (vitest expect -> boolean) from the
// htmlOutsideUsageRegion helper shared by
// tests/sprint-02-shell-hero/item-pages-build.test.ts and
// tests/sprint-02-shell-hero/item-install-copy.spec.ts (both identical).
//
// Exit 0 requires ALL of:
//   T1 teeth:      mutated conversation fails the NARROWED guard, naming it
//   T2 control:    pristine schema-display FAILS the OLD whole-page guard
//   T3 exemption:  pristine schema-display PASSES the NARROWED guard
//   T4 no-false-positive: pristine conversation PASSES the NARROWED guard
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'apps/docs/dist/components');
const read = (name) => readFileSync(join(DIST, name, 'index.html'), 'utf8');

/** The OLD (pre-FIX) whole-page clause. */
function wholePageViolation(html, name) {
  return html.includes('{engine}') ? `${name}: {engine} template` : null;
}

/** The committed NARROWED clause, statement-for-statement. */
function narrowedViolation(html, name) {
  const usageStart = html.indexOf('data-section="usage"');
  if (usageStart === -1) {
    return wholePageViolation(html, name); // expect(html, ...).not.toContain('{engine}')
  }
  const usageEnd = html.indexOf('</section>', usageStart);
  if (usageEnd === -1) return `${name}: usage section must close`;
  const guarded = `${html.slice(0, usageStart)}${html.slice(usageEnd)}`;
  return guarded.includes('{engine}') ? `${name}: {engine} template` : null;
}

const results = [];
function check(id, ok, detail) {
  results.push({ id, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${detail}`);
}

// T1 — teeth on the mutated substituted surface.
const mutated = read('conversation');
const t1 = narrowedViolation(mutated, 'conversation');
check(
  'T1-teeth-mutated-install-surface',
  t1 === 'conversation: {engine} template',
  `narrowed guard verdict on mutated conversation: ${JSON.stringify(t1)}`,
);
check(
  'T1b-mutation-present-on-disk',
  mutated.includes('/r/{engine}/conversation.json'),
  'mutated install command carries the literal {engine}',
);

// T2 — the old whole-page guard really does fail on the sanctioned literal.
const schema = read('schema-display');
const t2 = wholePageViolation(schema, 'schema-display');
check(
  'T2-control-old-guard-fails',
  t2 === 'schema-display: {engine} template',
  `old whole-page guard verdict on pristine schema-display: ${JSON.stringify(t2)}`,
);

// T3 — the narrowed guard passes the page that forced this FIX.
const t3 = narrowedViolation(schema, 'schema-display');
check(
  'T3-exemption-schema-display-passes',
  t3 === null,
  `narrowed guard verdict on pristine schema-display: ${JSON.stringify(t3)}`,
);
check(
  'T3b-literal-verified-inside-usage-region',
  schema.includes('data-section="usage"') && schema.includes('{engine}'),
  'pristine schema-display carries both the usage region and the sanctioned literal',
);

// T4 — no false positive on a clean page.
const conversation = readFileSync(
  join(process.cwd(), '.tmp/FIX-REF-009-1/cycle-1/mutation/conversation.pristine.html'),
  'utf8',
);
const t4 = narrowedViolation(conversation, 'conversation');
check(
  'T4-pristine-conversation-passes',
  t4 === null,
  `narrowed guard verdict on pristine conversation: ${JSON.stringify(t4)}`,
);

if (results.some((r) => !r.ok)) {
  console.error('DRILL FAILED');
  process.exit(1);
}
console.log('DRILL OK — all four checks hold');
