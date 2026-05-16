"use client";

import { forwardRef } from "react";
import Map, {
  NavigationControl,
  type MapProps,
  type MapRef,
} from "react-map-gl/mapbox";
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  TALIS_MAPBOX_STYLE,
  getTalisMapboxToken,
} from "@/lib/maps/mapboxConfig";

type TalisMapboxMapProps = Omit<
  MapProps,
  "mapboxAccessToken" | "mapStyle" | "projection"
> & {
  className?: string;
  navigationControl?: boolean;
  navigationPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export const TalisMapboxMap = forwardRef<MapRef, TalisMapboxMapProps>(
  function TalisMapboxMap(
    {
      className = "h-full w-full",
      children,
      minZoom = MAP_MIN_ZOOM,
      maxZoom = MAP_MAX_ZOOM,
      navigationControl = true,
      navigationPosition = "top-left",
      style,
      ...props
    },
    ref,
  ) {
    return (
      <div className={className}>
        <Map
          ref={ref}
          mapboxAccessToken={getTalisMapboxToken()}
          mapStyle={TALIS_MAPBOX_STYLE}
          minZoom={minZoom}
          maxZoom={maxZoom}
          projection="mercator"
          dragRotate={false}
          pitchWithRotate={false}
          touchPitch={false}
          attributionControl
          reuseMaps
          style={{ width: "100%", height: "100%", ...style }}
          {...props}
        >
          {navigationControl && (
            <NavigationControl position={navigationPosition} showCompass={false} />
          )}
          {children}
        </Map>
      </div>
    );
  },
);

