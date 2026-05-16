"use client";
// SPRINT-06 §3.3 — Comparison Table section (TASK-005 + TASK-006)
// TanStack Table, fuse.js fuzzy search, highlights, rekomendasi cards

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import Fuse from "fuse.js";
import { useComparisonStore } from "@/lib/store/comparison";
import { useActiveProfile } from "@/lib/store/useActiveProfile";
import { ExportButton } from "@/components/export/ExportButton";
import { ExportModalLazy } from "@/components/export/ExportModalLazy";
import type { ExportModalConfig } from "@/components/export/ExportModal";
import type { WilayahComparisonRow, RekomendasiCard } from "@/lib/decision/compare";
import dimWilayah from "@/mocks/dim_wilayah.json";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DimWilayah {
  wilayah_id: number;
  nama: string;
  kabupaten: string;
  provinsi: string;
}

const ALL_WILAYAH: DimWilayah[] = dimWilayah as DimWilayah[];

const PARAM_LABELS: Record<string, string> = {
  A1: "A.1 Kesesuaian Lahan",
  A2: "A.2 Infrastruktur",
  A3: "A.3 Kepatuhan Zonasi",
  A4: "A.4 Akses Pasar",
  A6: "A.6 Serapan Pasar",
  A7: "A.7 Dinamika Harga",
  A8: "A.8 Proyeksi Pertumbuhan",
  C1: "C.1 Location Score",
  harga_lahan: "Harga Lahan (Rp/m²)",
  apresiasi_yoy_pct: "Apresiasi YoY (%/th)",
};

const PARAM_KEYS = [
  "A1", "A2", "A3", "A4", "A6", "A7", "A8", "C1", "harga_lahan", "apresiasi_yoy_pct",
] as const;

type ParamKey = (typeof PARAM_KEYS)[number];

// Table row: one row per parameter
interface TableRow {
  paramKey: ParamKey;
  paramLabel: string;
  [wilayahId: number]: number;
}

function formatParamValue(key: ParamKey, value: number): string {
  if (key === "harga_lahan") return `Rp ${(value / 1000).toFixed(0)}k/m²`;
  if (key === "apresiasi_yoy_pct") return `${value.toFixed(1)}%`;
  return String(value);
}

// ─── Rekomendasi Card ──────────────────────────────────────────────────────────

function RekomendasiCardBadge({ card }: { card: RekomendasiCard }) {
  const styles: Record<string, string> = {
    Agribisnis: "border-talis-green-300 bg-talis-green-50",
    "Land Banking": "border-amber-300 bg-amber-50",
    "Risk-Averse": "border-blue-300 bg-blue-50",
  };
  const titleColors: Record<string, string> = {
    Agribisnis: "text-talis-green-700",
    "Land Banking": "text-amber-700",
    "Risk-Averse": "text-blue-700",
  };
  return (
    <div
      className={`rounded-lg border p-4 ${styles[card.tujuan] ?? "border-talis-stone-200 bg-talis-stone-50"}`}
    >
      <p className={`font-sans text-xs font-bold uppercase tracking-wide ${titleColors[card.tujuan] ?? "text-talis-stone-700"}`}>
        {card.tujuan}
      </p>
      <p className="mt-1 font-display text-sm font-bold text-talis-stone-900">
        {card.winner_nama}{" "}
        <span className="font-mono text-talis-stone-500">({card.winner_score})</span>
      </p>
      <p className="mt-1.5 font-sans text-xs leading-relaxed text-talis-stone-600">
        {card.rationale}
      </p>
    </div>
  );
}

// ─── Add Candidate Combobox ────────────────────────────────────────────────────

