"use client";
// SPRINT-07 TASK-004 — Page 6: Monitoring & Governance
// Four independent sections: B.3 Early Warning → NEW-D Pipeline Monitor → B.5 Policy Decision Log → NEW-C Benchmark.
// Each section manages its own fetch state. Realtime subscriber fires on active-profile change.

import { useEffect, useCallback } from "react";
import { useActiveProfile, useHydrationStatus } from "@/lib/store/useActiveProfile";
import { useMonitoringActions } from "@/lib/store/useMonitoring";
import { useMonitoringRealtime } from "./hooks/useMonitoringRealtime";
import { apiClient } from "@/lib/api/apiClient";
import { EarlyWarningSection } from "./sections/EarlyWarningSection";
import { PipelineMonitorSection } from "./sections/PipelineMonitorSection";
import { PolicyDecisionLogSection } from "./sections/PolicyDecisionLogSection";
import { BenchmarkSection } from "./sections/BenchmarkSection";

export function MonitoringPage() {
  const activeProfile = useActiveProfile();
  const hydrationStatus = useHydrationStatus();
  const { setAlerts } = useMonitoringActions();

  const wilayahId = activeProfile?.wilayah_id ?? null;

  const fetchAlerts = useCallback(async () => {
    if (!wilayahId) return;
    try {
      const alerts = await apiClient.monitoring.getAlerts(wilayahId);
      setAlerts(alerts);
    } catch (err) {
      console.error("[talis.monitoring] Failed to fetch alerts", err);
    }
  }, [wilayahId, setAlerts]);

  // Fetch alerts on mount + on profile change
  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  // Page-level realtime subscriber — subscribes to the active wilayah's alert channel
  useMonitoringRealtime({ wilayahId, onRefetchAlerts: fetchAlerts });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pt-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-talis-stone-900">
            {activeProfile ? activeProfile.nama : "Monitoring & Tata Kelola"}
          </h1>
          <p className="mt-1 font-sans text-sm text-talis-stone-700">
            {activeProfile
              ? `${activeProfile.kabupaten}, ${activeProfile.provinsi}`
              : hydrationStatus === "pending"
                ? "Memuat active profile…"
                : "Active profile belum tersedia"}
          </p>
        </div>
      </header>

      <EarlyWarningSection wilayahId={wilayahId} />
      <PipelineMonitorSection wilayahId={wilayahId} />
      <PolicyDecisionLogSection wilayahId={wilayahId} />
      <BenchmarkSection wilayahId={wilayahId} />
    </div>
  );
}