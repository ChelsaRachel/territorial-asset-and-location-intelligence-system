import type { LocationScoreFixture, RiskProfileFixture, FinancialViabilityFixture } from "@/lib/api/assessment/assessmentFixtures";
import type { WilayahBusinessRecommenderResult } from "@/lib/api/decision/getBusinessRecommender";
import type { WilayahLandBankingResult } from "@/lib/api/decision/getLandBanking";
import type { ShortlistItem } from "@/lib/api/decision/getShortlist";
import type { RekomendasiCard, HighlightMap, WilayahComparisonRow } from "@/lib/decision/compare";
import type { AttributionRow, IndicatorDeltaRow } from "@/lib/governance";
import type { BenchmarkMapping, MonthlySnapshotRow, PolicyLogItem } from "@/lib/types/monitoring";
import type { TerritoryMarketAccess, TerritoryProfile, TerritoryZoning } from "@/lib/types/territory";

export type ExportFormat = "pdf" | "ppt" | "xlsx";
export type PdfOnlyFormat = "pdf";

export type ComparisonSection =
  | "executive_summary"
  | "comparison_table"
  | "factsheet"
  | "risk_profile"
  | "financial_viability"
  | "recommendations";

export type ShortlistSection =
  | "entries"
  | "delta_indicators"
  | "notes"
  | "notifications"
  | "summary";

export interface AuditEntry {
  user_id: "poc-user";
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface ComparisonParameter {
  key: keyof Pick<
    WilayahComparisonRow,
    "A1" | "A2" | "A3" | "A4" | "A6" | "A7" | "A8" | "C1" | "harga_lahan" | "apresiasi_yoy_pct"
  >;
  label: string;
  shortLabel: string;
  format: "score" | "currency" | "percent";
  bestIsLowest?: boolean;
}

export interface ComparisonFactsheet {
  profile: TerritoryProfile;
  zoning: TerritoryZoning;
  marketAccess: TerritoryMarketAccess;
}

export interface ComparisonCandidateReport {
  row: WilayahComparisonRow;
  locationScore: LocationScoreFixture;
  factsheet: ComparisonFactsheet;
  riskProfile: RiskProfileFixture;
  financialViability: FinancialViabilityFixture;
  businessRecommender: WilayahBusinessRecommenderResult;
  landBanking: WilayahLandBankingResult;
}

export interface ComparisonReportData {
  reportType: "comparison";
  title: "Laporan Komparasi Investasi";
  generatedAt: string;
  userId: "poc-user";
  sections: ComparisonSection[];
  wilayahIds: number[];
  wilayahNames: string[];
  parameters: ComparisonParameter[];
  comparisonRows: WilayahComparisonRow[];
  highlights: HighlightMap;
  rekomendasiCards: RekomendasiCard[];
  candidates: ComparisonCandidateReport[];
  executiveSummary: string;
  recommendations: string[];
}

export type ShortlistDeltaSeverity = "NONE" | "HIGH" | "CRITICAL";
export type ShortlistDeltaTrend = "membaik" | "memburuk" | "stabil";

export interface ShortlistSnapshotValues {
  location_score: number;
  harga_lahan_median: number;
  regulatory_flag: string;
  demand_absorption_score: number;
}

export interface ShortlistDeltaIndicatorRow {
  indicator: "location_score" | "harga_lahan_median" | "regulatory_flag" | "demand_absorption_score";
  label: string;
  snapshotValue: number | string;
  currentValue: number | string;
  delta: number | string;
  deltaPct: number | null;
  trend: ShortlistDeltaTrend;
  severity: ShortlistDeltaSeverity;
  thresholdBreached: boolean;
  message: string;
}

export interface ShortlistReportEntry {
  item: ShortlistItem;
  wilayah: {
    id: number;
    nama: string;
    kabupaten: string;
    provinsi: string;
    profil_kode: string;
    profile_slug: string;
  };
  savedAt: string;
  daysSinceSaved: number;
  snapshot: ShortlistSnapshotValues;
  current: ShortlistSnapshotValues;
  deltaRows: ShortlistDeltaIndicatorRow[];
  note: string;
  notifications: Array<{
    severity: Exclude<ShortlistDeltaSeverity, "NONE">;
    message: string;
  }>;
}

export interface ShortlistReportData {
  reportType: "shortlist";
  title: "Laporan Shortlist Investasi";
  generatedAt: string;
  userId: "poc-user";
  sections: ShortlistSection[];
  entries: ShortlistReportEntry[];
  summary: {
    totalEntries: number;
    notificationCount: number;
    narrative: string;
  };
}

export interface AccountabilityPolicyReport {
  policy: PolicyLogItem;
  attributionRows: AttributionRow[];
}

export interface AccountabilityBenchmarkReport {
  mapping: BenchmarkMapping;
  activeNow: MonthlySnapshotRow;
  referenceNow: MonthlySnapshotRow | null;
}

export interface AccountabilityReportData {
  reportType: "accountability";
  title: "Laporan Akuntabilitas Wilayah";
  generatedAt: string;
  userId: "poc-user";
  wilayahId: number;
  wilayahName: string;
  periodAInput: string;
  periodBInput: string;
  periodAResolved: string;
  periodBResolved: string;
  beforeSnapshot: MonthlySnapshotRow;
  afterSnapshot: MonthlySnapshotRow;
  deltaRows: IndicatorDeltaRow[];
  policiesInPeriod: AccountabilityPolicyReport[];
  benchmark: AccountabilityBenchmarkReport | null;
  recommendations: string[];
  executiveSummary: string;
  heuristicDisclaimer: string;
}

export type ExportGenerator<T> = (data: T) => Promise<Blob>;
