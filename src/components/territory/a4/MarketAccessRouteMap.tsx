"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Layer,
  Marker,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { TalisMapboxLegendOverlay } from "@/components/maps/TalisMapboxLegendOverlay";
import { TalisMapboxMap } from "@/components/maps/TalisMapboxMap";
import { TalisMapboxPopup } from "@/components/maps/TalisMapboxPopup";
import { boundsFromLngLatCoordinates } from "@/lib/maps/bounds";
import { latLngToLngLat, type LngLat } from "@/lib/maps/coordinates";
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
} from "@/lib/maps/mapboxConfig";
import type { MarketAccessDestinationWithRoute } from "@/lib/types/territory";
import { RouteDestinationPopup } from "./RouteDestinationPopup";
import { RouteLegend } from "./RouteLegend";
import { ROUTE_TYPE_COLORS } from "./routeStyles";

export interface MarketAccessRouteMapProps {
  center: [number, number];
  destinations: MarketAccessDestinationWithRoute[];
}

interface RouteLine {
  destination: MarketAccessDestinationWithRoute;
  destinationKey: string;
  coordinates: [number, number][];
}

interface RouteProperties {
  destinationKey: string;
  tipe: string;
  color: string;
}

interface DestinationProperties extends RouteProperties {
  nama: string;
}

interface RoutePopupState {
  destination: MarketAccessDestinationWithRoute;
  longitude: number;
  latitude: number;
}

type MapFeatureEvent = MapMouseEvent & {
  features?: Array<{
    layer?: { id?: string };
    properties?: Record<string, unknown>;
  }>;
};

function destinationKey(destination: MarketAccessDestinationWithRoute) {
  return `${destination.tipe}:${destination.nama}`;
}

function routeCoordinates(
  center: [number, number],
  destination: MarketAccessDestinationWithRoute,
): [number, number][] {
  const feature = destination.rute_geojson?.features[0] as
    | { geometry?: { type?: string; coordinates?: unknown } }
    | undefined;

  if (feature?.geometry?.type === "LineString" && Array.isArray(feature.geometry.coordinates)) {
    const coordinates = feature.geometry.coordinates.filter((coordinate): coordinate is [number, number] => {
      return (
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        typeof coordinate[0] === "number" &&
        typeof coordinate[1] === "number" &&
        Number.isFinite(coordinate[0]) &&
        Number.isFinite(coordinate[1])
      );
    });

    if (coordinates.length >= 2) return coordinates;
  }

  return [latLngToLngLat(center), [destination.lng, destination.lat]];
}

const routeCasingLayer = {
  id: "market-route-casing",
  type: "line" as const,
  paint: {
    "line-color": "#ffffff",
    "line-width": [
      "case",
      ["==", ["get", "tipe"], "jalan_nasional"],
      7,
      6,
    ],
    "line-opacity": 0.72,
  },
} as LayerProps;

const routeLineLayer = {
  id: "market-route-line",
  type: "line" as const,
  paint: {
    "line-color": ["get", "color"],
    "line-width": [
      "case",
      ["==", ["get", "tipe"], "jalan_nasional"],
      4,
      3,
    ],
    "line-opacity": 0.92,
  },
} as LayerProps;

const destinationCasingLayer = {
  id: "market-destination-casing",
  type: "circle" as const,
  paint: {
    "circle-radius": 8,
    "circle-color": "#ffffff",
    "circle-opacity": 0.95,
  },
} as LayerProps;

const destinationCircleLayer = {
  id: "market-destination-circle",
  type: "circle" as const,
  paint: {
    "circle-radius": 6,
    "circle-color": ["get", "color"],
    "circle-opacity": 0.9,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#ffffff",
  },
} as LayerProps;

