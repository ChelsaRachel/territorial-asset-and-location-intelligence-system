"use client";
// SPRINT-07 TASK-011 — NEW-C Comparative Regional Benchmark.

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Check, X } from "lucide-react";
import { SectionInfo, LoadingSkeleton, EmptyState, ErrorState, DataTimestamp } from "@/components/ui";
import { ExportButton } from "@/components/export/ExportButton";
import { ExportModalLazy } from "@/components/export/ExportModalLazy";
import type { ExportModalConfig } from "@/components/export/ExportModal";
import { apiClient } from "@/lib/api/apiClient";
import type { BenchmarkMapping, MonthlySnapshotRow } from "@/lib/types/monitoring";
import { formatRpPerM2, formatScore } from "@/lib/format/number";
import { projectFromReference } from "@/lib/governance";
import type { GapBarPoint, TrajectoryPoint } from "../components/BenchmarkCharts";
import { formatIsoMonth, toIsoMonth } from "../lib/monthFormat";

const TrajectoryChart = dynamic(
  () => import("../components/BenchmarkCharts").then((m) => m.TrajectoryChart),
  { ssr: false, loading: () => <LoadingSkeleton shape="chart" height="h-64" /> },
);
const GapAnalysisBar = dynamic(
  () => import("../components/BenchmarkCharts").then((m) => m.GapAnalysisBar),
  { ssr: false, loading: () => <LoadingSkeleton shape="chart" height="h-56" /> },
);

interface BenchmarkSectionProps {
  wilayahId: number | null;
}

type SectionState =
  | { status: "idle" | "loading"; mapping: null; activeSnapshots: MonthlySnapshotRow[]; referenceSnapshots: MonthlySnapshotRow[]; error: null }
  | { status: "success"; mapping: BenchmarkMapping | null; activeSnapshots: MonthlySnapshotRow[]; referenceSnapshots: MonthlySnapshotRow[]; error: null }
  | { status: "error"; mapping: null; activeSnapshots: MonthlySnapshotRow[]; referenceSnapshots: MonthlySnapshotRow[]; error: string };

type IndicatorKey = "location_score" | "infrastructure_index" | "market_access" | "harga_lahan_median" | "growth_score";

const INDICATORS: Array<{ key: IndicatorKey; label: string; projection: boolean }> = [
  { key: "location_score", label: "Location Score", projection: true },
  { key: "infrastructure_index", label: "Infrastructure", projection: true },
  { key: "market_access", label: "Market Access", projection: true },
  { key: "harga_lahan_median", label: "Land Value Median", projection: true },
  { key: "growth_score", label: "Growth Score", projection: true },
];

function currentSnapshot(rows: MonthlySnapshotRow[]) {
  return rows[rows.length - 1] ?? null;
}

function fallbackReferenceNow(mapping: BenchmarkMapping, key: IndicatorKey): number {
  const then = referenceThenValue(mapping, key);
  if (key === "harga_lahan_median") return Math.round(then * (1 + mapping.years_offset * 0.16));
  if (key === "growth_score") return Math.min(100, then + mapping.years_offset * 3);
  return Math.min(100, then + mapping.years_offset * 3);
}

function referenceThenValue(mapping: BenchmarkMapping, key: IndicatorKey): number {
  if (key === "growth_score") return Math.max(50, mapping.reference_snapshot.location_score - 4);
  return mapping.reference_snapshot[key as keyof typeof mapping.reference_snapshot] as number;
}

function getReferenceNow(mapping: BenchmarkMapping, referenceNow: MonthlySnapshotRow | null, key: IndicatorKey) {
  if (referenceNow) return referenceNow[key];
  return fallbackReferenceNow(mapping, key);
}

function formatIndicatorValue(key: IndicatorKey, value: number): string {
  if (key === "harga_lahan_median") return formatRpPerM2(value);
  return formatScore(value);
}

