# Discovery Components

## Dynamic-import pattern for Mapbox maps

`CommandCenterMap.tsx` is the actual Mapbox map component. It is **always** consumed via `CommandCenterMap.dynamic.tsx`, which wraps it with `next/dynamic({ ssr: false })`.

**Why dynamic import?** Mapbox GL accesses browser and WebGL APIs at module load time. Importing the component directly in a server-rendered module risks SSR/runtime failures. The `{ ssr: false }` flag defers loading to the browser only.

**Bundle size budget:** The Mapbox chunk is loaded only when a map route mounts, not through AppShell/sidebar/header or shared non-map UI.

**Loading state:** While the dynamic chunk resolves, `CommandCenterPage` renders `<LoadingSkeleton shape="card" className="w-full h-full" />` — the SPRINT-01 primitive. Do not reimplement a custom skeleton for the map.

**Future task docking points (inside `CommandCenterPage`):**
- Search bar (TASK-007): rendered above the map, overlaid at a higher z-index.
- Quick Scan panel (TASK-005): right-anchored sibling of the map container, docked inside `CommandCenterPage` — **not** inside `CommandCenterMap`. Mounting panel content inside the Mapbox container would break the app overlay contract.

**SPRINT-03 / SPRINT-07 mini maps:** Each mini map follows this same dynamic-import pattern. Do NOT import map implementation files directly from server-rendered pages; use each map's `*.dynamic.tsx` wrapper so Mapbox stays route-local.
