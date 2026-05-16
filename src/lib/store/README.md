# src/lib/store

**URL is source of truth. localStorage is fallback. Default = Ciwidey.**

The `activeProfile` Zustand slice drives every page. Hydration precedence:
1. `?profile=<slug>` URL param (nuqs, App Router adapter)
2. `localStorage['talis.active_profile.v1']`
3. Default — the profile with `is_default=true` in the fixture (Ciwidey)

`<ActiveProfileProvider>` in `src/app/layout.tsx` owns all hydration logic. Pages consume state via `useActiveProfile()` and actions via `useActiveProfileActions()`.

Active profile is **per-tab** — localStorage changes in one tab do not propagate to another without a `storage` event listener (not implemented in PoC; accepted limitation).

---

## `useDiscovery()` — Discovery Slice (SPRINT-02)

`useDiscoveryStore` is the single source of truth for the Command Center (Page 1) search bar state, per-mode form inputs, search results, and the Quick Scan panel open/close state. It is persisted to **`sessionStorage`** under the key `talis.discovery.v1` so that tab switches and intra-page navigation do not reset filters; opening a fresh tab always starts clean.

**State persisted to sessionStorage**: `searchMode`, `mode1Query`, `mode2Filters`, `mode3Intent`, `searchResults`, `panelOpen`, `panelWilayahId`, `panelTab`.
**State NOT persisted (resets on hydrate)**: `searchStatus`, `searchError` (transient).

Key behaviours:
- `setSearchMode(mode)` is idempotent — calling it with the current mode is a no-op.
- `closePanel()` preserves `panelWilayahId` and `panelTab` so re-opening the panel does not flicker. Use `resetSearch()` to fully clear panel state.
- `setPanelTab(profilKode)` and `openPanel(wilayahId, profilKode?)` do **not** call `setActiveProfile` — that is the caller's responsibility (TASK-004 marker click handler, TASK-007 Mode 1 select).
- `runSearch()` dispatches to `apiClient.discovery.search()` with a payload shaped by the current `searchMode`. A `searchToken` counter discards stale resolves from rapid clicks.

**Consumers**: import focused selectors from `src/lib/store/useDiscovery.ts` (`useDiscoverySearchMode`, `useDiscoverySearchResults`, `useDiscoveryPanel`, `useDiscoveryActions`, etc.). Do not subscribe to the full `useDiscoveryStore` from components.
