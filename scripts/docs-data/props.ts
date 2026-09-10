/**
 * Props enrichment (FUSE-03). ts-morph extraction of each registry:component
 * item's DECLARED props surface: [{name, type, default, description}].
 *
 * - Runs against the real registry package's tsconfig context (the same one
 *   `pnpm --filter @rnr-ai-elements/registry typecheck` uses), so the
 *   `@/registry/{engine}/…` aliases in registry sources resolve through its
 *   paths and its types/*.d.ts boundary — or fail loudly below.
 * - Type text is the checker's FULL text (`Type.getText(sourceFile)`), never
 *   truncated; rendering concerns belong to the pages (TR-08 R7).
 * - A prop whose resolved type is the checker's error type
 *   (`intrinsicName === 'error'` — an unimported/nonexistent type reference,
 *   including one collapsed into a union) is unresolved: throw, naming item
 *   and prop. A written `any` is 'any', not 'error', and passes. FUSE-04's
 *   gate consumes this throw directly — never catch-and-default.
 * - Only `registry:component` items are resolved; ui/lib items get null by
 *   contract and are never parsed.
 * - Base types via type references (`Omit<FlatListProps<T>, …>` and friends)
 *   are deliberately NOT restated: the table documents the item's own declared
 *   props, which is what a consumer can actually pass beyond the base.
 *
 * Build-time only (TR-06): ts-morph is a root devDependency, never shipped.
 */
import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  BindingElement,
  InterfaceDeclaration,
  IntersectionTypeNode,
  type Node,
  ParenthesizedTypeNode,
  Project,
  type PropertySignature,
  type SourceFile,
  SyntaxKind,
  TypeAliasDeclaration,
  TypeLiteralNode,
} from 'ts-morph';

export type RegistryItem = { name: string; type: string; files: { path: string }[] };
export type PropInfo = {
  name: string;
  type: string;
  default: string | null;
  description: string | null;
};

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTRY_DIR = join(REPO_ROOT, 'packages/registry');

/**
 * The real workspace tsconfig context for registry sources. Files are added
 * on demand; the ambient boundary declarations in types/ ride along so the
 * `@/registry/{engine}/…` imports resolve exactly as the package's own tsc
 * sees them.
 */
