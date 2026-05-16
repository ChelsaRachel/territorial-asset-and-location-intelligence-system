"use client";

import { useEffect } from "react";
import { useMap } from "react-map-gl/mapbox";
import type { SearchResultRow } from "@/lib/store/useDiscovery";

export interface MapSelectionTarget {
  wilayahId: number;
  lat: number;
  lng: number;
  zoom?: number;
  source?: "location" | "criteria" | "opportunity";
  result?: SearchResultRow;
}

export function MapSelectionController({ target }: { target: MapSelectionTarget | null }) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!target || !map) return;
    map.flyTo({
      center: [target.lng, target.lat],
      zoom: target.zoom ?? 11,
      duration: 750,
    });
  }, [map, target]);

  return null;
}
