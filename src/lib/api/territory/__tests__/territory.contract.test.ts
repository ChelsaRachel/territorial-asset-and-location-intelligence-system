import { describe, it, expect } from "vitest";
import { apiClient } from "@/lib/api/apiClient";
import { ApiError } from "@/lib/api/common/ApiError";

describe("apiClient.territory.getProfile — Berastagi A.2 canonical values", () => {
  it("resolves with Berastagi demografi", async () => {
    const profile = await apiClient.territory.getProfile(1206090);
    expect(profile.wilayah_id).toBe(1206090);
    expect(profile.demografi.luas_km2).toBe(30.5);
    expect(profile.demografi.jumlah_penduduk).toBe(43214);
    expect(profile.demografi.kepadatan_per_km2).toBeCloseTo(1417, -1);
    expect(profile.demografi.pdrb_per_kapita_juta).toBe(38);
  });

  it("resolves with Berastagi infra index 75.6 and breakdown", async () => {
    const profile = await apiClient.territory.getProfile(1206090);
    expect(profile.infrastruktur.infrastructure_index).toBe(75.6);
    expect(profile.infrastruktur.breakdown).toMatchObject({
      jalan_aspal: 78,
      listrik_pln: 89,
      air_bersih: 64,
      sinyal_4g: 67,
    });
  });

  it("includes land composition rows", async () => {
    const profile = await apiClient.territory.getProfile(1206090);
    expect(profile.komposisi_lahan.length).toBeGreaterThan(0);
    const total = profile.komposisi_lahan.reduce((sum, row) => sum + row.persen, 0);
    expect(total).toBeCloseTo(100, 0);
  });
});

describe("apiClient.territory.getZoning — Berastagi A.3 canonical values", () => {
  it("resolves with Berastagi compliance score 84 and BEBAS_INVESTASI flag", async () => {
    const zoning = await apiClient.territory.getZoning(1206090);
    expect(zoning.zoning_compliance_score).toBe(84);
    expect(zoning.regulatory_flag).toBe("BEBAS_INVESTASI");
    expect(zoning.flag_color).toBe("green");
  });

  it("resolves with conflict area 488 ha and rdtr_available=false", async () => {
    const zoning = await apiClient.territory.getZoning(1206090);
    expect(zoning.luas_konflik_ha).toBe(488);
    expect(zoning.rdtr_available).toBe(false);
  });

  it("Seminyak has KONFLIK_REGULASI flag (amber)", async () => {
    const zoning = await apiClient.territory.getZoning(5103060);
    expect(zoning.regulatory_flag).toBe("KONFLIK_REGULASI");
    expect(zoning.flag_color).toBe("amber");
  });
});

describe("apiClient.territory.getMarketAccess — Berastagi A.4 canonical values", () => {
  it("resolves with market_access_score 64", async () => {
    const ma = await apiClient.territory.getMarketAccess(1206090, { includeRoutes: true });
    expect(ma.market_access_score).toBe(64);
  });

  it("score_breakdown matches documented values", async () => {
    const ma = await apiClient.territory.getMarketAccess(1206090, { includeRoutes: false });
    expect(ma.score_breakdown).toMatchObject({
      pelabuhan: 58,
      bandara: 55,
      pasar_induk: 72,
      jalan_nasional: 95,
      kondisi_jalan: 60,
    });
  });

  it("includes 5 destinations with Belawan, Kualanamu, Pusat Pasar Medan", async () => {
    const ma = await apiClient.territory.getMarketAccess(1206090, { includeRoutes: false });
    expect(ma.destinations).toHaveLength(5);
    expect(ma.destinations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nama: "Belawan, Medan", jarak_km: 84, waktu_menit: 135, cost_per_ton_rp: 800000 }),
        expect.objectContaining({ nama: "Kualanamu", jarak_km: 96, waktu_menit: 150, cost_per_ton_rp: 950000 }),
        expect.objectContaining({ nama: "Pusat Pasar Medan", jarak_km: 78, waktu_menit: 125, cost_per_ton_rp: 600000 }),
      ]),
    );
  });

  it("bottleneck_utama includes Berastagi-Medan road description", async () => {
    const ma = await apiClient.territory.getMarketAccess(1206090, { includeRoutes: false });
    expect(ma.bottleneck_utama).toMatch(/Berastagi.{0,10}Medan/i);
  });

  it("cost_per_ton_rp is null for ibukota_provinsi and jalan_nasional rows", async () => {
    const ma = await apiClient.territory.getMarketAccess(1206090, { includeRoutes: false });
    const ibukota = ma.destinations.find((d) => d.tipe === "ibukota_provinsi");
    const jalan = ma.destinations.find((d) => d.tipe === "jalan_nasional");
    expect(ibukota?.cost_per_ton_rp).toBeNull();
    expect(jalan?.cost_per_ton_rp).toBeNull();
  });

  it("getMarketAccess with includeRoutes=true attaches rute_geojson features", async () => {
    const ma = await apiClient.territory.getMarketAccess(1206090, { includeRoutes: true });
    const withRoute = ma.destinations.find((d) => d.rute_geojson !== undefined);
    expect(withRoute).toBeDefined();
    expect(withRoute?.rute_geojson?.features.length).toBeGreaterThan(0);
  });
});

describe("apiClient.territory — unknown wilayah_id errors", () => {
  it("getProfile rejects with NOT_FOUND for unknown id", async () => {
    await expect(apiClient.territory.getProfile(999999)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.code === "NOT_FOUND",
    );
  });

  it("getZoning rejects with NOT_FOUND for unknown id", async () => {
    await expect(apiClient.territory.getZoning(999999)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.code === "NOT_FOUND",
    );
  });

  it("getMarketAccess rejects with NOT_FOUND for unknown id", async () => {
    await expect(
      apiClient.territory.getMarketAccess(999999, { includeRoutes: false }),
    ).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.code === "NOT_FOUND",
    );
  });
});
