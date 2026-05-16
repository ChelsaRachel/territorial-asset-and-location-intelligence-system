"use client";

import { useEffect, useRef } from "react";
import { useQueryState } from "nuqs";
import { apiClient } from "@/lib/api/apiClient";
import { useActiveProfileStore } from "./activeProfile";
import { buildSlugMap, profileToSlug } from "./profileSlug";
import type { WilayahProfile } from "./profileSlug";

const LS_KEY = "talis.active_profile.v1";

export function ActiveProfileProvider({ children }: { children: React.ReactNode }) {
  const [urlSlug, setUrlSlug] = useQueryState("profile");
  const initialized = useRef(false);
  const suppressUrlSync = useRef(false);
  const store = useActiveProfileStore();

  // Sync URL when setActiveProfile is called
  useEffect(() => {
    const unsub = useActiveProfileStore.subscribe((state, prev) => {
      if (state.activeProfile === prev.activeProfile) return;
      if (!state.activeProfile) return;
      const slug = profileToSlug(state.activeProfile);
      if (!suppressUrlSync.current) {
        setUrlSlug(slug);
      }
      try {
        localStorage.setItem(LS_KEY, slug);
      } catch {
        // localStorage unavailable (SSR or private mode with storage blocked)
      }
    });
    return unsub;
  }, [setUrlSlug]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    store._setHydrationStatus("pending");

    apiClient.discovery
      .getProfiles()
      .then((response) => {
        const joined = response.profiles as unknown as WilayahProfile[];
        store._initialize(joined);

        const slugMap = buildSlugMap(joined);

        const defaultProfile = joined.find((p) => p.is_default) ?? joined[0] ?? null;

        let lsSlug: string | null = null;
        try {
          lsSlug = localStorage.getItem(LS_KEY);
        } catch {
          // unavailable
        }

        const resolved =
          (urlSlug ? slugMap.get(urlSlug) : undefined) ??
          (lsSlug ? slugMap.get(lsSlug) : undefined) ??
          defaultProfile;

        if (!resolved) {
          store._setHydrationStatus("error", "No profiles available");
          return;
        }

        suppressUrlSync.current = true;
        useActiveProfileStore.setState({ activeProfile: resolved });
        suppressUrlSync.current = false;
        store._setHydrationStatus("ready");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[ActiveProfileProvider] getProfiles failed:", msg);
        store._setHydrationStatus("error", msg);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