export function MarketAccessRouteMap({ center, destinations }: MarketAccessRouteMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapReady, setMapReady] = useState(false);
  const [centroidPopupOpen, setCentroidPopupOpen] = useState(false);
  const [routePopup, setRoutePopup] = useState<RoutePopupState | null>(null);

  const routes = useMemo<RouteLine[]>(
    () =>
      destinations.map((destination) => ({
        destination,
        destinationKey: destinationKey(destination),
        coordinates: routeCoordinates(center, destination),
      })),
    [center, destinations],
  );

  const destinationByKey = useMemo(() => {
    return new Map(routes.map((route) => [route.destinationKey, route.destination]));
  }, [routes]);

  const routeCollection = useMemo<FeatureCollection<LineString, RouteProperties>>(() => {
    const features: Array<Feature<LineString, RouteProperties>> = routes.map((route) => ({
      type: "Feature",
      properties: {
        destinationKey: route.destinationKey,
        tipe: route.destination.tipe,
        color: ROUTE_TYPE_COLORS[route.destination.tipe],
      },
      geometry: {
        type: "LineString",
        coordinates: route.coordinates,
      },
    }));

    return { type: "FeatureCollection", features };
  }, [routes]);

  const destinationCollection = useMemo<FeatureCollection<Point, DestinationProperties>>(() => {
    const features: Array<Feature<Point, DestinationProperties>> = destinations.map((destination) => ({
      type: "Feature",
      properties: {
        destinationKey: destinationKey(destination),
        tipe: destination.tipe,
        nama: destination.nama,
        color: ROUTE_TYPE_COLORS[destination.tipe],
      },
      geometry: {
        type: "Point",
        coordinates: [destination.lng, destination.lat],
      },
    }));

    return { type: "FeatureCollection", features };
  }, [destinations]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    mapRef.current.resize();
    const coordinates = routes.flatMap((route) => route.coordinates) as LngLat[];
    const bounds = coordinates.length >= 2 ? boundsFromLngLatCoordinates(coordinates) : null;

    if (bounds) {
      mapRef.current.fitBounds(bounds, {
        animate: false,
        maxZoom: 11,
        padding: 48,
      });
      return;
    }

    mapRef.current.jumpTo({
      center: latLngToLngLat(center),
      zoom: 10,
    });
  }, [center, mapReady, routes]);

  function handleMapClick(event: MapMouseEvent) {
    const feature = (event as MapFeatureEvent).features?.[0];
    const destinationKeyValue = feature?.properties?.destinationKey;

    if (typeof destinationKeyValue !== "string") return;

    const destination = destinationByKey.get(destinationKeyValue);
    if (!destination) return;

    const isDestinationMarker = feature?.layer?.id === "market-destination-circle";
    setRoutePopup({
      destination,
      longitude: isDestinationMarker ? destination.lng : event.lngLat.lng,
      latitude: isDestinationMarker ? destination.lat : event.lngLat.lat,
    });
  }

  function handleMouseMove(event: MapMouseEvent) {
    const hasFeature = Boolean((event as MapFeatureEvent).features?.[0]);
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = hasFeature ? "pointer" : "";
    }
  }

  function handleMouseLeave() {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = "";
    }
  }

  return (
    <div className="relative h-[360px] overflow-hidden rounded-lg border border-talis-stone-200 bg-talis-stone-900">
      <TalisMapboxMap
        ref={mapRef}
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: 10,
        }}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        scrollZoom
        navigationControl
        interactiveLayerIds={["market-route-line", "market-destination-circle"]}
        onLoad={() => setMapReady(true)}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ background: "var(--talis-stone-900, #1a1614)" }}
      >
        <Source id="market-route-source" type="geojson" data={routeCollection}>
          <Layer {...routeCasingLayer} />
          <Layer {...routeLineLayer} />
        </Source>

        <Source id="market-destination-source" type="geojson" data={destinationCollection}>
          <Layer {...destinationCasingLayer} />
          <Layer {...destinationCircleLayer} />
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

        {routePopup && (
          <TalisMapboxPopup
            longitude={routePopup.longitude}
            latitude={routePopup.latitude}
            closeButton
            onClose={() => setRoutePopup(null)}
          >
            <RouteDestinationPopup destination={routePopup.destination} />
          </TalisMapboxPopup>
        )}
      </TalisMapboxMap>

      <TalisMapboxLegendOverlay>
        <RouteLegend />
      </TalisMapboxLegendOverlay>
    </div>
  );
}
