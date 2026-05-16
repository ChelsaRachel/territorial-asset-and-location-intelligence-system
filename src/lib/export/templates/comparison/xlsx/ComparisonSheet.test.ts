import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { buildComparisonReport } from "@/lib/export/builders/buildComparisonReport";
import { generateComparisonXlsx } from "./index";

describe("generateComparisonXlsx", () => {
  it("generates a 3-sheet workbook with sortable comparison data", async () => {
    const report = await buildComparisonReport([1206090, 3204170], undefined, "2026-05-10T00:00:00.000Z");
    const blob = await generateComparisonXlsx(report);
    const workbook = XLSX.read(await blob.arrayBuffer(), { type: "array" });

    expect(workbook.SheetNames).toEqual(["Komparasi", "Skor Wilayah", "Rekomendasi"]);
    const komparasi = workbook.Sheets.Komparasi!;
    expect(String(komparasi.A2?.v)).toContain("Berastagi");
    expect(komparasi.I2?.v).toBe(78);
    expect(workbook.Sheets.Komparasi?.["!autofilter"]).toBeDefined();
  });
});
