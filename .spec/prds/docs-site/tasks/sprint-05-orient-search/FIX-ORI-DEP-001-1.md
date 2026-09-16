<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search · human-authored FIX charter 2026-09-15 (cycle-2 remediated) -->

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
https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v{version}/public/r/{engine}/<item-name>.json
```

to

```
https://rnraielements.com/r/{engine}/<item-name>.json
```

(where `<item-name>` is the literal dependency name, e.g. `input-group`; `{engine}` is the only real
substitution token in `registry.json`, and it stays).

This mirrors RNR's own distribution convention — a same-host, unversioned `/r/{engine}/<item>.json` path
per dependency, with fixes propagating by deploying the host rather than by cutting a tag. `rnraielements.com`
is OUR canonical host (not RNR's), and we KEEP our per-engine `registry.json` index (name/type/title only).
RNR's dependencies (which we already reference as `https://reactnativereusables.com/r/{engine}/…`) stay
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

Fetch the live canonical registry and confirm the stale pin and the pre-fix className token. The
discriminator is the `files[].content` className, NOT a bare `ring-2` count — the fixed source still
contains the literal `ring-2` once, inside a `//` comment, so a token count cannot distinguish broken from
fixed:

```bash
curl -s https://rnraielements.com/r/nativewind/prompt-input.json | python3 -c 'import sys,json; print(json.load(sys.stdin)["registryDependencies"])'
# RED: ["…/reactnativereusables.com/r/nativewind/button.json", "…/reactnativereusables.com/r/nativewind/icon.json",
#       "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/input-group.json"]

curl -s https://rnraielements.com/r/nativewind/input-group.json | python3 -c '
import sys, json
p = json.load(sys.stdin)
content = "\n".join(f["content"] for f in p["files"])
print("pre-fix className token present:", "focused && \u0027border-ring ring-2 ring-ring/50\u0027" in content)
print("focusedStyle present:", "focusedStyle" in content)
'
# RED: pre-fix className token present: True ; focusedStyle present: False
```

Record the raw response bytes (or `sha256`) of both endpoints under
`tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/red/`. The RED is the live URL serving the
`v0.2.1`-pinned self-dep and the `ring-2`-bearing className.

**GREEN (after the change, deterministic prepare, and redeploy):**

1. `pnpm registry:build` regenerates `public/r/{nativewind,uniwind}/*.json` with every self-dependency as
   `https://rnraielements.com/r/{engine}/<item-name>.json`; `pnpm check:registry` exits 0.
2. The scoped vitest gate (`pnpm exec vitest run tests/build-registry.test.ts
   tests/sprint-02-shell-hero/resolve-deps.test.ts`) and the Playwright lane (`pnpm e2e:docs`) pass;
   `pnpm typecheck`, `pnpm lint`, `pnpm check:tokens`, `pnpm check:contract` all exit 0.
3. Build the docs, re-baseline through `scripts/docs-deploy/prepare.ts --phase bootstrap`, redeploy the
   already-configured assets-only Worker, and fetch the live URL with the className-level discriminator
   (AC-3).

## Scope

