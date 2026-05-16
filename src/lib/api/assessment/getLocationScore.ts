// GET /assessment/{id}/location-score — docs/04_OPPORTUNITY_RISK.md §5.1
import { delay } from "../common/delay";
import type { Sektor } from "@/lib/types/common";
import type { Weights, DimensionKey, ScoreDimensions } from "@/lib/types/assessment";
import { DIMENSION_KEYS, DIMENSION_LABELS } from "@/lib/scoring/weights";
import { computeLocationScore, effortVsImpact } from "@/lib/scoring";
import { loadLocationScore, type LocationScoreFixture } from "./assessmentFixtures";

export type { LocationScoreFixture };

export async function getLocationScore(
  wilayahId: number,
  sektor: Sektor,
  customWeights?: Weights,
): Promise<LocationScoreFixture> {
  await delay(100);

  const fixture = loadLocationScore(wilayahId, sektor);

  if (!customWeights) {
    return fixture;
  }

  // Recompute with custom weights using scoring engine
  const rawScores = Object.fromEntries(
    DIMENSION_KEYS.map((k) => [k, fixture.score_breakdown[k].raw_score]),
  ) as ScoreDimensions;

  const regulatoryFlag = fixture.is_capped ? ("KAWASAN_LINDUNG" as const) : undefined;
  const result = computeLocationScore(rawScores, customWeights, regulatoryFlag);
  const evItems = effortVsImpact(rawScores, customWeights);

  const score_breakdown = Object.fromEntries(
    DIMENSION_KEYS.map((k: DimensionKey) => [
      k,
      {
        raw_score: rawScores[k],
        weight: customWeights[k],
        contribution: result.contributions[k].contribution,
      },
    ]),
  ) as LocationScoreFixture["score_breakdown"];

  return {
    wilayah_id: fixture.wilayah_id,
    sektor: fixture.sektor,
    location_score: result.total,
    score_breakdown,
    weights_used: customWeights,
    is_capped: result.capped,
    ...(result.cap_reason ? { cap_reason: result.cap_reason } : {}),
    effort_vs_impact: evItems.map((item) => ({
      dimensi: item.key as DimensionKey,
      dimensi_label: DIMENSION_LABELS[item.key],
      aksi: fixture.effort_vs_impact.find((e) => e.dimensi === item.key)?.aksi ??
        `Peningkatan ${DIMENSION_LABELS[item.key]} memberikan dampak terbesar`,
      impact_estimate: fixture.effort_vs_impact.find((e) => e.dimensi === item.key)?.impact_estimate ??
        `+${Math.round(item.weightedImpact)} poin estimasi`,
    })),
    last_computed_at: fixture.last_computed_at,
  };
}
