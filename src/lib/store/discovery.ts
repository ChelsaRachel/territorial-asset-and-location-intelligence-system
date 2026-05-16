"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient } from "@/lib/api/apiClient";
import type { SearchPayload } from "@/lib/api/discovery/search";
import type { DiscoverySector } from "@/lib/discovery/filterCriteria";
import type { OpportunityPreference } from "@/lib/discovery/opportunitySearch";

export type SearchMode = "location" | "criteria" | "opportunity";

export type Mode2Filters = {
  sektor: DiscoverySector[];
  minSkorPotensi?: number;
  maxSkorPotensi?: number;
  minMarketAccess?: number;
  minGrowthProjection?: number;
  provinsiIds?: string[]; // 2-digit BPS provinsi IDs from dim_region.json
};

export type Mode3Intent = {
  sektorTarget: DiscoverySector;
  budgetMaxPerM2: number; // IDR Rp/m² — compared against wilayah_score_aggregate.median_land_price
  // Canonical investor intent labels — per docs/01_COMMAND_CENTER.md §3.3 and docs/05_INVESTMENT_DECISION.md §3.2
  preferensi: OpportunityPreference;
};

// Public row shape for search results. kabupaten/provinsi/median_land_price/appreciation_rate
// are populated by TASK-007/008/009 when search.ts is enhanced to return dim_wilayah metadata.
// This shape is a public contract for SPRINT-08 — do not rename or remove existing fields.
export type SearchResultRow = {
  wilayah_id: number;
  nama: string;
  kabupaten: string;
  provinsi: string;
  lat: number;
  lng: number;
  profil_kode?: string;
  skor_potensi: number;
  matching_score?: number; // populated only in Mode 3
  median_land_price?: number;
  appreciation_rate?: number;
  highlight_reason?: string;
  sector_signal?: string;
  sector_signal_score?: number;
  last_refreshed_at?: string;
};

export interface DiscoverySlice {
  searchMode: SearchMode;
  mode1Query: string;
  mode2Filters: Mode2Filters;
  mode3Intent: Mode3Intent | null;
  searchResults: SearchResultRow[];
  searchResultMode: SearchMode | null;
  searchStatus: "idle" | "loading" | "success" | "empty" | "error";
  searchError: string | null;
  panelOpen: boolean;
  panelWilayahId: number | null;
  // Active profil_kode within the panel (sample profiles). null for non-sample or unset.
  panelTab: string | null;
  setSearchMode(mode: SearchMode): void;
  setMode1Query(q: string): void;
  setMode2Filters(f: Partial<Mode2Filters>): void;
  setMode3Intent(intent: Mode3Intent | null): void;
  runSearch(): Promise<void>;
  openPanel(wilayahId: number, profilKode?: string): void;
  closePanel(): void;
  setPanelTab(profilKode: string): void;
  resetSearch(): void;
}

const defaultState = {
  searchMode: "location" as SearchMode,
  mode1Query: "",
  mode2Filters: { sektor: [] } as Mode2Filters,
  mode3Intent: null as Mode3Intent | null,
  searchResults: [] as SearchResultRow[],
  searchResultMode: null as SearchMode | null,
  searchStatus: "idle" as const,
  searchError: null as string | null,
  panelOpen: false,
  panelWilayahId: null as number | null,
  panelTab: null as string | null,
};

// Race-condition guard: if the user fires runSearch() multiple times rapidly,
// only the latest call's resolve updates state. PoC scope — single store instance.
let searchToken = 0;

// sessionStorage is per-tab: a second tab starts fresh (intentional per SPRINT.md §"Engineering Expectations").
// On SSR, storage is undefined so Zustand skips persistence and uses defaults.
const sessionStorageAdapter =
  typeof window !== "undefined"
    ? createJSONStorage(() => sessionStorage)
    : undefined;

