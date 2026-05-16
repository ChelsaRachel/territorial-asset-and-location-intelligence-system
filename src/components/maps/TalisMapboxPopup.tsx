"use client";

import { Popup, type PopupProps } from "react-map-gl/mapbox";

export function TalisMapboxPopup({
  closeButton = false,
  closeOnClick = false,
  maxWidth = "240px",
  anchor = "bottom",
  className,
  ...props
}: PopupProps) {
  return (
    <Popup
      closeButton={closeButton}
      closeOnClick={closeOnClick}
      maxWidth={maxWidth}
      anchor={anchor}
      className={["talis-mapbox-popup", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

