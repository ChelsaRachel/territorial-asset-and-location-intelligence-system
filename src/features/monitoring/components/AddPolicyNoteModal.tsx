"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";
import type { AddPolicyLogPayload, PolicyLogItem } from "@/lib/types/monitoring";
import { POLICY_TAGS, validatePolicyForm, type PolicyFormValues } from "../lib/policyFormValidation";

interface AddPolicyNoteModalProps {
  wilayahId: number;
  snapshotStartDate: string;
  onClose(): void;
  onSaved(item: PolicyLogItem): void;
}

const defaultDate = () => new Date().toISOString().slice(0, 10);

export function AddPolicyNoteModal({ wilayahId, snapshotStartDate, onClose, onSaved }: AddPolicyNoteModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<PolicyFormValues>({
    policy_date: defaultDate(),
    title: "",
    deskripsi: "",
    tags: [],
  });
  const [touched, setTouched] = useState<Partial<Record<keyof PolicyFormValues, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const validation = useMemo(() => validatePolicyForm(values, snapshotStartDate), [values, snapshotStartDate]);
  const showError = (field: keyof PolicyFormValues) => touched[field] && validation.errors[field];

  function setField<K extends keyof PolicyFormValues>(field: K, value: PolicyFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function toggleTag(tag: string) {
    setValues((current) => ({
      ...current,
      tags: current.tags.includes(tag) ? current.tags.filter((item) => item !== tag) : [...current.tags, tag],
    }));
    setTouched((current) => ({ ...current, tags: true }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({ policy_date: true, title: true, deskripsi: true, tags: true });
    const result = validatePolicyForm(values, snapshotStartDate);
    if (!result.valid || saving) return;

    const payload: AddPolicyLogPayload = {
      policy_date: values.policy_date,
      title: values.title.trim(),
      deskripsi: values.deskripsi.trim(),
      tags: values.tags,
    };

    setSaving(true);
    setSubmitError(null);
    console.log("[talis.policy.add]", { wilayah_id: wilayahId, payload, at: new Date().toISOString() });
    try {
      const item = await apiClient.monitoring.addPolicyLog(wilayahId, payload);
      toast.success("Catatan kebijakan tersimpan.");
      onSaved(item);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Catatan gagal disimpan.";
      setSubmitError(message);
      toast.error("Catatan kebijakan gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Tambah Catatan Kebijakan"
      className="fixed inset-0 z-50 m-auto w-full max-w-xl rounded-xl border border-talis-stone-200 bg-white p-0 shadow-xl backdrop:bg-black/30"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-talis-stone-900">Tambah Catatan Kebijakan</h3>
          <p className="mt-1 font-sans text-sm text-talis-stone-600">
            Catat kebijakan baru untuk periode monitoring dan atribusi 12 bulan berikutnya.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">Tanggal Kebijakan</span>
            <input
              type="date"
              value={values.policy_date}
              onChange={(event) => setField("policy_date", event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, policy_date: true }))}
              className="mt-1 w-full rounded border border-talis-stone-300 px-3 py-2 font-sans text-sm"
            />
            {showError("policy_date") && <p className="mt-1 font-sans text-xs text-talis-red-700">{validation.errors.policy_date}</p>}
          </label>

          <label className="block">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">Judul</span>
            <input
              value={values.title}
              maxLength={120}
              placeholder="mis. Pembangunan Cold Storage Kabanjahe"
              onChange={(event) => setField("title", event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, title: true }))}
              className="mt-1 w-full rounded border border-talis-stone-300 px-3 py-2 font-sans text-sm"
            />
            {showError("title") && <p className="mt-1 font-sans text-xs text-talis-red-700">{validation.errors.title}</p>}
          </label>

          <label className="block">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">Deskripsi</span>
            <textarea
              value={values.deskripsi}
              maxLength={600}
              rows={4}
              placeholder="Ringkas dasar kebijakan, instansi penanggung jawab, dan wilayah terdampak."
              onChange={(event) => setField("deskripsi", event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, deskripsi: true }))}
              className="mt-1 w-full rounded border border-talis-stone-300 px-3 py-2 font-sans text-sm"
            />
            <p className="mt-1 text-right font-mono text-[11px] text-talis-stone-500">{values.deskripsi.length}/600</p>
            {showError("deskripsi") && <p className="mt-1 font-sans text-xs text-talis-red-700">{validation.errors.deskripsi}</p>}
          </label>

          <fieldset>
            <legend className="font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-600">Tags</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {POLICY_TAGS.map((tag) => {
                const selected = values.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1 font-sans text-xs font-semibold ${
                      selected
                        ? "border-talis-green-700 bg-talis-green-700 text-white"
                        : "border-talis-stone-300 bg-white text-talis-stone-700 hover:bg-talis-stone-50"
                    }`}
                  >
                    {tag.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
            {showError("tags") && <p className="mt-1 font-sans text-xs text-talis-red-700">{validation.errors.tags}</p>}
          </fieldset>

          {validation.warnings.map((warning) => (
            <p key={warning} className="rounded border border-amber-300 bg-amber-50 px-3 py-2 font-sans text-xs text-amber-800">
              {warning}
            </p>
          ))}
          {submitError && <p className="font-sans text-xs text-talis-red-700">{submitError}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border border-talis-stone-300 px-3 py-2 font-sans text-sm text-talis-stone-700">
            Batal
          </button>
          <button
            type="submit"
            disabled={!validation.valid || saving}
            className="rounded bg-talis-green-700 px-4 py-2 font-sans text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
