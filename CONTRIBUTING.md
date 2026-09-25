# Contributing documentation changes

This guide shows you how to prepare a documentation change — or a code change that alters documented behavior — for review. Run the three docs checks, meet the content standards, and keep registry descriptions current. This guide does not cover onboarding or the CI pipeline; it assumes you can open a pull request (PR) yourself.

## The four docs-PR criteria

Every docs PR must pass four independent criteria. Failing any one criterion fails the PR:

1. **Build green.** `pnpm --filter @rnr-ai-elements/docs build` exits 0 and writes the site under `apps/docs/dist/`.
2. **Snippet gate green.** `pnpm --filter @rnr-ai-elements/docs check:snippets` exits 0; every authored code block stays byte-identical to its committed source.
3. **Link check green.** `pnpm --filter @rnr-ai-elements/docs check:links` exits 0 over the dist your build just produced; every internal link resolves.
4. **Content-standards conformance.** Voice, terminology and page templates follow the [content standards](.spec/prds/docs-site/11-technical-requirements/12-content-standards.md): the [terminology lock](.spec/prds/docs-site/11-technical-requirements/12-content-standards.md#terminology-lock-one-canonical-term-per-concept) keeps one canonical term per concept, and the authored [page templates](.spec/prds/docs-site/11-technical-requirements/12-content-standards.md#page-templates-authored) fix each page kind's shape.

## Run the three docs checks

Run the checks in this order, from the repository root, before you request review:

```sh
pnpm --filter @rnr-ai-elements/docs build
pnpm --filter @rnr-ai-elements/docs check:snippets
pnpm --filter @rnr-ai-elements/docs check:links
```

Each command must exit 0. The build prints the ordered stages — registry:build, gallery:manifest, prebuild, check:snippets, astro build, search:index, check:links — and writes `apps/docs/dist/`. The snippet gate emits a JSON receipt that ends with `"errors": []`. The link check prints a summary line ending in `0 error(s)`; warnings on external links fail soft, and internal-link errors fail the gate.

The scripts behind these commands are bound in [`apps/docs/package.json`](apps/docs/package.json). Link verification reads the current built dist, so always build before you check links.

## Keep registry descriptions current

If your PR changes the behavior of a registry item, update that item's `description` in [`packages/registry/registry.json`](packages/registry/registry.json) in the same PR. The description is the one authored sentence per registry item, and it must move with its code.

No gate proves a sentence accurate. When you open the PR, ask the reviewer to judge whether each changed description remains accurate. Reviewers assess prose accuracy; the three checks above assess build, snippets and links.
