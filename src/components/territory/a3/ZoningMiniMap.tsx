"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";
import {
  Layer,
  Marker,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import { TalisMapboxLegendOverlay } from "@/components/maps/TalisMapboxLegendOverlay";
import { TalisMapboxMap } from "@/components/maps/TalisMapboxMap";
import { TalisMapboxPopup } from "@/components/maps/TalisMapboxPopup";
import { boundsFromFeatureCollection } from "@/lib/maps/bounds";
import { latLngToLngLat } from "@/lib/maps/coordinates";
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
} from "@/lib/maps/mapboxConfig";
import type {
  MapLayerMetadata,
  SimpleFeatureCollection,
} from "@/lib/types/territory";
import { ZoningLayerToggles } from "./ZoningLayerToggles";
import { ZoningLegend } from "./ZoningLegend";

export interface ZoningMiniMapProps {
  wilayahId: number;
  center: [number, number];
  layers: MapLayerMetadata[];
  featureCollection: SimpleFeatureCollection;
  rdtrAvailable: boolean;
}

interface HoverTooltip {
  longitude: number;
  latitude: number;
  label: string;
}

type MapFeatureEvent = MapMouseEvent & {
  features?: Array<{
    properties?: Record<string, unknown>;
  }>;
};

function getInitialEnabledLayers(layers: MapLayerMetadata[]): Set<MapLayerMetadata["id"]> {
  return new Set(layers.filter((layer) => layer.initially_visible).map((layer) => layer.id));
}

function readStoredEnabledLayers(wilayahId: number, layers: MapLayerMetadata[]): Set<MapLayerMetadata["id"]> {
  if (typeof window === "undefined") return getInitialEnabledLayers(layers);

  const validIds = new Set(layers.map((layer) => layer.id));
  const stored = window.sessionStorage.getItem(`talis.profile.a3.layers.${wilayahId}`);
  if (!stored) return getInitialEnabledLayers(layers);

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return getInitialEnabledLayers(layers);
    const ids = parsed.filter((id): id is MapLayerMetadata["id"] => validIds.has(id));
    return ids.length > 0 ? new Set(ids) : getInitialEnabledLayers(layers);
  } catch {
    return getInitialEnabledLayers(layers);
  }
}

const zoningFillLayer = {
  id: "zoning-fill",
  type: "fill" as const,
  paint: {
    "fill-color": ["coalesce", ["get", "color"], "#40916C"],
    "fill-opacity": [
      "case",
      ["==", ["get", "layer"], "actual_landcover"],
      0.22,
      0.26,
    ],
  },
} as LayerProps;

const zoningOutlineCasingLayer = {
  id: "zoning-outline-casing",
  type: "line" as const,
  paint: {
    "line-color": "#ffffff",
    "line-width": [
      "case",
      ["==", ["get", "layer"], "actual_landcover"],
      2.5,
      4,
    ],
    "line-opacity": 0.48,
  },
} as LayerProps;

const zoningOutlineLayer = {
  id: "zoning-outline",
  type: "line" as const,
  paint: {
    "line-color": ["coalesce", ["get", "color"], "#40916C"],
    "line-width": [
      "case",
      ["==", ["get", "layer"], "actual_landcover"],
      1,
      2,
    ],
    "line-opacity": [
      "case",
      ["==", ["get", "layer"], "actual_landcover"],
      0.72,
      0.92,
    ],
  },
} as LayerProps;

