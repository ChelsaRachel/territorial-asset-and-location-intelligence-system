import * as XLSX from "xlsx";
import { toBlob } from "@/lib/export/lib/blob";
import type { ComparisonParameter, ComparisonReportData } from "@/lib/export/types";
import { exportTheme, hexForXlsx } from "../../theme";

const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type SheetCell = XLSX.CellObject & { s?: Record<string, unknown> };

const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: hexForXlsx(exportTheme.colors.green900) } },
};

const bestStyle = { fill: { fgColor: { rgb: hexForXlsx(exportTheme.colors.green100) } } };
const worstStyle = { fill: { fgColor: { rgb: hexForXlsx(exportTheme.colors.red100) } } };

function formatCode(parameter: ComparisonParameter): string {
  if (parameter.format === "currency") return '"Rp" #,##0';
  if (parameter.format === "percent") return '+0.0%;-0.0%;0.0%';
  return "0";
}

function styleHeader(ws: XLSX.WorkSheet, columns: number) {
  for (let c = 0; c < columns; c += 1) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    const cell = ws[ref] as SheetCell | undefined;
    if (cell) cell.s = headerStyle;
  }
}

function buildKomparasiSheet(data: ComparisonReportData): XLSX.WorkSheet {
  const headers = ["Wilayah Name", ...data.parameters.map((parameter) => parameter.label)];
  const rows = data.comparisonRows.map((row) => [
    row.nama,
    ...data.parameters.map((parameter) => Number(row[parameter.key])),
  ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: headers.length - 1 } }) };
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  ws["!cols"] = [{ wch: 22 }, ...data.parameters.map(() => ({ wch: 18 }))];
  styleHeader(ws, headers.length);

  data.comparisonRows.forEach((row, rowIdx) => {
    data.parameters.forEach((parameter, paramIdx) => {
      const ref = XLSX.utils.encode_cell({ r: rowIdx + 1, c: paramIdx + 1 });
      const cell = ws[ref] as SheetCell | undefined;
      if (!cell) return;
      cell.z = formatCode(parameter);
      if (parameter.format === "percent") cell.v = Number(cell.v) / 100;
      if (data.highlights.best[parameter.key] === row.wilayah_id) cell.s = bestStyle;
      if (data.highlights.worst[parameter.key] === row.wilayah_id) cell.s = worstStyle;
    });
  });

  return ws;
}

function buildSkorWilayahSheet(data: ComparisonReportData): XLSX.WorkSheet {
  const indicatorRows: Array<[string, (candidate: ComparisonReportData["candidates"][number]) => number | string]> = [
    ["Kesesuaian Lahan (A.1)", (candidate) => candidate.row.A1],
    ["Indeks Infrastruktur (A.2)", (candidate) => candidate.row.A2],
    ["Kepatuhan Zonasi (A.3)", (candidate) => candidate.row.A3],
    ["Akses Pasar (A.4)", (candidate) => candidate.row.A4],
    ["Serapan Permintaan (A.6)", (candidate) => candidate.row.A6],
    ["Dinamika Harga (A.7)", (candidate) => candidate.row.A7],
    ["Proyeksi Pertumbuhan (A.8)", (candidate) => candidate.row.A8],
    ["Location Score (C.1)", (candidate) => candidate.row.C1],
    ["Harga Lahan Median", (candidate) => candidate.row.harga_lahan],
    ["Apresiasi YoY (%)", (candidate) => candidate.row.apresiasi_yoy_pct],
    ["Risiko Iklim", (candidate) => candidate.riskProfile.scores.iklim],
    ["Risiko Regulasi", (candidate) => candidate.riskProfile.scores.regulasi],
    ["Risiko Infrastruktur", (candidate) => candidate.riskProfile.scores.infrastruktur],
    ["Risiko Sosial", (candidate) => candidate.riskProfile.scores.sosial],
    ["Financial Ratio", (candidate) => candidate.financialViability.ratio],
  ];
  const aoa = [
    ["Indikator", ...data.candidates.map((candidate) => candidate.row.nama)],
    ...indicatorRows.map(([label, getter]) => [label, ...data.candidates.map(getter)]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 28 }, ...data.candidates.map(() => ({ wch: 18 }))];
  styleHeader(ws, data.candidates.length + 1);
  return ws;
}

function buildRekomendasiSheet(data: ComparisonReportData): XLSX.WorkSheet {
  const aoa: Array<Array<string | number>> = [["Tujuan", "Wilayah Pemenang", "Weighted Score", "Rationale"]];
  data.rekomendasiCards.forEach((card) => {
    aoa.push([card.tujuan, card.winner_nama, card.winner_score, card.rationale]);
  });
  aoa.push([]);
  aoa.push(["Tindak Lanjut", "", "", ""]);
  data.recommendations.forEach((item) => aoa.push([item, "", "", ""]));
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 28 }, { wch: 24 }, { wch: 16 }, { wch: 80 }];
  styleHeader(ws, 4);
  return ws;
}

export async function generateComparisonXlsx(data: ComparisonReportData): Promise<Blob> {
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Laporan Komparasi Investasi TALIS",
    Author: data.userId,
    CreatedDate: new Date(data.generatedAt),
  };
  XLSX.utils.book_append_sheet(workbook, buildKomparasiSheet(data), "Komparasi");
  XLSX.utils.book_append_sheet(workbook, buildSkorWilayahSheet(data), "Skor Wilayah");
  XLSX.utils.book_append_sheet(workbook, buildRekomendasiSheet(data), "Rekomendasi");
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
  return toBlob(output, MIME);
}
