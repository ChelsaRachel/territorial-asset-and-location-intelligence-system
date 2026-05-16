'use client';

import { useState } from 'react';
import type { LngLatBounds } from 'mapbox-gl';
import { TalisMapboxMap } from '@/components/maps/TalisMapboxMap';
import {
  INDONESIA_CENTER_LNG_LAT,
  INDONESIA_ZOOM,
  MAP_MIN_ZOOM,
  MAP_MAX_ZOOM,
} from '@/lib/maps/mapboxConfig';
import { SampleProfileMarkers } from './SampleProfileMarkers';
import { MapSelectionController, type MapSelectionTarget } from './MapSelectionController';
import { SearchResultMarkers } from './SearchResultMarkers';

interface CommandCenterMapProps {
  selectedLocation: MapSelectionTarget | null;
}

export function CommandCenterMap({ selectedLocation }: CommandCenterMapProps) {
  const [bounds, setBounds] = useState<LngLatBounds | null>(null);

  const syncBounds = (map: { getBounds(): LngLatBounds | null }) => {
    setBounds(map.getBounds());
  };

  return (
    <TalisMapboxMap
      initialViewState={{
        longitude: INDONESIA_CENTER_LNG_LAT[0],
        latitude: INDONESIA_CENTER_LNG_LAT[1],
        zoom: INDONESIA_ZOOM,
      }}
      minZoom={MAP_MIN_ZOOM}
      maxZoom={MAP_MAX_ZOOM}
      scrollZoom
      navigationControl
      className="w-full h-full"
      style={{ background: 'var(--talis-stone-900, #1a1614)' }}
      onLoad={(event) => syncBounds(event.target)}
      onMoveEnd={(event) => syncBounds(event.target)}
      onZoomEnd={(event) => syncBounds(event.target)}
    >
      <MapSelectionController target={selectedLocation} />
      <SearchResultMarkers selectedLocation={selectedLocation} bounds={bounds} />
      <SampleProfileMarkers />
    </TalisMapboxMap>
  );
}
