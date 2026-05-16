import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui";
import type { AlertMiniMapProps, AlertMiniMapHandle } from "./AlertMiniMap";
import { forwardRef } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

// Leaflet cannot run on the server — lazy-load with ssr: false.
const AlertMiniMapInner = dynamic<AlertMiniMapProps & { forwardedRef?: React.Ref<AlertMiniMapHandle> }>(
  () => import("./AlertMiniMap").then((m) => {
    const Inner = ({ forwardedRef, ...props }: AlertMiniMapProps & { forwardedRef?: React.Ref<AlertMiniMapHandle> }) => (
      <m.AlertMiniMap ref={forwardedRef} {...props} />
    );
    Inner.displayName = "AlertMiniMapInner";
    return { default: Inner };
  }),
  {
    ssr: false,
    loading: () => <LoadingSkeleton shape="card" height="h-[300px]" />,
  },
);

export const AlertMiniMap: ForwardRefExoticComponent<AlertMiniMapProps & RefAttributes<AlertMiniMapHandle>> =
  forwardRef<AlertMiniMapHandle, AlertMiniMapProps>(function AlertMiniMap(props, ref) {
    return <AlertMiniMapInner {...props} forwardedRef={ref} />;
  });

export type { AlertMiniMapHandle };
