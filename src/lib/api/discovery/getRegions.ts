// GET /api/v1/discovery/regions — Mode 2 facet options from dim_region fixture
import dimRegionData from "@/mocks/dim_region.json";
import { DimRegionSchema } from "@/lib/schema/dim_region";
import { loadFixture } from "@/lib/schema/loader";
import { ApiError } from "../common/ApiError";
import { delay } from "../common/delay";
import type { DimRegion } from "@/lib/types/wilayah";

export async function getRegions(): Promise<{ regions: DimRegion[] }> {
  await delay(80);
  try {
    const regions = loadFixture(dimRegionData, DimRegionSchema.array());
    return { regions };
  } catch (err) {
    throw new ApiError("FIXTURE_INVALID", "GET /discovery/regions", String(err));
  }
}
