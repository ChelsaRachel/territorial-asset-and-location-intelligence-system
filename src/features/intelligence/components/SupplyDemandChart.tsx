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
import type { DemandItem } from "@/lib/types/intelligence";
import {
  DEFAULT_AXIS,
  DEFAULT_GRID,
  DEFAULT_TOOLTIP_STYLE,
  SUPPLY_COLOR,
  DEMAND_COLOR,
  FONT_MONO,
} from "@/components/charts/chartTheme";

interface Props {
  items: DemandItem[];
}

export function SupplyDemandChart({ items }: Props) {
  const data = items.map((item) => ({
    name: item.komoditas,
    supply: item.supply_per_bulan,
    demand: item.demand_per_bulan,
    unit: item.unit,
  }));

  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Supply vs Demand (ton/bln)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...DEFAULT_GRID} />
          <XAxis dataKey="name" {...DEFAULT_AXIS} tick={{ ...DEFAULT_AXIS.tick, fontSize: 10 }} />
          <YAxis {...DEFAULT_AXIS} width={44} />
          <Tooltip
            {...DEFAULT_TOOLTIP_STYLE}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString("id-ID")} ton/bln`,
              name === "supply" ? "Supply" : "Demand",
            ]}
          />
          <Legend
            wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 11 }}
            formatter={(value) => (value === "supply" ? "Supply" : "Demand")}
          />
          <Bar dataKey="supply" fill={SUPPLY_COLOR} radius={[2, 2, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="demand" fill={DEMAND_COLOR} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
