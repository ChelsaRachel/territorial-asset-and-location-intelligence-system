import { describe, expect, it } from "vitest";
import { buildComparisonReport } from "@/lib/export/builders/buildComparisonReport";
import { generateComparisonPpt } from "./index";

describe("generateComparisonPpt", () => {
  it("generates a pptx Blob for the comparison report", async () => {
    const report = await buildComparisonReport([1206090, 3204170], undefined, "2026-05-10T00:00:00.000Z");
    const blob = await generateComparisonPpt(report);

    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.presentationml.presentation");
    expect(blob.size).toBeGreaterThan(100);
  });
});
