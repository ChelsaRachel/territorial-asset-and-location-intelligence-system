"use client";
// SPRINT-07 TASK-005 — Alert card component
// TASK-006 replaces stub handlers with real lifecycle modals.
// Refactored: TALIS Governance Alert Card UI

import { useState } from "react";
import type { Alert } from "@/lib/types/monitoring";
import {
  SEVERITY_BORDER,
  SEVERITY_PILL,
  STATUS_PILL,
  TIPE_LABEL,
  formatRelativeDate,
  formatRupiah,
} from "../lib/alertFormat";
import { AlertCardOverflowMenu } from "./AlertCardOverflowMenu";
import { AssignAlertModal } from "./AssignAlertModal";
import { useMonitoringActions } from "@/lib/store/useMonitoring";
import { apiClient } from "@/lib/api/apiClient";
import { useActiveProfile } from "@/lib/store/useActiveProfile";
import { buildAutoPayload, ALLOWED_TRANSITIONS } from "../lib/alertLifecycle";
import type { AlertStatus } from "@/lib/types/common";

interface AlertCardProps {
  alert: Alert;
  onLihatDiPeta: (alertId: string) => void;
}

export function AlertCard({ alert, onLihatDiPeta }: AlertCardProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const { updateAlertLocal } = useMonitoringActions();
  const activeProfile = useActiveProfile();

  async function transition(to: AlertStatus) {
    if (busy) return;
    const allowed = ALLOWED_TRANSITIONS[alert.status] ?? [];
    if (!allowed.includes(to)) return;
    setBusy(true);
    try {
      await apiClient.monitoring.updateAlertStatus(alert.id, to, alert.status);
      updateAlertLocal(alert.id, { status: to });

      if (to === "RESOLVED" && activeProfile) {
        try {
          const payload = buildAutoPayload(alert);
          await apiClient.monitoring.addPolicyLog(activeProfile.wilayah_id, payload);
          showToast("Alert resolved + entri kebijakan dibuat otomatis.");
        } catch {
          showToast("Alert resolved tapi entri kebijakan gagal disimpan — coba refresh.");
        }
      } else {
        showToast(
          STATUS_PILL[to]?.label
            ? `Status diubah ke: ${STATUS_PILL[to].label}`
            : "Status diperbarui."
        );
      }
    } catch (err) {
      console.error("[talis.alert.transition] error", err);
    } finally {
      setBusy(false);
    }
  }

  function showToast(msg: string) {
    console.info("[talis.alert.toast]", msg);
  }

  const statusMeta = STATUS_PILL[alert.status];
  const severityMeta = SEVERITY_PILL[alert.severity];
  const borderClass = SEVERITY_BORDER[alert.severity];

  const canAssign = alert.status === "OPEN";
  const canInvestigate = alert.status === "ASSIGNED";
  const canResolve = alert.status === "INVESTIGATED";

  return (
    <>
      <div
        id={`alert-${alert.id}`}
        className={`relative rounded-xl border bg-white shadow-md transition-shadow hover:shadow-lg ${borderClass} ${
          alert.severity === "KRITIS" ? "kritis-pulse" : ""
        }`}
      >
        <div className="space-y-5 p-5">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="rounded-md bg-talis-stone-100 px-2.5 py-1 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-800">
                {TIPE_LABEL[alert.tipe]}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-sans text-xs font-semibold ${statusMeta.className}`}
              >
                {statusMeta.label}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 font-sans text-xs font-bold ${severityMeta.className}`}
              >
                {severityMeta.label}
              </span>
              <AlertCardOverflowMenu alert={alert} onTransition={transition} />
            </div>
          </div>

          {/* Location title + metadata */}
          <div>
            <h3 className="font-display text-base font-semibold leading-snug text-talis-stone-900">
              {alert.lokasi.deskripsi}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="font-sans text-xs text-talis-stone-500">
                {formatRelativeDate(alert.terdeteksi_at)}
              </span>
              {(alert.status === "ASSIGNED" ||
                alert.status === "INVESTIGATED" ||
                alert.status === "RESOLVED") &&
                alert.assignee && (
                  <span className="font-sans text-xs text-talis-stone-500">
                    Ditugaskan ke:{" "}
                    <span className="font-semibold text-talis-stone-700">
                      {alert.assignee}
                    </span>{" "}
                    <span className="text-talis-stone-400">({alert.tim_penanganan ?? "—"})</span>
                  </span>
                )}
            </div>
          </div>

          {/* Detail paragraph */}
          <p className="max-w-3xl font-sans text-sm leading-relaxed text-talis-stone-700">
            {alert.detail}
          </p>

          {/* Estimasi dampak — KPI block */}
          {(alert.estimasi_dampak.pdrb_pct !== null ||
            alert.estimasi_dampak.hilang_pad_rp_per_tahun !== null ||
            alert.estimasi_dampak.dampak_lain ||
            alert.estimasi_dampak.keterangan) && (
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-talis-stone-600">
                Estimasi Dampak
              </h4>
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-talis-stone-200 bg-gradient-to-br from-talis-stone-50 to-white p-4 sm:grid-cols-2">
                {alert.estimasi_dampak.pdrb_pct !== null && (
                  <div className="min-w-0">
                    <span className="block font-sans text-xs font-medium text-talis-stone-600">
                      Dampak PDRB
                    </span>
                    <span className="mt-1.5 block font-mono text-lg font-bold tabular-nums text-talis-earth-700">
                      {alert.estimasi_dampak.pdrb_pct > 0 ? "+" : ""}
                      {alert.estimasi_dampak.pdrb_pct}%
                    </span>
                  </div>
                )}
                {alert.estimasi_dampak.hilang_pad_rp_per_tahun !== null && (
                  <div className="min-w-0">
                    <span className="block font-sans text-xs font-medium text-talis-stone-600">
                      Hilang PAD / tahun
                    </span>
                    <span className="mt-1.5 block font-mono text-lg font-bold tabular-nums text-talis-earth-700">
                      {formatRupiah(alert.estimasi_dampak.hilang_pad_rp_per_tahun)}
                    </span>
                  </div>
                )}
                {alert.estimasi_dampak.dampak_lain && (
                  <div className="min-w-0 sm:col-span-2">
                    <span className="block font-sans text-xs font-medium text-talis-stone-600">
                      Dampak Lain
                    </span>
                    <p className="mt-1.5 font-sans text-sm leading-relaxed text-talis-stone-700">
                      {alert.estimasi_dampak.dampak_lain}
                    </p>
                  </div>
                )}
              </div>
              {alert.estimasi_dampak.keterangan && (
                <p className="font-sans text-xs italic leading-relaxed text-talis-stone-500">
                  {alert.estimasi_dampak.keterangan}
                </p>
              )}
            </div>
          )}

          {/* Tindak lanjut — timeline/checklist */}
          {alert.tindak_lanjut.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-talis-stone-600">
                Tindak Lanjut
              </h4>
              <div className="space-y-3">
                {alert.tindak_lanjut.map((item) => (
                  <div key={item.langkah} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-talis-green-700 bg-talis-green-700 font-mono text-xs font-bold text-white">
                      {item.langkah}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="font-sans text-sm leading-relaxed text-talis-stone-900">
                        {item.aksi}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs font-medium text-amber-800">
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4.5a.5.5 0 011 0v4a.5.5 0 01-.5.5H5a.5.5 0 010-1h2V4.5z" />
                        </svg>
                        {item.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions footer */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-talis-stone-100 pt-4">
            <button
              type="button"
              onClick={() => onLihatDiPeta(alert.id)}
              className="rounded-md border border-talis-stone-300 bg-white px-3 py-2 font-sans text-xs font-medium text-talis-stone-700 transition-colors hover:bg-talis-stone-50"
            >
              Lihat di Peta
            </button>

            {canInvestigate && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void transition("INVESTIGATED")}
                className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 font-sans text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
              >
                Mark as Investigated
              </button>
            )}

            {canResolve && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowResolveConfirm(true)}
                className="rounded-md border border-talis-green-700 bg-talis-green-700 px-3 py-2 font-sans text-xs font-semibold text-white transition-colors hover:bg-talis-green-800 disabled:opacity-50"
              >
                Resolve
              </button>
            )}

            {canAssign && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowAssignModal(true)}
                className="rounded-md bg-talis-stone-900 px-3 py-2 font-sans text-xs font-semibold text-white transition-colors hover:bg-talis-stone-700 disabled:opacity-50"
              >
                Assign ke Tim
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resolve confirmation */}
      {showResolveConfirm && (
        <dialog
          open
          className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-xl border border-talis-stone-200 bg-white p-6 shadow-xl"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-talis-stone-900">
              Konfirmasi Penyelesaian Alert
            </h3>
            <p className="mt-2 font-sans text-sm text-talis-stone-600">
              Menyelesaikan alert ini akan otomatis membuat entri baru di Catatan Kebijakan dengan
              tag <span className="font-semibold">alert_response</span>. Lanjutkan?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowResolveConfirm(false)}
              className="rounded border border-talis-stone-200 px-3 py-1.5 font-sans text-xs text-talis-stone-700 hover:bg-talis-stone-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowResolveConfirm(false);
                void transition("RESOLVED");
              }}
              className="rounded bg-talis-green-700 px-3 py-1.5 font-sans text-xs font-semibold text-white hover:bg-talis-green-800 disabled:opacity-50"
            >
              Ya, Selesaikan
            </button>
          </div>
        </dialog>
      )}

      {showAssignModal && (
        <AssignAlertModal
          alert={alert}
          onClose={() => setShowAssignModal(false)}
          onAssigned={(team, assignee) => {
            updateAlertLocal(alert.id, { status: "ASSIGNED", assignee, tim_penanganan: team });
            setShowAssignModal(false);
          }}
        />
      )}
    </>
  );
}
