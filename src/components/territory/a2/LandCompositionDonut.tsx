"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EmptyState } from "@/components/ui";
import { formatHectares } from "@/lib/format/territory";
import type { LandCompositionRow } from "@/lib/types/territory";
import { LAND_COMPOSITION_COLORS } from "./landCompositionColors";

interface LandCompositionDonutProps {
  rows: LandCompositionRow[];
}

interface ChartDatum extends LandCompositionRow {
  color: string;
}

interface TooltipPayload {
  payload: ChartDatum;
}

function LandCompositionTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white px-3 py-2 shadow-md">
      <p className="font-sans text-xs font-medium text-talis-stone-900">{datum.label}</p>
      <p className="mt-1 font-mono text-xs text-talis-stone-900">
        {formatHectares(datum.luas_ha)} · {datum.persen}%
      </p>
    </div>
  );
}

export function LandCompositionDonut({ rows }: LandCompositionDonutProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
        <EmptyState
          title="Komposisi lahan belum tersedia"
          description="Data tutupan lahan untuk wilayah aktif belum tersedia di fixture."
        />
      </div>
    );
  }

  const chartData: ChartDatum[] = rows.map((row) => ({
    ...row,
    color: LAND_COMPOSITION_COLORS[row.kategori],
  }));

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4" data-testid="land-composition-donut">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-sm font-semibold text-talis-stone-900">Komposisi Lahan</h3>
          <p className="mt-1 font-sans text-xs text-talis-stone-700">
            Tutupan lahan dari fixture TALIS A.2
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(190px,240px),1fr] lg:items-center">
        <div className="relative h-64 min-h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="persen"
                nameKey="label"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={2}
                isAnimationActive={false}
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.kategori} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<LandCompositionTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
            <div>
              <p className="font-mono text-lg font-semibold text-talis-stone-900">100%</p>
              <p className="font-sans text-[11px] text-talis-stone-700">total</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {chartData.map((row) => (
            <div
              key={row.kategori}
              className="grid grid-cols-[auto,1fr,auto] items-center gap-2 rounded border border-talis-stone-200 bg-talis-stone-50 px-2.5 py-2"
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: row.color }}
              />
              <div className="min-w-0">
                <p className="truncate font-sans text-xs font-medium text-talis-stone-900">
                  {row.label}
                </p>
                <p className="font-mono text-[11px] text-talis-stone-700">
                  {formatHectares(row.luas_ha)}
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-talis-stone-900">
                {row.persen}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
