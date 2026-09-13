import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

/**
 * REF-007 lane contract — the published shape of the authored dev-client
 * matrix dataset. Four test functions, one per AC, each selected by
 * `vitest run ... -t REF-007-<name>`. The registry facts pinned below are
 * authoring-time `npm view` evidence (recorded external, offline at test
 * time): every peers[].name resolved on the live npm registry on
 * 2026-09-13 and every permission string is documented by the capability
 * package (README, plugin source, or Apple/Android platform reference).
 *
 * RED at task start: apps/docs/src/data/dev-client-matrix.json is absent,
 * so loadMatrix()'s read throws ENOENT naming the file.
 */
const ROOT = process.cwd();
const MATRIX_PATH = join(ROOT, 'apps/docs/src/data/dev-client-matrix.json');

type Peer = { name: string; range: string };
type MatrixEntry = {
  id: string;
  label: string;
  peers: Peer[];
  permissions: { ios: string[]; android: string[] };
};
type Matrix = MatrixEntry[];

/** The pinned id order — also the authored file order (entries[2] is speech-recognition). */
const PINNED_IDS = [
  'enriched-markdown',
  'streamdown',
  'speech-recognition',
  'extended-audio',
] as const;

/**
 * Registry-resolvable package names verified via `npm view <name> version
 * peerDependencies` on 2026-09-13. The streamdown column of streamdown's
 * peerDependencies read exactly react-native-enriched-markdown >=1.0.0,
 * react-native-worklets >=0.10.0, remend 1.3.0.
 */
const REGISTRY_VERIFIED_NAMES = new Set([
  'react-native-enriched-markdown',
  'react-native-streamdown',
  'react-native-worklets',
  'remend',
  'expo-speech-recognition',
  'expo-audio',
]);

/** Placeholder tokens that must never appear in the authored data. */
const PLACEHOLDER_TOKENS = ['tbd', 'todo', 'fixme', 'example-permission', 'some-package', 'xxx'];

const PLACEHOLDER_RE = new RegExp(`\\b(?:${PLACEHOLDER_TOKENS.join('|')})\\b`, 'i');

/**
 * Semver-range parse check (no semver dep in the workspace): covers the
 * comparator forms real manifests use — bare / ^ / ~ / >= / > / <= / < / =
 * over numeric x.y.z (-prerelease), space-separated AND, and || unions.
 */
const COMPARATOR = /\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/;
const RANGE_RE = new RegExp(
  `^(?:\\s*(?:\\^|~|>=|<=|>|=)?\\s*${COMPARATOR.source}\\s*)(?:\\s+${COMPARATOR.source})*$`,
);

function parsesAsSemverRange(range: string): boolean {
  return range
    .split('||')
    .every((alternative) => alternative.trim().length > 0 && RANGE_RE.test(alternative));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function loadMatrix(): Matrix {
  return JSON.parse(readFileSync(MATRIX_PATH, 'utf8')) as Matrix;
}

function sortedIds(matrix: Matrix): string[] {
  return matrix.map((entry) => entry.id).sort();
}

function entryById(matrix: Matrix, id: string): MatrixEntry {
  const entry = matrix.find((candidate) => candidate.id === id);
  if (!entry) {
    throw new Error(`entry "${id}" not found in the matrix`);
  }
  return entry;
}

/**
 * The four validation phases AC-4's corruption drill exercises. Each phase
 * throws an Error whose message names the offending entry id (or the id-set
 * diff), so a violation is attributable to its entry.
 */
function validatePhase1Shape(matrix: unknown): void {
  if (!Array.isArray(matrix)) {
    throw new Error(`phase 1 (shape): expected an array, got ${typeof matrix}`);
  }
  // Id-set diff first — it names the missing/unexpected entry ids, which a
  // bare length check cannot (a 4-length check would only say "got 3").
  const expected: string[] = [...PINNED_IDS].sort();
  const actual = sortedIds(matrix as Matrix);
  if (actual.length !== 4 || actual.join(',') !== expected.join(',')) {
    const missing = expected.filter((id) => !actual.includes(id));
    const unexpected = actual.filter((id) => !expected.includes(id));
    throw new Error(
      `phase 1 (shape): id set mismatch (${actual.length} entries) — missing [${missing.join(', ')}], unexpected [${unexpected.join(', ')}]`,
    );
  }
  for (const entry of matrix as Matrix) {
    if (!isNonEmptyString(entry?.label)) {
      throw new Error(`phase 1 (shape): entry "${entry?.id}" has an empty or missing label`);
    }
    if (!Array.isArray(entry?.peers) || entry.peers.length === 0) {
      throw new Error(`phase 1 (shape): entry "${entry?.id}" peers must be a non-empty array`);
    }
    for (const peer of entry.peers) {
      if (!isNonEmptyString(peer?.name)) {
        throw new Error(`phase 1 (shape): entry "${entry.id}" has an empty peers[].name`);
      }
      if (!isNonEmptyString(peer?.range)) {
        throw new Error(
          `phase 1 (shape): entry "${entry.id}" peer "${peer.name}" has an empty range`,
        );
      }
      if (!parsesAsSemverRange(peer.range)) {
        throw new Error(
          `phase 1 (shape): entry "${entry.id}" peer "${peer.name}" range "${peer.range}" is not a semver range`,
        );
      }
    }
    for (const platform of ['ios', 'android'] as const) {
      const list = entry?.permissions?.[platform];
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error(
          `phase 1 (shape): entry "${entry?.id}" permissions.${platform} must be a non-empty array`,
        );
      }
      for (const permission of list) {
        if (!isNonEmptyString(permission)) {
          throw new Error(
            `phase 1 (shape): entry "${entry?.id}" has an empty permissions.${platform} element`,
          );
        }
      }
    }
  }
}

