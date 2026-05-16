"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useActiveProfile, useHydrationStatus } from "@/lib/store/useActiveProfile";
import { parseSectionParam, SECTION_LABELS, VALID_SECTIONS } from "@/lib/url/intelligenceSection";
import type { ValidSection } from "@/lib/url/intelligenceSection";
import { HEADER_HEIGHT_PX } from "@/lib/ui/tokens";
import { TrendSection } from "./sections/TrendSection";
import { DemandSection } from "./sections/DemandSection";
import { LandValueSection } from "./sections/LandValueSection";
import { GrowthProjectionSection } from "./sections/GrowthProjectionSection";

const SECTION_COMPONENTS: Record<ValidSection, React.ReactNode> = {
  A5: <TrendSection />,
  A6: <DemandSection />,
  A7: <LandValueSection />,
  A8: <GrowthProjectionSection />,
};

export function IntelligencePage() {
  const activeProfile = useActiveProfile();
  const hydrationStatus = useHydrationStatus();
  const searchParams = useSearchParams();
  const [highlightedSection, setHighlightedSection] = useState<ValidSection | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sectionParam = parseSectionParam(searchParams.get("section"));

  useEffect(() => {
    if (!sectionParam) return;

    const scrollAndHighlight = () => {
      const el = document.getElementById(sectionParam);
      if (!el) return;

      const offset = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT_PX - 12;
      window.scrollTo({ top: offset, behavior: "smooth" });

      setHighlightedSection(sectionParam);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => setHighlightedSection(null), 1500);
    };

    // Defer one frame so section wrappers are in the DOM after hydration.
    const raf = requestAnimationFrame(scrollAndHighlight);

    return () => {
      cancelAnimationFrame(raf);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [sectionParam]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pt-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-talis-stone-900">
            {activeProfile ? activeProfile.nama : "Intelijen Wilayah"}
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

      {VALID_SECTIONS.map((sectionId) => (
        <section
          key={sectionId}
          id={sectionId}
          aria-label={SECTION_LABELS[sectionId]}
          data-section={sectionId}
          className={
            highlightedSection === sectionId
              ? "rounded-lg outline outline-2 outline-offset-2 outline-talis-green-700 transition-all"
              : undefined
          }
        >
          {SECTION_COMPONENTS[sectionId]}
        </section>
      ))}
    </div>
  );
}