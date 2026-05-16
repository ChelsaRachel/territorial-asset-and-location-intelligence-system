import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";
import type { TerritoryProfile } from "@/lib/types/territory";

interface InfrastructureIndexPanelProps {
  profile: TerritoryProfile;
}

const BREAKDOWN_ROWS = [
  {
    key: "jalan_aspal",
    label: "Jalan aspal",
  },
  {
    key: "listrik_pln",
    label: "Listrik PLN",
  },
  {
    key: "air_bersih",
    label: "Air bersih",
  },
  {
    key: "sinyal_4g",
    label: "Sinyal 4G",
  },
] as const;

export function InfrastructureIndexPanel({ profile }: InfrastructureIndexPanelProps) {
  const { infrastruktur } = profile;

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-sm font-semibold text-talis-stone-900">
              Infrastructure Availability Index
            </h3>
            <TooltipWrapper content="Skor 0-100 dari fixture TALIS untuk kesiapan jalan, listrik, air bersih, dan sinyal 4G.">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-talis-stone-700/40 font-mono text-[10px] text-talis-stone-700">
                ?
              </span>
            </TooltipWrapper>
          </div>
          <p className="mt-1 font-sans text-xs text-talis-stone-700">
            Kategori <span className="font-medium text-talis-stone-900">{infrastruktur.kategori}</span>
          </p>
        </div>
        <ScoreBadge value={infrastruktur.infrastructure_index} size="xl" label={infrastruktur.kategori} />
      </div>

      <div className="mt-5 grid gap-3">
        {BREAKDOWN_ROWS.map((row) => (
          <ProgressBar key={row.key} label={row.label} value={infrastruktur.breakdown[row.key]} showValue />
        ))}
      </div>
    </div>
  );
}
