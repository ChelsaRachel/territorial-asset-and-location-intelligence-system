"use client";

import { TalisLogo } from "./TalisLogo";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { LcpOverlay } from "@/components/perf/LcpOverlay";

export function AppHeader() {
  const showLcpOverlay =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_TALIS_LCP_OVERLAY === "1";

  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex items-center gap-6">
        <TalisLogo />
        <ProfileSwitcher />
      </div>
      <div className="flex items-center gap-3">
        {showLcpOverlay && <LcpOverlay />}
        <div
          className="h-8 w-8 rounded-full bg-talis-green-900 flex items-center justify-center"
          aria-label="Account"
        >
          <span className="font-mono text-xs text-talis-stone-50">U</span>
        </div>
      </div>
    </div>
  );
}
