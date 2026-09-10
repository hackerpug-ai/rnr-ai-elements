/**
 * Usage-snippet enrichment (FUSE-03). For every gallery item, the POPULATED
 * cell's arrow-function source, extracted byte-verbatim via ts-morph AST
 * full-text ranges from the cells batch files — the source exactly as
 * committed, never reformatted, normalized, or regex-scraped.
 *
 * The batch files under apps/example/gallery/cells/ are read-only inputs;
 * this module never writes there. Cells organize by surface (ai-chat,
 * ai-agent, ai-code, ui, lib), NOT by the 7 families — family mapping is
 * FUSE-05's, never inferred here.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type ObjectLiteralExpression, Project, PropertyAssignment, SyntaxKind } from 'ts-morph';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export const BATCH_FILES = [
  'cells/ai-chat.tsx',
  'cells/ai-agent.tsx',
  'cells/ai-code.tsx',
  'cells/ui.tsx',
  'cells/lib.tsx',
] as const;

/**
 * name -> verbatim populated-cell source for every entry in the five batch
 * files. Throws `[docs-data] usage:` naming the item when a batch entry has
 * no populated cell — the batch files are a read-only contract, so a missing
 * cell is a repo inconsistency, not a skipping matter.
 */
export function extractUsageSnippets(
  batchFiles: readonly string[] = BATCH_FILES,
): Record<string, string> {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { jsx: 4 /* ts.JsxEmit.ReactJSX — parse the .tsx batch files */ },
  });
  const out: Record<string, string> = {};
  for (const batch of batchFiles) {
    const sourceFile = project.addSourceFileAtPath(join(REPO_ROOT, 'apps/example/gallery', batch));
    for (const statement of sourceFile.getVariableStatements()) {
      if (!statement.hasExportKeyword()) continue;
      for (const declaration of statement.getDeclarations()) {
        if (!declaration.getName().endsWith('_CELLS')) continue;
        const cells = declaration.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
        if (!cells) continue;
        collectBatch(cells, out);
      }
    }
  }
  return out;
}

function collectBatch(cells: ObjectLiteralExpression, out: Record<string, string>): void {
  for (const property of cells.getProperties()) {
    if (!(property instanceof PropertyAssignment)) continue;
    // String-literal keys ('prompt-input': {…}) keep their quotes in getName().
    const name = property.getName().replace(/^['"]|['"]$/g, '');
    const states = property.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
    const populated = states?.getProperty('populated');
    const arrow =
      populated instanceof PropertyAssignment
        ? populated.getInitializerIfKind(SyntaxKind.ArrowFunction)
        : undefined;
    if (!arrow) {
      throw new Error(`[docs-data] usage: item "${name}" has no populated cell`);
    }
    const snippet = arrow.getText();
    if (snippet.length === 0) {
      throw new Error(`[docs-data] usage: item "${name}" has an empty populated cell`);
    }
    out[name] = snippet;
  }
}
