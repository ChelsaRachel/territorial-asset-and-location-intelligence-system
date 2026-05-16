import { apiClient } from "@/lib/api/apiClient";
import { computeAttribution, computeSnapshotDelta, type PolicyEntry } from "@/lib/governance";
import { recommendNextPolicies } from "@/features/monitoring/lib/recommendNextPolicies";
import type { MonthlySnapshotRow, PolicyLogItem } from "@/lib/types/monitoring";
import type { AccountabilityReportData } from "../types";

export const ACCOUNTABILITY_HEURISTIC_DISCLAIMER =
  "Estimasi heuristik berbasis korelasi delta indikator dengan tanggal kebijakan — bukan model kausal.";

function normalizePeriod(period: string): string {
  return period.length === 7 ? `${period}-01` : period;
}

function toMonth(period: string): string {
  return period.slice(0, 7);
}

function nearestSnapshot(snapshots: MonthlySnapshotRow[], input: string): MonthlySnapshotRow {
  const target = new Date(`${normalizePeriod(input)}T00:00:00Z`).getTime();
  return snapshots.reduce((nearest, snapshot) => {
    const nearestDistance = Math.abs(new Date(`${nearest.snapshot_date}T00:00:00Z`).getTime() - target);
    const candidateDistance = Math.abs(new Date(`${snapshot.snapshot_date}T00:00:00Z`).getTime() - target);
    return candidateDistance < nearestDistance ? snapshot : nearest;
  }, snapshots[0]!);
}

function isPolicyInWindow(policy: PolicyLogItem, periodA: string, periodB: string): boolean {
  const month = toMonth(policy.policy_date);
  return month >= toMonth(periodA) && month <= toMonth(periodB);
}

function asPolicyEntry(policy: PolicyLogItem): PolicyEntry {
  return {
    id: policy.id,
    wilayah_id: policy.wilayah_id,
    policy_date: policy.policy_date,
    title: policy.title,
    tags: policy.tags,
    created_by: policy.created_by,
  };
}

function buildExecutiveSummary(
  wilayahName: string,
  deltaRows: ReturnType<typeof computeSnapshotDelta>,
  policiesCount: number,
): string {
  const numericRows = deltaRows.filter((row) => typeof row.delta_absolute === "number");
  const mostImproved = numericRows
    .filter((row) => (row.delta_absolute ?? 0) > 0)
    .sort((a, b) => (b.delta_absolute ?? 0) - (a.delta_absolute ?? 0))[0];
  const regressions = numericRows.filter((row) => (row.delta_absolute ?? 0) < 0);
  const regressionCopy = regressions.length > 0
    ? ` Terdapat ${regressions.length} indikator yang menurun dan perlu tindak lanjut.`
    : " Tidak ada regresi numerik signifikan pada indikator utama.";
  return `Laporan ini merangkum perubahan indikator ${wilayahName}, ${policiesCount} catatan kebijakan dalam periode, dan atribusi heuristik terhadap perubahan indikator. Indikator yang paling membaik adalah ${mostImproved?.indicator_label ?? "indikator utama"} dengan delta ${mostImproved?.delta_absolute ?? 0}.${regressionCopy}`;
}

export async function buildAccountabilityReport(
  wilayahId: number,
  periodA: string,
  periodB: string,
  generatedAt = new Date().toISOString(),
): Promise<AccountabilityReportData> {
  const [snapshots, policies, benchmarkMappings, profiles] = await Promise.all([
    apiClient.monitoring.getMonthlySnapshots(wilayahId),
    apiClient.monitoring.getPolicyLog(wilayahId),
    apiClient.monitoring.getBenchmark(wilayahId),
    apiClient.discovery.getProfiles(),
  ]);

  const beforeSnapshot = nearestSnapshot(snapshots, periodA);
  const afterSnapshot = nearestSnapshot(snapshots, periodB);
  const resolvedA = beforeSnapshot.snapshot_date;
  const resolvedB = afterSnapshot.snapshot_date;
  const deltaRows = computeSnapshotDelta(beforeSnapshot, afterSnapshot);
  const policiesInPeriod = policies
    .filter((policy) => isPolicyInWindow(policy, resolvedA, resolvedB))
    .sort((a, b) => a.policy_date.localeCompare(b.policy_date));

  const policyReports = policiesInPeriod.map((policy) => {
    const policyMonth = toMonth(policy.policy_date);
    const before = snapshots.filter((snapshot) => toMonth(snapshot.snapshot_date) >= toMonth(resolvedA) && toMonth(snapshot.snapshot_date) <= policyMonth);
    const after = snapshots.filter((snapshot) => toMonth(snapshot.snapshot_date) >= policyMonth && toMonth(snapshot.snapshot_date) <= toMonth(resolvedB));
    const computed = computeAttribution(
      asPolicyEntry(policy),
      before,
      after,
      policiesInPeriod.map(asPolicyEntry),
    );
    return {
      policy,
      attributionRows: computed.length > 0 ? computed : policy.attribution.map((row) => ({
        indicator_id: row.indicator_id,
        indicator_label: row.indicator_label,
        delta_value: row.delta_value,
        estimated_attribution_pct: row.estimated_attribution_pct,
        confidence: row.confidence,
      })),
    };
  });

  const mapping = benchmarkMappings[0] ?? null;
  let benchmark: AccountabilityReportData["benchmark"] = null;
  if (mapping) {
    let referenceNow: MonthlySnapshotRow | null = null;
    try {
      const referenceSnapshots = await apiClient.monitoring.getMonthlySnapshots(mapping.wilayah_referensi_id);
      referenceNow = referenceSnapshots[referenceSnapshots.length - 1] ?? null;
    } catch {
      referenceNow = null;
    }
    benchmark = {
      mapping,
      activeNow: afterSnapshot,
      referenceNow,
    };
  }

  const wilayahName = profiles.profiles.find((profile) => profile.wilayah_id === wilayahId)?.nama ?? `Wilayah ${wilayahId}`;
  const recommendations = recommendNextPolicies(deltaRows, policiesInPeriod.map(asPolicyEntry));
  const fallbackRecommendations = [
    "Perkuat paket kebijakan lintas dinas untuk indikator yang belum bergerak signifikan.",
    "Jadikan hasil benchmark sebagai dasar prioritas RKPD dan pembahasan APBD berikutnya.",
    "Pastikan setiap intervensi baru memiliki baseline indikator dan jadwal evaluasi bulanan.",
  ];

  return {
    reportType: "accountability",
    title: "Laporan Akuntabilitas Wilayah",
    generatedAt,
    userId: "poc-user",
    wilayahId,
    wilayahName,
    periodAInput: periodA,
    periodBInput: periodB,
    periodAResolved: resolvedA,
    periodBResolved: resolvedB,
    beforeSnapshot,
    afterSnapshot,
    deltaRows,
    policiesInPeriod: policyReports,
    benchmark,
    recommendations: recommendations.length > 0 ? recommendations : fallbackRecommendations,
    executiveSummary: buildExecutiveSummary(wilayahName, deltaRows, policiesInPeriod.length),
    heuristicDisclaimer: ACCOUNTABILITY_HEURISTIC_DISCLAIMER,
  };
}
