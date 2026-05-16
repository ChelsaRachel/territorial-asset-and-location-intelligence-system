"use client";

import { useActiveProfile, useHydrationStatus } from "@/lib/store/useActiveProfile";
import { TerritoryMarketAccessSectionA4 } from "./sections/TerritoryMarketAccessSectionA4";
import { TerritoryProfileSectionA2 } from "./sections/TerritoryProfileSectionA2";
import { TerritoryZoningSectionA3 } from "./sections/TerritoryZoningSectionA3";

export function TerritoryProfilePage() {
  const activeProfile = useActiveProfile();
  const hydrationStatus = useHydrationStatus();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pt-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-talis-stone-900">
            {activeProfile ? activeProfile.nama : "Profil Wilayah"}
          </h1>
          <p className="mt-1 font-sans text-sm text-talis-stone-700">
            {activeProfile
              ? `${activeProfile.kabupaten}, ${activeProfile.provinsi}`
              : hydrationStatus === "pending"
                ? "Memuat active profile"
                : "Active profile belum tersedia"}
          </p>
        </div>
      </header>

      <TerritoryProfileSectionA2 />
      <TerritoryZoningSectionA3 />
      <TerritoryMarketAccessSectionA4 />
    </div>
  );
}