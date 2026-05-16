"use client";
// SPRINT-07 TASK-006 — Assign alert modal (native <dialog> element)

import { useEffect, useRef, useState } from "react";
import type { Alert } from "@/lib/types/monitoring";
import { apiClient } from "@/lib/api/apiClient";
import { TEAMS } from "../lib/alertLifecycle";
import { TIPE_LABEL } from "../lib/alertFormat";

interface AssignAlertModalProps {
  alert: Alert;
  onClose: () => void;
  onAssigned: (team: string, assignee: string) => void;
}

export function AssignAlertModal({ alert, onClose, onAssigned }: AssignAlertModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedTeam = TEAMS.find((t) => t.id === selectedTeamId);
  const canSave = !!selectedTeamId && !!selectedAssigneeId && !busy;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    setSelectedAssigneeId("");
  }, [selectedTeamId]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave || !selectedTeam) return;

    const assignee = selectedTeam.anggota.find((a) => a.id === selectedAssigneeId);
    if (!assignee) return;

    setBusy(true);
    try {
      await apiClient.monitoring.assignAlert(alert.id, {
        team: selectedTeam.nama,
        assignee: assignee.nama,
        notes,
      });
      onAssigned(selectedTeam.nama, assignee.nama);

      console.info(`[talis.alert.toast] Alert di-assign ke ${selectedTeam.nama}`);
    } catch (err) {
      console.error("[talis.alert.assign] error", err);
    } finally {
      setBusy(false);
    }
  }

  const NOTES_MAX = 280;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className="m-auto w-full max-w-md rounded-xl border border-talis-stone-200 bg-white p-6 shadow-xl backdrop:bg-black/40"
    >
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold text-talis-stone-900">
          Assign Alert ke Tim
        </h3>
        <p className="mt-0.5 font-sans text-xs text-talis-stone-500">
          {TIPE_LABEL[alert.tipe]} — {alert.lokasi.deskripsi}
        </p>
      </div>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
        {/* Tim selector */}
        <div>
          <label className="block font-sans text-xs font-semibold text-talis-stone-700 mb-1">
            Tim <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            required
            className="w-full rounded-lg border border-talis-stone-200 bg-white px-3 py-2 font-sans text-sm text-talis-stone-900 focus:outline-none focus:ring-2 focus:ring-talis-stone-400"
          >
            <option value="">— Pilih tim —</option>
            {TEAMS.map((team) => (
              <option key={team.id} value={team.id}>
                {team.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee selector */}
        <div>
          <label className="block font-sans text-xs font-semibold text-talis-stone-700 mb-1">
            Petugas <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedAssigneeId}
            onChange={(e) => setSelectedAssigneeId(e.target.value)}
            required
            disabled={!selectedTeamId}
            className="w-full rounded-lg border border-talis-stone-200 bg-white px-3 py-2 font-sans text-sm text-talis-stone-900 focus:outline-none focus:ring-2 focus:ring-talis-stone-400 disabled:text-talis-stone-400"
          >
            <option value="">— Pilih petugas —</option>
            {selectedTeam?.anggota.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama} ({a.jabatan})
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-sans text-xs font-semibold text-talis-stone-700 mb-1">
            Catatan Penugasan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
            rows={3}
            placeholder="Tambahkan instruksi atau konteks untuk tim yang ditugaskan…"
            className="w-full resize-none rounded-lg border border-talis-stone-200 px-3 py-2 font-sans text-sm text-talis-stone-900 placeholder:text-talis-stone-400 focus:outline-none focus:ring-2 focus:ring-talis-stone-400"
          />
          <p className="mt-0.5 text-right font-sans text-xs text-talis-stone-400">
            {notes.length}/{NOTES_MAX}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-talis-stone-200 px-4 py-2 font-sans text-xs text-talis-stone-700 hover:bg-talis-stone-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded bg-talis-stone-900 px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-talis-stone-700 transition-colors disabled:opacity-40"
          >
            {busy ? "Menyimpan…" : "Simpan Penugasan"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
