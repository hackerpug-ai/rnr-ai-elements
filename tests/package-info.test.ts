import { describe, expect, it } from 'vitest';
import {
  formatVersionTransition,
  installCommand,
  PACKAGE_CHANGE_TYPE_KEYS,
  PACKAGE_CHANGE_TYPE_META,
  packageChangeTypeMeta,
} from '../packages/registry/src/components/ai/package-info.logic.ts';
import { statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the change-type meta map, the version transition line, and the
 * install command behind the package-info card (see agent-status.test.ts's header for
 * why rendering itself cannot live in this tier).
 *
 * Same compression story as commit.logic: the web's five change-type hues collapse
 * onto the house status vocabulary, and the badge's WORD carries the kind so color is
 * never the sole channel.
 */

describe('PACKAGE_CHANGE_TYPE_META (the compressed color map, exhaustive)', () => {
  it('covers every change type the union declares — a new type without a row fails here', () => {
    expect(Object.keys(PACKAGE_CHANGE_TYPE_META).sort()).toEqual(
      [...PACKAGE_CHANGE_TYPE_KEYS].sort(),
    );
    expect(PACKAGE_CHANGE_TYPE_KEYS).toEqual(['major', 'minor', 'patch', 'added', 'removed']);
  });

  it('carries the web original’s word as the label', () => {
    expect(packageChangeTypeMeta('major').label).toBe('major');
    expect(packageChangeTypeMeta('minor').label).toBe('minor');
    expect(packageChangeTypeMeta('patch').label).toBe('patch');
    expect(packageChangeTypeMeta('added').label).toBe('added');
    expect(packageChangeTypeMeta('removed').label).toBe('removed');
  });

  it('every tone resolves through the ONE status map — no second color table', () => {
    expect(packageChangeTypeMeta('major').className).toBe(statusColor.error);
    expect(packageChangeTypeMeta('minor').className).toBe(statusColor.denied);
    expect(packageChangeTypeMeta('patch').className).toBe(statusColor.success);
    expect(packageChangeTypeMeta('added').className).toBe(statusColor.running);
    expect(packageChangeTypeMeta('removed').className).toBe(statusColor.pending);
  });
});

describe('formatVersionTransition (the KB’s version transition display)', () => {
  it('both versions render as current → next', () => {
    expect(formatVersionTransition('1.2.3', '2.0.0')).toBe('1.2.3 → 2.0.0');
  });

  it('only current renders alone (the installed card)', () => {
    expect(formatVersionTransition('1.2.3')).toBe('1.2.3');
  });

  it('only new renders alone (the announced card)', () => {
    expect(formatVersionTransition(undefined, '2.0.0')).toBe('2.0.0');
  });

  it('neither renders NOTHING — null means skip, never "undefined → undefined" mid-stream', () => {
    expect(formatVersionTransition()).toBe(null);
    expect(formatVersionTransition('', '   ')).toBe(null);
  });

  it('whitespace around streamed versions is trimmed', () => {
    expect(formatVersionTransition(' 1.2.3 ', ' 2.0.0 ')).toBe('1.2.3 → 2.0.0');
  });
});

describe('installCommand (UC-CODE-01 AC-3’s copyable line)', () => {
  it('a bare name installs latest', () => {
    expect(installCommand('drizzle-orm')).toBe('npm install drizzle-orm');
  });

  it('a version pins the install', () => {
    expect(installCommand('drizzle-orm', '0.44.2')).toBe('npm install drizzle-orm@0.44.2');
  });

  it('scoped names keep their @ — the name is opaque', () => {
    expect(installCommand('@rnr-ai-elements/cli', '1.0.0')).toBe(
      'npm install @rnr-ai-elements/cli@1.0.0',
    );
  });

  it('whitespace around name and version is trimmed', () => {
    expect(installCommand(' zod ', ' 3.25.76 ')).toBe('npm install zod@3.25.76');
  });

  it('a blank version is no pin, not a trailing @', () => {
    expect(installCommand('zod', '   ')).toBe('npm install zod');
  });
});
