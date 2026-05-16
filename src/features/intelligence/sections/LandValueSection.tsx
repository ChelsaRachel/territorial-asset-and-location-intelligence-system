"use client";

import { useCallback } from "react";
import { MapPin } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import type { LandValueResponse, LandValueProyeksi } from "@/lib/types/intelligence";
import type { SpeculationStatus } from "@/lib/types/common";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState, StatusPill } from "@/components/ui";
import { useIntelligenceSectionData } from "../hooks/useIntelligenceSectionData";
import { isNotFoundError, errorDescription } from "../lib/sectionState";
import { LandValueAreaChart } from "../components/LandValueAreaChart";
import { HargaNjopBarChart } from "../components/HargaNjopBarChart";
import { formatRpPerM2, formatPct, formatRatio } from "@/lib/format";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  pill?: React.ReactNode;
}

function MetricCard({ label, value, sub, pill }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
      <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-talis-stone-900">{value}</p>
      {sub && <p className="mt-0.5 font-sans text-xs text-talis-stone-700">{sub}</p>}
      {pill && <div className="mt-2">{pill}</div>}
    </div>
  );
}

type ProyeksiPeriod = "6_bulan" | "12_bulan" | "36_bulan";

const PROYEKSI_LABELS: Record<ProyeksiPeriod, string> = {
  "6_bulan": "6 Bulan",
  "12_bulan": "12 Bulan",
  "36_bulan": "36 Bulan",
};

function ProjectionCard({
  period,
  data,
}: {
  period: ProyeksiPeriod;
  data: LandValueProyeksi[ProyeksiPeriod];
}) {
  const [konMin, konMax] = data.konservatif;
  const [optMin, optMax] = data.optimistis;
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
      <p className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-700">
        {PROYEKSI_LABELS[period]}
      </p>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-talis-stone-700">Konservatif</span>
          <span className="font-mono text-xs font-semibold text-talis-stone-900">
            {formatRpPerM2(konMin)} – {formatRpPerM2(konMax)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-talis-stone-700">Optimistis</span>
          <span className="font-mono text-xs font-semibold text-talis-green-700">
            {formatRpPerM2(optMin)} – {formatRpPerM2(optMax)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandValueSection() {
  const fetchLandValue = useCallback(
    (wilayahId: number): Promise<LandValueResponse> =>
      apiClient.intelligence.getLandValue(wilayahId),
    [],
  );
  const { activeProfile, data, loading, error, retry } =
    useIntelligenceSectionData(fetchLandValue);

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="Dinamika Nilai Lahan"
        description={
          activeProfile
            ? `A.7 — Tren harga, komparasi NJOP, dan proyeksi nilai lahan ${activeProfile.nama}`
            : undefined
        }
        lastUpdated={data?.last_updated}
        tooltip="A.7 menganalisis apresiasi harga lahan 8 kuartal, selisih harga pasar vs NJOP, dan proyeksi 6/12/36 bulan."
        icon={<MapPin aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <LoadingSkeleton shape="card" />
            <LoadingSkeleton shape="card" />
            <LoadingSkeleton shape="card" />
          </div>
          <LoadingSkeleton shape="chart" />
          <LoadingSkeleton shape="chart" />
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data nilai lahan belum tersedia"
            description="Fixture SPRINT-04 tersedia untuk Ciwidey, Seminyak, dan Berastagi."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data ? (
        <div className="space-y-5">
          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Median Harga Lahan"
              value={formatRpPerM2(data.current.median_price_rp_per_m2)}
              sub="per m²"
            />
            <MetricCard
              label="Apresiasi YoY"
              value={formatPct(data.current.appreciation_yoy_pct)}
              sub="pertumbuhan tahunan"
            />
            <MetricCard
              label="Speculation Ratio"
              value={formatRatio(data.current.speculation_ratio)}
              sub="harga vs PDRB growth"
              pill={
                <StatusPill
                  variant="speculation"
                  value={data.current.speculation_status as SpeculationStatus}
                />
              }
            />
          </div>

          {/* 8-quarter area chart */}
          {data.quarterly_series.length > 0 && (
            <LandValueAreaChart series={data.quarterly_series} />
          )}

          {/* Harga vs NJOP */}
          {data.harga_vs_njop.length > 0 && (
            <HargaNjopBarChart rows={data.harga_vs_njop} />
          )}

          {/* Proyeksi 6 / 12 / 36 bulan */}
          <div>
            <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
              Proyeksi Nilai Lahan
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["6_bulan", "12_bulan", "36_bulan"] as ProyeksiPeriod[]).map((period) => (
                <ProjectionCard key={period} period={period} data={data.proyeksi[period]} />
              ))}
            </div>
          </div>

          {/* Timing recommendation */}
          {data.timing_recommendation && (
            <div className="rounded-lg border border-talis-green-700/30 bg-talis-green-700/5 p-4">
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-green-700">
                Rekomendasi Waktu Investasi
              </p>
              <p className="mt-1 font-sans text-sm text-talis-stone-900">
                {data.timing_recommendation}
              </p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Dinamika nilai lahan akan muncul setelah active profile tersedia."
        />
      )}
    </div>
  );
}
