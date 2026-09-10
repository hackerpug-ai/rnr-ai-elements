/**
 * DocsDataPrebuild (FUSE-05) — the one composition point of the docs data
 * path: registry + FUSE-02 verdicts + FUSE-03 enrichment -> ALL FIVE FUSE-04
 * gates -> apps/docs/src/data/registry-items.json + the wholesale public/r
 * copy. Gate-then-write: every gate runs over the fully-built in-memory
 * dataset BEFORE any output byte is written, so a degraded tree fails the
 * build naming the item instead of publishing.
 *
 * - expoGo and permissions are CONSUMED VERBATIM from gallery-manifest.json
 *   (FUSE-02's single verdict computation) — never recomputed here.
 * - The COMMITTED families.json is the count/family expectation (the gate's
 *   trusted outside source); expectedNames is its union, never the dataset.
 * - public/r is copied BYTE-FOR-BYTE from the freshly built root public/r
 *   (the ordered chain's `pnpm registry:build` output) — no re-fan, no
 *   re-templating; build-registry.ts owns fan-out.
 * - node:fs/node:path only (TR-06): ts-morph stays a root devDependency,
 *   reached through the FUSE-03 modules.
 *
 * Wired as the docs package's `prebuild`, so `pnpm --filter
 * @rnr-ai-elements/docs build` hits the gates automatically.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Project } from 'ts-morph';
import { ENGINES } from '../../packages/registry/scripts/build-registry';
import { type EnrichedItem, type Expectation, runAllGates } from './gates';
import { createDocsProject, extractProps, type PropInfo, type RegistryItem } from './props';
import { buildThemingNotes } from './theming-note';
import { extractUsageSnippets } from './usage-snippet';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_DIR = join(REPO_ROOT, 'apps/docs/src/data');
const ITEMS_JSON = join(DATA_DIR, 'registry-items.json');
const FAMILIES_JSON = join(DATA_DIR, 'families.json');
const MANIFEST_JSON = join(DATA_DIR, 'gallery-manifest.json');
const ROOT_PUBLIC_R = join(REPO_ROOT, 'public/r');
const DOCS_PUBLIC_R = join(REPO_ROOT, 'apps/docs/public/r');
/** 56 item JSONs + the registry.json index, per engine, x2 engines. */
const PUBLIC_R_FILE_COUNT = 114;

/** The registry-items-v1 entry keys, in contract order (LOCKED by FUSE-06). */
export const CONTRACT_KEYS = [
  'name',
  'title',
  'description',
  'type',
  'engines',
  'expoGo',
  'permissions',
  'family',
  'registryDependencies',
  'dependencies',
  'sourceFiles',
  'props',
  'usageSnippet',
  'themingNote',
] as const;

type ManifestEntry = {
  name: string;
  expoGo: boolean;
  permissions: { ios?: string[]; android?: string[] } | null;
};

/** The committed families-v1 shape (data schema: hand-maintained, gated). */
export type Family = { id: string; title: string; order: number; itemNames: string[] };

/** The gate expectation from the COMMITTED families map — never the dataset. */
export function familiesExpectation(families: Family[]): Expectation {
  return {
    expectedNames: families.flatMap((f) => f.itemNames),
    families: Object.fromEntries(families.map((f) => [f.id, f.itemNames])),
  };
}

function readJson<T>(path: string, regenerateHint: string): T {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch (err) {
    throw new Error(
      `[docs-data] prebuild: ${path} unreadable — ${regenerateHint} ` +
        `(${err instanceof Error ? err.message : String(err)})`,
    );
  }
}

/**
 * The fully-enriched dataset: registry items joined with the verbatim
 * manifest verdicts and the FUSE-03 enrichment, plus the gate-required
 * expoGo. Input problems the five gates cannot see (a missing usage
 * snippet) throw here, naming the item.
 */
