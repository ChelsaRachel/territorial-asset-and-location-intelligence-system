"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { IklimAnomaliPoint } from "@/lib/types/intelligence";
import {
  DEFAULT_AXIS,
  DEFAULT_GRID,
  DEFAULT_TOOLTIP_STYLE,
  SPI_POSITIVE_COLOR,
  SPI_NEGATIVE_COLOR,
} from "@/components/charts/chartTheme";

interface Props {
  series: IklimAnomaliPoint[];
}

export function ClimateAnomalyChart({ series }: Props) {
  const data = series.map((p) => ({
    year: String(p.year),
    spi: p.spi_annual,
    elNino: p.el_nino_flag,
    kategori: p.kategori,
  }));

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Anomali Iklim SPI (10 Tahun)
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...DEFAULT_GRID} />
          <XAxis dataKey="year" {...DEFAULT_AXIS} interval={1} />
          <YAxis {...DEFAULT_AXIS} domain={[-2.5, 2.5]} tickCount={5} width={36} />
          <ReferenceLine y={0} stroke="#57534E" strokeWidth={1} />
          <Tooltip
            {...DEFAULT_TOOLTIP_STYLE}
            formatter={(value: number) => [
              value.toFixed(2),
              "SPI",
            ]}
            labelFormatter={(label, payload) => {
              const d = payload?.[0]?.payload as (typeof data)[number] | undefined;
              return `${label}${d?.elNino ? " 🔴 El Niño" : ""}`;
            }}
          />
          <Bar dataKey="spi" isAnimationActive={false} radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.spi >= 0 ? SPI_POSITIVE_COLOR : SPI_NEGATIVE_COLOR}
                fillOpacity={entry.elNino ? 1 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 font-sans text-[11px] text-talis-stone-700">
        <span className="inline-block h-2 w-2 rounded-sm bg-talis-red-700 mr-1" />
        Negatif = kekeringan &nbsp;
        <span className="inline-block h-2 w-2 rounded-sm bg-talis-blue mr-1" />
        Positif = curah hujan lebih
      </p>
    </div>
  );
}
