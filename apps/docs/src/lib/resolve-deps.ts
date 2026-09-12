/**
 * resolve-deps (SHELL-006) — the docs site's ONE substitution point for
 * registry dependency URLs and for the AI SDK peers fact. Every consumer —
 * the docs prebuild gate, the item-page panels, site-facts.json — routes
 * through these functions, so resolved URLs and peers can never drift apart.
 *
 * Pure functions over data passed in: no fs, no cwd assumptions. The version
 * is always the caller's (the prebuild reads the ROOT package.json — the same
 * version the sprint-01 chip carries — and [item].astro receives it from the
 * build); it is never hardcoded here. Engine names mirror build-registry's
 * fan-out list (packages/registry/scripts/build-registry.ts owns the source
 * of truth for the fan-out itself; tests pin byte-parity between the two).
 */

/** The engines the registry fans out to. Keep in sync with build-registry's ENGINES. */
export const RESOLVE_ENGINES = ['nativewind', 'uniwind'] as const;
export type Engine = (typeof RESOLVE_ENGINES)[number];

/** The AI SDK's published package names — only pins present in the consumer manifest emit. */
const AI_SDK_PACKAGES = ['ai', '@ai-sdk/react'] as const;

/** One build-derived peer requirement, e.g. { name: 'ai', range: '^7.0.89' }. */
export type AiSdkPeer = { name: string; range: string };

const SEMVER = /^\d+\.\d+\.\d+(-[^\s+]+)?(\+[^\s+]+)?$/;
const RESIDUAL_TOKEN = /\{\w+\}/;

/**
 * Substitutes {engine} and {version} in one registry dependency URL, fail-closed:
 * an unknown engine, a non-concrete version, or any residual {token} (a typo'd
 * template like {engin}) throws instead of leaking a template into output.
 */
export function resolveDependencyUrl(url: string, engine: Engine, version: string): string {
  if (!RESOLVE_ENGINES.includes(engine)) {
    throw new Error(
      `[resolve-deps] unknown engine "${engine}" — expected one of ${RESOLVE_ENGINES.join(', ')}`,
    );
  }
  if (!SEMVER.test(version)) {
    throw new Error(
      `[resolve-deps] version "${version}" is not concrete semver — {version} URLs cannot ` +
        'resolve; pass the root package.json version',
    );
  }
  const resolved = url.replaceAll('{engine}', engine).replaceAll('{version}', version);
  const residual = resolved.match(RESIDUAL_TOKEN);
  if (residual) {
    throw new Error(
      `[resolve-deps] "${url}" still carries the unknown template "${residual[0]}" after ` +
        'substitution — fix the registryDependencies entry in packages/registry/registry.json',
    );
  }
  return resolved;
}

/** Resolves every registryDependencies[] entry of one item for one engine. */
export function resolveRegistryDependencies(
  urls: readonly string[] | undefined,
  engine: Engine,
  version: string,
): string[] {
  return (urls ?? []).map((url) => resolveDependencyUrl(url, engine, version));
}

/**
 * Derives the project-level AI SDK peers from a consumer manifest's
 * dependencies (apps/example/package.json): a pin like `7.0.89` becomes
 * `^7.0.89`; a pin that already carries a range operator passes through.
 */
export function deriveAiSdkPeers(dependencies: Record<string, string>): AiSdkPeer[] {
  return AI_SDK_PACKAGES.filter((name) => dependencies[name] !== undefined).map((name) => ({
    name,
    range: /^[\^~><=]/.test(dependencies[name]) ? dependencies[name] : `^${dependencies[name]}`,
  }));
}
