// GET /decision/{id}/business-recommender — docs/05_INVESTMENT_DECISION.md §5.1
import { ApiError } from "../common/ApiError";
import { loadFixture } from "@/lib/schema/loader";
import { BusinessRecommenderFixtureArraySchema } from "@/lib/schema/decision";
import rawFixture from "@/mocks/decision/business_recommender.json";

import type { UrgencyBadge, Sektor } from "@/lib/types/common";

export interface BusinessRecommendation {
  sektor: string;
  suitability_score: number;
  urgency_score: number;
  urgensi: UrgencyBadge;
  alasan_timing: string;
  cost_of_delay_rp_bulan_ha: number | null;
  aksi: string | null;
}

export interface WilayahBusinessRecommenderResult {
  wilayah_id: number;
  sektor_aktif: Sektor;
  recommendations: BusinessRecommendation[];
  last_refreshed_at: string;
}

export async function getBusinessRecommender(
  wilayahId: number
): Promise<WilayahBusinessRecommenderResult> {
  const validated = loadFixture(
    rawFixture,
    BusinessRecommenderFixtureArraySchema
  );
  const row = validated.find((r) => r.wilayah_id === wilayahId);
  if (!row) {
    throw new ApiError(
      "NOT_FOUND",
      `GET /decision/${wilayahId}/business-recommender`,
      `Business recommender not found for wilayah_id ${wilayahId}`
    );
  }
  return {
    wilayah_id: row.wilayah_id,
    sektor_aktif: row.sektor_aktif,
    recommendations: row.recommendations.map((r) => ({
      sektor: r.sektor,
      suitability_score: r.suitability_score,
      urgency_score: r.urgency_score,
      urgensi: r.urgensi,
      alasan_timing: r.alasan_timing,
      cost_of_delay_rp_bulan_ha: r.cost_of_delay_rp_bulan_ha,
      aksi: r.aksi ?? null,
    })),
    last_refreshed_at: row.last_refreshed_at,
  };
}
