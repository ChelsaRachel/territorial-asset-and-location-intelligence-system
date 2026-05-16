import { getSectorScore, type DiscoverySector } from "./filterCriteria";
import type { WilayahScoreAggregate } from "@/lib/types/wilayah";

export interface MatchingScoreInput {
  sectorSuitability: number;
  marketAccess: number;
  growthProjection: number;
}

export function calculateMatchingScore(input: MatchingScoreInput): number {
  return input.sectorSuitability * 0.5 + input.marketAccess * 0.3 + input.growthProjection * 0.2;
}

export function calculateSectorMatchingScore(
  score: WilayahScoreAggregate,
  sector: DiscoverySector
): number {
  return calculateMatchingScore({
    sectorSuitability: getSectorScore(score, sector),
    marketAccess: score.market_access,
    growthProjection: score.growth_projection,
  });
}

export function roundMatchingScore(value: number): number {
  return Math.round(value * 10) / 10;
}
