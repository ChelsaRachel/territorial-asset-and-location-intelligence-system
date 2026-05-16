"use client";

import { useCallback, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiClient } from "@/lib/api/apiClient";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui";
import { useAssessmentSectionData } from "../hooks/useAssessmentSectionData";
import {
  isNotFoundError,
  errorDescription,
  viabilityZoneLabel,
  viabilityZoneColorClasses,
  formatRupiah,
} from "../lib/assessmentFormat";
import { useCurrentSektor } from "@/lib/store/useAssessment";
import { TALIS_COLORS } from "@/components/charts/chartTheme";
import type { FinancialViabilityFixture } from "@/lib/api/assessment/assessmentFixtures";

const SKENARIO_LABELS: Record<string, string> = {
  harga_turun_10pct: "Harga turun -10%",
  yield_turun_15pct: "Yield turun -15%",
  biaya_input_naik_20pct: "Biaya input naik +20%",
  kombinasi_terburuk: "Kombinasi Terburuk",
};

function zoneRowClass(zone: string): string {
  if (zone === "VIABLE") return "bg-talis-green-700/5";
  if (zone === "BORDERLINE") return "bg-talis-amber/5";
  return "bg-talis-red-700/5";
}

function zoneTextClass(zone: string): string {
  if (zone === "VIABLE") return "text-talis-green-700";
  if (zone === "BORDERLINE") return "text-talis-earth-700";
  return "text-talis-red-700";
}

export function FinancialViabilitySection() {
  const currentSektor = useCurrentSektor();
  const [showAsumsi, setShowAsumsi] = useState(false);

  const fetchFinancialViability = useCallback(
    (wilayahId: number): Promise<FinancialViabilityFixture> =>
      apiClient.assessment.getFinancialViability(wilayahId, currentSektor),
    [currentSektor],
  );

  const { activeProfile, data, loading, error, retry } = useAssessmentSectionData(fetchFinancialViability);

  const barData = data
    ? [
        {
          name: "Revenue vs Cost",
          Revenue: data.revenue_proxy_rp,
          Cost: data.cost_proxy_rp,
        },
      ]
    : [];

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="C.6 — Financial Viability"
        description={
          activeProfile
            ? `Kelayakan finansial untuk ${activeProfile.nama}, ${activeProfile.kabupaten}`
            : undefined
        }
        lastUpdated={data?.last_computed_at}
        tooltip="C.6 menghitung rasio Revenue/Cost dan zona kelayakan finansial (VIABLE ≥1.5x, BORDERLINE 1.2–1.5x, NOT VIABLE <1.2x)."
        icon={<TrendingUp aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton shape="card" height="h-16" />
          <LoadingSkeleton shape="chart" height="h-40" />
          <LoadingSkeleton shape="table-row" count={5} />
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data financial viability belum tersedia"
            description="Fixture assessment tersedia untuk Berastagi (agribisnis, hospitality) dan Ciwidey."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data ? (
        <div className="space-y-5">
          {/* Zone + Ratio hero */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
                Feasibility Zone
              </p>
              <span
                className={`mt-1 inline-flex items-center rounded-full border px-3 py-1 font-sans text-sm font-semibold ${viabilityZoneColorClasses(data.zone)}`}
              >
                {viabilityZoneLabel(data.zone)}
              </span>
            </div>
            <div className="ml-auto text-right">
              <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
                Revenue / Cost Ratio
              </p>
              <p className={`font-mono text-3xl font-bold ${zoneTextClass(data.zone)}`}>
                {data.ratio.toFixed(2)}x
              </p>
            </div>
          </div>

          {/* Revenue vs Cost bar chart */}
          <div>
            <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
              Revenue vs Cost ({data.asumsi.komoditas})
            </p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TALIS_COLORS.stone200} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "sans-serif" }} />
                  <YAxis
                    tickFormatter={(v: number) => formatRupiah(v)}
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    width={72}
                  />
                  <Tooltip
                    formatter={(val: number, name: string) => [formatRupiah(val), name]}
                    contentStyle={{
                      fontSize: 12,
                      fontFamily: "monospace",
                      border: `1px solid ${TALIS_COLORS.stone200}`,
                      borderRadius: 6,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Revenue" fill={TALIS_COLORS.green700} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Cost" fill={TALIS_COLORS.amber} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sensitivity table */}
          <div>
            <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
              Analisis Sensitivitas
            </p>
            <div className="overflow-x-auto rounded-lg border border-talis-stone-200">
              <table className="min-w-full divide-y divide-talis-stone-200">
                <thead>
                  <tr className="bg-talis-stone-50">
                    <th className="px-3 py-2 text-left font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                      Skenario
                    </th>
                    <th className="px-3 py-2 text-right font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                      Rasio
                    </th>
                    <th className="px-3 py-2 text-center font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                      Zone
                    </th>
                    <th className="px-3 py-2 text-right font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                      Delta
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-talis-stone-200 bg-white">
                  {Object.entries(data.sensitivitas).map(([key, scenario]) => (
                    <tr key={key} className={zoneRowClass(scenario.zone)}>
                      <td className="px-3 py-2 font-sans text-xs text-talis-stone-900">
                        {SKENARIO_LABELS[key] ?? key}
                      </td>
                      <td className={`px-3 py-2 text-right font-mono text-xs font-semibold ${zoneTextClass(scenario.zone)}`}>
                        {scenario.ratio.toFixed(2)}x
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-sans text-xs font-semibold ${viabilityZoneColorClasses(scenario.zone)}`}
                        >
                          {viabilityZoneLabel(scenario.zone)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs text-talis-stone-700">
                        {scenario.delta_pct}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asumsi disclosure — collapsible */}
          <div className="rounded-lg border border-talis-stone-200">
            <button
              type="button"
              onClick={() => setShowAsumsi((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-talis-stone-50"
            >
              <span className="font-sans text-xs font-medium text-talis-stone-700">
                Asumsi & Basis Kalkulasi
              </span>
              <span className="font-sans text-xs text-talis-stone-700">
                {showAsumsi ? "▲" : "▼"}
              </span>
            </button>
            {showAsumsi && (
              <div className="border-t border-talis-stone-200 px-4 py-3 bg-talis-stone-50 space-y-1">
                {Object.entries(data.asumsi).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="font-sans text-xs text-talis-stone-700">{k.replace(/_/g, " ")}</span>
                    <span className="font-mono text-xs text-talis-stone-900">
                      {typeof v === "number" ? v.toLocaleString("id-ID") : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Financial Viability akan muncul setelah active profile tersedia."
        />
      )}
    </div>
  );
}
