"use client";
// SPRINT-06 §3.1 — Land Banking Score section (TASK-008 enhanced)
// Stacked horizontal bar chart (Recharts, SSR-safe), Risiko Likuiditas card.

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { useComparisonStore } from "@/lib/store/comparison";
import { useActiveProfile } from "@/lib/store/useActiveProfile";

// ─── Recharts import — SSR-safe via next/dynamic ──────────────────────────────

const LandBankingChart = dynamic(
  () => import("./LandBankingChart").then((m) => m.LandBankingChart),
  { ssr: false, loading: () => <div className="h-20 animate-pulse rounded bg-talis-stone-100" /> }
);

// ─── Urgency chip ──────────────────────────────────────────────────────────────

function UrgencyChip({ badge }: { badge: string }) {
  const colourMap: Record<string, string> = {
    SEGERA: "bg-red-100 text-red-800 border-red-200",
    TERBUKA: "bg-amber-100 text-amber-800 border-amber-200",
    JANGKA_PANJANG: "bg-talis-stone-100 text-talis-stone-700 border-talis-stone-200",
  };
  const label: Record<string, string> = {
    SEGERA: "SEGERA",
    TERBUKA: "TERBUKA",
    JANGKA_PANJANG: "JANGKA PANJANG",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${colourMap[badge] ?? colourMap["TERBUKA"]}`}
    >
      {label[badge] ?? badge}
    </span>
  );
}

// ─── Return estimate formatter ────────────────────────────────────────────────

function formatRp(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)} miliar/ha`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(0)} juta/ha`;
  }
  return `Rp ${value.toLocaleString("id-ID")}/ha`;
}

// ─── LandBankingSection ────────────────────────────────────────────────────────

export function LandBankingSection() {
  const activeProfile = useActiveProfile();
  const { landBanking, fetchLandBanking } = useComparisonStore(
    useShallow((s) => ({
      landBanking: s.landBanking,
      fetchLandBanking: s.fetchLandBanking,
    })),
  );

  useEffect(() => {
    if (activeProfile && landBanking.status === "idle") {
      void fetchLandBanking(activeProfile.wilayah_id);
    }
  }, [activeProfile, landBanking.status, fetchLandBanking]);

  return (
    <section className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-500">
            C.7 — Land Banking Intelligence
          </p>
          <h2 className="mt-0.5 font-display text-lg text-talis-stone-900">
            Analisis Land Banking
          </h2>
        </div>
        {landBanking.data && (
          <UrgencyChip badge={landBanking.data.urgency_badge} />
        )}
      </div>

      {landBanking.status === "loading" && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-talis-stone-100" />
          ))}
        </div>
      )}

      {landBanking.status === "error" && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {landBanking.error}
        </div>
      )}

      {landBanking.status === "success" && landBanking.data && (
        <div className="space-y-5">
          {/* LB Score ring */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-talis-green-500 bg-talis-green-50">
              <span className="font-display text-2xl font-bold text-talis-green-700">
                {landBanking.data.land_banking_score}
              </span>
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-talis-stone-900">
                {landBanking.data.klasifikasi.replace("_", " ")}
              </p>
              <p className="mt-0.5 font-sans text-xs leading-relaxed text-talis-stone-600">
                {landBanking.data.window_keterangan}
              </p>
            </div>
          </div>

          {/* Stacked horizontal bar chart (SSR-safe) */}
          <div>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-500">
              Breakdown Komponen
            </p>
            <LandBankingChart breakdown={landBanking.data.breakdown} />
          </div>

          {/* Return Estimate */}
          <div>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-500">
              Estimasi Return per Ha
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-talis-stone-200">
                  <th className="py-1.5 text-left font-sans font-medium text-talis-stone-600">
                    Horizon
                  </th>
                  <th className="py-1.5 text-right font-sans font-medium text-talis-stone-600">
                    Konservatif
                  </th>
                  <th className="py-1.5 text-right font-sans font-medium text-talis-stone-600">
                    Optimistis
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-talis-stone-100">
                {(["1yr", "3yr", "5yr"] as const).map((horizon) => (
                  <tr key={horizon}>
                    <td className="py-1.5 font-mono text-talis-stone-700">
                      {horizon === "1yr" ? "1 Tahun" : horizon === "3yr" ? "3 Tahun" : "5 Tahun"}
                    </td>
                    <td className="py-1.5 text-right font-mono text-talis-stone-900">
                      {formatRp(landBanking.data!.return_estimate[horizon].konservatif)}
                    </td>
                    <td className="py-1.5 text-right font-mono text-talis-green-700">
                      {formatRp(landBanking.data!.return_estimate[horizon].optimistis)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Risiko Likuiditas card (static) */}
          <div className="rounded-md border border-talis-stone-200 bg-talis-stone-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-800">
                Risiko Likuiditas: SEDANG
              </span>
            </div>
            <p className="mt-2 font-sans text-xs leading-relaxed text-talis-stone-600">
              Pasar lahan highland resort masih berkembang; likuiditas terbatas jika exit &lt; 2 tahun.
              Rekomendasi holding period minimal 3 tahun untuk memaksimalkan apresiasi dan likuiditas exit.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
