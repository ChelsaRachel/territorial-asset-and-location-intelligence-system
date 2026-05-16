"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PdrbYearlyPoint } from "@/lib/types/intelligence";
import {
  DEFAULT_AXIS,
  DEFAULT_GRID,
  DEFAULT_TOOLTIP_STYLE,
  TALIS_COLORS,
} from "@/components/charts/chartTheme";
import { formatTrilyun, formatPct } from "@/lib/format";

interface Props {
  series: PdrbYearlyPoint[];
}

export function PdrbTrendChart({ series }: Props) {
  const data = series.map((p) => ({
    year: String(p.year),
    pdrb: p.pdrb_total_triliyun,
    growth: p.yoy_growth_pct,
  }));

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        PDRB 5 Tahun (Rp T)
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...DEFAULT_GRID} />
          <XAxis dataKey="year" {...DEFAULT_AXIS} />
          <YAxis
            {...DEFAULT_AXIS}
            tickFormatter={(v: number) => `${v.toFixed(0)}T`}
            width={40}
          />
          <Tooltip
            {...DEFAULT_TOOLTIP_STYLE}
            formatter={(value: number, name: string) =>
              name === "pdrb"
                ? [formatTrilyun(value), "PDRB Total"]
                : [formatPct(value), "Growth YoY"]
            }
          />
          <Bar dataKey="pdrb" fill={TALIS_COLORS.green700} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      {data.length > 0 && (
        <p className="mt-1 font-mono text-[11px] text-talis-stone-700">
          Growth {formatPct(data[data.length - 1]!.growth)} YoY (terbaru)
        </p>
      )}
    </div>
  );
}
