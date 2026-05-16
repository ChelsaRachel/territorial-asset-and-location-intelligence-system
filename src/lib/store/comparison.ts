"use client";
// Zustand store for SPRINT-06 comparison + shortlist state.
// Persisted to sessionStorage (per-tab, resets on close).
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient } from "@/lib/api/apiClient";
import type {
  WilayahComparisonRow,
  RekomendasiCard,
  HighlightMap,
  DeltaRow,
} from "@/lib/decision/compare";
import type { WilayahLandBankingResult } from "@/lib/api/decision/getLandBanking";
import type {
  WilayahBusinessRecommenderResult,
} from "@/lib/api/decision/getBusinessRecommender";
import type { ShortlistItem } from "@/lib/api/decision/getShortlist";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FetchStatus = "idle" | "loading" | "success" | "error";

export interface SectionState<T> {
  status: FetchStatus;
  data: T | null;
  error: string | null;
}

function idle<T>(): SectionState<T> {
  return { status: "idle", data: null, error: null };
}

// ─── Store interface ──────────────────────────────────────────────────────────

export interface ComparisonSlice {
  /** Active wilayah for the decision page (seeded from active profile on mount). */
  activeWilayahId: number | null;

  /** Selected candidate wilayah IDs for the comparison table (2-5). */
  kandidatIds: number[];

  // Section fetch states
  compare: SectionState<{
    kandidat: WilayahComparisonRow[];
    rekomendasi: RekomendasiCard[];
    highlights: HighlightMap;
    delta: DeltaRow[] | null;
  }>;
  landBanking: SectionState<WilayahLandBankingResult>;
  businessRecommender: SectionState<WilayahBusinessRecommenderResult>;
  shortlist: SectionState<ShortlistItem[]>;

  // Actions
  setActiveWilayah(wilayahId: number): void;
  addKandidat(wilayahId: number): void;
  removeKandidat(wilayahId: number): void;
  setKandidatIds(ids: number[]): void;
  fetchCompare(): Promise<void>;
  fetchLandBanking(wilayahId: number): Promise<void>;
  fetchBusinessRecommender(wilayahId: number): Promise<void>;
  fetchShortlist(): Promise<void>;
  saveToShortlist(wilayahId: number, catatan?: string): Promise<void>;
  removeFromShortlist(shortlistId: string): Promise<void>;
  updateNote(shortlistId: string, catatan: string): Promise<void>;
  /** Seed active wilayah and trigger all section fetches on page mount. */
  initDecisionPage(wilayahId: number): Promise<void>;
}

// ─── Store implementation ─────────────────────────────────────────────────────

const sessionStorageAdapter =
  typeof window !== "undefined"
    ? createJSONStorage(() => sessionStorage)
    : undefined;

