import { describe, expect, it } from "vitest";
import { calculateMatchingScore } from "../matchingScore";
import { rankOpportunityResults } from "../opportunitySearch";
import type { CriteriaCandidate } from "../filterCriteria";

const berastagi: CriteriaCandidate = {
  wilayah: {
    wilayah_id: 1206090,
    nama: "Kec. Berastagi",
    kabupaten: "Kab. Karo",
    provinsi: "Sumatera Utara",
    lat: 3.1968,
    lng: 98.5095,
  },
  score: {
    wilayah_id: 1206090,
    land_suitability_agro: 82,
    land_suitability_hosp: 76,
    land_suitability_pariwisata: 78,
    infrastructure_index: 75.6,
    zoning_compliance: 84,
    market_access: 64,
    demand_absorption: 88,
    growth_projection: 81,
    location_score: 78,
    median_land_price: 420000,
    appreciation_rate: 15.4,
    last_refreshed_at: "2026-05-06T03:00:00Z",
  },
  sample: {
    wilayah_id: 1206090,
    profil_kode: "AGRO_HOSP",
    marker_color: "#1E40AF",
    marker_radius: 14,
    is_default: false,
    karakter_singkat: "Dataran tinggi vulkanik subur, hortikultura + eco-tourism",
    elevasi_meter: 1300,
  },
};

const seminyak: CriteriaCandidate = {
  wilayah: {
    wilayah_id: 5103060,
    nama: "Kel. Seminyak",
    kabupaten: "Kab. Badung",
    provinsi: "Bali",
    lat: -8.6905,
    lng: 115.1729,
  },
  score: {
    wilayah_id: 5103060,
    land_suitability_agro: 18,
    land_suitability_hosp: 96,
    land_suitability_pariwisata: 94,
    infrastructure_index: 94,
    zoning_compliance: 78,
    market_access: 92,
    demand_absorption: 96,
    growth_projection: 72,
    location_score: 86,
    median_land_price: 28500000,
    appreciation_rate: 11.8,
    last_refreshed_at: "2026-05-06T03:00:00Z",
  },
};

describe("matching score", () => {
  it("calculates the canonical Berastagi raw value", () => {
    expect(
      calculateMatchingScore({
        sectorSuitability: 82,
        marketAccess: 64,
        growthProjection: 81,
      })
    ).toBeCloseTo(76.4, 5);
  });

  it("ranks Berastagi first and excludes Seminyak by budget in the canonical Mode 3 scenario", () => {
    const results = rankOpportunityResults([seminyak, berastagi], {
      sektorTarget: "hospitality",
      budgetMaxPerM2: 1_000_000,
      preferensi: "growth",
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      wilayah_id: 1206090,
      matching_score: 76.4,
      median_land_price: 420000,
    });
  });

  it("returns an empty array when no wilayah passes the budget pre-filter", () => {
    expect(
      rankOpportunityResults([seminyak, berastagi], {
        sektorTarget: "hospitality",
        budgetMaxPerM2: 100000,
        preferensi: "growth",
      })
    ).toEqual([]);
  });
});
