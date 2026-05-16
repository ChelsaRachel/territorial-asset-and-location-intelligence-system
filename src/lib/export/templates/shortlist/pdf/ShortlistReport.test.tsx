import React from "react";
import { describe, expect, it, vi } from "vitest";
import { buildShortlistReport } from "@/lib/export/builders/buildShortlistReport";
import type { ShortlistReportData } from "@/lib/export/types";
import { generateShortlistPdf } from "./index";

vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: React.ReactNode }) => React.createElement("Document", null, children),
  Page: ({ children }: { children: React.ReactNode }) => React.createElement("Page", null, children),
  View: ({ children }: { children: React.ReactNode }) => React.createElement("View", null, children),
  Text: ({ children }: { children: React.ReactNode }) => React.createElement("Text", null, children),
  StyleSheet: { create: <T,>(styles: T) => styles },
  pdf: vi.fn(() => ({
    toBlob: () => Promise.resolve(new Blob(["shortlist-pdf"], { type: "application/pdf" })),
  })),
}));

function expandEntries(data: ShortlistReportData, count: number): ShortlistReportData {
  const entries = Array.from({ length: count }, (_, index) => {
    const source = data.entries[index % data.entries.length]!;
    return {
      ...source,
      item: { ...source.item, id: `${source.item.id}-${index}` },
      wilayah: { ...source.wilayah, nama: `${source.wilayah.nama} ${index + 1}` },
    };
  });
  return {
    ...data,
    entries,
    summary: { ...data.summary, totalEntries: entries.length },
  };
}

describe("generateShortlistPdf", () => {
  it("resolves a Blob for 1, 5, and 20 entry layouts", async () => {
    const base = await buildShortlistReport(["sl-001"], undefined, "2026-05-10T00:00:00.000Z");

    for (const count of [1, 5, 20]) {
      const blob = await generateShortlistPdf(expandEntries(base, count));
      expect(blob.type).toBe("application/pdf");
      expect(blob.size).toBeGreaterThan(0);
    }
  });
});
