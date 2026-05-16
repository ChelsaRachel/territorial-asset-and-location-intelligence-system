// Validates src/mocks/wilayah_score_aggregate.json — mirrors docs/01_COMMAND_CENTER.md §4.1
import { z } from "zod";
import type { WilayahScoreAggregate } from "@/lib/types/wilayah";

const scoreField = z.number().min(0).max(100);

export const WilayahScoreAggregateSchema = z.object({
  wilayah_id: z.number().int().positive(),
  land_suitability_agro: scoreField,
  land_suitability_hosp: scoreField,
  land_suitability_pariwisata: scoreField,
  infrastructure_index: scoreField,
  zoning_compliance: scoreField,
  market_access: scoreField,
  demand_absorption: scoreField,
  growth_projection: scoreField,
  location_score: scoreField,
  median_land_price: z.number().int().positive(),
  appreciation_rate: z.number().nonnegative(),
  last_refreshed_at: z.string().datetime({ offset: true }),
});

const _check: WilayahScoreAggregate = {} as z.infer<typeof WilayahScoreAggregateSchema>;
void _check;
