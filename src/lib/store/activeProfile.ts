"use client";
import { create } from "zustand";
import type { WilayahProfile } from "./profileSlug";
import { buildSlugMap, profileToSlug } from "./profileSlug";

type HydrationStatus = "pending" | "ready" | "error";

interface ActiveProfileSlice {
  availableProfiles: WilayahProfile[];
  activeProfile: WilayahProfile | null;
  hydrationStatus: HydrationStatus;
  error: string | null;
  setActiveProfile: (slugOrKode: string) => void;
  _initialize: (profiles: WilayahProfile[]) => void;
  _setHydrationStatus: (status: HydrationStatus, error?: string) => void;
}

export const useActiveProfileStore = create<ActiveProfileSlice>((set, get) => ({
  availableProfiles: [],
  activeProfile: null,
  hydrationStatus: "pending",
  error: null,

  setActiveProfile: (slugOrKode: string) => {
    const { availableProfiles, activeProfile } = get();
    const slugMap = buildSlugMap(availableProfiles);
    const profile =
      slugMap.get(slugOrKode) ??
      availableProfiles.find((p) => p.profil_kode === slugOrKode) ??
      null;

    if (!profile) {
      console.warn(`[activeProfile] Unknown slug/kode: "${slugOrKode}"`);
      return;
    }

    const currentSlug = activeProfile ? profileToSlug(activeProfile) : null;
    const newSlug = profileToSlug(profile);
    if (currentSlug === newSlug) return;

    set({ activeProfile: profile });
  },

  _initialize: (profiles: WilayahProfile[]) => {
    set({ availableProfiles: profiles });
  },

  _setHydrationStatus: (status: HydrationStatus, error?: string) => {
    set({ hydrationStatus: status, error: error ?? null });
  },
}));
