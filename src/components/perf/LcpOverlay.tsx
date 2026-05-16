"use client";

import { useEffect, useState } from "react";

interface LcpState {
  value: number | null;
  label: string;
}

export function LcpOverlay() {
  const [lcp, setLcp] = useState<LcpState>({ value: null, label: "waiting" });

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") {
      setLcp({ value: null, label: "unsupported" });
      return undefined;
    }

    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry | undefined;
        if (!last) return;
        setLcp({ value: last.startTime, label: last.name || "element" });
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      setLcp({ value: null, label: "unsupported" });
    }

    return () => observer?.disconnect();
  }, []);

  const display = lcp.value === null ? lcp.label : `${Math.round(lcp.value)}ms`;

  return (
    <div className="hidden rounded border border-amber-300 bg-amber-50 px-2 py-1 font-mono text-[11px] text-amber-800 lg:block">
      LCP {display}
    </div>
  );
}
