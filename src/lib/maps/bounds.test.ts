import { describe, expect, it } from "vitest";
import { latLngToLngLat, lngLatToLatLng } from "./coordinates";
import { boundsFromFeatureCollection, boundsFromLngLatCoordinates } from "./bounds";

describe("map coordinate helpers", () => {
  it("converts Leaflet lat/lng order to Mapbox lng/lat order", () => {
    expect(latLngToLngLat([-6.2, 106.8])).toEqual([106.8, -6.2]);
    expect(lngLatToLatLng([106.8, -6.2])).toEqual([-6.2, 106.8]);
  });
});

describe("map bounds helpers", () => {
  it("computes a Mapbox bounds tuple from lng/lat coordinates", () => {
    expect(
      boundsFromLngLatCoordinates([
        [98.48, 3.17],
        [98.55, 3.21],
        [98.51, 3.19],
      ]),
    ).toEqual([
      [98.48, 3.17],
      [98.55, 3.21],
    ]);
  });

  it("scans nested GeoJSON polygon coordinates", () => {
    const collection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [107.4, -7.1],
                [107.45, -7.08],
                [107.42, -7.05],
                [107.4, -7.1],
              ],
            ],
          },
        },
      ],
    };

    expect(boundsFromFeatureCollection(collection)).toEqual([
      [107.4, -7.1],
      [107.45, -7.05],
    ]);
  });
});

