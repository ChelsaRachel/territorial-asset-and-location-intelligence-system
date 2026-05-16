"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { NdviMonthlyPoint } from "@/lib/types/intelligence";
import {
  DEFAULT_AXIS,
  DEFAULT_GRID,
  DEFAULT_TOOLTIP_STYLE,
  NDVI_CURRENT_COLOR,
  NDVI_BASELINE_COLOR,
  FONT_MONO,
} from "@/components/charts/chartTheme";
import { formatNdvi } from "@/lib/format";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

interface Props {
  series: NdviMonthlyPoint[];
  wilayahName?: string;
}

export function NdviTrendChart({ series, wilayahName }: Props) {
  const data = series.map((p) => ({
    label: `${MONTH_ABBR[p.month - 1]} ${p.year}`,
    ndvi: p.ndvi_value,
    baseline: p.baseline_5yr,
    delta: p.delta_from_baseline,
  }));

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        NDVI 12 Bulan vs Baseline 5-Tahun
        {wilayahName ? ` — ${wilayahName}` : ""}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...DEFAULT_GRID} />
          <XAxis dataKey="label" {...DEFAULT_AXIS} interval={1} />
          <YAxis
            {...DEFAULT_AXIS}
            domain={[0.2, 1.0]}
            tickCount={5}
            tickFormatter={(v: number) => formatNdvi(v)}
            width={48}
          />
          <Tooltip
            {...DEFAULT_TOOLTIP_STYLE}
            formatter={(value: number, name: string) => [
              formatNdvi(value),
              name === "ndvi" ? "NDVI 2025-26" : "Baseline 5thn",
            ]}
          />
          <Legend
            wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 11 }}
            formatter={(value) => (value === "ndvi" ? "NDVI 2025-26" : "Baseline 5 tahun")}
          />
          <Line
            type="monotone"
            dataKey="ndvi"
            stroke={NDVI_CURRENT_COLOR}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="baseline"
            stroke={NDVI_BASELINE_COLOR}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
