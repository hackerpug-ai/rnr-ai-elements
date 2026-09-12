/**
 * SHELL-008 cycle-2 evidence (b): evaluate the SAME module the page frontmatter
 * and the fixed spec expectation use — apps/docs/src/lib/resolve-deps.ts —
 * over the REAL dataset entry (message's registryDependencies in
 * packages/registry/registry.json, copied verbatim into the generated
 * registry-items.json by the LOCKED FUSE-06 prebuild contract) and the REAL
 * root package.json version.
 *
 * Proves the corrected CASE 3 expectation resolves to the AC-2-named
 * reactnativereusables.com URL — the value the served panel carries — and NOT
 * to the pinned install origin (rnraielements.com) that the old hand-typed
 * literal wrongly asserted.
 */
import { readFileSync } from 'node:fs';
import { resolveRegistryDependencies } from '../../../apps/docs/src/lib/resolve-deps';

interface RawItem {
  name: string;
  registryDependencies?: string[];
  dependencies?: string[];
}

const registry = JSON.parse(
  readFileSync('packages/registry/registry.json', 'utf8'),
) as { items: RawItem[] };
const { version: VERSION } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  version: string;
};

const message = registry.items.find((item) => item.name === 'message');
if (!message) throw new Error('registry.json has no `message` entry');

const derived = resolveRegistryDependencies(message.registryDependencies, 'nativewind', VERSION);

const EXPECTED = 'https://reactnativereusables.com/r/nativewind/avatar.json';
const WRONG = 'https://rnraielements.com/r/nativewind/avatar.json';

console.log('root package.json version :', VERSION);
console.log('message.dependencies      :', JSON.stringify(message.dependencies ?? null));
console.log('message.registryDependencies[0] (raw):', message.registryDependencies?.[0]);
console.log('derived[0] (what the fixed spec now asserts):', derived[0]);

if (derived[0] !== EXPECTED) {
  throw new Error(`derived[0] ${derived[0]} !== AC-named ${EXPECTED}`);
}
if (derived[0] === WRONG) {
  throw new Error('derived[0] equals the old hand-typed literal — fix regressed');
}
console.log('PASS: derived[0] ===', EXPECTED);
console.log('PASS: derived[0] !== old wrong literal', WRONG);
