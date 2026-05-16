"use client";
// SPRINT-06 TASK-011 — Dev-only shortlist delta simulation tool
// Only rendered in NODE_ENV === "development"

import { useShortlistStore } from "@/lib/store/shortlist";
import type { ShortlistItem } from "@/lib/api/decision/getShortlist";

// Wilayah IDs for Berastagi and Ciwidey (guaranteed to be in seed data)
const BERASTAGI_ID = 1206090;
const CIWIDEY_ID = 3204170;

type AddNoteFn = (id: string, note: string) => void;
type CaptureFn = (items: ShortlistItem[]) => void;

interface Scenario {
  label: string;
  description: string;
  run: (items: ShortlistItem[], addNote: AddNoteFn, captureSnapshot: CaptureFn) => void;
}

const SCENARIOS: Scenario[] = [
  {
    label: "Edit Berastagi Note",
    description: "Tambah catatan analisis lapangan untuk Berastagi",
    run: (items, addNote) => {
      const item = items.find((i) => i.wilayah_id === BERASTAGI_ID);
      if (item) {
        addNote(
          item.id,
          "Kunjungan lapangan 10 Mei 2026: lahan di sisi utara cocok untuk agrowisata strawberry. Infrastruktur jalan perlu perbaikan di 2 titik."
        );
      }
    },
  },
  {
    label: "Edit Ciwidey Note",
    description: "Tambah catatan analisis risiko untuk Ciwidey",
    run: (items, addNote) => {
      const item = items.find((i) => i.wilayah_id === CIWIDEY_ID);
      if (item) {
        addNote(
          item.id,
          "Harga lahan masih kompetitif vs Lembang. Risiko regulasi zonasi perlu dicek ke Dinas Pertanian Kab. Bandung sebelum akuisisi."
        );
      }
    },
  },
  {
    label: "Add Both Notes",
    description: "Simulasi 2 perubahan pending sekaligus",
    run: (items, addNote) => {
      const berastagi = items.find((i) => i.wilayah_id === BERASTAGI_ID);
      const ciwidey = items.find((i) => i.wilayah_id === CIWIDEY_ID);
      if (berastagi) {
        addNote(
          berastagi.id,
          "Pipeline infrastruktur tol Medan-Berastagi mulai konstruksi Q3 2026. Momentum entry masih optimal."
        );
      }
      if (ciwidey) {
        addNote(
          ciwidey.id,
          "Apresiasi YoY tertinggi di koridor Bandung Highland. Rekomendasi: akuisisi sebelum Q4 2026."
        );
      }
    },
  },
  {
    label: "Remove Catatan",
    description: "Hapus catatan Berastagi (simulasi clear)",
    run: (items, addNote) => {
      const item = items.find((i) => i.wilayah_id === BERASTAGI_ID);
      if (item) addNote(item.id, "");
    },
  },
  {
    label: "Reset All",
    description: "Kembalikan ke snapshot awal (hapus semua pending)",
    run: (items, _addNote, captureSnapshot) => {
      captureSnapshot(items);
    },
  },
];

export function SimulateDelta() {
  if (process.env.NODE_ENV !== "development") return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const items = useShortlistStore((s) => s.items);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pendingIds = useShortlistStore((s) => s.pendingIds);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const addNote = useShortlistStore((s) => s.addNote);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const captureSnapshot = useShortlistStore((s) => s.captureSnapshot);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hydrate = useShortlistStore((s) => s.hydrate);

  function runScenario(scenario: Scenario) {
    scenario.run(items, addNote, captureSnapshot);
  }

  return (
    <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-amber-200 px-1.5 py-0.5 font-mono text-xs font-bold text-amber-800">
          DEV
        </span>
        <p className="font-sans text-xs font-semibold text-amber-800">
          Simulasi Delta Shortlist
        </p>
        <span className="ml-auto font-sans text-xs text-amber-600">
          {pendingIds.length} pending
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.label}
            type="button"
            onClick={() => runScenario(scenario)}
            title={scenario.description}
            className="rounded border border-amber-300 bg-white px-2.5 py-1 font-sans text-xs text-amber-800 hover:bg-amber-100 active:bg-amber-200"
          >
            {scenario.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => hydrate()}
          className="rounded border border-amber-300 bg-white px-2.5 py-1 font-sans text-xs text-amber-800 hover:bg-amber-100"
          title="Re-hydrate dari storage"
        >
          ↺ Hydrate
        </button>
      </div>

      {pendingIds.length > 0 && (
        <p className="mt-2 font-sans text-xs text-amber-700">
          Pending IDs: {pendingIds.join(", ")}
        </p>
      )}
    </div>
  );
}
