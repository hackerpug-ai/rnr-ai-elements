# FIX-FUSE-01-1 evidence — cycle-1

## RED (before biome.json change)

- `red/vitest.out`, `red/vitest.exit` — target test run pre-fix: vitest exit=1, 1 failed.
  Failure message embeds the raw gate output: `biome ci apps/docs` →
  "Checked 0 files … No files were processed in the specified paths", exit 1.

## GREEN (after biome.json change)

- `green/vitest.out`, `green/vitest.exit` — same test post-fix: vitest exit=0,
  1 passed. The test itself asserts, against the real biome binary:
  clean run exit 0 with >1 files checked; planted broken scratch file → exit 1
  naming the file; cleanup → exit 0 at the same file count.
- `ci-final3.out` — final `biome ci apps/docs`: exit=0, "Checked 4 files".
- `sprint-suite-final.out` — full sprint suite: 4 files / 6 tests passed, exit=0.
- `typecheck.out` — `pnpm typecheck`: exit=0.
- `ci-touched.out` — biome over biome.json + the new test file: exit=0.
- `ci-after.out`, `ci-after2.out`, `ci-final.out`, `ci-final2.out` — intermediate gate
  runs that motivated the two generated-path exclusions (gallery-manifest.json format
  drift; `.astro` build artifacts breaking determinism).

## Notes

- biome 2.5.11: `//` comments inside `files.includes` silently make the run check
  0 files; a trailing `/**` negation (`!dir/**`) also zeroes the list. Both were
  reproduced experimentally; the committed config avoids both forms.
