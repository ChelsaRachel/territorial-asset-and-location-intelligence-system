import { log as auditLog } from "@/lib/audit";
import { ApiError } from "@/lib/api/common/ApiError";
import { buildShortlistReport } from "./builders/buildShortlistReport";
import { shortlistFilename } from "./lib/filename";
import { lazyLoadFormatModule } from "./lazyLoadFormatModule";
import type { ExportFormat, ShortlistSection } from "./types";

export interface ExportShortlistInput {
  shortlistIds: string[];
  sections: ShortlistSection[];
}

export async function exportShortlist(
  input: ExportShortlistInput,
  format: ExportFormat,
): Promise<{ blob: Blob; filename: string }> {
  if (format !== "pdf") {
    throw new ApiError("NOT_FOUND", "src/lib/export/exportShortlist", "Shortlist export supports PDF only in this PoC");
  }
  const data = await buildShortlistReport(input.shortlistIds, input.sections);
  if (data.entries.length === 0) {
    throw new ApiError("NOT_FOUND", "src/lib/export/exportShortlist", "Cannot export an empty shortlist");
  }
  const generator = await lazyLoadFormatModule("shortlist", format);
  const blob = await generator(data);
  auditLog("export.pdf.shortlist", {
    shortlist_ids: input.shortlistIds,
    sections: input.sections,
  });
  return {
    blob,
    filename: shortlistFilename("pdf", new Date(data.generatedAt)),
  };
}
