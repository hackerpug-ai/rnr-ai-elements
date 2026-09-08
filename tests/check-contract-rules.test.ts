import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Negative controls for the web-only-construct checks in the styling contract.
 * A forbidden pattern that matches nothing — or worse, fires on React
 * Native's own props — is a gate with no teeth. Each case below proves the
 * regex catches a real violation AND ignores the sanctioned shape it must
 * not flag (comments documenting the web original, RN-shared prop names).
 *
 * The contract (design/research/styling/rnr-dual-engine-registry.md) stays the
 * single source of truth; this test extracts its checks by id and runs them
 * against known-good and known-bad lines.
 */
const CONTRACT = 'design/research/styling/rnr-dual-engine-registry.md';

function checkRegex(id: string): RegExp {
  const md = readFileSync(CONTRACT, 'utf8');
  const blocks = [...md.matchAll(/```json\s*\n([\s\S]*?)\n```/g)].map((m) => m[1]);
  for (const b of blocks.reverse()) {
    try {
      const parsed = JSON.parse(b);
      const entry = parsed.forbiddenPatterns?.find((c: { id: string }) => c.id === id);
      if (entry) return new RegExp(entry.regex);
    } catch {
      /* try the next block */
    }
  }
  throw new Error(`check "${id}" not found in the styling contract`);
}

const WEB_ONLY_IDS = [
  'web-only-iframe',
  'web-only-dangerous-html',
  'web-only-dom-element',
  'web-only-dom-global',
  'web-only-hover-outside-web-guard',
  'web-only-dom-event-handler',
] as const;

const BAD_SAMPLES: Record<(typeof WEB_ONLY_IDS)[number], string> = {
  'web-only-iframe': '  return <iframe src={url} />;',
  'web-only-dangerous-html': '  <div dangerouslySetInnerHTML={{ __html: html }} />',
  'web-only-dom-element': '  return <div className="x">hi</div>;',
  'web-only-dom-global': '  const w = window.innerWidth;',
  'web-only-hover-outside-web-guard': "  className='hover:bg-accent px-2'",
  'web-only-dom-event-handler': '  <button onClick={fire}>go</button>;',
};

const SANCTIONED_SAMPLES: Record<(typeof WEB_ONLY_IDS)[number], string> = {
  'web-only-iframe': ' * the web original embeds an <iframe> we replace with WebView',
  'web-only-dangerous-html': ' * replaces dangerouslySetInnerHTML with data painting',
  'web-only-dom-element': ' * the web nests <span>s; React Native nests <Text>s',
  'web-only-dom-global': ' * AC-3 makes the chip removable in the uploading window.',
  'web-only-hover-outside-web-guard':
    "  Platform.select({ web: 'transition-colors hover:bg-accent/50' }),",
  'web-only-dom-event-handler':
    '  <TextInput onFocus={setFocused} onBlur={clear} onError={fallback} />;',
};

describe('styling contract web-only-construct checks', () => {
  for (const id of WEB_ONLY_IDS) {
    it(`${id}: catches its violation`, () => {
      expect(checkRegex(id).test(BAD_SAMPLES[id]), `${id} failed its negative control`).toBe(true);
    });
    it(`${id}: ignores the sanctioned shape`, () => {
      expect(
        checkRegex(id).test(SANCTIONED_SAMPLES[id]),
        `${id} false-positives on a sanctioned line`,
      ).toBe(false);
    });
  }
});
