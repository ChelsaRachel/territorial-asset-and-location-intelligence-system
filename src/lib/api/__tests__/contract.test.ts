import { describe, it, expect } from "vitest";
import { apiClient } from "../apiClient";
import { ApiError } from "../common/ApiError";

describe("apiClient.discovery.getProfiles", () => {
  it("resolves with three profiles including Berastagi", async () => {
    const response = await apiClient.discovery.getProfiles();
    expect(response.profiles).toHaveLength(3);
    const berastagi = response.profiles.find((p) => p.nama === "Kec. Berastagi");
    expect(berastagi).toBeDefined();
    expect(berastagi?.wilayah_id).toBe(1206090);
  });
});

describe("apiClient.discovery.getQuickScan", () => {
  it("resolves with live-composed verdict_score for Berastagi (1206090)", async () => {
    const snap = await apiClient.discovery.getQuickScan(1206090);
    expect(snap.verdict_score).toBe(80.75);
    expect(snap.data_source).toBe("live_composed");
  });

  it("rejects with NOT_FOUND for unknown wilayah_id", async () => {
    await expect(apiClient.discovery.getQuickScan(99999)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.code === "NOT_FOUND",
    );
  });
});

describe("apiClient.discovery.search mode=opportunity", () => {
  it("ranks Berastagi first for hospitality budget query", async () => {
    const response = await apiClient.discovery.search({
      mode: "opportunity",
      query: {
        intent: {
          sektor_target: "hospitality",
          budget_max_per_m2: 1_000_000,
          preferensi: "land_banking",
        },
      },
    });
    expect(response.results[0]?.wilayah_id).toBe(1206090);
  });
});

describe("apiClient.territory contract", () => {
  it("getProfile resolves Berastagi canonical A.2 values", async () => {
    const profile = await apiClient.territory.getProfile(1206090);
    expect(profile.demografi.luas_km2).toBe(30.5);
    expect(profile.demografi.jumlah_penduduk).toBe(43214);
    expect(profile.infrastruktur.infrastructure_index).toBe(75.6);
    expect(profile.infrastruktur.breakdown).toMatchObject({
      jalan_aspal: 78,
      listrik_pln: 89,
      air_bersih: 64,
      sinyal_4g: 67,
    });
  });

  it("getZoning resolves Berastagi canonical A.3 values", async () => {
    const zoning = await apiClient.territory.getZoning(1206090);
    expect(zoning.zoning_compliance_score).toBe(84);
    expect(zoning.regulatory_flag).toBe("BEBAS_INVESTASI");
    expect(zoning.luas_konflik_ha).toBe(488);
    expect(zoning.rdtr_available).toBe(false);
  });

  it("getMarketAccess resolves Berastagi canonical A.4 values", async () => {
    const marketAccess = await apiClient.territory.getMarketAccess(1206090, {
      includeRoutes: true,
    });
    expect(marketAccess.market_access_score).toBe(64);
    expect(marketAccess.destinations).toHaveLength(5);
    expect(marketAccess.destinations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nama: "Belawan, Medan", jarak_km: 84, waktu_menit: 135 }),
        expect.objectContaining({ nama: "Kualanamu", jarak_km: 96, waktu_menit: 150 }),
        expect.objectContaining({ nama: "Pusat Pasar Medan", jarak_km: 78, waktu_menit: 125 }),
      ]),
    );
    expect(marketAccess.destinations[0]?.rute_geojson?.features).toHaveLength(1);
  });

  it("getMapLayers returns A.3 local layer references", async () => {
    const layers = await apiClient.territory.getMapLayers(1206090);
    expect(layers.layers.map((layer) => layer.id)).toEqual([
      "rtrw",
      "actual_landcover",
      "kawasan_lindung",
    ]);
    expect(layers.feature_collection.features.length).toBeGreaterThanOrEqual(5);
    expect(layers.geojson_overlay_path).toBe("src/mocks/maps/zoning/1206090.geojson");
  });

  it("rejects unknown territory IDs with NOT_FOUND", async () => {
    await expect(apiClient.territory.getProfile(999999)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.code === "NOT_FOUND",
    );
  });
});
