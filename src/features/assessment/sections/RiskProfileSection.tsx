"use client";

import { useCallback, useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { apiClient } from "@/lib/api/apiClient";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui";
import { useAssessmentSectionData } from "../hooks/useAssessmentSectionData";
import { isNotFoundError, errorDescription } from "../lib/assessmentFormat";
import { TALIS_COLORS } from "@/components/charts/chartTheme";
import type { RiskProfileFixture } from "@/lib/api/assessment/assessmentFixtures";

const DIMENSI_LABELS: Record<string, string> = {
  iklim: "Iklim",
  regulasi: "Regulasi",
  infrastruktur: "Infrastruktur",
  sosial: "Sosial",
};

function riskColor(skor: number): string {
  if (skor >= 70) return "text-talis-green-700";
  if (skor >= 50) return "text-talis-earth-700";
  return "text-talis-red-700";
}

function riskBg(skor: number): string {
  if (skor >= 70) return "bg-talis-green-700/5 border-talis-green-700/30";
  if (skor >= 50) return "bg-talis-amber/5 border-talis-amber/40";
  return "bg-talis-red-700/5 border-talis-red-700/30";
}

export function RiskProfileSection() {
  const fetchRiskProfile = useCallback(
    (wilayahId: number): Promise<RiskProfileFixture> =>
      apiClient.assessment.getRiskProfile(wilayahId),
    [],
  );
  const { activeProfile, data, loading, error, retry } = useAssessmentSectionData(fetchRiskProfile);
  const [expandedDimensi, setExpandedDimensi] = useState<Set<string>>(new Set());

  function toggleDimensi(d: string) {
    setExpandedDimensi((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  const radarData = data
    ? Object.entries(data.scores).map(([key, val]) => ({
        dimensi: DIMENSI_LABELS[key] ?? key,
        skor: val,
      }))
    : [];

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="C.3 — Risk Profile"
        description={
          activeProfile
            ? `Profil risiko multi-dimensi untuk ${activeProfile.nama}, ${activeProfile.kabupaten}`
            : undefined
        }
        lastUpdated={data?.last_computed_at}
        tooltip="C.3 mengukur risiko iklim, regulasi, infrastruktur, dan sosial. Skor lebih tinggi = risiko lebih rendah."
        icon={<ShieldAlert aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton shape="chart" height="h-56" />
          <LoadingSkeleton shape="card" />
          <LoadingSkeleton shape="text" count={4} />
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data risk profile belum tersedia"
            description="Fixture assessment tersedia untuk Berastagi, Ciwidey, dan Seminyak."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data ? (
        <div className="space-y-5">
          {/* Radar chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                <PolarGrid stroke={TALIS_COLORS.stone200} />
                <PolarAngleAxis
                  dataKey="dimensi"
                  tick={{ fill: TALIS_COLORS.stone700, fontSize: 12, fontFamily: "sans-serif" }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: TALIS_COLORS.stone700, fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  dataKey="skor"
                  stroke={TALIS_COLORS.green700}
                  fill={TALIS_COLORS.green700}
                  fillOpacity={0.25}
                  dot={{ fill: TALIS_COLORS.green700, r: 3 }}
                />
                <Tooltip
                  formatter={(val: number) => [`${val}`, "Skor"]}
                  contentStyle={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    border: `1px solid ${TALIS_COLORS.stone200}`,
                    borderRadius: 6,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Risiko Dominan */}
          <div className={`rounded-lg border p-4 ${riskBg(data.scores[data.risiko_dominan])}`}>
            <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
              Risiko Dominan
            </p>
            <p className={`font-display text-lg font-semibold ${riskColor(data.scores[data.risiko_dominan])}`}>
              {DIMENSI_LABELS[data.risiko_dominan] ?? data.risiko_dominan}
            </p>
            <p className="font-mono text-2xl font-bold text-talis-stone-900">
              {data.scores[data.risiko_dominan]}
              <span className="font-sans text-sm font-normal text-talis-stone-700"> / 100</span>
            </p>
          </div>

          {/* Detail per dimensi — collapsible */}
          <div className="space-y-2">
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
              Detail Dimensi
            </p>
            {data.detail_per_dimensi.map((detail) => (
              <div
                key={detail.dimensi}
                className="rounded-lg border border-talis-stone-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleDimensi(detail.dimensi)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-talis-stone-50"
                >
                  <span className="font-sans text-sm font-medium text-talis-stone-900">
                    {DIMENSI_LABELS[detail.dimensi] ?? detail.dimensi}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm font-semibold ${riskColor(detail.skor)}`}>
                      {detail.skor}
                    </span>
                    <span className="font-sans text-xs text-talis-stone-700">
                      {expandedDimensi.has(detail.dimensi) ? "▲" : "▼"}
                    </span>
                  </div>
                </button>
                {expandedDimensi.has(detail.dimensi) && (
                  <div className="border-t border-talis-stone-200 px-4 py-3 space-y-2 bg-talis-stone-50">
                    {detail.sub_faktor.map((sf) => (
                      <div key={sf.nama} className="flex gap-3">
                        <span className={`mt-0.5 font-mono text-xs font-semibold min-w-[2rem] text-right ${riskColor(sf.skor)}`}>
                          {sf.skor}
                        </span>
                        <div>
                          <p className="font-sans text-xs font-medium text-talis-stone-900">{sf.nama}</p>
                          <p className="font-sans text-xs text-talis-stone-700">{sf.keterangan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mitigation Plan */}
          <div>
            <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
              Mitigation Plan
            </p>
            <div className="overflow-x-auto rounded-lg border border-talis-stone-200">
              <table className="min-w-full divide-y divide-talis-stone-200">
                <thead>
                  <tr className="bg-talis-stone-50">
                    <th className="px-3 py-2 text-left font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                      Dimensi
                    </th>
                    <th className="px-3 py-2 text-left font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                      Aksi
                    </th>
                    <th className="px-3 py-2 text-left font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                      Timeline
                    </th>
                    <th className="px-3 py-2 text-left font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                      Estimasi Biaya
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-talis-stone-200 bg-white">
                  {data.mitigation_plan.map((row) => (
                    <tr key={row.dimensi} className="hover:bg-talis-stone-50">
                      <td className="px-3 py-2">
                        <span className={`font-sans text-xs font-medium ${riskColor(row.skor_risiko)}`}>
                          {DIMENSI_LABELS[row.dimensi] ?? row.dimensi}
                        </span>
                        <span className={`ml-1 font-mono text-xs ${riskColor(row.skor_risiko)}`}>
                          ({row.skor_risiko})
                        </span>
                      </td>
                      <td className="px-3 py-2 font-sans text-xs text-talis-stone-900">{row.aksi}</td>
                      <td className="px-3 py-2 font-sans text-xs text-talis-stone-700">{row.timeline}</td>
                      <td className="px-3 py-2 font-mono text-xs text-talis-stone-900">{row.cost_estimate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Risk Profile akan muncul setelah active profile tersedia."
        />
      )}
    </div>
  );
}
