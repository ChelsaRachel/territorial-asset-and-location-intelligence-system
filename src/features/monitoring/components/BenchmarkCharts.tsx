"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEFAULT_AXIS, DEFAULT_GRID, DEFAULT_TOOLTIP_STYLE, TALIS_COLORS, FONT_MONO } from "@/components/charts/chartTheme";

export interface TrajectoryPoint {
  month: string;
  aktif: number | null;
  referensi: number | null;
  estimasi: number | null;
}

export interface GapBarPoint {
  indicator: string;
  gap: number;
}

export function TrajectoryChart({ data }: { data: TrajectoryPoint[] }) {
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
      <p className="mb-3 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Trajektori Aktif vs Referensi
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 6, right: 18, bottom: 4, left: 0 }}>
          <CartesianGrid {...DEFAULT_GRID} />
          <XAxis dataKey="month" {...DEFAULT_AXIS} tick={{ ...DEFAULT_AXIS.tick, fontSize: 10 }} minTickGap={26} />
          <YAxis {...DEFAULT_AXIS} width={42} />
          <Tooltip {...DEFAULT_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontFamily: FONT_MONO, fontSize: 11 }} />
          <Line type="monotone" dataKey="aktif" name="Aktif" stroke={TALIS_COLORS.green700} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="referensi" name="Referensi aligned" stroke={TALIS_COLORS.blue} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="estimasi" name="Estimasi Aktif" stroke={TALIS_COLORS.amber} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GapAnalysisBar({ data }: { data: GapBarPoint[] }) {
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
      <p className="mb-3 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Gap Indikator terhadap Referensi Saat Ini
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, bottom: 0, left: 70 }}>
          <CartesianGrid {...DEFAULT_GRID} />
          <XAxis type="number" {...DEFAULT_AXIS} />
          <YAxis dataKey="indicator" type="category" {...DEFAULT_AXIS} width={110} tick={{ ...DEFAULT_AXIS.tick, fontSize: 10 }} />
          <Tooltip {...DEFAULT_TOOLTIP_STYLE} formatter={(value: number) => [value, "Gap"]} />
          <Bar dataKey="gap" radius={[2, 2, 2, 2]} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.indicator} fill={entry.gap >= 0 ? TALIS_COLORS.green700 : TALIS_COLORS.red700} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
