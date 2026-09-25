# ORI-CONT-006 — content review (observed evidence)

Status: GREEN (cycle 1) · Branch: `kb-run-sprint/sprint-05-orient-search/ORI-CONT-006` · Candidate HEAD: `c28e40c2` (trunk after the ORI-CI-002 merge `c9bb5cc5`, so all three docs scripts are real) · Captures: `.tmp/ORI-CONT-006/cycle-1/{red,green}/`

Every value below was observed during execution. The three documented commands ran as real pnpm subprocesses against this candidate; the mutation diagnostics came from real lane runs over mutated copies of the actual file, with the original restored byte-identical after each (sha256 re-verified).

## 1. Run identity and hashes (sha256)

| Artifact | Hash |
|---|---|
| `CONTRIBUTING.md` | `336c5b178e0a9a9ac525934b450719a98acae368790bfc71179bad8c3bceca77` |
| `tests/sprint-05-orient-search/contributing-content.test.ts` | `614ea9d3bb70a32397ea58b295f7c42ffc2d8167e4e118de2425aef1c8ec72fd` |
| `apps/docs/package.json` (script owner, unchanged) | `2ce4b45a038b1a589dc1c13ae631f07d903206cce8b6d57737adf6fda534a194` |
| `packages/registry/registry.json` (read-only input) | `6de89f9f6af05e11cf8f707ce73c18845e631ebbfc1309aa158bf05cad67e1e0` |
| `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md` (TR-12, read-only) | `a32cc5916e387fa8bb3bb059ad5c1de323953e2ff7c6deb7be26b4eb226444e8` |
| `pnpm-lock.yaml` (unchanged) | `87be803bb28974756c3706fb89184e25e9ee40898030d1f6416ebe40517c79eb` |
| Built `apps/docs/dist/**` tree digest (AC-2 run) | `b96e4f840aa9bcccd11d194c394e75cc5cfbb7dde0e1d05fbcd813f83019928e` |

