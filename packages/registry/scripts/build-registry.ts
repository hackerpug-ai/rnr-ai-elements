/**
 * Emits the shipped registry: public/r/{engine}/*.json plus a per-engine index.
 *
 * One engine-agnostic source tree fans out to BOTH variants, mirroring RNR's own
 * 32/32 parity. The fan-out rewrites exactly three things and nothing else:
 *
 *   1. the import alias segment      @/registry/{engine}/...
 *   2. the registry dependency host  reactnativereusables.com/r/{engine}/...
 *   3. the release tag in OUR urls   .../v{version}/public/r/...  (RNR's own deps are
 *      NEVER version-substituted — pinning those would freeze a consumer to an RNR
 *      snapshot we do not control, the opposite of the peer-dependency model)
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
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const ENGINES = ['nativewind', 'uniwind'] as const;
export type Engine = (typeof ENGINES)[number];

export const ENGINE_TOKEN = '{engine}';
export const VERSION_TOKEN = '{version}';

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

/**
 * Substitutes the {engine} and {version} placeholders in any string — ONE code path for
 * both tokens, so one unit of test coverage pins them. Pure; the unit under test.
 */
export function resolveEngine(value: string, engine: Engine, version?: string): string {
  const out = value.split(ENGINE_TOKEN).join(engine);
  return version === undefined ? out : out.split(VERSION_TOKEN).join(version);
}

let cachedVersion: string | undefined;
/** The release version from package.json ("0.1.0"), which is what the v0.1.0 tag names. */
export function currentVersion(): string {
  if (cachedVersion === undefined) {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      version?: string;
    };
    if (!pkg.version) {
      throw new Error(
        'package.json is missing a version field — self-referencing registry URLs cannot be pinned to a release tag',
      );
    }
    cachedVersion = pkg.version;
  }
  return cachedVersion;
}

/**
 * Rewrites a component source for one engine. Only the alias segment moves; every
 * class, import name and line of logic is preserved verbatim.
 */
export function rewriteSource(source: string, engine: Engine): string {
  return resolveEngine(source, engine);
}

/**
 * Builds one item for one engine.
 *
 * The SOURCE path carries no engine segment — there is one shared, engine-agnostic tree.
 * Only the file CONTENT (its `@/registry/{engine}/...` import aliases) and the
 * registryDependencies get substituted — the latter with {engine} AND {version}, the
 * {version} substitution happening BEFORE the absolute-URL guard so a correctly
 * templated URL never fails the guard for the wrong reason. That is the whole
 * fan-out, and it works because our source never calls an engine API: RNR's Icon owns
 * the only real divergence and we consume it rather than write it.
 *
 * Throws on a short-name registry dependency. `version` defaults to package.json so
 * callers that omit it (check-registry-fresh) still compare against the pinned tree.
 */
export function buildItem(
  item: RegistryItem,
  engine: Engine,
  readFile: (p: string) => string,
  version: string = currentVersion(),
): RegistryItem {
  for (const dep of item.registryDependencies ?? []) {
    const resolved = resolveEngine(dep, engine, version);
    if (!resolved.startsWith('https://')) {
      throw new Error(
        `registryDependency "${dep}" on item "${item.name}" is not an absolute URL. ` +
          'A short name resolves against the shadcn WEB registry and installs a DOM component.',
      );
    }
  }
  return {
    ...item,
    registryDependencies: item.registryDependencies?.map((d) => resolveEngine(d, engine, version)),
    files: item.files.map((f) => ({
      ...f,
      // path is shared across engines; target is the consumer's path
      path: f.path,
      target: resolveEngine(f.target, engine, version),
      content: rewriteSource(readFile(f.path), engine),
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

// Run main() only when THIS file is the entrypoint. Matching on the directory used to
// fire the build from any script under scripts/ that merely imported the pure helpers —
// which made check-registry-fresh silently REGENERATE public/r before comparing,
// destroying the very staleness signal it exists to report.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