function AddCandidateCombobox({
  selectedIds,
  onAdd,
  disabled,
}: {
  selectedIds: number[];
  onAdd: (wilayahId: number) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(ALL_WILAYAH, {
        keys: ["nama", "wilayah_id", "kabupaten"],
        threshold: 0.35,
        minMatchCharLength: 1,
      }),
    []
  );

  const results = useMemo(() => {
    const available = ALL_WILAYAH.filter((w) => !selectedIds.includes(w.wilayah_id));
    if (!query.trim()) return available.slice(0, 8);
    return fuse
      .search(query, { limit: 8 })
      .map((r) => r.item)
      .filter((w) => !selectedIds.includes(w.wilayah_id));
  }, [query, selectedIds, fuse]);

  function handleSelect(wilayahId: number) {
    onAdd(wilayahId);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={disabled ? "Maks. 5 kandidat" : "Tambah kandidat…"}
        className="w-full rounded-md border border-talis-stone-300 bg-white px-3 py-1.5 font-sans text-xs text-talis-stone-900 placeholder:text-talis-stone-400 focus:border-talis-green-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-talis-stone-50 disabled:text-talis-stone-400"
      />
      {open && results.length > 0 && !disabled && (
        <ul className="absolute left-0 top-full z-50 mt-1 max-h-60 w-72 overflow-y-auto rounded-md border border-talis-stone-200 bg-white shadow-lg">
          {results.map((w) => (
            <li key={w.wilayah_id}>
              <button
                type="button"
                onMouseDown={() => handleSelect(w.wilayah_id)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-talis-green-50"
              >
                <span className="font-sans text-xs font-medium text-talis-stone-900">
                  {w.nama}
                </span>
                <span className="ml-auto shrink-0 font-mono text-xs text-talis-stone-400">
                  {w.wilayah_id}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main CompareSection ───────────────────────────────────────────────────────

export function CompareSection() {
  const activeProfile = useActiveProfile();
  const { compare, kandidatIds, fetchCompare, addKandidat, removeKandidat } =
    useComparisonStore(
      useShallow((s) => ({
        compare: s.compare,
        kandidatIds: s.kandidatIds,
        fetchCompare: s.fetchCompare,
        addKandidat: s.addKandidat,
        removeKandidat: s.removeKandidat,
      })),
    );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [exportConfig, setExportConfig] = useState<ExportModalConfig | null>(null);

  // Seed active profile as first candidate
  useEffect(() => {
    if (!activeProfile) return;
    addKandidat(activeProfile.wilayah_id);
  }, [activeProfile, addKandidat]);

  // Fetch when kandidatIds change and status is idle
  useEffect(() => {
    if (kandidatIds.length > 0 && compare.status === "idle") {
      void fetchCompare();
    }
  }, [kandidatIds, compare.status, fetchCompare]);

  const handleAddKandidat = useCallback(
    (wilayahId: number) => {
      addKandidat(wilayahId);
      // Re-fetch after adding
      void fetchCompare();
    },
    [addKandidat, fetchCompare]
  );

  const handleRemoveKandidat = useCallback(
    (wilayahId: number) => {
      removeKandidat(wilayahId);
      void fetchCompare();
    },
    [removeKandidat, fetchCompare]
  );

  const compareData = compare.data;
  const kandidat = useMemo(() => compareData?.kandidat ?? [], [compareData]);
  const highlights = compareData?.highlights;
  const rekomendasi = useMemo(() => compareData?.rekomendasi ?? [], [compareData]);
  const delta = compareData?.delta ?? null;

  // Build table rows: 10 param rows
  const tableData: TableRow[] = useMemo(() => {
    return PARAM_KEYS.map((key) => {
      const row: TableRow = {
        paramKey: key,
        paramLabel: PARAM_LABELS[key] ?? key,
      };
      for (const k of kandidat) {
        row[k.wilayah_id] = k[key as keyof WilayahComparisonRow] as number;
      }
      return row;
    });
  }, [kandidat]);

  // Build TanStack columns
  const columnHelper = createColumnHelper<TableRow>();

  const columns: ColumnDef<TableRow, unknown>[] = useMemo(() => {
    const cols: ColumnDef<TableRow, unknown>[] = [
      columnHelper.accessor("paramLabel", {
        id: "parameter",
        header: "Parameter",
        enableSorting: false,
        cell: (info) => (
          <span className="font-sans text-xs font-medium text-talis-stone-700">
            {info.getValue() as string}
          </span>
        ),
      }) as ColumnDef<TableRow, unknown>,
    ];

    for (const k of kandidat) {
      const wilayahId = k.wilayah_id;
      cols.push(
        columnHelper.accessor((row) => row[wilayahId] as number, {
          id: String(wilayahId),
          header: () => (
            <div className="flex items-center justify-end gap-1">
              <span className="font-sans text-xs font-semibold text-talis-stone-900">
                {k.nama}
              </span>
              <button
                type="button"
                disabled={kandidatIds.length <= 1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveKandidat(wilayahId);
                }}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-talis-stone-400 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Hapus ${k.nama}`}
                title="Hapus kandidat"
              >
                ×
              </button>
            </div>
          ),
          enableSorting: true,
          cell: (info) => {
            const paramKey = info.row.original.paramKey;
            const val = info.getValue() as number;
            const isBest = highlights?.best[paramKey] === wilayahId;
            const isWorst = highlights?.worst[paramKey] === wilayahId;
            // Only apply best/worst when >1 candidate
            const showBest = isBest && kandidat.length > 1;
            const showWorst = isWorst && kandidat.length > 1 && !isBest;
            return (
              <div
                className={`flex items-center justify-end gap-1 rounded px-1 py-0.5 font-mono text-xs ${
                  showBest
                    ? "bg-talis-green-50 font-semibold text-talis-green-800"
                    : showWorst
                      ? "bg-red-50 text-red-700"
                      : "text-talis-stone-900"
                }`}
              >
                {formatParamValue(paramKey, val)}
                {showBest && <span className="text-talis-green-500">★</span>}
              </div>
            );
          },
        }) as ColumnDef<TableRow, unknown>
      );
    }

    // Delta column when exactly 2 candidates
    if (kandidat.length === 2 && delta) {
      cols.push(
        columnHelper.accessor(() => 0, {
          id: "delta",
          header: "Δ",
          enableSorting: false,
          cell: (info) => {
            const paramKey = info.row.original.paramKey;
            const deltaRow = delta.find((d) => d.param === paramKey);
            if (!deltaRow) return null;
            const val =
              paramKey === "harga_lahan" && deltaRow.delta_pct !== undefined
                ? `${deltaRow.delta_pct.toFixed(1)}%`
                : String(deltaRow.delta);
            const colorClass =
              deltaRow.severity === "HIGH" || deltaRow.severity === "CRITICAL"
                ? "text-red-600"
                : "text-talis-stone-500";
            return (
              <span className={`font-mono text-xs ${colorClass}`}>
                {deltaRow.delta > 0 ? "+" : ""}
                {val}
              </span>
            );
          },
        }) as ColumnDef<TableRow, unknown>
      );
    }

    return cols;
  }, [kandidat, highlights, delta, kandidatIds.length, handleRemoveKandidat, columnHelper]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const showRekomendasi =
    compare.status === "success" && rekomendasi.length > 0 && kandidat.length >= 2;

  return (
    <section className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-500">
            Multi-Kandidat Analysis
          </p>
          <h2 className="mt-0.5 font-display text-lg text-talis-stone-900">
            Perbandingan Kandidat
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            label="Ekspor"
            disabled={kandidatIds.length === 0 || compare.status !== "success"}
            onClick={() =>
              setExportConfig({
                mode: "comparison",
                wilayahIds: kandidatIds,
                title: "Ekspor Perbandingan Kandidat",
              })
            }
          />
          {/* Add Candidate combobox */}
          <div className="w-56">
            <AddCandidateCombobox
              selectedIds={kandidatIds}
              onAdd={handleAddKandidat}
              disabled={kandidatIds.length >= 5}
            />
          </div>
        </div>
      </div>

      {/* Empty state */}
      {kandidatIds.length === 0 && (
        <div className="rounded-md bg-talis-stone-50 p-6 text-center text-sm text-talis-stone-500">
          Pilih minimal 1 wilayah kandidat untuk memulai perbandingan.
        </div>
      )}

      {/* Loading */}
      {compare.status === "loading" && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-talis-stone-100" />
          ))}
        </div>
      )}

      {/* Error */}
      {compare.status === "error" && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {compare.error}
        </div>
      )}

      {/* Success */}
      {compare.status === "success" && compare.data && (
        <div className="space-y-6">
          {/* Rekomendasi Cards — TASK-006 */}
          {showRekomendasi && (
            <div>
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-500">
                Rekomendasi per Tujuan
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {rekomendasi.map((card) => (
                  <RekomendasiCardBadge key={card.tujuan} card={card} />
                ))}
              </div>
            </div>
          )}

          {/* TanStack Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-xs">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-talis-stone-200">
                    {hg.headers.map((header) => {
                      const isParam = header.id === "parameter";
                      const isDelta = header.id === "delta";
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={[
                            "py-2 px-3 text-left font-sans font-semibold",
                            isParam
                              ? "sticky left-0 z-10 bg-white text-talis-stone-600 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
                              : isDelta
                                ? "text-center text-talis-stone-500"
                                : "text-right text-talis-stone-900",
                            canSort ? "cursor-pointer select-none hover:bg-talis-stone-50" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{ minWidth: isParam ? 180 : 110 }}
                        >
                          <div className={isParam ? "flex items-center gap-1" : "flex items-center justify-end gap-1"}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <span className="text-talis-stone-400">
                                {sorted === "desc" ? "↓" : sorted === "asc" ? "↑" : "⇅"}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-talis-stone-100">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-talis-stone-50">
                    {row.getVisibleCells().map((cell) => {
                      const isParam = cell.column.id === "parameter";
                      const isDelta = cell.column.id === "delta";
                      return (
                        <td
                          key={cell.id}
                          className={[
                            "py-2 px-3",
                            isParam
                              ? "sticky left-0 z-10 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] hover:bg-talis-stone-50"
                              : isDelta
                                ? "text-center"
                                : "text-right",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2-candidate delta footnote */}
          {kandidat.length === 2 && delta && (
            <p className="font-sans text-xs text-talis-stone-500">
              * Kolom Δ menampilkan selisih{" "}
              <span className="font-semibold">{kandidat[0]?.nama}</span> −{" "}
              <span className="font-semibold">{kandidat[1]?.nama}</span>. Nilai merah menandakan perbedaan signifikan.
            </p>
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
