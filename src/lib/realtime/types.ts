// SPRINT-07 TASK-002 — Realtime event types
// Channel naming conventions:
//   wilayah:{wilayah_id}:alerts  — alert events for a specific wilayah
//   user:{user_id}:shortlist-alerts — shortlist threshold-breach events
import type { Alert } from "@/lib/types/monitoring";

export type AlertCreatedEvent = {
  type: "alert.created";
  payload: {
    wilayah_id: number;
    alert_id: string;
    severity: "KRITIS" | "TINGGI" | "SEDANG";
    tipe: string;
    detail: string;
    lokasi?: string;
    terdeteksi_at: string;
    alert?: Alert;
  };
};

export type AlertStatusChangedEvent = {
  type: "alert.status_changed";
  payload: {
    alert_id: string;
    wilayah_id: number;
    previous_status: string;
    new_status: string;
    changed_by: string;
    changed_at: string;
  };
};

export type ShortlistThresholdBreachEvent = {
  type: "shortlist.threshold_breach";
  payload: {
    wilayah_id: number;
    wilayah_nama: string;
    indicator: string;
    indicator_label?: string;
    delta_pct: number;
    direction: "naik" | "turun";
    breached_at: string;
  };
};

export type RealtimeEvent =
  | AlertCreatedEvent
  | AlertStatusChangedEvent
  | ShortlistThresholdBreachEvent;

export type RealtimeEventType = RealtimeEvent["type"];

/** Channels used by SPRINT-07 */
export const CHANNELS = {
  wilayahAlerts: (wilayahId: number) => `wilayah:${wilayahId}:alerts`,
  userShortlistAlerts: (userId: string) => `user:${userId}:shortlist-alerts`,
} as const;

export const POC_USER_ID = "poc-user";
