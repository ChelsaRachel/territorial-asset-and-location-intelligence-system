"use client";
// SPRINT-07 TASK-007 — Section NEW-D: Investment Pipeline Monitor

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { SectionInfo, LoadingSkeleton, EmptyState, ErrorState, DataTimestamp, KpiCard } from "@/components/ui";
import { apiClient } from "@/lib/api/apiClient";
import type { PipelineItem, PipelineResponse, StatusDistributionPct } from "@/lib/types/monitoring";
import { computeGapConfirmation } from "@/lib/governance";

const PipelineStatusDonut = dynamic(
  () => import("../components/PipelineStatusDonut").then((m) => m.PipelineStatusDonut),
  { ssr: false, loading: () => <LoadingSkeleton shape="chart" height="h-64" /> },
);

interface PipelineMonitorSectionProps {
  wilayahId: number | null;
}

type SectionState =
  | { status: "idle" | "loading"; data: null; error: null }
  | { status: "success"; data: PipelineResponse; error: null }
  | { status: "error"; data: null; error: string };

const STATUS_LABEL: Record<PipelineItem["status"], string> = {
  operasional: "Operasional",
  izin_diterbitkan: "Izin Diterbitkan",
  dalam_proses: "Dalam Proses",
  tertahan: "Tertahan",
};

const STATUS_CLASS: Record<PipelineItem["status"], string> = {
  operasional: "border-talis-green-700/30 bg-talis-green-700/15 text-talis-green-700",
  izin_diterbitkan: "border-amber-300 bg-amber-50 text-amber-700",
  dalam_proses: "border-blue-300 bg-blue-50 text-blue-700",
  tertahan: "border-talis-red-700/30 bg-talis-red-700/15 text-talis-red-700",
};

const GAP_CLASS: Record<PipelineResponse["aggregate"]["gap_confirmation"], string> = {
  terkonfirmasi: "border-talis-green-700/30 bg-talis-green-700/15 text-talis-green-700",
  hambatan_non_data: "border-amber-300 bg-amber-50 text-amber-700",
  koreksi_oversupply: "border-talis-red-700/30 bg-talis-red-700/15 text-talis-red-700",
  belum_relevan: "border-talis-stone-300 bg-talis-stone-100 text-talis-stone-700",
};