export function buildDataset(project: Project): {
  dataset: EnrichedItem[];
  props: Record<string, PropInfo[] | null>;
  snippets: Record<string, string>;
  notes: Record<string, string>;
  families: Family[];
  manifestByName: Map<string, ManifestEntry>;
  familyOf: Map<string, string>;
} {
  const families = readJson<Family[]>(
    FAMILIES_JSON,
    'the committed families map is authored at apps/docs/src/data/families.json',
  );
  const registry = readJson<{ items: RegistryItem[] }>(
    join(REPO_ROOT, 'packages/registry/registry.json'),
    'the registry manifest is packages/registry/registry.json',
  );
  const manifest = readJson<ManifestEntry[]>(MANIFEST_JSON, 'run `pnpm gallery:manifest`');
  if (!existsSync(ROOT_PUBLIC_R)) {
    throw new Error(
      `[docs-data] prebuild: ${ROOT_PUBLIC_R} absent — run \`pnpm registry:build\` first ` +
        '(the public/r copy source is the freshly built root fan-out)',
    );
  }

  const manifestByName = new Map(manifest.map((m) => [m.name, m]));
  const familyOf = new Map(families.flatMap((f) => f.itemNames.map((n) => [n, f.id])));

  const props = extractProps(registry.items, project);
  const snippets = extractUsageSnippets();
  const notes = buildThemingNotes(registry.items);

  const dataset: EnrichedItem[] = registry.items.map((item) => {
    if (!(item.name in snippets)) {
      throw new Error(`[docs-data] prebuild: item "${item.name}" has no usage snippet`);
    }
    return {
      ...item,
      expoGo: manifestByName.get(item.name)?.expoGo,
    };
  });
  return { dataset, props, snippets, notes, families, manifestByName, familyOf };
}

function readEnrichedSource(path: string): string {
  const absolute = path.startsWith('/') ? path : join(REPO_ROOT, path);
  try {
    return readFileSync(absolute, 'utf8');
  } catch {
    // Gate-then-write keeps this dataset unpublished when a file is missing
    // or empty — gateFiles names the item before anything renders.
    return '';
  }
}

/** Serialize one entry with EXACTLY the contract keys, in contract order. */
function serialize(
  item: EnrichedItem,
  fields: {
    permissions: ManifestEntry['permissions'];
    family: string | undefined;
    props: PropInfo[] | null;
    usageSnippet: string;
    themingNote: string;
  },
): Record<(typeof CONTRACT_KEYS)[number], unknown> {
  return {
    name: item.name,
    title: (item as { title?: string }).title ?? item.name,
    description: (item as { description?: string }).description ?? '',
    type: item.type,
    engines: [...ENGINES],
    expoGo: item.expoGo,
    permissions: fields.permissions,
    family: fields.family as string,
    registryDependencies: (item as { registryDependencies?: string[] }).registryDependencies ?? [],
    dependencies: (item as { dependencies?: string[] }).dependencies ?? [],
    sourceFiles: item.files.map((file) => ({
      filename: basename(file.path),
      text: readEnrichedSource(file.path),
    })),
    props: fields.props,
    usageSnippet: fields.usageSnippet,
    themingNote: fields.themingNote,
  };
}

function countFiles(dir: string): number {
  let count = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) stack.push(join(current, entry.name));
      else count += 1;
    }
  }
  return count;
}

function main(): void {
  // One shared ts-morph Project amortizes setup across extraction and gates.
  const project = createDocsProject();
  const { dataset, props, snippets, notes, families, manifestByName, familyOf } =
    buildDataset(project);

  // ALL FIVE gates over the fully-built dataset — any violation throws a
  // GateError naming every offending item BEFORE a single output byte.
  runAllGates(dataset, familiesExpectation(families), project);

  const entries = dataset.map((item) =>
    serialize(item, {
      permissions: manifestByName.get(item.name)?.permissions ?? null,
      family: familyOf.get(item.name),
      props: props[item.name],
      usageSnippet: snippets[item.name],
      themingNote: notes[item.name],
    }),
  );

  // Build to temp, move on green: registry-items.json only ever appears whole.
  const bytes = `${JSON.stringify(entries, null, 2)}\n`;
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(`${ITEMS_JSON}.tmp`, bytes);
  renameSync(`${ITEMS_JSON}.tmp`, ITEMS_JSON);

  // The public/r copy: wholesale bytes from the freshly built root fan-out.
  rmSync(DOCS_PUBLIC_R, { recursive: true, force: true });
  cpSync(ROOT_PUBLIC_R, DOCS_PUBLIC_R, { recursive: true });
  const copied = countFiles(DOCS_PUBLIC_R);
  if (copied !== PUBLIC_R_FILE_COUNT) {
    throw new Error(
      `[docs-data] prebuild: public/r copy holds ${copied} files, expected ${PUBLIC_R_FILE_COUNT} ` +
        '(56 item JSONs + the registry.json index per engine)',
    );
  }

  const componentCount = dataset.filter((i) => i.type === 'registry:component').length;
  const resolvedCount = dataset.filter(
    (i) => i.type === 'registry:component' && Array.isArray(props[i.name]),
  ).length;
  console.log(
    `[docs-data] prebuild: ${dataset.length} items; ` +
      `props resolved for ${resolvedCount}/${componentCount} component items; ` +
      `${families.length} families; public/r copy ${copied} files`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
