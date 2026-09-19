# FIX-ORI-RN-004-1-AC-1 — GREEN evidence

## The fix

`apps/example/lib/live-chat-config.ts` — `getLiveChatConfig()` now reads the
value **directly** so the inline-env-vars plugin can rewrite it:

```diff
 export function getLiveChatConfig(): LiveChatConfig {
-  const env = process.env;
   return resolveLiveChatConfig({
-    EXPO_PUBLIC_API_BASE_URL: env.EXPO_PUBLIC_API_BASE_URL,
+    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
   });
 }
```

Byte-identical to the already-proven version on
`kb-run-sprint/sprint-05-orient-search/FIX-ORI-RN-004-1-impl`
(`git diff <impl>:apps/example/lib/live-chat-config.ts` → empty).

`resolveLiveChatConfig(env)` (the pure seam) is **byte-identical** — the diff
touches only `getLiveChatConfig`. Its ORI-AI-001 AC-4 assertions are reproduced
and pass (see VERIFY.md).

## GREEN proof — real static web export (clean Metro cache)

Same command and same `.env` (`EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4000`):

```
pnpm --dir apps/example exec expo export --platform web --clear \
  --output-dir .tmp/FIX-ORI-RN-004-1-ac1/green-full/dist
```

Grep of the produced client bundle (`_expo/static/js/web/entry-*.js`):

| probe | result |
|---|---|
| inlined value | `EXPO_PUBLIC_API_BASE_URL:"http://127.0.0.1:4000"` — **1 occurrence** |
| `127.0.0.1:4000` | 1 |
| stale `127.0.0.1:8406` | 0 |

The value from `apps/example/.env` is inlined as a string literal into the
shipped client bundle — the exact AC-1 acceptance condition.

(Exact output in `.tmp/FIX-ORI-RN-004-1-ac1/green-grep.txt`.)

## GREEN proof — targeted transform of the real module

Same `transform.mjs`, post-fix. Output:
`.tmp/FIX-ORI-RN-004-1-ac1/green/live-chat-config.transformed.js`:

```js
export function getLiveChatConfig() {
  return resolveLiveChatConfig({
    EXPO_PUBLIC_API_BASE_URL: "http://127.0.0.1:4000"
  });
}
```

## Stale-cache gotcha (honest note, not a blocker)

The first GREEN export (without `--clear`) inlined `http://127.0.0.1:8406` — a
stale value from the FIX branch's earlier run, served from the shared Metro
transform cache at `~/.cache/agent-scratch/metro-cache`. The inline-env-vars
plugin reads `process.env[key]` at transform time, but Metro's transform cache
key does not include the ambient `EXPO_PUBLIC_*` value, so a byte-identical
source file can return a stale inlined value. Re-running with `--clear` inlined
the correct `http://127.0.0.1:4000`. Both RED and GREEN here were produced with
`--clear`, so neither relies on a stale cache. This is why the verification
must always use a clean cache when asserting an inlined `EXPO_PUBLIC_*` value.

## Round-trip

Not performed: the live backend at `http://127.0.0.1:4000` was not reachable and
`OPENAI_API_KEY` is not set in this environment. Per the task, the inlined-value
proof is the required minimum for AC-1 (the endpoint-value fix), and it is shown
above. The full provider round-trip is the domain of ORI-AI-001, whose seam
(`resolveLiveChatConfig`) is untouched here.
