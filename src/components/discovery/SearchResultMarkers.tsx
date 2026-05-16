"use client";

import { useMemo } from "react";
import type { LngLatBounds } from "mapbox-gl";
import {
  useDiscoveryActions,
  useDiscoverySearchMode,
  useDiscoverySearchResultMode,
  useDiscoverySearchResults,
  useDiscoverySearchStatus,
  type SearchResultRow,
} from "@/lib/store/useDiscovery";
import { ScoreRecolorMarker } from "./ScoreRecolorMarker";
import type { MapSelectionTarget } from "./MapSelectionController";

interface SearchResultMarkersProps {
  selectedLocation: MapSelectionTarget | null;
  bounds: LngLatBounds | null;
}

export function SearchResultMarkers({ selectedLocation, bounds }: SearchResultMarkersProps) {
  const mode = useDiscoverySearchMode();
  const resultMode = useDiscoverySearchResultMode();
  const status = useDiscoverySearchStatus();
  const results = useDiscoverySearchResults();
  const { openPanel } = useDiscoveryActions();

  // Capture location search result for marker/popup regardless of profil_kode.
  // Criteria/opportunity results render through the normal visibleResults path instead.
  const selectedLocationResult =
    selectedLocation?.source === "location" && selectedLocation.result
      ? selectedLocation.result
      : null;

  const visibleResults = useMemo(() => {
    const rows: SearchResultRow[] = [];

    if (mode === "criteria" && resultMode === "criteria" && status === "success") {
      rows.push(
        ...results.filter((result) => {
          if (result.profil_kode) return false;
          if (!bounds) return false;
          return bounds.contains([result.lng, result.lat]);
        }),
      );
    }

    if (
      selectedLocationResult &&
      !rows.some((result) => result.wilayah_id === selectedLocationResult.wilayah_id)
    ) {
      rows.push(selectedLocationResult);
    }

    return rows;
  }, [bounds, mode, resultMode, results, selectedLocationResult, status]);

  const selectResult = (result: SearchResultRow) => {
    openPanel(result.wilayah_id, result.profil_kode);
  };

  return (
    <>
      {visibleResults.map((result) => (
        <ScoreRecolorMarker
          key={result.wilayah_id}
          result={result}
          onSelect={selectResult}
          autoOpen={selectedLocationResult?.wilayah_id === result.wilayah_id}
        />
      ))}
    </>
  );
}

export default SearchResultMarkers;
