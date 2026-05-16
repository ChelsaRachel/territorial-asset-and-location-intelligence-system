import { log as auditLog } from "@/lib/audit";
import { buildComparisonReport } from "./builders/buildComparisonReport";
import { comparisonFilename } from "./lib/filename";
import { lazyLoadFormatModule } from "./lazyLoadFormatModule";
import type { ComparisonSection, ExportFormat } from "./types";

export interface ExportComparisonInput {
  wilayahIds: number[];
  sections: ComparisonSection[];
}

export async function exportComparison(
  input: ExportComparisonInput,
  format: ExportFormat,
): Promise<{ blob: Blob; filename: string }> {
  const data = await buildComparisonReport(input.wilayahIds, input.sections);
  const generator = await lazyLoadFormatModule("comparison", format);
  const blob = await generator(data);
  auditLog(`export.${format}.comparison`, {
    wilayah_ids: input.wilayahIds,
    sections: input.sections,
    filename_format: format,
  });
  return {
    blob,
    filename: comparisonFilename(data.wilayahNames, format, new Date(data.generatedAt)),
  };
}
