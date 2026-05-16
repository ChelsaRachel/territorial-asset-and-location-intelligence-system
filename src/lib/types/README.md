# TALIS Domain Types

**Naming convention**: `snake_case` — field names match SQL column names verbatim for direct mapping to API responses. TypeScript interfaces use `interface` for object shapes; `type` for unions and primitive aliases.

**Do not place runtime logic here.** This layer is compile-time only.

## Source Documents

| File | Source |
|------|--------|
| `common.ts` | Cross-module enums — docs/00_OVERVIEW.md §5.4, all modules |
| `wilayah.ts` | docs/01_COMMAND_CENTER.md §4.1 |
| `territory.ts` | docs/02_TERRITORY_PROFILE.md §4.1 |
| `intelligence.ts` | docs/03_TERRITORY_INTELLIGENCE.md §4.1 |
| `assessment.ts` | docs/04_OPPORTUNITY_RISK.md §4.1 |
| `decision.ts` | docs/05_INVESTMENT_DECISION.md §4.1 |
| `monitoring.ts` | docs/06_MONITORING_GOVERNANCE.md §4.1 |

## Rules for Downstream Sprints

- Import types from `@/lib/types` (barrel) or from specific domain files.
- **Adding** new types or optional fields is safe.
- **Renaming or removing** existing types requires a cross-cutting amendment.
- If a sprint introduces a new enum value, update `common.ts` — do not redefine locally.
