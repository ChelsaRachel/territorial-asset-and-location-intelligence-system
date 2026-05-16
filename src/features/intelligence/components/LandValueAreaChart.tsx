"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { QuarterlyPricePoint } from "@/lib/types/intelligence";
import {
  DEFAULT_AXIS,
  DEFAULT_GRID,
  DEFAULT_TOOLTIP_STYLE,
  LAND_VALUE_AREA_COLOR,
} from "@/components/charts/chartTheme";
import { formatRpPerM2 } from "@/lib/format";

interface Props {
  series: QuarterlyPricePoint[];
}

export function LandValueAreaChart({ series }: Props) {
  const data = series.map((p) => ({
    label: `Q${p.quarter} ${p.year}`,
    harga: p.median_rp_per_m2,
    listing: p.listing_count,
  }));

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Tren Harga Lahan 8 Kuartal (Rp/m²)
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="landValueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={LAND_VALUE_AREA_COLOR} stopOpacity={0.2} />
              <stop offset="95%" stopColor={LAND_VALUE_AREA_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...DEFAULT_GRID} />
          <XAxis dataKey="label" {...DEFAULT_AXIS} interval={1} tick={{ ...DEFAULT_AXIS.tick, fontSize: 10 }} />
          <YAxis
            {...DEFAULT_AXIS}
            width={52}
            tickFormatter={(v: number) => {
              if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`;
              if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
              return String(v);
            }}
          />
          <Tooltip
            {...DEFAULT_TOOLTIP_STYLE}
            formatter={(value: number) => [formatRpPerM2(value), "Median Harga"]}
          />
          <Area
            type="monotone"
            dataKey="harga"
            stroke={LAND_VALUE_AREA_COLOR}
            strokeWidth={2}
            fill="url(#landValueGradient)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
