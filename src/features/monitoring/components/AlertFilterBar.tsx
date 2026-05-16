"use client";
// SPRINT-07 TASK-005 — Alert filter bar: Tipe multiselect + Severity pills

import { useEffect, useState } from "react";
import { useMonitoringFilter } from "@/lib/store/useMonitoring";
import type { AlertSeverity, AlertTipe } from "@/lib/types/common";
import { TIPE_LABEL, SEVERITY_LABEL } from "../lib/alertFormat";

const ALL_TIPE: AlertTipe[] = [
  "konversi_lahan_ilegal",
  "kekeringan_parah",
  "waspadai_kekeringan",
  "potensi_banjir",
  "penurunan_produktivitas",
];

const ALL_SEVERITY: AlertSeverity[] = ["KRITIS", "TINGGI", "SEDANG"];

// Active/selected state: light colored background, dark readable text
const SEVERITY_PILL_COLOR: Record<AlertSeverity, string> = {
  KRITIS: "bg-red-100 text-red-700 border-red-400",
  TINGGI: "bg-amber-100 text-amber-700 border-amber-400",
  SEDANG: "bg-green-100 text-green-700 border-green-400",
};

// Inactive/unselected state: white background, grey neutral text
const SEVERITY_PILL_OFF: Record<AlertSeverity, string> = {
  KRITIS: "bg-white text-talis-stone-500 border-talis-stone-200",
  TINGGI: "bg-white text-talis-stone-500 border-talis-stone-200",
  SEDANG: "bg-white text-talis-stone-500 border-talis-stone-200",
};

export function AlertFilterBar() {
  const { alertFilter, setAlertFilter } = useMonitoringFilter();

  // Guard against Zustand sessionStorage rehydration mismatch — render nothing
  // until client-side mount so buttons always reflect the correct persisted state.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  function toggleTipe(tipe: AlertTipe) {
    const current = alertFilter.tipe;
    const next = current.includes(tipe)
      ? current.filter((t) => t !== tipe)
      : [...current, tipe];
    setAlertFilter({ tipe: next.length > 0 ? next : current });
  }

  function toggleSeverity(severity: AlertSeverity) {
    const current = alertFilter.severity;
    const next = current.includes(severity)
      ? current.filter((s) => s !== severity)
      : [...current, severity];
    setAlertFilter({ severity: next }); // empty array is valid = "show all"
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">
          Tipe Peringatan
        </p>
        {!mounted ? (
          // Skeleton while waiting for Zustand rehydration from sessionStorage
          <div className="space-y-1.5">
            {[...Array(ALL_TIPE.length)].map((_, i) => (
              <div key={i} className="h-4 w-36 rounded bg-talis-stone-100" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {ALL_TIPE.map((tipe) => {
              const active = alertFilter.tipe.includes(tipe);
              return (
                <label key={tipe} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleTipe(tipe)}
                    className="h-3.5 w-3.5 rounded border-talis-stone-300 accent-talis-stone-900"
                  />
                  <span className={`font-sans text-xs ${active ? "text-talis-stone-900" : "text-talis-stone-400"}`}>
                    {TIPE_LABEL[tipe]}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">
          Tingkat Keparahan
        </p>
        {!mounted ? (
          // Skeleton while waiting for Zustand rehydration from sessionStorage
          <div className="flex flex-wrap gap-2">
            {ALL_SEVERITY.map((severity) => (
              <div
                key={severity}
                className="h-6 w-16 rounded-full bg-talis-stone-100"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ALL_SEVERITY.map((severity) => {
              const active = alertFilter.severity.includes(severity);
              return (
                <button
                  key={severity}
                  type="button"
                  onClick={() => toggleSeverity(severity)}
                  className={`rounded-full border px-3 py-1 font-sans text-xs font-semibold transition-colors ${
                    active ? SEVERITY_PILL_COLOR[severity] : SEVERITY_PILL_OFF[severity]
                  }`}
                >
                  {SEVERITY_LABEL[severity]}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
