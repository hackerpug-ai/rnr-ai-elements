// Targeted inlining proof: transform the REAL live-chat-config.ts with the REAL
// babel-preset-expo inline-env-vars plugin, in production mode (isDev: false),
// exactly as `expo export --platform web` does for the client bundle.
//
// This is the "equivalent real bundle" for a single module: same plugin, same
// production code path (`path.replaceWith(t.valueToNode(process.env[key]))`),
// same ambient `process.env` populated from apps/example/.env.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

// Load apps/example/.env into process.env (simple KEY=VALUE parser, no comments).
function loadDotEnv(path) {
  const raw = readFileSync(path, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
loadDotEnv(join(REPO_ROOT, 'apps/example/.env'));

const PRESET_BASE = join(
  REPO_ROOT,
  'node_modules/.pnpm/babel-preset-expo@57.0.10_@babel+core@7.29.7_@babel+runtime@7.29.7_expo@57.0.20_react-refresh@0.14.2/node_modules/babel-preset-expo',
);

// Resolve @babel/core and the plugin from inside babel-preset-expo's own tree,
// so their transitive deps resolve correctly.
const requireFromPreset = createRequire(join(PRESET_BASE, 'noop.js'));
const babel = requireFromPreset('@babel/core');

// The exact plugin Metro runs for production env inlining.
const { expoInlineEnvVars } = requireFromPreset('./build/plugins/inline-env-vars.js');

// @babel/preset-typescript (same version babel-preset-expo itself pins) to parse
// the .ts source; the env plugin runs after types are stripped.
const presetTypescript = requireFromPreset('@babel/preset-typescript');

const src = readFileSync(join(REPO_ROOT, 'apps/example/lib/live-chat-config.ts'), 'utf8');

const result = babel.transformSync(src, {
  filename: 'live-chat-config.ts',
  babelrc: false,
  configFile: false,
  presets: [[presetTypescript, { allowDeclareFields: true }]],
  plugins: [[expoInlineEnvVars]],
  caller: { name: 'metro', platform: 'web', isDev: false },
});

if (!result || result.code == null) {
  console.error('TRANSFORM FAILED');
  process.exit(2);
}

const out = process.argv[2] ?? '/dev/stdout';
writeFileSync(out, result.code + '\n');
console.log('transform ok ->', out);
console.log('ambient EXPO_PUBLIC_API_BASE_URL =', process.env.EXPO_PUBLIC_API_BASE_URL);
