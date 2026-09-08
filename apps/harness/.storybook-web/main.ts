import { readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

// Pure ESM — no require, no createRequire. engine.config.json is plain data so the CJS
// metro config and this ESM config share one source without an interop shim.
const root = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(readFileSync(path.join(root, 'engine.config.json'), 'utf8')) as {
  uiDir: Record<string, string>;
};
const ENGINE = process.env.ENGINE === 'nativewind' ? 'nativewind' : 'uniwind';
const REGISTRY_SRC = path.resolve(root, '../../packages/registry/src');
const isFile = (p: string) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};
const withExt = (base: string): string | null => {
  if (isFile(base)) return base;
  if (isFile(`${base}.tsx`)) return `${base}.tsx`;
  if (isFile(`${base}.ts`)) return `${base}.ts`;
  return null;
};

// Native peers (react-native-webview, expo-*) resolve from this harness's Expo-pinned
// installs. pnpm layout: some expo siblings (expo-modules-core) are NOT in the
// harness's top-level node_modules — they live next to the realpath of `expo`.
// Both the vite dev resolver AND the dep-optimizer's esbuild scan need this.
const PEER_RE = /^(react-native-webview|expo(-[a-z0-9-]+)?)(\/.*)?$/;
// Native-only peers that no web bundle can satisfy — swapped for browser stand-ins.
const PEER_STUBS: Record<string, string> = {
  'expo-clipboard': path.join(import.meta.dirname, 'peer-shims.ts'),
  'expo-image-picker': path.join(import.meta.dirname, 'peer-shims.ts'),
  'expo-document-picker': path.join(import.meta.dirname, 'peer-shims.ts'),
};
function resolveNativePeer(spec: string): string | null {
  const m = spec.match(PEER_RE);
  if (!m) return null;
  const candidates = [path.join(root, 'node_modules', m[1])];
  try {
    candidates.push(path.join(path.dirname(realpathSync(path.join(root, 'node_modules', 'expo'))), m[1]));
  } catch {
    /* no expo link */
  }
  const top = candidates.find((c) => isFile(path.join(c, 'package.json')));
  if (!top) return null; // not installed → normal resolution
  const pkgDir = statSync(top).isSymbolicLink() ? realpathSync(top) : top;
  if (m[3]) return withExt(path.join(pkgDir, m[3].slice(1)));
  const pj = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  return path.join(pkgDir, pj.main ?? 'index.js');
}

// Mirror the Metro resolveRequest (metro.config.js): the harness exercises the SAME
// registry source the CLI ships, with the harness tree as the consumer fallback.
// Vite aliases can't express try-registry-then-harness, so this is a resolveId hook.
function registryConsumerResolve() {
  return {
    name: 'registry-consumer-resolve',
    enforce: 'pre' as const,
    resolveId(source: string, importer?: string) {
      if (process.env.RR_RESOLVE_DEBUG && importer?.includes('/ai/'))
        console.log('[rr-resolve]', source, '<-', importer.split('/').slice(-2).join('/'));
      const shim = PEER_STUBS[source];
      if (shim) return shim;
      const peer = resolveNativePeer(source);
      if (peer) return peer;
      if (source.startsWith('@/registry/{engine}/')) {
        const rest = source.replace('@/registry/{engine}/', '');
        if (rest.startsWith('components/ui/')) {
          const name = rest.replace('components/ui/', '');
          return (
            withExt(path.join(REGISTRY_SRC, 'components/ui', name)) ??
            withExt(path.join(root, 'src', cfg.uiDir[ENGINE], name))
          );
        }
        if (rest.startsWith('components/ai/'))
          return withExt(path.join(REGISTRY_SRC, 'components/ai', rest.replace('components/ai/', '')));
        if (rest.startsWith('lib/')) {
          const name = rest.replace('lib/', '');
          return withExt(path.join(REGISTRY_SRC, 'lib', name)) ?? withExt(path.join(root, 'src/lib', name));
        }
      }
      if (source.startsWith('@/components/ai/'))
        return withExt(path.join(REGISTRY_SRC, 'components/ai', source.replace('@/components/ai/', '')));
      if (source === '@/components/ui' || source.startsWith('@/components/ui/')) {
        const rest = source.slice('@/components/ui'.length);
        if (rest) {
          const ours = withExt(path.join(REGISTRY_SRC, `components/ui${rest}`));
          if (ours) return ours;
        }
        return withExt(path.join(root, 'src', `${cfg.uiDir[ENGINE]}${rest}`));
      }
      // Last resort: harness src. MUST stay here — as a resolve.alias entry it runs
      // before this plugin and rewrites @/registry/{engine}/… into a dead path.
      if (source.startsWith('@/')) return withExt(path.join(root, 'src', source.slice(2)));
      return null;
    },
  };
}

