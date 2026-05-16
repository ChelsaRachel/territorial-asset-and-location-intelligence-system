"use client";
// SPRINT-06 TASK-010 — Shortlist section with delta indicators, modal, and Save All
// Uses useShortlistStore (localStorage) instead of comparison store shortlist state.

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useShortlistStore } from "@/lib/store/shortlist";
import { useActiveProfile } from "@/lib/store/useActiveProfile";
import { ExportButton } from "@/components/export/ExportButton";
import { ExportModalLazy } from "@/components/export/ExportModalLazy";
import type { ExportModalConfig } from "@/components/export/ExportModal";
import type { ShortlistItem } from "@/lib/api/decision/getShortlist";
import dimWilayah from "@/mocks/dim_wilayah.json";

// ─── Wilayah name lookup ────────────────────────────────────────────────────────

interface DimWilayah {
  wilayah_id: number;
  nama: string;
  kabupaten: string;
}

const WILAYAH_MAP = new Map<number, DimWilayah>(
  (dimWilayah as DimWilayah[]).map((w) => [w.wilayah_id, w])
);

function getWilayahNama(wilayahId: number): string {
  return WILAYAH_MAP.get(wilayahId)?.nama ?? `Wilayah #${wilayahId}`;
}

function getWilayahKabupaten(wilayahId: number): string {
  return WILAYAH_MAP.get(wilayahId)?.kabupaten ?? "";
}

// ─── Add Note Modal (native <dialog>) ─────────────────────────────────────────

function AddNoteModal({
  item,
  onClose,
  onSave,
}: {
  item: ShortlistItem;
  onClose: () => void;
  onSave: (note: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(item.catatan ?? "");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(draft);
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose();
  }

  const wilayahNama = getWilayahNama(item.wilayah_id);

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className="m-auto w-full max-w-md rounded-xl border border-talis-stone-200 bg-white p-6 shadow-xl backdrop:bg-black/40"
    >
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold text-talis-stone-900">
          Catatan — {wilayahNama}
        </h3>
        <p className="mt-0.5 font-sans text-xs text-talis-stone-500">
          Catatan investasi pribadi untuk wilayah ini.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full rounded-md border border-talis-stone-300 px-3 py-2 font-sans text-sm text-talis-stone-900 focus:border-talis-green-500 focus:outline-none"
          rows={5}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tulis catatan investasi, risiko, atau observasi lapangan…"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 font-sans text-sm text-talis-stone-600 hover:bg-talis-stone-100"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-md bg-talis-green-600 px-4 py-1.5 font-sans text-sm font-medium text-white hover:bg-talis-green-700"
          >
            Simpan Catatan
          </button>
        </div>
      </form>
    </dialog>
  );
}

// ─── Shortlist Card ────────────────────────────────────────────────────────────

