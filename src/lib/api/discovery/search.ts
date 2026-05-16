// POST /api/v1/discovery/search — docs/01_COMMAND_CENTER.md §5.1
import dimWilayahData from "@/mocks/dim_wilayah.json";
import scoreData from "@/mocks/wilayah_score_aggregate.json";
import profilSampleData from "@/mocks/wilayah_profil_sample.json";
import { DimWilayahSchema } from "@/lib/schema/dim_wilayah";
import { WilayahScoreAggregateSchema } from "@/lib/schema/wilayah_score_aggregate";
import { WilayahProfilSampleSchema } from "@/lib/schema/wilayah_profil_sample";
import { loadFixture } from "@/lib/schema/loader";
import { createLocationSearchIndex, searchLocationIndex } from "@/lib/discovery/locationSearch";
import {
  filterCriteriaResults,
  type CriteriaCandidate,
  type DiscoverySector,
} from "@/lib/discovery/filterCriteria";
import {
  rankOpportunityResults,
  type OpportunityPreference,
} from "@/lib/discovery/opportunitySearch";
import { ApiError } from "../common/ApiError";
import { delay } from "../common/delay";
import type { SearchResult, SearchMode } from "@/lib/types/wilayah";

interface LocationQuery {
  name_query: string;
}

interface CriteriaQuery {
  filters: {
    sektor?: DiscoverySector[];
    location_score_min?: number;
    location_score_max?: number;
    market_access_min?: number;
    growth_projection_min?: number;
    region?: string[];
  };
}

interface OpportunityQuery {
  intent: {
    sektor_target: DiscoverySector;
    budget_max_per_m2?: number;
    preferensi?: OpportunityPreference;
  };
}

export interface SearchPayload {
  mode: SearchMode;
  query: LocationQuery | CriteriaQuery | OpportunityQuery;
  limit?: number;
}

export interface SearchResponse {
  mode: SearchMode;
  results: SearchResult[];
  total: number;
  duration_ms: number;
}

let locationIndexCache:
  | ReturnType<typeof createLocationSearchIndex>
  | null = null;

export async function search(payload: SearchPayload): Promise<SearchResponse> {
  await delay(150);
  const start = Date.now();
  try {
    const wilayahs = loadFixture(dimWilayahData, DimWilayahSchema.array());
    const scores = loadFixture(scoreData, WilayahScoreAggregateSchema.array());
    const samples = loadFixture(profilSampleData, WilayahProfilSampleSchema.array());
    const sampleByWilayah = new Map(samples.map((sample) => [sample.wilayah_id, sample]));
    const scoreByWilayah = new Map(scores.map((score) => [score.wilayah_id, score]));
    const candidates: CriteriaCandidate[] = wilayahs.reduce<CriteriaCandidate[]>(
      (list, wilayah) => {
        const score = scoreByWilayah.get(wilayah.wilayah_id);
        if (!score) return list;
        list.push({
          wilayah,
          score,
          sample: sampleByWilayah.get(wilayah.wilayah_id),
        });
        return list;
      },
      []
    );

    let results: SearchResult[] = [];

    if (payload.mode === "location") {
      if (!locationIndexCache) {
        locationIndexCache = createLocationSearchIndex(wilayahs, scores, samples);
      }
      const q = (payload.query as LocationQuery).name_query;
      const limit = payload.limit ?? 20;
      results = searchLocationIndex(locationIndexCache, q, limit);
    } else if (payload.mode === "criteria") {
      const f = (payload.query as CriteriaQuery).filters;
      results = filterCriteriaResults(candidates, {
        sektor: f.sektor,
        minSkorPotensi: f.location_score_min,
        maxSkorPotensi: f.location_score_max,
        minMarketAccess: f.market_access_min,
        minGrowthProjection: f.growth_projection_min,
        provinsiIds: f.region,
      });
    } else {
      const intent = (payload.query as OpportunityQuery).intent;
      results = rankOpportunityResults(candidates, {
        sektorTarget: intent.sektor_target,
        budgetMaxPerM2: intent.budget_max_per_m2,
        preferensi: intent.preferensi,
      });
    }

    const limit = payload.limit ?? 20;
    return {
      mode: payload.mode,
      results: results.slice(0, limit),
      total: results.length,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("FIXTURE_INVALID", "POST /discovery/search", String(err));
  }
}
