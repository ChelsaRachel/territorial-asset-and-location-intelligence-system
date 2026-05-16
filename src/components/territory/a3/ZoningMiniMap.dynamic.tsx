import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui";
import type { ZoningMiniMapProps } from "./ZoningMiniMap";

export const ZoningMiniMap = dynamic<ZoningMiniMapProps>(
  () => import("./ZoningMiniMap").then((module) => module.ZoningMiniMap),
  {
    ssr: false,
    loading: () => <LoadingSkeleton shape="card" height="h-[360px]" />,
  },
);