export function ZoningMiniMap({
  wilayahId,
  center,
  layers,
  featureCollection,
  rdtrAvailable,
}: ZoningMiniMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip | null>(null);
  const [centroidPopupOpen, setCentroidPopupOpen] = useState(false);
  const [enabledLayerIds, setEnabledLayerIds] = useState<Set<MapLayerMetadata["id"]>>(
    () => getInitialEnabledLayers(layers),
  );

  useEffect(() => {
    setEnabledLayerIds(readStoredEnabledLayers(wilayahId, layers));
  }, [layers, wilayahId]);

  const visibleCollection = useMemo<SimpleFeatureCollection>(() => {
    const visibleFeatures = featureCollection.features.filter((feature) => {
      const layer = feature.properties.layer;
      return typeof layer === "string" && enabledLayerIds.has(layer as MapLayerMetadata["id"]);
    });

    return {
      type: "FeatureCollection",
      features: visibleFeatures,
    };
  }, [enabledLayerIds, featureCollection]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    mapRef.current.resize();
    const bounds = boundsFromFeatureCollection(visibleCollection);

    if (bounds) {
      mapRef.current.fitBounds(bounds, {
        animate: false,
        maxZoom: 13,
        padding: 48,
      });
      return;
    }

    mapRef.current.jumpTo({
      center: latLngToLngLat(center),
      zoom: 12,
    });
  }, [center, mapReady, visibleCollection]);

  function handleToggle(layerId: MapLayerMetadata["id"]) {
    setEnabledLayerIds((current) => {
      const next = new Set(current);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }

      window.sessionStorage.setItem(
        `talis.profile.a3.layers.${wilayahId}`,
        JSON.stringify(Array.from(next)),
      );

      return next;
    });
  }

  function handleMouseMove(event: MapMouseEvent) {
    const feature = (event as MapFeatureEvent).features?.[0];
    const label = feature?.properties?.label;

    if (typeof label !== "string") {
      setHoverTooltip(null);
      return;
    }

    setHoverTooltip({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      label,
    });
  }

  return (
    <div className="space-y-3">
      {!rdtrAvailable && (
        <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 px-3 py-2 font-sans text-xs text-talis-stone-700">
          RDTR digital belum tersedia. Peta memakai proxy RTRW untuk pembacaan awal.
        </div>
      )}
      <ZoningLayerToggles layers={layers} enabledLayerIds={enabledLayerIds} onToggle={handleToggle} />
      <div className="relative h-[360px] overflow-hidden rounded-lg border border-talis-stone-200 bg-talis-stone-900">
        <TalisMapboxMap
          ref={mapRef}
          initialViewState={{
            longitude: center[1],
            latitude: center[0],
            zoom: 12,
          }}
          minZoom={MAP_MIN_ZOOM}
          maxZoom={MAP_MAX_ZOOM}
          scrollZoom
          navigationControl
          interactiveLayerIds={["zoning-fill"]}
          onLoad={() => setMapReady(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverTooltip(null)}
          style={{ background: "var(--talis-stone-900, #1a1614)" }}
        >
          <Source
            id="zoning-visible-source"
            type="geojson"
            data={visibleCollection as unknown as FeatureCollection}
          >
            <Layer {...zoningFillLayer} />
            <Layer {...zoningOutlineCasingLayer} />
            <Layer {...zoningOutlineLayer} />
          </Source>

          <Marker longitude={center[1]} latitude={center[0]} anchor="center" style={{ zIndex: 20 }}>
            <button
              type="button"
              aria-label="Centroid wilayah aktif"
              onClick={() => setCentroidPopupOpen(true)}
              className="block h-3.5 w-3.5 rounded-full border-2 border-talis-green-900 bg-talis-stone-50 shadow-[0_2px_8px_rgba(0,0,0,0.42)] outline-none focus-visible:ring-2 focus-visible:ring-white"
            />
          </Marker>

          {centroidPopupOpen && (
            <TalisMapboxPopup
              longitude={center[1]}
              latitude={center[0]}
              onClose={() => setCentroidPopupOpen(false)}
            >
              <div className="font-sans text-xs text-talis-stone-900">Centroid wilayah aktif</div>
            </TalisMapboxPopup>
          )}

          {hoverTooltip && (
            <TalisMapboxPopup
              longitude={hoverTooltip.longitude}
              latitude={hoverTooltip.latitude}
              closeButton={false}
              closeOnClick={false}
              anchor="top"
              maxWidth="220px"
            >
              <div className="font-sans text-xs font-medium text-talis-stone-900">
                {hoverTooltip.label}
              </div>
            </TalisMapboxPopup>
          )}
        </TalisMapboxMap>
        <TalisMapboxLegendOverlay>
          <ZoningLegend layers={layers} enabledLayerIds={enabledLayerIds} />
        </TalisMapboxLegendOverlay>
      </div>
    </div>
  );
}
