import { ApiError } from "@/lib/api/common/ApiError";
import type {
  AccountabilityReportData,
  ComparisonReportData,
  ExportFormat,
  ExportGenerator,
  ShortlistReportData,
} from "./types";

export type ExportReportType = "comparison" | "shortlist" | "accountability";

type GeneratorByReport<T extends ExportReportType> =
  T extends "comparison" ? ExportGenerator<ComparisonReportData> :
  T extends "shortlist" ? ExportGenerator<ShortlistReportData> :
  ExportGenerator<AccountabilityReportData>;

export async function lazyLoadFormatModule<T extends ExportReportType>(
  reportType: T,
  format: ExportFormat,
): Promise<GeneratorByReport<T>> {
  if (reportType === "comparison" && format === "pdf") {
    const mod = await import("./templates/comparison/pdf");
    return mod.generateComparisonPdf as GeneratorByReport<T>;
  }
  if (reportType === "comparison" && format === "ppt") {
    const mod = await import("./templates/comparison/ppt");
    return mod.generateComparisonPpt as GeneratorByReport<T>;
  }
  if (reportType === "comparison" && format === "xlsx") {
    const mod = await import("./templates/comparison/xlsx");
    return mod.generateComparisonXlsx as GeneratorByReport<T>;
  }
  if (reportType === "shortlist" && format === "pdf") {
    const mod = await import("./templates/shortlist/pdf");
    return mod.generateShortlistPdf as GeneratorByReport<T>;
  }
  if (reportType === "accountability" && format === "pdf") {
    const mod = await import("./templates/accountability/pdf");
    return mod.generateAccountabilityPdf as GeneratorByReport<T>;
  }

  throw new ApiError(
    "NOT_FOUND",
    "src/lib/export/lazyLoadFormatModule",
    `${reportType} export does not support ${format} in this PoC`,
  );
}
