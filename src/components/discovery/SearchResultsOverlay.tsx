"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { formatCompactRupiah } from "@/lib/discovery/searchResultFormat";
import {
  useDiscoveryActions,
  useDiscoverySearchError,
  useDiscoverySearchMode,
  useDiscoverySearchResultMode,
  useDiscoverySearchResults,
  useDiscoverySearchStatus,
  type SearchResultRow as SearchResultRowType,
} from "@/lib/store/useDiscovery";
import { useActiveProfileActions } from "@/lib/store/useActiveProfile";
import { slugify } from "@/lib/store/profileSlug";
import type { MapSelectionTarget } from "./MapSelectionController";
import { OpportunityResultRow } from "./OpportunityResultRow";

interface SearchResultsOverlayProps {
  onSelectLocation(target: MapSelectionTarget): void;
}

export function SearchResultsOverlay({ onSelectLocation }: SearchResultsOverlayProps) {
  const mode = useDiscoverySearchMode();
  const resultMode = useDiscoverySearchResultMode();
  const results = useDiscoverySearchResults();
  const status = useDiscoverySearchStatus();
  const error = useDiscoverySearchError();
  const { openPanel, runSearch } = useDiscoveryActions();
  const { setActiveProfile } = useActiveProfileActions();

  if (mode === "location") return null;
  const ownsCurrentResults = resultMode === mode;
  if (status === "idle" || !ownsCurrentResults) return null;

  const selectResult = (result: SearchResultRowType) => {
    onSelectLocation({
      wilayahId: result.wilayah_id,
      lat: result.lat,
      lng: result.lng,
      zoom: 11,
    });

    if (result.profil_kode) {
      setActiveProfile(slugify(result.nama));
      openPanel(result.wilayah_id, result.profil_kode);
    } else {
      openPanel(result.wilayah_id);
    }
  };

  return (
    <div className="max-h-[360px] overflow-y-auto border-t border-talis-stone-700/15 pt-3">
      {status === "loading" && (
        <div className="space-y-2">
          <LoadingSkeleton shape="text" count={3} />
          <LoadingSkeleton shape="card" />
        </div>
      )}

      {status === "error" && ownsCurrentResults && (
        <ErrorState
          title="Pencarian gagal"
          description={error ?? "Adapter discovery tidak mengembalikan hasil."}
          onRetry={() => void runSearch()}
          className="border-none bg-transparent p-2"
        />
      )}

      {status === "empty" && ownsCurrentResults && (
        <EmptyState
          title={
            mode === "criteria"
              ? "Tidak ada wilayah memenuhi kriteria. Longgarkan filter atau coba mode lain."
              : "Tidak ada wilayah dalam batas budget."
          }
          description={
            mode === "opportunity"
              ? "Naikkan budget maksimum per m2 atau coba sektor target lain."
              : undefined
          }
          className="py-8"
        />
      )}

      {status === "success" && ownsCurrentResults && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="font-sans text-xs font-semibold uppercase text-talis-stone-700">
              {mode === "criteria" ? "Ranking Kriteria" : "Top Opportunity"}
            </p>
            <p className="font-mono text-xs text-talis-stone-700">{results.length} wilayah</p>
          </div>

          {results.map((result, index) =>
            mode === "opportunity" ? (
              <OpportunityResultRow
                key={result.wilayah_id}
                rank={index + 1}
                result={result}
                onSelect={selectResult}
              />
            ) : (
              <CriteriaResultRow
                key={result.wilayah_id}
                rank={index + 1}
                result={result}
                onSelect={selectResult}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function CriteriaResultRow({
  rank,
  result,
  onSelect,
}: {
  rank: number;
  result: SearchResultRowType;
  onSelect(result: SearchResultRowType): void;
}) {
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
          {result.sector_signal ?? "Sinyal sektor"}{" "}
          {result.sector_signal_score !== undefined ? result.sector_signal_score : "-"} ·{" "}
          {formatCompactRupiah(result.median_land_price)}
        </span>
        <span className="block line-clamp-2 font-sans text-xs leading-snug text-talis-stone-700">
          {result.highlight_reason}
        </span>
      </span>
      <ScoreBadge value={result.skor_potensi} size="sm" label="Skor" />
    </button>
  );
}

export default SearchResultsOverlay;
