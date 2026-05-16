import { latLngToLngLat } from "./coordinates";

export const TALIS_MAPBOX_STYLE = "mapbox://styles/mapbox/satellite-v9";

export const INDONESIA_CENTER_LAT_LNG: [number, number] = [-2.5, 117.5];
export const INDONESIA_CENTER_LNG_LAT: [number, number] =
  latLngToLngLat(INDONESIA_CENTER_LAT_LNG);

export const INDONESIA_ZOOM = 5;
export const MAP_MIN_ZOOM = 4;
export const MAP_MAX_ZOOM = 16;

export function getTalisMapboxToken(): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is required to render TALIS Mapbox maps.");
  }

  return token;
}

