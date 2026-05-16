"use client";
// SPRINT-07 TASK-005 — Alert mini map (Mapbox, SSR-disabled via dynamic import)
// Exposes panToAlert(alertId) via ref for "Lihat di Peta" button.

import { Fragment, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { Marker, type MapRef } from "react-map-gl/mapbox";
import { TalisMapboxMap } from "@/components/maps/TalisMapboxMap";
import { TalisMapboxPopup } from "@/components/maps/TalisMapboxPopup";
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
} from "@/lib/maps/mapboxConfig";
import type { Alert } from "@/lib/types/monitoring";
import { SEVERITY_COLOR, SEVERITY_LABEL, TIPE_LABEL } from "../lib/alertFormat";

export interface AlertMiniMapHandle {
  panToAlert(alertId: string): void;
}

export interface AlertMiniMapProps {
  alerts: Alert[];
  centerLat: number;
  centerLng: number;
}

export const AlertMiniMap = forwardRef<AlertMiniMapHandle, AlertMiniMapProps>(
  function AlertMiniMap({ alerts, centerLat, centerLng }, ref) {
    const mapRef = useRef<MapRef>(null);
    const [mapReady, setMapReady] = useState(false);
    const [pulsingId, setPulsingId] = useState<string | null>(null);
    const [popupAlertId, setPopupAlertId] = useState<string | null>(null);
    const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => ({
      panToAlert(alertId: string) {
        const alert = alerts.find((a) => a.id === alertId);
        if (!alert) return;

        mapRef.current?.flyTo({
          center: [alert.lokasi.lng, alert.lokasi.lat],
          zoom: 13,
          duration: 750,
        });

        setPopupAlertId(alertId);

        if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
        setPulsingId(alertId);
        pulseTimerRef.current = setTimeout(() => setPulsingId(null), 2000);
      },
    }));

    useEffect(() => {
      return () => {
        if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      };
    }, []);

    useEffect(() => {
      if (!mapReady || !mapRef.current) return;

      mapRef.current.resize();
      mapRef.current.jumpTo({
        center: [centerLng, centerLat],
        zoom: 11,
      });
    }, [centerLat, centerLng, mapReady]);

    return (
      <div className="relative h-[300px] overflow-hidden rounded-lg border border-talis-stone-200 bg-talis-stone-900">
        <style>{`
          @keyframes alert-map-marker-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.55); opacity: 0.52; }
          }
          .alert-map-marker-pulse {
            animation: alert-map-marker-pulse 0.6s ease-in-out infinite;
          }
        `}</style>
        <TalisMapboxMap
          ref={mapRef}
          initialViewState={{
            longitude: centerLng,
            latitude: centerLat,
            zoom: 11,
          }}
          minZoom={MAP_MIN_ZOOM}
          maxZoom={MAP_MAX_ZOOM}
          scrollZoom={false}
          navigationControl
          onLoad={() => setMapReady(true)}
          style={{ background: "var(--talis-stone-900, #1a1614)" }}
        >
          {alerts.map((alert) => {
            const isPulsing = pulsingId === alert.id;
            const color = SEVERITY_COLOR[alert.severity];
            const radius = isPulsing ? 12 : alert.severity === "KRITIS" ? 9 : 7;
            const popupOpen = popupAlertId === alert.id;

            return (
              <Fragment key={alert.id}>
                <Marker
                  longitude={alert.lokasi.lng}
                  latitude={alert.lokasi.lat}
                  anchor="center"
                  style={{ zIndex: isPulsing ? 30 : 20 }}
                >
                  <button
                    type="button"
                    aria-label={`Buka alert ${TIPE_LABEL[alert.tipe]} di peta`}
                    onClick={() => setPopupAlertId(alert.id)}
                    className={`block rounded-full border-2 shadow-[0_2px_8px_rgba(0,0,0,0.42)] outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isPulsing ? "alert-map-marker-pulse" : ""
                    }`}
                    style={{
                      width: radius * 2,
                      height: radius * 2,
                      backgroundColor: color,
                      borderColor: color,
                      opacity: isPulsing ? 0.85 : 0.7,
                    }}
                  />
                </Marker>

                {popupOpen && (
                  <TalisMapboxPopup
                    longitude={alert.lokasi.lng}
                    latitude={alert.lokasi.lat}
                    onClose={() => setPopupAlertId(null)}
                  >
                    <div className="min-w-[160px] font-sans text-xs text-talis-stone-900">
                      <p className="font-semibold">{TIPE_LABEL[alert.tipe]}</p>
                      <p className="mt-0.5 text-talis-stone-600">{alert.lokasi.deskripsi}</p>
                      <p className="mt-1">
                        <span
                          className="inline-block rounded px-1 py-0.5 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {SEVERITY_LABEL[alert.severity]}
                        </span>
                      </p>
                    </div>
                  </TalisMapboxPopup>
                )}
              </Fragment>
            );
          })}
        </TalisMapboxMap>
      </div>
    );
  },
);
