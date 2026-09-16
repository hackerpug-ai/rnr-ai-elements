<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search · human-authored FIX charter 2026-09-15 -->

# FIX-ORI-DEP-001-1: resolve self-referential registryDependencies from the canonical unversioned host (rnraielements.com) instead of immutable git tags

> Status: Backlog

> Assignee: react-native-reusables-implementer (implementer) · react-native-reusables-reviewer (reviewer)
> Priority: P1 · Points: 3 · Type: FIX · Wave: C (unblocks the ORI-RN-003 commit)
> Proposed By: human (release-shape decision, 2026-09-15)
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Repo: rnr-ai-elements
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-15
> AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

## What this does

Changes the **self-referential** `registryDependencies` entries from immutable GitHub tag URLs to
same-host, unversioned canonical URLs, and deletes the `{version}` substitution machinery that pinned
them. Concretely, every self-dependency template changes from

```
https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v{version}/public/r/{engine}/{item}.json
```

to

```
https://rnraielements.com/r/{engine}/{item}.json
```

This is exactly RNR's own distribution shape: one canonical host (`rnraielements.com`), unversioned
`/r/{engine}/{item}.json` paths, no `{version}` token, no versioned paths, no registry index. RNR's
dependencies (which we already reference as `https://reactnativereusables.com/r/{engine}/…`) stay
untouched — they were always unversioned same-host and remain so.

The verified live defect: the deployed canonical registry at
`https://rnraielements.com/r/nativewind/prompt-input.json` still pins its `input-group` dependency to
`https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/input-group.json`,
and tag `v0.2.1` (`7169a56`) does not contain the `FIX-ORI-RN-003-2` fix. A merged registry fix reaches no
consumer until someone cuts a new tag AND redeploys — the release treadmill that blocks ORI-RN-003. After
this FIX, `prompt-input.json`'s `input-group` dependency resolves to
`https://rnraielements.com/r/nativewind/input-group.json`, and a fix propagates by deploying the host.

## Why

Every self-referential dependency URL in `packages/registry/registry.json` is templated with
`{version}`, and `packages/registry/scripts/build-registry.ts` substitutes it from `package.json`'s
`version` at build time. Measured (this worktree, `git rev-parse HEAD` = `552a95a9fafc1df859090af30b29f7d03f92c4aa`):

| fact | value |
|---|---|
| registry items | 56 |
| items carrying a self-dependency | 32 |
| self-dependency URL occurrences | 64 (all match the `v{version}` template exactly) |
| distinct self-dependency item names | 19 (`button-group, code-block, command, empty, input-group, item, markdown, mono, persona, reasoning-lifecycle, sheet, shimmer, slider, snippet, stack-trace-parser, status, table, task, url`) |
| items carrying an RNR dependency | 48 (146 URL occurrences, 14 distinct RNR dep names — unversioned same-host, unchanged) |

The `build-registry.ts` header itself already documents the asymmetry: RNR's deps are "NEVER
version-substituted — pinning those would freeze a consumer to an RNR snapshot we do not control." The
same reasoning applies to OUR self-deps: pinning them to `v{version}` freezes a consumer to a snapshot
the tag must be cut and redeployed to move. The human's decision is to make our self-deps behave exactly
like RNR's — same-host, unversioned, canonical — so the deploy is the release.

**Consequence for `{version}` machinery.** Once no URL contains `{version}`, the `VERSION_TOKEN`,
`currentVersion()` guard, and the `version` parameter on `resolveEngine`/`buildItem` are dead code whose
only purpose was tag-pinning. They are REMOVED (not left inert), matching RNR, which has no version token
for registry dependencies at all. The `{engine}` token and substitution stay — the per-engine fan-out is
the one genuine transformation. The removal is contained: no code outside `build-registry.ts`,
`tests/build-registry.test.ts`, and `scripts/check-registry-fresh.ts` imports `VERSION_TOKEN`,
`currentVersion()`, `buildItem`, or `resolveEngine` (verified by grep; `scripts/check-registry-fresh.ts`
calls `buildItem(item, engine, readFile)` with three args, which stays valid after the `version` parameter
is dropped).

