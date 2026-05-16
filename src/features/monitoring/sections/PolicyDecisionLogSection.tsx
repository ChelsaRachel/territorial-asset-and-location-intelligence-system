"use client";
// SPRINT-07 TASK-009/TASK-010 — B.5 Policy Decision Log and Add Policy Note modal.

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { SectionInfo, LoadingSkeleton, EmptyState, ErrorState, DataTimestamp, TooltipWrapper } from "@/components/ui";
import { ExportButton } from "@/components/export/ExportButton";
import { ExportModalLazy } from "@/components/export/ExportModalLazy";
import type { ExportModalConfig } from "@/components/export/ExportModal";
import { PolicyTimelineLazy, type PolicyMarker } from "@/components/charts/PolicyTimelineLazy";
import { apiClient } from "@/lib/api/apiClient";
import type { MonthlySnapshotRow, PolicyLogItem, PolicyAttributionRow } from "@/lib/types/monitoring";
import { computeAttribution, computeSnapshotDelta, type IndicatorDeltaRow, type PolicyEntry } from "@/lib/governance";
import { formatPct, formatRpPerM2, formatScore } from "@/lib/format/number";
import { useMonitoringPeriods } from "@/lib/store/useMonitoring";
import { AddPolicyNoteModal } from "../components/AddPolicyNoteModal";
import { formatIsoMonth, isDateWithinMonthWindow, monthStart, toIsoMonth } from "../lib/monthFormat";
import { recommendNextPolicies } from "../lib/recommendNextPolicies";

interface PolicyDecisionLogSectionProps {
  wilayahId: number | null;
}

type SectionState =
  | { status: "idle" | "loading"; snapshots: MonthlySnapshotRow[]; policies: PolicyLogItem[]; error: null }
  | { status: "success"; snapshots: MonthlySnapshotRow[]; policies: PolicyLogItem[]; error: null }
  | { status: "error"; snapshots: MonthlySnapshotRow[]; policies: PolicyLogItem[]; error: string };

const ATTRIBUTION_DISCLAIMER =
  "Estimasi heuristik berbasis korelasi delta indikator dengan tanggal kebijakan — bukan model kausal.";

const TAG_CLASS: Record<string, string> = {
  infrastruktur: "border-blue-500",
  demand: "border-talis-green-700",
  regulasi: "border-amber-600",
  alert_response: "border-purple-600",
  kapasitas: "border-talis-stone-500",
  lainnya: "border-talis-stone-400",
};

const DELTA_ROW_IDS = new Set([
  "location_score",
  "infrastructure_index",
  "market_access",
  "harga_lahan_median",
  "demand_score",
  "ndvi_score",
  "growth_score",
  "zoning_compliance",
  "regulatory_flag",
]);

function formatCell(row: IndicatorDeltaRow, value: number | string): string {
  if (row.indicator_id === "harga_lahan_median" && typeof value === "number") return formatRpPerM2(value);
  if (row.indicator_id === "ndvi_score" && typeof value === "number") return value.toFixed(3);
  if (typeof value === "number") return formatScore(value);
  return value;
}

function formatDelta(row: IndicatorDeltaRow): string {
  if (row.is_categorical_change) return row.direction === "stabil" ? "Stabil" : `Berubah ke ${row.after_value}`;
  if (row.indicator_id === "harga_lahan_median") return row.delta_pct === null ? "—" : `▲ ${formatPct(row.delta_pct, 0)}`;
  if (row.delta_absolute === null) return "—";
  if (row.delta_absolute === 0) return "→ 0";
  return `${row.delta_absolute > 0 ? "▲ +" : "▼ "}${row.delta_absolute}`;
}

