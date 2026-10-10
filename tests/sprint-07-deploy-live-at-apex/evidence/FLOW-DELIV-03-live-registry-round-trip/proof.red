@@RUN-FLOW flow=FLOW-DELIV-03-live-registry-round-trip sprint=sprint-07-deploy-live-at-apex expect=red cmd_sha=961fba7b244be5f8e3b4dc0b55e2fb213aa3bfdea7610de4fb34eb2f026830ba head=00283d9c6d32a11f80b1d9b5c77f35a81cfa9cea+dirty at=2026-10-10T12:51:57Z@@
+ CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip

Running 4 tests using 1 worker
(node:47214) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
···F

  1) [live-edge] › tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:547:1 › FLOW-DELIV-03-live-registry-round-trip APX-040-same-deploy 

    Error: workers/message missing on version bb65ae86-7586-45da-8bdb-27d734ded8b9

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      433 |         ? `workers/message missing on version ${deploy.version_id}`
      434 |         : `workers/message on version ${deploy.version_id}: ${errMessage(error)}`;
    > 435 |     expect.soft(false, label).toBe(true);
          |                               ^
      436 |     return null;
      437 |   }
      438 | }
        at deployCommit (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-040/tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:435:31)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-040/tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:551:18

    Error: nativewind cache-control

    expect(received).toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Array [
    -   "public, max-age=300",
    +   "public, max-age=0, must-revalidate",
      ]

      364 |   const caches = headerValues(headers, 'cache-control');
      365 |   expect.soft(contentTypes, `${engine} content-type`).toEqual(['application/json']);
    > 366 |   expect.soft(caches, `${engine} cache-control`).toEqual(['public, max-age=300']);
          |                                                  ^
      367 |   return {
      368 |     contentType: contentTypes[0] ?? null,
      369 |     cacheControl: caches[0] ?? null,
        at expectServedHeaders (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-040/tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:366:50)
        at observeEngine (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-040/tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:410:18)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-040/tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:554:23

    Error: uniwind cache-control

    expect(received).toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Array [
    -   "public, max-age=300",
    +   "public, max-age=0, must-revalidate",
      ]

      364 |   const caches = headerValues(headers, 'cache-control');
      365 |   expect.soft(contentTypes, `${engine} content-type`).toEqual(['application/json']);
    > 366 |   expect.soft(caches, `${engine} cache-control`).toEqual(['public, max-age=300']);
          |                                                  ^
      367 |   return {
      368 |     contentType: contentTypes[0] ?? null,
      369 |     cacheControl: caches[0] ?? null,
        at expectServedHeaders (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-040/tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:366:50)
        at observeEngine (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-040/tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:410:18)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-040/tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:554:23

    Error Context: test-results/live-registry-round-trip.r-27351-nd-trip-APX-040-same-deploy-live-edge/error-context.md

    Error Context: test-results/live-registry-round-trip.r-27351-nd-trip-APX-040-same-deploy-live-edge/error-context.md

  1 failed
    [live-edge] › tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts:547:1 › FLOW-DELIV-03-live-registry-round-trip APX-040-same-deploy 
  3 passed (6.0s)
@@GATE-EXIT=1@@