## How to verify

**RED (replay the live defect before touching source):**

Fetch the live canonical registry and confirm the stale pin and the pre-fix bytes:

```bash
curl -s https://rnraielements.com/r/nativewind/prompt-input.json | python3 -c 'import sys,json; print(json.load(sys.stdin)["registryDependencies"])'
# expected: ["…/reactnativereusables.com/r/nativewind/button.json", "…/reactnativereusables.com/r/nativewind/icon.json",
#            "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/input-group.json"]
curl -s https://rnraielements.com/r/nativewind/input-group.json | grep -c 'ring-2'
# expected: a non-zero count (the served input-group source still carries the ring-2 crash trigger)
```

Record the raw response bytes (or `sha256`) of both endpoints under
`tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/red/`. The RED is the live URL serving the
`v0.2.1`-pinned, `ring-2`-bearing item.

**GREEN (after the change, rebuild, and redeploy):**

1. `pnpm registry:build` regenerates `public/r/{nativewind,uniwind}/*.json` with every self-dependency as
   `https://rnraielements.com/r/{engine}/{item}.json`; `pnpm check:registry` exits 0.
2. The updated test suite passes — `pnpm test` (vitest logic tier) and `pnpm e2e:docs` (Playwright lane);
   `pnpm typecheck`, `pnpm lint`, `pnpm check:tokens`, `pnpm check:contract` all exit 0.
3. Build the docs, redeploy the already-configured assets-only Worker, and fetch the live URL (AC-3).

## Scope

