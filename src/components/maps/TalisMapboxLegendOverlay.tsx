"use client";

import type { ReactNode } from "react";

interface TalisMapboxLegendOverlayProps {
  children: ReactNode;
  className?: string;
}

export function TalisMapboxLegendOverlay({
  children,
  className = "bottom-3 left-3 max-w-[220px]",
}: TalisMapboxLegendOverlayProps) {
  return (
    <div className={`pointer-events-none absolute z-10 ${className}`}>
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}

