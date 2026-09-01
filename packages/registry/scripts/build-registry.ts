/**
 * Emits the shipped registry: public/r/{engine}/*.json plus a per-engine index.
 *
 * One engine-agnostic source tree fans out to BOTH variants, mirroring RNR's own
 * 32/32 parity. The fan-out rewrites exactly two things and nothing else:
 *
 *   1. the import alias segment      @/registry/{engine}/...
 *   2. the registry dependency host  reactnativereusables.com/r/{engine}/...
 *
 * That is sufficient because our source never calls an engine API. RNR's Icon owns the
 * only genuine divergence (cssInterop vs withUniwind) and we consume it rather than
 * write it — verified: of the 32 RNR components installed in the harness, icon.tsx is
 * the only file importing an engine package.
 *
 * Output is deterministic: identical input produces byte-identical output, which is what
 * lets the `registry` CI job diff a fresh build against the committed tree.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const ENGINES = ['nativewind', 'uniwind'] as const;
export type Engine = (typeof ENGINES)[number];

export const ENGINE_TOKEN = '{engine}';

export interface RegistryFile {
  path: string;
  type: string;
  target: string;
}
export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}
export interface Registry {
  $schema?: string;
  name: string;
  homepage?: string;
  items: RegistryItem[];
}

/** Substitutes the engine placeholder in any string. Pure; the unit under test. */
export function resolveEngine(value: string, engine: Engine): string {
  return value.split(ENGINE_TOKEN).join(engine);
}

/**
 * Rewrites a component source for one engine. Only the alias segment moves; every
 * class, import name and line of logic is preserved verbatim.
 */
export function rewriteSource(source: string, engine: Engine): string {
  return resolveEngine(source, engine);
}

/** Builds one item for one engine. Throws on a short-name registry dependency. */
export function buildItem(
  item: RegistryItem,
  engine: Engine,
  readFile: (p: string) => string,
): RegistryItem {
  for (const dep of item.registryDependencies ?? []) {
    const resolved = resolveEngine(dep, engine);
    if (!resolved.startsWith('https://')) {
      throw new Error(
        `registryDependency "${dep}" on item "${item.name}" is not an absolute URL. ` +
          'A short name resolves against the shadcn WEB registry and installs a DOM component.',
      );
    }
  }
  return {
    ...item,
    registryDependencies: item.registryDependencies?.map((d) => resolveEngine(d, engine)),
    files: item.files.map((f) => ({
      ...f,
      path: resolveEngine(f.path, engine),
      target: resolveEngine(f.target, engine),
      content: rewriteSource(readFile(resolveEngine(f.path, engine)), engine),
    })) as RegistryFile[],
  };
}

function main(): void {
  const root = process.cwd();
  const registry: Registry = JSON.parse(
    readFileSync(join(root, 'packages/registry/registry.json'), 'utf8'),
  );
  const out = join(root, 'public/r');
  if (existsSync(out)) rmSync(out, { recursive: true });

  let written = 0;
  for (const engine of ENGINES) {
    const dir = join(out, engine);
    mkdirSync(dir, { recursive: true });
    const built = registry.items.map((item) =>
      buildItem(item, engine, (p) => readFileSync(join(root, p), 'utf8')),
    );
    for (const item of built) {
      writeFileSync(join(dir, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
      written++;
    }
    writeFileSync(
      join(dir, 'registry.json'),
      `${JSON.stringify({ ...registry, items: built.map((i) => ({ name: i.name, type: i.type, title: i.title })) }, null, 2)}\n`,
    );
  }
  console.log(
    `registry built — ${registry.items.length} item(s) x ${ENGINES.length} engine(s) = ${written} file(s) under public/r/`,
  );
  if (registry.items.length === 0) {
    console.log(
      '  (no items yet — the registry is scaffolded and empty, which is expected pre-build)',
    );
  }
}

if (process.argv[1] && dirname(process.argv[1]).endsWith('scripts')) main();
