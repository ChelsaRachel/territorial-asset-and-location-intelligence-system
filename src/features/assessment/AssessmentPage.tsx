"use client";

import { useEffect } from "react";
import { useActiveProfile, useHydrationStatus } from "@/lib/store/useActiveProfile";
import { useAssessmentStore } from "@/lib/store/assessment";
import { dominantSektor } from "@/lib/discovery/quickScanDerivation";
import { LocationScoringSection } from "./sections/LocationScoringSection";
import { RiskProfileSection } from "./sections/RiskProfileSection";
import { FeasibilitySection } from "./sections/FeasibilitySection";
import { FinancialViabilitySection } from "./sections/FinancialViabilitySection";
import { InvestmentSummarySection } from "./sections/InvestmentSummarySection";

export function AssessmentPage() {
  const activeProfile = useActiveProfile();
  const hydrationStatus = useHydrationStatus();
  const setDefaultSektor = useAssessmentStore((state) => state.setDefaultSektor);

  useEffect(() => {
    if (activeProfile) setDefaultSektor(dominantSektor(activeProfile.profil_kode));
  }, [activeProfile, setDefaultSektor]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pt-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-talis-stone-900">
            {activeProfile ? activeProfile.nama : "Investment Assessment"}
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

      <LocationScoringSection />
      <RiskProfileSection />
      <FeasibilitySection />
      <FinancialViabilitySection />
      <InvestmentSummarySection />
    </div>
  );
}