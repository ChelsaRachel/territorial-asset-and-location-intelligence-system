"use client";
// SPRINT-07 TASK-004 — Page-level realtime subscriber for /monitoring
// Subscribes to wilayah:{activeWilayahId}:alerts on mount.
// Re-subscribes on active-profile change. Cleans up on unmount.

import { useEffect } from "react";
import { realtime, CHANNELS } from "@/lib/realtime";
import type { RealtimeEvent } from "@/lib/realtime";
import { useMonitoringActions } from "@/lib/store/useMonitoring";
import { patchAlertInStore, prependAlertToStore } from "@/lib/api/monitoring/getAlerts";
import type { Alert } from "@/lib/types/monitoring";

interface UseMonitoringRealtimeOptions {
  wilayahId: number | null;
  onRefetchAlerts?: () => void;
}

export function useMonitoringRealtime({ wilayahId, onRefetchAlerts }: UseMonitoringRealtimeOptions): void {
  const { updateAlertLocal, prependAlert } = useMonitoringActions();

  useEffect(() => {
    if (!wilayahId) return;

    const channel = CHANNELS.wilayahAlerts(wilayahId);

    const handleEvent = (event: RealtimeEvent) => {
      if (event.type === "alert.status_changed" && event.payload.wilayah_id === wilayahId) {
        const { alert_id, new_status } = event.payload;
        updateAlertLocal(alert_id, { status: new_status as Alert["status"] });
        patchAlertInStore(alert_id, { status: new_status as Alert["status"] });
      }
      if (event.type === "alert.created" && event.payload.wilayah_id === wilayahId) {
        if (event.payload.alert) {
          prependAlertToStore(event.payload.alert);
          prependAlert(event.payload.alert);
        } else {
          onRefetchAlerts?.();
        }
      }
    };

    const unsub = realtime.subscribe(channel, handleEvent);
    return unsub;
  }, [wilayahId, updateAlertLocal, prependAlert, onRefetchAlerts]);
}
