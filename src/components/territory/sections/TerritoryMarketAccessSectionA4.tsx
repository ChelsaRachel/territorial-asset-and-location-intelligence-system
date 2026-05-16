"use client";

import { useCallback } from "react";
import { Route } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { EmptyState, ErrorState, LoadingSkeleton, SectionInfo } from "@/components/ui";
import type { TerritoryMarketAccess } from "@/lib/types/territory";
import { MarketAccessRouteMap } from "../a4/MarketAccessRouteMap.dynamic";
import { MarketAccessTable } from "../a4/MarketAccessTable";
import { MarketAccessScorePanel } from "../a4/MarketAccessScorePanel";
import { MarketAccessRadar } from "../a4/MarketAccessRadar";
import { BottleneckAnalysisCard } from "../a4/BottleneckAnalysisCard";
import { useTerritorySectionData } from "../useTerritorySectionData";
import { errorDescription, isNotFoundError } from "./sectionState";

export function TerritoryMarketAccessSectionA4() {
  const fetchMarketAccess = useCallback(
    (wilayahId: number): Promise<TerritoryMarketAccess> =>
      apiClient.territory.getMarketAccess(wilayahId, { includeRoutes: true }),
    [],
  );
  const { activeProfile, data, loading, error, retry } = useTerritorySectionData(fetchMarketAccess);

  return (
    <section className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      <SectionInfo
        title="Akses Pasar & Distribusi"
        lastUpdated={data?.last_computed_at}
        tooltip="A.4 berisi ringkasan akses ke pelabuhan, bandara, pasar, ibukota provinsi, dan jalan nasional."
        icon={<Route aria-hidden="true" className="h-5 w-5" />}
      />

      {loading ? (
        <LoadingSkeleton shape="card" count={2} />
      ) : error ? (
        isNotFoundError(error) ? (
          <EmptyState
            title="Data akses pasar belum tersedia"
            description="Fixture SPRINT-03 baru tersedia untuk Ciwidey, Seminyak, dan Berastagi."
          />
        ) : (
          <ErrorState description={errorDescription(error)} onRetry={retry} />
        )
      ) : data && activeProfile ? (
        <div className="space-y-4">
          {/* A.4 route map */}
          {data.destinations.length > 0 ? (
            <MarketAccessRouteMap
              center={[activeProfile.lat, activeProfile.lng]}
              destinations={data.destinations}
            />
          ) : (
            <EmptyState
              title="Rute akses pasar belum tersedia"
              description="Data rute strategis untuk wilayah aktif belum tersedia di fixture."
            />
          )}

          {/* 2-column: destinations table (left) + score panel + radar (right) */}
          {data.destinations.length > 0 && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr,320px]">
              <MarketAccessTable destinations={data.destinations} />

              <div className="space-y-4">
                <MarketAccessScorePanel data={data} />
                <MarketAccessRadar breakdown={data.score_breakdown} />
              </div>
            </div>
          )}

          {/* Bottleneck Analysis card — full width */}
          <BottleneckAnalysisCard data={data} />
        </div>
      ) : (
        <EmptyState
          title="Pilih wilayah aktif"
          description="Ringkasan akses pasar akan muncul setelah active profile tersedia."
        />
      )}
    </section>
  );
}
