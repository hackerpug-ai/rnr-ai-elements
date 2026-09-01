# Specialist proposals — provenance for this PRD

These are the **verbatim payloads** returned by the four specialist lenses dispatched during
`/kb-prd-plan`, plus the ground-truth brief they were all given and the delivery ledger.
Every section of this PRD is templated from these files; nothing in the PRD should appear
here in no proposal.

| File | Lens | Role |
|---|---|---|
| `FACTS.md` | — | Ground truth handed to all four lenses, read from live repo trees |
| `product-manager.personas-product.json` | `product-manager` | Personas, journeys, groups, 23 UCs, 49 porting verdicts |
| `react-native-reusables-planner.architecture.json` | `react-native-reusables-planner` | Posture, 26-gap resolution, theming mechanism, distribution, Expo matrix, risks |
| `frontend-designer.ui-infra.json` | `frontend-designer` | Visual parity contract, web→native translation, density, accessibility |
| `shadcn-ai-elements-planner.web-original.json` | `shadcn-ai-elements-planner` | **Consulting only.** All 49 web components: behavior to preserve, browser artifacts to drop |
| `_ledger.json` | — | Delivery record: which lens delivered, what was staged, what was decided |

The `shadcn-ai-elements-planner` payload is a **specification of behavior to reimplement**,
never a diff. This project does not use the web library.
