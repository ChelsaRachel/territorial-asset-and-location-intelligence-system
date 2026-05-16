import { useShallow } from "zustand/react/shallow";
import { useActiveProfileStore } from "./activeProfile";
import type { WilayahProfile } from "./profileSlug";

export function useActiveProfile(): WilayahProfile | null {
  return useActiveProfileStore((s) => s.activeProfile);
}

export function useActiveProfileActions(): { setActiveProfile: (kode: string) => void } {
  return useActiveProfileStore(
    useShallow((s) => ({ setActiveProfile: s.setActiveProfile }))
  );
}

export function useHydrationStatus(): "pending" | "ready" | "error" {
  return useActiveProfileStore((s) => s.hydrationStatus);
}

export function useAvailableProfiles(): WilayahProfile[] {
  return useActiveProfileStore((s) => s.availableProfiles);
}
