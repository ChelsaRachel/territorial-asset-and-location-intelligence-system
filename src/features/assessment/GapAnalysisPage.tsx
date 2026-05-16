"use client";

import { useCallback, useState } from "react";
import { useActiveProfile, useHydrationStatus } from "@/lib/store/useActiveProfile";
import { apiClient } from "@/lib/api/apiClient";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui";
import { isNotFoundError, errorDescription } from "./lib/assessmentFormat";
import { useAssessmentSectionData } from "./hooks/useAssessmentSectionData";
import { useGapSort, useAssessmentActions } from "@/lib/store/useAssessment";
import type { GapAnalysisRow } from "@/lib/api/assessment/assessmentFixtures";
import type { GapSortColumn } from "@/lib/store/assessment";

const COLUMN_LABELS: Record<GapSortColumn, string> = {
  rank_provinsi: "Rank",
  priority_score: "Priority Score",
  skor_potensi: "Skor Potensi",
  infrastructure_gap: "Infra Gap",
};

const SORT_COLUMNS: GapSortColumn[] = [
  "rank_provinsi",
  "skor_potensi",
  "infrastructure_gap",
  "priority_score",
];

function sortRows(rows: GapAnalysisRow[], column: GapSortColumn, direction: "asc" | "desc"): GapAnalysisRow[] {
  return [...rows].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    const diff = aVal - bVal;
    return direction === "asc" ? diff : -diff;
  });
}

function GapSubComponent({ row }: { row: GapAnalysisRow }) {
  return (
    <div className="bg-talis-stone-50 px-4 py-3">
      <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
        Sub-Komponen Gap — {row.nama}
      </p>
      <div className="overflow-x-auto rounded border border-talis-stone-200">
        <table className="min-w-full divide-y divide-talis-stone-200">
          <thead>
            <tr className="bg-white">
              <th className="px-3 py-2 text-left font-sans text-xs font-medium text-talis-stone-700">
                Komponen
              </th>
              <th className="px-3 py-2 text-right font-sans text-xs font-medium text-talis-stone-700">
                Saat ini
              </th>
              <th className="px-3 py-2 text-right font-sans text-xs font-medium text-talis-stone-700">
                Target
              </th>
              <th className="px-3 py-2 text-right font-sans text-xs font-medium text-talis-stone-700">
                Gap
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-talis-stone-200 bg-white">
            {row.detail_gap
              .slice()
              .sort((a, b) => a.prioritas - b.prioritas)
              .map((g) => (
                <tr key={g.nama} className="hover:bg-talis-stone-50">
                  <td className="px-3 py-2">
                    <p className="font-sans text-xs font-medium text-talis-stone-900">{g.nama}</p>
                    <p className="font-sans text-[10px] text-talis-stone-700">{g.unit}</p>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-talis-stone-900">
                    {g.current_pct}%
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-talis-stone-700">
                    {g.target_pct}%
                  </td>
                  <td className={`px-3 py-2 text-right font-mono text-xs font-semibold ${g.gap < -20 ? "text-talis-red-700" : g.gap < -10 ? "text-talis-earth-700" : "text-talis-green-700"}`}>
                    {g.gap}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GapAnalysisPage() {
  const activeProfile = useActiveProfile();
  const hydrationStatus = useHydrationStatus();
  const { column: sortColumn, direction: sortDirection } = useGapSort();
  const { setGapSort } = useAssessmentActions();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const fetchGapAnalysis = useCallback(
    (wilayahId: number): Promise<GapAnalysisRow[]> =>
      apiClient.assessment.getGapAnalysis(wilayahId),
    [],
  );

  const { data, loading, error, retry } = useAssessmentSectionData(fetchGapAnalysis);

  const sortedRows = data ? sortRows(data, sortColumn, sortDirection) : [];

  function handleSort(col: GapSortColumn) {
    if (col === sortColumn) {
      setGapSort(col, sortDirection === "asc" ? "desc" : "asc");
    } else {
      setGapSort(col, col === "rank_provinsi" ? "asc" : "desc");
    }
  }

  function toggleRow(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
          B.2 — Gap Analysis
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-talis-stone-900">
              Multi-Wilayah Gap Analysis
            </h1>
            <p className="mt-1 font-sans text-sm text-talis-stone-700">
              {activeProfile
                ? `Peringkat wilayah berdasarkan Priority Score × Infrastructure Gap`
                : hydrationStatus === "pending"
                  ? "Memuat active profile…"
                  : "Menampilkan semua wilayah Karo"}
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-lg border border-talis-stone-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-2">
            <LoadingSkeleton shape="table-row" count={8} />
          </div>
        ) : error ? (
          <div className="p-5">
            {isNotFoundError(error) ? (
              <EmptyState
                title="Data gap analysis belum tersedia"
                description="Fixture mencakup wilayah kecamatan Kabupaten Karo."
              />
            ) : (
              <ErrorState description={errorDescription(error)} onRetry={retry} />
            )}
          </div>
        ) : sortedRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-talis-stone-200">
              <thead>
                <tr className="bg-talis-stone-50">
                  {SORT_COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700 cursor-pointer select-none hover:text-talis-stone-900"
                      onClick={() => handleSort(col)}
                    >
                      <span className="flex items-center gap-1">
                        {COLUMN_LABELS[col]}
                        {sortColumn === col && (
                          <span className="text-talis-green-700">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                    Wilayah
                  </th>
                  <th className="px-3 py-2 text-center font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-talis-stone-200 bg-white">
                {sortedRows.map((row) => (
                  <>
                    <tr
                      key={row.wilayah_id}
                      className={`hover:bg-talis-stone-50 ${activeProfile?.wilayah_id === row.wilayah_id ? "bg-talis-green-700/5" : ""}`}
                    >
                      <td className="px-3 py-2 font-mono text-sm font-semibold text-talis-stone-900">
                        #{row.rank_provinsi}
                      </td>
                      <td className="px-3 py-2 font-mono text-sm font-semibold text-talis-green-700">
                        {row.priority_score.toFixed(0)}
                      </td>
                      <td className="px-3 py-2 font-mono text-sm text-talis-stone-900">
                        {row.skor_potensi}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`font-mono text-sm font-semibold ${row.infrastructure_gap > 30 ? "text-talis-red-700" : row.infrastructure_gap > 15 ? "text-talis-earth-700" : "text-talis-green-700"}`}>
                          {row.infrastructure_gap}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-sans text-sm font-medium text-talis-stone-900">{row.nama}</p>
                        <p className="font-sans text-xs text-talis-stone-700">{row.kabupaten}</p>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRow(row.wilayah_id)}
                          className="font-sans text-xs font-medium text-talis-green-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700"
                        >
                          {expandedRows.has(row.wilayah_id) ? "Tutup ▲" : "Lihat ▼"}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(row.wilayah_id) && (
                      <tr key={`${row.wilayah_id}-detail`}>
                        <td colSpan={6} className="p-0">
                          <GapSubComponent row={row} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="Data gap analysis kosong"
              description="Tidak ada wilayah ditemukan."
            />
          </div>
        )}
      </div>
    </div>
  );
}
