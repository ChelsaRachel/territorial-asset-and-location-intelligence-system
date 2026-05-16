import { describe, expect, it } from "vitest";
import { filterCriteriaResults, type CriteriaCandidate } from "../filterCriteria";

const candidates: CriteriaCandidate[] = [
  {
    wilayah: {
      wilayah_id: 3204170,
      nama: "Kec. Ciwidey",
      kabupaten: "Kab. Bandung",
      provinsi: "Jawa Barat",
      lat: -7.08,
      lng: 107.42,
    },
    score: {
      wilayah_id: 3204170,
      land_suitability_agro: 82,
      land_suitability_hosp: 62,
      land_suitability_pariwisata: 65,
      infrastructure_index: 78.2,
      zoning_compliance: 91,
      market_access: 64,
      demand_absorption: 88,
      growth_projection: 71,
      location_score: 78,
      median_land_price: 185000,
      appreciation_rate: 18.7,
      last_refreshed_at: "2026-05-06T03:00:00Z",
    },
    sample: {
      wilayah_id: 3204170,
      profil_kode: "AGRO_DOMINANT",
      marker_color: "#2D6A4F",
      marker_radius: 14,
      is_default: true,
      karakter_singkat: "Dataran tinggi subur, basis kopi arabika premium",
      elevasi_meter: 1200,
    },
  },
  {
    wilayah: {
      wilayah_id: 3203280,
      nama: "Kec. Cipanas",
      kabupaten: "Kab. Cianjur",
      provinsi: "Jawa Barat",
      lat: -6.735,
      lng: 107.042,
    },
    score: {
      wilayah_id: 3203280,
      land_suitability_agro: 62,
      land_suitability_hosp: 74,
      land_suitability_pariwisata: 78,
      infrastructure_index: 72.8,
      zoning_compliance: 68,
      market_access: 74,
      demand_absorption: 78,
      growth_projection: 66,
      location_score: 72,
      median_land_price: 1250000,
      appreciation_rate: 8.2,
      last_refreshed_at: "2026-04-14T10:30:00Z",
    },
  },
  {
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
  },
];

describe("filterCriteriaResults", () => {
  it("includes Ciwidey for the canonical Agro + Jawa Barat + score threshold scenario", () => {
    const results = filterCriteriaResults(candidates, {
      sektor: ["agro"],
      minSkorPotensi: 70,
      provinsiIds: ["32"],
    });

    expect(results.map((result) => result.nama)).toContain("Kec. Ciwidey");
    expect(results[0]).toMatchObject({
      wilayah_id: 3204170,
      sector_signal: "Agro",
      sector_signal_score: 82,
    });
  });

  it("sorts by potential score, sector signal, lower price, then name", () => {
    const results = filterCriteriaResults(candidates, {
      sektor: ["agro", "hospitality"],
      provinsiIds: ["32"],
    });

    expect(results.map((result) => result.wilayah_id)).toEqual([3204170, 3203280]);
  });

  it("returns an empty array for impossibly strict filters", () => {
    expect(
      filterCriteriaResults(candidates, {
        sektor: ["agro"],
        minSkorPotensi: 99,
        minMarketAccess: 99,
        minGrowthProjection: 99,
      })
    ).toEqual([]);
  });
});
