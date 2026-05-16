import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExportModal } from "./ExportModal";

const exportComparison = vi.fn();
const exportShortlist = vi.fn();
const exportAccountabilityReport = vi.fn();

vi.mock("@/lib/export", () => ({
  exportComparison: (...args: unknown[]) => exportComparison(...args),
  exportShortlist: (...args: unknown[]) => exportShortlist(...args),
  exportAccountabilityReport: (...args: unknown[]) => exportAccountabilityReport(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ExportModal", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:export");
    URL.revokeObjectURL = vi.fn();
  });

  it("generates a comparison export with selected sections and format", async () => {
    exportComparison.mockResolvedValueOnce({ blob: new Blob(["pdf"]), filename: "comparison.pdf" });
    const onClose = vi.fn();

    render(
      <ExportModal
        open
        config={{ mode: "comparison", wilayahIds: [1206090, 3204170] }}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "PPT" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate Export" }));

    await waitFor(() => expect(exportComparison).toHaveBeenCalled());
    expect(exportComparison).toHaveBeenCalledWith(
      expect.objectContaining({ wilayahIds: [1206090, 3204170] }),
      "ppt",
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("locks shortlist export to PDF", async () => {
    exportShortlist.mockResolvedValueOnce({ blob: new Blob(["pdf"]), filename: "shortlist.pdf" });

    render(
      <ExportModal
        open
        config={{ mode: "shortlist", shortlistIds: ["shortlist-1"] }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "PPT" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Generate Export" }));

    await waitFor(() => expect(exportShortlist).toHaveBeenCalled());
    expect(exportShortlist).toHaveBeenCalledWith(
      expect.objectContaining({ shortlistIds: ["shortlist-1"] }),
      "pdf",
    );
  });

  it("locks accountability export to PDF", async () => {
    exportAccountabilityReport.mockResolvedValueOnce({
      blob: new Blob(["pdf"]),
      filename: "accountability.pdf",
    });

    render(
      <ExportModal
        open
        config={{ mode: "accountability", wilayahId: 1206090, periodA: "2025-01", periodB: "2025-12" }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "XLSX" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Generate Export" }));

    await waitFor(() => expect(exportAccountabilityReport).toHaveBeenCalledWith(
      { wilayahId: 1206090, periodA: "2025-01", periodB: "2025-12" },
      "pdf",
    ));
  });
});
