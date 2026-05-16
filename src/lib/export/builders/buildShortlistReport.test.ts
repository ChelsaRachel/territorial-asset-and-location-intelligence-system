import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/common/ApiError";
import { buildShortlistReport } from "./buildShortlistReport";

describe("buildShortlistReport", () => {
  it("returns one entry-section per shortlist id with snapshot/current/delta/note", async () => {
    const report = await buildShortlistReport(["sl-001"], undefined, "2026-05-10T00:00:00.000Z");

    expect(report.reportType).toBe("shortlist");
    expect(report.entries).toHaveLength(1);
    expect(report.entries[0]?.wilayah.nama).toContain("Berastagi");
    expect(report.entries[0]?.snapshot.location_score).toBe(78);
    expect(report.entries[0]?.current.location_score).toBe(78);
    expect(report.entries[0]?.deltaRows).toHaveLength(4);
    expect(report.entries[0]?.daysSinceSaved).toBe(8);
    expect(report.entries[0]?.note).toContain("pre-tol");
  });

  it("rejects unknown shortlist ids with ApiError", async () => {
    await expect(buildShortlistReport(["sl-missing"], undefined, "2026-05-10T00:00:00.000Z")).rejects.toSatisfy(
      (error: unknown) => error instanceof ApiError && error.code === "NOT_FOUND",
    );
  });
});
