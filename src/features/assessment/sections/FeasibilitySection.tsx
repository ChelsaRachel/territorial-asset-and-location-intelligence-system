"use client";

import { useCallback } from "react";
import { Grid2x2 } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui";
import { useAssessmentSectionData } from "../hooks/useAssessmentSectionData";
import {
  isNotFoundError,
  errorDescription,
  quadrantTierLabel,
  quadrantTierColorClasses,
} from "../lib/assessmentFormat";
import type { FeasibilityFixture } from "@/lib/api/assessment/assessmentFixtures";
import type { QuadrantTier } from "@/lib/types/assessment";

const QUADRANT_LABELS: Record<string, string> = {
  lahan: "Land Suitability",
  pasar: "Market Access",
  infrastruktur: "Infrastructure",
  regulasi: "Zoning & Regulasi",
};

const QUADRANT_ORDER = ["lahan", "pasar", "infrastruktur", "regulasi"] as const;

interface QuadrantCardProps {
  label: string;
  tier: QuadrantTier;
  score: number;
  catatan: string;
}

function QuadrantCard({ label, tier, score, catatan }: QuadrantCardProps) {
  const colors = quadrantTierColorClasses(tier);
  return (
    <div className={`flex flex-col rounded-lg border p-4 ${colors.border} ${colors.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-sm font-medium text-talis-stone-900">{label}</p>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-sans text-xs font-semibold ${colors.badge}`}
        >
          {quadrantTierLabel(tier)}
        </span>
      </div>
      <p className={`mt-1 font-mono text-2xl font-bold ${colors.text}`}>{score}</p>
      <p className="mt-2 border-t border-current/10 pt-2 font-sans text-xs text-talis-stone-700 leading-relaxed">
        {catatan}
      </p>
    </div>
  );
}

export function FeasibilitySection() {
  const fetchFeasibility = useCallback(
    (wilayahId: number): Promise<FeasibilityFixture> =>
      apiClient.assessment.getFeasibility(wilayahId),
    [],
  );
  const { activeProfile, data, loading, error, retry } = useAssessmentSectionData(fetchFeasibility);

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="C.4 — Feasibility Snapshot"
        description={
          activeProfile
            ? `Kelayakan 4 dimensi untuk ${activeProfile.nama}, ${activeProfile.kabupaten}`
            : undefined
        }
        lastUpdated={data?.last_computed_at}
        tooltip="C.4 menilai kelayakan lahan, pasar, infrastruktur, dan regulasi dengan tier Baik / Cukup / Perlu Perhatian."
        icon={<Grid2x2 aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <LoadingSkeleton shape="card" height="h-32" />
          <LoadingSkeleton shape="card" height="h-32" />
          <LoadingSkeleton shape="card" height="h-32" />
          <LoadingSkeleton shape="card" height="h-32" />
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data feasibility belum tersedia"
            description="Fixture assessment tersedia untuk Berastagi, Ciwidey, dan Seminyak."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {QUADRANT_ORDER.map((key) => {
            const q = data.quadrants[key];
            return (
              <QuadrantCard
                key={key}
                label={QUADRANT_LABELS[key] ?? key}
                tier={q.tier}
                score={q.score}
                catatan={q.catatan}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Feasibility Snapshot akan muncul setelah active profile tersedia."
        />
      )}
    </div>
  );
}
