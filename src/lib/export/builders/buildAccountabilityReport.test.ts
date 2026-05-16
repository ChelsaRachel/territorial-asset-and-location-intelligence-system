import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/common/ApiError";
import { buildAccountabilityReport } from "./buildAccountabilityReport";

describe("buildAccountabilityReport", () => {
  it("composes snapshots, policies, attribution rows, benchmark, and recommendations", async () => {
    const report = await buildAccountabilityReport(1206090, "2025-01", "2025-12", "2026-05-10T00:00:00.000Z");

    expect(report.reportType).toBe("accountability");
    expect(report.wilayahName).toContain("Berastagi");
    expect(report.periodAResolved).toBe("2025-01-01");
    expect(report.periodBResolved).toBe("2025-12-01");
    expect(report.deltaRows).toHaveLength(10);
    expect(report.policiesInPeriod.length).toBeGreaterThan(0);
    expect(report.policiesInPeriod[0]?.attributionRows.length).toBeGreaterThan(0);
    expect(report.benchmark?.mapping.wilayah_aktif_nama).toContain("Berastagi");
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.heuristicDisclaimer).toBe("Estimasi heuristik berbasis korelasi delta indikator dengan tanggal kebijakan — bukan model kausal.");
  });

  it("rejects with ApiError for unknown wilayah snapshots", async () => {
    await expect(buildAccountabilityReport(999999, "2025-01", "2025-12", "2026-05-10T00:00:00.000Z")).rejects.toSatisfy(
      (error: unknown) => error instanceof ApiError && error.code === "NOT_FOUND",
    );
  });
});
