"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { MarketAccessScoreBreakdown } from "@/lib/types/territory";

interface MarketAccessRadarProps {
  breakdown: MarketAccessScoreBreakdown;
}

interface ChartDatum {
  subject: string;
  fullLabel: string;
  value: number;
}

interface TooltipEntry {
  payload: ChartDatum;
}

function RadarTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white px-3 py-2 shadow-md">
      <p className="font-sans text-xs font-medium text-talis-stone-900">{datum.fullLabel}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-talis-stone-900">{datum.value}</p>
    </div>
  );
}

const DIMENSIONS: Array<{
  key: keyof MarketAccessScoreBreakdown;
  label: string;
  shortLabel: string;
}> = [
  { key: "pelabuhan", label: "Pelabuhan", shortLabel: "Pelabuhan" },
  { key: "bandara", label: "Bandara", shortLabel: "Bandara" },
  { key: "pasar_induk", label: "Pasar Induk", shortLabel: "Pasar Induk" },
  { key: "jalan_nasional", label: "Jalan Nasional", shortLabel: "Jln. Nasional" },
  { key: "kondisi_jalan", label: "Kondisi Jalan", shortLabel: "Kondisi" },
];

export function MarketAccessRadar({ breakdown }: MarketAccessRadarProps) {
  const data: ChartDatum[] = DIMENSIONS.map(({ key, label, shortLabel }) => ({
    subject: shortLabel,
    fullLabel: label,
    value: breakdown[key],
  }));

  return (
    <div
      className="rounded-lg border border-talis-stone-200 bg-white p-4"
      data-testid="market-access-radar"
    >
      <h3 className="font-sans text-sm font-semibold text-talis-stone-900">
        Breakdown Akses Pasar
      </h3>
      <p className="mt-1 font-sans text-xs text-talis-stone-700">
        Lima dimensi logistik (skala 0–100)
      </p>

      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 8, right: 28, bottom: 8, left: 28 }}>
            <PolarGrid stroke="#E7E5E4" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fontFamily: "var(--font-sans, ui-sans-serif, sans-serif)",
                fontSize: 10,
                fill: "#78716C",
              }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#2D6A4F"
              fill="#2D6A4F"
              fillOpacity={0.18}
              strokeWidth={2}
              isAnimationActive={false}
              dot={{ r: 3, fill: "#2D6A4F", strokeWidth: 0 }}
            />
            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {DIMENSIONS.map(({ key, label }) => (
          <div
            key={key}
            className="rounded border border-talis-stone-200 bg-talis-stone-50 px-2 py-1.5"
          >
            <p className="font-sans text-[10px] uppercase tracking-wide text-talis-stone-700">
              {label}
            </p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-talis-stone-900">
              {breakdown[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
