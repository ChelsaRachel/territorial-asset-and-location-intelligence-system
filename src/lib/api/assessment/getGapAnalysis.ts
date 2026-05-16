// GET /assessment/gap-analysis — docs/04_OPPORTUNITY_RISK.md §5.1
// Returns all gap analysis rows sorted by priority_score descending by default.
import { delay } from "../common/delay";
import { loadGapAnalysisRows, type GapAnalysisRow } from "./assessmentFixtures";

export type { GapAnalysisRow };

export async function getGapAnalysis(_wilayahId: number): Promise<GapAnalysisRow[]> {
  await delay(120);
  // All rows are Karo kecamatan; return sorted by priority_score desc (rank asc)
  const rows = loadGapAnalysisRows();
  return [...rows].sort((a, b) => a.rank_provinsi - b.rank_provinsi);
}
