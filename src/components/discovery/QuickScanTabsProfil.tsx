"use client";

import { useAvailableProfiles } from "@/lib/store/useActiveProfile";
import { useDiscoveryActions } from "@/lib/store/useDiscovery";
import { profilKodeToTabLabel, PROFIL_TAB_ORDER } from "./quickScanHelpers";

interface QuickScanTabsProfilProps {
  activePanelTab: string;
}

/**
 * Renders the 3-tab profil strip at the top of the Quick Scan panel.
 *
 * Note: clicking a tab calls setPanelTab (local panel concern) — it does NOT call
 * setActiveProfile. Switching the profil angle inside the panel shows the same wilayah
 * through a different investment lens; the global active profile (which controls the map
 * marker and URL ?profile=) stays unchanged.
 *
 * Hidden for non-sample wilayah (TASK-005 design decision): those wilayah have only one
 * logical view (their wilayah_score_aggregate row), so the tab strip is omitted.
 */
export function QuickScanTabsProfil({ activePanelTab }: QuickScanTabsProfilProps) {
  // marker_color comes from the SPRINT-01 availableProfiles cache — avoids hardcoding hex
  const availableProfiles = useAvailableProfiles();
  const { setPanelTab } = useDiscoveryActions();

  return (
    <div className="flex gap-1.5" role="tablist" aria-label="Profil investasi">
      {PROFIL_TAB_ORDER.map((kode) => {
        const profile = availableProfiles.find((p) => p.profil_kode === kode);
        const isActive = activePanelTab === kode;
        const markerColor = profile?.marker_color;

        return (
          <button
            key={kode}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              // setPanelTab does NOT call setActiveProfile — local panel concern only.
              // See discovery.ts slice comment and §7.4 guardrails in checklist.md.
              setPanelTab(kode);
            }}
            className={[
              "flex-1 rounded-full px-2 py-1.5 font-sans text-xs font-medium transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-talis-green-700",
              isActive
                ? "text-talis-stone-50"
                : "border border-talis-stone-700/30 text-talis-stone-700 hover:bg-talis-stone-700/5",
            ].join(" ")}
            style={isActive && markerColor ? { backgroundColor: markerColor } : undefined}
          >
            {profilKodeToTabLabel(kode)}
          </button>
        );
      })}
    </div>
  );
}

export default QuickScanTabsProfil;
