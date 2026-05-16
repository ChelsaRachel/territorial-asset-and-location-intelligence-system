"use client";

import { useCallback, useState } from "react";
import { MapPin } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { SectionInfo, LoadingSkeleton, ErrorState, EmptyState, ScoreBadge, ProgressBar } from "@/components/ui";
import { useAssessmentSectionData } from "../hooks/useAssessmentSectionData";
import { isNotFoundError, errorDescription } from "../lib/assessmentFormat";
import { useAssessment } from "@/lib/store/useAssessment";
import { SEKTOR_LABELS, DIMENSION_DISPLAY } from "../lib/assessmentFormat";
import { CustomWeightsPanel } from "../components/CustomWeightsPanel";
import type { LocationScoreFixture } from "@/lib/api/assessment/assessmentFixtures";
import type { Sektor } from "@/lib/types/common";

const SEKTOR_ORDER: Sektor[] = ["agribisnis", "hospitality", "pariwisata", "properti"];

export function LocationScoringSection() {
  const {
    currentSektor,
    customWeightsEnabled,
    customWeights,
    setCurrentSektor,
    enableCustomWeights,
    disableCustomWeights,
    setCustomWeights,
  } = useAssessment();

  const [showWeights, setShowWeights] = useState(false);

  const fetchLocationScore = useCallback(
    (wilayahId: number): Promise<LocationScoreFixture> =>
      apiClient.assessment.getLocationScore(
        wilayahId,
        currentSektor,
        customWeightsEnabled && customWeights ? customWeights : undefined,
      ),
    [currentSektor, customWeightsEnabled, customWeights],
  );

  const { activeProfile, data, loading, error, retry } = useAssessmentSectionData(fetchLocationScore);

  function handleToggleWeights() {
    if (showWeights) {
      setShowWeights(false);
      disableCustomWeights();
    } else {
      setShowWeights(true);
      if (!customWeightsEnabled) enableCustomWeights();
    }
  }

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="C.1 — Location Scoring Card"
        description={
          activeProfile
            ? `Skor lokasi tertimbang per sektor untuk ${activeProfile.nama}, ${activeProfile.kabupaten}`
            : undefined
        }
        lastUpdated={data?.last_computed_at}
        tooltip="C.1 menggabungkan A.1 Land Suitability, A.2 Infrastructure, A.3 Zoning Compliance, A.4 Market Access, dan A.8 Growth Projection dengan bobot per sektor."
        icon={<MapPin aria-hidden="true" className="h-5 w-5" />}
      />

      {/* Sektor tab row */}
      <div className="mb-4 flex gap-1.5 flex-wrap">
        {SEKTOR_ORDER.map((sektor) => (
          <button
            key={sektor}
            type="button"
            onClick={() => setCurrentSektor(sektor)}
            className={`rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors ${
              currentSektor === sektor
                ? "bg-talis-green-700 text-white"
                : "border border-talis-stone-200 bg-talis-stone-50 text-talis-stone-700 hover:border-talis-green-700/40 hover:bg-talis-green-700/5"
            }`}
          >
            {SEKTOR_LABELS[sektor]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton shape="card" height="h-20" />
          <LoadingSkeleton shape="text" count={5} />
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data lokasi belum tersedia"
            description="Fixture assessment tersedia untuk Berastagi, Ciwidey, dan Seminyak."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data ? (
        <div className="space-y-5">
          {/* Score hero */}
          <div className="flex items-center gap-5 rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
            <div className="flex-1">
              <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
                Location Score — {SEKTOR_LABELS[currentSektor]}
              </p>
              {data.is_capped && (
                <div className="mt-1 rounded border border-talis-amber/40 bg-talis-amber/10 px-2 py-1">
                  <p className="font-sans text-xs font-medium text-talis-earth-700">
                    ⚠ Status regulasi membatasi skor maksimum (cap 40)
                    {data.cap_reason ? ` — ${data.cap_reason}` : ""}
                  </p>
                </div>
              )}
            </div>
            <ScoreBadge value={data.location_score} size="lg" />
          </div>

          {/* Contribution bars */}
          <div className="space-y-3">
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
              Breakdown Dimensi
            </p>
            {Object.entries(data.score_breakdown).map(([key, dim]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans text-sm text-talis-stone-900">
                    {DIMENSION_DISPLAY[key] ?? key}
                  </span>
                  <span className="font-mono text-xs text-talis-stone-700">
                    {dim.raw_score} × {dim.weight}% = {dim.contribution.toFixed(1)}
                  </span>
                </div>
                <ProgressBar value={dim.raw_score} max={100} />
              </div>
            ))}
          </div>

          {/* Custom Weights toggle */}
          <div className="border-t border-talis-stone-200 pt-3">
            <button
              type="button"
              onClick={handleToggleWeights}
              className="font-sans text-xs font-medium text-talis-green-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700"
            >
              {showWeights ? "Sembunyikan Custom Weights" : "Custom Weights"}
            </button>

            {showWeights && customWeights && (
              <CustomWeightsPanel
                weights={customWeights}
                isCapped={data.is_capped}
                onChange={setCustomWeights}
              />
            )}
          </div>

          {/* Effort vs Impact */}
          {data.effort_vs_impact.length > 0 && (
            <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
              <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                Effort vs Impact — Prioritas Peningkatan
              </p>
              <div className="space-y-3">
                {data.effort_vs_impact.map((item) => (
                  <div key={item.dimensi} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 min-w-[2rem] items-center justify-center rounded bg-talis-green-700/10 px-1 font-mono text-xs font-semibold text-talis-green-700">
                      {item.dimensi}
                    </span>
                    <div className="flex-1">
                      <p className="font-sans text-xs font-medium text-talis-stone-900">
                        {item.dimensi_label}
                      </p>
                      <p className="font-sans text-xs text-talis-stone-700">{item.aksi}</p>
                      <p className="mt-0.5 font-mono text-xs font-semibold text-talis-green-700">
                        {item.impact_estimate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Location Scoring Card akan muncul setelah active profile tersedia."
        />
      )}
    </div>
  );
}
