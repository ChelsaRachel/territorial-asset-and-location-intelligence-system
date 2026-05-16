// GET /territory/{id}/zoning — docs/02_TERRITORY_PROFILE.md §5.1
import type { TerritoryZoning } from "@/lib/types/territory";
import { delay } from "../common/delay";
import {
  findTerritoryRecord,
  loadTerritoryZoning,
  TERRITORY_ENDPOINTS,
} from "./territoryFixtures";

export async function getZoning(wilayahId: number): Promise<TerritoryZoning> {
  await delay(180);
  const records = loadTerritoryZoning(TERRITORY_ENDPOINTS.zoning);
  return findTerritoryRecord(records, wilayahId, TERRITORY_ENDPOINTS.zoning);
}
