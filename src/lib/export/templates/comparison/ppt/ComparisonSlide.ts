import pptxgen from "pptxgenjs";
import { toBlob } from "@/lib/export/lib/blob";
import { formatPct, formatRpPerM2, truncateText } from "@/lib/export/lib/format";
import type { ComparisonCandidateReport, ComparisonParameter, ComparisonReportData } from "@/lib/export/types";
import { exportTheme } from "../../theme";

const MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

function color(hex: string): string {
  return hex.replace("#", "");
}

function addFooter(slide: pptxgen.Slide, data: ComparisonReportData, slideNo: number) {
  slide.addText(`TALIS PoC - generated ${new Date(data.generatedAt).toLocaleDateString("id-ID")} - ${data.userId}`, {
    x: 0.35,
    y: 7.05,
    w: 9.2,
    h: 0.2,
    fontFace: "Arial",
    fontSize: 7,
    color: color(exportTheme.colors.stone500),
  });
  slide.addText(String(slideNo), {
    x: 12.4,
    y: 7.05,
    w: 0.4,
    h: 0.2,
    align: "right",
    fontFace: "Courier New",
    fontSize: 7,
    color: color(exportTheme.colors.stone500),
  });
}

function formatParam(parameter: ComparisonParameter, value: number): string {
  if (parameter.format === "currency") return formatRpPerM2(value);
  if (parameter.format === "percent") return formatPct(value);
  return Math.round(value).toString();
}

function addCover(pptx: pptxgen, data: ComparisonReportData, slideNo: number) {
  const slide = pptx.addSlide();
  slide.background = { color: color(exportTheme.colors.stone50) };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 1.8, fill: { color: color(exportTheme.colors.green900) }, line: { color: color(exportTheme.colors.green900) } });
  slide.addText("TALIS", { x: 0.6, y: 0.45, w: 1.1, h: 0.5, fontFace: "Arial", fontSize: 16, bold: true, color: "FFFFFF", align: "center" });
  slide.addText(data.title, { x: 1.2, y: 2.25, w: 10.9, h: 0.6, fontFace: "Arial", fontSize: 28, bold: true, color: color(exportTheme.colors.green900), align: "center" });
  slide.addText(data.wilayahNames.join(" / "), { x: 1.5, y: 3.15, w: 10.3, h: 0.5, fontFace: "Arial", fontSize: 16, color: color(exportTheme.colors.stone700), align: "center" });
  slide.addText(new Date(data.generatedAt).toLocaleString("id-ID"), { x: 2.2, y: 4.05, w: 8.8, h: 0.35, fontFace: "Courier New", fontSize: 11, color: color(exportTheme.colors.stone700), align: "center" });
  addFooter(slide, data, slideNo);
}

function addSummary(pptx: pptxgen, data: ComparisonReportData, slideNo: number) {
  const slide = pptx.addSlide();
  slide.addText("Ringkasan", { x: 0.5, y: 0.35, w: 8, h: 0.35, fontSize: 20, bold: true, color: color(exportTheme.colors.green900) });
  data.rekomendasiCards.forEach((card, idx) => {
    const x = 0.55 + idx * 4.15;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.15, w: 3.75, h: 2.3, rectRadius: 0.06, fill: { color: "FFFFFF" }, line: { color: color(exportTheme.colors.stone200) } });
    slide.addText(card.tujuan, { x: x + 0.2, y: 1.35, w: 3.35, h: 0.25, fontSize: 11, bold: true, color: color(exportTheme.colors.stone700) });
    slide.addText(card.winner_nama, { x: x + 0.2, y: 1.8, w: 3.35, h: 0.35, fontSize: 18, bold: true, color: color(exportTheme.colors.green900) });
    slide.addText(String(card.winner_score), { x: x + 0.2, y: 2.3, w: 3.35, h: 0.6, fontFace: "Courier New", fontSize: 34, bold: true, color: color(exportTheme.colors.green700) });
  });
  slide.addText(data.executiveSummary, { x: 0.7, y: 4.05, w: 11.8, h: 1.2, fontFace: "Arial", fontSize: 12, color: color(exportTheme.colors.stone700), breakLine: false, fit: "shrink" });
  addFooter(slide, data, slideNo);
}

function addComparisonTable(pptx: pptxgen, data: ComparisonReportData, slideNo: number) {
  const slide = pptx.addSlide();
  slide.addText("Komparasi", { x: 0.5, y: 0.35, w: 8, h: 0.35, fontSize: 20, bold: true, color: color(exportTheme.colors.green900) });
  const startX = 0.45;
  const startY = 1.0;
  const labelW = 3.0;
  const colW = (12.4 - labelW) / Math.max(1, data.comparisonRows.length);
  const rowH = 0.42;
  slide.addShape(pptx.ShapeType.rect, { x: startX, y: startY, w: labelW, h: rowH, fill: { color: color(exportTheme.colors.green900) }, line: { color: "FFFFFF" } });
  slide.addText("Parameter", { x: startX + 0.08, y: startY + 0.09, w: labelW - 0.1, h: 0.18, fontSize: 8, bold: true, color: "FFFFFF" });
  data.comparisonRows.forEach((candidate, cIdx) => {
    const x = startX + labelW + cIdx * colW;
    slide.addShape(pptx.ShapeType.rect, { x, y: startY, w: colW, h: rowH, fill: { color: color(exportTheme.colors.green900) }, line: { color: "FFFFFF" } });
    slide.addText(truncateText(candidate.nama, 14), { x: x + 0.04, y: startY + 0.09, w: colW - 0.08, h: 0.18, fontSize: 8, bold: true, color: "FFFFFF" });
  });
  data.parameters.forEach((parameter, rIdx) => {
    const y = startY + (rIdx + 1) * rowH;
    slide.addShape(pptx.ShapeType.rect, { x: startX, y, w: labelW, h: rowH, fill: { color: color(exportTheme.colors.stone50) }, line: { color: color(exportTheme.colors.stone200) } });
    slide.addText(parameter.label, { x: startX + 0.08, y: y + 0.09, w: labelW - 0.1, h: 0.18, fontSize: 7.5, color: color(exportTheme.colors.stone900) });
    data.comparisonRows.forEach((candidate, cIdx) => {
      const x = startX + labelW + cIdx * colW;
      const isBest = data.highlights.best[parameter.key] === candidate.wilayah_id;
      const isWorst = data.highlights.worst[parameter.key] === candidate.wilayah_id;
      const fill = isBest ? exportTheme.colors.green100 : isWorst ? exportTheme.colors.red100 : exportTheme.colors.white;
      slide.addShape(pptx.ShapeType.rect, { x, y, w: colW, h: rowH, fill: { color: color(fill) }, line: { color: color(exportTheme.colors.stone200) } });
      slide.addText(formatParam(parameter, Number(candidate[parameter.key])), { x: x + 0.04, y: y + 0.09, w: colW - 0.08, h: 0.18, fontFace: "Courier New", fontSize: 7.5, color: color(exportTheme.colors.stone900), align: "right" });
    });
  });
  addFooter(slide, data, slideNo);
}

