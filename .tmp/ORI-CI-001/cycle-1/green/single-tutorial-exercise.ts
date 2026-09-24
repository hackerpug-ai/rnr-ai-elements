/**
 * Module exercise for scripts/docs-data/single-tutorial.ts (ORI-CI-001
 * cycle-1 checkpoint). Drives the real gate module through the five decision
 * shapes the AC integration drill will prove through the wired Astro build in
 * cycle 2: canonical pass, draft copy boundary, duplicate rejection, missing
 * designation rejection, and noncanonical destination rejection. This is a
 * module-behavior demonstration only — NOT the AC proof, which requires the
 * route-generator wiring and the authored `tutorial: true` designation.
 */
import assert from 'node:assert/strict';
import {
  assertSinglePublishedTutorial,
  CANONICAL_TUTORIAL_DESTINATION,
  formatTutorialViolation,
  singleTutorialViolations,
  type TutorialCollectionEntry,
} from '../../../../scripts/docs-data/single-tutorial';

const entry = (id: string, data: TutorialCollectionEntry['data']): TutorialCollectionEntry => ({
  id,
  filePath: `src/content/docs/${id}.mdx`,
  data,
});

// 1. Canonical: exactly one designated published entry at /docs/quickstart.
assertSinglePublishedTutorial([
  entry('introduction', { title: 'Introduction', draft: undefined }),
  entry('quickstart', { title: 'Quickstart', tutorial: true }),
  entry('cli', { title: 'CLI' }),
]);

// 2. Draft boundary: an unpublished designated copy does not count.
assertSinglePublishedTutorial([
  entry('quickstart', { title: 'Quickstart', tutorial: true }),
  entry('ori-ci-001-second-tutorial', { title: 'Quickstart', tutorial: true, draft: true }),
]);

// 3. Duplicate: two published designated entries — both source IDs, 2 versus 1.
const duplicate = singleTutorialViolations([
  entry('quickstart', { title: 'Quickstart', tutorial: true }),
  entry('ori-ci-001-second-tutorial', { title: 'Quickstart', tutorial: true }),
]);
assert.equal(duplicate.length, 1);
assert.equal(duplicate[0].observed, 2);
assert.equal(duplicate[0].expected, 1);
const duplicateLine = formatTutorialViolation(duplicate[0]);
assert.ok(duplicateLine.includes('"quickstart"'), duplicateLine);
assert.ok(duplicateLine.includes('"ori-ci-001-second-tutorial"'), duplicateLine);

// 4. Missing: observed 0, expected 1, canonical destination, and the source
//    ID of the published entry whose designation was removed.
const missing = singleTutorialViolations([
  entry('quickstart', { title: 'Quickstart' }),
  entry('introduction', { title: 'Introduction' }),
]);
assert.equal(missing.length, 1);
assert.equal(missing[0].observed, 0);
assert.equal(missing[0].expected, 1);
const missingLine = formatTutorialViolation(missing[0]);
assert.ok(missingLine.includes('observed 0 versus 1'), missingLine);
assert.ok(missingLine.includes(CANONICAL_TUTORIAL_DESTINATION), missingLine);
assert.ok(missingLine.includes('"quickstart"'), missingLine);

// 5. Noncanonical: the sole designated tutorial at the wrong destination.
const noncanonical = singleTutorialViolations([
  entry('ori-ci-001-moved-tutorial', { title: 'Quickstart', tutorial: true }),
]);
assert.equal(noncanonical.length, 1);
assert.equal(noncanonical[0].gate, 'canonical-destination');
assert.equal(noncanonical[0].item, 'ori-ci-001-moved-tutorial');
const noncanonicalLine = formatTutorialViolation(noncanonical[0]);
assert.ok(noncanonicalLine.includes('/docs/ori-ci-001-moved-tutorial'), noncanonicalLine);
assert.ok(noncanonicalLine.includes(CANONICAL_TUTORIAL_DESTINATION), noncanonicalLine);

// 6. The fail-closed throw propagates every violation message.
assert.throws(
  () => assertSinglePublishedTutorial([entry('quickstart', { title: 'Quickstart' })]),
  /observed 0 versus 1/,
);

console.log('single-tutorial module exercise: all six decision shapes behaved as specified');
