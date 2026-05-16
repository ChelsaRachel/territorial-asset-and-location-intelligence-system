"use client";

import { useCallback } from "react";
import { Map } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { EmptyState, ErrorState, LoadingSkeleton, SectionInfo } from "@/components/ui";
import type { TerritoryMapLayers, TerritoryZoning } from "@/lib/types/territory";
import { ZoningCompliancePanel } from "../a3/ZoningCompliancePanel";
import { ZoningImplicationPanels } from "../a3/ZoningImplicationPanels";
import { ZoningMiniMap } from "../a3/ZoningMiniMap.dynamic";
import { useTerritorySectionData } from "../useTerritorySectionData";
import { errorDescription, isNotFoundError } from "./sectionState";

interface ZoningSectionData {
  zoning: TerritoryZoning;
  mapLayers: TerritoryMapLayers;
}

export function TerritoryZoningSectionA3() {
  const fetchZoning = useCallback(
    async (wilayahId: number): Promise<ZoningSectionData> => {
      const [zoning, mapLayers] = await Promise.all([
        apiClient.territory.getZoning(wilayahId),
        apiClient.territory.getMapLayers(wilayahId),
      ]);
      return { zoning, mapLayers };
    },
    [],
  );
  const { activeProfile, data, loading, error, retry } = useTerritorySectionData(fetchZoning);
  const zoning = data?.zoning;
  const mapLayers = data?.mapLayers;

  return (
    <section className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="Tata Ruang & Regulasi"
        lastUpdated={zoning?.last_computed_at}
        tooltip="A.3 berisi ringkasan kepatuhan zoning dan referensi layer RTRW/aktual."
        icon={<Map aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <LoadingSkeleton shape="card" count={2} />
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data tata ruang belum tersedia"
            description="Fixture SPRINT-03 baru tersedia untuk Ciwidey, Seminyak, dan Berastagi."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : zoning && mapLayers && activeProfile ? (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(320px,0.65fr)] xl:items-start">
            <ZoningMiniMap
              wilayahId={zoning.wilayah_id}
              center={[activeProfile.lat, activeProfile.lng]}
              layers={mapLayers.layers}
              featureCollection={mapLayers.feature_collection}
              rdtrAvailable={zoning.rdtr_available}
            />
            <ZoningCompliancePanel zoning={zoning} />
          </div>
          <ZoningImplicationPanels zoning={zoning} />
        </div>
      ) : data ? (
        <ZoningCompliancePanel zoning={data.zoning} />
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Ringkasan tata ruang akan muncul setelah active profile tersedia."
        />
      )}
    </section>
  );
}
