"use client";
import { useShallow } from "zustand/react/shallow";
import { useDiscoveryStore } from "./discovery";
import type { SearchMode, Mode2Filters, Mode3Intent, SearchResultRow } from "./discovery";

// Re-export types so consumers can import from a single location.
export type { SearchMode, Mode2Filters, Mode3Intent, SearchResultRow };

export const useDiscoverySearchMode = (): SearchMode =>
  useDiscoveryStore((s) => s.searchMode);

export const useDiscoveryMode1Query = (): string =>
  useDiscoveryStore((s) => s.mode1Query);

export const useDiscoveryMode2Filters = (): Mode2Filters =>
  useDiscoveryStore((s) => s.mode2Filters);

export const useDiscoveryMode3Intent = (): Mode3Intent | null =>
  useDiscoveryStore((s) => s.mode3Intent);

export const useDiscoverySearchResults = (): SearchResultRow[] =>
  useDiscoveryStore((s) => s.searchResults);

export const useDiscoverySearchResultMode = (): SearchMode | null =>
  useDiscoveryStore((s) => s.searchResultMode);

export const useDiscoverySearchStatus = ():
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error" => useDiscoveryStore((s) => s.searchStatus);

export const useDiscoverySearchError = (): string | null =>
  useDiscoveryStore((s) => s.searchError);

export const useDiscoveryPanel = () =>
  useDiscoveryStore(
    useShallow((s) => ({
      open: s.panelOpen,
      wilayahId: s.panelWilayahId,
      panelTab: s.panelTab,
    }))
  );

// Returns all actions as a stable shallow object. Action function references are stable
// (Zustand guarantees this), so this hook only re-renders when the store re-creates actions
// (which never happens in practice).
export const useDiscoveryActions = () =>
  useDiscoveryStore(
    useShallow((s) => ({
      setSearchMode: s.setSearchMode,
      setMode1Query: s.setMode1Query,
      setMode2Filters: s.setMode2Filters,
      setMode3Intent: s.setMode3Intent,
      runSearch: s.runSearch,
      openPanel: s.openPanel,
      closePanel: s.closePanel,
      setPanelTab: s.setPanelTab,
      resetSearch: s.resetSearch,
    }))
  );
