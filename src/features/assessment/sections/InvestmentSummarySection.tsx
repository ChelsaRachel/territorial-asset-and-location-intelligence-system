"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState, ScoreBadge } from "@/components/ui";
import { useAssessmentSectionData } from "../hooks/useAssessmentSectionData";
import {
  isNotFoundError,
  errorDescription,
  readinessKlasiLabel,
  readinessKlasiColorClasses,
  sektorSiapStatusLabel,
  sektorSiapStatusColorClasses,
  verdictStatusColorClasses,
} from "../lib/assessmentFormat";
import type { InvestmentSummaryResponse } from "@/lib/api/assessment/getInvestmentSummary";

const SEKTOR_ORDER = ["agribisnis", "hospitality", "pariwisata", "properti"] as const;
const SEKTOR_LABELS: Record<string, string> = {
  agribisnis: "Agribisnis",
  hospitality: "Hospitality",
  pariwisata: "Pariwisata",
  properti: "Properti",
};

const VERDICT_LABELS: Record<string, string> = {
  LAYAK: "LAYAK",
  LAYAK_BERSYARAT: "LAYAK BERSYARAT",
  TIDAK_LAYAK: "TIDAK LAYAK",
};

const RECOMMENDATION_STATUS_LABELS: Record<string, string> = {
  rekomendasi_jelas: "Rekomendasi Jelas",
  rekomendasi_dengan_syarat: "Dengan Syarat",
  perlu_kajian_lanjut: "Perlu Kajian Lanjut",
};

