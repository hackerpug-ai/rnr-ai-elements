---
stability: CONSTITUTION
last_validated: 2026-09-08
prd_version: 1.2.1
---

# Technical Requirements — Docs Site

## Section Index

| # | File | Topic | Stability |
|---|------|-------|-----------|
| 01 | [01-architecture-posture.md](./01-architecture-posture.md) | Key architectural stances | CONSTITUTION |
| 02 | [02-system-components.md](./02-system-components.md) | System components table | CONSTITUTION |
| 03 | [03-data-schema.md](./03-data-schema.md) | Entities, properties, relationships | CONSTITUTION |
| 04 | [04-api-design.md](./04-api-design.md) | Endpoints + contracts | CONSTITUTION |
| 05 | [05-architecture-diagram.md](./05-architecture-diagram.md) | ASCII diagram | CONSTITUTION |
| 06 | [06-external-dependencies.md](./06-external-dependencies.md) | Grouped by component, with docs URLs | CONSTITUTION |
| 07 | [07-ui-infrastructure.md](./07-ui-infrastructure.md) | Libraries, tokens, component reuse + component/UI plan: userflows, page types, wireframes with region→component bindings (v1.2.1) | CONSTITUTION |
| 08 | [08-technical-risks.md](./08-technical-risks.md) | Risk register | CONSTITUTION |
| 09 | [09-capability-chains.md](./09-capability-chains.md) | CAP-* chains, boundary contracts, failure modes | CONSTITUTION |
| 10 | [10-routing.md](./10-routing.md) | Route map + Route Delta | CONSTITUTION |
| 11 | [11-e2e-testing.md](./11-e2e-testing.md) | E2E harness constitution | CONSTITUTION |
| 12 | [12-content-standards.md](./12-content-standards.md) | Authored-prose standards: style, glossary, templates, content gates | CONSTITUTION |

## Cross-references
- Scope: [`../01-scope.md`](../01-scope.md) · Groups: [`../03-functional-groups.md`](../03-functional-groups.md) · Criteria: [`../11-e2e-testing-criteria.md`](../11-e2e-testing-criteria.md)
- Scenarios: `.spec/scenarios/UC-{DOCS,GEND,SHELL,DELIV,EXT}-*/` + journeys; coverage: `.spec/scenarios/coverage-matrix.md`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-08 | Initial TR folder |
| 1.2.1 | 2026-09-08 | 07-ui-infrastructure: component/UI plan added — 15 userflows (all 24 UCs), 11 page types, 8 wireframes with region→component bindings, 4 NEW components (Button, SectionHeader, IndexList, Callout), five-island budget restated | frontend-designer ui-wireframes phase (human-requested lens) |