- WRITE-ALLOWED:
  - packages/registry/registry.json (MODIFY — the 64 self-dependency URLs)
  - packages/registry/scripts/build-registry.ts (MODIFY — remove the `{version}` machinery + update comments)
  - public/r/nativewind/** (REGENERATED by `pnpm registry:build`, commit)
  - public/r/uniwind/** (REGENERATED by `pnpm registry:build`, commit)
  - tests/build-registry.test.ts (MODIFY — live assertions)
  - tests/sprint-02-shell-hero/resolve-deps.test.ts (MODIFY — live assertions)
  - tests/sprint-02-shell-hero/dependency-panels.spec.ts (MODIFY — live assertions)
  - scripts/docs-data/prebuild.ts (MODIFY — comment-only: the SHELL-006 gate comment and the
    `v{version}` pin comment)
  - tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/** (evidence — RED/GREEN)
  - .tmp/FIX-ORI-DEP-001-1/** (owned scratch)

- writeProhibited (explicit — frozen historical evidence and out-of-scope surfaces):
  - tests/sprint-01/install-evidence.test.ts (FROZEN — reads committed `.tmp/TASK-F3/cycle-1/` logs; see
    CRITICAL CONSTRAINTS)
  - .tmp/** (committed scratch/logs, including `.tmp/TASK-F3/**`), design/goldens/** (frozen sprint-01 RED logs)
  - .spec/** (task charters, gate-plan, human-flows), .kb-run-sprint/** (verdicts)
  - tests/sprint-01/install-core.test.sh, tests/sprint-01/install-dirty-app.test.sh (historical `v0.1.0`
    tag install flow — see OPEN QUESTIONS)
  - apps/example/gallery/cells/*.tsx (demo content showing the `v0.2.0` tag install command / web preview /
    icon URIs — NOT registry self-deps)
  - apps/docs/src/lib/resolve-deps.ts (generic resolver — no functional change; its `{version}` replace is
    a no-op once no URL carries the token)
  - apps/docs/src/pages/components/[item].astro (only a stale inline comment; the served HTML is already
    correct through the shared resolver)
  - packages/registry/src/** (no component source changes)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- **The ONLY semantic change is the self-dependency host/version shape.** Self-referential
  `registryDependencies` become `https://rnraielements.com/r/{engine}/{item}.json` — same-host, unversioned,
  canonical. No other field, component, or behavior changes.
- **RNR's own dependencies are untouched.** `https://reactnativereusables.com/r/{engine}/{item}.json`
  entries (146 occurrences, 14 distinct names) must remain byte-identical. The TC-6 distinct-name count
  (14) must not move.
- **`{engine}` substitution stays.** The per-engine fan-out (`nativewind`/`uniwind`) is unchanged; only the
  `{version}` substitution is removed. `rewriteSource` (source alias rewrite) is unchanged.
- **Remove the `{version}` machinery entirely, do not leave it inert.** Delete `VERSION_TOKEN`, `currentVersion()`,
  the `version` parameter of `resolveEngine`/`buildItem`, and the `version = currentVersion()` default. Update
  the file header comment (lines 8–11) and the `buildItem` doc comment (lines 98–107) so neither claims a
  release tag is substituted. Do NOT invent a replacement version mechanism, a versioned path, or a registry
  index — the host deploy IS the release.
- **Do NOT touch frozen historical evidence.** `tests/sprint-01/install-evidence.test.ts` asserts on
  committed logs under `.tmp/TASK-F3/cycle-1/{green,red}/` that record a past `v0.1.0`-tag install. Those
  logs are immutable artifacts; the test reads them and must keep passing against them. `design/goldens/**`
  and `.spec/**` are likewise frozen. A `grep -rn "raw.githubusercontent.com/hackerpug-ai"` over the repo
  will STILL match `.tmp/**`, `design/goldens/**`, `.spec/**`, `tests/sprint-01/*.sh`, and
  `apps/example/gallery/cells/*.tsx` after this FIX — that is expected and NOT a defect; AC-1 scopes its
  assertion to `registry.json` and the regenerated `public/r/**` only.
- **Keep the RNR CLI install contract working.** `registryDependencies` remain absolute `https://` URLs
  (the short-name → shadcn-web-DOM trap stays rejected). The `buildItem` absolute-URL guard (throws on a
  non-`https://` dep) is unchanged and must still fire for a bare short name.
- **The deploy is an assets-only publish of the already-configured Worker** `rnr-ai-elements-docs`
  (`apps/docs/wrangler.jsonc`): assets directory `./dist`, apex route `rnraielements.com`, no application
  entrypoint, no bindings, no new routes, no cache policy, no Pages config. Do NOT edit `wrangler.jsonc`.
- **Generated artifacts are derived, never hand-edited.** `public/r/{engine}/*.json` are produced by
  `pnpm registry:build`; the per-engine `public/r/{engine}/registry.json` index carries only
  name/type/title and is regenerated too. `apps/docs/public/r/**` and `apps/docs/dist/**` are gitignored
  build output, not committed.

### DONE WHEN

- AC-1: every self-referential `registryDependencies` in `registry.json` and in the regenerated
  `public/r/**` is `https://rnraielements.com/r/{engine}/{item}.json`; no `raw.githubusercontent.com` and no
  `v{version}` remain in self-deps; RNR's own deps are unchanged.
- AC-2: the repo is consistent — `pnpm registry:build && pnpm check:registry` exit 0; `pnpm test`
  (vitest logic tier) and `pnpm e2e:docs` (Playwright lane) pass with the updated assertions;
  `pnpm typecheck`, `pnpm lint`, `pnpm check:tokens`, `pnpm check:contract` pass; `git diff --name-only`
  lists only the allowed paths.
- AC-3: after the docs build and an assets-only `wrangler deploy`, a real public HTTPS fetch of
  `https://rnraielements.com/r/nativewind/prompt-input.json` shows its `input-group` dependency resolving to
  `https://rnraielements.com/r/nativewind/input-group.json`, and that URL returns the FIXED source (no
  `ring-2`).

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: every self-dependency resolves from the canonical unversioned host; RNR deps untouched**

  GIVEN `packages/registry/registry.json` carrying 64 self-dependency URLs of the form
  `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v{version}/public/r/{engine}/{item}.json`
  WHEN each is rewritten to `https://rnraielements.com/r/{engine}/{item}.json` and `pnpm registry:build`
  runs THEN every self-dependency in `registry.json` and in every regenerated `public/r/{nativewind,uniwind}/*.json`
  matches `^https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[\w.-]+\.json$`; no self-dependency
  contains `raw.githubusercontent.com`, `v{version}`, or `/main/`; and every
  `https://reactnativereusables.com/r/{engine}/{item}.json` entry is byte-identical to before (14 distinct
  names, 146 occurrences unchanged).

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `git diff` + `pnpm registry:build` over the real registry.json
  VERIFY: `git diff packages/registry/registry.json && pnpm registry:build && node -e '…count self vs RNR deps…'`
  TEST_FILE: packages/registry/registry.json + public/r/{nativewind,uniwind}/** · TEST_FUNCTION: (self-dep host/version shape; RNR deps unchanged)

**AC-2: the repo is consistent — freshness, tests, and allowed-path diff**

  GIVEN the rewritten registry and the removed `{version}` machinery WHEN `pnpm registry:build && pnpm check:registry`
  run THEN both exit 0 (the shipped `public/r/**` matches a fresh in-memory build), and the updated logic-tier
  suite `pnpm test` (vitest `tests/**/*.test.ts` — covers `build-registry.test.ts` and
  `resolve-deps.test.ts`), the Playwright lane `pnpm e2e:docs` (covers `dependency-panels.spec.ts`), plus
  `pnpm typecheck`, `pnpm lint`, `pnpm check:tokens`, `pnpm check:contract` all exit 0 with the updated
  assertions, and `git diff --name-only` lists only the WRITE-ALLOWED paths.

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `pnpm registry:build` + `pnpm check:registry` + vitest + playwright + tsc + biome + token/contract gates
  VERIFY: `pnpm registry:build && pnpm check:registry && pnpm test && pnpm e2e:docs && pnpm typecheck && pnpm lint && pnpm check:tokens && pnpm check:contract && git diff --name-only`
  TEST_FILE: public/r/** + the modified tests · TEST_FUNCTION: (freshness + the updated assertions)

**AC-3: the live canonical registry serves the unversioned self-dep and the fixed source (the real proof)**

  GIVEN the docs built and the already-configured assets-only Worker redeployed WHEN a real public HTTPS
  fetch hits `https://rnraielements.com/r/nativewind/prompt-input.json` THEN its `registryDependencies`
  contains `https://rnraielements.com/r/nativewind/input-group.json` (no `raw.githubusercontent.com`, no
  `v0.2.1`), and a fetch of `https://rnraielements.com/r/nativewind/input-group.json` returns the FIXED
  source (0 occurrences of `ring-2`). RED before the change: the live `prompt-input.json` pins
  `…/v0.2.1/public/r/nativewind/input-group.json` and the served `input-group.json` carries `ring-2`.
  Capture the raw response bytes/hashes for both RED and GREEN under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/`.

  EVIDENCE — the deploy proof must be a REAL public fetch, not a canned receipt and not mocked HTTP. Record
  the `wrangler whoami` account, the `wrangler deploy` output (version ID), and the `curl` response bodies
  (with `sha256`) for both endpoints. No stub, no localhost host substitution, no simulated deployment.

  FLOW_REF: None · TEST_TIER: e2e · verification_service: real Cloudflare account + `wrangler deploy` of the configured Worker + public HTTPS fetch of rnraielements.com
  VERIFY: `pnpm --dir apps/docs exec wrangler whoami && pnpm --dir apps/docs exec wrangler deploy --config wrangler.jsonc && curl -s https://rnraielements.com/r/nativewind/prompt-input.json && curl -s https://rnraielements.com/r/nativewind/input-group.json | grep -c ring-2`
  TEST_FILE: (live public HTTP responses, byte/hash-captured under evidence) · TEST_FUNCTION: (unversioned self-dep + fixed source, documented in evidence)

