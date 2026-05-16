"use client";

import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusDistributionPct } from "@/lib/types/monitoring";
import { TALIS_COLORS, DEFAULT_TOOLTIP_STYLE } from "@/components/charts/chartTheme";

const STATUS_META: Record<keyof StatusDistributionPct, { label: string; color: string }> = {
  operasional: { label: "Operasional", color: TALIS_COLORS.green700 },
  izin_diterbitkan: { label: "Izin Diterbitkan", color: "#D97706" },
  dalam_proses: { label: "Dalam Proses", color: TALIS_COLORS.blue },
  tertahan: { label: "Tertahan", color: TALIS_COLORS.red700 },
};

interface PipelineStatusDonutProps {
  distribution: StatusDistributionPct;
  total: number;
}

export function PipelineStatusDonut({ distribution, total }: PipelineStatusDonutProps) {
  const data = (Object.keys(distribution) as Array<keyof StatusDistributionPct>).map((key) => ({
    key,
    name: STATUS_META[key].label,
    value: distribution[key],
    color: STATUS_META[key].color,
  }));

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
      <div className="mb-2">
        <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-700">
          Distribusi Status Pipeline
        </p>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
            stroke="#fff"
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
            <Label
              position="center"
              content={({ viewBox }) => {
                const cx = "cx" in viewBox! ? viewBox.cx : 0;
                const cy = "cy" in viewBox! ? viewBox.cy : 0;
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                    <tspan x={cx} dy="-0.2em" className="fill-talis-stone-900 font-mono text-lg font-semibold">
                      {total}
                    </tspan>
                    <tspan x={cx} dy="1.4em" className="fill-talis-stone-700 font-sans text-[11px]">
                      investor
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
          <Tooltip
            {...DEFAULT_TOOLTIP_STYLE}
            formatter={(value: number) => [`${value}%`, "Porsi"]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2">
        {data.map((entry) => (
          <div key={entry.key} className="flex items-center gap-2 font-sans text-xs text-talis-stone-700">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}</span>
            <span className="ml-auto font-mono text-talis-stone-900">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
