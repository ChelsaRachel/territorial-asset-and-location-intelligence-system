import React from "react";
import { describe, expect, it, vi } from "vitest";
import { buildComparisonReport } from "@/lib/export/builders/buildComparisonReport";
import type { ComparisonReportData } from "@/lib/export/types";
import { generateComparisonPdf } from "./index";

vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: React.ReactNode }) => React.createElement("Document", null, children),
  Page: ({ children }: { children: React.ReactNode }) => React.createElement("Page", null, children),
  View: ({ children }: { children: React.ReactNode }) => React.createElement("View", null, children),
  Text: ({ children }: { children: React.ReactNode }) => React.createElement("Text", null, children),
  StyleSheet: { create: <T,>(styles: T) => styles },
  pdf: vi.fn(() => ({
    toBlob: () => Promise.resolve(new Blob(["comparison-pdf"], { type: "application/pdf" })),
  })),
}));

function expandCandidates(data: ComparisonReportData, count: number): ComparisonReportData {
  const candidates = Array.from({ length: count }, (_, index) => {
    const source = data.candidates[index % data.candidates.length]!;
    return {
      ...source,
      row: {
        ...source.row,
        wilayah_id: source.row.wilayah_id + index * 10_000,
        nama: `${source.row.nama} ${index + 1}`,
      },
    };
  });
  return {
    ...data,
    candidates,
    comparisonRows: candidates.map((candidate) => candidate.row),
    wilayahIds: candidates.map((candidate) => candidate.row.wilayah_id),
    wilayahNames: candidates.map((candidate) => candidate.row.nama),
  };
}

describe("generateComparisonPdf", () => {
  it("resolves a Blob for 2, 3, 4, and 5 candidate layouts", async () => {
    const base = await buildComparisonReport([1206090, 3204170], undefined, "2026-05-10T00:00:00.000Z");

    for (const count of [2, 3, 4, 5]) {
      const blob = await generateComparisonPdf(expandCandidates(base, count));
      expect(blob.type).toBe("application/pdf");
      expect(blob.size).toBeGreaterThan(0);
    }
  });
});
