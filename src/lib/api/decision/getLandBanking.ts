// GET /decision/{id}/land-banking — docs/05_INVESTMENT_DECISION.md §5.1
import { ApiError } from "../common/ApiError";
import { loadFixture } from "@/lib/schema/loader";
import { LandBankingScoreFixtureArraySchema } from "@/lib/schema/decision";
import rawFixture from "@/mocks/decision/land_banking_score.json";

import type { LandBankingKlasifikasi, UrgencyBadge } from "@/lib/types/common";

export interface WilayahLandBankingResult {
  wilayah_id: number;
  land_banking_score: number;
  klasifikasi: LandBankingKlasifikasi;
  breakdown: {
    apresiasi: number;
    pipeline: number;
    cagr: number;
    emerging: number;
  };
  return_estimate: {
    "1yr": { konservatif: number; optimistis: number; asumsi: string };
    "3yr": { konservatif: number; optimistis: number; asumsi: string };
    "5yr": { konservatif: number; optimistis: number; asumsi: string };
  };
  urgency_badge: UrgencyBadge;
  window_keterangan: string;
  last_refreshed_at: string;
}

export async function getLandBanking(
  wilayahId: number
): Promise<WilayahLandBankingResult> {
  const validated = loadFixture(rawFixture, LandBankingScoreFixtureArraySchema);
  const row = validated.find((r) => r.wilayah_id === wilayahId);
  if (!row) {
    throw new ApiError(
      "NOT_FOUND",
      `GET /decision/${wilayahId}/land-banking`,
      `Land banking score not found for wilayah_id ${wilayahId}`
    );
  }
  return {
    wilayah_id: row.wilayah_id,
    land_banking_score: row.land_banking_score,
    klasifikasi: row.klasifikasi,
    breakdown: {
      apresiasi: row.breakdown.apresiasi.score,
      pipeline: row.breakdown.pipeline.score,
      cagr: row.breakdown.cagr.score,
      emerging: row.breakdown.emerging.score,
    },
    return_estimate: row.return_estimate,
    urgency_badge: row.urgency_badge,
    window_keterangan: row.window_keterangan,
    last_refreshed_at: row.last_refreshed_at,
  };
}
