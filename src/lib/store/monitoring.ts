"use client";
// SPRINT-07 TASK-004 — Session-scoped monitoring store
// Persists alertFilter + period picker to sessionStorage.
// alerts[] is NOT persisted (realtime-volatile).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AlertSeverity, AlertTipe } from "@/lib/types/common";
import type { Alert } from "@/lib/types/monitoring";

// ─── State ─────────────────────────────────────────────────────────────────────

export interface AlertFilter {
  tipe: AlertTipe[];
  severity: AlertSeverity[];
}

export interface MonitoringState {
  alertFilter: AlertFilter;
  alerts: Alert[];
  policyPeriodA: string | null;
  policyPeriodB: string | null;
}

// ─── Actions ───────────────────────────────────────────────────────────────────

export interface MonitoringActions {
  setAlertFilter(filter: Partial<AlertFilter>): void;
  setAlerts(alerts: Alert[]): void;
  updateAlertLocal(alertId: string, patch: Partial<Alert>): void;
  removeAlertLocal(alertId: string): void;
  prependAlert(alert: Alert): void;
  setPolicyPeriodA(period: string | null): void;
  setPolicyPeriodB(period: string | null): void;
  resetSession(): void;
}

export type MonitoringStore = MonitoringState & MonitoringActions;

// ─── Store ─────────────────────────────────────────────────────────────────────

const ALL_TIPE: AlertTipe[] = [
  "penurunan_produktivitas",
  "kekeringan_parah",
  "potensi_banjir",
  "waspadai_kekeringan",
  "konversi_lahan_ilegal",
];


const defaultFilter: AlertFilter = {
  tipe: [...ALL_TIPE],
  severity: [], // none selected = "show all" sentinel
};

export const useMonitoringStore = create<MonitoringStore>()(
  persist(
    (set) => ({
      alertFilter: defaultFilter,
      alerts: [],
      policyPeriodA: null,
      policyPeriodB: null,

      setAlertFilter: (filter) =>
        set((s) => ({ alertFilter: { ...s.alertFilter, ...filter } })),

      setAlerts: (alerts) => set({ alerts }),

      updateAlertLocal: (alertId, patch) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, ...patch } : a)),
        })),

      removeAlertLocal: (alertId) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== alertId) })),

      prependAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),

      setPolicyPeriodA: (period) => set({ policyPeriodA: period }),
      setPolicyPeriodB: (period) => set({ policyPeriodB: period }),

      resetSession: () =>
        set({ alertFilter: defaultFilter, alerts: [], policyPeriodA: null, policyPeriodB: null }),
    }),
    {
      name: "talis.monitoring.session",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      // alerts is realtime-volatile — do not persist
      partialize: (s) => ({
        alertFilter: s.alertFilter,
        policyPeriodA: s.policyPeriodA,
        policyPeriodB: s.policyPeriodB,
      }),
    },
  ),
);
