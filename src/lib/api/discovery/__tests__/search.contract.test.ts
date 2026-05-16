import { describe, expect, it } from "vitest";
import { apiClient } from "../../apiClient";

describe("apiClient.discovery.search", () => {
  it("Mode 1 returns Berastagi for fuzzy location input", async () => {
    const response = await apiClient.discovery.search({
      mode: "location",
      query: { name_query: "berast" },
    });

    expect(response.results[0]).toMatchObject({
      wilayah_id: 1206090,
      nama: "Kec. Berastagi",
      profil_kode: "AGRO_HOSP",
    });
  });

  it("Mode 2 includes Ciwidey for canonical criteria filters", async () => {
    const response = await apiClient.discovery.search({
      mode: "criteria",
      query: {
        filters: {
          sektor: ["agro"],
          location_score_min: 70,
          region: ["32"],
        },
      },
    });

    expect(response.results.map((result) => result.wilayah_id)).toContain(3204170);
    expect(response.results[0]?.highlight_reason).toContain("Agro");
  });

  it("Mode 2 returns an empty list for strict criteria filters", async () => {
    const response = await apiClient.discovery.search({
      mode: "criteria",
      query: {
        filters: {
          sektor: ["agro"],
          location_score_min: 99,
          market_access_min: 99,
          growth_projection_min: 99,
        },
      },
    });

    expect(response.results).toEqual([]);
    expect(response.total).toBe(0);
  });

  it("Mode 3 ranks Berastagi first and excludes Seminyak by budget", async () => {
    const response = await apiClient.discovery.search({
      mode: "opportunity",
      query: {
        intent: {
          sektor_target: "hospitality",
          budget_max_per_m2: 1_000_000,
          preferensi: "growth",
        },
      },
    });

    expect(response.results[0]).toMatchObject({
      wilayah_id: 1206090,
      matching_score: 76.4,
      median_land_price: 420000,
    });
    expect(response.results.map((result) => result.wilayah_id)).not.toContain(5103060);
  });
});
