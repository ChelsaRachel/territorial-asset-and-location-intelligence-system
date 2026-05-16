import type { ExportFormat } from "../types";

function yyyymmdd(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function extensionForFormat(format: ExportFormat): "pdf" | "pptx" | "xlsx" {
  if (format === "ppt") return "pptx";
  return format;
}

export function comparisonFilename(wilayahNames: string[], format: ExportFormat, date = new Date()): string {
  const slug = slugify(wilayahNames.join("-")).slice(0, 80) || "wilayah";
  return `talis-comparison-${slug}-${yyyymmdd(date)}.${extensionForFormat(format)}`;
}

export function shortlistFilename(format: "pdf", date = new Date()): string {
  return `talis-shortlist-${yyyymmdd(date)}.${format}`;
}

export function accountabilityFilename(wilayahName: string, periodA: string, periodB: string, date = new Date()): string {
  void date;
  const slug = slugify(wilayahName).slice(0, 80) || "wilayah";
  return `talis-laporan-akuntabilitas-${slug}-${periodA}-${periodB}.pdf`;
}

export function formatDateId(dateIso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateIso));
}
