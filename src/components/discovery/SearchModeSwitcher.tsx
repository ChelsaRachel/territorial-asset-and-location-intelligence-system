"use client";

import {
  useDiscoveryActions,
  useDiscoverySearchMode,
  type SearchMode,
} from "@/lib/store/useDiscovery";

const SEARCH_MODES: Array<{ mode: SearchMode; label: string }> = [
  { mode: "location", label: "Location" },
  { mode: "criteria", label: "Criteria" },
  { mode: "opportunity", label: "Opportunity" },
];

export function SearchModeSwitcher() {
  const activeMode = useDiscoverySearchMode();
  const { setSearchMode } = useDiscoveryActions();

  return (
    <div
      role="tablist"
      aria-label="Search mode"
      className="grid grid-cols-3 rounded-md bg-talis-stone-700/10 p-1"
    >
      {SEARCH_MODES.map(({ mode, label }) => {
        const isActive = activeMode === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setSearchMode(mode)}
            className={[
              "h-8 rounded px-3 font-sans text-xs font-medium transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-talis-green-700",
              isActive
                ? "bg-talis-green-700 text-white shadow-sm"
                : "text-talis-stone-700 hover:bg-white/70 hover:text-talis-stone-900",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
