// Fixture loaders for SPRINT-05 assessment mocks
// Follows src/lib/api/intelligence/intelligenceFixtures.ts pattern exactly.
import { z } from "zod";
import locationScoreData from "@/mocks/assessment/location_score.json";
import riskProfileData from "@/mocks/assessment/risk_profile.json";
import feasibilityData from "@/mocks/assessment/feasibility.json";
import financialViabilityData from "@/mocks/assessment/financial_viability.json";
import investmentReadinessData from "@/mocks/assessment/investment_readiness.json";
import rankingRegionData from "@/mocks/assessment/ranking_region.json";
import peruntukanData from "@/mocks/assessment/peruntukan_rekomendasi.json";
import gapAnalysisData from "@/mocks/assessment/gap_analysis.json";
import { loadFixture } from "@/lib/schema/loader";
import {
  LocationScoreFixtureSchema,
  RiskProfileFixtureSchema,
  FeasibilityFixtureSchema,
  FinancialViabilityFixtureSchema,
  InvestmentReadinessFixtureSchema,
  RankingRegionFixtureSchema,
  PeruntukanRekomendasiFixtureSchema,
  GapAnalysisFixtureSchema,
} from "@/lib/schema/assessment";
import type { Sektor } from "@/lib/types/common";
import { ApiError } from "../common/ApiError";

export type LocationScoreFixture = z.infer<typeof LocationScoreFixtureSchema>;
export type RiskProfileFixture = z.infer<typeof RiskProfileFixtureSchema>;
export type FeasibilityFixture = z.infer<typeof FeasibilityFixtureSchema>;
export type FinancialViabilityFixture = z.infer<typeof FinancialViabilityFixtureSchema>;
export type InvestmentReadinessFixture = z.infer<typeof InvestmentReadinessFixtureSchema>;
export type RankingRegionEntry = z.infer<typeof RankingRegionFixtureSchema>[number];
export type PeruntukanRekomendasiFixture = z.infer<typeof PeruntukanRekomendasiFixtureSchema>;
export type GapAnalysisRow = z.infer<typeof GapAnalysisFixtureSchema>[number];

const BASE = "GET /assessment/";

function toFixtureInvalid(endpoint: string, err: unknown): ApiError {
  return new ApiError("FIXTURE_INVALID", endpoint, String(err));
}

function loadAll<T>(
  rawData: unknown,
  schema: z.ZodType<T[]>,
  endpoint: string,
): T[] {
  try {
    return loadFixture(rawData, schema);
  } catch (err) {
    throw toFixtureInvalid(endpoint, err);
  }
}

export function loadLocationScore(wilayahId: number, sektor: Sektor): LocationScoreFixture {
  const endpoint = `${BASE}{id}/location-score`;
  const all = loadAll(locationScoreData, z.array(LocationScoreFixtureSchema), endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId && r.sektor === sektor);
  if (!record) {
    throw new ApiError(
      "NOT_FOUND",
      endpoint,
      `No location_score fixture for wilayah_id ${wilayahId} sektor ${sektor}`,
    );
  }
  return record;
}

export function loadRiskProfile(wilayahId: number): RiskProfileFixture {
  const endpoint = `${BASE}{id}/risk-profile`;
  const all = loadAll(riskProfileData, z.array(RiskProfileFixtureSchema), endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId);
  if (!record) {
    throw new ApiError(
      "NOT_FOUND",
      endpoint,
      `No risk_profile fixture for wilayah_id ${wilayahId}`,
    );
  }
  return record;
}

export function loadFeasibility(wilayahId: number): FeasibilityFixture {
  const endpoint = `${BASE}{id}/feasibility`;
  const all = loadAll(feasibilityData, z.array(FeasibilityFixtureSchema), endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId);
  if (!record) {
    throw new ApiError(
      "NOT_FOUND",
      endpoint,
      `No feasibility fixture for wilayah_id ${wilayahId}`,
    );
  }
  return record;
}

export function loadFinancialViability(
  wilayahId: number,
  sektor: Sektor,
): FinancialViabilityFixture {
  const endpoint = `${BASE}{id}/financial-viability`;
  const all = loadAll(financialViabilityData, z.array(FinancialViabilityFixtureSchema), endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId && r.sektor === sektor);
  // Fall back to any entry for the wilayah if sektor-specific not found
  const fallback = all.find((r) => r.wilayah_id === wilayahId) ?? null;
  const chosen = record ?? fallback;
  if (!chosen) {
    throw new ApiError(
      "NOT_FOUND",
      endpoint,
      `No financial_viability fixture for wilayah_id ${wilayahId}`,
    );
  }
  return chosen;
}

export function loadInvestmentReadiness(wilayahId: number): InvestmentReadinessFixture {
  const endpoint = `${BASE}{id}/investment-summary`;
  const all = loadAll(investmentReadinessData, z.array(InvestmentReadinessFixtureSchema), endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId);
  if (!record) {
    throw new ApiError(
      "NOT_FOUND",
      endpoint,
      `No investment_readiness fixture for wilayah_id ${wilayahId}`,
    );
  }
  return record;
}

export function loadRankingEntry(
  wilayahId: number,
  sektor: Sektor,
): RankingRegionEntry | null {
  const endpoint = `${BASE}{id}/regional-ranking`;
  const all = loadAll(rankingRegionData, RankingRegionFixtureSchema, endpoint);
  return all.find((r) => r.wilayah_id === wilayahId && r.sektor === sektor) ?? null;
}

export function loadPeruntukan(wilayahId: number): PeruntukanRekomendasiFixture {
  const endpoint = `${BASE}{id}/peruntukan`;
  const all = loadAll(peruntukanData, z.array(PeruntukanRekomendasiFixtureSchema), endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId);
  if (!record) {
    throw new ApiError(
      "NOT_FOUND",
      endpoint,
      `No peruntukan_rekomendasi fixture for wilayah_id ${wilayahId}`,
    );
  }
  return record;
}

export function loadGapAnalysisRows(): GapAnalysisRow[] {
  const endpoint = `${BASE}gap-analysis`;
  return loadAll(gapAnalysisData, GapAnalysisFixtureSchema, endpoint);
}