function ShortlistCard({
  item,
  hasPending,
  onExport,
}: {
  item: ShortlistItem;
  hasPending: boolean;
  onExport: (item: ShortlistItem) => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const { removeItem, addNote } = useShortlistStore(
    useShallow((s) => ({
      removeItem: s.removeItem,
      addNote: s.addNote,
    })),
  );

  const wilayahNama = getWilayahNama(item.wilayah_id);
  const kabupaten = getWilayahKabupaten(item.wilayah_id);

  return (
    <>
      <div className="rounded-md border border-talis-stone-200 bg-white p-4">
        {/* Card header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-sans text-sm font-semibold text-talis-stone-900 truncate">
                {wilayahNama}
              </p>
              {hasPending && (
                <span
                  className="inline-flex h-2 w-2 shrink-0 rounded-full bg-amber-500"
                  title="Ada perubahan belum tersimpan"
                />
              )}
            </div>
            {kabupaten && (
              <p className="font-sans text-xs text-talis-stone-500">{kabupaten}</p>
            )}
            <p className="mt-0.5 font-sans text-xs text-talis-stone-400">
              Disimpan:{" "}
              {new Date(item.saved_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Remove button / confirmation */}
          {!confirmRemove ? (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="shrink-0 rounded p-1 text-talis-stone-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Hapus dari shortlist"
              title="Hapus"
            >
              ×
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs text-talis-stone-600">Yakin hapus?</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded bg-red-600 px-2 py-0.5 font-sans text-xs font-medium text-white hover:bg-red-700"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className="rounded px-2 py-0.5 font-sans text-xs text-talis-stone-600 hover:bg-talis-stone-100"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        {/* Catatan */}
        <div className="mt-3">
          {item.catatan ? (
            <p className="rounded-md bg-talis-stone-50 px-3 py-2 font-sans text-xs text-talis-stone-700 leading-relaxed">
              {item.catatan}
            </p>
          ) : (
            <p className="font-sans text-xs italic text-talis-stone-400">
              Belum ada catatan investasi.
            </p>
          )}
          <button
            type="button"
            onClick={() => setNoteModalOpen(true)}
            className="mt-1.5 font-sans text-xs text-talis-green-600 hover:underline"
          >
            {item.catatan ? "Edit catatan" : "Tambah catatan"}
          </button>
          <div className="mt-3">
            <ExportButton
              label="Ekspor Entry"
              onClick={() => onExport(item)}
              className="h-7 px-2.5"
            />
          </div>
        </div>
      </div>

      {noteModalOpen && (
        <AddNoteModal
          item={item}
          onClose={() => setNoteModalOpen(false)}
          onSave={(note) => addNote(item.id, note)}
        />
      )}
    </>
  );
}

// ─── ShortlistSection ──────────────────────────────────────────────────────────

export function ShortlistSection() {
  const activeProfile = useActiveProfile();
  const { items, pendingIds, saveAllStatus, hydrate, addItem, saveAll } =
    useShortlistStore(
      useShallow((s) => ({
        items: s.items,
        pendingIds: s.pendingIds,
        saveAllStatus: s.saveAllStatus,
        hydrate: s.hydrate,
        addItem: s.addItem,
        saveAll: s.saveAll,
      })),
    );
  const [exportConfig, setExportConfig] = useState<ExportModalConfig | null>(null);

  // Hydrate from storage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isInShortlist =
    activeProfile !== null &&
    items.some((i) => i.wilayah_id === activeProfile.wilayah_id);

  const pendingCount = pendingIds.length;
  const isSaving = saveAllStatus === "saving";
  const saveDisabled = pendingCount === 0 || isSaving;

  return (
    <section className="rounded-lg border border-talis-stone-200 bg-white p-5 shadow-sm">
      {/* Section header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div>
            <p className="font-sans text-xs uppercase tracking-wide text-talis-stone-500">
              Portofolio Kandidat
            </p>
            <h2 className="mt-0.5 font-display text-lg text-talis-stone-900">
              Shortlist Saya
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 font-mono text-xs font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <ExportButton
              label="Ekspor Semua"
              onClick={() =>
                setExportConfig({
                  mode: "shortlist",
                  shortlistIds: items.map((item) => item.id),
                  title: "Ekspor Semua Shortlist",
                })
              }
            />
          )}

          {/* Save All button */}
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={() => void saveAll()}
              disabled={saveDisabled}
              className={`rounded-md px-3 py-1.5 font-sans text-xs font-medium transition ${
                saveDisabled
                  ? "cursor-not-allowed bg-talis-stone-100 text-talis-stone-400"
                  : saveAllStatus === "done"
                    ? "bg-talis-green-100 text-talis-green-700"
                    : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {isSaving
                ? "Menyimpan…"
                : saveAllStatus === "done"
                  ? "Tersimpan ✓"
                  : `Simpan Semua (${pendingCount})`}
            </button>
          )}

          {/* Add active wilayah button */}
          {activeProfile && (
            <button
              type="button"
              onClick={() =>
                isInShortlist ? undefined : addItem(activeProfile.wilayah_id)
              }
              disabled={isInShortlist}
              className={`rounded-md px-3 py-1.5 font-sans text-xs font-medium transition ${
                isInShortlist
                  ? "cursor-default bg-talis-green-100 text-talis-green-700"
                  : "bg-talis-green-600 text-white hover:bg-talis-green-700"
              }`}
            >
              {isInShortlist ? "Sudah disimpan" : "+ Simpan Wilayah Ini"}
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-md bg-talis-stone-50 p-6 text-center text-sm text-talis-stone-500">
          Shortlist kosong. Tambah wilayah untuk mulai membandingkan.
        </div>
      )}

      {/* Cards */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <ShortlistCard
              key={item.id}
              item={item}
              hasPending={pendingIds.includes(item.id)}
              onExport={(selectedItem) =>
                setExportConfig({
                  mode: "shortlist",
                  shortlistIds: [selectedItem.id],
                  title: `Ekspor Shortlist ${getWilayahNama(selectedItem.wilayah_id)}`,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Save All error */}
      {saveAllStatus === "error" && (
        <p className="mt-3 font-sans text-xs text-red-600">
          Gagal menyimpan. Coba lagi.
        </p>
      )}

      <ExportModalLazy
        open={exportConfig !== null}
        config={exportConfig}
        onClose={() => setExportConfig(null)}
      />
    </section>
  );
}
