import type { GrowthBreakdown } from "@/lib/types/intelligence";

const COMPONENTS: { key: keyof GrowthBreakdown; label: string; weight: number }[] = [
  { key: "pipeline_infra", label: "Pipeline Infrastruktur", weight: 40 },
  { key: "emerging_destination", label: "Emerging Destination", weight: 30 },
  { key: "cagr_penduduk", label: "CAGR Penduduk", weight: 30 },
];

interface Props {
  breakdown: GrowthBreakdown;
}

export function GrowthBreakdownBars({ breakdown }: Props) {
  return (
    <div>
      <p className="mb-3 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Komponen Skor
      </p>
      <div className="space-y-3">
        {COMPONENTS.map(({ key, label, weight }) => {
          const component = breakdown[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-sans text-xs text-talis-stone-700">
                  {label}
                  <span className="ml-1.5 font-mono text-[10px] text-talis-stone-500">
                    (bobot {weight}%)
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs font-semibold text-talis-stone-900">
                  {component.score}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-talis-stone-200">
                <div
                  className="h-2 rounded-full bg-talis-green-700 transition-[width]"
                  style={{ width: `${component.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