function buildTrajectory(
  activeSnapshots: MonthlySnapshotRow[],
  referenceSnapshots: MonthlySnapshotRow[],
  mapping: BenchmarkMapping,
  indicator: IndicatorKey,
  forecastValue: number,
): TrajectoryPoint[] {
  const active: TrajectoryPoint[] = activeSnapshots.map((snapshot) => ({
    month: toIsoMonth(snapshot.snapshot_date),
    aktif: snapshot[indicator],
    referensi: null,
    estimasi: null,
  }));

  const byMonth = new Map(active.map((point) => [point.month, point]));
  for (const snapshot of referenceSnapshots) {
    const date = new Date(`${snapshot.snapshot_date}T00:00:00Z`);
    const shifted = `${date.getUTCFullYear() - mapping.years_offset}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const existing = byMonth.get(shifted);
    if (existing) existing.referensi = snapshot[indicator];
  }

  if (active.length > 0) {
    const last = active[active.length - 1]!;
    last.estimasi = last.aktif;
    byMonth.set("2027-04", { month: "2027-04", aktif: null, referensi: null, estimasi: Math.round((last.aktif! + forecastValue) / 2) });
    byMonth.set("2030-04", { month: "2030-04", aktif: null, referensi: null, estimasi: forecastValue });
  }

  return Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
}

function LessonCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warn" | "info";
}) {
  const Icon = tone === "success" ? Check : tone === "warn" ? X : ArrowRight;
  const accent = tone === "success" ? "text-talis-green-700 border-talis-green-700" : tone === "warn" ? "text-amber-700 border-amber-500" : "text-blue-700 border-blue-700";
  return (
    <div className={`rounded-lg border border-talis-stone-200 border-t-4 bg-white p-4 ${accent}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <h3 className="font-sans text-sm font-semibold text-talis-stone-900">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="font-sans text-xs leading-relaxed text-talis-stone-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BenchmarkSection({ wilayahId }: BenchmarkSectionProps) {
  const [state, setState] = useState<SectionState>({ status: "idle", mapping: null, activeSnapshots: [], referenceSnapshots: [], error: null });
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorKey>("location_score");
  const [exportConfig, setExportConfig] = useState<ExportModalConfig | null>(null);

  useEffect(() => {
    if (!wilayahId) return;
    let cancelled = false;
    setState({ status: "loading", mapping: null, activeSnapshots: [], referenceSnapshots: [], error: null });

    async function load() {
      try {
        const [mappings, activeSnapshots] = await Promise.all([
          apiClient.monitoring.getBenchmark(wilayahId!),
          apiClient.monitoring.getMonthlySnapshots(wilayahId!),
        ]);
        const mapping = mappings[0] ?? null;
        let referenceSnapshots: MonthlySnapshotRow[] = [];
        if (mapping) {
          try {
            referenceSnapshots = await apiClient.monitoring.getMonthlySnapshots(mapping.wilayah_referensi_id);
          } catch {
            referenceSnapshots = [];
          }
        }
        if (!cancelled) setState({ status: "success", mapping, activeSnapshots, referenceSnapshots, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({ status: "error", mapping: null, activeSnapshots: [], referenceSnapshots: [], error: err instanceof Error ? err.message : "Benchmark gagal dimuat." });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [wilayahId]);

  const activeNow = currentSnapshot(state.activeSnapshots);
  const referenceNow = currentSnapshot(state.referenceSnapshots);
  const tableRows = useMemo(() => {
    if (!state.mapping || !activeNow) return [];
    return INDICATORS.map((indicator) => {
      const aktifNow = activeNow[indicator.key];
      const refThen = referenceThenValue(state.mapping!, indicator.key);
      const refNow = getReferenceNow(state.mapping!, referenceNow, indicator.key);
      const projection = projectFromReference({ activeNow: aktifNow, referenceThen: refThen, referenceNow: refNow });
      return { ...indicator, aktifNow, refThen, refNow, projection };
    });
  }, [activeNow, referenceNow, state.mapping]);

  const selectedRow = tableRows.find((row) => row.key === selectedIndicator);
  const trajectory = state.mapping && selectedRow
    ? buildTrajectory(state.activeSnapshots, state.referenceSnapshots, state.mapping, selectedIndicator, selectedRow.projection.value)
    : [];
  const gapBars: GapBarPoint[] = tableRows.map((row) => ({
    indicator: row.label,
    gap: row.key === "harga_lahan_median" ? Math.round((row.refNow - row.aktifNow) / 1000) : row.refNow - row.aktifNow,
  }));

  const lastRefreshed = state.mapping?.last_refreshed_at ?? activeNow?.snapshot_date ?? null;
  const periodA = state.activeSnapshots[0]?.snapshot_date.slice(0, 7) ?? null;
  const periodB = activeNow?.snapshot_date.slice(0, 7) ?? null;

  return (
    <section className="rounded-xl border border-talis-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <SectionInfo
            title="Benchmark Regional Komparatif"
            description="Bandingkan lintasan wilayah aktif dengan wilayah referensi berdasarkan kesamaan profil historis."
          />
          {lastRefreshed && <DataTimestamp timestamp={lastRefreshed} className="mt-1 block" />}
        </div>
        <ExportButton
          label="Ekspor"
          disabled={!wilayahId || !periodA || !periodB || state.status !== "success"}
          onClick={() => {
            if (!wilayahId || !periodA || !periodB) return;
            setExportConfig({
              mode: "accountability",
              wilayahId,
              periodA,
              periodB,
              title: "Ekspor Benchmark Regional",
            });
          }}
        />
      </div>

      {(state.status === "idle" || state.status === "loading") && (
        <div className="mt-4 space-y-3">
          <LoadingSkeleton shape="table-row" count={4} />
          <LoadingSkeleton shape="chart" height="h-48" />
          <LoadingSkeleton shape="chart" height="h-32" />
          <div className="flex gap-4">
            <LoadingSkeleton shape="card" className="flex-1" />
            <LoadingSkeleton shape="card" className="flex-1" />
            <LoadingSkeleton shape="card" className="flex-1" />
          </div>
        </div>
      )}

      {state.status === "error" && (
        <ErrorState className="mt-4" title="Gagal memuat benchmark" description={state.error} />
      )}

      {state.status === "success" && !state.mapping && (
        <EmptyState
          className="mt-4"
          title="Tidak ada wilayah referensi terkonfigurasi untuk wilayah aktif."
          description="Benchmark mapping belum tersedia untuk wilayah ini."
        />
      )}

      {state.status === "success" && state.mapping && activeNow && (
        <div className="mt-5 space-y-5">
          <div className="overflow-hidden rounded-lg border border-talis-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-talis-stone-50">
                <tr>
                  <th className="px-3 py-2 text-left font-sans text-xs uppercase tracking-wide text-talis-stone-600">Indikator</th>
                  <th className="px-3 py-2 text-right font-sans text-xs uppercase tracking-wide text-talis-stone-600">{state.mapping.wilayah_aktif_nama} 2026</th>
                  <th className="px-3 py-2 text-right font-sans text-xs uppercase tracking-wide text-talis-stone-600">{state.mapping.wilayah_referensi_nama} {state.mapping.reference_snapshot.year}</th>
                  <th className="px-3 py-2 text-right font-sans text-xs uppercase tracking-wide text-talis-stone-600">{state.mapping.wilayah_referensi_nama} 2026</th>
                  <th className="bg-talis-green-700/5 px-3 py-2 text-right font-sans text-xs uppercase tracking-wide text-talis-green-700">Estimasi Aktif 2030</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-talis-stone-100">
                {tableRows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-3 py-2 font-sans text-talis-stone-800">{row.label}</td>
                    <td className="px-3 py-2 text-right font-mono text-talis-stone-900">{formatIndicatorValue(row.key, row.aktifNow)}</td>
                    <td className="px-3 py-2 text-right font-mono text-talis-stone-700">{formatIndicatorValue(row.key, row.refThen)}</td>
                    <td className="px-3 py-2 text-right font-mono text-talis-stone-900">{formatIndicatorValue(row.key, row.refNow)}</td>
                    <td className="bg-talis-green-700/5 px-3 py-2 text-right font-mono font-semibold text-talis-green-700">{formatIndicatorValue(row.key, row.projection.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            {INDICATORS.map((indicator) => (
              <button
                key={indicator.key}
                type="button"
                onClick={() => setSelectedIndicator(indicator.key)}
                className={`rounded-full border px-3 py-1 font-sans text-xs font-semibold ${
                  selectedIndicator === indicator.key
                    ? "border-talis-green-700 bg-talis-green-700 text-white"
                    : "border-talis-stone-300 bg-white text-talis-stone-700 hover:bg-talis-stone-50"
                }`}
              >
                {indicator.label}
              </button>
            ))}
          </div>

          <TrajectoryChart data={trajectory} />
          <GapAnalysisBar data={gapBars} />

          <div className="grid gap-3 lg:grid-cols-3">
            <LessonCard title="Kebijakan Berhasil" tone="success" items={state.mapping.pelajaran_konkret.kebijakan_berhasil} />
            <LessonCard title="Kesalahan Hindari" tone="warn" items={state.mapping.pelajaran_konkret.kesalahan_hindari} />
            <LessonCard title="Implikasi Untuk Aktif" tone="info" items={state.mapping.pelajaran_konkret.implikasi_untuk_aktif} />
          </div>

          <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
            <h3 className="font-display text-base font-semibold text-talis-stone-900">
              Estimasi {state.mapping.wilayah_aktif_nama} di tahun 2030
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {tableRows.map((row) => (
                <div key={row.key} className="rounded border border-talis-stone-200 bg-white p-3">
                  <p className="font-sans text-xs text-talis-stone-600">{row.label}</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-talis-stone-900">{formatIndicatorValue(row.key, row.projection.value)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-sans text-xs text-talis-stone-600">
                Berbasis trajektori{" "}
                <span className="font-semibold text-talis-stone-800">{state.mapping.wilayah_referensi_nama}</span>{" "}
                dari {state.mapping.reference_snapshot.year} ke saat ini.
              </p>
              <p className="font-sans text-xs text-talis-stone-600">
                Referensi bulanan disejajarkan dengan offset {state.mapping.years_offset} tahun.
              </p>
              <p className="font-sans text-xs text-talis-stone-600">
                Rentang snapshot aktif terakhir:{" "}
                <span className="font-semibold text-talis-stone-800">
                  {formatIsoMonth(toIsoMonth(activeNow.snapshot_date))}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <ExportModalLazy
        open={exportConfig !== null}
        config={exportConfig}
        onClose={() => setExportConfig(null)}
      />
    </section>
  );
}