export function createDocsProject(): Project {
  const project = new Project({
    tsConfigFilePath: join(REGISTRY_DIR, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths(join(REGISTRY_DIR, 'types/**/*.d.ts'));
  return project;
}

export function loadRegistryItems(
  registryJson = join(REGISTRY_DIR, 'registry.json'),
): RegistryItem[] {
  return (JSON.parse(readFileSync(registryJson, 'utf8')) as { items: RegistryItem[] }).items;
}

export function extractProps(
  items: RegistryItem[],
  project: Project = createDocsProject(),
): Record<string, PropInfo[] | null> {
  const out: Record<string, PropInfo[] | null> = {};
  for (const item of items) {
    out[item.name] = item.type === 'registry:component' ? extractPropsForItem(item, project) : null;
  }
  return out;
}

export function extractPropsForItem(item: RegistryItem, project: Project): PropInfo[] {
  const filePath = isAbsolute(item.files[0].path)
    ? item.files[0].path
    : join(REPO_ROOT, item.files[0].path);
  const sourceFile = project.addSourceFileAtPath(filePath);
  const declaration = findPropsDeclaration(sourceFile, item.name);
  if (!declaration) return []; // No declared props surface — empty-resolved, not an error.

  const props = collectPropertySignatures(declaration);
  const defaults = componentDefaults(sourceFile, declaration);
  return [...props.values()].map((prop) => {
    const type = prop.getType().getText(sourceFile);
    // Unresolved = the checker's error type (intrinsicName 'error'). A
    // written `any` is 'any', not 'error' — only the error type throws.
    const intrinsic = (prop.getType().compilerType as { intrinsicName?: string }).intrinsicName;
    if (intrinsic === 'error') {
      throw new Error(
        `[docs-data] props: item "${item.name}" prop "${prop.getName()}" has unresolved type`,
      );
    }
    return {
      name: prop.getName(),
      type,
      default: defaults.get(prop.getName()) ?? null,
      description: prop.getJsDocs()[0]?.getDescription().trim() || null,
    };
  });
}

function pascalCase(name: string): string {
  return name
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join('');
}

/**
 * Pick the item's props declaration among the file's top-level `*Props`
 * interfaces/aliases: exact `<Pascal>Props` wins, else the longest candidate
 * base name the item's PascalCase name starts with (open-in-chat -> OpenIn,
 * declared as OpenInProps). Both rules are deterministic.
 */
function findPropsDeclaration(
  sourceFile: SourceFile,
  itemName: string,
): InterfaceDeclaration | TypeAliasDeclaration | undefined {
  const declarations = sourceFile
    .getStatements()
    .filter(
      (s): s is InterfaceDeclaration | TypeAliasDeclaration =>
        (s instanceof InterfaceDeclaration || s instanceof TypeAliasDeclaration) &&
        s.getName().endsWith('Props'),
    );
  const pascal = pascalCase(itemName);
  const exact = declarations.find((d) => d.getName() === `${pascal}Props`);
  if (exact) return exact;
  return declarations
    .filter((d) => pascal.startsWith(d.getName().slice(0, -'Props'.length)))
    .sort((a, b) => b.getName().length - a.getName().length)[0];
}

/** Property signatures of the declaration, source order, first occurrence wins. */
function collectPropertySignatures(
  declaration: InterfaceDeclaration | TypeAliasDeclaration,
): Map<string, PropertySignature> {
  const out = new Map<string, PropertySignature>();
  const add = (prop: PropertySignature) => {
    if (!out.has(prop.getName())) out.set(prop.getName(), prop);
  };
  const walk = (node: Node): void => {
    if (node instanceof IntersectionTypeNode) {
      for (const member of node.getTypeNodes()) walk(member);
    } else if (node instanceof ParenthesizedTypeNode) {
      walk(node.getTypeNode());
    } else if (node instanceof TypeLiteralNode) {
      for (const prop of node.getProperties()) add(prop);
    }
    // TypeReference bases (Omit<ComponentProps<…>>) are skipped by design — see header.
  };
  if (declaration instanceof InterfaceDeclaration) {
    for (const prop of declaration.getProperties()) add(prop);
  } else {
    const typeNode = declaration.getTypeNode();
    if (typeNode) walk(typeNode);
  }
  return out;
}

/** Destructuring defaults from the component function (`{ x = 50 }: XProps`). */
function componentDefaults(
  sourceFile: SourceFile,
  declaration: InterfaceDeclaration | TypeAliasDeclaration,
): Map<string, string> {
  const out = new Map<string, string>();
  const componentName = declaration.getName().slice(0, -'Props'.length);
  const param = sourceFile.getFunction(componentName)?.getParameters()[0];
  const pattern = param?.getFirstChildByKind(SyntaxKind.ObjectBindingPattern);
  if (!pattern) return out;
  for (const element of pattern.getElements()) {
    if (!(element instanceof BindingElement)) continue;
    const initializer = element.getInitializer();
    if (initializer) out.set(element.getNameNode().getText(), initializer.getText());
  }
  return out;
}

// CLI: run the real extractor over one item's source file. Success prints the
// JSON dataset; an unresolved type exits 1 with the [docs-data] error on
// stderr — the fail-closed drill FUSE-04 re-raises (check-tokens.ts pattern).
function main(argv: string[] = process.argv.slice(2)): void {
  const file = readArg(argv, '--file');
  const name = readArg(argv, '--name');
  if (!file || !name) {
    console.error(
      'usage: tsx scripts/docs-data/props.ts --file <component-source> --name <item-name>',
    );
    process.exit(2);
  }
  const result = extractProps([{ name, type: 'registry:component', files: [{ path: file }] }]);
  console.log(JSON.stringify(result, null, 2));
}

function readArg(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
