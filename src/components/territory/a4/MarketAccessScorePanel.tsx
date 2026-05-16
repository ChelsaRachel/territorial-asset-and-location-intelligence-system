import { ScoreBadge } from "@/components/ui";
import type { TerritoryMarketAccess } from "@/lib/types/territory";

interface MarketAccessScorePanelProps {
  data: TerritoryMarketAccess;
}

function scoreDescription(score: number): string {
  if (score >= 70)
    return "Akses ke pasar, pelabuhan, dan bandara berada di atas rata-rata; koridor logistik kompetitif.";
  if (score >= 40)
    return "Akses cukup baik ke beberapa tujuan strategis, namun ada dimensi yang perlu penguatan sebelum operasi skala besar.";
  return "Akses terbatas; biaya logistik tinggi dan waktu tempuh sensitif — pertimbangkan investasi infrastruktur sebelum ekspansi.";
}

export function MarketAccessScorePanel({ data }: MarketAccessScorePanelProps) {
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-sm font-semibold text-talis-stone-900">
            Market Access Score
          </h3>
          <p className="mt-1 font-sans text-xs text-talis-stone-700">Skor akses pasar A.4 (0–100)</p>
        </div>
        <ScoreBadge value={data.market_access_score} size="xl" label="Market Access" />
      </div>
      <p className="mt-3 font-sans text-sm leading-6 text-talis-stone-700">
        {scoreDescription(data.market_access_score)}
      </p>
    </div>
  );
}
