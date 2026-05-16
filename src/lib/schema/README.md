# TALIS Zod Schemas

Schemas validate fixture shapes at load time. Source of truth for types: `src/lib/types/`. Add new schemas in this directory; consume via `loadFixture(rawJson, Schema)` from `loader.ts`.

**Rule**: Components and pages must NOT import from `src/mocks/` directly — always consume through the fetch adapter (`src/lib/api/apiClient.ts`).
