// GET /assessment/{id}/financial-viability — docs/04_OPPORTUNITY_RISK.md §5.1
import { delay } from "../common/delay";
import type { Sektor } from "@/lib/types/common";
import { loadFinancialViability, type FinancialViabilityFixture } from "./assessmentFixtures";

export type { FinancialViabilityFixture };

export async function getFinancialViability(
  wilayahId: number,
  sektor: Sektor = "agribisnis",
): Promise<FinancialViabilityFixture> {
  await delay(110);
  return loadFinancialViability(wilayahId, sektor);
}
