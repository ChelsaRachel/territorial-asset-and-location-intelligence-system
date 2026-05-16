"use client";

import { useDiscoveryPanel, useDiscoverySearchMode } from "@/lib/store/useDiscovery";
import type { MapSelectionTarget } from "./MapSelectionController";
import { CriteriaSearchForm } from "./CriteriaSearchForm";
import { LocationSearch } from "./LocationSearch";
import { OpportunitySearchForm } from "./OpportunitySearchForm";
import { SearchResultsOverlay } from "./SearchResultsOverlay";
import { SearchModeSwitcher } from "./SearchModeSwitcher";

interface CommandCenterSearchProps {
  onSelectLocation(target: MapSelectionTarget): void;
}

export function CommandCenterSearch({ onSelectLocation }: CommandCenterSearchProps) {
  const mode = useDiscoverySearchMode();
  const { open: panelOpen } = useDiscoveryPanel();
  const rightClass = panelOpen ? "right-[356px]" : "right-4";
  const overflowClass = mode === "location" ? "overflow-visible" : "overflow-y-auto";

  return (
    <section
      aria-label="Command Center search"
      className={[
        "pointer-events-auto absolute top-4 z-40 max-h-[calc(100%-2rem)] w-[390px] rounded-lg border border-white/45 bg-talis-stone-50/95 p-3 shadow-xl backdrop-blur transition-[right]",
        overflowClass,
        rightClass,
      ].join(" ")}
    >
      <div className="space-y-3">
        <SearchModeSwitcher />
        {mode === "location" && <LocationSearch onSelectLocation={onSelectLocation} />}
        {mode === "criteria" && <CriteriaSearchForm />}
        {mode === "opportunity" && <OpportunitySearchForm />}
        <SearchResultsOverlay onSelectLocation={onSelectLocation} />
      </div>
    </section>
  );
}
