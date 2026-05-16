// GET /territory/{id}/profile — docs/02_TERRITORY_PROFILE.md §5.1
import type { TerritoryProfile } from "@/lib/types/territory";
import { delay } from "../common/delay";
import {
  findTerritoryRecord,
  loadTerritoryProfiles,
  TERRITORY_ENDPOINTS,
} from "./territoryFixtures";

export async function getProfile(wilayahId: number): Promise<TerritoryProfile> {
  await delay(120);
  const records = loadTerritoryProfiles(TERRITORY_ENDPOINTS.profile);
  return findTerritoryRecord(records, wilayahId, TERRITORY_ENDPOINTS.profile);
}
