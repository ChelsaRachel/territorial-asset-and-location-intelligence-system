"use client";
// Session-only Zustand store for SPRINT-05 assessment state.
// SPRINT-08 persists only the active sektor so Quick Scan can mirror Page 4.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Sektor } from "@/lib/types/common";
import type { Weights } from "@/lib/types/assessment";
import { SEKTOR_PRESETS } from "@/lib/scoring/weights";

export type GapSortColumn = "rank_provinsi" | "priority_score" | "skor_potensi" | "infrastructure_gap";

interface AssessmentState {
  currentSektor: Sektor;
  _hasHydrated: boolean;
  customWeightsEnabled: boolean;
  customWeights: Weights | null;
  gapSortColumn: GapSortColumn;
  gapSortDirection: "asc" | "desc";
  expandedGapRows: Set<number>;

  setCurrentSektor: (sektor: Sektor) => void;
  setDefaultSektor: (sektor: Sektor) => void;
  enableCustomWeights: () => void;
  disableCustomWeights: () => void;
  setCustomWeights: (weights: Weights) => void;
  setGapSort: (column: GapSortColumn, direction: "asc" | "desc") => void;
  toggleGapRow: (wilayahId: number) => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const ASSESSMENT_SESSION_KEY = "talis.assessment.session";

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      currentSektor: "agribisnis",
      _hasHydrated: false,
      customWeightsEnabled: false,
      customWeights: null,
      gapSortColumn: "priority_score",
      gapSortDirection: "desc",
      expandedGapRows: new Set<number>(),

      setCurrentSektor: (sektor: Sektor) => {
        // Reset custom weights on sektor switch — docs §2.1
        set({ currentSektor: sektor, customWeights: null, customWeightsEnabled: false });
      },

      setDefaultSektor: (sektor: Sektor) => {
        const stored = typeof window !== "undefined"
          ? sessionStorage.getItem(ASSESSMENT_SESSION_KEY)
          : null;
        if (!stored) set({ currentSektor: sektor });
      },

      enableCustomWeights: () => {
        const { currentSektor } = get();
        set({
          customWeightsEnabled: true,
          customWeights: { ...SEKTOR_PRESETS[currentSektor] },
        });
      },

      disableCustomWeights: () => {
        set({ customWeightsEnabled: false, customWeights: null });
      },

      setCustomWeights: (weights: Weights) => {
        set({ customWeights: weights });
      },

      setGapSort: (column: GapSortColumn, direction: "asc" | "desc") => {
        set({ gapSortColumn: column, gapSortDirection: direction });
      },

      toggleGapRow: (wilayahId: number) => {
        const { expandedGapRows } = get();
        const next = new Set(expandedGapRows);
        if (next.has(wilayahId)) {
          next.delete(wilayahId);
        } else {
          next.add(wilayahId);
        }
        set({ expandedGapRows: next });
      },
    }),
    {
      name: ASSESSMENT_SESSION_KEY,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? sessionStorage : noopStorage)),
      partialize: (state) => ({ currentSektor: state.currentSektor }),
      onRehydrateStorage: () => () => {
        useAssessmentStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
