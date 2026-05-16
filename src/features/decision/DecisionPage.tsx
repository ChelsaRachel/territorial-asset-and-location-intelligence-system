"use client";
// SPRINT-06 — Page 5: Investment Decision
// Four sections: LandBanking, BusinessRecommender, Compare, Shortlist.
// Each section manages its own fetch state independently.

import { useEffect } from "react";
import { useActiveProfile, useHydrationStatus } from "@/lib/store/useActiveProfile";
import { useComparisonStore } from "@/lib/store/comparison";
import { LandBankingSection } from "./sections/LandBankingSection";
import { BusinessRecommenderSection } from "./sections/BusinessRecommenderSection";
import { CompareSection } from "./sections/CompareSection";
import { ShortlistSection } from "./sections/ShortlistSection";
import { SimulateDelta } from "./dev/SimulateDelta";

export function DecisionPage() {
  const activeProfile = useActiveProfile();
  const hydrationStatus = useHydrationStatus();
  const setActiveWilayah = useComparisonStore((s) => s.setActiveWilayah);

  // Seed active wilayah into comparison store when profile resolves
  useEffect(() => {
    if (activeProfile) {
      setActiveWilayah(activeProfile.wilayah_id);
    }
  }, [activeProfile, setActiveWilayah]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pt-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-talis-stone-900">
            {activeProfile ? activeProfile.nama : "Investment Decision"}
          </h1>
          <p className="mt-1 font-sans text-sm text-talis-stone-700">
            {activeProfile
              ? `${activeProfile.kabupaten}, ${activeProfile.provinsi}`
              : hydrationStatus === "pending"
                ? "Memuat active profile…"
                : "Active profile belum tersedia"}
          </p>
        </div>
      </header>

      <LandBankingSection />
      <BusinessRecommenderSection />
      <CompareSection />
      <ShortlistSection />
      {process.env.NODE_ENV === "development" && <SimulateDelta />}
    </div>
  );
}