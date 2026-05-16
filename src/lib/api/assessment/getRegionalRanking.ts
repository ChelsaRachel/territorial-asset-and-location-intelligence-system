// GET /assessment/{id}/regional-ranking — docs/04_OPPORTUNITY_RISK.md §5.1
import { delay } from "../common/delay";
import type { Sektor } from "@/lib/types/common";
import { loadRankingEntry, type RankingRegionEntry } from "./assessmentFixtures";
import { ApiError } from "../common/ApiError";

export type { RankingRegionEntry };

export async function getRegionalRanking(
  wilayahId: number,
  sektor: Sektor = "agribisnis",
): Promise<RankingRegionEntry> {
  await delay(100);
  const entry = loadRankingEntry(wilayahId, sektor);
  if (!entry) {
    throw new ApiError(
      "NOT_FOUND",
      "GET /assessment/{id}/regional-ranking",
      `No ranking fixture for wilayah_id ${wilayahId} sektor ${sektor}`,
    );
  }
  return entry;
}
