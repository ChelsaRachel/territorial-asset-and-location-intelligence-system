"use client";

import { Fragment, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type SortingFn,
} from "@tanstack/react-table";
import { ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { MarketAccessDestinationWithRoute } from "@/lib/types/territory";
import {
  formatDistanceKm,
  formatCostPerTon,
  formatMinutes,
  tipeTujuanLabel,
} from "./marketAccessFormat";
import { MarketAccessExpandedRow } from "./MarketAccessExpandedRow";

const columnHelper = createColumnHelper<MarketAccessDestinationWithRoute>();

const sortNullsLast: SortingFn<MarketAccessDestinationWithRoute> = (rowA, rowB, columnId) => {
  const a = rowA.getValue<number | null>(columnId);
  const b = rowB.getValue<number | null>(columnId);
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a as number) - (b as number);
};

const COLUMNS = [
  columnHelper.accessor("tipe", {
    header: "Tipe",
    enableSorting: false,
    cell: (info) => (
      <span className="font-sans text-xs text-talis-stone-700">
        {tipeTujuanLabel(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("nama", {
    header: "Tujuan",
    enableSorting: false,
    cell: (info) => (
      <span className="break-words font-sans text-sm font-medium text-talis-stone-900">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("jarak_km", {
    header: "Jarak",
    enableSorting: true,
    sortDescFirst: false,
    cell: (info) => (
      <span className="font-mono text-sm tabular-nums text-talis-stone-900">
        {formatDistanceKm(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("waktu_menit", {
    header: "Waktu",
    enableSorting: true,
    sortDescFirst: false,
    cell: (info) => (
      <span className="font-mono text-sm tabular-nums text-talis-stone-900">
        {formatMinutes(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("kondisi_jalan_label", {
    header: "Kondisi Jalan",
    enableSorting: false,
    cell: (info) => (
      <span className="font-sans text-xs text-talis-stone-700">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("cost_per_ton_rp", {
    header: "Cost/ton",
    enableSorting: true,
    sortDescFirst: false,
    sortingFn: sortNullsLast,
    cell: (info) => (
      <span className="font-mono text-sm tabular-nums text-talis-stone-900">
        {formatCostPerTon(info.getValue())}
      </span>
    ),
  }),
];

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return <ChevronUp className="h-3.5 w-3.5 text-talis-stone-900" aria-hidden="true" />;
  if (sorted === "desc")
    return <ChevronDown className="h-3.5 w-3.5 text-talis-stone-900" aria-hidden="true" />;
  return <ChevronsUpDown className="h-3.5 w-3.5 text-talis-stone-400" aria-hidden="true" />;
}

export interface MarketAccessTableProps {
  destinations: MarketAccessDestinationWithRoute[];
}

export function MarketAccessTable({ destinations }: MarketAccessTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const table = useReactTable({
    data: destinations,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className="overflow-hidden rounded-lg border border-talis-stone-200"
      data-testid="market-access-table"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-talis-stone-200">
          <thead className="bg-talis-stone-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="w-8 px-2 py-3" aria-hidden="true" />
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={`px-3 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-wide text-talis-stone-700${canSort ? " cursor-pointer select-none hover:text-talis-stone-900" : ""}`}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && <SortIcon sorted={sorted} />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-talis-stone-100 bg-white">
            {table.getRowModel().rows.map((row) => {
              const isExpanded = expandedRows.has(row.id);
              return (
                <Fragment key={row.id}>
                  <tr
                    className="cursor-pointer hover:bg-talis-stone-50"
                    onClick={() => toggleRow(row.id)}
                    aria-expanded={isExpanded}
                  >
                    <td className="w-8 px-2 py-3 text-center">
                      <ChevronRight
                        className={`h-4 w-4 text-talis-stone-400 transition-transform duration-150${isExpanded ? " rotate-90" : ""}`}
                        aria-hidden="true"
                      />
                    </td>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap px-3 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td />
                      <td colSpan={COLUMNS.length}>
                        <MarketAccessExpandedRow destination={row.original} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
