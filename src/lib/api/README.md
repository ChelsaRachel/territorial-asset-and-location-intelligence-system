# src/lib/api

Fetch adapter layer. All calls go through `apiClient`:

```ts
import { apiClient } from "@/lib/api/apiClient";

const profiles = await apiClient.discovery.getProfiles();
```

## Namespaces

| Namespace | Sprint | Status |
|---|---|---|
| `discovery` | SPRINT-02 | Implemented (mock fixtures) |
| `territory` | SPRINT-03 | Stub — NOT_YET_AVAILABLE |
| `intelligence` | SPRINT-04 | Stub — NOT_YET_AVAILABLE |
| `assessment` | SPRINT-05 | Stub — NOT_YET_AVAILABLE |
| `decision` | SPRINT-06 | Stub — NOT_YET_AVAILABLE |
| `monitoring` | SPRINT-07 | Stub — NOT_YET_AVAILABLE |

## Conventions

- Stubs throw `ApiError("NOT_YET_AVAILABLE", endpoint, "Lands in SPRINT-XX")`.
- Real adapters use `delay()` for simulated latency (skipped in `test` env).
- All types are imported from `@/lib/types`.