function formatSektor(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function PipelineStatusPill({ status }: { status: PipelineItem["status"] }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 font-sans text-xs font-semibold ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function PipelineDetail({ item }: { item: PipelineItem }) {
  return (
    <div className="mt-3 rounded-lg border border-talis-green-700/20 bg-talis-green-700/5 p-5">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-1">
          <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-600">Catatan Proyek</p>
          <p className="font-sans text-sm leading-relaxed text-talis-stone-800">{item.deskripsi_proyek}</p>
        </div>
        <div className="space-y-1">
          <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-600">Kontak / Sumber</p>
          <p className="font-sans text-sm text-talis-stone-800">{item.kontak_investor}</p>
          <p className="font-sans text-xs text-talis-stone-600">{item.sumber}</p>
        </div>
        <div className="space-y-1">
          <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-600">Blocker Tercatat</p>
          <p className="font-sans text-sm leading-relaxed text-talis-stone-800">
            {item.reason_if_tertahan ?? "Tidak ada blocker tertahan yang tercatat."}
          </p>
        </div>
      </div>
    </div>
  );
}

function PipelineTimeline({ items }: { items: PipelineItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expanded = items.find((item) => item.id === expandedId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2" aria-label="Timeline pipeline investasi">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-expanded={expandedId === item.id}
            onClick={() => setExpandedId((current) => (current === item.id ? null : item.id))}
            className="min-w-[280px] rounded-lg border border-talis-stone-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-talis-green-700/40 hover:bg-talis-green-700/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-sans text-sm font-semibold leading-snug text-talis-stone-900">{item.nama_investor}</p>
              <PipelineStatusPill status={item.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded bg-talis-stone-100 px-2 py-1 font-sans text-xs text-talis-stone-700">
                {formatSektor(item.sektor)}
              </span>
              <span className="rounded bg-talis-green-700/10 px-2 py-1 font-mono text-xs font-semibold text-talis-green-700">
                Rp {item.nilai_rp_juta.toLocaleString("id-ID")} M
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="font-sans text-xs text-talis-stone-600">ETA milestone:</span>
              <span className="font-mono text-xs font-semibold text-talis-stone-900">{item.eta_milestone ?? "TBD"}</span>
            </div>
          </button>
        ))}
      </div>
      {expanded && <PipelineDetail item={expanded} />}
    </div>
  );
}

function deriveDemandSupplyGapPct(items: Awaited<ReturnType<typeof apiClient.intelligence.getDemand>>["items"]) {
  const relevant = items.filter((item) => item.demand_per_bulan > 0);
  if (relevant.length === 0) return 0;
  const totalGap = relevant.reduce((sum, item) => sum + Math.max(item.gap, 0), 0);
  const totalDemand = relevant.reduce((sum, item) => sum + item.demand_per_bulan, 0);
  return totalDemand > 0 ? Math.round((totalGap / totalDemand) * 100) : 0;
}

export function PipelineMonitorSection({ wilayahId }: PipelineMonitorSectionProps) {
  const [state, setState] = useState<SectionState>({ status: "idle", data: null, error: null });

  useEffect(() => {
    if (!wilayahId) return;
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });

    async function load() {
      try {
        const [pipeline, demand] = await Promise.all([
          apiClient.monitoring.getPipeline(wilayahId!),
          apiClient.intelligence.getDemand(wilayahId!),
        ]);

        const derived = computeGapConfirmation(
          deriveDemandSupplyGapPct(demand.items),
          pipeline.aggregate.jumlah_investor,
        );
        if (derived !== pipeline.aggregate.gap_confirmation) {
          console.warn("[talis.monitoring.pipeline.gap_mismatch]", {
            wilayahId,
            fixture: pipeline.aggregate.gap_confirmation,
            derived,
          });
        }

        if (!cancelled) setState({ status: "success", data: pipeline, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            data: null,
            error: err instanceof Error ? err.message : "Pipeline gagal dimuat.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [wilayahId]);

  const aggregate = state.data?.aggregate ?? null;
  const items = useMemo(() => state.data?.items ?? [], [state.data?.items]);
  const isEmpty = state.status === "success" && (!aggregate || items.length === 0);
  const distribution = aggregate?.status_distribution_pct as StatusDistributionPct | undefined;
  const lastUpdate = useMemo(() => {
    if (!aggregate) return null;
    return items.reduce(
      (latest, item) => (item.last_update_at > latest ? item.last_update_at : latest),
      aggregate.last_refreshed_at,
    );
  }, [aggregate, items]);

  return (
    <section className="rounded-xl border border-talis-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <SectionInfo
            title="Monitor Pipeline Investasi"
            description="Status dan nilai investasi yang masuk: operasional, izin, dalam proses, dan tertahan."
          />
          {lastUpdate && <DataTimestamp timestamp={lastUpdate} className="mt-1 block" />}
        </div>
        <button
          disabled
          aria-label="Ekspor Pipeline (tersedia di SPRINT-08)"
          className="rounded border border-talis-stone-200 px-3 py-1.5 font-sans text-xs text-talis-stone-400 cursor-not-allowed"
        >
          Ekspor
        </button>
      </div>

      {(state.status === "idle" || state.status === "loading") && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-4">
            <LoadingSkeleton shape="card" className="flex-1" />
            <LoadingSkeleton shape="card" className="flex-1" />
            <LoadingSkeleton shape="card" className="flex-1" />
          </div>
          <div className="flex gap-4">
            <LoadingSkeleton shape="chart" className="w-1/2" height="h-40" />
            <LoadingSkeleton shape="card" className="w-1/2" height="h-40" />
          </div>
          <LoadingSkeleton shape="chart" height="h-24" />
        </div>
      )}

      {state.status === "error" && (
        <ErrorState className="mt-4" title="Gagal memuat pipeline" description={state.error} />
      )}

      {isEmpty && (
        <EmptyState
          className="mt-4"
          title="Tidak ada data pipeline investasi untuk wilayah ini."
          description="Belum ada investasi yang tercatat di adapter monitoring."
        />
      )}

      {state.status === "success" && aggregate && items.length > 0 && distribution && (
        <div className="mt-4 space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <KpiCard label="Total Nilai Pipeline" value={`Rp ${aggregate.total_nilai_rp_juta.toLocaleString("id-ID")} M`} />
            <KpiCard label="Jumlah Investor" value={aggregate.jumlah_investor} unit="investor" />
            <KpiCard label="Sektor Dominan" value={formatSektor(aggregate.sektor_dominan)} size="compact" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PipelineStatusDonut distribution={distribution} total={aggregate.jumlah_investor} />
            <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
                    Analisis Konfirmasi Gap
                  </p>
                  <p className="mt-1 font-sans text-sm font-semibold text-talis-stone-900">
                    Reality check terhadap supply gap Page 3
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold ${GAP_CLASS[aggregate.gap_confirmation]}`}>
                  {aggregate.gap_confirmation.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-4 font-sans text-sm leading-relaxed text-talis-stone-700">
                {aggregate.analisis_text}
              </p>
              {aggregate.hambatan_utama && (
                <p className="mt-3 rounded bg-talis-stone-100 px-3 py-2 font-sans text-xs text-talis-stone-700">
                  Hambatan utama: <span className="font-semibold">{aggregate.hambatan_utama}</span>
                </p>
              )}
            </div>
          </div>

          <PipelineTimeline items={items} />
        </div>
      )}
    </section>
  );
}