// Reanimated web without Metro: the vite build doesn't run RN's Babel chain, so the
// worklets babel plugin must run here — components' useAnimatedStyle calls THROW on
// web otherwise ("used without a dependency array or Babel plugin"). Device keeps its
// Metro plugin; this transform never ships.
async function reanimatedWorkletsTransform(): Promise<object> {
  const babel = (await import('@babel/core')).default;
  const workletsMod = (await import('react-native-worklets/plugin/index.js')) as { default?: unknown };
  const worklets = workletsMod.default ?? workletsMod;
  return {
    name: 'rr-reanimated-worklets',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!/[\\/](apps[\\/]harness[\\/]src|packages[\\/]registry[\\/]src)[\\/]/.test(id)) return null;
      if (!code.includes('react-native-reanimated')) return null;
      const out = babel.transformSync(code, {
        filename: id,
        plugins: [worklets],
        parserOpts: { plugins: ['jsx', 'typescript'], sourceType: 'unambiguous' },
        babelrc: false,
        configFile: false,
        sourceMaps: false,
      });
      return out?.code ? { code: out.code, map: null } : null;
    },
  };
}

const main: StorybookConfig = {
  stories: ['../src/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: [],
  // react-docgen chokes on React Native's untranspiled Flow source (the registry tree
  // imports react-native directly) and the transform failure 404s the whole module.
  // We render pixels here, not prop tables.
  typescript: { reactDocgen: false },
  framework: { name: '@storybook/react-native-web-vite', options: {} },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    // pnpm + preserveSymlinks don't mix: expo-* internals must resolve their own
    // siblings (expo-modules-core) from the real .pnpm location, which needs vite to
    // canonicalize symlinked packages instead of serving them in harness space.
    config.resolve.preserveSymlinks = false;
    // The resolver plugin (below) hands vite absolute paths under packages/registry —
    // outside this server root — so the fs sandbox must allow them or every registry
    // import 404s on /@fs/.
    config.server = config.server ?? {};
    config.server.fs = config.server.fs ?? {};
    config.server.fs.allow = [
      ...(config.server.fs.allow ?? []),
      root,
      REGISTRY_SRC,
      path.resolve(root, '../..'),
    ];
    if (process.env.RR_RESOLVE_DEBUG) console.log('[rr-allow]', config.server.fs.allow);
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // More specific alias first — it must win over the bare '@'.
      // web-preview's react-native-webview PEER: the registry source tree takes no
      // dependency on it (same story as the Metro shims), so pin this harness's own
      // Expo-pinned install rather than trusting the fallback walk.
      'react-native-webview': path.join(root, 'node_modules', 'react-native-webview'),
      '@/components/ui': path.join(root, 'src', cfg.uiDir[ENGINE]),
      '@/components/ai': path.join(REGISTRY_SRC, 'components/ai'),
    };
    config.plugins = [...(config.plugins ?? []), registryConsumerResolve(), await reanimatedWorkletsTransform()];
    // CJS interop: invariant (pulled in via react-native-web's fbjs chain) ships no
    // ESM — pre-bundling it gives the named/default exports the browser expects.
    config.optimizeDeps = config.optimizeDeps ?? {};
    config.optimizeDeps.include = [...(config.optimizeDeps.include ?? []), 'invariant'];
    // The dep-optimizer's esbuild scan bypasses vite resolvers — give it the same
    // native-peer map or pre-bundling dies on expo-modules-core.
    const esbuildOpts = (config.optimizeDeps.esbuildOptions ??= {});
    esbuildOpts.plugins = [
      ...(esbuildOpts.plugins ?? []),
      {
        name: 'rr-expo-peers',
        setup(build: { onResolve: (o: object, cb: (a: { path: string }) => object | null | undefined) => void }) {
          build.onResolve({ filter: PEER_RE }, (args: { path: string }) => {
            const stub = PEER_STUBS[args.path];
            if (stub) return { path: stub };
            const resolved = resolveNativePeer(args.path);
            return resolved ? { path: resolved } : null;
          });
        },
      } as never,
    ];
    if (ENGINE === 'uniwind') {
      // BOTH are required. tailwindcss() compiles the @theme block; uniwind() is what
      // actually turns className into React Native styles. With only the first, stories
      // render as unstyled text — the components mount fine and nothing errors, which is
      // why this has to be checked by looking at a story, not by an HTTP 200.
      const tailwindcss = (await import('@tailwindcss/vite')).default;
      const { uniwind } = await import('uniwind/vite');
      config.plugins = [
        ...(config.plugins ?? []),
        tailwindcss(),
        uniwind({ cssEntryFile: path.join(root, 'src/global.css') }),
      ];
    }
    return config;
  },
};

export default main;