Script bindings recorded before any command ran (`apps/docs/package.json`): `build`, `check:snippets`, `check:links`, `prebuild`, `search:index`, `preview` under `@rnr-ai-elements/docs`. The `build` script chains `registry:build → gallery:manifest → prebuild → check:snippets → astro build → search:index → check:links` (ORI-CI-002's ordered fail-stop stages).

Scratch/process ownership: mutations and expectation copies lived under `mkdtemp(join(os.tmpdir(), 'ori-cont-006-*'))`, removed in `finally`. The AC-2 build ran under the shared `node_modules/.cache/FUSE-01-docs-build.lock`. No preview server was started; port 4321 untouched.

## 2. Gates

| Gate | Command | Exit | Observed |
|---|---|---|---|
| RED (CONTRIBUTING.md parked) | `pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts` | 1 | **1 passed / 3 failed** — four-criteria, description-currency, standards-and-links each fail with `Error: [ORI-CONT-006] content failure: CONTRIBUTING.md is missing — the TR-12 docs contribution contract requires it` (content failure, not a module-load error). `ORI-CONT-006-real-docs-checks` passes in RED by design: it proves the three commands against the candidate and does not read the doc. Captured at `.tmp/ORI-CONT-006/cycle-1/red/run.txt` |
| GREEN full lane | same, `--reporter=verbose` | 0 | **4 passed / 0 failed**, seeded captures on stdout. `.tmp/ORI-CONT-006/cycle-1/green/full-run.txt` |
| GREEN per AC | `-t ORI-CONT-006-{four-criteria,real-docs-checks,description-currency,standards-and-links}` | 0 ×4 | per-AC captures in `green/` |
| Docs build | `pnpm --filter @rnr-ai-elements/docs build` | 0 | ordered stages printed; prebuild `56 items; props resolved for 39/39 component items; 9 families`; astro `Complete!`; search `64 pages cover all 63 expected destinations`; chained link-check `69 html files, 1697 links (1686 internal, 11 external), 0 error(s), 7 warning(s)` |
| Snippet gate | `pnpm --filter @rnr-ai-elements/docs check:snippets` | 0 | JSON receipt ends `"errors": []`; compiler receipts record real `tsc` runs (nativewind/uniwind consumer contexts + live-chat `tsconfig.live-chat.json`, typescript 6.0.3, exit 0 each) |
| Link gate | `pnpm --filter @rnr-ai-elements/docs check:links` | 0 | `69 html files, 1697 links (1686 internal, 11 external), 0 error(s), 7 warning(s)`; the 7 warnings are the pre-existing "Edit this page → GitHub blob/main" 404-until-merge class (fail soft) |
| Typecheck | `pnpm typecheck` | 0 | root `tsc --noEmit` + registry clean (after `registry:build`/`gallery:manifest`/`prebuild` hydration) |
| Lint | `./node_modules/.bin/biome ci .` | 0 | `pnpm lint` itself dies locally with `Linter process terminated abnormally (possibly out of memory)` (exit 254, the known local quirk); the biome binary is the honest gate. One format error in the task test file was fixed (`biome check --write`, import wrap); remaining findings are the pre-existing warnings in untouched trunk files `authored-snippet-gate.test.ts` (8) and `live-example-proof.test.ts` (4) |
| Scope | `git status --porcelain` | — | exactly `CONTRIBUTING.md`, the task test file, this evidence file, plus `git add -f .tmp/ORI-CONT-006` |

## 3. AC-1 — four independent criteria and the three exact commands (observed)

- The lane cross-checks the checklist against TR-12 and `apps/docs/package.json`, never against the doc under test: the four criterion phrases (`build green`, `link check green`, `snippet gate green`, `content-standards conformance`) are required to appear verbatim in TR-12's Docs-PR criteria line (they do), then required in CONTRIBUTING.md.
- All three exact commands present: `pnpm --filter @rnr-ai-elements/docs build`, `… check:snippets`, `… check:links`.
- Mutation controls (inside the test, over real copies in owned scratch): removing each criterion line and mutating `check:snippets` → `check:snippet` each fails; the unchanged copy passes; the real file re-read after every mutation is byte-identical.
- Observed live diagnostic for the command mutation (real lane run over a mutated copy, `.tmp/ORI-CONT-006/cycle-1/mutation-check-snippet.txt`):
  > `[ORI-CONT-006] documented command missing: "pnpm --filter @rnr-ai-elements/docs check:snippets"; found mutated "check:snippet" instead`

## 4. AC-2 — the documented commands run against the candidate (observed)

Three real subprocess receipts (command, cwd, exit) captured on stdout by the lane (`.tmp/ORI-CONT-006/cycle-1/green/real-docs-checks.txt`):

```json
[{"command":"pnpm --filter @rnr-ai-elements/docs build","cwd":"<candidate root>","exit":0},
 {"command":"pnpm --filter @rnr-ai-elements/docs check:snippets","cwd":"<candidate root>","exit":0},
 {"command":"pnpm --filter @rnr-ai-elements/docs check:links","cwd":"<candidate root>","exit":0}]
```

- The test deletes `apps/docs/dist` before spawning build (under the FUSE-01 lock), so the artifacts are provably this run's: `apps/docs/dist/docs/introduction/index.html` exists after the build (13.5K observed).
- Dist binding: the tree digest taken after build equals the digest re-taken after check:links (`b96e4f84…9928e`) — the link gate read exactly the dist this build produced and wrote nothing.
- Snippet receipt: stdout ends with `"errors": []`; the receipt's compiler entries name the real tsc executables, configs and `exit: 0`.
- Link receipt: summary line matches `link-check: 69 html files, 1697 links (1686 internal, 11 external), 0 error(s), 7 warning(s)`.

## 5. AC-3 — registry-description currency (observed)

- The rule as written (quoted from CONTRIBUTING.md):
  > If your PR changes the behavior of a registry item, update that item's `description` in [`packages/registry/registry.json`](packages/registry/registry.json) in the same PR. The description is the one authored sentence per registry item, and it must move with its code.
  >
  > No gate proves a sentence accurate. When you open the PR, ask the reviewer to judge whether each changed description remains accurate. Reviewers assess prose accuracy; the three checks above assess build, snippets and links.
- The lane requires all five contract markers (`packages/registry/registry.json`, `description`, `behavior`, `reviewer`, `accura`) — the behavior-change trigger, the description update, and accuracy assigned to reviewers, with no claim that prose accuracy is machine-gated (the doc states the opposite).
- One real registry item captured alongside the rule (first item of the real file):
  > `{"name":"shimmer","description":"The still-generating signal, applied to text. React Native has no background-clip:text, so this reuses RNR Skeleton's exact pulse (1000ms, opacity 1->0.5) rather than inventing a tempo. Gated on reduced motion."}`
- Mutation control: a copy with the currency section removed fails with description-currency diagnostics naming each missing requirement (observed live, `.tmp/ORI-CONT-006/cycle-1/mutation-currency.txt`):
  > `[ORI-CONT-006] description-currency rule incomplete: names the registry file packages/registry/registry.json (marker "packages/registry/registry.json" absent)`
  > `[ORI-CONT-006] description-currency rule incomplete: assigns accuracy judgment to the reviewer (marker "reviewer" absent)`

  The original CONTRIBUTING.md was restored byte-identical after the run (sha256 `336c5b17…ceca77` re-verified).

## 6. AC-4 — canonical links, fragments, rendered review (observed)

- Every local link resolves from disk. The resolved target set includes the three required owners: `apps/docs/package.json`, `packages/registry/registry.json`, `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`.
- The two fragment anchors resolve against the standards file's real headings: `#terminology-lock-one-canonical-term-per-concept` → "Terminology lock (one canonical term per concept)"; `#page-templates-authored` → "Page templates (authored)" (GitHub-style slug check over the actual heading lines).
- Rendered-review findings (author pass over the rendered Markdown; the independent reviewer pass follows): the page is a short contribution how-to — scope + non-scope in the opening paragraph, three sections, ~30 lines, no onboarding lesson and no duplicated standards text. Voice/terminology checks:
  - Active voice, short sentences, second person, present tense throughout; no "simply/just/easy/obviously".
  - PR defined on first use: "a pull request (PR)".
  - Canonical terms: "registry item" and "description" in the currency rule (never "component" for the shippable unit); "content standards" links the terminology lock rather than restating the table.
  - Imperative steps with concrete expected results for each of the 3 commands: build "exits 0 and writes the site under `apps/docs/dist/`"; snippet gate "exits 0; every authored code block stays byte-identical to its committed source" plus the observable receipt shape (`"errors": []`); link check "exits 0 over the dist your build just produced" plus the `0 error(s)` summary line and the soft-fail warning rule.

## 7. Stub scan and deviation notes

- No mocks, canned output, static approvals, skips or test-only product seams anywhere in the touched files: the lane reads real bytes, spawns real pnpm subprocesses, and its negative controls mutate real copies in owned scratch.
- `pnpm lint` cannot run locally (linter OOM, exit 254 — the documented local quirk); `./node_modules/.bin/biome ci .` exit 0 is the recorded lint gate, with the 12 pre-existing warnings enumerated in §2 (files outside this task's writeAllowed).
- RED evidence for a TDD-skipped docs task is the missing-doc state (§2): the three content ACs fail with a content-failure diagnostic while the command-proof AC legitimately passes, since the three commands are real on the candidate regardless of the doc.
- The seven link-check warnings and the "Edit this page" GitHub blob/main 404s are the known pre-existing class documented by ORI-CI-002 and ORI-CONT-003; external links fail soft by design.
