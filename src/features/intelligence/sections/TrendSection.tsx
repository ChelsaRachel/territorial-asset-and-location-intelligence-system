"use client";

import { useCallback } from "react";
import { TrendingUp } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import type { TrendResponse } from "@/lib/types/intelligence";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui";
import { useIntelligenceSectionData } from "../hooks/useIntelligenceSectionData";
import { isNotFoundError, errorDescription } from "../lib/sectionState";
import { NdviTrendChart } from "../components/NdviTrendChart";
import { PdrbTrendChart } from "../components/PdrbTrendChart";
import { ClimateAnomalyChart } from "../components/ClimateAnomalyChart";
import { ProductivityScenarioCards } from "../components/ProductivityScenarioCards";

const TREN_LABEL_STYLE: Record<string, { bg: string; text: string }> = {
  Membaik: { bg: "bg-talis-green-700/15", text: "text-talis-green-700" },
  Stabil: { bg: "bg-talis-stone-200", text: "text-talis-stone-700" },
  Menurun: { bg: "bg-talis-red-700/15", text: "text-talis-red-700" },
  Bergejolak: { bg: "bg-talis-amber/20", text: "text-talis-earth-700" },
};

function TrenSummaryBanner({ data }: { data: TrendResponse }) {
  const { label, score } = data.tren_summary;
  const style = TREN_LABEL_STYLE[label] ?? TREN_LABEL_STYLE["Stabil"]!;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
      <div className="flex-1">
        <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
          Tren Kondisi
        </p>
        <p className="font-display text-xl font-semibold text-talis-stone-900">{label}</p>
      </div>
      <div className="text-right">
        <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">Skor Tren</p>
        <p className="font-mono text-3xl font-bold text-talis-green-700">{score}</p>
      </div>
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-xs font-semibold ${style.bg} ${style.text}`}
      >
        {label}
      </span>
    </div>
  );
}

export function TrendSection() {
  const fetchTrend = useCallback(
    (wilayahId: number): Promise<TrendResponse> => apiClient.intelligence.getTrend(wilayahId),
    [],
  );
  const { activeProfile, data, loading, error, retry } = useIntelligenceSectionData(fetchTrend);

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="Tren Kondisi Wilayah"
        description={
          activeProfile
            ? `A.5 — NDVI, PDRB, anomali iklim, dan proyeksi produktivitas ${activeProfile.nama}`
            : undefined
        }
        lastUpdated={data?.last_updated}
        tooltip="A.5 menggabungkan indeks vegetasi (NDVI), pertumbuhan ekonomi (PDRB), dan anomali iklim (SPI) menjadi tren kondisi wilayah."
        icon={<TrendingUp aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton shape="card" />
          <LoadingSkeleton shape="chart" />
          <LoadingSkeleton shape="chart" />
          <LoadingSkeleton shape="chart" />
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data tren belum tersedia"
            description="Fixture SPRINT-04 tersedia untuk Ciwidey, Seminyak, dan Berastagi."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data ? (
        <div className="space-y-5">
          <TrenSummaryBanner data={data} />

          <div className="grid gap-5 lg:grid-cols-2">
            <NdviTrendChart series={data.ndvi_series} wilayahName={activeProfile?.nama} />
            <PdrbTrendChart series={data.pdrb_series} />
          </div>

          <ClimateAnomalyChart series={data.iklim_anomali_series} />

          <ProductivityScenarioCards
            proyeksi={data.tren_summary.proyeksi}
          />
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Tren kondisi wilayah akan muncul setelah active profile tersedia."
        />
      )}
    </div>
  );
}
