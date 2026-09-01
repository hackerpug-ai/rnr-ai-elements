---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Technical Requirements — rnr-ai-elements MVP

## Section index

| # | File | Topic | Stability |
|---|------|-------|-----------|
| 01 | [`01-architecture-posture.md`](./01-architecture-posture.md) | Binding architectural stances | CONSTITUTION |
| 02 | [`02-system-components.md`](./02-system-components.md) | Internal architecture of this repo | CONSTITUTION |
| 03 | [`03-data-schema.md`](./03-data-schema.md) | Prop/context shapes + the AI SDK type seam | CONSTITUTION |
| 04 | [`04-api-design.md`](./04-api-design.md) | Endpoints (the library has none by design) | CONSTITUTION |
| 05 | [`05-architecture-diagram.md`](./05-architecture-diagram.md) | How consumer, library, and RNR relate | CONSTITUTION |
| 06 | [`06-external-dependencies.md`](./06-external-dependencies.md) | Pin reconciliation, Expo Go vs dev client | CONSTITUTION |
| 07 | [`07-ui-infrastructure.md`](./07-ui-infrastructure.md) | Token strategy, visual parity contract, density, a11y | CONSTITUTION |
| 08 | [`08-technical-risks.md`](./08-technical-risks.md) | Merged architecture + design risk register | CONSTITUTION |
| 09 | [`09-capability-chains.md`](./09-capability-chains.md) | Boundary-crossing promises and their proofs | CONSTITUTION |
| 10 | [`10-component-inventory.md`](./10-component-inventory.md) | The reuse-before-create ledger — 49 verdicts + 26 gap resolutions | CONSTITUTION |
| 11 | [`11-routing.md`](./11-routing.md) | Library has no routes; Storybook + example-app routes | CONSTITUTION |
| 12 | [`12-e2e-testing.md`](./12-e2e-testing.md) | E2E harness constitution (spike-gated) | CONSTITUTION |

## Cross-references

- Scope: [`../01-scope.md`](../01-scope.md) · Roles: [`../02-roles.md`](../02-roles.md)
- Functional groups: [`../03-functional-groups.md`](../03-functional-groups.md)
- Use cases: `../04-uc-agent.md` … `../09-uc-voice.md`
- Test criteria: [`../12-e2e-testing-criteria.md`](../12-e2e-testing-criteria.md)
- Specialist proposals: [`../_specialist-proposals/`](../_specialist-proposals/README.md)

## Version history

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-01 | Initial technical requirements. Registry-only distribution; Storybook on device as sign-off. |
