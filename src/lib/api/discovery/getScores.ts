// GET /api/v1/discovery/scores — returns wilayah_score_aggregate rows for the requested IDs.
// Used by SampleProfileMarkers to source location_score for the hover popup (TASK-004).
import scoreData from "@/mocks/wilayah_score_aggregate.json";
import { WilayahScoreAggregateSchema } from "@/lib/schema/wilayah_score_aggregate";
import { loadFixture } from "@/lib/schema/loader";
import { ApiError } from "../common/ApiError";
import { delay } from "../common/delay";
import type { WilayahScoreAggregate } from "@/lib/types/wilayah";

export interface GetScoresResponse {
  scores: WilayahScoreAggregate[];
}

export async function getScores(wilayahIds?: number[]): Promise<GetScoresResponse> {
  await delay(80);
  try {
    const all = loadFixture(scoreData, WilayahScoreAggregateSchema.array());
    const scores = wilayahIds
      ? all.filter((s) => wilayahIds.includes(s.wilayah_id))
      : all;
    return { scores };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("FIXTURE_INVALID", "GET /discovery/scores", String(err));
  }
}
