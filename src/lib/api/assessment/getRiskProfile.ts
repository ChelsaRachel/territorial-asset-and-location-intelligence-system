// GET /assessment/{id}/risk-profile — docs/04_OPPORTUNITY_RISK.md §5.1
import { delay } from "../common/delay";
import { loadRiskProfile, type RiskProfileFixture } from "./assessmentFixtures";

export type { RiskProfileFixture };

export async function getRiskProfile(wilayahId: number): Promise<RiskProfileFixture> {
  await delay(120);
  return loadRiskProfile(wilayahId);
}
