
Running 1 test using 1 worker
(node:68071) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
F

  1) [live-edge] › tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts:403:1 › FLOW-DELIV-02-gated-deploy-order 

    Error: no deploy job

      304 | function assertGatedDeployOrder(run: OrderRun, jobList: readonly WorkflowJob[]): void {
      305 |   const problems = gateProblems(run, jobList);
    > 306 |   if (problems.length > 0) throw new Error(problems.join('; '));
          |                                  ^
      307 |   assertUpstreams(jobList, requireDeploy(jobList));
      308 | }
      309 |
        at assertGatedDeployOrder (/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-024/tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts:306:34)
        at /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-07-deploy-live-at-apex/APX-024/tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts:408:3

    Error Context: test-results/gated-deploy-order.remote-FLOW-DELIV-02-gated-deploy-order-live-edge/error-context.md

  1 failed
    [live-edge] › tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts:403:1 › FLOW-DELIV-02-gated-deploy-order 