function confidenceClass(confidence: PolicyAttributionRow["confidence"]) {
  if (confidence === "tinggi") return "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30";
  if (confidence === "sedang") return "bg-amber-50 text-amber-700 border-amber-300";
  return "bg-talis-stone-100 text-talis-stone-700 border-talis-stone-300";
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

function attributionRowsForPolicy(
  policy: PolicyLogItem,
  snapshots: MonthlySnapshotRow[],
  policiesInPeriod: PolicyLogItem[],
  periodA: string,
  periodB: string,
): PolicyAttributionRow[] {
  if (policy.attribution_status === "pending_compute_in_12_months" || policy.status === "pending_compute_in_12_months") {
    return [];
  }
  if (policy.attribution.length > 0) return policy.attribution;

  const policyMonth = toIsoMonth(policy.policy_date);
  const before = snapshots.filter((snapshot) => toIsoMonth(snapshot.snapshot_date) >= periodA && toIsoMonth(snapshot.snapshot_date) <= policyMonth);
  const after = snapshots.filter((snapshot) => toIsoMonth(snapshot.snapshot_date) >= policyMonth && toIsoMonth(snapshot.snapshot_date) <= periodB);
  return computeAttribution(
    asPolicyEntry(policy),
    before,
    after,
    policiesInPeriod.map(asPolicyEntry),
  ).map((row) => ({
    ...row,
    rationale: ATTRIBUTION_DISCLAIMER,
  }));
}

function DeltaComparisonTable({ rows }: { rows: IndicatorDeltaRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-talis-stone-200">
      <table className="w-full text-sm">
        <thead className="bg-talis-stone-50">
          <tr>
            <th className="px-3 py-2 text-left font-sans text-xs uppercase tracking-wide text-talis-stone-600">Indikator</th>
            <th className="px-3 py-2 text-right font-sans text-xs uppercase tracking-wide text-talis-stone-600">Sebelum</th>
            <th className="px-3 py-2 text-right font-sans text-xs uppercase tracking-wide text-talis-stone-600">Sesudah</th>
            <th className="px-3 py-2 text-right font-sans text-xs uppercase tracking-wide text-talis-stone-600">Delta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-talis-stone-100">
          {rows.map((row) => {
            const deltaTone =
              row.indicator_id === "harga_lahan_median"
                ? "text-talis-stone-700"
                : row.direction === "naik"
                  ? "text-talis-green-700"
                  : row.direction === "turun"
                    ? "text-talis-red-700"
                    : "text-talis-stone-700";
            return (
              <tr key={row.indicator_id}>
                <td className="px-3 py-2 font-sans text-talis-stone-800">{row.indicator_label}</td>
                <td className="px-3 py-2 text-right font-mono text-talis-stone-700">{formatCell(row, row.before_value)}</td>
                <td className="px-3 py-2 text-right font-mono text-talis-stone-900">{formatCell(row, row.after_value)}</td>
                <td className={`px-3 py-2 text-right font-mono font-semibold ${deltaTone}`}>{formatDelta(row)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-talis-stone-100 bg-talis-stone-50 px-3 py-2 font-sans text-xs text-talis-stone-600">
        Kenaikan median harga lahan bersifat ambigu: positif bagi pemilik lahan, tetapi dapat menaikkan entry cost investor.
      </p>
    </div>
  );
}

function PolicyCard({
  policy,
  attributionRows,
}: {
  policy: PolicyLogItem;
  attributionRows: PolicyAttributionRow[];
}) {
  const primaryTag = policy.tags[0] ?? "lainnya";
  const pending = policy.attribution_status === "pending_compute_in_12_months" || policy.status === "pending_compute_in_12_months";

  return (
    <article id={`policy-${policy.id}`} className={`rounded-lg border border-l-4 border-talis-stone-200 bg-white p-4 ${TAG_CLASS[primaryTag] ?? TAG_CLASS.lainnya}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-sans text-sm font-semibold leading-snug text-talis-stone-900">{policy.title}</h3>
          <p className="font-mono text-xs text-talis-stone-600">{policy.policy_date}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {policy.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-talis-stone-100 px-2 py-0.5 font-sans text-xs text-talis-stone-700">
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-4 font-sans text-sm leading-relaxed text-talis-stone-700">{policy.deskripsi}</p>

      {pending ? (
        <TooltipWrapper content="Estimasi attribution akan tersedia 12 bulan setelah implementasi.">
          <span className="mt-3 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 font-sans text-xs font-semibold text-amber-700">
            Pending compute
          </span>
        </TooltipWrapper>
      ) : attributionRows.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded border border-talis-stone-200">
          <table className="w-full text-xs">
            <thead className="bg-talis-stone-50">
              <tr>
                <th className="px-2 py-1.5 text-left font-sans text-talis-stone-600">Indikator</th>
                <th className="px-2 py-1.5 text-right font-sans text-talis-stone-600">Delta</th>
                <th className="px-2 py-1.5 text-right font-sans text-talis-stone-600">Atribusi</th>
                <th className="px-2 py-1.5 text-right font-sans text-talis-stone-600">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-talis-stone-100">
              {attributionRows.map((row) => (
                <tr key={`${policy.id}-${row.indicator_id}`}>
                  <td className="px-2 py-1.5 font-sans text-talis-stone-700">
                    <TooltipWrapper content={ATTRIBUTION_DISCLAIMER}>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">{row.indicator_label}</span>
                    </TooltipWrapper>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-talis-stone-900">+{row.delta_value}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-talis-stone-900">{row.estimated_attribution_pct}%</td>
                  <td className="px-2 py-1.5 text-right">
                    <span className={`rounded-full border px-2 py-0.5 font-sans text-[11px] ${confidenceClass(row.confidence)}`}>
                      {row.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 font-sans text-xs text-talis-stone-600">Belum ada atribusi indikator signifikan untuk kebijakan ini.</p>
      )}
    </article>
  );
}

export function PolicyDecisionLogSection({ wilayahId }: PolicyDecisionLogSectionProps) {
  const [state, setState] = useState<SectionState>({ status: "idle", snapshots: [], policies: [], error: null });
  const [showAddModal, setShowAddModal] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportModalConfig | null>(null);
  const { policyPeriodA, policyPeriodB, setPolicyPeriodA, setPolicyPeriodB } = useMonitoringPeriods();

  useEffect(() => {
    if (!wilayahId) return;
    let cancelled = false;
    setState({ status: "loading", snapshots: [], policies: [], error: null });

    async function load() {
      try {
        const [snapshots, policies] = await Promise.all([
          apiClient.monitoring.getMonthlySnapshots(wilayahId!),
          apiClient.monitoring.getPolicyLog(wilayahId!),
        ]);
        if (!cancelled) setState({ status: "success", snapshots, policies, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            snapshots: [],
            policies: [],
            error: err instanceof Error ? err.message : "Catatan kebijakan gagal dimuat.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [wilayahId]);

  const monthOptions = useMemo(
    () => Array.from(new Set(state.snapshots.map((snapshot) => toIsoMonth(snapshot.snapshot_date)))),
    [state.snapshots],
  );
  const firstMonth = monthOptions[0] ?? null;
  const lastMonth = monthOptions[monthOptions.length - 1] ?? null;

  useEffect(() => {
    if (!firstMonth || !lastMonth) return;
    if (!policyPeriodA) setPolicyPeriodA(firstMonth);
    if (!policyPeriodB) setPolicyPeriodB(lastMonth);
  }, [firstMonth, lastMonth, policyPeriodA, policyPeriodB, setPolicyPeriodA, setPolicyPeriodB]);

  const activePeriodA = policyPeriodA ?? firstMonth;
  const activePeriodB = policyPeriodB ?? lastMonth;
  const beforeSnapshot = state.snapshots.find((snapshot) => toIsoMonth(snapshot.snapshot_date) === activePeriodA);
  const afterSnapshot = state.snapshots.find((snapshot) => toIsoMonth(snapshot.snapshot_date) === activePeriodB);
  const deltaRows = beforeSnapshot && afterSnapshot
    ? computeSnapshotDelta(beforeSnapshot, afterSnapshot).filter((row) => DELTA_ROW_IDS.has(row.indicator_id))
    : [];

  const policiesInPeriod = activePeriodA && activePeriodB
    ? state.policies
        .filter((policy) => isDateWithinMonthWindow(policy.policy_date, activePeriodA, activePeriodB))
        .sort((a, b) => a.policy_date.localeCompare(b.policy_date))
    : [];

  const timelinePolicies: PolicyMarker[] = state.policies.map((policy) => ({
    id: policy.id,
    policy_date: policy.policy_date,
    title: policy.title,
    tags: policy.tags,
  }));

  const recommendations = recommendNextPolicies(deltaRows, policiesInPeriod.map(asPolicyEntry));
  const lastRefreshed = state.policies[0]?.last_refreshed_at ?? state.snapshots[state.snapshots.length - 1]?.snapshot_date ?? null;

  return (
    <section className="relative rounded-xl border border-talis-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <SectionInfo
            title="Catatan Kebijakan & Akuntabilitas"
            description="Timeline kebijakan dan perbandingan delta indikator antar periode. Klik dua periode untuk membandingkan."
          />
          {lastRefreshed && <DataTimestamp timestamp={lastRefreshed} className="mt-1 block" />}
        </div>
        <ExportButton
          label="Ekspor"
          disabled={!wilayahId || !activePeriodA || !activePeriodB || state.status !== "success"}
          onClick={() => {
            if (!wilayahId || !activePeriodA || !activePeriodB) return;
            setExportConfig({
              mode: "accountability",
              wilayahId,
              periodA: activePeriodA,
              periodB: activePeriodB,
              title: "Ekspor Catatan Kebijakan & Akuntabilitas",
            });
          }}
        />
      </div>

      {(state.status === "idle" || state.status === "loading") && (
        <div className="mt-4 space-y-3">
          <LoadingSkeleton shape="chart" height="h-20" />
          <div className="flex gap-4">
            <LoadingSkeleton shape="card" className="flex-1" />
            <LoadingSkeleton shape="card" className="flex-1" />
          </div>
          <LoadingSkeleton shape="table-row" count={4} />
        </div>
      )}

      {state.status === "error" && (
        <ErrorState className="mt-4" title="Gagal memuat catatan kebijakan" description={state.error} />
      )}

      {state.status === "success" && firstMonth && lastMonth && activePeriodA && activePeriodB && (
        <div className="mt-5 space-y-5">
          <PolicyTimelineLazy
            snapshotsRange={{ from: firstMonth, to: lastMonth }}
            policies={timelinePolicies}
            selectedPeriodA={activePeriodA}
            selectedPeriodB={activePeriodB}
            onPolicyClick={(policyId) => document.getElementById(`policy-${policyId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
            onPeriodSelect={(periodA, periodB) => {
              setPolicyPeriodA(periodA);
              setPolicyPeriodB(periodB);
            }}
          />

          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
            <label className="block">
              <span className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">Period A</span>
              <select
                value={activePeriodA}
                onChange={(event) => setPolicyPeriodA(event.target.value)}
                className="mt-1 rounded border border-talis-stone-300 bg-white px-3 py-2 font-sans text-sm"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>{formatIsoMonth(month)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">Period B</span>
              <select
                value={activePeriodB}
                onChange={(event) => setPolicyPeriodB(event.target.value)}
                className="mt-1 rounded border border-talis-stone-300 bg-white px-3 py-2 font-sans text-sm"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>{formatIsoMonth(month)}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="rounded bg-talis-stone-900 px-4 py-2 font-sans text-sm font-semibold text-white"
              onClick={() => {
                setPolicyPeriodA(activePeriodA);
                setPolicyPeriodB(activePeriodB);
              }}
            >
              Compare
            </button>
          </div>

          {deltaRows.length > 0 && <DeltaComparisonTable rows={deltaRows} />}

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-talis-stone-900">Kebijakan Tercatat di Periode Ini</h3>
              <span className="font-mono text-xs text-talis-stone-600">
                {formatIsoMonth(activePeriodA)} - {formatIsoMonth(activePeriodB)}
              </span>
            </div>
            {policiesInPeriod.length === 0 ? (
              <EmptyState
                title="Tidak ada kebijakan tercatat untuk periode yang dipilih."
                description="Ubah periode atau tambah catatan kebijakan baru."
              />
            ) : (
              <div className="space-y-3">
                {policiesInPeriod.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    attributionRows={attributionRowsForPolicy(policy, state.snapshots, policiesInPeriod, activePeriodA, activePeriodB)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-talis-stone-200 bg-talis-green-700/5 p-4">
            <h3 className="font-display text-base font-semibold text-talis-stone-900">Rekomendasi Kebijakan Berikutnya</h3>
            <ul className="mt-3 space-y-2">
              {(recommendations.length > 0 ? recommendations : [
                "Percepat cold storage Kabanjahe untuk menjaga serapan hortikultura premium.",
                "Susun zonasi diferensial agrowisata sebelum tekanan investasi pre-tol meningkat.",
                "Perluas MoU koperasi hortikultura ke desa penghasil utama di Berastagi.",
              ]).map((item) => (
                <li key={item} className="flex gap-2 font-sans text-sm text-talis-stone-700">
                  <span aria-hidden="true" className="mt-0.5 text-talis-green-700">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded bg-talis-green-700 px-4 py-2 font-sans text-sm font-semibold text-white hover:bg-talis-green-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Catatan Kebijakan
            </button>
          </div>

          {showAddModal && wilayahId && (
            <AddPolicyNoteModal
              wilayahId={wilayahId}
              snapshotStartDate={monthStart(firstMonth)}
              onClose={() => setShowAddModal(false)}
              onSaved={(item) => {
                setState((current) =>
                  current.status === "success"
                    ? {
                        ...current,
                        policies: [...current.policies, item].sort((a, b) => a.policy_date.localeCompare(b.policy_date)),
                      }
                    : current,
                );
              }}
            />
          )}
        </div>
      )}

      <ExportModalLazy
        open={exportConfig !== null}
        config={exportConfig}
        onClose={() => setExportConfig(null)}
      />
    </section>
  );
}
