"use client";
// SPRINT-06 §3.2 — Business Recommender section (TASK-007 enhanced)
// Rank badges with colors, side-by-side horizontal bars, No active profile state.

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useComparisonStore } from "@/lib/store/comparison";
import { useActiveProfile } from "@/lib/store/useActiveProfile";
import type { BusinessRecommendation } from "@/lib/api/decision/getBusinessRecommender";

// ─── Urgency Badge ─────────────────────────────────────────────────────────────

function UrgencyBadge({ badge }: { badge: string }) {
  const styles: Record<string, string> = {
    SEGERA: "bg-talis-amber/10 text-talis-earth-700 border-talis-amber/40",
    TERBUKA: "bg-talis-green-700/10 text-talis-green-700 border-talis-green-700/30",
    JANGKA_PANJANG: "bg-talis-stone-100 text-talis-stone-600 border-talis-stone-200",
  };
  const labels: Record<string, string> = {
    SEGERA: "SEGERA",
    TERBUKA: "TERBUKA",
    JANGKA_PANJANG: "JANGKA PANJANG",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold ${styles[badge] ?? styles["TERBUKA"]}`}
    >
      {labels[badge] ?? badge}
    </span>
  );
}

// ─── Metric chips ──────────────────────────────────────────────────────────────

function MetricChips({
  suitabilityScore,
  urgencyScore,
}: {
  suitabilityScore: number;
  urgencyScore: number;
}) {
  function chipColor(score: number): string {
    if (score >= 75) return "bg-talis-green-700/10 text-talis-green-700 border-talis-green-700/30";
    if (score >= 50) return "bg-talis-amber/10 text-talis-earth-700 border-talis-amber/40";
    return "bg-talis-stone-100 text-talis-stone-600 border-talis-stone-200";
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${chipColor(suitabilityScore)}`}
      >
        <span className="font-sans text-xs font-medium">Kesesuaian</span>
        <span className="font-mono text-xs font-bold">{suitabilityScore}</span>
      </div>
      <div
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${chipColor(urgencyScore)}`}
      >
        <span className="font-sans text-xs font-medium">Urgensi</span>
        <span className="font-mono text-xs font-bold">{urgencyScore}</span>
      </div>
    </div>
  );
}

// ─── CoD Formatter ────────────────────────────────────────────────────────────

function formatCod(cod: number | null): string {
  if (cod === null) return "—";
  if (cod >= 1_000_000) return `Rp ${(cod / 1_000_000).toFixed(0)} jt/bln/ha`;
  return `Rp ${cod.toLocaleString("id-ID")}/bln/ha`;
}

// ─── Recommendation Card ───────────────────────────────────────────────────────

function RecommendationCard({ rec }: { rec: BusinessRecommendation }) {
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header row: title + status pill */}
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
        <h3 className="min-w-0 max-w-full truncate font-sans text-base font-semibold capitalize text-talis-stone-900">
          {rec.sektor.replace(/_/g, " ")}
        </h3>
        <UrgencyBadge badge={rec.urgensi} />
      </div>

      {/* Metric chips */}
      <div className="mt-3">
        <MetricChips
          suitabilityScore={rec.suitability_score}
          urgencyScore={rec.urgency_score}
        />
      </div>

      {/* Description */}
      <p className="mt-3 font-sans text-sm leading-relaxed text-talis-stone-700">
        {rec.alasan_timing}
      </p>

      {/* CoD — amber style (opportunity cost, not a loss) */}
      {rec.cost_of_delay_rp_bulan_ha !== null && (
        <div className="mt-3 flex items-center gap-2">
          <span className="shrink-0 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">
            CoD
          </span>
          <span className="rounded-md bg-talis-amber/10 px-2.5 py-1 font-mono text-sm font-bold text-talis-earth-700">
            {formatCod(rec.cost_of_delay_rp_bulan_ha)}
          </span>
        </div>
      )}

      {/* Aksi */}
      {rec.aksi && (
        <div className="mt-3 rounded-md border border-talis-green-700/20 bg-talis-green-700/5 p-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-green-700">
            Aksi
          </p>
          <p className="mt-1 font-sans text-sm leading-relaxed text-talis-stone-800">
            {rec.aksi}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── BusinessRecommenderSection ────────────────────────────────────────────────

export function BusinessRecommenderSection() {
  const activeProfile = useActiveProfile();
  const { businessRecommender, fetchBusinessRecommender } = useComparisonStore(
    useShallow((s) => ({
      businessRecommender: s.businessRecommender,
      fetchBusinessRecommender: s.fetchBusinessRecommender,
    })),
  );

  useEffect(() => {
    if (activeProfile && businessRecommender.status === "idle") {
      void fetchBusinessRecommender(activeProfile.wilayah_id);
    }
  }, [activeProfile, businessRecommender.status, fetchBusinessRecommender]);

  return (
    <section className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-500">
          Business Intelligence
        </p>
        <h2 className="mt-0.5 font-display text-lg text-talis-stone-900">
          Rekomendasi Bisnis
        </h2>
        {businessRecommender.data && (
          <p className="mt-0.5 font-sans text-xs text-talis-stone-600">
            Sektor aktif:{" "}
            <span className="font-semibold capitalize">
              {businessRecommender.data.sektor_aktif}
            </span>
          </p>
        )}
      </div>

      {/* No active profile */}
      {!activeProfile && businessRecommender.status === "idle" && (
        <div className="rounded-md bg-talis-stone-50 p-6 text-center">
          <p className="font-sans text-sm font-medium text-talis-stone-700">
            Belum ada profil aktif
          </p>
          <p className="mt-1 font-sans text-xs text-talis-stone-500">
            Aktifkan profil investasi untuk melihat rekomendasi bisnis yang dipersonalisasi.
          </p>
        </div>
      )}

      {businessRecommender.status === "loading" && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-md bg-talis-stone-100"
            />
          ))}
        </div>
      )}

      {businessRecommender.status === "error" && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {businessRecommender.error}
        </div>
      )}

      {businessRecommender.status === "success" && businessRecommender.data && (
        <div className="space-y-3">
          {businessRecommender.data.recommendations.map((rec, i) => (
            <RecommendationCard key={`${rec.sektor}-${i}`} rec={rec} />
          ))}
        </div>
      )}
    </section>
  );
}