function addWilayahSlide(pptx: pptxgen, data: ComparisonReportData, candidate: ComparisonCandidateReport, slideNo: number) {
  const slide = pptx.addSlide();
  slide.addText(`Profil Wilayah - ${candidate.row.nama}`, { x: 0.5, y: 0.35, w: 8, h: 0.35, fontSize: 20, bold: true, color: color(exportTheme.colors.green900) });
  const kpis = [
    ["Infrastructure", candidate.row.A2],
    ["Zoning", candidate.row.A3],
    ["Market Access", candidate.row.A4],
    ["C.1", candidate.row.C1],
  ] as const;
  kpis.forEach(([label, value], idx) => {
    const x = 0.55 + idx * 3.1;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.05, w: 2.75, h: 1.0, rectRadius: 0.04, fill: { color: "FFFFFF" }, line: { color: color(exportTheme.colors.stone200) } });
    slide.addText(label, { x: x + 0.15, y: 1.22, w: 2.45, h: 0.2, fontSize: 8, color: color(exportTheme.colors.stone700) });
    slide.addText(String(value), { x: x + 0.15, y: 1.48, w: 2.45, h: 0.36, fontFace: "Courier New", fontSize: 20, bold: true, color: color(exportTheme.colors.green700) });
  });
  slide.addText("Profil Risiko", { x: 0.65, y: 2.55, w: 5.0, h: 0.25, fontSize: 13, bold: true, color: color(exportTheme.colors.stone900) });
  Object.entries(candidate.riskProfile.scores).forEach(([key, value], idx) => {
    slide.addText(`${key}: ${value}`, { x: 0.8, y: 2.95 + idx * 0.38, w: 4.2, h: 0.2, fontFace: "Courier New", fontSize: 10, color: color(exportTheme.colors.stone700) });
  });
  slide.addText("Kelayakan Finansial", { x: 6.8, y: 2.55, w: 5.0, h: 0.25, fontSize: 13, bold: true, color: color(exportTheme.colors.stone900) });
  slide.addText(`${candidate.financialViability.ratio.toFixed(2)}x`, { x: 7.0, y: 2.95, w: 2.4, h: 0.5, fontFace: "Courier New", fontSize: 28, bold: true, color: color(exportTheme.colors.green700) });
  const bullets = candidate.businessRecommender.recommendations.slice(0, 3).map((item) => item.aksi ?? item.alasan_timing);
  bullets.forEach((item, idx) => {
    slide.addText(`- ${truncateText(item, 90)}`, { x: 7.0, y: 3.6 + idx * 0.44, w: 5.4, h: 0.25, fontSize: 9, color: color(exportTheme.colors.stone700), fit: "shrink" });
  });
  addFooter(slide, data, slideNo);
}

function addClosing(pptx: pptxgen, data: ComparisonReportData, slideNo: number) {
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.9, fill: { color: color(exportTheme.colors.green900) }, line: { color: color(exportTheme.colors.green900) } });
  slide.addText("Rekomendasi", { x: 0.55, y: 0.25, w: 8, h: 0.3, fontSize: 18, bold: true, color: "FFFFFF" });
  data.recommendations.forEach((item, idx) => {
    slide.addText(`- ${item}`, { x: 0.8, y: 1.35 + idx * 0.55, w: 11.6, h: 0.3, fontSize: 11, color: color(exportTheme.colors.stone700), fit: "shrink" });
  });
  slide.addText("Peta interaktif tersedia di aplikasi web.", { x: 0.8, y: 6.2, w: 11.6, h: 0.25, fontSize: 9, italic: true, color: color(exportTheme.colors.stone500) });
  addFooter(slide, data, slideNo);
}

export async function generateComparisonPpt(data: ComparisonReportData): Promise<Blob> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = data.userId;
  pptx.subject = data.title;
  pptx.title = data.title;
  let slideNo = 1;
  addCover(pptx, data, slideNo++);
  addSummary(pptx, data, slideNo++);
  addComparisonTable(pptx, data, slideNo++);
  data.candidates.forEach((candidate) => addWilayahSlide(pptx, data, candidate, slideNo++));
  addClosing(pptx, data, slideNo++);
  const output = await pptx.write({ outputType: "arraybuffer" });
  return toBlob(output as ArrayBuffer, MIME);
}
