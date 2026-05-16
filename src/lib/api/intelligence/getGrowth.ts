// GET /territory/{id}/growth — docs/03_TERRITORY_INTELLIGENCE.md §5.1
import { delay } from "../common/delay";
import type { GrowthResponse } from "@/lib/types/intelligence";
import { loadGrowthProjection } from "./intelligenceFixtures";

export async function getGrowth(wilayahId: number): Promise<GrowthResponse> {
  await delay(100);

  const record = loadGrowthProjection(wilayahId);

  return {
    wilayah_id: wilayahId,
    growth_projection_score: record.growth_projection_score,
    breakdown: record.breakdown,
    pipeline_infra_detail: record.pipeline_infra_detail,
    emerging_signal_detail: record.emerging_signal_detail,
    cagr_penduduk_pct: record.cagr_penduduk_pct,
    sinyal_pendukung: record.sinyal_pendukung,
    timeline_kritis: record.timeline_kritis,
    cost_of_delay_per_bulan_rp: record.cost_of_delay_per_bulan_rp,
    last_computed_at: record.last_computed_at,
  };
}
