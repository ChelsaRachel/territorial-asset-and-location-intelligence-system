// GET /assessment/{id}/feasibility — docs/04_OPPORTUNITY_RISK.md §5.1
import { delay } from "../common/delay";
import { loadFeasibility, type FeasibilityFixture } from "./assessmentFixtures";

export type { FeasibilityFixture };

export async function getFeasibility(wilayahId: number): Promise<FeasibilityFixture> {
  await delay(100);
  return loadFeasibility(wilayahId);
}