export const useComparisonStore = create<ComparisonSlice>()(
  persist(
    (set, get) => ({
      activeWilayahId: null,
      kandidatIds: [],
      compare: idle(),
      landBanking: idle(),
      businessRecommender: idle(),
      shortlist: idle(),

      setActiveWilayah: (wilayahId) => set({ activeWilayahId: wilayahId }),

      addKandidat: (wilayahId) => {
        const { kandidatIds } = get();
        if (kandidatIds.includes(wilayahId)) return;
        if (kandidatIds.length >= 5) return; // max 5 candidates
        set({ kandidatIds: [...kandidatIds, wilayahId] });
      },

      removeKandidat: (wilayahId) => {
        set((s) => ({ kandidatIds: s.kandidatIds.filter((id) => id !== wilayahId) }));
      },

      setKandidatIds: (ids) => set({ kandidatIds: ids.slice(0, 5) }),

      fetchCompare: async () => {
        const { kandidatIds } = get();
        if (kandidatIds.length === 0) return;
        set((s) => ({ compare: { ...s.compare, status: "loading", error: null } }));
        try {
          const result = await apiClient.decision.compare(kandidatIds);
          set({ compare: { status: "success", data: result as ComparisonSlice["compare"]["data"], error: null } });
        } catch (err) {
          set({
            compare: {
              status: "error",
              data: null,
              error: err instanceof Error ? err.message : String(err),
            },
          });
        }
      },

      fetchLandBanking: async (wilayahId) => {
        set((s) => ({ landBanking: { ...s.landBanking, status: "loading", error: null } }));
        try {
          const result = await apiClient.decision.getLandBanking(wilayahId);
          set({ landBanking: { status: "success", data: result as WilayahLandBankingResult, error: null } });
        } catch (err) {
          set({
            landBanking: {
              status: "error",
              data: null,
              error: err instanceof Error ? err.message : String(err),
            },
          });
        }
      },

      fetchBusinessRecommender: async (wilayahId) => {
        set((s) => ({
          businessRecommender: { ...s.businessRecommender, status: "loading", error: null },
        }));
        try {
          const result = await apiClient.decision.getBusinessRecommender(wilayahId);
          set({
            businessRecommender: {
              status: "success",
              data: result as WilayahBusinessRecommenderResult,
              error: null,
            },
          });
        } catch (err) {
          set({
            businessRecommender: {
              status: "error",
              data: null,
              error: err instanceof Error ? err.message : String(err),
            },
          });
        }
      },

      fetchShortlist: async () => {
        set((s) => ({ shortlist: { ...s.shortlist, status: "loading", error: null } }));
        try {
          const result = await apiClient.decision.getShortlist();
          set({ shortlist: { status: "success", data: result as ShortlistItem[], error: null } });
        } catch (err) {
          set({
            shortlist: {
              status: "error",
              data: null,
              error: err instanceof Error ? err.message : String(err),
            },
          });
        }
      },

      saveToShortlist: async (wilayahId, catatan) => {
        const result = await apiClient.decision.saveShortlist(wilayahId, catatan);
        // Optimistically update shortlist data
        set((s) => {
          const current = s.shortlist.data ?? [];
          const exists = current.find((i) => i.id === (result as ShortlistItem).id);
          const next = exists
            ? current.map((i) => (i.id === (result as ShortlistItem).id ? (result as ShortlistItem) : i))
            : [...current, result as ShortlistItem];
          return { shortlist: { status: "success", data: next, error: null } };
        });
      },

      removeFromShortlist: async (shortlistId) => {
        await apiClient.decision.removeShortlist(shortlistId);
        set((s) => ({
          shortlist: {
            ...s.shortlist,
            data: (s.shortlist.data ?? []).filter((i) => i.id !== shortlistId),
          },
        }));
      },

      updateNote: async (shortlistId, catatan) => {
        const result = await apiClient.decision.updateShortlistNote(shortlistId, catatan);
        set((s) => ({
          shortlist: {
            ...s.shortlist,
            data: (s.shortlist.data ?? []).map((i) =>
              i.id === shortlistId ? (result as ShortlistItem) : i
            ),
          },
        }));
      },

      initDecisionPage: async (wilayahId) => {
        const { activeWilayahId, kandidatIds, fetchCompare, fetchLandBanking, fetchBusinessRecommender, fetchShortlist } = get();

        // Seed active wilayah if not set
        if (!activeWilayahId) {
          set({ activeWilayahId: wilayahId });
        }

        // Ensure active wilayah is in kandidatIds
        if (!kandidatIds.includes(wilayahId)) {
          set((s) => ({ kandidatIds: [wilayahId, ...s.kandidatIds].slice(0, 5) }));
        }

        // Parallel fetches — all four sections load independently
        await Promise.allSettled([
          fetchCompare(),
          fetchLandBanking(wilayahId),
          fetchBusinessRecommender(wilayahId),
          fetchShortlist(),
        ]);
      },
    }),
    {
      name: "talis.comparison.v1",
      storage: sessionStorageAdapter,
      // Persist selection state only — fetch states are transient
      partialize: (s) => ({
        activeWilayahId: s.activeWilayahId,
        kandidatIds: s.kandidatIds,
      }),
    }
  )
);
