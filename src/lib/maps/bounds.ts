import type { LngLat } from "./coordinates";

export type LngLatBoundsTuple = [[number, number], [number, number]];

interface GeometryLike {
  type?: string;
  coordinates?: unknown;
}

interface FeatureLike {
  geometry?: GeometryLike | null;
}

interface FeatureCollectionLike {
  features?: FeatureLike[];
}

function isFiniteLngLat(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

function collectLngLatCoordinates(value: unknown, coordinates: [number, number][]) {
  if (isFiniteLngLat(value)) {
    coordinates.push([value[0], value[1]]);
    return;
  }

  if (!Array.isArray(value)) return;

  for (const item of value) {
    collectLngLatCoordinates(item, coordinates);
  }
}

export function boundsFromLngLatCoordinates(
  coordinates: readonly LngLat[],
): LngLatBoundsTuple | null {
  if (coordinates.length === 0) return null;

  let west = Number.POSITIVE_INFINITY;
  let south = Number.POSITIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;

  for (const coordinate of coordinates) {
    const [lng, lat] = coordinate;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

    west = Math.min(west, lng);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    north = Math.max(north, lat);
  }

  if (![west, south, east, north].every(Number.isFinite)) return null;

  return [
    [west, south],
    [east, north],
  ];
}

export function boundsFromFeatureCollection(
  collection: FeatureCollectionLike,
): LngLatBoundsTuple | null {
  const coordinates: [number, number][] = [];

  for (const feature of collection.features ?? []) {
    collectLngLatCoordinates(feature.geometry?.coordinates, coordinates);
  }

  return boundsFromLngLatCoordinates(coordinates);
}

