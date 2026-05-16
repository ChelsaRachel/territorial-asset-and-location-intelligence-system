"use client";

import { useEffect, useState } from "react";
import { Marker } from "react-map-gl/mapbox";
import { TalisMapboxPopup } from "@/components/maps/TalisMapboxPopup";
import { scoreColor } from "@/lib/ui/scoreColor";
import { formatCompactRupiah } from "@/lib/discovery/searchResultFormat";
import type { SearchResultRow } from "@/lib/store/useDiscovery";

interface ScoreRecolorMarkerProps {
  result: SearchResultRow;
  onSelect(result: SearchResultRow): void;
  autoOpen?: boolean;
}

const MARKER_COLOR = {
  "verdict-success": "#2D6A4F",
  "verdict-warning": "#B45309",
  "verdict-danger": "#B91C1C",
};

export function ScoreRecolorMarker({ result, onSelect, autoOpen = false }: ScoreRecolorMarkerProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const color = MARKER_COLOR[scoreColor(result.skor_potensi)];

  useEffect(() => {
    if (!autoOpen) return;
    const timer = window.setTimeout(() => {
      setPopupOpen(true);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [autoOpen, result.wilayah_id]);

  return (
    <>
      <Marker longitude={result.lng} latitude={result.lat} anchor="center" style={{ zIndex: 15 }}>
        <button
          type="button"
          aria-label={`Buka Quick Scan untuk ${result.nama}`}
          onClick={() => {
            setPopupOpen(true);
            onSelect(result);
          }}
          className="block rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.45)] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-white"
          style={{
            width: 20,
            height: 20,
            backgroundColor: color,
            opacity: 0.72,
          }}
        />
      </Marker>
      {popupOpen && (
        <TalisMapboxPopup
          longitude={result.lng}
          latitude={result.lat}
          onClose={() => setPopupOpen(false)}
        >
        <div className="min-w-[160px] space-y-1 font-sans">
          <p className="text-sm font-semibold text-talis-stone-900">{result.nama}</p>
          <p className="text-xs text-talis-stone-700">
            {result.kabupaten} · {result.provinsi}
          </p>
          <p className="text-xs text-talis-stone-700">Skor Potensi {result.skor_potensi}</p>
          <p className="text-xs text-talis-stone-700">
            {formatCompactRupiah(result.median_land_price)}
          </p>
        </div>
        </TalisMapboxPopup>
      )}
    </>
  );
}

export default ScoreRecolorMarker;
