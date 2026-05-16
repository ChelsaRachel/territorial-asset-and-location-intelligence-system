// GET /territory/{id}/land-value — docs/03_TERRITORY_INTELLIGENCE.md §5.1
import { delay } from "../common/delay";
import type { LandValueResponse } from "@/lib/types/intelligence";
import { loadLandValueQuarterly, loadLandValueSummary } from "./intelligenceFixtures";

export async function getLandValue(wilayahId: number): Promise<LandValueResponse> {
  await delay(120);

  const summary = loadLandValueSummary(wilayahId);
  const quarterly_series = loadLandValueQuarterly(wilayahId);

  return {
    wilayah_id: wilayahId,
    current: {
      median_price_rp_per_m2: summary.median_rp_per_m2,
      appreciation_yoy_pct: summary.appreciation_yoy_pct,
      speculation_ratio: summary.speculation_ratio,
      speculation_status: summary.speculation_status,
    },
    quarterly_series,
    harga_vs_njop: summary.harga_vs_njop,
    proyeksi: summary.proyeksi,
    timing_recommendation: summary.timing_recommendation,
    last_updated: summary.last_updated,
  };
}
