import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui";
import type { MarketAccessRouteMapProps } from "./MarketAccessRouteMap";

export const MarketAccessRouteMap = dynamic<MarketAccessRouteMapProps>(
  () => import("./MarketAccessRouteMap").then((module) => module.MarketAccessRouteMap),
  {
    ssr: false,
    loading: () => <LoadingSkeleton shape="card" height="h-[360px]" />,
  },
);
