"use client";
import { useShallow } from "zustand/react/shallow";
import { useAssessmentStore } from "./assessment";
import type { Sektor } from "@/lib/types/common";
import type { Weights } from "@/lib/types/assessment";
import type { GapSortColumn } from "./assessment";

export function useCurrentSektor(): Sektor {
  return useAssessmentStore((s) => s.currentSektor);
}

export function useAssessmentHydrated(): boolean {
  return useAssessmentStore((s) => s._hasHydrated);
}

export function useCustomWeights(): Weights | null {
  return useAssessmentStore((s) => s.customWeights);
}

export function useCustomWeightsEnabled(): boolean {
  return useAssessmentStore((s) => s.customWeightsEnabled);
}

export function useGapSort(): { column: GapSortColumn; direction: "asc" | "desc" } {
  return useAssessmentStore(
    useShallow((s) => ({ column: s.gapSortColumn, direction: s.gapSortDirection })),
  );
}

export function useExpandedGapRows(): Set<number> {
  return useAssessmentStore((s) => s.expandedGapRows);
}

export function useAssessmentActions() {
  return useAssessmentStore(
    useShallow((s) => ({
      setCurrentSektor: s.setCurrentSektor,
      enableCustomWeights: s.enableCustomWeights,
      disableCustomWeights: s.disableCustomWeights,
      setCustomWeights: s.setCustomWeights,
      setGapSort: s.setGapSort,
      toggleGapRow: s.toggleGapRow,
    })),
  );
}

// Convenience composite hook for C.1 section (avoids broad re-renders on slider drag)
export function useAssessment() {
  return useAssessmentStore(
    useShallow((s) => ({
      currentSektor: s.currentSektor,
      customWeightsEnabled: s.customWeightsEnabled,
      customWeights: s.customWeights,
      _hasHydrated: s._hasHydrated,
      setCurrentSektor: s.setCurrentSektor,
      setDefaultSektor: s.setDefaultSektor,
      enableCustomWeights: s.enableCustomWeights,
      disableCustomWeights: s.disableCustomWeights,
      setCustomWeights: s.setCustomWeights,
    })),
  );
}
