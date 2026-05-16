import {
  getSectorScore,
  SECTOR_LABEL,
  type CriteriaCandidate,
  type DiscoverySector,
} from "./filterCriteria";
import { calculateMatchingScore, roundMatchingScore } from "./matchingScore";
import type { SearchResult } from "@/lib/types/wilayah";

export type OpportunityPreference = "land_banking" | "growth" | "risk_averse" | "cashflow";

export interface OpportunityIntent {
  sektorTarget: DiscoverySector;
  budgetMaxPerM2?: number;
  preferensi?: OpportunityPreference;
}

export function rankOpportunityResults(
  candidates: CriteriaCandidate[],
  intent: OpportunityIntent,
  limit = 10
): SearchResult[] {
  return candidates
    .filter(({ score }) => {
      if (intent.budgetMaxPerM2 === undefined) return true;
      return score.median_land_price <= intent.budgetMaxPerM2;
    })
    .map((candidate) => {
      const sectorScore = getOpportunitySectorScore(candidate, intent.sektorTarget);
      return {
        ...candidate,
        sectorScore,
        matching: calculateMatchingScore({
          sectorSuitability: sectorScore,
          marketAccess: candidate.score.market_access,
          growthProjection: candidate.score.growth_projection,
        }),
      };
    })
    .sort((a, b) => {
      return (
        b.matching - a.matching ||
        b.score.growth_projection - a.score.growth_projection ||
        a.score.median_land_price - b.score.median_land_price ||
        a.wilayah.nama.localeCompare(b.wilayah.nama, "id")
      );
    })
    .slice(0, limit)
    .map(({ wilayah, score, sample, sectorScore, matching }) => ({
      wilayah_id: wilayah.wilayah_id,
      nama: wilayah.nama,
      kabupaten: wilayah.kabupaten,
      provinsi: wilayah.provinsi,
      lat: wilayah.lat,
      lng: wilayah.lng,
      profil_kode: sample?.profil_kode,
      skor_potensi: score.location_score,
      matching_score: roundMatchingScore(matching),
      median_land_price: score.median_land_price,
      appreciation_rate: score.appreciation_rate,
      sector_signal: SECTOR_LABEL[intent.sektorTarget],
      sector_signal_score: sectorScore,
      last_refreshed_at: score.last_refreshed_at,
      highlight_reason: buildOpportunityReason(
        intent.sektorTarget,
        intent.preferensi,
        sectorScore,
        score.market_access,
        score.growth_projection,
        score.appreciation_rate
      ),
    }));
}

function getOpportunitySectorScore(
  candidate: CriteriaCandidate,
  sector: DiscoverySector
): number {
  if (sector === "hospitality" && candidate.sample?.profil_kode === "AGRO_HOSP") {
    return Math.max(
      candidate.score.land_suitability_hosp,
      candidate.score.land_suitability_agro
    );
  }

  return getSectorScore(candidate.score, sector);
}

function buildOpportunityReason(
  sector: DiscoverySector,
  preference: OpportunityPreference | undefined,
  sectorScore: number,
  marketAccess: number,
  growthProjection: number,
  appreciationRate: number
): string {
  const sectorLabel = SECTOR_LABEL[sector];
  const preferenceCopy =
    preference === "land_banking"
      ? "window land banking"
      : preference === "risk_averse"
        ? "profil risiko terkendali"
        : preference === "cashflow"
          ? "potensi cashflow"
          : "lintasan growth";

  return `${sectorLabel} ${sectorScore}, akses pasar ${marketAccess}, growth projection ${growthProjection}; cocok untuk ${preferenceCopy} dengan apresiasi ${appreciationRate}%.`;
}
