import { describe, it, expect } from "vitest";
import { getTrend } from "../getTrend";
import { getDemand } from "../getDemand";
import { getLandValue } from "../getLandValue";
import { getGrowth } from "../getGrowth";

const BERASTAGI = 1206090;
const CIWIDEY = 3204170;
const SEMINYAK = 5103060;
const UNKNOWN = 9999999;

describe("getTrend", () => {
  it("returns 12 NDVI points for Berastagi", async () => {
    const result = await getTrend(BERASTAGI);
    expect(result.wilayah_id).toBe(BERASTAGI);
    expect(result.ndvi_series).toHaveLength(12);
  });

  it("returns 5 PDRB points for Berastagi", async () => {
    const result = await getTrend(BERASTAGI);
    expect(result.pdrb_series).toHaveLength(5);
  });

  it("returns 10 climate anomaly points for Berastagi", async () => {
    const result = await getTrend(BERASTAGI);
    expect(result.iklim_anomali_series).toHaveLength(10);
  });

  it("Berastagi tren_label is Membaik and score is 76", async () => {
    const result = await getTrend(BERASTAGI);
    expect(result.tren_summary.label).toBe("Membaik");
    expect(result.tren_summary.score).toBe(76);
  });

  it("Berastagi scenario probabilities are 0.65 / 0.25 / 0.10", async () => {
    const result = await getTrend(BERASTAGI);
    expect(result.tren_summary.proyeksi.normal.probabilitas).toBeCloseTo(0.65, 2);
    expect(result.tren_summary.proyeksi.elnino_lemah.probabilitas).toBeCloseTo(0.25, 2);
    expect(result.tren_summary.proyeksi.elnino_kuat.probabilitas).toBeCloseTo(0.10, 2);
  });

  it("Berastagi Apr 2026 NDVI shows anomaly drop vs baseline", async () => {
    const result = await getTrend(BERASTAGI);
    const apr2026 = result.ndvi_series.find((p) => p.year === 2026 && p.month === 4);
    expect(apr2026).toBeDefined();
    expect(apr2026!.delta_from_baseline).toBeLessThan(0);
  });

  it("throws NOT_FOUND for unknown wilayah", async () => {
    await expect(getTrend(UNKNOWN)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns trend for all three canonical profiles", async () => {
    const [beras, ciwidey, seminyak] = await Promise.all([
      getTrend(BERASTAGI),
      getTrend(CIWIDEY),
      getTrend(SEMINYAK),
    ]);
    expect(beras.ndvi_series).toHaveLength(12);
    expect(ciwidey.ndvi_series).toHaveLength(12);
    expect(seminyak.ndvi_series).toHaveLength(12);
  });
});

describe("getDemand", () => {
  it("returns Berastagi Agro items without sektor param (defaults to agro record)", async () => {
    const result = await getDemand(BERASTAGI, "agro");
    expect(result.wilayah_id).toBe(BERASTAGI);
    expect(result.sektor_aktif).toBe("agro");
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("Berastagi Agro contains Stroberi with gap +560", async () => {
    const result = await getDemand(BERASTAGI, "agro");
    const stroberi = result.items.find((i) => i.komoditas === "Stroberi");
    expect(stroberi).toBeDefined();
    expect(stroberi!.gap).toBe(560);
    expect(stroberi!.status).toBe("peluang_besar");
  });

  it("Berastagi Agro contains Markisa with gap +420", async () => {
    const result = await getDemand(BERASTAGI, "agro");
    const markisa = result.items.find((i) => i.komoditas === "Markisa");
    expect(markisa).toBeDefined();
    expect(markisa!.gap).toBe(420);
  });

  it("Berastagi Agro Kubis is oversupply", async () => {
    const result = await getDemand(BERASTAGI, "agro");
    const kubis = result.items.find((i) => i.komoditas === "Kubis");
    expect(kubis).toBeDefined();
    expect(kubis!.status).toBe("oversupply");
    expect(result.komoditas_hindari.some((i) => i.komoditas === "Kubis")).toBe(true);
  });

  it("Berastagi Agro Kopi Arabika is peluang_tinggi", async () => {
    const result = await getDemand(BERASTAGI, "agro");
    const kopi = result.items.find((i) => i.komoditas === "Kopi Arabika");
    expect(kopi).toBeDefined();
    expect(kopi!.status).toBe("peluang_tinggi");
  });

  it("peluang_top3 does not include oversupply items from Berastagi Agro", async () => {
    const result = await getDemand(BERASTAGI, "agro");
    const oversupplyInTop3 = result.peluang_top3.some((i) => i.status === "oversupply");
    expect(oversupplyInTop3).toBe(false);
  });

  it("sektor filtering returns only the requested sektor", async () => {
    const hospitality = await getDemand(BERASTAGI, "hospitality");
    expect(hospitality.sektor_aktif).toBe("hospitality");
    expect(hospitality.items.length).toBeGreaterThan(0);
    const agro = await getDemand(BERASTAGI, "agro");
    expect(agro.items.length).not.toBe(hospitality.items.length);
  });

  it("Seminyak agro sektor returns empty items", async () => {
    const result = await getDemand(SEMINYAK, "agro");
    expect(result.items).toHaveLength(0);
    expect(result.peluang_top3).toHaveLength(0);
  });

  it("unknown wilayah returns empty rather than throwing (no records found)", async () => {
    const result = await getDemand(UNKNOWN, "agro");
    expect(result.items).toHaveLength(0);
  });
});

describe("getLandValue", () => {
  it("returns Berastagi land value with canonical values", async () => {
    const result = await getLandValue(BERASTAGI);
    expect(result.wilayah_id).toBe(BERASTAGI);
    expect(result.current.median_price_rp_per_m2).toBe(420000);
    expect(result.current.appreciation_yoy_pct).toBe(15.4);
    expect(result.current.speculation_ratio).toBe(1.4);
    expect(result.current.speculation_status).toBe("sehat");
  });

  it("returns 8 quarterly series points for Berastagi", async () => {
    const result = await getLandValue(BERASTAGI);
    expect(result.quarterly_series).toHaveLength(8);
  });

  it("returns harga_vs_njop rows for Berastagi", async () => {
    const result = await getLandValue(BERASTAGI);
    expect(result.harga_vs_njop.length).toBeGreaterThanOrEqual(3);
  });

  it("returns all three projection horizons for Berastagi", async () => {
    const result = await getLandValue(BERASTAGI);
    expect(result.proyeksi["6_bulan"]).toBeDefined();
    expect(result.proyeksi["12_bulan"]).toBeDefined();
    expect(result.proyeksi["36_bulan"]).toBeDefined();
  });

  it("Seminyak has higher median price than Berastagi", async () => {
    const [beras, seminyak] = await Promise.all([getLandValue(BERASTAGI), getLandValue(SEMINYAK)]);
    expect(seminyak.current.median_price_rp_per_m2).toBeGreaterThan(beras.current.median_price_rp_per_m2);
  });

  it("throws NOT_FOUND for unknown wilayah", async () => {
    await expect(getLandValue(UNKNOWN)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("getGrowth", () => {
  it("returns Berastagi canonical growth score 81", async () => {
    const result = await getGrowth(BERASTAGI);
    expect(result.wilayah_id).toBe(BERASTAGI);
    expect(result.growth_projection_score).toBe(81);
  });

  it("Berastagi pipeline_infra score is 92", async () => {
    const result = await getGrowth(BERASTAGI);
    expect(result.breakdown.pipeline_infra.score).toBe(92);
  });

  it("Berastagi cost_of_delay is 18500000", async () => {
    const result = await getGrowth(BERASTAGI);
    expect(result.cost_of_delay_per_bulan_rp).toBe(18500000);
  });

  it("Berastagi timeline has milestones 2026-Q3, 2027-Q1, 2027-Q4", async () => {
    const result = await getGrowth(BERASTAGI);
    const quarters = result.timeline_kritis.map((t) => t.quarter);
    expect(quarters).toContain("2026-Q3");
    expect(quarters).toContain("2027-Q1");
    expect(quarters).toContain("2027-Q4");
  });

  it("throws NOT_FOUND for unknown wilayah", async () => {
    await expect(getGrowth(UNKNOWN)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