function validatePhase2Peers(matrix: Matrix): void {
  for (const entry of matrix) {
    const names = entry.peers.map((peer) => peer.name);
    if (new Set(names).size !== names.length) {
      throw new Error(`phase 2 (peers): entry "${entry.id}" has duplicate peer names`);
    }
    for (const name of names) {
      if (!REGISTRY_VERIFIED_NAMES.has(name)) {
        throw new Error(
          `phase 2 (peers): entry "${entry.id}" peer "${name}" is not a registry-verified package name`,
        );
      }
      if (PLACEHOLDER_RE.test(name)) {
        throw new Error(
          `phase 2 (peers): entry "${entry.id}" carries placeholder peer name "${name}"`,
        );
      }
    }
  }
}

function validatePhase3Permissions(matrix: Matrix): void {
  const speech = entryById(matrix, 'speech-recognition');
  const recordAudioCount = speech.permissions.android.filter((p) => p === 'RECORD_AUDIO').length;
  if (recordAudioCount !== 1) {
    throw new Error(
      `phase 3 (permissions): entry "speech-recognition" must include RECORD_AUDIO exactly once in permissions.android (found ${recordAudioCount})`,
    );
  }
  for (const entry of matrix) {
    for (const platform of ['ios', 'android'] as const) {
      for (const permission of entry.permissions[platform]) {
        if (PLACEHOLDER_RE.test(permission)) {
          throw new Error(
            `phase 3 (permissions): entry "${entry.id}" carries placeholder permission "${permission}"`,
          );
        }
      }
    }
  }
}

function validatePhase4NoPlaceholders(matrix: Matrix): void {
  for (const entry of matrix) {
    const strings = [
      entry.label,
      ...entry.peers.flatMap((peer) => [peer.name, peer.range]),
      ...entry.permissions.ios,
      ...entry.permissions.android,
    ];
    for (const value of strings) {
      if (PLACEHOLDER_RE.test(value)) {
        throw new Error(
          `phase 4 (no-placeholders): entry "${entry.id}" carries placeholder string "${value}"`,
        );
      }
    }
  }
}

/** Full contract: 4 phases. The pristine real file must pass 4/4. */
function validateMatrix(matrix: Matrix): void {
  validatePhase1Shape(matrix);
  validatePhase2Peers(matrix);
  validatePhase3Permissions(matrix);
  validatePhase4NoPlaceholders(matrix);
}

it('REF-007-matrix-shape', () => {
  const matrix = loadMatrix();
  const expected: string[] = [...PINNED_IDS].sort();
  const actual = sortedIds(matrix);
  console.log(`[REF-007] ${matrix.length} entries, sorted ids=${JSON.stringify(actual)}`);
  expect(matrix).toHaveLength(4);
  expect(actual).toEqual(expected);
  expect(new Set(actual).size).toBe(4);

  const rawText = readFileSync(MATRIX_PATH, 'utf8');
  expect(rawText.endsWith('\n'), 'data file must end with a newline').toBe(true);
  expect(PLACEHOLDER_RE.test(rawText), 'no placeholder strings anywhere in the file').toBe(false);

  // Full shape + placeholder-free scan over every entry.
  validatePhase1Shape(matrix);
  validatePhase4NoPlaceholders(matrix);

  // Order-independence: a reversed in-memory copy passes the same
  // sorted-literal comparison (1 sort call inside sortedIds guards it).
  const reversed: Matrix = [...matrix].reverse();
  expect(sortedIds(reversed)).toEqual(expected);
  validatePhase1Shape(reversed);
});

