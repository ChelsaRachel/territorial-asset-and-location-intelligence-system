"use client";

import { useCallback } from "react";
import { BarChart3 } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import type { GrowthResponse } from "@/lib/types/intelligence";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui";
import { useIntelligenceSectionData } from "../hooks/useIntelligenceSectionData";
import { isNotFoundError, errorDescription } from "../lib/sectionState";
import { GrowthProjectionGauge } from "../components/GrowthProjectionGauge";
import { GrowthBreakdownBars } from "../components/GrowthBreakdownBars";
import { SupportingSignalsList } from "../components/SupportingSignalsList";
import { CriticalTimeline } from "../components/CriticalTimeline";
import { CostOfDelayCard } from "../components/CostOfDelayCard";

export function GrowthProjectionSection() {
  const fetchGrowth = useCallback(
    (wilayahId: number): Promise<GrowthResponse> => apiClient.intelligence.getGrowth(wilayahId),
    [],
  );
  const { activeProfile, data, loading, error, retry } = useIntelligenceSectionData(fetchGrowth);

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="Proyeksi Pertumbuhan"
        description={
          activeProfile
            ? `A.8 — Growth Projection Score dan pipeline infrastruktur ${activeProfile.nama}`
            : undefined
        }
        lastUpdated={data?.last_computed_at}
        tooltip="A.8 menggabungkan pipeline infrastruktur, sinyal emerging destination, dan CAGR penduduk menjadi skor proyeksi 0-100."
        icon={<BarChart3 aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton shape="circle" width="w-48" height="h-24" className="mx-auto" />
          <LoadingSkeleton shape="chart" />
          <div className="grid gap-4 md:grid-cols-3">
            <LoadingSkeleton shape="card" />
            <LoadingSkeleton shape="card" />
            <LoadingSkeleton shape="card" />
          </div>
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data proyeksi belum tersedia"
            description="Fixture SPRINT-04 tersedia untuk Ciwidey, Seminyak, dan Berastagi."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data ? (
        <div className="space-y-6">
          {/* Gauge + breakdown side-by-side on wider screens */}
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
            <div className="shrink-0">
              <p className="mb-1 text-center font-sans text-xs uppercase tracking-wide text-talis-stone-700">
                Growth Projection Score
              </p>
              <GrowthProjectionGauge score={data.growth_projection_score} />
            </div>
            <div className="w-full flex-1">
              <GrowthBreakdownBars breakdown={data.breakdown} />
            </div>
          </div>

          <SupportingSignalsList signals={data.sinyal_pendukung} />

          <CriticalTimeline items={data.timeline_kritis} />

          <CostOfDelayCard amount={data.cost_of_delay_per_bulan_rp} />
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Proyeksi pertumbuhan akan muncul setelah active profile tersedia."
        />
      )}
    </div>
  );
}
