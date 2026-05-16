"use client";

import { useCallback } from "react";
import { FileText } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { EmptyState, ErrorState, LoadingSkeleton, SectionInfo } from "@/components/ui";
import type { TerritoryProfile } from "@/lib/types/territory";
import { AutomaticAnalysisCard } from "../a2/AutomaticAnalysisCard";
import { InfrastructureIndexPanel } from "../a2/InfrastructureIndexPanel";
import { LandCompositionDonut } from "../a2/LandCompositionDonut";
import { TerritoryBasicProfile } from "../a2/TerritoryBasicProfile";
import { useTerritorySectionData } from "../useTerritorySectionData";
import { errorDescription, isNotFoundError } from "./sectionState";

export function TerritoryProfileSectionA2() {
  const fetchProfile = useCallback(
    (wilayahId: number): Promise<TerritoryProfile> => apiClient.territory.getProfile(wilayahId),
    [],
  );
  const { activeProfile, data, loading, error, retry } = useTerritorySectionData(fetchProfile);

  return (
    <section className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="Profil Dasar Wilayah"
        description={activeProfile ? `${activeProfile.nama}, ${activeProfile.kabupaten}` : undefined}
        lastUpdated={data?.last_updated}
        tooltip="A.2 berisi demografi, kesiapan infrastruktur, dan analisis dasar wilayah."
        icon={<FileText aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton shape="card" count={2} />
          <LoadingSkeleton shape="text" count={3} />
        </div>
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Profil dasar belum tersedia"
            description="Fixture SPRINT-03 baru tersedia untuk Ciwidey, Seminyak, dan Berastagi."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data ? (
        <div className="space-y-4">
          <TerritoryBasicProfile profile={data} />
          <div className="grid gap-4 xl:grid-cols-2">
            <InfrastructureIndexPanel profile={data} />
            <LandCompositionDonut rows={data.komposisi_lahan} />
          </div>
          <AutomaticAnalysisCard profile={data} />
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Profil dasar akan muncul setelah active profile tersedia."
        />
      )}
    </section>
  );
}
