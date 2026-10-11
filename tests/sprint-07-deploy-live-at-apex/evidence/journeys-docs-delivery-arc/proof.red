
Running 1 test using 1 worker
(node:41534) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
F

  1) [live-edge] › tests/sprint-07-deploy-live-at-apex/docs-delivery-arc.remote.spec.ts:563:1 › journeys/docs-delivery-arc 

    Error: ARC_SHA 5bfa77283a1182891ac8780fe477c3d676e2d918 changed no public/r JSON; no ci push run has a deploy job for 5bfa77283a1182891ac8780fe477c3d676e2d918 (run 34271758930)

      564 |   const sha = resolveArcRef(process.env.ARC_SHA);
      565 |   const ready = arcReadiness(sha);
    > 566 |   if (!ready.ok) throw new Error(ready.error);
          |                        ^
      567 |   await proveHashes(request, sha, ready.paths, ready.run);
      568 | });
      569 |
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-025/tests/sprint-07-deploy-live-at-apex/docs-delivery-arc.remote.spec.ts:566:24

    Error Context: test-results/docs-delivery-arc.remote-journeys-docs-delivery-arc-live-edge/error-context.md

  1 failed
    [live-edge] › tests/sprint-07-deploy-live-at-apex/docs-delivery-arc.remote.spec.ts:563:1 › journeys/docs-delivery-arc 
