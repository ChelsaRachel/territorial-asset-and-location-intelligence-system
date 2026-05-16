export type LatLng = readonly [lat: number, lng: number];
export type LngLat = readonly [lng: number, lat: number];

export function latLngToLngLat([lat, lng]: LatLng): [number, number] {
  return [lng, lat];
}

export function lngLatToLatLng([lng, lat]: LngLat): [number, number] {
  return [lat, lng];
}

