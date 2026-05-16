import { apiClient } from "@/lib/api/apiClient";
import type { Sektor } from "@/lib/types/common";
import { COMPARISON_PARAMETERS } from "../lib/parameters";
import type { ComparisonReportData, ComparisonSection } from "../types";

const DEFAULT_COMPARISON_SECTIONS: ComparisonSection[] = [
  "executive_summary",
  "comparison_table",
  "factsheet",
  "risk_profile",
  "financial_viability",
  "recommendations",
];

function buildExecutiveSummary(data: Pick<ComparisonReportData, "wilayahNames" | "rekomendasiCards">): string {
  const winners = data.rekomendasiCards
    .map((card) => `${card.tujuan}: ${card.winner_nama} (${card.winner_score})`)
    .join("; ");
  return `Komparasi ${data.wilayahNames.join(", ")} menunjukkan prioritas berbeda per mandat investasi. ${winners}. Rekomendasi ini menyatukan skor lokasi, kesiapan pasar, risiko, dan efisiensi harga lahan sebagai bahan rapat komite investasi.`;
}

function buildRecommendations(data: Pick<ComparisonReportData, "rekomendasiCards">): string[] {
  const mapped = data.rekomendasiCards.map((card) => {
    if (card.tujuan === "Agribisnis") {
      return `Prioritaskan due diligence agribisnis di ${card.winner_nama}; validasi offtaker, akses logistik dingin, dan kesiapan lahan sebelum komitmen modal.`;
    }
    if (card.tujuan === "Land Banking") {
      return `Untuk mandat land banking, siapkan negosiasi bertahap di ${card.winner_nama} sebelum momentum infrastruktur menaikkan entry cost.`;
    }
    return `Untuk mandat risk-averse, gunakan ${card.winner_nama} sebagai pembanding konservatif karena kombinasi infrastruktur, kepatuhan zonasi, dan harga lebih seimbang.`;
  });

  return Array.from(new Set([
    ...mapped,
    "Lakukan verifikasi lapangan terhadap status RDTR, akses jalan utama, dan kesiapan utilitas sebelum finalisasi akuisisi.",
    "Gunakan export ini sebagai bahan rapat awal; keputusan final tetap membutuhkan legal, teknis, dan appraisal independen.",
  ]));
}

export async function buildComparisonReport(
  wilayahIds: number[],
  sections: ComparisonSection[] = DEFAULT_COMPARISON_SECTIONS,
  generatedAt = new Date().toISOString(),
  sektor: Sektor = "agribisnis",
): Promise<ComparisonReportData> {
  const compare = await apiClient.decision.compare(wilayahIds);

  const candidates = await Promise.all(
    compare.kandidat.map(async (row) => {
      const [
        locationScore,
        profile,
        zoning,
        marketAccess,
        riskProfile,
        financialViability,
        businessRecommender,
        landBanking,
      ] = await Promise.all([
        apiClient.assessment.getLocationScore(row.wilayah_id, sektor),
        apiClient.territory.getProfile(row.wilayah_id),
        apiClient.territory.getZoning(row.wilayah_id),
        apiClient.territory.getMarketAccess(row.wilayah_id, { includeRoutes: false }),
        apiClient.assessment.getRiskProfile(row.wilayah_id),
        apiClient.assessment.getFinancialViability(row.wilayah_id, sektor),
        apiClient.decision.getBusinessRecommender(row.wilayah_id),
        apiClient.decision.getLandBanking(row.wilayah_id),
      ]);

      return {
        row,
        locationScore,
        factsheet: { profile, zoning, marketAccess },
        riskProfile,
        financialViability,
        businessRecommender,
        landBanking,
      };
    }),
  );

  const partial = {
    wilayahNames: compare.kandidat.map((row) => row.nama),
    rekomendasiCards: compare.rekomendasi,
  };

  return {
    reportType: "comparison",
    title: "Laporan Komparasi Investasi",
    generatedAt,
    userId: "poc-user",
    sections,
    wilayahIds,
    wilayahNames: partial.wilayahNames,
    parameters: COMPARISON_PARAMETERS,
    comparisonRows: compare.kandidat,
    highlights: compare.highlights,
    rekomendasiCards: compare.rekomendasi,
    candidates,
    executiveSummary: buildExecutiveSummary(partial),
    recommendations: buildRecommendations(partial),
  };
}
