"use client";

import dynamic from "next/dynamic";
import type { PolicyTimelineProps } from "./PolicyTimeline";

export type { PolicyMarker, PolicyTimelineProps } from "./PolicyTimeline";

export const PolicyTimelineLazy = dynamic<PolicyTimelineProps>(
  () => import("./PolicyTimeline").then((m) => m.PolicyTimeline),
  {
    ssr: false,
    loading: () => <div className="h-28 animate-pulse rounded-lg bg-talis-stone-100" />,
  },
);