### TEST CRITERIA

- TC-1 → AC-1: `git diff packages/registry/registry.json` shows only the 64 self-dependency lines changing
  from the `v{version}` GitHub template to `https://rnraielements.com/r/{engine}/{item}.json`; every RNR
  `reactnativereusables.com` line is untouched; no `raw.githubusercontent.com` or `v{version}` remains in
  `registry.json`.
- TC-2 → AC-1: after `pnpm registry:build`, a scan of `public/r/{nativewind,uniwind}/*.json` finds 0
  self-deps containing `raw.githubusercontent.com`, `v{version}`, or `/main/`, and 64 (32 items × 2 engines)
  self-deps matching `https://rnraielements.com/r/(nativewind|uniwind)/[\\w.-]+.json`; the 14 distinct RNR
  dep names are unchanged (146 occurrences, 48 items).
- TC-3 → AC-2: `pnpm registry:build && pnpm check:registry` exits 0; the regenerated `public/r` differs
  from HEAD only in the `registryDependencies` arrays (no component `content` or manifest metadata drift).
- TC-4 → AC-2: the updated `tests/build-registry.test.ts` and `tests/sprint-02-shell-hero/resolve-deps.test.ts`
  pass under `pnpm test` (vitest `tests/**/*.test.ts`), and `tests/sprint-02-shell-hero/dependency-panels.spec.ts`
  passes under `pnpm e2e:docs` (Playwright `tests/**/*.spec.ts`); `pnpm typecheck`, `pnpm lint`,
  `pnpm check:tokens`, `pnpm check:contract` exit 0; `git diff --name-only` lists only the WRITE-ALLOWED
  paths (not `.tmp/`, not `design/goldens/`, not `.spec/`, not `tests/sprint-01/install-evidence.test.ts`).
