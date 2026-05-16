import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/common/ApiError";
import { buildComparisonReport } from "./buildComparisonReport";

describe("buildComparisonReport", () => {
  it("composes comparison, factsheet, risk, viability, and recommendations from adapters", async () => {
    const report = await buildComparisonReport(
      [1206090, 3204170],
      ["executive_summary", "comparison_table", "factsheet"],
      "2026-05-10T00:00:00.000Z",
    );

    expect(report.reportType).toBe("comparison");
    expect(report.generatedAt).toBe("2026-05-10T00:00:00.000Z");
    expect(report.comparisonRows).toHaveLength(2);
    expect(report.parameters.map((parameter) => parameter.key)).toEqual([
      "A1",
      "A2",
      "A3",
      "A4",
      "A6",
      "A7",
      "A8",
      "C1",
      "harga_lahan",
      "apresiasi_yoy_pct",
    ]);
    const berastagi = report.candidates.find((candidate) => candidate.row.wilayah_id === 1206090);
    expect(berastagi?.row.C1).toBe(78);
    expect(berastagi?.factsheet.zoning.regulatory_flag).toBe("BEBAS_INVESTASI");
    expect(berastagi?.riskProfile.scores).toHaveProperty("iklim");
    expect(berastagi?.financialViability.ratio).toBeGreaterThan(0);
    expect(report.rekomendasiCards).toHaveLength(3);
  });

  it("rejects with ApiError when a required adapter cannot resolve a wilayah", async () => {
    await expect(buildComparisonReport([999999], undefined, "2026-05-10T00:00:00.000Z")).rejects.toSatisfy(
      (error: unknown) => error instanceof ApiError && error.code === "NOT_FOUND",
    );
  });
});
