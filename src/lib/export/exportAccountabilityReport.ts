import { log as auditLog } from "@/lib/audit";
import { buildAccountabilityReport } from "./builders/buildAccountabilityReport";
import { accountabilityFilename } from "./lib/filename";
import { lazyLoadFormatModule } from "./lazyLoadFormatModule";

export interface ExportAccountabilityReportInput {
  wilayahId: number;
  periodA: string;
  periodB: string;
}

export async function exportAccountabilityReport(
  input: ExportAccountabilityReportInput,
  format: "pdf",
): Promise<{ blob: Blob; filename: string }> {
  const data = await buildAccountabilityReport(input.wilayahId, input.periodA, input.periodB);
  const generator = await lazyLoadFormatModule("accountability", format);
  const blob = await generator(data);
  auditLog("export.pdf.accountability", {
    wilayah_id: input.wilayahId,
    period_a: input.periodA,
    period_b: input.periodB,
  });
  return {
    blob,
    filename: accountabilityFilename(data.wilayahName, data.periodAResolved.slice(0, 7), data.periodBResolved.slice(0, 7), new Date(data.generatedAt)),
  };
}
