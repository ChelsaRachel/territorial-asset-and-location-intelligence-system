// GET /assessment/{id}/investment-summary — docs/04_OPPORTUNITY_RISK.md §5.1
// Combines B.4 readiness, B.6 peruntukan, and B.1 ranking (agribisnis default)
import { delay } from "../common/delay";
import {
  loadInvestmentReadiness,
  loadPeruntukan,
  loadRankingEntry,
  type InvestmentReadinessFixture,
  type PeruntukanRekomendasiFixture,
  type RankingRegionEntry,
} from "./assessmentFixtures";

export interface InvestmentSummaryResponse {
  readiness: InvestmentReadinessFixture;
  peruntukan: PeruntukanRekomendasiFixture;
  ranking: RankingRegionEntry | null;
}

export async function getInvestmentSummary(wilayahId: number): Promise<InvestmentSummaryResponse> {
  await delay(140);
  const readiness = loadInvestmentReadiness(wilayahId);
  const peruntukan = loadPeruntukan(wilayahId);
  // Default ranking to agribisnis — the primary investment readiness sektor
  const ranking = loadRankingEntry(wilayahId, "agribisnis");
  return { readiness, peruntukan, ranking };
}
