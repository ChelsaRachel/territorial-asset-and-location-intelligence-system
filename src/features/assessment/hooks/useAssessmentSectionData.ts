"use client";
// Mirrors src/features/intelligence/hooks/useIntelligenceSectionData.ts pattern.
import { useCallback, useEffect, useRef, useState } from "react";
import { useActiveProfile, useHydrationStatus } from "@/lib/store/useActiveProfile";
import type { WilayahProfile } from "@/lib/store/profileSlug";

interface AssessmentSectionState<T> {
  activeProfile: WilayahProfile | null;
  data: T | null;
  loading: boolean;
  error: unknown;
  retry: () => void;
}

export function useAssessmentSectionData<T>(
  fetcher: (wilayahId: number) => Promise<T>,
): AssessmentSectionState<T> {
  const activeProfile = useActiveProfile();
  const hydrationStatus = useHydrationStatus();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(hydrationStatus === "pending");
  const [error, setError] = useState<unknown>(null);
  const requestIdRef = useRef(0);
  const activeWilayahId = activeProfile?.wilayah_id ?? null;

  const load = useCallback(() => {
    if (!activeWilayahId) {
      setData(null);
      setError(null);
      setLoading(hydrationStatus === "pending");
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    void fetcher(activeWilayahId)
      .then((result) => {
        if (requestIdRef.current !== requestId) return;
        setData(result);
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId) return;
        setData(null);
        setError(err);
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) return;
        setLoading(false);
      });
  }, [activeWilayahId, fetcher, hydrationStatus]);

  useEffect(() => {
    load();
  }, [load]);

  return { activeProfile, data, loading, error, retry: load };
}