- WRITE-ALLOWED:
  - packages/registry/registry.json (MODIFY — the 64 self-dependency URLs)
  - packages/registry/scripts/build-registry.ts (MODIFY — remove the `{version}` machinery + update comments)
  - public/r/nativewind/** (REGENERATED by `pnpm registry:build`, commit)
  - public/r/uniwind/** (REGENERATED by `pnpm registry:build`, commit)
  - tests/build-registry.test.ts (MODIFY — live assertions)
  - tests/sprint-02-shell-hero/resolve-deps.test.ts (MODIFY — live assertions)
  - tests/sprint-02-shell-hero/dependency-panels.spec.ts (MODIFY — live assertions)
  - scripts/docs-data/prebuild.ts (MODIFY — the SHELL-006 gate comment block L255–259 AND the `readJson`
    error-label string at L262, which is a string argument, not a comment)
  - tests/sprint-05-orient-search/support/verify-prompt-input-sdk57.ts (MODIFY — comment-only at L258, the
    stale "check-registry-fresh reads cwd/package.json for the {version} URL substitution" line)
  - tests/sprint-05-orient-search/evidence/ORI-DEP-001/** (RE-BASELINED by
    `scripts/docs-deploy/prepare.ts --phase bootstrap` — see CRITICAL CONSTRAINTS and DEPENDENCIES)
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
  `registryDependencies` become `https://rnraielements.com/r/{engine}/<item-name>.json` — same-host,
  unversioned, canonical. No other field, component, or behavior changes.
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
- **This FIX supersedes ORI-DEP-001's frozen manifest and receipt.** ORI-DEP-001 (✅ Completed) froze
  `tests/sprint-05-orient-search/evidence/ORI-DEP-001/asset-manifest.json` (186 dist assets, 114 under
  `r/`, `release_sha` 10d7f1de) and `release.json.conversation_assets` (sha256 of the two conversation
  endpoints). `scripts/docs-deploy/prepare.ts` re-verify mode refuses any changed byte (`asset hash
  mismatch`), and `conversation.json`/`message.json`/`prompt-input.json` each carry a self-dep, so this
  FIX's registry-wide byte change moves 64 of the 114 `r/` assets and both frozen conversation hashes. The
  new release's `asset-manifest.json` + `release.json` (produced by a fresh
  `prepare.ts --phase bootstrap` run plus the attended `wrangler deploy`) become the accepted baseline
  consumed by ORI-DEP-002, ORI-DEP-003, and ORI-CI-004. The deploy MUST go through the deterministic
  prepare chain — never a bare `wrangler deploy` over a stale dist.
- **The deploy is an assets-only publish of the already-configured Worker** `rnr-ai-elements-docs`
  (`apps/docs/wrangler.jsonc`): assets directory `./dist`, apex route `rnraielements.com`, no application
  entrypoint, no bindings, no new routes, no cache policy, no Pages config. Do NOT edit `wrangler.jsonc`.
- **Generated artifacts are derived, never hand-edited.** `public/r/{engine}/*.json` are produced by
  `pnpm registry:build`; the per-engine `public/r/{engine}/registry.json` index carries only
  name/type/title and is regenerated too. `apps/docs/public/r/**` and `apps/docs/dist/**` are gitignored
  build output, not committed.

### DONE WHEN

- AC-1: every self-referential `registryDependencies` in `registry.json` is
  `https://rnraielements.com/r/{engine}/<item-name>.json` (token form) and in the regenerated
  `public/r/**` is `https://rnraielements.com/r/{engine}/<item-name>.json` (substituted form); no
  `raw.githubusercontent.com` and no `v{version}` remain in self-deps; RNR's own deps are unchanged.
- AC-2: the repo is consistent — `pnpm registry:build && pnpm check:registry` exit 0; the scoped vitest
  gate and `pnpm e2e:docs` pass with the updated assertions; `pnpm typecheck`, `pnpm lint`,
  `pnpm check:tokens`, `pnpm check:contract` pass; `git diff --name-only` lists only the allowed paths.
- AC-3: after the deterministic prepare + assets-only `wrangler deploy`, a real public HTTPS fetch of
  `https://rnraielements.com/r/nativewind/prompt-input.json` shows its `input-group` dependency resolving to
  `https://rnraielements.com/r/nativewind/input-group.json`, and that URL's `files[].content` carries
  `focusedStyle` + `borderWidth: 2` and NO `'border-ring ring-2 ring-ring/50'` className token.

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: every self-dependency resolves from the canonical unversioned host; RNR deps untouched**

  GIVEN `packages/registry/registry.json` carrying 64 self-dependency URLs of the form
  `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v{version}/public/r/{engine}/<item-name>.json`
  WHEN each is rewritten to `https://rnraielements.com/r/{engine}/<item-name>.json` and `pnpm registry:build`
  runs THEN:
  (a) every self-dependency in `registry.json` (the TOKEN form) matches
  `^https:\/\/rnraielements\.com\/r\/\{engine\}\/[\w.-]+\.json$` and contains no `raw.githubusercontent.com`,
  no `v{version}`, no `/main/`; and
  (b) every self-dependency in every regenerated `public/r/{nativewind,uniwind}/*.json` (the SUBSTITUTED
  form) matches `^https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[\w.-]+\.json$`; and
  (c) every `https://reactnativereusables.com/r/{engine}/{item}.json` entry is byte-identical to before
  (14 distinct names, 146 occurrences unchanged).

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `git diff` + `pnpm registry:build` over the real registry.json
  VERIFY: `git diff packages/registry/registry.json && pnpm registry:build && node -e '…count self vs RNR deps, assert the token form in registry.json and the substituted form in public/r…'`
  TEST_FILE: packages/registry/registry.json + public/r/{nativewind,uniwind}/** · TEST_FUNCTION: (self-dep host/version shape, token vs substituted form; RNR deps unchanged)

**AC-2: the repo is consistent — freshness, scoped tests, and allowed-path diff**

  GIVEN the rewritten registry and the removed `{version}` machinery WHEN `pnpm registry:build && pnpm check:registry`
  run THEN both exit 0 (the shipped `public/r/**` matches a fresh in-memory build), and the scoped
  logic-tier gate `pnpm exec vitest run tests/build-registry.test.ts tests/sprint-02-shell-hero/resolve-deps.test.ts`
  (covers the two modified `.test.ts` files; the Playwright `dependency-panels.spec.ts` is covered by
  `pnpm e2e:docs`) plus `pnpm typecheck`, `pnpm lint`, `pnpm check:tokens`, `pnpm check:contract` all exit 0
  with the updated assertions, and `git diff --name-only` lists only the WRITE-ALLOWED paths.

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `pnpm registry:build` + `pnpm check:registry` + scoped vitest + playwright + tsc + biome + token/contract gates
  VERIFY: `pnpm registry:build && pnpm check:registry && pnpm exec vitest run tests/build-registry.test.ts tests/sprint-02-shell-hero/resolve-deps.test.ts && pnpm e2e:docs && pnpm typecheck && pnpm lint && pnpm check:tokens && pnpm check:contract && git diff --name-only`
  TEST_FILE: public/r/** + the modified tests · TEST_FUNCTION: (freshness + the updated assertions)

**AC-3: the live canonical registry serves the unversioned self-dep and the fixed source (the real proof)**

  GIVEN the docs built through the deterministic prepare chain and the already-configured assets-only
  Worker redeployed WHEN a real public HTTPS fetch hits `https://rnraielements.com/r/nativewind/prompt-input.json`
  THEN its `registryDependencies` contains `https://rnraielements.com/r/nativewind/input-group.json` (no
  `raw.githubusercontent.com`, no `v0.2.1`), and a fetch of
  `https://rnraielements.com/r/nativewind/input-group.json` returns `files[].content` whose className
  contains `focusedStyle` AND `borderWidth: 2` AND does NOT contain the pre-fix className token
  `'border-ring ring-2 ring-ring/50'` (nor any `ring-2` in a `focused && '…'` className position). The bare
  `ring-2` token count is reported only as a DIAGNOSTIC — the fixed source still contains `ring-2` once, in
  a `//` comment, so the count is 1 before and 1 after and cannot be the oracle. RED before the change: the
  live `prompt-input.json` pins `…/v0.2.1/public/r/nativewind/input-group.json`, and the served
  `input-group.json` `files[].content` contains `'border-ring ring-2 ring-ring/50'` with `focusedStyle`
  absent. Capture the raw response bytes/hashes for both RED and GREEN under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/`.

  EVIDENCE — the deploy proof must be a REAL public fetch, not a canned receipt and not mocked HTTP, and
  the deploy must run through the deterministic prepare chain (not a bare `wrangler deploy` over a stale
  dist). Record the `wrangler whoami` account, the `wrangler deploy` output (version ID), and the `curl`
  response bodies (with `sha256`) for both endpoints. No stub, no localhost host substitution, no simulated
  deployment.

  FLOW_REF: None · TEST_TIER: e2e · verification_service: real Cloudflare account + deterministic `prepare.ts --phase bootstrap` + `wrangler deploy` of the configured Worker + public HTTPS fetch of rnraielements.com
  VERIFY: `pnpm registry:build && pnpm gallery:manifest && pnpm --dir apps/docs run prebuild && pnpm typecheck && pnpm lint && pnpm check:tokens && pnpm check:contract && pnpm check:registry && pnpm --dir apps/docs exec astro build && pnpm exec tsx scripts/docs-deploy/prepare.ts --phase bootstrap --source <NEW_HEAD_SHA> --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001 && pnpm --dir apps/docs exec wrangler whoami && pnpm --dir apps/docs exec wrangler deploy --config wrangler.jsonc && pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json && curl -s https://rnraielements.com/r/nativewind/prompt-input.json && curl -s https://rnraielements.com/r/nativewind/input-group.json | python3 -c '…className-level discriminator…'`
  TEST_FILE: (live public HTTP responses, byte/hash-captured under evidence) · TEST_FUNCTION: (unversioned self-dep + className-level fixed-source discriminator, documented in evidence)

### TEST CRITERIA

- TC-1 → AC-1: `git diff packages/registry/registry.json` shows only the 64 self-dependency lines changing
  from the `v{version}` GitHub template to `https://rnraielements.com/r/{engine}/<item-name>.json` (the
  literal dependency name, no `{item}` token); every RNR `reactnativereusables.com` line is untouched; no
  `raw.githubusercontent.com` or `v{version}` remains in `registry.json`.
- TC-2 → AC-1: after `pnpm registry:build`, a scan of `public/r/{nativewind,uniwind}/*.json` finds 0
  self-deps containing `raw.githubusercontent.com`, `v{version}`, or `/main/`, and 64 (32 items × 2 engines)
  self-deps matching `https://rnraielements.com/r/(nativewind|uniwind)/[\\w.-]+.json`; the 14 distinct RNR
  dep names are unchanged (146 occurrences, 48 items). (Token form in `registry.json` is asserted
  separately in TC-1, not by this substituted-form regex.)
- TC-3 → AC-2: `pnpm registry:build && pnpm check:registry` exits 0; the regenerated `public/r` differs
  from HEAD only in the `registryDependencies` arrays (no component `content` or manifest metadata drift).
- TC-4 → AC-2: `pnpm exec vitest run tests/build-registry.test.ts tests/sprint-02-shell-hero/resolve-deps.test.ts`
  passes and `pnpm e2e:docs` (Playwright `dependency-panels.spec.ts`) passes; `pnpm typecheck`, `pnpm lint`,
  `pnpm check:tokens`, `pnpm check:contract` exit 0; `git diff --name-only` lists only the WRITE-ALLOWED
  paths (not `.tmp/`, not `design/goldens/`, not `.spec/`, not `tests/sprint-01/install-evidence.test.ts`).
- TC-5 → AC-3: RED (pre-change) evidence shows the live `prompt-input.json` pinning
  `…/v0.2.1/…/input-group.json` and the live `input-group.json` `files[].content` carrying
  `'border-ring ring-2 ring-ring/50'` with `focusedStyle` absent; GREEN (post-deploy) evidence shows
  `prompt-input.json`'s `input-group` dependency as `https://rnraielements.com/r/nativewind/input-group.json`
  and that URL's `files[].content` carrying `focusedStyle` + `borderWidth: 2` and NOT carrying
  `'border-ring ring-2 ring-ring/50'`, with the raw response bytes/hashes captured under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/`.

### SCOPE (file-level write permissions)

- packages/registry/registry.json (MODIFY)
- packages/registry/scripts/build-registry.ts (MODIFY)
- public/r/nativewind/** (REGENERATED, commit)
- public/r/uniwind/** (REGENERATED, commit)
- tests/build-registry.test.ts (MODIFY)
- tests/sprint-02-shell-hero/resolve-deps.test.ts (MODIFY)
- tests/sprint-02-shell-hero/dependency-panels.spec.ts (MODIFY)
- scripts/docs-data/prebuild.ts (MODIFY — SHELL-006 gate comment L255–259 + readJson error-label string L262)
- tests/sprint-05-orient-search/support/verify-prompt-input-sdk57.ts (MODIFY — comment-only L258)
- tests/sprint-05-orient-search/evidence/ORI-DEP-001/** (RE-BASELINED by prepare.ts --phase bootstrap)
- tests/sprint-05-orient-search/evidence/FIX-ORI-DEP-001-1/** (evidence)
- .tmp/FIX-ORI-DEP-001-1/** (owned scratch)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- tokens: `pnpm check:tokens`
- contract: `pnpm check:contract`
- registry: `pnpm registry:build && pnpm check:registry`
- test (logic tier, SCOPED): `pnpm exec vitest run tests/build-registry.test.ts tests/sprint-02-shell-hero/resolve-deps.test.ts`
- test (playwright lane): `pnpm e2e:docs` — covers `tests/**/*.spec.ts` (`dependency-panels.spec.ts`)
- deploy (deterministic): `pnpm exec tsx scripts/docs-deploy/prepare.ts --phase bootstrap --source <NEW_HEAD_SHA> --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001` then the attended `wrangler deploy`

### DEPENDENCIES

- Depends on: ORI-DEP-001 (the initial Workers deployment + canonical registry prerequisite — the
  already-configured `rnr-ai-elements-docs` Worker and `rnraielements.com` route this FIX redeploys, and the
  frozen manifest/receipt this FIX supersedes), FIX-ORI-RN-003-2 (the `input-group` `ring-2` className fix
  whose propagation this FIX unblocks — the fixed `files[].content` is the GREEN signal)
- Blocks: ORI-RN-003 (its quickstart cannot consume the fixed `input-group` until the canonical host serves
  it unversioned)
- Supersedes (re-baseline handoff): ORI-DEP-002, ORI-DEP-003, ORI-CI-004 consume the accepted
  `asset-manifest.json`/`release.json` baseline. This FIX produces that new baseline; those Backlog tasks
  MUST be re-seeded against the NEW release rather than ORI-DEP-001's `10d7f1de` manifest. (ORI-DEP-002
  `must_observe` "bytes whose SHA-256 match both the prerequisite release and the accepted manifest";
  ORI-DEP-003 AC-4 requires "all 112 public registry item hashes and both index hashes equal the accepted
  prepublication manifest" — that accepted manifest is now THIS FIX's output, not 10d7f1de.)
- Parallel: none (registry-wide edit; do not race other registry edits)

### READING LIST (max 5)

- packages/registry/scripts/build-registry.ts (the `{version}`/`VERSION_TOKEN`/`currentVersion()` machinery and the header comment on RNR's never-version-substituted deps)
- packages/registry/registry.json (the 64 self-dependency URLs to rewrite)
- tests/build-registry.test.ts (the TC-3/TC-4/TC-5 assertions pinning the old `v{version}` shape)
- scripts/docs-deploy/prepare.ts (the deterministic deploy-prep chain this FIX re-runs to re-baseline the ORI-DEP-001 manifest) + tests/sprint-05-orient-search/public-http.test.ts (the preparation/public-HTTP proof, `--phase bootstrap`)
- ORI-DEP-001 charter + `tests/sprint-05-orient-search/evidence/ORI-DEP-001/` (the verified account `d5110b1895ee190e145c0c8756f49879`, zone, frozen manifest/receipt this FIX supersedes)

### CODING STANDARDS

Keep the `buildItem` absolute-URL guard intact (a short-name dep still throws `is not an absolute URL`).
Rewrite `resolveEngine` to the two-argument `(value, engine)` form — which is already the canonical shape
shown in the gallery demo snippet (`apps/example/gallery/cells/ui.tsx` documents
`export function resolveEngine(value: string, engine: Engine) { return value.split('{engine}').join(engine); }`)
— so the real function and its public documentation agree. Delete `VERSION_TOKEN` and `currentVersion()`
and the `version` parameter rather than leaving them inert; update the file header and the `buildItem`
doc comment to say the only substitutions are the alias segment and the `{engine}` token. In the tests,
assert the NEW invariants: the TOKEN form `^https:\/\/rnraielements\.com\/r\/\{engine\}\/[\w.-]+\.json$` in
`registry.json` and the SUBSTITUTED form `^https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[\w.-]+\.json$`
in `public/r/**` (two distinct checks — do not apply one engine-substituted regex to both), RNR deps keep
their 14 distinct names, and no emitted item carries a residual `{engine}` token or a `/main/` segment. Do
not weaken the distinct-RNR-name count (14) or the absolute-URL guard. The implementation commit runs the
REAL gates (typecheck/lint/tokens/contract/registry + scoped vitest) with no hook bypass — the authoring
commit's `core.hooksPath=/dev/null` bypass was a one-off for a markdown spec, not a license for the code
commit.

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
- **`tests/sprint-05-orient-search/public-http.test.ts` is a script, not a vitest suite.** It matches
  vitest's `include` glob (`tests/**/*.test.ts`; `exclude` only adds `**/node_modules/**` and `apps/**`),
  contains zero `describe`/`it`, and its `main()` is guarded by `import.meta.url === process.argv[1]`, so
  `vitest run` collects it as `(0 test)` and fails `No test suite found in file` — a PRE-EXISTING failure
  in `pnpm test` and CI (`ci.yml` `pnpm exec vitest run`) unrelated to this FIX. AC-2 therefore scopes its
  vitest gate to the two affected files and does NOT assert a full `pnpm test` green. The implementer must
  record the pre-existing failure with the AGENTS.md `git stash && rerun` proof before dismissing it. A
  follow-up FIX may add a vitest `exclude` for this script-style file (out of this FIX's scope — it would
  touch `vitest.config.ts`, which is not in WRITE-ALLOWED).

## Behavior change to an accepted earlier sprint

SHELL-012's dependency panel (and SHELL-006's resolver tests) showed the `v{version}` URL form for
self-referential dependencies — that was the accepted earlier behavior. This FIX deliberately changes it:
the panel will now show `https://rnraielements.com/r/{engine}/{item}.json`. The affected assertions
(`tests/sprint-02-shell-hero/resolve-deps.test.ts` lines 86–88 and 105–107, and
`tests/sprint-02-shell-hero/dependency-panels.spec.ts` lines 159–164) are UPDATED to assert the new
unversioned same-host form — not weakened, and not deleted. The residual-token guards
(`not.toContain('{version}')` in `item-pages-build.test.ts` and `item-install-copy.spec.ts`) continue to
pass unchanged and stay.

## Amendments

- Cycle-2 remediation (independent reviewer NEEDS_FIXES, DOC-F1..DOC-F9):
  - DOC-F1 (non-discriminating AC-3/TC-5 oracle) — replaced the bare `grep -c ring-2` discriminator with a
    className-level assertion on the served `files[].content`: GREEN requires PRESENCE of `focusedStyle` +
    `borderWidth: 2` and ABSENCE of the pre-fix className token `'border-ring ring-2 ring-ring/50'` (the
    fixed source still contains `ring-2` once, inside a `//` comment, so the token count is 1 before and 1
    after); the bare count is now diagnostic-only, and the RED expected value is the pre-fix className token
    present + `focusedStyle` absent (not "a non-zero count").
  - DOC-F2 (supersedes ORI-DEP-001 frozen manifest/receipt) — added
    `tests/sprint-05-orient-search/evidence/ORI-DEP-001/**` to WRITE-ALLOWED (re-baselined by
    `prepare.ts --phase bootstrap` fresh + the attended `wrangler deploy`), added a CRITICAL CONSTRAINT
    stating this FIX supersedes the `10d7f1de` manifest/receipt and that the new baseline is consumed by
    ORI-DEP-002/ORI-DEP-003/ORI-CI-004, and extended DEPENDENCIES with a "Supersedes" handoff naming all
    three Backlog tasks.
  - DOC-F3 (unachievable `pnpm test` gate) — scoped AC-2's vitest gate to
    `pnpm exec vitest run tests/build-registry.test.ts tests/sprint-02-shell-hero/resolve-deps.test.ts`,
    added an OPEN QUESTION recording the pre-existing `public-http.test.ts` (0-test) failure with the
    `git stash && rerun` proof requirement, and updated the VERIFICATION GATES accordingly.
  - DOC-F4 (one regex applied to two shapes) — split AC-1 into two checks: the `{engine}` token form in
    `registry.json` vs the engine-substituted form in `public/r/**`.
  - DOC-F5 (`{item}` is not a token) — rewrote the template as
    `…/public/r/{engine}/<item-name>.json` (literal dependency name), and corrected the code blocks.
  - DOC-F6 (prebuild.ts L262 is a string, not a comment; stale sdk57 comment) — corrected the
    `prebuild.ts` label to "SHELL-006 gate comment L255–259 + readJson error-label string L262", and added
    `tests/sprint-05-orient-search/support/verify-prompt-input-sdk57.ts` (comment-only L258) to WRITE-ALLOWED.
  - DOC-F7 (AC-3 VERIFY had no build step) — embedded the ordered build + `prepare.ts --phase bootstrap` +
    `wrangler deploy` + `public-http.test.ts --phase bootstrap` into AC-3's VERIFY, and reconciled the
    READING LIST to name `prepare.ts` and `public-http.test.ts`.
  - DOC-F8 (hook bypass) — added a CODING STANDARDS sentence stating the implementation commit runs the
    real gates with no repeat bypass; the authoring commit's `core.hooksPath=/dev/null` was a one-off for a
    markdown spec.
  - DOC-F9 (wording overstatement) — reworded "This is exactly RNR's own distribution shape" to state
    `rnraielements.com` is OUR host and we KEEP the per-engine `registry.json` index.
  - The verified diagnosis, counts (56 items / 32 self-dep items / 64 self-dep URLs / 19 distinct names /
    146 RNR URLs / 14 distinct RNR names), and the `{version}`-machinery-removal decision are otherwise
    unchanged.
