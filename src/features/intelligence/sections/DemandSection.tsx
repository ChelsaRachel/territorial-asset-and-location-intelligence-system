"use client";

import { useCallback, useState } from "react";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import type { DemandResponse, DemandItem } from "@/lib/types/intelligence";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui";
import { useIntelligenceSectionData } from "../hooks/useIntelligenceSectionData";
import { isNotFoundError, errorDescription } from "../lib/sectionState";
import { SupplyDemandChart } from "../components/SupplyDemandChart";
import { KOMODITAS_STATUS_COLORS, KOMODITAS_STATUS_LABELS } from "@/components/charts/chartTheme";
import { formatRupiahShort, formatTon } from "@/lib/format";

const SEKTORS = [
  { key: "agro", label: "Agro" },
  { key: "hospitality", label: "Hospitality" },
  { key: "pariwisata", label: "Pariwisata" },
  { key: "properti", label: "Properti" },
] as const;

type SektorKey = (typeof SEKTORS)[number]["key"];

function StatusBadge({ status }: { status: string }) {
  const cls = KOMODITAS_STATUS_COLORS[status] ?? "bg-talis-stone-200 text-talis-stone-700 border-talis-stone-200";
  const label = KOMODITAS_STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function OpportunityCard({ item }: { item: DemandItem }) {
  const gap = item.gap;
  const nilaiPeluang = gap * item.harga_rp_per_unit;
  return (
    <div className="rounded-lg border border-talis-green-700/30 bg-talis-green-700/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 flex-1 font-sans text-sm font-semibold text-talis-stone-900">
          {item.komoditas}
        </p>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-2 font-mono text-xl font-bold text-talis-green-700">
        {formatTon(gap, item.unit)}
      </p>
      <p className="font-sans text-xs text-talis-stone-700">gap permintaan</p>
      <p className="mt-1 font-sans text-xs text-talis-stone-700">
        Nilai peluang:{" "}
        <span className="font-semibold text-talis-stone-900">
          {formatRupiahShort(nilaiPeluang)}/bln
        </span>
      </p>
    </div>
  );
}

function OversupplyWarning({ items }: { items: DemandItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-talis-red-700/30 bg-talis-red-700/5 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-talis-red-700" aria-hidden="true" />
        <p className="font-sans text-sm font-semibold text-talis-red-700">
          Hindari Komoditas Ini
        </p>
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item.komoditas} className="flex items-center justify-between">
            <span className="font-sans text-xs text-talis-stone-900">{item.komoditas}</span>
            <span className="font-mono text-xs text-talis-red-700">
              {Math.abs(item.gap).toLocaleString("id-ID")} {item.unit} kelebihan
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DemandTable({ items }: { items: DemandItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-talis-stone-200">
      <table className="w-full text-left">
        <thead className="bg-talis-stone-50">
          <tr>
            <th className="px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-700">
              Komoditas
            </th>
            <th className="px-3 py-2 text-right font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-700">
              Supply
            </th>
            <th className="px-3 py-2 text-right font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-700">
              Demand
            </th>
            <th className="px-3 py-2 text-right font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-700">
              Gap
            </th>
            <th className="px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-700">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-talis-stone-100">
          {items.map((item) => (
            <tr key={item.komoditas} className="hover:bg-talis-stone-50">
              <td className="px-3 py-2 font-sans text-xs font-medium text-talis-stone-900">
                {item.komoditas}
              </td>
              <td className="px-3 py-2 text-right font-mono text-xs text-talis-stone-700">
                {item.supply_per_bulan.toLocaleString("id-ID")}
              </td>
              <td className="px-3 py-2 text-right font-mono text-xs text-talis-stone-700">
                {item.demand_per_bulan.toLocaleString("id-ID")}
              </td>
              <td
                className={`px-3 py-2 text-right font-mono text-xs font-semibold ${
                  item.gap > 0 ? "text-talis-green-700" : "text-talis-red-700"
                }`}
              >
                {item.gap > 0 ? "+" : ""}
                {item.gap.toLocaleString("id-ID")}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DemandSection() {
  const [aktivSektor, setAktivSektor] = useState<SektorKey>("agro");

  const fetchDemand = useCallback(
    (wilayahId: number): Promise<DemandResponse> =>
      apiClient.intelligence.getDemand(wilayahId, aktivSektor),
    [aktivSektor],
  );

  const { activeProfile, data, loading, error, retry } = useIntelligenceSectionData(fetchDemand);

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="Demand dan Serapan Pasar"
        description={
          activeProfile
            ? `A.6 — Analisis supply-demand dan peluang komoditas ${activeProfile.nama}`
            : undefined
        }
        lastUpdated={data?.last_updated}
        tooltip="A.6 memetakan gap supply-demand per komoditas dan mengidentifikasi peluang tertinggi berdasarkan nilai ekonomis."
        icon={<ShoppingCart aria-hidden="true" className="h-5 w-5" />}
      />

      {/* Sector tabs */}
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {SEKTORS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setAktivSektor(key)}
            className={`shrink-0 rounded-md px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
              aktivSektor === key
                ? "bg-talis-green-700 text-white"
                : "bg-talis-stone-100 text-talis-stone-700 hover:bg-talis-stone-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-4">
            <LoadingSkeleton shape="chart" />
            <LoadingSkeleton shape="card" />
          </div>
        ) : error ? (
          isNotFoundError(error) ? (
            <EmptyState
              title="Data demand belum tersedia"
              description="Fixture SPRINT-04 tersedia untuk Ciwidey, Seminyak, dan Berastagi."
            />
          ) : (
            <ErrorState description={errorDescription(error)} onRetry={retry} />
          )
        ) : data ? (
          data.items.length === 0 ? (
            <EmptyState
              title={`Belum ada data ${aktivSektor} untuk wilayah ini`}
              description="Coba pilih sektor lain atau kunjungi kembali setelah pembaruan data."
            />
          ) : (
            <div className="space-y-5">
              <SupplyDemandChart items={data.items} />

              {data.peluang_top3.length > 0 && (
                <div>
                  <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
                    Peluang Top {data.peluang_top3.length}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {data.peluang_top3.map((item) => (
                      <OpportunityCard key={item.komoditas} item={item} />
                    ))}
                  </div>
                </div>
              )}

              <DemandTable items={data.items} />

              <OversupplyWarning items={data.komoditas_hindari} />

              <div className="flex items-center justify-between rounded-lg border border-talis-stone-200 bg-talis-stone-50 px-4 py-3">
                <p className="font-sans text-xs text-talis-stone-700">Demand Absorption Score</p>
                <p className="font-mono text-xl font-bold text-talis-green-700">
                  {data.demand_absorption_score}
                  <span className="font-sans text-xs font-normal text-talis-stone-700"> / 100</span>
                </p>
              </div>
            </div>
          )
        ) : (
          <EmptyState
            title="Pilih wilayah aktif"
            description="Analisis demand akan muncul setelah active profile tersedia."
          />
        )}
      </div>
    </div>
  );
}