- TC-5 → AC-3: RED (pre-change) evidence shows the live `prompt-input.json` pinning
  `…/v0.2.1/…/input-group.json` and the live `input-group.json` carrying `ring-2`; GREEN (post-deploy)
  evidence shows `prompt-input.json`'s `input-group` dependency as
  `https://rnraielements.com/r/nativewind/input-group.json` and that URL serving 0 `ring-2` occurrences,
  with the raw response bytes/hashes captured under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/`.

### SCOPE (file-level write permissions)

- packages/registry/registry.json (MODIFY)
- packages/registry/scripts/build-registry.ts (MODIFY)
- public/r/nativewind/** (REGENERATED, commit)
- public/r/uniwind/** (REGENERATED, commit)
- tests/build-registry.test.ts (MODIFY)
- tests/sprint-02-shell-hero/resolve-deps.test.ts (MODIFY)
- tests/sprint-02-shell-hero/dependency-panels.spec.ts (MODIFY)
- scripts/docs-data/prebuild.ts (MODIFY — comment-only)
- tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/** (evidence)
- .tmp/FIX-ORI-DEP-001-1/** (owned scratch)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- tokens: `pnpm check:tokens`
- contract: `pnpm check:contract`
- registry: `pnpm registry:build && pnpm check:registry`
- test (logic tier): `pnpm test` — covers `tests/**/*.test.ts` (`build-registry.test.ts`, `resolve-deps.test.ts`)
- test (playwright lane): `pnpm e2e:docs` — covers `tests/**/*.spec.ts` (`dependency-panels.spec.ts`)

### DEPENDENCIES

- Depends on: ORI-DEP-001 (the initial Workers deployment + canonical registry prerequisite — the
  already-configured `rnr-ai-elements-docs` Worker and `rnraielements.com` route this FIX redeploys),
  FIX-ORI-RN-003-2 (the `input-group` `ring-2` fix whose propagation this FIX unblocks — the fixed source
  is the GREEN signal)
- Blocks: ORI-RN-003 (its quickstart cannot consume the fixed `input-group` until the canonical host serves
  it unversioned)
- Parallel: none (registry-wide edit; do not race other registry edits)

### READING LIST (max 5)

- packages/registry/scripts/build-registry.ts (the `{version}`/`VERSION_TOKEN`/`currentVersion()` machinery and the header comment on RNR's never-version-substituted deps)
- packages/registry/registry.json (the 64 self-dependency URLs to rewrite)
- tests/build-registry.test.ts (the TC-3/TC-4/TC-5 assertions pinning the old `v{version}` shape)
- apps/docs/wrangler.jsonc + scripts/docs-deploy/prepare.ts (the assets-only Worker config and the deterministic deploy-prep chain this FIX redeploys)
- ORI-DEP-001 charter (the verified account `d5110b1895ee190e145c0c8756f49879`, zone, and the `wrangler deploy` authority/proof discipline)

### CODING STANDARDS

Keep the `buildItem` absolute-URL guard intact (a short-name dep still throws `is not an absolute URL`).
Rewrite `resolveEngine` to the two-argument `(value, engine)` form — which is already the canonical shape
shown in the gallery demo snippet (`apps/example/gallery/cells/ui.tsx` documents
`export function resolveEngine(value: string, engine: Engine) { return value.split('{engine}').join(engine); }`)
— so the real function and its public documentation agree. Delete `VERSION_TOKEN` and `currentVersion()`
and the `version` parameter rather than leaving them inert; update the file header and the `buildItem`
doc comment to say the only substitutions are the alias segment and the `{engine}` token. In the tests,
assert the NEW invariants: self-deps match `^https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[\w.-]+\.json$`,
RNR deps keep their 14 distinct names, and no emitted item carries a residual `{engine}` token or a
`/main/` segment. Do not weaken the distinct-RNR-name count (14) or the absolute-URL guard.

## OPEN QUESTIONS (stated, not resolved here)

- **`tests/sprint-01/install-evidence.test.ts` is frozen evidence, not a live assertion.** It reads committed
  logs under `.tmp/TASK-F3/cycle-1/{green,red}/` that record a past `v0.1.0`-tag install and a netblock
  negative control. Those logs are immutable; the test asserts on their bytes, which this FIX does not
  change. It is therefore EXCLUDED from WRITE-ALLOWED and must not be edited. If a reviewer believes its
  line-43/line-71 `raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0` assertions describe a
  live URL shape (they do not — they describe a frozen log), that is a scope escalation to raise, not a
  change to make here.
- **`apps/example/gallery/cells/*.tsx` demo content.** These embed `v0.2.0`-tag URLs as demonstration
  content (install command snippet, `WebPreview` default URL, icon/splash URIs). They are NOT registry
  self-dependencies and are out of scope for this FIX; changing the recommended top-level install command
  is ORI-DEP-001 / ORI-RN-001 territory. They are left untouched.
- **`tests/sprint-01/install-core.test.sh` and `install-dirty-app.test.sh`** install from the immutable
  `v0.1.0` tag as a historical walking-skeleton flow. The transitive deps they pull are frozen in that
  tag; they are unaffected by this FIX and left untouched.
- **`apps/docs/src/pages/components/[item].astro` stale comment** (lines ~64–69) mentions "raw.githubusercontent
  pins" moving together with a version bump. After this FIX the served HTML is correct (the shared resolver
  emits unversioned URLs), but that inline comment is stale. It is out of WRITE-ALLOWED; a follow-up may
  correct the comment wording, but no code change is required for correctness.
- **`wrangler whoami` account confirmation is a live observation.** The account ID
  `d5110b1895ee190e145c0c8756f49879` is recorded in `apps/docs/wrangler.jsonc` and ORI-DEP-001's evidence
  (observed 2026-09-14/15), but the implementer must re-run
  `pnpm --dir apps/docs exec wrangler whoami` before deploying to confirm live authority — it cannot be
  re-confirmed from the repo alone in this authoring session.

## Behavior change to an accepted earlier sprint

SHELL-012's dependency panel (and SHELL-006's resolver tests) showed the `v{version}` URL form for
self-referential dependencies — that was the accepted earlier behavior. This FIX deliberately changes it:
the panel will now show `https://rnraielements.com/r/{engine}/{item}.json`. The affected assertions
(`tests/sprint-02-shell-hero/resolve-deps.test.ts` lines 86–88 and 105–107, and
`tests/sprint-02-shell-hero/dependency-panels.spec.ts` lines 159–164) are UPDATED to assert the new
unversioned same-host form — not weakened, and not deleted. The residual-token guards
(`not.toContain('{version}')` in `item-pages-build.test.ts` and `item-install-copy.spec.ts`) continue to
pass unchanged and stay.
