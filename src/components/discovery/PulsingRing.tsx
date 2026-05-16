'use client';

import { Marker } from 'react-map-gl/mapbox';

interface PulsingRingProps {
  position: [number, number];
}

export function PulsingRing({ position }: PulsingRingProps) {
  const [lat, lng] = position;

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="center"
      style={{ pointerEvents: 'none', zIndex: 30 }}
    >
      <div className="talis-pulsing-ring" aria-hidden="true" />
    </Marker>
  );
}
