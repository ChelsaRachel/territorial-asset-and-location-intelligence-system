"use client";

import { ScoreBadge } from "@/components/ui/ScoreBadge";
import {
  formatAppreciation,
  formatCompactRupiah,
  formatMatchingScore,
} from "@/lib/discovery/searchResultFormat";
import type { SearchResultRow } from "@/lib/store/useDiscovery";

interface OpportunityResultRowProps {
  rank: number;
  result: SearchResultRow;
  onSelect(result: SearchResultRow): void;
}

export function OpportunityResultRow({ rank, result, onSelect }: OpportunityResultRowProps) {
  const appreciation = formatAppreciation(result.appreciation_rate);

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="grid w-full grid-cols-[28px_1fr_auto] gap-2 rounded-md border border-talis-stone-700/15 bg-white p-2 text-left transition hover:border-talis-green-700/50 hover:bg-talis-green-700/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-talis-stone-200 font-mono text-xs font-semibold text-talis-stone-700">
        {rank}
      </span>
      <span className="min-w-0 space-y-0.5">
        <span className="block truncate font-sans text-sm font-semibold text-talis-stone-900">
          {result.nama}
        </span>
        <span className="block truncate font-sans text-xs text-talis-stone-700">
          {result.kabupaten} - {result.provinsi}
        </span>
        <span className="block font-sans text-xs text-talis-stone-900">
          {formatCompactRupiah(result.median_land_price)}
        </span>
        <span className="block line-clamp-2 font-sans text-xs leading-snug text-talis-stone-700">
          {result.highlight_reason}
        </span>
        {appreciation && (
          <span className="block font-sans text-xs font-medium text-talis-green-700">
            {appreciation}
          </span>
        )}
      </span>
      <ScoreBadge
        value={result.matching_score ?? 0}
        size="sm"
        label={formatMatchingScore(result.matching_score)}
      />
    </button>
  );
}

export default OpportunityResultRow;