it('REF-007-real-peers', () => {
  const matrix = loadMatrix();
  validatePhase2Peers(matrix);

  // 4/4 entries name their anchor package (the consumer-installed subject).
  const anchors: Record<string, string> = {
    'enriched-markdown': 'react-native-enriched-markdown',
    streamdown: 'react-native-streamdown',
    'speech-recognition': 'expo-speech-recognition',
    'extended-audio': 'expo-audio',
  };
  for (const entry of matrix) {
    const anchor = anchors[entry.id];
    expect(anchor, `entry ${entry.id} is one of the four pinned ids`).toBeDefined();
    expect(
      entry.peers.some((peer) => peer.name === anchor),
      `${entry.id} names its anchor ${anchor}`,
    ).toBe(true);
  }

  // Anchor versions pinned from live npm views (2026-09-13).
  const byName = (entry: MatrixEntry, name: string) =>
    entry.peers.find((peer) => peer.name === name);
  const enriched = entryById(matrix, 'enriched-markdown');
  const streamdown = entryById(matrix, 'streamdown');
  const speech = entryById(matrix, 'speech-recognition');
  const audio = entryById(matrix, 'extended-audio');
  expect(byName(enriched, 'react-native-enriched-markdown')?.range).toBe('1.0.2');
  expect(byName(streamdown, 'react-native-streamdown')?.range).toBe('0.3.0');
  expect(byName(speech, 'expo-speech-recognition')?.range).toBe('57.0.0');
  expect(byName(audio, 'expo-audio')?.range).toBe('57.0.5');

  // The streamdown entry carries exactly the 3 real peers from
  // react-native-streamdown@0.3.0's peerDependencies (beyond its anchor).
  const pinnedStreamdownPeers = [
    { name: 'react-native-enriched-markdown', range: '>=1.0.0' },
    { name: 'react-native-worklets', range: '>=0.10.0' },
    { name: 'remend', range: '1.3.0' },
  ];
  expect(
    streamdown.peers.filter((peer) => peer.name !== 'react-native-streamdown'),
    'streamdown peers are exactly its 3 real peerDependencies',
  ).toEqual(pinnedStreamdownPeers);
});

it('REF-007-permissions-real', () => {
  const matrix = loadMatrix();
  validatePhase3Permissions(matrix);

  // entries[2] is speech-recognition in the pinned id order.
  expect(matrix[2]?.id).toBe('speech-recognition');
  expect(matrix[2].permissions.android).toContain('RECORD_AUDIO');
  expect(matrix[2].permissions.android.filter((p) => p === 'RECORD_AUDIO')).toHaveLength(1);

  // Trimmed-non-empty scan over every permission element on both platforms.
  let scanned = 0;
  for (const entry of matrix) {
    expect(
      entry.permissions.ios.length,
      `${entry.id} permissions.ios non-empty`,
    ).toBeGreaterThanOrEqual(1);
    expect(
      entry.permissions.android.length,
      `${entry.id} permissions.android non-empty`,
    ).toBeGreaterThanOrEqual(1);
    for (const platform of ['ios', 'android'] as const) {
      for (const permission of entry.permissions[platform]) {
        expect(
          permission.trim().length,
          `${entry.id} permissions.${platform} element trimmed-non-empty`,
        ).toBeGreaterThan(0);
        scanned += 1;
      }
    }
  }
  console.log(`[REF-007] permissions scan: ${scanned} elements across ios+android (0 failures)`);
  expect(scanned).toBeGreaterThanOrEqual(8);
});

it('REF-007-contract-rejects-corruption', () => {
  const pristineBytes = readFileSync(MATRIX_PATH, 'utf8');
  const pristine = loadMatrix();

  // The pristine real file passes 4/4 validation phases.
  validateMatrix(pristine);

  type Corruption = { label: string; corrupt: (matrix: Matrix) => void };
  const corruptions: Corruption[] = [
    {
      label: 'missing streamdown entry (id-set diff names it)',
      corrupt: (matrix) => {
        const index = matrix.findIndex((entry) => entry.id === 'streamdown');
        matrix.splice(index, 1);
      },
    },
    {
      label: 'empty peers[] on speech-recognition',
      corrupt: (matrix) => {
        const speech = entryById(matrix, 'speech-recognition');
        speech.peers = [];
      },
    },
    {
      label: 'placeholder peer name some-package',
      corrupt: (matrix) => {
        const audio = entryById(matrix, 'extended-audio');
        audio.peers.push({ name: 'some-package', range: '^1.0.0' });
      },
    },
    {
      label: 'a fifth entry sneaks in',
      corrupt: (matrix) => {
        matrix.push(structuredClone(matrix[0]));
        matrix[4].id = 'fifth-entry';
      },
    },
    {
      label: 'blank permissions platform on enriched-markdown',
      corrupt: (matrix) => {
        const enriched = entryById(matrix, 'enriched-markdown');
        enriched.permissions.android = [];
      },
    },
  ];

  for (const { label, corrupt } of corruptions) {
    const copy = structuredClone(pristine);
    corrupt(copy);
    let threw: Error | undefined;
    try {
      validateMatrix(copy);
    } catch (error) {
      threw = error as Error;
    }
    expect(threw, `corruption "${label}" must fail validation`).toBeDefined();
    const message = threw?.message ?? '';
    const namesOffender =
      PINNED_IDS.some((id) => message.includes(id)) || message.includes('fifth-entry');
    expect(
      namesOffender,
      `failure for "${label}" names the offending entry (got: ${message})`,
    ).toBe(true);
  }

  // Corruption lives on clones only — the on-disk bytes are unchanged.
  expect(readFileSync(MATRIX_PATH, 'utf8')).toBe(pristineBytes);
  validateMatrix(loadMatrix());
});
