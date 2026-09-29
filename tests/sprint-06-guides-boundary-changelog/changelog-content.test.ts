import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * GBC-005 — changelog entry content scan (AC-5, AC-6).
 *
 * Read-only over the three authored entries under
 * apps/docs/src/content/changelog/ and the tracked
 * packages/registry/registry.json: no build, no network, no git, no browser
 * (task STRICTLY rule). AC-1 to AC-4 are e2e and close with GBC-008's
 * changelog-release-pages spec; this file only proves the entry sources.
 */
const ROOT = process.cwd();
const CHANGELOG_DIR = join(ROOT, 'apps/docs/src/content/changelog');
const REGISTRY_PATH = join(ROOT, 'packages/registry/registry.json');

/** One entry per git tag through v0.2.1, with its deriving git-log range. */
const EXPECTED_ENTRIES = [
  {
    file: '0.1.0.md',
    version: '0.1.0',
    date: '2026-09-07',
    citation: 'git log v0.1.0',
  },
  {
    file: '0.2.0.md',
    version: '0.2.0',
    date: '2026-09-08',
    citation: 'git log v0.1.0..v0.2.0',
  },
  {
    file: '0.2.1.md',
    version: '0.2.1',
    date: '2026-09-08',
    citation: 'git log v0.2.0..v0.2.1',
  },
] as const;

const SECTION_HEADINGS = ['Added', 'Changed', 'Fixed'] as const;

function readEntry(file: string): string {
  const path = join(CHANGELOG_DIR, file);
  if (!existsSync(path)) {
    throw new Error(
      `[GBC-005] content failure: ${path} is missing — one entry file per git tag through v0.2.1 is required`,
    );
  }
  return readFileSync(path, 'utf8');
}

function frontmatterField(source: string, field: string): string {
  const match = source.match(new RegExp(`^${field}:\\s*['"]?([^'"\\s]+)['"]?\\s*$`, 'm'));
  if (!match) {
    throw new Error(
      `[GBC-005] content failure: frontmatter field '${field}' is missing from the entry`,
    );
  }
  return match[1];
}

/** All level-2 heading texts in the body, in order. */
function h2Headings(source: string): string[] {
  return source
    .split('\n')
    .map((line) => line.match(/^##\s+(.+?)\s*$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => m[1]);
}

/** The body between `## {heading}` and the next level-2 heading (or EOF). */
function sectionBody(source: string, heading: string): string {
  const lines = source.split('\n');
  const start = lines.indexOf(`## ${heading}`);
  if (start === -1) {
    throw new Error(`[GBC-005] content failure: heading '## ${heading}' is absent`);
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines
    .slice(start + 1, end)
    .join('\n')
    .trim();
}

function listItems(section: string): string[] {
  return section.split('\n').filter((line) => /^\s*-\s+/.test(line));
}

/** Every markdown link target that points into the components pages. */
function componentLinkTargets(source: string): string[] {
  return [...source.matchAll(/\]\((\/components\/[^)\s]*)\)/g)].map((m) => m[1]);
}

function registryItemNames(): string[] {
  if (!existsSync(REGISTRY_PATH)) {
    throw new Error(
      `[GBC-005] content failure: ${REGISTRY_PATH} is missing — slug membership is checked against the tracked registry`,
    );
  }
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as {
    items: { name: string }[];
  };
  return registry.items.map((item) => item.name);
}

describe('GBC-005 changelog entry content', () => {
  describe('AC-5: every entry has three headings and empty lists read none', () => {
    for (const { file } of EXPECTED_ENTRIES) {
      it(`${file}: exactly one Added, Changed and Fixed heading, in that order, and no other level-2 heading`, () => {
        const source = readEntry(file);
        expect(h2Headings(source)).toEqual([...SECTION_HEADINGS]);
        for (const heading of SECTION_HEADINGS) {
          expect(source.split('\n').filter((line) => line === `## ${heading}`)).toHaveLength(1);
        }
      });

      it(`${file}: no heading has a blank body and every empty list reads the literal 'none'`, () => {
        const source = readEntry(file);
        for (const heading of SECTION_HEADINGS) {
          const body = sectionBody(source, heading);
          expect(body.length, `section '${heading}' must not be blank`).toBeGreaterThan(0);
          if (listItems(body).length === 0) {
            expect(body, `empty list under '${heading}' must read the literal 'none'`).toBe('none');
          }
        }
      });
    }
  });

  describe('AC-6: entry frontmatter, commit range citation and slug links', () => {
    it('the changelog directory holds exactly one entry file per git tag through v0.2.1', () => {
      if (!existsSync(CHANGELOG_DIR)) {
        throw new Error(
          `[GBC-005] content failure: ${CHANGELOG_DIR} is missing — the three release entries must be authored there`,
        );
      }
      const files = readdirSync(CHANGELOG_DIR).sort();
      expect(files).toEqual([...EXPECTED_ENTRIES].map((e) => e.file).sort());
    });

    for (const entry of EXPECTED_ENTRIES) {
      it(`${entry.file}: version matches the file name without a 'v' prefix and carries the release date`, () => {
        const source = readEntry(entry.file);
        const version = frontmatterField(source, 'version');
        expect(version).toBe(entry.version);
        expect(version.startsWith('v'), "the version slug must omit the 'v' prefix").toBe(false);
        expect(frontmatterField(source, 'date')).toBe(entry.date);
      });

      it(`${entry.file}: cites its deriving git-log commit range (${entry.citation})`, () => {
        expect(readEntry(entry.file)).toContain(entry.citation);
      });

      it(`${entry.file}: every /components/ link names a registry item`, () => {
        const names = registryItemNames();
        const targets = componentLinkTargets(readEntry(entry.file));
        expect(targets.length, 'the entry links at least one touched component').toBeGreaterThan(0);
        for (const target of targets) {
          const slug = target.replace(/^\/components\//, '');
          expect(slug.length, `link target '${target}' must name a slug`).toBeGreaterThan(0);
          expect(slug.includes('/'), `link target '${target}' must be /components/{slug}`).toBe(
            false,
          );
          expect(
            names.includes(slug),
            `linked slug '${slug}' is not a registry item in packages/registry/registry.json`,
          ).toBe(true);
        }
      });
    }
  });
});