export const useDiscoveryStore = create<DiscoverySlice>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setSearchMode: (mode) => {
        if (get().searchMode === mode) return; // idempotent — no persist write on same mode
        set({ searchMode: mode });
      },

      setMode1Query: (q) => set({ mode1Query: q }),

      setMode2Filters: (f) =>
        set((s) => ({ mode2Filters: { ...s.mode2Filters, ...f } })),

      setMode3Intent: (intent) => set({ mode3Intent: intent }),

      runSearch: async () => {
        const state = get();
        const myToken = ++searchToken;
        set({ searchStatus: "loading", searchError: null, searchResultMode: state.searchMode });

        let payload: SearchPayload;

        if (state.searchMode === "location") {
          payload = {
            mode: "location",
            query: { name_query: state.mode1Query },
          };
        } else if (state.searchMode === "criteria") {
          const f = state.mode2Filters;
          payload = {
            mode: "criteria",
            query: {
              filters: {
                sektor: f.sektor.length > 0 ? f.sektor : undefined,
                location_score_min: f.minSkorPotensi,
                location_score_max: f.maxSkorPotensi,
                market_access_min: f.minMarketAccess,
                growth_projection_min: f.minGrowthProjection,
                region: f.provinsiIds,
              },
            },
          };
        } else {
          // Mode 3: mode3Intent must be populated before calling runSearch().
          // TASK-009 handles the form UX; this slice just guards the null case.
          if (!state.mode3Intent) {
            set({ searchStatus: "idle" });
            return;
          }
          const intent = state.mode3Intent;
          payload = {
            mode: "opportunity",
            query: {
              intent: {
                sektor_target: intent.sektorTarget,
                budget_max_per_m2: intent.budgetMaxPerM2,
                preferensi: intent.preferensi,
              },
            },
          };
        }

        try {
          const res = await apiClient.discovery.search(payload);
          if (searchToken !== myToken) return; // stale resolve — discard

          const rows: SearchResultRow[] = res.results.map((r) => ({
            wilayah_id: r.wilayah_id,
            nama: r.nama,
            kabupaten: r.kabupaten,
            provinsi: r.provinsi,
            lat: r.lat,
            lng: r.lng,
            profil_kode: r.profil_kode,
            skor_potensi: r.skor_potensi,
            matching_score: r.matching_score,
            median_land_price: r.median_land_price,
            appreciation_rate: r.appreciation_rate,
            highlight_reason: r.highlight_reason,
            sector_signal: r.sector_signal,
            sector_signal_score: r.sector_signal_score,
            last_refreshed_at: r.last_refreshed_at,
          }));

          set({
            searchResults: rows,
            searchResultMode: state.searchMode,
            searchStatus: rows.length === 0 ? "empty" : "success",
          });
        } catch (err) {
          if (searchToken !== myToken) return;
          set({
            searchStatus: "error",
            searchResultMode: state.searchMode,
            searchError: err instanceof Error ? err.message : String(err),
          });
        }
      },

      // openPanel does NOT call setActiveProfile — the caller (TASK-004 marker click handler,
      // TASK-007 Mode 1 select handler) is responsible for the active profile update.
      openPanel: (wilayahId, profilKode) =>
        set({
          panelOpen: true,
          panelWilayahId: wilayahId,
          panelTab: profilKode ?? null,
        }),

      // closePanel preserves panelWilayahId + panelTab so re-opening immediately shows
      // the same wilayah/tab without a blank-state flicker. Reset only on resetSearch().
      closePanel: () => set({ panelOpen: false }),

      // setPanelTab changes the panel's active profil angle (e.g. AGRO_HOSP → AGRO_DOMINANT).
      // It does NOT call setActiveProfile — switching the panel's profil tab is a local panel
      // concern, not a global active-profile change. The SPRINT-01 active profile stays unchanged.
      setPanelTab: (profilKode) => set({ panelTab: profilKode }),

      resetSearch: () => {
        set(defaultState);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("talis.discovery.v1");
        }
      },
    }),
    {
      name: "talis.discovery.v1",
      storage: sessionStorageAdapter,
      // searchStatus and searchError are transient — they reset to defaults on every hydration.
      partialize: (s) => ({
        searchMode: s.searchMode,
        mode1Query: s.mode1Query,
        mode2Filters: s.mode2Filters,
        mode3Intent: s.mode3Intent,
        searchResults: s.searchResults,
        searchResultMode: s.searchResultMode,
        panelOpen: s.panelOpen,
        panelWilayahId: s.panelWilayahId,
        panelTab: s.panelTab,
      }),
    }
  )
);
