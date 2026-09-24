import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The authored docs collection (CAP-DOCS-01 / data schema docs_page).
 *
 * Glob-loaded from `src/content/docs/**` as `.md` and `.mdx` (MDX only where
 * in-prose composition is needed). Frontmatter is validated by the real Astro
 * loader BEFORE any routing, navigation, or search derivation: title and
 * description are required strings, section is one of the three declared
 * values, order is a number for deterministic sorting, draft is an
 * optional boolean that excludes an entry from every publication consumer,
 * and tutorial is an optional boolean designating the entry as the site's
 * single tutorial (exactly one published entry may carry it, and its
 * destination must be /docs/quickstart — enforced by
 * scripts/docs-data/single-tutorial.ts over the complete published collection).
 * A schema violation fails the build with the collection, source ID, and the
 * offending field path — never a silent acceptance.
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['getting-started', 'guides', 'porting']),
    order: z.number(),
    draft: z.boolean().optional(),
    tutorial: z.boolean().optional(),
  }),
});

export const collections = { docs };
