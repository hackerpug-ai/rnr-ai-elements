/**
 * Read a GitHub Actions workflow with the system Ruby YAML parser, and run
 * the real actionlint binary. No package dependency: Ruby ships on the
 * developer machine, and actionlint is the workflow linter.
 */
import { spawnSync } from 'node:child_process';

const MAX_BUFFER = 16 * 1024 * 1024;

export interface ActionlintResult {
  status: number;
  stdout: string;
  stderr: string;
}

function spawnOrThrow(
  command: string,
  args: string[],
): { status: number; stdout: string; stderr: string } {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: MAX_BUFFER });
  if (result.error) {
    throw new Error(`${command} failed to spawn: ${result.error.message}`);
  }
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

/** Parse a workflow file to JSON through the system `ruby` YAML parser. */
export function parseWorkflow(path: string): unknown {
  const result = spawnOrThrow('ruby', [
    '-ryaml',
    '-rjson',
    '-e',
    'puts JSON.generate(YAML.load_file(ARGV[0]))',
    path,
  ]);
  if (result.status !== 0) {
    throw new Error(`workflow yaml parse failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

/** Run the real `actionlint` binary on one workflow file. */
export function runActionlint(path: string): ActionlintResult {
  return spawnOrThrow('actionlint', [path]);
}