export function InvestmentSummarySection() {
  const fetchSummary = useCallback(
    (wilayahId: number): Promise<InvestmentSummaryResponse> =>
      apiClient.assessment.getInvestmentSummary(wilayahId),
    [],
  );
  const { activeProfile, data, loading, error, retry } = useAssessmentSectionData(fetchSummary);

  const { readiness, peruntukan, ranking } = data ?? {};
  const utamaRek = peruntukan?.rekomendasi.find((r) => r.is_utama);
  const altRek = peruntukan?.rekomendasi.filter((r) => !r.is_utama) ?? [];

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="Investment Summary"
        description={
          activeProfile
            ? `B.4 Readiness · B.1 Ranking · B.6 Rekomendasi — ${activeProfile.nama}, ${activeProfile.kabupaten}`
            : undefined
        }
        lastUpdated={readiness?.last_refreshed_at}
        tooltip="Investment Summary menggabungkan B.4 Readiness Score, B.1 Ranking Regional, dan B.6 Rekomendasi Peruntukan menjadi satu verdict akhir."
        icon={<Award aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton shape="card" height="h-20" />
          <LoadingSkeleton shape="text" count={4} />
          <LoadingSkeleton shape="card" />
          <LoadingSkeleton shape="card" height="h-24" />
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data investment summary belum tersedia"
            description="Fixture assessment tersedia untuk Berastagi, Ciwidey, dan Seminyak."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : readiness && peruntukan ? (
        <div className="space-y-5">
          {/* B.4 Readiness Score */}
          <div className="flex items-center gap-5 rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
            <div className="flex-1">
              <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
                Investment Readiness Score
              </p>
              <p className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 font-sans text-xs font-semibold ${readinessKlasiColorClasses(readiness.klasifikasi)}`}>
                {readinessKlasiLabel(readiness.klasifikasi)}
              </p>
            </div>
            <ScoreBadge value={readiness.investment_readiness_score} size="lg" />
          </div>

          {/* Sektor siap pills */}
          <div>
            <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
              Kesiapan per Sektor
            </p>
            <div className="flex flex-wrap gap-2">
              {SEKTOR_ORDER.map((sektor) => {
                const detail = readiness.sektor_siap[sektor];
                return (
                  <div key={sektor} className="flex flex-col items-start gap-1">
                    <span className="font-sans text-xs text-talis-stone-700">
                      {SEKTOR_LABELS[sektor]}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-sans text-xs font-semibold ${sektorSiapStatusColorClasses(detail.status)}`}
                    >
                      {sektorSiapStatusLabel(detail.status)}
                    </span>
                    {detail.syarat_belum.length > 0 && (
                      <p className="max-w-[160px] font-sans text-[10px] text-talis-stone-700 leading-tight">
                        {detail.syarat_belum[0]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* B.1 Ranking Regional */}
          {ranking && (
            <div>
              <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                Ranking Regional — {SEKTOR_LABELS["agribisnis"]}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-3 text-center">
                  <p className="font-sans text-xs text-talis-stone-700">
                    {ranking.ranking_provinsi.region_name}
                  </p>
                  <p className="font-mono text-2xl font-bold text-talis-stone-900">
                    #{ranking.ranking_provinsi.rank}
                  </p>
                  <p className="font-sans text-xs text-talis-stone-700">
                    dari {ranking.ranking_provinsi.of} wilayah
                  </p>
                </div>
                <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-3 text-center">
                  <p className="font-sans text-xs text-talis-stone-700">Nasional</p>
                  <p className="font-mono text-2xl font-bold text-talis-stone-900">
                    #{ranking.ranking_nasional.rank}
                  </p>
                  <p className="font-sans text-xs text-talis-stone-700">
                    dari {ranking.ranking_nasional.of} wilayah
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* B.6 Rekomendasi */}
          {peruntukan && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                  Rekomendasi Peruntukan
                </p>
                <span className="font-sans text-xs text-talis-stone-700">
                  {RECOMMENDATION_STATUS_LABELS[peruntukan.status] ?? peruntukan.status}
                </span>
              </div>

              {/* perlu_kajian_lanjut edge case */}
              {peruntukan.status === "perlu_kajian_lanjut" && peruntukan.syarat_belum_terpenuhi && (
                <div className="mb-3 rounded-lg border border-talis-amber/40 bg-talis-amber/5 p-3">
                  <p className="font-sans text-xs font-semibold text-talis-earth-700">
                    Syarat Belum Terpenuhi
                  </p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {peruntukan.syarat_belum_terpenuhi.map((s) => (
                      <li key={s} className="font-sans text-xs text-talis-stone-700">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rekomendasi Utama */}
              {utamaRek && (
                <div className="mb-3 rounded-lg border border-talis-green-700/30 bg-talis-green-700/5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="inline-block rounded bg-talis-green-700/10 px-2 py-0.5 font-sans text-xs font-semibold uppercase text-talis-green-700">
                        Utama — {SEKTOR_LABELS[utamaRek.sektor] ?? utamaRek.sektor}
                      </span>
                      <p className="mt-1 font-display text-sm font-semibold text-talis-stone-900">
                        {utamaRek.label}
                      </p>
                      <p className="mt-1 font-sans text-xs text-talis-stone-700">
                        {utamaRek.rekomendasi_teks}
                      </p>
                      {utamaRek.alasan && (
                        <p className="mt-1 font-sans text-xs italic text-talis-stone-700">
                          {utamaRek.alasan}
                        </p>
                      )}
                    </div>
                    {utamaRek.score != null && (
                      <span className="font-mono text-lg font-bold text-talis-green-700">
                        {utamaRek.score}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Alternatif */}
              {altRek.length > 0 && (
                <div className="space-y-2">
                  {altRek.slice(0, 3).map((rek) => (
                    <div
                      key={`${rek.sektor}-${rek.label}`}
                      className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="font-sans text-xs font-medium text-talis-stone-700">
                            {SEKTOR_LABELS[rek.sektor] ?? rek.sektor} —
                          </span>{" "}
                          <span className="font-sans text-xs font-semibold text-talis-stone-900">
                            {rek.label}
                          </span>
                          <p className="mt-0.5 font-sans text-xs text-talis-stone-700">
                            {rek.rekomendasi_teks}
                          </p>
                        </div>
                        {rek.score != null && (
                          <span className="font-mono text-sm font-semibold text-talis-stone-700">
                            {rek.score}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verdict Final */}
          <div className={`rounded-lg border p-5 ${verdictStatusColorClasses(readiness.verdict_status)}`}>
            <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700 mb-2">
              Verdict Final
            </p>
            <p className="font-mono text-2xl font-bold text-talis-stone-900">
              {VERDICT_LABELS[readiness.verdict_status] ?? readiness.verdict_status}
            </p>
            <p className="mt-1 font-mono text-sm text-talis-stone-700">
              {readiness.investment_readiness_score.toFixed(2)} / 100
            </p>
            {readiness.verdict_kondisi.length > 0 && (
              <div className="mt-3">
                <p className="font-sans text-xs font-medium text-talis-stone-700 mb-1">Kondisi:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  {readiness.verdict_kondisi.map((k) => (
                    <li key={k} className="font-sans text-xs text-talis-stone-900">{k}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* CTA to /decision */}
          <div className="flex justify-end">
            <Link
              href="/decision"
              className="inline-flex items-center gap-2 rounded-lg bg-talis-green-700 px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm hover:bg-talis-green-700/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700 transition-colors"
            >
              Lanjut ke Page 5 Komparasi →
            </Link>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Investment Summary akan muncul setelah active profile tersedia."
        />
      )}
    </div>
  );
}
