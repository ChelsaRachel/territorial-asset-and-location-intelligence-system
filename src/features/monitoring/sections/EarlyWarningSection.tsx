"use client";
// SPRINT-07 TASK-005 — Section B.3: Early Warning Alert
// Uses useMonitoring().alerts populated by MonitoringPage's fetch.
// Leaflet map lazy-loaded via AlertMiniMap.dynamic.tsx.

import { useEffect, useRef } from "react";
import { SectionInfo, EmptyState, ErrorState } from "@/components/ui";
import { AlertMiniMap } from "../components/AlertMiniMap.dynamic";
import type { AlertMiniMapHandle } from "../components/AlertMiniMap.dynamic";
import { AlertFilterBar } from "../components/AlertFilterBar";
import { AlertCard } from "../components/AlertCard";
import { useMonitoringAlerts, useMonitoringFilter } from "@/lib/store/useMonitoring";
import type { Alert } from "@/lib/types/monitoring";

// Wilayah centroids for default map center (fallback when no alerts)
const WILAYAH_CENTROIDS: Record<number, [number, number]> = {
  1206090: [3.1968, 98.5095], // Berastagi
  3204170: [-7.08, 107.42],   // Ciwidey
  5103060: [-8.6905, 115.1729], // Seminyak
};

interface EarlyWarningSectionProps {
  wilayahId: number | null;
}

export function EarlyWarningSection({ wilayahId }: EarlyWarningSectionProps) {
  const mapRef = useRef<AlertMiniMapHandle>(null);
  const allAlerts = useMonitoringAlerts();
  const { alertFilter } = useMonitoringFilter();

  // Alerts for this wilayah only
  const wilayahAlerts = wilayahId
    ? allAlerts.filter((a) => a.wilayah_id === wilayahId)
    : [];

  // Apply filters
  // Apply filters — empty severity array means "show all"
  const filtered = wilayahAlerts.filter(
    (a) =>
      alertFilter.tipe.includes(a.tipe) &&
      (alertFilter.severity.length === 0 || alertFilter.severity.includes(a.severity)) &&
      a.status !== "FALSE_POSITIVE",
  );

  // Alerts shown on the map (all non-false-positive for the wilayah)
  const mapAlerts: Alert[] = wilayahAlerts.filter((a) => a.status !== "FALSE_POSITIVE");

  // Map center: first alert location or wilayah centroid or Indonesia center
  const centroid = wilayahId ? (WILAYAH_CENTROIDS[wilayahId] ?? [3.1968, 98.5095]) : [3.1968, 98.5095];
  const mapCenter =
    mapAlerts.length > 0
      ? ([mapAlerts[0]!.lokasi.lat, mapAlerts[0]!.lokasi.lng] as [number, number])
      : (centroid as [number, number]);

  function handleLihatDiPeta(alertId: string) {
    mapRef.current?.panToAlert(alertId);
  }

  const hasNoAlerts = wilayahId !== null && wilayahAlerts.length === 0 && allAlerts.length > 0;
  const hasFilterEmpty = wilayahAlerts.length > 0 && filtered.length === 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash.startsWith("alert-")) return;
    let frame = 0;
    frame = window.requestAnimationFrame(() => {
      const node = document.getElementById(hash);
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.classList.add("alert-hash-pulse");
      window.setTimeout(() => node.classList.remove("alert-hash-pulse"), 2000);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [filtered.length]);

  return (
    <section className="rounded-xl border border-talis-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <SectionInfo
          title="Peringatan Dini Wilayah"
          description="Pantau alert aktif: konversi lahan, kekeringan, banjir, dan penurunan produktivitas. Klik marker peta untuk zoom ke lokasi."
        />
        <button
          disabled
          aria-label="Ekspor Laporan Alert (tersedia di SPRINT-08)"
          className="rounded border border-talis-stone-200 px-3 py-1.5 font-sans text-xs text-talis-stone-400 cursor-not-allowed"
        >
          Ekspor
        </button>
      </div>

      {hasNoAlerts ? (
        <EmptyState
          className="mt-4"
          title="Tidak ada alert aktif untuk wilayah ini. 🎉"
          description="Semua indikator dalam kondisi normal untuk periode ini."
        />
      ) : (
        <div className="mt-4 space-y-4">
          {/* 2-column: map + filter */}
          <div className="flex gap-4">
            <div className="w-2/3">
              <AlertMiniMap
                ref={mapRef}
                alerts={mapAlerts}
                centerLat={mapCenter[0]}
                centerLng={mapCenter[1]}
              />
            </div>
            <div className="w-1/3 rounded-lg border border-talis-stone-100 bg-talis-stone-50 p-4">
              <AlertFilterBar />
            </div>
          </div>

          {/* Alert cards */}
          {hasFilterEmpty ? (
            <EmptyState
              title="Tidak ada alert sesuai filter yang dipilih."
              description="Sesuaikan filter tipe atau keparahan untuk melihat alert."
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onLihatDiPeta={handleLihatDiPeta} />
              ))}
            </div>
          )}
        </div>
      )}

      <ErrorState className="hidden" title="Gagal memuat alert" />
    </section>
  );
}
