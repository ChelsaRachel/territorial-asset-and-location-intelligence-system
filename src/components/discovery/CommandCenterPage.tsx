'use client';

import { useState } from 'react';
import { CommandCenterMap } from './CommandCenterMap.dynamic';
import { CommandCenterSearch } from './CommandCenterSearch';
import { QuickScanPanel } from './QuickScanPanel';
import type { MapSelectionTarget } from './MapSelectionController';

export function CommandCenterPage() {
  const [selectedLocation, setSelectedLocation] = useState<MapSelectionTarget | null>(null);

  return (
    <div className="fixed bottom-0 left-[var(--talis-sidebar-width)] right-0 top-[var(--talis-header-height)] isolate overflow-hidden bg-talis-stone-900">
      <div className="absolute inset-0 z-0">
        <CommandCenterMap selectedLocation={selectedLocation} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-20">
        <CommandCenterSearch onSelectLocation={setSelectedLocation} />
      </div>
      <QuickScanPanel />
    </div>
  );
}
