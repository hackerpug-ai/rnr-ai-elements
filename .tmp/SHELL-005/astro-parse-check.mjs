// SHELL-005 — real-compiler parse check for the three authored primitives.
//
// The components are not imported by any page yet (SHELL-007 consumes them),
// so `astro build` would not compile them. This script runs the SAME
// @astrojs/compiler-binding Astro 7.3.2 uses (the Rust napi compiler) over
// each authored file and fails on any error-severity diagnostic — a real
// syntax/structure validation of the exact sources the vitest lane scans.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// pnpm's strict layout hides the transitive binding from the repo root; import
// the exact copy Astro 7.3.2 resolves inside the virtual store.
const { compileAstro } = await import(
  join(process.cwd(), 'node_modules/.pnpm/node_modules/@astrojs/compiler-binding/index.js')
);

const componentsDir = join(process.cwd(), 'apps', 'docs', 'src', 'components');
const files = ['Button.astro', 'Chip.astro', 'Badge.astro'];

let failed = false;
for (const file of files) {
  const source = readFileSync(join(componentsDir, file), 'utf8');
  const result = await compileAstro(source, { filename: file });
  const errors = (result.diagnostics ?? []).filter((d) => d.severity === 1 || d.severity === 'Error');
  if (errors.length > 0) {
    failed = true;
    console.error(`FAIL ${file}`);
    for (const e of errors) console.error(`  ${e.text}`);
  } else {
    console.log(`OK   ${file} — compiled, ${result.code.length} bytes of module output`);
  }
}
process.exit(failed ? 1 : 0);
