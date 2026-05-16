"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HargaVsNjopRow } from "@/lib/types/intelligence";
import {
  DEFAULT_AXIS,
  DEFAULT_GRID,
  DEFAULT_TOOLTIP_STYLE,
  NJOP_COLOR,
  PASAR_COLOR,
  FONT_MONO,
} from "@/components/charts/chartTheme";
import { formatRpPerM2 } from "@/lib/format";

interface Props {
  rows: HargaVsNjopRow[];
}

export function HargaNjopBarChart({ rows }: Props) {
  const data = rows.map((r) => ({
    name: r.kelurahan,
    njop: r.njop_rp_per_m2,
    pasar: r.pasar_rp_per_m2,
    selisih: r.selisih_pct,
  }));

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Harga Pasar vs NJOP per Kelurahan
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...DEFAULT_GRID} horizontal={false} />
          <XAxis
            type="number"
            {...DEFAULT_AXIS}
            tickFormatter={(v: number) => {
              if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`;
              if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
              return String(v);
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            {...DEFAULT_AXIS}
            width={80}
            tick={{ ...DEFAULT_AXIS.tick, fontSize: 10 }}
          />
          <Tooltip
            {...DEFAULT_TOOLTIP_STYLE}
            formatter={(value: number, name: string) => [
              formatRpPerM2(value),
              name === "njop" ? "NJOP" : "Harga Pasar",
            ]}
          />
          <Legend
            wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 11 }}
            formatter={(value) => (value === "njop" ? "NJOP" : "Harga Pasar")}
          />
          <Bar dataKey="njop" fill={NJOP_COLOR} radius={[0, 2, 2, 0]} isAnimationActive={false} />
          <Bar dataKey="pasar" fill={PASAR_COLOR} radius={[0, 2, 2, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
