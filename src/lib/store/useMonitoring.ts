"use client";
// Selector hooks for useMonitoringStore — avoids re-renders from unrelated state slices.
import { useShallow } from "zustand/react/shallow";
import { useMonitoringStore } from "./monitoring";

export function useMonitoringAlerts() {
  return useMonitoringStore((s) => s.alerts);
}

export function useMonitoringFilter() {
  return useMonitoringStore(
    useShallow((s) => ({
      alertFilter: s.alertFilter,
      setAlertFilter: s.setAlertFilter,
    })),
  );
}

export function useMonitoringPeriods() {
  return useMonitoringStore(
    useShallow((s) => ({
      policyPeriodA: s.policyPeriodA,
      policyPeriodB: s.policyPeriodB,
      setPolicyPeriodA: s.setPolicyPeriodA,
      setPolicyPeriodB: s.setPolicyPeriodB,
    })),
  );
}

export function useMonitoringActions() {
  return useMonitoringStore(
    useShallow((s) => ({
      setAlerts: s.setAlerts,
      updateAlertLocal: s.updateAlertLocal,
      removeAlertLocal: s.removeAlertLocal,
      prependAlert: s.prependAlert,
    })),
  );
}

export { useMonitoringStore };
