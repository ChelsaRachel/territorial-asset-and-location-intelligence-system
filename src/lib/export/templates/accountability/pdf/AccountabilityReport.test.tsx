import React from "react";
import { describe, expect, it, vi } from "vitest";
import { buildAccountabilityReport } from "@/lib/export/builders/buildAccountabilityReport";
import type { AccountabilityReportData } from "@/lib/export/types";
import { generateAccountabilityPdf } from "./index";

vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: React.ReactNode }) => React.createElement("Document", null, children),
  Page: ({ children }: { children: React.ReactNode }) => React.createElement("Page", null, children),
  View: ({ children }: { children: React.ReactNode }) => React.createElement("View", null, children),
  Text: ({ children }: { children: React.ReactNode }) => React.createElement("Text", null, children),
  StyleSheet: { create: <T,>(styles: T) => styles },
  pdf: vi.fn(() => ({
    toBlob: () => Promise.resolve(new Blob(["accountability-pdf"], { type: "application/pdf" })),
  })),
}));

function expandPolicies(data: AccountabilityReportData, count: number): AccountabilityReportData {
  const policiesInPeriod = Array.from({ length: count }, (_, index) => {
    const source = data.policiesInPeriod[index % Math.max(1, data.policiesInPeriod.length)] ?? data.policiesInPeriod[0]!;
    return {
      ...source,
      policy: {
        ...source.policy,
        id: `${source.policy.id}-${index}`,
        title: `${source.policy.title} ${index + 1}`,
      },
    };
  });
  return { ...data, policiesInPeriod };
}

describe("generateAccountabilityPdf", () => {
  it("resolves a Blob for 0, 3, 7, and 12 policy layouts", async () => {
    const base = await buildAccountabilityReport(1206090, "2025-01", "2025-12", "2026-05-10T00:00:00.000Z");

    for (const count of [0, 3, 7, 12]) {
      const blob = await generateAccountabilityPdf(expandPolicies(base, count));
      expect(blob.type).toBe("application/pdf");
      expect(blob.size).toBeGreaterThan(0);
    }
  });
});
