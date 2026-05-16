"use client";
// Recharts stacked horizontal bar chart for land banking breakdown.
// Loaded via next/dynamic with ssr: false in LandBankingSection.tsx.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Breakdown {
  apresiasi: number;
  pipeline: number;
  cagr: number;
  emerging: number;
}

interface Props {
  breakdown: Breakdown;
}

const COMPONENTS = [
  { key: "apresiasi" as const, label: "Apresiasi Harga", color: "#4ade80", weight: 0.3 },
  { key: "pipeline" as const, label: "Pipeline Infra", color: "#60a5fa", weight: 0.25 },
  { key: "cagr" as const, label: "CAGR Penduduk", color: "#f59e0b", weight: 0.25 },
  { key: "emerging" as const, label: "Emerging Dest.", color: "#a78bfa", weight: 0.2 },
];

export function LandBankingChart({ breakdown }: Props) {
  // Build data as a single stacked bar entry with weighted contributions
  const data = [
    {
      name: "Komponen",
      apresiasi: Math.round(breakdown.apresiasi * 0.3),
      pipeline: Math.round(breakdown.pipeline * 0.25),
      cagr: Math.round(breakdown.cagr * 0.25),
      emerging: Math.round(breakdown.emerging * 0.2),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Stacked bar via Recharts */}
      <ResponsiveContainer width="100%" height={56}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          barCategoryGap="20%"
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            formatter={(value: number, name: string) => {
              const comp = COMPONENTS.find((c) => c.key === name);
              return [`${value} (skor kontribusi)`, comp?.label ?? name];
            }}
            contentStyle={{ fontSize: 11, fontFamily: "monospace" }}
          />
          {COMPONENTS.map((c) => (
            <Bar key={c.key} dataKey={c.key} stackId="breakdown" fill={c.color} radius={0}>
              <Cell key={`cell-${c.key}`} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend + raw scores */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {COMPONENTS.map((c) => (
          <div key={c.key} className="flex items-start gap-1.5">
            <span
              className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: c.color }}
            />
            <div>
              <p className="font-sans text-xs text-talis-stone-600">{c.label}</p>
              <p className="font-mono text-xs font-semibold text-talis-stone-900">
                {breakdown[c.key]}{" "}
                <span className="font-normal text-talis-stone-400">
                  × {(c.weight * 100).toFixed(0)}%
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
