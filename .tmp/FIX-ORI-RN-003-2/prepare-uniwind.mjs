// Throwaway: prepare a uniwind consumer (template + recipe + overlay) for the
// FIX-ORI-RN-003-2 uniwind regression leg. Not committed as a task artifact —
// lives in owned scratch. Mirrors ORI-RN-003's native-session prepareConsumer.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
const REPO = process.cwd(); // run from the worktree root
const ENGINE = 'uniwind';
const TPL = join(REPO, 'packages/docs-snippets', ENGINE);
const SHARED = join(REPO, 'packages/docs-snippets/shared');
const SCRIPT = join(REPO, 'packages/docs-snippets/commands', `${ENGINE}.sh`);

const TEMPLATE_FILES = [
  'package.json','app.json','components.json','tsconfig.json','metro.config.js',
  'global.css','uniwind-types.d.ts','app/_layout.tsx','lib/theme.ts','lib/utils.ts',
];

const run = (cmd, cwd, timeout = 30 * 60_000) => {
  const r = spawnSync(cmd, { shell: true, cwd, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  return { exit: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

const root = mkdtempSync(join(tmpdir(), `ori-rn-003-${ENGINE}-`));
for (const rel of TEMPLATE_FILES) {
  const src = join(TPL, rel);
  if (!existsSync(src)) { rmSync(root, { recursive: true, force: true }); throw new Error(`missing ${src}`); }
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  copyFileSync(src, join(root, rel));
}
console.log(`[prepare-uniwind] template -> ${root}`);

const script = run(`bash "${SCRIPT}"`, root);
console.log(`[prepare-uniwind] recipe exit=${script.exit}`);
if (script.exit !== 0) { console.log(script.out.slice(-3000)); process.exit(2); }

copyFileSync(join(TPL, 'app/index.tsx'), join(root, 'app/index.tsx'));
mkdirSync(join(root, 'shared'), { recursive: true });
for (const f of ['quickstart-screen.tsx', 'quickstart-messages.ts']) {
  copyFileSync(join(SHARED, f), join(root, 'shared', f));
}
const tsc = run('pnpm exec tsc --noEmit', root, 300_000);
console.log(`[prepare-uniwind] tsc exit=${tsc.exit}`);
if (tsc.exit !== 0) { console.log(tsc.out.slice(-3000)); process.exit(2); }

console.log(`UNIWIND_CONSUMER_ROOT=${root}`);
